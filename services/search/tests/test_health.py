from fastapi.testclient import TestClient

from app.main import app, ping_elasticsearch

client = TestClient(app)


def test_health_ok_when_elasticsearch_up():
    app.dependency_overrides[ping_elasticsearch] = lambda: True
    try:
        res = client.get("/health")
    finally:
        app.dependency_overrides.clear()
    assert res.status_code == 200
    assert res.json() == {"status": "ok", "api_version": "v1", "elasticsearch": "up"}


def test_health_degraded_when_elasticsearch_down():
    app.dependency_overrides[ping_elasticsearch] = lambda: False
    try:
        res = client.get("/health")
    finally:
        app.dependency_overrides.clear()
    assert res.status_code == 503
    assert res.json()["status"] == "degraded"
