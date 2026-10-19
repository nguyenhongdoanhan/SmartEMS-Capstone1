"""Finite state machine for the ambulance trip. Pure Python (no I/O) so it is trivial to unit test.

AVAILABLE -> DISPATCHED -> ON_SCENE -> TRANSPORTING -> AT_HOSPITAL -> RETURNING -> AVAILABLE
Special edges:
  DISPATCHED -> AVAILABLE   (driver rejects / dispatch cancelled)
  RETURNING  -> DISPATCHED  (returning-trip optimization: reuse an empty returning ambulance)
"""
from app.domain.enums import AmbulanceStatus as S

ALLOWED: dict[S, set[S]] = {
    S.AVAILABLE: {S.DISPATCHED},
    S.DISPATCHED: {S.ON_SCENE, S.AVAILABLE},
    S.ON_SCENE: {S.TRANSPORTING},
    S.TRANSPORTING: {S.AT_HOSPITAL},
    S.AT_HOSPITAL: {S.RETURNING},
    S.RETURNING: {S.AVAILABLE, S.DISPATCHED},
}


class InvalidTransition(Exception):
    def __init__(self, current: S, target: S):
        super().__init__(f"Invalid status transition: {current.value} -> {target.value}")
        self.current, self.target = current, target


def can_transition(current: S, target: S) -> bool:
    return target in ALLOWED.get(current, set())


def assert_transition(current: S, target: S) -> None:
    if not can_transition(current, target):
        raise InvalidTransition(current, target)
