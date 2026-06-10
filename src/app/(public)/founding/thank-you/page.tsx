import Link from "next/link";
import { Crown, EnvelopeOpen, ArrowLeft } from "@phosphor-icons/react/ssr";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: `Welcome, Founder | ${siteConfig.name}`,
};

export const dynamic = "force-dynamic";

/**
 * Confirm a founding payment server-side and record it. Returns the founder's
 * email on success, or null if the session is missing/unpaid. Idempotent:
 * upserts the waitlist row to founding status.
 */
async function confirmFounding(sessionId: string): Promise<string | null> {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") return null;

    const email =
      session.customer_email ??
      session.customer_details?.email ??
      (session.metadata?.email as string | undefined) ??
      null;
    if (!email) return null;

    const admin = createAdminClient();
    await (admin.from("waitlist") as any).upsert(
      {
        email: email.toLowerCase(),
        status: "founding",
        is_founding: true,
        founding_paid_at: new Date().toISOString(),
        stripe_session_id: session.id,
        amount_cents: session.amount_total,
        currency: session.currency,
      },
      { onConflict: "email" },
    );

    return email;
  } catch (err) {
    console.error("Founding confirmation error:", err);
    return null;
  }
}

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; type?: string }>;
}) {
  const { session_id, type } = await searchParams;

  let founderEmail: string | null = null;
  if (session_id) {
    founderEmail = await confirmFounding(session_id);
  }

  const isFounder = Boolean(founderEmail);
  const isWaitlist = type === "waitlist" || (!isFounder && !session_id);

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.07] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-lg rounded-2xl border border-border/60 bg-surface/60 p-10 text-center backdrop-blur-sm">
        <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-muted">
          {isFounder ? (
            <Crown className="h-7 w-7 text-gold" weight="duotone" />
          ) : (
            <EnvelopeOpen className="h-7 w-7 text-accent" weight="duotone" />
          )}
        </div>

        {isFounder ? (
          <>
            <h1 className="font-serif text-3xl font-bold tracking-tight">
              Welcome, Founder.
            </h1>
            <p className="mt-4 text-text-secondary">
              Your founding membership is confirmed. You&apos;re one of the first
              to walk into the Passion Den. We&apos;ll email{" "}
              <span className="text-foreground">{founderEmail}</span> the moment
              doors open — with your founder perks ready.
            </p>
          </>
        ) : isWaitlist ? (
          <>
            <h1 className="font-serif text-3xl font-bold tracking-tight">
              You&apos;re on the list.
            </h1>
            <p className="mt-4 text-text-secondary">
              Thank you for joining the Paixão waitlist. We&apos;ll be in touch as
              we get closer to launch. Founding spots are limited — upgrade
              anytime to lock in lifetime perks.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-3xl font-bold tracking-tight">
              We couldn&apos;t confirm that.
            </h1>
            <p className="mt-4 text-text-secondary">
              Your payment may still be processing, or the link was incomplete. If
              you were charged, you&apos;re covered — email{" "}
              <a href={`mailto:${siteConfig.support.email}`} className="text-accent underline">
                {siteConfig.support.email}
              </a>{" "}
              and we&apos;ll sort it out right away.
            </p>
          </>
        )}

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" weight="bold" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
