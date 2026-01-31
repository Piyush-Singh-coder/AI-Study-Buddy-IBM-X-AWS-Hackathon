from fastapi import APIRouter, Form, HTTPException
from app.services.rag_service import RAGService
from app.core.config import settings
import boto3
import json
import base64
from io import BytesIO

router = APIRouter()

@router.post("/generate")
async def generate_educational_image(
    session_id: str = Form(...),
    topic: str = Form(...),
    style: str = Form("educational diagram")
):
    """
    Generates an educational image for a given topic using Amazon Nova Canvas.
    
    Returns: Base64-encoded image data
    """
    try:
        # Initialize Bedrock client
        bedrock_client = boto3.client(
            "bedrock-runtime",
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        
        # Get RAG service for context (optional)
        rag_service = RAGService(session_id=session_id)
        
        # Create educational image prompt with quality boosters
        prompt = f"educational illustration of {topic}, clear diagram style, white background, high quality, 4k, detailed, photorealistic textures, scientific accuracy, professional lighting"
        
        # Titan Image Generator V2 API request
        request_body = {
            "taskType": "TEXT_IMAGE",
            "textToImageParams": {
                "text": prompt,
            },
            "imageGenerationConfig": {
                "numberOfImages": 1,
                "quality": "standard",  # standard is reliable for Titan V2
                "height": 1024,
                "width": 1024,
                "cfgScale": 9.0,        # Increased for better prompt adherence
                "seed": 0
            }
        }
        
        # Invoke Titan Image Generator V2
        response = bedrock_client.invoke_model(
            modelId="amazon.titan-image-generator-v2:0",
            contentType="application/json",
            accept="application/json",
            body=json.dumps(request_body)
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        
        # Extract base64 image
        base64_image = response_body['images'][0]
        
        return {
            "success": True,
            "image_data": base64_image,  # Base64 encoded
            "original_topic": topic,
            "prompt_used": prompt,
            "note": "Image generated with Amazon Titan Image Generator V2"
        }
        
    except Exception as e:
        print(f"AWS Image Gen Failed: {e}. Falling back to OpenAI DALL-E 3...")
        try:
            # Fallback to OpenAI DALL-E 3
            import openai
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            
            response = client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            
            image_url = response.data[0].url
            
            # Download prompt image to get base64 (to match frontend expectation)
            import requests
            img_response = requests.get(image_url)
            base64_image = base64.b64encode(img_response.content).decode('utf-8')
            
            return {
                "success": True,
                "image_data": base64_image,
                "original_topic": topic,
                "prompt_used": prompt,
                "note": "Image generated with OpenAI DALL-E 3 (Fallback)"
            }
        except Exception as openai_error:
            raise HTTPException(status_code=500, detail=f"Image generation failed (AWS & OpenAI): {str(openai_error)}")


@router.post("/generate-from-context")
async def generate_image_from_documents(
    session_id: str = Form(...),
    concept: str = Form(...)
):
    """
    Generates an educational image based on uploaded study materials.
    Uses Nova Pro to create prompt, then Nova Canvas to generate image.
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
        
        # 2. Use Nova Pro to create image prompt from context
        from langchain_core.messages import HumanMessage
        
        messages = [
            HumanMessage(content=f"""Based on this study material context, create a brief prompt (max 100 words) for an educational diagram or illustration about "{concept}".

Context: {context}

Create a prompt that describes a clear, educational visual representation. Focus on diagrams, flowcharts, or conceptual illustrations. Output ONLY the prompt.""")
        ]
        
        prompt_response = rag_service.llm.invoke(messages)
        optimized_prompt = prompt_response.content.strip()
        
        # 3. Generate image with Nova Canvas
        bedrock_client = boto3.client(
            "bedrock-runtime",
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        
        request_body = {
            "taskType": "TEXT_IMAGE",
            "textToImageParams": {
                "text": optimized_prompt,
            },
            "imageGenerationConfig": {
                "numberOfImages": 1,
                "quality": "standard",
                "height": 1024,
                "width": 1024,
                "cfgScale": 8.0,
                "seed": 0
            }
        }
        
        response = bedrock_client.invoke_model(
            modelId="amazon.titan-image-generator-v2:0",
            contentType="application/json",
            accept="application/json",
            body=json.dumps(request_body)
        )
        
        response_body = json.loads(response['body'].read())
        base64_image = response_body['images'][0]
        
        return {
            "success": True,
            "image_data": base64_image,
            "concept": concept,
            "context_used": context[:300] + "..." if len(context) > 300 else context,
            "prompt_used": optimized_prompt,
            "note": "Image generated with Amazon Titan Image Generator V2 based on your study materials"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"AWS Context Image Gen Failed: {e}. Falling back to OpenAI...")
        try:
             # Fallback to OpenAI DALL-E 3
            import openai
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            
            # Use the optimized prompt we already generated
            response = client.images.generate(
                model="dall-e-3",
                prompt=optimized_prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            
            image_url = response.data[0].url
            
            # Download prompt image to get base64
            import requests
            img_response = requests.get(image_url)
            base64_image = base64.b64encode(img_response.content).decode('utf-8')
            
            return {
                "success": True,
                "image_data": base64_image,
                "concept": concept,
                "context_used": context,
                "prompt_used": optimized_prompt,
                "note": "Image generated with OpenAI DALL-E 3 (Fallback)"
            }
        except Exception as openai_error:
            raise HTTPException(status_code=500, detail=f"Image generation failed: {str(openai_error)}")
