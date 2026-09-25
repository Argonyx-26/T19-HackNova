"""Unit Tests for Operator Feedback and Predictive Outcome Validation."""

import pytest
from backend.app.services.feedback_service import feedback_service
from backend.app.schemas.feedback import OperatorFeedbackCreate
from backend.app.models.feedback import FeedbackType
from backend.app.services.prediction_validation_service import prediction_validation_service

def test_operator_feedback_submission_and_persistence():
    fb_in = OperatorFeedbackCreate(
        situation_id="sit-test-feedback",
        prediction_id="pred-test-01",
        feedback_type=FeedbackType.FALSE_POSITIVE,
        comments="Authorized drill by IT operations",
        observed_result="NORMAL"
    )
    saved = feedback_service.submit_feedback(fb_in, operator_id="operator-alice")
    assert saved.feedback_id.startswith("fb-")
    assert saved.feedback_type == FeedbackType.FALSE_POSITIVE
    assert saved.operator_id == "operator-alice"

    # Verify retrieval
    results = feedback_service.get_feedback_for_situation("sit-test-feedback")
    assert len(results) >= 1
    assert results[0].comments == "Authorized drill by IT operations"

def test_prediction_outcome_recording_and_matching():
    # Record a match
    outcome1 = prediction_validation_service.record_outcome(
        prediction_id="pred-100",
        situation_id="sit-val-01",
        predicted_state="CRITICAL",
        actual_state="CRITICAL",
        lead_time_seconds=340.5,
        horizon_label="5-15 minutes"
    )
    assert outcome1.match_status.value == "CONFIRMED_MATCH"
    assert outcome1.accuracy_score == 1.0

    # Record a deviation
    outcome2 = prediction_validation_service.record_outcome(
        prediction_id="pred-101",
        situation_id="sit-val-01",
        predicted_state="CRITICAL",
        actual_state="CONTAINED",
        lead_time_seconds=120.0,
        horizon_label="5-15 minutes"
    )
    assert outcome2.match_status.value == "DEVIATED"
    assert outcome2.accuracy_score == 0.0

def test_evaluation_metrics_summary():
    prediction_validation_service.record_outcome(
        prediction_id="pred-metric-1",
        situation_id="sit-metric-1",
        predicted_state="CRITICAL",
        actual_state="CRITICAL",
        lead_time_seconds=300.0
    )
    prediction_validation_service.record_outcome(
        prediction_id="pred-metric-2",
        situation_id="sit-metric-1",
        predicted_state="CRITICAL",
        actual_state="ANOMALOUS",
        lead_time_seconds=150.0
    )
    metrics = prediction_validation_service.get_evaluation_metrics()
    assert metrics.total_predictions >= 0
    assert metrics.evaluated_count >= 2
    assert metrics.status in ["ACTIVE_EVALUATION", "EMPIRICALLY_VERIFIED"]
    # Verify truth-in-measurement: if unmeasured, marked TO BE VALIDATED
    assert "TO BE VALIDATED" in metrics.recall or "%" in metrics.recall
