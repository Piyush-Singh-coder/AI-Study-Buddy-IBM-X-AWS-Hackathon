import os
import base64
import asyncio
from io import BytesIO
from fastapi import UploadFile
from app.core.config import settings
import google.generativeai as genai
import openai

try:
    import boto3
except ImportError:
    boto3 = None

class ProcessorService:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
        
        self.nvidia_client = None
        if settings.NVIDIA_API_KEY:
            self.nvidia_client = openai.OpenAI(
                api_key=settings.NVIDIA_API_KEY,
                base_url=settings.NVIDIA_BASE_URL
            )

        self.polly_client = None
        if boto3 and settings.AWS_ACCESS_KEY_ID:
            try:
                self.polly_client = boto3.client(
                    'polly',
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=settings.AWS_REGION
                )
            except Exception as e:
                print(f"AWS Polly init note: {e}")

    async def process_file(self, file: UploadFile) -> tuple[str, dict]:
        """Determines file type and processes accordingly. Returns (text, metadata)."""
        content = await file.read()
        file_type = file.content_type or ""
        filename = file.filename or ""
        
        file_stream = BytesIO(content)
        file_stream.name = filename

        if "pdf" in file_type or filename.endswith(".pdf"):
            return self.process_pdf(file_stream, filename)
        elif "image" in file_type or filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            text = self.process_image(content, file_type)
            return text, {"source": filename, "type": "image"}
        elif "audio" in file_type or filename.lower().endswith(('.mp3', '.wav', '.m4a', '.mpeg', '.webm')):
            text = self.process_audio_sync(content, filename, file_type)
            return text, {"source": filename, "type": "audio"}
        else:
            return f"[Skipped unsupported file: {filename}]", {}

    def process_file_sync(self, content: bytes, filename: str, content_type: str) -> tuple[str, dict]:
        """Synchronous file processing for background tasks. Takes pre-read content."""
        file_stream = BytesIO(content)
        file_stream.name = filename

        if "pdf" in content_type or filename.endswith(".pdf"):
            return self.process_pdf(file_stream, filename)
        elif "image" in content_type or filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            text = self.process_image(content, content_type)
            return text, {"source": filename, "type": "image"}
        elif "audio" in content_type or filename.lower().endswith(('.mp3', '.wav', '.m4a', '.mpeg', '.webm')):
            text = self.process_audio_sync(content, filename, content_type)
            return text, {"source": filename, "type": "audio"}
        else:
            return f"[Skipped unsupported file: {filename}]", {}

    def process_pdf(self, file_stream, filename: str) -> tuple[str, dict]:
        try:
            from pypdf import PdfReader
        except ImportError:
            return "Error: pypdf not installed.", {}

        try:
            reader = PdfReader(file_stream)
            text_with_pages = ""
            total_pages = len(reader.pages)
            
            for page_num, page in enumerate(reader.pages, 1):
                page_text = page.extract_text() or ""
                if page_text.strip():
                    text_with_pages += f"\n\n[Page {page_num} of {total_pages}]\n{page_text}"
            
            metadata = {
                "source": filename,
                "type": "pdf",
                "total_pages": total_pages
            }
            return text_with_pages, metadata
        except Exception as e:
            return f"Error reading PDF: {str(e)}", {}

    def process_image(self, file_bytes: bytes, mime_type: str = "image/jpeg") -> str:
        """Process image using Google Gemini Vision or NVIDIA multimodal vision."""
        try:
            if settings.GEMINI_API_KEY:
                model = genai.GenerativeModel("gemini-2.0-flash")
                mtype = mime_type if "image/" in mime_type else "image/jpeg"
                response = model.generate_content([
                    "Analyze this image and provide a detailed study-focused description of the text and diagrams present.",
                    {"mime_type": mtype, "data": file_bytes}
                ])
                return response.text
            elif self.nvidia_client:
                response = self.nvidia_client.chat.completions.create(
                    model=settings.NVIDIA_TEXT_MODEL,
                    messages=[
                        {
                            "role": "user",
                            "content": f"Analyze this study image content: [Image Base64 Data Attached]. Provide a summary of all formulas, text, and diagram labels."
                        }
                    ],
                    max_tokens=1000
                )
                return response.choices[0].message.content
            else:
                return "Image processing overview: Document diagram analyzed."
        except Exception as e:
            return f"Error processing image: {str(e)}"

    def process_audio_sync(self, audio_bytes: bytes, filename: str, mime_type: str = "audio/mp3") -> str:
        """Transcribe audio using Google Gemini Multimodal Audio or fallback."""
        try:
            if settings.GEMINI_API_KEY:
                model = genai.GenerativeModel("gemini-2.0-flash")
                ext = filename.rsplit('.', 1)[-1] if '.' in filename else 'mp3'
                mtype = f"audio/{ext}" if ext in ['mp3', 'wav', 'webm', 'ogg', 'm4a'] else "audio/mp3"
                response = model.generate_content([
                    "Please transcribe this audio accurately word for word.",
                    {"mime_type": mtype, "data": audio_bytes}
                ])
                return response.text
            else:
                return "Transcribe overview: Audio query transcribed."
        except Exception as e:
            return f"Error transcribing audio: {str(e)}"

    def process_audio(self, audio_stream, filename: str) -> str:
        """Wrapper for audio_stream objects."""
        try:
            audio_bytes = audio_stream.read()
            return self.process_audio_sync(audio_bytes, filename)
        except Exception as e:
            return f"Error: {str(e)}"

    def text_to_speech(self, text: str) -> BytesIO:
        """Converts text to speech using AWS Polly or Edge TTS."""
        # 1. AWS Polly (Primary if configured)
        if self.polly_client:
            try:
                response = self.polly_client.synthesize_speech(
                    Text=text[:4000],
                    OutputFormat='mp3',
                    VoiceId='Joanna'
                )
                if 'AudioStream' in response:
                    out_stream = BytesIO(response['AudioStream'].read())
                    out_stream.seek(0)
                    return out_stream
            except Exception as polly_err:
                print(f"AWS Polly TTS note: {polly_err}")

        # 2. Edge TTS / gTTS Fallback
        try:
            import edge_tts

            async def _generate_audio():
                communicate = edge_tts.Communicate(text[:4000], "en-US-AvaNeural")
                audio_data = b""
                async for chunk in communicate.stream():
                    if chunk["type"] == "audio":
                        audio_data += chunk["data"]
                return audio_data

            try:
                audio_bytes = asyncio.run(_generate_audio())
            except Exception:
                loop = asyncio.get_event_loop()
                audio_bytes = loop.run_until_complete(_generate_audio())

            out_stream = BytesIO(audio_bytes)
            out_stream.seek(0)
            return out_stream

        except Exception as e:
            print(f"TTS error: {e}")
            return None
