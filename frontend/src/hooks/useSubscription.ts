import { useAuth } from "../context/AuthContext";

export type SubscriptionPlan = "free" | "pro";

export interface SubscriptionStatus {
  plan: SubscriptionPlan;
  isPro: boolean;
  canAccess: (feature: string) => boolean;
  isLoaded: boolean;
}

// Features that require Pro subscription
const PRO_FEATURES = ["teacher", "image", "sample_paper"];

export function useSubscription(): SubscriptionStatus {
  const { user, isLoaded } = useAuth();

  const metaPlan = user?.plan || "free";
  const isPro = metaPlan === "pro";
  const plan: SubscriptionPlan = isPro ? "pro" : "free";

  const canAccess = (feature: string): boolean => {
    if (!user) return false;
    if (isPro) return true;
    return !PRO_FEATURES.includes(feature);
  };

  return { plan, isPro, canAccess, isLoaded };
}
