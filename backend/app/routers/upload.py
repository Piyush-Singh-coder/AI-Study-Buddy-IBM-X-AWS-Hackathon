from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, Depends, HTTPException, status
from typing import List, Optional
from app.services.processor import ProcessorService
from app.services.rag_service import RAGService
from app.database import SessionLocal
from app.models import StudySession
from app.core.security import get_authenticated_user_id

router = APIRouter()

def process_documents_payload(files_data: list, session_id: str, auth_user_id: Optional[str] = None) -> dict:
    """Core document ingestion pipeline with duplicate deduplication."""
    if not files_data:
        return {"processed_count": 0, "skipped_count": 0, "processed_files": [], "skipped_files": []}

    processor = ProcessorService()
    rag = RAGService(session_id=session_id)
    
    # Check already indexed documents in PGVector for this session
    existing_docs = set(rag.get_session_documents_list())
    seen_in_batch = set()
    processed_files = []
    skipped_files = []
    
    # Auto-name the session based on the first upload and associate user
    db = SessionLocal()
    try:
        session_record = db.query(StudySession).filter(StudySession.id == session_id).first()
        if session_record:
            if auth_user_id and (not session_record.user_id or session_record.user_id == "anonymous_user"):
                session_record.user_id = auth_user_id
            if session_record.title == "New Session" or not session_record.title:
                if files_data and files_data[0][1]:
                    clean_name = files_data[0][1].rsplit(".", 1)[0].replace("_", " ").title()
                    session_record.title = clean_name
            db.commit()
    except Exception as e:
        print(f"Error updating session metadata: {e}")
    finally:
        db.close()

    # Process files with duplicate prevention
    for file_content, filename, content_type in files_data:
        # Check duplicate by filename in this session or in this batch
        if filename in existing_docs or filename in seen_in_batch:
            print(f"Duplicate detected: '{filename}' is already indexed in session {session_id}. Skipping re-embedding.")
            skipped_files.append(filename)
            continue

        seen_in_batch.add(filename)
        try:
            text, metadata = processor.process_file_sync(file_content, filename, content_type)
            if text and not text.startswith("[Skipped") and not text.startswith("Error"):
                rag.add_document(text, metadata)
                processed_files.append(filename)
                print(f"Successfully processed and indexed: {filename}")
            else:
                print(f"Skipping or empty text for: {filename}")
                skipped_files.append(filename)
        except Exception as e:
            print(f"Error processing {filename}: {e}")
            skipped_files.append(filename)
            
    print(f"Ingestion complete: {len(processed_files)} new files indexed, {len(skipped_files)} duplicates/skipped for session {session_id}")
    return {
        "processed_count": len(processed_files),
        "skipped_count": len(skipped_files),
        "processed_files": processed_files,
        "skipped_files": skipped_files
    }

def process_documents_background(files_data: list, session_id: str, auth_user_id: Optional[str] = None):
    """Background fallback runner for large document sets."""
    process_documents_payload(files_data, session_id, auth_user_id)

@router.post("/")
async def upload_files(
    background_tasks: BackgroundTasks,
    files: Optional[List[UploadFile]] = File(None),
    file: Optional[UploadFile] = File(None),
    session_id: str = Form(...),
    auth_user_id: str = Depends(get_authenticated_user_id)
):
    """
    Upload and index study materials into PGVector.
    Strictly requires authentication. Unauthenticated users receive 401.
    Includes smart duplicate detection to skip re-embedding identical files.
    """
    raw_files: List[UploadFile] = []
    if files:
        raw_files.extend(files)
    elif file:
        raw_files.append(file)

    if not raw_files:
        raise HTTPException(status_code=400, detail="No files provided for upload.")

    files_data = []
    total_bytes = 0
    for f in raw_files:
        try:
            content = await f.read()
            if content:
                total_bytes += len(content)
                files_data.append((content, f.filename or "uploaded_file", f.content_type or "application/octet-stream"))
        except Exception as read_err:
            print(f"Failed reading upload {f.filename}: {read_err}")
    
    file_count = len(files_data)
    
    # If small batch (<= 2 files and < 8MB), process immediately for instant readiness!
    if file_count <= 2 and total_bytes < 8 * 1024 * 1024:
        result = process_documents_payload(files_data, session_id, auth_user_id)
        processed = result["processed_count"]
        skipped = result["skipped_count"]

        if processed == 0 and skipped > 0:
            msg = f"All {skipped} file(s) are already indexed in this session. Re-embedding was skipped."
        elif skipped > 0:
            msg = f"Indexed {processed} new file(s). Skipped {skipped} already indexed file(s)."
        else:
            msg = f"Successfully processed and indexed {processed} file(s)."

        return {
            "message": msg,
            "session_id": session_id,
            "files_received": file_count,
            "processed_count": processed,
            "skipped_count": skipped,
            "skipped_files": result["skipped_files"],
            "status": "ready"
        }

    # Otherwise process in background
    background_tasks.add_task(
        process_documents_background, 
        files_data, 
        session_id,
        auth_user_id
    )
    
    return {
        "message": f"Processing {file_count} file(s) in background.",
        "session_id": session_id,
        "files_received": file_count,
        "status": "processing"
    }
