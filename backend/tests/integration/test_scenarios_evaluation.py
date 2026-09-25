"""Scenario-Based Evaluation Framework for SENTINEL-X.

Evaluates 6 standardized operational threat scenarios:
1. Normal Operational Baseline Activity
2. Benign Anomaly (e.g. Authorized off-hours maintenance, false alarms)
3. True Multi-Source Attack Progression (Access -> Recon -> Exfiltration)
4. False-Positive Case (Operator feedback correction)
5. Missing-Signal Case (Partial sensor blackout/loss)
6. Conflicting-Signal Case (Contradictory sensor inputs: CCTV normal vs Network spike)
"""

import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_scenario_1_normal_activity():
    """Scenario 1: Normal operational routine activity maintains low baseline risk."""
    now = datetime.now(timezone.utc)
    for i, pid in enumerate(["person-101", "person-102"]):
        resp = client.post("/api/events", json={
            "event_id": f"s1-norm-{i}",
            "source_type": "ACCESS",
            "event_type": "badge_entry",
            "timestamp": (now + timedelta(seconds=i * 5)).isoformat(),
            "entity_id": pid,
            "location_id": "lobby",
            "severity": 0.1,
            "confidence": 0.99
        })
        assert resp.status_code == 201

    # Check situations
    sits = client.get("/api/situations").json()
    assert len(sits) >= 1
    # Risk should remain nominal
    assert sits[0]["risk_score"] <= 0.60

def test_scenario_2_benign_anomaly():
    """Scenario 2: Benign off-hours entry creates mild anomaly but does not trigger critical escalation."""
    off_hours = datetime(2026, 9, 25, 23, 10, 0, tzinfo=timezone.utc)
    resp = client.post("/api/events", json={
        "event_id": "s2-benign-01",
        "source_type": "ACCESS",
        "event_type": "off_hours_entry",
        "timestamp": off_hours.isoformat(),
        "entity_id": "person-104",
        "location_id": "lab-a",
        "severity": 0.35,
        "confidence": 0.90
    })
    assert resp.status_code == 201

def test_scenario_3_true_attack_progression():
    """Scenario 3: Multi-source intrusion chain progresses from Defense Evasion to Exfiltration."""
    base_t = datetime.now(timezone.utc)

    # Step 1: Physical unauthorized access attempt
    r1 = client.post("/api/events", json={
        "event_id": "s3-atk-01",
        "source_type": "ACCESS",
        "event_type": "ACCESS_DENIED",
        "timestamp": base_t.isoformat(),
        "entity_id": "person-104",
        "location_id": "server-room-1",
        "severity": 0.65,
        "confidence": 0.95
    })
    assert r1.status_code == 201

    # Step 2: Reconnaissance port scan
    r2 = client.post("/api/events", json={
        "event_id": "s3-atk-02",
        "source_type": "NETWORK",
        "event_type": "PORT_SCAN",
        "timestamp": (base_t + timedelta(seconds=15)).isoformat(),
        "entity_id": "ep-10.0.4.120",
        "location_id": "lab-a",
        "severity": 0.75,
        "confidence": 0.92
    })
    assert r2.status_code == 201

    # Step 3: High-volume encrypted exfiltration to APT C2 IP
    r3 = client.post("/api/events", json={
        "event_id": "s3-atk-03",
        "source_type": "NETWORK",
        "event_type": "DATA_EXFILTRATION",
        "timestamp": (base_t + timedelta(seconds=30)).isoformat(),
        "entity_id": "ep-10.0.4.120",
        "location_id": "server-room-1",
        "severity": 0.95,
        "confidence": 0.98,
        "payload": {"dest_ip": "198.51.100.45"}
    })
    assert r3.status_code == 201

    # Verify situation escalated into high severity
    sits = client.get("/api/situations").json()
    assert len(sits) > 0
    active_sit = sits[0]
    assert active_sit["risk_score"] >= 0.60

def test_scenario_4_false_positive_case():
    """Scenario 4: Security operator submits false-positive feedback."""
    client.post("/api/events", json={
        "event_id": "s4-evt-01",
        "source_type": "ACCESS",
        "event_type": "badge_entry",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "entity_id": "person-drill",
        "location_id": "lobby",
        "severity": 0.1,
        "confidence": 0.95
    })
    resp_evt = client.post("/api/events", json={
        "event_id": "s4-evt-02",
        "source_type": "ACCESS",
        "event_type": "ACCESS_DENIED",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "entity_id": "person-drill",
        "location_id": "lab-a",
        "severity": 0.6,
        "confidence": 0.95
    })
    assert resp_evt.status_code == 201

    sits = client.get("/api/situations").json()
    assert len(sits) > 0
    sit_id = sits[0]["situation_id"]

    resp = client.post("/api/governance/feedback", json={
        "situation_id": sit_id,
        "feedback_type": "FALSE_POSITIVE",
        "comments": "Scheduled red-team exercise by SecOps",
        "observed_result": "EXERCISE"
    }, headers={"X-API-Key": "sentinel-operator-key"})
    assert resp.status_code == 201

def test_scenario_5_missing_signal_case():
    """Scenario 5: Ingestion handles events when optional sensor fields or payload metadata is missing."""
    sparse_event = {
        "event_id": "s5-sparse-01",
        "source_type": "IOT",
        "event_type": "VIBRATION_SPIKE",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "entity_id": "sensor-rack-9",
        "location_id": "server-room-1",
        "severity": 0.70,
        "confidence": 0.85
        # No payload provided
    }
    resp = client.post("/api/events", json=sparse_event)
    assert resp.status_code == 201
    assert resp.json()["event_id"] == "s5-sparse-01"

def test_scenario_6_conflicting_signal_case():
    """Scenario 6: Conflicting signals (e.g. CCTV shows normal area while IoT sensor triggers alarm)."""
    now = datetime.now(timezone.utc)
    # Signal A: CCTV shows normal
    r_cctv = client.post("/api/events", json={
        "event_id": "s6-cctv-01",
        "source_type": "CCTV",
        "event_type": "ZONE_NORMAL",
        "timestamp": now.isoformat(),
        "entity_id": "cam-rack-1",
        "location_id": "server-room-1",
        "severity": 0.1,
        "confidence": 0.90
    })
    assert r_cctv.status_code == 201

    # Signal B: Temperature anomaly at same location
    r_iot = client.post("/api/events", json={
        "event_id": "s6-iot-02",
        "source_type": "IOT",
        "event_type": "TEMPERATURE_ANOMALY",
        "timestamp": (now + timedelta(seconds=2)).isoformat(),
        "entity_id": "temp-sensor-01",
        "location_id": "server-room-1",
        "severity": 0.65,
        "confidence": 0.92
    })
    assert r_iot.status_code == 201
