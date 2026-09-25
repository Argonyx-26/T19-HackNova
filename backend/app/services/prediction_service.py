"""Prediction Service managing generation and retrieval of situation trajectory forecasts."""

import logging
from typing import Optional
from backend.app.db.mongodb import db_manager
from backend.app.models.prediction import FutureStatePrediction
from backend.app.services.situation_service import situation_service
from backend.app.intelligence.prediction.engine import FutureStatePredictionEngine

logger = logging.getLogger("sentinel.service.prediction")

class PredictionService:
    def get_or_generate_prediction(self, situation_id: str) -> Optional[FutureStatePrediction]:
        situation = situation_service.get_situation(situation_id)
        if not situation:
            return None

        timeline = situation_service.get_timeline(situation_id)
        prediction = FutureStatePredictionEngine.predict_future_state(situation, timeline)

        # Store prediction in MongoDB predictions collection (No TTL)
        predictions_col = db_manager.get_collection("predictions")
        predictions_col.insert_one(prediction.to_doc())

        return prediction

prediction_service = PredictionService()
