from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class Trip(Base):
    """Execution lifecycle of one accepted dispatch (see domain/trip_fsm.py)."""
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(primary_key=True)
    dispatch_id: Mapped[int] = mapped_column(ForeignKey("dispatches.id"), unique=True)
    hospital_id: Mapped[int | None] = mapped_column(ForeignKey("hospitals.id"))
    status: Mapped[str] = mapped_column(String(20), default="DISPATCHED", index=True)
    patient_note: Mapped[str | None] = mapped_column(Text)
    dispatched_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    on_scene_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    transporting_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    at_hospital_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    returning_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
