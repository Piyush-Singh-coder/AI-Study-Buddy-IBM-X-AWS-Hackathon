import { useEffect } from "react";
import { X, Crown, Check } from "lucide-react";
import { PricingTable } from "@clerk/clerk-react";
import { useSubscription } from "../hooks/useSubscription";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
}

const UpgradeModal = ({ isOpen, onClose, feature }: UpgradeModalProps) => {
  const { isPro } = useSubscription();

  // Auto-close modal if user upgrades successfully
  useEffect(() => {
    if (isPro && isOpen) {
      onClose();
    }
  }, [isPro, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center z-[100] p-4 overflow-y-auto items-start pt-10 md:pt-20">
      <div className="bg-white border-4 border-black shadow-neo-lg max-w-5xl w-full relative mb-10">
        {/* Header */}
        <div className="bg-neo-purple p-6 border-b-4 border-black">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white border-2 border-black hover:bg-gray-100"
          >
            <X size={20} />
          </button>
          <div className="flex items-center space-x-3">
            <div className="bg-neo-yellow p-3 border-2 border-black">
              <Crown size={28} className="text-black" />
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-black uppercase">Upgrade to Pro</h2>
              <p className="text-sm font-bold opacity-90">
                Unlock {feature} and all premium features
              </p>
            </div>
          </div>
        </div>

        {/* Clerk Pricing Table */}
        <div className="p-6">
          <div className="bg-neo-yellow/20 border-2 border-black p-4 mb-6">
            <p className="font-bold text-sm flex items-center gap-2">
              <Crown size={16} />
              <span className="uppercase">{feature}</span> is a Pro feature
            </p>
          </div>

          {/* Pro Features List */}
          <div className="mb-6">
            <h3 className="font-black text-lg mb-4 uppercase">Pro includes:</h3>
            <ul className="grid grid-cols-2 gap-3">
              {[
                "🎙️ AI Teacher with Voice",
                "🖼️ Image Generation",
                "📄 Sample Paper Generator",
                "🚀 Priority Processing",
              ].map((f, i) => (
                <li key={i} className="flex items-center space-x-2 font-bold">
                  <Check size={16} className="text-neo-green" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Clerk's Built-in Pricing Table */}
          <div className="border-4 border-black p-4 bg-gray-50">
            <PricingTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
