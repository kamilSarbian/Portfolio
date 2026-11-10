import logging
import smtplib
from email.message import EmailMessage

from core.config import settings
from services.jarvis_service import get_ai_technical_direction

logger = logging.getLogger(__name__)

SUPPORTED_LANGS = {"pl", "en", "no"}


class ContactEmailError(RuntimeError):
    """Base exception for predictable contact email delivery failures."""


class EmailConfigurationError(ContactEmailError):
    """Raised when contact email delivery is not configured."""


class OwnerEmailDeliveryError(ContactEmailError):
    """Raised when the owner notification is not accepted by SMTP."""


def _pick_lang(lang: str | None) -> str:
    if not lang:
        return "en"
    base = lang.lower().strip()[:2]
    if base == "nb":
        return "no"
    return base if base in SUPPORTED_LANGS else "en"


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
        EmailConfigurationError: If email delivery is disabled or required settings are missing.
    """

    if not getattr(settings, "email_enabled", True):
        raise EmailConfigurationError("Email delivery is disabled.")

    if not settings.smtp_host or not settings.smtp_user or not settings.smtp_password:
        raise EmailConfigurationError("SMTP configuration is incomplete.")

    if not (settings.owner_email or "").strip():
        raise EmailConfigurationError("Owner email is not configured.")


def _get_ai_direction_safely(message: str) -> str | None:
    """Prepare AI direction without breaking contact email delivery.

    Args:
        message: Contact form message.

    Returns:
        AI-assisted direction text, or None when it cannot be prepared.
    """

    try:
        return get_ai_technical_direction(message=message)
    except (RuntimeError, TimeoutError, OSError, ValueError):
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


def send_owner_contact_email(
    name: str,
    email: str,
    message: str,
    company: str | None = None,
    website: str | None = None,
) -> None:
    """Send the owner notification required for a successful API response.

    Args:
        name: Sender display name from the contact form.
        email: Sender email address used for reply-to.
        message: Message body submitted through the contact form.
        company: Optional company context from the contact form.
        website: Optional website context from the contact form.

    Raises:
        EmailConfigurationError: If SMTP delivery is not configured.
        OwnerEmailDeliveryError: If SMTP does not accept the owner notification.
    """

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
    try:
        owner_msg.set_content(
            f"Sender: {name} <{sender_addr}>\n\n" f"{meta_block}" f"Message:\n{message}\n"
        )
        logger.info("Sending contact notification email.")
        _send_smtp(owner_msg)
    except (smtplib.SMTPException, OSError, ValueError) as exc:
        logger.exception("Contact notification email failed.")
        raise OwnerEmailDeliveryError("Contact notification email failed.") from exc


def send_contact_follow_up(
    name: str,
    email: str,
    message: str,
    lang: str | None = None,
    ask_ai_direction: bool = False,
) -> None:
    """Send best-effort autoresponder and AI follow-up after owner delivery.

    Args:
        name: Sender display name from the contact form.
        email: Sender email address receiving the autoresponder.
        message: Message body used for optional AI-assisted direction.
        lang: Optional language code used to select autoresponder copy.
        ask_ai_direction: Whether to send AI-assisted direction to the sender and owner.

    The function logs predictable AI, configuration, and SMTP failures instead of
    changing the already completed owner-delivery result. The AI direction is
    generated once and, when available, sent separately to both participants.
    """

    try:
        validate_email_configuration()
    except ContactEmailError:
        logger.exception("Contact follow-up email configuration is unavailable.")
        return

    from_addr = (getattr(settings, "smtp_from", None) or settings.smtp_user).strip()
    owner_addr = (settings.owner_email or "").strip()
    sender_addr = email.strip()
    ai_direction = _get_ai_direction_safely(message=message) if ask_ai_direction else None
    ai_direction_body = _format_ai_direction_section(ai_direction) if ask_ai_direction else ""
    chosen = _pick_lang(lang)
    tpl = TEMPLATES[chosen]

    try:
        auto = EmailMessage()
        auto["Subject"] = tpl["subject"]
        auto["From"] = from_addr
        auto["To"] = sender_addr
        auto.set_content(
            tpl["intro"](name)
            + (ai_direction_body + "\n" if ai_direction_body else "")
            + tpl["closing"]
        )

        logger.info("Sending contact autoresponder in lang=%s.", chosen)
        _send_smtp(auto)
    except (smtplib.SMTPException, OSError, ValueError):
        logger.exception("Contact autoresponder email failed.")

    if not ai_direction:
        return

    try:
        owner_follow_up = EmailMessage()
        owner_follow_up["Subject"] = f"[Portfolio] JARVIS direction for: {name}"
        owner_follow_up["From"] = from_addr
        owner_follow_up["To"] = owner_addr
        owner_follow_up["Reply-To"] = sender_addr
        owner_follow_up.set_content(
            f"JARVIS follow-up for {name} <{sender_addr}>.\n\n"
            "The original contact message was accepted by SMTP before this optional step.\n\n"
            "AI-assisted technical direction:\n\n"
            f"{ai_direction}\n\n"
            "This is an automated suggestion, not a final estimate or commitment.\n"
        )

        logger.info("Sending AI-assisted contact follow-up to owner.")
        _send_smtp(owner_follow_up)
    except (smtplib.SMTPException, OSError, ValueError):
        logger.exception("AI-assisted owner follow-up email failed.")
