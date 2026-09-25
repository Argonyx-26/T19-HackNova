"""Domain model for Immutable Audit Logging."""

from datetime import datetime, timezone
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class AuditLog(BaseModel):
    audit_id: str
    action: str # e.g. INTERVENTION_SIMULATED, RECOMMENDATION_APPROVED, FEEDBACK_SUBMITTED, INDICATOR_ADDED
    operator_id: str
    role: str
    target_type: str # Situation, Event, Indicator, System
    target_id: str
    details: Dict[str, Any] = Field(default_factory=dict)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
