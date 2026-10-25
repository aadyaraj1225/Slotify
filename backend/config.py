from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Slotify API"
    APP_VERSION: str = "0.1.0"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Supabase PostgreSQL database URL
    DATABASE_URL: Optional[str] = None

    # Supabase Auth Configuration
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_JWT_SECRET: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None

    # Bootstrap secret for administrative role assignment (e.g. provisioning coordinators)
    ADMIN_PROVISION_SECRET: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
