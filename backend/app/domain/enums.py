from enum import Enum


class Role(str, Enum):
    CALLER = "caller"
    DRIVER = "driver"
    DISPATCHER = "dispatcher"
    ADMIN = "admin"


class AmbulanceStatus(str, Enum):
    """Medical trip lifecycle (6 stages). Also used as the ambulance's current status."""
    AVAILABLE = "AVAILABLE"
    DISPATCHED = "DISPATCHED"
    ON_SCENE = "ON_SCENE"
    TRANSPORTING = "TRANSPORTING"
    AT_HOSPITAL = "AT_HOSPITAL"
    RETURNING = "RETURNING"


class EmergencyStatus(str, Enum):
    CREATED = "CREATED"
    DISPATCHING = "DISPATCHING"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class DispatchStatus(str, Enum):
    RECOMMENDED = "RECOMMENDED"
    CONFIRMED = "CONFIRMED"   # dispatcher confirmed
    ACCEPTED = "ACCEPTED"     # driver accepted
    REJECTED = "REJECTED"
