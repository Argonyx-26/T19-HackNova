"""Unit Tests for Behavioral Baseline Learning and Anomaly Detection."""

import pytest
from datetime import datetime, timezone
from backend.app.services.behavioral_service import behavioral_service
from backend.app.models.event import NormalizedEvent, SourceType

def test_behavioral_baseline_seed_and_lookup():
    baseline = behavioral_service.get_baseline("person-104")
    assert baseline is not None
    assert baseline.entity_id == "person-104"
    assert baseline.cold_start is False
    assert 14 in baseline.typical_active_hours
    assert "loc-main-lobby" in baseline.typical_locations

def test_cold_start_entity_handling():
    # An entity never observed before
    unknown_event = NormalizedEvent(
        event_id="cold-evt-01",
        source_type=SourceType.ACCESS,
        event_type="badge_entry",
        timestamp=datetime.now(timezone.utc),
        entity_id="new-contractor-999",
        location_id="loc-warehouse",
        severity=0.2,
        confidence=0.9
    )
    anomaly = behavioral_service.evaluate_event(unknown_event)
    # Cold start baseline should be created automatically
    baseline = behavioral_service.get_baseline("new-contractor-999")
    assert baseline is not None
    assert baseline.cold_start is True
    # Anomaly score should be low during cold start
    assert anomaly.anomaly_score <= 0.35

def test_behavioral_off_hours_and_location_anomaly():
    # person-104 active at 03:00 AM (hour 3, typical is 8-17) at server room (not in typical locations)
    off_hours_dt = datetime(2026, 9, 25, 3, 15, 0, tzinfo=timezone.utc)
    anom_event = NormalizedEvent(
        event_id="anom-evt-01",
        source_type=SourceType.ACCESS,
        event_type="door_open",
        timestamp=off_hours_dt,
        entity_id="person-104",
        location_id="restricted-server-vault",
        severity=0.7,
        confidence=0.95
    )
    anomaly = behavioral_service.evaluate_event(anom_event)
    assert anomaly is not None
    assert anomaly.anomaly_score >= 0.50
    assert len(anomaly.contributing_factors) >= 1
    assert any("hour" in factor.lower() or "location" in factor.lower() for factor in anomaly.contributing_factors)
