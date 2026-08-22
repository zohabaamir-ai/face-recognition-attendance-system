from sqlalchemy.orm import Session

from app.db.db_models import Admin


class AdminRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_username(
        self,
        username: str,
    ) -> Admin | None:
        return (
            self.db.query(Admin)
            .filter(
                Admin.username == username
            )
            .first()
        )

    def get_by_id(
        self,
        admin_id: int,
    ) -> Admin | None:
        return (
            self.db.query(Admin)
            .filter(
                Admin.id == admin_id
            )
            .first()
        )

    def update_password(
        self,
        admin: Admin,
        password_hash: str,
    ) -> Admin:
        admin.password_hash = password_hash
        admin.must_change_password = True

        self.db.commit()
        self.db.refresh(admin)

        return admin

    def create_admin(
        self,
        full_name: str,
        username: str,
        password_hash: str,
        role: str,
    ) -> Admin:
        admin = Admin(
            full_name=full_name,
            username=username,
            password_hash=password_hash,
            role=role,
            is_active=True,
            must_change_password=True,
        )

        self.db.add(admin)
        self.db.commit()
        self.db.refresh(admin)

        return admin

    def username_exists(
        self,
        username: str,
    ) -> bool:
        return (
            self.db.query(Admin)
            .filter(Admin.username == username)
            .first()
            is not None
        )

    def get_all_admins(self) -> list[Admin]:
        return (
            self.db.query(Admin)
            .order_by(Admin.id.asc())
            .all()
        )

    def update_status(
        self,
        admin: Admin,
        is_active: bool,
    ) -> Admin:
        admin.is_active = is_active

        self.db.commit()
        self.db.refresh(admin)

        return admin

    def update_role(
        self,
        admin: Admin,
        role: str,
    ) -> Admin:
        admin.role = role

        self.db.commit()
        self.db.refresh(admin)

        return admin