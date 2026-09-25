"""Situation REST API Routes."""

from typing import List
from fastapi import APIRouter, HTTPException
from backend.app.schemas.situation import (
    SituationSummaryResponse,
    SituationDetailResponse,
    SituationTransitionResponse,
    SituationGraphResponse,
)
from backend.app.schemas.prediction import PredictionResponse
from backend.app.schemas.intervention import SimulationRequest, SimulationResponse
from backend.app.schemas.recommendation import DecisionSupportResponse
from backend.app.services.situation_service import situation_service
from backend.app.services.prediction_service import prediction_service
from backend.app.services.intervention_service import intervention_service
from backend.app.services.recommendation_service import recommendation_service

router = APIRouter(prefix="/api/situations", tags=["Situations"])

@router.get("", response_model=List[SituationSummaryResponse])
def list_situations():
    """List all tracked situations."""
    situations = situation_service.list_situations()
    return [
        SituationSummaryResponse(
            situation_id=s.situation_id,
            status=s.status,
            risk_score=s.risk_score,
            summary=s.summary,
            primary_entity_ids=s.primary_entity_ids,
            location_ids=s.location_ids,
            event_count=len(s.event_ids),
            started_at=s.started_at,
            updated_at=s.updated_at,
        )
        for s in situations
    ]

@router.get("/{situation_id}", response_model=SituationDetailResponse)
def get_situation(situation_id: str):
    """Retrieve full details of a specific situation."""
    sit = situation_service.get_situation(situation_id)
    if not sit:
        raise HTTPException(status_code=404, detail=f"Situation '{situation_id}' not found")
    return SituationDetailResponse(**sit.model_dump())

@router.get("/{situation_id}/timeline", response_model=List[SituationTransitionResponse])
def get_situation_timeline(situation_id: str):
    """Retrieve the explainable state transition timeline reconstructed from situation_transitions."""
    transitions = situation_service.get_timeline(situation_id)
    return [SituationTransitionResponse(**t.model_dump()) for t in transitions]

@router.get("/{situation_id}/graph", response_model=SituationGraphResponse)
def get_situation_graph(situation_id: str):
    """Retrieve the NetworkX threat topology graph for visualization."""
    graph_data = situation_service.get_graph(situation_id)
    return SituationGraphResponse(**graph_data)

@router.get("/{situation_id}/predictions", response_model=PredictionResponse)
def get_situation_predictions(situation_id: str):
    """Retrieve deterministic future-state trajectory forecast for an active situation."""
    pred = prediction_service.get_or_generate_prediction(situation_id)
    if not pred:
        raise HTTPException(status_code=404, detail=f"Situation '{situation_id}' not found for prediction")
    return PredictionResponse(**pred.model_dump())

@router.post("/{situation_id}/simulate", response_model=SimulationResponse)
def simulate_intervention(situation_id: str, request: SimulationRequest):
    """Simulate a what-if counterfactual intervention (MONITOR, ISOLATE, LOCKDOWN). Pure simulation only."""
    sim = intervention_service.simulate_action(situation_id, request.action)
    if not sim:
        raise HTTPException(status_code=404, detail=f"Situation '{situation_id}' not found for simulation")
    return SimulationResponse(**sim.model_dump())

@router.get("/{situation_id}/recommendation", response_model=DecisionSupportResponse)
def get_situation_recommendation(situation_id: str):
    """Retrieve decision-support recommendation comparing counterfactual actions."""
    rec = recommendation_service.get_or_generate_recommendation(situation_id)
    if not rec:
        raise HTTPException(status_code=404, detail=f"Situation '{situation_id}' not found for recommendation")
    return DecisionSupportResponse(**rec.model_dump())

@router.get("/{situation_id}/blast-radius")
def get_situation_blast_radius(situation_id: str):
    """Retrieve blast radius analysis estimating affected physical zones, endpoints, identities, and databases."""
    from backend.app.services.blast_radius_service import blast_radius_service
    br = blast_radius_service.calculate_blast_radius(situation_id)
    return br.model_dump()

@router.get("/{situation_id}/attack-chain")
def get_situation_attack_chain(situation_id: str):
    """Retrieve multi-stage attack chain reconstruction showing kill-chain stage progression and evidence."""
    from backend.app.services.attack_chain_service import attack_chain_service
    chain = attack_chain_service.reconstruct_chain(situation_id)
    return chain.model_dump()

@router.get("/{situation_id}/risk-explanation")
def get_situation_risk_explanation(situation_id: str):
    """Retrieve explainable risk engine calculation detailing all weighted drivers and mathematical factors."""
    from backend.app.services.risk_engine_service import risk_engine_service
    from backend.app.services.threat_intel_service import threat_intel_service
    from backend.app.services.mitre_service import mitre_service
    
    sit = situation_service.get_situation(situation_id)
    if not sit:
        raise HTTPException(status_code=404, detail=f"Situation '{situation_id}' not found")
        
    mitre_maps = mitre_service.get_mappings_for_situation(situation_id)
    risk_res = risk_engine_service.compute_situation_risk(
        situation=sit,
        mitre_mappings=mitre_maps,
        attack_chain_progression=min(1.0, len(mitre_maps) * 0.25)
    )
    return risk_res.model_dump()
