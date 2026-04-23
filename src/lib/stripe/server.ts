import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  getStripePriceId,
  type PaidTierId,
  type BillingPeriod,
} from '@/config/stripe';

/* ───────────────────────────────────────────────
   Stripe singleton
   ─────────────────────────────────────────────── */

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }
    stripeInstance = new Stripe(key, {
      apiVersion: '2026-03-25.dahlia',
      typescript: true,
    });
  }
  return stripeInstance;
}

/* ───────────────────────────────────────────────
   Checkout & Portal sessions
   ─────────────────────────────────────────────── */

export async function createCheckoutSession(
  userId: string,
  email: string,
  tierId: PaidTierId,
  billingPeriod: BillingPeriod,
  returnUrl: string,
) {
  const stripe = getStripe();
  const priceId = getStripePriceId(tierId, billingPeriod);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/settings/billing?success=true`,
    cancel_url: `${appUrl}/pricing?canceled=true`,
    metadata: {
      user_id: userId,
      tier_id: tierId,
    },
  });

  return session;
}

export async function createPortalSession(
  customerId: string,
  returnUrl: string,
) {
  const stripe = getStripe();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/* ───────────────────────────────────────────────
   Subscription lifecycle handlers
   ─────────────────────────────────────────────── */

export async function handleSubscriptionActive(
  subscription: Stripe.Subscription,
  userId: string,
  tierId: string,
) {
  const admin = createAdminClient();

  // In Stripe v22+ (2026 API), compute the next billing date from items
  // or fall back to billing_cycle_anchor + 1 month/year.
  let expiresAt: string;

  // Try to get period end from the first subscription item
  const firstItem = subscription.items?.data?.[0];
  if (firstItem && 'current_period_end' in firstItem) {
    expiresAt = new Date(
      ((firstItem as unknown as Record<string, unknown>).current_period_end as number) * 1000,
    ).toISOString();
  } else {
    // Fallback: use cancel_at if set, otherwise billing_cycle_anchor + 30 days
    const ts = subscription.cancel_at ?? subscription.billing_cycle_anchor;
    const fallbackDate = new Date(ts * 1000);
    if (!subscription.cancel_at) {
      // Approximate next billing: 30 days from anchor
      fallbackDate.setDate(fallbackDate.getDate() + 30);
    }
    expiresAt = fallbackDate.toISOString();
  }

  await (admin.from('profiles') as any)
    .update({
      subscription_tier: tierId,
      subscription_expires_at: expiresAt,
    })
    .eq('id', userId);
}

export async function handleSubscriptionCanceled(userId: string) {
  const admin = createAdminClient();

  await (admin.from('profiles') as any)
    .update({
      subscription_tier: 'free',
      subscription_expires_at: null,
    })
    .eq('id', userId);
}
