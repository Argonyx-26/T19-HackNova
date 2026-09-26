"""Attack Chain Reconstruction Service for Multi-Stage Breach Progression."""

import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from backend.app.models.attack_chain import AttackChain, AttackChainStage, AttackStageName
from backend.app.services.situation_service import situation_service
from backend.app.services.event_service import event_service
from backend.app.services.mitre_service import mitre_service

logger = logging.getLogger("sentinel.attack_chain")

STAGE_ORDER = [
    (AttackStageName.INITIAL_ACCESS, ["UNAUTHORIZED_LOGIN", "LOGIN", "AUTH", "CREDENTIAL"]),
    (AttackStageName.DEFENSE_EVASION, ["ACCESS_DENIED", "BADGE_DENIED", "REPEATED_ACCESS"]),
    (AttackStageName.EXECUTION, ["UNAUTHORIZED_PRESENCE", "CCTV_INTRUSION", "MOTION_ALERT"]),
    (AttackStageName.DISCOVERY, ["PORT_SCAN", "INTERNAL_RECON", "HOST_DISCOVERY", "SCAN"]),
    (AttackStageName.LATERAL_MOVEMENT, ["LATERAL", "SSH_SESSION", "REMOTE_EXEC"]),
    (AttackStageName.COLLECTION, ["RACK_TAMPERING", "VIBRATION_SPIKE", "TEMPERATURE_ANOMALY", "ACCESS_VAULT"]),
    (AttackStageName.EXFILTRATION, ["DATA_EXFILTRATION", "LARGE_EGRESS", "SUSPICIOUS_TRANSFER"]),
    (AttackStageName.IMPACT, ["SYSTEM_LOCKDOWN", "ENCRYPTION_ALERT", "SERVICE_TERMINATION"])
]

class AttackChainService:
    def reconstruct_chain(self, situation_id: str) -> AttackChain:
        """Reconstruct multi-stage attack chain based on situation events and MITRE evidence."""
        situation = situation_service.get_situation(situation_id)
        if not situation:
            # Default empty chain
            stages = [
                AttackChainStage(stage=s_name, stage_order=i + 1, detected=False)
                for i, (s_name, _) in enumerate(STAGE_ORDER)
            ]
            return AttackChain(
                situation_id=situation_id,
                current_stage=AttackStageName.INITIAL_ACCESS,
                stages_completed=0,
                total_stages=len(STAGE_ORDER),
                progression_percentage=0.0,
                stages=stages
            )

        # Retrieve events associated with situation
        events = [event_service.get_event(eid) for eid in situation.event_ids if event_service.get_event(eid)]
        mitre_mappings = mitre_service.get_mappings_for_situation(situation_id)
        tech_by_event: Dict[str, List[str]] = {}
        for m in mitre_mappings:
            for eid in m.event_ids:
                tech_by_event.setdefault(eid, []).append(m.technique_id)

        stages: List[AttackChainStage] = []
        detected_count = 0
        latest_active_stage = AttackStageName.INITIAL_ACCESS

        for idx, (stage_name, keywords) in enumerate(STAGE_ORDER):
            matched_events = []
            matched_techniques = []
            first_seen = None
            last_seen = None

            for evt in events:
                evt_type = evt.event_type.upper()
                if any(kw in evt_type for kw in keywords):
                    matched_events.append(evt.event_id)
                    if evt.event_id in tech_by_event:
                        matched_techniques.extend(tech_by_event[evt.event_id])
                    if first_seen is None or evt.timestamp < first_seen:
                        first_seen = evt.timestamp
                    if last_seen is None or evt.timestamp > last_seen:
                        last_seen = evt.timestamp

            is_detected = len(matched_events) > 0
            if is_detected:
                detected_count += 1
                latest_active_stage = stage_name

            evidence_text = f"Identified {len(matched_events)} contributing events" if is_detected else "No active evidence observed"

            stages.append(
                AttackChainStage(
                    stage=stage_name,
                    stage_order=idx + 1,
                    detected=is_detected,
                    first_seen_at=first_seen,
                    last_seen_at=last_seen,
                    event_ids=matched_events,
                    technique_ids=list(set(matched_techniques)),
                    matched_event_ids=matched_events,
                    techniques=list(set(matched_techniques)),
                    evidence=evidence_text
                )
            )

        progression = round((detected_count / len(STAGE_ORDER)) * 100, 1)

        return AttackChain(
            situation_id=situation_id,
            current_stage=latest_active_stage,
            stages_completed=detected_count,
            total_stages=len(STAGE_ORDER),
            progression_percentage=progression,
            stages=stages,
            updated_at=datetime.now(timezone.utc)
        )

attack_chain_service = AttackChainService()
