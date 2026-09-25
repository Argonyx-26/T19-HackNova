"""Domain model for Prediction vs Actual Outcome Validation."""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class MatchStatus(str, Enum):
    CONFIRMED_MATCH = "CONFIRMED_MATCH"
    DEVIATED = "DEVIATED"
    PENDING_OUTCOME = "PENDING_OUTCOME"
    MITIGATED_EARLY = "MITIGATED_EARLY"

class PredictionOutcome(BaseModel):
    validation_id: str
    prediction_id: str
    situation_id: str
    predicted_state: str
    actual_state: str
    lead_time_seconds: float = 0.0
    horizon_label: str
    match_status: MatchStatus = MatchStatus.PENDING_OUTCOME
    accuracy_score: Optional[float] = None
    evaluation_notes: str = ""
    evaluated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
