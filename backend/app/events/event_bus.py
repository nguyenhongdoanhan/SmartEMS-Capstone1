"""Minimal in-process async event bus (enough for a modular monolith)."""
import asyncio
import logging
from collections import defaultdict
from typing import Any, Awaitable, Callable

from app.events.event_types import EventType

logger = logging.getLogger(__name__)
Handler = Callable[[dict[str, Any]], Awaitable[None]]


class EventBus:
    def __init__(self) -> None:
        self._handlers: dict[EventType, list[Handler]] = defaultdict(list)

    def subscribe(self, event_type: EventType, handler: Handler) -> None:
        self._handlers[event_type].append(handler)

    async def publish(self, event_type: EventType, payload: dict[str, Any]) -> None:
        handlers = self._handlers.get(event_type, [])
        results = await asyncio.gather(*(h(payload) for h in handlers), return_exceptions=True)
        for r in results:
            if isinstance(r, Exception):
                logger.exception("Handler failed for %s", event_type, exc_info=r)
        # TODO: persist to models.event_log (audit/replay)


event_bus = EventBus()
