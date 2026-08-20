from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.db_models import Student, AttendanceLog


PAKISTAN_TIMEZONE = ZoneInfo("Asia/Karachi")


class StudentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_student(
        self,
        name: str,
        roll_number: str,
        embedding,
    ) -> Student:
        student = Student(
            name=name,
            roll_number=roll_number,
            embedding=embedding.tolist(),
        )

        self.db.add(student)
        self.db.commit()
        self.db.refresh(student)

        return student

    def get_all_students(self) -> list[Student]:
        return self.db.query(Student).all()

    def get_student_by_id(
        self,
        student_id: int,
    ) -> Student | None:
        return (
            self.db.query(Student)
            .filter(Student.id == student_id)
            .first()
        )

    def delete_student(
        self,
        student_id: int,
    ) -> bool:
        student = self.get_student_by_id(student_id)

        if student is None:
            return False

        self.db.query(AttendanceLog).filter(
            AttendanceLog.student_id == student_id
        ).delete(
            synchronize_session=False
        )

        self.db.delete(student)
        self.db.commit()

        return True

    def log_attendance(
        self,
        student_id: int,
        match_distance: float,
    ) -> AttendanceLog:
        log = AttendanceLog(
            student_id=student_id,
            match_distance=match_distance,
        )

        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)

        return log

    def get_attendance_logs(
        self,
    ) -> list[AttendanceLog]:
        return (
            self.db.query(AttendanceLog)
            .order_by(
                AttendanceLog.timestamp.desc()
            )
            .all()
        )

    def get_filtered_attendance_logs(
        self,
        start_utc: datetime | None = None,
        end_utc: datetime | None = None,
        search: str | None = None,
    ) -> list[AttendanceLog]:
        query = (
            self.db.query(AttendanceLog)
            .join(Student)
        )

        if start_utc is not None:
            query = query.filter(
                AttendanceLog.timestamp >= start_utc
            )

        if end_utc is not None:
            query = query.filter(
                AttendanceLog.timestamp < end_utc
            )

        if search:
            search_term = f"%{search.strip()}%"

            query = query.filter(
                (Student.name.ilike(search_term))
                | (
                    Student.roll_number.ilike(
                        search_term
                    )
                )
            )

        return (
            query
            .order_by(
                AttendanceLog.timestamp.desc()
            )
            .all()
        )

    # --------------------------------------------------
    # Dashboard queries
    # --------------------------------------------------

    def get_total_students(self) -> int:
        return (
            self.db.query(
                func.count(Student.id)
            ).scalar()
            or 0
        )

    def _get_today_utc_range(
        self,
    ) -> tuple[datetime, datetime]:
        """
        Return the UTC start and end timestamps
        corresponding to today in Pakistan.
        """

        now_pakistan = datetime.now(
            PAKISTAN_TIMEZONE
        )

        start_of_day_pakistan = (
            now_pakistan.replace(
                hour=0,
                minute=0,
                second=0,
                microsecond=0,
            )
        )

        start_of_next_day_pakistan = (
            start_of_day_pakistan
            + timedelta(days=1)
        )

        start_of_day_utc = (
            start_of_day_pakistan.astimezone(
                timezone.utc
            )
        )

        start_of_next_day_utc = (
            start_of_next_day_pakistan.astimezone(
                timezone.utc
            )
        )

        return (
            start_of_day_utc,
            start_of_next_day_utc,
        )

    def get_todays_entries(self) -> int:
        start_utc, end_utc = (
            self._get_today_utc_range()
        )

        return (
            self.db.query(
                func.count(AttendanceLog.id)
            )
            .filter(
                AttendanceLog.timestamp >= start_utc,
                AttendanceLog.timestamp < end_utc,
            )
            .scalar()
            or 0
        )

    def get_unique_students_today(self) -> int:
        start_utc, end_utc = (
            self._get_today_utc_range()
        )

        return (
            self.db.query(
                func.count(
                    func.distinct(
                        AttendanceLog.student_id
                    )
                )
            )
            .filter(
                AttendanceLog.timestamp >= start_utc,
                AttendanceLog.timestamp < end_utc,
            )
            .scalar()
            or 0
        )

    def get_average_match_distance_today(
        self,
    ) -> float | None:
        start_utc, end_utc = (
            self._get_today_utc_range()
        )

        result = (
            self.db.query(
                func.avg(
                    AttendanceLog.match_distance
                )
            )
            .filter(
                AttendanceLog.timestamp >= start_utc,
                AttendanceLog.timestamp < end_utc,
            )
            .scalar()
        )

        if result is None:
            return None

        return float(result)

    def get_recent_attendance_logs(
        self,
        limit: int = 10,
    ) -> list[AttendanceLog]:
        return (
            self.db.query(AttendanceLog)
            .order_by(
                AttendanceLog.timestamp.desc()
            )
            .limit(limit)
            .all()
        )
    
    def get_report_entries(
        self,
        start_utc: datetime,
        end_utc: datetime,
        student_id: int | None = None,
    ) -> list[AttendanceLog]:
        query = (
            self.db.query(AttendanceLog)
            .join(Student)
            .filter(
                AttendanceLog.timestamp >= start_utc,
                AttendanceLog.timestamp < end_utc,
            )
        )

        if student_id is not None:
            query = query.filter(
                AttendanceLog.student_id
                == student_id
            )

        return (
            query
            .order_by(
                AttendanceLog.timestamp.desc()
            )
            .all()
        )

    def get_report_unique_students(
        self,
        start_utc: datetime,
        end_utc: datetime,
        student_id: int | None = None,
    ) -> int:
        query = (
            self.db.query(
                func.count(
                    func.distinct(
                        AttendanceLog.student_id
                    )
                )
            )
            .filter(
                AttendanceLog.timestamp >= start_utc,
                AttendanceLog.timestamp < end_utc,
            )
        )

        if student_id is not None:
            query = query.filter(
                AttendanceLog.student_id
                == student_id
            )

        return query.scalar() or 0

    def get_report_total_entries(
        self,
        start_utc: datetime,
        end_utc: datetime,
        student_id: int | None = None,
    ) -> int:
        query = (
            self.db.query(
                func.count(
                    AttendanceLog.id
                )
            )
            .filter(
                AttendanceLog.timestamp >= start_utc,
                AttendanceLog.timestamp < end_utc,
            )
        )

        if student_id is not None:
            query = query.filter(
                AttendanceLog.student_id
                == student_id
            )

        return query.scalar() or 0