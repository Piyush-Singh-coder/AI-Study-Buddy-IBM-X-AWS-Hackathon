"""Script to clear all embeddings from the vector DB for the migration to OpenAI embeddings (1024 -> 1536 dims)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from sqlalchemy import create_engine, text

engine = create_engine(settings.DATABASE_URL)

with engine.connect() as conn:
    try:
        conn.execute(text("TRUNCATE TABLE langchain_pg_embedding"))
        conn.commit()
        print("✅ Cleared langchain_pg_embedding (via TRUNCATE)")
    except Exception:
        conn.rollback()
        conn.execute(text("DELETE FROM langchain_pg_embedding"))
        conn.commit()
        print("✅ Cleared langchain_pg_embedding (via DELETE)")

print("🎉 Database ready for new OpenAI embeddings!")
