from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Ensure we rely on 'psycopg2' or 'psycopg' driver.
# If using async, we'd need asyncpg, but for this prototype sync is fine or we can switch.
# langchain-postgres often uses psycopg (v3) or psycopg2. 
# We will use standard sqlalchemy sync engine for metadata management
# and let LangChain handle its own vector store connection string.

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Checks connection liveness before use
    pool_recycle=240,    # Recycle connections every 4 minutes (safe under 5m timeout)
    pool_size=10,
    max_overflow=20
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_db_and_tables():
    from app.models import User, StudySession # Import models to register with Base
    Base.metadata.create_all(bind=engine)
