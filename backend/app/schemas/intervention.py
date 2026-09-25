"""Schemas for Counterfactual Simulation API."""

from datetime import datetime
from pydantic import BaseModel, Field
from backend.app.models.intervention import InterventionAction

class SimulationRequest(BaseModel):
    action: InterventionAction = Field(..., description="Action to simulate: MONITOR, ISOLATE, or LOCKDOWN")

class SimulationResponse(BaseModel):
    situation_id: str
    action: InterventionAction
    current_state: str
    projected_state: str
    projected_risk: float
    risk_delta: float
    operational_impact: str
    impact_assessment: str
    is_simulation_only: bool
    created_at: datetime
