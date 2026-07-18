from __future__ import annotations

import logging

import httpx

from core.config import settings

logger = logging.getLogger(__name__)

MOCK_TECHNICAL_DIRECTIONS = (
    (
        "Based on your message, the first step would be to map the current workflow, "
        "identify repetitive steps, and decide which part can be automated with a backend API "
        "or AI-assisted process."
    ),
    (
        "A practical first step would be identifying the repeated operations, defining the data "
        "that moves between systems, and exposing the most useful part through a small backend workflow."
    ),
    (
        "The initial direction would likely be to document the current process, locate the bottleneck, "
        "and build a focused API or automation layer around the step that creates the most manual work."
    ),
    (
        "A sensible approach would be to start with a narrow proof of workflow: validate the input data, "
        "automate one repeatable step, and then improve reliability, logging, and maintainability."
    ),
)


def _get_mock_technical_direction(message: str, name: str | None = None) -> str | None:
    """Return a deterministic local technical direction for offline development.

    Args:
        message: User-submitted workflow or backend problem description.
        name: Optional sender name used to vary the deterministic response.

    Returns:
        A short mock technical direction, or None for empty messages.
    """

    normalized_message = message.strip()
    if not normalized_message:
        return None

    index_seed = len(normalized_message) + len((name or "").strip())
    return MOCK_TECHNICAL_DIRECTIONS[index_seed % len(MOCK_TECHNICAL_DIRECTIONS)]


def get_ai_technical_direction(
    message: str,
    name: str | None = None,
    email: str | None = None,
    company: str | None = None,
) -> str | None:
    """Return an AI-assisted technical direction for a contact inquiry.

    Args:
        message: User-submitted workflow or backend problem description.
        name: Optional sender name.
        email: Optional sender email address.
        company: Optional company context from the contact form.

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
        return _get_mock_technical_direction(message=message, name=name)

    jarvis_url = settings.jarvis_url.strip()
    if not jarvis_url:
        raise RuntimeError("JARVIS_URL is required when JARVIS is enabled.")

    headers = {}
    if settings.jarvis_api_key:
        headers["Authorization"] = f"Bearer {settings.jarvis_api_key}"

    payload = {
        "name": name,
        "email": email,
        "company": company,
        "message": normalized_message,
    }

    try:
        with httpx.Client(timeout=settings.jarvis_timeout_seconds) as client:
            response = client.post(jarvis_url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
    except httpx.TimeoutException as exc:
        raise TimeoutError("JARVIS request timed out.") from exc
    except httpx.HTTPError as exc:
        raise RuntimeError("JARVIS request failed.") from exc
    except ValueError as exc:
        raise RuntimeError("JARVIS returned invalid JSON.") from exc

    if data.get("fallback"):
        logger.info("JARVIS returned fallback response: %s", data.get("error") or "no error detail")
        return None

    direction = data.get("direction")
    if direction is None:
        return None
    if not isinstance(direction, str):
        raise RuntimeError("JARVIS direction must be a string.")

    clean_direction = direction.strip()
    return clean_direction or None
