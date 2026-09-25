"""Pydantic schemas for Attack Chain Reconstruction."""

from datetime import datetime
from typing import List
from pydantic import BaseModel
from backend.app.models.attack_chain import AttackChainStage, AttackStageName

class AttackChainResponse(BaseModel):
    situation_id: str
    current_stage: AttackStageName
    stages_completed: int
    total_stages: int
    progression_percentage: float
    stages: List[AttackChainStage]
    created_at: datetime
    updated_at: datetime
