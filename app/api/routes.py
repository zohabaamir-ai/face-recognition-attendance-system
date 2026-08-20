from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    HTTPException,
)

from sqlalchemy.orm import Session
from PIL import Image
import io

from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

from app.db.database import get_db
from app.db.db_models import Admin

from app.models.face_model import FaceModel

from app.repository.student_repository import StudentRepository
from app.repository.notification_repository import (
    NotificationRepository,
)

from app.services.notification_service import (
    NotificationService,
)
from app.services.enrollment_service import EnrollmentService
from app.services.recognition_service import RecognitionService

from app.schemas.enrollment_schemas import (
    EnrollmentResponse,
    EnrollmentError,
)
from app.schemas.recognition_schemas import RecognitionResponse
from app.schemas.student_schemas import StudentResponse
from app.schemas.attendance_schemas import AttendanceResponse
from app.schemas.dashboard_schemas import DashboardResponse
from app.schemas.report_schemas import ReportResponse

from app.api.auth_dependencies import get_current_admin



router = APIRouter()

PAKISTAN_TIMEZONE = ZoneInfo("Asia/Karachi")

face_model = FaceModel()


def get_enrollment_service(
    db: Session = Depends(get_db),
) -> EnrollmentService:

    student_repository = StudentRepository(db)

    notification_repository = (
        NotificationRepository(db)
    )

    notification_service = (
        NotificationService(
            notification_repository=
                notification_repository,
        )
    )

    return EnrollmentService(
        face_model=face_model,
        student_repository=student_repository,
        notification_service=
            notification_service,
    )

def get_recognition_service(
    db: Session = Depends(get_db),
) -> RecognitionService:

    student_repository = StudentRepository(db)

    notification_repository = (
        NotificationRepository(db)
    )

    notification_service = (
        NotificationService(
            notification_repository=
                notification_repository,
        )
    )

    return RecognitionService(
        face_model=face_model,
        student_repository=student_repository,
        notification_service=
            notification_service,
    )


@router.post(
    "/enroll",
    response_model=EnrollmentResponse,
)
async def enroll(
    name: str = Form(...),
    roll_number: str = Form(...),
    file: UploadFile = File(...),
    service: EnrollmentService = Depends(
        get_enrollment_service
    ),
    current_admin: Admin = Depends(
        get_current_admin
    ),
):
    image_bytes = await file.read()

    image = Image.open(
        io.BytesIO(image_bytes)
    ).convert("RGB")

    try:
        return service.enroll_student(
            name=name,
            roll_number=roll_number,
            image=image,
        )

    except EnrollmentError as e:
        raise HTTPException(
            status_code=400,
            detail=e.reason,
        )


@router.post(
    "/recognize",
    response_model=RecognitionResponse,
)
async def recognize(
    file: UploadFile = File(...),
    service: RecognitionService = Depends(
        get_recognition_service
    ),
    current_admin: Admin = Depends(
        get_current_admin
    ),
):
    image_bytes = await file.read()

    image = Image.open(
        io.BytesIO(image_bytes)
    ).convert("RGB")

    try:
        return service.recognize_faces(image)

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.get(
    "/students",
    response_model=list[StudentResponse],
)
async def get_students(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(
        get_current_admin
    ),
):
    student_repository = StudentRepository(db)

    return student_repository.get_all_students()


@router.get(
    "/attendance",
    response_model=list[AttendanceResponse],
)
async def get_attendance(
    start_date: date | None = None,
    end_date: date | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(
        get_current_admin
    ),
):
    start_utc = None
    end_utc = None

    if start_date is not None:
        start_of_day_pakistan = (
            datetime.combine(
                start_date,
                time.min,
            ).replace(
                tzinfo=PAKISTAN_TIMEZONE
            )
        )

        start_utc = (
            start_of_day_pakistan.astimezone(
                timezone.utc
            )
        )

    if end_date is not None:
        end_of_day_pakistan = (
            datetime.combine(
                end_date + timedelta(days=1),
                time.min,
            ).replace(
                tzinfo=PAKISTAN_TIMEZONE
            )
        )

        end_utc = (
            end_of_day_pakistan.astimezone(
                timezone.utc
            )
        )

    if (
        start_date is not None
        and end_date is not None
        and end_date < start_date
    ):
        raise HTTPException(
            status_code=400,
            detail="End date cannot be before start date.",
        )

    student_repository = StudentRepository(db)

    logs = (
        student_repository
        .get_filtered_attendance_logs(
            start_utc=start_utc,
            end_utc=end_utc,
            search=search,
        )
    )

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

@router.get(
    "/dashboard",
    response_model=DashboardResponse,
)
async def get_dashboard(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(
        get_current_admin
    ),
):
    student_repository = StudentRepository(db)

    recent_logs = (
        student_repository
        .get_recent_attendance_logs(limit=10)
    )

    recent_entries = [
        {
            "id": log.id,
            "student_id": log.student_id,
            "name": log.student.name,
            "roll_number": log.student.roll_number,
            "timestamp": log.timestamp,
            "match_distance": log.match_distance,
        }
        for log in recent_logs
    ]

    return DashboardResponse(
        total_students=(
            student_repository
            .get_total_students()
        ),
        todays_entries=(
            student_repository
            .get_todays_entries()
        ),
        unique_students_today=(
            student_repository
            .get_unique_students_today()
        ),
        average_match_distance=(
            student_repository
            .get_average_match_distance_today()
        ),
        recent_entries=recent_entries,
    )

@router.get(
    "/reports",
    response_model=ReportResponse,
)
async def get_reports(
    start_date: date,
    end_date: date,
    student_id: int | None = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(
        get_current_admin
    ),
):
    if end_date < start_date:
        raise HTTPException(
            status_code=400,
            detail="End date cannot be before start date.",
        )

    start_of_day_pakistan = datetime.combine(
        start_date,
        time.min,
    ).replace(
        tzinfo=PAKISTAN_TIMEZONE
    )

    end_of_day_pakistan = datetime.combine(
        end_date + timedelta(days=1),
        time.min,
    ).replace(
        tzinfo=PAKISTAN_TIMEZONE
    )

    start_utc = (
        start_of_day_pakistan.astimezone(
            timezone.utc
        )
    )

    end_utc = (
        end_of_day_pakistan.astimezone(
            timezone.utc
        )
    )

    student_repository = StudentRepository(db)

    total_entries = (
        student_repository.get_report_total_entries(
            start_utc=start_utc,
            end_utc=end_utc,
            student_id=student_id,
        )
    )

    unique_students = (
        student_repository.get_report_unique_students(
            start_utc=start_utc,
            end_utc=end_utc,
            student_id=student_id,
        )
    )

    logs = (
        student_repository.get_report_entries(
            start_utc=start_utc,
            end_utc=end_utc,
            student_id=student_id,
        )
    )

    entries = [
        {
            "id": log.id,
            "student_id": log.student_id,
            "name": log.student.name,
            "roll_number": log.student.roll_number,
            "timestamp": log.timestamp,
            "match_distance": log.match_distance,
        }
        for log in logs
    ]

    return ReportResponse(
        total_entries=total_entries,
        unique_students=unique_students,
        entries=entries,
    )

@router.delete(
    "/students/{student_id}"
)
async def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(
        get_current_admin
    ),
):
    student_repository = StudentRepository(db)

    deleted = (
        student_repository.delete_student(
            student_id
        )
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Student not found.",
        )

    return {
        "message": "Student deleted successfully.",
        "student_id": student_id,
    }