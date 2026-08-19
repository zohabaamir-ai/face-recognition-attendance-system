from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.repository.admin_repository import AdminRepository
from app.services.auth_service import AuthService
from app.schemas.auth_schemas import LoginRequest, LoginResponse


router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_auth_service(
    db: Session = Depends(get_db),
) -> AuthService:
    admin_repository = AdminRepository(db)

    return AuthService(
        admin_repository=admin_repository,
    )


@router.post("/login", response_model=LoginResponse)
async def login(
    credentials: LoginRequest,
    service: AuthService = Depends(get_auth_service),
):
    admin = service.authenticate_admin(
        username=credentials.username,
        password=credentials.password,
    )

    if admin is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password.",
        )

    access_token = service.create_access_token(admin)

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
    )