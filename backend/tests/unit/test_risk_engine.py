"""Unit Tests for Multi-Factor Explainable Risk Engine."""

import pytest
from datetime import datetime, timezone
from backend.app.services.risk_engine_service import risk_engine_service
from backend.app.models.situation import Situation, SituationState
from backend.app.models.event import NormalizedEvent, SourceType
from backend.app.schemas.threat_intel import IndicatorMatch
from backend.app.models.mitre_attack import ATTACKMapping

def test_explainable_risk_calculation_factors():
    situation = Situation(
        situation_id="sit-risk-test",
        status=SituationState.SUSPICIOUS,
        risk_score=0.4,
        summary="Test situation"
    )
    
    event = NormalizedEvent(
        event_id="evt-crit-01",
        source_type=SourceType.NETWORK,
        event_type="DATA_EXFILTRATION",
        timestamp=datetime.now(timezone.utc),
        entity_id="workstation-01",
        location_id="server-room-1",
        severity=0.9,
        confidence=0.95
    )

    threat_match = IndicatorMatch(
        indicator_id="ioc-01",
        indicator_type="IP",
        value="198.51.100.45",
        threat_actor="APT-29",
        context="C2 listener",
        matched_event_id="evt-crit-01",
        matched_field="payload.ip",
        confidence="HIGH"
    )

    mitre_mapping = ATTACKMapping(
        mapping_id="mitre-01",
        tactic="Exfiltration",
        technique_id="T1048",
        technique_name="Exfiltration Over Alternative Protocol",
        evidence="Observed egress SSH stream",
        confidence=0.95,
        event_ids=["evt-crit-01"],
        situation_id="sit-risk-test"
    )

    result = risk_engine_service.compute_situation_risk(
        situation=situation,
        new_event=event,
        threat_matches=[threat_match],
        mitre_mappings=[mitre_mapping],
        behavioral_anomaly_score=0.75,
        attack_chain_progression=0.60,
        high_criticality_asset_count=2
    )

    assert result.risk_score >= 0.70
    assert result.confidence >= 0.85
    assert len(result.risk_drivers) >= 4
    assert result.explanation.decision_type == "RISK_SCORE"
    assert "APT-29" in result.explanation.evidence_summary
    assert result.factor_weights["mitre_tactics"] > 0
    assert result.factor_weights["behavioral_deviation"] > 0
