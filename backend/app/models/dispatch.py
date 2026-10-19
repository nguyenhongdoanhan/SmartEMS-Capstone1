from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class Dispatch(Base):
    """A DECISION to send an ambulance to an emergency (recommended -> confirmed -> accepted/rejected).
    The execution lifecycle lives in Trip."""
    __tablename__ = "dispatches"

    id: Mapped[int] = mapped_column(primary_key=True)
    emergency_id: Mapped[int] = mapped_column(ForeignKey("emergencies.id"), index=True)
    ambulance_id: Mapped[int] = mapped_column(ForeignKey("ambulances.id"), index=True)
    dispatcher_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    status: Mapped[str] = mapped_column(String(20), default="RECOMMENDED")
    score: Mapped[float | None] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    responded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
