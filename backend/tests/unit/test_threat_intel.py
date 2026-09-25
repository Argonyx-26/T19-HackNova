"""Unit Tests for Threat Intelligence Service and IOC Matching."""

import pytest
from datetime import datetime, timezone
from backend.app.services.threat_intel_service import threat_intel_service
from backend.app.schemas.threat_intel import IndicatorCreate
from backend.app.models.threat_intel import IndicatorType, IndicatorConfidence
from backend.app.models.event import NormalizedEvent, SourceType

def test_threat_intel_seed_and_retrieval():
    indicators = threat_intel_service.get_indicators()
    assert len(indicators) >= 4
    
    # Check default APT-29 C2 IP is present
    c2_iocs = [ioc for ioc in indicators if ioc.value == "198.51.100.45"]
    assert len(c2_iocs) == 1
    assert c2_iocs[0].threat_actor == "APT-29 (CozyBear)"
    assert c2_iocs[0].confidence == IndicatorConfidence.HIGH

def test_add_threat_indicator():
    new_ioc = IndicatorCreate(
        indicator_type=IndicatorType.IP,
        value="203.0.113.88",
        threat_actor="Test Threat Group",
        campaign="Campaign Alpha",
        confidence=IndicatorConfidence.HIGH,
        source_reliability="B",
        context="Malicious proxy node",
        tags=["proxy", "test"]
    )
    saved = threat_intel_service.add_indicator(new_ioc)
    assert saved.indicator_id.startswith("ioc-")
    assert saved.value == "203.0.113.88"

def test_threat_intel_event_matching():
    # Event with IOC in payload
    event = NormalizedEvent(
        event_id="test-ioc-evt-01",
        source_type=SourceType.NETWORK,
        event_type="suspicious_outbound_connection",
        timestamp=datetime.now(timezone.utc),
        entity_id="workstation-44",
        location_id="datacenter",
        severity=0.8,
        confidence=0.9,
        payload={"dest_ip": "198.51.100.45"}
    )
    matches = threat_intel_service.match_event(event)
    assert len(matches) >= 1
    assert matches[0].value == "198.51.100.45"
    assert matches[0].threat_actor == "APT-29 (CozyBear)"
    assert matches[0].matched_field == "payload.dest_ip"

def test_threat_intel_no_match_on_benign_event():
    benign_event = NormalizedEvent(
        event_id="benign-evt-01",
        source_type=SourceType.ACCESS,
        event_type="badge_entry",
        timestamp=datetime.now(timezone.utc),
        entity_id="person-clean",
        location_id="lobby",
        severity=0.1,
        confidence=0.95,
        payload={"dest_ip": "10.0.0.1"}
    )
    matches = threat_intel_service.match_event(benign_event)
    assert len(matches) == 0
