"""Event handlers. Keep them thin: call a service or push a WebSocket message.
If this file grows, split per module (emergency_handlers.py, trip_handlers.py, ...)."""
import logging

from app.core.ws_manager import manager
from app.events.event_bus import event_bus
from app.events.event_types import EventType

logger = logging.getLogger(__name__)


async def on_sos_created(payload: dict) -> None:
    logger.info("SOS created: %s", payload)
    await manager.broadcast("dispatchers", {"type": "new_emergency", **payload})
    # TODO: matching_service.recommend(...) then publish DISPATCH_REQUESTED


async def on_status_changed(payload: dict) -> None:
    await manager.broadcast("dispatchers", {"type": "trip_status", **payload})
    # TODO: also push to emergency:<id> channel so the Caller app sees progress


def register_handlers() -> None:
    event_bus.subscribe(EventType.SOS_CREATED, on_sos_created)
    for et in (EventType.DRIVER_ACCEPTED, EventType.ARRIVED_ON_SCENE, EventType.TRANSPORTING,
               EventType.AT_HOSPITAL, EventType.RETURNING, EventType.TRIP_COMPLETED):
        event_bus.subscribe(et, on_status_changed)
