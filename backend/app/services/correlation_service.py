"""Correlation Service orchestrating event relationship evaluation and situation matching."""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from backend.app.core.config import settings
from backend.app.models.event import NormalizedEvent
from backend.app.services.event_service import event_service
from backend.app.intelligence.correlation.engine import ContextualCorrelationEngine, CorrelationMatch

logger = logging.getLogger("sentinel.service.correlation")

class CorrelationService:
    def __init__(self):
        self.engine = ContextualCorrelationEngine(window_seconds=settings.CORRELATION_WINDOW_SECONDS)

    def process_event(self, new_event: NormalizedEvent) -> List[CorrelationMatch]:
        """Examine new event against recent active events in memory/database."""
        # Query recent candidate events within 2x window
        recent_events = event_service.list_events(limit=30)
        
        all_matches: List[CorrelationMatch] = []
        correlated_event_ids: set[str] = set()

        for past_event in recent_events:
            if past_event.event_id == new_event.event_id:
                continue

            matches = self.engine.evaluate_correlation(new_event, past_event)
            # Filter for significant multi-attribute correlations (e.g. Entity or Semantic or Spatial+Temporal)
            has_strong_link = any(m.relationship_type in ["ENTITY", "SEMANTIC_CHAIN"] for m in matches)
            has_multi_link = len(matches) >= 2

            if has_strong_link or has_multi_link:
                all_matches.extend(matches)
                correlated_event_ids.add(past_event.event_id)

        if correlated_event_ids:
            logger.info("Event %s correlated with %d prior events: %s",
                        new_event.event_id, len(correlated_event_ids), list(correlated_event_ids))
            
            # Hook into situation evolution service (M10-M12)
            try:
                from backend.app.services.situation_service import situation_service
                situation_service.correlate_and_evolve(new_event, list(correlated_event_ids), all_matches)
            except ImportError:
                pass  # Pre-M12 milestone

        return all_matches

correlation_service = CorrelationService()
