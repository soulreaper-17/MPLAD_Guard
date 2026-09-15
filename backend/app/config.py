import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "MPLAD-GUARD AI"
    PROJECT_SUBTITLE: str = "Explainable AI-Powered Investigation Intelligence for MPLADS"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    CONSTITUENCY: str = "Nalanda Lok Sabha Constituency, Bihar"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./mplad_guard.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "mplad_guard_super_secret_key_2026")
    DEMO_USER_EMAIL: str = "investigator@mpladguard.gov.in"
    DEMO_USER_PASSWORD: str = "admin123"
    DEMO_USER_NAME: str = "R. K. Verma (Senior Vigilance Officer)"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY")
settings = Settings()
