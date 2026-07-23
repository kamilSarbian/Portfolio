from __future__ import annotations

from pydantic import BaseModel, Field


class ValidationIssue(BaseModel):
    field: str
    type: str


class ErrorResponse(BaseModel):
    error_code: str = Field(..., examples=["validation_error"])
    detail: str = Field(..., examples=["Human-readable error message."])
    fields: list[ValidationIssue] | None = None


class OkResponse(BaseModel):
    ok: bool = True


class MessageResponse(BaseModel):
    message: str


class HealthResponse(BaseModel):
    ok: bool = True


class VersionResponse(BaseModel):
    service: str
    version: str
