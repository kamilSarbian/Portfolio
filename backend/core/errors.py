from __future__ import annotations

import logging
from enum import StrEnum
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


class ErrorCode(StrEnum):
    INVALID_CREDENTIALS = "invalid_credentials"
    USER_ALREADY_EXISTS = "user_already_exists"
    AUTHENTICATION_REQUIRED = "authentication_required"
    ADMIN_REQUIRED = "admin_required"
    UNSUPPORTED_FILE_TYPE = "unsupported_file_type"
    FILE_TOO_LARGE = "file_too_large"
    INVALID_IMAGE = "invalid_image"
    IMAGE_PROCESSING_FAILED = "image_processing_failed"
    EMPTY_FILE = "empty_file"
    MISSING_FILE = "missing_file"
    LABELS_REQUIRED = "labels_required"
    IMAGE_CLASSIFICATION_FAILED = "image_classification_failed"
    PASSWORD_REQUIRED = "password_required"
    HIBP_UNAVAILABLE = "hibp_unavailable"
    EMAIL_SERVICE_UNAVAILABLE = "email_service_unavailable"
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    VALIDATION_ERROR = "validation_error"
    BAD_REQUEST = "bad_request"
    FORBIDDEN = "forbidden"
    NOT_FOUND = "not_found"
    METHOD_NOT_ALLOWED = "method_not_allowed"
    HTTP_ERROR = "http_error"
    INTERNAL_ERROR = "internal_error"


class ApiError(HTTPException):
    """Represent a public API failure with a stable machine-readable code."""

    def __init__(
        self,
        *,
        status_code: int,
        error_code: ErrorCode,
        detail: str,
        headers: dict[str, str] | None = None,
    ) -> None:
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_code = error_code


def _default_error_code(status_code: int) -> ErrorCode:
    return {
        400: ErrorCode.BAD_REQUEST,
        401: ErrorCode.AUTHENTICATION_REQUIRED,
        403: ErrorCode.FORBIDDEN,
        404: ErrorCode.NOT_FOUND,
        405: ErrorCode.METHOD_NOT_ALLOWED,
        413: ErrorCode.FILE_TOO_LARGE,
        415: ErrorCode.UNSUPPORTED_FILE_TYPE,
        422: ErrorCode.VALIDATION_ERROR,
        429: ErrorCode.RATE_LIMIT_EXCEEDED,
        500: ErrorCode.INTERNAL_ERROR,
    }.get(status_code, ErrorCode.HTTP_ERROR)


def _error_payload(
    error_code: ErrorCode,
    detail: str,
    *,
    fields: list[dict[str, str]] | None = None,
) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "error_code": error_code.value,
        "detail": detail,
    }
    if fields:
        payload["fields"] = fields
    return payload


async def _http_error_handler(
    _request: Request,
    exc: StarletteHTTPException,
) -> JSONResponse:
    error_code = getattr(exc, "error_code", _default_error_code(exc.status_code))
    detail = exc.detail if isinstance(exc.detail, str) else "Request failed."
    return JSONResponse(
        status_code=exc.status_code,
        content=_error_payload(error_code, detail),
        headers=exc.headers,
    )


async def _validation_error_handler(
    _request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    fields = [
        {
            "field": ".".join(str(part) for part in error.get("loc", ())),
            "type": str(error.get("type", "validation_error")),
        }
        for error in exc.errors()
    ]
    return JSONResponse(
        status_code=422,
        content=_error_payload(
            ErrorCode.VALIDATION_ERROR,
            "Request validation failed.",
            fields=fields,
        ),
    )


async def _internal_error_handler(_request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled API exception.", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content=_error_payload(
            ErrorCode.INTERNAL_ERROR,
            "An unexpected server error occurred.",
        ),
    )


def register_error_handlers(app: FastAPI) -> None:
    """Register consistent public error responses on a FastAPI application.

    Args:
        app: FastAPI application receiving the exception handlers.
    """

    app.add_exception_handler(StarletteHTTPException, _http_error_handler)
    app.add_exception_handler(RequestValidationError, _validation_error_handler)
    app.add_exception_handler(Exception, _internal_error_handler)
