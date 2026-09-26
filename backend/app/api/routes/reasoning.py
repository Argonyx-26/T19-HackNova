"""Situational Reasoning, Evidence Shadow, Digital Twin, and Adversarial Lab API Routes."""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel
from backend.app.models.topology import SiteCampus, TopologyConflict
from backend.app.models.evidence import EvidenceShadow, WhyNotDecision
from backend.app.models.vlm import VLMSituationSynthesis
from backend.app.models.source_health import SourceWeatherReport
from backend.app.models.embeddings import EmbeddingAdapterType
from backend.app.services.topology_service import topology_service
from backend.app.services.evidence_service import evidence_service
from backend.app.services.vlm_service import vlm_service
from backend.app.services.source_health_service import source_health_service
from backend.app.services.scenario_service import scenario_service
from backend.app.services.embedding_service import embedding_service

router = APIRouter(prefix="/api/reasoning", tags=["Situational Reasoning Engine"])

class AdversarialInjectRequest(BaseModel):
    injection_type: str # DUPLICATE_EVENT, FALSE_LOCATION, DELAYED_EVENT, SENSOR_FAILURE, CONTRADICTORY_EVIDENCE, TOPOLOGY_CONFLICT
    situation_id: str = "sit-20260925-001"

class AdapterSwitchRequest(BaseModel):
    adapter_type: EmbeddingAdapterType

# 1. Environment Topology & 3D Twin
@router.get("/topology/campus", response_model=SiteCampus)
def get_campus_digital_twin():
    """Retrieve 3-layer environment hierarchy: Campus -> Building -> Floors -> Zones -> Assets."""
    return topology_service.get_site_campus()

@router.get("/topology/conflicts", response_model=List[TopologyConflict])
def list_topology_conflicts():
    """Retrieve detected physical/network topology conflicts (impossible travel, location mismatch)."""
    return topology_service.get_conflicts()

# 2. Evidence Shadow & Why-Not Engine
@router.get("/evidence/situations/{situation_id}/shadow", response_model=EvidenceShadow)
def get_situation_evidence_shadow(situation_id: str):
    """Retrieve Evidence Shadow detailing supporting, contradictory, and missing evidence."""
    return evidence_service.get_evidence_shadow(situation_id)

@router.get("/evidence/situations/{situation_id}/why-not", response_model=List[WhyNotDecision])
def get_situation_why_not_decisions(situation_id: str):
    """Explain why candidate events were NOT merged into the situation."""
    return evidence_service.get_why_not_decisions(situation_id)

# 3. Local Vision-Language Reasoning (VLM)
@router.get("/vlm/situations/{situation_id}", response_model=VLMSituationSynthesis)
def get_vlm_situation_synthesis(situation_id: str):
    """Generate structured vision-language situation reasoning grounded strictly in evidence."""
    return vlm_service.synthesize_situation(situation_id)

# 4. Source Weather / Reliability Telemetry
@router.get("/source-weather", response_model=SourceWeatherReport)
def get_source_weather():
    """Retrieve real-time telemetry and feed health across CCTV, Audio, Access, Network, IoT, and Geo."""
    return source_health_service.get_weather_report()

# 5. Adversarial Scenario Lab Injection
@router.post("/simulation/inject")
def inject_adversarial_signal(req: AdversarialInjectRequest):
    """Inject test signals to verify machine reasoning under uncertainty."""
    res = scenario_service.inject_adversarial_signal(req.injection_type, req.situation_id)
    return res

# 6. Multimodal Embedding Adapters
@router.get("/embeddings/adapter")
def get_active_embedding_adapter():
    """Query currently active multimodal embedding adapter."""
    return {
        "active_adapter": embedding_service.adapter_type.value,
        "supported_adapters": [a.value for a in EmbeddingAdapterType],
        "dimension": embedding_service.embedding_dimension,
        "distinction": "REAL_MODEL requires local GPU weights; DETERMINISTIC_DEV uses mathematical hash projection; REPLAY_SCENARIO uses pre-extracted tensors."
    }

@router.post("/embeddings/adapter")
def switch_embedding_adapter(req: AdapterSwitchRequest):
    """Switch active multimodal embedding adapter."""
    embedding_service.set_adapter_type(req.adapter_type)
    return {"status": "switched", "active_adapter": req.adapter_type.value}


# ==================== THREAT DNA ====================

@router.get("/situations/{situation_id}/threat-dna")
def get_situation_threat_dna(situation_id: str):
    """Generate and retrieve Threat DNA — a structured cyber-physical incident profile.

    Integrates evidence from physical, access, cyber, and intelligence domains.
    Returns structured multi-domain evidence chains, NOT a single probability score.
    ATT&CK technique IDs only present when independent cyber evidence supports them.
    Attribution is always UNCONFIRMED with mandatory disclaimer unless direct IOC match.
    """
    try:
        from backend.app.services.threat_dna_service import threat_dna_service
        dna = threat_dna_service.get_or_generate_for_situation(situation_id)
        return dna.model_dump()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Threat DNA generation failed: {str(e)}"
        )
