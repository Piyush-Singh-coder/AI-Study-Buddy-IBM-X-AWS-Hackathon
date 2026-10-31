import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Crown, Check, Sparkles, Loader2, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AuthModal from "../components/AuthModal";
import { playAudioChime } from "../utils/theme";

const PricingPage = () => {
  const { user, upgradeToPro } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [upgrading, setUpgrading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const features = {
    free: [
      "AI Chat with Ingested Documents",
      "3072-Dimensional Vector Memories",
      "Executive Summaries & Glossaries",
      "Adaptive Active-Recall Quizzes",
      "Lecture Slides Generator (.pptx)",
      "Upload PDFs, DOCX, TXT & Audio",
    ],
    pro: [
      "Socratic Voice Tutor & Feynman Dialogues",
      "2K Technical Schematic Generation",
      "Previous Year Question (PYQ) Sample Papers",
      "Zero-Latency Priority Vector Inference",
      "Multi-Manuscript Cross-Document Synthesis",
      "All Features Included in Free Tier",
    ],
  };

  const handleDemoUpgrade = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setUpgrading(true);
    playAudioChime("click");
    try {
      upgradeToPro();
      playAudioChime("success");
      navigate("/dashboard");
    } catch (error) {
      console.error("Upgrade failed:", error);
    } finally {
      setUpgrading(false);
    }
  };

  const currentPlan = user?.plan || "free";

  return (
    <div className="min-h-screen bg-alabaster-canvas dark:bg-obsidian-canvas text-alabaster-primary dark:text-obsidian-primary font-sans transition-colors duration-200">
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Header */}
      <header className="border-b border-alabaster-border dark:border-obsidian-border bg-alabaster-card/80 dark:bg-obsidian-elevated/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            onClick={() => playAudioChime("click")}
            className="flex items-center gap-2 text-xs font-mono font-semibold text-alabaster-secondary dark:text-obsidian-secondary hover:text-alabaster-primary dark:hover:text-obsidian-primary transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Return to Academic Home</span>
          </Link>
          <div className="flex items-center gap-3">
            {currentPlan === "pro" && (
              <div className="bg-alabaster-pill dark:bg-obsidian-mint/15 text-alabaster-accent dark:text-obsidian-mint border border-alabaster-pillBorder dark:border-obsidian-mint/30 px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase">
                ✓ Pro Scholar Active
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="btn-press w-8 h-8 rounded-lg border border-alabaster-border dark:border-obsidian-border bg-alabaster-inset dark:bg-white/[0.04] text-alabaster-primary dark:text-obsidian-primary flex items-center justify-center hover:border-alabaster-accent dark:hover:border-obsidian-cyan/50 transition-colors"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={15} className="text-obsidian-amber" /> : <Moon size={15} className="text-alabaster-accent" />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-14 px-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-alabaster-pill dark:bg-obsidian-cyan/10 border border-alabaster-pillBorder dark:border-obsidian-cyan/30 px-3.5 py-1 rounded-full mb-5 shadow-sm">
          <Sparkles size={14} className="text-alabaster-accent dark:text-obsidian-cyan" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-alabaster-accent dark:text-obsidian-cyan">
            Scholarly Tier Selection
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-garamond font-normal tracking-tight text-alabaster-primary dark:text-obsidian-primary mb-3">
          Transparent, Enduring Value
        </h1>
        <p className="text-sm sm:text-base text-alabaster-secondary dark:text-obsidian-secondary max-w-xl mx-auto leading-relaxed">
          Zero-cost free tier powered by Google Gemini 2.5 Flash and NVIDIA NIM. Upgrade for advanced voice tutoring and unlimited visual synthesis.
        </p>
      </section>

      {/* Feature Comparison */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <div
            className={`bg-alabaster-card dark:bg-white/[0.025] border rounded-xl p-8 shadow-sm flex flex-col justify-between transition-all ${
              currentPlan === "free"
                ? "border-alabaster-accent dark:border-obsidian-cyan ring-1 ring-alabaster-accent dark:ring-obsidian-cyan"
                : "border-alabaster-border dark:border-obsidian-border"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-garamond font-normal text-alabaster-primary dark:text-obsidian-primary">Scholar Free</h3>
                <span className="font-mono text-[11px] uppercase font-bold text-alabaster-muted dark:text-obsidian-muted px-2 py-0.5 rounded bg-alabaster-inset dark:bg-white/[0.04]">
                  Default
                </span>
              </div>
              <p className="text-xs text-alabaster-secondary dark:text-obsidian-secondary mb-6 font-normal">
                Complete access to multi-modal RAG and active-recall testing.
              </p>
              <div className="text-4xl font-garamond text-alabaster-primary dark:text-obsidian-primary mb-6">
                \$0 <span className="text-xs font-mono text-alabaster-muted dark:text-obsidian-muted">/ forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                {features.free.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-alabaster-primary dark:text-obsidian-primary">
                    <Check size={16} className="text-emerald-600 dark:text-obsidian-mint flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            {currentPlan === "free" && (
              <div className="text-center py-2.5 bg-alabaster-inset dark:bg-white/[0.04] border border-alabaster-border dark:border-obsidian-border rounded-lg text-xs font-mono font-bold text-alabaster-primary dark:text-obsidian-primary">
                ✓ Currently Active Plan
              </div>
            )}
          </div>

          {/* Pro Plan */}
          <div
            className={`bg-alabaster-primary dark:bg-obsidian-elevated text-alabaster-canvas dark:text-obsidian-primary border rounded-xl p-8 shadow-md relative flex flex-col justify-between ${
              currentPlan === "pro"
                ? "border-obsidian-cyan ring-1 ring-obsidian-cyan"
                : "border-alabaster-primary/40 dark:border-obsidian-border"
            }`}
          >
            <div className="absolute -top-3 -right-3 bg-obsidian-amber text-slate-950 px-3 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider shadow-sm">
              Socratic Pro
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown size={20} className="text-obsidian-amber" />
                <h3 className="text-2xl font-garamond font-normal text-white">Fellowship Edition</h3>
              </div>
              <p className="text-xs text-white/70 dark:text-obsidian-secondary mb-6 font-normal">
                For researchers, postdocs, and intensive scientific inquiry.
              </p>
              <div className="text-4xl font-garamond text-white mb-6">
                \$9 <span className="text-xs font-mono text-white/60">/ month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {features.pro.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-white/90 dark:text-obsidian-primary">
                    <Check size={16} className="text-obsidian-mint flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {user ? (
              currentPlan === "pro" ? (
                <div className="text-center py-2.5 bg-white/10 border border-white/20 rounded-lg text-xs font-mono font-bold text-white">
                  ✓ Active Pro Fellowship
                </div>
              ) : (
                <button
                  onClick={handleDemoUpgrade}
                  disabled={upgrading}
                  className="btn-press w-full py-3 bg-alabaster-canvas dark:bg-obsidian-cyan text-alabaster-primary dark:text-obsidian-canvas font-semibold text-xs rounded-lg shadow-sm hover:bg-white dark:hover:bg-obsidian-cyanHover disabled:opacity-50"
                >
                  {upgrading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      Synthesizing Pro Fellowship...
                    </span>
                  ) : (
                    "Upgrade to Pro Fellowship (Demo) →"
                  )}
                </button>
              )
            ) : (
              <button
                onClick={() => { setAuthModalOpen(true); playAudioChime("click"); }}
                className="btn-press w-full py-3 bg-alabaster-canvas dark:bg-obsidian-cyan text-alabaster-primary dark:text-obsidian-canvas font-semibold text-xs rounded-lg shadow-sm hover:bg-white"
              >
                Sign In to Upgrade →
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Colophon */}
      <section className="pb-12 px-6 text-center">
        <p className="text-xs font-mono text-alabaster-muted dark:text-obsidian-muted">
          * AI Study Buddy demo environment. Pro tier features can be activated freely during presentation preview.
        </p>
      </section>
    </div>
  );
};

export default PricingPage;
