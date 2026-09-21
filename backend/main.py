import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config import settings
from backend.database import db_manager
from backend.api.health import router as health_router
from backend.api.auth import router as auth_router
from backend.api.verify import router as verify_router
from backend.api.history import router as history_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("truthlens")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing TruthLens backend services...")
    await db_manager.connect()
    yield
    # Shutdown
    logger.info("Shutting down TruthLens backend services...")
    await db_manager.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="TruthLens — AI-Powered News & Claim Verification System",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if not settings.DEBUG else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler for security and user-friendly error formatting
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=settings.DEBUG)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred while processing your request. Please try again shortly.",
            "path": request.url.path
        }
    )

# Register API Routers
app.include_router(health_router, prefix=settings.API_PREFIX)
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(verify_router, prefix=settings.API_PREFIX)
app.include_router(history_router, prefix=settings.API_PREFIX)

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "api_docs": "/docs",
        "health": f"{settings.API_PREFIX}/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
