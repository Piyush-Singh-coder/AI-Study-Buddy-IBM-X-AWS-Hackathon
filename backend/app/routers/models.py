from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("/")
def get_active_models():
    """
    Returns the comprehensive list of AI models powering each feature.
    Based on actual code audit (Jan 2026).
    """
    return {
        "features": {
            "chat_rag": {
                "name": "Chat & RAG",
                "provider": "AWS Bedrock",
                "model_id": settings.BEDROCK_TEXT_MODEL,
                "description": "Powers the chat interface and contextual Q&A from your documents."
            },
            "embeddings": {
                "name": "Vector Embeddings",
                "provider": "AWS Bedrock",
                "model_id": settings.BEDROCK_EMBEDDING_MODEL,
                "description": "Converts document text into vectors for semantic search (PGVector)."
            },
            "summary": {
                "name": "Summary Generator",
                "provider": "AWS Bedrock",
                "model_id": settings.BEDROCK_TEXT_MODEL,
                "description": "Creates brief or detailed summaries from uploaded materials."
            },
            "quiz": {
                "name": "Quiz Generator",
                "provider": "AWS Bedrock",
                "model_id": settings.BEDROCK_TEXT_MODEL,
                "description": "Generates MCQ quizzes based on document content."
            },
            "slides": {
                "name": "Slide Generator",
                "provider": "AWS Bedrock + python-pptx",
                "model_id": settings.BEDROCK_TEXT_MODEL,
                "description": "Generates structured content for PowerPoint presentations."
            },
            "teacher_brain": {
                "name": "AI Teacher (Reasoning + TTS)",
                "provider": "AWS Bedrock",
                "model_id": settings.BEDROCK_TEXT_MODEL,
                "description": "Powers the AI Teacher's explanations with analogies and examples. Synthesizes natural-sounding speech for the AI Teacher's responses."
            },
            "image_generation": {
                "name": "Image Generator",
                "provider": "AWS Bedrock",
                "model_id": "amazon.titan-image-generator-v2:0",
                "description": "Creates educational diagrams and illustrations from text prompts."
            },
            "image_vision": {
                "name": "Image Analysis (OCR)",
                "provider": "AWS Bedrock",
                "model_id": settings.BEDROCK_TEXT_MODEL,
                "description": "Extracts text and analyzes diagrams from uploaded images."
            },
            "speech_to_text": {
                "name": "Voice Input (STT)",
                "provider": "AWS Transcribe",
                "model_id": "AWS Transcribe (Automatic)",
                "description": "Converts student voice recordings into text for the Teacher mode."
            },
            "sample_paper": {
                "name": "PYQ Sample Paper",
                "provider": "AWS Bedrock + python-docx",
                "model_id": settings.BEDROCK_TEXT_MODEL,
                "description": "Generates sample exam papers based on PYQ pattern analysis."
            }
        },
        "summary": {
            "primary_llm": settings.BEDROCK_TEXT_MODEL,
            "embedding_model": settings.BEDROCK_EMBEDDING_MODEL,
            "image_model": "amazon.titan-image-generator-v2:0",
            "stt_service": "AWS Transcribe",
            "tts_service": "OpenAI tts-1"
        },
        "cloud_provider": "AWS (Bedrock, Transcribe, S3)",
        "region": settings.AWS_REGION
    }
