"""System Health & Telemetry REST API Routes."""

from fastapi import APIRouter, Depends
from backend.app.services.metrics_service import metrics_service
from backend.app.core.config import settings
from backend.app.db.mongodb import db_manager
from backend.app.core.security import get_current_security_context, SecurityContext

router = APIRouter(prefix="/api/system", tags=["System & Telemetry"])

@router.get("/health")
def get_system_health(ctx: SecurityContext = Depends(get_current_security_context)):
    """Comprehensive system health and component status check."""
    metric = metrics_service.get_current_metrics()
    return {
        "status": "HEALTHY",
        "service": settings.PROJECT_NAME,
        "tagline": settings.PROJECT_TAGLINE,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": {
            "status": metric.database_status,
            "connected": db_manager.is_connected
        },
        "correlation_engine": {
            "status": metric.correlation_engine_status,
            "p95_latency_ms": metric.p95_correlation_latency_ms
        },
        "source_health": metric.source_health,
        "timestamp": metric.timestamp.isoformat()
    }

@router.get("/metrics")
def get_system_metrics(ctx: SecurityContext = Depends(get_current_security_context)):
    """Retrieve real-time operational telemetry, throughput (EPS), and latency distributions."""
    metric = metrics_service.get_current_metrics()
    return metric.model_dump()
