from sqlalchemy.orm import Session
from app.db.db_models import Student, AttendanceLog


class StudentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_student(self, name: str, roll_number: str, embedding) -> Student:
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

    def log_attendance(self, student_id: int, match_distance: float) -> AttendanceLog:
        log = AttendanceLog(student_id=student_id, match_distance=match_distance)
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log