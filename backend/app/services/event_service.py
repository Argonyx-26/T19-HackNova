"""Event Service managing ingestion, MongoDB persistence, and event queries."""

import logging
from typing import List, Optional, Dict, Any
from backend.app.db.mongodb import db_manager
from backend.app.models.event import NormalizedEvent
from backend.app.schemas.event import EventCreate
from backend.app.intelligence.normalization.normalizer import EventNormalizer

logger = logging.getLogger("sentinel.service.event")

class EventService:
    def __init__(self):
        self.collection_name = "events"

    def ingest_event(self, event_create: EventCreate) -> NormalizedEvent:
        """Validate, normalize, and persist event in MongoDB."""
        normalized = EventNormalizer.normalize(event_create.model_dump())
        collection = db_manager.get_collection(self.collection_name)
        
        doc = normalized.to_doc()
        collection.insert_one(doc)
        logger.info("Ingested event %s [%s:%s] for entity %s", 
                    normalized.event_id, normalized.source_type, normalized.event_type, normalized.entity_id)
        return normalized

    def get_event(self, event_id: str) -> Optional[NormalizedEvent]:
        collection = db_manager.get_collection(self.collection_name)
        doc = collection.find_one({"event_id": event_id})
        if not doc:
            return None
        return NormalizedEvent(**doc)

    def list_events(
        self,
        limit: int = 50,
        source_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        location_id: Optional[str] = None,
        situation_id: Optional[str] = None,
    ) -> List[NormalizedEvent]:
        collection = db_manager.get_collection(self.collection_name)
        query: Dict[str, Any] = {}
        if source_type:
            query["source_type"] = source_type.upper()
        if entity_id:
            query["entity_id"] = entity_id
        if location_id:
            query["location_id"] = location_id
        if situation_id:
            query["situation_id"] = situation_id

        cursor = collection.find(query, sort=[("timestamp", -1)], limit=limit)
        events = []
        for doc in cursor:
            # Drop Mongo internal _id for Pydantic parsing if string
            doc.pop("_id", None)
            events.append(NormalizedEvent(**doc))
        return events

event_service = EventService()
