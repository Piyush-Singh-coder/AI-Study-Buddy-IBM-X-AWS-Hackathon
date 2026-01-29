import React, { useState } from "react";
import {
  Presentation,
  Loader2,
  Download,
  BookOpen,
  AlertCircle,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { generateSlides } from "../services/api";

interface SlidesGeneratorProps {
  sessionId: string;
}

const SlidesGenerator: React.FC<SlidesGeneratorProps> = ({ sessionId }) => {
  const [topic, setTopic] = useState("");
  const [numSlides, setNumSlides] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic for your presentation");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Trigger download directly
      await generateSlides(sessionId, topic, numSlides);
      setSuccess(true);
      setTopic("");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate slides";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-2 border-black shadow-neo font-sans">
      {/* Header */}
      <div className="p-6 border-b-2 border-black bg-neo-purple text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white border-2 border-black shadow-neo-sm">
            <Presentation className="w-6 h-6 text-black fill-neo-yellow" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase text-stroke-sm drop-shadow-[2px_2px_0px_black]">
              Slide Generator
            </h2>
            <p className="text-white font-bold opacity-90">
              Create PowerPoint presentations from your study materials
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 bg-white pattern-dots flex items-center justify-center">
        <div className="w-full max-w-2xl">
          {/* Card */}
          <div className="bg-white border-2 border-black shadow-neo p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-lg font-black uppercase flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Presentation Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="E.G., 'THE RISE OF ROME', 'QUANTUM PHYSICS BASICS'"
                className="w-full px-4 py-3 bg-white border-2 border-black focus:shadow-neo outline-none text-black placeholder-gray-400 font-bold"
              />
              <p className="text-sm font-bold text-gray-500">
                Based on your uploaded documents context.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-lg font-black uppercase flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Number of Slides
              </label>
              <div className="flex gap-4">
                {[5, 10, 15].map((num) => (
                  <button
                    key={num}
                    onClick={() => setNumSlides(num)}
                    className={`flex-1 py-3 px-4 border-2 border-black font-black uppercase transition-all ${
                      numSlides === num
                        ? "bg-black text-white shadow-neo-sm translate-x-[-2px] translate-y-[-2px]"
                        : "bg-white text-black hover:bg-gray-100"
                    }`}
                  >
                    {num} Slides
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-neo-red border-2 border-black text-white p-4 flex items-start gap-3 shadow-neo-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 stroke-2" />
                <div>
                  <p className="font-black uppercase">Generation Failed</p>
                  <p className="font-medium text-sm">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-neo-green border-2 border-black text-black p-4 flex items-start gap-3 shadow-neo-sm">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 stroke-2" />
                <div>
                  <p className="font-black uppercase">Success!</p>
                  <p className="font-bold text-sm">
                    Your presentation has been downloaded.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isLoading || !topic.trim()}
              className="w-full py-4 bg-neo-yellow hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] font-black uppercase flex items-center justify-center gap-2 transition-all active:shadow-none active:translate-x-[0px] active:translate-y-[0px] text-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  GENERATING PPTX...
                </>
              ) : (
                <>
                  <Download className="w-6 h-6 stroke-2" />
                  GENERATE PRESENTATION
                </>
              )}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="font-bold text-gray-500 uppercase text-sm">
              POWERED BY AWS BEDROCK (AMAZON NOVA PRO) & PYTHON-PPTX
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlidesGenerator;
