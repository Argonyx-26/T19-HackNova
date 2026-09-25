"""Future-State Prediction Model for SENTINEL-X.

Stores deterministic trajectory projections.
Terminology Rule: No fabricated confidence percentages; uses risk_score, risk_delta,
and explicit triggering_factors.
"""

from datetime import datetime, timezone
from typing import List, Dict, Any
from pydantic import BaseModel, Field

class FutureStatePrediction(BaseModel):
    situation_id: str = Field(..., description="Target situation identifier")
    current_state: str = Field(..., description="Current evaluated state")
    predicted_state: str = Field(..., description="Projected state if conditions continue unchecked")
    risk_score: float = Field(..., ge=0.0, le=1.0, description="Projected risk score")
    risk_delta: float = Field(..., description="Projected change in risk")
    horizon: str = Field(default="5-15 minutes", description="Estimated temporal trajectory horizon")
    triggering_factors: List[str] = Field(default_factory=list, description="Concrete factors driving projection")
    reason: str = Field(..., description="Transparent narrative justification for projection")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def to_doc(self) -> Dict[str, Any]:
        doc = self.model_dump()
        doc["created_at"] = self.created_at.isoformat()
        return doc
