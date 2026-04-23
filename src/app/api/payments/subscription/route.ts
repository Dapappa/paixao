import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/* ─────────────────────────────────────────────
   GET /api/payments/subscription
   Returns the current user's subscription info
   and recent payment history.
   ───────────────────────────────────────────── */

export async function GET() {
  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get subscription tier from profile
    const { data: profile, error: profileError } = await (
      supabase.from('profiles') as any
    )
      .select('subscription_tier, subscription_expires_at')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 },
      );
    }

    // Get recent payments
    const { data: payments, error: paymentsError } = await (
      supabase.from('payments') as any
    )
      .select(
        'id, amount_cents, currency, payment_type, status, created_at, stripe_payment_intent_id',
      )
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (paymentsError) {
      console.error('Payments fetch error:', paymentsError);
    }

    return NextResponse.json({
      tier: profile?.subscription_tier ?? 'free',
      expires_at: profile?.subscription_expires_at ?? null,
      payments: payments ?? [],
    });
  } catch (err) {
    console.error('Subscription GET error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
