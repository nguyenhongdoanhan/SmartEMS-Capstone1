"""Shared async Redis client (cache, GEO index of live ambulance positions, pub/sub fan-out)."""
import redis.asyncio as redis

from app.core.config import settings

redis_client = redis.from_url(settings.redis_url, decode_responses=True)
