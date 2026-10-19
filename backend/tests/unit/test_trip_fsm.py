import pytest

from app.domain.enums import AmbulanceStatus as S
from app.domain.trip_fsm import InvalidTransition, assert_transition, can_transition


def test_happy_path():
    path = [S.AVAILABLE, S.DISPATCHED, S.ON_SCENE, S.TRANSPORTING, S.AT_HOSPITAL, S.RETURNING, S.AVAILABLE]
    for a, b in zip(path, path[1:]):
        assert can_transition(a, b)


def test_returning_can_be_redispatched():
    assert can_transition(S.RETURNING, S.DISPATCHED)


def test_cannot_skip_states():
    with pytest.raises(InvalidTransition):
        assert_transition(S.AVAILABLE, S.TRANSPORTING)
    assert not can_transition(S.ON_SCENE, S.RETURNING)
