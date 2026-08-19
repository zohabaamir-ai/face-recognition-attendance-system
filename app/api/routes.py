from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from PIL import Image
import io

from app.db.database import get_db
from app.models.face_model import FaceModel
from app.repository.student_repository import StudentRepository
from app.services.enrollment_service import EnrollmentService
from app.schemas.enrollment_schemas import EnrollmentResponse, EnrollmentError
from app.services.recognition_service import RecognitionService
from app.schemas.recognition_schemas import RecognitionResponse
from app.schemas.student_schemas import StudentResponse
from app.schemas.attendance_schemas import AttendanceResponse

from app.api.auth_dependencies import get_current_admin
from app.db.db_models import Admin

router = APIRouter()

face_model = FaceModel()

def get_enrollment_service(db: Session = Depends(get_db)) -> EnrollmentService:
    student_repository = StudentRepository(db)
    return EnrollmentService(face_model=face_model, student_repository=student_repository)

def get_recognition_service(db: Session = Depends(get_db)) -> RecognitionService:
    student_repository = StudentRepository(db)
    return RecognitionService(face_model=face_model, student_repository=student_repository)


@router.post("/enroll", response_model=EnrollmentResponse)
async def enroll(
    name: str = Form(...),
    roll_number: str = Form(...),
    file: UploadFile = File(...),
    service: EnrollmentService = Depends(get_enrollment_service),
    current_admin: Admin = Depends(get_current_admin),
):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    try:
        return service.enroll_student(name=name, roll_number=roll_number, image=image)
    except EnrollmentError as e:
        raise HTTPException(status_code=400, detail=e.reason)

@router.post("/recognize", response_model=RecognitionResponse)
async def recognize(
    file: UploadFile = File(...),
    service: RecognitionService = Depends(get_recognition_service),
    current_admin: Admin = Depends(get_current_admin),
):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    return service.recognize_faces(image)

@router.get("/students", response_model=list[StudentResponse],)
async def get_students(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    student_repository = StudentRepository(db)

    return student_repository.get_all_students()

@router.get("/attendance", response_model=list[AttendanceResponse],)
async def get_attendance(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    student_repository = StudentRepository(db)

    logs = student_repository.get_attendance_logs()

    return [
        AttendanceResponse(
            id=log.id,
            student_id=log.student_id,
            name=log.student.name,
            roll_number=log.student.roll_number,
            timestamp=log.timestamp,
            match_distance=log.match_distance,
        )
        for log in logs
    ]

@router.delete("/students/{student_id}")
async def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    student_repository = StudentRepository(db)

    deleted = student_repository.delete_student(student_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Student not found.",
        )

    return {
        "message": "Student deleted successfully.",
        "student_id": student_id,
    }