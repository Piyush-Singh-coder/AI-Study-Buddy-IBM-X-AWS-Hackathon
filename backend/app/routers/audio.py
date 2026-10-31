from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Response
from typing import Optional
from io import BytesIO
import base64
from app.services.rag_service import RAGService
from app.services.processor import ProcessorService

router = APIRouter()
processor = ProcessorService()

VOICE_MAP = {
    "English": "en-US-AvaNeural",
    "Hindi": "hi-IN-SwaraNeural",
    "Hinglish": "en-IN-NeerjaNeural",
}

@router.post("/interact")
async def teacher_interaction(
    session_id: str = Form(...),
    text_input: Optional[str] = Form(None),
    language: Optional[str] = Form("English"),
    audio_file: Optional[UploadFile] = File(None)
):
    """
    Handles Voice/Text interaction with the Teacher AI.
    Returns: JSON with base64 audio data, transcript, and AI explanation.
    """
    try:
        user_query = ""
        
        # 1. Get Text from Audio or Direct Input
        if audio_file:
            content = await audio_file.read()
            filename = audio_file.filename or "input.webm"
            audio_stream = BytesIO(content)
            audio_stream.name = filename
            
            user_query = processor.process_audio(audio_stream, filename)
            if user_query.startswith("Error"):
                # If transcription failed, fall back to default question or prompt
                user_query = text_input if text_input else "Can you explain the key concepts from the uploaded material?"
        elif text_input:
            user_query = text_input.strip()
            
        if not user_query:
            raise HTTPException(status_code=400, detail="No query or audio provided.")

        # 2. Get Teacher Response (RAG)
        selected_lang = language or "English"
        rag_service = RAGService(session_id=session_id)
        result = rag_service.teacher_chat(user_query, language=selected_lang)
        teacher_response_text = result.get("response", "Here is an explanation of the topic.")
        sources = result.get("sources", ["Study Material"])

        # 3. Generate Audio asynchronously
        voice = VOICE_MAP.get(selected_lang, "en-US-AvaNeural")
        audio_stream = await processor.text_to_speech_async(teacher_response_text, voice=voice)
        
        audio_b64 = ""
        if audio_stream:
            audio_b64 = base64.b64encode(audio_stream.read()).decode('utf-8')

        return {
            "audio_base64": audio_b64,
            "user_text": user_query,
            "ai_text": teacher_response_text,
            "sources": sources,
            "language": selected_lang
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Teacher interaction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
