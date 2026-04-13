from fastapi import APIRouter, Form, HTTPException
from app.services.rag_service import RAGService
from app.core.config import settings
import base64
import openai

router = APIRouter()


@router.post("/generate")
async def generate_educational_image(
    session_id: str = Form(...),
    topic: str = Form(...),
    style: str = Form("educational diagram")
):
    """
    Generates an educational image for a given topic using OpenAI gpt-image-1.
    Returns: Base64-encoded image data
    """
    try:
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        
        prompt = f"""Create a highly accurate, minimalist educational {style} about: {topic}. 
Requirements:
- Pure white background (#FFFFFF)
- Academic, textbook-style illustration (NOT photorealistic or artistic)
- Clear, readable typography if text is used
- Focus on accuracy, structure, and educational value
- Use distinct, professional colors (blue, grey, orange) for clarity"""
        
        response = client.images.generate(
            model=settings.OPENAI_IMAGE_MODEL,
            prompt=prompt,
            size="1024x1024",
            quality="high",
            n=1
        )
        
        image_data = response.data[0]
        
        if getattr(image_data, 'b64_json', None):
            base64_image = image_data.b64_json
        elif getattr(image_data, 'url', None):
            import requests
            img_resp = requests.get(image_data.url)
            img_resp.raise_for_status()
            base64_image = base64.b64encode(img_resp.content).decode('utf-8')
        else:
            raise Exception("No image data returned from provider")
        
        return {
            "success": True,
            "image_data": base64_image,
            "original_topic": topic,
            "prompt_used": prompt,
            "note": f"Image generated with {settings.OPENAI_IMAGE_MODEL}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")


@router.post("/generate-from-context")
async def generate_image_from_documents(
    session_id: str = Form(...),
    concept: str = Form(...),
):
    """
    Generates an educational image based on uploaded study materials using OpenAI.
    Uses GPT-4o to create an optimized prompt, then gpt-image-1 to generate the image.
    """
    try:
        # 1. Get relevant context from documents
        rag_service = RAGService(session_id=session_id)
        retriever = rag_service._get_session_retriever(k=5)
        docs = retriever.invoke(concept)
        
        if not docs:
            raise HTTPException(
                status_code=400,
                detail="No relevant content found in your documents about this concept."
            )
        
        context = "\n".join([doc.page_content[:500] for doc in docs[:3]])
        
        # 2. Use LLM to create an optimized image prompt from context
        prompt_messages = [
            {
                "role": "user",
                "content": f"""Based on this study material context, create a prompt (max 100 words) for an educational diagram or illustration about "{concept}".

Context: {context}

CRITICAL INSTRUCTIONS FOR PROMPT CREATION:
1. Demand a minimalist, textbook-style educational diagram.
2. Explicitly forbid photorealism, 3D renders, or artistic interpretations.
3. Specify a pure white background.
4. Describe the exact visual structure (e.g., "A flowchart showing...", "A cross-section diagram of...").
5. Focus heavily on structural accuracy over aesthetics.

Output ONLY the prompt text."""
            }
        ]
        
        optimized_prompt = rag_service.llm.invoke(prompt_messages).content.strip()
        
        # 3. Generate image with gpt-image-1
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        
        response = client.images.generate(
            model=settings.OPENAI_IMAGE_MODEL,
            prompt=optimized_prompt,
            size="1024x1024",
            quality="high",
            n=1
        )
        
        image_data = response.data[0]
        
        if getattr(image_data, 'b64_json', None):
            base64_image = image_data.b64_json
        elif getattr(image_data, 'url', None):
            import requests
            img_resp = requests.get(image_data.url)
            img_resp.raise_for_status()
            base64_image = base64.b64encode(img_resp.content).decode('utf-8')
        else:
            raise Exception("No image data returned from provider")
        
        return {
            "success": True,
            "image_data": base64_image,
            "concept": concept,
            "context_used": context[:300] + "..." if len(context) > 300 else context,
            "prompt_used": optimized_prompt,
            "note": f"Image generated with {settings.OPENAI_IMAGE_MODEL} based on your study materials"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")
