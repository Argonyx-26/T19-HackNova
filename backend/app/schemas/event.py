"""Pydantic schemas for Event API validation."""

from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field
from backend.app.models.event import SourceType

class EventCreate(BaseModel):
    event_id: Optional[str] = Field(default=None, description="Optional client event ID; generated if omitted")
    source_type: SourceType = Field(..., description="CCTV, NETWORK, ACCESS, or IOT")
    event_type: str = Field(..., description="Semantic event classification name")
    timestamp: Optional[datetime] = Field(default=None, description="ISO timestamp; defaults to current UTC")
    entity_id: str = Field(..., description="Primary entity involved")
    location_id: str = Field(..., description="Location zone")
    severity: float = Field(..., ge=0.0, le=1.0, description="Severity rating 0.0 - 1.0")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Source detection confidence 0.0 - 1.0")
    payload: Dict[str, Any] = Field(default_factory=dict, description="Arbitrary domain-specific metadata")

class NormalizedEventResponse(BaseModel):
    event_id: str
    source_type: SourceType
    event_type: str
    timestamp: datetime
    entity_id: str
    location_id: str
    severity: float
    confidence: float
    payload: Dict[str, Any]
    processed: bool
    situation_id: Optional[str] = None
