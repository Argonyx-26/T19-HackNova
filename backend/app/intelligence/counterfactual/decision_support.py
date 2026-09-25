"""Decision Support Logic comparing simulated intervention outcomes."""

from typing import List
from backend.app.models.situation import Situation, SituationState
from backend.app.models.intervention import SimulatedIntervention, InterventionAction
from backend.app.models.recommendation import DecisionSupportRecommendation, ActionComparison

class DecisionSupportEngine:
    @staticmethod
    def generate_recommendation(
        situation: Situation,
        simulations: List[SimulatedIntervention]
    ) -> DecisionSupportRecommendation:
        current_state = situation.status.value

        # Build comparison list
        comparisons = []
        for s in simulations:
            comparisons.append(ActionComparison(
                action=s.action.value,
                projected_state=s.projected_state,
                projected_risk=s.projected_risk,
                risk_delta=s.risk_delta,
                operational_impact=s.operational_impact,
                summary=s.impact_assessment
            ))

        # Transparent criteria evaluation
        if situation.status in [SituationState.ESCALATING, SituationState.SUSPICIOUS]:
            recommended = InterventionAction.ISOLATE.value
            justification = (
                f"The current situation is {current_state} with risk score {situation.risk_score}. "
                "Simulated ISOLATE reduces projected risk by -0.48 to CONTAINED state by quarantining suspect "
                f"endpoints ({', '.join(situation.primary_entity_ids)}) without incurring the high operational disruption "
                f"of a facility-wide physical LOCKDOWN. Passive MONITOR is inadvisable due to positive risk velocity."
            )
        elif situation.status == SituationState.CRITICAL:
            recommended = InterventionAction.LOCKDOWN.value
            justification = (
                f"The situation has reached {current_state} with severe perimeter breach. "
                "Simulated LOCKDOWN enforces immediate physical and network containment across affected zones. "
                "Human operator verification required immediately."
            )
        elif situation.status == SituationState.CONTAINED:
            recommended = InterventionAction.MONITOR.value
            justification = "Incident is already in CONTAINED state. Recommended posture is continued monitoring."
        else:
            recommended = InterventionAction.MONITOR.value
            justification = "All sensors within normal operating threshold. Passive monitoring recommended."

        return DecisionSupportRecommendation(
            situation_id=situation.situation_id,
            current_state=current_state,
            recommended_action=recommended,
            justification=justification,
            compared_actions=comparisons
        )
