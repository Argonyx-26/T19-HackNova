"""Intelligence REST API Routes (Threat Intel, MITRE ATT&CK, Behavioral Baselines)."""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status, Depends
from backend.app.schemas.threat_intel import (
    IndicatorResponse,
    IndicatorCreate,
    IndicatorMatch
)
from backend.app.schemas.mitre_attack import ATTACKMappingResponse
from backend.app.schemas.behavioral import BehavioralBaselineResponse, BehavioralAnomalyResponse
from backend.app.services.threat_intel_service import threat_intel_service
from backend.app.services.mitre_service import mitre_service
from backend.app.services.behavioral_service import behavioral_service
from backend.app.core.security import get_current_security_context, SecurityContext, require_role, UserRole
from backend.app.models.event import NormalizedEvent

router = APIRouter(prefix="/api/intelligence", tags=["Threat Intelligence & Analytics"])

# ==================== THREAT INTELLIGENCE ====================

@router.get("/threat-intel/indicators", response_model=List[IndicatorResponse])
def list_threat_indicators(
    indicator_type: Optional[str] = Query(None, description="Filter: IP, DOMAIN, HASH, URL"),
    ctx: SecurityContext = Depends(get_current_security_context)
):
    """Retrieve normalized threat intelligence indicators (IOCs)."""
    indicators = threat_intel_service.get_indicators(indicator_type=indicator_type)
    return [IndicatorResponse(**ioc.model_dump()) for ioc in indicators]

@router.post("/threat-intel/indicators", response_model=IndicatorResponse, status_code=status.HTTP_201_CREATED)
def add_threat_indicator(
    data: IndicatorCreate,
    ctx: SecurityContext = Depends(require_role([UserRole.ADMIN, UserRole.SECURITY_OPERATOR]))
):
    """Register a new verified threat intelligence indicator."""
    ioc = threat_intel_service.add_indicator(data)
    return IndicatorResponse(**ioc.model_dump())

@router.post("/threat-intel/match-event", response_model=List[IndicatorMatch])
def match_event_indicators(
    event: NormalizedEvent,
    ctx: SecurityContext = Depends(get_current_security_context)
):
    """Evaluate an event against the threat intelligence repository for IOC matches."""
    return threat_intel_service.match_event(event)

# ==================== MITRE ATT&CK ====================

@router.get("/mitre/mappings", response_model=List[ATTACKMappingResponse])
def list_mitre_mappings(
    tactic: Optional[str] = Query(None, description="Filter by ATT&CK Tactic"),
    ctx: SecurityContext = Depends(get_current_security_context)
):
    """Retrieve explainable MITRE ATT&CK mappings across all situations."""
    mappings = mitre_service.get_mappings(tactic=tactic)
    return [ATTACKMappingResponse(**m.model_dump()) for m in mappings]

@router.get("/mitre/situations/{situation_id}", response_model=List[ATTACKMappingResponse])
def get_situation_mitre_mappings(
    situation_id: str,
    ctx: SecurityContext = Depends(get_current_security_context)
):
    """Retrieve explainable MITRE ATT&CK evidence mapped to a specific situation."""
    mappings = mitre_service.get_mappings_for_situation(situation_id)
    return [ATTACKMappingResponse(**m.model_dump()) for m in mappings]

# ==================== BEHAVIORAL PROFILING ====================

@router.get("/behavioral/baselines/{entity_id}", response_model=BehavioralBaselineResponse)
def get_entity_baseline(
    entity_id: str,
    ctx: SecurityContext = Depends(get_current_security_context)
):
    """Retrieve the behavioral baseline profile for a user or endpoint entity."""
    baseline = behavioral_service.get_baseline(entity_id)
    if not baseline:
        raise HTTPException(status_code=404, detail=f"No behavioral baseline established for entity '{entity_id}'")
    return BehavioralBaselineResponse(**baseline.model_dump())

@router.get("/behavioral/anomalies", response_model=List[BehavioralAnomalyResponse])
def list_behavioral_anomalies(
    limit: int = Query(50, ge=1, le=200),
    ctx: SecurityContext = Depends(get_current_security_context)
):
    """Retrieve detected behavioral baseline deviations and anomalies."""
    anomalies = behavioral_service.list_anomalies(limit=limit)
    return [BehavioralAnomalyResponse(**a.model_dump()) for a in anomalies]
