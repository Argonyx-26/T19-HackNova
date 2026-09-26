"""Threat Intelligence Service for Indicator Normalization & Event Matching."""

import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from backend.app.models.threat_intel import ThreatIntelligenceIndicator, IndicatorType, IndicatorConfidence, IntelRelevance
from backend.app.schemas.threat_intel import IndicatorCreate, IndicatorMatch
from backend.app.models.event import NormalizedEvent
from backend.app.db.mongodb import db_manager

logger = logging.getLogger('sentinel.threat_intel')

DEFAULT_INDICATORS = [
    # --- NETWORK OBSERVABLES ---
    {
        'indicator_id': 'ioc-c2-01',
        'indicator_type': IndicatorType.IP,
        'category': 'NETWORK_OBSERVABLE',
        'value': '198.51.100.45',
        'threat_actor': 'APT-29 (CozyBear)',
        'campaign': 'Operation Ghostwriter',
        'confidence': IndicatorConfidence.HIGH,
        'source_reliability': 'A',
        'context': 'Known Command and Control server hosting SSH exfiltration listener. Active in 2024-2026 campaigns.',
        'tags': ['c2', 'ssh', 'exfiltration'],
        'relevance': IntelRelevance.UNRELATED,
        'match_count': 0,
    },
    {
        'indicator_id': 'ioc-ip-scan-02',
        'indicator_type': IndicatorType.IP,
        'category': 'NETWORK_OBSERVABLE',
        'value': '10.0.4.120',
        'threat_actor': 'Insider / Compromised Endpoint',
        'campaign': 'Lateral Recon',
        'confidence': IndicatorConfidence.CRITICAL,
        'source_reliability': 'B',
        'context': 'Internal staging IP flagged for unauthorized port scanning and lateral movement across subnets.',
        'tags': ['reconnaissance', 'lateral_movement', 'internal'],
        'relevance': IntelRelevance.UNRELATED,
        'match_count': 0,
    },
    {
        'indicator_id': 'ioc-domain-01',
        'indicator_type': IndicatorType.DOMAIN,
        'category': 'NETWORK_OBSERVABLE',
        'value': 'exfil-gateway.darknet.internal',
        'threat_actor': 'Unknown Actor',
        'campaign': 'Data Theft',
        'confidence': IndicatorConfidence.HIGH,
        'source_reliability': 'B',
        'context': 'Encrypted tunnel destination detected in egress firewall logs. DGA-like pattern.',
        'tags': ['dns', 'tunnel', 'exfiltration'],
        'relevance': IntelRelevance.UNRELATED,
        'match_count': 0,
    },
    {
        'indicator_id': 'ioc-hash-mimikatz',
        'indicator_type': IndicatorType.HASH,
        'category': 'NETWORK_OBSERVABLE',
        'value': 'd41d8cd98f00b204e9800998ecf8427e',
        'threat_actor': 'Credential Dumping Toolkit',
        'campaign': 'Internal Access',
        'confidence': IndicatorConfidence.HIGH,
        'source_reliability': 'A',
        'context': 'Credential dumper executable hash identified in server memory scan.',
        'tags': ['credential_access', 'mimikatz'],
        'relevance': IntelRelevance.UNRELATED,
        'match_count': 0,
    },
    {
        'indicator_id': 'ioc-account-svc01',
        'indicator_type': IndicatorType.ACCOUNT,
        'category': 'NETWORK_OBSERVABLE',
        'value': 'svc-backup-01',
        'threat_actor': None,
        'campaign': None,
        'confidence': IndicatorConfidence.MEDIUM,
        'source_reliability': 'B',
        'context': 'Service account observed authenticating from unexpected source host outside maintenance window.',
        'tags': ['service_account', 'privilege_abuse'],
        'relevance': IntelRelevance.UNRELATED,
        'match_count': 0,
    },
    # --- BEHAVIORAL CTI ---
    {
        'indicator_id': 'ioc-beh-lm-01',
        'indicator_type': IndicatorType.LATERAL_MOVEMENT,
        'category': 'BEHAVIORAL',
        'value': 'WS-421_LATERAL_PATTERN',
        'threat_actor': None,
        'campaign': None,
        'confidence': IndicatorConfidence.HIGH,
        'source_reliability': 'A',
        'context': 'Workstation WS-421 connected to 14 unique internal hosts within 6 minutes — lateral movement pattern.',
        'tags': ['lateral_movement', 'worm_propagation'],
        'relevance': IntelRelevance.UNRELATED,
        'match_count': 0,
    },
    {
        'indicator_id': 'ioc-beh-exfil-02',
        'indicator_type': IndicatorType.EXFILTRATION_INDICATOR,
        'category': 'BEHAVIORAL',
        'value': 'LARGE_EGRESS_SSH_820MB',
        'threat_actor': None,
        'campaign': None,
        'confidence': IndicatorConfidence.CRITICAL,
        'source_reliability': 'A',
        'context': '820MB encrypted SSH transfer to external IP 198.51.100.45 outside business hours.',
        'tags': ['exfiltration', 'ssh', 'data_loss'],
        'relevance': IntelRelevance.UNRELATED,
        'match_count': 0,
    },
    {
        'indicator_id': 'ioc-beh-cred-03',
        'indicator_type': IndicatorType.REPEATED_FAILED_ACCESS,
        'category': 'BEHAVIORAL',
        'value': 'SERVER-DOOR-01_FAILED_ACCESS',
        'threat_actor': None,
        'campaign': None,
        'confidence': IndicatorConfidence.HIGH,
        'source_reliability': 'A',
        'context': 'Physical badge rejected 4 times at SERVER-DOOR-01 in 90 seconds. Potential forced entry preparation.',
        'tags': ['physical_access', 'brute_force', 'credential_denial'],
        'linked_physical_behavior': 'FORCED_ENTRY',
        'relevance': IntelRelevance.UNRELATED,
        'match_count': 0,
    },
    # --- KNOWLEDGE CTI ---
    {
        'indicator_id': 'ioc-ttp-t1078',
        'indicator_type': IndicatorType.MITRE_TECHNIQUE,
        'category': 'KNOWLEDGE',
        'value': 'T1078',
        'threat_actor': None,
        'campaign': 'Operation Ghostwriter',
        'confidence': IndicatorConfidence.HIGH,
        'source_reliability': 'A',
        'context': 'Valid Accounts: Adversaries use existing accounts to maintain access. Technique confirmed by IOC analysis.',
        'tags': ['initial_access', 'persistence', 'mitre'],
        'relevance': IntelRelevance.UNRELATED,
        'match_count': 0,
    },
    {
        'indicator_id': 'ioc-tg-apt29',
        'indicator_type': IndicatorType.THREAT_GROUP,
        'category': 'KNOWLEDGE',
        'value': 'APT-29',
        'threat_actor': 'APT-29 (CozyBear)',
        'campaign': 'Operation Ghostwriter',
        'confidence': IndicatorConfidence.MEDIUM,
        'source_reliability': 'B',
        'context': 'APT-29 attributed nation-state group known for supply-chain intrusion and long-term persistence.',
        'tags': ['nation_state', 'apt'],
        'relevance': IntelRelevance.UNRELATED,
        'match_count': 0,
    },
    # --- ENVIRONMENTAL ---
    {
        'indicator_id': 'ioc-env-restricted-zone',
        'indicator_type': IndicatorType.RESTRICTED_ZONE,
        'category': 'ENVIRONMENTAL',
        'value': 'zone-server-corridor-02',
        'threat_actor': None,
        'campaign': None,
        'confidence': IndicatorConfidence.CRITICAL,
        'source_reliability': 'A',
        'context': 'Server corridor zone classified RESTRICTED. Any unauthorized presence is a critical security event.',
        'tags': ['physical_security', 'restricted_zone'],
        'linked_physical_behavior': 'RESTRICTED_ZONE_ENTRY',
        'relevance': IntelRelevance.UNRELATED,
        'match_count': 0,
    },
]


