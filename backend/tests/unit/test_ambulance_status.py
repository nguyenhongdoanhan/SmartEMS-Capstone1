import pytest
from pydantic import ValidationError

from app.schemas.ambulance import LocationUpdate, StatusUpdate


@pytest.mark.parametrize("value", ["AVAILABLE", "ON_TRIP", "OFFLINE"])
def test_status_update_accepts_valid_values(value):
    assert StatusUpdate(status=value).status == value


@pytest.mark.parametrize("value", ["available", "BUSY", "", "ARRIVED"])
def test_status_update_rejects_invalid_values(value):
    with pytest.raises(ValidationError):
        StatusUpdate(status=value)


def test_status_update_requires_status():
    with pytest.raises(ValidationError):
        StatusUpdate()


def test_location_update_accepts_valid_gps():
    loc = LocationUpdate(latitude=15.937371, longitude=108.217094)
    assert loc.speed is None and loc.heading is None


@pytest.mark.parametrize("lat,lng", [(91, 0), (-91, 0), (0, 181), (0, -181)])
def test_location_update_rejects_out_of_range(lat, lng):
    with pytest.raises(ValidationError):
        LocationUpdate(latitude=lat, longitude=lng)