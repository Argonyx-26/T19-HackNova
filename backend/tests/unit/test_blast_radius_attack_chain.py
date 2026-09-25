"""Unit Tests for Blast Radius Analysis and Attack Chain Reconstruction."""

import pytest
from datetime import datetime, timezone
from backend.app.services.situation_service import situation_service
from backend.app.services.blast_radius_service import blast_radius_service
from backend.app.services.attack_chain_service import attack_chain_service
from backend.app.models.event import NormalizedEvent, SourceType

def test_blast_radius_calculation():
    # Setup situation with an event in server room
    event = NormalizedEvent(
        event_id="evt-br-01",
        source_type=SourceType.IOT,
        event_type="RACK_TAMPERING",
        timestamp=datetime.now(timezone.utc),
        entity_id="ep-10.0.4.120",
        location_id="server-room-1",
        severity=0.9,
        confidence=0.95
    )
    sit = situation_service.correlate_and_evolve(event, [], [])
    
    br = blast_radius_service.calculate_blast_radius(sit.situation_id)
    assert br.situation_id == sit.situation_id
    assert len(br.affected_assets) >= 1
    assert br.spread_dimensions["physical_zones"] >= 0
    assert br.risk_impact_summary != ""

def test_attack_chain_reconstruction():
    sit = situation_service.get_or_create_active_situation("person-104", "lab-a")
    chain = attack_chain_service.reconstruct_chain(sit.situation_id)
    assert chain.situation_id == sit.situation_id
    assert len(chain.stages) == 8
    assert chain.total_stages == 8
    assert 0.0 <= chain.progression_percentage <= 1.0
