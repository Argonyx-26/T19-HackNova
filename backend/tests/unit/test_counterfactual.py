from backend.app.intelligence.counterfactual.simulator import CounterfactualSimulator
from backend.app.models.intervention import InterventionAction
from backend.app.models.situation import Situation, SituationState

def test_counterfactual_simulations():
    sit = Situation(
        situation_id="sit-test-sim",
        status=SituationState.ESCALATING,
        risk_score=0.75,
        primary_entity_ids=["person-104", "ep-10.0.4.120"],
        location_ids=["lab-a"]
    )

    # 1. Simulate MONITOR
    sim_mon = CounterfactualSimulator.simulate_action(sit, InterventionAction.MONITOR)
    assert sim_mon.projected_state == "CRITICAL"
    assert sim_mon.risk_delta > 0
    assert sim_mon.operational_impact == "NONE"

    # 2. Simulate ISOLATE
    sim_iso = CounterfactualSimulator.simulate_action(sit, InterventionAction.ISOLATE)
    assert sim_iso.projected_state == "CONTAINED"
    assert sim_iso.risk_delta < 0
    assert sim_iso.operational_impact == "MODERATE"
    assert "Quarantines suspect endpoints" in sim_iso.impact_assessment

    # 3. Simulate LOCKDOWN
    sim_lock = CounterfactualSimulator.simulate_action(sit, InterventionAction.LOCKDOWN)
    assert sim_lock.projected_state == "CONTAINED"
    assert sim_lock.risk_delta <= sim_iso.risk_delta
    assert sim_lock.operational_impact == "HIGH"
    assert sim_lock.is_simulation_only is True
