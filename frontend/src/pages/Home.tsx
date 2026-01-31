import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import {
  Upload,
  Youtube,
  FileText,
  Loader2,
  X,
  Plus,
  MessageSquare,
  CheckSquare,
  Volume2,
  Image,
  Presentation,
  Brain,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { uploadFiles, getOrCreateSession } from "../services/api";

const Home = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUpload, setShowUpload] = useState(false);

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
      if (!sessionId) {
        setError("Failed to create session. Please try again.");
        return;
      }
      await uploadFiles(files, youtubeUrl, sessionId);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      const errorMessage =
        (err as any)?.response?.data?.detail ||
        "Upload failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <MessageSquare size={24} />,
      title: "AI Chat",
      description: "Ask questions about your documents",
      color: "bg-neo-blue",
    },
    {
      icon: <FileText size={24} />,
      title: "Smart Summaries",
      description: "Get concise study notes",
      color: "bg-neo-green",
    },
    {
      icon: <CheckSquare size={24} />,
      title: "Quiz Generator",
      description: "Test your knowledge",
      color: "bg-neo-purple",
    },
    {
      icon: <Volume2 size={24} />,
      title: "AI Teacher",
      description: "Voice-based learning",
      color: "bg-neo-red",
    },
    {
      icon: <Image size={24} />,
      title: "Visual Aids",
      description: "Generate diagrams",
      color: "bg-neo-yellow",
    },
    {
      icon: <Presentation size={24} />,
      title: "Slides Creator",
      description: "Auto-generate presentations",
      color: "bg-neo-blue",
    },
  ];

  return (
    <div className="min-h-screen bg-neo-yellow pattern-dots">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-neo-purple p-2 border-2 border-black shadow-neo-sm">
              <Brain size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-black uppercase">AI Study Buddy</h1>
          </div>

          <div className="flex items-center space-x-4">
            <SignedOut>
              <Link
                to="/sign-in"
                className="px-6 py-2 font-bold border-2 border-black bg-white hover:bg-gray-100 transition-colors"
              >
                LOG IN
              </Link>
              <Link
                to="/sign-up"
                className="px-6 py-2 font-bold border-2 border-black bg-neo-green text-black shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                SIGN UP
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                to="/dashboard"
                className="px-6 py-2 font-bold border-2 border-black bg-neo-blue text-white shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                DASHBOARD
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-white border-2 border-black px-4 py-2 mb-6 shadow-neo-sm">
            <Sparkles size={20} className="text-neo-purple" />
            <span className="font-bold text-sm uppercase">
              Powered by AWS 
            </span>
          </div>

          <h2 className="text-5xl md:text-7xl font-black uppercase mb-6 leading-tight">
            Transform Your
            <br />
            <span className="text-neo-purple">Study Materials</span>
          </h2>

          <p className="text-xl font-bold text-gray-700 mb-8 max-w-2xl mx-auto">
            Upload PDFs, audio, or YouTube videos. Get AI-powered summaries,
            quizzes, and personalized tutoring.
          </p>

          <SignedOut>
            <Link
              to="/sign-up"
              className="inline-flex items-center space-x-3 px-8 py-4 bg-neo-purple text-white font-black uppercase text-lg border-4 border-black shadow-neo hover:shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight size={24} />
            </Link>
          </SignedOut>

          <SignedIn>
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-neo-green text-black font-black uppercase text-lg border-4 border-black shadow-neo hover:shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <Upload size={24} />
              <span>Upload Study Materials</span>
            </button>
          </SignedIn>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-black uppercase text-center mb-12">
            All Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white border-4 border-black p-6 shadow-neo hover:shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <div
                  className={`${feature.color} w-12 h-12 flex items-center justify-center border-2 border-black mb-4 text-white`}
                >
                  {feature.icon}
                </div>
                <h4 className="text-xl font-black uppercase mb-2">
                  {feature.title}
                </h4>
                <p className="font-bold text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black shadow-neo-lg max-w-lg w-full p-8 relative">
            <button
              onClick={() => setShowUpload(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-black uppercase mb-6">
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
