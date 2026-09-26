"""Domain models for Evidence Shadow, Contradictions, and Why-Not Decisions."""

from datetime import datetime, timezone
from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class EvidenceType(str, Enum):
    SUPPORTING = "SUPPORTING"
    CONTRADICTORY = "CONTRADICTORY"
    MISSING = "MISSING"

class EvidenceItem(BaseModel):
    evidence_id: str
    evidence_type: EvidenceType        # SUPPORTING, CONTRADICTORY, MISSING
    source_modality: str               # CCTV, ACCESS, NETWORK, IOT, AUDIO, GEO
    event_id: Optional[str] = None
    title: str
    detail: str
    confidence: float = Field(ge=0.0, le=1.0)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    location_id: Optional[str] = None
    entity_id: Optional[str] = None
    source_health_status: str = "ONLINE" # ONLINE, DEGRADED, DELAYED, STALE

class EvidenceShadow(BaseModel):
    situation_id: str
    overall_confidence: float = Field(ge=0.0, le=1.0)
    decision_model_used: str = "Hybrid-Spatiotemporal-Correlation-v2.4"
    supporting_evidence: List[EvidenceItem] = Field(default_factory=list)
    contradictory_evidence: List[EvidenceItem] = Field(default_factory=list)
    missing_evidence: List[EvidenceItem] = Field(default_factory=list)
    source_health_summary: Dict[str, str] = Field(default_factory=dict)
    calculated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WhyNotRejectionReason(str, Enum):
    ENTITY_MISMATCH = "ENTITY_MISMATCH"
    SPATIAL_DISTANCE_EXCEEDED = "SPATIAL_DISTANCE_EXCEEDED"
    TEMPORAL_WINDOW_EXCEEDED = "TEMPORAL_WINDOW_EXCEEDED"
    SOURCE_RELIABILITY_INSUFFICIENT = "SOURCE_RELIABILITY_INSUFFICIENT"
    TOPOLOGY_ISOLATION = "TOPOLOGY_ISOLATION"
    INCONSISTENT_THREAT_MODALITY = "INCONSISTENT_THREAT_MODALITY"

class WhyNotDecision(BaseModel):
    decision_id: str
    situation_id: str
    rejected_event_id: str
    rejected_event_type: str
    rejected_source: str
    reasons: List[WhyNotRejectionReason]
    explanation: str
    spatial_distance_meters: Optional[float] = None
    temporal_gap_seconds: Optional[float] = None
    threshold_limits: Dict[str, Any] = Field(default_factory=dict)
    evaluated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
