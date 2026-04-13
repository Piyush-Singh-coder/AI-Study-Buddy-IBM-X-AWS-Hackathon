from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("/")
def get_active_models():
    """
    Returns the comprehensive list of AI models powering each feature.
    """
    return {
        "features": {
            "chat_rag": {
                "name": "Chat & RAG",
                "provider": "OpenAI",
                "model_id": settings.OPENAI_TEXT_MODEL,
                "description": "Powers the chat interface and contextual Q&A from your documents."
            },
            "embeddings": {
                "name": "Vector Embeddings",
                "provider": "OpenAI",
                "model_id": settings.OPENAI_EMBEDDING_MODEL,
                "description": "Converts document text into 1536-dim vectors for semantic search (PGVector)."
            },
            "summary": {
                "name": "Summary Generator",
                "provider": "OpenAI",
                "model_id": settings.OPENAI_TEXT_MODEL,
                "description": "Creates brief or detailed summaries from uploaded materials."
            },
            "quiz": {
                "name": "Quiz Generator",
                "provider": "OpenAI",
                "model_id": settings.OPENAI_TEXT_MODEL,
                "description": "Generates MCQ quizzes based on document content."
            },
            "slides": {
                "name": "Slide Generator",
                "provider": "OpenAI + python-pptx",
                "model_id": settings.OPENAI_TEXT_MODEL,
                "description": "Generates structured content for PowerPoint presentations."
            },
            "teacher_brain": {
                "name": "AI Teacher (Reasoning + TTS)",
                "provider": "OpenAI",
                "model_id": settings.OPENAI_TEXT_MODEL,
                "description": "Powers the AI Teacher's explanations with analogies and examples."
            },
            "image_generation": {
                "name": "Image Generator",
                "provider": "OpenAI",
                "model_id": settings.OPENAI_IMAGE_MODEL,
                "description": "Creates educational diagrams and illustrations from text prompts."
            },
            "image_vision": {
                "name": "Image Analysis (OCR)",
                "provider": "OpenAI",
                "model_id": settings.OPENAI_TEXT_MODEL,
                "description": "Extracts text and analyzes diagrams from uploaded images using vision."
            },
            "speech_to_text": {
                "name": "Voice Input (STT)",
                "provider": "OpenAI",
                "model_id": settings.OPENAI_STT_MODEL,
                "description": "Converts student voice recordings into text for the Teacher mode."
            },
            "text_to_speech": {
                "name": "AI Teacher Voice (TTS)",
                "provider": "OpenAI",
                "model_id": settings.OPENAI_TTS_MODEL,
                "description": "Synthesizes natural-sounding speech for the AI Teacher's responses."
            },
            "sample_paper": {
                "name": "PYQ Sample Paper",
                "provider": "OpenAI + python-docx",
                "model_id": settings.OPENAI_TEXT_MODEL,
                "description": "Generates sample exam papers based on PYQ pattern analysis."
            }
        },
        "summary": {
            "primary_llm": settings.OPENAI_TEXT_MODEL,
            "embedding_model": settings.OPENAI_EMBEDDING_MODEL,
            "image_model": settings.OPENAI_IMAGE_MODEL,
            "stt_service": settings.OPENAI_STT_MODEL,
            "tts_service": settings.OPENAI_TTS_MODEL
        },
        "cloud_provider": "OpenAI"
    }
