# OSRM data preparation (one time)

1. Download an OSM extract for your area (e.g. Vietnam from Geofabrik) into `docker/osrm/data/region.osm.pbf`.
2. Run:
```bash
cd docker/osrm/data
docker run --rm -v "$PWD:/data" osrm/osrm-backend osrm-extract   -p /opt/car.lua /data/region.osm.pbf
docker run --rm -v "$PWD:/data" osrm/osrm-backend osrm-partition /data/region.osrm
docker run --rm -v "$PWD:/data" osrm/osrm-backend osrm-customize /data/region.osrm
```
3. Start: `docker compose --profile routing up osrm`
4. Test: `curl "http://localhost:5000/route/v1/driving/108.22,16.05;108.24,16.07"`

A full-Vietnam extract needs a few GB of RAM to process; start with a smaller region if needed.
`data/` is git-ignored. If OSRM is down the backend falls back to straight-line ETA (routing_service.py).
