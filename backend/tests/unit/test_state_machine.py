from datetime import datetime, timezone
from backend.app.intelligence.evolution.state_machine import SituationStateMachine
from backend.app.models.situation import Situation, SituationState
from backend.app.models.event import NormalizedEvent, SourceType

def test_state_transition_normal_to_anomalous():
    sit = Situation(situation_id="sit-001", status=SituationState.NORMAL, risk_score=0.1)
    new_evt = NormalizedEvent(
        event_id="evt-1",
        source_type=SourceType.ACCESS,
        event_type="access_denied",
        timestamp=datetime.now(timezone.utc),
        entity_id="person-104",
        location_id="lab-a",
        severity=0.5,
        confidence=0.95
    )
    
    trans = SituationStateMachine.evaluate_transition(sit, new_evt, [])
    assert trans is not None
    assert trans.from_state == "NORMAL"
    assert trans.to_state == "ANOMALOUS"
    assert "access_denied" in trans.reason
    assert trans.risk_delta > 0

def test_state_transition_to_escalating():
    sit = Situation(situation_id="sit-001", status=SituationState.SUSPICIOUS, risk_score=0.5)
    past_evt = NormalizedEvent(
        event_id="evt-1",
        source_type=SourceType.ACCESS,
        event_type="access_denied",
        timestamp=datetime.now(timezone.utc),
        entity_id="person-104",
        location_id="lab-a",
        severity=0.5,
        confidence=0.95
    )
    network_evt = NormalizedEvent(
        event_id="evt-2",
        source_type=SourceType.NETWORK,
        event_type="port_scan",
        timestamp=datetime.now(timezone.utc),
        entity_id="ep-10.0.4.120",
        location_id="lab-a",
        severity=0.88,
        confidence=0.96
    )
    
    trans = SituationStateMachine.evaluate_transition(sit, network_evt, [past_evt])
    assert trans is not None
    assert trans.from_state == "SUSPICIOUS"
    assert trans.to_state == "ESCALATING"
    assert "Cross-domain" in trans.reason
