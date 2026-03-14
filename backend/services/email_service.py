import smtplib
from email.message import EmailMessage

from backend.core.config import settings

SUPPORTED_LANGS = {"pl", "en", "no"}


def _pick_lang(lang: str | None) -> str:
    """
    Normalizacja języka:
    - przyjmujemy: pl / en / no
    - 'nb' mapujemy na 'no'
    - fallback: pl
    """
    if not lang:
        return "pl"
    base = lang.lower().strip()[:2]
    if base == "nb":
        return "no"
    return base if base in SUPPORTED_LANGS else "pl"


TEMPLATES = {
    "pl": {
        "subject": "Dziękuję za wiadomość",
        "body": lambda name: (
            f"Cześć {name},\n\n"
            "Dziękuję za wiadomość i zainteresowanie moim profilem. "
            "Otrzymałem Twoją wiadomość i postaram się odpowiedzieć jak najszybciej.\n\n"
            "Pozdrawiam,\n"
            "Kamil Sarbian\n"
            "Junior Backend Developer\n"
            "📧 sarbian.kamil@gmail.com\n"
            "📞 +47 92 51 16 61\n"
        ),
    },
    "en": {
        "subject": "Thanks for your message",
        "body": lambda name: (
            f"Hi {name},\n\n"
            "Thanks for reaching out and for your interest in my portfolio. "
            "I’ve received your message and I’ll get back to you as soon as possible.\n\n"
            "Best regards,\n"
            "Kamil Sarbian\n"
            "Junior Backend Developer\n"
            "📧 sarbian.kamil@gmail.com\n"
            "📞 +47 92 51 16 61\n"
        ),
    },
    "no": {
        "subject": "Takk for meldingen",
        "body": lambda name: (
            f"Hei {name},\n\n"
            "Takk for meldingen og interessen for profilen/porteføljen min. "
            "Jeg har mottatt meldingen din og svarer så snart som mulig.\n\n"
            "Vennlig hilsen,\n"
            "Kamil Sarbian\n"
            "Junior Backend Developer\n"
            "📧 sarbian.kamil@gmail.com\n"
            "📞 +47 92 51 16 61\n"
        ),
    },
}


def _send_smtp(msg: EmailMessage) -> None:
    """
    Wysyłka SMTP (STARTTLS).
    """
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
    """
    1) Mail do OWNER (Twojego maila) z treścią wiadomości (Reply-To = user email)
    2) Autoresponder do nadawcy w języku ustawionym na stronie (lang)
    """
    if not getattr(settings, "email_enabled", True):
        return

    # sanity-check konfiguracji
    if not settings.smtp_host or not settings.smtp_user or not settings.smtp_password:
        raise RuntimeError("Brak konfiguracji SMTP (sprawdź backend/.env).")

    from_addr = (getattr(settings, "smtp_from", None) or settings.smtp_user).strip()
    owner_addr = settings.owner_email.strip()
    sender_addr = email.strip()

    # ---------------------------
    # 1) Wiadomość do Ciebie
    # ---------------------------
    owner_msg = EmailMessage()
    owner_msg["Subject"] = f"[Portfolio] Message from: {name}"
    owner_msg["From"] = from_addr
    owner_msg["To"] = owner_addr

    # Najczyściej: odpowiadasz bezpośrednio do nadawcy
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

    _send_smtp(owner_msg)

    # ---------------------------
    # 2) Autoresponder do usera
    # ---------------------------
    chosen = _pick_lang(lang)
    tpl = TEMPLATES[chosen]

    auto = EmailMessage()
    auto["Subject"] = tpl["subject"]
    auto["From"] = from_addr
    auto["To"] = sender_addr
    auto.set_content(tpl["body"](name))

    _send_smtp(auto)
