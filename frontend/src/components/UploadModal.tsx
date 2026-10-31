import React, { useState, useEffect, useRef } from "react";
import { X, Upload, FileText, Loader2, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { uploadFiles, getOrCreateSession, getSessionDocuments } from "../services/api";
import { playAudioChime } from "../utils/theme";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingDocNames?: string[];
  onUploadSuccess?: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  existingDocNames = [],
  onUploadSuccess,
}) => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [error, setError] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setDuplicateWarning(null);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !isLoading) {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const incomingFiles = Array.from(e.target.files);
      const newFiles: File[] = [];
      const duplicates: string[] = [];

      for (const file of incomingFiles) {
        // Check if already in current selection or already indexed in session
        const alreadyInSelection = files.some((f) => f.name === file.name);
        const alreadyIndexed = existingDocNames.includes(file.name);

        if (alreadyInSelection || alreadyIndexed) {
          duplicates.push(file.name);
        } else {
          newFiles.push(file);
        }
      }

      if (duplicates.length > 0) {
        setDuplicateWarning(
          `Skipped ${duplicates.length} duplicate file(s) already indexed: ${duplicates.join(", ")}`
        );
      } else {
        setDuplicateWarning(null);
      }

      if (newFiles.length > 0) {
        setFiles((prev) => [...prev, ...newFiles]);
        playAudioChime("click");
      }
    }
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    playAudioChime("click");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError("Please select at least one document or audio recording to index.");
      return;
    }

    setIsLoading(true);
    setLoadingStatus("INITIALIZING SECURE SESSION...");
    setError("");
    setDuplicateWarning(null);
    playAudioChime("click");

    try {
      let sessionId = localStorage.getItem("study_session_id");
      if (!sessionId) {
        const resSession = await getOrCreateSession();
        sessionId = typeof resSession === "string" ? resSession : resSession?.session_id;
        if (!sessionId) throw new Error("Could not initialize session.");
        localStorage.setItem("study_session_id", sessionId);
      }

      setLoadingStatus("EXTRACTING & VECTORIZING INTO PGVECTOR...");
      const uploadRes: any = await uploadFiles(files, sessionId);

      if (uploadRes?.skipped_count > 0 && uploadRes?.processed_count === 0) {
        toast("File(s) were already indexed; duplicate re-embedding skipped.", { icon: "ℹ️" });
      }

      setLoadingStatus("FINALIZING VECTOR INDEX...");
      // Fast poll verification
      let attempts = 0;
      while (attempts < 8) {
        try {
          const docData = await getSessionDocuments(sessionId);
          if (docData && docData.documents && docData.documents.length > 0) {
            break;
          }
        } catch {
          // ignore
        }
        attempts++;
        await new Promise((r) => setTimeout(r, 600));
      }

      playAudioChime("success");
      setFiles([]);
      onClose();

      if (onUploadSuccess) {
        onUploadSuccess();
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.detail || err?.message || "Ingestion failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 modal-backdrop-smooth flex items-center justify-center z-[100] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          playAudioChime("click");
          onClose();
        }
      }}
    >
      <div className="modal-card-smooth bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/15 rounded-2xl shadow-xl max-w-lg w-full p-6 sm:p-7 relative text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-cyan-400 animate-pulse"></span>
            <span className="font-mono text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold">
              Multi-Modal Vector Ingestion
            </span>
          </div>
          <button
            onClick={() => { playAudioChime("click"); onClose(); }}
            disabled={isLoading}
            className="btn-press w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <h2 className="font-garamond text-2xl sm:text-3xl font-normal tracking-tight mb-1 text-slate-900 dark:text-white">
          Ingest Study Materials
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-5 font-normal">
          Manuscripts are chunked into 500-token windows and indexed into Neon PGVector with duplicate detection.
        </p>

        {duplicateWarning && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 p-3 rounded-lg text-xs font-mono flex items-start gap-2">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            <span>{duplicateWarning}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-emerald-600 dark:hover:border-cyan-400 rounded-xl bg-slate-50 dark:bg-white/[0.02] p-7 text-center transition-colors cursor-pointer group"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <Upload
                className="text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-cyan-400 mb-2 group-hover:scale-105 transition-all"
                size={34}
              />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Drop manuscripts here or click to browse
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                PDF • DOCX • TXT • MD • MP3 • WAV • OCR Scans
              </span>
            </div>
          </div>

          {/* Files List Preview */}
          {files.length > 0 && (
            <div className="space-y-1.5 max-h-44 overflow-y-auto custom-scrollbar pr-1">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText size={15} className="text-emerald-700 dark:text-cyan-400 flex-shrink-0" />
                    <span className="font-medium truncate max-w-[260px] text-slate-800 dark:text-slate-200">
                      {file.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-700 dark:text-cyan-400 hover:underline pt-1"
              >
                <Plus size={13} />
                <span>Append additional files</span>
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs font-mono">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || files.length === 0}
            className="btn-press w-full py-3 bg-emerald-800 dark:bg-cyan-500 text-white dark:text-slate-950 font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-900 dark:hover:bg-cyan-400 disabled:opacity-40 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span className="font-mono text-xs">{loadingStatus}</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Initiate Vector Indexing & Ingestion →</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default UploadModal;
