"""Pydantic schemas for Prediction Outcome Validation."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from backend.app.models.prediction_validation import MatchStatus

class PredictionOutcomeCreate(BaseModel):
    prediction_id: str
    situation_id: str
    predicted_state: str
    actual_state: str
    lead_time_seconds: float = 0.0
    horizon_label: str = "5-15 minutes"

class PredictionOutcomeResponse(BaseModel):
    validation_id: str
    prediction_id: str
    situation_id: str
    predicted_state: str
    actual_state: str
    lead_time_seconds: float
    horizon_label: str
    match_status: MatchStatus
    accuracy_score: Optional[float] = None
    evaluation_notes: str
    evaluated_at: datetime

class EvaluationMetricsSummary(BaseModel):
    total_predictions: int
    evaluated_count: int
    confirmed_matches: int
    deviated_count: int
    pending_count: int
    precision: str # e.g. "100.0%" or "TO BE VALIDATED"
    recall: str
    average_lead_time_seconds: float
    status: str
