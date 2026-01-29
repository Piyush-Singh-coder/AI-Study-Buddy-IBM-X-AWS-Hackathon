from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Response
from typing import Optional
from io import BytesIO
from app.services.rag_service import RAGService
from app.services.processor import ProcessorService

router = APIRouter()
processor = ProcessorService()

@router.post("/interact")
async def teacher_interaction(
    session_id: str = Form(...),
    text_input: Optional[str] = Form(None),
    language: Optional[str] = Form("English"),
    audio_file: Optional[UploadFile] = File(None)
):
    """
    Handles Voice/Text interaction with the Teacher AI.
    Returns: Binary Audio Data (TTS of the answer) and Headers with the text transcript.
    """
    try:
        user_query = ""
        
        # 1. Get Text (Transcription or Direct Input)
        if audio_file:
            # Process uploaded audio blob (webm/mp3/wav)
            content = await audio_file.read()
            audio_stream = BytesIO(content)
            audio_stream.name = "input.webm" # Default for browser recording
            
            user_query = processor.process_audio(audio_stream, "input.webm")
            if user_query.startswith("Error"):
                raise HTTPException(status_code=400, detail="Failed to transcribe audio.")
        elif text_input:
            user_query = text_input
        else:
            raise HTTPException(status_code=400, detail="No input provided.")
            
        if not user_query.strip():
            raise HTTPException(status_code=400, detail="Empty query.")

        # 2. Get Teacher Response (RAG)
        rag_service = RAGService(session_id=session_id)
        result = rag_service.teacher_chat(user_query, language=language)
        teacher_response_text = result["response"]
        
        # 3. Generate Audio (TTS)
        audio_stream = processor.text_to_speech(teacher_response_text)
        
        if not audio_stream:
            # Fallback if TTS fails (e.g. rate limit, though unlikely with OpenAI)
            return Response(
                content=teacher_response_text.encode(),
                media_type="text/plain",
                headers={
                    "X-Transcript-User": user_query.replace("\n", " "),
                    "X-Transcript-AI": teacher_response_text.replace("\n", " ") # Simplified header passing
                }
            )

        # 4. Return Audio with Headers for Transcript
        # Note: Headers must be ascii, so we might need base64 encoding for complex text or just return JSON with blob?
        # Standard approach: Return JSON with base64 audio OR Return Blob and fetch transcript separately.
        # Let's return the audio blob and put the text in custom headers (careful with length).
        # Better approach for long text: Return JSON with {"audio": "base64...", "text": "...", "user_text": "..."}
        
        import base64
        audio_b64 = base64.b64encode(audio_stream.read()).decode('utf-8')
        
        return {
            "audio_base64": audio_b64,
            "user_text": user_query,
            "ai_text": teacher_response_text,
            "sources": result["sources"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
