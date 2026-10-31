from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

db_url = settings.normalized_database_url

connect_args = {}
engine_kwargs = {
    "pool_pre_ping": True,  # Checks connection liveness before checkout
}

if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False
else:
    # PostgreSQL / Neon configuration
    engine_kwargs.update({
        "pool_recycle": 240,    # Recycle connections every 4 minutes (under 5m serverless timeout)
        "pool_size": 10,
        "max_overflow": 20
    })

engine = create_engine(
    db_url,
    connect_args=connect_args,
    **engine_kwargs
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
    from app.models import User, StudySession  # Import models to register with Base
    try:
        # Also ensure vector extension exists for Neon PostgreSQL
        if not db_url.startswith("sqlite"):
            from sqlalchemy import text
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                conn.commit()
    except Exception as e:
        print(f"Note: Vector extension check skipped: {e}")
        
    Base.metadata.create_all(bind=engine)
