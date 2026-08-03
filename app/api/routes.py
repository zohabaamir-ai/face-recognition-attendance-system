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

import os
from fastapi import Header
from dotenv import load_dotenv

load_dotenv()

ADMIN_API_KEY = os.getenv("ADMIN_API_KEY")

def verify_admin_key(x_admin_key: str = Header(...)):
    if x_admin_key != ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing admin API key.")


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
    _: None = Depends(verify_admin_key),
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
):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    return service.recognize_faces(image)