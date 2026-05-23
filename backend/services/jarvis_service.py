MOCK_TECHNICAL_DIRECTION = (
    "Based on your message, the first step would be to map the current workflow, "
    "identify repetitive steps, and decide which part can be automated with a backend API "
    "or AI-assisted process."
)


def get_ai_technical_direction(message: str, name: str | None = None) -> str | None:
    """Return an AI-assisted technical direction for a contact inquiry.

    Args:
        message: User-submitted workflow or backend problem description.
        name: Optional sender name used by future real JARVIS integrations.

    Returns:
        A short technical direction, or None when no direction can be prepared.
    """

    if not message.strip():
        return None

    return MOCK_TECHNICAL_DIRECTION
