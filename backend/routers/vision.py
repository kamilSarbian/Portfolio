from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field

from core.rate_limit import upload_rate_limit
from schemas.common import ErrorResponse
from services.clip_classifier import get_classifier
from services.vision_taxonomy import SMART_LABELS

router = APIRouter(prefix="/backend/ml", tags=["ml"], dependencies=[Depends(upload_rate_limit)])


def _parse_labels(raw: str) -> List[str]:
    return [x.strip() for x in (raw or "").split(",") if x.strip()]


class MlInfoResponse(BaseModel):
    model_name: str
    device: str
    smart_labels_count: int


class MlTaxonomyResponse(BaseModel):
    labels: list[str]
    count: int


class MlPreset(BaseModel):
    id: str
    name: str
    labels: list[str]


class MlExamplesResponse(BaseModel):
    presets: list[MlPreset]


class PredictionOut(BaseModel):
    label: str
    score: float


class ClassificationResponse(BaseModel):
    predictions: list[PredictionOut]
    unknown: bool
    top_k: int
    min_score: float
    smart: bool
    labels_count: int


@router.get(
    "/info",
    response_model=MlInfoResponse,
    summary="Get ML model metadata",
    description="Returns basic runtime information about the CLIP classifier and the smart taxonomy size.",
)
def ml_info():
    clf = get_classifier()
    meta = clf.meta()
    meta["smart_labels_count"] = len(SMART_LABELS)
    return meta


@router.get(
    "/taxonomy",
    response_model=MlTaxonomyResponse,
    summary="Get smart taxonomy",
    description="Returns the backend-managed label pool used by smart ML classification mode.",
)
def ml_taxonomy():
    return {"labels": SMART_LABELS, "count": len(SMART_LABELS)}


@router.get(
    "/examples",
    response_model=MlExamplesResponse,
    summary="Get example presets",
    description="Returns curated label presets that can be used from the frontend or during API exploration.",
)
def ml_examples():
    return {
        "presets": [
            {"id": "smart", "name": f"Smart ({len(SMART_LABELS)} labels)", "labels": SMART_LABELS},
            {
                "id": "travel",
                "name": "Travel / City",
                "labels": [
                    "city", "street", "bridge", "harbor", "museum", "monument", "statue",
                    "building", "restaurant", "park", "night", "sunset", "hotel", "tower",
                    "church", "beach", "mountain", "market"
                ],
            },
            {
                "id": "pets",
                "name": "Pets",
                "labels": ["cat", "dog", "rabbit", "bird", "hamster", "parrot", "kitten", "puppy", "pet", "animal"],
            },
            {
                "id": "food",
                "name": "Food / Drink",
                "labels": ["food", "meal", "dessert", "coffee", "tea", "pizza", "burger", "salad", "cake", "fruit"],
            },
            {
                "id": "nature",
                "name": "Nature / Landscape",
                "labels": ["forest", "mountain", "river", "waterfall", "ocean", "beach", "lake", "sunset", "snow", "landscape"],
            },
        ]
    }


@router.post(
    "/classify",
    response_model=ClassificationResponse,
    summary="Classify an uploaded image",
    description="Runs CLIP-based classification using either the backend smart taxonomy or custom user-provided labels.",
    responses={
        400: {"model": ErrorResponse, "description": "Uploaded file was empty."},
        415: {"model": ErrorResponse, "description": "Unsupported file type."},
        422: {"model": ErrorResponse, "description": "Validation error or missing manual labels."},
        429: {"model": ErrorResponse, "description": "Upload rate limit exceeded."},
        500: {"model": ErrorResponse, "description": "Classification pipeline failed."},
    },
)
async def classify_image(
    file: Optional[UploadFile] = File(default=None),
    image: Optional[UploadFile] = File(default=None),
    smart: bool = Query(True, description="Use the backend smart taxonomy instead of manual labels."),
    labels: str = Query("", description="Comma-separated labels used only when smart=false."),
    top_k: int = Query(3, ge=1, le=3, description="Number of top predictions to return."),
    min_score: float = Query(0.15, ge=0.0, le=1.0, description="Confidence threshold below which the result is marked as unknown."),
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
        lbls = SMART_LABELS
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
