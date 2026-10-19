from app.algorithms.ambulance_matching import Candidate, rank_candidates
from app.algorithms.returning_trip import ReturningCandidate, is_eligible
from app.domain.enums import AmbulanceStatus as S


def test_closest_available_wins():
    ranked = rank_candidates([
        Candidate(1, S.AVAILABLE, eta_s=600, distance_m=5000),
        Candidate(2, S.AVAILABLE, eta_s=200, distance_m=1500),
    ])
    assert ranked[0][0].ambulance_id == 2


def test_busy_ambulances_are_excluded():
    assert rank_candidates([Candidate(1, S.TRANSPORTING, 60, 500)]) == []


def test_returning_ambulance_penalized_when_similar_eta():
    ranked = rank_candidates([
        Candidate(1, S.RETURNING, eta_s=300, distance_m=2000),
        Candidate(2, S.AVAILABLE, eta_s=300, distance_m=2000),
    ])
    assert ranked[0][0].ambulance_id == 2


def test_returning_trip_eligibility():
    rc = ReturningCandidate(7, eta_to_incident_s=120, detour_s=60)
    assert is_eligible(rc, best_available_eta_s=400)
    assert not is_eligible(rc, best_available_eta_s=100)
