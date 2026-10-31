import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  Square,
  Play,
  Pause,
  Send,
  Loader2,
  Download,
  Languages
} from "lucide-react";
import { interactAudio } from "../services/api";
import { playAudioChime } from "../utils/theme";
import MarkdownRenderer from "./MarkdownRenderer";

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
  const [playbackRate, setPlaybackRate] = useState(1);

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
    playAudioChime("click");
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

  const toggleSpeed = () => {
    playAudioChime("click");
    const nextRate = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const handleDownload = () => {
    playAudioChime("click");
    const a = document.createElement("a");
    a.href = src;
    a.download = "socratic_scholar_lecture.mp3";
    a.click();
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="mt-3 bg-slate-100 dark:bg-white/[0.04] rounded-xl p-3.5 border border-slate-200 dark:border-white/10 flex flex-col gap-2.5 w-full max-w-md shadow-sm">
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
          className="w-8 h-8 rounded-lg bg-emerald-800 dark:bg-cyan-500 text-white dark:text-slate-950 flex items-center justify-center flex-shrink-0 shadow-sm hover:opacity-90"
        >
          {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
        </button>

        <div className="flex-1 flex flex-col justify-center">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={progress}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-700 dark:accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <button
          onClick={toggleSpeed}
          className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          title="Playback Speed"
        >
          {playbackRate}x
        </button>

        <button
          onClick={handleDownload}
          className="text-slate-500 hover:text-slate-900 dark:hover:text-white p-1"
          title="Download Audio"
        >
          <Download size={15} />
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
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const starterChips = [
    "Interrogate my understanding using Feynman method",
    "Explain this proof with a simple physical analogy",
    "What is the most common misconception students have?",
  ];

  const startRecording = async () => {
    try {
      playAudioChime("click");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await handleAudioUpload(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access failed:", err);
      alert("Microphone access was denied or not supported.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      playAudioChime("click");
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioUpload = async (blob: Blob) => {
    const sessionId = localStorage.getItem("study_session_id");
    if (!sessionId) {
      alert("No active session. Please ingest documents first.");
      return;
    }

    const audioFile = new File([blob], "voice_query.webm", { type: "audio/webm" });
    setIsProcessing(true);
    setMessages((prev) => [...prev, { role: "user", content: "🎤 [Spoken Question...]" }]);

    try {
      const data = await interactAudio(sessionId, audioFile, undefined, language);
      processResponse(data);
    } catch (err) {
      console.error("Audio Interaction Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble processing that voice recording. Please retry.",
        },
      ]);
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = async (customQuery?: string) => {
    const query = customQuery || input;
    if (!query.trim() || isProcessing) return;

    const sessionId = localStorage.getItem("study_session_id");
    if (!sessionId) {
      alert("No active session. Please ingest documents first.");
      return;
    }

    if (!customQuery) setInput("");
    setIsProcessing(true);
    playAudioChime("click");
    setMessages((prev) => [...prev, { role: "user", content: query }]);

    try {
      const data = await interactAudio(sessionId, undefined, query, language);
      processResponse(data);
    } catch (err) {
      console.error("Audio Interaction Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I could not synthesize that response. Please try again.",
        },
      ]);
      setIsProcessing(false);
    }
  };

  const processResponse = (data: any) => {
    if (data.user_text) {
      setMessages((prev) => {
        const newMsgs = [...prev];
        const lastMsg = newMsgs[newMsgs.length - 1];
        if (lastMsg && lastMsg.role === "user" && lastMsg.content.includes("🎤")) {
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
    setIsProcessing(false);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 rounded-xl overflow-hidden font-sans border border-slate-200 dark:border-white/10 shadow-sm transition-colors">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white/[0.08] text-white dark:text-cyan-400 flex items-center justify-center font-garamond text-base font-bold border border-slate-700 dark:border-cyan-500/30">
            F
          </div>
          <div>
            <h2 className="font-garamond text-xl font-normal tracking-tight text-slate-900 dark:text-white">
              Socratic Scholar Voice Tutor
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Conversational audio explanations & Feynman method synthesis.
            </p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-white/[0.04] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-mono">
          <Languages size={14} className="text-slate-500 dark:text-slate-400" />
          <select
            value={language}
            onChange={(e) => { setLanguage(e.target.value); playAudioChime("click"); }}
            className="bg-transparent border-none outline-none text-xs font-semibold uppercase cursor-pointer text-slate-800 dark:text-slate-200"
          >
            <option value="English" className="text-slate-900">English</option>
            <option value="Hindi" className="text-slate-900">Hindi</option>
            <option value="Hinglish" className="text-slate-900">Hinglish</option>
            <option value="Spanish" className="text-slate-900">Spanish</option>
            <option value="French" className="text-slate-900">French</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex items-center justify-center text-emerald-700 dark:text-cyan-400 mb-3 shadow-sm">
              <Mic size={26} />
            </div>
            <h4 className="font-garamond text-2xl font-normal text-slate-900 dark:text-white">
              Socratic Voice Scholar Ready
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mt-1 mb-6">
              Tap the microphone to speak aloud in {language} or test your comprehension with the prompt chips below.
            </p>

            <div className="flex flex-wrap gap-2 max-w-md justify-center">
              {starterChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTextSubmit(chip)}
                  className="btn-press text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-slate-700 dark:text-slate-300 hover:border-emerald-600 dark:hover:border-cyan-400"
                >
                  ✦ {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-emerald-800 dark:bg-cyan-500 text-white dark:text-slate-950 font-medium rounded-tr-sm shadow-sm"
                  : "bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 font-garamond text-base sm:text-lg rounded-tl-sm shadow-sm"
              }`}
            >
              {msg.role === "assistant" ? (
                <MarkdownRenderer content={msg.content} />
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}

              {msg.audioUrl && (
                <AudioPlayer
                  src={msg.audioUrl}
                  isPlaying={currentAudioIndex === idx}
                  onPlay={() => setCurrentAudioIndex(idx)}
                  onPause={() => setCurrentAudioIndex(null)}
                />
              )}

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-white/10 text-xs font-mono text-slate-500 dark:text-slate-400">
                  Vector Sources: {msg.sources.slice(0, 2).join(", ")}
                </div>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Loader2 className="animate-spin text-emerald-700 dark:text-cyan-400" size={14} />
              <span>Synthesizing Socratic Voice & Reasoning in {language}...</span>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.01]">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`btn-press w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all shadow-sm ${
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "bg-emerald-800 dark:bg-cyan-500 text-white dark:text-slate-950 hover:bg-emerald-900 dark:hover:bg-cyan-400"
            }`}
            title={isRecording ? "Stop Recording" : "Speak to Tutor"}
          >
            {isRecording ? <Square size={16} fill="currentColor" /> : <Mic size={18} />}
          </button>

          <form
            onSubmit={(e) => { e.preventDefault(); handleTextSubmit(); }}
            className="flex-1 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask socratic tutor in ${language}...`}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:border-emerald-600 dark:focus:border-cyan-400"
              disabled={isRecording || isProcessing}
            />
            <button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="btn-press px-4 py-2.5 bg-emerald-800 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-lg text-sm font-semibold flex items-center gap-1 shadow-sm disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
        {isRecording && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <p className="text-red-500 text-xs font-mono font-bold">
              Recording your question... Tap the red square button when finished.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Teacher;
