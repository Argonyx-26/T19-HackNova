from datetime import datetime, timezone
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class IndicatorCategory(str, Enum):
    NETWORK_OBSERVABLE = 'NETWORK_OBSERVABLE'
    BEHAVIORAL = 'BEHAVIORAL'
    KNOWLEDGE = 'KNOWLEDGE'
    ENVIRONMENTAL = 'ENVIRONMENTAL'


class IndicatorType(str, Enum):
    IP = 'IP'
    DOMAIN = 'DOMAIN'
    URL = 'URL'
    HASH = 'HASH'
    EMAIL = 'EMAIL'
    ACCOUNT = 'ACCOUNT'
    DEVICE = 'DEVICE'
    REPEATED_FAILED_ACCESS = 'REPEATED_FAILED_ACCESS'
    CREDENTIAL_ABUSE = 'CREDENTIAL_ABUSE'
    NETWORK_SCANNING = 'NETWORK_SCANNING'
    LATERAL_MOVEMENT = 'LATERAL_MOVEMENT'
    DATA_STAGING = 'DATA_STAGING'
    EXFILTRATION_INDICATOR = 'EXFILTRATION_INDICATOR'
    UNUSUAL_MOVEMENT_PATTERN = 'UNUSUAL_MOVEMENT_PATTERN'
    MITRE_TECHNIQUE = 'MITRE_TECHNIQUE'
    TACTIC = 'TACTIC'
    THREAT_GROUP = 'THREAT_GROUP'
    CAMPAIGN = 'CAMPAIGN'
    VULNERABILITY = 'VULNERABILITY'
    KEV = 'KEV'
    ASSET_CRITICALITY = 'ASSET_CRITICALITY'
    RESTRICTED_ZONE = 'RESTRICTED_ZONE'
    BUSINESS_IMPACT = 'BUSINESS_IMPACT'
    NETWORK_SEGMENT = 'NETWORK_SEGMENT'


INDICATOR_CATEGORY_MAP: Dict[str, IndicatorCategory] = {
    'IP': IndicatorCategory.NETWORK_OBSERVABLE,
    'DOMAIN': IndicatorCategory.NETWORK_OBSERVABLE,
    'URL': IndicatorCategory.NETWORK_OBSERVABLE,
    'HASH': IndicatorCategory.NETWORK_OBSERVABLE,
    'EMAIL': IndicatorCategory.NETWORK_OBSERVABLE,
    'ACCOUNT': IndicatorCategory.NETWORK_OBSERVABLE,
    'DEVICE': IndicatorCategory.NETWORK_OBSERVABLE,
    'REPEATED_FAILED_ACCESS': IndicatorCategory.BEHAVIORAL,
    'CREDENTIAL_ABUSE': IndicatorCategory.BEHAVIORAL,
    'NETWORK_SCANNING': IndicatorCategory.BEHAVIORAL,
    'LATERAL_MOVEMENT': IndicatorCategory.BEHAVIORAL,
    'DATA_STAGING': IndicatorCategory.BEHAVIORAL,
    'EXFILTRATION_INDICATOR': IndicatorCategory.BEHAVIORAL,
    'UNUSUAL_MOVEMENT_PATTERN': IndicatorCategory.BEHAVIORAL,
    'MITRE_TECHNIQUE': IndicatorCategory.KNOWLEDGE,
    'TACTIC': IndicatorCategory.KNOWLEDGE,
    'THREAT_GROUP': IndicatorCategory.KNOWLEDGE,
    'CAMPAIGN': IndicatorCategory.KNOWLEDGE,
    'VULNERABILITY': IndicatorCategory.KNOWLEDGE,
    'KEV': IndicatorCategory.KNOWLEDGE,
    'ASSET_CRITICALITY': IndicatorCategory.ENVIRONMENTAL,
    'RESTRICTED_ZONE': IndicatorCategory.ENVIRONMENTAL,
    'BUSINESS_IMPACT': IndicatorCategory.ENVIRONMENTAL,
    'NETWORK_SEGMENT': IndicatorCategory.ENVIRONMENTAL,
}


class IndicatorConfidence(str, Enum):
    LOW = 'LOW'
    MEDIUM = 'MEDIUM'
    HIGH = 'HIGH'
    CRITICAL = 'CRITICAL'


class IntelRelevance(str, Enum):
    RELATED = 'RELATED'
    POSSIBLY_RELATED = 'POSSIBLY_RELATED'
    UNRELATED = 'UNRELATED'


class ThreatIntelligenceIndicator(BaseModel):
    indicator_id: str
    indicator_type: IndicatorType
    category: IndicatorCategory = IndicatorCategory.NETWORK_OBSERVABLE
    value: str
    threat_actor: Optional[str] = None
    campaign: Optional[str] = None
    confidence: IndicatorConfidence = IndicatorConfidence.MEDIUM
    source_reliability: str = 'A'
    context: str
    tags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None
    match_count: int = 0
    last_seen_at: Optional[datetime] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    linked_physical_behavior: Optional[str] = None
    relevance: IntelRelevance = IntelRelevance.UNRELATED

    def model_post_init(self, __context: Any) -> None:
        self.category = INDICATOR_CATEGORY_MAP.get(
            self.indicator_type.value, IndicatorCategory.NETWORK_OBSERVABLE
        )
