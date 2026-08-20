from sqlalchemy.orm import Session

from app.db.db_models import Notification


class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_notification(
        self,
        notification_type: str,
        title: str,
        message: str,
        severity: str = "info",
        related_student_id: int | None = None,
    ) -> Notification:
        notification = Notification(
            type=notification_type,
            title=title,
            message=message,
            severity=severity,
            related_student_id=related_student_id,
        )

        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)

        return notification

    def get_notifications(
        self,
        limit: int = 20,
    ) -> list[Notification]:
        return (
            self.db.query(Notification)
            .order_by(
                Notification.created_at.desc()
            )
            .limit(limit)
            .all()
        )

    def get_unread_count(self) -> int:
        return (
            self.db.query(Notification)
            .filter(
                Notification.is_read.is_(False)
            )
            .count()
        )

    def mark_as_read(
        self,
        notification_id: int,
    ) -> bool:
        notification = (
            self.db.query(Notification)
            .filter(
                Notification.id
                == notification_id
            )
            .first()
        )

        if notification is None:
            return False

        notification.is_read = True

        self.db.commit()

        return True

    def mark_all_as_read(self) -> int:
        notifications = (
            self.db.query(Notification)
            .filter(
                Notification.is_read.is_(False)
            )
            .all()
        )

        for notification in notifications:
            notification.is_read = True

        self.db.commit()

        return len(notifications)

    def delete_notification(
        self,
        notification_id: int,
    ) -> bool:
        notification = (
            self.db.query(Notification)
            .filter(
                Notification.id
                == notification_id
            )
            .first()
        )

        if notification is None:
            return False

        self.db.delete(notification)
        self.db.commit()

        return True

    def clear_all_notifications(self) -> int:
        count = (
            self.db.query(Notification)
            .count()
        )

        self.db.query(Notification).delete(
            synchronize_session=False
        )

        self.db.commit()

        return count