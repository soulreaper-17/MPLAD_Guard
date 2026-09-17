from fastapi import APIRouter, HTTPException
from backend.app.models.api_models import (
    LoginRequest,
    UserProfile,
    SendOtpRequest,
    SendOtpResponse,
    VerifyOtpRequest,
    SendEmailOtpRequest,
    SendEmailOtpResponse,
    VerifyEmailOtpRequest,
    VerifyEmailOtpResponse,
    RegisterRequest,
)
from backend.app.services.auth_service import (
    authenticate_user,
    send_otp,
    verify_otp,
    send_email_otp,
    verify_email_otp,
    register_user,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=UserProfile)
def login(req: LoginRequest):
    user = authenticate_user(req)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return user

@router.post("/send-otp", response_model=SendOtpResponse)
def request_otp(req: SendOtpRequest):
    return send_otp(req)

@router.post("/verify-otp", response_model=UserProfile)
def confirm_otp(req: VerifyOtpRequest):
    return verify_otp(req)

@router.post("/send-email-otp", response_model=SendEmailOtpResponse)
def request_email_otp(req: SendEmailOtpRequest):
    return send_email_otp(req)

@router.post("/verify-email-otp", response_model=VerifyEmailOtpResponse)
def confirm_email_otp(req: VerifyEmailOtpRequest):
    return verify_email_otp(req)

@router.post("/register", response_model=UserProfile)
def register(req: RegisterRequest):
    return register_user(req)


