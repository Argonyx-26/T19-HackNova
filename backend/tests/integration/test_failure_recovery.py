"""Failure Recovery, Fault Tolerance, and Edge Case Resilience Tests."""

import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_missing_mandatory_fields_rejection():
    # Missing event_type and source_type
    bad_payload = {
        "event_id": "fail-01",
        "entity_id": "person-1"
    }
    resp = client.post("/api/events", json=bad_payload)
    assert resp.status_code == 422 # Unprocessable Entity

def test_invalid_source_type():
    bad_source = {
        "event_id": "fail-02",
        "source_type": "QUANTUM_TELEPATHY", # Invalid enum
        "event_type": "test_alert",
        "entity_id": "person-1",
        "location_id": "lobby",
        "severity": 0.5,
        "confidence": 0.8
    }
    resp = client.post("/api/events", json=bad_source)
    assert resp.status_code == 422

def test_duplicate_event_ingestion_handling():
    evt = {
        "event_id": "dup-test-01",
        "source_type": "ACCESS",
        "event_type": "badge_tap",
        "entity_id": "person-99",
        "location_id": "lobby",
        "severity": 0.1,
        "confidence": 0.99
    }
    r1 = client.post("/api/events", json=evt)
    assert r1.status_code == 201

    # Ingesting same event_id again should be safely handled or rejected without crash
    r2 = client.post("/api/events", json=evt)
    assert r2.status_code in [201, 400]

def test_out_of_order_event_timestamps():
    # Event with historical timestamp in the past
    old_time = datetime(2025, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
    old_evt = {
        "event_id": "past-order-01",
        "source_type": "NETWORK",
        "event_type": "delayed_syslog",
        "timestamp": old_time.isoformat(),
        "entity_id": "router-01",
        "location_id": "datacenter",
        "severity": 0.2,
        "confidence": 0.90
    }
    resp = client.post("/api/events", json=old_evt)
    assert resp.status_code == 201

def test_event_burst_resilience():
    now = datetime.now(timezone.utc)
    # Burst 20 events consecutively
    for i in range(20):
        r = client.post("/api/events", json={
            "event_id": f"burst-evt-{i}",
            "source_type": "NETWORK" if i % 2 == 0 else "ACCESS",
            "event_type": "network_traffic" if i % 2 == 0 else "door_sensor",
            "timestamp": (now + timedelta(milliseconds=i * 50)).isoformat(),
            "entity_id": f"entity-{i % 4}",
            "location_id": "lab-a",
            "severity": 0.2,
            "confidence": 0.9
        })
        assert r.status_code == 201
