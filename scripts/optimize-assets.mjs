// Optimize generated assets for the web. The 4K stills land at ~16-19MB PNG —
// far too heavy. This writes a downscaled .webp sibling for every generated PNG
// (new files, so no Windows lock conflict with the running dev server), then
// best-effort deletes the heavy source PNG. All refs use .webp.
import sharp from "sharp";
import { readdirSync, statSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, extname, basename } from "node:path";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "generated");
const MAX_W = 2048;
const pngs = readdirSync(DIR).filter((f) => /\.png$/i.test(f) && !f.startsWith("_"));

for (const f of pngs) {
  const src = join(DIR, f);
  const base = basename(f, extname(f));
  const out = join(DIR, `${base}.webp`);
  const before = statSync(src).size;
  const meta = await sharp(src).metadata();
  const w = Math.min(meta.width ?? MAX_W, MAX_W);
  await sharp(src).resize({ width: w }).webp({ quality: 80, effort: 5 }).toFile(out);
  const after = statSync(out).size;
  // free the heavy source; ignore if the dev server still holds a lock
  let removed = false;
  try { rmSync(src); removed = true; } catch {}
  console.log(`${base}: ${(before / 1e6).toFixed(1)}MB png -> ${(after / 1e6).toFixed(2)}MB webp${removed ? " (png removed)" : " (png kept — locked)"}`);
}
console.log(`\nOptimized ${pngs.length} file(s) to webp.`);
