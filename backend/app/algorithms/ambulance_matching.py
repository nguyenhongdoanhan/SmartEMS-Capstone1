"""Rule-based ambulance matching. PURE functions: no DB, no HTTP -> easy to unit test.

Lower score = better. Services fetch candidates + ETAs (PostGIS/OSRM) and call rank_candidates().
Weights/penalties below are placeholders to tune during Sprint 3.
"""
from dataclasses import dataclass

from app.domain.enums import AmbulanceStatus


@dataclass(frozen=True)
class Weights:
    travel_time: float = 0.5
    distance: float = 0.2
    status: float = 0.2
    priority: float = 0.1


@dataclass(frozen=True)
class Candidate:
    ambulance_id: int
    status: AmbulanceStatus
    eta_s: float
    distance_m: float


STATUS_PENALTY = {AmbulanceStatus.AVAILABLE: 0.0, AmbulanceStatus.RETURNING: 0.4}
URGENCY = {1: 1.0, 2: 0.5, 3: 0.0}  # emergency priority: 1 = critical ... 3 = low


def rank_candidates(
    candidates: list[Candidate], priority: int = 2, weights: Weights = Weights()
) -> list[tuple[Candidate, float]]:
    eligible = [c for c in candidates if c.status in STATUS_PENALTY]
    if not eligible:
        return []
    max_eta = max(c.eta_s for c in eligible) or 1.0
    max_dist = max(c.distance_m for c in eligible) or 1.0
    urgency = URGENCY.get(priority, 0.5)

    def score(c: Candidate) -> float:
        eta_n, dist_n = c.eta_s / max_eta, c.distance_m / max_dist
        return (
            weights.travel_time * eta_n
            + weights.distance * dist_n
            + weights.status * STATUS_PENALTY[c.status]
            + weights.priority * urgency * eta_n
        )

    return sorted(((c, score(c)) for c in eligible), key=lambda t: t[1])
