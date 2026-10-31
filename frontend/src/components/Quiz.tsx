import { useState } from "react";
import {
  Play,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  HelpCircle,
  Award,
  Sparkles,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { generateQuiz, analyzeWeakSpots } from "../services/api";
import { playAudioChime } from "../utils/theme";

const Quiz = () => {
  const [quizData, setQuizData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [weakSpots, setWeakSpots] = useState<any>(null);

  // Configuration
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [numQuestions, setNumQuestions] = useState(5);

  const handleGenerate = async () => {
    const sessionId = localStorage.getItem("study_session_id");
    if (!sessionId) {
      setError("No active study session detected. Please ingest documents first.");
      return;
    }

    setLoading(true);
    setShowResults(false);
    setUserAnswers({});
    setError("");
    setWarning("");
    setWeakSpots(null);
    playAudioChime("click");

    try {
      const data = await generateQuiz(sessionId, {
        topic: topic.trim() || "general",
        difficulty,
        num_questions: numQuestions,
      });

      if (data.questions && data.questions.length > 0) {
        setQuizData(data.questions);
        playAudioChime("success");
        if (data.warning) setWarning(data.warning);
      } else if (data.warning) {
        setWarning(data.warning);
        setQuizData([]);
      } else if (data.error) {
        setError(data.error);
        setQuizData([]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to generate active-recall quiz.");
      setQuizData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qIndex: number, option: string) => {
    if (showResults) return;
    setUserAnswers((prev) => ({ ...prev, [qIndex]: option }));
    playAudioChime("click");
  };

  const handleSubmit = async () => {
    setShowResults(true);
    setAnalyzing(true);
    playAudioChime("success");

    const sessionId = localStorage.getItem("study_session_id");
    if (!sessionId) return;

    try {
      const answersForApi: { [key: string]: string } = {};
      Object.keys(userAnswers).forEach((key) => {
        answersForApi[key] = userAnswers[Number(key)];
      });

      const result = await analyzeWeakSpots(sessionId, quizData, answersForApi);
      setWeakSpots(result);
    } catch (err) {
      console.error("Failed to analyze weak spots:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const calculateScore = () => {
    let score = 0;
    quizData.forEach((q, i) => {
      if (userAnswers[i] === q.answer) score++;
    });
    return score;
  };

  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = quizData.length > 0 ? (answeredCount / quizData.length) * 100 : 0;
  const score = calculateScore();
  const percentage = quizData.length > 0 ? Math.round((score / quizData.length) * 100) : 0;

  return (
    <div className="h-full flex flex-col space-y-6 p-4 sm:p-6 font-sans text-slate-900 dark:text-slate-100">
      
      {/* Header Calibration Bar */}
      <div className="bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700 dark:text-cyan-400" />
            <span className="font-mono text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold">
              Active-Recall Assessment Engine
            </span>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Bloom's Taxonomy: <strong className="text-emerald-700 dark:text-cyan-400 uppercase">{difficulty}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1">
              Focus Chapter / Concept
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. 'Thermodynamics', 'Chapter 3' (or leave blank)"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:border-emerald-600 dark:focus:border-cyan-400"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1">
              Difficulty Rigor
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-white/[0.04] p-1 rounded-lg border border-slate-200 dark:border-white/10">
              {(["easy", "medium", "hard"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => { setDifficulty(lvl); playAudioChime("click"); }}
                  className={`btn-press py-1 rounded text-[11px] font-mono font-bold capitalize transition-all ${
                    difficulty === lvl
                      ? "bg-white dark:bg-cyan-950 text-slate-900 dark:text-cyan-300 border border-slate-300 dark:border-cyan-500/40 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1">
              Questions
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-white/[0.04] p-1 rounded-lg border border-slate-200 dark:border-white/10">
              {[3, 5, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => { setNumQuestions(num); playAudioChime("click"); }}
                  className={`btn-press py-1 rounded text-[11px] font-mono font-bold transition-all ${
                    numQuestions === num
                      ? "bg-white dark:bg-cyan-950 text-slate-900 dark:text-cyan-300 border border-slate-300 dark:border-cyan-500/40 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {num}Q
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-press w-full py-2.5 bg-emerald-800 dark:bg-cyan-500 text-white dark:text-slate-950 font-semibold text-xs rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-900 dark:hover:bg-cyan-400 disabled:opacity-40 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={15} />
              <span className="font-mono">Synthesizing Diagnostic Examination from Vector Chunks...</span>
            </>
          ) : (
            <>
              <Play size={15} />
              <span>Generate Active-Recall Quiz →</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-lg text-xs font-mono">
          ⚠️ {error}
        </div>
      )}

      {warning && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 p-3 rounded-lg text-xs font-mono">
          ✦ Note: {warning}
        </div>
      )}

      {/* Questions Flow */}
      {quizData.length > 0 && (
        <div className="space-y-5 pb-8">
          {/* Progress Strip */}
          <div className="bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/10 rounded-xl p-4 flex items-center justify-between text-xs font-mono shadow-sm">
            <span className="text-slate-600 dark:text-slate-400">
              Progress: <strong>{answeredCount} of {quizData.length}</strong> Answered
            </span>
            <div className="w-36 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 dark:bg-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {quizData.map((q, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm space-y-4"
            >
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-emerald-800 dark:text-cyan-400 font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <h4 className="font-garamond text-xl font-normal tracking-tight text-slate-900 dark:text-white leading-snug">
                    {q.question}
                  </h4>
                  {q.topic && (
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 inline-block">
                      Conceptual domain: {q.topic}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {q.options.map((opt: string, optIdx: number) => {
                  const isSelected = userAnswers[i] === opt;
                  const isCorrect = q.answer === opt;
                  const optionLetters = ["A", "B", "C", "D", "E"];

                  let itemStyle = "p-3.5 rounded-xl border text-sm transition-all cursor-pointer flex items-center justify-between ";

                  if (showResults) {
                    if (isCorrect) {
                      itemStyle += "border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 font-semibold";
                    } else if (isSelected && !isCorrect) {
                      itemStyle += "border-red-500 bg-red-500/10 text-red-800 dark:text-red-400 font-semibold";
                    } else {
                      itemStyle += "border-slate-200 dark:border-white/5 bg-transparent opacity-40 text-slate-400";
                    }
                  } else {
                    if (isSelected) {
                      itemStyle += "border-emerald-700 dark:border-cyan-400 bg-emerald-50 dark:bg-cyan-950/40 text-emerald-950 dark:text-cyan-200 font-semibold shadow-sm";
                    } else {
                      itemStyle += "border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] hover:border-emerald-600 dark:hover:border-cyan-400 text-slate-800 dark:text-slate-200";
                    }
                  }

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelect(i, opt)}
                      className={itemStyle}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-md bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 flex items-center justify-center font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400 flex-shrink-0">
                          {optionLetters[optIdx] || "•"}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {showResults && isCorrect && <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />}
                      {showResults && isSelected && !isCorrect && <XCircle size={16} className="text-red-500 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {!showResults ? (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSubmit}
                disabled={answeredCount !== quizData.length}
                className="btn-press px-7 py-3 bg-emerald-800 dark:bg-cyan-500 text-white dark:text-slate-950 font-semibold text-xs rounded-lg shadow-sm hover:bg-emerald-900 dark:hover:bg-cyan-400 disabled:opacity-40 transition-all flex items-center gap-2"
              >
                <span>Submit Assessment for Diagnostic Review</span>
                <ChevronRight size={15} />
              </button>
            </div>
          ) : (
            <div className="space-y-6 pt-2">
              {/* Score Report Card */}
              <div className="bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center shadow-md space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 mx-auto flex items-center justify-center text-emerald-700 dark:text-cyan-400 shadow-sm">
                  <Award size={32} />
                </div>
                <h3 className="font-garamond text-4xl sm:text-5xl font-normal text-slate-900 dark:text-white">
                  {score} / {quizData.length} Correct ({percentage}%)
                </h3>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  {percentage === 100
                    ? "Exemplary comprehension demonstrated across all tested vector chunks."
                    : percentage >= 70
                    ? "Proficient conceptual retention. Targeted weak points mapped below."
                    : "Conceptual gaps identified. Review the vector diagnostics below."}
                </p>
                <button
                  onClick={handleGenerate}
                  className="btn-press px-5 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-xs font-mono font-semibold inline-flex items-center gap-2 text-slate-800 dark:text-slate-200 hover:border-emerald-600 dark:hover:border-cyan-400"
                >
                  <RefreshCw size={14} />
                  <span>Generate Follow-Up Assessment</span>
                </button>
              </div>

              {/* Weak spots card */}
              {analyzing ? (
                <div className="p-8 text-center font-mono text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin text-emerald-700 dark:text-cyan-400" />
                  <span>Computing conceptual weakness analysis with vector alignment...</span>
                </div>
              ) : (
                weakSpots && weakSpots.weak_spots && weakSpots.weak_spots.length > 0 && (
                  <div className="bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={18} className="text-amber-500" />
                      <h4 className="font-garamond text-2xl font-normal text-slate-900 dark:text-white">
                        Targeted Remedial Study Path
                      </h4>
                    </div>

                    {weakSpots.topics_to_review && (
                      <div className="flex flex-wrap gap-2">
                        {weakSpots.topics_to_review.map((t: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-mono font-semibold"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                      {weakSpots.recommendation}
                    </div>

                    <div className="space-y-3 pt-2">
                      <span className="font-mono text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
                        Vulnerability Breakdown:
                      </span>
                      {weakSpots.weak_spots.map((ws: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 rounded-lg border border-red-500/20 bg-red-500/5 text-xs font-mono space-y-1"
                        >
                          <p className="font-bold text-slate-900 dark:text-white font-sans text-sm">
                            {ws.question}
                          </p>
                          <p className="text-red-700 dark:text-red-400">Your selection: {ws.your_answer}</p>
                          <p className="text-emerald-700 dark:text-cyan-400">Canonical vector proof: {ws.correct_answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

      {quizData.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center h-full text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-4 shadow-sm">
            <HelpCircle size={28} />
          </div>
          <h4 className="font-garamond text-2xl font-normal text-slate-900 dark:text-white mb-1.5">
            Active-Recall Assessment Ready
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md font-normal leading-relaxed">
            Configure your subject focus, rigor level, and question count above, then initiate active recall to test your conceptual recall.
          </p>
        </div>
      )}

    </div>
  );
};

export default Quiz;
