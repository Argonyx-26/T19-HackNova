"""Domain models for Behavioral Baselines and Anomaly Detection."""

from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class BehavioralBaseline(BaseModel):
    baseline_id: str
    entity_id: str
    entity_type: str # User, Device, Location
    observation_count: int = 0
    cold_start: bool = True
    typical_active_hours: List[int] = Field(default_factory=list) # e.g. [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
    typical_locations: List[str] = Field(default_factory=list)
    typical_endpoints: List[str] = Field(default_factory=list)
    average_daily_events: float = 0.0
    confidence_score: float = 0.5
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    profile_features: Dict[str, Any] = Field(default_factory=dict)

class BehavioralAnomaly(BaseModel):
    anomaly_id: str
    entity_id: str
    baseline_id: str
    deviation_score: float = Field(ge=0.0, le=1.0)
    anomaly_factors: List[str] = Field(default_factory=list)
    trigger_event_id: str
    situation_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_benign: Optional[bool] = None

    @property
    def anomaly_score(self) -> float:
        return self.deviation_score

    @property
    def contributing_factors(self) -> List[str]:
        return self.anomaly_factors
