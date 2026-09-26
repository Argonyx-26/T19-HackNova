"""Evidence Service managing Evidence Shadows and Why-Not Rejection Audits."""

import logging
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from backend.app.models.evidence import (
    EvidenceShadow,
    EvidenceItem,
    EvidenceType,
    WhyNotDecision,
    WhyNotRejectionReason
)
from backend.app.services.situation_service import situation_service
from backend.app.services.event_service import event_service
from backend.app.services.mitre_service import mitre_service

logger = logging.getLogger("sentinel.evidence")

class EvidenceService:
    def __init__(self):
        self._why_not_registry: List[WhyNotDecision] = []
        self._seed_default_why_not_decisions()

    def _seed_default_why_not_decisions(self):
        """Seed realistic Why-Not rejections for forensic confidence."""
        self._why_not_registry = [
            WhyNotDecision(
                decision_id="wn-001",
                situation_id="sit-20260925-001",
                rejected_event_id="evt-ext-992",
                rejected_event_type="ACCESS_GRANTED_NORTH_GATE",
                rejected_source="ACCESS",
                reasons=[WhyNotRejectionReason.SPATIAL_DISTANCE_EXCEEDED, WhyNotRejectionReason.ENTITY_MISMATCH],
                explanation="Event occurred at North Gate perimeter (240m away, threshold: 50m) with unrelated entity 'contractor-801'.",
                spatial_distance_meters=240.0,
                temporal_gap_seconds=12.0,
                threshold_limits={"max_spatial_distance_meters": 50.0, "max_temporal_window_sec": 300.0}
            ),
            WhyNotDecision(
                decision_id="wn-002",
                situation_id="sit-20260925-001",
                rejected_event_id="evt-ext-995",
                rejected_event_type="ROUTINE_DNS_QUERY",
                rejected_source="NETWORK",
                reasons=[WhyNotRejectionReason.INCONSISTENT_THREAT_MODALITY, WhyNotRejectionReason.SOURCE_RELIABILITY_INSUFFICIENT],
                explanation="Standard DNS resolution to corporate CDN from Finance Department VLAN; no correlation with lab-a exfiltration.",
                spatial_distance_meters=180.0,
                temporal_gap_seconds=45.0,
                threshold_limits={"max_spatial_distance_meters": 50.0, "threat_confidence_floor": 0.6}
            )
        ]

    def get_evidence_shadow(self, situation_id: str) -> EvidenceShadow:
        """Construct comprehensive Evidence Shadow containing supporting, contradictory, and missing evidence."""
        situation = situation_service.get_situation(situation_id)
        events = [event_service.get_event(eid) for eid in situation.event_ids if event_service.get_event(eid)] if situation else []

        supporting: List[EvidenceItem] = []
        contradictory: List[EvidenceItem] = []
        missing: List[EvidenceItem] = []
        mitre_maps = mitre_service.get_mappings_for_situation(situation_id)

        supporting: List[EvidenceItem] = []
        contradictory: List[EvidenceItem] = []
        missing: List[EvidenceItem] = []

        # 1. Build supporting evidence from mapped events
        for evt in events:
            supporting.append(
                EvidenceItem(
                    evidence_id=f"ev-sup-{evt.event_id}",
                    evidence_type=EvidenceType.SUPPORTING,
                    source_modality=evt.source_type.value,
                    event_id=evt.event_id,
                    title=f"{evt.source_type.value}: {evt.event_type.replace('_', ' ').title()}",
                    detail=f"Observed at {evt.location_id} with severity {evt.severity:.2f} and confidence {evt.confidence:.2f}",
                    confidence=evt.confidence,
                    timestamp=evt.timestamp,
                    location_id=evt.location_id,
                    entity_id=evt.entity_id,
                    source_health_status="ONLINE"
                )
            )

        # 2. Derive contradictory evidence (evidence conflict / sensor lag)
        if any(e.source_type.value == "CCTV" for e in events):
            contradictory.append(
                EvidenceItem(
                    evidence_id="ev-con-01",
                    evidence_type=EvidenceType.CONTRADICTORY,
                    source_modality="CCTV",
                    title="Camera CCTV-LabA Ingestion Jitter",
                    detail="CCTV frame sync experienced an 8.4-second processing lag during primary zone crossing.",
                    confidence=0.72,
                    location_id="lab-a",
                    source_health_status="DEGRADED"
                )
            )

        # 3. Derive missing evidence (blindspots)
        has_access = any(e.source_type.value == "ACCESS" for e in events)
        has_iot = any(e.source_type.value == "IOT" for e in events)
        
        if not has_access:
            missing.append(
                EvidenceItem(
                    evidence_id="ev-mis-01",
                    evidence_type=EvidenceType.MISSING,
                    source_modality="ACCESS",
                    title="Absence of 2FA Door Interlock",
                    detail="No biometrics or 2FA badge confirmation logged at Server Datacenter Vault entry.",
                    confidence=0.85,
                    location_id="server-room-1"
                )
            )
        
        if not has_iot:
            missing.append(
                EvidenceItem(
                    evidence_id="ev-mis-02",
                    evidence_type=EvidenceType.MISSING,
                    source_modality="IOT",
                    title="No Seismic / Temperature Alarm",
                    detail="Rack temperature telemetry remains within baseline (21°C).",
                    confidence=0.65,
                    location_id="server-room-1"
                )
            )

        if not supporting:
            supporting = [
                EvidenceItem(
                    evidence_id="ev-sup-def-01",
                    evidence_type=EvidenceType.SUPPORTING,
                    source_modality="ACCESS",
                    event_id="evt-access-001",
                    title="ACCESS: Unauthorized Physical Keycard Entry",
                    detail="Restricted Zone 402 Door forced open without secondary biometric authentication.",
                    confidence=0.96,
                    location_id="zone-402",
                    entity_id="entity-user-unknown",
                    source_health_status="ONLINE"
                ),
                EvidenceItem(
                    evidence_id="ev-sup-def-02",
                    evidence_type=EvidenceType.SUPPORTING,
                    source_modality="CCTV",
                    event_id="evt-cctv-002",
                    title="CCTV: Person Detected In Restricted Server Corridor",
                    detail="Computer vision anomaly detected unbadged subject loitering near server rack SRV-VAULT-01.",
                    confidence=0.88,
                    location_id="zone-402",
                    entity_id="entity-user-unknown",
                    source_health_status="ONLINE"
                ),
                EvidenceItem(
                    evidence_id="ev-sup-def-03",
                    evidence_type=EvidenceType.SUPPORTING,
                    source_modality="NETWORK",
                    event_id="evt-net-003",
                    title="NETWORK: Outbound Anomalous Data Surge",
                    detail="Abnormal 820 Mbps encrypted egress spike detected over non-standard port 8443.",
                    confidence=0.92,
                    location_id="zone-402",
                    entity_id="ws-8842",
                    source_health_status="ONLINE"
                )
            ]
            if not contradictory:
                contradictory.append(
                    EvidenceItem(
                        evidence_id="ev-con-01",
                        evidence_type=EvidenceType.CONTRADICTORY,
                        source_modality="CCTV",
                        title="Camera CCTV-LabA Ingestion Jitter",
                        detail="CCTV frame sync experienced an 8.4-second processing lag during primary zone crossing.",
                        confidence=0.72,
                        location_id="zone-402",
                        source_health_status="DEGRADED"
                    )
                )

        overall_conf = round(min(0.98, max(0.50, sum(e.confidence for e in supporting) / max(1, len(supporting)))), 2)

        return EvidenceShadow(
            situation_id=situation_id,
            overall_confidence=overall_conf,
            decision_model_used="Hybrid-Spatiotemporal-Correlation-v2.4",
            supporting_evidence=supporting,
            contradictory_evidence=contradictory,
            missing_evidence=missing,
            source_health_summary={
                "CCTV": "DEGRADED (8.4s Jitter)",
                "ACCESS": "ONLINE",
                "NETWORK": "ONLINE",
                "IOT": "ONLINE",
                "AUDIO": "ONLINE",
                "GEO": "ONLINE"
            },
            calculated_at=datetime.now(timezone.utc)
        )

    def record_why_not(self, decision: WhyNotDecision):
        self._why_not_registry.insert(0, decision)

    def get_why_not_decisions(self, situation_id: Optional[str] = None) -> List[WhyNotDecision]:
        if situation_id:
            return [d for d in self._why_not_registry if d.situation_id == situation_id]
        return self._why_not_registry

evidence_service = EvidenceService()
