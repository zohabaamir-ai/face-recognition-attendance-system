from pydantic import BaseModel


class EnrollmentResponse(BaseModel):
    student_id: int
    name: str
    message: str

class EnrollmentError(Exception):
    def __init__(self, reason: str):
        self.reason = reason
        super().__init__(reason)