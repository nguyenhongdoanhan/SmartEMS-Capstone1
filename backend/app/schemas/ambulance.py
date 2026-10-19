from pydantic import BaseModel, Field


class LocationUpdate(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    speed: float | None = None
    heading: float | None = None


class AmbulanceOut(BaseModel):
    id: int
    plate_number: str
    status: str
    latitude: float | None = None
    longitude: float | None = None
