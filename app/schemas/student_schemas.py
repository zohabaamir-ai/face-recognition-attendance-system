from datetime import datetime

from pydantic import BaseModel, ConfigDict


class StudentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    roll_number: str