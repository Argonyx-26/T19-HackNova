"""Domain model for MITRE ATT&CK Mappings."""

from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, Field

class ATTACKMapping(BaseModel):
    mapping_id: str
    tactic: str # e.g. Initial Access, Discovery, Lateral Movement, Exfiltration
    technique_id: str # e.g. T1078, T1046, T1048
    technique_name: str # e.g. Valid Accounts, Network Service Discovery
    subtechnique_id: Optional[str] = None
    evidence: str
    confidence: float = Field(ge=0.0, le=1.0)
    event_ids: List[str] = Field(default_factory=list)
    situation_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
