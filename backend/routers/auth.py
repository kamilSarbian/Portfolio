from __future__ import annotations

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from core.db import get_db
from core.security import create_access_token
from schemas.user import RegisterRequest, TokenResponse, UserOut
from services.user_service import create_user, authenticate_user

router = APIRouter(prefix="/backend/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    user = create_user(db, email=payload.email, password=payload.password, role="user")
    return user


@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, email=form_data.username, password=form_data.password)
    token = create_access_token(sub=user.email, role=user.role)
    return TokenResponse(access_token=token)