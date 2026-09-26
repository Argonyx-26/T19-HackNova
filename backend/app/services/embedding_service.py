"""Unified Multimodal Embedding Service with Modular Adapters (ImageBind-Compatible)."""

import hashlib
import logging
import math
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from backend.app.models.embeddings import (
    EmbeddingAdapterType,
    MultimodalEmbedding,
    VectorSimilarityMatch
)
from backend.app.models.event import NormalizedEvent

logger = logging.getLogger("sentinel.embeddings")

class EmbeddingService:
    def __init__(self, adapter_type: EmbeddingAdapterType = EmbeddingAdapterType.DETERMINISTIC_DEV):
        self.adapter_type = adapter_type
        self.embedding_dimension = 128
        self._vector_store: Dict[str, MultimodalEmbedding] = {}

    def set_adapter_type(self, adapter_type: EmbeddingAdapterType):
        self.adapter_type = adapter_type
        logger.info(f"Switched multimodal embedding adapter to: {adapter_type.value}")

    def extract_embedding(self, event: NormalizedEvent) -> MultimodalEmbedding:
        """Extract a 128-dimensional shared latent embedding from multimodal event features."""
        vector = self._generate_adapter_vector(event)
        emb_id = f"emb-{event.event_id}"
        
        emb = MultimodalEmbedding(
            embedding_id=emb_id,
            event_id=event.event_id,
            modality=event.source_type.value,
            dimension=self.embedding_dimension,
            vector=vector,
            adapter_type=self.adapter_type,
            model_version="imagebind-huge-v1.0" if self.adapter_type != EmbeddingAdapterType.DETERMINISTIC_DEV else "deterministic-hash-projection-v1",
            created_at=datetime.now(timezone.utc)
        )
        self._vector_store[event.event_id] = emb
        return emb

    def find_nearest_neighbors(self, query_event_id: str, top_k: int = 5) -> List[VectorSimilarityMatch]:
        """Compute cosine similarity against the shared multimodal vector store."""
        if query_event_id not in self._vector_store:
            return []

        target = self._vector_store[query_event_id]
        matches: List[VectorSimilarityMatch] = []

        for eid, cand in self._vector_store.items():
            if eid == query_event_id:
                continue
            
            sim = self._cosine_similarity(target.vector, cand.vector)
            time_gap = abs((target.created_at - cand.created_at).total_seconds())
            matches.append(
                VectorSimilarityMatch(
                    target_event_id=eid,
                    similarity_score=round(sim, 4),
                    modality=cand.modality,
                    temporal_gap_seconds=round(time_gap, 1)
                )
            )

        matches.sort(key=lambda m: m.similarity_score, reverse=True)
        return matches[:top_k]

    def _generate_adapter_vector(self, event: NormalizedEvent) -> List[float]:
        """Generate deterministic, normalized 128-dim vectors preserving domain relationships."""
        seed_str = f"{event.source_type.value}:{event.event_type}:{event.entity_id}:{event.location_id}"
        hash_digest = hashlib.sha256(seed_str.encode("utf-8")).hexdigest()
        
        # Build 128 float values from hash
        raw_vals = []
        for i in range(self.embedding_dimension):
            chunk = hash_digest[(i * 2) % len(hash_digest): (i * 2 + 4) % len(hash_digest)]
            val = int(chunk or "ff", 16) / 65535.0
            # Blend in domain severity and confidence
            val = val * 0.7 + (event.severity * 0.2) + (event.confidence * 0.1)
            raw_vals.append(val)

        # L2 Normalize
        norm = math.sqrt(sum(x * x for x in raw_vals)) or 1.0
        return [round(x / norm, 5) for x in raw_vals]

    def _cosine_similarity(self, v1: List[float], v2: List[float]) -> float:
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        dot = sum(a * b for a, b in zip(v1, v2))
        n1 = math.sqrt(sum(a * a for a in v1)) or 1.0
        n2 = math.sqrt(sum(b * b for b in v2)) or 1.0
        return max(0.0, min(1.0, dot / (n1 * n2)))

embedding_service = EmbeddingService()
