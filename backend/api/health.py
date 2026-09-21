from fastapi import APIRouter
from backend.config import settings
from backend.database import db_manager
from ml.inference import ml_detector

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
async def get_health():
    """
    Returns system status, database connectivity, and ML model availability.
    """
    return {
        "status": "healthy",
        "app_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": {
            "connected": db_manager.is_connected,
            "provider": "MongoDB" if db_manager.is_connected else "In-Memory Fallback"
        },
        "ml_model": {
            "loaded": ml_detector.model is not None and ml_detector.vectorizer is not None,
            "type": "TF-IDF + Logistic Regression"
        },
        "environment": settings.ENVIRONMENT
    }
