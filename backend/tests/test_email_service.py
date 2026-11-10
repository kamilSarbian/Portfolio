import smtplib
from email.message import EmailMessage

import pytest
from services import email_service


def _configure_email(monkeypatch) -> None:
    monkeypatch.setattr(email_service.settings, "email_enabled", True)
    monkeypatch.setattr(email_service.settings, "smtp_host", "smtp.example.com")
    monkeypatch.setattr(email_service.settings, "smtp_port", 587)
    monkeypatch.setattr(email_service.settings, "smtp_user", "sender@example.com")
    monkeypatch.setattr(email_service.settings, "smtp_password", "secret")
    monkeypatch.setattr(email_service.settings, "smtp_from", "sender@example.com")
    monkeypatch.setattr(email_service.settings, "owner_email", "owner@example.com")


def test_send_owner_contact_email_reports_success_after_smtp_accepts(monkeypatch):
    _configure_email(monkeypatch)
    sent: list[EmailMessage] = []
    monkeypatch.setattr(email_service, "_send_smtp", sent.append)

    email_service.send_owner_contact_email(
        name="Anna",
        email="anna@example.com",
        message="We need to automate reporting from several internal tools.",
        company="Acme",
    )

    assert len(sent) == 1
    assert sent[0]["To"] == "owner@example.com"
    assert sent[0]["Reply-To"] == "anna@example.com"
    assert "Company: Acme" in sent[0].get_content()
    assert "We need to automate reporting" in sent[0].get_content()
    assert "JARVIS" not in sent[0].get_content()


def test_send_owner_contact_email_raises_when_smtp_fails(monkeypatch):
    _configure_email(monkeypatch)

    def fail_smtp(_message: EmailMessage) -> None:
        raise smtplib.SMTPException("SMTP unavailable")

    monkeypatch.setattr(email_service, "_send_smtp", fail_smtp)

    with pytest.raises(email_service.OwnerEmailDeliveryError):
        email_service.send_owner_contact_email(
            name="Anna",
            email="anna@example.com",
            message="We need to automate reporting from several internal tools.",
        )


def test_send_contact_follow_up_sends_ai_direction_to_sender_and_owner(monkeypatch):
    _configure_email(monkeypatch)
    sent: list[EmailMessage] = []

    monkeypatch.setattr(email_service, "_send_smtp", sent.append)
    monkeypatch.setattr(
        email_service,
        "get_ai_technical_direction",
        lambda message: "Map the workflow and automate the repeated backend step.",
    )

    email_service.send_contact_follow_up(
        name="Anna",
        email="anna@example.com",
        message="We need to automate reporting from several internal tools.",
        lang="en",
        ask_ai_direction=True,
    )

    assert len(sent) == 2
    user_body = sent[0].get_content()
    assert sent[0]["To"] == "anna@example.com"
    assert "JARVIS, my AI assistant" in user_body
    assert "Map the workflow and automate the repeated backend step." in user_body
    assert "not a final estimate or commitment" in user_body

    owner_body = sent[1].get_content()
    assert sent[1]["To"] == "owner@example.com"
    assert sent[1]["Reply-To"] == "anna@example.com"
    assert "JARVIS follow-up for Anna" in owner_body
    assert "Map the workflow and automate the repeated backend step." in owner_body
    assert "accepted by SMTP before this optional step" in owner_body


def test_send_contact_follow_up_omits_ai_direction_by_default(monkeypatch):
    _configure_email(monkeypatch)
    sent: list[EmailMessage] = []
    monkeypatch.setattr(email_service, "_send_smtp", sent.append)

    email_service.send_contact_follow_up(
        name="Anna",
        email="anna@example.com",
        message="We need to automate reporting from several internal tools.",
        lang="en",
    )

    assert len(sent) == 1
    assert "JARVIS, my AI assistant" not in sent[0].get_content()


def test_send_contact_follow_up_uses_sender_fallback_when_ai_direction_fails(monkeypatch):
    _configure_email(monkeypatch)
    sent: list[EmailMessage] = []

    def fail_ai_direction(message: str) -> str:
        raise TimeoutError("JARVIS timeout")

    monkeypatch.setattr(email_service, "_send_smtp", sent.append)
    monkeypatch.setattr(email_service, "get_ai_technical_direction", fail_ai_direction)

    email_service.send_contact_follow_up(
        name="Anna",
        email="anna@example.com",
        message="We need to automate reporting from several internal tools.",
        lang="en",
        ask_ai_direction=True,
    )

    assert len(sent) == 1
    assert "JARVIS was unable to generate a suggestion" in sent[0].get_content()
    assert "Best regards" in sent[0].get_content()


def test_send_contact_follow_up_failure_does_not_raise(monkeypatch):
    _configure_email(monkeypatch)

    def fail_smtp(_message: EmailMessage) -> None:
        raise smtplib.SMTPException("SMTP unavailable")

    monkeypatch.setattr(email_service, "_send_smtp", fail_smtp)

    email_service.send_contact_follow_up(
        name="Anna",
        email="anna@example.com",
        message="We need to automate reporting from several internal tools.",
        lang="en",
    )


def test_send_contact_follow_up_still_attempts_owner_ai_email_when_autoresponder_fails(
    monkeypatch,
):
    _configure_email(monkeypatch)
    attempted: list[EmailMessage] = []

    def send_with_first_failure(message: EmailMessage) -> None:
        attempted.append(message)
        if len(attempted) == 1:
            raise smtplib.SMTPException("Autoresponder unavailable")

    monkeypatch.setattr(email_service, "_send_smtp", send_with_first_failure)
    monkeypatch.setattr(
        email_service,
        "get_ai_technical_direction",
        lambda message: "Review the workflow boundaries before implementation.",
    )

    email_service.send_contact_follow_up(
        name="Anna",
        email="anna@example.com",
        message="We need to automate reporting from several internal tools.",
        lang="en",
        ask_ai_direction=True,
    )

    assert len(attempted) == 2
    assert attempted[0]["To"] == "anna@example.com"
    assert attempted[1]["To"] == "owner@example.com"
    assert "Review the workflow boundaries" in attempted[1].get_content()
