from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks
from typing import List
from app.services.processor import ProcessorService
from app.services.rag_service import RAGService

router = APIRouter()

def process_documents_background(files_data: list, youtube_url: str, session_id: str):
    """Background task to process documents without blocking the response."""
    processor = ProcessorService()
    rag = RAGService(session_id=session_id)
    
    processed_count = 0
    
    # Process files
    for file_content, filename, content_type in files_data:
        try:
            text, metadata = processor.process_file_sync(file_content, filename, content_type)
            if text and not text.startswith("[Skipped"):
                rag.add_document(text, metadata)
                processed_count += 1
        except Exception as e:
            print(f"Error processing {filename}: {e}")
    
    # Process YouTube URL
    if youtube_url:
        try:
            text, metadata = processor.process_youtube(youtube_url)
            if text and not text.startswith("Error"):
                rag.add_document(text, metadata)
                processed_count += 1
            else:
                print(f"YouTube processing returned error: {text}")
        except Exception as e:
            print(f"Error processing YouTube: {e}")
    
    print(f"Background processing complete: {processed_count} files for session {session_id}")


@router.post("/")
async def upload_files(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(None),
    youtube_url: str = Form(None),
    session_id: str = Form(...)
):
    """Upload files - returns immediately while processing happens in background."""
    
    # Read file contents immediately (before response returns)
    files_data = []
    if files:
        for file in files:
            content = await file.read()
            files_data.append((content, file.filename, file.content_type))
    
    # Add background task
    background_tasks.add_task(
        process_documents_background, 
        files_data, 
        youtube_url, 
        session_id
    )
    
    file_count = len(files_data) + (1 if youtube_url else 0)
    
    return {
        "message": f"Processing {file_count} file(s) in background. You can start using features!",
        "session_id": session_id,
        "status": "processing"
    }
