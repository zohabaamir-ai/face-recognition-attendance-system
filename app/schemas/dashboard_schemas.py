from datetime import datetime

from pydantic import BaseModel


class DashboardRecentEntry(BaseModel):
    id: int
    student_id: int
    name: str
    roll_number: str
    timestamp: datetime
    match_distance: float


class DashboardResponse(BaseModel):
    total_students: int
    todays_entries: int
    unique_students_today: int
    average_match_distance: float | None
    recent_entries: list[DashboardRecentEntry]