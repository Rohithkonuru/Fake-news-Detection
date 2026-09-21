import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from backend.database import db_manager
from backend.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    TokenResponse
)
from backend.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user_required
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
async def register_user(req: UserRegisterRequest):
    db = db_manager.get_db()
    email_clean = req.email.lower().strip()
    username_clean = req.username.strip()

    if db_manager.is_connected and db is not None:
        # Check existing user in MongoDB
        existing_email = await db.users.find_one({"email": email_clean})
        if existing_email:
            raise HTTPException(status_code=400, detail="An account with this email already exists.")
        
        existing_username = await db.users.find_one({"username": username_clean})
        if existing_username:
            raise HTTPException(status_code=400, detail="This username is already taken.")
            
        user_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc)
        user_doc = {
            "id": user_id,
            "username": username_clean,
            "email": email_clean,
            "hashed_password": hash_password(req.password),
            "created_at": created_at,
            "role": "user"
        }
        await db.users.insert_one(user_doc)
    else:
        # Memory storage fallback
        for u in db_manager._memory_users.values():
            if u["email"] == email_clean:
                raise HTTPException(status_code=400, detail="An account with this email already exists.")
            if u["username"] == username_clean:
                raise HTTPException(status_code=400, detail="This username is already taken.")
                
        user_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc)
        user_doc = {
            "id": user_id,
            "username": username_clean,
            "email": email_clean,
            "hashed_password": hash_password(req.password),
            "created_at": created_at,
            "role": "user"
        }
        db_manager._memory_users[user_id] = user_doc

    user_resp = UserResponse(
        id=user_id,
        username=username_clean,
        email=email_clean,
        created_at=created_at,
        role="user"
    )
    
    token = create_access_token(data={"sub": user_id, "username": username_clean, "email": email_clean})
    return TokenResponse(access_token=token, token_type="bearer", user=user_resp)

@router.post("/login", response_model=TokenResponse)
async def login_user(req: UserLoginRequest):
    identifier = req.email_or_username.strip().lower()
    db = db_manager.get_db()
    user_doc = None

    if db_manager.is_connected and db is not None:
        user_doc = await db.users.find_one({
            "$or": [{"email": identifier}, {"username": req.email_or_username.strip()}]
        })
    else:
        for u in db_manager._memory_users.values():
            if u["email"] == identifier or u["username"] == req.email_or_username.strip():
                user_doc = u
                break

    if not user_doc or not verify_password(req.password, user_doc["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password."
        )

    user_resp = UserResponse(
        id=user_doc["id"],
        username=user_doc["username"],
        email=user_doc["email"],
        created_at=user_doc["created_at"],
        role=user_doc.get("role", "user")
    )
    
    token = create_access_token(data={"sub": user_doc["id"], "username": user_doc["username"], "email": user_doc["email"]})
    return TokenResponse(access_token=token, token_type="bearer", user=user_resp)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user_required)):
    user_id = current_user.get("sub")
    db = db_manager.get_db()
    user_doc = None
    
    if db_manager.is_connected and db is not None:
        user_doc = await db.users.find_one({"id": user_id})
    else:
        user_doc = db_manager._memory_users.get(user_id)

    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found.")

    return UserResponse(
        id=user_doc["id"],
        username=user_doc["username"],
        email=user_doc["email"],
        created_at=user_doc["created_at"],
        role=user_doc.get("role", "user")
    )
