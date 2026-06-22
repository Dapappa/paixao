// Quick Resend send test. Sends to Resend's always-succeeds test inbox
// (delivered@resend.dev), so it works even before your domain is verified.
// Usage: node scripts/test-email.mjs
import { readFileSync, existsSync } from "fs";
import { Resend } from "resend";

function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !line.trim().startsWith("#") && process.env[m[1]] === undefined)
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv(".env.local");

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
const res = await resend.emails.send({
  from,
  to: "delivered@resend.dev",
  subject: "Paixão Resend test",
  html: "<p>Resend integration test ✅</p>",
  text: "Resend integration test",
});
console.log(res.error ? "SEND FAILED: " + JSON.stringify(res.error) : "SENT ok, id: " + res.data?.id);
