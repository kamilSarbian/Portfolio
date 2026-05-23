from __future__ import annotations

import io
import os
import threading
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

from PIL import Image

import torch
import open_clip

MAX_IMAGE_SIDE = 512


@dataclass(frozen=True)
class Prediction:
    label: str
    score: float


class ClipClassifier:
    def __init__(
        self,
        model_name: str = "ViT-B-32",
        pretrained: str = "laion2b_s34b_b79k",
        device: Optional[str] = None,
    ) -> None:
        self.model_name = model_name
        self.pretrained = pretrained
        self.device = torch.device(device or ("cuda" if torch.cuda.is_available() else "cpu"))

        self._model = None
        self._preprocess = None
        self._tokenizer = None
        self._lock = threading.Lock()

        # cache tokenów tekstu (żeby nie tokenizować za każdym kliknięciem)
        self._text_cache: Dict[Tuple[Tuple[str, ...], str], torch.Tensor] = {}
        self._text_cache_lock = threading.Lock()

    def load(self) -> None:
        if self._model is not None:
            return

        with self._lock:
            if self._model is not None:
                return

            model, _, preprocess = open_clip.create_model_and_transforms(
                self.model_name,
                pretrained=self.pretrained,
                device=self.device,
            )
            model.eval()

            tokenizer = open_clip.get_tokenizer(self.model_name)

            self._model = model
            self._preprocess = preprocess
            self._tokenizer = tokenizer

    def meta(self) -> dict:
        self.load()
        return {
            "engine": "open_clip",
            "model_name": self.model_name,
            "pretrained": self.pretrained,
            "device": str(self.device),
            "text_cache_size": len(self._text_cache),
        }

    @staticmethod
    def _clean_labels(labels: List[str]) -> List[str]:
        out: List[str] = []
        seen = set()
        for x in labels:
            x = (x or "").strip()
            if not x:
                continue
            k = x.lower()
            if k in seen:
                continue
            seen.add(k)
            out.append(x)
        return out

    @staticmethod
    def _prepare_image(image_bytes: bytes) -> Image.Image:
        """Decode and downscale an image before CLIP preprocessing.

        Args:
            image_bytes: Raw uploaded image bytes.

        Returns:
            RGB image with a bounded longest side.
        """

        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        if max(img.size) > MAX_IMAGE_SIDE:
            img.thumbnail((MAX_IMAGE_SIDE, MAX_IMAGE_SIDE), Image.Resampling.LANCZOS)
        return img

    def _get_text_tokens(self, prompts: List[str]) -> torch.Tensor:
        assert self._tokenizer is not None

        key = (tuple(prompts), str(self.device))
        with self._text_cache_lock:
            if key in self._text_cache:
                return self._text_cache[key]

        tokens = self._tokenizer(prompts).to(self.device)

        with self._text_cache_lock:
            # proste ograniczenie pamięci (żeby cache nie rósł w nieskończoność)
            if len(self._text_cache) > 64:
                self._text_cache.clear()
            self._text_cache[key] = tokens

        return tokens

    def classify_bytes(
        self,
        image_bytes: bytes,
        labels: List[str],
        top_k: int = 3,
        min_score: float = 0.15,
    ) -> dict:
        self.load()
        assert self._model is not None
        assert self._preprocess is not None
        assert self._tokenizer is not None

        labels = self._clean_labels(labels)
        if not labels:
            raise ValueError("labels list is empty")

        img = self._prepare_image(image_bytes)
        image_tensor = self._preprocess(img).unsqueeze(0).to(self.device)

        # Teksty (prosty prompt)
        prompts = [f"a photo of {lbl}" for lbl in labels]
        text_tokens = self._get_text_tokens(prompts)

        with torch.inference_mode():
            image_features = self._model.encode_image(image_tensor)
            text_features = self._model.encode_text(text_tokens)

            image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            text_features = text_features / text_features.norm(dim=-1, keepdim=True)

            logits = (100.0 * image_features @ text_features.T)[0]
            probs = logits.softmax(dim=0)

        top_k = max(1, min(int(top_k), len(labels)))
        scores, idxs = torch.topk(probs, k=top_k)

        preds: List[Prediction] = []
        for score, idx in zip(scores.tolist(), idxs.tolist()):
            preds.append(Prediction(label=labels[idx], score=float(score)))

        filtered = [p for p in preds if p.score >= float(min_score)]
        if not filtered:
            best = preds[0] if preds else Prediction("unknown", 0.0)
            return {"predictions": [{"label": "unknown", "score": float(best.score)}], "unknown": True}

        return {
            "predictions": [{"label": p.label, "score": p.score} for p in filtered],
            "unknown": False,
        }


_classifier: Optional[ClipClassifier] = None
_classifier_lock = threading.Lock()


def get_classifier() -> ClipClassifier:
    global _classifier
    if _classifier is not None:
        return _classifier

    with _classifier_lock:
        if _classifier is not None:
            return _classifier

        model_name = os.getenv("CLIP_MODEL", "ViT-B-32")
        pretrained = os.getenv("CLIP_PRETRAINED", "laion2b_s34b_b79k")
        device = os.getenv("CLIP_DEVICE")

        _classifier = ClipClassifier(model_name=model_name, pretrained=pretrained, device=device)
        return _classifier
