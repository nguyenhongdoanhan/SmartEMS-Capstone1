from datetime import datetime

from geoalchemy2 import Geography
from sqlalchemy import BigInteger, DateTime, Float, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class GPSLocation(Base):
    """History only (write-heavy). Insert throttled/batched, never one commit per ping."""
    __tablename__ = "gps_locations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    ambulance_id: Mapped[int] = mapped_column(ForeignKey("ambulances.id"), index=True)
    location = mapped_column(Geography("POINT", srid=4326))
    speed: Mapped[float | None] = mapped_column(Float)
    heading: Mapped[float | None] = mapped_column(Float)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
