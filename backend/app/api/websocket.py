from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.core.security import decode_token
from app.core.ws_manager import manager

router = APIRouter()


@router.websocket("/ws")
async def ws_endpoint(websocket: WebSocket, token: str = Query(...)):
    claims = decode_token(token)
    if not claims:
        await websocket.close(code=4401)
        return
    channel = "dispatchers" if claims["role"] in ("dispatcher", "admin") else f"user:{claims['sub']}"
    await manager.connect(channel, websocket)
    try:
        while True:
            await websocket.receive_text()  # TODO: handle client messages (ping, subscribe to emergency:<id>)
    except WebSocketDisconnect:
        manager.disconnect(channel, websocket)
