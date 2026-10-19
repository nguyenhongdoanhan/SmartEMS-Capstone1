-- Runs once when the Postgres container is first created.
-- Tables are created by Alembic (backend/alembic), NOT here.
CREATE EXTENSION IF NOT EXISTS postgis;
