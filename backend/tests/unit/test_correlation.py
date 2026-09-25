from datetime import datetime, timezone, timedelta
from backend.app.models.event import NormalizedEvent, SourceType
from backend.app.intelligence.correlation.engine import ContextualCorrelationEngine

def test_temporal_and_spatial_correlation():
    engine = ContextualCorrelationEngine(window_seconds=120)
    base_time = datetime.now(timezone.utc)

    event_1 = NormalizedEvent(
        event_id="evt-101",
        source_type=SourceType.ACCESS,
        event_type="access_denied",
        timestamp=base_time,
        entity_id="person-104",
        location_id="lab-a",
        severity=0.5,
        confidence=0.95
    )

    event_2 = NormalizedEvent(
        event_id="evt-102",
        source_type=SourceType.CCTV,
        event_type="unauthorized_presence",
        timestamp=base_time + timedelta(seconds=45),
        entity_id="person-104",
        location_id="lab-a",
        severity=0.8,
        confidence=0.92
    )

    matches = engine.evaluate_correlation(event_1, event_2)
    assert len(matches) >= 3  # TEMPORAL, ENTITY, SPATIAL
    rel_types = {m.relationship_type for m in matches}
    assert "TEMPORAL" in rel_types
    assert "ENTITY" in rel_types
    assert "SPATIAL" in rel_types

def test_outside_window_correlation_fails():
    engine = ContextualCorrelationEngine(window_seconds=60)
    base_time = datetime.now(timezone.utc)

    event_1 = NormalizedEvent(
        event_id="evt-201",
        source_type=SourceType.ACCESS,
        event_type="access_granted",
        timestamp=base_time,
        entity_id="person-104",
        location_id="lobby",
        severity=0.1,
        confidence=0.9
    )

    event_2 = NormalizedEvent(
        event_id="evt-202",
        source_type=SourceType.ACCESS,
        event_type="access_denied",
        timestamp=base_time + timedelta(seconds=180),  # 3 minutes apart > 60s
        entity_id="person-104",
        location_id="lab-a",
        severity=0.5,
        confidence=0.9
    )

    matches = engine.evaluate_correlation(event_1, event_2)
    assert len(matches) == 0  # No temporal match
