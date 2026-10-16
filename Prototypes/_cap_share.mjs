import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const OUT = import.meta.dirname + "/screenshots/task-PROFILE-010/after";
const browser = await chromium.launch();
for (const [name, w, h] of [["desktop-1440", 1440, 900], ["mobile-390", 390, 844]]) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  await page.goto("http://127.0.0.1:4173/fo-flow/index.html", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.locator('.bottom-nav .nav-item[data-navgo="profile"]').first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${name}-profile.png` });
  await page.locator(".pf-share").first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${name}-qr.png` });
  await page.locator(".pf-qr-share").click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${name}-share-sheet.png` });
}
await browser.close();
