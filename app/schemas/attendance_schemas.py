from datetime import datetime

from pydantic import BaseModel


class AttendanceResponse(BaseModel):
    id: int
    student_id: int
    name: str
    roll_number: str
    timestamp: datetime
    match_distance: float