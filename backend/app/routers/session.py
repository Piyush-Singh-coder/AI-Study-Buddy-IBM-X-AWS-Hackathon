from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import uuid
from app.services.rag_service import RAGService
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import StudySession
from app.core.security import get_authenticated_user_id

router = APIRouter()

class SessionCreateRequest(BaseModel):
    user_id: Optional[str] = None

class SessionResponse(BaseModel):
    session_id: str
    message: str

class ClaimSessionRequest(BaseModel):
    anon_user_id: str

@router.post("/create", response_model=SessionResponse)
def create_session(
    request: Optional[SessionCreateRequest] = None, 
    db: Session = Depends(get_db),
    auth_user_id: str = Depends(get_authenticated_user_id)
):
    """
    Create a new study session in the DB.
    Strictly requires authentication - unauthenticated users cannot create sessions.
    """
    session_id = str(uuid.uuid4())
    effective_user_id = auth_user_id
    
    new_session = StudySession(
        id=session_id,
        user_id=effective_user_id,
        title="New Session"
    )
    try:
        db.add(new_session)
        db.commit()
    except Exception:
        db.rollback()
        from app.database import create_db_and_tables
        create_db_and_tables()
        db.add(new_session)
        db.commit()
    
    return {"session_id": session_id, "message": "Session created successfully"}

@router.post("/claim")
def claim_anonymous_sessions(
    request: ClaimSessionRequest,
    db: Session = Depends(get_db),
    auth_user_id: str = Depends(get_authenticated_user_id)
):
    """Transfers sessions created while browsing anonymously to the logged-in user account."""
    if not auth_user_id:
        return {"claimed": 0, "message": "No authenticated user"}

    if not request.anon_user_id or request.anon_user_id == auth_user_id:
        return {"claimed": 0, "message": "Same user id"}

    sessions = db.query(StudySession).filter(StudySession.user_id == request.anon_user_id).all()
    count = 0
    for s in sessions:
        s.user_id = auth_user_id
        count += 1
    
    db.commit()
    return {"claimed": count, "message": f"Claimed {count} session(s) into your account."}

@router.get("/history/{user_id}")
def get_session_history(
    user_id: str, 
    db: Session = Depends(get_db),
    auth_user_id: str = Depends(get_authenticated_user_id)
):
    """Get all past sessions for the authenticated user."""
    sessions = db.query(StudySession).filter(StudySession.user_id == auth_user_id).order_by(StudySession.updated_at.desc()).all()
    return [{
        "id": s.id,
        "title": s.title or "Study Session",
        "created_at": s.created_at,
        "updated_at": s.updated_at
    } for s in sessions]

@router.delete("/history/{user_id}")
def clear_user_sessions(
    user_id: str,
    db: Session = Depends(get_db),
    auth_user_id: str = Depends(get_authenticated_user_id)
):
    """Clear all sessions and vectors for the authenticated user."""
    sessions = db.query(StudySession).filter(StudySession.user_id == auth_user_id).all()
    
    rag_service = RAGService()
    deleted_count = 0
    for s in sessions:
        try:
            rag_service.delete_session_documents(s.id)
            db.delete(s)
            deleted_count += 1
        except Exception as e:
            print(f"Error deleting session {s.id}: {e}")
            
    db.commit()
    return {"message": f"Cleared {deleted_count} session(s)."}

@router.delete("/{session_id}")
def delete_session(
    session_id: str, 
    db: Session = Depends(get_db),
    auth_user_id: str = Depends(get_authenticated_user_id)
):
    """Delete a session from DB and all its associated vectors."""
    try:
        # Verify ownership
        session_record = db.query(StudySession).filter(StudySession.id == session_id).first()
        if session_record and session_record.user_id and session_record.user_id != auth_user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this session.")

        # Delete vectors
        rag_service = RAGService()
        deleted_count = rag_service.delete_session_documents(session_id)
        
        # Delete from DB
        if session_record:
            db.delete(session_record)
            db.commit()
            
        return {"message": f"Session deleted. Removed {deleted_count} document chunks."}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in delete_session: {e}")
        raise HTTPException(status_code=500, detail=str(e))
