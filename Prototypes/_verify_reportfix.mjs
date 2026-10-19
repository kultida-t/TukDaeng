import { chromium } from "playwright";
import { pathToFileURL } from "url";
const OUT = "d:/TukDaeng/Prototypes/screenshots/task-REPORT-FIX";
const b = await chromium.launch();
let fail = 0;
for (const [n, vp] of [["m", { width: 390, height: 844 }], ["d", { width: 1440, height: 900 }]]) {
  const page = await b.newPage({ viewport: vp });
  const errs = []; page.on("pageerror", e => errs.push(e.message));
  await page.goto(pathToFileURL("d:/TukDaeng/Prototypes/fo-flow/index.html").href, { waitUntil: "networkidle" });
  await page.locator(".screen .post:not(.pfp-post) .more").first().click(); await page.waitForTimeout(400);
  await page.locator(".pm-go-report").first().click(); await page.waitForTimeout(600);
  const reasons = await page.locator(".pm-reason").count();
  const gap = await page.evaluate(() => { const h = document.querySelector(".rp-head").getBoundingClientRect(), q = document.querySelector(".pm-rp-q").getBoundingClientRect(); return Math.round(q.top - h.bottom); });
  const ok = reasons === 9 && !errs.length && gap >= 16; if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"} ${n}: reasons=${reasons} gap=${gap}px errors=${errs.length}`);
  await page.screenshot({ path: `${OUT}/after-${n}.png` });
  await page.close();
}
await b.close(); process.exit(fail ? 1 : 0);
