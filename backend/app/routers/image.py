from fastapi import APIRouter, Form, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from app.services.rag_service import RAGService
from app.core.config import settings
import base64
import requests
import urllib.parse

router = APIRouter()

class ImageGenerateJSONRequest(BaseModel):
    session_id: Optional[str] = "default"
    topic: Optional[str] = None
    prompt: Optional[str] = None
    style: Optional[str] = "educational diagram"

class ImageContextJSONRequest(BaseModel):
    session_id: str
    concept: Optional[str] = None
    prompt: Optional[str] = None

def _fetch_openrouter_image(prompt: str) -> Optional[str]:
    """Generates a high-quality educational image using OpenRouter Image API."""
    if not settings.OPENROUTER_API_KEY:
        return None
    try:
        url = "https://openrouter.ai/api/v1/images/generations"
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": settings.OPENROUTER_SITE_URL,
            "X-Title": settings.OPENROUTER_SITE_NAME
        }
        payload = {
            "model": "qwen/qwen-image-2.1-turbo",
            "prompt": f"clean educational diagram, textbook illustration: {prompt[:300]}, white background, high clarity, labeled components",
            "aspect_ratio": "1:1"
        }
        resp = requests.post(url, headers=headers, json=payload, timeout=25)
        if resp.status_code == 200:
            data = resp.json().get("data", [])
            if data:
                b64 = data[0].get("b64_json")
                if b64:
                    return b64
                img_url = data[0].get("url")
                if img_url:
                    r_img = requests.get(img_url, timeout=15)
                    if r_img.status_code == 200:
                        return base64.b64encode(r_img.content).decode('utf-8')
    except Exception as e:
        print(f"OpenRouter image generation note: {e}")
    return None

def _fetch_pollinations_image(prompt: str) -> Optional[str]:
    """Generates an image via free Pollinations Flux endpoint."""
    try:
        encoded_prompt = urllib.parse.quote(prompt[:300])
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?model=flux&width=1024&height=1024&nologo=true"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AI-Study-Buddy/1.0"
        }
        resp = requests.get(image_url, headers=headers, timeout=20)
        if resp.status_code == 200 and len(resp.content) > 1000:
            return base64.b64encode(resp.content).decode('utf-8')
    except Exception as e:
        print(f"Pollinations note: {e}")
    return None

