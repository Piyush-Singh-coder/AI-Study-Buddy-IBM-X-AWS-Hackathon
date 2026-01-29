from fastapi import APIRouter, Form, HTTPException, Response
from app.services.rag_service import RAGService
from app.services.ppt_service import PPTService

router = APIRouter()
ppt_service = PPTService()

@router.post("/generate")
async def generate_slides(
    session_id: str = Form(...),
    topic: str = Form(...),
    num_slides: int = Form(5)
):
    """
    Generates a PowerPoint presentation based on the topic and session context.
    Returns: A downloadable .pptx file.
    """
    try:
        # 1. Generate Content with RAG
        rag_service = RAGService(session_id=session_id)
        slides_data = await rag_service.generate_slide_content(topic, num_slides)
        
        if not slides_data:
            raise HTTPException(status_code=500, detail="Failed to generate slide content from AI.")
            
        # 2. Create PPTX File
        ppt_buffer = ppt_service.create_presentation(slides_data, topic)
        
        # 3. Return File
        filename = f"{topic.replace(' ', '_')}_Presentation.pptx"
        
        headers = {
            'Content-Disposition': f'attachment; filename="{filename}"'
        }
        
        return Response(
            content=ppt_buffer.getvalue(),
            headers=headers,
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
