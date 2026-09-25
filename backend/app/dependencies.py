"""FastAPI dependency injection module."""

from fastapi import Depends
from backend.app.core.config import Settings, settings
from backend.app.core.security import SecurityContext, get_current_security_context

def get_settings() -> Settings:
    return settings
