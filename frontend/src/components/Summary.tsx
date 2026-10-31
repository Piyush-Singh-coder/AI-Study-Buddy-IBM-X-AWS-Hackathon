import { useState } from "react";
import {
  FileText,
  Zap,
  BookOpen,
  AlertCircle,
  Copy,
  Check,
  Download,
  Sparkles,
  Clock,
  Bookmark
} from "lucide-react";
import { generateSummary } from "../services/api";
import { playAudioChime } from "../utils/theme";
import toast from "react-hot-toast";
import MarkdownRenderer from "./MarkdownRenderer";

const Summary = () => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeType, setActiveType] = useState<"brief" | "detailed">("brief");

  const handleGenerate = async (type: "brief" | "detailed") => {
    const sessionId = localStorage.getItem("study_session_id");
    if (!sessionId) {
      setError("No active study session detected. Please ingest documents first.");
      return;
    }

    setActiveType(type);
    setLoading(true);
    setError("");
    playAudioChime("click");

    try {
      const data = await generateSummary(sessionId, type);
      setSummary(data.summary);
      playAudioChime("success");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to generate summary from vector store.");
      setSummary("");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    playAudioChime("click");
    toast.success("Summary notes copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!summary) return;
    playAudioChime("click");
    const blob = new Blob([summary], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Study_Buddy_Summary_${activeType}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Markdown file downloaded");
  };

  const wordCount = summary ? summary.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="h-full flex flex-col space-y-5 p-4 sm:p-6 font-sans text-slate-900 dark:text-slate-100">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-700 dark:text-cyan-400" />
            <span className="font-mono text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold">
              Cognitive Synthesis Engine
            </span>
          </div>
          <h2 className="font-garamond text-2xl sm:text-3xl font-normal text-slate-900 dark:text-white">
            Hierarchical Summaries & Notes
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Extracts executive thesis statements and comprehensive conceptual taxonomies from PGVector chunks.
          </p>
        </div>

        {/* Action Trigger Pills */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => handleGenerate("brief")}
            disabled={loading}
            className={`btn-press flex-1 sm:flex-initial px-4 py-2.5 rounded-lg border text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all ${
              activeType === "brief" && summary
                ? "bg-emerald-800 dark:bg-cyan-500 text-white dark:text-slate-950 border-emerald-800 dark:border-cyan-500 font-bold"
                : "bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:border-emerald-600 dark:hover:border-cyan-400"
            }`}
          >
            <Zap size={14} className={activeType === "brief" && summary ? "text-amber-300" : "text-emerald-700 dark:text-cyan-400"} />
            <span>Executive Brief</span>
          </button>

          <button
            onClick={() => handleGenerate("detailed")}
            disabled={loading}
            className={`btn-press flex-1 sm:flex-initial px-4 py-2.5 rounded-lg border text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all ${
              activeType === "detailed" && summary
                ? "bg-emerald-800 dark:bg-cyan-500 text-white dark:text-slate-950 border-emerald-800 dark:border-cyan-500 font-bold"
                : "bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:border-emerald-600 dark:hover:border-cyan-400"
            }`}
          >
            <BookOpen size={14} className={activeType === "detailed" && summary ? "text-amber-300" : "text-emerald-700 dark:text-cyan-400"} />
            <span>Chapter Taxonomy</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-start gap-3 text-xs font-mono">
          <AlertCircle className="flex-shrink-0 mt-0.5" size={16} />
          <p>{error}</p>
        </div>
      )}

      {/* Main Reading Canvas */}
      <div className="flex-1 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/10 rounded-xl p-6 sm:p-8 overflow-y-auto relative custom-scrollbar flex flex-col justify-between shadow-sm min-h-[420px]">
        {loading ? (
          <div className="space-y-6 py-6 animate-pulse">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-16"></div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="h-6 bg-slate-200 dark:bg-white/10 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-full"></div>
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-5/6"></div>
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-full"></div>
            </div>
            <div className="space-y-3 pt-4">
              <div className="h-5 bg-slate-200 dark:bg-white/10 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-full"></div>
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-4/5"></div>
            </div>
            <div className="flex items-center justify-center pt-8">
              <span className="font-mono text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 animate-bounce">
                ✦ Synthesizing Dense 3072-Dimensional Vector Contexts...
              </span>
            </div>
          </div>
        ) : summary ? (
          <div>
            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4 mb-6 text-xs font-mono text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 font-bold uppercase text-slate-800 dark:text-slate-200">
                  <Bookmark size={13} className="text-emerald-700 dark:text-cyan-400" />
                  {activeType === "brief" ? "Executive Synthesis" : "Chapter Taxonomy"}
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Clock size={13} />
                  {readingTime} min read • {wordCount} words
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-xs font-mono text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-xs font-mono text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  <Download size={14} />
                  <span>Download .md</span>
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="font-garamond text-lg sm:text-xl text-slate-900 dark:text-slate-100 leading-relaxed selection:bg-emerald-100 dark:selection:bg-cyan-900/40">
              <MarkdownRenderer content={summary} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-4 shadow-sm">
              <FileText size={28} />
            </div>
            <h4 className="font-garamond text-2xl font-normal text-slate-900 dark:text-white mb-1.5">
              No Document Summary Formulated Yet
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md font-normal leading-relaxed mb-6">
              Select <strong>Executive Brief</strong> for high-yield thesis takeaways, or <strong>Chapter Taxonomy</strong> for detailed section breakdowns.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleGenerate("brief")}
                className="btn-press bg-emerald-800 dark:bg-cyan-500 text-white dark:text-slate-950 px-5 py-2.5 rounded-lg text-xs font-mono font-semibold shadow-sm hover:bg-emerald-900 dark:hover:bg-cyan-400"
              >
                Synthesize Executive Brief →
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Summary;
