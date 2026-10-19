-- Sample data. Run AFTER `alembic upgrade head`:
--   docker compose exec db psql -U smartems -d smartems -f /seed/seed.sql
-- Coordinates are approximate placeholders around Da Nang: replace with your real data.
INSERT INTO stations (name, address, location) VALUES
  ('Station A', 'Hai Chau, Da Nang', ST_SetSRID(ST_MakePoint(108.2208, 16.0471), 4326)::geography),
  ('Station B', 'Son Tra, Da Nang',  ST_SetSRID(ST_MakePoint(108.2400, 16.0700), 4326)::geography);

INSERT INTO hospitals (name, address, phone, location) VALUES
  ('Sample Hospital 1', 'Hai Chau, Da Nang', NULL, ST_SetSRID(ST_MakePoint(108.2150, 16.0720), 4326)::geography),
  ('Sample Hospital 2', 'Thanh Khe, Da Nang', NULL, ST_SetSRID(ST_MakePoint(108.1900, 16.0600), 4326)::geography);

INSERT INTO ambulances (plate_number, status, station_id, current_location) VALUES
  ('43A-00001', 'AVAILABLE', 1, ST_SetSRID(ST_MakePoint(108.2208, 16.0471), 4326)::geography),
  ('43A-00002', 'AVAILABLE', 2, ST_SetSRID(ST_MakePoint(108.2400, 16.0700), 4326)::geography);
