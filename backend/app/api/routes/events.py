"""Event Ingestion and Retrieval REST API Routes."""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from backend.app.schemas.event import EventCreate, NormalizedEventResponse
from backend.app.services.event_service import event_service

router = APIRouter(prefix="/api/events", tags=["Events"])

@router.post("", response_model=NormalizedEventResponse, status_code=status.HTTP_201_CREATED)
def ingest_event(event_in: EventCreate):
    """Ingest, normalize, and store a multi-source security event."""
    try:
        normalized = event_service.ingest_event(event_in)
        
        # When correlation service is wired (M9), this hooks into process_event(normalized)
        try:
            from backend.app.services.correlation_service import correlation_service
            correlation_service.process_event(normalized)
        except ImportError:
            pass  # Pre-M9 isolation

        return NormalizedEventResponse(**normalized.model_dump())
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to ingest event: {str(e)}")

@router.get("", response_model=List[NormalizedEventResponse])
def list_events(
    limit: int = Query(50, ge=1, le=500, description="Max events to return"),
    source_type: Optional[str] = Query(None, description="Filter by source: CCTV, NETWORK, ACCESS, IOT"),
    entity_id: Optional[str] = Query(None, description="Filter by entity ID"),
    location_id: Optional[str] = Query(None, description="Filter by location ID"),
    situation_id: Optional[str] = Query(None, description="Filter by situation ID"),
):
    """Retrieve normalized historical events with optional filtering."""
    events = event_service.list_events(
        limit=limit,
        source_type=source_type,
        entity_id=entity_id,
        location_id=location_id,
        situation_id=situation_id,
    )
    return [NormalizedEventResponse(**e.model_dump()) for e in events]

@router.get("/{event_id}", response_model=NormalizedEventResponse)
def get_event(event_id: str):
    """Retrieve a single normalized event by ID."""
    event = event_service.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found")
    return NormalizedEventResponse(**event.model_dump())
