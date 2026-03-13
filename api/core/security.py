from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from .config import settings
from .db import get_db
from api.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# tokenUrl jest “informacyjne” dla Swaggera
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

def create_access_token(*, sub: str, role: str, expires_minutes: int | None = None) -> str:
    now = datetime.now(timezone.utc)
    exp_min = expires_minutes if expires_minutes is not None else settings.access_token_expire_min
    payload = {
        "sub": sub,             # zwykle email
        "role": role,           # "admin" / "user"
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=exp_min)).timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_alg)

def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_alg])

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    cred_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(token)
        sub: Optional[str] = payload.get("sub")
        if not sub:
            raise cred_exc
    except JWTError:
        raise cred_exc

    user = db.query(User).filter(User.email == sub).first()
    if not user or not user.is_active:
        raise cred_exc

    return user

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return current_user