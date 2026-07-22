from core.rate_limit import _client_key
from starlette.requests import Request


def test_client_key_uses_request_client_not_forwarded_header() -> None:
    request = Request(
        {
            "type": "http",
            "method": "GET",
            "path": "/",
            "headers": [(b"x-forwarded-for", b"203.0.113.10")],
            "client": ("198.51.100.20", 12345),
            "server": ("testserver", 80),
            "scheme": "http",
            "query_string": b"",
        }
    )

    assert _client_key(request, "contact") == "contact:198.51.100.20"
