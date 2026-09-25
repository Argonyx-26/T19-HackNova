import pytest
from backend.app.db.mongodb import db_manager
from backend.app.services.situation_service import situation_service

@pytest.fixture(autouse=True)
def clean_database():
    """Ensure clean isolated database and graph buffers for every test."""
    db_manager.reset()
    situation_service.graphs.clear()
    yield
    db_manager.reset()
    situation_service.graphs.clear()
