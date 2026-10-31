import React, { useState } from "react";
import {
  Upload,
  FileText,
  Download,
  Loader2,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  BookMarked,
  X
} from "lucide-react";
import { generateSamplePaper, downloadSamplePaper } from "../services/api";
import { playAudioChime } from "../utils/theme";
import toast from "react-hot-toast";

const SamplePaper = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [paperData, setPaperData] = useState<any>(null);
  const [error, setError] = useState("");
  const [showAnswers, setShowAnswers] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      playAudioChime("click");
    }
    e.target.value = "";
  };

  const handleGenerate = async () => {
    if (!file) {
      setError("Please select a PYQ question paper or structural syllabus template first.");
      return;
    }

    const sessionId = localStorage.getItem("study_session_id");
    if (!sessionId) {
      setError("No active session. Please ingest study materials in the dashboard first.");
      return;
    }

    setLoading(true);
    setError("");
    playAudioChime("click");

    try {
      const data = await generateSamplePaper(sessionId, file);
      setPaperData(data);
      playAudioChime("success");
      toast.success("Examination paper synthesized successfully!");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to generate structured sample examination.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!paperData) return;
    try {
      playAudioChime("click");
      const blob = await downloadSamplePaper(paperData);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Sample_Examination_Paper.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Downloaded Word Document (.docx)");
    } catch (err) {
      console.error("Download failed:", err);
      setError("Failed to download DOCX manuscript.");
    }
  };

  return (
    <div className="flex flex-col space-y-6 font-sans p-4 sm:p-6 text-slate-900 dark:text-slate-100">
      
      {/* Intro Header */}
      <div className="bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-emerald-700 dark:text-cyan-400" />
          <span className="font-mono text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold">
            Curated Examination Synthesizer
          </span>
        </div>
        <h2 className="font-garamond text-3xl font-normal tracking-tight text-slate-900 dark:text-white">
          Formal Examination Paper Generator
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Upload a Previous Year Question (PYQ) paper or exam pattern. Our engine will replicate the exact exam structure, mark distribution, and question rubrics using your uploaded study materials.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/10 rounded-xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Upload Structural Template (PYQ PDF or Image)
          </label>
          {file && (
            <button
              onClick={() => { setFile(null); playAudioChime("click"); }}
              className="text-xs font-mono text-slate-500 hover:text-red-500 flex items-center gap-1"
            >
              <X size={13} />
              <span>Remove File</span>
            </button>
          )}
        </div>

        <div className="border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-emerald-600 dark:hover:border-cyan-400 rounded-xl bg-slate-50 dark:bg-white/[0.02] p-8 text-center transition-colors cursor-pointer relative group">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg,.docx"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center">
            {file ? (
              <>
                <FileText size={40} className="text-emerald-700 dark:text-cyan-400 mb-2" />
                <span className="font-semibold text-sm text-slate-900 dark:text-white">
                  {file.name}
                </span>
                <span className="text-xs font-mono text-emerald-700 dark:text-cyan-400 mt-1.5 flex items-center gap-1 font-semibold">
                  <CheckCircle2 size={14} /> Structural rubric loaded ({(file.size / 1024).toFixed(0)} KB)
                </span>
              </>
            ) : (
              <>
                <Upload
                  size={38}
                  className="text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-cyan-400 mb-2 group-hover:scale-105 transition-all"
                />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Drop previous year question paper here or click to browse
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                  PDF • DOCX • High-Resolution Scans
                </span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!file || loading}
          className="btn-press w-full py-3.5 bg-emerald-800 dark:bg-cyan-500 text-white dark:text-slate-950 font-semibold text-xs rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-900 dark:hover:bg-cyan-400 disabled:opacity-40 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              <span className="font-mono text-xs">Analyzing exam rubrics and formulating questions from vector chunks...</span>
            </>
          ) : (
            <>
              <BookMarked size={16} />
              <span>Generate Structured Examination Paper →</span>
            </>
          )}
        </button>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-lg text-xs font-mono">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Generated Paper Preview */}
      {paperData && (
        <div className="bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/10 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
            <div>
              <span className="font-mono text-xs uppercase text-slate-500 dark:text-slate-400 font-bold">
                Synthesized Academic Specimen
              </span>
              <h3 className="font-garamond text-3xl font-normal text-slate-900 dark:text-white mt-1">
                Examination Paper Preview
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04] text-emerald-800 dark:text-cyan-400 border border-slate-200 dark:border-white/10 text-xs font-mono font-semibold">
                  Difficulty: {paperData.original_pattern?.difficulty || "Rigorous"}
                </span>
                <span className="px-2.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-xs font-mono font-semibold">
                  Total Marks: {paperData.original_pattern?.total_marks || "100"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowAnswers(!showAnswers); playAudioChime("click"); }}
                className="btn-press flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-xs font-mono text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                {showAnswers ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{showAnswers ? "Hide Solutions" : "Show Solutions"}</span>
              </button>

              <button
                onClick={handleDownload}
                className="btn-press bg-emerald-800 dark:bg-cyan-500 text-white dark:text-slate-950 px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm hover:bg-emerald-900 dark:hover:bg-cyan-400"
              >
                <Download size={14} />
                <span>Download Word (.docx)</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {paperData.paper.map((section: any, idx: number) => (
              <div key={idx} className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 font-mono text-xs font-bold text-emerald-800 dark:text-cyan-400 uppercase">
                  <span>{section.section}</span>
                  <span>•</span>
                  <span>{section.marks} Marks Each</span>
                </div>

                <div className="space-y-4 pl-4 border-l-2 border-slate-200 dark:border-white/10">
                  {section.questions.map((q: any, qIdx: number) => (
                    <div key={qIdx} className="space-y-1.5">
                      <p className="font-garamond text-lg text-slate-900 dark:text-white leading-snug">
                        <strong>Q{qIdx + 1}.</strong> {q.question}
                      </p>
                      {showAnswers && q.answer && (
                        <div className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-lg border border-slate-200 dark:border-white/10">
                          <strong className="text-emerald-700 dark:text-cyan-400">Model Solution / Rubric:</strong> {q.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SamplePaper;
