from __future__ import annotations

from core.db import get_db
from core.rate_limit import auth_rate_limit
from core.security import create_access_token
from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from models.user import User
from schemas.common import ErrorResponse
from schemas.user import RegisterRequest, TokenResponse, UserOut
from services.user_service import authenticate_user, create_user
from sqlalchemy.orm import Session

router = APIRouter(prefix="/backend/auth", tags=["auth"], dependencies=[Depends(auth_rate_limit)])


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Creates a standard user account and stores the password as a secure hash.",
    responses={
        409: {"model": ErrorResponse, "description": "Email is already registered."},
        422: {"model": ErrorResponse, "description": "Validation error."},
        429: {"model": ErrorResponse, "description": "Authentication rate limit exceeded."},
    },
)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> User:
    """Register a standard user account with a securely hashed password."""

    user = create_user(db, email=payload.email, password=payload.password, role="user")
    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Log in and receive JWT token",
    description="Authenticates a user with form-encoded credentials and returns a bearer token.",
    responses={
        401: {"model": ErrorResponse, "description": "Invalid credentials."},
        422: {"model": ErrorResponse, "description": "Validation error."},
        429: {"model": ErrorResponse, "description": "Authentication rate limit exceeded."},
    },
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Authenticate a user and return a signed bearer token."""

    user = authenticate_user(db, email=form_data.username, password=form_data.password)
    token = create_access_token(sub=user.email, role=user.role)
    return TokenResponse(access_token=token)
