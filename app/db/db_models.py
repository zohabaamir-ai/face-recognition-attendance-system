from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey, ARRAY, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship, DeclarativeBase


class Base(DeclarativeBase):
    pass

class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    roll_number: Mapped[str] = mapped_column(String(50), unique=True)
    embedding: Mapped[list[float]] = mapped_column(ARRAY(Float))

    attendance_logs: Mapped[list["AttendanceLog"]] = relationship(back_populates="student")

class AttendanceLog(Base):
    __tablename__ = "attendance_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"))
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    match_distance: Mapped[float] = mapped_column(Float)

    student: Mapped["Student"] = relationship(back_populates="attendance_logs")