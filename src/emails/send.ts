import { siteConfig } from "@/config/site";
import type { EmailContent } from "./templates";

/**
 * Thin Resend wrapper. NOT wired yet — install the dep and set env when ready:
 *   npm i resend
 *   RESEND_API_KEY=...           (server env)
 *   EMAIL_FROM="Paixão <hello@paixao.club>"   (a verified Resend domain)
 *
 * `resend` is imported dynamically via a variable specifier so the project
 * type-checks and builds before the package is installed; this only runs when
 * sendEmail() is actually called.
 */
export async function sendEmail(
  to: string | string[],
  content: EmailContent,
  opts?: { from?: string; replyTo?: string },
): Promise<{ id: string | null }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set — cannot send email.");

  const pkg = "resend";
  const { Resend } = (await import(pkg)) as { Resend: new (k: string) => { emails: { send: (a: unknown) => Promise<{ data?: { id?: string } | null }> } } };
  const resend = new Resend(apiKey);

  const from = opts?.from ?? process.env.EMAIL_FROM ?? `${siteConfig.name} <hello@paixao.club>`;
  const res = await resend.emails.send({
    from,
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
    replyTo: opts?.replyTo ?? siteConfig.support.email,
  });
  return { id: res.data?.id ?? null };
}
