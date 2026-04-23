import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/stripe/server';
import type { PaidTierId, BillingPeriod } from '@/config/stripe';

const VALID_TIERS: PaidTierId[] = ['desire', 'obsession', 'patron'];
const VALID_PERIODS: BillingPeriod[] = ['monthly', 'yearly'];

/* ─────────────────────────────────────────────
   POST /api/payments/create-checkout
   Creates a Stripe Checkout session and returns
   the redirect URL.
   ───────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { tierId, billingPeriod } = body as {
      tierId: string;
      billingPeriod: string;
    };

    // Validate inputs
    if (!tierId || !VALID_TIERS.includes(tierId as PaidTierId)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be one of: desire, obsession, patron' },
        { status: 400 },
      );
    }

    if (
      !billingPeriod ||
      !VALID_PERIODS.includes(billingPeriod as BillingPeriod)
    ) {
      return NextResponse.json(
        { error: 'Invalid billing period. Must be monthly or yearly' },
        { status: 400 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await createCheckoutSession(
      user.id,
      user.email || '',
      tierId as PaidTierId,
      billingPeriod as BillingPeriod,
      appUrl,
    );

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Create checkout error:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
