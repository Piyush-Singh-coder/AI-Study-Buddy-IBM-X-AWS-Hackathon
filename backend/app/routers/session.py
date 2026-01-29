from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import uuid
from app.services.rag_service import RAGService

router = APIRouter()

class SessionResponse(BaseModel):
    session_id: str
    message: str

@router.post("/create", response_model=SessionResponse)
def create_session():
    """Create a new study session and return session_id."""
    session_id = str(uuid.uuid4())
    return {"session_id": session_id, "message": "Session created successfully"}

@router.delete("/{session_id}")
def delete_session(session_id: str):
    """Delete a session and all its associated vectors."""
    try:
        rag_service = RAGService()
        deleted_count = rag_service.delete_session_documents(session_id)
        return {"message": f"Session deleted. Removed {deleted_count} document chunks."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
