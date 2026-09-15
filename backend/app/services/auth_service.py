from typing import Optional
from backend.app.config import settings
from backend.app.models.api_models import UserProfile, LoginRequest

def authenticate_user(req: LoginRequest) -> Optional[UserProfile]:
    if req.email == settings.DEMO_USER_EMAIL and req.password == settings.DEMO_USER_PASSWORD:
        return UserProfile(
            email=settings.DEMO_USER_EMAIL,
            name=settings.DEMO_USER_NAME,
            role="Senior Vigilance Officer",
            agency="District Vigilance & Anti-Corruption Bureau, Nalanda",
            token="demo_jwt_session_token_mplad_guard_2026"
        )
    # Also allow any email with password 'admin123' for easy prototype testing
    elif req.password == "admin123" and "@" in req.email:
        name = req.email.split("@")[0].replace(".", " ").title()
        return UserProfile(
            email=req.email,
            name=f"Officer {name}",
            role="Investigator",
            agency="District Vigilance & Anti-Corruption Bureau, Nalanda",
            token="demo_jwt_session_token_mplad_guard_2026"
        )
    return None
