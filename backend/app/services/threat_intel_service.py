"""Threat Intelligence Service for Indicator Normalization & Event Matching."""

import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from backend.app.models.threat_intel import ThreatIntelligenceIndicator, IndicatorType, IndicatorConfidence
from backend.app.schemas.threat_intel import IndicatorCreate, IndicatorMatch
from backend.app.models.event import NormalizedEvent
from backend.app.db.mongodb import db_manager

logger = logging.getLogger("sentinel.threat_intel")

DEFAULT_INDICATORS = [
    {
        "indicator_id": "ioc-c2-01",
        "indicator_type": IndicatorType.IP,
        "value": "198.51.100.45",
        "threat_actor": "APT-29 (CozyBear)",
        "campaign": "Operation Ghostwriter",
        "confidence": IndicatorConfidence.HIGH,
        "source_reliability": "A",
        "context": "Known Command and Control server hosting SSH exfiltration listener",
        "tags": ["c2", "ssh", "exfiltration"],
        "match_count": 0
    },
    {
        "indicator_id": "ioc-ip-scan-02",
        "indicator_type": IndicatorType.IP,
        "value": "10.0.4.120",
        "threat_actor": "Insider / Compromised Endpoint",
        "campaign": "Lateral Recon",
        "confidence": IndicatorConfidence.CRITICAL,
        "source_reliability": "B",
        "context": "Internal staging IP flagged for unauthorized port scanning and lateral movement",
        "tags": ["reconnaissance", "lateral_movement", "internal"],
        "match_count": 0
    },
    {
        "indicator_id": "ioc-domain-01",
        "indicator_type": IndicatorType.DOMAIN,
        "value": "exfil-gateway.darknet.internal",
        "threat_actor": "Unknown Actor",
        "campaign": "Data Theft",
        "confidence": IndicatorConfidence.HIGH,
        "source_reliability": "B",
        "context": "Encrypted tunnel destination detected in egress firewall logs",
        "tags": ["dns", "tunnel", "exfiltration"],
        "match_count": 0
    },
    {
        "indicator_id": "ioc-hash-mimikatz",
        "indicator_type": IndicatorType.HASH,
        "value": "d41d8cd98f00b204e9800998ecf8427e",
        "threat_actor": "Credential Dumping Toolkit",
        "campaign": "Internal Access",
        "confidence": IndicatorConfidence.HIGH,
        "source_reliability": "A",
        "context": "Credential dumper executable hash identified in server memory",
        "tags": ["credential_access", "mimikatz"],
        "match_count": 0
    }
]

class ThreatIntelligenceService:
    def __init__(self):
        self._seed_default_indicators()

    def _get_collection(self):
        return db_manager.get_collection("threat_intel_indicators")

    def _seed_default_indicators(self):
        col = self._get_collection()
        for ioc in DEFAULT_INDICATORS:
            existing = col.find_one({"indicator_id": ioc["indicator_id"]})
            if not existing:
                col.insert_one(ioc.copy())

    def get_indicators(self, indicator_type: Optional[str] = None) -> List[ThreatIntelligenceIndicator]:
        col = self._get_collection()
        if col.count_documents() == 0:
            self._seed_default_indicators()
        query = {}
        if indicator_type:
            query["indicator_type"] = indicator_type.upper()
        docs = col.find(query)
        result = []
        for d in docs:
            d_clean = {k: v for k, v in d.items() if k != "_id"}
            result.append(ThreatIntelligenceIndicator(**d_clean))
        return result

    def add_indicator(self, data: IndicatorCreate) -> ThreatIntelligenceIndicator:
        col = self._get_collection()
        ioc_id = f"ioc-{uuid.uuid4().hex[:8]}"
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
            metadata=data.metadata
        )
        col.insert_one(ioc.model_dump())
        logger.info(f"Added threat indicator {ioc_id} ({ioc.value})")
        return ioc

    def match_event(self, event: NormalizedEvent) -> List[IndicatorMatch]:
        """Correlate event attributes (payload IPs, domains, hashes, entity IDs) against IOCs."""
        col = self._get_collection()
        if col.count_documents() == 0:
            self._seed_default_indicators()
        matches: List[IndicatorMatch] = []

        # Candidate strings in the event
        candidates = {
            "entity_id": str(event.entity_id or ""),
            "location_id": str(event.location_id or ""),
        }
        if event.payload:
            for k, v in event.payload.items():
                if isinstance(v, (str, int, float)):
                    candidates[f"payload.{k}"] = str(v)

        for field_name, val in candidates.items():
            if not val:
                continue
            matching_iocs = col.find({"value": val})
            for ioc_doc in matching_iocs:
                col.update_one(
                    {"indicator_id": ioc_doc["indicator_id"]},
                    {"$inc": {"match_count": 1}, "$set": {"last_seen_at": datetime.now(timezone.utc)}}
                )
                matches.append(
                    IndicatorMatch(
                        indicator_id=ioc_doc["indicator_id"],
                        indicator_type=ioc_doc["indicator_type"],
                        value=ioc_doc["value"],
                        threat_actor=ioc_doc.get("threat_actor"),
                        context=ioc_doc["context"],
                        matched_event_id=event.event_id,
                        matched_field=field_name,
                        confidence=ioc_doc.get("confidence", "MEDIUM")
                    )
                )

        return matches

threat_intel_service = ThreatIntelligenceService()
