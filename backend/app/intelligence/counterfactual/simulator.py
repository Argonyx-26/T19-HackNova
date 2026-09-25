"""Counterfactual Simulation Engine for SENTINEL-X.

Simulates what-if outcomes across MONITOR, ISOLATE, and LOCKDOWN actions.
Does NOT execute real commands. Purely predictive simulation.
"""

from backend.app.models.situation import Situation, SituationState
from backend.app.models.intervention import InterventionAction, SimulatedIntervention

class CounterfactualSimulator:
    @staticmethod
    def simulate_action(situation: Situation, action: InterventionAction) -> SimulatedIntervention:
        current_state = situation.status.value
        current_risk = situation.risk_score

        if action == InterventionAction.MONITOR:
            # Passive monitoring: threat vector proceeds unmitigated
            if situation.status == SituationState.ESCALATING:
                projected_state = SituationState.CRITICAL.value
                risk_delta = 0.15
            elif situation.status in [SituationState.SUSPICIOUS, SituationState.ANOMALOUS]:
                projected_state = SituationState.ESCALATING.value
                risk_delta = 0.18
            else:
                projected_state = current_state
                risk_delta = 0.05
            
            projected_risk = round(min(1.0, current_risk + risk_delta), 2)
            operational_impact = "NONE"
            impact_assessment = "No operational interruption to business or personnel, but leaves ongoing threat vectors unmitigated."

        elif action == InterventionAction.ISOLATE:
            # Targeted entity isolation: sever IP connection and badge session
            if situation.status in [SituationState.ESCALATING, SituationState.CRITICAL]:
                projected_state = SituationState.CONTAINED.value
                risk_delta = -0.48
            else:
                projected_state = SituationState.NORMAL.value
                risk_delta = -0.30

            projected_risk = round(max(0.05, current_risk + risk_delta), 2)
            operational_impact = "MODERATE"
            impact_assessment = (
                f"Quarantines suspect endpoints ({', '.join(situation.primary_entity_ids)}) "
                "and revokes active badge session. Lateral movement arrested with minimal disruption to neighboring zones."
            )

        elif action == InterventionAction.LOCKDOWN:
            # Full physical and network perimeter lockdown of affected zones
            projected_state = SituationState.CONTAINED.value
            risk_delta = -0.65
            projected_risk = round(max(0.02, current_risk + risk_delta), 2)
            operational_impact = "HIGH"
            impact_assessment = (
                f"Full perimeter lockdown of zones: {', '.join(situation.location_ids)}. "
                "All magnetic doors sealed and network switches VLAN-isolated. High disruption to facility personnel."
            )

        return SimulatedIntervention(
            situation_id=situation.situation_id,
            action=action,
            current_state=current_state,
            projected_state=projected_state,
            projected_risk=projected_risk,
            risk_delta=round(risk_delta, 2),
            operational_impact=operational_impact,
            impact_assessment=impact_assessment,
            is_simulation_only=True
        )
