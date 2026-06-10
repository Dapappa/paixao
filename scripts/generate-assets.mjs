// Batch asset generator for Paixão. Reads scripts/asset-jobs.json, submits each
// job to SHORTAPI, polls to completion, downloads the result(s) into
// public/generated/, and writes public/generated/manifest.json (surface -> path).
//
// Usage:  node scripts/generate-assets.mjs            (generate all)
//         node scripts/generate-assets.mjs hero about (only matching names)
//
// asset-jobs.json entry: { "name": "hero-aura", "model": "google/nano-banana-pro/text-to-image", "args": { "prompt": "...", "aspect_ratio": "16:9" } }

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "generated");
const MANIFEST = join(OUT_DIR, "manifest.json");

const env = readFileSync(join(ROOT, ".env.local"), "utf8");
const KEY = (env.match(/^SHORTAPI_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error("SHORTAPI_KEY missing from .env.local");
const BASE = process.env.SHORTAPI_BASE_URL || "https://api.shortapi.ai";
const H = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const filter = process.argv.slice(2);
const jobs = JSON.parse(readFileSync(join(ROOT, "scripts", "asset-jobs.json"), "utf8"))
  .filter((j) => filter.length === 0 || filter.some((f) => j.name.includes(f)));

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};

const isVideo = (m) => /video/.test(m);

async function create(model, args) {
  const r = await fetch(`${BASE}/api/v1/job/create`, { method: "POST", headers: H, body: JSON.stringify({ model, args }) });
  const t = await r.text();
  if (!r.ok) throw new Error(`create ${r.status}: ${t.slice(0, 300)}`);
  const e = JSON.parse(t);
  if (e.code != null && e.code !== 0) throw new Error(`create code ${e.code}: ${t.slice(0, 300)}`);
  return e.data.job_id ?? e.data.id;
}

async function poll(id, { timeoutMs, intervalMs }) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/api/v1/job/query?id=${id}`, { headers: H });
    const d = JSON.parse(await r.text()).data ?? {};
    if (d.status === 2) return d;
    if (d.refunded === true || (typeof d.status === "number" && d.status >= 3)) throw new Error(`job ${id} failed: ${JSON.stringify(d).slice(0, 300)}`);
    await sleep(intervalMs);
  }
  throw new Error(`job ${id} timed out`);
}

function urlsFrom(rec) {
  const r = rec.result ?? {};
  const out = [];
  if (Array.isArray(r.images)) out.push(...r.images.map((i) => i.url || i));
  if (Array.isArray(r.videos)) out.push(...r.videos.map((i) => i.url || i));
  if (typeof r.url === "string") out.push(r.url);
  if (typeof r.video_url === "string") out.push(r.video_url);
  return out.filter(Boolean);
}

async function download(url, dest) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  writeFileSync(dest, buf);
  return buf.length;
}

console.log(`Generating ${jobs.length} asset job(s)...\n`);
for (const job of jobs) {
  const video = isVideo(job.model);
  try {
    process.stdout.write(`• ${job.name} (${job.model}) ... `);
    const id = await create(job.model, job.args);
    const rec = await poll(id, video ? { timeoutMs: 600_000, intervalMs: 7000 } : { timeoutMs: 240_000, intervalMs: 4000 });
    const urls = urlsFrom(rec);
    if (!urls.length) throw new Error("no urls in result");
    const ext = video ? "mp4" : "png";
    const paths = [];
    for (let i = 0; i < urls.length; i++) {
      const fname = urls.length > 1 ? `${job.name}-${i + 1}.${ext}` : `${job.name}.${ext}`;
      const bytes = await download(urls[i], join(OUT_DIR, fname));
      paths.push(`/generated/${fname}`);
      console.log(`saved ${fname} (${(bytes / 1024).toFixed(0)}kb, $${rec.credit ?? "?"})`);
    }
    manifest[job.name] = paths.length === 1 ? paths[0] : paths;
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
  }
}
console.log(`\nManifest -> ${MANIFEST}`);
process.exit(0);
