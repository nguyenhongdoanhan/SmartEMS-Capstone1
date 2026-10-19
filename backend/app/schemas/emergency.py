from datetime import datetime

from pydantic import BaseModel, Field


class EmergencyCreate(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    description: str | None = None


class EmergencyOut(BaseModel):
    id: int
    status: str
    priority: int
    description: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    created_at: datetime | None = None
