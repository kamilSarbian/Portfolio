from core.errors import register_error_handlers
from core.rate_limit import _BUCKETS, contact_rate_limit
from fastapi import FastAPI
from fastapi.testclient import TestClient
from routers import contact as contact_module
from routers.contact import _normalize_lang, router
from services.email_service import OwnerEmailDeliveryError


def make_client() -> TestClient:
    app = FastAPI()
    register_error_handlers(app)
    app.dependency_overrides[contact_rate_limit] = lambda: None
    app.include_router(router)
    return TestClient(app)


def test_normalize_lang_uses_payload_first():
    assert _normalize_lang("en", "pl-PL,pl;q=0.9") == "en"


def test_normalize_lang_supports_norwegian_bokmal_header():
    assert _normalize_lang(None, "nb-NO,nb;q=0.9") == "no"


def test_normalize_lang_defaults_to_english():
    assert _normalize_lang(None, None) == "en"


def test_send_contact_delivers_owner_before_scheduling_follow_up(monkeypatch):
    calls = []

    def fake_send_owner_contact_email(name, email, message, company=None, website=None):
        calls.append(
            (
                "owner",
                {
                    "name": name,
                    "email": email,
                    "message": message,
                    "company": company,
                    "website": website,
                },
            )
        )

    def fake_send_contact_follow_up(name, email, message, lang=None, ask_ai_direction=False):
        calls.append(("follow_up", {"lang": lang, "ask_ai_direction": ask_ai_direction}))

    monkeypatch.setattr(contact_module, "send_owner_contact_email", fake_send_owner_contact_email)
    monkeypatch.setattr(contact_module, "send_contact_follow_up", fake_send_contact_follow_up)

    client = make_client()
    response = client.post(
        "/backend/contact/send",
        json={
            "name": "Kamil",
            "email": "kamil@example.com",
            "message": "This is a long enough message for the contact endpoint.",
            "company": "Acme",
            "lang": "en",
            "ask_ai_direction": True,
        },
        headers={"accept-language": "pl-PL,pl;q=0.9"},
    )

    assert response.status_code == 200
    assert response.json() == {"ok": True}
    assert calls == [
        (
            "owner",
            {
                "name": "Kamil",
                "email": "kamil@example.com",
                "message": "This is a long enough message for the contact endpoint.",
                "company": "Acme",
                "website": None,
            },
        ),
        ("follow_up", {"lang": "en", "ask_ai_direction": True}),
    ]


def test_send_contact_uses_accept_language_when_payload_lang_missing(monkeypatch):
    called = {}

    def fake_send_contact_follow_up(name, email, message, lang=None, ask_ai_direction=False):
        called["lang"] = lang

    monkeypatch.setattr(contact_module, "send_owner_contact_email", lambda *args: None)
    monkeypatch.setattr(contact_module, "send_contact_follow_up", fake_send_contact_follow_up)

    client = make_client()
    response = client.post(
        "/backend/contact/send",
        json={
            "name": "Kamil",
            "email": "kamil@example.com",
            "message": "This is another valid message that is longer than twenty chars.",
        },
        headers={"accept-language": "nb-NO,nb;q=0.9"},
    )

    assert response.status_code == 200
    assert response.json() == {"ok": True}
    assert called["lang"] == "no"


def test_send_contact_validates_payload():
    client = make_client()
    response = client.post(
        "/backend/contact/send",
        json={
            "name": "A",
            "email": "not-an-email",
            "message": "short",
        },
    )

    assert response.status_code == 422


def test_send_contact_still_succeeds_when_follow_up_registration_fails(monkeypatch):
    original_add_task = contact_module.BackgroundTasks.add_task

    def fake_add_task(self, func, *args, **kwargs):
        raise RuntimeError("queue unavailable")

    monkeypatch.setattr(contact_module.BackgroundTasks, "add_task", fake_add_task)
    monkeypatch.setattr(contact_module, "send_owner_contact_email", lambda *args: None)

    client = make_client()
    response = client.post(
        "/backend/contact/send",
        json={
            "name": "Kamil",
            "email": "kamil@example.com",
            "message": "This is a long enough message for the contact endpoint.",
        },
    )

    monkeypatch.setattr(contact_module.BackgroundTasks, "add_task", original_add_task)

    assert response.status_code == 200
    assert response.json() == {"ok": True}


def test_send_contact_returns_502_when_owner_smtp_delivery_fails(monkeypatch):
    follow_up_called = False

    def fail_owner_delivery(*args):
        raise OwnerEmailDeliveryError("SMTP rejected owner notification")

    def fake_send_contact_follow_up(*args):
        nonlocal follow_up_called
        follow_up_called = True

    monkeypatch.setattr(contact_module, "send_owner_contact_email", fail_owner_delivery)
    monkeypatch.setattr(contact_module, "send_contact_follow_up", fake_send_contact_follow_up)

    client = make_client()
    response = client.post(
        "/backend/contact/send",
        json={
            "name": "Kamil",
            "email": "kamil@example.com",
            "message": "This is a long enough message for the contact endpoint.",
        },
    )

    assert response.status_code == 502
    assert response.json() == {
        "error_code": "email_service_unavailable",
        "detail": "Email service temporarily unavailable.",
    }
    assert follow_up_called is False


def test_send_contact_silently_ignores_honeypot_submission(monkeypatch):
    called = False

    def fake_send_owner_contact_email(*args, **kwargs):
        nonlocal called
        called = True

    monkeypatch.setattr(contact_module, "send_owner_contact_email", fake_send_owner_contact_email)

    client = make_client()
    response = client.post(
        "/backend/contact/send",
        json={
            "name": "Automated sender",
            "email": "bot@example.com",
            "message": "This submission filled the hidden website field.",
            "website": "https://spam.example.com",
        },
    )

    assert response.status_code == 200
    assert response.json() == {"ok": True}
    assert called is False


def teardown_function():
    _BUCKETS.clear()
