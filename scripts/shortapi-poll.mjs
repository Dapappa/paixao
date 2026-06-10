import { readFileSync } from "node:fs";
const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const KEY = (env.match(/^SHORTAPI_KEY=(.+)$/m) || [])[1]?.trim();
const BASE = "https://api.shortapi.ai";
const H = { Authorization: `Bearer ${KEY}` };
const id = process.argv[2] || "6a2753bc6797e45ded9f3025";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 8; i++) {
  const r = await fetch(`${BASE}/api/v1/job/query?id=${id}`, { headers: H });
  const t = await r.text();
  console.log(`poll ${i + 1} [${r.status}]:`, t.slice(0, 900));
  try { const j = JSON.parse(t); const s = String(j?.data?.status ?? j?.status ?? "").toLowerCase();
    if (["succeeded","completed","success","done","finished","failed","error"].includes(s)) break; } catch {}
  await sleep(5000);
}
process.exit(0);
