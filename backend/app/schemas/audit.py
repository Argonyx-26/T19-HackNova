"""Pydantic schemas for Audit Logging."""

from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel

class AuditLogResponse(BaseModel):
    audit_id: str
    action: str
    operator_id: str
    role: str
    target_type: str
    target_id: str
    details: Dict[str, Any]
    ip_address: Optional[str] = None
    timestamp: datetime
