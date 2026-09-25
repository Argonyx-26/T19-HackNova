"""Audit Service for Immutable Logging of Operational Actions."""

import logging
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from backend.app.models.audit import AuditLog
from backend.app.db.mongodb import db_manager

logger = logging.getLogger("sentinel.audit")

class AuditService:
    def _get_collection(self):
        return db_manager.get_collection("audit_logs")

    def log_action(
        self,
        action: str,
        operator_id: str = "system",
        role: str = "SECURITY_OPERATOR",
        target_type: str = "SYSTEM",
        target_id: str = "ALL",
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        **kwargs
    ) -> AuditLog:
        col = self._get_collection()
        audit_id = f"aud-{uuid.uuid4().hex[:8]}"

        actual_operator = kwargs.get("user_id", operator_id)
        actual_target_type = kwargs.get("target_resource", target_type)
        actual_details = dict(details) if details else {}
        if "status" in kwargs:
            actual_details["status"] = kwargs["status"]

        log_entry = AuditLog(
            audit_id=audit_id,
            action=action,
            operator_id=actual_operator,
            role=role,
            target_type=actual_target_type,
            target_id=target_id,
            details=actual_details,
            ip_address=ip_address,
            timestamp=datetime.now(timezone.utc)
        )

        col.insert_one(log_entry.model_dump())
        logger.info(f"AUDIT LOG [{action}] by {operator_id} ({role}) on {target_type}:{target_id}")
        return log_entry

    def get_logs(self, limit: int = 50, action: Optional[str] = None) -> List[AuditLog]:
        col = self._get_collection()
        query = {}
        if action:
            query["action"] = action
        docs = col.find(query).sort("timestamp", -1).limit(limit)
        result = []
        for d in docs:
            d_clean = {k: v for k, v in d.items() if k != "_id"}
            result.append(AuditLog(**d_clean))
        return result

audit_service = AuditService()
