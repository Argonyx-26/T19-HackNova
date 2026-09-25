"""Governance REST API Routes (Operator Feedback, Prediction Validation, Audit Trail)."""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status, Depends
from backend.app.schemas.feedback import OperatorFeedbackResponse, OperatorFeedbackCreate
from backend.app.schemas.prediction_validation import (
    PredictionOutcomeResponse,
    PredictionOutcomeCreate,
    EvaluationMetricsSummary
)
from backend.app.schemas.audit import AuditLogResponse
from backend.app.services.feedback_service import feedback_service
from backend.app.services.prediction_validation_service import prediction_validation_service
from backend.app.services.audit_service import audit_service
from backend.app.core.security import get_current_security_context, SecurityContext, require_role, UserRole

router = APIRouter(prefix="/api/governance", tags=["Governance, Feedback & Audit"])

# ==================== OPERATOR FEEDBACK ====================

@router.post("/feedback", response_model=OperatorFeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_operator_feedback(
    data: OperatorFeedbackCreate,
    ctx: SecurityContext = Depends(require_role([UserRole.ADMIN, UserRole.SECURITY_OPERATOR, UserRole.ANALYST]))
):
    """Submit human-in-the-loop feedback on predictions or situation classifications.
    
    Feedback is stored for evaluation and calibration; does not mutate production models directly.
    """
    fb = feedback_service.submit_feedback(data, operator_id=ctx.user_id)
    
    audit_service.log_action(
        action="OPERATOR_FEEDBACK_SUBMITTED",
        operator_id=ctx.user_id,
        role=ctx.role.value,
        target_type="SITUATION",
        target_id=data.situation_id,
        details={"feedback_type": data.feedback_type.value, "prediction_id": data.prediction_id}
    )
    return OperatorFeedbackResponse(**fb.model_dump())

@router.get("/feedback", response_model=List[OperatorFeedbackResponse])
def list_feedback(
    limit: int = Query(50, ge=1, le=200),
    ctx: SecurityContext = Depends(get_current_security_context)
):
    """List historical human operator feedback entries."""
    feedbacks = feedback_service.get_all_feedback(limit=limit)
    return [OperatorFeedbackResponse(**f.model_dump()) for f in feedbacks]

@router.get("/feedback/situation/{situation_id}", response_model=List[OperatorFeedbackResponse])
def get_situation_feedback(
    situation_id: str,
    ctx: SecurityContext = Depends(get_current_security_context)
):
    """Retrieve all operator feedback associated with a specific situation."""
    feedbacks = feedback_service.get_feedback_for_situation(situation_id)
    return [OperatorFeedbackResponse(**f.model_dump()) for f in feedbacks]

# ==================== PREDICTIVE VALIDATION ====================

@router.post("/predictions/outcome", response_model=PredictionOutcomeResponse, status_code=status.HTTP_201_CREATED)
def record_prediction_outcome(
    data: PredictionOutcomeCreate,
    ctx: SecurityContext = Depends(require_role([UserRole.ADMIN, UserRole.SECURITY_OPERATOR]))
):
    """Record observed ground-truth outcome against a prior future-state prediction."""
    outcome = prediction_validation_service.record_outcome(
        prediction_id=data.prediction_id,
        situation_id=data.situation_id,
        predicted_state=data.predicted_state,
        actual_state=data.actual_state,
        lead_time_seconds=data.lead_time_seconds,
        horizon_label=data.horizon_label
    )
    return PredictionOutcomeResponse(**outcome.model_dump())

@router.get("/evaluation/metrics", response_model=EvaluationMetricsSummary)
def get_evaluation_metrics(
    ctx: SecurityContext = Depends(get_current_security_context)
):
    """Retrieve empirical prediction performance metrics.
    
    Unmeasured metrics are explicitly marked 'TO BE VALIDATED' rather than fabricated.
    """
    return prediction_validation_service.get_evaluation_metrics()

# ==================== AUDIT TRAIL ====================

@router.get("/audit", response_model=List[AuditLogResponse])
def get_audit_trail(
    limit: int = Query(50, ge=1, le=200),
    action: Optional[str] = Query(None, description="Filter by action type"),
    ctx: SecurityContext = Depends(require_role([UserRole.ADMIN, UserRole.SECURITY_OPERATOR]))
):
    """Retrieve immutable security and operator audit trail."""
    logs = audit_service.get_logs(limit=limit, action=action)
    return [AuditLogResponse(**l.model_dump()) for l in logs]
