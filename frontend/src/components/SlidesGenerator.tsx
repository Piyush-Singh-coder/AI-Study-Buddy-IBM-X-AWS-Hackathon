import React, { useState } from "react";
import {
  Loader2,
  CheckCircle2,
  Sparkles,
  Presentation,
  Palette,
  Layers,
  FileCheck
} from "lucide-react";
import { generateSlides } from "../services/api";
import { playAudioChime } from "../utils/theme";

interface SlidesGeneratorProps {
  sessionId: string;
}

const SlidesGenerator: React.FC<SlidesGeneratorProps> = ({ sessionId }) => {
  const [topic, setTopic] = useState("");
  const [numSlides, setNumSlides] = useState(5);
  const [styleTheme, setStyleTheme] = useState<"oxford" | "obsidian" | "clean">("oxford");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestedTopics = [
    "Core Thesis & Theoretical Framework",
    "Experimental Methodology & Results",
    "Literature Review & Related Works",
    "Key Conclusions & Research Impact"
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please specify a presentation topic");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    playAudioChime("click");

    try {
      const blob = await generateSlides(sessionId, topic.trim(), numSlides);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${topic.trim().replace(/\s+/g, "_")}_Presentation.pptx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      playAudioChime("success");
      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to synthesize slide deck.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 font-sans p-4 sm:p-6 space-y-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm transition-colors">
      
      {/* Header */}
      <div className="border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-emerald-700 dark:text-cyan-400" />
          <span className="font-mono text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold">
            Executive Presentation Synthesizer
          </span>
        </div>
        <h2 className="font-garamond text-3xl font-normal tracking-tight text-slate-900 dark:text-white">
          Academic Slides & Lecture Deck Creator
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Transforms ingested manuscripts, book chapters, and research data into clean, structured PowerPoint (.pptx) presentations with speaker notes and conceptual breakdowns.
        </p>
      </div>

      {/* Main Configuration Card */}
      <div className="max-w-3xl mx-auto w-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Presentation Topic */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Presentation Subject / Chapter Focus
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. 'Quantum Neural Networks', 'Modernist Architecture'"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:border-emerald-600 dark:focus:border-cyan-400"
          />
          
          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            <span className="text-[11px] font-mono text-slate-500 self-center mr-1">Suggestions:</span>
            {suggestedTopics.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { setTopic(s); playAudioChime("click"); }}
                className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-emerald-600 dark:hover:border-cyan-400"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Deck Style & Length */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Palette size={14} className="text-emerald-700 dark:text-cyan-400" />
              <span>Deck Typographic Theme</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "oxford", name: "Oxford", desc: "Editorial Serif" },
                { id: "obsidian", name: "Obsidian", desc: "Dark Tech" },
                { id: "clean", name: "Modern", desc: "Minimalist" },
              ].map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => { setStyleTheme(th.id as any); playAudioChime("click"); }}
                  className={`btn-press p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    styleTheme === th.id
                      ? "bg-emerald-50 dark:bg-cyan-950/40 border-emerald-700 dark:border-cyan-400 text-emerald-950 dark:text-cyan-300 shadow-sm"
                      : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span className="font-mono text-xs font-bold">{th.name}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{th.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Layers size={14} className="text-emerald-700 dark:text-cyan-400" />
              <span>Slide Deck Depth</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => { setNumSlides(num); playAudioChime("click"); }}
                  className={`btn-press py-2.5 px-3 rounded-lg border text-xs font-mono font-semibold transition-all ${
                    numSlides === num
                      ? "bg-emerald-50 dark:bg-cyan-950/40 border-emerald-700 dark:border-cyan-400 text-emerald-950 dark:text-cyan-300 font-bold shadow-sm"
                      : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {num} Slides
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-lg text-xs font-mono">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 p-4 rounded-lg text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>PowerPoint (.pptx) synthesized and downloaded successfully.</span>
            </div>
            <FileCheck size={16} className="text-emerald-600" />
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isLoading || !topic.trim()}
          className="btn-press w-full py-3.5 bg-emerald-800 dark:bg-cyan-500 text-white dark:text-slate-950 font-semibold text-xs rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-900 dark:hover:bg-cyan-400 disabled:opacity-40 transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              <span className="font-mono text-xs">Synthesizing {numSlides} Slides with Gemini & python-pptx...</span>
            </>
          ) : (
            <>
              <Presentation size={16} />
              <span>Generate & Download Slide Deck (.pptx) →</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default SlidesGenerator;
