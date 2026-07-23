from __future__ import annotations

from types import SimpleNamespace

from core.db import get_db
from core.errors import ApiError, ErrorCode, register_error_handlers
from core.rate_limit import (
    _BUCKETS,
    auth_rate_limit,
    contact_rate_limit,
    rate_limiter,
    upload_rate_limit,
)
from core.security import get_current_user
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient
from routers import auth as auth_module
from routers import contact as contact_module
from routers import images as images_module
from routers import users as users_module


def _make_app(*routers: object) -> FastAPI:
    app = FastAPI()
    register_error_handlers(app)
    for router in routers:
        app.include_router(router)
    return app


def _assert_error(response: object, status_code: int, error_code: str) -> dict[str, object]:
    assert response.status_code == status_code
    payload = response.json()
    assert payload["error_code"] == error_code
    assert isinstance(payload["detail"], str)
    return payload


def test_invalid_credentials_return_stable_error_code(monkeypatch) -> None:
    def reject_credentials(*_args: object, **_kwargs: object) -> None:
        raise ApiError(
            status_code=401,
            error_code=ErrorCode.INVALID_CREDENTIALS,
            detail="Invalid credentials",
        )

    monkeypatch.setattr(auth_module, "authenticate_user", reject_credentials)
    app = _make_app(auth_module.router)
    app.dependency_overrides[auth_rate_limit] = lambda: None
    app.dependency_overrides[get_db] = lambda: object()

    response = TestClient(app).post(
        "/backend/auth/login",
        data={"username": "user@example.com", "password": "wrong-password"},
    )

    _assert_error(response, 401, "invalid_credentials")


def test_existing_user_returns_stable_error_code(monkeypatch) -> None:
    def reject_existing_user(*_args: object, **_kwargs: object) -> None:
        raise ApiError(
            status_code=409,
            error_code=ErrorCode.USER_ALREADY_EXISTS,
            detail="Email already registered",
        )

    monkeypatch.setattr(auth_module, "create_user", reject_existing_user)
    app = _make_app(auth_module.router)
    app.dependency_overrides[auth_rate_limit] = lambda: None
    app.dependency_overrides[get_db] = lambda: object()

    response = TestClient(app).post(
        "/backend/auth/register",
        json={"email": "user@example.com", "password": "Password123"},
    )

    _assert_error(response, 409, "user_already_exists")


def test_missing_authorization_returns_stable_error_code() -> None:
    app = _make_app(users_module.router)
    app.dependency_overrides[get_db] = lambda: object()

    response = TestClient(app).get("/backend/users/profile")

    _assert_error(response, 401, "authentication_required")


def test_missing_admin_permission_returns_stable_error_code() -> None:
    app = _make_app(users_module.router)
    app.dependency_overrides[get_db] = lambda: object()
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(role="user")

    response = TestClient(app).get(
        "/backend/users",
        headers={"Authorization": "Bearer test-token"},
    )

    _assert_error(response, 403, "admin_required")


def test_invalid_file_returns_stable_error_code() -> None:
    app = _make_app(images_module.router)
    app.dependency_overrides[upload_rate_limit] = lambda: None

    response = TestClient(app).post(
        "/backend/image/process",
        files={"file": ("notes.txt", b"not-an-image", "text/plain")},
    )

    _assert_error(response, 415, "unsupported_file_type")


def test_oversized_file_returns_stable_error_code(monkeypatch) -> None:
    monkeypatch.setattr(images_module.settings, "max_upload_mb", 0)
    app = _make_app(images_module.router)
    app.dependency_overrides[upload_rate_limit] = lambda: None

    response = TestClient(app).post(
        "/backend/image/process",
        files={"file": ("image.png", b"x", "image/png")},
    )

    _assert_error(response, 413, "file_too_large")


def test_validation_error_omits_request_input() -> None:
    app = _make_app(contact_module.router)
    app.dependency_overrides[contact_rate_limit] = lambda: None
    sensitive_input = "SENSITIVE_INPUT_MUST_NOT_BE_RETURNED"

    response = TestClient(app).post(
        "/backend/contact/send",
        json={
            "name": "A",
            "email": sensitive_input,
            "message": "short",
        },
    )

    payload = _assert_error(response, 422, "validation_error")
    assert "fields" in payload
    assert sensitive_input not in response.text
    assert "input" not in response.text


def test_rate_limit_returns_stable_error_code() -> None:
    limiter = rate_limiter("error-contract", 0)
    app = FastAPI()
    register_error_handlers(app)

    @app.get("/limited", dependencies=[Depends(limiter)])
    def limited_endpoint() -> dict[str, bool]:
        """Return a response that should be blocked by the test limiter."""

        return {"ok": True}

    try:
        response = TestClient(app).get("/limited")
    finally:
        _BUCKETS.clear()

    _assert_error(response, 429, "rate_limit_exceeded")


def test_unavailable_service_returns_stable_error_code(monkeypatch) -> None:
    def reject_email_configuration() -> None:
        raise RuntimeError("email unavailable")

    monkeypatch.setattr(
        contact_module,
        "validate_email_configuration",
        reject_email_configuration,
    )
    app = _make_app(contact_module.router)
    app.dependency_overrides[contact_rate_limit] = lambda: None

    response = TestClient(app).post(
        "/backend/contact/send",
        json={
            "name": "Kamil",
            "email": "kamil@example.com",
            "message": "This is a valid message for the unavailable service test.",
        },
    )

    _assert_error(response, 502, "email_service_unavailable")


def test_unknown_server_error_uses_safe_fallback() -> None:
    app = FastAPI()
    register_error_handlers(app)

    @app.get("/failure")
    def failure_endpoint() -> None:
        """Raise an unexpected exception for the global handler test."""

        raise RuntimeError("SENSITIVE_INTERNAL_FAILURE")

    response = TestClient(app, raise_server_exceptions=False).get("/failure")
    payload = _assert_error(response, 500, "internal_error")

    assert payload["detail"] == "An unexpected server error occurred."
    assert "SENSITIVE_INTERNAL_FAILURE" not in response.text
