from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_complete_end_to_end_pipeline():
    base_time = datetime.now(timezone.utc)

    # 1. Ingest baseline event
    resp = client.post("/api/events", json={
        "event_id": "e2e-001",
        "source_type": "ACCESS",
        "event_type": "access_granted",
        "timestamp": base_time.isoformat(),
        "entity_id": "person-104",
        "location_id": "lobby",
        "severity": 0.1,
        "confidence": 0.99
    })
    assert resp.status_code == 201

    # 2. Ingest anomaly event (access_denied)
    resp = client.post("/api/events", json={
        "event_id": "e2e-002",
        "source_type": "ACCESS",
        "event_type": "access_denied",
        "timestamp": (base_time + timedelta(seconds=20)).isoformat(),
        "entity_id": "person-104",
        "location_id": "lab-a",
        "severity": 0.5,
        "confidence": 0.98
    })
    assert resp.status_code == 201

    # 3. Ingest repeated attempt (SUSPICIOUS)
    resp = client.post("/api/events", json={
        "event_id": "e2e-003",
        "source_type": "ACCESS",
        "event_type": "repeated_access_attempt",
        "timestamp": (base_time + timedelta(seconds=40)).isoformat(),
        "entity_id": "person-104",
        "location_id": "lab-a",
        "severity": 0.7,
        "confidence": 0.98
    })
    assert resp.status_code == 201

    # 4. Ingest CCTV detection
    resp = client.post("/api/events", json={
        "event_id": "e2e-004",
        "source_type": "CCTV",
        "event_type": "unauthorized_presence",
        "timestamp": (base_time + timedelta(seconds=60)).isoformat(),
        "entity_id": "person-104",
        "location_id": "lab-a",
        "severity": 0.8,
        "confidence": 0.94
    })
    assert resp.status_code == 201

    # 5. Ingest Network Port Scan (ESCALATING)
    resp = client.post("/api/events", json={
        "event_id": "e2e-005",
        "source_type": "NETWORK",
        "event_type": "port_scan",
        "timestamp": (base_time + timedelta(seconds=80)).isoformat(),
        "entity_id": "ep-10.0.4.120",
        "location_id": "lab-a",
        "severity": 0.88,
        "confidence": 0.96
    })
    assert resp.status_code == 201

    # 6. Ingest Data Exfiltration Attempt (CRITICAL)
    resp = client.post("/api/events", json={
        "event_id": "e2e-006",
        "source_type": "NETWORK",
        "event_type": "data_exfiltration_attempt",
        "timestamp": (base_time + timedelta(seconds=100)).isoformat(),
        "entity_id": "ep-10.0.4.120",
        "location_id": "server-room-1",
        "severity": 0.98,
        "confidence": 0.95
    })
    assert resp.status_code == 201

    # Check situations
    sits_resp = client.get("/api/situations")
    assert sits_resp.status_code == 200
    situations = sits_resp.json()
    assert len(situations) >= 1
    active_sit = situations[0]
    sit_id = active_sit["situation_id"]
    assert active_sit["status"] == "CRITICAL"
    assert active_sit["risk_score"] >= 0.70

    # Verify Timeline Reconstruction
    timeline_resp = client.get(f"/api/situations/{sit_id}/timeline")
    assert timeline_resp.status_code == 200
    timeline = timeline_resp.json()
    assert len(timeline) >= 3
    states = [t["to_state"] for t in timeline]
    assert "ANOMALOUS" in states
    assert "CRITICAL" in states

    # Verify Graph Topology
    graph_resp = client.get(f"/api/situations/{sit_id}/graph")
    assert graph_resp.status_code == 200
    graph = graph_resp.json()
    assert graph["metrics"]["node_count"] >= 6
    assert graph["metrics"]["edge_count"] >= 6

    # Verify Predictions
    pred_resp = client.get(f"/api/situations/{sit_id}/predictions")
    assert pred_resp.status_code == 200
    pred = pred_resp.json()
    assert pred["predicted_state"] == "CRITICAL"
    assert len(pred["triggering_factors"]) >= 1

    # Verify Counterfactual Interventions Simulation
    sim_iso_resp = client.post(f"/api/situations/{sit_id}/simulate", json={"action": "ISOLATE"})
    assert sim_iso_resp.status_code == 200
    sim_iso = sim_iso_resp.json()
    assert sim_iso["action"] == "ISOLATE"
    assert sim_iso["projected_state"] == "CONTAINED"
    assert sim_iso["risk_delta"] < 0
    assert sim_iso["is_simulation_only"] is True

    # Verify Decision Support Recommendation
    rec_resp = client.get(f"/api/situations/{sit_id}/recommendation")
    assert rec_resp.status_code == 200
    rec = rec_resp.json()
    assert rec["recommended_action"] in ["ISOLATE", "LOCKDOWN"]
    assert len(rec["compared_actions"]) == 3
    assert "sole authority" in rec["operator_authority_notice"]
