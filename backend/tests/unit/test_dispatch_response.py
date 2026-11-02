import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException

from app.api import dispatch as api
from app.models.dispatch import Dispatch
from app.models.trip import Trip

DRIVER = SimpleNamespace(id=2, role="driver")


def make_db(dispatch, ambulance):
    db = MagicMock()
    db.get = AsyncMock(side_effect=lambda model, _id: dispatch if model is Dispatch else ambulance)
    db.add = MagicMock()
    db.commit = AsyncMock()
    return db


@pytest.fixture(autouse=True)
def allow_driver(monkeypatch):
    monkeypatch.setattr(api, "ensure_driver_assigned", AsyncMock())


def make(dispatch_status="CONFIRMED", amb_status="AVAILABLE"):
    dispatch = SimpleNamespace(id=1, ambulance_id=5, status=dispatch_status, responded_at=None)
    ambulance = SimpleNamespace(id=5, status=amb_status)
    return dispatch, ambulance


def test_accept_creates_trip_and_dispatches_ambulance():
    dispatch, amb = make()
    db = make_db(dispatch, amb)
    asyncio.run(api.accept_dispatch(db, DRIVER, 1))
    assert dispatch.status == "ACCEPTED"
    assert dispatch.responded_at is not None
    assert amb.status == "DISPATCHED"
    trip = db.add.call_args[0][0]
    assert isinstance(trip, Trip) and trip.dispatch_id == 1 and trip.status == "DISPATCHED"
    db.commit.assert_awaited_once()


def test_accept_returning_ambulance_allowed():
    dispatch, amb = make(amb_status="RETURNING")
    asyncio.run(api.accept_dispatch(make_db(dispatch, amb), DRIVER, 1))
    assert amb.status == "DISPATCHED"


def test_accept_rejects_busy_ambulance():
    dispatch, amb = make(amb_status="ON_SCENE")
    db = make_db(dispatch, amb)
    with pytest.raises(HTTPException) as exc:
        asyncio.run(api.accept_dispatch(db, DRIVER, 1))
    assert exc.value.status_code == 409
    db.commit.assert_not_awaited()


def test_accept_requires_confirmed_dispatch():
    dispatch, amb = make(dispatch_status="RECOMMENDED")
    with pytest.raises(HTTPException) as exc:
        asyncio.run(api.accept_dispatch(make_db(dispatch, amb), DRIVER, 1))
    assert exc.value.status_code == 409


def test_accept_twice_is_rejected():
    dispatch, amb = make(dispatch_status="ACCEPTED")
    with pytest.raises(HTTPException) as exc:
        asyncio.run(api.accept_dispatch(make_db(dispatch, amb), DRIVER, 1))
    assert exc.value.status_code == 409


def test_dispatch_not_found():
    db = make_db(None, None)
    with pytest.raises(HTTPException) as exc:
        asyncio.run(api.accept_dispatch(db, DRIVER, 99))
    assert exc.value.status_code == 404


def test_wrong_driver_gets_403(monkeypatch):
    monkeypatch.setattr(api, "ensure_driver_assigned",
                        AsyncMock(side_effect=HTTPException(status_code=403, detail="no")))
    dispatch, amb = make()
    with pytest.raises(HTTPException) as exc:
        asyncio.run(api.accept_dispatch(make_db(dispatch, amb), DRIVER, 1))
    assert exc.value.status_code == 403


def test_reject_frees_ambulance_without_trip():
    dispatch, amb = make(amb_status="DISPATCHED")
    db = make_db(dispatch, amb)
    asyncio.run(api.reject_dispatch(db, DRIVER, 1))
    assert dispatch.status == "REJECTED"
    assert amb.status == "AVAILABLE"
    db.add.assert_not_called()
    db.commit.assert_awaited_once()


def test_reject_keeps_busy_ambulance_status():
    dispatch, amb = make(amb_status="TRANSPORTING")
    asyncio.run(api.reject_dispatch(make_db(dispatch, amb), DRIVER, 1))
    assert dispatch.status == "REJECTED"
    assert amb.status == "TRANSPORTING"


def test_reject_requires_confirmed_dispatch():
    dispatch, amb = make(dispatch_status="REJECTED")
    with pytest.raises(HTTPException) as exc:
        asyncio.run(api.reject_dispatch(make_db(dispatch, amb), DRIVER, 1))
    assert exc.value.status_code == 409