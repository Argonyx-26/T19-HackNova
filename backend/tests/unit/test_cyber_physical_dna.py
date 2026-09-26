"""Unit Tests for Cyber-Physical Intelligence, Threat DNA, and Intel Relevance."""

import pytest
from datetime import datetime, timezone
from backend.app.models.physical_behavior import (
    PhysicalBehaviorType,
    ZoneClassification,
    BehaviorSeverity,
    get_behavior_severity,
    PhysicalBehaviorEvent
)
from backend.app.models.threat_intel import (
    IndicatorCategory,
    IntelRelevance,
    IndicatorType,
    IndicatorConfidence,
    ThreatIntelligenceIndicator
)
from backend.app.models.threat_dna import ThreatDNA, EvidenceStrength
from backend.app.services.physical_behavior_service import physical_behavior_service
from backend.app.services.intel_relevance_service import intel_relevance_engine
from backend.app.services.threat_dna_service import threat_dna_service
from backend.app.models.event import NormalizedEvent, SourceType

def test_physical_behavior_severity_matrix():
    # Loitering in PUBLIC is LOW severity
    sev_pub = get_behavior_severity("LOITERING", "PUBLIC")
    assert sev_pub == "LOW"

    # Loitering in CRITICAL is CRITICAL severity
    sev_crit = get_behavior_severity("LOITERING", "CRITICAL")
    assert sev_crit == "CRITICAL"

    # Weapon in CONTROLLED is CRITICAL
    sev_wep = get_behavior_severity("WEAPON_LIKE_OBJECT", "CONTROLLED")
    assert sev_wep == "CRITICAL"

    # Forced entry in CONTROLLED is HIGH
    sev_forced = get_behavior_severity("FORCED_ENTRY", "CONTROLLED")
    assert sev_forced == "HIGH"

def test_physical_behavior_service_seeded_behaviors():
    behaviors = physical_behavior_service.get_behaviors()
    assert len(behaviors) >= 5

    # Check Camera 5 (Server Room Vault) behavior
    cam5_events = [b for b in behaviors if b.camera_id == "CAM-05"]
    assert len(cam5_events) >= 1
    assert cam5_events[0].behavior_type == PhysicalBehaviorType.FORCED_ENTRY
    assert cam5_events[0].zone_classification == ZoneClassification.CRITICAL
    assert cam5_events[0].severity == BehaviorSeverity.CRITICAL

def test_physical_behavior_evaluate_event():
    cctv_event = NormalizedEvent(
        event_id="evt-cctv-test-1",
        source_type=SourceType.CCTV,
        event_type="loitering_detected",
        timestamp=datetime.now(timezone.utc),
        entity_id="person-suspect-99",
        location_id="CAM-02",
        severity=0.6,
        confidence=0.85,
        payload={"camera_id": "CAM-02", "dwell_time": 45, "track_id": "TRK-900"}
    )
    detected = physical_behavior_service.evaluate_event_for_behavior(cctv_event)
    assert detected is not None
    assert detected.behavior_type == PhysicalBehaviorType.LOITERING
    assert detected.camera_id == "CAM-02"
    assert detected.zone_classification == ZoneClassification.RESTRICTED

def test_intel_relevance_classification():
    # Observable matching IOC value exactly -> RELATED
    c2_ioc = ThreatIntelligenceIndicator(
        indicator_id="ioc-test-c2",
        indicator_type=IndicatorType.IP,
        value="198.51.100.45",
        context="Known C2 Node",
        relevance=IntelRelevance.UNRELATED
    )
    
    event_with_ioc = NormalizedEvent(
        event_id="evt-net-01",
        source_type=SourceType.NETWORK,
        event_type="outbound_c2_connection",
        timestamp=datetime.now(timezone.utc),
        entity_id="workstation-05",
        location_id="datacenter",
        severity=0.9,
        confidence=0.95,
        payload={"dest_ip": "198.51.100.45"}
    )

    result = intel_relevance_engine.classify_relevance(event_with_ioc, [c2_ioc])
    assert result["relevance"] == "RELATED"
    assert "ioc-test-c2" in result["exact_ioc_matches"]
    assert result["mitre_mapping_eligible"] is True

def test_intel_relevance_physical_behavior_only_no_mitre():
    # Physical behavior alone must NEVER produce ATT&CK mappings
    phys_event = PhysicalBehaviorEvent(
        event_id="pb-001",
        behavior_type=PhysicalBehaviorType.LOITERING,
        camera_id="CAM-01",
        zone_id="ZONE-EXT-01",
        zone_classification=ZoneClassification.PUBLIC,
        severity=BehaviorSeverity.LOW,
        behavior_confidence=0.88,
        correlated_event_ids=[]
    )
    indicators = [
        ThreatIntelligenceIndicator(
            indicator_id="ioc-apt29",
            indicator_type=IndicatorType.THREAT_GROUP,
            value="APT-29 (CozyBear)",
            context="State-sponsored threat actor",
            linked_physical_behavior="LOITERING"
        )
    ]
    res = intel_relevance_engine.classify_physical_behavior_relevance(phys_event, indicators)
    assert res["mitre_mapping_eligible"] is False
    assert "ATT&CK technique mapping requires independent cyber domain evidence" in res["rationale"]

def test_threat_dna_generation_and_constraints():
    situation_id = "sit-20260925-001"
    dna = threat_dna_service.get_or_generate_for_situation(situation_id)

    assert isinstance(dna, ThreatDNA)
    assert dna.situation_id == situation_id
    assert dna.is_cyber_physical is True
    assert "PHYSICAL" in dna.domains_active
    assert "CYBER" in dna.domains_active
    assert "ACCESS" in dna.domains_active
    assert "INTELLIGENCE" in dna.domains_active

    # Attribution disclaimer is mandatory
    assert "UNCONFIRMED" in dna.intelligence_domain.attribution_note or "probabilistic" in dna.intelligence_domain.attribution_note.lower()

    # Fusion scores exist
    assert dna.fusion_scores.visual_anomaly_strength >= 0.0
    assert dna.fusion_scores.situation_confidence >= 0.0
    assert dna.fusion_scores.evidence_strength in [
        EvidenceStrength.LOW,
        EvidenceStrength.MEDIUM,
        EvidenceStrength.HIGH,
        EvidenceStrength.VERY_HIGH
    ]

    # ATT&CK mapping rule: only populated if cyber evidence is present
    if not dna.cyber_domain.has_cyber_evidence:
        assert len(dna.intelligence_domain.mitre_technique_ids) == 0
    else:
        assert len(dna.intelligence_domain.mitre_technique_ids) >= 1
