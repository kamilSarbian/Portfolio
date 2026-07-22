import httpx
import pytest
from services import jarvis_service


class FakeJarvisClient:
    def __init__(self, response=None, exc=None):
        self.response = response
        self.exc = exc
        self.requests = []

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, traceback):
        return False

    def post(self, url, json, headers):
        self.requests.append({"url": url, "json": json, "headers": headers})
        if self.exc:
            raise self.exc
        return self.response


def _enable_real_jarvis(monkeypatch) -> None:
    monkeypatch.setattr(jarvis_service.settings, "jarvis_enabled", True)
    monkeypatch.setattr(
        jarvis_service.settings, "jarvis_url", "https://jarvis.example.com/jarvis/direction"
    )
    monkeypatch.setattr(jarvis_service.settings, "jarvis_timeout_seconds", 20.0)
    monkeypatch.setattr(jarvis_service.settings, "jarvis_api_key", "test-token")


def _jarvis_response(payload: object) -> httpx.Response:
    return httpx.Response(
        status_code=200,
        json=payload,
        request=httpx.Request("POST", "https://jarvis.example.com/jarvis/direction"),
    )


def test_get_ai_technical_direction_returns_none_when_disabled(monkeypatch):
    monkeypatch.setattr(jarvis_service.settings, "jarvis_enabled", False)

    direction = jarvis_service.get_ai_technical_direction(
        message="We need to automate reporting from several systems.",
    )

    assert direction is None


def test_get_ai_technical_direction_returns_none_for_blank_message(monkeypatch):
    monkeypatch.setattr(jarvis_service.settings, "jarvis_enabled", True)

    assert jarvis_service.get_ai_technical_direction(message="   ") is None


def test_get_ai_technical_direction_calls_real_endpoint(monkeypatch):
    _enable_real_jarvis(monkeypatch)
    response = _jarvis_response(
        {
            "direction": "Start by mapping the workflow and automating the repeated API step.",
            "fallback": False,
        }
    )
    fake_client = FakeJarvisClient(response=response)

    monkeypatch.setattr(jarvis_service.httpx, "Client", lambda timeout: fake_client)

    direction = jarvis_service.get_ai_technical_direction(
        message="We need to automate reporting from multiple data sources.",
    )

    assert direction == "Start by mapping the workflow and automating the repeated API step."
    assert fake_client.requests == [
        {
            "url": "https://jarvis.example.com/jarvis/direction",
            "json": {
                "message": "We need to automate reporting from multiple data sources.",
            },
            "headers": {"Authorization": "Bearer test-token"},
        }
    ]


def test_get_ai_technical_direction_returns_none_when_jarvis_fallbacks(monkeypatch):
    _enable_real_jarvis(monkeypatch)
    response = _jarvis_response(
        {
            "direction": None,
            "fallback": True,
            "error": "AI analysis temporarily unavailable. Kamil will review personally.",
        },
    )

    monkeypatch.setattr(
        jarvis_service.httpx, "Client", lambda timeout: FakeJarvisClient(response=response)
    )

    assert (
        jarvis_service.get_ai_technical_direction(
            message="We need to automate reporting from multiple data sources.",
        )
        is None
    )


def test_get_ai_technical_direction_raises_timeout(monkeypatch):
    _enable_real_jarvis(monkeypatch)
    timeout_exc = httpx.TimeoutException("timeout")

    monkeypatch.setattr(
        jarvis_service.httpx, "Client", lambda timeout: FakeJarvisClient(exc=timeout_exc)
    )

    with pytest.raises(TimeoutError):
        jarvis_service.get_ai_technical_direction(
            message="We need to automate reporting from multiple data sources.",
        )


def test_get_ai_technical_direction_requires_url_when_enabled(monkeypatch):
    monkeypatch.setattr(jarvis_service.settings, "jarvis_enabled", True)
    monkeypatch.setattr(jarvis_service.settings, "jarvis_url", "")

    with pytest.raises(RuntimeError, match="JARVIS_URL"):
        jarvis_service.get_ai_technical_direction(
            message="We need to automate reporting from multiple data sources.",
        )


def test_get_ai_technical_direction_requires_api_key_when_enabled(monkeypatch):
    monkeypatch.setattr(jarvis_service.settings, "jarvis_enabled", True)
    monkeypatch.setattr(
        jarvis_service.settings, "jarvis_url", "https://jarvis.example.com/jarvis/direction"
    )
    monkeypatch.setattr(jarvis_service.settings, "jarvis_api_key", "")

    with pytest.raises(RuntimeError, match="JARVIS_API_KEY"):
        jarvis_service.get_ai_technical_direction(
            message="We need to automate reporting from multiple data sources.",
        )


def test_get_ai_technical_direction_rejects_non_object_json(monkeypatch):
    _enable_real_jarvis(monkeypatch)
    response = _jarvis_response([])

    monkeypatch.setattr(
        jarvis_service.httpx, "Client", lambda timeout: FakeJarvisClient(response=response)
    )

    with pytest.raises(RuntimeError, match="invalid response"):
        jarvis_service.get_ai_technical_direction(
            message="We need to automate reporting from multiple data sources.",
        )


def test_get_ai_technical_direction_requires_direction_for_success(monkeypatch):
    _enable_real_jarvis(monkeypatch)
    response = _jarvis_response({"direction": None, "fallback": False, "error": None})

    monkeypatch.setattr(
        jarvis_service.httpx, "Client", lambda timeout: FakeJarvisClient(response=response)
    )

    with pytest.raises(RuntimeError, match="invalid response"):
        jarvis_service.get_ai_technical_direction(
            message="We need to automate reporting from multiple data sources.",
        )
