"""Pydantic schemas for Operator Feedback."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from backend.app.models.feedback import FeedbackType

class OperatorFeedbackCreate(BaseModel):
    situation_id: str
    prediction_id: Optional[str] = None
    feedback_type: FeedbackType
    comments: Optional[str] = None
    observed_result: Optional[str] = None

class OperatorFeedbackResponse(BaseModel):
    feedback_id: str
    situation_id: str
    prediction_id: Optional[str] = None
    feedback_type: FeedbackType
    operator_id: str
    comments: Optional[str] = None
    predicted_result: Optional[str] = None
    observed_result: Optional[str] = None
    created_at: datetime
