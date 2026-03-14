from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from services.clip_classifier import get_classifier
from services.vision_taxonomy import SMART_LABELS_200

router = APIRouter(prefix="/backend/ml", tags=["ml"])


def _parse_labels(raw: str) -> List[str]:
    return [x.strip() for x in (raw or "").split(",") if x.strip()]


@router.get("/info")
def ml_info():
    clf = get_classifier()
    meta = clf.meta()
    meta["smart_labels_count"] = len(SMART_LABELS_200)
    return meta


@router.get("/taxonomy")
def ml_taxonomy():
    # UI może sobie pobrać listę i np. pokazać presety
    return {"labels": SMART_LABELS_200, "count": len(SMART_LABELS_200)}


@router.get("/examples")
def ml_examples():
    # Presety do kliknięcia w UI
    return {
        "presets": [
            {"id": "smart", "name": "Smart (200 labels)", "labels": SMART_LABELS_200},
            {
                "id": "travel",
                "name": "Travel / City",
                "labels": [
                    "city", "street", "bridge", "harbor", "museum", "monument", "statue",
                    "building", "restaurant", "park", "night", "sunset"
                ],
            },
            {
                "id": "pets",
                "name": "Pets",
                "labels": ["cat", "dog", "rabbit", "bird", "hamster", "animal"],
            },
        ]
    }


@router.post("/classify")
async def classify_image(
    file: Optional[UploadFile] = File(default=None),
    image: Optional[UploadFile] = File(default=None),

    # Smart mode: domyślnie True (user nic nie wpisuje)
    smart: bool = Query(True),

    # jak smart=False, możesz podać własne labels
    labels: str = Query("", description="Comma-separated labels when smart=false"),

    top_k: int = Query(3, ge=1, le=3),          # top-3 na stałe (jak chciałeś)
    min_score: float = Query(0.15, ge=0.0, le=1.0),
):
    up = file or image
    if up is None:
        raise HTTPException(status_code=422, detail="Missing file field (expected 'file' or 'image').")

    if not up.content_type or not up.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="Unsupported file type.")

    data = await up.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file.")

    if smart:
        lbls = SMART_LABELS_200
    else:
        lbls = _parse_labels(labels)
        if not lbls:
            raise HTTPException(status_code=422, detail="labels is required when smart=false")

    try:
        clf = get_classifier()
        result = clf.classify_bytes(data, labels=lbls, top_k=top_k, min_score=min_score)
        return {
            "predictions": result["predictions"],
            "unknown": result["unknown"],
            "top_k": top_k,
            "min_score": float(min_score),
            "smart": smart,
            "labels_count": len(lbls),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CLIP classify failed: {e}")