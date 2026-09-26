"""Modular Multimodal Embedding Models (ImageBind-Compatible)."""

from datetime import datetime, timezone
from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class EmbeddingAdapterType(str, Enum):
    REAL_MODEL = "REAL_MODEL"          # Local PyTorch/ImageBind weights loaded
    DETERMINISTIC_DEV = "DETERMINISTIC_DEV"  # Deterministic mathematical projection for dev/test
    REPLAY_SCENARIO = "REPLAY_SCENARIO"      # Pre-extracted research scenario embeddings

class MultimodalEmbedding(BaseModel):
    embedding_id: str
    event_id: str
    modality: str                      # CCTV, AUDIO, NETWORK, ACCESS, IOT, GEOSPATIAL
    dimension: int = 128
    vector: List[float] = Field(default_factory=list)
    adapter_type: EmbeddingAdapterType
    model_version: str = "imagebind-huge-v1.0"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VectorSimilarityMatch(BaseModel):
    target_event_id: str
    similarity_score: float            # Cosine similarity 0.0 to 1.0
    modality: str
    temporal_gap_seconds: float
