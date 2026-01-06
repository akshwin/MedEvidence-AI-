"""
Authentication routes: register, login, verify email, reset password
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel, EmailStr

from app.database import get_db
from app.models.user import User, UserPreferences
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token,
    generate_verification_token,
    generate_reset_token
)
from app.services.email_service import email_service
from app.core.config import settings

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# Pydantic models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    is_verified: bool
    is_active: bool
    created_at: datetime


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    token: str
    new_password: str


class EmailVerification(BaseModel):
    token: str


class ChangePassword(BaseModel):
    old_password: str
    new_password: str


# Dependency to get current user
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    return user


async def get_current_user_optional(
    request: Request,
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current authenticated user (optional - returns None if not authenticated)"""
    
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        
        token = auth_header.split(" ")[1]
        payload = decode_access_token(token)
        if payload is None:
            return None
        
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        
        user = db.query(User).filter(User.id == user_id).first()
        if user is None or not user.is_active:
            return None
        
        return user
    except Exception:
        return None


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    verification_token = generate_verification_token()
    verification_expires = datetime.utcnow() + timedelta(
        hours=settings.verification_token_expire_hours
    )
    
    new_user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        is_verified=False,
        verification_token=verification_token,
        verification_token_expires=verification_expires
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create default preferences
    preferences = UserPreferences(user_id=new_user.id)
    db.add(preferences)
    db.commit()
    
    # Send verification email
    email_sent = False
    verification_url = f"{settings.frontend_url}/verify-email?token={verification_token}"
    try:
        email_sent = email_service.send_verification_email(
            email=new_user.email,
            token=verification_token,
            full_name=new_user.full_name
        )
        if not email_sent:
            # Email service not configured - log the verification link for development
            print(f"\n[REGISTRATION] Email service not configured.")
            print(f"[REGISTRATION] Verification URL for {new_user.email}: {verification_url}\n")
    except Exception as e:
        print(f"[REGISTRATION] Error sending verification email: {e}")
        print(f"[REGISTRATION] Verification URL: {verification_url}\n")
    
    response_data = {
        "message": "User registered successfully. Please check your email to verify your account.",
        "user_id": new_user.id
    }
    
    # Include verification URL in response if email wasn't sent (for development)
    if not email_sent:
        response_data["verification_url"] = verification_url
    
    return response_data


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login user and return access token"""
    # Find user by email
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_verified": user.is_verified,
            "is_active": user.is_active
        }
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_verified=current_user.is_verified,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )


@router.post("/verify-email", response_model=dict)
async def verify_email(verification: EmailVerification, db: Session = Depends(get_db)):
    """Verify user email with token"""
    if not verification.token or not verification.token.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token is required"
        )
    
    user = db.query(User).filter(
        User.verification_token == verification.token.strip()
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token. Please check your email for the correct verification link."
        )
    
    if user.verification_token_expires and user.verification_token_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token has expired. Please request a new verification email."
        )
    
    if user.is_verified:
        return {"message": "Email already verified"}
    
    # Verify user
    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    db.commit()
    db.refresh(user)
    
    return {"message": "Email verified successfully"}


@router.post("/resend-verification", response_model=dict)
async def resend_verification(
    request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """Resend verification email"""
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        # Don't reveal if email exists
        return {"message": "If the email exists, a verification email has been sent"}
    
    if user.is_verified:
        return {"message": "Email already verified"}
    
    # Generate new token
    verification_token = generate_verification_token()
    verification_expires = datetime.utcnow() + timedelta(
        hours=settings.verification_token_expire_hours
    )
    
    user.verification_token = verification_token
    user.verification_token_expires = verification_expires
    db.commit()
    
    # Send email
    email_sent = False
    try:
        email_sent = email_service.send_verification_email(
            email=user.email,
            token=verification_token,
            full_name=user.full_name
        )
        if not email_sent:
            # Email service not configured - log the verification link for development
            verification_url = f"{settings.frontend_url}/verify-email?token={verification_token}"
            print(f"\n[RESEND VERIFICATION] Email service not configured.")
            print(f"[RESEND VERIFICATION] Verification URL for {user.email}: {verification_url}\n")
    except Exception as e:
        print(f"[RESEND VERIFICATION] Error sending email: {e}")
        verification_url = f"{settings.frontend_url}/verify-email?token={verification_token}"
        print(f"[RESEND VERIFICATION] Verification URL: {verification_url}\n")
    
    response_data = {"message": "If the email exists, a verification email has been sent"}
    
    # Include verification URL in response if email wasn't sent (for development)
    if not email_sent:
        verification_url = f"{settings.frontend_url}/verify-email?token={verification_token}"
        response_data["verification_url"] = verification_url
        response_data["message"] += f". Verification URL: {verification_url}"
    
    return response_data


@router.post("/forgot-password", response_model=dict)
async def forgot_password(
    request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """Request password reset"""
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        # Don't reveal if email exists
        return {"message": "If the email exists, a password reset email has been sent"}
    
    # Generate reset token
    reset_token = generate_reset_token()
    reset_expires = datetime.utcnow() + timedelta(
        hours=settings.reset_token_expire_hours
    )
    
    user.reset_token = reset_token
    user.reset_token_expires = reset_expires
    db.commit()
    
    # Send email
    email_service.send_password_reset_email(
        email=user.email,
        token=reset_token,
        full_name=user.full_name
    )
    
    return {"message": "If the email exists, a password reset email has been sent"}


@router.post("/reset-password", response_model=dict)
async def reset_password(reset_data: PasswordReset, db: Session = Depends(get_db)):
    """Reset password with token"""
    user = db.query(User).filter(User.reset_token == reset_data.token).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token"
        )
    
    if user.reset_token_expires and user.reset_token_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired"
        )
    
    # Update password
    user.hashed_password = get_password_hash(reset_data.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    
    return {"message": "Password reset successfully"}


@router.post("/change-password", response_model=dict)
async def change_password(
    password_data: ChangePassword,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change password (requires current password)"""
    if not verify_password(password_data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}

