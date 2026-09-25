"""MongoDB index creation for SENTINEL-X collections.

DATA RETENTION RULE:
SENTINEL-X must preserve historical intelligence data by default.
Do NOT automatically delete:
- events
- situations
- situation_transitions
- predictions
- interventions
- recommendations

DO NOT CREATE TTL INDEXES on these collections.
"""

import logging
from pymongo import ASCENDING, DESCENDING
from backend.app.db.mongodb import MongoDBManager

logger = logging.getLogger("sentinel.db.indexes")

def ensure_indexes(db_manager: MongoDBManager) -> dict[str, list[str]]:
    """Create query performance indexes on MongoDB collections.
    
    Explicitly NO TTL indexes are created.
    """
    created_indexes = {}
    if not db_manager.is_connected or db_manager.db is None:
        logger.info("MongoDB not connected; skipping physical index creation.")
        return {"status": "skipped", "reason": "offline_mode"}

    db = db_manager.db

    # 1. events
    events = db["events"]
    created_indexes["events"] = [
        events.create_index([("timestamp", DESCENDING)]),
        events.create_index([("entity_id", ASCENDING), ("timestamp", DESCENDING)]),
        events.create_index([("situation_id", ASCENDING)]),
    ]

    # 2. situations
    situations = db["situations"]
    created_indexes["situations"] = [
        situations.create_index([("updated_at", DESCENDING)]),
        situations.create_index([("status", ASCENDING)]),
        situations.create_index([("situation_id", ASCENDING)], unique=True),
    ]

    # 3. situation_transitions (Historical audit log)
    transitions = db["situation_transitions"]
    created_indexes["situation_transitions"] = [
        transitions.create_index([("situation_id", ASCENDING), ("timestamp", DESCENDING)]),
        transitions.create_index([("transition_id", ASCENDING)], unique=True),
    ]

    # 4. predictions
    predictions = db["predictions"]
    created_indexes["predictions"] = [
        predictions.create_index([("situation_id", ASCENDING), ("created_at", DESCENDING)]),
    ]

    # 5. interventions
    interventions = db["interventions"]
    created_indexes["interventions"] = [
        interventions.create_index([("situation_id", ASCENDING), ("created_at", DESCENDING)]),
    ]

    # 6. recommendations
    recommendations = db["recommendations"]
    created_indexes["recommendations"] = [
        recommendations.create_index([("situation_id", ASCENDING), ("created_at", DESCENDING)]),
    ]

    # 7. entities
    entities = db["entities"]
    created_indexes["entities"] = [
        entities.create_index([("entity_id", ASCENDING)], unique=True),
    ]

    # 8. locations
    locations = db["locations"]
    created_indexes["locations"] = [
        locations.create_index([("location_id", ASCENDING)], unique=True),
    ]

    logger.info("All non-TTL indexes successfully verified across 8 collections.")
    return created_indexes
