"""Intelligence Relevance Engine for SENTINEL-X.

Determines whether external threat intelligence is RELATED, POSSIBLY_RELATED,
or UNRELATED to local physical/cyber observations.

Design principles:
- Observable matching IOC value exactly: RELATED
- Behavior type matching TTP tactic pattern: POSSIBLY_RELATED
- No common entity/time/location context: UNRELATED
- MITRE mappings only generated for NETWORK/ACCESS events with correlated IOC
- Physical-only behaviors NEVER produce ATT&CK mappings here
"""

import logging
from typing import List, Optional, Dict, Any
from backend.app.models.event import NormalizedEvent
from backend.app.models.threat_intel import ThreatIntelligenceIndicator, IntelRelevance, IndicatorType
from backend.app.models.physical_behavior import PhysicalBehaviorEvent, PhysicalBehaviorType

logger = logging.getLogger('sentinel.intel_relevance')


# Behavior-to-TTP category mapping (NOT ATT&CK IDs — structural alignment only)
BEHAVIOR_TTP_ALIGNMENT: Dict[str, str] = {
    'LOITERING': 'RECONNAISSANCE_BEHAVIORAL',
    'TAILGATING': 'ACCESS_BYPASS',
    'FORCED_ENTRY': 'PHYSICAL_INTRUSION',
    'RESTRICTED_ZONE_ENTRY': 'PHYSICAL_INTRUSION',
    'WEAPON_LIKE_OBJECT': 'THREAT_OF_FORCE',
    'CROWD_FORMATION': 'DISTRACTION_GROUPING',
    'UNUSUAL_MOVEMENT': 'SURVEILLANCE_EVASION',
    'OBJECT_ABANDONMENT': 'DEVICE_PLACEMENT',
    'ACCESS_CAMERA_MISMATCH': 'CREDENTIAL_ANOMALY',
    'IMPOSSIBLE_MOVEMENT': 'IDENTITY_IMPERSONATION',
}

# Cyber event type to TTP category alignment
CYBER_EVENT_TTP_ALIGNMENT: Dict[str, str] = {
    'PORT_SCAN': 'RECONNAISSANCE',
    'INTERNAL_RECON': 'RECONNAISSANCE',
    'HOST_DISCOVERY': 'RECONNAISSANCE',
    'LATERAL_MOVEMENT': 'LATERAL_MOVEMENT',
    'CREDENTIAL_DUMP': 'CREDENTIAL_ACCESS',
    'DATA_EXFILTRATION': 'EXFILTRATION',
    'LARGE_EGRESS_SPIKE': 'EXFILTRATION',
    'SUSPICIOUS_TRANSFER': 'EXFILTRATION',
    'UNAUTHORIZED_LOGIN': 'INITIAL_ACCESS',
    'FAILED_AUTH_SPIKE': 'CREDENTIAL_ACCESS',
}


