import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Study Buddy"
    API_V1_STR: str = "/api/v1"
    
    # OpenAI (fallback)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # AWS Credentials
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    
    # AWS Bedrock Model IDs
    BEDROCK_TEXT_MODEL: str = os.getenv("BEDROCK_TEXT_MODEL", "amazon.nova-pro-v1:0")
    BEDROCK_EMBEDDING_MODEL: str = os.getenv("BEDROCK_EMBEDDING_MODEL", "amazon.titan-embed-text-v2:0")
    BEDROCK_SPEECH_MODEL: str = os.getenv("BEDROCK_SPEECH_MODEL", "amazon.nova-sonic-v1:0")
    
    # IBM Granite (via Bedrock) for Quiz Generation
    IBM_GRANITE_MODEL: str = os.getenv("IBM_GRANITE_MODEL", "ibm.granite-13b-chat-v2")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/ai_study_buddy")

    class Config:
        env_file = ".env"

settings = Settings()

