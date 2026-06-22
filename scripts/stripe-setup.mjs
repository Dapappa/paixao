// Create Stripe products + monthly/yearly prices for the 3 paid tiers, then
// write the 6 STRIPE_PRICE_* IDs back into .env.local. Idempotent: reuses any
// product (by metadata) / price (by lookup_key) that already exists.
//
// Usage: node scripts/stripe-setup.mjs
import { readFileSync, writeFileSync, existsSync } from "fs";
import Stripe from "stripe";

function loadEnv(file) {
  const out = {};
  if (!existsSync(file)) return out;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !line.trim().startsWith("#")) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const ENV_FILE = ".env.local";
const env = loadEnv(ENV_FILE);
const key = env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
if (!key || key.includes("placeholder")) {
  console.error("ERROR: STRIPE_SECRET_KEY missing/placeholder in .env.local");
  process.exit(1);
}
const stripe = new Stripe(key);
const CURRENCY = "cad";

const TIERS = [
  { id: "desire", name: "Paixão — Desire", monthly: 2499, yearly: 17099 },
  { id: "obsession", name: "Paixão — Obsession", monthly: 9999, yearly: 68399 },
  { id: "patron", name: "Paixão — Patron", monthly: 19999, yearly: 136799 },
];

async function findOrCreateProduct(tier) {
  const found = await stripe.products.search({ query: `metadata['paixao_tier']:'${tier.id}'` });
  if (found.data[0]) return found.data[0];
  return stripe.products.create({
    name: tier.name,
    metadata: { paixao_tier: tier.id },
  });
}

async function findOrCreatePrice(productId, tierId, period, amount) {
  const lookup_key = `${tierId}_${period}`;
  const existing = await stripe.prices.list({ lookup_keys: [lookup_key], active: true, limit: 1 });
  if (existing.data[0]) return existing.data[0];
  return stripe.prices.create({
    product: productId,
    currency: CURRENCY,
    unit_amount: amount,
    recurring: { interval: period === "monthly" ? "month" : "year" },
    lookup_key,
    metadata: { paixao_tier: tierId, period },
  });
}

const ids = {};
for (const tier of TIERS) {
  const product = await findOrCreateProduct(tier);
  const m = await findOrCreatePrice(product.id, tier.id, "monthly", tier.monthly);
  const y = await findOrCreatePrice(product.id, tier.id, "yearly", tier.yearly);
  ids[`STRIPE_PRICE_${tier.id.toUpperCase()}_MONTHLY`] = m.id;
  ids[`STRIPE_PRICE_${tier.id.toUpperCase()}_YEARLY`] = y.id;
  console.log(`${tier.name.padEnd(22)} monthly=${m.id}  yearly=${y.id}`);
}

// write the 6 IDs into .env.local (replace existing lines)
let text = readFileSync(ENV_FILE, "utf8");
for (const [k, v] of Object.entries(ids)) {
  const re = new RegExp(`^${k}=.*$`, "m");
  text = re.test(text) ? text.replace(re, `${k}=${v}`) : text + `\n${k}=${v}`;
}
writeFileSync(ENV_FILE, text);
console.log("\nWrote 6 price IDs into .env.local ✅");
process.exit(0);
