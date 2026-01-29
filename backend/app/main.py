from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import session, upload, quiz, chat, audio, image, slides, models
from app.database import create_db_and_tables

app = FastAPI(title="AI Study Buddy API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup
@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# Include Routers
app.include_router(session.router, prefix="/api/session", tags=["Session"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["Quiz"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(audio.router, prefix="/api/audio", tags=["Audio"])
app.include_router(image.router, prefix="/api/image", tags=["Image"])
app.include_router(slides.router, prefix="/api/slides", tags=["Slides"])
app.include_router(models.router, prefix="/api/models", tags=["Models"])

@app.get("/")
def read_root():
    return {"message": "AI Study Buddy API is running"}
