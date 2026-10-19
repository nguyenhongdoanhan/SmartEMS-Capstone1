from geoalchemy2 import Geometry, WKTElement
from sqlalchemy import cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.events.event_bus import event_bus
from app.events.event_types import EventType
from app.models.emergency import Emergency
from app.schemas.emergency import EmergencyCreate


async def create_emergency(db: AsyncSession, caller_id: int, data: EmergencyCreate) -> Emergency:
    em = Emergency(
        caller_id=caller_id,
        description=data.description,
        location=WKTElement(f"POINT({data.longitude} {data.latitude})", srid=4326),
    )
    db.add(em)
    await db.commit()
    await db.refresh(em)
    await event_bus.publish(EventType.SOS_CREATED, {
        "emergency_id": em.id, "latitude": data.latitude, "longitude": data.longitude,
        "priority": em.priority,
    })
    return em


async def list_emergencies(db: AsyncSession, limit: int = 100) -> list[dict]:
    geom = cast(Emergency.location, Geometry)
    rows = await db.execute(
        select(Emergency, func.ST_Y(geom).label("lat"), func.ST_X(geom).label("lng"))
        .order_by(Emergency.created_at.desc()).limit(limit)
    )
    return [
        {"id": e.id, "status": e.status, "priority": e.priority, "description": e.description,
         "latitude": lat, "longitude": lng, "created_at": e.created_at}
        for e, lat, lng in rows.all()
    ]
