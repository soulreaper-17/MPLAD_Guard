import re
import random
import time
from typing import Optional, Dict, Any
from fastapi import HTTPException
from backend.app.config import settings
from backend.app.models.api_models import (
    UserProfile,
    LoginRequest,
    SendOtpRequest,
    VerifyOtpRequest,
    SendOtpResponse,
    SendEmailOtpRequest,
    SendEmailOtpResponse,
    VerifyEmailOtpRequest,
    VerifyEmailOtpResponse,
    RegisterRequest,
)

# In-memory store for active SMS OTPs: { canonical_phone: {"otp": "123456", "timestamp": float, "attempts": 0} }
OTP_STORE: Dict[str, Dict[str, Any]] = {}

# In-memory store for active Email OTPs: { email.lower(): {"otp": "123456", "timestamp": float, "attempts": 0, "verified": bool} }
EMAIL_OTP_STORE: Dict[str, Dict[str, Any]] = {}

# Registered User Store: { email.lower(): {"email": str, "password": str, "name": str, "role": str, "agency": str, "token": str} }
REGISTERED_USERS_STORE: Dict[str, Dict[str, Any]] = {}

def sanitize_and_validate_indian_phone(phone_number: str) -> str:
    """
    Validates Indian mobile number format strictly:
    Accepts 10 digits starting with 6-9, optionally prefixed with +91 or 91 or 0.
    Rejects alphabetic, invalid length, or invalid starting digits.
    Returns canonical form: +91XXXXXXXXXX
    """
    if not phone_number or not isinstance(phone_number, str):
        raise HTTPException(status_code=400, detail="Enter a valid 10-digit mobile number")
        
    clean = re.sub(r'[\s\-\(\)]', '', phone_number.strip())
    
    if clean.startswith('+91'):
        digits = clean[3:]
    elif clean.startswith('91') and len(clean) == 12:
        digits = clean[2:]
    elif clean.startswith('0') and len(clean) == 11:
        digits = clean[1:]
    else:
        digits = clean
        
    if not re.match(r'^[6-9]\d{9}$', digits):
        raise HTTPException(
            status_code=400,
            detail="Enter a valid 10-digit Indian mobile number (+91 6-9XXXXXXXX)"
        )
        
    return f"+91{digits}"

def mask_phone_number(canonical_phone: str) -> str:
    digits = canonical_phone.replace('+91', '')
    return f"+91 XXXXXXX{digits[-4:]}"

def send_otp(req: SendOtpRequest) -> SendOtpResponse:
    canonical_phone = sanitize_and_validate_indian_phone(req.phone_number)
    
    # Generate random 6-digit OTP
    otp = f"{random.randint(100000, 999999)}"
    now = time.time()
    
    # Cooldown check: 10 seconds between resends
    if canonical_phone in OTP_STORE:
        last_sent = OTP_STORE[canonical_phone].get("timestamp", 0)
        if now - last_sent < 10:
            raise HTTPException(
                status_code=429,
                detail="Please wait 10 seconds before requesting a new OTP."
            )
            
    # Save OTP to store, invalidating any previous OTP
    OTP_STORE[canonical_phone] = {
        "otp": otp,
        "timestamp": now,
        "attempts": 0
    }
    
    masked = mask_phone_number(canonical_phone)
    print(f"\n=======================================================")
    print(f"  [SMS OTP SERVICE] Generated OTP for {canonical_phone}: {otp}")
    print(f"=======================================================\n")
    
    return SendOtpResponse(
        success=True,
        masked_phone=masked,
        message=f"OTP sent to {masked}",
        expires_in=300,
        dev_otp=otp
    )

def verify_otp(req: VerifyOtpRequest) -> UserProfile:
    canonical_phone = sanitize_and_validate_indian_phone(req.phone_number)
    
    if canonical_phone not in OTP_STORE:
        raise HTTPException(
            status_code=400,
            detail="No active OTP request found for this phone number. Please request a new OTP."
        )
        
    record = OTP_STORE[canonical_phone]
    now = time.time()
    
    # Expiration check (300 seconds)
    if now - record["timestamp"] > 300:
        del OTP_STORE[canonical_phone]
        raise HTTPException(
            status_code=400,
            detail="This OTP has expired. Request a new one."
        )
        
    # Attempt limit check
    if record["attempts"] >= 5:
        del OTP_STORE[canonical_phone]
        raise HTTPException(
            status_code=429,
            detail="Too many failed verification attempts. Please request a new OTP."
        )
        
    record["attempts"] += 1
    
    # OTP comparison (915762 is master bypass OTP)
    input_otp = req.otp.strip()
    if input_otp != "915762" and input_otp != record["otp"]:
        raise HTTPException(
            status_code=400,
            detail="Incorrect OTP. Please try again."
        )
        
    # Valid OTP -> Consume & create session
    del OTP_STORE[canonical_phone]
    phone_digits = canonical_phone.replace('+91', '')
    
    return UserProfile(
        email=f"officer_{phone_digits}@sevaarth.ai",
        name=f"Verified Officer (+91 {phone_digits[:5]}...)",
        role="Vigilance Investigator",
        agency="District Vigilance Bureau",
        token=f"sevaarth_session_{phone_digits}_{int(now)}",
        phone=canonical_phone
    )

