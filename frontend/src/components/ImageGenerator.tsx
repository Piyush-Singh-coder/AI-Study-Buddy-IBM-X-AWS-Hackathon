import React, { useState } from "react";
import {
  Image,
  Loader2,
  Download,
  Sparkles,
  BookOpen,
  AlertCircle,
  Info,
} from "lucide-react";
import { generateImage, generateImageFromContext } from "../services/api";
import type { ImageGenerationResult } from "../services/api";

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

  const styleOptions = [
    { value: "educational diagram", label: "📊 EDUCATIONAL DIAGRAM" },
    { value: "scientific illustration", label: "🔬 SCIENTIFIC ILLUSTRATION" },
    { value: "flowchart", label: "🔀 FLOWCHART" },
    { value: "concept map", label: "🧠 CONCEPT MAP" },
    { value: "infographic", label: "📈 INFOGRAPHIC" },
    { value: "3D visualization", label: "🎨 3D VISUALIZATION" },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic or concept");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let response: ImageGenerationResult;

      if (mode === "context") {
        response = await generateImageFromContext(sessionId, topic);
      } else {
        response = await generateImage(sessionId, topic, style);
      }

      setResult(response);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate image";
      setError(
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || errorMessage,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result?.image_url && !result?.image_data) return;

    try {
      let url: string;
      if (result.image_data) {
        // Handle base64 image
        const binaryString = window.atob(result.image_data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "image/png" });
        url = window.URL.createObjectURL(blob);
      } else {
        // Handle URL image
        const response = await fetch(result.image_url!);
        const blob = await response.blob();
        url = window.URL.createObjectURL(blob);
      }

      const a = document.createElement("a");
      a.href = url;
      a.download = `study-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download image");
    }
  };

  return (
    <div className="flex flex-col bg-white border-2 border-black shadow-neo font-sans">
      {/* Header */}
      <div className="p-6 border-b-2 border-black bg-neo-pink text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white border-2 border-black shadow-neo-sm">
            <Sparkles className="w-6 h-6 text-black fill-neo-yellow" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase text-stroke-sm drop-shadow-[2px_2px_0px_black]">
              Image Generator
            </h2>
            <p className="text-white font-bold opacity-90">
              Generate educational visuals with AI
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setMode("topic")}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-all border-2 border-black font-black uppercase ${
              mode === "topic"
                ? "bg-black text-white shadow-neo-sm translate-x-[-2px] translate-y-[-2px]"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Any Topic
          </button>
          <button
            onClick={() => setMode("context")}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-all border-2 border-black font-black uppercase ${
              mode === "context"
                ? "bg-black text-white shadow-neo-sm translate-x-[-2px] translate-y-[-2px]"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            From Documents
          </button>
        </div>

        {/* Input */}
        <div className="space-y-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={
              mode === "topic"
                ? "ENTER ANY TOPIC (E.G., 'HOW PHOTOSYNTHESIS WORKS')"
                : "ENTER A CONCEPT FROM YOUR DOCUMENTS"
            }
            className="w-full px-4 py-3 bg-white border-2 border-black focus:shadow-neo outline-none text-black placeholder-gray-400 font-bold"
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />

          {mode === "topic" && (
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-black focus:shadow-neo outline-none text-black font-bold uppercase cursor-pointer"
            >
              {styleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            className="w-full py-4 bg-neo-green hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] font-black uppercase flex items-center justify-center gap-2 transition-all active:shadow-none active:translate-x-[0px] active:translate-y-[0px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                GENERATING (~30s)...
              </>
            ) : (
              <>
                <Image className="w-5 h-5 stroke-2" />
                GENERATE IMAGE
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Area */}
      <div className="p-6 bg-white pattern-dots">
        {error && (
          <div className="bg-neo-red border-2 border-black text-white p-4 mb-4 flex items-start gap-3 shadow-neo-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 stroke-2" />
            <div>
              <p className="font-black uppercase">Generation Failed</p>
              <p className="font-medium text-sm">{error}</p>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Generated Image */}
            <div className="relative group border-2 border-black shadow-neo bg-white p-2">
              <img
                src={
                  result.image_data
                    ? `data:image/png;base64,${result.image_data}`
                    : result.image_url
                }
                alt={
                  result.original_topic || result.concept || "Generated image"
                }
                className="w-full border-2 border-black"
              />
              <button
                onClick={handleDownload}
                className="absolute top-6 right-6 p-2 bg-white border-2 border-black hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity shadow-neo-sm"
                title="Download Image"
              >
                <Download className="w-5 h-5 text-black stroke-2" />
              </button>
            </div>

            {/* Info Card */}
            <div className="bg-white border-2 border-black shadow-neo-sm p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-neo-blue flex-shrink-0 mt-1 stroke-2" />
                <div>
                  <p className="text-gray-500 text-xs font-black uppercase">
                    Generated Prompt:
                  </p>
                  <p className="text-black text-sm font-medium">
                    {result.generated_prompt}
                  </p>
                </div>
              </div>

              {result.context_used && (
                <div className="border-t-2 border-black pt-3 border-dashed">
                  <p className="text-gray-500 text-xs font-black uppercase mb-1">
                    Context Used:
                  </p>
                  <p className="text-gray-800 text-sm font-medium">
                    {result.context_used}
                  </p>
                </div>
              )}

              <div className="text-xs font-bold text-black bg-neo-yellow border-2 border-black p-2 shadow-neo-sm">
                ⚠️ {result.note}
              </div>
            </div>
          </div>
        )}

        {!result && !error && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
            <div className="bg-white p-4 border-2 border-black shadow-neo mb-4">
              <Image className="w-16 h-16 text-black stroke-1" />
            </div>
            <p className="text-xl font-black uppercase text-black mb-2">
              No Image Generated Yet
            </p>
            <p className="text-sm font-bold text-gray-600 max-w-md">
              {mode === "topic"
                ? "ENTER ANY TOPIC AND SELECT A STYLE TO GENERATE AN EDUCATIONAL VISUAL."
                : "ENTER A CONCEPT FROM YOUR UPLOADED DOCUMENTS TO GENERATE A RELEVANT IMAGE."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
