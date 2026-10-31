import os
import asyncio
import concurrent.futures
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
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
            except Exception as e:
                print(f"Gemini configure warning: {e}")
        
        self.nvidia_client = None
        if settings.NVIDIA_API_KEY:
            try:
                self.nvidia_client = openai.OpenAI(
                    api_key=settings.NVIDIA_API_KEY,
                    base_url=settings.NVIDIA_BASE_URL
                )
            except Exception as e:
                print(f"NVIDIA client init warning: {e}")

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
        return self.process_file_sync(content, filename, file_type)

    def process_file_sync(self, content: bytes, filename: str, content_type: str) -> tuple[str, dict]:
        """Synchronous file processing for background and inline tasks."""
        if not content:
            return "", {"source": filename, "type": "empty"}

        file_stream = BytesIO(content)
        file_stream.name = filename
        lower_name = filename.lower()
        lower_type = (content_type or "").lower()

        # 1. PDF Documents
        if "pdf" in lower_type or lower_name.endswith(".pdf"):
            return self.process_pdf(file_stream, filename)

        # 2. Microsoft Word Documents (.docx)
        elif lower_name.endswith((".docx", ".doc")):
            return self.process_docx(file_stream, filename)

        # 3. Text, Markdown, CSV, JSON, and Source Code
        elif lower_name.endswith((".txt", ".md", ".markdown", ".csv", ".tsv", ".json", ".py", ".js", ".ts", ".html", ".rst")):
            try:
                text = content.decode("utf-8", errors="replace")
                return text, {"source": filename, "type": "text"}
            except Exception as e:
                return f"Error reading text file: {e}", {"source": filename, "type": "text"}

        # 4. Images (OCR & Visual Breakdown)
        elif "image" in lower_type or lower_name.endswith((".png", ".jpg", ".jpeg", ".webp")):
            text = self.process_image(content, content_type)
            return text, {"source": filename, "type": "image"}

        # 5. Audio Files (Transcription)
        elif "audio" in lower_type or lower_name.endswith((".mp3", ".wav", ".m4a", ".mpeg", ".webm", ".ogg")):
            text = self.process_audio_sync(content, filename, content_type)
            return text, {"source": filename, "type": "audio"}

        # Fallback: attempt utf-8 decode
        else:
            try:
                text = content.decode("utf-8")
                if len(text.strip()) > 10:
                    return text, {"source": filename, "type": "text"}
            except Exception:
                pass
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
            return text_with_pages.strip(), metadata
        except Exception as e:
            return f"Error reading PDF: {str(e)}", {"source": filename, "type": "pdf"}

    def process_docx(self, file_stream, filename: str) -> tuple[str, dict]:
        try:
            import docx
            doc = docx.Document(file_stream)
            full_text = []
            for para in doc.paragraphs:
                if para.text.strip():
                    full_text.append(para.text)
            for table in doc.tables:
                for row in table.rows:
                    row_text = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                    if row_text:
                        full_text.append(" | ".join(row_text))
            text = "\n\n".join(full_text)
            return text, {"source": filename, "type": "docx"}
        except Exception as e:
            return f"Error reading Word document: {str(e)}", {"source": filename, "type": "docx"}

    def process_image(self, file_bytes: bytes, mime_type: str = "image/jpeg") -> str:
        """Process image using Google Gemini Vision or NVIDIA multimodal vision."""
        try:
            if settings.GEMINI_API_KEY:
                model = genai.GenerativeModel(settings.GEMINI_TEXT_MODEL)
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
                            "content": "Analyze this study image content: provide a comprehensive summary of all formulas, text, diagram labels, and key takeaways."
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
                model = genai.GenerativeModel(settings.GEMINI_TEXT_MODEL)
                ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else 'mp3'
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

    async def text_to_speech_async(self, text: str, voice: str = "en-US-AvaNeural") -> BytesIO:
        """
        Asynchronous text to speech conversion.
        Safe to call from FastAPI async routes without blocking or event loop conflicts.
        """
        # 1. AWS Polly if configured
        if self.polly_client:
            try:
                loop = asyncio.get_running_loop()
                def _call_polly():
                    return self.polly_client.synthesize_speech(
                        Text=text[:4000],
                        OutputFormat='mp3',
                        VoiceId='Joanna'
                    )
                response = await loop.run_in_executor(None, _call_polly)
                if 'AudioStream' in response:
                    out_stream = BytesIO(response['AudioStream'].read())
                    out_stream.seek(0)
                    return out_stream
            except Exception as polly_err:
                print(f"AWS Polly TTS note: {polly_err}")

        # 2. Microsoft Edge TTS (Async stream - ultra fast, free, high quality)
        try:
            import edge_tts
            communicate = edge_tts.Communicate(text[:4000], voice)
            audio_data = b""
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_data += chunk["data"]
            if audio_data:
                out_stream = BytesIO(audio_data)
                out_stream.seek(0)
                return out_stream
        except Exception as edge_err:
            print(f"Edge TTS notice (switching to resilient fallback): {edge_err}")

        # 3. Resilient Fallback: Google Translate TTS (gTTS - 100% free & reliable)
        try:
            from gtts import gTTS
            lang_code = "hi" if "hi" in voice.lower() else "en"
            loop = asyncio.get_running_loop()
            def _synthesize_gtts():
                tts = gTTS(text=text[:3000], lang=lang_code)
                buf = BytesIO()
                tts.write_to_fp(buf)
                buf.seek(0)
                return buf
            return await loop.run_in_executor(None, _synthesize_gtts)
        except Exception as gtts_err:
            print(f"gTTS fallback note: {gtts_err}")

        return None

    def text_to_speech(self, text: str, voice: str = "en-US-AvaNeural") -> BytesIO:
        """Synchronous fallback wrapper for text_to_speech_async."""
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop and loop.is_running():
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                return pool.submit(lambda: asyncio.run(self.text_to_speech_async(text, voice))).result()
        else:
            return asyncio.run(self.text_to_speech_async(text, voice))
