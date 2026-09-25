"""Deterministic Situation State Machine for SENTINEL-X.

Evaluates evidence progression:
NORMAL -> ANOMALOUS -> SUSPICIOUS -> ESCALATING -> CRITICAL
(or transition to CONTAINED via intervention).

Every transition produces a concrete, explainable SituationTransition record.
"""

from typing import Optional, List, Tuple
from backend.app.models.situation import Situation, SituationState
from backend.app.models.situation_transition import SituationTransition
from backend.app.models.event import NormalizedEvent

class SituationStateMachine:
    @staticmethod
    def evaluate_transition(
        current_situation: Situation,
        new_event: NormalizedEvent,
        correlated_events: List[NormalizedEvent]
    ) -> Optional[SituationTransition]:
        """Determine if a new event warrants a state transition."""
        from_state = current_situation.status
        all_events = correlated_events + [new_event]
        event_types = {e.event_type for e in all_events}
        source_types = {e.source_type.value for e in all_events}
        max_severity = max(e.severity for e in all_events)

        to_state: Optional[SituationState] = None
        reason: str = ""
        risk_delta: float = 0.0

        # Rule 1: CRITICAL Transition
        if "data_exfiltration_attempt" in event_types or (max_severity >= 0.95 and len(source_types) >= 3):
            if from_state != SituationState.CRITICAL:
                to_state = SituationState.CRITICAL
                reason = "Active data exfiltration or multi-source perimeter collapse detected."
                risk_delta = 0.20

        # Rule 2: ESCALATING Transition
        elif ("port_scan" in event_types or "server_rack_vibration_alert" in event_types) and len(source_types) >= 2:
            if from_state not in [SituationState.ESCALATING, SituationState.CRITICAL]:
                to_state = SituationState.ESCALATING
                reason = f"Cross-domain lateral movement: {', '.join(source_types)} indicators correlated."
                risk_delta = 0.25

        # Rule 3: SUSPICIOUS Transition
        elif ("unauthorized_presence" in event_types or "repeated_access_attempt" in event_types) or len(all_events) >= 3:
            if from_state in [SituationState.NORMAL, SituationState.ANOMALOUS]:
                to_state = SituationState.SUSPICIOUS
                reason = f"Multiple access retries or unauthorized visual detection for entity {new_event.entity_id}."
                risk_delta = 0.20

        # Rule 4: ANOMALOUS Transition
        elif new_event.severity >= 0.40 or new_event.event_type == "access_denied":
            if from_state == SituationState.NORMAL:
                to_state = SituationState.ANOMALOUS
                reason = f"Initial security anomaly recorded: {new_event.event_type} at {new_event.location_id}."
                risk_delta = 0.15

        if to_state and to_state != from_state:
            return SituationTransition(
                situation_id=current_situation.situation_id,
                from_state=from_state.value,
                to_state=to_state.value,
                trigger_event_id=new_event.event_id,
                reason=reason,
                risk_delta=round(risk_delta, 2)
            )

        return None
