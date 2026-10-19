# SmartEMS - Real-Time Emergency Dispatch & Ambulance Management

Capstone 1 (CMU-SE 450). Modular monolith: FastAPI + PostgreSQL/PostGIS + Redis + WebSocket, React dispatcher dashboard, two React Native (Expo) apps.

## Quick start
```bash
cp backend/.env.example backend/.env
cp dispatcher-web/.env.example dispatcher-web/.env
docker compose up -d db redis
docker compose up --build backend dispatcher-web

# create tables, then sample data and an admin
docker compose exec backend alembic revision --autogenerate -m "init"
docker compose exec backend alembic upgrade head
docker compose exec db psql -U smartems -d smartems -f /seed/seed.sql
docker compose exec backend python -m scripts.create_admin admin@example.com 'ChangeMe123'
```
- API docs: http://localhost:8000/docs  - Dispatcher web: http://localhost:5173
- Routing (OSRM): see `docker/osrm/README.md`, then `docker compose --profile routing up osrm`
- Unit tests: `cd backend && pip install -r requirements-dev.txt && pytest tests/unit`
- Demo GPS: `python tools/gps_simulator.py --help`

## Layout
| Folder | Purpose |
|---|---|
| `backend/` | FastAPI app (api -> services -> models; pure `algorithms/` and `domain/`) |
| `dispatcher-web/` | React (Vite) dispatcher / admin dashboard |
| `caller-app/`, `driver-app/` | React Native apps (see each README to generate the Expo project) |
| `database/` | PostGIS extension init + seed data (schema lives in Alembic) |
| `docker/` | nginx, OSRM, postgres helpers |
| `tools/` | GPS simulator for demo/testing |
| `docs/` | architecture and deliverable documents |

## Status
Implemented: auth (register/login/RBAC), SOS creation, ambulance list + location updates, WebSocket broadcast, trip FSM, matching + returning-trip algorithms (pure, unit tested), OSRM client with fallback.
Stubs (TODO): dispatch/hospital/station/user endpoints, matching orchestration, notifications, all frontend/mobile screens.
