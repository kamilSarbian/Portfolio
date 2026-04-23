from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field

from core.rate_limit import contact_rate_limit
from schemas.common import ErrorResponse, OkResponse
from services.email_service import send_contact_emails

router = APIRouter(prefix="/backend/contact", tags=["contact"], dependencies=[Depends(contact_rate_limit)])

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

    return "pl"


class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=80, description="Sender name.")
    email: EmailStr = Field(description="Sender email address.")
    message: str = Field(min_length=20, max_length=4000, description="Contact message body.")
    company: str | None = Field(default=None, max_length=120, description="Optional company name.")
    website: str | None = Field(default=None, max_length=200, description="Optional website or honeypot field.")
    lang: str | None = Field(default=None, max_length=8, description="Preferred language: pl, en, or no.")


@router.post(
    "/send",
    response_model=OkResponse,
    summary="Submit contact form",
    description="Queues email delivery to the portfolio owner and an autoresponder to the sender.",
    responses={
        422: {"model": ErrorResponse, "description": "Validation error."},
        429: {"model": ErrorResponse, "description": "Contact form rate limit exceeded."},
        502: {"model": ErrorResponse, "description": "Email delivery could not be scheduled or sent."},
    },
)
def send_contact(payload: ContactIn, bg: BackgroundTasks, request: Request):
    try:
        lang = _normalize_lang(payload.lang, request.headers.get("accept-language"))

        bg.add_task(
            send_contact_emails,
            payload.name,
            payload.email,
            payload.message,
            payload.company,
            payload.website,
            lang,
        )
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Email send failed: {e}")
