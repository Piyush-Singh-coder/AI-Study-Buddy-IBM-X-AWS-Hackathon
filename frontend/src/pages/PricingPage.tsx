import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { ArrowLeft, Crown, Check, Sparkles, Loader2 } from "lucide-react";

const PricingPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [upgrading, setUpgrading] = useState(false);

  const features = {
    free: [
      "💬 AI Chat with Documents",
      "📋 Smart Summaries",
      "📝 Quiz Generator",
      "📊 Slides Creator",
      "📤 Upload PDFs & Audio",
    ],
    pro: [
      "🎙️ AI Teacher with Voice",
      "🖼️ Image Generation",
      "📄 Sample Paper Generator",
      "🚀 Priority Processing",
      "💎 Everything in Free",
    ],
  };

  // Demo upgrade function - sets unsafeMetadata for hackathon demo
  const handleDemoUpgrade = async () => {
    if (!user) return;
    setUpgrading(true);
    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          plan: "pro",
          upgradedAt: new Date().toISOString(),
        },
      });
      // Navigate back to dashboard after upgrade
      navigate("/dashboard");
    } catch (error) {
      console.error("Upgrade failed:", error);
    } finally {
      setUpgrading(false);
    }
  };

  const currentPlan =
    (user?.unsafeMetadata?.plan as string) ||
    (user?.publicMetadata?.plan as string) ||
    "free";

  return (
    <div className="min-h-screen bg-neo-yellow pattern-dots">
      {/* Header */}
      <header className="bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-2 font-bold hover:underline"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
          {currentPlan === "pro" && (
            <div className="bg-neo-green px-4 py-2 border-2 border-black font-black text-sm">
              ✓ YOU ARE PRO
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-6 text-center">
        <div className="inline-flex items-center space-x-2 bg-white border-2 border-black px-4 py-2 mb-6 shadow-neo-sm">
          <Sparkles size={20} className="text-neo-purple" />
          <span className="font-bold text-sm uppercase">Choose Your Plan</span>
        </div>

        <h1 className="text-5xl font-black uppercase mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl font-bold text-gray-700 max-w-2xl mx-auto">
          Start free, upgrade when you need more power.
        </p>
      </section>

      {/* Feature Comparison */}
      <section className="pb-8 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <div
            className={`bg-white border-4 border-black p-6 shadow-neo ${currentPlan === "free" ? "ring-4 ring-neo-blue" : ""}`}
          >
            <h3 className="text-2xl font-black uppercase mb-2">Free</h3>
            <p className="text-gray-600 font-bold mb-4">
              Perfect to get started
            </p>
            <div className="text-4xl font-black mb-6">
              $0 <span className="text-lg font-bold text-gray-500">/month</span>
            </div>
            <ul className="space-y-3 mb-6">
              {features.free.map((f, i) => (
                <li key={i} className="flex items-center space-x-2 font-bold">
                  <Check size={18} className="text-neo-green" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {currentPlan === "free" && (
              <div className="text-center py-2 bg-gray-100 border-2 border-black font-bold">
                Current Plan
              </div>
            )}
          </div>

          {/* Pro Plan */}
          <div
            className={`bg-neo-purple text-white border-4 border-black p-6 shadow-neo relative ${currentPlan === "pro" ? "ring-4 ring-neo-yellow" : ""}`}
          >
            <div className="absolute -top-3 -right-3 bg-neo-yellow text-black px-3 py-1 border-2 border-black font-black text-sm">
              POPULAR
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <Crown size={24} />
              <h3 className="text-2xl font-black uppercase">Pro</h3>
            </div>
            <p className="opacity-90 font-bold mb-4">For serious students</p>
            <div className="text-4xl font-black mb-6">
              $9 <span className="text-lg font-bold opacity-75">/month</span>
            </div>
            <ul className="space-y-3 mb-6">
              {features.pro.map((f, i) => (
                <li key={i} className="flex items-center space-x-2 font-bold">
                  <Check size={18} className="text-neo-yellow" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <SignedIn>
              {currentPlan === "pro" ? (
                <div className="text-center py-3 bg-white text-black border-2 border-black font-black">
                  ✓ Active Plan
                </div>
              ) : (
                <button
                  onClick={handleDemoUpgrade}
                  disabled={upgrading}
                  className="w-full py-4 bg-neo-green text-black font-black uppercase border-4 border-black shadow-neo hover:shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
                >
                  {upgrading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      Processing...
                    </span>
                  ) : (
                    "Upgrade to Pro — Demo"
                  )}
                </button>
              )}
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Sign In Prompt for Signed Out Users */}
      <SignedOut>
        <section className="py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border-4 border-black p-8 shadow-neo text-center">
              <h3 className="text-xl font-black uppercase mb-4">
                Sign in to Subscribe
              </h3>
              <p className="font-bold text-gray-600 mb-6">
                Create an account or sign in to choose a plan.
              </p>
              <Link
                to="/sign-up"
                className="inline-block px-8 py-4 bg-neo-green text-black font-black uppercase border-4 border-black shadow-neo hover:shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </section>
      </SignedOut>

      {/* Demo Note */}
      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-bold text-gray-600">
            * This is a hackathon demo. Click "Upgrade to Pro — Demo" to
            simulate the upgrade flow.
          </p>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
