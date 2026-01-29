import ModelInfo from "../components/ModelInfo";

const ModelsPage = () => {
  return (
    <div className="min-h-screen bg-neo-yellow pattern-grid p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border-4 border-black shadow-neo-lg rounded-none overflow-hidden">
          <ModelInfo />
        </div>

        <div className="mt-6 text-center">
          <a
            href="/dashboard"
            className="inline-block bg-neo-purple text-white font-black uppercase px-6 py-3 border-2 border-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default ModelsPage;
