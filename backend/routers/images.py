from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from core.config import settings
from core.rate_limit import upload_rate_limit
from schemas.common import ErrorResponse
from services.image_service import ImageProcessingError, ProcessOptions, process_image_to_png

router = APIRouter(prefix="/backend/image", tags=["images"], dependencies=[Depends(upload_rate_limit)])
logger = logging.getLogger(__name__)


@router.post(
    "/process",
    summary="Process an uploaded image",
    description="Resizes, rotates, or converts an uploaded image to grayscale and returns a PNG file.",
    responses={
        200: {
            "description": "Processed PNG image.",
            "content": {"image/png": {}},
        },
        400: {"model": ErrorResponse, "description": "Invalid processing options or malformed image."},
        413: {"model": ErrorResponse, "description": "Uploaded file exceeds the configured size limit."},
        415: {"model": ErrorResponse, "description": "Unsupported file type."},
        429: {"model": ErrorResponse, "description": "Upload rate limit exceeded."},
        500: {"model": ErrorResponse, "description": "Unexpected image processing failure."},
    },
)
async def process_image_endpoint(
    file: UploadFile = File(...),
    size: str = Form("M", description="Resize preset, for example S, M, or L."),
    grayscale: bool = Form(False, description="Convert the image to grayscale."),
    rotate: int = Form(0, description="Rotation in degrees. Expected values are 0, 90, 180, or 270."),
):
    if file.content_type not in settings.allowed_mime:
        raise HTTPException(status_code=415, detail="Unsupported file type.")

    data = await file.read()
    if len(data) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large.")

    try:
        out_png = process_image_to_png(
            data,
            ProcessOptions(size=size, grayscale=grayscale, rotate=rotate),
        )
    except ImageProcessingError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except OSError as exc:
        logger.exception("Unexpected image processing failure.")
        raise HTTPException(status_code=500, detail="Image processing failed.") from exc

    return Response(
        content=out_png,
        media_type="image/png",
        headers={"Content-Disposition": 'attachment; filename="edited.png"'},
    )
