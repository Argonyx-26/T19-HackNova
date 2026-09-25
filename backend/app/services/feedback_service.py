"""Operator Feedback Service for Human-in-the-Loop Continuous Learning."""

import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from backend.app.models.feedback import OperatorFeedback, FeedbackType
from backend.app.schemas.feedback import OperatorFeedbackCreate
from backend.app.db.mongodb import db_manager

logger = logging.getLogger("sentinel.feedback")

class FeedbackService:
    def _get_collection(self):
        return db_manager.get_collection("operator_feedback")

    def submit_feedback(self, data: OperatorFeedbackCreate, operator_id: str = "operator-01") -> OperatorFeedback:
        col = self._get_collection()
        feedback_id = f"fb-{uuid.uuid4().hex[:8]}"

        # Look up existing prediction or situation state for context
        predictions_col = db_manager.get_collection("predictions")
        pred_doc = predictions_col.find_one({"prediction_id": data.prediction_id}) if data.prediction_id else None
        predicted_result = pred_doc.get("predicted_state") if pred_doc else None

        fb = OperatorFeedback(
            feedback_id=feedback_id,
            situation_id=data.situation_id,
            prediction_id=data.prediction_id,
            feedback_type=data.feedback_type,
            operator_id=operator_id,
            comments=data.comments,
            predicted_result=predicted_result,
            observed_result=data.observed_result,
            created_at=datetime.now(timezone.utc)
        )

        col.insert_one(fb.model_dump())
        logger.info(f"Operator feedback recorded: {feedback_id} ({data.feedback_type}) by {operator_id}")

        # Note: Feedback is strictly stored for offline evaluation & audit;
        # production state machines are NEVER silently retrained from a single event.
        return fb

    def get_feedback_for_situation(self, situation_id: str) -> List[OperatorFeedback]:
        col = self._get_collection()
        docs = col.find({"situation_id": situation_id}).sort("created_at", -1)
        result = []
        for d in docs:
            d_clean = {k: v for k, v in d.items() if k != "_id"}
            result.append(OperatorFeedback(**d_clean))
        return result

    def get_all_feedback(self, limit: int = 50) -> List[OperatorFeedback]:
        col = self._get_collection()
        docs = col.find({}).sort("created_at", -1).limit(limit)
        result = []
        for d in docs:
            d_clean = {k: v for k, v in d.items() if k != "_id"}
            result.append(OperatorFeedback(**d_clean))
        return result

feedback_service = FeedbackService()
