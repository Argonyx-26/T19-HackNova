"""Security and Role-Based Access Control Stubs for SENTINEL-X.

The hackathon MVP operates with open operator access for rapid demonstration.
This module defines the architectural extension points for RBAC.
"""

from enum import Enum
from typing import Optional

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    SECURITY_OPERATOR = "SECURITY_OPERATOR"
    ANALYST = "ANALYST"
    VIEWER = "VIEWER"

class SecurityContext:
    def __init__(self, user_id: str = "operator-01", role: UserRole = UserRole.SECURITY_OPERATOR):
        self.user_id = user_id
        self.role = role

    def is_authorized_for_intervention(self) -> bool:
        return self.role in [UserRole.ADMIN, UserRole.SECURITY_OPERATOR]

def get_current_security_context() -> SecurityContext:
    """Dependency provider for authenticated operator context."""
    return SecurityContext()
