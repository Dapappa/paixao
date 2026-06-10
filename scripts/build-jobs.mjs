// Transform the research swarm's plan into asset-jobs.json (images) and
// video-jobs.json (image-to-video), stripping the callback_url (we poll).
import { readFileSync, writeFileSync } from "node:fs";

const SRC = process.argv[2];
if (!SRC) throw new Error("pass the workflow output json path");
const plan = JSON.parse(readFileSync(SRC, "utf8")).result.plan;

// Stable names in the plan's job order.
const NAMES = [
  "hero-lounge", "founding-bg", "about-friends", "couple-intimate",
  "aura-abstract", "velvet-macro", "personas",
  "vid-hero-aura", "vid-silk", "vid-candle", "vid-intimacy",
];

const images = [];
const videos = [];
plan.assetJobs.forEach((job, i) => {
  const body = JSON.parse(job.body);
  const entry = { name: NAMES[i] ?? `asset-${i}`, model: body.model, args: body.args, surface: job.surface };
  if (/video/.test(body.model)) {
    entry.image = body.image; // placeholder REPLACE_WITH_* to be filled after stills
    videos.push(entry);
  } else {
    images.push(entry);
  }
});

writeFileSync(new URL("./asset-jobs.json", import.meta.url), JSON.stringify(images, null, 2));
writeFileSync(new URL("./video-jobs.json", import.meta.url), JSON.stringify(videos, null, 2));
console.log(`images: ${images.length} -> asset-jobs.json`);
console.log(`videos: ${videos.length} -> video-jobs.json`);
console.log("image names:", images.map((j) => `${j.name}(${j.model.split("/")[1]})`).join(", "));
