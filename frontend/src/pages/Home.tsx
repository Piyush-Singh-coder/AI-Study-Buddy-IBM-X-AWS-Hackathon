import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Youtube,
  FileText,
  Music,
  Loader2,
  X,
  Plus,
} from "lucide-react";
import { uploadFiles, getOrCreateSession } from "../services/api";

const Home = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const existingSessionId = localStorage.getItem("study_session_id");
  const isAddingToSession = !!existingSessionId;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0 && !youtubeUrl) {
      setError("Please upload at least one file or provide a YouTube URL.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const sessionId = await getOrCreateSession();
      await uploadFiles(files, youtubeUrl, sessionId);
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Upload failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neo-yellow p-6 pattern-dots">
      <div className="max-w-4xl w-full bg-white border-4 border-black shadow-neo-lg rounded-none flex flex-col md:flex-row overflow-hidden">
        {/* Left Side - Hero */}
        <div className="md:w-1/2 bg-neo-purple p-12 text-white flex flex-col justify-center border-b-4 md:border-b-0 md:border-r-4 border-black relative">
          <h1 className="text-5xl font-black mb-4 z-10 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] text-stroke">
            AI Study Buddy
          </h1>
          <p className="text-xl font-bold mb-8 z-10">
            {isAddingToSession
              ? "ADD MORE MATERIALS TO YOUR SESSION."
              : "TRANSFORM STUDY MATERIALS INTO QUIZZES, SUMMARIES & CHAT."}
          </p>

          {isAddingToSession && (
            <div className="bg-neo-blue border-2 border-black shadow-neo p-4 mb-6 z-10 text-white font-bold">
              <p className="text-sm uppercase">📚 Adding to existing session</p>
            </div>
          )}

          <div className="space-y-4 z-10 font-bold">
            <div className="flex items-center space-x-3">
              <div className="bg-white text-black border-2 border-black p-2 shadow-neo-sm">
                <FileText size={20} />
              </div>
              <span>PROCESS PDFS & DOCS</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white text-black border-2 border-black p-2 shadow-neo-sm">
                <Youtube size={20} />
              </div>
              <span>YOUTUBE ANALYSIS</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white text-black border-2 border-black p-2 shadow-neo-sm">
                <Music size={20} />
              </div>
              <span>AUDIO TRANSCRIPTION</span>
            </div>
          </div>
        </div>

        {/* Right Side - Upload */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center bg-white">
          <h2 className="text-3xl font-black text-black mb-6 uppercase">
            {isAddingToSession ? "Add Documents" : "Start Studying"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-bold uppercase text-black">
                Upload Materials
              </label>
              <div className="border-4 border-dashed border-black bg-gray-50 p-6 text-center hover:bg-neo-yellow/20 transition-colors cursor-pointer relative group">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                  <Upload
                    className="text-black mb-2 group-hover:scale-110 transition-transform"
                    size={40}
                  />
                  <span className="text-base font-bold text-black border-b-2 border-black">
                    BROWSE FILES
                  </span>
                  <span className="text-xs font-bold text-gray-500 mt-2 uppercase">
                    PDF, Audio, Images
                  </span>
                </div>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-2 mt-3">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white border-2 border-black px-3 py-2 shadow-neo-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText size={16} className="text-black" />
                        <span className="text-sm font-bold truncate max-w-[180px]">
                          {file.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-black hover:text-neo-red transition-colors"
                      >
                        <X size={16} className="stroke-2" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .querySelector<HTMLInputElement>('input[type="file"]')
                        ?.click()
                    }
                    className="flex items-center space-x-2 text-black text-sm font-bold hover:underline"
                  >
                    <Plus size={16} />
                    <span>ADD MORE FILES</span>
                  </button>
                </div>
              )}
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t-2 border-black"></div>
              <span className="flex-shrink-0 mx-4 text-black font-black uppercase text-sm">
                OR
              </span>
              <div className="flex-grow border-t-2 border-black"></div>
            </div>

            {/* YouTube URL */}
            <div className="space-y-2">
              <label className="block text-sm font-bold uppercase text-black">
                YouTube URL
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-black">
                  <Youtube size={20} />
                </div>
                <input
                  type="text"
                  placeholder="https://youtube.com/..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-black focus:shadow-neo transition-all outline-none font-bold"
                />
              </div>
            </div>

            {error && (
              <div className="bg-neo-red text-white p-3 border-2 border-black font-bold text-sm shadow-neo-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 text-white font-black uppercase tracking-wider flex items-center justify-center space-x-2 transition-all border-2 border-black ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed shadow-none translate-x-[4px] translate-y-[4px]"
                  : "bg-neo-green shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>PROCESSING...</span>
                </>
              ) : (
                <span>
                  {isAddingToSession ? "ADD TO SESSION" : "START SESSION →"}
                </span>
              )}
            </button>

            {isAddingToSession && (
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="w-full py-2 text-black font-bold hover:underline text-sm uppercase"
              >
                ← Back to Dashboard
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
