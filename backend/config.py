import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "TruthLens"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "truthlens_db"
    
    # JWT Authentication
    JWT_SECRET: str = "truthlens-secure-jwt-secret-key-production-2026-bright-glass-token"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    # External APIs (Optional, system has robust fallbacks)
    GOOGLE_FACT_CHECK_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    
    # Search timeouts and limits
    SEARCH_TIMEOUT_SECONDS: float = 8.0
    MAX_CLAIMS_PER_ARTICLE: int = 5
    MAX_EVIDENCE_PER_CLAIM: int = 6

    model_config = {"env_file": ".env", "extra": "allow"}

settings = Settings()
