/**
 * Stripe price ID configuration.
 *
 * Each paid tier has a monthly and yearly price ID, sourced from environment
 * variables. Configure these in Stripe Dashboard → Products → Prices, then
 * paste the `price_xxx` IDs into .env.local.
 */
export const stripePrices = {
  desire: {
    monthly: process.env.STRIPE_PRICE_DESIRE_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_DESIRE_YEARLY || '',
  },
  obsession: {
    monthly: process.env.STRIPE_PRICE_OBSESSION_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_OBSESSION_YEARLY || '',
  },
  patron: {
    monthly: process.env.STRIPE_PRICE_PATRON_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_PATRON_YEARLY || '',
  },
} as const;

export type PaidTierId = keyof typeof stripePrices;
export type BillingPeriod = 'monthly' | 'yearly';

/**
 * Look up the Stripe price ID for a given tier and billing period.
 */
export function getStripePriceId(
  tierId: PaidTierId,
  billingPeriod: BillingPeriod,
): string {
  const tierPrices = stripePrices[tierId];
  if (!tierPrices) {
    throw new Error(`Unknown tier: ${tierId}`);
  }
  const priceId = tierPrices[billingPeriod];
  if (!priceId) {
    throw new Error(
      `No Stripe price ID configured for ${tierId} ${billingPeriod}. ` +
        `Set STRIPE_PRICE_${tierId.toUpperCase()}_${billingPeriod.toUpperCase()} in .env.local`,
    );
  }
  return priceId;
}
