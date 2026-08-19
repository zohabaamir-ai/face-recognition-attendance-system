from sqlalchemy.orm import Session

from app.db.db_models import Student, AttendanceLog


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
            .order_by(AttendanceLog.timestamp.desc())
            .all()
        )