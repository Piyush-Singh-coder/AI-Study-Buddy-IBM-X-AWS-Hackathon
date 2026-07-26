from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("/")
def get_active_models():
    """
    Returns the list of AI models powering each feature.
    """
    provider_name = "NVIDIA NIM Free Endpoints" if settings.LLM_PROVIDER == "nvidia" else "Google Gemini Free Tier"
    primary_model = settings.NVIDIA_TEXT_MODEL if settings.LLM_PROVIDER == "nvidia" else settings.GEMINI_TEXT_MODEL
    embedding_model = settings.GEMINI_EMBEDDING_MODEL if settings.GEMINI_API_KEY else "all-MiniLM-L6-v2 (Local HuggingFace)"

    return {
        "features": {
            "chat_rag": {
                "name": "Chat & RAG",
                "provider": provider_name,
                "model_id": primary_model,
                "description": "Powers the chat interface and contextual Q&A from your documents."
            },
            "embeddings": {
                "name": "Vector Embeddings",
                "provider": "Google Gemini / HuggingFace",
                "model_id": embedding_model,
                "description": "Converts document text into vectors for semantic search (PGVector)."
            },
            "summary": {
                "name": "Summary Generator",
                "provider": provider_name,
                "model_id": primary_model,
                "description": "Creates brief or detailed summaries from uploaded materials."
            },
            "quiz": {
                "name": "Quiz Generator",
                "provider": provider_name,
                "model_id": primary_model,
                "description": "Generates MCQ quizzes based on document content."
            },
            "slides": {
                "name": "Slide Generator",
                "provider": f"{provider_name} + python-pptx",
                "model_id": primary_model,
                "description": "Generates structured content for PowerPoint presentations."
            },
            "teacher_brain": {
                "name": "AI Teacher (Reasoning + Edge TTS)",
                "provider": f"{provider_name} + Edge TTS",
                "model_id": primary_model,
                "description": "Powers the AI Teacher's explanations with voice synthesis."
            },
            "image_generation": {
                "name": "Image Generator",
                "provider": "Free Educational Image Engine",
                "model_id": "Pollinations.ai",
                "description": "Creates educational diagrams and illustrations from text prompts."
            },
            "image_vision": {
                "name": "Image Analysis (OCR)",
                "provider": provider_name,
                "model_id": primary_model,
                "description": "Extracts text and analyzes diagrams from uploaded images using vision."
            },
            "speech_to_text": {
                "name": "Voice Input (STT)",
                "provider": "Google Gemini Audio",
                "model_id": "gemini-2.0-flash",
                "description": "Converts student voice recordings into text for the Teacher mode."
            },
            "text_to_speech": {
                "name": "AI Teacher Voice (TTS)",
                "provider": "Microsoft Edge TTS Engine",
                "model_id": "en-US-AvaNeural",
                "description": "Synthesizes natural-sounding speech for the AI Teacher's responses."
            }
        },
        "summary": {
            "primary_llm": primary_model,
            "embedding_model": embedding_model,
            "provider": provider_name
        },
        "cloud_provider": provider_name
    }
