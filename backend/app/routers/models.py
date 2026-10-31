from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.core.config import settings

router = APIRouter()

class ModelSelectRequest(BaseModel):
    provider: Optional[str] = None
    model_id: Optional[str] = None

@router.get("/")
def get_active_models():
    """
    Returns the list of AI models powering each feature and available options.
    """
    if settings.LLM_PROVIDER == "openrouter":
        provider_name = "OpenRouter"
        primary_model = settings.OPENROUTER_TEXT_MODEL
    elif settings.LLM_PROVIDER == "nvidia":
        provider_name = "NVIDIA NIM Free Endpoints"
        primary_model = settings.NVIDIA_TEXT_MODEL
    elif settings.LLM_PROVIDER == "gemini":
        provider_name = "Google Gemini Free Tier"
        primary_model = settings.GEMINI_TEXT_MODEL
    else:
        provider_name = "AWS Bedrock"
        primary_model = settings.AWS_BEDROCK_MODEL

    embedding_model = settings.GEMINI_EMBEDDING_MODEL if settings.GEMINI_API_KEY else "FakeEmbeddings (Local)"

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
                "provider": "Google Gemini Embeddings (3072 dims)",
                "model_id": embedding_model,
                "description": "Converts document text into vectors for semantic search in Neon PGVector."
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
                "name": "AI Teacher (Reasoning + Voice)",
                "provider": f"{provider_name} + Microsoft Edge TTS",
                "model_id": primary_model,
                "description": "Powers the AI Teacher's explanations with voice synthesis."
            },
            "image_generation": {
                "name": "Image Generator",
                "provider": "OpenRouter Image API / Free Visual Engine",
                "model_id": "qwen/qwen-image-2.1-turbo / Pollinations Flux",
                "description": "Generates high-definition educational diagrams and concept illustrations."
            },
            "speech_to_text": {
                "name": "Voice Input (STT)",
                "provider": "Google Gemini Multimodal Audio",
                "model_id": settings.GEMINI_TEXT_MODEL,
                "description": "Converts student voice recordings into text for Teacher mode."
            },
            "text_to_speech": {
                "name": "AI Teacher Voice (TTS)",
                "provider": "Microsoft Edge TTS Engine",
                "model_id": "en-US-AvaNeural / hi-IN-SwaraNeural / en-IN-NeerjaNeural",
                "description": "Synthesizes natural-sounding speech across English, Hindi, and Hinglish."
            }
        },
        "summary": {
            "primary_llm": primary_model,
            "embedding_model": embedding_model,
            "provider": provider_name
        },
        "available_providers": [
            {
                "id": "openrouter",
                "name": "OpenRouter (Cheap, Modern & Free Tier)",
                "active": settings.LLM_PROVIDER == "openrouter",
                "recommended_models": [
                    "openrouter/free",
                    "meta-llama/llama-3.3-70b-instruct:free",
                    "google/gemini-2.0-flash-001",
                    "deepseek/deepseek-chat",
                    "mistralai/mistral-small-3.1-24b-instruct:free"
                ]
            },
            {
                "id": "nvidia",
                "name": "NVIDIA NIM Free Endpoints",
                "active": settings.LLM_PROVIDER == "nvidia",
                "recommended_models": [
                    "nvidia/nemotron-3.5-bolt-e4b"
                ]
            },
            {
                "id": "gemini",
                "name": "Google Gemini Free Tier",
                "active": settings.LLM_PROVIDER == "gemini",
                "recommended_models": [
                    "gemini-2.5-flash"
                ]
            }
        ],
        "cloud_provider": provider_name
    }

@router.post("/select")
def select_model(request: ModelSelectRequest):
    """Allows runtime selection of model provider and model ID."""
    if request.provider:
        prov = request.provider.lower()
        if prov in ["openrouter", "nvidia", "gemini", "bedrock"]:
            settings.LLM_PROVIDER = prov
    if request.model_id:
        if settings.LLM_PROVIDER == "openrouter":
            settings.OPENROUTER_TEXT_MODEL = request.model_id
        elif settings.LLM_PROVIDER == "nvidia":
            settings.NVIDIA_TEXT_MODEL = request.model_id
        elif settings.LLM_PROVIDER == "gemini":
            settings.GEMINI_TEXT_MODEL = request.model_id
            
    return {
        "status": "success",
        "active_provider": settings.LLM_PROVIDER,
        "active_model": (
            settings.OPENROUTER_TEXT_MODEL if settings.LLM_PROVIDER == "openrouter"
            else settings.NVIDIA_TEXT_MODEL if settings.LLM_PROVIDER == "nvidia"
            else settings.GEMINI_TEXT_MODEL
        )
    }
