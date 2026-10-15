// THEME-001 — capture After evidence: Settings > Theme mode picker + feed,
// both themes, at Desktop (1440px) and Mobile (390px) viewports.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-THEME-001/after";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
for (const w of [1440, 390]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 956 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  // dark (default): settings -> theme picker
  await page.locator(".set-btn").click();
  await page.waitForTimeout(350);
  await page.locator('.sub-row[data-sub="theme"]').click();
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${OUT}/w${w}-theme-picker-dark.png` });
  // switch to light, back out to feed
  await page.locator('[data-theme-opt="light"]').click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/w${w}-theme-picker-light.png` });
  await page.locator(".sub-back").click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/w${w}-settings-light.png` });
  await page.locator(".sub-back").click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/w${w}-feed-light.png` });
  await ctx.close();
}
await browser.close();
console.log("done");
