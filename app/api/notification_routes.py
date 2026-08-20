from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.db_models import Admin
from app.repository.notification_repository import (
    NotificationRepository,
)
from app.services.notification_service import (
    NotificationService,
)
from app.schemas.notification_schemas import (
    NotificationResponse,
    UnreadNotificationCountResponse,
    MarkAllNotificationsReadResponse,
)

from app.api.auth_dependencies import (
    get_current_admin,
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


def get_notification_service(
    db: Session = Depends(get_db),
) -> NotificationService:
    notification_repository = (
        NotificationRepository(db)
    )

    return NotificationService(
        notification_repository=
            notification_repository,
    )


@router.get(
    "",
    response_model=list[NotificationResponse],
)
async def get_notifications(
    limit: int = 20,
    service: NotificationService = Depends(
        get_notification_service
    ),
    current_admin: Admin = Depends(
        get_current_admin
    ),
):
    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=400,
            detail="Limit must be between 1 and 100.",
        )

    return service.get_notifications(
        limit=limit
    )


@router.get(
    "/unread-count",
    response_model=UnreadNotificationCountResponse,
)
async def get_unread_notification_count(
    service: NotificationService = Depends(
        get_notification_service
    ),
    current_admin: Admin = Depends(
        get_current_admin
    ),
):
    count = service.get_unread_count()

    return UnreadNotificationCountResponse(
        count=count
    )


@router.patch(
    "/{notification_id}/read",
)
async def mark_notification_as_read(
    notification_id: int,
    service: NotificationService = Depends(
        get_notification_service
    ),
    current_admin: Admin = Depends(
        get_current_admin
    ),
):
    updated = service.mark_as_read(
        notification_id
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Notification not found.",
        )

    return {
        "message": "Notification marked as read."
    }


@router.patch(
    "/read-all",
    response_model=MarkAllNotificationsReadResponse,
)
async def mark_all_notifications_as_read(
    service: NotificationService = Depends(
        get_notification_service
    ),
    current_admin: Admin = Depends(
        get_current_admin
    ),
):
    updated_count = (
        service.mark_all_as_read()
    )

    return MarkAllNotificationsReadResponse(
        updated_count=updated_count
    )


@router.delete(
    "/{notification_id}",
)
async def delete_notification(
    notification_id: int,
    service: NotificationService = Depends(
        get_notification_service
    ),
    current_admin: Admin = Depends(
        get_current_admin
    ),
):
    deleted = service.delete_notification(
        notification_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Notification not found.",
        )

    return {
        "message": "Notification deleted successfully."
    }


@router.delete("")
async def clear_all_notifications(
    service: NotificationService = Depends(
        get_notification_service
    ),
    current_admin: Admin = Depends(
        get_current_admin
    ),
):
    deleted_count = (
        service.clear_all_notifications()
    )

    return {
        "message": "Notifications cleared successfully.",
        "deleted_count": deleted_count,
    }