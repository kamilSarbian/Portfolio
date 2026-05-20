import logging
import smtplib
from email.message import EmailMessage

from core.config import settings

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
        "body": lambda name: (
            f"Czesc {name},\n\n"
            "Dziekuje za wiadomosc i zainteresowanie moim profilem. "
            "Otrzymalem Twoja wiadomosc i postaram sie odpowiedziec jak najszybciej.\n\n"
            "Pozdrawiam,\n"
            "Kamil Sarbian\n"
            "Backend Developer\n"
            "Email: sarbian.kamil@gmail.com\n"
            "Phone: +47 92 51 16 61\n"
        ),
    },
    "en": {
        "subject": "Thanks for your message",
        "body": lambda name: (
            f"Hi {name},\n\n"
            "Thanks for reaching out and for your interest in my portfolio. "
            "I have received your message and I will get back to you as soon as possible.\n\n"
            "Best regards,\n"
            "Kamil Sarbian\n"
            "Backend Developer\n"
            "Email: sarbian.kamil@gmail.com\n"
            "Phone: +47 92 51 16 61\n"
        ),
    },
    "no": {
        "subject": "Takk for meldingen",
        "body": lambda name: (
            f"Hei {name},\n\n"
            "Takk for meldingen og interessen for portefoljen min. "
            "Jeg har mottatt meldingen din og svarer sa snart som mulig.\n\n"
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


def send_contact_emails(
    name: str,
    email: str,
    message: str,
    company: str | None = None,
    website: str | None = None,
    lang: str | None = None,
) -> None:
    """Send the portfolio contact email and localized autoresponder.

    Args:
        name: Sender display name from the contact form.
        email: Sender email address used for reply-to and autoresponder.
        message: Message body submitted through the contact form.
        company: Optional company context from the contact form.
        website: Optional website context from the contact form.
        lang: Optional language code used to select autoresponder copy.

    Raises:
        RuntimeError: If email sending is enabled but SMTP or owner settings are missing.
    """

    logger.warning("EMAIL_ENABLED=%s", getattr(settings, "email_enabled", None))
    logger.warning(
        "SMTP host=%s port=%s user=%s from=%s owner=%s",
        settings.smtp_host,
        settings.smtp_port,
        settings.smtp_user,
        getattr(settings, "smtp_from", None),
        settings.owner_email,
    )

    if not getattr(settings, "email_enabled", True):
        logger.warning("Email sending disabled by config")
        return

    if not settings.smtp_host or not settings.smtp_user or not settings.smtp_password:
        raise RuntimeError("SMTP configuration is missing. Check backend/.env.")

    from_addr = (getattr(settings, "smtp_from", None) or settings.smtp_user).strip()
    owner_addr = (settings.owner_email or "").strip()
    sender_addr = email.strip()

    if not owner_addr:
        raise RuntimeError("OWNER_EMAIL is not configured")

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

    owner_msg.set_content(
        f"Sender: {name} <{sender_addr}>\n\n"
        f"{meta_block}"
        f"Message:\n{message}\n"
    )

    logger.warning("Sending owner email to %s", owner_addr)
    _send_smtp(owner_msg)

    chosen = _pick_lang(lang)
    tpl = TEMPLATES[chosen]

    auto = EmailMessage()
    auto["Subject"] = tpl["subject"]
    auto["From"] = from_addr
    auto["To"] = sender_addr
    auto.set_content(tpl["body"](name))

    logger.warning("Sending autoresponder to %s in lang=%s", sender_addr, chosen)
    _send_smtp(auto)
