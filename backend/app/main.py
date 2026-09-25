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

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup lifecycle
    yield
    # Shutdown lifecycle

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

@app.get("/health", tags=["System"])
def health_check():
    """System health check endpoint."""
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "tagline": settings.PROJECT_TAGLINE,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": "configured",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
