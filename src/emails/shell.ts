import { siteConfig } from "@/config/site";

/**
 * Velvet Aura email shell — email-safe, table-based, inline-styled HTML that
 * renders the Paixão brand consistently across clients (Gmail, Apple Mail,
 * Outlook, mobile). No web fonts (email clients strip them): the wordmark uses
 * Georgia for the Playfair "couture" feel; body uses a system sans stack.
 *
 * Palette mirrors globals.css: near-black #0a0a0a, gold #d4a574, crimson #c2185b.
 * Images are avoided on purpose (clients block them by default) — the wordmark
 * is live text so the brand always shows.
 */

const COLORS = {
  bg: "#0a0a0a",
  card: "#141414",
  border: "#262626",
  text: "#f5f5f5",
  muted: "#a3a3a3",
  gold: "#d4a574",
  crimson: "#c2185b",
} as const;

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

export type ShellOptions = {
  /** Hidden inbox-preview text (the line shown after the subject). */
  preheader: string;
  /** Small gold uppercase label above the heading. */
  eyebrow?: string;
  /** Heading HTML — may include a gold accent, e.g. `Welcome, <span ...>Founder.</span>` */
  heading: string;
  /** Body HTML — paragraphs already wrapped in <p> via the `p()` helper. */
  bodyHtml: string;
  /** Optional primary call-to-action button. */
  cta?: { label: string; href: string };
  /** Small reassurance line under the CTA. */
  footnote?: string;
};

/** Brand paragraph — consistent body styling. */
export function p(text: string): string {
  return `<p style="margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:1.7;color:${COLORS.muted};">${text}</p>`;
}

/** Inline gold accent for use inside headings/body. */
export function gold(text: string): string {
  return `<span style="color:${COLORS.gold};">${text}</span>`;
}

const wordmark = `PAIX<span style="color:${COLORS.crimson};">&Atilde;</span>O`;

export function emailShell(o: ShellOptions): string {
  const year = "2026";
  return `<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="dark" />
<meta name="supported-color-schemes" content="dark" />
<title>${siteConfig.name}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.bg};">
  <span style="display:none;font-size:1px;color:${COLORS.bg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${o.preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLORS.bg};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:${COLORS.card};border:1px solid ${COLORS.border};border-radius:16px;overflow:hidden;">
          <!-- Header / wordmark -->
          <tr>
            <td align="center" style="padding:36px 40px 8px;">
              <div style="font-family:${SERIF};font-size:24px;font-weight:700;letter-spacing:4px;color:${COLORS.text};">${wordmark}</div>
              <div style="margin-top:8px;height:1px;width:48px;background-color:${COLORS.gold};opacity:0.6;font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:24px 40px 8px;">
              ${o.eyebrow ? `<p style="margin:0 0 14px;font-family:${SANS};font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${COLORS.gold};">${o.eyebrow}</p>` : ""}
              <h1 style="margin:0 0 18px;font-family:${SERIF};font-size:32px;line-height:1.15;font-weight:500;color:${COLORS.text};">${o.heading}</h1>
              ${o.bodyHtml}
            </td>
          </tr>
          ${
            o.cta
              ? `<!-- CTA -->
          <tr>
            <td style="padding:12px 40px 8px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="${COLORS.crimson}" style="border-radius:9999px;">
                    <a href="${o.cta.href}" target="_blank" style="display:inline-block;padding:14px 34px;font-family:${SANS};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:9999px;">${o.cta.label}</a>
                  </td>
                </tr>
              </table>
              ${o.footnote ? `<p style="margin:14px 0 0;font-family:${SANS};font-size:13px;line-height:1.6;color:${COLORS.muted};">${o.footnote}</p>` : ""}
            </td>
          </tr>`
              : ""
          }
          <!-- Footer -->
          <tr>
            <td style="padding:28px 40px 36px;">
              <div style="height:1px;width:100%;background-color:${COLORS.border};font-size:0;line-height:0;">&nbsp;</div>
              <p style="margin:20px 0 6px;font-family:${SANS};font-size:12px;line-height:1.6;color:${COLORS.muted};">
                ${siteConfig.welcome}. ${siteConfig.legal.minimumAge}+ only — your identity stays anonymous.
              </p>
              <p style="margin:0 0 6px;font-family:${SANS};font-size:12px;line-height:1.6;color:${COLORS.muted};">
                Questions? <a href="mailto:${siteConfig.support.email}" style="color:${COLORS.gold};text-decoration:none;">${siteConfig.support.email}</a>
              </p>
              <p style="margin:0;font-family:${SANS};font-size:12px;line-height:1.6;color:#6b6b6b;">
                &copy; ${year} ${siteConfig.name}. You're receiving this because you joined at ${siteConfig.url}.
                <a href="{{unsubscribe_url}}" style="color:#6b6b6b;text-decoration:underline;">Unsubscribe</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export { COLORS, SERIF, SANS, wordmark };
