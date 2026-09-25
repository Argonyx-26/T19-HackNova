from backend.app.intelligence.counterfactual.simulator import CounterfactualSimulator
from backend.app.intelligence.counterfactual.decision_support import DecisionSupportEngine
from backend.app.models.intervention import InterventionAction
from backend.app.models.situation import Situation, SituationState

def test_decision_support_recommendation_escalating():
    sit = Situation(
        situation_id="sit-test-dec",
        status=SituationState.ESCALATING,
        risk_score=0.78,
        primary_entity_ids=["person-104", "ep-10.0.4.120"],
        location_ids=["lab-a"]
    )
    
    simulations = [
        CounterfactualSimulator.simulate_action(sit, InterventionAction.MONITOR),
        CounterfactualSimulator.simulate_action(sit, InterventionAction.ISOLATE),
        CounterfactualSimulator.simulate_action(sit, InterventionAction.LOCKDOWN),
    ]
    
    rec = DecisionSupportEngine.generate_recommendation(sit, simulations)
    assert rec.situation_id == "sit-test-dec"
    assert rec.recommended_action == "ISOLATE"
    assert "reduces projected risk" in rec.justification
    assert len(rec.compared_actions) == 3
    assert "sole authority" in rec.operator_authority_notice

def test_decision_support_recommendation_critical():
    sit = Situation(
        situation_id="sit-test-crit",
        status=SituationState.CRITICAL,
        risk_score=0.96,
        primary_entity_ids=["person-104"],
        location_ids=["server-room-1"]
    )
    
    simulations = [
        CounterfactualSimulator.simulate_action(sit, InterventionAction.MONITOR),
        CounterfactualSimulator.simulate_action(sit, InterventionAction.ISOLATE),
        CounterfactualSimulator.simulate_action(sit, InterventionAction.LOCKDOWN),
    ]
    
    rec = DecisionSupportEngine.generate_recommendation(sit, simulations)
    assert rec.recommended_action == "LOCKDOWN"
    assert "severe perimeter breach" in rec.justification
