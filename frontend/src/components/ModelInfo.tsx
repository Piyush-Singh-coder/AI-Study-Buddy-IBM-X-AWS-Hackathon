import React, { useEffect, useState } from "react";
import { getModels } from "../services/api";
import {
  Cpu,
  Server,
  Layers,
  Image,
  Mic,
  Volume2,
  Presentation,
  Loader2,
} from "lucide-react";

interface ModelInfoProps {
  // No props needed
}

const ModelInfo: React.FC<ModelInfoProps> = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getModels()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (!data) return <div>Error loading models</div>;

  const features = data.features;
  const region = data.region;

  const getIcon = (key: string) => {
    switch (key) {
      case "conversational_ai":
        return <MessageSquare className="w-5 h-5" />;
      case "embeddings":
        return <Layers className="w-5 h-5" />;
      case "image_generation":
        return <Image className="w-5 h-5" />;
      case "speech_recognition":
        return <Mic className="w-5 h-5" />;
      case "text_to_speech":
        return <Volume2 className="w-5 h-5" />;
      case "slide_generation":
        return <Presentation className="w-5 h-5" />;
      default:
        return <Cpu className="w-5 h-5" />;
    }
  };

  // Need to import MessageSquare locally or use lucide-react one
  // I actually just used lucide-react above. Let me add MessageSquare to imports.

  return (
    <div className="h-full flex flex-col bg-white border-2 border-black shadow-neo font-sans">
      {/* Header */}
      <div className="p-6 border-b-2 border-black bg-neo-green text-black">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white border-2 border-black shadow-neo-sm">
            <Server className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase text-stroke-sm text-white drop-shadow-[2px_2px_0px_black]">
              System Status
            </h2>
            <p className="font-bold text-sm">
              Active Models & Cloud Region: {region}
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-6 bg-white pattern-dots">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(features).map(([key, info]: [string, any]) => (
            <div
              key={key}
              className="bg-white border-2 border-black shadow-neo p-4 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              <div className="flex items-center gap-3 mb-3 border-b-2 border-black pb-2">
                <div className="p-2 bg-neo-yellow border-2 border-black">
                  {getIcon(key)}
                </div>
                <h3 className="font-black uppercase text-sm leading-tight">
                  {info.name}
                </h3>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-bold text-gray-500 text-xs uppercase block">
                    Provider
                  </span>
                  <span className="font-bold">{info.provider}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-500 text-xs uppercase block">
                    Model ID
                  </span>
                  <code className="bg-gray-100 border border-black px-1 py-0.5 rounded text-xs font-mono">
                    {info.model_id}
                  </code>
                </div>
                <div>
                  <p className="text-gray-600 text-xs mt-2 border-t border-gray-200 pt-2 italic">
                    {info.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="font-bold text-gray-400 uppercase text-xs tracking-widest">
            POWERED BY AWS BEDROCK
          </p>
        </div>
      </div>
    </div>
  );
};
import { MessageSquare } from "lucide-react"; // Import missing icon

export default ModelInfo;
