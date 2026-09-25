"""Situation Transition Model.

Stores the immutable, historical state evolution audit trail.
Enables full reconstruction of the situation timeline in the UI.
NO TTL indexes are ever placed on this collection.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field

class SituationTransition(BaseModel):
    transition_id: str = Field(default_factory=lambda: f"trans-{uuid.uuid4().hex[:8]}", description="Unique transition record ID")
    situation_id: str = Field(..., description="Target situation identifier")
    from_state: str = Field(..., description="Previous situation state")
    to_state: str = Field(..., description="New situation state")
    trigger_event_id: str = Field(..., description="Event ID that triggered this state evolution")
    reason: str = Field(..., description="Deterministic, explainable rationale for the transition")
    risk_delta: float = Field(..., description="Change in aggregate risk score caused by transition")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Occurrence timestamp")

    def to_doc(self):
        doc = self.model_dump()
        doc["timestamp"] = self.timestamp.isoformat()
        return doc
