"""Unit and API integration tests for SENTINEL-X Situational Reasoning Engine."""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.topology_service import topology_service
from backend.app.services.evidence_service import evidence_service
from backend.app.services.vlm_service import vlm_service
from backend.app.services.source_health_service import source_health_service
from backend.app.services.scenario_service import scenario_service
from backend.app.services.embedding_service import embedding_service
from backend.app.models.embeddings import EmbeddingAdapterType

client = TestClient(app)

def test_topology_campus_digital_twin():
    campus = topology_service.get_site_campus()
    assert campus.name == "Silicon Valley Secure Campus Alpha"
    assert len(campus.buildings) >= 1
    tower = campus.buildings[0]
    assert "Omega Tower" in tower.name
    assert len(tower.floors) == 5
    # Verify Floor 4 and 5 zones exist
    floor4 = next(f for f in tower.floors if f.floor_number == 4)
    assert any(z.zone_id == "lab-a" for z in floor4.zones)
    assert floor4.is_compromised is True

def test_evidence_shadow_generation():
    shadow = evidence_service.get_evidence_shadow("sit-20260925-001")
    assert shadow.situation_id == "sit-20260925-001"
    assert len(shadow.supporting_evidence) >= 3
    assert len(shadow.contradictory_evidence) >= 1
    assert len(shadow.missing_evidence) >= 1
    assert shadow.overall_confidence > 0.7
    assert "CCTV" in shadow.source_health_summary

def test_why_not_decisions():
    decisions = evidence_service.get_why_not_decisions("sit-20260925-001")
    assert len(decisions) >= 2
    assert any("SPATIAL_DISTANCE_EXCEEDED" in [r.value for r in d.reasons] for d in decisions)
    assert any("ENTITY_MISMATCH" in [r.value for r in d.reasons] for d in decisions)

def test_vlm_situation_synthesis():
    synthesis = vlm_service.synthesize_situation("sit-20260925-001")
    assert synthesis.situation_id == "sit-20260925-001"
    assert synthesis.inference_type == "DETERMINISTIC_VLM_SYNTHESIS"
    assert len(synthesis.grounded_evidence_ids) >= 3
    assert len(synthesis.suggested_operator_checklist) >= 3
    assert synthesis.confidence > 0.8
    assert "Floor 4" in synthesis.executive_summary

def test_source_weather_telemetry():
    weather = source_health_service.get_weather_report()
    assert len(weather.feeds) == 6
    feed_types = [f.source_type for f in weather.feeds]
    assert "CCTV" in feed_types
    assert "AUDIO" in feed_types
    assert "ACCESS" in feed_types
    assert "NETWORK" in feed_types
    assert "IOT" in feed_types
    assert "GEO" in feed_types

def test_adversarial_signal_injections():
    # Test duplicate event injection
    res1 = scenario_service.inject_adversarial_signal("DUPLICATE_EVENT", "sit-20260925-001")
    assert res1["status"] == "DEDUPLICATED"
    assert res1["injected_type"] == "DUPLICATE_EVENT"

    # Test false location injection
    res2 = scenario_service.inject_adversarial_signal("FALSE_LOCATION", "sit-20260925-001")
    assert res2["status"] == "TOPOLOGY_FLAGGED"
    assert res2["injected_type"] == "FALSE_LOCATION"

    # Test contradictory evidence injection
    res3 = scenario_service.inject_adversarial_signal("CONTRADICTORY_EVIDENCE", "sit-20260925-001")
    assert res3["status"] == "CONTRADICTION_LOGGED"
    assert res3["injected_type"] == "CONTRADICTORY_EVIDENCE"

    # Test topology conflict injection
    res4 = scenario_service.inject_adversarial_signal("TOPOLOGY_CONFLICT", "sit-20260925-001")
    assert res4["status"] == "TOPOLOGY_FLAGGED"
    assert res4["injected_type"] == "TOPOLOGY_CONFLICT"

def test_reasoning_api_endpoints():
    # 1. Campus twin
    r1 = client.get("/api/reasoning/topology/campus")
    assert r1.status_code == 200
    assert r1.json()["name"] == "Silicon Valley Secure Campus Alpha"

    # 2. Topology conflicts
    r2 = client.get("/api/reasoning/topology/conflicts")
    assert r2.status_code == 200
    assert isinstance(r2.json(), list)

    # 3. Evidence shadow
    r3 = client.get("/api/reasoning/evidence/situations/sit-20260925-001/shadow")
    assert r3.status_code == 200
    assert "supporting_evidence" in r3.json()

    # 4. Why-not decisions
    r4 = client.get("/api/reasoning/evidence/situations/sit-20260925-001/why-not")
    assert r4.status_code == 200
    assert len(r4.json()) >= 1

    # 5. VLM reasoning
    r5 = client.get("/api/reasoning/vlm/situations/sit-20260925-001")
    assert r5.status_code == 200
    assert "executive_summary" in r5.json()

    # 6. Source weather
    r6 = client.get("/api/reasoning/source-weather")
    assert r6.status_code == 200
    assert len(r6.json()["feeds"]) == 6

    # 7. Embedding adapter
    r7 = client.get("/api/reasoning/embeddings/adapter")
    assert r7.status_code == 200
    assert r7.json()["dimension"] == 128
