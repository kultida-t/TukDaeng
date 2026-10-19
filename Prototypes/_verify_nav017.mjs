// Verify NAV-017: Alerts page header shows page title "Alerts"/"แจ้งเตือน"
// centered (Portfolio detail-head pattern) instead of the username.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-NAV-017";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
let errors = 0, failed = 0;
page.on("console", m => { if (m.type() === "error") { errors++; console.log("CONSOLE ERR:", m.text()); } });
page.on("pageerror", e => { errors++; console.log("PAGE ERR:", e.message); });

const check = (name, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`);
  if (!ok) failed++;
};

await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

// open Alerts tab
await page.locator('.screen .bottom-nav .nav-item[data-navgo="alerts"]').click();
await page.waitForTimeout(400);

const sub = () => page.locator(".page-sub");

check("head uses detail-head pattern", await sub().locator(".detail-head.al-head").count() === 1);
check("header title = Alerts (not username)",
  (await sub().locator(".al-head .detail-title").textContent()).trim() === "Alerts",
  (await sub().locator(".al-head .detail-title").textContent()).trim());
check("header has no username", !(await sub().locator(".al-head").textContent()).includes("king.mr.fox"));
check("header title centered (parity w/ Portfolio ~3px)", await sub().evaluate(el => {
  const t = el.querySelector(".al-head .detail-title").getBoundingClientRect();
  const h = el.querySelector(".al-head").getBoundingClientRect();
  return Math.abs((t.left + t.width / 2) - (h.left + h.width / 2)) <= 4;
}));
check("back button still routes to feed", await sub().locator('.al-head [data-navgo="feed"]').count() === 1);
check("alert list still renders", await sub().locator(".al-row").count() > 0);

await sub().locator(".al-head").screenshot({ path: `${OUT}/alerts-head-en.png` });
await page.screenshot({ path: `${OUT}/alerts-en.png` });

// switch to TH — title must update immediately
await page.evaluate(() => setLang("th"));
await page.waitForTimeout(400);
check("header title = แจ้งเตือน (TH)",
  (await sub().locator(".al-head .detail-title").textContent()).trim() === "แจ้งเตือน",
  (await sub().locator(".al-head .detail-title").textContent()).trim());
check("TH title centered (parity w/ Portfolio ~3px)", await sub().evaluate(el => {
  const t = el.querySelector(".al-head .detail-title").getBoundingClientRect();
  const h = el.querySelector(".al-head").getBoundingClientRect();
  return Math.abs((t.left + t.width / 2) - (h.left + h.width / 2)) <= 4;
}));
await sub().locator(".al-head").screenshot({ path: `${OUT}/alerts-head-th.png` });
await page.screenshot({ path: `${OUT}/alerts-th.png` });

// back to EN for cleanliness
await page.evaluate(() => setLang("en"));

console.log(`\n${failed === 0 && errors === 0 ? "ALL PASS" : "DONE"} — failed=${failed} consoleErrors=${errors}`);
await browser.close();
process.exit(failed || errors ? 1 : 0);
