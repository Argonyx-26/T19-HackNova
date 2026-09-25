from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_full_situation_evolution_flow():
    # 1. Ingest baseline event
    resp1 = client.post("/api/events", json={
        "event_id": "test-e1",
        "source_type": "ACCESS",
        "event_type": "access_granted",
        "entity_id": "person-88",
        "location_id": "lobby",
        "severity": 0.1,
        "confidence": 0.99
    })
    assert resp1.status_code == 201

    # 2. Ingest anomaly event
    resp2 = client.post("/api/events", json={
        "event_id": "test-e2",
        "source_type": "ACCESS",
        "event_type": "access_denied",
        "entity_id": "person-88",
        "location_id": "lab-a",
        "severity": 0.55,
        "confidence": 0.98
    })
    assert resp2.status_code == 201

    # 3. Check situation creation and state
    sits_resp = client.get("/api/situations")
    assert sits_resp.status_code == 200
    situations = sits_resp.json()
    assert len(situations) >= 1
    target_sit = situations[0]
    sit_id = target_sit["situation_id"]
    assert target_sit["status"] == "ANOMALOUS"

    # 4. Ingest cross-domain escalation event
    resp3 = client.post("/api/events", json={
        "event_id": "test-e3",
        "source_type": "NETWORK",
        "event_type": "port_scan",
        "entity_id": "person-88",
        "location_id": "lab-a",
        "severity": 0.85,
        "confidence": 0.95
    })
    assert resp3.status_code == 201

    # 5. Check escalated state
    detail_resp = client.get(f"/api/situations/{sit_id}")
    assert detail_resp.status_code == 200
    assert detail_resp.json()["status"] == "ESCALATING"

    # 6. Verify timeline reconstruction
    timeline_resp = client.get(f"/api/situations/{sit_id}/timeline")
    assert timeline_resp.status_code == 200
    timeline = timeline_resp.json()
    assert len(timeline) >= 2
    assert timeline[0]["from_state"] == "NORMAL"
    assert timeline[0]["to_state"] == "ANOMALOUS"
    assert timeline[1]["from_state"] == "ANOMALOUS"
    assert timeline[1]["to_state"] == "ESCALATING"
    assert len(timeline[1]["reason"]) > 0

    # 7. Verify Graph representation
    graph_resp = client.get(f"/api/situations/{sit_id}/graph")
    assert graph_resp.status_code == 200
    graph_data = graph_resp.json()
    assert len(graph_data["nodes"]) >= 4
    assert len(graph_data["edges"]) >= 3
