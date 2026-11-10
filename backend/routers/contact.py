import logging

from core.errors import ApiError, ErrorCode
from core.rate_limit import contact_rate_limit
from fastapi import APIRouter, BackgroundTasks, Depends, Request
from pydantic import BaseModel, EmailStr, Field
from schemas.common import ErrorResponse, OkResponse
from services.email_service import (
    ContactEmailError,
    send_contact_follow_up,
    send_owner_contact_email,
)

router = APIRouter(
    prefix="/backend/contact", tags=["contact"], dependencies=[Depends(contact_rate_limit)]
)
logger = logging.getLogger(__name__)

SUPPORTED_LANGS = {"pl", "en", "no"}


def _normalize_lang(payload_lang: str | None, accept_language: str | None) -> str:
    if payload_lang and payload_lang.lower()[:2] in SUPPORTED_LANGS:
        return payload_lang.lower()[:2]

    if accept_language:
        token = accept_language.split(",")[0].strip().lower()
        base = token.split("-")[0]
        if base in SUPPORTED_LANGS:
            return base
        if base == "nb":
            return "no"

    return "en"


class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=80, description="Sender name.")
    email: EmailStr = Field(description="Sender email address.")
    message: str = Field(min_length=20, max_length=4000, description="Contact message body.")
    company: str | None = Field(default=None, max_length=120, description="Optional company name.")
    website: str | None = Field(
        default=None, max_length=200, description="Optional website or honeypot field."
    )
    lang: str | None = Field(
        default=None, max_length=8, description="Preferred language: pl, en, or no."
    )
    ask_ai_direction: bool = Field(
        default=False,
        description="Whether to include an AI-assisted technical direction in the autoresponder.",
    )


@router.post(
    "/send",
    response_model=OkResponse,
    summary="Submit contact form",
    description=(
        "Sends the owner notification before confirming success. "
        "The optional autoresponder and AI direction run as best-effort follow-up work."
    ),
    responses={
        422: {"model": ErrorResponse, "description": "Validation error."},
        429: {"model": ErrorResponse, "description": "Contact form rate limit exceeded."},
        502: {
            "model": ErrorResponse,
            "description": "The owner notification was not accepted by SMTP.",
        },
    },
)
def send_contact(payload: ContactIn, bg: BackgroundTasks, request: Request) -> dict[str, bool]:
    """Deliver the owner notification and schedule non-critical follow-up work.

    Args:
        payload: Validated contact form payload.
        bg: FastAPI background task manager used for the optional autoresponder.
        request: Incoming request used to infer the preferred language.

    Raises:
        ApiError: If the owner notification cannot be delivered through SMTP.
    """

    if payload.website and payload.website.strip():
        logger.info("Contact form honeypot submission ignored.")
        return {"ok": True}

    try:
        lang = _normalize_lang(payload.lang, request.headers.get("accept-language"))
        send_owner_contact_email(
            payload.name,
            payload.email,
            payload.message,
            payload.company,
            payload.website,
        )
    except ContactEmailError as exc:
        logger.exception("Contact owner notification delivery failed.")
        raise ApiError(
            status_code=502,
            error_code=ErrorCode.EMAIL_SERVICE_UNAVAILABLE,
            detail="Email service temporarily unavailable.",
        ) from exc

    try:
        bg.add_task(
            send_contact_follow_up,
            payload.name,
            payload.email,
            payload.message,
            lang,
            payload.ask_ai_direction,
        )
    except RuntimeError:
        logger.exception("Contact follow-up could not be scheduled after owner delivery.")

    return {"ok": True}
