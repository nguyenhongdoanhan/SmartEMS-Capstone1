"""Orchestrates matching: PostGIS candidates -> OSRM ETAs -> algorithms.ambulance_matching.

TODO (Sprint 3):
  1. SELECT ambulances WHERE status IN (AVAILABLE, RETURNING) ORDER BY ST_Distance(...) LIMIT N
  2. routing_service.get_route() for each candidate to the emergency
  3. rank_candidates(...) and (if RETURNING) returning_trip.is_eligible(...)
  4. persist Dispatch(status=RECOMMENDED) and publish DISPATCH_REQUESTED
"""


async def recommend(db, emergency_id: int):
    raise NotImplementedError
