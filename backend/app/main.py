from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from app.routers import session, upload, quiz, chat, audio, image, slides, models, auth
from app.database import create_db_and_tables
import os

app = FastAPI(title="AI Study Buddy API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local/ngrok demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup
@app.on_event("startup")
def on_startup():
    try:
        create_db_and_tables()
    except Exception as e:
        print(f"DB Startup warning (will retry on request): {e}")

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(session.router, prefix="/api/session", tags=["Session"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["Quiz"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(audio.router, prefix="/api/audio", tags=["Audio"])
app.include_router(image.router, prefix="/api/image", tags=["Image"])
app.include_router(slides.router, prefix="/api/slides", tags=["Slides"])
app.include_router(models.router, prefix="/api/models", tags=["Models"])

# Serve React frontend build
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")

ASSETS_DIR = os.path.join(FRONTEND_DIST, "assets")
INDEX_HTML = os.path.join(FRONTEND_DIST, "index.html")

if os.path.exists(INDEX_HTML):
    if os.path.exists(ASSETS_DIR):
        app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

    @app.get("/")
    def serve_root():
        with open(INDEX_HTML) as f:
            return HTMLResponse(content=f.read())

    # Catch-all for React Router (client-side routing)
    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        # Don't intercept /api routes
        if full_path.startswith("api"):
            return {"detail": "Not found"}
        with open(INDEX_HTML) as f:
            return HTMLResponse(content=f.read())
else:
    @app.get("/")
    def read_root():
        return {"message": "AI Study Buddy API is running."}
