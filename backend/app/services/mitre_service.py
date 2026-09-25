"""MITRE ATT&CK Mapping Service for Explainable Threat Classification."""

import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from backend.app.models.mitre_attack import ATTACKMapping
from backend.app.models.event import NormalizedEvent
from backend.app.db.mongodb import db_manager

logger = logging.getLogger("sentinel.mitre")

# Deterministic evidence-based rule criteria
ATTACK_RULES = [
    {
        "event_types": ["UNAUTHORIZED_LOGIN", "OFF_HOURS_ACCESS", "FAILED_AUTH_SPIKE"],
        "tactic": "Initial Access",
        "technique_id": "T1078",
        "technique_name": "Valid Accounts",
        "evidence_template": "Anomalous authentication or credential utilization detected outside baseline hours.",
        "confidence": 0.85
    },
    {
        "event_types": ["PORT_SCAN", "INTERNAL_RECON", "HOST_DISCOVERY"],
        "tactic": "Discovery",
        "technique_id": "T1046",
        "technique_name": "Network Service Discovery",
        "evidence_template": "Sequential port probing and internal subnet enumeration observed across hosts.",
        "confidence": 0.90
    },
    {
        "event_types": ["UNAUTHORIZED_PRESENCE", "CCTV_INTRUSION", "ZONE_BREACH"],
        "tactic": "Physical Access",
        "technique_id": "T1078.004",
        "technique_name": "Physical Security Perimeter Breach",
        "evidence_template": "CCTV visual confirmation of unauthorized human presence in restricted zone.",
        "confidence": 0.95
    },
    {
        "event_types": ["ACCESS_DENIED", "REPEATED_ACCESS_ATTEMPT", "BADGE_DENIED"],
        "tactic": "Defense Evasion",
        "technique_id": "T1562",
        "technique_name": "Impair Defenses / Physical Access Control Bypass",
        "evidence_template": "Repeated badge access denials at secure biometric doors indicating brute-force entry attempt.",
        "confidence": 0.88
    },
    {
        "event_types": ["DATA_EXFILTRATION", "LARGE_EGRESS_SPIKE", "SUSPICIOUS_TRANSFER"],
        "tactic": "Exfiltration",
        "technique_id": "T1048",
        "technique_name": "Exfiltration Over Alternative Protocol",
        "evidence_template": "High-volume encrypted SSH transfer to external unapproved IP address.",
        "confidence": 0.92
    },
    {
        "event_types": ["VIBRATION_SPIKE", "TEMPERATURE_ANOMALY", "RACK_TAMPERING"],
        "tactic": "Impact",
        "technique_id": "T1565",
        "technique_name": "Data or System Manipulation via Physical Access",
        "evidence_template": "Physical environmental sensor telemetry shows active server rack manipulation.",
        "confidence": 0.82
    }
]

class MitreAttackService:
    def _get_collection(self):
        return db_manager.get_collection("attack_mappings")

    def map_event(self, event: NormalizedEvent, situation_id: Optional[str] = None) -> Optional[ATTACKMapping]:
        """Apply deterministic rule criteria to map event into MITRE ATT&CK framework."""
        col = self._get_collection()
        evt_type = event.event_type.upper()

        for rule in ATTACK_RULES:
            if evt_type in rule["event_types"] or any(t in evt_type for t in rule["event_types"]):
                mapping_id = f"mitre-{uuid.uuid4().hex[:8]}"
                mapping = ATTACKMapping(
                    mapping_id=mapping_id,
                    tactic=rule["tactic"],
                    technique_id=rule["technique_id"],
                    technique_name=rule["technique_name"],
                    evidence=f"{rule['evidence_template']} (Event: {event.event_id}, Source: {event.source_type})",
                    confidence=rule["confidence"],
                    event_ids=[event.event_id],
                    situation_id=situation_id or event.situation_id
                )
                col.insert_one(mapping.model_dump())
                logger.info(f"Mapped event {event.event_id} to ATT&CK {rule['technique_id']} ({rule['tactic']})")
                return mapping
        return None

    def get_mappings_for_situation(self, situation_id: str) -> List[ATTACKMapping]:
        col = self._get_collection()
        docs = col.find({"situation_id": situation_id})
        result = []
        for d in docs:
            d_clean = {k: v for k, v in d.items() if k != "_id"}
            result.append(ATTACKMapping(**d_clean))
        return result

    def get_all_mappings(self, limit: int = 50) -> List[ATTACKMapping]:
        col = self._get_collection()
        docs = col.find({}).sort("created_at", -1).limit(limit)
        result = []
        for d in docs:
            d_clean = {k: v for k, v in d.items() if k != "_id"}
            result.append(ATTACKMapping(**d_clean))
        return result

mitre_service = MitreAttackService()
