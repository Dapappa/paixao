import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/* ─────────────────────────────────────────────
   POST /api/payments/cancel
   Cancel subscription (placeholder — in production
   this would call Stripe's API to cancel the
   subscription, and the webhook would handle the
   actual tier downgrade).
   ───────────────────────────────────────────── */

export async function POST() {
  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Placeholder: directly reset to free tier
    const { error } = await (supabase.from('profiles') as any)
      .update({
        subscription_tier: 'free',
        subscription_expires_at: null,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Cancel subscription error:', error);
      return NextResponse.json(
        { error: 'Failed to cancel subscription' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, tier: 'free' });
  } catch (err) {
    console.error('Cancel POST error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
