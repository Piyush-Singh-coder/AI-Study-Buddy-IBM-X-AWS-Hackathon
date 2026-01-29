import { useNavigate } from "react-router-dom";
import { Crown, Lock } from "lucide-react";
import { useSubscription } from "../hooks/useSubscription";

interface PaywallWrapperProps {
  feature: string;
  featureLabel: string;
  children: React.ReactNode;
}

const PaywallWrapper = ({
  feature,
  featureLabel,
  children,
}: PaywallWrapperProps) => {
  const { canAccess } = useSubscription();
  const navigate = useNavigate();

  if (canAccess(feature)) {
    return <>{children}</>;
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-neo-purple p-6 border-4 border-black shadow-neo mb-6">
        <Lock size={48} className="text-white" />
      </div>

      <h2 className="text-3xl font-black uppercase mb-4">{featureLabel}</h2>

      <div className="flex items-center space-x-2 bg-neo-yellow px-4 py-2 border-2 border-black mb-6">
        <Crown size={20} />
        <span className="font-bold uppercase text-sm">Pro Feature</span>
      </div>

      <p className="text-gray-600 font-bold max-w-md mb-8">
        Upgrade to Pro to unlock {featureLabel.toLowerCase()} and other premium
        features.
      </p>

      <button
        onClick={() => navigate("/pricing")}
        className="px-8 py-4 bg-neo-green text-black font-black uppercase text-lg border-4 border-black shadow-neo hover:shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
      >
        Upgrade to Pro
      </button>
    </div>
  );
};

export default PaywallWrapper;
