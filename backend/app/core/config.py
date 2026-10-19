from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "SmartEMS"
    database_url: str = "postgresql+asyncpg://smartems:smartems@localhost:5432/smartems"
    redis_url: str = "redis://localhost:6379/0"
    osrm_url: str = "http://localhost:5000"
    secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    cors_origins: list[str] = ["http://localhost:5173"]

    # Ambulance matching weights (tune later, see algorithms/ambulance_matching.py)
    w_travel_time: float = 0.5
    w_distance: float = 0.2
    w_status: float = 0.2
    w_priority: float = 0.1

    # Fallback ETA when OSRM is unavailable
    fallback_speed_kmh: float = 30.0


settings = Settings()