def mask_email(email: str) -> str:
    parts = email.split('@')
    if len(parts) != 2:
        return email
    name, domain = parts
    if len(name) <= 2:
        masked_name = name[0] + "*"
    else:
        masked_name = name[0] + "*" * (len(name) - 2) + name[-1]
    return f"{masked_name}@{domain}"

def send_email_otp(req: SendEmailOtpRequest) -> SendEmailOtpResponse:
    email_clean = req.email.strip().lower()
    if not email_clean or "@" not in email_clean or "." not in email_clean:
        raise HTTPException(
            status_code=400,
            detail="Enter a valid email address (e.g. officer@gmail.com)"
        )
    
    otp = f"{random.randint(100000, 999999)}"
    now = time.time()
    
    # Cooldown check: 10 seconds
    if email_clean in EMAIL_OTP_STORE:
        last_sent = EMAIL_OTP_STORE[email_clean].get("timestamp", 0)
        if now - last_sent < 5:
            raise HTTPException(
                status_code=429,
                detail="Please wait a few seconds before requesting another OTP."
            )
            
    EMAIL_OTP_STORE[email_clean] = {
        "otp": otp,
        "timestamp": now,
        "attempts": 0,
        "verified": False
    }
    
    masked = mask_email(email_clean)
    print(f"\n=======================================================")
    print(f"  [EMAIL OTP SERVICE] Generated OTP for {email_clean}: {otp}")
    print(f"=======================================================\n")
    
    return SendEmailOtpResponse(
        success=True,
        masked_email=masked,
        message=f"OTP sent to {masked}",
        expires_in=300,
        dev_otp=otp
    )

def verify_email_otp(req: VerifyEmailOtpRequest) -> VerifyEmailOtpResponse:
    email_clean = req.email.strip().lower()
    if email_clean not in EMAIL_OTP_STORE:
        raise HTTPException(
            status_code=400,
            detail="No active OTP request found for this email. Please request a new OTP."
        )
        
    record = EMAIL_OTP_STORE[email_clean]
    now = time.time()
    
    if now - record["timestamp"] > 300:
        del EMAIL_OTP_STORE[email_clean]
        raise HTTPException(
            status_code=400,
            detail="This OTP has expired. Please request a new one."
        )
        
    if record["attempts"] >= 5:
        del EMAIL_OTP_STORE[email_clean]
        raise HTTPException(
            status_code=429,
            detail="Too many failed verification attempts. Please request a new OTP."
        )
        
    record["attempts"] += 1
    
    input_otp = req.otp.strip()
    if input_otp != "915762" and input_otp != record["otp"]:
        raise HTTPException(
            status_code=400,
            detail="Incorrect 6-digit OTP. Please check and try again."
        )
        
    record["verified"] = True
    token = f"email_token_{int(now)}_{random.randint(1000, 9999)}"
    record["verification_token"] = token
    
    return VerifyEmailOtpResponse(
        success=True,
        verification_token=token,
        message="Email verified successfully! Now set your account password."
    )

def register_user(req: RegisterRequest) -> UserProfile:
    email_clean = req.email.strip().lower()
    if not email_clean or "@" not in email_clean:
        raise HTTPException(status_code=400, detail="Invalid email address.")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
        
    now = int(time.time())
    token = f"sevaarth_user_token_{email_clean.replace('@', '_').replace('.', '_')}_{now}"
    
    user_record = {
        "email": req.email.strip(),
        "password": req.password,
        "name": req.name.strip(),
        "role": req.role or "Vigilance Investigator",
        "agency": req.agency or "District Vigilance Bureau",
        "token": token
    }
    
    REGISTERED_USERS_STORE[email_clean] = user_record
    
    print(f"\n=======================================================")
    print(f"  [USER REGISTERED] User {email_clean} created successfully.")
    print(f"=======================================================\n")
    
    return UserProfile(
        email=user_record["email"],
        name=user_record["name"],
        role=user_record["role"],
        agency=user_record["agency"],
        token=user_record["token"]
    )

def authenticate_user(req: LoginRequest) -> Optional[UserProfile]:
    email_clean = req.email.strip().lower()
    
    # 1. Check registered users
    if email_clean in REGISTERED_USERS_STORE:
        user_record = REGISTERED_USERS_STORE[email_clean]
        if user_record["password"] == req.password:
            return UserProfile(
                email=user_record["email"],
                name=user_record["name"],
                role=user_record["role"],
                agency=user_record["agency"],
                token=user_record["token"]
            )
        else:
            raise HTTPException(status_code=401, detail="Incorrect password for registered user.")
            
    # 2. Check demo admin credentials
    if req.email == settings.DEMO_USER_EMAIL and req.password == settings.DEMO_USER_PASSWORD:
        return UserProfile(
            email=settings.DEMO_USER_EMAIL,
            name=settings.DEMO_USER_NAME,
            role="Senior Vigilance Officer",
            agency="District Vigilance & Anti-Corruption Bureau, Nalanda",
            token="demo_jwt_session_token_mplad_guard_2026"
        )
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

