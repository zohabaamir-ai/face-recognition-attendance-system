from datetime import datetime

from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    severity: str
    is_read: bool
    created_at: datetime
    related_student_id: int | None

    class Config:
        from_attributes = True


class UnreadNotificationCountResponse(BaseModel):
    count: int


class MarkAllNotificationsReadResponse(BaseModel):
    updated_count: int