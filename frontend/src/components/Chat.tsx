import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, FileText } from "lucide-react";
import { chat } from "../services/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const sessionId = localStorage.getItem("study_session_id");
    if (!sessionId) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "No active session. Please upload documents first.",
          sources: [],
        },
      ]);
      return;
    }

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const data = await chat(userMsg, sessionId);
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
          content: "Sorry, I encountered an error.",
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] bg-white border-2 border-black shadow-neo overflow-hidden font-sans">
      <div className="bg-white border-b-2 border-black p-4 flex items-center space-x-3">
        <div className="bg-neo-yellow border-2 border-black p-2 shadow-neo-sm">
          <Bot className="text-black" size={24} />
        </div>
        <div>
          <h2 className="text-lg font-black text-black uppercase">
            Study Assistant
          </h2>
          <p className="text-xs text-neo-green font-bold flex items-center border border-black px-1 bg-black text-white w-fit mt-1">
            <span className="w-2 h-2 bg-neo-green rounded-full mr-1"></span>
            ONLINE
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 pattern-grid">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="bg-white p-4 border-2 border-black shadow-neo mb-4">
              <Bot size={48} className="text-black" />
            </div>
            <p className="font-bold text-black uppercase">
              Ask me anything about your documents!
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] ${msg.role === "user" ? "" : "space-y-2"}`}
            >
              <div
                className={`p-4 border-2 border-black shadow-neo-sm ${
                  msg.role === "user"
                    ? "bg-neo-purple text-white"
                    : "bg-white text-black"
                }`}
              >
                <div className="flex items-start space-x-3">
                  {msg.role === "assistant" && (
                    <div className="bg-neo-yellow border border-black p-1">
                      <Bot size={16} className="text-black" />
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed">
                    {msg.content}
                  </p>
                  {msg.role === "user" && (
                    <div className="bg-black border border-white p-1">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Sources */}
              {msg.role === "assistant" &&
                msg.sources &&
                msg.sources.length > 0 && (
                  <div className="bg-neo-blue border-2 border-black px-3 py-2 ml-6 shadow-neo-sm">
                    <div className="flex items-center space-x-1 text-xs text-white font-black uppercase mb-2 border-b-2 border-black pb-1">
                      <FileText size={12} />
                      <span>Sources</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((source, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-white text-black font-bold px-2 py-1 border border-black"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 border-2 border-black shadow-neo-sm">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-neo-purple border border-black animate-bounce"></div>
                <div
                  className="w-3 h-3 bg-neo-pink border border-black animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-3 h-3 bg-neo-yellow border border-black animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="p-4 bg-white border-t-2 border-black flex items-center space-x-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="TYPE YOUR QUESTION..."
          className="flex-1 p-3 border-2 border-black focus:shadow-neo outline-none transition-all placeholder-gray-500 font-bold"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3 bg-neo-green text-black border-2 border-black hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-none active:shadow-none"
        >
          <Send size={20} className="stroke-2" />
        </button>
      </form>

      {/* Model Badge */}
      <div className="bg-black text-white p-1 text-center border-t-2 border-white">
        <p className="text-[10px] font-bold uppercase tracking-widest">
          Powered by AWS Bedrock (Amazon Nova Pro)
        </p>
      </div>
    </div>
  );
};

export default Chat;
