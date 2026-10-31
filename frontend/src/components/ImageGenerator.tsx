import React, { useState } from "react";
import {
  Image as ImageIcon,
  Loader2,
  Download,
  Sparkles,
  Info,
  Maximize2,
  X,
  Copy,
  Check,
  Lightbulb
} from "lucide-react";
import { generateImage, generateImageFromContext } from "../services/api";
import type { ImageGenerationResult } from "../services/api";
import { playAudioChime } from "../utils/theme";
import toast from "react-hot-toast";

interface ImageGeneratorProps {
  sessionId: string;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ sessionId }) => {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("educational diagram");
  const [mode, setMode] = useState<"topic" | "context">("topic");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImageGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const styleOptions = [
    { value: "educational diagram", label: "Educational Diagram", icon: "📊" },
    { value: "scientific illustration", label: "Scientific Illustration", icon: "🔬" },
    { value: "flowchart", label: "Vector Flowchart", icon: "🔀" },
    { value: "concept map", label: "Concept Map", icon: "🧠" },
    { value: "infographic", label: "Academic Infographic", icon: "📈" },
    { value: "3D visualization", label: "3D Structural Specimen", icon: "🎨" },
  ];

  const suggestedTopics = [
    "Photosynthetic Electron Transport Chain",
    "Transformer Multi-Head Attention Mechanism",
    "DNA Replication Fork & Polymerase Dynamics",
    "TCP Three-Way Handshake Sequence",
    "Krebs Cycle Biochemical Reaction Steps",
    "Von Neumann Computer Architecture"
  ];

  const handleGenerate = async (customTopic?: string) => {
    const queryTopic = (customTopic !== undefined ? customTopic : topic).trim();
    if (!queryTopic) {
      setError("Please specify a concept or architectural subject");
      return;
    }

    if (customTopic) {
      setTopic(customTopic);
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    playAudioChime("click");

    try {
      let response: ImageGenerationResult;

      if (mode === "context") {
        response = await generateImageFromContext(sessionId, queryTopic);
      } else {
        response = await generateImage(sessionId, queryTopic, style);
      }

      setResult(response);
      playAudioChime("success");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to synthesize visual diagram";
      setError(
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || errorMessage,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPrompt = () => {
    if (!result?.generated_prompt) return;
    navigator.clipboard.writeText(result.generated_prompt);
    setCopiedPrompt(true);
    toast.success("Prompt copied to clipboard");
    playAudioChime("click");
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDownload = async () => {
    if (!result?.image_url && !result?.image_data) return;

    try {
      playAudioChime("click");
      let url: string;
      if (result.image_data) {
        const binaryString = window.atob(result.image_data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "image/png" });
        url = window.URL.createObjectURL(blob);
      } else {
        const response = await fetch(result.image_url!);
        const blob = await response.blob();
        url = window.URL.createObjectURL(blob);
      }

      const a = document.createElement("a");
      a.href = url;
      const safeFilename = (topic || "academic-diagram").toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30);
      a.download = `${safeFilename}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download image file");
    }
  };

  const displayImageUrl = result?.image_data
    ? `data:image/png;base64,${result.image_data}`
    : result?.image_url;

  return (
    <div className="flex flex-col bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 font-sans transition-colors p-4 sm:p-6 space-y-6">
      
      {/* Lightbox Modal */}
      {lightboxOpen && displayImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-12 right-0 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs flex items-center gap-1.5 transition-colors"
            >
              <X size={16} /> Close
            </button>
            <img
              src={displayImageUrl}
              alt="Schematic Full View"
              className="max-h-[85vh] max-w-full object-contain rounded-xl border border-white/20 shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Control Panel Card */}
      <div className="border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-emerald-700 dark:text-cyan-400" />
          <span className="font-mono text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold">
            Visual Schematic Synthesis
          </span>
        </div>
        <h2 className="font-garamond text-2xl sm:text-3xl font-normal tracking-tight text-slate-900 dark:text-white">
          Technical Diagrams & Concept Visualizer
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Synthesizes high-resolution academic figures, vector flowcharts, and anatomical schematics to visually anchor abstract theoretical knowledge.
        </p>

        {/* Mode Selector */}
        <div className="flex flex-wrap gap-2.5 mt-5">
          <button
            onClick={() => { setMode("topic"); playAudioChime("click"); }}
            className={`btn-press px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
              mode === "topic"
                ? "bg-emerald-50 dark:bg-cyan-950/40 border-emerald-600 dark:border-cyan-400 text-emerald-800 dark:text-cyan-300 font-bold"
                : "bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400"
            }`}
          >
            Universal Query Mode
          </button>
          <button
            onClick={() => { setMode("context"); playAudioChime("click"); }}
            className={`btn-press px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
              mode === "context"
                ? "bg-emerald-50 dark:bg-cyan-950/40 border-emerald-600 dark:border-cyan-400 text-emerald-800 dark:text-cyan-300 font-bold"
                : "bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400"
            }`}
          >
            Vector Document Context
          </button>
        </div>

        {/* Input & Action */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={
              mode === "topic"
                ? "e.g. 'Photosynthetic Electron Transport Chain'"
                : "Enter theorem or concept from your ingested manuscripts"
            }
            className="sm:col-span-7 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0B0F17] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium focus:outline-none focus:border-emerald-600 dark:focus:border-cyan-400"
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />

          {mode === "topic" && (
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="sm:col-span-3 px-3 py-2.5 rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0B0F17] text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 dark:focus:border-cyan-400 cursor-pointer"
            >
              {styleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => handleGenerate()}
            disabled={isLoading || !topic.trim()}
            className={`${mode === "topic" ? "sm:col-span-2" : "sm:col-span-5"} btn-press py-2.5 bg-emerald-700 dark:bg-cyan-400 text-white dark:text-black font-semibold text-xs rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-800 dark:hover:bg-cyan-300 disabled:opacity-40 transition-colors`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-mono">Synthesizing...</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4" />
                <span>Generate Diagram</span>
              </>
            )}
          </button>
        </div>

        {/* Suggested Concept Chips */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono font-bold mb-2">
            <Lightbulb size={13} className="text-amber-500" />
            <span>Suggested Concept Visualizations:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedTopics.map((sug) => (
              <button
                key={sug}
                onClick={() => handleGenerate(sug)}
                className="btn-press text-[11px] font-mono px-2.5 py-1 rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 hover:border-emerald-600 dark:hover:border-cyan-400 hover:text-emerald-700 dark:hover:text-cyan-300 transition-colors"
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Container */}
      <div className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-lg text-xs font-mono">
            ⚠️ {error}
          </div>
        )}

        {result && (
          <div className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0F17] rounded-xl p-5 shadow-sm space-y-4">
            
            {/* Visual Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <div>
                <span className="font-mono text-xs uppercase text-emerald-700 dark:text-cyan-400 font-bold">
                  Synthesized Diagram
                </span>
                <h3 className="font-garamond text-xl font-normal text-slate-900 dark:text-white">
                  {result.original_topic || result.concept || topic}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="btn-press p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:border-emerald-600 dark:hover:border-cyan-400 transition-colors"
                  title="Expand to Fullscreen"
                >
                  <Maximize2 size={16} />
                </button>
                <button
                  onClick={handleDownload}
                  className="btn-press flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 dark:bg-cyan-400 text-white dark:text-black font-mono text-xs font-semibold shadow-sm hover:bg-emerald-800 dark:hover:bg-cyan-300 transition-colors"
                  title="Download High-Resolution PNG"
                >
                  <Download size={14} />
                  <span>Download PNG</span>
                </button>
              </div>
            </div>

            {/* Image Preview */}
            <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-900/5 dark:bg-black/40 flex items-center justify-center p-3">
              <img
                src={displayImageUrl}
                alt={result.original_topic || result.concept || "Generated diagram"}
                className="w-full max-h-[520px] object-contain rounded-lg shadow-sm cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
              />
            </div>

            {/* Prompt & Metadata Section */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-2 text-xs font-mono">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 flex-1">
                  <Info className="w-4 h-4 text-emerald-700 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-bold uppercase">Synthesized Prompt: </span>
                    <span className="text-slate-700 dark:text-slate-300">{result.generated_prompt}</span>
                  </div>
                </div>
                <button
                  onClick={handleCopyPrompt}
                  className="btn-press p-1.5 rounded border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/[0.06] text-slate-600 dark:text-slate-300 flex-shrink-0"
                  title="Copy Prompt"
                >
                  {copiedPrompt ? <Check size={14} className="text-emerald-600 dark:text-cyan-400" /> : <Copy size={14} />}
                </button>
              </div>
              {result.note && (
                <div className="text-[11px] text-amber-600 dark:text-amber-400 pt-1 border-t border-slate-200 dark:border-white/5">
                  ✦ {result.note}
                </div>
              )}
            </div>
          </div>
        )}

        {!result && !error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-xl bg-slate-50/50 dark:bg-white/[0.01]">
            <div className="w-14 h-14 rounded-full bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 shadow-sm">
              <ImageIcon size={24} />
            </div>
            <h4 className="font-garamond text-2xl font-normal text-slate-900 dark:text-white mb-1">
              Visual Schematic Synthesis Ready
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md font-normal leading-relaxed">
              Enter any academic concept above or pick a suggested topic to generate a high-resolution technical schematic, flowchart, or scientific concept map.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ImageGenerator;
