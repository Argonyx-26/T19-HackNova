from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_get_physical_behaviors():
    resp = client.get("/api/intelligence/physical-behaviors")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 5
    first = data[0]
    assert "behavior_type" in first
    assert "camera_id" in first
    assert "zone_classification" in first
    assert "severity" in first

def test_get_security_zones():
    resp = client.get("/api/intelligence/security-zones")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 5
    cam_ids = [z["camera_id"] for z in data]
    assert "CAM-01" in cam_ids
    assert "CAM-05" in cam_ids

def test_get_threat_intel_indicators_with_filters():
    # All
    resp = client.get("/api/intelligence/threat-intel/indicators")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 5

    # Filter by category
    resp_cat = client.get("/api/intelligence/threat-intel/indicators?category=NETWORK_OBSERVABLE")
    assert resp_cat.status_code == 200
    cat_data = resp_cat.json()
    assert all(ioc["category"] == "NETWORK_OBSERVABLE" for ioc in cat_data)

def test_get_threat_intel_relevance_for_situation():
    resp = client.get("/api/intelligence/threat-intel/relevance/sit-20260925-001")
    assert resp.status_code == 200
    data = resp.json()
    assert "situation_id" in data
    assert "related" in data
    assert "possibly_related" in data
    assert "unrelated" in data
    assert len(data["related"]) >= 1

def test_get_threat_dna_for_situation():
    resp = client.get("/api/reasoning/situations/sit-20260925-001/threat-dna")
    assert resp.status_code == 200
    data = resp.json()
    assert data["situation_id"] == "sit-20260925-001"
    assert "physical_domain" in data
    assert "access_domain" in data
    assert "cyber_domain" in data
    assert "intelligence_domain" in data
    assert "fusion_scores" in data
    assert data["is_cyber_physical"] is True
    # Verify attribution disclaimer exists
    assert "attribution_note" in data["intelligence_domain"]

def test_get_cyber_physical_fusion_score():
    resp = client.get("/api/intelligence/cyber-physical/fusion-score/sit-20260925-001")
    assert resp.status_code == 200
    data = resp.json()
    assert data["situation_id"] == "sit-20260925-001"
    assert data["is_cyber_physical"] is True
    assert "fusion_scores" in data
    assert "evidence_strength" in data
