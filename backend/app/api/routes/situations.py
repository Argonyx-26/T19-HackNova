"""Situation REST API Routes."""

from typing import List
from fastapi import APIRouter, HTTPException
from backend.app.schemas.situation import (
    SituationSummaryResponse,
    SituationDetailResponse,
    SituationTransitionResponse,
    SituationGraphResponse,
)
from backend.app.services.situation_service import situation_service

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
