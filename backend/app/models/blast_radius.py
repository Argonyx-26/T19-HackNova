"""Domain model for Situational Blast Radius Analysis."""

from datetime import datetime, timezone
from typing import List, Dict, Any
from pydantic import BaseModel, Field

class BlastRadiusAsset(BaseModel):
    asset_id: str
    asset_name: str
    asset_type: str # PhysicalZone, Endpoint, Credential, Database, IoTGateway
    criticality: str # LOW, MEDIUM, HIGH, CRITICAL
    hop_distance: int
    is_direct: bool = True
    compromise_likelihood: float = Field(ge=0.0, le=1.0)
    dependency_path: List[str] = Field(default_factory=list)

class BlastRadius(BaseModel):
    situation_id: str
    direct_affected_count: int
    potential_affected_count: int
    spread_dimensions: Dict[str, int] # e.g. {"physical_zones": 2, "network_endpoints": 5, "identities": 1}
    high_criticality_assets: List[str] = Field(default_factory=list)
    affected_assets: List[BlastRadiusAsset] = Field(default_factory=list)
    risk_impact_summary: str
    calculated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
