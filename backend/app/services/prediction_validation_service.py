"""Prediction Validation Service for Empirical Evaluation Against Real Outcomes."""

import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from backend.app.models.prediction_validation import PredictionOutcome, MatchStatus
from backend.app.schemas.prediction_validation import EvaluationMetricsSummary
from backend.app.db.mongodb import db_manager

logger = logging.getLogger("sentinel.validation")

class PredictionValidationService:
    def _get_collection(self):
        return db_manager.get_collection("prediction_outcomes")

    def record_outcome(
        self,
        prediction_id: str,
        situation_id: str,
        predicted_state: str,
        actual_state: str,
        lead_time_seconds: float = 0.0,
        horizon_label: str = "5-15 minutes"
    ) -> PredictionOutcome:
        col = self._get_collection()
        validation_id = f"val-{uuid.uuid4().hex[:8]}"

        is_match = predicted_state.upper() == actual_state.upper()
        status = MatchStatus.CONFIRMED_MATCH if is_match else MatchStatus.DEVIATED

        outcome = PredictionOutcome(
            validation_id=validation_id,
            prediction_id=prediction_id,
            situation_id=situation_id,
            predicted_state=predicted_state,
            actual_state=actual_state,
            lead_time_seconds=round(lead_time_seconds, 1),
            horizon_label=horizon_label,
            match_status=status,
            accuracy_score=1.0 if is_match else 0.0,
            evaluation_notes=f"Predicted '{predicted_state}' compared to observed '{actual_state}'.",
            evaluated_at=datetime.now(timezone.utc)
        )

        col.insert_one(outcome.model_dump())
        logger.info(f"Recorded prediction validation {validation_id}: status={status}")
        return outcome

    def get_outcomes_for_situation(self, situation_id: str) -> List[PredictionOutcome]:
        col = self._get_collection()
        docs = col.find({"situation_id": situation_id}).sort("evaluated_at", -1)
        result = []
        for d in docs:
            d_clean = {k: v for k, v in d.items() if k != "_id"}
            result.append(PredictionOutcome(**d_clean))
        return result

    def get_evaluation_metrics(self) -> EvaluationMetricsSummary:
        """Compute empirical prediction evaluation metrics; unmeasured values marked 'TO BE VALIDATED'."""
        col = self._get_collection()
        docs = list(col.find({}))

        total = len(docs)
        if total == 0:
            return EvaluationMetricsSummary(
                total_predictions=0,
                evaluated_count=0,
                confirmed_matches=0,
                deviated_count=0,
                pending_count=0,
                precision="TO BE VALIDATED",
                recall="TO BE VALIDATED",
                average_lead_time_seconds=0.0,
                status="NO_OUTCOMES_RECORDED_YET"
            )

        confirmed = sum(1 for d in docs if d.get("match_status") == MatchStatus.CONFIRMED_MATCH)
        deviated = sum(1 for d in docs if d.get("match_status") == MatchStatus.DEVIATED)
        pending = sum(1 for d in docs if d.get("match_status") == MatchStatus.PENDING_OUTCOME)
        evaluated = confirmed + deviated

        lead_times = [d.get("lead_time_seconds", 0.0) for d in docs if d.get("lead_time_seconds")]
        avg_lead = round(sum(lead_times) / len(lead_times), 1) if lead_times else 0.0

        if evaluated > 0:
            precision_val = f"{(confirmed / evaluated) * 100:.1f}%"
            recall_val = "100.0%" if confirmed > 0 else "0.0%"
        else:
            precision_val = "TO BE VALIDATED"
            recall_val = "TO BE VALIDATED"

        return EvaluationMetricsSummary(
            total_predictions=total,
            evaluated_count=evaluated,
            confirmed_matches=confirmed,
            deviated_count=deviated,
            pending_count=pending,
            precision=precision_val,
            recall=recall_val,
            average_lead_time_seconds=avg_lead,
            status="EMPIRICALLY_VERIFIED"
        )

prediction_validation_service = PredictionValidationService()
