from datetime import datetime, timedelta, timezone
import os

import jwt
from dotenv import load_dotenv
from pwdlib import PasswordHash

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
        admin = self.admin_repository.get_by_username(username)

        if admin is None:
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
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

        payload = {
            "sub": str(admin.id),
            "username": admin.username,
            "exp": expire,
        }

        return jwt.encode(
            payload,
            SECRET_KEY,
            algorithm=ALGORITHM,
        )