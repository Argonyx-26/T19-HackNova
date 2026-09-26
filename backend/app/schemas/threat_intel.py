"""Pydantic schemas for Threat Intelligence API."""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from backend.app.models.threat_intel import IndicatorType, IndicatorConfidence

class IndicatorCreate(BaseModel):
    indicator_type: IndicatorType
    value: str
    threat_actor: Optional[str] = None
    campaign: Optional[str] = None
    confidence: IndicatorConfidence = IndicatorConfidence.MEDIUM
    source_reliability: str = "A"
    context: str
    tags: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class IndicatorResponse(BaseModel):
    indicator_id: str
    indicator_type: IndicatorType
    category: str = "NETWORK_OBSERVABLE"
    value: str
    threat_actor: Optional[str] = None
    campaign: Optional[str] = None
    confidence: IndicatorConfidence
    source_reliability: str
    context: str
    tags: List[str]
    match_count: int
    last_seen_at: Optional[datetime] = None
    created_at: datetime
    relevance: str = "UNRELATED"
    linked_physical_behavior: Optional[str] = None

class IndicatorMatch(BaseModel):
    indicator_id: str
    indicator_type: str
    value: str
    threat_actor: Optional[str]
    context: str
    matched_event_id: str
    matched_field: str
    confidence: str
