import { useState } from "react";
import {
  Play,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { generateQuiz, analyzeWeakSpots } from "../services/api";

const Quiz = () => {
  const [quizData, setQuizData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [weakSpots, setWeakSpots] = useState<any>(null);

  // Quiz options
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );
  const [numQuestions, setNumQuestions] = useState(10);

  const handleGenerate = async () => {
    const sessionId = localStorage.getItem("study_session_id");
    if (!sessionId) {
      setError("No active session. Please upload documents first.");
      return;
    }

    setLoading(true);
    setShowResults(false);
    setUserAnswers({});
    setError("");
    setWarning("");
    setWeakSpots(null);

    try {
      const data = await generateQuiz(sessionId, {
        topic: topic || "general",
        difficulty,
        num_questions: numQuestions,
      });

      if (data.questions && data.questions.length > 0) {
        setQuizData(data.questions);
        if (data.warning) {
          setWarning(data.warning);
        }
      } else if (data.warning) {
        setWarning(data.warning);
        setQuizData([]);
      } else if (data.error) {
        setError(data.error);
        setQuizData([]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to generate quiz");
      setQuizData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qIndex: number, option: string) => {
    if (showResults) return;
    setUserAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = async () => {
    setShowResults(true);
    setAnalyzing(true);

    const sessionId = localStorage.getItem("study_session_id");
    if (!sessionId) return;

    try {
      // Convert answers to string keys for API
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

  return (
    <div className="space-y-6 font-sans">
      {/* Controls */}
      <div className="bg-white p-6 border-2 border-black shadow-neo">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-black uppercase text-black">
                Knowledge Check
              </h2>
              <p className="text-gray-600 font-bold">
                Test your understanding of the material
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold uppercase text-black mb-1">
                Topic (optional)
              </label>
              <input
                type="text"
                placeholder="LEAVE EMPTY FOR GENERAL"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black focus:shadow-neo outline-none font-bold placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase text-black mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-4 py-3 border-2 border-black focus:shadow-neo outline-none bg-white font-bold uppercase"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase text-black mb-1">
                Questions: {numQuestions}
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full accent-black h-2 bg-gray-200 rounded-none appearance-none cursor-pointer border-2 border-black"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-neo-purple text-white border-2 border-black px-6 py-3 font-black uppercase hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo transition-all flex items-center justify-center space-x-2 shadow-none"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Play size={18} className="fill-current" />
                )}
                <span>{quizData.length > 0 ? "REGENERATE" : "GENERATE"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Message */}
      {warning && (
        <div className="bg-neo-yellow border-2 border-black text-black px-6 py-4 flex items-start space-x-3 shadow-neo-sm">
          <AlertTriangle className="flex-shrink-0 mt-0.5 stroke-2" size={20} />
          <div>
            <p className="font-black uppercase">Note</p>
            <p className="text-sm font-bold opacity-80">{warning}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-neo-red border-2 border-black text-white px-6 py-4 flex items-start space-x-3 shadow-neo-sm">
          <XCircle className="flex-shrink-0 mt-0.5 stroke-2" size={20} />
          <div>
            <p className="font-black uppercase">Error</p>
            <p className="text-sm font-bold opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Quiz Area */}
      {quizData.length > 0 && (
        <div className="space-y-6">
          {quizData.map((q, i) => (
            <div
              key={i}
              className="bg-white p-6 border-2 border-black shadow-neo-sm"
            >
              <h3 className="text-lg font-bold text-black mb-4 flex items-start">
                <span className="bg-neo-yellow border-2 border-black text-black text-xs font-black px-2 py-1 mr-3 mt-1 shadow-neo-sm">
                  Q{i + 1}
                </span>
                <span className="flex-1">{q.question}</span>
              </h3>
              {q.topic && (
                <p className="text-xs font-bold text-gray-500 mb-3 ml-10 uppercase">
                  Topic: {q.topic}
                </p>
              )}
              <div className="grid md:grid-cols-2 gap-3">
                {q.options.map((opt: string, optIdx: number) => {
                  const isSelected = userAnswers[i] === opt;
                  const isCorrect = q.answer === opt;

                  let itemClass =
                    "p-4 border-2 transition-all cursor-pointer flex items-center justify-between font-bold shadow-neo-sm ";

                  if (showResults) {
                    if (isCorrect)
                      itemClass += "border-black bg-neo-green text-black";
                    else if (isSelected && !isCorrect)
                      itemClass += "border-black bg-neo-red text-white";
                    else itemClass += "border-black bg-white opacity-50";
                  } else {
                    if (isSelected)
                      itemClass +=
                        "border-black bg-neo-blue text-white translate-x-[-2px] translate-y-[-2px] shadow-neo";
                    else
                      itemClass += "border-black hover:bg-neo-blue/10 bg-white";
                  }

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelect(i, opt)}
                      className={itemClass}
                    >
                      <span>{opt}</span>
                      {showResults && isCorrect && (
                        <CheckCircle
                          size={20}
                          className="text-black fill-white"
                        />
                      )}
                      {showResults && isSelected && !isCorrect && (
                        <XCircle
                          size={20}
                          className="text-white fill-neo-red"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {!showResults ? (
            <div className="flex justify-end pb-8">
              <button
                onClick={handleSubmit}
                disabled={Object.keys(userAnswers).length !== quizData.length}
                className="bg-neo-green text-black border-2 border-black px-8 py-3 font-black text-lg hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-neo transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-none uppercase"
              >
                Submit Answers
              </button>
            </div>
          ) : (
            <div className="space-y-6 pb-8">
              {/* Score Card */}
              <div className="bg-neo-blue border-2 border-black text-white p-8 shadow-neo text-center">
                <h3 className="text-4xl font-black mb-2 uppercase text-stroke-sm drop-shadow-[2px_2px_0px_black]">
                  Score: {calculateScore()} / {quizData.length}
                </h3>
                <p className="text-white font-bold mb-6 text-xl">
                  {calculateScore() === quizData.length
                    ? "PERFECT SCORE! 🎉"
                    : "KEEP PRACTICING!"}
                </p>
                <button
                  onClick={handleGenerate}
                  className="bg-white border-2 border-black text-black px-6 py-3 font-black hover:shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all inline-flex items-center space-x-2 uppercase"
                >
                  <RefreshCw size={18} className="stroke-2" />
                  <span>Try New Quiz</span>
                </button>
              </div>

              {/* Weak Spots Analysis */}
              {analyzing ? (
                <div className="bg-white p-8 border-2 border-black shadow-neo text-center">
                  <Loader2
                    className="animate-spin mx-auto mb-4 text-black"
                    size={32}
                  />
                  <p className="text-black font-bold uppercase">
                    Analyzing your performance...
                  </p>
                </div>
              ) : (
                weakSpots &&
                weakSpots.weak_spots &&
                weakSpots.weak_spots.length > 0 && (
                  <div className="bg-white p-6 border-2 border-black shadow-neo">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-neo-yellow border-2 border-black p-2 shadow-neo-sm">
                        <BookOpen className="text-black" size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-black uppercase text-lg">
                          Areas to Improve
                        </h4>
                        <p className="text-sm font-bold text-gray-600">
                          Focus on these topics
                        </p>
                      </div>
                    </div>

                    {weakSpots.topics_to_review && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {weakSpots.topics_to_review.map(
                          (topic: string, i: number) => (
                            <span
                              key={i}
                              className="bg-neo-pink text-white border-2 border-black px-3 py-1 font-bold text-sm shadow-neo-sm"
                            >
                              {topic}
                            </span>
                          ),
                        )}
                      </div>
                    )}

                    <div className="bg-gray-50 border-2 border-black p-4 mb-4">
                      <p className="text-black font-medium">
                        {weakSpots.recommendation}
                      </p>
                    </div>

                    <div className="mt-4 space-y-3">
                      <p className="text-sm font-black text-black uppercase">
                        Questions you missed:
                      </p>
                      {weakSpots.weak_spots.map((ws: any, i: number) => (
                        <div
                          key={i}
                          className="bg-red-50 border-2 border-black p-4 text-sm shadow-neo-sm"
                        >
                          <p className="text-black font-bold mb-2">
                            {ws.question}
                          </p>
                          <p className="text-neo-red font-bold">
                            YOUR ANSWER: {ws.your_answer}
                          </p>
                          <p className="text-neo-green font-bold">
                            CORRECT: {ws.correct_answer}
                          </p>
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
    </div>
  );
};

export default Quiz;
