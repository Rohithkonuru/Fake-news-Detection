import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from backend.config import settings

logger = logging.getLogger(__name__)

class DatabaseManager:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    is_connected: bool = False
    
    # In-memory fallback if MongoDB is not reachable
    _memory_users: dict = {}
    _memory_verifications: list = []

    @classmethod
    async def connect(cls):
        try:
            cls.client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=2500
            )
            cls.db = cls.client[settings.DATABASE_NAME]
            # Ping database to verify connection
            await cls.client.admin.command('ping')
            cls.is_connected = True
            logger.info("Successfully connected to MongoDB.")
            await cls.create_indexes()
        except Exception as e:
            cls.is_connected = False
            logger.warning(f"MongoDB connection failed: {e}. Falling back to memory storage for session.")

    @classmethod
    async def create_indexes(cls):
        if not cls.is_connected or cls.db is None:
            return
        try:
            # Users collection indexes
            await cls.db.users.create_index("email", unique=True)
            await cls.db.users.create_index("username", unique=True)
            
            # Verifications collection indexes
            await cls.db.verifications.create_index("verification_id", unique=True)
            await cls.db.verifications.create_index("user_id")
            await cls.db.verifications.create_index([("created_at", -1)])
            
            # Evidence cache indexes
            await cls.db.evidence_cache.create_index("query_hash")
            logger.info("MongoDB indexes verified.")
        except Exception as e:
            logger.warning(f"Index creation warning: {e}")

    @classmethod
    async def close(cls):
        if cls.client:
            cls.client.close()
            cls.is_connected = False
            logger.info("MongoDB connection closed.")

    @classmethod
    def get_db(cls) -> Optional[AsyncIOMotorDatabase]:
        return cls.db

db_manager = DatabaseManager
