import os
import base64
from io import BytesIO
import openai
from fastapi import UploadFile
from app.core.config import settings
import yt_dlp


class ProcessorService:
    def __init__(self):
        # OpenAI is the primary provider now
        self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

    async def process_file(self, file: UploadFile) -> tuple[str, dict]:
        """Determines file type and processes accordingly. Returns (text, metadata)."""
        content = await file.read()
        file_type = file.content_type
        filename = file.filename
        
        file_stream = BytesIO(content)
        file_stream.name = filename

        if "pdf" in file_type or filename.endswith(".pdf"):
            return self.process_pdf(file_stream, filename)
        elif "image" in file_type or filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            text = self.process_image(content)
            return text, {"source": filename, "type": "image"}
        elif "audio" in file_type or filename.lower().endswith(('.mp3', '.wav', '.m4a', '.mpeg')):
            text = self.process_audio_sync(content, filename)
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
            text = self.process_image(content)
            return text, {"source": filename, "type": "image"}
        elif "audio" in content_type or filename.lower().endswith(('.mp3', '.wav', '.m4a', '.mpeg')):
            text = self.process_audio_sync(content, filename)
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

    def process_image(self, file_bytes: bytes) -> str:
        """Process image using OpenAI GPT-4o vision."""
        try:
            base64_image = base64.b64encode(file_bytes).decode('utf-8')
            
            response = self.openai_client.chat.completions.create(
                model=settings.OPENAI_TEXT_MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Analyze this image and provide a detailed study-focused description of the text and diagrams present."
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1000
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error processing image with OpenAI: {str(e)}"

    def process_audio_sync(self, audio_bytes: bytes, filename: str) -> str:
        """Primary: Transcribe audio using OpenAI Whisper."""
        try:
            audio_file = BytesIO(audio_bytes)
            # OpenAI Whisper needs a filename with a valid extension
            ext = filename.rsplit('.', 1)[-1] if '.' in filename else 'mp3'
            audio_file.name = f"audio.{ext}"
            
            transcript = self.openai_client.audio.transcriptions.create(
                model=settings.OPENAI_STT_MODEL,
                file=audio_file,
                response_format="text"
            )
            return transcript
        except Exception as e:
            return f"Error transcribing audio: {str(e)}"

    def process_audio(self, audio_stream, filename: str) -> str:
        """Wrapper for audio_stream objects (used by teacher router)."""
        try:
            audio_bytes = audio_stream.read()
            return self.process_audio_sync(audio_bytes, filename)
        except Exception as e:
            return f"Error: {str(e)}"

    def process_youtube(self, url: str) -> tuple[str, dict]:
        """Process YouTube video and return transcript with metadata."""
        if not yt_dlp:
            return "Error: yt-dlp not installed.", {}
        
        temp_filename = "temp_audio.mp3"
        try:
            ydl_opts = {
                'format': 'bestaudio/best',
                'postprocessors': [{'key': 'FFmpegExtractAudio', 'preferredcodec': 'mp3', 'preferredquality': '192'}],
                'outtmpl': 'temp_audio.%(ext)s',
                'quiet': True,
                'no_warnings': True,
                'nocheckcertificate': True,
                'noplaylist': True,
                'http_headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                },
                'extractor_args': {'youtube': {'player_client': ['android', 'web']}},
                'force_ipv4': True,
            }
            
            if os.path.exists(temp_filename):
                os.remove(temp_filename)

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                try:
                    info = ydl.extract_info(url, download=False)
                    video_title = info.get('title', 'Unknown')
                    duration = info.get('duration', 0)
                except Exception as info_error:
                    print(f"Error extracting info (continuing to download): {info_error}")
                    video_title = "YouTube Video"
                    duration = 0

                ydl.download([url])
            
            if not os.path.exists(temp_filename):
                return "Error: Audio download failed.", {}

            with open(temp_filename, "rb") as audio_file:
                audio_bytes = audio_file.read()
            
            text = self.process_audio_sync(audio_bytes, "youtube.mp3")
            
            if os.path.exists(temp_filename):
                os.remove(temp_filename)
            
            metadata = {
                "source": url,
                "type": "youtube",
                "video_title": video_title,
                "duration_seconds": duration
            }
            return text, metadata
            
        except Exception as e:
            if os.path.exists(temp_filename):
                os.remove(temp_filename)
            return f"Error processing YouTube video: {str(e)}", {}

    def text_to_speech(self, text: str) -> BytesIO:
        """Converts text to speech using OpenAI TTS."""
        try:
            max_chars = 4000
            chunks = []
            
            if len(text) > max_chars:
                paragraphs = text.split('\n')
                current_chunk = ""
                for p in paragraphs:
                    if len(current_chunk) + len(p) < max_chars:
                        current_chunk += p + "\n"
                    else:
                        if current_chunk:
                            chunks.append(current_chunk)
                        current_chunk = p + "\n"
                if current_chunk:
                    chunks.append(current_chunk)
            else:
                chunks = [text]

            combined_audio = BytesIO()
            
            for chunk in chunks:
                if not chunk.strip():
                    continue
                response = self.openai_client.audio.speech.create(
                    model=settings.OPENAI_TTS_MODEL,
                    voice="alloy",
                    input=chunk
                )
                combined_audio.write(response.content)
            
            combined_audio.seek(0)
            return combined_audio
            
        except Exception as e:
            print(f"Error generating audio with OpenAI TTS: {e}")
            return None
