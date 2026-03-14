from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field

from services.email_service import send_contact_emails

router = APIRouter(prefix="/backend/contact", tags=["contact"])

SUPPORTED_LANGS = {"pl", "en", "no"}


def _normalize_lang(payload_lang: str | None, accept_language: str | None) -> str:
    # 1) payload wins (frontend wysyła lang)
    if payload_lang and payload_lang.lower()[:2] in SUPPORTED_LANGS:
        return payload_lang.lower()[:2]

    # 2) fallback: Accept-Language
    if accept_language:
        # np: "en-US,en;q=0.9,pl;q=0.8"
        token = accept_language.split(",")[0].strip().lower()
        base = token.split("-")[0]
        if base in SUPPORTED_LANGS:
            return base
        # często norweski bywa jako nb
        if base == "nb":
            return "no"

    # 3) default
    return "pl"


class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    message: str = Field(min_length=20, max_length=4000)  # ujednolicone z frontendem
    company: str | None = Field(default=None, max_length=120)
    website: str | None = Field(default=None, max_length=200)
    lang: str | None = Field(default=None, max_length=8)  # "pl" | "en" | "no"


@router.post("/send")
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
