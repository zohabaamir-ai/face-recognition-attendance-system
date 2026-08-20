from datetime import datetime

from pydantic import BaseModel


class ReportEntry(BaseModel):
    id: int
    student_id: int
    name: str
    roll_number: str
    timestamp: datetime
    match_distance: float


class ReportResponse(BaseModel):
    total_entries: int
    unique_students: int
    entries: list[ReportEntry]