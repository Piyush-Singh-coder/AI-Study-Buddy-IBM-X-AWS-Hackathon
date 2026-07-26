import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Study Buddy"
    API_V1_STR: str = "/api/v1"
    
    # Auth Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ai-study-buddy-secret-key-2026-hackathon")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Active LLM Provider ("nvidia", "gemini", or "bedrock")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "nvidia")
    
    # NVIDIA Free Endpoints (Primary Free LLM)
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "")
    NVIDIA_BASE_URL: str = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
    NVIDIA_TEXT_MODEL: str = os.getenv("NVIDIA_TEXT_MODEL", "meta/llama-3.3-70b-instruct")
    
    # Google Gemini (Backup Free LLM)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_TEXT_MODEL: str = os.getenv("GEMINI_TEXT_MODEL", "gemini-2.0-flash")
    GEMINI_EMBEDDING_MODEL: str = os.getenv("GEMINI_EMBEDDING_MODEL", "models/text-embedding-004")
    
    # AWS Services (S3 Storage, AWS EC2, AWS RDS, optional Bedrock)
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    AWS_S3_BUCKET: str = os.getenv("AWS_S3_BUCKET", "")
    AWS_BEDROCK_MODEL: str = os.getenv("AWS_BEDROCK_MODEL", "anthropic.claude-3-haiku-20240307-v1:0")
    
    # Database (AWS RDS PostgreSQL or Neon PostgreSQL)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/ai_study_buddy")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
