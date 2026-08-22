from fastapi import (APIRouter, Depends, UploadFile, File, Form, HTTPException,)

from sqlalchemy.orm import Session
from PIL import Image
import io

from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

from app.db.database import get_db
from app.db.db_models import Admin

from app.models.face_model import FaceModel

from app.core.permissions import Permission

from app.repository.student_repository import StudentRepository
from app.repository.admin_repository import AdminRepository
from app.repository.notification_repository import (NotificationRepository,)
from app.repository.device_repository import (DeviceRepository,)

from app.services.notification_service import (NotificationService,)
from app.services.device_service import (DeviceService,)
from app.services.enrollment_service import EnrollmentService
from app.services.recognition_service import RecognitionService
from app.services.auth_service import AuthService

from app.schemas.enrollment_schemas import (EnrollmentResponse, EnrollmentError,)
from app.schemas.recognition_schemas import RecognitionResponse
from app.schemas.student_schemas import StudentResponse
from app.schemas.attendance_schemas import AttendanceResponse
from app.schemas.dashboard_schemas import DashboardResponse
from app.schemas.report_schemas import ReportResponse
from app.schemas.device_schemas import (DeviceCreateRequest, DeviceCreateResponse, DeviceHeartbeatRequest, DeviceHeartbeatResponse, DeviceResponse, DeviceUpdateRequest,)
from app.schemas.auth_schemas import (LoginRequest, LoginResponse, LoginUser, ChangePasswordRequest, ChangePasswordResponse, CreateUserRequest, CreateUserResponse, AdminResponse,)

from app.api.auth_dependencies import get_current_admin, require_super_admin, require_password_changed, require_permission


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
        require_password_changed
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
        require_password_changed
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
        require_password_changed
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
        require_password_changed
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
        require_password_changed
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
        require_password_changed
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
        require_permission(
            Permission.DELETE_PERSONS
        )
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

@router.post(
    "/devices/heartbeat",
    response_model=DeviceHeartbeatResponse,
)
async def device_heartbeat(
    request: DeviceHeartbeatRequest,
    db: Session = Depends(get_db),
):
    device_repository = DeviceRepository(db)

    device_service = DeviceService(
        device_repository=device_repository,
    )

    device = (
        device_service.record_heartbeat(
            request.device_key
        )
    )

    return DeviceHeartbeatResponse(
        device_id=device.id,
        name=device.name,
        location=device.location,
        last_seen=device.last_seen,
    )

@router.get(
    "/devices",
    response_model=list[DeviceResponse],
)
async def get_devices(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(
        require_password_changed
    ),
):
    device_repository = DeviceRepository(db)

    device_service = DeviceService(
        device_repository=device_repository,
    )

    devices = (
        device_service
        .get_all_devices()
    )

    return [
        DeviceResponse(
            id=device.id,
            name=device.name,
            location=device.location,
            is_active=device.is_active,
            last_seen=device.last_seen,
        )
        for device in devices
    ]

@router.post(
    "/devices",
    response_model=DeviceCreateResponse,
)
async def create_device(
    request: DeviceCreateRequest,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(
        require_password_changed
    ),
):
    device_repository = DeviceRepository(db)

    device_service = DeviceService(
        device_repository=device_repository,
    )

    device = (
        device_service.create_device(
            name=request.name,
            location=request.location,
        )
    )

    return DeviceCreateResponse(
        id=device.id,
        name=device.name,
        location=device.location,
        is_active=device.is_active,
        device_key=device.device_key,
    )

@router.patch(
    "/devices/{device_id}",
    response_model=DeviceResponse,
)
async def update_device(
    device_id: int,
    request: DeviceUpdateRequest,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(
        require_password_changed
    ),
):
    device_repository = DeviceRepository(db)

    device_service = DeviceService(
        device_repository=device_repository,
    )

    device = (
        device_service.update_device(
            device_id=device_id,
            name=request.name,
            location=request.location,
            is_active=request.is_active,
        )
    )

    return DeviceResponse(
        id=device.id,
        name=device.name,
        location=device.location,
        is_active=device.is_active,
        last_seen=device.last_seen,
    )

