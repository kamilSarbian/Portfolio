from fastapi import FastAPI
from fastapi.testclient import TestClient

from core.rate_limit import _BUCKETS, contact_rate_limit
from routers import contact as contact_module
from routers.contact import _normalize_lang, router


def make_client() -> TestClient:
    app = FastAPI()
    app.dependency_overrides[contact_rate_limit] = lambda: None
    app.include_router(router)
    return TestClient(app)


def test_normalize_lang_uses_payload_first():
    assert _normalize_lang("en", "pl-PL,pl;q=0.9") == "en"


def test_normalize_lang_supports_norwegian_bokmal_header():
    assert _normalize_lang(None, "nb-NO,nb;q=0.9") == "no"


def test_normalize_lang_defaults_to_polish():
    assert _normalize_lang(None, None) == "pl"


def test_send_contact_enqueues_email_task_with_payload_lang(monkeypatch):
    called = {}

    def fake_send_contact_emails(name, email, message, company=None, website=None, lang=None):
        called["payload"] = {
            "name": name,
            "email": email,
            "message": message,
            "company": company,
            "website": website,
            "lang": lang,
        }

    monkeypatch.setattr(contact_module, "send_contact_emails", fake_send_contact_emails)

    client = make_client()
    response = client.post(
        "/backend/contact/send",
        json={
            "name": "Kamil",
            "email": "kamil@example.com",
            "message": "This is a long enough message for the contact endpoint.",
            "company": "Acme",
            "website": "https://example.com",
            "lang": "en",
        },
        headers={"accept-language": "pl-PL,pl;q=0.9"},
    )

    assert response.status_code == 200
    assert response.json() == {"ok": True}
    assert called["payload"] == {
        "name": "Kamil",
        "email": "kamil@example.com",
        "message": "This is a long enough message for the contact endpoint.",
        "company": "Acme",
        "website": "https://example.com",
        "lang": "en",
    }


def test_send_contact_uses_accept_language_when_payload_lang_missing(monkeypatch):
    called = {}

    def fake_send_contact_emails(name, email, message, company=None, website=None, lang=None):
        called["lang"] = lang

    monkeypatch.setattr(contact_module, "send_contact_emails", fake_send_contact_emails)

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


def test_send_contact_returns_502_when_task_registration_fails(monkeypatch):
    original_add_task = contact_module.BackgroundTasks.add_task

    def fake_add_task(self, func, *args, **kwargs):
        raise RuntimeError("queue unavailable")

    monkeypatch.setattr(contact_module.BackgroundTasks, "add_task", fake_add_task)

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

    assert response.status_code == 502
    assert response.json()["detail"] == "Email service temporarily unavailable."


def teardown_function():
    _BUCKETS.clear()
