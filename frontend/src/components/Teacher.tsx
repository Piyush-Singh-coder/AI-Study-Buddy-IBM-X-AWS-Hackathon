import { useState, useRef, useEffect } from "react";
import {
  Mic,
  Square,
  Play,
  Pause,
  Send,
  Volume2,
  User,
  Bot,
  Loader2,
  Download,
  Languages,
  ChevronDown,
} from "lucide-react";
import { interactAudio } from "../services/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
  sources?: string[];
}

const AudioPlayer = ({
  src,
  onPlay,
  onPause,
  isPlaying,
}: {
  src: string;
  onPlay: () => void;
  onPause: () => void;
  isPlaying: boolean;
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((e) => console.error("Playback failed:", e));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const togglePlay = () => {
    if (isPlaying) onPause();
    else onPlay();
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = src;
    a.download = "explanation.mp3";
    a.click();
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="mt-3 bg-neo-yellow rounded-none p-3 border-2 border-black flex flex-col gap-2 w-full max-w-md shadow-neo-sm">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onPause}
      />
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="bg-black text-white p-2 border-2 border-black hover:bg-gray-800 flex-shrink-0 shadow-[2px_2px_0px_white]"
        >
          {isPlaying ? (
            <Pause size={16} fill="white" />
          ) : (
            <Play size={16} fill="white" />
          )}
        </button>

        <div className="flex-1 flex flex-col justify-center">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={progress}
            onChange={handleSeek}
            className="w-full h-2 bg-white rounded-none appearance-none cursor-pointer border-2 border-black accent-black"
          />
          <div className="flex justify-between text-[10px] text-black font-bold mt-1">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="text-black hover:text-gray-700 p-1 border-2 border-transparent hover:border-black transition-all"
          title="Download Audio"
        >
          <Download size={18} />
        </button>
      </div>
    </div>
  );
};

