import { useState, useRef, useEffect } from "react";
import { Send, User, FileText, Sparkles, Loader2, Copy, Check, Trash2 } from "lucide-react";
import { chat } from "../services/api";
import { playAudioChime } from "../utils/theme";
import toast from "react-hot-toast";
import MarkdownRenderer from "./MarkdownRenderer";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterQueries = [
    "What are the core thesis statements in these manuscripts?",
    "Extract the key formulas and theoretical definitions.",
    "Summarize the experimental methodology and findings.",
    "What are the stated assumptions and research limitations?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const sessionId = localStorage.getItem("study_session_id");
    if (!sessionId) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "No active session detected. Please ingest study documents first.",
          sources: [],
        },
      ]);
      return;
    }

    if (!textToSend) setInput("");
    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setLoading(true);
    playAudioChime("click");

    try {
      const data = await chat(query, sessionId);
      playAudioChime("success");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          sources: data.sources || [],
        },
      ]);
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I encountered a communication issue while querying the vector database. Please retry in a moment.",
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    playAudioChime("click");
    toast.success("Response copied to clipboard");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClear = () => {
    setMessages([]);
    playAudioChime("click");
    toast.success("Conversation cleared");
  };

  return (
    <div className="flex flex-col h-[75vh] bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 rounded-xl overflow-hidden font-sans border border-slate-200 dark:border-white/10 shadow-sm transition-colors">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] p-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white/[0.08] text-white dark:text-cyan-400 flex items-center justify-center font-garamond text-base font-bold border border-slate-700 dark:border-cyan-500/30">
            F
          </div>
          <div>
            <h3 className="font-garamond text-lg font-normal tracking-tight text-slate-900 dark:text-white">
              Vector Inquired Dialogue
            </h3>
            <p className="text-[11px] font-mono text-emerald-700 dark:text-cyan-400 flex items-center gap-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-cyan-400 animate-pulse"></span>
              Neon PGVector Semantic Memory Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="btn-press flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-red-500"
              title="Clear dialogue history"
            >
              <Trash2 size={13} />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
            Gemini 2.5 Flash
          </span>
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3 shadow-sm">
              <Sparkles size={24} className="text-emerald-700 dark:text-cyan-400" />
            </div>
            <h4 className="font-garamond text-2xl font-normal text-slate-900 dark:text-white">
              Academic Socratic Dialogue Ready
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mt-1 mb-6">
              Ask deep questions about specific theorems, conceptual arguments, or proofs from your ingested materials.
            </p>

            {/* Starter Chips */}
            <div className="flex flex-wrap gap-2 max-w-lg justify-center">
              {starterQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="btn-press text-left text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-slate-700 dark:text-slate-300 hover:border-emerald-600 dark:hover:border-cyan-400 hover:text-emerald-800 dark:hover:text-cyan-300"
                >
                  ✦ {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white/[0.08] text-white dark:text-cyan-400 flex items-center justify-center text-xs font-bold font-garamond flex-shrink-0 mt-1 border border-slate-700 dark:border-cyan-500/30">
                F
              </div>
            )}
            
            <div
              className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-xl text-sm leading-relaxed group relative ${
                msg.role === "user"
                  ? "bg-emerald-800 dark:bg-cyan-500 text-white dark:text-slate-950 font-medium rounded-tr-sm shadow-sm"
                  : "bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 font-garamond text-base sm:text-lg leading-relaxed rounded-tl-sm shadow-sm"
              }`}
            >
              {msg.role === "assistant" ? (
                <MarkdownRenderer content={msg.content} />
              ) : (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              )}

              {/* Citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-white/10 text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                  <FileText size={12} className="text-emerald-700 dark:text-cyan-400" />
                  <span>Citations: {msg.sources.join(", ")}</span>
                </div>
              )}

              {/* Copy action */}
              {msg.role === "assistant" && (
                <button
                  onClick={() => handleCopy(msg.content, i)}
                  className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1.5 rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0F17] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-opacity"
                  title="Copy response"
                >
                  {copiedIdx === i ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                </button>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-mono flex-shrink-0 mt-1 text-slate-700 dark:text-slate-300">
                <User size={14} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white/[0.08] text-white dark:text-cyan-400 flex items-center justify-center text-xs font-bold font-garamond flex-shrink-0 mt-1">
              F
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-emerald-700 dark:text-cyan-400" />
              <span>Scanning 3072-dim vector chunks in Neon PGVector...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="p-3 sm:p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.01]"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Inquire about ingested manuscripts, proofs, or chapter concepts..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:border-emerald-600 dark:focus:border-cyan-400 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-press px-4 py-2.5 bg-emerald-800 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-sm hover:bg-emerald-900 dark:hover:bg-cyan-400 disabled:opacity-40 transition-all"
          >
            <Send size={15} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </form>

    </div>
  );
};

export default Chat;
