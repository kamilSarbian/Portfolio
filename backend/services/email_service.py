import logging
import smtplib
from email.message import EmailMessage

from core.config import settings
from services.jarvis_service import get_ai_technical_direction

logger = logging.getLogger(__name__)

SUPPORTED_LANGS = {"pl", "en", "no"}


def _pick_lang(lang: str | None) -> str:
    if not lang:
        return "pl"
    base = lang.lower().strip()[:2]
    if base == "nb":
        return "no"
    return base if base in SUPPORTED_LANGS else "pl"


TEMPLATES = {
    "pl": {
        "subject": "Dziekuje za wiadomosc",
        "intro": lambda name: (
            f"Czesc {name},\n\n"
            "Dziekuje za wiadomosc i zainteresowanie moim profilem. "
            "Otrzymalem Twoja wiadomosc i postaram sie odpowiedziec jak najszybciej.\n\n"
        ),
        "closing": (
            "Pozdrawiam,\n"
            "Kamil Sarbian\n"
            "Backend Developer\n"
            "Email: sarbian.kamil@gmail.com\n"
            "Phone: +47 92 51 16 61\n"
        ),
    },
    "en": {
        "subject": "Thanks for your message",
        "intro": lambda name: (
            f"Hi {name},\n\n"
            "Thanks for reaching out and for your interest in my portfolio. "
            "I have received your message and I will get back to you as soon as possible.\n\n"
        ),
        "closing": (
            "Best regards,\n"
            "Kamil Sarbian\n"
            "Backend Developer\n"
            "Email: sarbian.kamil@gmail.com\n"
            "Phone: +47 92 51 16 61\n"
        ),
    },
    "no": {
        "subject": "Takk for meldingen",
        "intro": lambda name: (
            f"Hei {name},\n\n"
            "Takk for meldingen og interessen for portefoljen min. "
            "Jeg har mottatt meldingen din og svarer sa snart som mulig.\n\n"
        ),
        "closing": (
            "Vennlig hilsen,\n"
            "Kamil Sarbian\n"
            "Backend Developer\n"
            "Email: sarbian.kamil@gmail.com\n"
            "Phone: +47 92 51 16 61\n"
        ),
    },
}


def _send_smtp(msg: EmailMessage) -> None:
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)


def validate_email_configuration() -> None:
    """Validate that email delivery has the required runtime configuration.

    Raises:
        RuntimeError: If email delivery is enabled but SMTP or owner settings are missing.
    """

    if not getattr(settings, "email_enabled", True):
        return

    if not settings.smtp_host or not settings.smtp_user or not settings.smtp_password:
        raise RuntimeError("SMTP configuration is incomplete.")

    if not (settings.owner_email or "").strip():
        raise RuntimeError("Owner email is not configured.")


def _get_ai_direction_safely(message: str, name: str) -> str | None:
    """Prepare AI direction without breaking contact email delivery.

    Args:
        message: Contact form message.
        name: Sender display name.

    Returns:
        AI-assisted direction text, or None when it cannot be prepared.
    """

    try:
        return get_ai_technical_direction(message=message, name=name)
    except (RuntimeError, TimeoutError, OSError, ValueError) as exc:
        logger.exception("AI-assisted technical direction failed.")
        return None


def _format_ai_direction_section(direction: str | None) -> str:
    """Format the optional JARVIS section for contact emails.

    Args:
        direction: AI-assisted technical direction, when available.

    Returns:
        Email text block with either the direction or fallback copy.
    """

    if not direction:
        return (
            "JARVIS was unable to generate a suggestion at this moment. "
            "I will review your message personally.\n"
        )

    return (
        "In the meantime, JARVIS, my AI assistant, prepared an initial technical direction "
        "based on your message:\n\n"
        f"{direction}\n\n"
        "This is an automated suggestion, not a final estimate or commitment.\n"
    )


def send_contact_emails(
    name: str,
    email: str,
    message: str,
    company: str | None = None,
    website: str | None = None,
    lang: str | None = None,
    ask_ai_direction: bool = False,
) -> None:
    """Send the portfolio contact email and localized autoresponder.

    Args:
        name: Sender display name from the contact form.
        email: Sender email address used for reply-to and autoresponder.
        message: Message body submitted through the contact form.
        company: Optional company context from the contact form.
        website: Optional website context from the contact form.
        lang: Optional language code used to select autoresponder copy.
        ask_ai_direction: Whether to include AI-assisted technical direction.

    Raises:
        RuntimeError: If email sending is enabled but SMTP or owner settings are missing.
    """

    if not getattr(settings, "email_enabled", True):
        logger.info("Contact email delivery skipped because email is disabled.")
        return

    validate_email_configuration()

    from_addr = (getattr(settings, "smtp_from", None) or settings.smtp_user).strip()
    owner_addr = (settings.owner_email or "").strip()
    sender_addr = email.strip()

    owner_msg = EmailMessage()
    owner_msg["Subject"] = f"[Portfolio] Message from: {name}"
    owner_msg["From"] = from_addr
    owner_msg["To"] = owner_addr
    owner_msg["Reply-To"] = sender_addr

    meta_lines = []
    if company:
        meta_lines.append(f"Company: {company}")
    if website:
        meta_lines.append(f"Website: {website}")

    meta_block = ("\n".join(meta_lines) + "\n\n") if meta_lines else ""
    ai_direction_body = ""
    owner_ai_direction_section = ""
    if ask_ai_direction:
        ai_direction = _get_ai_direction_safely(message=message, name=name)
        ai_direction_body = _format_ai_direction_section(ai_direction)
        owner_ai_direction_section = f"\nAI-assisted technical direction:\n{ai_direction_body}\n"

    owner_msg.set_content(
        f"Sender: {name} <{sender_addr}>\n\n"
        f"{meta_block}"
        f"Message:\n{message}\n"
        f"{owner_ai_direction_section}"
    )

    logger.info("Sending contact notification email.")
    try:
        _send_smtp(owner_msg)
    except (smtplib.SMTPException, OSError) as exc:
        logger.exception("Contact notification email failed.")
        raise RuntimeError("Contact notification email failed.") from exc

    chosen = _pick_lang(lang)
    tpl = TEMPLATES[chosen]

    auto = EmailMessage()
    auto["Subject"] = tpl["subject"]
    auto["From"] = from_addr
    auto["To"] = sender_addr
    auto.set_content(tpl["intro"](name) + (ai_direction_body + "\n" if ai_direction_body else "") + tpl["closing"])

    logger.info("Sending contact autoresponder in lang=%s.", chosen)
    try:
        _send_smtp(auto)
    except (smtplib.SMTPException, OSError) as exc:
        logger.exception("Contact autoresponder email failed.")
        raise RuntimeError("Contact autoresponder email failed.") from exc
