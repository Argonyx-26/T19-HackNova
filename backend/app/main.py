import sys
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure repository root is on sys.path
repo_root = Path(__file__).resolve().parent.parent.parent
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

from backend.app.core.config import settings
from backend.app.db.mongodb import db_manager
from backend.app.db.indexes import ensure_indexes
from backend.app.api.routes.events import router as events_router
from backend.app.api.routes.situations import router as situations_router
from backend.app.api.routes.simulation import router as simulation_router
from backend.app.api.routes.context import router as context_router
from backend.app.api.routes.intelligence import router as intelligence_router
from backend.app.api.routes.governance import router as governance_router
from backend.app.api.routes.system import router as system_router
from backend.app.api.routes.reasoning import router as reasoning_router
from backend.app.api.routes.video import router as video_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup lifecycle
    connected = db_manager.connect()
    if connected:
        ensure_indexes(db_manager)
    # Check if database has any situations; if empty, seed demo scenario in background
    try:
        from backend.app.services.situation_service import situation_service
        if not situation_service.list_situations():
            from backend.app.api.routes.simulation import run_scenario_stream
            import threading
            threading.Thread(target=run_scenario_stream, daemon=True).start()
    except Exception as e:
        import logging
        logging.getLogger("sentinel.main").warning(f"Auto-seed check skipped: {e}")
    yield
    # Shutdown lifecycle
    db_manager.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Threat Detection and Situational Awareness System API",
    version=settings.VERSION,
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(events_router)
app.include_router(situations_router)
app.include_router(simulation_router)
app.include_router(context_router)
app.include_router(intelligence_router)
app.include_router(governance_router)
app.include_router(system_router)
app.include_router(reasoning_router)
app.include_router(video_router)

@app.get("/health", tags=["System"])
def health_check():
    """System health check endpoint."""
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "tagline": settings.PROJECT_TAGLINE,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": "connected" if db_manager.is_connected else "simulated_storage",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
