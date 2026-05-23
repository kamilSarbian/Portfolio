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


def get_ai_technical_direction(message: str, name: str | None = None) -> str | None:
    """Return an AI-assisted technical direction for a contact inquiry.

    Args:
        message: User-submitted workflow or backend problem description.
        name: Optional sender name used by future real JARVIS integrations.

    Returns:
        A short technical direction, or None when no direction can be prepared.
    """

    normalized_message = message.strip()
    if not normalized_message:
        return None

    index_seed = len(normalized_message) + len((name or "").strip())
    return MOCK_TECHNICAL_DIRECTIONS[index_seed % len(MOCK_TECHNICAL_DIRECTIONS)]
