from app.repository.notification_repository import (
    NotificationRepository,
)


class NotificationService:
    def __init__(
        self,
        notification_repository: NotificationRepository,
    ):
        self.notification_repository = (
            notification_repository
        )

    def create_student_registered_notification(
        self,
        student_id: int,
        student_name: str,
    ):
        return (
            self.notification_repository
            .create_notification(
                notification_type="student",
                title="New student registered",
                message=(
                    f"{student_name} was successfully "
                    "registered in the system."
                ),
                severity="success",
                related_student_id=student_id,
            )
        )

    def create_attendance_notification(
        self,
        student_id: int,
        student_name: str,
    ):
        return (
            self.notification_repository
            .create_notification(
                notification_type="attendance",
                title="Student recognized",
                message=(
                    f"{student_name} was successfully "
                    "recognized."
                ),
                severity="success",
                related_student_id=student_id,
            )
        )

    def create_unknown_face_notification(self):
        return (
            self.notification_repository
            .create_notification(
                notification_type="warning",
                title="Unknown face detected",
                message=(
                    "A face was detected but could "
                    "not be matched to a registered student."
                ),
                severity="warning",
            )
        )

    def create_system_notification(
        self,
        title: str,
        message: str,
        severity: str = "info",
    ):
        return (
            self.notification_repository
            .create_notification(
                notification_type="system",
                title=title,
                message=message,
                severity=severity,
            )
        )

    def get_notifications(
        self,
        limit: int = 20,
    ):
        return (
            self.notification_repository
            .get_notifications(limit=limit)
        )

    def get_unread_count(self):
        return (
            self.notification_repository
            .get_unread_count()
        )

    def mark_as_read(
        self,
        notification_id: int,
    ):
        return (
            self.notification_repository
            .mark_as_read(notification_id)
        )

    def mark_all_as_read(self):
        return (
            self.notification_repository
            .mark_all_as_read()
        )

    def delete_notification(
        self,
        notification_id: int,
    ):
        return (
            self.notification_repository
            .delete_notification(
                notification_id
            )
        )

    def clear_all_notifications(self):
        return (
            self.notification_repository
            .clear_all_notifications()
        )