const Teacher = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("English");
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number | null>(
    null,
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Start Recording
  const startRecording = async () => {
    // Stop any playing audio
    setCurrentAudioIndex(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = sendAudio;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  // Send Audio Blob
  const sendAudio = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    await processInteraction(undefined, audioBlob);
  };

  // Handle Text Submit
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setCurrentAudioIndex(null); // Stop playback
    await processInteraction(input);
    setInput("");
  };

  // Common Processing Logic
  const processInteraction = async (text?: string, audioBlob?: Blob) => {
    const sessionId = localStorage.getItem("study_session_id");
    if (!sessionId) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Please upload documents first." },
      ]);
      return;
    }

    if (text) {
      setMessages((prev) => [...prev, { role: "user", content: text }]);
    } else if (audioBlob) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: "🎤 Audio message..." },
      ]);
    }

    setIsProcessing(true);

    try {
      const data = await interactAudio(sessionId, text, audioBlob, language);

      if (audioBlob && data.user_text) {
        setMessages((prev) => {
          const newMsgs = [...prev];
          const lastMsg = newMsgs[newMsgs.length - 1];
          if (lastMsg.role === "user" && lastMsg.content.includes("🎤")) {
            lastMsg.content = `🎤 "${data.user_text}"`;
          }
          return newMsgs;
        });
      }

      let audioUrl = "";
      if (data.audio_base64) {
        const binaryString = window.atob(data.audio_base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "audio/mpeg" });
        audioUrl = window.URL.createObjectURL(blob);
      }

      setMessages((prev) => {
        const newIdx = prev.length + 1; // +1 because we are adding now
        // Using setTimeout to play next audio automatically after render
        setTimeout(() => setCurrentAudioIndex(prev.length), 100);
        return [
          ...prev,
          {
            role: "assistant",
            content: data.ai_text,
            audioUrl: audioUrl,
            sources: data.sources,
          },
        ];
      });
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't process that. Please try again.",
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-none border-2 border-black shadow-neo overflow-hidden relative font-sans">
      <div className="bg-neo-purple text-white p-6 flex justify-between items-center z-10 border-b-2 border-black">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2 uppercase text-stroke-sm drop-shadow-[2px_2px_0px_black]">
            <Volume2 className="stroke-2" /> AI Teacher Mode
          </h2>
          <p className="text-white font-bold opacity-90">
            Explain concepts simply in your language.
          </p>
        </div>

        {/* Language Selector */}
        <div className="relative group">
          <div className="flex items-center gap-2 bg-white px-3 py-2 border-2 border-black shadow-neo-sm group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all cursor-pointer group-hover:bg-neo-yellow">
            <Languages size={18} className="text-black stroke-2" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border-none outline-none text-black text-sm font-black uppercase cursor-pointer appearance-none pr-8 z-10 relative min-w-[100px]"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Hinglish">Hinglish</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black stroke-3 pointer-events-none"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 pattern-grid">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
            <div className="bg-white p-6 border-2 border-black shadow-neo animate-bounce-slow">
              <Mic size={48} className="text-black" />
            </div>
            <p className="text-center max-w-sm font-bold text-black uppercase">
              Tap the microphone to speak within your selected language.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] ${msg.role === "user" ? "bg-neo-blue text-white" : "bg-white border-2 border-black text-black"} p-4 border-2 border-black shadow-neo-sm transition-all duration-300`}
            >
              <div className="flex items-start gap-3">
                {msg.role === "assistant" ? (
                  <div className="bg-neo-yellow border border-black p-1">
                    <Bot className="flex-shrink-0 text-black stroke-2" />
                  </div>
                ) : (
                  <div className="bg-black border border-white p-1">
                    <User className="flex-shrink-0 text-white stroke-2" />
                  </div>
                )}
                <div className="w-full">
                  <p className="leading-relaxed whitespace-pre-wrap font-medium">
                    {msg.content}
                  </p>

                  {/* Audio Player for Assistant */}
                  {msg.audioUrl && (
                    <AudioPlayer
                      src={msg.audioUrl}
                      isPlaying={currentAudioIndex === idx}
                      onPlay={() => setCurrentAudioIndex(idx)}
                      onPause={() => setCurrentAudioIndex(null)}
                    />
                  )}

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t-2 border-black/10">
                      <p className="text-[10px] font-black uppercase mb-1">
                        Sources:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {msg.sources.slice(0, 2).map((s, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-neo-green text-black border border-black px-2 py-0.5 rounded-none font-bold truncate max-w-[150px]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white p-4 border-2 border-black shadow-neo-sm flex items-center space-x-3">
              <Loader2 className="animate-spin text-black" />
              <span className="text-black font-bold uppercase">
                Thinking & Generating Audio...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-white border-t-2 border-black z-10 shadow-none">
        <div className="flex items-center gap-4 max-w-3xl mx-auto">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-4 border-2 border-black transition-all shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none ${
              isRecording
                ? "bg-neo-red hover:bg-red-600 animate-pulse"
                : "bg-neo-blue hover:bg-blue-600"
            } text-white flex-shrink-0`}
          >
            {isRecording ? (
              <Square size={24} fill="white" className="stroke-2" />
            ) : (
              <Mic size={24} className="stroke-2" />
            )}
          </button>

          <form onSubmit={handleTextSubmit} className="flex-1 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask in ${language}...`}
              className="flex-1 bg-white border-2 border-black focus:shadow-neo rounded-none px-4 transition-all outline-none font-bold placeholder-gray-400"
              disabled={isRecording || isProcessing}
            />
            <button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="bg-neo-purple text-white p-3 border-2 border-black hover:bg-purple-600 hover:shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] disabled:opacity-50 transition-all shadow-none active:shadow-none"
            >
              <Send size={20} className="stroke-2" />
            </button>
          </form>
        </div>
        {isRecording && (
          <p className="text-center text-neo-red text-sm mt-2 font-black uppercase animate-pulse">
            Recording... Tap square to stop
          </p>
        )}
      </div>
      <div className="bg-black text-white p-1 text-center border-t-2 border-white">
        <p className="text-[10px] font-bold uppercase tracking-widest">
          Powered by AWS Transcribe & OpenAI TTS (AI Teacher)
        </p>
      </div>
    </div>
  );
};

export default Teacher;
