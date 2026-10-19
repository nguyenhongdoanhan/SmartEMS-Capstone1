from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.enums import AmbulanceStatus as S
from app.domain.trip_fsm import assert_transition
from app.events.event_bus import event_bus
from app.events.event_types import EventType
from app.models.trip import Trip

TIMESTAMP_FIELD = {S.DISPATCHED: "dispatched_at", S.ON_SCENE: "on_scene_at",
                   S.TRANSPORTING: "transporting_at", S.AT_HOSPITAL: "at_hospital_at",
                   S.RETURNING: "returning_at", S.AVAILABLE: "completed_at"}
EVENT_FOR = {S.DISPATCHED: EventType.DRIVER_ACCEPTED, S.ON_SCENE: EventType.ARRIVED_ON_SCENE,
             S.TRANSPORTING: EventType.TRANSPORTING, S.AT_HOSPITAL: EventType.AT_HOSPITAL,
             S.RETURNING: EventType.RETURNING, S.AVAILABLE: EventType.TRIP_COMPLETED}


async def change_status(db: AsyncSession, trip: Trip, new_status: S) -> Trip:
    """Validate through the FSM, stamp the time, commit, publish the event."""
    assert_transition(S(trip.status), new_status)
    trip.status = new_status.value
    setattr(trip, TIMESTAMP_FIELD[new_status], datetime.now(timezone.utc))
    await db.commit()
    await event_bus.publish(EVENT_FOR[new_status], {"trip_id": trip.id, "status": new_status.value})
    # TODO: keep ambulances.status in sync with trip status
    return trip
