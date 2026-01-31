import os
import base64
import json
import time
import uuid
from io import BytesIO
import boto3
import openai
from fastapi import UploadFile
from app.core.config import settings
import yt_dlp
from urllib.parse import urlparse, parse_qs

try:
    pass # Removed unused import
except ImportError:
    pass


class ProcessorService:
    def __init__(self):
        # Initialize AWS Bedrock client for text/image processing
        self.bedrock_client = boto3.client(
            "bedrock-runtime",
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        
        # Initialize AWS Transcribe client for STT
        self.transcribe_client = boto3.client(
            "transcribe",
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        
        # Initialize S3 client for temporary file storage (needed for Transcribe)
        self.s3_client = boto3.client(
            "s3",
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        
        # Initialize OpenAI client for TTS (fallback since Polly not available)
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
        # Need to re-import PdfReader locally or ensure global availability if checking existence
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
        """Process image using Bedrock Nova for vision analysis."""
        try:
            base64_image = base64.b64encode(file_bytes).decode('utf-8')
            
            # Use Nova Pro for image analysis (it supports multimodal)
            payload = {
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "text": "Analyze this image and provide a detailed study-focused description of the text and diagrams present."
                            },
                            {
                                "image": {
                                    "format": "jpeg",
                                    "source": {
                                        "bytes": base64_image
                                    }
                                }
                            }
                        ]
                    }
                ],
                "inferenceConfig": {
                    "maxTokens": 1000,
                    "temperature": 0.3
                }
            }
            
            response = self.bedrock_client.invoke_model(
                modelId=settings.BEDROCK_TEXT_MODEL,
                contentType="application/json",
                accept="application/json",
                body=json.dumps(payload)
            )
            
            response_body = json.loads(response['body'].read())
            return response_body.get('output', {}).get('message', {}).get('content', [{}])[0].get('text', 'No text extracted')
            
        except Exception as e:
            return f"Error processing image with Bedrock: {str(e)}"

    def process_audio_sync(self, audio_bytes: bytes, filename: str) -> str:
        """Process audio using AWS Transcribe (synchronous style with polling)."""
        try:
            # For short audio, use Transcribe's synchronous streaming API
            # For simplicity, we'll use the start_transcription_job with S3
            # This requires uploading to S3 first
            
            bucket_name = "hackathon-transcribe-temp"
            s3_key = f"audio/{uuid.uuid4()}-{filename}"
            
            # Try to create bucket if it doesn't exist
            try:
                self.s3_client.head_bucket(Bucket=bucket_name)
            except:
                try:
                    self.s3_client.create_bucket(Bucket=bucket_name)
                except Exception as e:
                    print(f"Could not create bucket: {e}")
                    # Fall back to simple transcription approach
                    return self._transcribe_audio_direct(audio_bytes)
            
            # Upload audio to S3
            self.s3_client.put_object(Bucket=bucket_name, Key=s3_key, Body=audio_bytes)
            
            job_name = f"transcribe-{uuid.uuid4()}"
            media_uri = f"s3://{bucket_name}/{s3_key}"
            
            # Determine media format
            if filename.endswith('.mp3'):
                media_format = 'mp3'
            elif filename.endswith('.wav'):
                media_format = 'wav'
            elif filename.endswith('.m4a'):
                media_format = 'mp4'
            else:
                media_format = 'mp3'  # Default
            
            # Start transcription job
            self.transcribe_client.start_transcription_job(
                TranscriptionJobName=job_name,
                Media={'MediaFileUri': media_uri},
                MediaFormat=media_format,
                LanguageCode='en-US'
            )
            
            # Poll for completion (max 60 seconds)
            for _ in range(60):
                status = self.transcribe_client.get_transcription_job(TranscriptionJobName=job_name)
                job_status = status['TranscriptionJob']['TranscriptionJobStatus']
                
                if job_status == 'COMPLETED':
                    transcript_uri = status['TranscriptionJob']['Transcript']['TranscriptFileUri']
                    # Download transcript
                    import urllib.request
                    with urllib.request.urlopen(transcript_uri) as response:
                        transcript_data = json.loads(response.read().decode())
                        text = transcript_data['results']['transcripts'][0]['transcript']
                    
                    # Cleanup
                    self.s3_client.delete_object(Bucket=bucket_name, Key=s3_key)
                    self.transcribe_client.delete_transcription_job(TranscriptionJobName=job_name)
                    
                    return text
                    
                elif job_status == 'FAILED':
                    failure_reason = status['TranscriptionJob'].get('FailureReason', 'Unknown error')
                    print(f"AWS Transcribe Failed: {failure_reason}. Falling back to OpenAI...")
                    return self._transcribe_audio_direct(audio_bytes, filename)
                
                time.sleep(1)
            
            print("AWS Transcribe timeout. Falling back to OpenAI...")
            return self._transcribe_audio_direct(audio_bytes, filename)
            
        except Exception as e:
            print(f"AWS Transcribe Error: {e}. Falling back to OpenAI...")
            return self._transcribe_audio_direct(audio_bytes, filename)

    def _transcribe_audio_direct(self, audio_bytes: bytes, filename: str) -> str:
        """Fallback: Direct transcription using OpenAI Whisper."""
        try:
            # OpenAI requires a file-like object with a name
            audio_file = BytesIO(audio_bytes)
            audio_file.name = filename
            
            transcript = self.openai_client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file,
                response_format="text"
            )
            return transcript
        except Exception as e:
            return f"Error transcribing with OpenAI: {str(e)}"

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

            # Get video info first
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                try:
                    info = ydl.extract_info(url, download=False)
                    video_title = info.get('title', 'Unknown')
                    duration = info.get('duration', 0)
                except Exception as info_error:
                    print(f"Error extracting info (continuing to download): {info_error}")
                    video_title = "YouTube Video" 
                    duration = 0

                # Download
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
            # OpenAI TTS limit is 4096 chars
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
                
                # Use OpenAI TTS
                response = self.openai_client.audio.speech.create(
                    model="tts-1",
                    voice="alloy",
                    input=chunk
                )
                
                combined_audio.write(response.content)
            
            combined_audio.seek(0)
            return combined_audio
            
        except Exception as e:
            print(f"Error generating audio with OpenAI TTS: {e}")
            return None
