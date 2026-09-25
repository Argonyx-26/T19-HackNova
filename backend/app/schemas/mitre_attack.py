"""Pydantic schemas for MITRE ATT&CK Mappings."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class ATTACKMappingResponse(BaseModel):
    mapping_id: str
    tactic: str
    technique_id: str
    technique_name: str
    subtechnique_id: Optional[str] = None
    evidence: str
    confidence: float
    event_ids: List[str]
    situation_id: Optional[str] = None
    created_at: datetime
