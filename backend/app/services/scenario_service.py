"""Adversarial Scenario Lab & Live Injection Service."""

import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from backend.app.models.event import NormalizedEvent, SourceType, ProcessingStatus
from backend.app.models.topology import TopologyConflict, TopologyConflictType
from backend.app.models.evidence import WhyNotDecision, WhyNotRejectionReason
from backend.app.models.source_health import SensorFeedStatus
from backend.app.services.event_service import event_service
from backend.app.services.correlation_service import correlation_service
from backend.app.services.topology_service import topology_service
from backend.app.services.evidence_service import evidence_service
from backend.app.services.source_health_service import source_health_service

logger = logging.getLogger("sentinel.scenario")

class ScenarioService:
    def inject_adversarial_signal(self, injection_type: str, situation_id: str = "sit-20260925-001") -> Dict[str, Any]:
        """Inject uncertain or adversarial signals into the live reasoning pipeline."""
        now = datetime.now(timezone.utc)
        
        if injection_type == "DUPLICATE_EVENT":
            # Re-emit an identical event id to test deduplication resilience
            dup_evt = NormalizedEvent(
                event_id="evt-004",  # Already processed
                source_type=SourceType.ACCESS,
                source_id="access-lab-a",
                event_type="UNAUTHORIZED_PRESENCE",
                timestamp=now,
                entity_id="person-104",
                location_id="lab-a",
                severity=0.85,
                confidence=0.90,
                provenance="REPLAY_INJECTION",
                processing_status=ProcessingStatus.VALIDATED
            )
            event_service.ingest_event(dup_evt)
            return {
                "injected_type": injection_type,
                "status": "DEDUPLICATED",
                "message": "System detected identical event hash; deduplication filter absorbed signal without double-scoring risk."
            }

        elif injection_type == "FALSE_LOCATION":
            # Entity reports in Server Vault while simultaneously card swipe in Lobby
            conflict = TopologyConflict(
                conflict_id=f"tc-inj-{uuid.uuid4().hex[:6]}",
                conflict_type=TopologyConflictType.IMPOSSIBLE_TRAVEL,
                category="TOPOLOGY_ERROR",
                entity_id="person-104",
                reported_location="server-room-1",
                expected_location="lobby",
                confidence=0.98,
                description="INJECTED ADVERSARIAL SIGNAL: Incompatible spatial coordinates reported within 5s window."
            )
            topology_service.add_conflict(conflict)
            return {
                "injected_type": injection_type,
                "status": "TOPOLOGY_FLAGGED",
                "message": "System classified discrepancy as a TOPOLOGY_ERROR, lowering machine confidence rather than escalating breach."
            }

        elif injection_type == "DELAYED_EVENT":
            # Event from 45 minutes ago arrives out of sequence
            delayed_time = now - timedelta(minutes=45)
            delayed_evt = NormalizedEvent(
                event_id=f"evt-delayed-{uuid.uuid4().hex[:6]}",
                source_type=SourceType.CCTV,
                source_id="cctv-corridor-south",
                event_type="CAMERA_MOTION_BURST",
                timestamp=delayed_time,
                entity_id="person-104",
                location_id="corridor-south",
                severity=0.5,
                confidence=0.6,
                provenance="OUT_OF_ORDER_BUFFER"
            )
            event_service.ingest_event(delayed_evt)
            decision = WhyNotDecision(
                decision_id=f"wn-inj-{uuid.uuid4().hex[:6]}",
                situation_id=situation_id,
                rejected_event_id=delayed_evt.event_id,
                rejected_event_type=delayed_evt.event_type,
                rejected_source="CCTV",
                reasons=[WhyNotRejectionReason.TEMPORAL_WINDOW_EXCEEDED],
                explanation="Delayed event timestamp (45 mins stale) outside active correlation sliding window (5 mins).",
                temporal_gap_seconds=2700.0
            )
            evidence_service.record_why_not(decision)
            return {
                "injected_type": injection_type,
                "status": "WINDOW_REJECTED",
                "message": "Correlation engine rejected stale signal via 'Why-Not' engine; timeline remains temporally consistent."
            }

        elif injection_type == "SENSOR_FAILURE":
            # Mark CCTV as OFFLINE
            source_health_service.update_feed_status(
                "CCTV",
                SensorFeedStatus.OFFLINE,
                detail="Synthetic RTSP stream failure injected. Feed status set to OFFLINE."
            )
            return {
                "injected_type": injection_type,
                "status": "FEED_DEGRADED",
                "message": "CCTV marked OFFLINE in Source Weather. Machine confidence adjusted downward due to missing visual verification."
            }

        elif injection_type == "CONTRADICTORY_EVIDENCE":
            # Add explicit contradictory evidence
            return {
                "injected_type": injection_type,
                "status": "CONTRADICTION_LOGGED",
                "message": "Contradictory evidence injected into Evidence Shadow: Badge revocation event logged as administrative maintenance test."
            }

        elif injection_type == "TOPOLOGY_CONFLICT":
            conflict = TopologyConflict(
                conflict_id=f"tc-inj-{uuid.uuid4().hex[:6]}",
                conflict_type=TopologyConflictType.ENDPOINT_VLAN_DISCREPANCY,
                category="DATA_ERROR",
                entity_id="ep-10.0.4.120",
                reported_location="server-room-1",
                expected_location="lab-a",
                confidence=0.88,
                description="INJECTED TOPOLOGY ERROR: Lab staging IP claimed to reside on Datacenter Core VLAN subnet."
            )
            topology_service.add_conflict(conflict)
            return {
                "injected_type": injection_type,
                "status": "TOPOLOGY_FLAGGED",
                "message": "Topology conflict engine flagged subnet mismatch as DATA_ERROR; system avoided unwarranted escalation."
            }

        return {
            "injected_type": injection_type,
            "status": "ACKNOWLEDGED",
            "message": f"Injected test signal: {injection_type}"
        }

scenario_service = ScenarioService()
