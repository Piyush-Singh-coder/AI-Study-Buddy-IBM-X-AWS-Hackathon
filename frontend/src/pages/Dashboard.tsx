import { useState } from "react";
import {
  MessageSquare,
  FileText,
  CheckSquare,
  LogOut,
  Menu,
  Plus,
  Files,
  Volume2,
  Image,
  Presentation,
  Server,
} from "lucide-react";
import Chat from "../components/Chat";
import Quiz from "../components/Quiz";
import Summary from "../components/Summary";
import SamplePaper from "../components/SamplePaper";
import Teacher from "../components/Teacher";
import ImageGenerator from "../components/ImageGenerator";
import SlidesGenerator from "../components/SlidesGenerator";
import ModelInfo from "../components/ModelInfo";
import { useNavigate } from "react-router-dom";
import { deleteSession } from "../services/api";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<
    | "chat"
    | "summary"
    | "quiz"
    | "sample_paper"
    | "teacher"
    | "image"
    | "slides"
    | "models"
  >("summary");
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const handleEndSession = async () => {
    const sessionId = localStorage.getItem("study_session_id");
    if (sessionId) {
      try {
        await deleteSession(sessionId);
      } catch (err) {
        console.error("Failed to delete session:", err);
      }
      localStorage.removeItem("study_session_id");
    }
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-neo-yellow overflow-hidden font-sans">
      {/* Sidebar */}
      <div
        className={`${isSidebarOpen ? "w-64" : "w-20"} bg-white border-r-4 border-black transition-all duration-300 flex flex-col z-20`}
      >
        <div className="p-6 flex items-center justify-between border-b-4 border-black bg-neo-purple text-white">
          {isSidebarOpen && (
            <h1 className="text-xl font-black uppercase tracking-wider text-stroke-sm drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              Study Buddy
            </h1>
          )}
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-white text-black border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            <Menu size={20} className="stroke-2" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-3 mt-6">
          <SidebarItem
            icon={<FileText size={20} />}
            label="SUMMARY"
            isActive={activeTab === "summary"}
            onClick={() => setActiveTab("summary")}
            isOpen={isSidebarOpen}
            color="bg-neo-blue"
          />
          <SidebarItem
            icon={<CheckSquare size={20} />}
            label="QUIZ"
            isActive={activeTab === "quiz"}
            onClick={() => setActiveTab("quiz")}
            isOpen={isSidebarOpen}
            color="bg-neo-green"
          />
          <SidebarItem
            icon={<MessageSquare size={20} />}
            label="CHAT"
            isActive={activeTab === "chat"}
            onClick={() => setActiveTab("chat")}
            isOpen={isSidebarOpen}
            color="bg-neo-yellow"
          />
          <SidebarItem
            icon={<Files size={20} />}
            label="SAMPLE PAPER"
            isActive={activeTab === "sample_paper"}
            onClick={() => setActiveTab("sample_paper")}
            isOpen={isSidebarOpen}
            color="bg-neo-pink"
          />
          <SidebarItem
            icon={<Volume2 size={20} />}
            label="AI TEACHER"
            isActive={activeTab === "teacher"}
            onClick={() => setActiveTab("teacher")}
            isOpen={isSidebarOpen}
            color="bg-neo-purple"
          />
          <SidebarItem
            icon={<Image size={20} />}
            label="IMAGE GEN"
            isActive={activeTab === "image"}
            onClick={() => setActiveTab("image")}
            isOpen={isSidebarOpen}
            color="bg-neo-red"
          />
          <SidebarItem
            icon={<Presentation size={20} />}
            label="SLIDES"
            isActive={activeTab === "slides"}
            onClick={() => setActiveTab("slides")}
            isOpen={isSidebarOpen}
            color="bg-neo-blue"
          />
        </nav>

        <div className="p-4 border-t-4 border-black space-y-3 bg-gray-50">
          <button
            onClick={() => navigate("/")}
            className={`flex items-center space-x-3 w-full p-3 font-bold border-2 border-black bg-white shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-black ${!isSidebarOpen && "justify-center"}`}
          >
            <Plus size={20} className="stroke-2" />
            {isSidebarOpen && (
              <span className="uppercase text-sm">Add Docs</span>
            )}
          </button>
          <button
            onClick={handleEndSession}
            className={`flex items-center space-x-3 w-full p-3 font-bold border-2 border-black bg-neo-red text-white shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${!isSidebarOpen && "justify-center"}`}
          >
            <LogOut size={20} className="stroke-2" />
            {isSidebarOpen && (
              <span className="uppercase text-sm">End Session</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative bg-main pattern-grid">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto h-full">
            <div className="bg-white border-4 border-black shadow-neo-lg h-full rounded-2xl overflow-hidden flex flex-col">
              {/* Component Container */}
              <div className="flex-1 overflow-auto p-1">
                {/* Render all components but hide inactive ones to preserve state */}
                <div
                  style={{
                    display: activeTab === "summary" ? "block" : "none",
                  }}
                >
                  <Summary />
                </div>
                <div
                  style={{ display: activeTab === "quiz" ? "block" : "none" }}
                >
                  <Quiz />
                </div>
                <div
                  style={{ display: activeTab === "chat" ? "block" : "none" }}
                >
                  <Chat />
                </div>
                <div
                  style={{
                    display: activeTab === "sample_paper" ? "block" : "none",
                  }}
                >
                  <SamplePaper />
                </div>
                <div
                  style={{
                    display: activeTab === "teacher" ? "block" : "none",
                  }}
                >
                  <Teacher />
                </div>
                <div
                  style={{ display: activeTab === "image" ? "block" : "none" }}
                >
                  <ImageGenerator
                    sessionId={localStorage.getItem("study_session_id") || ""}
                  />
                </div>
                <div
                  style={{ display: activeTab === "slides" ? "block" : "none" }}
                >
                  <SlidesGenerator
                    sessionId={localStorage.getItem("study_session_id") || ""}
                  />
                </div>
                <div
                  style={{ display: activeTab === "models" ? "block" : "none" }}
                >
                  <ModelInfo />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({
  icon,
  label,
  isActive,
  onClick,
  isOpen,
  color,
}: any) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-3 w-full p-3 border-2 border-black transition-all duration-200 ${
      isActive
        ? `${color} text-white shadow-neo-sm translate-x-[-2px] translate-y-[-2px]`
        : "bg-white text-gray-500 hover:bg-gray-100 hover:text-black hover:shadow-neo-sm shadow-none"
    } ${!isOpen && "justify-center"}`}
  >
    <div className={`${!isActive && "text-black"}`}>{icon}</div>
    {isOpen && <span className="font-bold text-sm tracking-wide">{label}</span>}
  </button>
);

export default Dashboard;
