"""Unit Tests for MITRE ATT&CK Deterministic Mapping Service."""

import pytest
from datetime import datetime, timezone
from backend.app.services.mitre_service import mitre_service
from backend.app.models.event import NormalizedEvent, SourceType

def test_mitre_mapping_defense_evasion():
    event = NormalizedEvent(
        event_id="evt-denied-01",
        source_type=SourceType.ACCESS,
        event_type="ACCESS_DENIED",
        timestamp=datetime.now(timezone.utc),
        entity_id="person-104",
        location_id="server-room-1",
        severity=0.6,
        confidence=0.9
    )
    mapping = mitre_service.map_event(event, situation_id="sit-test-01")
    assert mapping is not None
    assert mapping.technique_id == "T1562"
    assert mapping.tactic == "Defense Evasion"
    assert "access control bypass" in mapping.technique_name.lower() or "impair defenses" in mapping.technique_name.lower()
    assert mapping.situation_id == "sit-test-01"

def test_mitre_mapping_discovery():
    event = NormalizedEvent(
        event_id="evt-scan-01",
        source_type=SourceType.NETWORK,
        event_type="PORT_SCAN",
        timestamp=datetime.now(timezone.utc),
        entity_id="ep-10.0.4.120",
        location_id="lab-a",
        severity=0.7,
        confidence=0.92
    )
    mapping = mitre_service.map_event(event)
    assert mapping is not None
    assert mapping.technique_id == "T1046"
    assert mapping.tactic == "Discovery"
    assert "network service discovery" in mapping.technique_name.lower()

def test_mitre_mapping_exfiltration():
    event = NormalizedEvent(
        event_id="evt-exfil-01",
        source_type=SourceType.NETWORK,
        event_type="DATA_EXFILTRATION",
        timestamp=datetime.now(timezone.utc),
        entity_id="ep-10.0.4.120",
        location_id="datacenter",
        severity=0.95,
        confidence=0.95
    )
    mapping = mitre_service.map_event(event)
    assert mapping is not None
    assert mapping.technique_id == "T1048"
    assert mapping.tactic == "Exfiltration"

def test_mitre_unmapped_benign_event():
    event = NormalizedEvent(
        event_id="evt-benign-02",
        source_type=SourceType.ACCESS,
        event_type="NORMAL_HEARTBEAT",
        timestamp=datetime.now(timezone.utc),
        entity_id="sensor-01",
        location_id="lobby",
        severity=0.05,
        confidence=0.99
    )
    mapping = mitre_service.map_event(event)
    assert mapping is None
