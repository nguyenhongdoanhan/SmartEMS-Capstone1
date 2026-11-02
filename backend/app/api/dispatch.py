from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.ambulances import ensure_driver_assigned
from app.api.deps import get_db, require_role
from app.domain.enums import AmbulanceStatus as S, DispatchStatus as D
from app.domain.trip_fsm import InvalidTransition, assert_transition
from app.models.ambulance import Ambulance
from app.models.dispatch import Dispatch
from app.models.trip import Trip
from app.models.user import User

router = APIRouter()


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


async def accept_dispatch(db: AsyncSession, user: User, dispatch_id: int) -> Dispatch:
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
    db.add(Trip(dispatch_id=dispatch.id, status=S.DISPATCHED.value, dispatched_at=now))
    await db.commit()
    return dispatch


async def reject_dispatch(db: AsyncSession, user: User, dispatch_id: int) -> Dispatch:
    dispatch, ambulance = await _load_confirmed(db, user, dispatch_id)
    dispatch.status = D.REJECTED.value
    dispatch.responded_at = _now()
    if ambulance.status == S.DISPATCHED.value:
        ambulance.status = S.AVAILABLE.value
    await db.commit()
    return dispatch


@router.get("")
async def list_dispatch():
    # TODO: implement (Sprint 2-3)
    return []


@router.post("/{dispatch_id}/accept")
async def accept(dispatch_id: int, db: AsyncSession = Depends(get_db),
                 user: User = Depends(require_role("driver", "admin"))):
    dispatch = await accept_dispatch(db, user, dispatch_id)
    return {"id": dispatch.id, "status": dispatch.status}


@router.post("/{dispatch_id}/reject")
async def reject(dispatch_id: int, db: AsyncSession = Depends(get_db),
                 user: User = Depends(require_role("driver", "admin"))):
    dispatch = await reject_dispatch(db, user, dispatch_id)
    return {"id": dispatch.id, "status": dispatch.status}