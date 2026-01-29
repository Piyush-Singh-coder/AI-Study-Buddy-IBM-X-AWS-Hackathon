from fastapi import APIRouter, UploadFile, File, Form
from typing import List
from app.services.processor import ProcessorService
from app.services.rag_service import RAGService
import asyncio

router = APIRouter()

@router.post("/")
async def upload_files(
    files: List[UploadFile] = File(None),
    youtube_url: str = Form(None),
    session_id: str = Form(...)
):
    """Upload and process files or YouTube URL."""
    processor = ProcessorService()
    rag = RAGService(session_id=session_id)
    
    processed_count = 0
    
    # Process uploaded files
    if files:
        # Process files in parallel for speed
        async def process_single_file(file):
            text, metadata = await processor.process_file(file)
            if text and not text.startswith("[Skipped"):
                rag.add_document(text, metadata)
                return 1
            return 0
        
        results = await asyncio.gather(*[process_single_file(f) for f in files])
        processed_count = sum(results)
    
    # Process YouTube URL
    if youtube_url:
        text, metadata = processor.process_youtube(youtube_url)
        if text and not text.startswith("Error"):
            rag.add_document(text, metadata)
            processed_count += 1
    
    return {
        "message": f"Successfully processed {processed_count} file(s)",
        "session_id": session_id
    }
