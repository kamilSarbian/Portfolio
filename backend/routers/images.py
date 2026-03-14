from __future__ import annotations

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from core.config import settings
from services.image_service import ProcessOptions, ImageProcessingError, process_image_to_png

router = APIRouter(prefix="/backend/image", tags=["images"])


@router.post("/process")
async def process_image_endpoint(
    file: UploadFile = File(...),
    size: str = Form("M"),
    grayscale: bool = Form(False),
    rotate: int = Form(0),
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
    except ImageProcessingError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # żebyś widział sensowny komunikat zamiast "500 i CORS"
        raise HTTPException(status_code=500, detail=f"Image processing failed: {e}")

    return Response(
        content=out_png,
        media_type="image/png",
        headers={"Content-Disposition": 'attachment; filename="edited.png"'},
    )
