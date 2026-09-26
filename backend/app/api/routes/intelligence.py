"""Intelligence REST API Routes (Threat Intel, MITRE ATT&CK, Behavioral Baselines, Physical Behaviors)."""

from typing import List, Optional, Dict, Any
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
from backend.app.services.physical_behavior_service import physical_behavior_service
from backend.app.core.security import get_current_security_context, SecurityContext, require_role, UserRole
from backend.app.models.event import NormalizedEvent
from backend.app.models.physical_behavior import PhysicalBehaviorEvent
from backend.app.services.physical_behavior_service import CAMERA_ZONES as _CAMERA_ZONES_REF

router = APIRouter(prefix="/api/intelligence", tags=["Threat Intelligence & Analytics"])

# ==================== THREAT INTELLIGENCE ====================

# NOTE: GET /threat-intel/indicators is defined below with category filter support


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


# ==================== PHYSICAL BEHAVIOR INTELLIGENCE ====================

@router.get("/physical-behaviors", response_model=List[Dict[str, Any]])
def list_physical_behaviors(
    limit: int = Query(50, ge=1, le=200),
    ctx: SecurityContext = Depends(get_current_security_context)
):
    """Retrieve detected physical security behavior events from camera/sensor feeds.
    
    Physical behaviors use a physical security ontology — NOT MITRE ATT&CK.
    ATT&CK mapping is only applied when independent cyber evidence is present.
    """
    behaviors = physical_behavior_service.get_all_behaviors(limit=limit)
    return [b.model_dump() for b in behaviors]


@router.get("/physical-behaviors/situation/{situation_id}", response_model=List[Dict[str, Any]])
def get_situation_physical_behaviors(
    situation_id: str,
    ctx: SecurityContext = Depends(get_current_security_context)
):
    """Retrieve physical behavior events correlated to a specific situation."""
    behaviors = physical_behavior_service.get_behaviors_for_situation(situation_id)
    return [b.model_dump() for b in behaviors]


@router.get("/security-zones", response_model=List[Dict[str, Any]])
def list_security_zones(
    ctx: SecurityContext = Depends(get_current_security_context)
):
    """Retrieve security zone layout and camera-to-zone mapping."""
    zones = []
    for cam_id, zone_info in _CAMERA_ZONES_REF.items():
        zones.append({
            "camera_id": cam_id,
            "zone_id": zone_info["zone_id"],
            "zone_name": zone_info["zone_name"],
            "classification": zone_info["classification"],
        })
    return zones


# ==================== THREAT RELEVANCE ENGINE ====================

@router.get("/threat-intel/relevance/{situation_id}", response_model=Dict[str, Any])
def get_threat_intel_relevance(
    situation_id: str,
    ctx: SecurityContext = Depends(get_current_security_context)
):
    """Classify whether external threat intelligence is RELATED, POSSIBLY_RELATED,
    or UNRELATED to local observations in a given situation.
    
    MITRE mappings are only included when cyber domain evidence independently supports them.
    Physical-only behaviors never produce ATT&CK technique assignments here.
    """
    return threat_intel_service.get_relevance_for_situation(situation_id)


@router.get("/threat-intel/indicators", response_model=List[IndicatorResponse])
def list_threat_indicators(
    indicator_type: Optional[str] = Query(None, description="Filter by type: IP, DOMAIN, HASH, LATERAL_MOVEMENT, etc."),
    category: Optional[str] = Query(None, description="Filter by category: NETWORK_OBSERVABLE, BEHAVIORAL, KNOWLEDGE, ENVIRONMENTAL"),
    ctx: SecurityContext = Depends(get_current_security_context)
):
    """Retrieve normalized threat intelligence indicators (IOCs) across all CTI types."""
    indicators = threat_intel_service.get_indicators(indicator_type=indicator_type, category=category)
    result = []
    for ioc in indicators:
        d = ioc.model_dump()
        if hasattr(d.get('relevance'), 'value'):
            d['relevance'] = d['relevance'].value
        result.append(IndicatorResponse(**d))
    return result


# ==================== CYBER-PHYSICAL FUSION ====================

@router.get("/cyber-physical/fusion-score/{situation_id}", response_model=Dict[str, Any])
def get_cyber_physical_fusion_score(
    situation_id: str,
    ctx: SecurityContext = Depends(get_current_security_context)
):
    """Retrieve multi-domain fusion evidence scores for a situation.
    
    Returns structured evidence scores across physical, access, cyber, and intelligence
    domains. Never collapses to a single percentage — always shows the full breakdown.
    """
    try:
        from backend.app.services.threat_dna_service import threat_dna_service
        dna = threat_dna_service.get_or_generate_for_situation(situation_id)
        return {
            "situation_id": situation_id,
            "is_cyber_physical": dna.is_cyber_physical,
            "domains_active": dna.domains_active,
            "fusion_scores": dna.fusion_scores.model_dump(),
            "evidence_strength": dna.fusion_scores.evidence_strength.value,
            "ttp_relevance": dna.fusion_scores.ttp_relevance.value,
            "attribution_note": dna.intelligence_domain.attribution_note,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fusion score computation failed: {str(e)}")
