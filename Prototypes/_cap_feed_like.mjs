// FEED-007 after-capture: Favorites with liked posts + detail liked, Desktop 1440 + Mobile 390
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = "C:/Users/Admin/Desktop/TukDaeng/Prototypes/screenshots/task-FEED-007/after";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

for (const [tag, vp] of [["d", { width: 1440, height: 900 }], ["m", { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);

  // like p1 + p7 then open Favorites
  await page.locator('.post[data-pid="p1"] .like-btn').click();
  await page.locator('.post[data-pid="p7"] .like-btn').click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/${tag}-all-liked.png` });
  await page.locator(".feed-tab").nth(2).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${tag}-fav-2posts.png` });

  // detail page liked state (p1)
  await page.locator(".feed-tab").nth(0).click();
  await page.waitForTimeout(300);
  await page.locator('.post[data-pid="p1"] .details-toggle').click();
  await page.waitForTimeout(300);
  await page.locator('.post[data-pid="p1"] .view-full').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${tag}-detail-liked.png` });
  await page.locator(".page-detail .detail-back").first().click();

  // unlike both inside Favorites → back to empty state
  await page.locator(".feed-tab").nth(2).click();
  await page.waitForTimeout(300);
  for (const pid of ["p1", "p7"]) {
    await page.locator(`.feed-scroll .post[data-pid="${pid}"] .like-btn`).click();
    await page.waitForTimeout(200);
  }
  await page.screenshot({ path: `${OUT}/${tag}-fav-empty.png` });
  await ctx.close();
}

await browser.close();
console.log("DONE");
