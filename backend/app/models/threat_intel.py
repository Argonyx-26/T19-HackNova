"""Domain model for Threat Intelligence Indicators."""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class IndicatorType(str, Enum):
    IP = "IP"
    DOMAIN = "DOMAIN"
    HASH = "HASH"
    URL = "URL"

class IndicatorConfidence(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ThreatIntelligenceIndicator(BaseModel):
    indicator_id: str
    indicator_type: IndicatorType
    value: str
    threat_actor: Optional[str] = None
    campaign: Optional[str] = None
    confidence: IndicatorConfidence = IndicatorConfidence.MEDIUM
    source_reliability: str = "A" # Admiralty System A-F
    context: str
    tags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None
    match_count: int = 0
    last_seen_at: Optional[datetime] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
