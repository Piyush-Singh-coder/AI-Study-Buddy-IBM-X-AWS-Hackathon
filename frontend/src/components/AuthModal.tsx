import React, { useState } from "react";
import { X, Lock, Mail, Loader2, UserPlus, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

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
      onClose();
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || "Authentication failed. Please check your details.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
      <div className="bg-white border-4 border-black shadow-neo-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-neo-red hover:text-white border-2 border-black transition-all"
        >
          <X size={20} />
        </button>

        {/* Tab Headers */}
        <div className="flex border-b-4 border-black mb-6">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 py-3 font-black text-center uppercase tracking-wider flex items-center justify-center gap-2 border-r-2 border-black ${
              mode === "login" ? "bg-neo-blue text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <LogIn size={18} />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(""); }}
            className={`flex-1 py-3 font-black text-center uppercase tracking-wider flex items-center justify-center gap-2 ${
              mode === "register" ? "bg-neo-green text-black" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <UserPlus size={18} />
            Register
          </button>
        </div>

        <h2 className="text-2xl font-black uppercase mb-4">
          {mode === "login" ? "Welcome Back!" : "Create Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-black" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full pl-10 pr-4 py-2.5 border-2 border-black font-bold focus:shadow-neo outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-black" size={18} />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border-2 border-black font-bold focus:shadow-neo outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="bg-neo-red text-white p-3 border-2 border-black font-bold text-xs shadow-neo-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 text-black font-black uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm transition-all ${
              mode === "login" ? "bg-neo-yellow" : "bg-neo-green"
            } disabled:opacity-50`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Processing...</span>
              </>
            ) : (
              <span>{mode === "login" ? "SIGN IN →" : "REGISTER NOW →"}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
