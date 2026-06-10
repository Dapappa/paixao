/**
 * Founding-member pre-sale configuration — ESCALATING tiers.
 *
 * Price rises as founding spots fill, creating real urgency ("lock in the
 * lowest price before it's gone"). Each tier is a lifetime one-time payment via
 * Stripe Checkout (`payment` mode) using inline `price_data`, so the only setup
 * needed is a valid STRIPE_SECRET_KEY — no pre-created Stripe products.
 *
 * Default ladder (override the cents amounts via env):
 *   • Founders   1–100  → CA$39
 *   • Founders 101–200  → CA$139
 *   • Founders 201–300  → CA$499
 *   • After 300         → closed (not available)
 */
export const foundingConfig = {
  /** ISO currency code. Alberta-first launch → CAD. */
  currency: (process.env.FOUNDING_CURRENCY || 'cad').toLowerCase(),
  productName: 'Paixão Founding Membership',
  productDescription:
    'Lifetime founding-member status, locked-in pricing, priority access to events, and a voice in shaping the room.',
  perks: [
    'Lifetime founding-member badge',
    'Locked-in lifetime pricing — never pay more',
    'Priority access & guest list at every launch event',
    'Private founders channel + direct line to the team',
    'Shape the platform: vote on features and first cities',
  ],
  /**
   * Escalating tiers, ordered. `upTo` is the cumulative founder count at which
   * the tier closes. A buyer pays the FIRST tier whose `upTo` exceeds the
   * current claimed count.
   */
  tiers: [
    { upTo: 100, amountCents: Number(process.env.FOUNDING_PRICE_1) || 3900 },
    { upTo: 200, amountCents: Number(process.env.FOUNDING_PRICE_2) || 13900 },
    { upTo: 300, amountCents: Number(process.env.FOUNDING_PRICE_3) || 49900 },
  ],
} as const;

/** Total founding spots before the offer closes entirely. */
export const foundingCap = foundingConfig.tiers[foundingConfig.tiers.length - 1].upTo;

export interface FoundingPricing {
  /** True when every tier is full — no more founding spots. */
  soldOut: boolean;
  /** Cents charged to the next buyer (null when sold out). */
  amountCents: number | null;
  /** Founder count at which the current price rises (null if last/closed). */
  nextThresholdAt: number | null;
  /** The price after the next threshold (null if last/closed). */
  nextAmountCents: number | null;
  /** Spots left in the current price band (null when sold out). */
  remainingInBand: number | null;
  /** Spots left overall before the offer closes. */
  remainingOverall: number;
}

/**
 * Resolve the active pricing for a given number of already-claimed founders.
 * Pure function — both the page and the checkout route call this so the
 * displayed price and the charged price can never drift apart.
 */
export function resolveFoundingPricing(claimed: number): FoundingPricing {
  const tiers = foundingConfig.tiers;
  const remainingOverall = Math.max(foundingCap - claimed, 0);

  for (let i = 0; i < tiers.length; i++) {
    if (claimed < tiers[i].upTo) {
      const next = tiers[i + 1];
      return {
        soldOut: false,
        amountCents: tiers[i].amountCents,
        nextThresholdAt: next ? tiers[i].upTo : null,
        nextAmountCents: next ? next.amountCents : null,
        remainingInBand: tiers[i].upTo - claimed,
        remainingOverall,
      };
    }
  }

  return {
    soldOut: true,
    amountCents: null,
    nextThresholdAt: null,
    nextAmountCents: null,
    remainingInBand: null,
    remainingOverall: 0,
  };
}

/** Display helper: format a cents amount as e.g. "CA$39". */
export function formatFoundingPrice(amountCents: number): string {
  const symbol = foundingConfig.currency === 'cad' ? 'CA$' : '$';
  const whole = amountCents / 100;
  const value = Number.isInteger(whole) ? whole.toString() : whole.toFixed(2);
  return `${symbol}${value}`;
}
