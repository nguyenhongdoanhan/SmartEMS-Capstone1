"""In-process WebSocket connection registry.

Channels: "dispatchers", "emergency:<id>", "ambulance:<id>", "user:<id>".
NOTE: with more than one uvicorn worker, broadcasts must fan out through Redis pub/sub
(TODO) otherwise clients only see events produced by their own worker.
"""
from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active: dict[str, set[WebSocket]] = defaultdict(set)

    async def connect(self, channel: str, ws: WebSocket) -> None:
        await ws.accept()
        self.active[channel].add(ws)

    def disconnect(self, channel: str, ws: WebSocket) -> None:
        self.active[channel].discard(ws)

    async def broadcast(self, channel: str, message: dict) -> None:
        for ws in list(self.active.get(channel, ())):
            try:
                await ws.send_json(message)
            except Exception:
                self.disconnect(channel, ws)


manager = ConnectionManager()
