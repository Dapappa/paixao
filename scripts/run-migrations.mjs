// Apply all Supabase migrations (+ optional seed) directly over Postgres.
// No Supabase CLI login required. Reads connection details from .env.local:
//   SUPABASE_DB_URL  (full connection string)  OR
//   SUPABASE_DB_REF + SUPABASE_DB_PASSWORD     (auto-detects the pooler host)
//
// Usage:  node scripts/run-migrations.mjs [seed]
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import pg from "pg";

/* --- load .env.local (simple parser; standalone node doesn't auto-load it) --- */
function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !line.trim().startsWith("#") && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
loadEnv(".env.local");

const runSeed = process.argv.includes("seed");

/* --- build candidate connection strings --- */
function candidates() {
  if (process.env.SUPABASE_DB_URL) return [process.env.SUPABASE_DB_URL];
  const ref = process.env.SUPABASE_DB_REF;
  const pw = process.env.SUPABASE_DB_PASSWORD;
  if (!ref || !pw) {
    console.error("ERROR: set SUPABASE_DB_URL, or SUPABASE_DB_REF + SUPABASE_DB_PASSWORD in .env.local");
    process.exit(1);
  }
  const enc = encodeURIComponent(pw);
  const regions = ["us-east-1", "us-east-2", "us-west-1", "us-west-2", "ca-central-1", "sa-east-1"];
  const list = [`postgresql://postgres:${enc}@db.${ref}.supabase.co:5432/postgres`]; // direct (IPv6)
  for (const pre of ["aws-0", "aws-1"]) {
    for (const r of regions) {
      list.push(`postgresql://postgres.${ref}:${enc}@${pre}-${r}.pooler.supabase.com:5432/postgres`); // session pooler (IPv4)
    }
  }
  return list;
}

async function connect() {
  for (const url of candidates()) {
    const host = url.split("@")[1]?.split("/")[0] ?? url;
    const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000 });
    try {
      await client.connect();
      await client.query("select 1");
      console.log(`Connected via ${host}\n`);
      return client;
    } catch (e) {
      console.log(`x ${host} -> ${e.message.slice(0, 70)}`);
      try { await client.end(); } catch {}
    }
  }
  console.error("\nCould not connect on any host. Paste the exact Session-pooler URI and set SUPABASE_DB_URL.");
  process.exit(1);
}

const client = await connect();

const dir = "supabase/migrations";
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
console.log(`Applying ${files.length} migrations...\n`);

let failed = false;
for (const f of files) {
  process.stdout.write(`-> ${f} ... `);
  try {
    await client.query(readFileSync(join(dir, f), "utf8"));
    console.log("ok");
  } catch (e) {
    console.log("ERROR");
    console.error(`   ${e.message}`);
    failed = true;
    break;
  }
}

if (!failed && runSeed && existsSync("supabase/seed.sql")) {
  process.stdout.write(`-> seed.sql ... `);
  try {
    await client.query(readFileSync("supabase/seed.sql", "utf8"));
    console.log("ok");
  } catch (e) {
    console.log(`WARN (seed skipped: ${e.message.slice(0, 80)})`);
  }
}

await client.end();
console.log(failed ? "\nMigrations FAILED." : "\nAll migrations applied ✅");
process.exit(failed ? 1 : 0);
