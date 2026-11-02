from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from geoalchemy2 import Geometry

from app.api.deps import get_db, require_role
from app.models.ambulance import Ambulance
from app.models.user import DriverProfile, User
from app.schemas.ambulance import AmbulanceOut, LocationUpdate, StatusUpdate
from app.services import tracking_service

router = APIRouter()


async def ensure_driver_assigned(db: AsyncSession, user: User, ambulance_id: int) -> None:
    """Admin được phép mọi xe; driver chỉ được thao tác với xe mình được giao."""
    if user.role == "admin":
        return
    result = await db.execute(
        select(DriverProfile).where(DriverProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()
    if profile is None or profile.ambulance_id != ambulance_id:
        raise HTTPException(status_code=403, detail="Driver is not assigned to this ambulance")


@router.get("", response_model=list[AmbulanceOut])
async def list_ambulances(db: AsyncSession = Depends(get_db),
                          _: User = Depends(require_role("dispatcher", "admin"))):
    geom = cast(Ambulance.current_location, Geometry)
    rows = await db.execute(select(Ambulance, func.ST_Y(geom), func.ST_X(geom)))
    return [AmbulanceOut(id=a.id, plate_number=a.plate_number, status=a.status,
                         latitude=lat, longitude=lng) for a, lat, lng in rows.all()]


@router.post("/{ambulance_id}/location", status_code=204)
async def post_location(ambulance_id: int, data: LocationUpdate, db: AsyncSession = Depends(get_db),
                        user: User = Depends(require_role("driver", "admin"))):
    await ensure_driver_assigned(db, user, ambulance_id)
    await tracking_service.update_location(db, ambulance_id, data.latitude, data.longitude,
                                           data.speed, data.heading)


@router.patch("/{ambulance_id}/status", response_model=AmbulanceOut)
async def update_status(ambulance_id: int, data: StatusUpdate,
                        db: AsyncSession = Depends(get_db),
                        user: User = Depends(require_role("driver", "admin"))):
    await ensure_driver_assigned(db, user, ambulance_id)
    ambulance = await db.get(Ambulance, ambulance_id)
    if ambulance is None:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    ambulance.status = data.status
    await db.commit()
    geom = cast(Ambulance.current_location, Geometry)
    row = (await db.execute(
        select(func.ST_Y(geom), func.ST_X(geom)).where(Ambulance.id == ambulance_id)
    )).one()
    return AmbulanceOut(id=ambulance.id, plate_number=ambulance.plate_number,
                        status=ambulance.status, latitude=row[0], longitude=row[1])
                    