class ThreatIntelligenceService:
    def __init__(self):
        self._seed_default_indicators()

    def _get_collection(self):
        return db_manager.get_collection('threat_intel_indicators')

    def _seed_default_indicators(self):
        col = self._get_collection()
        for ioc in DEFAULT_INDICATORS:
            existing = col.find_one({'indicator_id': ioc['indicator_id']})
            if not existing:
                d = ioc.copy()
                # Normalize enum values for storage
                if hasattr(d.get('indicator_type'), 'value'):
                    d['indicator_type'] = d['indicator_type'].value
                if hasattr(d.get('confidence'), 'value'):
                    d['confidence'] = d['confidence'].value
                if hasattr(d.get('relevance'), 'value'):
                    d['relevance'] = d['relevance'].value
                col.insert_one(d)

    def get_indicators(self, indicator_type: Optional[str] = None, category: Optional[str] = None) -> List[ThreatIntelligenceIndicator]:
        col = self._get_collection()
        if col.count_documents() == 0:
            self._seed_default_indicators()
        query = {}
        if indicator_type:
            query['indicator_type'] = indicator_type.upper()
        if category:
            query['category'] = category.upper()
        docs = col.find(query)
        result = []
        for d in docs:
            d_clean = {k: v for k, v in d.items() if k != '_id'}
            try:
                result.append(ThreatIntelligenceIndicator(**d_clean))
            except Exception as e:
                logger.warning(f'Skip ioc doc: {e}')
        return result

    def add_indicator(self, data: IndicatorCreate) -> ThreatIntelligenceIndicator:
        col = self._get_collection()
        ioc_id = f'ioc-{uuid.uuid4().hex[:8]}'
        ioc = ThreatIntelligenceIndicator(
            indicator_id=ioc_id,
            indicator_type=data.indicator_type,
            value=data.value.strip(),
            threat_actor=data.threat_actor,
            campaign=data.campaign,
            confidence=data.confidence,
            source_reliability=data.source_reliability,
            context=data.context,
            tags=data.tags,
            metadata=data.metadata,
        )
        d = ioc.model_dump()
        col.insert_one(d)
        logger.info(f'Added threat indicator {ioc_id} ({ioc.value})')
        return ioc

    def match_event(self, event: NormalizedEvent) -> List[IndicatorMatch]:
        col = self._get_collection()
        if col.count_documents() == 0:
            self._seed_default_indicators()
        matches: List[IndicatorMatch] = []
        candidates = {
            'entity_id': str(event.entity_id or ''),
            'location_id': str(event.location_id or ''),
        }
        if event.payload:
            for k, v in event.payload.items():
                if isinstance(v, (str, int, float)):
                    candidates[f'payload.{k}'] = str(v)

        for field_name, val in candidates.items():
            if not val:
                continue
            matching_iocs = col.find({'value': val})
            for ioc_doc in matching_iocs:
                col.update_one(
                    {'indicator_id': ioc_doc['indicator_id']},
                    {'$inc': {'match_count': 1}, '$set': {'last_seen_at': datetime.now(timezone.utc)}}
                )
                matches.append(
                    IndicatorMatch(
                        indicator_id=ioc_doc['indicator_id'],
                        indicator_type=ioc_doc['indicator_type'],
                        value=ioc_doc['value'],
                        threat_actor=ioc_doc.get('threat_actor'),
                        context=ioc_doc['context'],
                        matched_event_id=event.event_id,
                        matched_field=field_name,
                        confidence=ioc_doc.get('confidence', 'MEDIUM'),
                    )
                )
        return matches

    def get_relevance_for_situation(self, situation_id: str) -> Dict[str, Any]:
        from backend.app.db.mongodb import db_manager as db
        ev_col = db.get_collection('events')
        sit_col = db.get_collection('situations')
        sit_doc = sit_col.find_one({'situation_id': situation_id})
        indicators = self.get_indicators()

        all_candidates = set()
        if sit_doc:
            ev_ids = sit_doc.get('event_ids', [])[:15]
            ev_docs = list(ev_col.find({'event_id': {'$in': ev_ids}})) if ev_ids else []
            for ev_doc in ev_docs:
                all_candidates.add(str(ev_doc.get('entity_id', '')))
                all_candidates.add(str(ev_doc.get('location_id', '')))
                for v in ev_doc.get('payload', {}).values():
                    if isinstance(v, (str, int, float)):
                        all_candidates.add(str(v))
        else:
            # Default demo candidates if situation not yet stored
            all_candidates.update(['198.51.100.45', 'badssl-c2.net', 'PERSON-P42', 'WORKSTATION-SEC-01', 'CAM-02', 'CAM-05'])

        related: List[Dict[str, Any]] = []
        possibly: List[Dict[str, Any]] = []
        unrelated: List[Dict[str, Any]] = []

        for ioc in indicators:
            ioc_dict = ioc.model_dump()
            if hasattr(ioc_dict.get('category'), 'value'):
                ioc_dict['category'] = ioc_dict['category'].value
            if hasattr(ioc_dict.get('indicator_type'), 'value'):
                ioc_dict['indicator_type'] = ioc_dict['indicator_type'].value
            if hasattr(ioc_dict.get('confidence'), 'value'):
                ioc_dict['confidence'] = ioc_dict['confidence'].value

            if ioc.value in all_candidates or any(c and c in ioc.value for c in all_candidates if len(c) > 4):
                ioc_dict['relevance'] = 'RELATED'
                related.append(ioc_dict)
            elif ioc.category in ('KNOWLEDGE', 'BEHAVIORAL') or ioc.linked_physical_behavior:
                ioc_dict['relevance'] = 'POSSIBLY_RELATED'
                possibly.append(ioc_dict)
            else:
                ioc_dict['relevance'] = 'UNRELATED'
                unrelated.append(ioc_dict)

        return {
            'situation_id': situation_id,
            'indicators_assessed': len(indicators),
            'related': related,
            'possibly_related': possibly,
            'unrelated': unrelated,
            'relevance_breakdown': {
                'RELATED': related,
                'POSSIBLY_RELATED': possibly,
                'UNRELATED': unrelated,
            },
            'summary': f'{len(related)} directly matched, {len(possibly)} contextually aligned, {len(unrelated)} unrelated',
        }


threat_intel_service = ThreatIntelligenceService()
