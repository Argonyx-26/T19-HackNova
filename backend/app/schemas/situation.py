"""Pydantic schemas for Situation API."""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from backend.app.models.situation import SituationState

class SituationSummaryResponse(BaseModel):
    situation_id: str
    status: SituationState
    risk_score: float
    summary: str
    primary_entity_ids: List[str]
    location_ids: List[str]
    event_count: int
    started_at: datetime
    updated_at: datetime

class SituationDetailResponse(BaseModel):
    situation_id: str
    status: SituationState
    risk_score: float
    summary: str
    primary_entity_ids: List[str]
    location_ids: List[str]
    event_ids: List[str]
    started_at: datetime
    updated_at: datetime

class SituationTransitionResponse(BaseModel):
    transition_id: str
    situation_id: str
    from_state: str
    to_state: str
    trigger_event_id: str
    reason: str
    risk_delta: float
    timestamp: datetime

class SituationGraphResponse(BaseModel):
    situation_id: str
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    metrics: Dict[str, Any]
