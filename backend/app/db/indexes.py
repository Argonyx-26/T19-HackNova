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

    # 9. threat_intel_indicators (Zero TTL, strict forensic retention)
    threat_intel = db["threat_intel_indicators"]
    created_indexes["threat_intel_indicators"] = [
        threat_intel.create_index([("indicator_value", ASCENDING)], unique=True),
        threat_intel.create_index([("indicator_type", ASCENDING)]),
        threat_intel.create_index([("confidence", ASCENDING)]),
    ]

    # 10. attack_mappings (Zero TTL)
    attack_mappings = db["attack_mappings"]
    created_indexes["attack_mappings"] = [
        attack_mappings.create_index([("technique_id", ASCENDING)]),
        attack_mappings.create_index([("situation_id", ASCENDING)]),
    ]

    # 11. behavioral_baselines (Zero TTL)
    baselines = db["behavioral_baselines"]
    created_indexes["behavioral_baselines"] = [
        baselines.create_index([("entity_id", ASCENDING)], unique=True),
        baselines.create_index([("entity_type", ASCENDING)]),
    ]

    # 12. behavioral_anomalies (Zero TTL)
    anomalies = db["behavioral_anomalies"]
    created_indexes["behavioral_anomalies"] = [
        anomalies.create_index([("entity_id", ASCENDING), ("timestamp", DESCENDING)]),
    ]

    # 13. operator_feedback (Zero TTL)
    feedback = db["operator_feedback"]
    created_indexes["operator_feedback"] = [
        feedback.create_index([("feedback_id", ASCENDING)], unique=True),
        feedback.create_index([("situation_id", ASCENDING)]),
        feedback.create_index([("prediction_id", ASCENDING)]),
        feedback.create_index([("timestamp", DESCENDING)]),
    ]

    # 14. prediction_outcomes (Zero TTL)
    pred_outcomes = db["prediction_outcomes"]
    created_indexes["prediction_outcomes"] = [
        pred_outcomes.create_index([("prediction_id", ASCENDING)], unique=True),
        pred_outcomes.create_index([("situation_id", ASCENDING)]),
        pred_outcomes.create_index([("match_status", ASCENDING)]),
    ]

    # 15. blast_radii (Zero TTL)
    blast_radii = db["blast_radii"]
    created_indexes["blast_radii"] = [
        blast_radii.create_index([("situation_id", ASCENDING)]),
        blast_radii.create_index([("generated_at", DESCENDING)]),
    ]

    # 16. attack_chains (Zero TTL)
    attack_chains = db["attack_chains"]
    created_indexes["attack_chains"] = [
        attack_chains.create_index([("situation_id", ASCENDING)]),
    ]

    # 17. audit_logs (Zero TTL, immutable forensic audit trail)
    audit_logs = db["audit_logs"]
    created_indexes["audit_logs"] = [
        audit_logs.create_index([("audit_id", ASCENDING)], unique=True),
        audit_logs.create_index([("timestamp", DESCENDING)]),
        audit_logs.create_index([("user_id", ASCENDING)]),
        audit_logs.create_index([("action", ASCENDING)]),
    ]

    # 18. system_metrics (Zero TTL)
    system_metrics = db["system_metrics"]
    created_indexes["system_metrics"] = [
        system_metrics.create_index([("metric_name", ASCENDING), ("timestamp", DESCENDING)]),
    ]

    logger.info("All non-TTL indexes successfully verified across 18 collections.")
    return created_indexes
