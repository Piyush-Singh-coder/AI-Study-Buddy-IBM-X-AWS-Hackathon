from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks
from typing import List, Optional
from app.services.processor import ProcessorService
from app.services.rag_service import RAGService
from app.database import SessionLocal
from app.models import StudySession

router = APIRouter()

def process_documents_background(files_data: list, session_id: str):
    """Background task to process documents without blocking the response."""
    processor = ProcessorService()
    rag = RAGService(session_id=session_id)
    
    processed_count = 0
    
    # Auto-name the session based on the first upload
    db = SessionLocal()
    try:
        session_record = db.query(StudySession).filter(StudySession.id == session_id).first()
        if session_record and session_record.title == "New Session":
            if files_data:
                session_record.title = files_data[0][1]  # The filename
            db.commit()
    except Exception as e:
        print(f"Error renaming session: {e}")
    finally:
        db.close()

    # Process files
    for file_content, filename, content_type in files_data:
        try:
            text, metadata = processor.process_file_sync(file_content, filename, content_type)
            if text and not text.startswith("[Skipped"):
                rag.add_document(text, metadata)
                processed_count += 1
        except Exception as e:
            print(f"Error processing {filename}: {e}")
    
    print(f"Background processing complete: {processed_count} files for session {session_id}")


@router.post("/")
async def upload_files(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(None),
    session_id: str = Form(...)
):
    """Upload files - returns immediately while processing happens in background."""
    files_data = []
    if files:
        for file in files:
            content = await file.read()
            files_data.append((content, file.filename, file.content_type))
    
    # Add background task
    background_tasks.add_task(
        process_documents_background, 
        files_data, 
        session_id
    )
    
    file_count = len(files_data)
    
    return {
        "message": f"Processing {file_count} file(s) in background. You can start using features!",
        "session_id": session_id,
        "status": "processing"
    }
