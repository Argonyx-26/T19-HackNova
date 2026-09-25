"""Counterfactual Intervention Simulation Model for SENTINEL-X.

All interventions in this system are SIMULATION-ONLY.
They never trigger real physical locks, network switches, or infrastructure changes.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class InterventionAction(str, Enum):
    MONITOR = "MONITOR"
    ISOLATE = "ISOLATE"
    LOCKDOWN = "LOCKDOWN"

class SimulatedIntervention(BaseModel):
    situation_id: str = Field(..., description="Target situation identifier")
    action: InterventionAction = Field(..., description="Simulated what-if action choice")
    current_state: str = Field(..., description="State prior to simulated action")
    projected_state: str = Field(..., description="Simulated resultant situation state")
    projected_risk: float = Field(..., ge=0.0, le=1.0, description="Simulated resultant risk score")
    risk_delta: float = Field(..., description="Net reduction or increase in risk")
    operational_impact: str = Field(..., description="LOW, MODERATE, HIGH, NONE")
    impact_assessment: str = Field(..., description="Human-readable impact on operations and containment")
    is_simulation_only: bool = Field(default=True, description="Safety flag confirming pure simulation")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def to_doc(self) -> Dict[str, Any]:
        doc = self.model_dump()
        doc["created_at"] = self.created_at.isoformat()
        return doc
