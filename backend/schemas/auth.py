from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, max_length=128, description="Account password")

class UserLoginRequest(BaseModel):
    email_or_username: str = Field(..., min_length=3, description="Email or username")
    password: str = Field(..., min_length=1, description="Password")

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    created_at: datetime
    role: str = "user"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
