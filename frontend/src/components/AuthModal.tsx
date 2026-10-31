import React, { useState } from "react";
import { X, Lock, Mail, Loader2, UserPlus, LogIn, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { playAudioChime } from "../utils/theme";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = "login" }) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError("");

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, initialMode, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
      playAudioChime("success");
      onClose();
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || "Authentication failed. Please check your credentials.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 modal-backdrop-smooth flex items-center justify-center z-[100] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playAudioChime("click");
          onClose();
        }
      }}
    >
      {/* Modal Window: Explicit solid background for both Light and Dark mode with smooth entrance */}
      <div className="modal-card-smooth bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative text-slate-900 dark:text-slate-100 transition-colors">
        
        {/* Header Action Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-slate-900 dark:bg-white/[0.08] text-white dark:text-cyan-400 flex items-center justify-center font-garamond text-base font-bold border border-slate-700 dark:border-cyan-500/30">
              F
            </div>
            <span className="font-mono text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold">
              AI Study Buddy • Cognitive Scholar
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Theme Toggle within Modal */}
            <button
              type="button"
              onClick={toggleTheme}
              className="btn-press w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
              title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {theme === "dark" ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-700" />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => { playAudioChime("click"); onClose(); }}
              className="btn-press w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 dark:bg-white/[0.05] p-1 rounded-xl border border-slate-200 dark:border-white/10 mb-6">
          <button
            type="button"
            onClick={() => { playAudioChime("click"); setMode("login"); setError(""); }}
            className={`btn-press flex-1 py-2 text-xs font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-2 rounded-lg transition-all ${
              mode === "login"
                ? "bg-white dark:bg-cyan-950/60 text-slate-900 dark:text-cyan-300 border border-slate-300 dark:border-cyan-500/40 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <LogIn size={14} />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { playAudioChime("click"); setMode("register"); setError(""); }}
            className={`btn-press flex-1 py-2 text-xs font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-2 rounded-lg transition-all ${
              mode === "register"
                ? "bg-white dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-300 border border-slate-300 dark:border-emerald-500/40 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <UserPlus size={14} />
            Register
          </button>
        </div>

        {/* Heading */}
        <h2 className="font-garamond text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">
          {mode === "login" ? "Access Academic Library" : "Create Research Scholar Account"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 font-normal">
          {mode === "login"
            ? "Enter your credentials to access saved document vectors and active study sessions."
            : "Free access to 3072-dimensional PGVector index and Gemini 2.5 Flash tutor."}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-slate-500 dark:text-slate-400" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="scholar@university.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-medium focus:outline-none focus:border-slate-800 dark:focus:border-cyan-400 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-slate-500 dark:text-slate-400" size={16} />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-medium focus:outline-none focus:border-slate-800 dark:focus:border-cyan-400 focus:bg-white transition-colors"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
              PBKDF2-HMAC-SHA256 salted encryption
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs font-mono font-semibold">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`btn-press w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
              mode === "login"
                ? "bg-slate-900 hover:bg-black text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-black shadow-slate-900/20"
                : "bg-emerald-700 hover:bg-emerald-800 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-black shadow-emerald-700/20"
            } disabled:opacity-50`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span className="font-mono">Authorizing...</span>
              </>
            ) : (
              <span>{mode === "login" ? "Enter Academic Portal →" : "Create Research Account →"}</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 text-center text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
          <span>✦ Zero Data Retention • Free Tier Architecture</span>
        </div>

      </div>
    </div>
  );
};

export default AuthModal;
