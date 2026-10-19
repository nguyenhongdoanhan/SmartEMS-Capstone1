"""Simulate an ambulance driving a route and posting GPS updates.

  python tools/gps_simulator.py --token <DRIVER_JWT> --ambulance 1 \
      --from 16.0471,108.2208 --to 16.0720,108.2150 --interval 1

Uses OSRM for a realistic road path; falls back to a straight line if OSRM is unreachable.
Requires: pip install httpx
"""
import argparse
import os
import time

import httpx

API = os.getenv("API_URL", "http://localhost:8000/api/v1")
OSRM = os.getenv("OSRM_URL", "http://localhost:5000")


def parse(s: str) -> tuple[float, float]:
    lat, lng = s.split(",")
    return float(lat), float(lng)


def road_path(a, b, steps=60):
    try:
        r = httpx.get(f"{OSRM}/route/v1/driving/{a[1]},{a[0]};{b[1]},{b[0]}",
                      params={"overview": "full", "geometries": "geojson"}, timeout=5)
        r.raise_for_status()
        return [(lat, lng) for lng, lat in r.json()["routes"][0]["geometry"]["coordinates"]]
    except Exception:
        print("OSRM unavailable -> straight line")
        return [(a[0] + (b[0] - a[0]) * i / steps, a[1] + (b[1] - a[1]) * i / steps) for i in range(steps + 1)]


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--token", required=True)
    p.add_argument("--ambulance", type=int, required=True)
    p.add_argument("--from", dest="src", required=True)
    p.add_argument("--to", dest="dst", required=True)
    p.add_argument("--interval", type=float, default=1.0)
    args = p.parse_args()

    headers = {"Authorization": f"Bearer {args.token}"}
    for lat, lng in road_path(parse(args.src), parse(args.dst)):
        r = httpx.post(f"{API}/ambulances/{args.ambulance}/location",
                       json={"latitude": lat, "longitude": lng}, headers=headers, timeout=5)
        print(f"{lat:.5f},{lng:.5f} -> {r.status_code}")
        time.sleep(args.interval)


if __name__ == "__main__":
    main()