class IntelRelevanceEngine:
    """Classifies the relevance of external threat intelligence to local observations."""

    def classify_relevance(
        self,
        observation_event: NormalizedEvent,
        indicators: List[ThreatIntelligenceIndicator],
        physical_behavior: Optional[PhysicalBehaviorEvent] = None,
    ) -> Dict[str, Any]:
        """Compute relevance classification for an event against available indicators."""

        matched_exact: List[str] = []
        matched_structural: List[str] = []
        unmatched_ids: List[str] = []

        obs_candidates = self._extract_observation_candidates(observation_event)
        obs_event_type = observation_event.event_type.upper()
        is_cyber_event = observation_event.source_type.value in ('NETWORK', 'ACCESS')

        for ioc in indicators:
            ioc_val = ioc.value.strip()

            # Exact value match -> RELATED
            if ioc_val in obs_candidates.values():
                matched_exact.append(ioc.indicator_id)
                continue

            # Structural/TTP alignment check -> POSSIBLY_RELATED
            cyber_category = CYBER_EVENT_TTP_ALIGNMENT.get(obs_event_type)
            phys_category = None
            if physical_behavior:
                phys_category = BEHAVIOR_TTP_ALIGNMENT.get(physical_behavior.behavior_type.value)

            if cyber_category and ioc.indicator_type.value in ('MITRE_TECHNIQUE', 'TACTIC', 'CAMPAIGN'):
                matched_structural.append(ioc.indicator_id)
            elif phys_category and ioc.indicator_type.value in ('THREAT_GROUP', 'CAMPAIGN'):
                matched_structural.append(ioc.indicator_id)
            else:
                unmatched_ids.append(ioc.indicator_id)

        # Determine overall relevance
        if matched_exact:
            relevance = IntelRelevance.RELATED
            mitre_eligible = is_cyber_event  # Only cyber events can produce ATT&CK
        elif matched_structural:
            relevance = IntelRelevance.POSSIBLY_RELATED
            mitre_eligible = is_cyber_event and len(matched_exact) > 0
        else:
            relevance = IntelRelevance.UNRELATED
            mitre_eligible = False

        return {
            'relevance': relevance.value,
            'exact_ioc_matches': matched_exact,
            'structural_alignments': matched_structural,
            'unrelated_indicators': unmatched_ids,
            'mitre_mapping_eligible': mitre_eligible,
            'rationale': self._build_rationale(relevance, matched_exact, matched_structural, is_cyber_event),
            'attribution_note': (
                'Behavior matches known TTP patterns. '
                'This does not constitute attribution to any specific threat actor or group.'
            ) if relevance != IntelRelevance.UNRELATED else None,
        }

    def classify_physical_behavior_relevance(
        self,
        physical_behavior: PhysicalBehaviorEvent,
        indicators: List[ThreatIntelligenceIndicator],
    ) -> Dict[str, Any]:
        """Classify relevance for a physical behavior event.
        Physical behaviors NEVER produce ATT&CK mappings independently.
        """
        behavior_category = BEHAVIOR_TTP_ALIGNMENT.get(physical_behavior.behavior_type.value, 'UNKNOWN')

        structural_matches = []
        for ioc in indicators:
            if ioc.indicator_type.value in ('THREAT_GROUP', 'CAMPAIGN') and ioc.linked_physical_behavior == physical_behavior.behavior_type.value:
                structural_matches.append(ioc.indicator_id)

        relevance = IntelRelevance.POSSIBLY_RELATED if structural_matches else IntelRelevance.UNRELATED

        return {
            'relevance': relevance.value,
            'behavior_category': behavior_category,
            'structural_alignments': structural_matches,
            'mitre_mapping_eligible': False,  # Physical behaviors NEVER get ATT&CK IDs alone
            'rationale': f'Physical behavior {physical_behavior.behavior_type.value} classified as {behavior_category}. '
                         f'ATT&CK technique mapping requires independent cyber domain evidence.',
            'attribution_note': (
                'Physical behavior pattern is consistent with some known threat actor TTPs. '
                'Correlation is contextual only and does not identify any specific threat actor.'
            ) if relevance != IntelRelevance.UNRELATED else None,
        }

    def _extract_observation_candidates(self, event: NormalizedEvent) -> Dict[str, str]:
        candidates = {
            'entity_id': str(event.entity_id or ''),
            'location_id': str(event.location_id or ''),
        }
        if event.payload:
            for k, v in event.payload.items():
                if isinstance(v, (str, int, float)):
                    candidates[f'payload.{k}'] = str(v)
        return candidates

    def _build_rationale(
        self,
        relevance: IntelRelevance,
        exact_matches: List[str],
        structural: List[str],
        is_cyber: bool,
    ) -> str:
        if relevance == IntelRelevance.RELATED:
            return (f'{len(exact_matches)} indicator(s) exactly matched observable values in this event. '
                    f'Intelligence is directly relevant.')
        elif relevance == IntelRelevance.POSSIBLY_RELATED:
            return (f'No exact IOC match. {len(structural)} indicator(s) share structural/TTP alignment. '
                    f'Intelligence is contextually relevant but not conclusive.')
        else:
            return 'No indicators matched this observation. Intelligence is not relevant to this event.'


intel_relevance_engine = IntelRelevanceEngine()
