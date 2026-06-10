// Reconcile generated-asset references after the redesign swarm:
//  1) /generated/*.png -> .webp  (the PNGs were optimized away)
//  2) in the events section, hero-lounge.webp -> bg-masquerade.webp (the
//     intended background, which didn't exist when the agent ran)
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = join(import.meta.dirname, "..", "src");
let changed = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?)$/.test(name)) fix(p);
  }
}

function fix(p) {
  const before = readFileSync(p, "utf8");
  let after = before.replace(/(\/generated\/[A-Za-z0-9-]+)\.png/g, "$1.webp");
  if (p.includes(`${join("(authenticated)", "events")}`) || /[\\/]events[\\/]/.test(p)) {
    after = after.replace(/\/generated\/hero-lounge\.webp/g, "/generated/bg-masquerade.webp");
  }
  if (after !== before) {
    writeFileSync(p, after, "utf8");
    changed++;
    console.log("fixed:", p.replace(SRC, "src"));
  }
}

walk(SRC);
console.log(`\n${changed} file(s) updated.`);
