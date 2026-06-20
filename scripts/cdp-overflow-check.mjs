// Diagnose horizontal overflow at a given viewport via raw CDP.
// Usage: node scripts/cdp-overflow-check.mjs <url> <width> <height>
const PORT = 9222;
const base = `http://127.0.0.1:${PORT}`;
const url = process.argv[2] || "http://localhost:3000/";
const width = Number(process.argv[3] || 375);
const height = Number(process.argv[4] || 812);

const target = await (await fetch(`${base}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const send = (method, params = {}) =>
  new Promise((r) => {
    const i = ++id;
    pending.set(i, r);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
await new Promise((r) => ws.addEventListener("open", r));
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
});

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width,
  height,
  deviceScaleFactor: 2,
  mobile: true,
});
await send("Page.navigate", { url });
await new Promise((r) => setTimeout(r, 4000));

const expr = `(() => {
  const vw = document.documentElement.clientWidth;
  const dw = document.documentElement.scrollWidth;
  const off = [...document.querySelectorAll('body *')]
    .map(el => { const r = el.getBoundingClientRect(); return { el, r }; })
    .filter(({ r }) => r.width > 0 && r.right > vw + 1)
    .sort((a,b) => b.r.right - a.r.right)
    .slice(0, 14)
    .map(({ el, r }) => ({ t: el.tagName, c: (el.className||'').toString().slice(0,80), right: Math.round(r.right), w: Math.round(r.width), left: Math.round(r.left) }));
  return JSON.stringify({ vw, dw, overflow: dw > vw + 1, offenders: off }, null, 2);
})()`;
const res = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
console.log(res.result?.result?.value ?? JSON.stringify(res.result ?? res));
ws.close();
process.exit(0);
