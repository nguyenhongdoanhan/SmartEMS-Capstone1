from datetime import datetime

from geoalchemy2 import Geography
from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class Ambulance(Base):
    """`current_location` holds the LATEST position; history goes to gps_locations."""
    __tablename__ = "ambulances"

    id: Mapped[int] = mapped_column(primary_key=True)
    plate_number: Mapped[str] = mapped_column(String(32), unique=True)
    status: Mapped[str] = mapped_column(String(20), default="AVAILABLE", index=True)
    station_id: Mapped[int | None] = mapped_column(ForeignKey("stations.id"))
    current_location = mapped_column(Geography("POINT", srid=4326))
    last_seen_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
