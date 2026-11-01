# 🎓 AI Study Buddy — Cognitive Multimodal RAG Scholar Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/Neon_PGVector-Serverless-00E699.svg?style=flat&logo=postgresql&logoColor=black)](https://neon.tech)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org)

An enterprise-grade, privacy-first **Cognitive Scholar & Multi-Modal RAG Platform**. Transforms research papers, university textbooks, lecture recordings, and syllabus monographs into isolated vector memories, diagnostic active-recall quizzes, Socratic audio dialogues, examination papers, and technical schematics.

---

## 🏛️ System Architecture

```mermaid
graph TD
    User["Scholar / Student Device (Mobile & Desktop)"]
    Frontend["React 18 + Vite SPA (Vercel / Cloudflare)"]
    Backend["FastAPI Async Engine (Render / Container)"]
    DB[("Neon PostgreSQL + pgvector")]
    LLMs["Multi-Provider LLM Hub (Gemini 2.5 Flash / NVIDIA NIM / OpenRouter)"]
    Speech["Voice Synthesis (Edge-TTS 7.3.1 + gTTS Resilient Fallback)"]

    User <-->|HTTPS / REST API| Frontend
    Frontend <-->|JWT Authenticated Calls| Backend
    Backend <-->|3072-Dim Cosine Distance Search| DB
    Backend <-->|Streaming Prompts & Context| LLMs
    Backend <-->|Real-Time Audio Streams| Speech
```

---

## ✨ Key Features & Capabilities

### 1. Ingestion Engine & Smart Deduplication
- **Multi-Format Parsing**: Ingests PDF manuscripts, Microsoft Word (`.docx`), plain text (`.txt`, `.md`), CSV/JSON datasets, and images via high-accuracy OCR.
- **Smart Vector Deduplication**: Automatically detects if a file with the same name has already been vectorized for the active session, skipping redundant embedding calculations to preserve tokens and eliminate duplicate RAG retrieval chunks.

### 2. Hierarchical Summaries & Notes
- **Executive Brief**: Extracts 3–5 high-yield thesis takeaways.
- **Chapter Taxonomy**: Breaks down complex monographs into structured sections, key definitions, and exam tips.
- **Rich Markdown Rendering**: Automatically styles bold text, headings, bulleted lists, and code blocks with zero raw Markdown symbols.
- **Export Options**: 1-click Markdown download and clipboard copy.

### 3. Active Recall & Diagnostic Testing
- **Bloom's Taxonomy Calibration**: Configurable difficulty (Foundational, Analytical, Rigorous) and question count (3Q, 5Q, 10Q).
- **Automated Diagnostic Evaluation**: Scores user answers and cross-references mistakes against source vector chunks to formulate personalized remedial study guides.

### 4. Socratic Audio Tutor
- **Spoken Academic Dialogue**: Engages in Feynman-technique voice explanations in English, Hindi, and Hinglish.
- **Dual-Layer Audio Engine**: Powered by Microsoft Edge Neural TTS with an automatic zero-latency fallback to Google Translate TTS (`gTTS`).
- **Interactive Audio Scrub Bar**: Includes playback speed controls (1x, 1.25x, 1.5x) and vector source citations.

### 5. Curated Examination Paper Generator
- **Exam Pattern Replication**: Upload a Previous Year Question (PYQ) paper or syllabus rubric. The engine replicates section divisions (Section A, B, C), mark distributions, and rubric criteria using your ingested study material.
- **Word Document (.docx) Export**: Download ready-to-print examination papers with optional model solutions.

### 6. Visual Schematic & Diagram Synthesizer
- Generates high-resolution 2K technical schematics, vector flowcharts, biochemical pathways, and computer architecture diagrams.
- Features preset concept suggestions and an interactive fullscreen lightbox viewer.

### 7. Dedicated Study Sessions Workspace
- **Corpus Isolation & Switching**: Dedicated `/sessions` workspace to organize notes, lectures, and exams into isolated vector spaces.
- **Corpus Inspection**: View document counts and filename badges for every study session.
- **Inline Renaming & Deletion**: Rename sessions inline and delete obsolete sessions with automated vector index cleanup.
- **Instant Activation**: Switch between study sessions in one click, rehydrating the dashboard with that session's materials.

### 8. Multi-Engine Inference Hub
- Switch between **Google Gemini 2.5 Flash**, **NVIDIA NIM (Nemotron 3.5 Bolt)**, and **OpenRouter** in real-time from the dashboard with live latency and tier-readiness monitoring.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Markdown |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, Pydantic Settings, PyPDF, Python-docx |
| **Vector DB** | Neon Serverless PostgreSQL with `pgvector` extension |
| **Embedding Models** | Google Gemini `models/gemini-embedding-001` (3072 dims) |
| **LLM Inference** | Google Gemini 2.5 Flash, NVIDIA NIM, OpenRouter |
| **Voice / TTS** | Edge-TTS 7.3.1, gTTS, Web Audio API |
| **Authentication** | PBKDF2-HMAC-SHA256 password hashing, JWT Bearer tokens |

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- Python 3.11 or 3.12
- Node.js 18+ & npm
- A Neon PostgreSQL database instance (with `pgvector` extension)

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from template
cp .env.example .env
# Edit .env with your Neon DATABASE_URL and API keys

# Start backend server
python run.py
# Or with uvicorn directly:
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## ☁️ Deployment Guide

### Deploying the Backend on Render

The backend is configured with `render.yaml` for automated zero-downtime deployment.

1. **Create Web Service on Render**:
   - Link your GitHub repository.
   - **Root Directory**: `backend` *(Important: Do not leave blank)*
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/health`

2. **Configure Environment Variables in Render**:
   ```env
   DATABASE_URL=postgresql://neondb_owner:...@ep-....neon.tech/neondb?sslmode=require
   GEMINI_API_KEY=your_gemini_api_key
   NVIDIA_API_KEY=your_nvidia_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   LLM_PROVIDER=gemini
   SECRET_KEY=your_secure_secret_key
   CORS_ORIGINS=*
   PYTHON_VERSION=3.11.9
   ```

### Deploying the Frontend on Vercel

1. Import the repository in [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable:
   ```env
   VITE_API_BASE_URL=https://<your-render-service>.onrender.com
   ```
4. Deploy!

---

## 🔐 Environment Variables Reference

| Variable | Description | Required |
| :--- | :--- | :--- |
| `DATABASE_URL` | Neon Serverless PostgreSQL connection string with SSL | Yes |
| `GEMINI_API_KEY` | Google Gemini API Key for LLM and embeddings | Yes |
| `NVIDIA_API_KEY` | NVIDIA NIM API Key for free high-speed inference | Optional |
| `OPENROUTER_API_KEY` | OpenRouter API Key for expanded model choices | Optional |
| `LLM_PROVIDER` | Active LLM provider (`gemini`, `nvidia`, `openrouter`) | Yes |
| `SECRET_KEY` | Secret key used to sign JWT session authentication tokens | Yes |
| `CORS_ORIGINS` | Permitted origins for cross-origin requests (`*` for all) | Yes |

---

## 📄 License
This project is licensed under the MIT License.
