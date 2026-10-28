from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import ambulances, auth, dispatch, emergencies, hospitals, stations, users, websocket
from app.core.config import settings
from app.core.redis import redis_client
from app.events.handlers import register_handlers


@asynccontextmanager
async def lifespan(app: FastAPI):
    register_handlers()
    yield
    await redis_client.aclose()


app = FastAPI(title=f"{settings.app_name} API", lifespan=lifespan)

# Đã bật CORS cho phép tất cả các nguồn gọi vào để dứt điểm lỗi 400 Bad Request
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API = "/api/v1"
app.include_router(auth.router, prefix=f"{API}/auth", tags=["auth"])
app.include_router(users.router, prefix=f"{API}/users", tags=["users"])
app.include_router(emergencies.router, prefix=f"{API}/emergencies", tags=["emergencies"])
app.include_router(ambulances.router, prefix=f"{API}/ambulances", tags=["ambulances"])
app.include_router(dispatch.router, prefix=f"{API}/dispatch", tags=["dispatch"])
app.include_router(hospitals.router, prefix=f"{API}/hospitals", tags=["hospitals"])
app.include_router(stations.router, prefix=f"{API}/stations", tags=["stations"])
app.include_router(websocket.router, tags=["websocket"])


@app.get("/health")
async def health():
    return {"status": "ok"}