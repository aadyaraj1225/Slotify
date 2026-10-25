import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "running"
    assert "message" in data


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "healthy"


def test_cors_allowed_origin(client):
    # Testing preflight request from allowed origin
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "GET",
    }
    response = client.options("/", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"

    # Testing GET request with Origin header
    get_resp = client.get("/", headers={"Origin": "http://localhost:5173"})
    assert get_resp.status_code == 200
    assert get_resp.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_cors_disallowed_origin(client):
    headers = {
        "Origin": "http://malicious-website.com",
        "Access-Control-Request-Method": "GET",
    }
    response = client.options("/", headers=headers)
    # Disallowed origin should not have Access-Control-Allow-Origin header matching the disallowed origin
    assert response.headers.get("access-control-allow-origin") != "http://malicious-website.com"

    get_resp = client.get("/", headers={"Origin": "http://malicious-website.com"})
    assert get_resp.status_code == 200
    assert get_resp.headers.get("access-control-allow-origin") is None
