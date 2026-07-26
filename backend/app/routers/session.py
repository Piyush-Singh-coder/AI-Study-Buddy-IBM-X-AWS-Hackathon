from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import uuid
from app.services.rag_service import RAGService
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import StudySession
from app.core.security import get_current_user_id

router = APIRouter()

class SessionCreateRequest(BaseModel):
    user_id: Optional[str] = None

class SessionResponse(BaseModel):
    session_id: str
    message: str

@router.post("/create", response_model=SessionResponse)
def create_session(
    request: Optional[SessionCreateRequest] = None, 
    db: Session = Depends(get_db),
    auth_user_id: str = Depends(get_current_user_id)
):
    """Create a new study session in the DB and return session_id."""
    session_id = str(uuid.uuid4())
    effective_user_id = auth_user_id if auth_user_id != "anonymous_user" else (request.user_id if request and request.user_id else "anonymous_user")
    
    new_session = StudySession(
        id=session_id,
        user_id=effective_user_id,
        title="New Session"
    )
    db.add(new_session)
    db.commit()
    
    return {"session_id": session_id, "message": "Session created successfully"}

@router.get("/history/{user_id}")
def get_session_history(
    user_id: str, 
    db: Session = Depends(get_db),
    auth_user_id: str = Depends(get_current_user_id)
):
    """Get all past sessions for a user."""
    target_user_id = auth_user_id if auth_user_id != "anonymous_user" else user_id
    sessions = db.query(StudySession).filter(StudySession.user_id == target_user_id).order_by(StudySession.updated_at.desc()).all()
    return [{
        "id": s.id,
        "title": s.title,
        "created_at": s.created_at,
        "updated_at": s.updated_at
    } for s in sessions]

@router.delete("/{session_id}")
def delete_session(session_id: str, db: Session = Depends(get_db)):
    """Delete a session from DB and all its associated vectors."""
    try:
        # Delete vectors
        rag_service = RAGService()
        deleted_count = rag_service.delete_session_documents(session_id)
        
        # Delete from DB
        session_record = db.query(StudySession).filter(StudySession.id == session_id).first()
        if session_record:
            db.delete(session_record)
            db.commit()
            
        return {"message": f"Session deleted. Removed {deleted_count} document chunks."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
