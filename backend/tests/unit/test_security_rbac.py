"""Unit Tests for RBAC Enforcement, Security Context, and Privacy Masking."""

import pytest
from fastapi import HTTPException
from backend.app.core.security import (
    UserRole,
    SecurityContext,
    get_current_security_context,
    require_role,
    ROLE_TOKEN_MAP
)
from backend.app.core.privacy import pseudonymize_badge_id, mask_ip_address, mask_event_pii

def test_rbac_role_permissions():
    admin_ctx = SecurityContext(user_id="admin-01", role=UserRole.ADMIN)
    assert admin_ctx.has_permission("system:admin")
    assert admin_ctx.has_permission("simulations:execute")
    assert admin_ctx.is_authorized_for_intervention() is True

    viewer_ctx = SecurityContext(user_id="viewer-01", role=UserRole.VIEWER)
    assert viewer_ctx.has_permission("system:admin") is False
    assert viewer_ctx.has_permission("simulations:execute") is False
    assert viewer_ctx.is_authorized_for_intervention() is False

def test_security_context_resolution_by_api_key():
    ctx = get_current_security_context(x_api_key="sentinel-admin-key")
    assert ctx.role == UserRole.ADMIN
    assert ctx.user_id == "sec-admin-01"

    ctx_op = get_current_security_context(authorization="Bearer sentinel-operator-key")
    assert ctx_op.role == UserRole.SECURITY_OPERATOR

def test_require_role_denial():
    checker = require_role([UserRole.ADMIN])
    analyst_ctx = SecurityContext(user_id="analyst-01", role=UserRole.ANALYST)
    with pytest.raises(HTTPException) as exc:
        checker(analyst_ctx)
    assert exc.value.status_code == 403

def test_privacy_pseudonymization_and_masking():
    badge = "badge-usr-104-sensitive"
    anon_badge = pseudonymize_badge_id(badge)
    assert anon_badge.startswith("BADGE-ANON-")
    assert badge not in anon_badge

    ip = "192.168.1.45"
    masked_ip = mask_ip_address(ip)
    assert masked_ip == "192.168.1.xxx"

    # Test event masking for VIEWER role
    raw_event = {
        "event_id": "evt-01",
        "entity_id": "badge-operator-99",
        "raw_payload": {"source_ip": "10.0.4.120", "card_holder": "John Doe"}
    }
    sanitized = mask_event_pii(raw_event, caller_role="VIEWER")
    assert "BADGE-ANON" in sanitized["entity_id"]
    assert sanitized["raw_payload"]["source_ip"] == "10.0.4.xxx"
    assert "BADGE-ANON" in sanitized["raw_payload"]["card_holder"]
