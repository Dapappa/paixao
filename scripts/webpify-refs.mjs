// Repoint all /generated/*.png references to .webp (utf8, no BOM — safe).
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const files = [
  "src/app/page.tsx",
  "src/app/(public)/about/page.tsx",
  "src/app/(public)/founding/founding-client.tsx",
];
let total = 0;
for (const rel of files) {
  const p = join(ROOT, rel);
  const before = readFileSync(p, "utf8");
  const after = before.replace(/(\/generated\/[A-Za-z0-9-]+)\.png/g, "$1.webp");
  const n = (before.match(/\/generated\/[A-Za-z0-9-]+\.png/g) || []).length;
  if (n) { writeFileSync(p, after, "utf8"); total += n; console.log(`${rel}: ${n} ref(s) -> webp`); }
}
console.log(`Updated ${total} reference(s).`);
