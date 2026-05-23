from email.message import EmailMessage

from services import email_service


def _configure_email(monkeypatch) -> None:
    monkeypatch.setattr(email_service.settings, "email_enabled", True)
    monkeypatch.setattr(email_service.settings, "smtp_host", "smtp.example.com")
    monkeypatch.setattr(email_service.settings, "smtp_port", 587)
    monkeypatch.setattr(email_service.settings, "smtp_user", "sender@example.com")
    monkeypatch.setattr(email_service.settings, "smtp_password", "secret")
    monkeypatch.setattr(email_service.settings, "smtp_from", "sender@example.com")
    monkeypatch.setattr(email_service.settings, "owner_email", "owner@example.com")


def test_send_contact_emails_includes_ai_direction_when_requested(monkeypatch):
    _configure_email(monkeypatch)
    sent: list[EmailMessage] = []

    monkeypatch.setattr(email_service, "_send_smtp", sent.append)
    monkeypatch.setattr(
        email_service,
        "get_ai_technical_direction",
        lambda message, name=None: "Map the workflow and automate the repeated backend step.",
    )

    email_service.send_contact_emails(
        name="Anna",
        email="anna@example.com",
        message="We need to automate reporting from several internal tools.",
        lang="en",
        ask_ai_direction=True,
    )

    assert len(sent) == 2
    owner_body = sent[0].get_content()
    user_body = sent[1].get_content()

    assert "AI-assisted technical direction:" in owner_body
    assert "JARVIS, my AI assistant" in user_body
    assert "Map the workflow and automate the repeated backend step." in user_body
    assert "not a final estimate or commitment" in user_body


def test_send_contact_emails_omits_ai_direction_by_default(monkeypatch):
    _configure_email(monkeypatch)
    sent: list[EmailMessage] = []

    monkeypatch.setattr(email_service, "_send_smtp", sent.append)

    email_service.send_contact_emails(
        name="Anna",
        email="anna@example.com",
        message="We need to automate reporting from several internal tools.",
        lang="en",
    )

    assert len(sent) == 2
    assert "AI-assisted technical direction:" not in sent[0].get_content()
    assert "JARVIS, my AI assistant" not in sent[1].get_content()


def test_send_contact_emails_uses_fallback_when_ai_direction_fails(monkeypatch):
    _configure_email(monkeypatch)
    sent: list[EmailMessage] = []

    def fail_ai_direction(message, name=None):
        raise TimeoutError("JARVIS timeout")

    monkeypatch.setattr(email_service, "_send_smtp", sent.append)
    monkeypatch.setattr(email_service, "get_ai_technical_direction", fail_ai_direction)

    email_service.send_contact_emails(
        name="Anna",
        email="anna@example.com",
        message="We need to automate reporting from several internal tools.",
        lang="en",
        ask_ai_direction=True,
    )

    assert len(sent) == 2
    assert "JARVIS was unable to generate a suggestion" in sent[0].get_content()
    assert "JARVIS was unable to generate a suggestion" in sent[1].get_content()
    assert "Best regards" in sent[1].get_content()
