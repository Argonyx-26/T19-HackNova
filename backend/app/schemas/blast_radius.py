"""Pydantic schemas for Blast Radius Analysis."""

from datetime import datetime
from typing import List, Dict
from pydantic import BaseModel
from backend.app.models.blast_radius import BlastRadiusAsset

class BlastRadiusResponse(BaseModel):
    situation_id: str
    direct_affected_count: int
    potential_affected_count: int
    spread_dimensions: Dict[str, int]
    high_criticality_assets: List[str]
    affected_assets: List[BlastRadiusAsset]
    risk_impact_summary: str
    calculated_at: datetime
