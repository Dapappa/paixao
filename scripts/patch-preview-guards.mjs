import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const ROOT = join(import.meta.dirname, "..");
const files = [
  "src/app/(authenticated)/messages/[conversationId]/page.tsx",
  "src/app/(authenticated)/messages/page.tsx",
  "src/app/(authenticated)/settings/billing/page.tsx",
  "src/app/(authenticated)/safety/page.tsx",
  "src/app/(authenticated)/safety/blocked/page.tsx",
  "src/app/(authenticated)/safety/report/page.tsx",
  "src/app/(authenticated)/notifications/page.tsx",
  "src/app/(authenticated)/events/my-events/page.tsx",
  "src/app/(authenticated)/events/create/page.tsx",
];
let n = 0;
for (const rel of files) {
  const p = join(ROOT, rel);
  let s = readFileSync(p, "utf8");
  const before = s;
  // Only rewrite the auth-guard conditions, and only if not already patched.
  if (!s.includes('PREVIEW_AUTH')) {
    s = s.replace(/if \(!user\)/g, 'if (!user && process.env.PREVIEW_AUTH !== "1")');
    s = s.replace(/if \(!session\)/g, 'if (!session && process.env.PREVIEW_AUTH !== "1")');
  }
  if (s !== before) { writeFileSync(p, s, "utf8"); n++; console.log("patched:", rel); }
}
console.log(`${n} guard(s) patched.`);
