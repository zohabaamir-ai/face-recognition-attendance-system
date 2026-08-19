import os

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.db.db_models import Admin


load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

security = HTTPBearer()


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
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
        username = payload.get("username")

        if admin_id is None or username is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token.",
            )

        return Admin(
            id=int(admin_id),
            username=username,
        )

    except (jwt.InvalidTokenError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token.",
        )