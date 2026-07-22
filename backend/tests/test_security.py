import jwt
from core.config import settings
from core.security import create_access_token


def test_create_access_token_requires_jwt_secret(monkeypatch):
    monkeypatch.setattr(settings, "jwt_secret", "")

    try:
        create_access_token(sub="user@example.com", role="user")
    except RuntimeError as exc:
        assert "JWT_SECRET" in str(exc)
    else:
        raise AssertionError("create_access_token should require JWT_SECRET")


def test_create_access_token_contains_subject_and_role(monkeypatch):
    test_secret = "test-" + ("x" * 32)
    monkeypatch.setattr(settings, "jwt_secret", test_secret)

    token = create_access_token(sub="user@example.com", role="admin", expires_minutes=5)
    payload = jwt.decode(token, test_secret, algorithms=[settings.jwt_alg])

    assert payload["sub"] == "user@example.com"
    assert payload["role"] == "admin"
    assert "exp" in payload
