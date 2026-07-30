from pydantic import BaseModel


class RecognitionResult(BaseModel):
    student_id: int | None
    name: str | None
    distance: float
    matched: bool


class RecognitionResponse(BaseModel):
    results: list[RecognitionResult]