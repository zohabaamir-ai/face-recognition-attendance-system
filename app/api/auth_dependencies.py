import os

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from app.core.permissions import (
    Permission,
    has_permission,
)
from sqlalchemy.orm import Session

from app.db.db_models import Admin
from app.db.database import get_db


load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv(
    "JWT_ALGORITHM",
    "HS256",
)

security = HTTPBearer()


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
    db: Session = Depends(get_db),
) -> Admin:

    if not SECRET_KEY:
        raise HTTPException(
            status_code=500,
            detail="JWT secret is not configured.",
        )

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        admin_id = payload.get("sub")

        if admin_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token.",
            )

        try:
            admin_id = int(admin_id)
        except (TypeError, ValueError):
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token.",
            )

        admin = (
            db.query(Admin)
            .filter(Admin.id == admin_id)
            .first()
        )

        if admin is None:
            raise HTTPException(
                status_code=401,
                detail="Admin account not found.",
            )

        if not admin.is_active:
            raise HTTPException(
                status_code=403,
                detail="This account has been disabled.",
            )

        return admin

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Authentication token has expired.",
        )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token.",
        )


def require_super_admin(
    admin: Admin = Depends(
        get_current_admin
    ),
) -> Admin:

    if admin.role != "super_admin":
        raise HTTPException(
            status_code=403,
            detail="Super Admin access required.",
        )

    return admin

def require_password_changed(
    admin: Admin = Depends(
        get_current_admin
    ),
) -> Admin:

    if admin.must_change_password:
        raise HTTPException(
            status_code=403,
            detail=(
                "Password change required "
                "before accessing the system."
            ),
        )

    return admin

def require_permission(
    permission: Permission,
):
    def dependency(
        admin: Admin = Depends(
            require_password_changed
        ),
    ) -> Admin:

        if not has_permission(
            admin.role,
            permission,
        ):
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to perform this action.",
            )

        return admin

    return dependency