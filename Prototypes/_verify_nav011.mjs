import { chromium } from "playwright";
import { pathToFileURL } from "url";
const FILE_URL = pathToFileURL("d:/TukDaeng/Prototypes/fo-flow/index.html").href;
const OUT = "d:/TukDaeng/Prototypes/screenshots/task-NAV-011";
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 440, height: 956 } })).newPage();
await page.goto(FILE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
let failed = 0;
const check = (d, ok) => { console.log(`${ok ? "PASS" : "FAIL"}: ${d}`); if (!ok) failed++; };
const H = sel => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { h: +r.height.toFixed(1), fs: getComputedStyle(e).fontSize }; }, sel);
await page.evaluate(() => { const s = document.querySelector(".screen"); pushSub(s, "search"); });
await page.waitForTimeout(500);
const sr = await H(".sr-chip.sr-pick");
console.log("search chip", sr);
for (const name of ["saved", "wishlist"]) {
  await page.evaluate(n => { const s = document.querySelector(".screen"); pushSub(s, n); }, name);
  await page.waitForTimeout(500);
  const t = await H(".svd-tab");
  console.log(name, t);
  check(`${name} tab height == search chip`, t && Math.abs(t.h - sr.h) < 0.6 && t.fs === sr.fs);
  const sc = await page.evaluate(() => { const b = document.querySelector(".svd-body"); b.scrollTop = 99999; return { pb: getComputedStyle(b).paddingBottom }; });
  console.log(name, sc);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
}
await browser.close();
process.exit(failed ? 1 : 0);
