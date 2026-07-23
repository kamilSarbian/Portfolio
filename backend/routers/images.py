from __future__ import annotations

import logging

from core.config import settings
from core.errors import ApiError, ErrorCode
from core.rate_limit import upload_rate_limit
from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import Response
from schemas.common import ErrorResponse
from services.image_service import ImageProcessingError, ProcessOptions, process_image_to_png
from services.upload_service import UploadTooLargeError, read_upload_limited

router = APIRouter(
    prefix="/backend/image", tags=["images"], dependencies=[Depends(upload_rate_limit)]
)
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
        400: {
            "model": ErrorResponse,
            "description": "Invalid processing options or malformed image.",
        },
        413: {
            "model": ErrorResponse,
            "description": "Uploaded file exceeds the configured size limit.",
        },
        415: {"model": ErrorResponse, "description": "Unsupported file type."},
        429: {"model": ErrorResponse, "description": "Upload rate limit exceeded."},
        500: {"model": ErrorResponse, "description": "Unexpected image processing failure."},
    },
)
async def process_image_endpoint(
    file: UploadFile = File(...),
    size: str = Form("M", description="Resize preset, for example S, M, or L."),
    grayscale: bool = Form(False, description="Convert the image to grayscale."),
    rotate: int = Form(
        0, description="Rotation in degrees. Expected values are 0, 90, 180, or 270."
    ),
) -> Response:
    """Process a validated image upload and return a PNG response."""

    if file.content_type not in settings.allowed_mime:
        raise ApiError(
            status_code=415,
            error_code=ErrorCode.UNSUPPORTED_FILE_TYPE,
            detail="Unsupported file type.",
        )

    try:
        data = await read_upload_limited(file, settings.max_upload_mb * 1024 * 1024)
    except UploadTooLargeError as exc:
        raise ApiError(
            status_code=413,
            error_code=ErrorCode.FILE_TOO_LARGE,
            detail="File too large.",
        ) from exc

    try:
        out_png = process_image_to_png(
            data,
            ProcessOptions(size=size, grayscale=grayscale, rotate=rotate),
        )
    except ImageProcessingError as exc:
        raise ApiError(
            status_code=400,
            error_code=ErrorCode.INVALID_IMAGE,
            detail="Invalid image or processing options.",
        ) from exc
    except OSError as exc:
        logger.exception("Unexpected image processing failure.")
        raise ApiError(
            status_code=500,
            error_code=ErrorCode.IMAGE_PROCESSING_FAILED,
            detail="Image processing failed.",
        ) from exc

    return Response(
        content=out_png,
        media_type="image/png",
        headers={"Content-Disposition": 'attachment; filename="edited.png"'},
    )
