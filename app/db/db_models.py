from datetime import datetime, timezone

from sqlalchemy import String, DateTime, ForeignKey, ARRAY, Float, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship, DeclarativeBase


class Base(DeclarativeBase):
    pass


class Admin(Base):
    __tablename__ = "admins"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    full_name: Mapped[str] = mapped_column(
        String(100),
    )

    username: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255)
    )

    role: Mapped[str] = mapped_column(
        String(30),
        default="operator",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    must_change_password: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

class Device(Base):
    __tablename__ = "devices"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
    )

    device_key: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
    )

    location: Mapped[str] = mapped_column(
        String(100),
    )

    is_active: Mapped[bool] = mapped_column(
        default=True,
    )

    last_seen: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    decommissioned_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    name: Mapped[str] = mapped_column(
        String(100)
    )

    roll_number: Mapped[str] = mapped_column(
        String(50),
        unique=True,
    )

    embedding: Mapped[list[float]] = mapped_column(
        ARRAY(Float)
    )

    attendance_logs: Mapped[list["AttendanceLog"]] = relationship(
        back_populates="student",
        cascade="all, delete-orphan",
    )


class AttendanceLog(Base):
    __tablename__ = "attendance_logs"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id")
    )

    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    match_distance: Mapped[float] = mapped_column(
        Float
    )

    student: Mapped["Student"] = relationship(
        back_populates="attendance_logs"
    )

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    type: Mapped[str] = mapped_column(
        String(30)
    )

    title: Mapped[str] = mapped_column(
        String(150)
    )

    message: Mapped[str] = mapped_column(
        String(500)
    )

    severity: Mapped[str] = mapped_column(
        String(20),
        default="info",
    )

    is_read: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    related_student_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "students.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    related_student: Mapped["Student | None"] = relationship()