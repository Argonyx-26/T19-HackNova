from datetime import datetime, timezone
from backend.app.intelligence.normalization.normalizer import EventNormalizer
from backend.app.models.event import SourceType
from backend.app.schemas.event import EventCreate
from backend.app.services.event_service import event_service

def test_raw_event_normalization():
    raw_payload = {
        "source_type": "cctv",
        "event_type": "unauthorized_presence",
        "entity_id": "person-104",
        "location_id": "lab-a",
        "severity": 0.85,
        "confidence": 0.94,
        "payload": {"camera_id": "cam-07", "bounding_box": [120, 45, 230, 400]}
    }
    event = EventNormalizer.normalize(raw_payload)
    assert event.source_type == SourceType.CCTV
    assert event.event_type == "unauthorized_presence"
    assert event.entity_id == "person-104"
    assert event.severity == 0.85
    assert event.confidence == 0.94
    assert event.payload["camera_id"] == "cam-07"
    assert event.processed is False

def test_severity_bounding():
    raw_payload = {
        "source_type": "network",
        "event_type": "port_scan",
        "entity_id": "ep-10.0.4.120",
        "location_id": "server-room-1",
        "severity": 2.5,  # Exceeds 1.0
        "confidence": -0.2, # Below 0.0
    }
    event = EventNormalizer.normalize(raw_payload)
    assert event.severity == 1.0
    assert event.confidence == 0.0

def test_event_ingestion_and_retrieval():
    create_req = EventCreate(
        source_type=SourceType.ACCESS,
        event_type="access_denied",
        entity_id="person-104",
        location_id="lab-a",
        severity=0.6,
        confidence=0.98,
        payload={"door": "LAB-A-03", "badge_id": "BDG-9921"}
    )
    ingested = event_service.ingest_event(create_req)
    assert ingested.event_id is not None
    
    retrieved = event_service.get_event(ingested.event_id)
    assert retrieved is not None
    assert retrieved.entity_id == "person-104"
    assert retrieved.severity == 0.6
