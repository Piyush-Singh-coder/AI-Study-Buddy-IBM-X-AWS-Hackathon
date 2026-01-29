from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Response
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.services.rag_service import RAGService
from app.services.processor import ProcessorService
from app.services.docx_generator import create_sample_paper_docx
import json

router = APIRouter()
processor = ProcessorService()

class QuizRequest(BaseModel):
    session_id: str
    topic: Optional[str] = "general"
    difficulty: Optional[str] = Field(default="medium", description="easy, medium, or hard")
    num_questions: Optional[int] = Field(default=5, ge=5, le=50)

class SummaryRequest(BaseModel):
    session_id: str
    context: Optional[str] = None
    summary_type: Optional[str] = "detailed"
    source_filter: Optional[str] = None

class WeakSpotsRequest(BaseModel):
    session_id: str
    questions: List[Dict[str, Any]]
    user_answers: Dict[str, str]

@router.post("/generate")
def generate_quiz(request: QuizRequest):
    try:
        rag_service = RAGService(session_id=request.session_id)
        if request.difficulty not in ["easy", "medium", "hard"]:
            request.difficulty = "medium"
        return rag_service.generate_quiz(
            topic=request.topic or "general",
            difficulty=request.difficulty,
            num_questions=request.num_questions
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze")
def analyze_weak_spots(request: WeakSpotsRequest):
    try:
        rag_service = RAGService(session_id=request.session_id)
        return rag_service.analyze_weak_spots(request.questions, request.user_answers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summary")
def generate_summary(request: SummaryRequest):
    try:
        rag_service = RAGService(session_id=request.session_id)
        context = request.context if request.context else "full_context_trigger"
        summary_type = request.summary_type or "detailed"
        return {"summary": rag_service.generate_summary(context, summary_type, request.source_filter)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents/{session_id}")
def get_session_documents(session_id: str):
    try:
        rag_service = RAGService(session_id=session_id)
        return {"documents": rag_service.get_session_documents_list()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/pyq-generator")
async def generate_pyq_sample(
    session_id: str = Form(...),
    file: UploadFile = File(...)
):
    """
    1. Upload PYQ
    2. Extract Text
    3. Analyze Pattern
    4. Generate New Paper from Session Content
    5. Return JSON structure (Frontend can request DOCX download separately or we return file directly)
    """
    try:
        # 1. Process File
        result = await processor.process_file(file)
        if isinstance(result, tuple):
            text, _ = result
        else:
            text = result
            
        if text.startswith("Error"):
            raise HTTPException(status_code=400, detail=text)
            
        # 2. Initialize RAG
        rag_service = RAGService(session_id=session_id)
        
        # 3. Analyze Pattern
        pattern = rag_service.analyze_pyq_pattern(text)
        if not pattern:
            raise HTTPException(status_code=500, detail="Failed to analyze PYQ pattern.")
            
        # 4. Get Session Context
        # Retrieve all/most context. Since we can't get ALL, we get a large chunk summarizing key topics
        # Or better: we let the generate_sample_paper method handle limited retrieval internally?
        # For now, let's fetch a broad context about "all topics"
        # In rag_service.generate_sample_paper we need context. 
        # Helper:
        context, _ = rag_service.get_context_for_quiz("comprehensive overview of all topics")
        
        # 5. Generate Paper
        paper_data = rag_service.generate_sample_paper(context, pattern)
        
        return paper_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/download-paper")
def download_paper(paper_data: dict):
    """Converts the JSON paper data into a DOCX file."""
    try:
        buffer = create_sample_paper_docx(paper_data)
        
        headers = {
            'Content-Disposition': 'attachment; filename="Sample_Paper.docx"'
        }
        return Response(content=buffer.getvalue(), headers=headers, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
