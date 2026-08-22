from datetime import datetime, timedelta, timezone
import os
import secrets
import string

import jwt
from dotenv import load_dotenv
from pwdlib import PasswordHash
from fastapi import HTTPException

from app.db.db_models import Admin


load_dotenv()


SECRET_KEY = os.getenv("JWT_SECRET_KEY")

ALGORITHM = os.getenv(
    "JWT_ALGORITHM",
    "HS256",
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "JWT_ACCESS_TOKEN_EXPIRE_MINUTES",
        "60",
    )
)


if not SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET_KEY is not configured."
    )


class AuthService:
    def __init__(self, admin_repository):
        self.admin_repository = admin_repository
        self.password_hash = PasswordHash.recommended()

    def authenticate_admin(
        self,
        username: str,
        password: str,
    ) -> Admin | None:
        admin = self.admin_repository.get_by_username(
            username
        )

        if admin is None:
            return None

        if not admin.is_active:
            return None

        if not self.password_hash.verify(
            password,
            admin.password_hash,
        ):
            return None

        return admin

    def create_access_token(
        self,
        admin: Admin,
    ) -> str:
        expire = (
            datetime.now(timezone.utc)
            + timedelta(
                minutes=ACCESS_TOKEN_EXPIRE_MINUTES
            )
        )

        payload = {
            "sub": str(admin.id),
            "username": admin.username,
            "role": admin.role,
            "must_change_password": (
                admin.must_change_password
            ),
            "exp": expire,
        }

        return jwt.encode(
            payload,
            SECRET_KEY,
            algorithm=ALGORITHM,
        )

    def change_password(
        self,
        admin_id: int,
        current_password: str,
        new_password: str,
        confirm_password: str,
    ) -> None:

        admin = (
            self.admin_repository
            .get_by_id(admin_id)
        )

        if admin is None:
            raise HTTPException(
                status_code=404,
                detail="Admin account not found.",
            )

        if not admin.is_active:
            raise HTTPException(
                status_code=403,
                detail="This account is disabled.",
            )

        if not self.password_hash.verify(
            current_password,
            admin.password_hash,
        ):
            raise HTTPException(
                status_code=400,
                detail="Current password is incorrect.",
            )

        if new_password != confirm_password:
            raise HTTPException(
                status_code=400,
                detail="New passwords do not match.",
            )

        if len(new_password) < 8:
            raise HTTPException(
                status_code=400,
                detail="New password must be at least 8 characters long.",
            )

        if self.password_hash.verify(
            new_password,
            admin.password_hash,
        ):
            raise HTTPException(
                status_code=400,
                detail="New password must be different from the current password.",
            )

        password_hash = (
            self.password_hash.hash(
                new_password
            )
        )

        admin.password_hash = password_hash
        admin.must_change_password = False

        self.admin_repository.db.commit()
        self.admin_repository.db.refresh(admin)

        return admin


    def generate_temporary_password(
        self,
        length: int = 12,
    ) -> str:
        characters = (
            string.ascii_letters
            + string.digits
            + "!@#$%^&*"
        )

        return "".join(
            secrets.choice(characters)
            for _ in range(length)
        )


    def create_admin(
        self,
        full_name: str,
        username: str,
        role: str,
    ) -> tuple[Admin, str]:

        full_name = full_name.strip()
        username = username.strip()

        if not full_name:
            raise HTTPException(
                status_code=400,
                detail="Full name is required.",
            )

        if not username:
            raise HTTPException(
                status_code=400,
                detail="Username is required.",
            )

        allowed_roles = {
            "admin",
            "operator",
        }

        if role not in allowed_roles:
            raise HTTPException(
                status_code=400,
                detail="Invalid user role.",
            )

        if self.admin_repository.username_exists(
            username
        ):
            raise HTTPException(
                status_code=409,
                detail="Username already exists.",
            )

        temporary_password = (
            self.generate_temporary_password()
        )

        password_hash = (
            self.password_hash.hash(
                temporary_password
            )
        )

        admin = self.admin_repository.create_admin(
            full_name=full_name,
            username=username,
            password_hash=password_hash,
            role=role,
        )

        return admin, temporary_password

    def reset_admin_password(
        self,
        target_admin_id: int,
        requesting_admin_id: int,
    ) -> tuple[Admin, str]:

        if target_admin_id == requesting_admin_id:
            raise HTTPException(
                status_code=400,
                detail=(
                    "You cannot reset your own password "
                    "using this function."
                ),
            )

        admin = self.admin_repository.get_by_id(
            target_admin_id
        )

        if admin is None:
            raise HTTPException(
                status_code=404,
                detail="User not found.",
            )

        temporary_password = (
            self.generate_temporary_password()
        )

        password_hash = (
            self.password_hash.hash(
                temporary_password
            )
        )

        admin = self.admin_repository.update_password(
            admin=admin,
            password_hash=password_hash,
        )

        return admin, temporary_password

    def update_admin_status(
        self,
        target_admin_id: int,
        requesting_admin_id: int,
        is_active: bool,
    ) -> Admin:

        if target_admin_id == requesting_admin_id:
            raise HTTPException(
                status_code=400,
                detail=(
                    "You cannot change your own account status."
                ),
            )

        admin = self.admin_repository.get_by_id(
            target_admin_id
        )

        if admin is None:
            raise HTTPException(
                status_code=404,
                detail="User not found.",
            )

        if admin.role == "super_admin":
            raise HTTPException(
                status_code=403,
                detail=(
                    "Super Admin accounts cannot be "
                    "disabled from this function."
                ),
            )

        return self.admin_repository.update_status(
            admin=admin,
            is_active=is_active,
        )

    def update_admin_role(
        self,
        target_admin_id: int,
        requesting_admin_id: int,
        role: str,
    ) -> Admin:

        if target_admin_id == requesting_admin_id:
            raise HTTPException(
                status_code=400,
                detail="You cannot change your own role.",
            )

        allowed_roles = {
            "admin",
            "operator",
        }

        if role not in allowed_roles:
            raise HTTPException(
                status_code=400,
                detail="Invalid user role.",
            )

        admin = self.admin_repository.get_by_id(
            target_admin_id
        )

        if admin is None:
            raise HTTPException(
                status_code=404,
                detail="User not found.",
            )

        if admin.role == "super_admin":
            raise HTTPException(
                status_code=403,
                detail=(
                    "Super Admin roles cannot be changed "
                    "from this function."
                ),
            )

        return self.admin_repository.update_role(
            admin=admin,
            role=role,
        )