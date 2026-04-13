from sqlalchemy import Column, String, DateTime
from datetime import datetime
from app.database import Base
import uuid

class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, index=True, nullable=False)
    title = Column(String, default="New Session")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
