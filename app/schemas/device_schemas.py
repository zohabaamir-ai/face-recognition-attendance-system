from datetime import datetime

from pydantic import BaseModel


class DeviceHeartbeatRequest(BaseModel):
    device_key: str


class DeviceHeartbeatResponse(BaseModel):
    device_id: int
    name: str
    location: str
    last_seen: datetime

class DeviceResponse(BaseModel):
    id: int
    name: str
    location: str
    is_active: bool
    last_seen: datetime | None

class DeviceCreateRequest(BaseModel):
    name: str
    location: str

class DeviceCreateResponse(BaseModel):
    id: int
    name: str
    location: str
    is_active: bool
    device_key: str

class DeviceUpdateRequest(BaseModel):
    name: str | None = None
    location: str | None = None
    is_active: bool | None = None