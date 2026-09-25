"""Domain model for Multi-Stage Attack Chain Reconstruction."""

from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class AttackStageName(str, Enum):
    INITIAL_ACCESS = "INITIAL_ACCESS"
    EXECUTION = "EXECUTION"
    PERSISTENCE = "PERSISTENCE"
    DEFENSE_EVASION = "DEFENSE_EVASION"
    DISCOVERY = "DISCOVERY"
    LATERAL_MOVEMENT = "LATERAL_MOVEMENT"
    COLLECTION = "COLLECTION"
    EXFILTRATION = "EXFILTRATION"
    IMPACT = "IMPACT"

class AttackChainStage(BaseModel):
    stage: AttackStageName
    stage_order: int
    detected: bool = False
    first_seen_at: Optional[datetime] = None
    last_seen_at: Optional[datetime] = None
    event_ids: List[str] = Field(default_factory=list)
    technique_ids: List[str] = Field(default_factory=list)
    evidence: str = ""

class AttackChain(BaseModel):
    situation_id: str
    current_stage: AttackStageName
    stages_completed: int
    total_stages: int = 9
    progression_percentage: float = 0.0
    stages: List[AttackChainStage] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
