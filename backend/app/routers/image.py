from fastapi import APIRouter, Form, HTTPException, Body
from pydantic import BaseModel
from typing import Optional
from app.services.rag_service import RAGService
from app.core.config import settings
import base64
import requests
import urllib.parse

router = APIRouter()

class ImageRequest(BaseModel):
    session_id: Optional[str] = "default"
    topic: Optional[str] = "Educational Diagram"
    prompt: Optional[str] = None
    style: Optional[str] = "educational diagram"

@router.post("/generate")
async def generate_educational_image(
    data: Optional[ImageRequest] = Body(None),
    session_id: Optional[str] = Form(None),
    topic: Optional[str] = Form(None),
    prompt: Optional[str] = Form(None),
    style: Optional[str] = Form("educational diagram")
):
    """
    Generates an educational image using nanobanana model on free tier visual endpoint.
    Returns: Base64-encoded image data & URL
    """
    try:
        topic_val = (data.topic if data and data.topic else topic) or "Educational Diagram"
        prompt_val = (data.prompt if data and data.prompt else prompt) or f"minimalist educational diagram about {topic_val}, textbook illustration, nanobanana style"
        
        encoded_prompt = urllib.parse.quote(prompt_val)
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?model=nanobanana&width=1024&height=1024&nologo=true"
        
        try:
            resp = requests.get(image_url, timeout=25)
            resp.raise_for_status()
            base64_image = base64.b64encode(resp.content).decode('utf-8')
        except Exception:
            # Fallback to flux nanobanana
            image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?model=flux&width=1024&height=1024&nologo=true"
            resp = requests.get(image_url, timeout=25)
            resp.raise_for_status()
            base64_image = base64.b64encode(resp.content).decode('utf-8')

        return {
            "success": True,
            "image_data": base64_image,
            "image_url": image_url,
            "original_topic": topic_val,
            "prompt_used": prompt_val,
            "model_used": "nanobanana",
            "note": "Image generated with nanobanana visual model"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")


@router.post("/generate-from-context")
async def generate_image_from_documents(
    data: Optional[ImageRequest] = Body(None),
    session_id: Optional[str] = Form(None),
    concept: Optional[str] = Form(None),
):
    """
    Generates an educational image based on uploaded study materials using nanobanana model.
    """
    try:
        sess_id = (data.session_id if data and data.session_id else session_id) or "default"
        concept_val = (data.prompt if data and data.prompt else concept) or "concept diagram"

        # 1. Get relevant context from documents
        context = concept_val
        try:
            rag_service = RAGService(session_id=sess_id)
            retriever = rag_service._get_session_retriever(k=3)
            docs = retriever.invoke(concept_val) if retriever else []
            if docs:
                context = "\n".join([doc.page_content[:200] for doc in docs[:2]])
        except Exception:
            pass

        # 2. Nanobanana model prompt
        prompt_str = f"educational diagram of {concept_val}, context: {context[:150]}, clean white background, textbook diagram, nanobanana style"
        encoded_prompt = urllib.parse.quote(prompt_str)
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?model=nanobanana&width=1024&height=1024&nologo=true"
        
        try:
            resp = requests.get(image_url, timeout=25)
            resp.raise_for_status()
            base64_image = base64.b64encode(resp.content).decode('utf-8')
        except Exception:
            image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?model=flux&width=1024&height=1024&nologo=true"
            resp = requests.get(image_url, timeout=25)
            resp.raise_for_status()
            base64_image = base64.b64encode(resp.content).decode('utf-8')

        return {
            "success": True,
            "image_data": base64_image,
            "image_url": image_url,
            "concept": concept_val,
            "context_used": context[:200],
            "prompt_used": prompt_str,
            "model_used": "nanobanana",
            "note": "Image generated based on study materials using nanobanana"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")
