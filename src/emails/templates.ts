import { siteConfig } from "@/config/site";
import { emailShell, p, gold } from "./shell";

/**
 * Branded transactional email templates for Paixão, ready to send via Resend.
 * Each returns { subject, html, text }. Pass the recipient's first name when you
 * have it (the founding/waitlist flows only collect email, so name is optional
 * and greetings degrade gracefully). Wire-up in ./send.ts.
 */

export type EmailContent = { subject: string; html: string; text: string };

/** ", Alex" when a name is present, "" otherwise — graceful, never "Hi you". */
function comma(name?: string | null): string {
  const t = (name ?? "").trim();
  return t ? `, ${t}` : "";
}

const BASE = siteConfig.url;

/* ------------------------------------------------------------------ */
/* 1. Founding seat confirmed — sent after a successful founding payment */
/* ------------------------------------------------------------------ */
export function foundingWelcomeEmail(opts: { name?: string | null }): EmailContent {
  const c = comma(opts.name);
  const subject = "Your founding seat is yours — for good";
  const html = emailShell({
    preheader: "You're one of the first hundred. Here's what happens next.",
    eyebrow: "Founding seat confirmed",
    heading: `Welcome, ${gold("Founder.")}`,
    bodyHtml:
      p(`Thank you${c}. Your founding seat is locked in — a lifetime seat at the lowest price ${siteConfig.name} will ever offer, and a price that never moves.`) +
      p("You're one of the first hundred to set the tone for everyone after you. The moment the doors open, you walk straight in — perks ready, no line.") +
      p("We'll write the moment your first city is ready. Until then, keep this quiet. The room is better when it's discovered, not advertised."),
    cta: { label: "Return to Paixão", href: BASE },
    footnote: "Watch your inbox — the first word always goes to founders.",
  });
  const text = [
    "Welcome, Founder.",
    "",
    `Thank you${c}. Your founding seat is locked in — a lifetime seat at the lowest price ${siteConfig.name} will ever offer, and a price that never moves.`,
    "",
    "You're one of the first hundred. When the doors open, you walk straight in — perks ready, no line.",
    "",
    `Return to Paixão: ${BASE}`,
    "",
    `${siteConfig.legal.minimumAge}+ only. Questions? ${siteConfig.support.email}`,
  ].join("\n");
  return { subject, html, text };
}

/* ------------------------------------------------------------------ */
/* 2. Waitlist confirmed — sent after a free waitlist signup            */
/* ------------------------------------------------------------------ */
export function waitlistConfirmationEmail(opts: { name?: string | null }): EmailContent {
  const c = comma(opts.name);
  const subject = "Your place is held";
  const html = emailShell({
    preheader: "You're on the Paixão list. Founding seats are limited to the first hundred.",
    eyebrow: "Your place is held",
    heading: `You're ${gold("on the list.")}`,
    bodyHtml:
      p(`Thank you for joining${c}. We'll write to you as the first city draws closer.`) +
      p("If you'd rather not wait: founding seats are limited to the first hundred — a lifetime seat at a price that never moves. You can step up any time before they close.") +
      p("No noise, no spam. Only the words that matter, only when they matter."),
    cta: { label: "Claim a founding seat", href: `${BASE}/founding` },
    footnote: "The first hundred set the tone — and the seats never reopen at this price.",
  });
  const text = [
    "You're on the list.",
    "",
    `Thank you for joining${c}. We'll write to you as the first city draws closer.`,
    "",
    "Founding seats are limited to the first hundred — a lifetime seat at a price that never moves. Step up any time before they close.",
    "",
    `Claim a founding seat: ${BASE}/founding`,
    "",
    `${siteConfig.legal.minimumAge}+ only. Questions? ${siteConfig.support.email}`,
  ].join("\n");
  return { subject, html, text };
}

/* ------------------------------------------------------------------ */
/* 3. Verify email — confirm a new account                              */
/* ------------------------------------------------------------------ */
export function verifyEmail(opts: { name?: string | null; verifyUrl: string }): EmailContent {
  const c = comma(opts.name);
  const subject = "Confirm your email to step inside";
  const html = emailShell({
    preheader: "One tap confirms your email and opens the door.",
    eyebrow: "One small thing",
    heading: `Step ${gold("inside.")}`,
    bodyHtml:
      p(`Welcome${c}. Confirm your email and the room is yours — anonymous until you decide otherwise.`) +
      p("This link opens the door once and then expires. If you didn't create an account, you can ignore this — nothing happens without you."),
    cta: { label: "Confirm my email", href: opts.verifyUrl },
    footnote: "If the button doesn't work, paste this link into your browser:<br />" + opts.verifyUrl,
  });
  const text = [
    "Step inside.",
    "",
    `Welcome${c}. Confirm your email and the room is yours.`,
    "",
    `Confirm: ${opts.verifyUrl}`,
    "",
    "If you didn't create an account, ignore this email.",
  ].join("\n");
  return { subject, html, text };
}
