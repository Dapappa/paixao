// One-off SHORTAPI key + endpoint validation. Reads the key from .env.local,
// submits a tiny image job to the verified api.shortapi.ai endpoint, and polls
// a few times. Run: node scripts/shortapi-check.mjs
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const KEY = (env.match(/^SHORTAPI_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) {
  console.error("No SHORTAPI_KEY found in .env.local");
  process.exit(1);
}
const BASE = "https://api.shortapi.ai";
const H = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const body = {
  model: "google/nano-banana-pro/text-to-image",
  args: {
    prompt:
      "A single amber candle flame in deep darkness, warm cinematic glow, 35mm film grain, near-black background, tasteful luxury mood",
    aspect_ratio: "16:9",
  },
};

console.log("→ POST", `${BASE}/api/v1/job/create`, "model:", body.model);
const cr = await fetch(`${BASE}/api/v1/job/create`, {
  method: "POST",
  headers: H,
  body: JSON.stringify(body),
});
const crText = await cr.text();
console.log("  status:", cr.status, cr.statusText);
console.log("  body:", crText.slice(0, 800));

let data;
try {
  data = JSON.parse(crText);
} catch {
  console.log("  (non-JSON response)");
  process.exit(0);
}
const jobId = data.job_id ?? data.id;
if (!jobId) {
  console.log("→ No job_id returned. Auth/endpoint reachable =", cr.status !== 401 && cr.status !== 403);
  process.exit(0);
}
console.log("✓ job_id:", jobId);

for (let i = 0; i < 4; i++) {
  await sleep(4000);
  const qr = await fetch(`${BASE}/api/v1/job/query?id=${encodeURIComponent(jobId)}`, { headers: H });
  const qText = await qr.text();
  console.log(`  poll ${i + 1}:`, qr.status, qText.slice(0, 600));
  try {
    const q = JSON.parse(qText);
    const s = String(q.status ?? "").toLowerCase();
    if (["succeeded", "completed", "success", "done", "finished", "failed", "error"].includes(s)) break;
  } catch {}
}
console.log("done.");
