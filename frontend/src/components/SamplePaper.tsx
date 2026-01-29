import React, { useState } from "react";
import { Upload, FileText, Download, Loader2, CheckCircle } from "lucide-react";
import { generateSamplePaper, downloadSamplePaper } from "../services/api";

const SamplePaper = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [paperData, setPaperData] = useState<any>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!file) {
      setError("Please upload a PYQ file first.");
      return;
    }

    const sessionId = localStorage.getItem("study_session_id");
    if (!sessionId) {
      setError(
        "No active session. Please upload documents in dashboard first.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await generateSamplePaper(sessionId, file);
      setPaperData(data);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Failed to generate sample paper.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!paperData) return;
    try {
      const blob = await downloadSamplePaper(paperData);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Sample_Paper_Generated.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Download failed:", err);
      setError("Failed to download file.");
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 font-sans">
      <div className="bg-neo-blue border-2 border-black p-8 text-white shadow-neo">
        <h2 className="text-3xl font-black mb-2 uppercase text-stroke-sm drop-shadow-[2px_2px_0px_black]">
          Sample Paper Generator
        </h2>
        <p className="text-white font-bold text-lg">
          Upload a Previous Year Question (PYQ) paper, and we'll generate a new
          sample paper with the same structure using YOUR study materials.
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white p-8 border-2 border-black shadow-neo-sm">
        <label className="block text-black font-black uppercase mb-4">
          Upload PYQ Paper (PDF/Image)
        </label>

        <div className="border-4 border-dashed border-black bg-gray-50 p-8 text-center hover:bg-neo-purple/10 transition-colors relative cursor-pointer group">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center">
            {file ? (
              <>
                <FileText size={48} className="text-black mb-2" />
                <span className="font-black text-black text-lg">
                  {file.name}
                </span>
                <span className="text-sm text-neo-green font-bold mt-1 flex items-center bg-black text-white px-2 py-1 uppercase">
                  <CheckCircle size={14} className="mr-1" /> Ready to process
                </span>
              </>
            ) : (
              <>
                <Upload
                  size={48}
                  className="text-black mb-2 group-hover:scale-110 transition-transform"
                />
                <span className="text-black font-black uppercase text-lg border-b-2 border-black">
                  Click to upload PYQ
                </span>
                <span className="text-sm font-bold text-gray-500 mt-2">
                  We analyze the pattern to create a new paper
                </span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!file || loading}
          className="w-full mt-6 bg-neo-purple text-white border-2 border-black py-4 font-black uppercase hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-none"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <FileText size={20} />
          )}
          <span>
            {loading
              ? "Analyzing Pattern & Generating..."
              : "GENERATE SAMPLE PAPER"}
          </span>
        </button>

        {error && (
          <div className="mt-4 bg-neo-red border-2 border-black text-white p-3 font-bold text-center shadow-neo-sm">
            {error}
          </div>
        )}
      </div>

      {/* Result Area */}
      {paperData && (
        <div className="flex-1 bg-white p-8 border-2 border-black shadow-neo overflow-y-auto">
          <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
            <div>
              <h3 className="text-2xl font-black text-black uppercase">
                Generated Paper Preview
              </h3>
              <div className="flex gap-4 mt-2 text-sm text-black font-bold">
                <span className="bg-neo-yellow border border-black px-2 py-1">
                  DIFFICULTY:{" "}
                  {paperData.original_pattern?.difficulty || "Medium"}
                </span>
                <span className="bg-neo-pink text-white border border-black px-2 py-1">
                  TOTAL MARKS:{" "}
                  {paperData.original_pattern?.total_marks || "N/A"}
                </span>
              </div>
            </div>
            <button
              onClick={handleDownload}
              className="bg-neo-green text-black border-2 border-black px-6 py-3 font-black uppercase hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo transition-all flex items-center space-x-2"
            >
              <Download size={18} className="stroke-2" />
              <span>Download DOCX</span>
            </button>
          </div>

          <div className="space-y-8">
            {paperData.paper.map((section: any, idx: number) => (
              <div key={idx}>
                <h4 className="font-black text-lg text-white mb-4 bg-neo-blue border-2 border-black p-2 inline-block shadow-neo-sm">
                  {section.section} ({section.marks} Marks each)
                </h4>
                <div className="space-y-6">
                  {section.questions.map((q: any, qIdx: number) => (
                    <div key={qIdx} className="pl-6 border-l-4 border-black">
                      <p className="font-bold text-black mb-2 text-lg">
                        Q{qIdx + 1}. {q.question}
                      </p>
                      {q.answer && (
                        <p className="text-sm font-medium text-gray-600 italic bg-gray-100 p-2 border border-black inline-block">
                          Answer Key: {q.answer}
                        </p>
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
