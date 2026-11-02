import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException

from app.api.ambulances import ensure_driver_assigned


def make_db(profile):
    result = MagicMock()
    result.scalar_one_or_none.return_value = profile
    db = MagicMock()
    db.execute = AsyncMock(return_value=result)
    return db


def run(db, user, ambulance_id):
    asyncio.run(ensure_driver_assigned(db, user, ambulance_id))


def test_admin_allowed_any_ambulance():
    db = make_db(None)
    run(db, SimpleNamespace(id=1, role="admin"), 99)
    db.execute.assert_not_called()


def test_driver_allowed_on_assigned_ambulance():
    db = make_db(SimpleNamespace(user_id=2, ambulance_id=5))
    run(db, SimpleNamespace(id=2, role="driver"), 5)


def test_driver_rejected_on_other_ambulance():
    db = make_db(SimpleNamespace(user_id=2, ambulance_id=5))
    with pytest.raises(HTTPException) as exc:
        run(db, SimpleNamespace(id=2, role="driver"), 6)
    assert exc.value.status_code == 403


def test_driver_without_profile_rejected():
    db = make_db(None)
    with pytest.raises(HTTPException) as exc:
        run(db, SimpleNamespace(id=3, role="driver"), 5)
    assert exc.value.status_code == 403


def test_driver_with_no_ambulance_assigned_rejected():
    db = make_db(SimpleNamespace(user_id=4, ambulance_id=None))
    with pytest.raises(HTTPException) as exc:
        run(db, SimpleNamespace(id=4, role="driver"), 5)
    assert exc.value.status_code == 403