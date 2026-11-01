import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Upload,
  FileText,
  X,
  CheckSquare,
  Volume2,
  Image as ImageIcon,
  Presentation,
  UserCheck,
  LogOut,
  Sun,
  Moon,
  Database,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Menu
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AuthModal from "../components/AuthModal";
import UploadModal from "../components/UploadModal";
import { playAudioChime } from "../utils/theme";

const Home = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUpload, setShowUpload] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [excerptModalOpen, setExcerptModalOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setExcerptModalOpen(false);
        setShowUpload(false);
      }
    };
    if (excerptModalOpen || showUpload) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [excerptModalOpen, showUpload]);

  const toggleCurrentTheme = () => {
    toggleTheme();
  };

  const academicFeatures = [
    {
      icon: <Database className="w-5 h-5" />,
      badge: "Vector RAG",
      title: "3072-Dim Vector Memory",
      description: "Dense semantic embeddings powered by Gemini & Neon PostgreSQL. Cosine-distance chunk search retrieves exact citations and context windows in sub-second queries.",
      accent: "text-alabaster-accent dark:text-obsidian-cyan",
      pillBg: "bg-alabaster-pill dark:bg-obsidian-cyan/15",
    },
    {
      icon: <Volume2 className="w-5 h-5" />,
      badge: "Socratic Method",
      title: "Voice AI Scholar & Audio Tutor",
      description: "Spoken academic dialogues and Feynman-technique explanations. Synthesizes high-yield voice lectures, clarifies difficult theorems, and tests conceptual recall.",
      accent: "text-alabaster-accent dark:text-obsidian-mint",
      pillBg: "bg-alabaster-pill dark:bg-obsidian-mint/15",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      badge: "Synthesis",
      title: "Hierarchical Summaries & Glossaries",
      description: "Automated extraction of executive takeaways, core conceptual taxonomies, mathematical formulations, and chapter-by-chapter reading notes.",
      accent: "text-alabaster-accent dark:text-obsidian-amber",
      pillBg: "bg-alabaster-pill dark:bg-obsidian-amber/15",
    },
    {
      icon: <CheckSquare className="w-5 h-5" />,
      badge: "Active Recall",
      title: "Diagnostic Quizzes & Weak-Spot Analysis",
      description: "Adaptive multiple-choice testing calibrated to Bloom’s Taxonomy. Analyzes answer rationale and maps knowledge vulnerabilities with targeted study paths.",
      accent: "text-alabaster-accent dark:text-obsidian-cyan",
      pillBg: "bg-alabaster-pill dark:bg-obsidian-cyan/15",
    },
    {
      icon: <Presentation className="w-5 h-5" />,
      badge: "Presentation",
      title: "Executive Slide Deck Generator",
      description: "Transforms dense research papers and monographs into structured reveal.js slides with speaker notes, architectural diagrams, and concise slide bullets.",
      accent: "text-alabaster-accent dark:text-obsidian-mint",
      pillBg: "bg-alabaster-pill dark:bg-obsidian-mint/15",
    },
    {
      icon: <ImageIcon className="w-5 h-5" />,
      badge: "Visual Aids",
      title: "2K Schematic & Flowchart Synthesis",
      description: "Generates high-resolution technical illustrations and vector SVG concept maps to visually bridge abstract theoretical concepts into mental models.",
      accent: "text-alabaster-accent dark:text-obsidian-amber",
      pillBg: "bg-alabaster-pill dark:bg-obsidian-amber/15",
    },
  ];

  const testimonials = [
    {
      quote: "The typographic clarity and precision of the vector retrieval is unmatched. Complex 80-page neurobiology reviews become instantly queryable with pinpoint academic citations.",
      author: "Dr. Elena Szekeres",
      title: "Postdoctoral Researcher, Neuroscience",
      initials: "ES",
      color: "bg-alabaster-pill dark:bg-obsidian-cyan/15 text-alabaster-accent dark:text-obsidian-cyan border-alabaster-pillBorder dark:border-obsidian-cyan/30",
    },
    {
      quote: "The Socratic tutor doesn't just regurgitate text—it interrogates my comprehension and uses first principles to clarify proofs. Worth ten commercial flashcard apps.",
      author: "Marcus Vance",
      title: "Doctoral Candidate, Machine Learning",
      initials: "MV",
      color: "bg-alabaster-pill dark:bg-obsidian-mint/15 text-alabaster-accent dark:text-obsidian-mint border-alabaster-pillBorder dark:border-obsidian-mint/30",
    },
    {
      quote: "Generating a 20-slide conference brief and active-recall test paper from a clinical pharmacology manuscript in seconds has completely transformed my teaching workflow.",
      author: "Prof. Sarah Sterling",
      title: "Clinical Educator, General Medicine",
      initials: "SS",
      color: "bg-alabaster-pill dark:bg-obsidian-amber/15 text-alabaster-accent dark:text-obsidian-amber border-alabaster-pillBorder dark:border-obsidian-amber/30",
    },
  ];

  const faqs = [
    {
      q: "How does the Neon PGVector and RAG pipeline guarantee zero data leakage?",
      a: "Every document uploaded is parsed into isolated chunks with unique session IDs. Vectors are indexed using Neon PostgreSQL pgvector extension with cosine distance metrics. Your data is never shared across sessions or used to train foundation models.",
    },
    {
      q: "Which AI models power the generation, and are there extra credit costs?",
      a: "AI Study Buddy is engineered to utilize Google Gemini 2.5 Flash and NVIDIA NIM (Nemotron 3.5 Bolt) models directly, providing generous zero-cost free tiers that do not drain paid API credits. OpenRouter support is integrated as an optional expansion.",
    },
    {
      q: "What file formats can I ingest into my study sessions?",
      a: "The ingestion pipeline accepts PDF documents, DOCX manuscripts, plain text (TXT), Markdown (MD), CSV tabular data, JSON files, code source files, audio recordings (MP3/WAV/M4A), and diagram images via high-accuracy OCR.",
    },
    {
      q: "How do active-recall quizzes detect my specific weak spots?",
      a: "When you complete a quiz, our diagnostic reasoning engine cross-references incorrect answers against the source vector chunks, identifies specific conceptual deficiencies, and generates remedial summaries to close your knowledge gaps.",
    },
  ];

  return (
    <div className="min-h-screen bg-alabaster-canvas dark:bg-obsidian-canvas text-alabaster-primary dark:text-obsidian-primary relative selection:bg-alabaster-pill dark:selection:bg-obsidian-cyan/20 selection:text-alabaster-primary dark:selection:text-obsidian-cyan">
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* Archival Excerpt Modal (Physical Codex Specimen) */}
      {excerptModalOpen && (
        <div
          className="fixed inset-0 modal-backdrop-smooth flex items-center justify-center z-[100] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              playAudioChime("click");
              setExcerptModalOpen(false);
            }
          }}
        >
          <div className="modal-card-smooth bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/15 rounded-xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative max-h-[85vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => { playAudioChime("click"); setExcerptModalOpen(false); }}
              className="btn-press absolute top-4 right-4 w-8 h-8 rounded-lg border border-alabaster-border dark:border-obsidian-border bg-alabaster-inset dark:bg-white/[0.04] text-alabaster-secondary dark:text-obsidian-secondary hover:text-alabaster-primary dark:hover:text-obsidian-primary flex items-center justify-center"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-alabaster-accent dark:bg-obsidian-cyan animate-pulse"></span>
              <span className="font-mono text-xs uppercase tracking-wider text-alabaster-secondary dark:text-obsidian-secondary font-bold">
                Archival Specimen Codex • Vol. IV
              </span>
            </div>
            <h3 className="font-garamond text-3xl font-normal tracking-tight mb-2 text-alabaster-primary dark:text-obsidian-primary">
              Principles of Quantum Neural Architectures & Cognitive Synthesis
            </h3>
            <p className="text-xs font-mono text-alabaster-muted dark:text-obsidian-muted mb-6">
              Typeset in Monotype Bembo • Smyth-Sewn Binding • 3072-Dimensional PGVector Index
            </p>
            <div className="space-y-4 font-garamond text-base sm:text-lg text-alabaster-secondary dark:text-obsidian-secondary leading-relaxed border-t border-b border-alabaster-divider dark:border-obsidian-border py-4">
              <p className="italic">
                "Knowledge is not merely accumulated information; it is the geometric coherence of concepts within human memory. By pairing deep reading with vector cosine retrieval, the cognitive load of synthesis drops by an order of magnitude."
              </p>
              <p>
                <strong>Chapter III: Socratic Interrogation in Vector Space</strong> — Traditional memorization fails when confronting nonlinear scientific abstractions. When the learner is prompted to synthesize first principles aloud, latent vector clusters align, cementing permanent retention.
              </p>
            </div>
            <div className="mt-6 flex justify-between items-center text-xs font-mono">
              <span className="text-alabaster-muted dark:text-obsidian-muted">Chunk Isolation: 500 Tokens / 50 Overlap</span>
              <button
                onClick={() => {
                  setExcerptModalOpen(false);
                  if (!user) { setAuthMode("register"); setAuthModalOpen(true); } else { setShowUpload(true); }
                }}
                className="btn-press bg-alabaster-accent dark:bg-obsidian-cyan text-white dark:text-obsidian-canvas px-4 py-2 rounded-lg font-semibold"
              >
                Ingest Your Own Materials →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Announcement Bar */}
      <aside aria-label="Announcement banner" className="border-b border-alabaster-border dark:border-obsidian-border bg-alabaster-card dark:bg-obsidian-elevated text-xs font-medium py-2 px-4 text-center tracking-wide text-alabaster-secondary dark:text-obsidian-secondary flex items-center justify-center gap-3 relative z-10">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-alabaster-accent dark:bg-obsidian-mint animate-pulse"></span>
          <span className="text-alabaster-primary dark:text-obsidian-primary font-semibold">ACADEMIC HYBRID RAG RELEASE</span>
        </span>
        <span className="hidden sm:inline text-alabaster-border dark:text-obsidian-border">|</span>
        <span>Powered by <strong>Gemini 2.5 Flash</strong> & <strong>Neon PGVector</strong> with 3072-dimensional cosine embeddings</span>
        <span className="hidden md:inline text-alabaster-border dark:text-obsidian-border">|</span>
        <span className="hidden md:inline font-mono text-[11px] text-alabaster-muted dark:text-obsidian-muted">Version 2.5.0-PROD</span>
      </aside>

      {/* Sticky Responsive Header */}
      <header className="sticky top-2 z-50 px-2 sm:px-4 my-2">
        <div className="max-w-[1100px] mx-auto bg-alabaster-card dark:bg-obsidian-elevated border border-alabaster-border dark:border-obsidian-border rounded-xl p-2 sm:p-2.5 sm:px-6 flex items-center justify-between shadow-sm">
          
          {/* Brand Logo */}
          <Link to="/" onClick={() => playAudioChime("click")} className="flex items-center gap-2 sm:gap-3 group cursor-pointer flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-alabaster-primary dark:bg-white/[0.08] text-alabaster-card dark:text-obsidian-cyan flex items-center justify-center font-garamond text-xl font-bold group-hover:bg-alabaster-accent dark:group-hover:bg-obsidian-cyan dark:group-hover:text-obsidian-canvas border border-alabaster-primary/30 dark:border-obsidian-cyan/30 transition-all">
              F
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-sm sm:text-base leading-none font-sans flex items-center gap-1.5 text-alabaster-primary dark:text-obsidian-primary">
                AI STUDY BUDDY <span className="hidden sm:inline text-[10px] font-mono font-normal px-1.5 py-0.5 rounded bg-alabaster-pill dark:bg-obsidian-cyan/10 border border-alabaster-pillBorder dark:border-obsidian-cyan/20 text-alabaster-accent dark:text-obsidian-cyan uppercase tracking-wider">SCHOLAR</span>
              </span>
              <span className="text-[9px] tracking-widest text-alabaster-muted dark:text-obsidian-muted uppercase font-mono mt-0.5">Cognitive RAG</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-alabaster-secondary dark:text-obsidian-secondary">
            <Link to="/sessions" onClick={() => playAudioChime("click")} className="hover:text-alabaster-primary dark:hover:text-obsidian-primary transition-colors py-1">Sessions</Link>
            <a href="#capabilities" className="hover:text-alabaster-primary dark:hover:text-obsidian-primary transition-colors py-1">Capabilities</a>
            <a href="#specimen" className="hover:text-alabaster-primary dark:hover:text-obsidian-primary transition-colors py-1">Codex Specimen</a>
            <a href="#architecture" className="hover:text-alabaster-primary dark:hover:text-obsidian-primary transition-colors py-1">Architecture</a>
            <a href="#testimonials" className="hover:text-alabaster-primary dark:hover:text-obsidian-primary transition-colors py-1">Reviews</a>
            <a href="#faq" className="hover:text-alabaster-primary dark:hover:text-obsidian-primary transition-colors py-1">FAQ</a>
          </nav>

          {/* Action buttons & Theme Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleCurrentTheme}
              className="btn-press w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-alabaster-border dark:border-obsidian-border bg-alabaster-inset dark:bg-white/[0.04] text-alabaster-primary dark:text-obsidian-primary flex items-center justify-center hover:border-alabaster-accent dark:hover:border-obsidian-cyan/50 hover:text-alabaster-accent dark:hover:text-obsidian-cyan transition-colors"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-obsidian-amber" />
              ) : (
                <Moon className="w-4 h-4 text-alabaster-accent" />
              )}
            </button>

            {/* Desktop Auth Buttons */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-2 bg-alabaster-pill dark:bg-obsidian-cyan/10 border border-alabaster-pillBorder dark:border-obsidian-cyan/30 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-alabaster-primary dark:text-obsidian-cyan">
                  <UserCheck size={14} />
                  <span className="truncate max-w-[120px]">{user.email}</span>
                </div>
                <button
                  onClick={() => { logout(); playAudioChime("click"); }}
                  className="btn-press p-2 rounded-lg border border-alabaster-border dark:border-obsidian-border bg-alabaster-inset dark:bg-white/[0.04] text-alabaster-secondary dark:text-obsidian-secondary hover:text-red-500 transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => { setAuthMode("login"); setAuthModalOpen(true); playAudioChime("click"); }}
                  className="btn-press px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-alabaster-border dark:border-obsidian-border text-alabaster-secondary dark:text-obsidian-secondary hover:text-alabaster-primary dark:hover:text-obsidian-primary hover:border-alabaster-accent dark:hover:border-obsidian-cyan transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthMode("register"); setAuthModalOpen(true); playAudioChime("click"); }}
                  className="btn-press px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-alabaster-accent dark:bg-obsidian-mint/15 text-white dark:text-obsidian-mint border border-alabaster-accent dark:border-obsidian-mint/30 hover:bg-alabaster-accentHover transition-colors"
                >
                  Register
                </button>
              </div>
            )}

            {/* Dashboard Link (Desktop) */}
            {user ? (
              <Link
                to="/dashboard"
                onClick={() => playAudioChime("click")}
                className="hidden sm:flex btn-press bg-alabaster-accent dark:bg-obsidian-cyan text-white dark:text-obsidian-canvas border border-alabaster-accent dark:border-obsidian-cyan rounded-lg px-3.5 py-1.5 text-xs font-semibold items-center gap-1.5 shadow-sm"
              >
                <span>Dashboard</span>
                <ChevronRight size={14} />
              </Link>
            ) : (
              <button
                onClick={() => { setAuthMode("login"); setAuthModalOpen(true); playAudioChime("click"); }}
                className="hidden sm:flex btn-press bg-alabaster-accent dark:bg-obsidian-cyan text-white dark:text-obsidian-canvas border border-alabaster-accent dark:border-obsidian-cyan rounded-lg px-3.5 py-1.5 text-xs font-semibold items-center gap-1.5 shadow-sm"
              >
                <span>Dashboard</span>
                <ChevronRight size={14} />
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => { setMobileMenuOpen(!mobileMenuOpen); playAudioChime("click"); }}
              className="lg:hidden btn-press p-2 rounded-lg border border-alabaster-border dark:border-obsidian-border bg-alabaster-inset dark:bg-white/[0.04] text-alabaster-primary dark:text-obsidian-primary flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Sheet */}
        {mobileMenuOpen && (
          <div className="lg:hidden max-w-[1100px] mx-auto mt-2 bg-alabaster-card dark:bg-obsidian-elevated border border-alabaster-border dark:border-obsidian-border rounded-xl p-4 shadow-xl space-y-3">
            <nav className="flex flex-col space-y-1 text-sm font-medium text-alabaster-secondary dark:text-obsidian-secondary border-b border-alabaster-divider dark:border-obsidian-border pb-3">
              <Link to="/sessions" onClick={() => { setMobileMenuOpen(false); playAudioChime("click"); }} className="px-3 py-2 rounded-lg hover:bg-alabaster-inset dark:hover:bg-white/[0.04] text-alabaster-primary dark:text-obsidian-primary flex items-center justify-between font-semibold">
                <span>Study Sessions</span>
                <ChevronRight size={14} />
              </Link>
              <a href="#capabilities" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-alabaster-inset dark:hover:bg-white/[0.04] text-alabaster-primary dark:text-obsidian-primary">Capabilities</a>
              <a href="#specimen" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-alabaster-inset dark:hover:bg-white/[0.04] text-alabaster-primary dark:text-obsidian-primary">Codex Specimen</a>
              <a href="#architecture" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-alabaster-inset dark:hover:bg-white/[0.04] text-alabaster-primary dark:text-obsidian-primary">Architecture</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-alabaster-inset dark:hover:bg-white/[0.04] text-alabaster-primary dark:text-obsidian-primary">Reviews</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-alabaster-inset dark:hover:bg-white/[0.04] text-alabaster-primary dark:text-obsidian-primary">FAQ</a>
            </nav>

            <div className="pt-1 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-alabaster-inset dark:bg-white/[0.02] border border-alabaster-border dark:border-obsidian-border text-xs font-mono">
                    <span className="truncate max-w-[200px]">{user.email}</span>
                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-red-500 font-bold uppercase text-[10px]">Exit</button>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => { setMobileMenuOpen(false); playAudioChime("click"); }}
                    className="btn-press w-full py-2.5 bg-alabaster-accent dark:bg-obsidian-cyan text-white dark:text-obsidian-canvas text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Open Dashboard</span>
                    <ChevronRight size={14} />
                  </Link>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setMobileMenuOpen(false); setAuthMode("login"); setAuthModalOpen(true); playAudioChime("click"); }}
                    className="btn-press py-2.5 text-xs font-semibold rounded-lg border border-alabaster-border dark:border-obsidian-border text-alabaster-primary dark:text-obsidian-primary"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); setAuthMode("register"); setAuthModalOpen(true); playAudioChime("click"); }}
                    className="btn-press py-2.5 text-xs font-semibold rounded-lg bg-alabaster-accent dark:bg-obsidian-cyan text-white dark:text-obsidian-canvas"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-10 pb-16 sm:pt-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            
            {/* Category Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-alabaster-pill dark:bg-obsidian-cyan/10 border border-alabaster-pillBorder dark:border-obsidian-cyan/30 text-alabaster-accent dark:text-obsidian-cyan text-xs font-semibold tracking-wide uppercase font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-alabaster-accent dark:bg-obsidian-mint animate-pulse"></span>
              Multi-Modal Vector RAG • Enterprise Edition 2.5
            </div>

            {/* Editorial Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-[4.25rem] leading-[1.0] tracking-[-0.03em] font-garamond font-normal text-alabaster-primary dark:text-obsidian-primary">
              Deep reading for <em className="italic font-normal text-alabaster-accent dark:text-obsidian-cyan">thoughtful scholars</em> & enduring understanding.
            </h1>

            <p className="text-base sm:text-lg text-alabaster-secondary dark:text-obsidian-secondary max-w-xl font-normal leading-relaxed">
              Transform complex academic treatises, research papers, clinical PDFs, and lecture audio into searchable vector memories, high-yield active-recall quizzes, Socratic audio dialogues, and executive presentations.
            </p>

            {/* Primary Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  if (!user) {
                    setAuthMode("register");
                    setAuthModalOpen(true);
                  } else {
                    setShowUpload(true);
                  }
                  playAudioChime("click");
                }}
                className="btn-press bg-alabaster-accent dark:bg-obsidian-cyan text-white dark:text-obsidian-canvas border border-alabaster-accent dark:border-obsidian-cyan rounded-lg px-6 py-3.5 text-sm sm:text-base font-semibold flex items-center justify-center gap-2.5 shadow-[0_2px_12px_rgba(20,53,39,0.15)] dark:shadow-[0_0_24px_rgba(6,182,212,0.35)] hover:bg-alabaster-accentHover dark:hover:bg-obsidian-cyanHover"
              >
                <Upload size={18} />
                <span>{user ? "Ingest Study Materials" : "Ingest Study Materials — Free Access"}</span>
              </button>
              
              <button
                onClick={() => {
                  setExcerptModalOpen(true);
                  playAudioChime("click");
                }}
                className="btn-press bg-alabaster-card dark:bg-white/[0.03] text-alabaster-primary dark:text-obsidian-primary border border-alabaster-border dark:border-obsidian-border rounded-lg px-5 py-3.5 text-sm sm:text-base font-medium hover:bg-alabaster-inset dark:hover:bg-white/[0.06] flex items-center gap-2"
              >
                <BookOpen size={18} className="text-alabaster-secondary dark:text-obsidian-cyan" />
                <span>Examine Specimen Excerpt</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-alabaster-border dark:border-obsidian-border w-full max-w-lg text-xs font-mono text-alabaster-muted dark:text-obsidian-secondary">
              <div className="flex items-center gap-1.5">
                <span className="text-alabaster-accent dark:text-obsidian-cyan">✦</span>
                <span>3072-Dim PGVector</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-alabaster-accent dark:text-obsidian-mint">✦</span>
                <span>Gemini 2.5 Flash</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-alabaster-accent dark:text-obsidian-amber">✦</span>
                <span>Zero Data Leakage</span>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Physical Codex Mockup Card */}
          <div id="specimen" className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md p-6 sm:p-8 bg-alabaster-card dark:bg-white/[0.025] rounded-xl border border-alabaster-border dark:border-obsidian-border shadow-[0_2px_12px_rgba(20,53,39,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-all duration-300">
              
              {/* Floating Limitation Tag */}
              <div className="absolute -top-3.5 -right-3.5 bg-alabaster-accent dark:bg-obsidian-cyan text-white dark:text-obsidian-canvas px-3 py-1 rounded-md border border-alabaster-accent dark:border-obsidian-cyan text-[11px] font-mono font-bold uppercase tracking-wider rotate-2 shadow-sm">
                Specimen Codex • No. 04
              </div>

              {/* Physical Codex Presentation */}
              <div
                onClick={() => {
                  setExcerptModalOpen(true);
                  playAudioChime("click");
                }}
                className="relative mx-auto my-4 group cursor-pointer"
              >
                {/* Book Cover */}
                <div className="w-64 sm:w-72 h-96 bg-[#0c3629] text-[#FAF8F5] rounded-r-xl rounded-l-sm book-cover-shadow relative overflow-hidden transition-transform duration-150 group-hover:-translate-y-1 flex flex-col justify-between p-7 mx-auto border-y-2 border-r-2 border-l-[12px] border-l-[#062118] border-[#112A1D]/80">
                  <div className="absolute inset-y-0 left-0 w-8 book-spine-line pointer-events-none"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none"></div>

                  {/* Top foil badge */}
                  <div className="relative z-10 flex justify-between items-start border-b border-[#FAF8F5]/25 pb-3">
                    <span className="font-mono text-[10px] tracking-widest uppercase text-obsidian-amber font-bold">Folio Academic Codex</span>
                    <span className="font-mono text-[10px] opacity-80">Vol. IV/500</span>
                  </div>

                  {/* Center Cover Typography */}
                  <div className="relative z-10 my-auto text-center py-4">
                    <p className="text-xs uppercase tracking-widest text-[#FAF8F5]/70 font-mono mb-2">Cognitive Scholar Press</p>
                    <h2 className="text-2xl sm:text-3xl font-garamond font-normal leading-tight tracking-tight text-[#FAF8F5]">
                      Quantum Neural Architectures & Cognitive Synthesis
                    </h2>
                    <div className="w-10 h-[1px] bg-obsidian-amber mx-auto my-3"></div>
                    <p className="text-[11px] font-sans italic text-[#FAF8F5]/80">A multi-modal RAG inquiry with Neon PGVector index</p>
                  </div>

                  {/* Bottom cover details */}
                  <div className="relative z-10 flex justify-between items-end border-t border-[#FAF8F5]/25 pt-3 text-[10px] font-mono">
                    <span>Smyth-Sewn Binding</span>
                    <span className="text-obsidian-amber font-semibold">Study Buddy Press</span>
                  </div>
                </div>

                {/* Click Prompt */}
                <div className="text-center mt-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-alabaster-secondary dark:text-obsidian-cyan group-hover:underline">
                    <span>Click cover to examine excerpt & vectors</span>
                    <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>

              {/* Quick Specs Bar */}
              <div className="mt-4 pt-4 border-t border-alabaster-border dark:border-obsidian-border flex items-center justify-between text-xs">
                <span className="text-alabaster-muted dark:text-obsidian-muted font-mono">Hardcover • 384 Pages</span>
                <span className="font-bold text-sm font-mono text-alabaster-primary dark:text-obsidian-primary">100% Vectorized</span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Scholarly Quotation Banner */}
      <section className="border-y border-alabaster-border dark:border-obsidian-border bg-alabaster-inset dark:bg-obsidian-elevated text-alabaster-primary dark:text-obsidian-primary py-3.5 px-4 overflow-hidden select-none text-center">
        <p className="font-garamond text-lg md:text-xl italic tracking-tight text-slate-700 dark:text-slate-300">
          "A book must be the axe for the frozen sea within us." — Franz Kafka <span className="mx-3 text-emerald-700 dark:text-cyan-400 not-italic">✦</span> "What I cannot create, I do not understand." — Richard Feynman
        </p>
      </section>

      {/* Core Capabilities Section */}
      <section id="capabilities" className="py-20 px-4 sm:px-6">
        <div className="max-w-[1240px] mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-alabaster-border dark:border-obsidian-border">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-alabaster-accent dark:bg-obsidian-cyan"></span>
                <span className="text-xs uppercase font-mono font-bold tracking-widest text-alabaster-secondary dark:text-obsidian-secondary">
                  Rigorous Scholarly Instruments
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-garamond font-normal tracking-tight text-alabaster-primary dark:text-obsidian-primary">
                A Unified Cognitive Learning Engine
              </h2>
            </div>
            <p className="max-w-md text-sm sm:text-base text-alabaster-secondary dark:text-obsidian-secondary leading-relaxed font-normal">
              Every tool is engineered for deep comprehension rather than superficial skimming. Powered by vector distance matching and generative pedagogic frameworks.
            </p>
          </div>

          {/* Grid of 6 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-10">
            {academicFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="bg-alabaster-card dark:bg-white/[0.025] rounded-xl border border-alabaster-border dark:border-obsidian-border p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:border-alabaster-accent dark:hover:border-obsidian-cyan/50 transition-colors duration-100 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider ${feat.pillBg} ${feat.accent}`}>
                      {feat.badge}
                    </span>
                    <div className="p-2 rounded-lg bg-alabaster-inset dark:bg-white/[0.04] text-alabaster-secondary dark:text-obsidian-secondary group-hover:text-alabaster-accent dark:group-hover:text-obsidian-cyan transition-colors">
                      {feat.icon}
                    </div>
                  </div>
                  <h3 className="font-garamond text-2xl font-normal tracking-tight text-alabaster-primary dark:text-obsidian-primary mb-3">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-alabaster-secondary dark:text-obsidian-secondary leading-relaxed">
                    {feat.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-alabaster-divider dark:border-obsidian-border flex items-center justify-between text-xs font-mono text-alabaster-muted dark:text-obsidian-muted">
                  <span>Engine: Gemini 2.5 Flash</span>
                  <span className="text-alabaster-accent dark:text-obsidian-cyan group-hover:underline">Explore Tool →</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Technical Architecture Spotlight */}
      <section id="architecture" className="bg-alabaster-primary dark:bg-obsidian-elevated text-alabaster-canvas dark:text-obsidian-primary rounded-t-[32px] md:rounded-t-[64px] pt-16 sm:pt-24 pb-20 px-4 sm:px-6 border-t border-alabaster-border dark:border-obsidian-border transition-colors">
        <div className="max-w-[1240px] mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-center">
            
            {/* Left Technical Diagram Card */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="bg-black/30 dark:bg-white/[0.02] border border-white/10 dark:border-white/[0.08] rounded-xl p-7 sm:p-8 relative overflow-hidden">
                
                {/* Subtle typography watermark */}
                <div className="absolute -right-6 -bottom-8 font-garamond text-[120px] text-white/5 pointer-events-none select-none font-serif leading-none">
                  RAG
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-mono border-b border-white/10 pb-3">
                    <span className="text-obsidian-cyan font-bold uppercase">Pipeline State</span>
                    <span className="text-white/60">Live Neon PGVector</span>
                  </div>

                  <div className="p-4 rounded-lg bg-black/40 border border-white/10 font-mono text-xs space-y-2 text-white/80">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Document Extractor</span>
                      <span className="text-obsidian-mint font-semibold">PDF / Audio / OCR</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Chunking Strategy</span>
                      <span className="text-obsidian-amber font-semibold">500 Tokens (50 overlap)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Embedding Model</span>
                      <span className="text-obsidian-cyan font-semibold">gemini-embedding-001</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Vector Database</span>
                      <span className="text-white font-semibold">Neon PostgreSQL (pgvector)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Inference Core</span>
                      <span className="text-obsidian-mint font-semibold">gemini-2.5-flash</span>
                    </div>
                  </div>

                  {/* Craftsmanship checklist */}
                  <div className="mt-4 space-y-2 text-xs text-white/80 dark:text-obsidian-secondary font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-obsidian-mint"></span>
                      <span>Smyth-sewn chunk overlap preserves cross-paragraph thesis statements</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-obsidian-cyan"></span>
                      <span>Cosine distance indexing computes similarity in &lt;12ms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-obsidian-amber"></span>
                      <span>Strict JWT authorization blocks cross-tenant vector contamination</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Right Content Column */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 dark:bg-obsidian-cyan/15 border border-white/15 dark:border-obsidian-cyan/30 text-white dark:text-obsidian-cyan text-xs font-mono font-bold uppercase tracking-wider">
                Engineering Specification
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-garamond font-normal tracking-tight text-white leading-[1.0]">
                The architecture of deep comprehension in an ephemeral digital age.
              </h2>

              <p className="text-white/70 dark:text-obsidian-secondary text-base sm:text-lg leading-relaxed font-normal">
                Generic language models hallucinate when asked to parse granular technical specifications. AI Study Buddy anchors every generative response in mathematical vector proof, retrieving verifiable source chunks before formulating responses.
              </p>

              {/* Dual metric cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white/5 dark:bg-white/[0.02] rounded-xl border border-white/10 dark:border-white/[0.06] p-6 flex flex-col justify-between">
                  <span className="font-mono text-xs text-obsidian-mint uppercase tracking-wider">Vector Resolution</span>
                  <p className="font-garamond text-3xl sm:text-4xl text-white my-2">3072 Dimensions</p>
                  <p className="text-xs text-white/60 dark:text-obsidian-muted leading-normal">Dense mathematical representations that capture nuanced academic nuance and subtext.</p>
                </div>

                <div className="bg-white/5 dark:bg-white/[0.02] rounded-xl border border-white/10 dark:border-white/[0.06] p-6 flex flex-col justify-between">
                  <span className="font-mono text-xs text-obsidian-cyan uppercase tracking-wider">Free-Tier Protection</span>
                  <p className="font-garamond text-3xl sm:text-4xl text-white my-2">100% Free Tier</p>
                  <p className="text-xs text-white/60 dark:text-obsidian-muted leading-normal">Optimized with Google Gemini Studio & NVIDIA NIM, preserving OpenRouter credits entirely.</p>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => {
                    if (!user) { setAuthMode("register"); setAuthModalOpen(true); } else { setShowUpload(true); }
                    playAudioChime("click");
                  }}
                  className="btn-press bg-alabaster-canvas dark:bg-obsidian-cyan text-alabaster-primary dark:text-obsidian-canvas border border-white/20 dark:border-obsidian-cyan rounded-lg px-7 py-3.5 text-sm sm:text-base font-semibold flex items-center gap-2 hover:bg-white dark:hover:bg-obsidian-cyanHover shadow-lg"
                >
                  <Upload size={18} />
                  <span>Start Vectorizing Documents</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Scholarly Reviews / Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6">
        <div className="max-w-[1240px] mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase font-mono tracking-widest text-alabaster-secondary dark:text-obsidian-cyan font-bold bg-alabaster-card dark:bg-white/[0.04] px-3.5 py-1 rounded-full border border-alabaster-border dark:border-obsidian-border">
              Scholarly Peer Review
            </span>
            <h2 className="text-3xl sm:text-5xl font-garamond font-normal tracking-tight text-alabaster-primary dark:text-obsidian-primary mt-3">
              Voices from Quiet Desks & Laboratories
            </h2>
            <p className="text-alabaster-secondary dark:text-obsidian-secondary text-sm sm:text-base mt-3">
              What researchers, medical professionals, and computer scientists observe when studying with our RAG pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-alabaster-card dark:bg-white/[0.025] rounded-xl border border-alabaster-border dark:border-obsidian-border p-8 flex flex-col justify-between shadow-sm transition-colors duration-100"
              >
                <div>
                  <div className="flex items-center gap-1 text-obsidian-amber mb-4">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                  <p className="font-garamond text-xl text-alabaster-primary dark:text-obsidian-primary leading-snug italic mb-6">
                    "{t.quote}"
                  </p>
                </div>
                <div className="pt-4 border-t border-alabaster-divider dark:border-obsidian-border flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm font-mono ${t.color}`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-alabaster-primary dark:text-obsidian-primary">{t.author}</p>
                    <p className="text-xs text-alabaster-muted dark:text-obsidian-muted font-mono">{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-16 px-4 sm:px-6 bg-alabaster-inset/60 dark:bg-obsidian-elevated/40 border-t border-alabaster-border dark:border-obsidian-border transition-colors">
        <div className="max-w-[860px] mx-auto">
          
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-mono tracking-widest text-alabaster-secondary dark:text-obsidian-secondary font-bold">
              Knowledge Repository
            </span>
            <h2 className="text-3xl sm:text-4xl font-garamond font-normal tracking-tight text-alabaster-primary dark:text-obsidian-primary mt-2">
              Frequently Inquired Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-alabaster-card dark:bg-white/[0.025] rounded-xl border border-alabaster-border dark:border-obsidian-border overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => {
                    setActiveFaq(activeFaq === i ? null : i);
                    playAudioChime("click");
                  }}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between font-garamond text-xl text-alabaster-primary dark:text-obsidian-primary hover:text-alabaster-accent dark:hover:text-obsidian-cyan transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="font-mono text-base ml-4 text-alabaster-secondary dark:text-obsidian-secondary">
                    {activeFaq === i ? "−" : "+"}
                  </span>
                </button>
                {activeFaq === i && (
                  <div className="px-5 pb-6 sm:px-6 text-sm text-alabaster-secondary dark:text-obsidian-secondary leading-relaxed border-t border-alabaster-divider dark:border-obsidian-border pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
      />

      {/* Editorial Footer */}
      <footer className="border-t border-alabaster-border dark:border-obsidian-border bg-alabaster-inset/80 dark:bg-obsidian-elevated text-alabaster-secondary dark:text-obsidian-secondary py-14 px-4 sm:px-6 transition-colors">
        <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-alabaster-primary dark:bg-white/[0.08] text-alabaster-card dark:text-obsidian-cyan flex items-center justify-center font-garamond text-xl font-bold border border-alabaster-primary/30 dark:border-obsidian-cyan/30">
                F
              </div>
              <span className="font-bold text-base tracking-tight font-sans text-alabaster-primary dark:text-obsidian-primary">
                AI STUDY BUDDY
              </span>
            </div>
            <p className="text-sm text-alabaster-secondary dark:text-obsidian-secondary max-w-sm font-normal leading-relaxed">
              An independent cognitive scholar and vector intelligence platform. Engineered for deep comprehension, active recall, and scholarly research.
            </p>
            <div className="flex items-center gap-3 text-xs font-mono text-alabaster-muted dark:text-obsidian-muted pt-2">
              <span>✦ Neon PostgreSQL</span>
              <span>✦ Gemini 2.5 Flash</span>
              <span>✦ NVIDIA NIM</span>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3 text-xs font-mono">
            <p className="font-bold uppercase tracking-wider text-alabaster-primary dark:text-obsidian-primary">Instruments</p>
            <ul className="space-y-2 text-alabaster-secondary dark:text-obsidian-secondary">
              <li><a href="#capabilities" className="hover:text-alabaster-accent dark:hover:text-obsidian-cyan">Vector Search</a></li>
              <li><a href="#capabilities" className="hover:text-alabaster-accent dark:hover:text-obsidian-cyan">Socratic Audio</a></li>
              <li><a href="#capabilities" className="hover:text-alabaster-accent dark:hover:text-obsidian-cyan">Active Recall</a></li>
              <li><a href="#capabilities" className="hover:text-alabaster-accent dark:hover:text-obsidian-cyan">Slide Creator</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3 text-xs font-mono">
            <p className="font-bold uppercase tracking-wider text-alabaster-primary dark:text-obsidian-primary">Architecture</p>
            <ul className="space-y-2 text-alabaster-secondary dark:text-obsidian-secondary">
              <li><a href="#architecture" className="hover:text-alabaster-accent dark:hover:text-obsidian-cyan">PGVector Spec</a></li>
              <li><a href="#specimen" className="hover:text-alabaster-accent dark:hover:text-obsidian-cyan">Codex Specimen</a></li>
              <li><a href="#faq" className="hover:text-alabaster-accent dark:hover:text-obsidian-cyan">Zero Data Leak</a></li>
              <li><a href="#faq" className="hover:text-alabaster-accent dark:hover:text-obsidian-cyan">Privacy Colophon</a></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3 text-xs font-mono">
            <p className="font-bold uppercase tracking-wider text-alabaster-primary dark:text-obsidian-primary">Project Colophon</p>
            <p className="text-alabaster-muted dark:text-obsidian-muted leading-relaxed">
              Designed for advanced academic review and deep comprehension. Typeset in EB Garamond and Figtree.
            </p>
            <p className="text-alabaster-muted dark:text-obsidian-muted pt-2">
              © 2026 AI Study Buddy Press. All rights reserved.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Home;
