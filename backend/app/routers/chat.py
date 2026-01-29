from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.rag_service import RAGService
from typing import List, Optional

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    session_id: str

class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[str]] = []

@router.post("/", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        rag_service = RAGService(session_id=request.session_id)
        result = rag_service.chat(request.query)
        
        if isinstance(result, dict):
            return {"response": result["response"], "sources": result.get("sources", [])}
        return {"response": result, "sources": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
