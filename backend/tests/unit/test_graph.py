from datetime import datetime, timezone
from backend.app.intelligence.graph.situation_graph import SituationGraphBuilder
from backend.app.models.event import NormalizedEvent, SourceType

def test_situation_graph_construction():
    builder = SituationGraphBuilder("sit-001")
    
    evt1 = NormalizedEvent(
        event_id="evt-1",
        source_type=SourceType.ACCESS,
        event_type="access_denied",
        timestamp=datetime.now(timezone.utc),
        entity_id="person-104",
        location_id="lab-a",
        severity=0.5,
        confidence=0.95
    )
    
    evt2 = NormalizedEvent(
        event_id="evt-2",
        source_type=SourceType.NETWORK,
        event_type="port_scan",
        timestamp=datetime.now(timezone.utc),
        entity_id="ep-10.0.4.120",
        location_id="lab-a",
        severity=0.8,
        confidence=0.9
    )
    
    builder.add_event(evt1)
    builder.add_event(evt2)
    builder.add_correlation_edge("evt-1", "evt-2", "TEMPORAL")
    
    data = builder.to_json()
    assert data["situation_id"] == "sit-001"
    assert data["metrics"]["node_count"] >= 5  # Situation, 2 Events, 2 Entities, 1 Location
    assert data["metrics"]["edge_count"] >= 5
    
    node_ids = {n["id"] for n in data["nodes"]}
    assert "sit-001" in node_ids
    assert "evt-evt-1" in node_ids
    assert "ent-person-104" in node_ids
    assert "loc-lab-a" in node_ids
