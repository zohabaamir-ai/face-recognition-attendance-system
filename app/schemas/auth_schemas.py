from pydantic import BaseModel
from datetime import datetime


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginUser(BaseModel):
    id: int
    username: str
    role: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    must_change_password: bool
    user: LoginUser


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str


class ChangePasswordResponse(BaseModel):
    message: str
    access_token: str
    token_type: str


class CreateUserRequest(BaseModel):
    full_name: str
    username: str
    role: str = "operator"


class CreateUserResponse(BaseModel):
    id: int
    full_name: str
    username: str
    role: str
    temporary_password: str


class AdminResponse(BaseModel):
    id: int
    full_name: str
    username: str
    role: str
    is_active: bool
    must_change_password: bool
    created_at: datetime