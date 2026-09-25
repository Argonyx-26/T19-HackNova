"""Prediction API Response Schemas."""

from datetime import datetime
from typing import List
from pydantic import BaseModel

class PredictionResponse(BaseModel):
    situation_id: str
    current_state: str
    predicted_state: str
    risk_score: float
    risk_delta: float
    horizon: str
    triggering_factors: List[str]
    reason: str
    created_at: datetime
