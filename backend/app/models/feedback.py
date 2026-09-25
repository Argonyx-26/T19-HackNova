"""Domain model for Human Operator Feedback."""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field

class FeedbackType(str, Enum):
    CORRECT = "CORRECT"
    INCORRECT = "INCORRECT"
    UNCERTAIN = "UNCERTAIN"
    FALSE_POSITIVE = "FALSE_POSITIVE"
    FALSE_NEGATIVE = "FALSE_NEGATIVE"

class OperatorFeedback(BaseModel):
    feedback_id: str
    situation_id: str
    prediction_id: Optional[str] = None
    feedback_type: FeedbackType
    operator_id: str
    comments: Optional[str] = None
    predicted_result: Optional[str] = None
    observed_result: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
