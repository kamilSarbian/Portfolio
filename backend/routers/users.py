from __future__ import annotations

from core.db import get_db
from core.security import get_current_user, require_admin
from fastapi import APIRouter, Depends
from models.user import User
from schemas.common import ErrorResponse
from schemas.user import ProfileResponse, UserOut, UsersResponse
from services.user_service import list_users
from sqlalchemy.orm import Session

router = APIRouter(prefix="/backend/users", tags=["users"])


@router.get(
    "/profile",
    response_model=ProfileResponse,
    summary="Get current user profile",
    description="Returns the authenticated user's profile extracted from the JWT token.",
    responses={
        401: {"model": ErrorResponse, "description": "Missing or invalid bearer token."},
    },
)
def profile(current_user: User = Depends(get_current_user)) -> ProfileResponse:
    """Return the authenticated user's public profile."""

    return ProfileResponse(user=UserOut.model_validate(current_user))


@router.get(
    "",
    response_model=UsersResponse,
    summary="List users (admin only)",
    description="Returns all users. Requires a valid JWT token with the admin role.",
    responses={
        401: {"model": ErrorResponse, "description": "Missing or invalid bearer token."},
        403: {
            "model": ErrorResponse,
            "description": "Authenticated user does not have admin access.",
        },
    },
)
def users_admin(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> UsersResponse:
    """Return all users to an authenticated administrator."""

    users = list_users(db)
    return UsersResponse(users=[UserOut.model_validate(u) for u in users])
