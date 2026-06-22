import Link from "next/link";
import { Crown, EnvelopeOpen, ArrowRight } from "@phosphor-icons/react/ssr";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/config/site";
import { RevealText, UnlockSeal } from "@/components/marketing/motion-primitives";
import { sendEmail, foundingWelcomeEmail } from "@/emails";

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

    // Only email on the first transition to founding (page can be reloaded).
    const { data: prior } = await (admin.from("waitlist") as any)
      .select("is_founding")
      .eq("email", email.toLowerCase())
      .maybeSingle();
    const alreadyFounding = prior?.is_founding === true;

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

    // Fire-and-forget the founder welcome (non-blocking; safe if Resend unset).
    if (!alreadyFounding && process.env.RESEND_API_KEY) {
      sendEmail(email, foundingWelcomeEmail({})).catch((e) =>
        console.error("Founding email failed:", e instanceof Error ? e.message : e),
      );
    }

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

  /* One earned payoff per state: eyebrow, masked-reveal headline, body, a single next step. */
  const headlineLines = isFounder
    ? [
        { text: "Welcome,", className: "text-foreground" },
        { text: "Founder.", className: "text-gradient-brand" },
      ]
    : isWaitlist
      ? [
          { text: "You’re", className: "text-foreground" },
          { text: "on the list.", className: "text-gradient-brand" },
        ]
      : [
          { text: "Almost", className: "text-foreground" },
          { text: "there.", className: "text-gradient-brand" },
        ];

  const eyebrow = isFounder
    ? "Founding seat confirmed"
    : isWaitlist
      ? "Your place is held"
      : "One small thing";

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-24 sm:py-28">
      {/* ── Ambient aura backdrop (Velvet Aura) ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="aura-field absolute inset-0 animate-aura-drift opacity-70" />
        <div className="absolute left-1/2 top-1/3 h-[560px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.06] blur-[150px]" />
        <div className="absolute bottom-[-12%] right-[-6%] h-[440px] w-[600px] rounded-full bg-accent/[0.05] blur-[130px]" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-screen blur-[2px]"
          style={{ backgroundImage: "url(/generated/hero-aura.webp)" }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-xl text-center">
        {/* ── Cinematic unlock seal — the earned payoff ── */}
        <div className="mb-9">
          <UnlockSeal>
            {isFounder ? (
              <Crown className="h-7 w-7 text-gold" weight="duotone" />
            ) : (
              <EnvelopeOpen className="h-7 w-7 text-gold" weight="duotone" />
            )}
          </UnlockSeal>
        </div>

        <span className="inline-block text-xs font-medium uppercase tracking-[0.34em] text-gold">
          {eyebrow}
        </span>

        <RevealText
          className="mt-5 block font-serif text-[clamp(2.25rem,7vw,3.75rem)] font-medium leading-[1.05] tracking-[-0.02em]"
          delay={0.1}
          lines={headlineLines}
        />

        {isFounder ? (
          <p className="mx-auto mt-7 max-w-md text-lg leading-relaxed text-text-secondary">
            Your founding seat is yours for good. You&apos;re one of the first
            hundred to set the tone for everyone after you. The moment the doors
            open, we&apos;ll write to{" "}
            <span className="text-foreground">{founderEmail}</span> — perks ready,
            no waiting in line.
          </p>
        ) : isWaitlist ? (
          <p className="mx-auto mt-7 max-w-md text-lg leading-relaxed text-text-secondary">
            Thank you for joining the Paixão waitlist. We&apos;ll write to you as
            the first city draws closer. Founding seats are limited to the first
            hundred — you can step up to a lifetime seat any time before they
            close.
          </p>
        ) : (
          <p className="mx-auto mt-7 max-w-md text-lg leading-relaxed text-text-secondary">
            Your payment may still be settling, or the link arrived incomplete.
            If you were charged, you&apos;re covered — write to{" "}
            <a
              href={`mailto:${siteConfig.support.email}`}
              className="text-gold underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {siteConfig.support.email}
            </a>{" "}
            and we&apos;ll set it right straight away.
          </p>
        )}

        {/* ── A single clear next step ── */}
        <div className="mt-10 flex flex-col items-center gap-5">
          {isFounder ? (
            <>
              <Link
                href="/"
                className="group inline-flex min-w-[210px] items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-white shadow-glow-accent transition-transform hover:scale-[1.02]"
              >
                Return to Paixão
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" weight="bold" />
              </Link>
              <p className="text-xs text-text-secondary">
                Watch your inbox — the first word goes out to founders.
              </p>
            </>
          ) : isWaitlist ? (
            <>
              <Link
                href="/founding"
                className="group inline-flex min-w-[210px] items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-white shadow-glow-accent transition-transform hover:scale-[1.02]"
              >
                Claim a founding seat
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" weight="bold" />
              </Link>
              <Link
                href="/"
                className="text-sm text-text-secondary underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Back to home
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/founding"
                className="group inline-flex min-w-[210px] items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-white shadow-glow-accent transition-transform hover:scale-[1.02]"
              >
                Try again
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" weight="bold" />
              </Link>
              <Link
                href="/"
                className="text-sm text-text-secondary underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Back to home
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Atmosphere overlays (fixed, non-interactive) ── */}
      <div className="vignette" aria-hidden />
      <div className="film-grain" aria-hidden />
    </div>
  );
}
