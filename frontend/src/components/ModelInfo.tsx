import React, { useEffect, useState } from "react";
import { getModels, selectModelApi } from "../services/api";
import {
  Cpu,
  Server,
  Layers,
  Image as ImageIcon,
  Mic,
  Volume2,
  Presentation,
  Loader2,
  MessageSquare,
  Zap,
  RefreshCw,
  CheckCircle2,
  Database,
  Activity
} from "lucide-react";
import toast from "react-hot-toast";
import { playAudioChime } from "../utils/theme";

const ModelInfo: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchModels = () => {
    setLoading(true);
    getModels()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleSelectModel = async (provider: string, modelId: string) => {
    setUpdating(true);
    try {
      await selectModelApi(provider, modelId);
      playAudioChime("success");
      toast.success(`Switched to ${modelId} (${provider.toUpperCase()})`);
      fetchModels();
    } catch {
      toast.error("Failed to switch model");
    } finally {
      setUpdating(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700 dark:text-cyan-400 mb-3" />
        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">Querying Model Registry & Health Status...</span>
      </div>
    );
  }

  if (!data) return <div className="p-8 font-mono text-sm text-red-500">Error connecting to model registry</div>;

  const features = data.features || {};
  const currentProvider = data.cloud_provider || "AI Engine";
  const availableProviders = data.available_providers || [];

  const getIcon = (key: string) => {
    switch (key) {
      case "chat_rag":
        return <MessageSquare className="w-4 h-4" />;
      case "embeddings":
        return <Layers className="w-4 h-4" />;
      case "image_generation":
        return <ImageIcon className="w-4 h-4" />;
      case "speech_to_text":
        return <Mic className="w-4 h-4" />;
      case "text_to_speech":
        return <Volume2 className="w-4 h-4" />;
      case "slides":
        return <Presentation className="w-4 h-4" />;
      default:
        return <Cpu className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 font-sans transition-colors p-4 sm:p-6 space-y-6">
      
      {/* Header Bar */}
      <div className="border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] rounded-xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-900 dark:bg-white/[0.08] text-white dark:text-cyan-400 flex items-center justify-center font-garamond text-xl font-bold border border-slate-700 dark:border-cyan-400/30 shadow-sm">
            <Server className="w-5 h-5 text-white dark:text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-garamond font-normal tracking-tight text-slate-900 dark:text-white">
                AI Engine & Model Hub
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-cyan-950/40 text-emerald-800 dark:text-cyan-300 border border-emerald-300 dark:border-cyan-400/30">
                <CheckCircle2 size={11} /> Live
              </span>
            </div>
            <p className="text-xs font-mono text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1">
              <span>Active Inference Provider:</span>
              <span className="font-bold text-emerald-700 dark:text-cyan-400 uppercase">
                {currentProvider}
              </span>
            </p>
          </div>
        </div>
        <button
          onClick={() => { playAudioChime("click"); fetchModels(); }}
          className="btn-press self-start sm:self-auto px-3.5 py-2 rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-white/[0.04] text-xs font-mono font-semibold flex items-center gap-2 hover:border-emerald-600 dark:hover:border-cyan-400 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Registry</span>
        </button>
      </div>

      {/* Architecture Highlights Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.015]">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono mb-1">
            <Zap size={13} className="text-amber-500" />
            <span>LLM Backbone</span>
          </div>
          <div className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate">
            {data.active_model || "gemini-2.5-flash"}
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.015]">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono mb-1">
            <Database size={13} className="text-emerald-600 dark:text-cyan-400" />
            <span>Vector Engine</span>
          </div>
          <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
            Neon PGVector
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.015]">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono mb-1">
            <Layers size={13} className="text-purple-500" />
            <span>Embedding Dim</span>
          </div>
          <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
            768 Dimensions
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.015]">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono mb-1">
            <Activity size={13} className="text-emerald-500" />
            <span>Latency Target</span>
          </div>
          <div className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
            &lt; 380ms P95
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Dynamic Provider & Model Switcher */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="font-garamond text-xl font-normal tracking-tight text-slate-900 dark:text-white">
              Switch Inference Model
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableProviders.map((prov: any) => {
              const isSelected = data.cloud_provider === prov.id;
              return (
                <div
                  key={prov.id}
                  className={`p-5 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-emerald-50/60 dark:bg-cyan-950/20 border-emerald-600 dark:border-cyan-400 shadow-sm"
                      : "bg-white dark:bg-white/[0.025] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{prov.name}</h4>
                      <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5">{prov.model}</p>
                    </div>
                    {isSelected ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-700 dark:bg-cyan-400 text-white dark:text-black">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                        Standby
                      </span>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{prov.cost}</span>
                    {!isSelected && (
                      <button
                        onClick={() => handleSelectModel(prov.id, prov.model)}
                        disabled={updating}
                        className="btn-press px-3 py-1 rounded bg-slate-900 dark:bg-cyan-400 text-white dark:text-black font-semibold text-xs hover:bg-emerald-800 dark:hover:bg-cyan-300 disabled:opacity-50 transition-colors"
                      >
                        Select Engine
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Pipeline Matrix */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-emerald-700 dark:text-cyan-400" />
            <h3 className="font-garamond text-xl font-normal tracking-tight text-slate-900 dark:text-white">
              Inference Pipeline Matrix
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(features).map(([key, info]: [string, any]) => (
              <div
                key={key}
                className="bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-cyan-950/40 text-emerald-800 dark:text-cyan-300 border border-emerald-200 dark:border-cyan-400/30">
                      {getIcon(key)}
                    </div>
                    <span className="font-mono text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 truncate">
                      {key.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                    {info.model}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                    {info.notes}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500 dark:text-slate-400">{info.provider}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-cyan-400"></span>
                    Tier Ready
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ModelInfo;
