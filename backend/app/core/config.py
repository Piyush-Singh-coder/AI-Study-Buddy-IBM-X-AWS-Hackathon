import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Locate backend/.env regardless of current working directory
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
_ENV_PATH = _BACKEND_DIR / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Study Buddy"
    API_V1_STR: str = "/api/v1"
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Auth Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ai-study-buddy-secret-key-2026-hackathon")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS Origins (comma separated list of URLs, or "*" for all)
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")
    
    # Active LLM Provider ("openrouter", "nvidia", "gemini", or "bedrock")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "nvidia")
    
    # OpenRouter Endpoints (Ultra-cheap, fast, modern models)
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_BASE_URL: str = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
    OPENROUTER_TEXT_MODEL: str = os.getenv("OPENROUTER_TEXT_MODEL", "openrouter/free")
    OPENROUTER_SITE_URL: str = os.getenv("OPENROUTER_SITE_URL", "https://ai-study-buddy.vercel.app")
    OPENROUTER_SITE_NAME: str = "AI Study Buddy"

    # NVIDIA Free Endpoints (Primary Free LLM)
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "")
    NVIDIA_BASE_URL: str = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
    NVIDIA_TEXT_MODEL: str = os.getenv("NVIDIA_TEXT_MODEL", "nvidia/nemotron-3.5-bolt-e4b")
    
    # Google Gemini (Backup Free LLM & Embeddings)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_TEXT_MODEL: str = os.getenv("GEMINI_TEXT_MODEL", "gemini-2.5-flash")
    GEMINI_EMBEDDING_MODEL: str = os.getenv("GEMINI_EMBEDDING_MODEL", "models/gemini-embedding-001")
    
    # AWS Services (optional)
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    AWS_S3_BUCKET: str = os.getenv("AWS_S3_BUCKET", "")
    AWS_BEDROCK_MODEL: str = os.getenv("AWS_BEDROCK_MODEL", "anthropic.claude-3-haiku-20240307-v1:0")
    
    # Database (Neon PostgreSQL or RDS)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:password@localhost:5432/ai_study_buddy"
    )

    @property
    def normalized_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url

    class Config:
        env_file = (str(_ENV_PATH), ".env")
        extra = "ignore"

settings = Settings()
