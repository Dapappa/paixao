import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { foundingConfig, resolveFoundingPricing } from '@/config/founding';
import { getFoundingCount } from '@/lib/founding/server';

/* ─────────────────────────────────────────────
   POST /api/founding/checkout
   Public endpoint — creates a one-time Stripe
   Checkout session for the founding membership and
   records the email on the waitlist as 'pending'.
   Payment is confirmed on the thank-you page.
   ───────────────────────────────────────────── */

const checkoutSchema = z.object({
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  city: z.string().trim().max(120).optional().or(z.literal('')),
  source: z.string().trim().max(120).optional().or(z.literal('')),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  const { email, city, source } = parsed.data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    // Resolve the live price from the current founder count. Reject if the
    // offer has sold out so we never charge for a spot that no longer exists.
    const claimed = await getFoundingCount();
    const pricing = resolveFoundingPricing(claimed);
    if (pricing.soldOut || pricing.amountCents === null) {
      return NextResponse.json(
        { error: 'Founding membership is sold out. Join the waitlist instead.' },
        { status: 410 },
      );
    }

    // Capture the lead first so we keep the email even if they abandon checkout.
    const admin = createAdminClient();
    await (admin.from('waitlist') as any).upsert(
      {
        email,
        city: city || null,
        source: source || null,
        interested_in: [],
      },
      { onConflict: 'email', ignoreDuplicates: true },
    );

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: foundingConfig.currency,
            unit_amount: pricing.amountCents,
            product_data: {
              name: foundingConfig.productName,
              description: foundingConfig.productDescription,
            },
          },
        },
      ],
      success_url: `${appUrl}/founding/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/founding?canceled=true`,
      metadata: { kind: 'founding', email },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Could not start checkout. Please try again.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Founding checkout error:', err);
    return NextResponse.json(
      { error: 'Could not start checkout. Please try again.' },
      { status: 500 },
    );
  }
}
