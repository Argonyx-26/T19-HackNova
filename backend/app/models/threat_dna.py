"""Threat DNA Model for SENTINEL-X Cyber-Physical Incident Profiling.

Every major incident receives a ThreatDNA profile that integrates
evidence across physical, access, cyber, and intelligence domains.
Replaces vague percentage scores with structured evidence chains.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class IntelRelevance(str, Enum):
    """Intelligence relevance classification.
    Observation matching a known TTP is NOT proof of a threat actor.
    """
    RELATED = "RELATED"
    POSSIBLY_RELATED = "POSSIBLY_RELATED"
    UNRELATED = "UNRELATED"


class EvidenceStrength(str, Enum):
    """Overall evidence strength for the cyber-physical situation."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    VERY_HIGH = "VERY_HIGH"


class PhysicalDomainProfile(BaseModel):
    """Physical behavior evidence domain."""
    observed_behavior: Optional[str] = None         # e.g. "RESTRICTED_ZONE_ENTRY"
    behavior_note: str = ""                          # Human description
    movement_trajectory: Optional[str] = None        # e.g. "Loiter -> Door approach -> Entry"
    zone_classification: Optional[str] = None        # PUBLIC/CONTROLLED/RESTRICTED/CRITICAL
    zone_id: Optional[str] = None
    camera_ids: List[str] = Field(default_factory=list)
    track_ids: List[str] = Field(default_factory=list)
    dwell_seconds: Optional[float] = None
    entity_count: Optional[int] = None
    behavior_confidence: float = 0.0


class AccessDomainProfile(BaseModel):
    """Access control evidence domain."""
    credential_state: Optional[str] = None           # VALID/INVALID/MISMATCH/ABSENT
    badge_event_id: Optional[str] = None
    access_point: Optional[str] = None
    auth_anomaly: bool = False
    failed_attempts: int = 0
    authorization_gap: Optional[str] = None          # e.g. "No authorization found for zone"
    access_note: str = ""


class CyberDomainProfile(BaseModel):
    """Cyber/network evidence domain."""
    endpoint_id: Optional[str] = None               # e.g. "WS-421"
    connection_target: Optional[str] = None          # IP or domain
    protocol: Optional[str] = None
    data_volume_mb: Optional[float] = None
    anomaly_type: Optional[str] = None              # PORT_SCAN, LATERAL_MOVEMENT, EXFILTRATION
    network_event_ids: List[str] = Field(default_factory=list)
    cyber_note: str = ""
    has_cyber_evidence: bool = False


class IntelligenceDomainProfile(BaseModel):
    """Threat intelligence correlation domain."""
    ioc_matches: List[str] = Field(default_factory=list)      # Matched indicator IDs
    ioc_values: List[str] = Field(default_factory=list)        # Matched observable values
    ttp_relevance: IntelRelevance = IntelRelevance.UNRELATED
    mitre_technique_ids: List[str] = Field(default_factory=list)  # Only when cyber evidence supports
    mitre_tactic: Optional[str] = None
    threat_group_mentioned: Optional[str] = None
    campaign_mentioned: Optional[str] = None
    threat_actor_attribution: str = "UNCONFIRMED"
    attribution_note: str = (
        "Observed behavior is consistent with known TTPs. "
        "This does not constitute attribution to any specific threat actor."
    )
    intel_source_ids: List[str] = Field(default_factory=list)
    intel_note: str = ""


class FusionScores(BaseModel):
    """Explainable fusion score components - never collapsed into a single percentage."""
    visual_anomaly_strength: float = Field(ge=0.0, le=1.0, default=0.0)
    behavior_confidence: float = Field(ge=0.0, le=1.0, default=0.0)
    access_anomaly_score: float = Field(ge=0.0, le=1.0, default=0.0)
    network_anomaly_score: float = Field(ge=0.0, le=1.0, default=0.0)
    asset_criticality_weight: float = Field(ge=0.0, le=1.0, default=0.0)
    intel_relevance_weight: float = Field(ge=0.0, le=1.0, default=0.0)
    correlation_confidence: float = Field(ge=0.0, le=1.0, default=0.0)
    situation_confidence: float = Field(ge=0.0, le=1.0, default=0.0)
    evidence_strength: EvidenceStrength = EvidenceStrength.LOW
    ttp_relevance: IntelRelevance = IntelRelevance.UNRELATED


class ThreatDNA(BaseModel):
    """Complete Threat DNA profile for a cyber-physical security incident.

    Integrates physical, access, cyber, and intelligence evidence domains
    into a structured, explainable profile. Replaces single-number risk scores
    with multi-dimensional evidence chains.
    """
    dna_id: str = Field(..., description="Unique Threat DNA profile ID")
    situation_id: str = Field(..., description="Associated situation ID")

    # Evidence domains
    physical_domain: PhysicalDomainProfile = Field(default_factory=PhysicalDomainProfile)
    access_domain: AccessDomainProfile = Field(default_factory=AccessDomainProfile)
    cyber_domain: CyberDomainProfile = Field(default_factory=CyberDomainProfile)
    intelligence_domain: IntelligenceDomainProfile = Field(default_factory=IntelligenceDomainProfile)

    # Scoring
    fusion_scores: FusionScores = Field(default_factory=FusionScores)

    # Evidence quality
    supporting_evidence_ids: List[str] = Field(default_factory=list)
    contradictory_evidence_ids: List[str] = Field(default_factory=list)
    missing_evidence_list: List[str] = Field(default_factory=list)

    # Narrative
    incident_summary: str = Field(default="Cyber-physical incident under analysis")
    investigation_steps: List[str] = Field(default_factory=list)

    # Metadata
    is_cyber_physical: bool = Field(default=False, description="True when both physical and cyber evidence present")
    domains_active: List[str] = Field(default_factory=list, description="Active evidence domains")
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def to_doc(self) -> Dict[str, Any]:
        doc = self.model_dump()
        doc["generated_at"] = self.generated_at.isoformat()
        return doc
