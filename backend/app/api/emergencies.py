from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_role
from app.models.user import User
from app.schemas.emergency import EmergencyCreate, EmergencyOut
from app.services import emergency_service

router = APIRouter()


@router.post("", response_model=EmergencyOut, status_code=201)
async def create_sos(data: EmergencyCreate, db: AsyncSession = Depends(get_db),
                     user: User = Depends(require_role("caller", "admin"))):
    em = await emergency_service.create_emergency(db, user.id, data)
    return EmergencyOut(id=em.id, status=em.status, priority=em.priority,
                        description=em.description, latitude=data.latitude, longitude=data.longitude)


@router.get("", response_model=list[EmergencyOut])
async def list_emergencies(db: AsyncSession = Depends(get_db),
                           _: User = Depends(require_role("dispatcher", "admin"))):
    return await emergency_service.list_emergencies(db)
