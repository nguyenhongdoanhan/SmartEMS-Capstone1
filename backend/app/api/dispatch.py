from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.ambulances import ensure_driver_assigned
from app.api.deps import get_db, require_role
from app.domain.enums import AmbulanceStatus as S, DispatchStatus as D
from app.domain.trip_fsm import InvalidTransition, assert_transition
from app.models.ambulance import Ambulance
from app.models.dispatch import Dispatch
from app.models.trip import Trip
from app.models.user import DriverProfile, User
from app.services import trip_service

router = APIRouter()


class TripStatusUpdate(BaseModel):
    status: Literal["ON_SCENE", "TRANSPORTING", "AT_HOSPITAL", "RETURNING", "AVAILABLE"]


def _now() -> datetime:
    return datetime.now(timezone.utc)


async def _load_confirmed(db: AsyncSession, user: User, dispatch_id: int):
    dispatch = await db.get(Dispatch, dispatch_id)
    if dispatch is None:
        raise HTTPException(status_code=404, detail="Dispatch not found")
    await ensure_driver_assigned(db, user, dispatch.ambulance_id)
    if dispatch.status != D.CONFIRMED.value:
        raise HTTPException(status_code=409,
                            detail=f"Dispatch is {dispatch.status}, expected CONFIRMED")
    ambulance = await db.get(Ambulance, dispatch.ambulance_id)
    if ambulance is None:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    return dispatch, ambulance


async def accept_dispatch(db: AsyncSession, user: User, dispatch_id: int) -> dict:
    dispatch, ambulance = await _load_confirmed(db, user, dispatch_id)
    if ambulance.status != S.DISPATCHED.value:
        try:
            assert_transition(S(ambulance.status), S.DISPATCHED)
        except (ValueError, InvalidTransition) as exc:
            raise HTTPException(status_code=409, detail=str(exc))
    now = _now()
    dispatch.status = D.ACCEPTED.value
    dispatch.responded_at = now
    ambulance.status = S.DISPATCHED.value
    trip = Trip(dispatch_id=dispatch.id, status=S.DISPATCHED.value, dispatched_at=now)
    db.add(trip)
    await db.flush()  # gives the trip its id before commit expires attributes
    result = {"id": dispatch.id, "status": dispatch.status, "trip_id": trip.id}
    await db.commit()
    return result


async def reject_dispatch(db: AsyncSession, user: User, dispatch_id: int) -> dict:
    dispatch, ambulance = await _load_confirmed(db, user, dispatch_id)
    dispatch.status = D.REJECTED.value
    dispatch.responded_at = _now()
    if ambulance.status == S.DISPATCHED.value:
        ambulance.status = S.AVAILABLE.value
    result = {"id": dispatch.id, "status": dispatch.status}
    await db.commit()
    return result


async def update_trip_status(db: AsyncSession, user: User, trip_id: int, new_status: str) -> Trip:
    trip = await db.get(Trip, trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    dispatch = await db.get(Dispatch, trip.dispatch_id)
    if dispatch is None:
        raise HTTPException(status_code=404, detail="Dispatch not found")
    await ensure_driver_assigned(db, user, dispatch.ambulance_id)
    target = S(new_status)
    try:
        assert_transition(S(trip.status), target)
    except (ValueError, InvalidTransition) as exc:
        raise HTTPException(status_code=409, detail=str(exc))
    ambulance = await db.get(Ambulance, dispatch.ambulance_id)
    if ambulance is None:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    ambulance.status = target.value  # committed together with the trip by change_status
    return await trip_service.change_status(db, trip, target)


async def list_my_dispatches(db: AsyncSession, user: User) -> list[dict]:
    """Dispatches waiting for the driver (CONFIRMED) or in progress (ACCEPTED, trip not finished)."""
    profile = (await db.execute(
        select(DriverProfile).where(DriverProfile.user_id == user.id)
    )).scalar_one_or_none()
    if profile is None or profile.ambulance_id is None:
        return []
    dispatches = (await db.execute(
        select(Dispatch).where(
            Dispatch.ambulance_id == profile.ambulance_id,
            Dispatch.status.in_([D.CONFIRMED.value, D.ACCEPTED.value]),
        ).order_by(Dispatch.id.desc())
    )).scalars().all()
    if not dispatches:
        return []
    trips = (await db.execute(
        select(Trip).where(Trip.dispatch_id.in_([d.id for d in dispatches]))
    )).scalars().all()
    trip_by_dispatch = {t.dispatch_id: t for t in trips}
    items = []
    for d in dispatches:
        trip = trip_by_dispatch.get(d.id)
        if trip is not None and trip.status == S.AVAILABLE.value:
            continue  # trip already completed
        items.append({
            "id": d.id,
            "emergency_id": d.emergency_id,
            "ambulance_id": d.ambulance_id,
            "status": d.status,
            "trip_id": trip.id if trip else None,
            "trip_status": trip.status if trip else None,
        })
    return items


@router.get("")
async def list_dispatch():
    # TODO: implement (Sprint 2-3)
    return []


@router.get("/mine")
async def my_dispatches(db: AsyncSession = Depends(get_db),
                        user: User = Depends(require_role("driver", "admin"))):
    return await list_my_dispatches(db, user)


@router.post("/{dispatch_id}/accept")
async def accept(dispatch_id: int, db: AsyncSession = Depends(get_db),
                 user: User = Depends(require_role("driver", "admin"))):
    return await accept_dispatch(db, user, dispatch_id)


@router.post("/{dispatch_id}/reject")
async def reject(dispatch_id: int, db: AsyncSession = Depends(get_db),
                 user: User = Depends(require_role("driver", "admin"))):
    return await reject_dispatch(db, user, dispatch_id)


@router.patch("/trips/{trip_id}/status")
async def trip_status(trip_id: int, data: TripStatusUpdate, db: AsyncSession = Depends(get_db),
                      user: User = Depends(require_role("driver", "admin"))):
    await update_trip_status(db, user, trip_id, data.status)
    return {"id": trip_id, "status": data.status}