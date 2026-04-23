from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import httpx

from core.config import settings
from schemas.common import ErrorResponse
from services.hibp_service import query_pwned_password_range

router = APIRouter(prefix="/backend/password", tags=["passwords"])


class PasswordIn(BaseModel):
    password: str = Field(min_length=1, max_length=256, description="Password to check against breach data.")


class PasswordCheckResponse(BaseModel):
    found: bool = Field(description="Whether the password was found in known breaches.")
    count: int = Field(description="Number of breach occurrences returned by HIBP.")


@router.post(
    "/check",
    response_model=PasswordCheckResponse,
    summary="Check password against breach database",
    description="Uses the Have I Been Pwned range API and k-Anonymity flow to avoid sending the full password.",
    responses={
        400: {"model": ErrorResponse, "description": "Password was empty after trimming."},
        422: {"model": ErrorResponse, "description": "Validation error."},
        502: {"model": ErrorResponse, "description": "Upstream HIBP request failed."},
    },
)
async def check_password(body: PasswordIn):
    password = body.password.strip()
    if not password:
        raise HTTPException(status_code=400, detail="Password is required.")

    try:
        async with httpx.AsyncClient(timeout=settings.http_timeout_s) as client:
            result = await query_pwned_password_range(
                client=client,
                hibp_base=settings.hibp_base,
                password=password,
            )
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"HIBP request failed: {e}")

    return {"found": result.found, "count": result.count}
