import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  MessageSquare,
  FileText,
  CheckSquare,
  LogOut,
  Menu,
  Plus,
  Files,
  Volume2,
  Image as ImageIcon,
  Presentation,
  Trash2,
  Cpu,
  UserCheck,
  Upload,
  CheckCircle2,
  Sun,
  Moon,
  X,
  Folder
} from "lucide-react";
import Chat from "../components/Chat";
import Quiz from "../components/Quiz";
import Summary from "../components/Summary";
import SamplePaper from "../components/SamplePaper";
import Teacher from "../components/Teacher";
import ImageGenerator from "../components/ImageGenerator";
import SlidesGenerator from "../components/SlidesGenerator";
import ModelInfo from "../components/ModelInfo";
import AuthModal from "../components/AuthModal";
import UploadModal from "../components/UploadModal";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { deleteSession, getSessionHistory, getSessionDocuments } from "../services/api";
import { playAudioChime } from "../utils/theme";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<
    | "summary"
    | "quiz"
    | "chat"
    | "slides"
    | "sample_paper"
    | "teacher"
    | "image"
    | "models"
  >("summary");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isLoaded } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [sessionDocuments, setSessionDocuments] = useState<string[]>([]);
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(["summary"]));
  const currentSessionId = localStorage.getItem("study_session_id");

  const handleSelectTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setVisitedTabs((prev) => new Set(prev).add(tab));
    setMobileSidebarOpen(false);
    playAudioChime("click");
  };

  const toggleCurrentTheme = () => {
    toggleTheme();
  };

  const currentSessionRecord = sessionHistory.find((s) => s.id === currentSessionId);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const history = await getSessionHistory();
      setSessionHistory(history || []);
      if (!localStorage.getItem("study_session_id") && history && history.length > 0) {
        localStorage.setItem("study_session_id", history[0].id);
      }
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
  };

  const fetchDocuments = async () => {
    if (!user) return;
    const sid = localStorage.getItem("study_session_id");
    if (sid) {
      try {
        const data = await getSessionDocuments(sid);
        if (data && data.documents) {
          setSessionDocuments(data.documents);
        }
      } catch (e) {
        console.error("Failed to load documents", e);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
      fetchDocuments();
    }
  }, [user, location.state, currentSessionId]);

  const handleEndSession = async () => {
    const sessionId = localStorage.getItem("study_session_id");
    if (sessionId) {
      try {
        await deleteSession(sessionId);
        toast.success("Session deleted successfully");
        setSessionHistory((prev) => prev.filter((s) => s.id !== sessionId));
      } catch (err) {
        console.error("Failed to delete session:", err);
      }
      localStorage.removeItem("study_session_id");
    }
    navigate("/");
  };

  const handleDeleteHistorySession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      await deleteSession(sessionId);
      toast.success("Session deleted");
      setSessionHistory((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        localStorage.removeItem("study_session_id");
        window.location.reload();
      }
    } catch (err) {
      toast.error("Failed to delete session");
    }
  };

  const switchSession = (sessionId: string) => {
    localStorage.setItem("study_session_id", sessionId);
    playAudioChime("click");
    window.location.reload();
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-alabaster-canvas dark:bg-obsidian-canvas flex flex-col items-center justify-center p-6 text-slate-900 dark:text-slate-100 transition-colors">
        <div className="relative flex flex-col items-center max-w-sm text-center">
          {/* Orbital glowing badge */}
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/15 flex items-center justify-center shadow-lg font-garamond text-2xl font-bold text-slate-900 dark:text-cyan-400">
              F
            </div>
            <div className="absolute -inset-2 rounded-2xl border border-emerald-600/30 dark:border-cyan-400/30 animate-ping pointer-events-none"></div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-cyan-400 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-cyan-400 animate-pulse"></span>
            Cognitive Scholar Initializer
          </div>

          <h3 className="font-garamond text-2xl font-normal tracking-tight text-slate-900 dark:text-white">
            Calibrating Vector Memory
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed font-mono">
            Connecting to Neon PGVector & Gemini Embedding Space...
          </p>

          {/* Shimmer progress bar */}
          <div className="w-48 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full mt-6 overflow-hidden relative">
            <div className="h-full bg-emerald-700 dark:bg-cyan-400 rounded-full w-1/2 animate-indeterminate"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-alabaster-canvas dark:bg-obsidian-canvas flex items-center justify-center p-6 font-sans relative">
        <Toaster position="top-right" />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => {
            setAuthModalOpen(false);
            fetchHistory();
          }}
          initialMode={authMode}
        />
        <div className="bg-alabaster-card dark:bg-obsidian-elevated border border-alabaster-border dark:border-obsidian-border p-8 md:p-12 rounded-xl shadow-[0_8px_40px_rgba(20,53,39,0.15)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.6)] max-w-lg w-full text-center space-y-6">
          <div className="w-14 h-14 rounded-xl bg-alabaster-primary dark:bg-white/[0.08] text-alabaster-card dark:text-obsidian-cyan mx-auto flex items-center justify-center font-garamond text-2xl font-bold border border-alabaster-primary/30 dark:border-obsidian-cyan/30">
            F
          </div>
          <div>
            <h2 className="font-garamond text-3xl font-normal tracking-tight text-alabaster-primary dark:text-obsidian-primary">
              Authentication Required
            </h2>
            <p className="text-sm text-alabaster-secondary dark:text-obsidian-secondary mt-2 leading-relaxed">
              Please register or sign in to access your study sessions, document vector indices, AI quizzes, and socratic tutor.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                setAuthMode("register");
                setAuthModalOpen(true);
                playAudioChime("click");
              }}
              className="btn-press w-full py-3.5 bg-alabaster-accent dark:bg-obsidian-cyan text-white dark:text-obsidian-canvas font-semibold text-sm rounded-lg shadow-sm hover:bg-alabaster-accentHover dark:hover:bg-obsidian-cyanHover"
            >
              Create Free Scholar Account
            </button>
            <button
              onClick={() => {
                setAuthMode("login");
                setAuthModalOpen(true);
                playAudioChime("click");
              }}
              className="btn-press w-full py-3 bg-alabaster-inset dark:bg-white/[0.04] text-alabaster-primary dark:text-obsidian-primary font-semibold text-sm rounded-lg border border-alabaster-border dark:border-obsidian-border hover:bg-alabaster-card"
            >
              Sign In to Existing Account
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full py-2 text-xs font-mono text-alabaster-muted dark:text-obsidian-muted hover:text-alabaster-primary dark:hover:text-obsidian-primary"
            >
              ← Return to Academic Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-alabaster-canvas dark:bg-obsidian-canvas text-alabaster-primary dark:text-obsidian-primary overflow-hidden font-sans transition-colors">
      <Toaster position="top-right" />
      <AuthModal isOpen={authModalOpen} onClose={() => { setAuthModalOpen(false); fetchHistory(); }} initialMode={authMode} />
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        existingDocNames={sessionDocuments}
        onUploadSuccess={() => { fetchDocuments(); fetchHistory(); }}
      />

      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 md:relative md:z-20
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isSidebarOpen ? "md:w-64" : "md:w-20"}
          w-72 bg-alabaster-card dark:bg-obsidian-elevated border-r border-alabaster-border dark:border-obsidian-border
          transition-all duration-200 flex flex-col shadow-xl md:shadow-sm
        `}
      >
        {/* Brand header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-alabaster-border dark:border-obsidian-border bg-alabaster-inset/40 dark:bg-white/[0.02]">
          <Link to="/" onClick={() => playAudioChime("click")} className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-alabaster-primary dark:bg-white/[0.08] text-alabaster-card dark:text-obsidian-cyan flex items-center justify-center font-garamond text-base font-bold border border-alabaster-primary/30 dark:border-obsidian-cyan/30 flex-shrink-0">
              F
            </div>
            {(isSidebarOpen || mobileSidebarOpen) && (
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-alabaster-primary dark:text-obsidian-primary">
                  STUDY BUDDY
                </span>
                <span className="text-[9px] font-mono uppercase tracking-wider text-alabaster-muted dark:text-obsidian-muted">
                  Cognitive Scholar
                </span>
              </div>
            )}
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setSidebarOpen(!isSidebarOpen); playAudioChime("click"); }}
              className="hidden md:flex btn-press p-1.5 rounded-md border border-alabaster-border dark:border-obsidian-border bg-alabaster-inset dark:bg-white/[0.04] text-alabaster-secondary dark:text-obsidian-secondary hover:text-alabaster-primary dark:hover:text-obsidian-primary transition-colors"
              title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <Menu size={16} />
            </button>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden btn-press p-1.5 rounded-md border border-alabaster-border dark:border-obsidian-border bg-alabaster-inset dark:bg-white/[0.04] text-alabaster-secondary dark:text-obsidian-secondary"
              title="Close Navigation"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable middle */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* User Account pill */}
          <div className="p-3 border-b border-alabaster-divider dark:border-obsidian-border bg-alabaster-inset/30 dark:bg-white/[0.01]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <UserCheck size={16} className="text-alabaster-accent dark:text-obsidian-mint flex-shrink-0" />
                {isSidebarOpen && (
                  <span className="text-xs font-mono font-medium truncate max-w-[130px] text-alabaster-primary dark:text-obsidian-primary" title={user.email}>
                    {user.email}
                  </span>
                )}
              </div>
              {isSidebarOpen && (
                <button
                  onClick={() => { logout(); toast.success("Logged out"); fetchHistory(); playAudioChime("click"); }}
                  className="text-[10px] uppercase font-mono font-bold text-alabaster-muted dark:text-obsidian-muted hover:text-red-500 transition-colors"
                >
                  Exit
                </button>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1.5">
            <SidebarItem
              icon={<FileText size={18} />}
              label="Summary"
              isActive={activeTab === "summary"}
              onClick={() => handleSelectTab("summary")}
              isOpen={isSidebarOpen}
            />
            <SidebarItem
              icon={<CheckSquare size={18} />}
              label="Quiz & Recall"
              isActive={activeTab === "quiz"}
              onClick={() => handleSelectTab("quiz")}
              isOpen={isSidebarOpen}
            />
            <SidebarItem
              icon={<MessageSquare size={18} />}
              label="Academic Chat"
              isActive={activeTab === "chat"}
              onClick={() => handleSelectTab("chat")}
              isOpen={isSidebarOpen}
            />
            <SidebarItem
              icon={<Presentation size={18} />}
              label="Slide Creator"
              isActive={activeTab === "slides"}
              onClick={() => handleSelectTab("slides")}
              isOpen={isSidebarOpen}
            />
            <SidebarItem
              icon={<Files size={18} />}
              label="Sample Paper"
              isActive={activeTab === "sample_paper"}
              onClick={() => handleSelectTab("sample_paper")}
              isOpen={isSidebarOpen}
            />
            <SidebarItem
              icon={<Volume2 size={18} />}
              label="Socratic Tutor"
              isActive={activeTab === "teacher"}
              onClick={() => handleSelectTab("teacher")}
              isOpen={isSidebarOpen}
            />
            <SidebarItem
              icon={<ImageIcon size={18} />}
              label="Visual Schematics"
              isActive={activeTab === "image"}
              onClick={() => handleSelectTab("image")}
              isOpen={isSidebarOpen}
            />
            <SidebarItem
              icon={<Cpu size={18} />}
              label="AI Engine Hub"
              isActive={activeTab === "models"}
              onClick={() => handleSelectTab("models")}
              isOpen={isSidebarOpen}
            />

            <Link
              to="/sessions"
              onClick={() => playAudioChime("click")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-transparent hover:border-alabaster-border dark:hover:border-obsidian-border text-xs font-mono text-alabaster-secondary dark:text-obsidian-secondary hover:text-alabaster-accent dark:hover:text-obsidian-cyan hover:bg-alabaster-inset dark:hover:bg-white/[0.04] transition-all ${
                !isSidebarOpen && "justify-center"
              }`}
              title="Manage and switch study sessions"
            >
              <Folder size={18} />
              {isSidebarOpen && <span>Study Sessions</span>}
            </Link>
          </nav>

          {/* Past Sessions List */}
          <div className="mt-4 pt-4 border-t border-alabaster-divider dark:border-obsidian-border px-3 mb-4">
            {isSidebarOpen && (
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-alabaster-muted dark:text-obsidian-muted">
                  Sessions ({sessionHistory.length})
                </h3>
                <Link
                  to="/sessions"
                  onClick={() => playAudioChime("click")}
                  className="text-[11px] font-mono text-alabaster-accent dark:text-obsidian-cyan hover:underline flex items-center gap-0.5"
                  title="View all sessions in dedicated workspace"
                >
                  Manage →
                </Link>
              </div>
            )}
            <div className="space-y-1.5 pr-1">
              {sessionHistory.length === 0 && isSidebarOpen && (
                <p className="text-xs text-alabaster-muted dark:text-obsidian-muted italic px-1 font-mono">No past sessions</p>
              )}
              {sessionHistory.map((session) => (
                <div
                  key={session.id}
                  onClick={() => switchSession(session.id)}
                  className={`group flex items-center justify-between text-left truncate text-xs px-2.5 py-2 rounded-lg border transition-all cursor-pointer ${
                    currentSessionId === session.id
                      ? "bg-alabaster-pill dark:bg-obsidian-cyan/15 border-alabaster-accent dark:border-obsidian-cyan text-alabaster-accent dark:text-obsidian-cyan font-bold"
                      : "bg-transparent border-transparent hover:bg-alabaster-inset dark:hover:bg-white/[0.03] text-alabaster-secondary dark:text-obsidian-secondary"
                  }`}
                  title={session.title}
                >
                  <span className="truncate flex-1 font-mono">
                    {isSidebarOpen ? session.title || "Study Session" : "•"}
                  </span>
                  {isSidebarOpen && (
                    <button
                      onClick={(e) => handleDeleteHistorySession(e, session.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-alabaster-muted hover:text-red-500 transition-opacity ml-1"
                      title="Delete session"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-alabaster-border dark:border-obsidian-border bg-alabaster-inset/30 dark:bg-white/[0.01] space-y-2 mt-auto">
          <button
            onClick={() => {
              localStorage.removeItem("study_session_id");
              playAudioChime("click");
              navigate("/");
            }}
            className={`btn-press flex items-center gap-2 w-full p-2.5 rounded-lg border border-alabaster-border dark:border-obsidian-border bg-alabaster-card dark:bg-white/[0.04] text-alabaster-primary dark:text-obsidian-primary text-xs font-mono font-semibold hover:border-alabaster-accent dark:hover:border-obsidian-cyan ${!isSidebarOpen && "justify-center"}`}
          >
            <Plus size={16} />
            {isSidebarOpen && <span>New Session</span>}
          </button>
          
          <button
            onClick={handleEndSession}
            className={`btn-press flex items-center gap-2 w-full p-2.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-mono font-semibold hover:bg-red-500/20 ${!isSidebarOpen && "justify-center"}`}
          >
            <LogOut size={16} />
            {isSidebarOpen && <span>Delete Active</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative bg-alabaster-canvas dark:bg-obsidian-canvas">
        
        {/* Top Header Bar */}
        <div className="border-b border-alabaster-border dark:border-obsidian-border bg-alabaster-card dark:bg-obsidian-elevated px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between z-10 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 truncate">
            {/* Mobile Menu Trigger Button */}
            <button
              onClick={() => { setMobileSidebarOpen(true); playAudioChime("click"); }}
              className="md:hidden btn-press p-1.5 rounded-lg border border-alabaster-border dark:border-obsidian-border bg-alabaster-inset dark:bg-white/[0.04] text-alabaster-primary dark:text-obsidian-primary flex items-center justify-center flex-shrink-0"
              title="Open Navigation"
              aria-label="Open Navigation Menu"
            >
              <Menu size={18} />
            </button>
            <span className="font-garamond text-base sm:text-xl font-normal text-alabaster-primary dark:text-obsidian-primary truncate max-w-[140px] sm:max-w-md">
              {currentSessionRecord?.title || "Active Research Session"}
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold bg-alabaster-pill dark:bg-obsidian-cyan/15 text-alabaster-accent dark:text-obsidian-cyan border border-alabaster-pillBorder dark:border-obsidian-cyan/30 px-2 py-0.5 rounded flex-shrink-0">
              <CheckCircle2 size={12} /> Neon PGVector Active
            </span>
            {sessionDocuments.length > 0 && (
              <span className="hidden lg:inline text-xs font-mono text-alabaster-muted dark:text-obsidian-muted">
                ({sessionDocuments.length} doc{sessionDocuments.length > 1 ? "s" : ""})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* All Sessions Link */}
            <Link
              to="/sessions"
              onClick={() => playAudioChime("click")}
              className="btn-press border border-alabaster-border dark:border-obsidian-border bg-alabaster-inset dark:bg-white/[0.04] text-alabaster-secondary dark:text-obsidian-secondary hover:text-alabaster-primary dark:hover:text-obsidian-primary hover:border-alabaster-accent dark:hover:border-obsidian-cyan px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              title="Browse and Switch Study Sessions"
            >
              <Folder size={14} />
              <span className="hidden sm:inline">Sessions</span>
            </Link>

            {/* Quick Ingest Button */}
            <button
              type="button"
              onClick={() => { setUploadModalOpen(true); playAudioChime("click"); }}
              className="btn-press bg-alabaster-accent dark:bg-obsidian-cyan text-white dark:text-obsidian-canvas px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm hover:bg-alabaster-accentHover dark:hover:bg-obsidian-cyanHover"
            >
              <Upload size={14} />
              <span className="hidden sm:inline">+ Ingest Files</span>
              <span className="sm:hidden">+ Ingest</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleCurrentTheme}
              className="btn-press w-8 h-8 rounded-lg border border-alabaster-border dark:border-obsidian-border bg-alabaster-inset dark:bg-white/[0.04] text-alabaster-primary dark:text-obsidian-primary flex items-center justify-center hover:border-alabaster-accent dark:hover:border-obsidian-cyan/50 hover:text-alabaster-accent dark:hover:text-obsidian-cyan transition-colors"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={15} className="text-obsidian-amber" /> : <Moon size={15} className="text-alabaster-accent" />}
            </button>
          </div>
        </div>

        {/* Tab Canvas Area */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 custom-scrollbar">
          <div className="max-w-6xl mx-auto h-full">
            <div className="bg-alabaster-card dark:bg-obsidian-elevated border border-alabaster-border dark:border-obsidian-border rounded-xl shadow-[0_2px_12px_rgba(20,53,39,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] h-full overflow-hidden flex flex-col">
              <div className="flex-1 overflow-auto p-1 custom-scrollbar">
                {visitedTabs.has("summary") && (
                  <div style={{ display: activeTab === "summary" ? "block" : "none" }}>
                    <Summary />
                  </div>
                )}
                {visitedTabs.has("quiz") && (
                  <div style={{ display: activeTab === "quiz" ? "block" : "none" }}>
                    <Quiz />
                  </div>
                )}
                {visitedTabs.has("chat") && (
                  <div style={{ display: activeTab === "chat" ? "block" : "none" }}>
                    <Chat />
                  </div>
                )}
                {visitedTabs.has("sample_paper") && (
                  <div style={{ display: activeTab === "sample_paper" ? "block" : "none" }} className="h-full">
                    <SamplePaper />
                  </div>
                )}
                {visitedTabs.has("teacher") && (
                  <div style={{ display: activeTab === "teacher" ? "block" : "none" }} className="h-full">
                    <Teacher />
                  </div>
                )}
                {visitedTabs.has("image") && (
                  <div style={{ display: activeTab === "image" ? "block" : "none" }} className="h-full">
                    <ImageGenerator sessionId={localStorage.getItem("study_session_id") || ""} />
                  </div>
                )}
                {visitedTabs.has("slides") && (
                  <div style={{ display: activeTab === "slides" ? "block" : "none" }}>
                    <SlidesGenerator sessionId={localStorage.getItem("study_session_id") || ""} />
                  </div>
                )}
                {visitedTabs.has("models") && (
                  <div style={{ display: activeTab === "models" ? "block" : "none" }}>
                    <ModelInfo />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const SidebarItem = ({
  icon,
  label,
  isActive,
  onClick,
  isOpen,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isOpen: boolean;
}) => (
  <button
    onClick={onClick}
    className={`btn-press flex items-center gap-3 w-full p-2.5 rounded-lg transition-all duration-200 text-xs font-mono ${
      isActive
        ? "bg-alabaster-accent dark:bg-obsidian-cyan/15 text-white dark:text-obsidian-cyan border border-alabaster-accent dark:border-obsidian-cyan/30 shadow-sm font-bold"
        : "text-alabaster-secondary dark:text-obsidian-secondary hover:text-alabaster-primary dark:hover:text-obsidian-primary hover:bg-alabaster-inset dark:hover:bg-white/[0.04] border border-transparent"
    } ${!isOpen && "justify-center"}`}
  >
    <div className={isActive ? "text-white dark:text-obsidian-cyan" : "text-alabaster-secondary dark:text-obsidian-secondary"}>
      {icon}
    </div>
    {isOpen && <span>{label}</span>}
  </button>
);

export default Dashboard;
