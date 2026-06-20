import {
  foundingWelcomeEmail,
  waitlistConfirmationEmail,
  verifyEmail,
} from "@/emails/templates";

/**
 * DEV-ONLY email preview. Open /dev/emails/founding, /dev/emails/waitlist,
 * /dev/emails/verify in the browser to see the rendered templates.
 * Returns 404 in production. Remove or keep behind auth before launch.
 */
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ template: string }> },
) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  const { template } = await params;
  const name = "Alex";

  const map: Record<string, { html: string }> = {
    founding: foundingWelcomeEmail({ name }),
    waitlist: waitlistConfirmationEmail({ name }),
    verify: verifyEmail({ name, verifyUrl: "https://paixao.club/auth/verify?token=demo" }),
  };

  const content = map[template] ?? foundingWelcomeEmail({ name });
  return new Response(content.html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
