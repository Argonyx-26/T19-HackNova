from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_ingest_and_list_events():
    payload = {
        "event_id": "test-evt-101",
        "source_type": "ACCESS",
        "event_type": "access_denied",
        "entity_id": "person-999",
        "location_id": "vault-b",
        "severity": 0.75,
        "confidence": 0.99,
        "payload": {"door": "DOOR-V-02"}
    }
    
    # 1. POST /api/events
    post_resp = client.post("/api/events", json=payload)
    assert post_resp.status_code == 201
    created_data = post_resp.json()
    assert created_data["event_id"] == "test-evt-101"
    assert created_data["source_type"] == "ACCESS"
    assert created_data["entity_id"] == "person-999"

    # 2. GET /api/events/{event_id}
    get_resp = client.get("/api/events/test-evt-101")
    assert get_resp.status_code == 200
    assert get_resp.json()["event_id"] == "test-evt-101"

    # 3. GET /api/events list with filtering
    list_resp = client.get("/api/events?entity_id=person-999")
    assert list_resp.status_code == 200
    events_list = list_resp.json()
    assert len(events_list) >= 1
    assert events_list[0]["entity_id"] == "person-999"

def test_get_nonexistent_event():
    resp = client.get("/api/events/non-existent-id")
    assert resp.status_code == 404
