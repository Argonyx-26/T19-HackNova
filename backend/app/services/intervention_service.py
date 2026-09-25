"""Intervention Service managing what-if simulations and decision-support comparisons."""

import logging
from typing import Optional, List
from backend.app.db.mongodb import db_manager
from backend.app.models.intervention import InterventionAction, SimulatedIntervention
from backend.app.services.situation_service import situation_service
from backend.app.intelligence.counterfactual.simulator import CounterfactualSimulator

logger = logging.getLogger("sentinel.service.intervention")

class InterventionService:
    def simulate_action(self, situation_id: str, action: InterventionAction) -> Optional[SimulatedIntervention]:
        situation = situation_service.get_situation(situation_id)
        if not situation:
            return None

        sim_result = CounterfactualSimulator.simulate_action(situation, action)

        # Store in MongoDB interventions collection (No TTL)
        interventions_col = db_manager.get_collection("interventions")
        interventions_col.insert_one(sim_result.to_doc())

        logger.info("Simulated intervention '%s' for situation %s: %s -> %s (Risk delta: %s)",
                    action.value, situation_id, sim_result.current_state, sim_result.projected_state, sim_result.risk_delta)
        return sim_result

    def simulate_all_actions(self, situation_id: str) -> List[SimulatedIntervention]:
        """Run all three counterfactual interventions for decision support comparison."""
        results = []
        for act in [InterventionAction.MONITOR, InterventionAction.ISOLATE, InterventionAction.LOCKDOWN]:
            res = self.simulate_action(situation_id, act)
            if res:
                results.append(res)
        return results

intervention_service = InterventionService()
