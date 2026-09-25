"""Recommendation Service managing decision-support analysis and persistence."""

import logging
from typing import Optional
from backend.app.db.mongodb import db_manager
from backend.app.models.recommendation import DecisionSupportRecommendation
from backend.app.services.situation_service import situation_service
from backend.app.services.intervention_service import intervention_service
from backend.app.intelligence.counterfactual.decision_support import DecisionSupportEngine

logger = logging.getLogger("sentinel.service.recommendation")

class RecommendationService:
    def get_or_generate_recommendation(self, situation_id: str) -> Optional[DecisionSupportRecommendation]:
        situation = situation_service.get_situation(situation_id)
        if not situation:
            return None

        # Simulate all 3 counterfactual actions
        simulations = intervention_service.simulate_all_actions(situation_id)
        rec = DecisionSupportEngine.generate_recommendation(situation, simulations)

        # Store in MongoDB recommendations collection (No TTL)
        recommendations_col = db_manager.get_collection("recommendations")
        recommendations_col.insert_one(rec.to_doc())

        logger.info("Generated decision-support recommendation for %s: %s",
                    situation_id, rec.recommended_action)
        return rec

recommendation_service = RecommendationService()
