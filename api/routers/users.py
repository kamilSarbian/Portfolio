from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.core.db import get_db
from api.core.security import get_current_user, require_admin
from api.models.user import User
from api.schemas.user import ProfileResponse, UsersResponse, UserOut
from api.services.user_service import list_users

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/profile", response_model=ProfileResponse)
def profile(current_user: User = Depends(get_current_user)):
    return ProfileResponse(user=UserOut.model_validate(current_user))


@router.get("", response_model=UsersResponse)
def users_admin(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    users = list_users(db)
    return UsersResponse(users=[UserOut.model_validate(u) for u in users])