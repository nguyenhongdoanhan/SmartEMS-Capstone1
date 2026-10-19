"""Road routing via self-hosted OSRM, with a straight-line fallback when OSRM is down."""
import math
from dataclasses import dataclass

import httpx

from app.core.config import settings


@dataclass
class RouteResult:
    distance_m: float
    duration_s: float
    geometry: dict | None  # GeoJSON LineString (None in fallback mode)
    source: str            # "osrm" | "fallback"


def haversine_m(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6_371_000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi, dlmb = p2 - p1, math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


async def get_route(origin: tuple[float, float], dest: tuple[float, float]) -> RouteResult:
    """origin/dest are (lat, lng)."""
    url = (f"{settings.osrm_url}/route/v1/driving/"
           f"{origin[1]},{origin[0]};{dest[1]},{dest[0]}")
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(url, params={"overview": "full", "geometries": "geojson"})
            resp.raise_for_status()
            route = resp.json()["routes"][0]
            return RouteResult(route["distance"], route["duration"], route["geometry"], "osrm")
    except Exception:
        dist = haversine_m(*origin, *dest)
        speed_ms = settings.fallback_speed_kmh * 1000 / 3600
        return RouteResult(dist, dist / speed_ms, None, "fallback")
