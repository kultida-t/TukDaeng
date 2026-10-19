import { chromium } from "playwright";
import { mkdirSync, readFileSync } from "fs";
import { pathToFileURL } from "url";
const FILE = "d:/TukDaeng/Prototypes/fo-flow/index.html";
const OUT = "d:/TukDaeng/Prototypes/screenshots/task-headsweep";
mkdirSync(OUT, { recursive: true });
const src = readFileSync(FILE, "utf8");
const a = src.indexOf("function subHTML(name, scr)");
const seg = src.slice(a, a + 60000);
const names = new Set([...seg.matchAll(/name === "([a-z_0-9:]+)"/g)].map(m => m[1]));
const pre = new Set([...seg.matchAll(/name\.startsWith\("([a-z_0-9:]+)"\)/g)].map(m => m[1]));
const extra = ["pfollow:king.mr.fox:followers", "pfollow:king.mr.fox:following", "pfollow:Watch 777:followers", "profile:king.mr.fox", "profile:Watch 777"];
const list = [...names, ...extra];
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 440, height: 956 } })).newPage();
await page.goto(pathToFileURL(FILE).href, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
let bad = 0;
for (const n of list) {
  const r = await page.evaluate(n => {
    const scr = document.querySelector(".screen");
    try { scr.classList.remove("sub-open"); openSub(scr, n); } catch (e) { return { err: String(e) }; }
    const sub = scr.querySelector(".page-sub");
    const head = sub.querySelector(".detail-head, .sr-head");
    if (!head) return { nohead: true };
    const hb = head.getBoundingClientRect().bottom, st = sub.getBoundingClientRect().top + 38;
    const out = [];
    for (const el of sub.querySelectorAll("*")) {
      if (head.contains(el) || el.contains(head)) continue;
      const cs = getComputedStyle(el); if (cs.visibility === "hidden" || cs.display === "none") continue;
      if (el.children.length) continue;
      const b = el.getBoundingClientRect(); if (!b.width || !b.height) continue;
      if (b.top < hb - 2 && b.bottom > st && b.top >= sub.getBoundingClientRect().top - 1) out.push(el.className || el.tagName);
    }
    return { hb, out: out.slice(0, 4) };
  }, n);
  const ok = !r.err && !r.out?.length;
  if (!ok) bad++;
  console.log((ok ? "PASS " : "FAIL ") + n + " " + JSON.stringify(r));
}
await page.evaluate(() => { const s = document.querySelector(".screen"); openSub(s, "pfollow:king.mr.fox:followers"); });
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/followers.png` });
await browser.close();
console.log("bad", bad);
