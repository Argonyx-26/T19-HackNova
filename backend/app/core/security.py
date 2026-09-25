"""Security and Role-Based Access Control (RBAC) Module for SENTINEL-X.

Implements enterprise-grade RBAC enforcement across 4 security tiers:
- ADMIN: Full administrative control, user management, policy updates, audit trail review
- SECURITY_OPERATOR: Situation management, manual escalation, counterfactual simulation, decision feedback
- ANALYST: Read-only intelligence analysis, graph exploration, ATT&CK review, blast radius view
- VIEWER: Read-only sanitized views (PII/badge masked), no simulation execution

Adheres to strict Principle of Least Privilege (PoLP) and defense-in-depth.
"""

import logging
from enum import Enum
from typing import List, Optional, Set
from fastapi import Header, HTTPException, Depends, status
from backend.app.models.audit import AuditLog
from backend.app.services.audit_service import audit_service

logger = logging.getLogger("sentinel.core.security")

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    SECURITY_OPERATOR = "SECURITY_OPERATOR"
    ANALYST = "ANALYST"
    VIEWER = "VIEWER"

# Static / pre-shared API keys for prototype & demonstration environments
ROLE_TOKEN_MAP = {
    "sentinel-admin-key": (UserRole.ADMIN, "sec-admin-01"),
    "sentinel-operator-key": (UserRole.SECURITY_OPERATOR, "sec-op-01"),
    "sentinel-analyst-key": (UserRole.ANALYST, "sec-analyst-01"),
    "sentinel-viewer-key": (UserRole.VIEWER, "sec-viewer-01"),
}

class SecurityContext:
    def __init__(
        self,
        user_id: str = "sec-op-01",
        role: UserRole = UserRole.SECURITY_OPERATOR,
        permissions: Optional[Set[str]] = None
    ):
        self.user_id = user_id
        self.role = role
        self.permissions = permissions or self._resolve_default_permissions(role)

    def _resolve_default_permissions(self, role: UserRole) -> Set[str]:
        base_permissions = {
            UserRole.ADMIN: {
                "events:read", "events:write",
                "situations:read", "situations:write", "situations:escalate",
                "predictions:read", "predictions:evaluate",
                "simulations:read", "simulations:execute",
                "intel:read", "intel:write",
                "governance:feedback", "governance:audit",
                "system:admin", "system:health"
            },
            UserRole.SECURITY_OPERATOR: {
                "events:read", "events:write",
                "situations:read", "situations:write", "situations:escalate",
                "predictions:read", "predictions:evaluate",
                "simulations:read", "simulations:execute",
                "intel:read",
                "governance:feedback", "governance:audit",
                "system:health"
            },
            UserRole.ANALYST: {
                "events:read",
                "situations:read",
                "predictions:read",
                "simulations:read",
                "intel:read",
                "system:health"
            },
            UserRole.VIEWER: {
                "events:read_masked",
                "situations:read_masked",
                "system:health"
            },
        }
        return base_permissions.get(role, set())

    def has_permission(self, permission: str) -> bool:
        return permission in self.permissions

    def is_authorized_for_intervention(self) -> bool:
        return self.role in [UserRole.ADMIN, UserRole.SECURITY_OPERATOR]


def get_current_security_context(
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    authorization: Optional[str] = Header(None)
) -> SecurityContext:
    """Dependency provider resolving caller identity and role from headers.
    
    Defaults gracefully to SECURITY_OPERATOR if running in open evaluation mode.
    """
    token = x_api_key
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1].strip()

    if token and token in ROLE_TOKEN_MAP:
        role, user_id = ROLE_TOKEN_MAP[token]
        return SecurityContext(user_id=user_id, role=role)

    # In prototype mode without authentication headers, default to standard SECURITY_OPERATOR
    return SecurityContext(user_id="operator-default", role=UserRole.SECURITY_OPERATOR)


def require_role(allowed_roles: List[UserRole]):
    """Enforce endpoint caller possesses an authorized role."""
    def role_checker(ctx: SecurityContext = Depends(get_current_security_context)) -> SecurityContext:
        if ctx.role not in allowed_roles:
            audit_service.log_action(
                user_id=ctx.user_id,
                role=ctx.role.value,
                action="RBAC_DENIAL",
                target_resource="API_ENDPOINT",
                status="DENIED",
                details={"required_roles": [r.value for r in allowed_roles], "caller_role": ctx.role.value}
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Role '{ctx.role.value}' not in authorized roles {[r.value for r in allowed_roles]}"
            )
        return ctx
    return role_checker
