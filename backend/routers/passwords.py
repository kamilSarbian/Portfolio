from __future__ import annotations

import httpx
from core.config import settings
from core.errors import ApiError, ErrorCode
from core.rate_limit import password_rate_limit
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from schemas.common import ErrorResponse
from services.hibp_service import query_pwned_password_range

router = APIRouter(
    prefix="/backend/password",
    tags=["passwords"],
    dependencies=[Depends(password_rate_limit)],
)


class PasswordIn(BaseModel):
    password: str = Field(
        min_length=1, max_length=256, description="Password to check against breach data."
    )


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
        429: {"model": ErrorResponse, "description": "Password check rate limit exceeded."},
        502: {"model": ErrorResponse, "description": "Upstream HIBP request failed."},
    },
)
async def check_password(body: PasswordIn) -> dict[str, int | bool]:
    """Check a password against HIBP using the k-anonymity range API."""

    password = body.password.strip()
    if not password:
        raise ApiError(
            status_code=400,
            error_code=ErrorCode.PASSWORD_REQUIRED,
            detail="Password is required.",
        )

    try:
        async with httpx.AsyncClient(timeout=settings.http_timeout_s) as client:
            result = await query_pwned_password_range(
                client=client,
                hibp_base=settings.hibp_base,
                password=password,
            )
    except httpx.HTTPError as exc:
        raise ApiError(
            status_code=502,
            error_code=ErrorCode.HIBP_UNAVAILABLE,
            detail="HIBP request failed.",
        ) from exc

    return {"found": result.found, "count": result.count}
