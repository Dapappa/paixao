// Smoke-test the live Supabase backend: keys, schema, RLS, auth admin.
// Reads .env.local. Usage: node scripts/verify-backend.mjs
import { readFileSync, existsSync } from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !line.trim().startsWith("#") && process.env[m[1]] === undefined)
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv(".env.local");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

console.log("URL:", url, "\n");

// 1) schema present?
for (const t of ["profiles", "events", "waitlist", "matches", "conversations"]) {
  const { count, error } = await admin.from(t).select("*", { count: "exact", head: true });
  console.log(`table ${t.padEnd(14)} -> ${error ? "ERR " + error.message : "ok (" + (count ?? 0) + " rows)"}`);
}

// 2) anon key works (publishable)?
const pub = createClient(url, anon, { auth: { persistSession: false } });
const { error: anonErr } = await pub.from("waitlist").select("*", { count: "exact", head: true });
console.log("\nanon/publishable key:", anonErr ? "read blocked by RLS (expected if no public policy): " + anonErr.message.slice(0, 50) : "ok");

// 2b) write path (what /api/waitlist does): upsert a row, read it back
const testEmail = "smoketest@paixao.test";
const { error: wErr } = await admin
  .from("waitlist")
  .upsert({ email: testEmail, city: "Calgary", status: "pending" }, { onConflict: "email" });
const { count: wCount } = await admin.from("waitlist").select("*", { count: "exact", head: true });
console.log("\nwaitlist write:", wErr ? "ERR " + wErr.message : `ok (${wCount} row(s) now)`);

// 3) auth admin: create a confirmed test user to log in with
const email = "founder@paixao.test";
const password = "TestPass123!";
const { data: created, error: cErr } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});
if (cErr && !/already.*registered|exists/i.test(cErr.message)) {
  console.log("\nauth.admin.createUser -> ERR", cErr.message);
} else {
  console.log(`\nauth admin ok. Test login -> ${email} / ${password}`);
}

console.log("\nBackend smoke-test done.");
process.exit(0);
