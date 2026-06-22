// Check the DNS records Resend needs to verify a sending domain.
// Usage: node scripts/check-dns.mjs paixao.ca
import dns from "dns";
const r = dns.promises;
// Use the system resolver by default (some networks block 8.8.8.8/1.1.1.1).
// Pass a resolver IP as arg 3 to override, e.g. node check-dns.mjs paixao.ca 1.1.1.1
if (process.argv[3]) r.setServers([process.argv[3]]);

const dom = process.argv[2] || "paixao.ca";
const checks = [
  ["TXT", `resend._domainkey.${dom}`, "DKIM (required)"],
  ["TXT", `send.${dom}`, "SPF on send subdomain (required)"],
  ["MX", `send.${dom}`, "Return-path MX on send subdomain (required by Resend)"],
  ["TXT", `_dmarc.${dom}`, "DMARC (optional)"],
  ["TXT", dom, "root TXT (root SPF if any)"],
  ["MX", dom, "root MX (your receiving)"],
];

for (const [type, name, note] of checks) {
  try {
    const res = type === "MX" ? await r.resolveMx(name) : await r.resolveTxt(name);
    const flat = type === "MX" ? res.map((x) => `${x.priority} ${x.exchange}`).join(", ") : res.map((x) => x.join("")).join(" | ");
    console.log(`✓ ${type} ${name}\n    ${flat.slice(0, 240)}\n    (${note})`);
  } catch (e) {
    console.log(`✗ ${type} ${name} -> NONE (${e.code})  (${note})`);
  }
}
