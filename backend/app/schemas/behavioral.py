"""Pydantic schemas for Behavioral Baselines and Anomaly Reports."""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class BehavioralBaselineResponse(BaseModel):
    baseline_id: str
    entity_id: str
    entity_type: str
    observation_count: int
    cold_start: bool
    typical_active_hours: List[int]
    typical_locations: List[str]
    typical_endpoints: List[str]
    average_daily_events: float
    confidence_score: float
    last_updated: datetime

class BehavioralAnomalyResponse(BaseModel):
    anomaly_id: str
    entity_id: str
    baseline_id: str
    deviation_score: float
    anomaly_factors: List[str]
    trigger_event_id: str
    situation_id: Optional[str] = None
    timestamp: datetime
    is_benign: Optional[bool] = None
