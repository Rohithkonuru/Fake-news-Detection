from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from backend.database import db_manager
from backend.schemas.verify import FullVerificationResponse
from backend.utils.security import get_current_user_optional

router = APIRouter(prefix="/history", tags=["History & Analytics"])

@router.get("", response_model=List[FullVerificationResponse])
async def get_history(
    q: Optional[str] = Query(None, description="Search term in claims or titles"),
    verdict: Optional[str] = Query(None, description="Filter by verdict"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Returns past verifications with optional keyword search and verdict filtering.
    """
    db = db_manager.get_db()
    user_id = current_user.get("sub") if current_user else None

    if db_manager.is_connected and db is not None:
        filter_dict = {}
        if user_id:
            filter_dict["$or"] = [{"user_id": user_id}, {"user_id": None}]
        if verdict:
            filter_dict["overall_verdict"] = verdict
        if q:
            filter_dict["$or"] = [
                {"original_input": {"$regex": q, "$options": "i"}},
                {"extracted_title": {"$regex": q, "$options": "i"}}
            ]
        
        cursor = db.verifications.find(filter_dict, {"_id": 0}).sort("created_at", -1).skip(offset).limit(limit)
        results = await cursor.to_list(length=limit)
        return results
    else:
        # Memory storage fallback
        items = db_manager._memory_verifications
        if verdict:
            items = [item for item in items if item.get("overall_verdict") == verdict]
        if q:
            q_lower = q.lower()
            items = [item for item in items if q_lower in item.get("original_input", "").lower() or q_lower in (item.get("extracted_title") or "").lower()]
        return items[offset:offset+limit]

@router.get("/stats")
async def get_analytics_stats(current_user: Optional[dict] = Depends(get_current_user_optional)):
    """
    Computes dashboard analytics: verdict distribution, source authority metrics, and timeline activity.
    """
    db = db_manager.get_db()
    verifications = []

    if db_manager.is_connected and db is not None:
        cursor = db.verifications.find({}, {"_id": 0}).sort("created_at", -1).limit(500)
        verifications = await cursor.to_list(length=500)
    else:
        verifications = db_manager._memory_verifications

    total = len(verifications)
    supported = sum(1 for v in verifications if v.get("overall_verdict") == "SUPPORTED")
    contradicted = sum(1 for v in verifications if v.get("overall_verdict") == "CONTRADICTED")
    unverified = sum(1 for v in verifications if v.get("overall_verdict") == "UNVERIFIED")
    misleading = sum(1 for v in verifications if "MISLEADING" in v.get("overall_verdict", ""))

    # Source category breakdown
    source_counts = {
        "Fact-checking organization": 0,
        "Government / Official": 0,
        "Scientific / Academic": 0,
        "Established News": 0,
        "Organization / Company": 0,
        "General Website": 0,
        "Unknown": 0
    }

    for v in verifications:
        for c in v.get("claims", []):
            for s in c.get("evidence_sources", []):
                cat = s.get("source_type", "General Website")
                if cat in source_counts:
                    source_counts[cat] += 1
                else:
                    source_counts["General Website"] += 1

    # Activity timeline breakdown (by date or hour)
    timeline_map = {}
    for v in verifications[:50]:
        created = v.get("created_at")
        date_str = str(created)[:10] if created else "Recent"
        timeline_map[date_str] = timeline_map.get(date_str, 0) + 1

    activity_timeline = [{"date": k, "count": v} for k, v in list(timeline_map.items())[-7:]]

    return {
        "total_analyzed": total,
        "supported_count": supported,
        "contradicted_count": contradicted,
        "unverified_count": unverified,
        "misleading_count": misleading,
        "source_categories": source_counts,
        "activity_timeline": activity_timeline
    }

@router.get("/{verification_id}", response_model=FullVerificationResponse)
async def get_verification_by_id(verification_id: str):
    """
    Retrieves a single historical verification by verification_id.
    """
    db = db_manager.get_db()
    if db_manager.is_connected and db is not None:
        doc = await db.verifications.find_one({"verification_id": verification_id}, {"_id": 0})
        if not doc:
            raise HTTPException(status_code=404, detail="Verification report not found.")
        return doc
    else:
        for v in db_manager._memory_verifications:
            if v.get("verification_id") == verification_id:
                return v
        raise HTTPException(status_code=404, detail="Verification report not found.")
