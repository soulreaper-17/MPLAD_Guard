from fastapi import APIRouter, HTTPException, Depends
from backend.app.models.api_models import LoginRequest, UserProfile
from backend.app.services.auth_service import authenticate_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=UserProfile)
def login(req: LoginRequest):
    user = authenticate_user(req)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials. Use investigator@mpladguard.gov.in / admin123")
    return user