def _create_educational_svg_b64(topic: str, context: str = "") -> str:
    """Bulletproof fallback: returns a beautiful SVG educational diagram if online APIs are busy."""
    safe_topic = (topic or "Study Concept").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    safe_desc = (context[:120] if context else "Foundational study concept and system flow").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
      <rect width="800" height="500" fill="#f8fafc" rx="16"/>
      <rect x="40" y="40" width="720" height="70" fill="#4f46e5" rx="12"/>
      <text x="60" y="85" fill="#ffffff" font-family="system-ui, sans-serif" font-size="24" font-weight="900" letter-spacing="1">STUDY CONCEPT: {safe_topic.upper()}</text>
      
      <!-- Stage 1 -->
      <rect x="60" y="160" width="200" height="180" fill="#ffffff" stroke="#000000" stroke-width="3" rx="12"/>
      <rect x="60" y="160" width="200" height="40" fill="#facc15" stroke="#000000" stroke-width="3" rx="12"/>
      <text x="75" y="186" fill="#000000" font-family="system-ui, sans-serif" font-size="14" font-weight="900">1. CORE INPUTS</text>
      <text x="75" y="230" fill="#334155" font-family="system-ui, sans-serif" font-size="13" font-weight="600">• Theory &amp; Concepts</text>
      <text x="75" y="260" fill="#334155" font-family="system-ui, sans-serif" font-size="13" font-weight="600">• Definitions &amp; Rules</text>
      <text x="75" y="290" fill="#334155" font-family="system-ui, sans-serif" font-size="13" font-weight="600">• Raw Notes / Data</text>

      <!-- Arrow 1 -->
      <path d="M 270 250 L 320 250" stroke="#000000" stroke-width="4" marker-end="url(#arrow)"/>

      <!-- Stage 2 -->
      <rect x="330" y="160" width="200" height="180" fill="#ffffff" stroke="#000000" stroke-width="3" rx="12"/>
      <rect x="330" y="160" width="200" height="40" fill="#a855f7" stroke="#000000" stroke-width="3" rx="12"/>
      <text x="345" y="186" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" font-weight="900">2. PROCESSING</text>
      <text x="345" y="230" fill="#334155" font-family="system-ui, sans-serif" font-size="13" font-weight="600">• Architectural Flow</text>
      <text x="345" y="260" fill="#334155" font-family="system-ui, sans-serif" font-size="13" font-weight="600">• Logic Synthesis</text>
      <text x="345" y="290" fill="#334155" font-family="system-ui, sans-serif" font-size="13" font-weight="600">• Vector Embeddings</text>

      <!-- Arrow 2 -->
      <path d="M 540 250 L 590 250" stroke="#000000" stroke-width="4"/>

      <!-- Stage 3 -->
      <rect x="600" y="160" width="160" height="180" fill="#ffffff" stroke="#000000" stroke-width="3" rx="12"/>
      <rect x="600" y="160" width="160" height="40" fill="#22c55e" stroke="#000000" stroke-width="3" rx="12"/>
      <text x="615" y="186" fill="#000000" font-family="system-ui, sans-serif" font-size="14" font-weight="900">3. MASTERY</text>
      <text x="615" y="230" fill="#334155" font-family="system-ui, sans-serif" font-size="13" font-weight="600">• Full Recall</text>
      <text x="615" y="260" fill="#334155" font-family="system-ui, sans-serif" font-size="13" font-weight="600">• Exam Readiness</text>
      <text x="615" y="290" fill="#334155" font-family="system-ui, sans-serif" font-size="13" font-weight="600">• Applied Q&amp;A</text>

      <!-- Footer Info -->
      <rect x="40" y="380" width="720" height="80" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" rx="12"/>
      <text x="60" y="415" fill="#1e293b" font-family="system-ui, sans-serif" font-size="14" font-weight="700">Summary Context:</text>
      <text x="60" y="440" fill="#64748b" font-family="system-ui, sans-serif" font-size="13">{safe_desc}...</text>
    </svg>"""
    return base64.b64encode(svg.encode('utf-8')).decode('utf-8')

@router.post("/generate")
async def generate_educational_image(
    request: Request,
    session_id: Optional[str] = Form(None),
    topic: Optional[str] = Form(None),
    style: Optional[str] = Form("educational diagram")
):
    """Generates an educational image for a given topic."""
    eff_session_id = session_id
    eff_topic = topic
    eff_style = style or "educational diagram"

    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            body = await request.json()
            eff_session_id = body.get("session_id", eff_session_id or "default")
            eff_topic = body.get("topic") or body.get("prompt") or eff_topic
            eff_style = body.get("style", eff_style)
        except Exception:
            pass

    if not eff_topic or not eff_topic.strip():
        raise HTTPException(status_code=400, detail="Please provide a topic or prompt for image generation.")

    clean_topic = eff_topic.strip()
    prompt = f"minimalist educational {eff_style} about {clean_topic}, clean white background, textbook illustration, academic structure"

    # 1. Try OpenRouter high quality image endpoint first
    base64_image = _fetch_openrouter_image(prompt)
    engine_used = "OpenRouter Qwen Image Turbo"

    # 2. Try Pollinations Flux free endpoint
    if not base64_image:
        base64_image = _fetch_pollinations_image(prompt)
        engine_used = "Pollinations Flux (Free)"

    # 3. Fallback to vector educational SVG diagram
    if not base64_image:
        base64_image = _create_educational_svg_b64(clean_topic, prompt)
        engine_used = "Interactive Study Diagram Engine"

    return {
        "success": True,
        "image_data": base64_image,
        "original_topic": clean_topic,
        "concept": clean_topic,
        "prompt_used": prompt,
        "generated_prompt": prompt,
        "engine": engine_used,
        "note": f"Educational diagram generated using {engine_used}"
    }

@router.post("/generate-from-context")
async def generate_image_from_documents(
    request: Request,
    session_id: Optional[str] = Form(None),
    concept: Optional[str] = Form(None)
):
    """Generates an educational image based on uploaded study materials."""
    eff_session_id = session_id
    eff_concept = concept

    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            body = await request.json()
            eff_session_id = body.get("session_id", eff_session_id or "default")
            eff_concept = body.get("concept") or body.get("prompt") or eff_concept
        except Exception:
            pass

    if not eff_concept or not eff_concept.strip():
        raise HTTPException(status_code=400, detail="Please provide a concept from your documents.")

    clean_concept = eff_concept.strip()
    context = ""
    try:
        rag_service = RAGService(session_id=eff_session_id)
        retriever = rag_service._get_session_retriever(k=5)
        docs = retriever.invoke(clean_concept) if retriever else []
        if docs:
            context = "\n".join([doc.page_content[:250] for doc in docs[:3]])
        else:
            context = rag_service._get_fallback_context()
    except Exception as e:
        print(f"RAG context error in image gen: {e}")

    prompt = f"educational diagram of {clean_concept}, context: {context[:200]}, clean background, textbook diagram style"

    base64_image = _fetch_openrouter_image(prompt)
    engine_used = "OpenRouter Qwen Image Turbo"

    if not base64_image:
        base64_image = _fetch_pollinations_image(prompt)
        engine_used = "Pollinations Flux (Free)"

    if not base64_image:
        base64_image = _create_educational_svg_b64(clean_concept, context)
        engine_used = "Interactive Study Diagram Engine"

    return {
        "success": True,
        "image_data": base64_image,
        "concept": clean_concept,
        "original_topic": clean_concept,
        "context_used": context[:250],
        "prompt_used": prompt,
        "generated_prompt": prompt,
        "engine": engine_used,
        "note": f"Educational diagram generated using {engine_used}"
    }
