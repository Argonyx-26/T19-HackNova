"""Standardized schema for Explainable Decisions, Predictions, and Risk."""

from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ExplainabilityRecord(BaseModel):
    decision_type: str # PREDICTION, RISK_SCORE, RECOMMENDATION, ATTACK_CHAIN, MITRE_MAPPING
    target_id: str
    reason: str
    evidence_summary: str
    contributing_event_ids: List[str] = Field(default_factory=list)
    contributing_entity_ids: List[str] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0)
    rule_or_model: str
    factors: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
