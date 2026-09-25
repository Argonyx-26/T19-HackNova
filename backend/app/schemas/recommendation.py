"""Decision Support Response Schemas."""

from datetime import datetime
from typing import List
from pydantic import BaseModel
from backend.app.models.recommendation import ActionComparison

class DecisionSupportResponse(BaseModel):
    recommendation_id: str
    situation_id: str
    current_state: str
    recommended_action: str
    justification: str
    compared_actions: List[ActionComparison]
    operator_authority_notice: str
    created_at: datetime
