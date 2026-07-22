from fastapi.testclient import TestClient
from main import app


def test_local_vite_fallback_port_is_allowed() -> None:
    client = TestClient(app)

    response = client.options(
        "/backend/auth/login",
        headers={
            "Origin": "http://localhost:5174",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5174"
