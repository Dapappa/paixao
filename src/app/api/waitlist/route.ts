import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

/* ─────────────────────────────────────────────
   POST /api/waitlist
   Public endpoint — captures a free waitlist signup.
   Writes via the service-role admin client (waitlist
   table is RLS-locked to server-side only).
   ───────────────────────────────────────────── */

const waitlistSchema = z.object({
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  city: z.string().trim().max(120).optional().or(z.literal('')),
  interestedIn: z.array(z.enum(['events', 'matchmaking'])).optional(),
  source: z.string().trim().max(120).optional().or(z.literal('')),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  const { email, city, interestedIn, source } = parsed.data;

  try {
    const admin = createAdminClient();

    // Upsert by email so a repeat signup is idempotent and never downgrades an
    // existing founding member back to 'pending'.
    const { error } = await (admin.from('waitlist') as any).upsert(
      {
        email,
        city: city || null,
        interested_in: interestedIn ?? [],
        source: source || null,
      },
      { onConflict: 'email', ignoreDuplicates: true },
    );

    if (error) {
      console.error('Waitlist insert error:', error);
      return NextResponse.json(
        { error: 'Could not join the waitlist. Please try again.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Waitlist route error:', err);
    return NextResponse.json(
      { error: 'Service unavailable. Please try again shortly.' },
      { status: 503 },
    );
  }
}
