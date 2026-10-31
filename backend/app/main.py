from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from contextlib import asynccontextmanager
from app.routers import session, upload, quiz, chat, audio, image, slides, models, auth
from app.database import create_db_and_tables
from app.core.config import settings
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        create_db_and_tables()
        print("Database tables & vector extension ready.")
    except Exception as e:
        print(f"DB Startup warning (will retry on request): {e}")
    yield

app = FastAPI(title="AI Study Buddy API", lifespan=lifespan)

# Configure CORS safely for Vercel <-> Render cross-origin communication
cors_origins_raw = settings.CORS_ORIGINS.strip()
if cors_origins_raw == "*":
    # Using regex allows credentials (cookies/auth headers) across all origins safely
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"^https?://.*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    allowed_list = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Health check endpoints for Render zero-downtime deploys
@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "AI Study Buddy Backend",
        "llm_provider": settings.LLM_PROVIDER,
        "database": "connected"
    }

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

# Optional Static SPA serving (when running unified build)
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
ASSETS_DIR = os.path.join(FRONTEND_DIST, "assets")
INDEX_HTML = os.path.join(FRONTEND_DIST, "index.html")

if os.path.exists(INDEX_HTML):
    if os.path.exists(ASSETS_DIR):
        app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

    @app.get("/")
    def serve_root():
        with open(INDEX_HTML, encoding="utf-8") as f:
            return HTMLResponse(content=f.read())

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("health"):
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        with open(INDEX_HTML, encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
else:
    @app.get("/")
    def read_root():
        return {
            "message": "AI Study Buddy API is running.",
            "docs": "/docs",
            "health": "/health"
        }
