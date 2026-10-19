from fastapi import APIRouter, Depends
from sqlalchemy import cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from geoalchemy2 import Geometry

from app.api.deps import get_db, require_role
from app.models.ambulance import Ambulance
from app.models.user import User
from app.schemas.ambulance import AmbulanceOut, LocationUpdate
from app.services import tracking_service

router = APIRouter()


@router.get("", response_model=list[AmbulanceOut])
async def list_ambulances(db: AsyncSession = Depends(get_db),
                          _: User = Depends(require_role("dispatcher", "admin"))):
    geom = cast(Ambulance.current_location, Geometry)
    rows = await db.execute(select(Ambulance, func.ST_Y(geom), func.ST_X(geom)))
    return [AmbulanceOut(id=a.id, plate_number=a.plate_number, status=a.status,
                         latitude=lat, longitude=lng) for a, lat, lng in rows.all()]


@router.post("/{ambulance_id}/location", status_code=204)
async def post_location(ambulance_id: int, data: LocationUpdate, db: AsyncSession = Depends(get_db),
                        _: User = Depends(require_role("driver", "admin"))):
    # TODO: check the driver is actually assigned to this ambulance
    await tracking_service.update_location(db, ambulance_id, data.latitude, data.longitude,
                                           data.speed, data.heading)
