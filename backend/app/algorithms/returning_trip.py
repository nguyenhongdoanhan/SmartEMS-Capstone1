"""Returning-trip optimization (pure functions).

An ambulance in RETURNING state may be re-dispatched to a new emergency if it is close enough
and the gain over the best AVAILABLE ambulance is positive.
"""
from dataclasses import dataclass


@dataclass(frozen=True)
class ReturningCandidate:
    ambulance_id: int
    eta_to_incident_s: float
    detour_s: float  # extra time added to its current return trip


def reallocation_gain(rc: ReturningCandidate, best_available_eta_s: float | None) -> float:
    """Seconds saved vs. the best available ambulance (positive = better)."""
    if best_available_eta_s is None:
        return float("inf")
    return best_available_eta_s - rc.eta_to_incident_s


def is_eligible(rc: ReturningCandidate, best_available_eta_s: float | None, max_eta_s: float = 600) -> bool:
    return rc.eta_to_incident_s <= max_eta_s and reallocation_gain(rc, best_available_eta_s) > 0
