from backend.app.intelligence.prediction.engine import FutureStatePredictionEngine
from backend.app.models.situation import Situation, SituationState

def test_escalating_future_prediction():
    sit = Situation(
        situation_id="sit-test-pred",
        status=SituationState.ESCALATING,
        risk_score=0.75,
        event_ids=["e1", "e2", "e3"],
        location_ids=["lab-a", "server-room-1"]
    )
    
    pred = FutureStatePredictionEngine.predict_future_state(sit, [])
    assert pred.situation_id == "sit-test-pred"
    assert pred.current_state == "ESCALATING"
    assert pred.predicted_state == "CRITICAL"
    assert pred.risk_score >= 0.75
    assert len(pred.triggering_factors) >= 2
    assert "perimeter breach" in pred.reason

def test_contained_future_prediction():
    sit = Situation(
        situation_id="sit-test-contained",
        status=SituationState.CONTAINED,
        risk_score=0.35,
        event_ids=["e1"]
    )
    
    pred = FutureStatePredictionEngine.predict_future_state(sit, [])
    assert pred.predicted_state == "NORMAL"
    assert pred.risk_delta < 0
