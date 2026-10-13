// FEED-007 after-capture → FEED-012 update: Favorites now lists favorite-account
// posts via "..." > Add to favorites + detail liked, Desktop 1440 + Mobile 390
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-FEED-007/after";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

for (const [tag, vp] of [["d", { width: 1440, height: 900 }], ["m", { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);

  // like p1 (for the detail shot) + favorite followed sellers p7/p2 via "..." menu
  // (FEED-012: Add to favorites only shows for followed accounts)
  await page.locator('.post[data-pid="p1"] .like-btn').click();
  const fav = async pid => {
    await page.locator(`.post[data-pid="${pid}"] .post-head .more`).click();
    await page.waitForTimeout(300);
    await page.locator(".pm-fav").click();
    await page.waitForTimeout(1900);
  };
  await fav("p7");
  await fav("p2");
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/${tag}-all-liked.png` });
  await page.locator(".feed-tab").nth(2).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${tag}-fav-2posts.png` });

  // detail page liked state (p1)
  await page.locator(".feed-tab").nth(0).click();
  await page.waitForTimeout(300);
  await page.locator('.post[data-pid="p1"] .more-link').click();
  await page.waitForTimeout(250);
  await page.locator('.post[data-pid="p1"] .details-toggle').click();
  await page.waitForTimeout(300);
  await page.locator('.post[data-pid="p1"] .view-full').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${tag}-detail-liked.png` });
  await page.locator(".page-detail .detail-back").first().click();

  // remove both inside Favorites via "..." → back to empty state
  await page.locator(".feed-tab").nth(2).click();
  await page.waitForTimeout(300);
  for (const pid of ["p7", "p2"]) {
    await page.locator(`.feed-scroll .post[data-pid="${pid}"] .post-head .more`).click();
    await page.waitForTimeout(300);
    await page.locator(".pm-fav").click();
    await page.waitForTimeout(1600);
  }
  await page.screenshot({ path: `${OUT}/${tag}-fav-empty.png` });
  await ctx.close();
}

await browser.close();
console.log("DONE");