@router.delete(
    "/devices/{device_id}",
)
async def decommission_device(
    device_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(
        require_password_changed
    ),
):
    device_repository = DeviceRepository(db)

    device_service = DeviceService(
        device_repository=device_repository,
    )

    device_service.decommission_device(
        device_id=device_id,
    )

    return {
        "message": "Device decommissioned successfully."
    }

@router.post(
    "/auth/change-password",
    response_model=ChangePasswordResponse,
)
async def change_password(
    request: ChangePasswordRequest,
    current_admin: Admin = Depends(
        get_current_admin
    ),
    db: Session = Depends(get_db),
):
    admin_repository = AdminRepository(db)

    service = AuthService(
        admin_repository=admin_repository
    )

    updated_admin = service.change_password(
        admin_id=current_admin.id,
        current_password=request.current_password,
        new_password=request.new_password,
        confirm_password=request.confirm_password,
    )

    access_token = service.create_access_token(
        updated_admin
    )

    return ChangePasswordResponse(
        message="Password changed successfully.",
        access_token=access_token,
        token_type="bearer",
    )

@router.post(
    "/users",
    response_model=CreateUserResponse,
)
async def create_user(
    request: CreateUserRequest,
    current_admin: Admin = Depends(
        require_super_admin
    ),
    db: Session = Depends(get_db),
):
    admin_repository = AdminRepository(db)

    service = AuthService(
        admin_repository=admin_repository,
    )

    admin, temporary_password = (
        service.create_admin(
            full_name=request.full_name,
            username=request.username,
            role=request.role,
        )
    )

    return CreateUserResponse(
        id=admin.id,
        full_name=admin.full_name,
        username=admin.username,
        role=admin.role,
        temporary_password=temporary_password,
    )

@router.get(
    "/users",
    response_model=list[AdminResponse],
)
async def get_users(
    current_admin: Admin = Depends(
        require_super_admin
    ),
    db: Session = Depends(get_db),
):
    admin_repository = AdminRepository(db)

    return admin_repository.get_all_admins()

@router.post(
    "/users/{user_id}/reset-password",
)
async def reset_user_password(
    user_id: int,
    current_admin: Admin = Depends(
        require_super_admin
    ),
    db: Session = Depends(get_db),
):
    admin_repository = AdminRepository(db)

    service = AuthService(
        admin_repository=admin_repository,
    )

    admin, temporary_password = (
        service.reset_admin_password(
            target_admin_id=user_id,
            requesting_admin_id=current_admin.id,
        )
    )

    return {
        "message": "Password reset successfully.",
        "user_id": admin.id,
        "username": admin.username,
        "temporary_password": temporary_password,
    }

@router.patch(
    "/users/{user_id}/status",
)
async def update_user_status(
    user_id: int,
    is_active: bool,
    current_admin: Admin = Depends(
        require_super_admin
    ),
    db: Session = Depends(get_db),
):
    admin_repository = AdminRepository(db)

    service = AuthService(
        admin_repository=admin_repository
    )

    admin = service.update_admin_status(
        target_admin_id=user_id,
        requesting_admin_id=current_admin.id,
        is_active=is_active,
    )

    return {
        "message": (
            "User activated successfully."
            if admin.is_active
            else "User deactivated successfully."
        ),
        "id": admin.id,
        "username": admin.username,
        "is_active": admin.is_active,
    }

@router.patch(
    "/users/{user_id}/role",
)
async def update_user_role(
    user_id: int,
    role: str,
    current_admin: Admin = Depends(
        require_super_admin
    ),
    db: Session = Depends(get_db),
):
    admin_repository = AdminRepository(db)

    service = AuthService(
        admin_repository=admin_repository
    )

    admin = service.update_admin_role(
        target_admin_id=user_id,
        requesting_admin_id=current_admin.id,
        role=role,
    )

    return {
        "message": "User role updated successfully.",
        "id": admin.id,
        "username": admin.username,
        "role": admin.role,
    }