import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Folder,
  FolderPlus,
  Plus,
  Search,
  Calendar,
  FileText,
  Check,
  X,
  Edit2,
  Trash2,
  ArrowRight,
  Upload,
  Layers,
  CheckCircle2,
  Sun,
  Moon,
  ArrowLeft,
  Loader2,
  Clock
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AuthModal from "../components/AuthModal";
import UploadModal from "../components/UploadModal";
import {
  getSessionHistory,
  createSession,
  updateSessionTitle,
  deleteSession
} from "../services/api";
import type { SessionItem } from "../services/api";
import { playAudioChime } from "../utils/theme";

const SessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoaded } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    localStorage.getItem("study_session_id")
  );

  // Rename Inline State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTargetSession, setUploadTargetSession] = useState<SessionItem | null>(null);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Delete Confirmation State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchSessions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getSessionHistory();
      setSessions(data || []);
      // Auto-sync active session id if none is set
      const currentStored = localStorage.getItem("study_session_id");
      if (!currentStored && data && data.length > 0) {
        localStorage.setItem("study_session_id", data[0].id);
        setActiveSessionId(data[0].id);
      } else {
        setActiveSessionId(currentStored);
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
      toast.error("Could not fetch study sessions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchSessions();
    } else if (isLoaded && !user) {
      setLoading(false);
    }
  }, [isLoaded, user]);

  const handleSelectSession = (session: SessionItem) => {
    localStorage.setItem("study_session_id", session.id);
    setActiveSessionId(session.id);
    playAudioChime("click");
    toast.success(`Switched to "${session.title}"`);
    navigate("/dashboard");
  };

  const handleStartCreate = () => {
    setNewSessionTitle("");
    setIsCreateOpen(true);
    playAudioChime("click");
  };

  const handleConfirmCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const title = newSessionTitle.trim() || "Untitled Study Session";
    setIsCreating(true);
    try {
      const newId = await createSession(title);
      playAudioChime("success");
      toast.success(`Created "${title}"`);
      setIsCreateOpen(false);
      setNewSessionTitle("");
      localStorage.setItem("study_session_id", typeof newId === "string" ? newId : newId.session_id);
      setActiveSessionId(typeof newId === "string" ? newId : newId.session_id);
      await fetchSessions();
    } catch (err: any) {
      console.error("Failed to create session:", err);
      toast.error(err.message || "Failed to create session.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartEdit = (session: SessionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleCancelEdit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(null);
    setEditTitle("");
  };

  const handleSaveEdit = async (sessionId: string, e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    if (e && 'preventDefault' in e) e.preventDefault();

    const cleanTitle = editTitle.trim();
    if (!cleanTitle) {
      toast.error("Title cannot be empty");
      return;
    }

    setIsSavingEdit(true);
    try {
      await updateSessionTitle(sessionId, cleanTitle);
      playAudioChime("click");
      toast.success("Session renamed");
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title: cleanTitle } : s))
      );
      setEditingId(null);
      setEditTitle("");
    } catch (err) {
      console.error("Failed to rename session:", err);
      toast.error("Could not update session title.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteSession(sessionId);
      playAudioChime("click");
      toast.success(`Deleted "${title}"`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setConfirmDeleteId(null);

      if (activeSessionId === sessionId) {
        const remaining = sessions.filter((s) => s.id !== sessionId);
        if (remaining.length > 0) {
          localStorage.setItem("study_session_id", remaining[0].id);
          setActiveSessionId(remaining[0].id);
        } else {
          localStorage.removeItem("study_session_id");
          setActiveSessionId(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
      toast.error("Failed to delete session.");
    }
  };

  const handleOpenUploadForSession = (session: SessionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem("study_session_id", session.id);
    setActiveSessionId(session.id);
    setUploadTargetSession(session);
    setUploadModalOpen(true);
    playAudioChime("click");
  };

  // Filtered Sessions
  const filteredSessions = sessions.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const matchTitle = (s.title || "").toLowerCase().includes(q);
    const matchDocs = (s.documents || []).some((doc) => doc.toLowerCase().includes(q));
    return matchTitle || matchDocs;
  });

  const totalDocuments = sessions.reduce((acc, s) => acc + (s.document_count || s.documents?.length || 0), 0);

  // Date formatting helper
  const formatDate = (isoStr?: string) => {
    if (!isoStr) return "Just now";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoStr;
    }
  };

  const formatTime = (isoStr?: string) => {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#050506] flex items-center justify-center p-6 text-slate-900 dark:text-slate-100 font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700 dark:text-cyan-400" />
          <p className="font-mono text-xs uppercase tracking-wider text-slate-500">Loading Sessions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#050506] flex items-center justify-center p-6 font-sans">
        <Toaster position="top-right" />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => {
            setAuthModalOpen(false);
            fetchSessions();
          }}
          initialMode={authMode}
        />
        <div className="bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/10 p-8 md:p-12 rounded-2xl shadow-xl max-w-lg w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-cyan-500/10 text-emerald-700 dark:text-cyan-400 mx-auto flex items-center justify-center border border-emerald-200 dark:border-cyan-500/30">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-serif text-3xl font-semibold text-slate-900 dark:text-white">
              Study Sessions Workspace
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Sign in to browse, organize, select, and manage your vector study sessions and indexed academic corpora.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                setAuthMode("login");
                setAuthModalOpen(true);
                playAudioChime("click");
              }}
              className="btn-press w-full py-3 bg-emerald-700 dark:bg-cyan-400 text-white dark:text-black font-semibold text-sm rounded-xl shadow-md hover:bg-emerald-800 dark:hover:bg-cyan-300 transition-colors"
            >
              Sign In to View Sessions
            </button>
            <button
              onClick={() => {
                setAuthMode("register");
                setAuthModalOpen(true);
                playAudioChime("click");
              }}
              className="btn-press w-full py-3 bg-transparent border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#050506] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Toaster position="top-right" />

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setUploadTargetSession(null);
        }}
        existingDocNames={uploadTargetSession?.documents || []}
        onUploadSuccess={async () => {
          await fetchSessions();
          navigate("/dashboard");
        }}
      />

      {/* Create New Session Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-cyan-500/15 text-emerald-700 dark:text-cyan-400 flex items-center justify-center">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">New Study Session</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Initialize a fresh vector space</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmCreate} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">
                  Session Title
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="e.g. Cognitive Neurobiology Exam Prep"
                  value={newSessionTitle}
                  onChange={(e) => setNewSessionTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#070A10] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:focus:ring-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newSessionTitle.trim()}
                  className="btn-press px-4 py-2 bg-emerald-700 dark:bg-cyan-400 text-white dark:text-black text-xs font-semibold rounded-xl flex items-center gap-2 hover:bg-emerald-800 dark:hover:bg-cyan-300 disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      <span>Create Session</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B0F17]/95 border-b border-slate-200 dark:border-white/10 px-4 sm:px-8 py-3.5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Breadcrumb */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              onClick={() => playAudioChime("click")}
              className="btn-press flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-cyan-400 hover:border-emerald-600/40 dark:hover:border-cyan-400/40"
              title="Return to Dashboard"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <div className="h-5 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 dark:bg-cyan-400 text-white dark:text-black flex items-center justify-center font-bold text-sm shadow-sm font-mono">
                S
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                  Study Sessions
                  <span className="hidden md:inline-flex items-center text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-cyan-500/10 text-emerald-700 dark:text-cyan-400 border border-emerald-200 dark:border-cyan-500/20">
                    Neon PGVector
                  </span>
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  Select, rename, and manage your vector corpora
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleStartCreate}
              className="btn-press bg-emerald-700 dark:bg-cyan-400 text-white dark:text-black px-3 sm:px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm hover:bg-emerald-800 dark:hover:bg-cyan-300"
            >
              <Plus size={15} />
              <span>New Session</span>
            </button>

            <button
              onClick={() => {
                setUploadTargetSession(null);
                setUploadModalOpen(true);
                playAudioChime("click");
              }}
              className="btn-press hidden sm:flex border border-slate-300 dark:border-white/15 bg-white dark:bg-white/[0.04] text-slate-800 dark:text-slate-200 px-3.5 py-2 text-xs font-semibold rounded-xl items-center gap-1.5 hover:border-emerald-600 dark:hover:border-cyan-400"
            >
              <Upload size={14} />
              <span>Ingest Materials</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn-press w-9 h-9 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 flex items-center justify-center hover:text-emerald-700 dark:hover:text-cyan-400"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-emerald-700" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Workspace Summary Bar & Search */}
        <div className="bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Quick Metrics */}
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-cyan-400 animate-pulse" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">Total Sessions:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{sessions.length}</span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-slate-400" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">Ingested Documents:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{totalDocuments}</span>
            </div>
            {activeSessionId && (
              <>
                <div className="h-4 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />
                <div className="hidden sm:flex items-center gap-1.5 text-emerald-700 dark:text-cyan-400 font-medium">
                  <CheckCircle2 size={13} />
                  <span>1 Active in Memory</span>
                </div>
              </>
            )}
          </div>

          {/* Search Filter Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search sessions or documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#070A10] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:focus:ring-cyan-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

        </div>

        {/* Sessions Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/10 rounded-2xl p-6 h-56 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-5 bg-slate-200 dark:bg-white/10 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-100 dark:bg-white/5 rounded-md w-1/2" />
                </div>
                <div className="h-9 bg-slate-100 dark:bg-white/5 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/10 rounded-2xl p-10 sm:p-14 text-center max-w-xl mx-auto space-y-5 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.04] text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center border border-slate-200 dark:border-white/10">
              <Folder className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-semibold text-slate-900 dark:text-white">
                {searchQuery ? "No Matching Sessions" : "No Study Sessions Yet"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {searchQuery
                  ? `No study session found matching "${searchQuery}". Clear your search or create a new session.`
                  : "Create your first dedicated study session to isolate lecture notes, chapters, or research papers in Neon PGVector."}
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="btn-press px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  onClick={handleStartCreate}
                  className="btn-press bg-emerald-700 dark:bg-cyan-400 text-white dark:text-black px-5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm hover:bg-emerald-800 dark:hover:bg-cyan-300"
                >
                  <Plus size={15} />
                  <span>Create First Session</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSessions.map((session) => {
              const isActive = activeSessionId === session.id;
              const isEditing = editingId === session.id;
              const docs = session.documents || [];
              const docCount = session.document_count || docs.length;

              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session)}
                  className={`group relative bg-white dark:bg-[#0B0F17] rounded-2xl border transition-all duration-150 p-5 sm:p-6 flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-md ${
                    isActive
                      ? "border-emerald-600 dark:border-cyan-400 ring-2 ring-emerald-600/10 dark:ring-cyan-400/10"
                      : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                  }`}
                >
                  {/* Top Bar inside Card */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      
                      {/* Active Indicator or Folder Icon */}
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                            isActive
                              ? "bg-emerald-700 dark:bg-cyan-400 text-white dark:text-black font-bold"
                              : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-cyan-500/10 group-hover:text-emerald-700 dark:group-hover:text-cyan-400"
                          }`}
                        >
                          <Folder size={18} />
                        </div>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-cyan-400/15 text-emerald-800 dark:text-cyan-300 border border-emerald-300 dark:border-cyan-400/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-cyan-400 animate-pulse" />
                            Active
                          </span>
                        )}
                      </div>

                      {/* Header Actions: Rename & Delete */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleStartEdit(session, e)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                          title="Rename Session"
                        >
                          <Edit2 size={13} />
                        </button>

                        {confirmDeleteId === session.id ? (
                          <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-1 rounded-lg">
                            <button
                              onClick={(e) => handleDeleteSession(session.id, session.title, e)}
                              className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded"
                              title="Confirm Delete"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(null);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              title="Cancel"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(session.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Delete Session"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Session Title or Inline Edit */}
                    <div>
                      {isEditing ? (
                        <div
                          className="flex items-center gap-1.5 pt-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            autoFocus
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit(session.id, e);
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                            className="flex-1 px-2.5 py-1 text-sm font-semibold rounded-lg border border-emerald-600 dark:border-cyan-400 bg-white dark:bg-[#070A10] text-slate-900 dark:text-white focus:outline-none"
                          />
                          <button
                            disabled={isSavingEdit}
                            onClick={(e) => handleSaveEdit(session.id, e)}
                            className="p-1.5 bg-emerald-700 dark:bg-cyan-400 text-white dark:text-black rounded-lg hover:opacity-90"
                            title="Save Title"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <h3 className="font-serif text-lg font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-700 dark:group-hover:text-cyan-400 transition-colors">
                          {session.title || "Study Session"}
                        </h3>
                      )}

                      {/* Timestamps */}
                      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(session.created_at)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatTime(session.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Documents List / Badges */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider">
                          Corpus Materials ({docCount})
                        </span>
                        <button
                          onClick={(e) => handleOpenUploadForSession(session, e)}
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-cyan-400 font-semibold hover:underline"
                        >
                          <Plus size={12} /> Add
                        </button>
                      </div>

                      {docs.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-h-16 overflow-hidden">
                          {docs.slice(0, 3).map((doc, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-700 dark:text-slate-300 max-w-[200px] truncate"
                              title={doc}
                            >
                              <FileText size={10} className="text-slate-400 flex-shrink-0" />
                              <span className="truncate">{doc}</span>
                            </span>
                          ))}
                          {docs.length > 3 && (
                            <span className="text-[10px] font-mono text-slate-400 px-1 py-0.5">
                              +{docs.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-[11px] italic text-slate-400 dark:text-slate-500 font-mono py-1">
                          No files uploaded yet. Ready for ingest.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-5 border-t border-slate-100 dark:border-white/5 mt-4 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-slate-400 truncate max-w-[140px]">
                      ID: {session.id.slice(0, 8)}...
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSession(session);
                      }}
                      className={`btn-press px-3.5 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors ${
                        isActive
                          ? "bg-emerald-700 dark:bg-cyan-400 text-white dark:text-black shadow-sm"
                          : "bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-200 hover:bg-emerald-700 hover:text-white dark:hover:bg-cyan-400 dark:hover:text-black"
                      }`}
                    >
                      <span>{isActive ? "Active in Dashboard" : "Select Session"}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default SessionsPage;
