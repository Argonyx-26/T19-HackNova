"""Domain models for Local Vision-Language Reasoning (VLM Adapter)."""

from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class VLMSituationSynthesis(BaseModel):
    situation_id: str
    model_name: str = "Qwen2-VL-7B-Instruct-Local"
    inference_type: str = "DETERMINISTIC_VLM_SYNTHESIS" # REAL_VLM vs DETERMINISTIC_VLM_SYNTHESIS
    executive_summary: str
    evidence_synthesis: str
    key_anomalies: List[str] = Field(default_factory=list)
    possible_next_developments: List[str] = Field(default_factory=list)
    suggested_operator_checklist: List[str] = Field(default_factory=list)
    grounded_evidence_ids: List[str] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0)
    latency_ms: float = 24.5
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
