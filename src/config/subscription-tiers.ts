export interface TierFeature {
  label: string;
  included: boolean;
  limit?: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscount: string;
  color: "default" | "accent" | "gold";
  popular?: boolean;
  features: TierFeature[];
}

export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: "curious",
    name: "Curious",
    description: "Explore at your own pace",
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlyDiscount: "0%",
    color: "default",
    features: [
      { label: "Browse public events", included: true },
      { label: "Basic profile", included: true },
      { label: "Interest matching", included: true, limit: "5 per day" },
      { label: "Messages", included: true, limit: "10 per day" },
      { label: "Event RSVPs", included: true, limit: "2 per month" },
      { label: "Anonymous mode", included: false },
      { label: "Priority matching", included: false },
      { label: "Unlimited messages", included: false },
      { label: "Host events", included: false },
      { label: "Verified badge", included: false },
    ],
  },
  {
    id: "desire",
    name: "Desire",
    description: "Unlock deeper connections",
    monthlyPrice: 24.99,
    yearlyPrice: 170.99,
    yearlyDiscount: "43%",
    color: "accent",
    popular: true,
    features: [
      { label: "Browse public events", included: true },
      { label: "Enhanced profile", included: true },
      { label: "Interest matching", included: true, limit: "25 per day" },
      { label: "Messages", included: true, limit: "Unlimited" },
      { label: "Event RSVPs", included: true, limit: "10 per month" },
      { label: "Anonymous mode", included: true },
      { label: "Priority matching", included: true },
      { label: "Unlimited messages", included: true },
      { label: "Host events", included: false },
      { label: "Verified badge", included: false },
    ],
  },
  {
    id: "obsession",
    name: "Obsession",
    description: "For the deeply devoted",
    monthlyPrice: 99.99,
    yearlyPrice: 683.99,
    yearlyDiscount: "43%",
    color: "gold",
    features: [
      { label: "Everything in Desire", included: true },
      { label: "Premium profile badge", included: true },
      { label: "Unlimited matching", included: true },
      { label: "Unlimited RSVPs", included: true },
      { label: "Host events", included: true, limit: "5 per month" },
      { label: "Verified badge", included: true },
      { label: "Advanced filters", included: true },
      { label: "Read receipts", included: true },
      { label: "Profile analytics", included: true },
      { label: "Priority support", included: true },
    ],
  },
  {
    id: "patron",
    name: "Patron",
    description: "The ultimate experience",
    monthlyPrice: 199.99,
    yearlyPrice: 1367.99,
    yearlyDiscount: "43%",
    color: "gold",
    features: [
      { label: "Everything in Obsession", included: true },
      { label: "Exclusive patron badge", included: true },
      { label: "Unlimited event hosting", included: true },
      { label: "Create private communities", included: true },
      { label: "Invite-only event access", included: true },
      { label: "Custom profile themes", included: true },
      { label: "Concierge support", included: true },
      { label: "Early access to features", included: true },
      { label: "Revenue sharing for hosts", included: true },
      { label: "White-glove onboarding", included: true },
    ],
  },
];

/**
 * Get a tier by its ID.
 */
export function getTierById(id: string): SubscriptionTier | undefined {
  return subscriptionTiers.find((tier) => tier.id === id);
}

/**
 * Format price for display.
 */
export function formatPrice(price: number): string {
  if (price === 0) return "Free";
  return `$${price.toFixed(2)}`;
}

/**
 * Get the monthly equivalent of the yearly price.
 */
export function getYearlyMonthlyRate(tier: SubscriptionTier): number {
  if (tier.yearlyPrice === 0) return 0;
  return tier.yearlyPrice / 12;
}
