from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.db.db_models import Device


class DeviceRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_key(
        self,
        device_key: str,
    ) -> Device | None:
        return (
            self.db.query(Device)
            .filter(
                Device.device_key == device_key
            )
            .first()
        )

    def get_by_id(
        self,
        device_id: int,
    ) -> Device | None:
        return (
            self.db.query(Device)
            .filter(
                Device.id == device_id
            )
            .first()
        )

    def get_all_devices(
        self,
    ) -> list[Device]:
        return (
            self.db.query(Device)
            .filter(
                Device.decommissioned_at.is_(None)
            )
            .order_by(Device.id)
            .all()
        )

    def update_last_seen(
        self,
        device: Device,
    ) -> Device:
        device.last_seen = datetime.now(
            timezone.utc
        )

        self.db.commit()
        self.db.refresh(device)

        return device

    def create_device(
        self,
        name: str,
        device_key: str,
        location: str,
    ) -> Device:
        device = Device(
            name=name,
            device_key=device_key,
            location=location,
            is_active=True,
            last_seen=None,
        )

        self.db.add(device)
        self.db.commit()
        self.db.refresh(device)

        return device

    def create(
        self,
        name: str,
        location: str,
        device_key: str,
    ) -> Device:
        device = Device(
            name=name,
            location=location,
            device_key=device_key,
            is_active=True,
        )

        self.db.add(device)
        self.db.commit()
        self.db.refresh(device)

        return device
    
    def get_by_id(
        self,
        device_id: int,
    ) -> Device | None:
        return (
            self.db.query(Device)
            .filter(
                Device.id == device_id
            )
            .first()
        )
    
    def update(
        self,
        device: Device,
        name: str | None = None,
        location: str | None = None,
        is_active: bool | None = None,
    ) -> Device:

        if name is not None:
            device.name = name

        if location is not None:
            device.location = location

        if is_active is not None:
            device.is_active = is_active

        self.db.commit()
        self.db.refresh(device)

        return device

    def decommission(
        self,
        device: Device,
    ) -> Device:
        device.is_active = False
        device.decommissioned_at = datetime.now(
            timezone.utc
        )

        self.db.commit()
        self.db.refresh(device)

        return device