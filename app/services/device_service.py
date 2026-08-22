from fastapi import HTTPException

from app.db.db_models import Device
from app.repository.device_repository import DeviceRepository

import secrets


class DeviceService:
    def __init__(
        self,
        device_repository: DeviceRepository,
    ):
        self.device_repository = (
            device_repository
        )

    def authenticate_device(
        self,
        device_key: str,
    ) -> Device:
        device = (
            self.device_repository
            .get_by_key(device_key)
        )

        if device is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid device credentials.",
            )

        if device.decommissioned_at is not None:
            raise HTTPException(
                status_code=403,
                detail="This device has been decommissioned.",
            )

        if not device.is_active:
            raise HTTPException(
                status_code=403,
                detail="This device has been disabled.",
            )

        return device

    def record_heartbeat(
        self,
        device_key: str,
    ) -> Device:
        device = self.authenticate_device(
            device_key
        )

        return (
            self.device_repository
            .update_last_seen(device)
        )

    def get_all_devices(
        self,
    ) -> list[Device]:
        return (
            self.device_repository
            .get_all_devices()
        )

    def create_device(
        self,
        name: str,
        location: str,
    ) -> Device:
        device_key = secrets.token_urlsafe(32)

        return (
            self.device_repository.create(
                name=name,
                location=location,
                device_key=device_key,
            )
        )

    def update_device(
        self,
        device_id: int,
        name: str | None = None,
        location: str | None = None,
        is_active: bool | None = None,
    ) -> Device:

        device = (
            self.device_repository
            .get_by_id(device_id)
        )

        if device is None:
            raise HTTPException(
                status_code=404,
                detail="Device not found.",
            )

        if (
            name is None
            and location is None
            and is_active is None
        ):
            raise HTTPException(
                status_code=400,
                detail="No device fields were provided.",
            )

        return (
            self.device_repository.update(
                device=device,
                name=name,
                location=location,
                is_active=is_active,
            )
        )

    def decommission_device(
        self,
        device_id: int,
    ) -> Device:
        device = (
            self.device_repository
            .get_by_id(device_id)
        )

        if device is None:
            raise HTTPException(
                status_code=404,
                detail="Device not found.",
            )

        if device.decommissioned_at is not None:
            raise HTTPException(
                status_code=400,
                detail="Device has already been decommissioned.",
            )

        return (
            self.device_repository
            .decommission(device)
        )