// Generate the hero aura video loop. Veo 3.1 image-to-video needs a publicly
// reachable source image, so we: (1) create the aura still via SHORTAPI and use
// its result URL directly, (2) feed that into Veo i2v, (3) download the mp4.
// Usage: node scripts/generate-video.mjs [jobName]   (default vid-hero-aura)
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const KEY = (readFileSync(join(ROOT, ".env.local"), "utf8").match(/^SHORTAPI_KEY=(.+)$/m) || [])[1]?.trim();
const BASE = "https://api.shortapi.ai";
const H = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// map each video job to the still job whose result URL feeds its `image`
const SRC = {
  "vid-hero-aura": "aura-abstract",
  "vid-silk": "velvet-macro",
  "vid-candle": "hero-lounge",
  "vid-intimacy": "couple-intimate",
};

const name = process.argv[2] || "vid-hero-aura";
const images = JSON.parse(readFileSync(join(ROOT, "scripts", "asset-jobs.json"), "utf8"));
const videos = JSON.parse(readFileSync(join(ROOT, "scripts", "video-jobs.json"), "utf8"));
const vjob = videos.find((v) => v.name === name);
const sjob = images.find((i) => i.name === SRC[name]);
if (!vjob || !sjob) throw new Error(`job not found: ${name}`);

async function create(model, args) {
  const r = await fetch(`${BASE}/api/v1/job/create`, { method: "POST", headers: H, body: JSON.stringify({ model, args }) });
  const e = JSON.parse(await r.text());
  if (e.code !== 0) throw new Error(`create failed: ${JSON.stringify(e)}`);
  return e.data.job_id ?? e.data.id;
}
async function poll(id, timeoutMs) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    const d = JSON.parse(await (await fetch(`${BASE}/api/v1/job/query?id=${id}`, { headers: H })).text()).data ?? {};
    if (d.status === 2) return d;
    if (d.refunded === true || (typeof d.status === "number" && d.status >= 3)) throw new Error(`failed: ${JSON.stringify(d).slice(0, 300)}`);
    await sleep(6000);
  }
  throw new Error("timed out");
}
const firstUrl = (d, keys) => {
  const r = d.result ?? {};
  for (const k of keys) if (Array.isArray(r[k]) && r[k][0]) return r[k][0].url ?? r[k][0];
  return r.url ?? r.video_url ?? null;
};

console.log(`1/3 generating source still (${sjob.name}) ...`);
const sid = await create(sjob.model, sjob.args);
const sres = await poll(sid, 240000);
const imgUrl = firstUrl(sres, ["images"]);
console.log("   source url:", imgUrl);

console.log(`2/3 generating video (${name}, Veo 3.1, ~$0.64) ...`);
const args = { ...vjob.args, image: imgUrl };
const vid = await create(vjob.model, args);
const vres = await poll(vid, 600000);
const vidUrl = firstUrl(vres, ["videos"]);
console.log("   video url:", vidUrl, "credit:", vres.credit);

console.log("3/3 downloading ...");
const buf = Buffer.from(await (await fetch(vidUrl)).arrayBuffer());
const dest = join(ROOT, "public", "generated", `${name}.mp4`);
writeFileSync(dest, buf);
console.log(`saved ${name}.mp4 (${(buf.length / 1e6).toFixed(2)}MB)`);
process.exit(0);
