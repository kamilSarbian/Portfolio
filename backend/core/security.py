from __future__ import annotations

from datetime import UTC, datetime, timedelta

import jwt
from fastapi import Depends, status
from fastapi.security import OAuth2PasswordBearer
from models.user import User
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from .config import settings
from .db import get_db
from .errors import ApiError, ErrorCode

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/backend/auth/login")


def _require_jwt_secret() -> str:
    if not settings.jwt_secret:
        raise RuntimeError("JWT_SECRET must be configured.")
    return settings.jwt_secret


def hash_password(password: str) -> str:
    """Hash a plaintext password using the configured password context."""

    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    """Verify a plaintext password against a stored hash."""

    return pwd_context.verify(password, hashed)


def create_access_token(*, sub: str, role: str, expires_minutes: int | None = None) -> str:
    """Create a signed JWT access token for a user and role."""

    now = datetime.now(UTC)
    exp_min = expires_minutes if expires_minutes is not None else settings.access_token_expire_min
    payload = {
        "sub": sub,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=exp_min)).timestamp()),
    }
    return jwt.encode(payload, _require_jwt_secret(), algorithm=settings.jwt_alg)


def decode_token(token: str) -> dict[str, object]:
    """Decode and validate a signed JWT access token."""

    return jwt.decode(token, _require_jwt_secret(), algorithms=[settings.jwt_alg])


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Resolve the active database user represented by a bearer token."""

    cred_exc = ApiError(
        status_code=status.HTTP_401_UNAUTHORIZED,
        error_code=ErrorCode.AUTHENTICATION_REQUIRED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(token)
        sub: str | None = payload.get("sub")
        if not sub:
            raise cred_exc
    except jwt.InvalidTokenError as exc:
        raise cred_exc from exc

    user = db.query(User).filter(User.email == sub).first()
    if not user or not user.is_active:
        raise cred_exc

    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require the current authenticated user to have the admin role."""

    if current_user.role != "admin":
        raise ApiError(
            status_code=status.HTTP_403_FORBIDDEN,
            error_code=ErrorCode.ADMIN_REQUIRED,
            detail="Admin only",
        )
    return current_user
