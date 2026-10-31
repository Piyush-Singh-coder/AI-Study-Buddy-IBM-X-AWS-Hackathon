import { Link } from "react-router-dom";
import ModelInfo from "../components/ModelInfo";
import { ArrowLeft } from "lucide-react";
import { playAudioChime } from "../utils/theme";

const ModelsPage = () => {
  return (
    <div className="min-h-screen bg-alabaster-canvas dark:bg-obsidian-canvas text-alabaster-primary dark:text-obsidian-primary p-4 sm:p-8 font-sans transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            onClick={() => playAudioChime("click")}
            className="btn-press inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-alabaster-border dark:border-obsidian-border bg-alabaster-card dark:bg-white/[0.04] text-xs font-mono font-semibold text-alabaster-secondary dark:text-obsidian-secondary hover:text-alabaster-primary dark:hover:text-obsidian-primary hover:border-alabaster-accent dark:hover:border-obsidian-cyan transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Return to Dashboard</span>
          </Link>
        </div>

        <div className="bg-alabaster-card dark:bg-obsidian-elevated border border-alabaster-border dark:border-obsidian-border rounded-xl shadow-sm overflow-hidden">
          <ModelInfo />
        </div>
      </div>
    </div>
  );
};

export default ModelsPage;
