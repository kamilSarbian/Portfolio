from __future__ import annotations

import logging

import httpx
from core.config import settings
from pydantic import BaseModel, Field, ValidationError, model_validator

logger = logging.getLogger(__name__)


class _JarvisDirectionResponse(BaseModel):
    direction: str | None = Field(default=None, max_length=4000)
    fallback: bool
    error: str | None = Field(default=None, max_length=1000)

    @model_validator(mode="after")
    def validate_direction(self) -> _JarvisDirectionResponse:
        """Require successful responses to contain a non-empty direction."""

        if not self.fallback and not (self.direction or "").strip():
            raise ValueError("Successful JARVIS response must include a direction.")
        return self


def get_ai_technical_direction(message: str) -> str | None:
    """Return an AI-assisted technical direction for a contact inquiry.

    Args:
        message: User-submitted workflow or backend problem description.

    Returns:
        A short technical direction, or None when no direction can be prepared.

    Raises:
        RuntimeError: If the real JARVIS endpoint is enabled but misconfigured or returns an invalid response.
        TimeoutError: If the real JARVIS endpoint times out.
    """

    normalized_message = message.strip()
    if not normalized_message:
        return None

    if not settings.jarvis_enabled:
        return None

    jarvis_url = settings.jarvis_url.strip()
    if not jarvis_url:
        raise RuntimeError("JARVIS_URL is required when JARVIS is enabled.")

    jarvis_api_key = settings.jarvis_api_key.strip()
    if not jarvis_api_key:
        raise RuntimeError("JARVIS_API_KEY is required when JARVIS is enabled.")

    headers = {"Authorization": f"Bearer {jarvis_api_key}"}
    payload = {"message": normalized_message}

    try:
        with httpx.Client(timeout=settings.jarvis_timeout_seconds) as client:
            response = client.post(jarvis_url, json=payload, headers=headers)
            response.raise_for_status()
            data = _JarvisDirectionResponse.model_validate(response.json())
    except httpx.TimeoutException as exc:
        raise TimeoutError("JARVIS request timed out.") from exc
    except httpx.HTTPError as exc:
        raise RuntimeError("JARVIS request failed.") from exc
    except (ValidationError, ValueError) as exc:
        raise RuntimeError("JARVIS returned an invalid response.") from exc

    if data.fallback:
        logger.info("JARVIS returned a fallback response.")
        return None

    return data.direction.strip() if data.direction else None
