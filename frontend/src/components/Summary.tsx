import { useState, useEffect } from "react";
import {
  FileText,
  Zap,
  BookOpen,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { generateSummary, getSessionDocuments } from "../services/api";

const Summary = () => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [documents, setDocuments] = useState<string[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string>("all");

  useEffect(() => {
    loadDocuments();
    const handleStorageChange = () => {
      loadDocuments();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("docs-updated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("docs-updated", handleStorageChange);
    };
  }, []);

  const loadDocuments = async () => {
    const sessionId = localStorage.getItem("study_session_id");
    if (!sessionId) {
      setDocuments([]);
      return;
    }

    try {
      const data = await getSessionDocuments(sessionId);
      if (data && data.documents) {
        setDocuments(data.documents);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    }
  };

  const handleGenerate = async (type: "brief" | "detailed") => {
    const sessionId = localStorage.getItem("study_session_id");
    if (!sessionId) {
      setError("No active session. Please upload documents first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const sourceFilter = selectedDoc !== "all" ? selectedDoc : undefined;
      const data = await generateSummary(sessionId, type, sourceFilter);
      setSummary(data.summary);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to generate summary.");
      setSummary("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 font-sans p-2">
      {/* Document Selector */}
      {documents.length >= 1 && (
        <div className="bg-white p-4 border-2 border-black shadow-neo-sm">
          <label className="block text-sm font-bold uppercase mb-2 text-black">
            Generate summary for:
          </label>
          <div className="relative">
            <select
              value={selectedDoc}
              onChange={(e) => setSelectedDoc(e.target.value)}
              className="w-full px-4 py-3 border-2 border-black focus:shadow-neo outline-none bg-white appearance-none pr-10 font-bold"
            >
              <option value="all">ALL DOCUMENTS COMBINED</option>
              {documents.map((doc, i) => (
                <option key={i} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-3.5 text-black pointer-events-none stroke-2"
              size={20}
            />
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={() => handleGenerate("brief")}
          disabled={loading}
          className="group bg-neo-yellow p-6 border-2 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm transition-all text-left flex items-start space-x-4 disabled:opacity-50 disabled:shadow-none disabled:translate-x-[4px] disabled:translate-y-[4px]"
        >
          <div className="bg-white border-2 border-black p-3 group-hover:scale-110 transition-transform shadow-neo-sm">
            <Zap className="text-black" size={24} />
          </div>
          <div>
            <h3 className="font-black text-black text-lg uppercase">
              Quick Overview
            </h3>
            <p className="text-sm font-bold text-gray-800">
              Get the main points in seconds.
            </p>
          </div>
        </button>

        <button
          onClick={() => handleGenerate("detailed")}
          disabled={loading}
          className="group bg-neo-purple p-6 border-2 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm transition-all text-left flex items-start space-x-4 disabled:opacity-50 disabled:shadow-none disabled:translate-x-[4px] disabled:translate-y-[4px]"
        >
          <div className="bg-white border-2 border-black p-3 group-hover:scale-110 transition-transform shadow-neo-sm">
            <BookOpen className="text-black" size={24} />
          </div>
          <div>
            <h3 className="font-black text-white text-lg uppercase">
              Detailed Study Notes
            </h3>
            <p className="text-sm font-bold text-indigo-100">
              Deep dive with structured formatting.
            </p>
          </div>
        </button>
      </div>

      {error && (
        <div className="bg-neo-red border-2 border-black text-white px-6 py-4 flex items-start space-x-3 shadow-neo-sm font-bold">
          <AlertCircle className="flex-shrink-0 mt-0.5 stroke-2" size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="flex-1 bg-white border-2 border-black shadow-neo p-8 overflow-y-auto relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10">
            <div className="w-16 h-16 border-4 border-black border-t-neo-purple rounded-full animate-spin mb-4"></div>
            <p className="text-black font-black animate-pulse uppercase">
              Analyzing documents...
            </p>
          </div>
        ) : summary ? (
          <article className="prose prose-slate max-w-none prose-headings:font-black prose-headings:uppercase prose-p:font-medium prose-strong:font-black">
            {selectedDoc !== "all" && (
              <p className="text-xs font-black uppercase bg-neo-blue text-white inline-block px-2 py-1 border-2 border-black shadow-neo-sm mb-4">
                📄 Summary for: {selectedDoc}
              </p>
            )}
            <div className="whitespace-pre-wrap font-medium text-black leading-relaxed">
              {summary}
            </div>
          </article>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="bg-gray-100 p-6 rounded-full border-4 border-gray-300 mb-4">
              <FileText size={64} className="opacity-50" />
            </div>
            <p className="text-xl font-black uppercase text-gray-300">
              Select a mode above
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;
