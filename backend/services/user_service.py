from __future__ import annotations

from core.errors import ApiError, ErrorCode
from core.security import hash_password, verify_password
from fastapi import status
from models.user import User
from sqlalchemy.orm import Session


def get_user_by_email(db: Session, email: str) -> User | None:
    """Return a user by email address when present."""

    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, *, email: str, password: str, role: str = "user") -> User:
    """Create and persist a user with a securely hashed password."""

    existing = get_user_by_email(db, email)
    if existing:
        raise ApiError(
            status_code=status.HTTP_409_CONFLICT,
            error_code=ErrorCode.USER_ALREADY_EXISTS,
            detail="Email already registered",
        )

    user = User(
        email=email,
        hashed_password=hash_password(password),
        role=role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, *, email: str, password: str) -> User:
    """Validate credentials and return the active user."""

    user = get_user_by_email(db, email)
    if not user or not user.is_active:
        raise ApiError(
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code=ErrorCode.INVALID_CREDENTIALS,
            detail="Invalid credentials",
        )

    if not verify_password(password, user.hashed_password):
        raise ApiError(
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code=ErrorCode.INVALID_CREDENTIALS,
            detail="Invalid credentials",
        )

    return user


def list_users(db: Session) -> list[User]:
    """Return all users ordered by their database identifier."""

    return db.query(User).order_by(User.id.asc()).all()
