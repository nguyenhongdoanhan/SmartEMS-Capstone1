import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from app.api import dispatch as api
from app.domain.enums import AmbulanceStatus as S
from app.models.ambulance import Ambulance
from app.models.dispatch import Dispatch
from app.models.trip import Trip

DRIVER = SimpleNamespace(id=2, role="driver")


def make_db(trip, dispatch, ambulance):
    objs = {Trip: trip, Dispatch: dispatch, Ambulance: ambulance}
    db = MagicMock()
    db.get = AsyncMock(side_effect=lambda model, _id: objs[model])
    return db


def make(trip_status="DISPATCHED", amb_status="DISPATCHED"):
    trip = SimpleNamespace(id=7, dispatch_id=1, status=trip_status)
    dispatch = SimpleNamespace(id=1, ambulance_id=5)
    amb = SimpleNamespace(id=5, status=amb_status)
    return trip, dispatch, amb


@pytest.fixture(autouse=True)
def patches(monkeypatch):
    monkeypatch.setattr(api, "ensure_driver_assigned", AsyncMock())
    change = AsyncMock(side_effect=lambda db, trip, s: trip)
    monkeypatch.setattr(api.trip_service, "change_status", change)
    return change


def run(db, status, trip_id=7):
    return asyncio.run(api.update_trip_status(db, DRIVER, trip_id, status))


def test_on_scene_updates_trip_and_ambulance(patches):
    trip, dispatch, amb = make()
    db = make_db(trip, dispatch, amb)
    run(db, "ON_SCENE")
    assert amb.status == "ON_SCENE"
    patches.assert_awaited_once_with(db, trip, S.ON_SCENE)


def test_full_path_to_available(patches):
    trip, dispatch, amb = make(trip_status="RETURNING", amb_status="RETURNING")
    run(make_db(trip, dispatch, amb), "AVAILABLE")
    assert amb.status == "AVAILABLE"


def test_skipping_a_state_is_409(patches):
    trip, dispatch, amb = make()
    with pytest.raises(HTTPException) as exc:
        run(make_db(trip, dispatch, amb), "TRANSPORTING")
    assert exc.value.status_code == 409
    assert amb.status == "DISPATCHED"
    patches.assert_not_awaited()


def test_trip_not_found():
    db = make_db(None, None, None)
    with pytest.raises(HTTPException) as exc:
        run(db, "ON_SCENE", trip_id=99)
    assert exc.value.status_code == 404


def test_wrong_driver_gets_403(monkeypatch, patches):
    monkeypatch.setattr(api, "ensure_driver_assigned",
                        AsyncMock(side_effect=HTTPException(status_code=403, detail="no")))
    trip, dispatch, amb = make()
    with pytest.raises(HTTPException) as exc:
        run(make_db(trip, dispatch, amb), "ON_SCENE")
    assert exc.value.status_code == 403
    assert amb.status == "DISPATCHED"
    patches.assert_not_awaited()


@pytest.mark.parametrize("value", ["DISPATCHED", "ON_TRIP", "", "completed"])
def test_schema_rejects_invalid_status(value):
    with pytest.raises(ValidationError):
        api.TripStatusUpdate(status=value)


@pytest.mark.parametrize("value", ["ON_SCENE", "TRANSPORTING", "AT_HOSPITAL", "RETURNING", "AVAILABLE"])
def test_schema_accepts_valid_status(value):
    assert api.TripStatusUpdate(status=value).status == value