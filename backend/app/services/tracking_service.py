from geoalchemy2 import WKTElement
from sqlalchemy import func, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ws_manager import manager
from app.models.ambulance import Ambulance


async def update_location(db: AsyncSession, ambulance_id: int, lat: float, lng: float,
                          speed: float | None = None, heading: float | None = None) -> None:
    point = WKTElement(f"POINT({lng} {lat})", srid=4326)
    await db.execute(update(Ambulance).where(Ambulance.id == ambulance_id)
                     .values(current_location=point, last_seen_at=func.now()))
    await db.commit()
    await manager.broadcast("dispatchers", {
        "type": "ambulance_location", "ambulance_id": ambulance_id,
        "latitude": lat, "longitude": lng, "speed": speed, "heading": heading,
    })
    # TODO: Redis GEOADD for fast nearby lookups; throttled/batched insert into gps_locations
