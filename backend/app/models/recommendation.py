"""Decision Support Recommendation Model for SENTINEL-X.

Compares explicitly defined counterfactual actions using transparent risk and operational-impact criteria.
The authorized human operator remains the sole and final authority.
"""

import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any
from pydantic import BaseModel, Field

class ActionComparison(BaseModel):
    action: str
    projected_state: str
    projected_risk: float
    risk_delta: float
    operational_impact: str
    summary: str

class DecisionSupportRecommendation(BaseModel):
    recommendation_id: str = Field(default_factory=lambda: f"rec-{uuid.uuid4().hex[:8]}")
    situation_id: str = Field(..., description="Target situation identifier")
    current_state: str = Field(..., description="Active situation state")
    recommended_action: str = Field(..., description="Candidate action with optimal balance")
    justification: str = Field(..., description="Explainable rationale comparing operational impact and risk")
    compared_actions: List[ActionComparison] = Field(default_factory=list)
    operator_authority_notice: str = Field(
        default="Decision Support Only: Authorized human security operator remains the sole authority for physical or network action."
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def to_doc(self) -> Dict[str, Any]:
        doc = self.model_dump()
        doc["created_at"] = self.created_at.isoformat()
        return doc
