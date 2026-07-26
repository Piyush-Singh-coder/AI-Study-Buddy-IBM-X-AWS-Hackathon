from fastapi import APIRouter, Form, HTTPException
from app.services.rag_service import RAGService
from app.core.config import settings
import base64
import requests
import urllib.parse

router = APIRouter()

@router.post("/generate")
async def generate_educational_image(
    session_id: str = Form(...),
    topic: str = Form(...),
    style: str = Form("educational diagram")
):
    """
    Generates an educational image for a given topic using free API endpoint (Pollinations.ai / Gemini prompt).
    Returns: Base64-encoded image data
    """
    try:
        prompt = f"minimalist educational {style} about {topic}, clean white background, textbook illustration, academic structure"
        encoded_prompt = urllib.parse.quote(prompt)
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true"
        
        resp = requests.get(image_url, timeout=30)
        resp.raise_for_status()
        base64_image = base64.b64encode(resp.content).decode('utf-8')
        
        return {
            "success": True,
            "image_data": base64_image,
            "original_topic": topic,
            "prompt_used": prompt,
            "note": "Image generated with free tier visual endpoint"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")


@router.post("/generate-from-context")
async def generate_image_from_documents(
    session_id: str = Form(...),
    concept: str = Form(...),
):
    """
    Generates an educational image based on uploaded study materials.
    """
    try:
        # 1. Get relevant context from documents
        rag_service = RAGService(session_id=session_id)
        retriever = rag_service._get_session_retriever(k=5)
        docs = retriever.invoke(concept) if retriever else []
        
        context = "\n".join([doc.page_content[:300] for doc in docs[:3]]) if docs else concept
        
        # 2. Optimized prompt
        prompt = f"educational diagram of {concept}, context: {context[:200]}, clean background, textbook diagram style"
        encoded_prompt = urllib.parse.quote(prompt)
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true"
        
        resp = requests.get(image_url, timeout=30)
        resp.raise_for_status()
        base64_image = base64.b64encode(resp.content).decode('utf-8')
        
        return {
            "success": True,
            "image_data": base64_image,
            "concept": concept,
            "context_used": context[:300],
            "prompt_used": prompt,
            "note": "Image generated based on study materials"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")
