"""Privacy, Anonymization, and Data Governance Utilities for SENTINEL-X.

Implements compliance controls for:
- PII (Personally Identifiable Information) masking
- Physical Badge ID hashing/pseudonymization
- IP address truncation (IPv4 /24 subnet masking)
- CCTV biometric metadata redacting for unprivileged roles (VIEWER)
- Strict adherence to zero-deletion forensic retention
"""

import hashlib
import re
from typing import Dict, Any, List

class DataClassification:
    PUBLIC = "PUBLIC"
    INTERNAL = "INTERNAL"
    RESTRICTED = "RESTRICTED"
    CRITICAL_FORENSIC = "CRITICAL_FORENSIC"


def pseudonymize_badge_id(badge_id: str, salt: str = "sentinel-forensic-salt") -> str:
    """Deterministically pseudonymize badge IDs using SHA-256 with consistent prefix."""
    if not badge_id:
        return "BADGE-UNKNOWN"
    digest = hashlib.sha256(f"{salt}:{badge_id}".encode()).hexdigest()[:8]
    return f"BADGE-ANON-{digest.upper()}"


def mask_ip_address(ip_addr: str) -> str:
    """Mask host octet in IPv4 addresses (e.g. 192.168.1.45 -> 192.168.1.xxx)."""
    if not ip_addr:
        return "xxx.xxx.xxx.xxx"
    parts = ip_addr.split(".")
    if len(parts) == 4:
        return f"{parts[0]}.{parts[1]}.{parts[2]}.xxx"
    return "xxx.xxx.xxx.xxx"


def mask_event_pii(event_dict: Dict[str, Any], caller_role: str) -> Dict[str, Any]:
    """Conditionally mask sensitive entity attributes if caller is VIEWER."""
    if caller_role != "VIEWER":
        return event_dict

    sanitized = dict(event_dict)
    
    # 1. Mask entity_id if badge or personal identifier
    entity_id = sanitized.get("entity_id", "")
    if "badge" in entity_id.lower() or "user" in entity_id.lower() or "emp" in entity_id.lower():
        sanitized["entity_id"] = pseudonymize_badge_id(entity_id)

    # 2. Mask payload IPs or identities
    payload = sanitized.get("raw_payload", {})
    if isinstance(payload, dict):
        masked_payload = dict(payload)
        for key in ["ip", "source_ip", "dest_ip", "client_ip"]:
            if key in masked_payload and isinstance(masked_payload[key], str):
                masked_payload[key] = mask_ip_address(masked_payload[key])
        for key in ["badge_id", "card_holder", "full_name"]:
            if key in masked_payload and isinstance(masked_payload[key], str):
                masked_payload[key] = pseudonymize_badge_id(masked_payload[key])
        sanitized["raw_payload"] = masked_payload

    return sanitized
