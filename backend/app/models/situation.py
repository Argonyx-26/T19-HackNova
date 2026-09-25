"""Situation Domain Model."""

from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class SituationState(str, Enum):
    NORMAL = "NORMAL"
    ANOMALOUS = "ANOMALOUS"
    SUSPICIOUS = "SUSPICIOUS"
    ESCALATING = "ESCALATING"
    CRITICAL = "CRITICAL"
    CONTAINED = "CONTAINED"

class Situation(BaseModel):
    situation_id: str = Field(..., description="Unique situation identifier")
    status: SituationState = Field(default=SituationState.NORMAL, description="Current situation state")
    risk_score: float = Field(default=0.1, ge=0.0, le=1.0, description="Current aggregate risk score 0.0 to 1.0")
    summary: str = Field(default="Normal operating baseline", description="Contextual narrative summary")
    primary_entity_ids: List[str] = Field(default_factory=list, description="Entities connected to this situation")
    location_ids: List[str] = Field(default_factory=list, description="Locations involved")
    event_ids: List[str] = Field(default_factory=list, description="IDs of correlated events in this situation")
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def to_doc(self) -> Dict[str, Any]:
        doc = self.model_dump()
        doc["started_at"] = self.started_at.isoformat()
        doc["updated_at"] = self.updated_at.isoformat()
        return doc
