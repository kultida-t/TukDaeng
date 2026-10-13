// Capture FEED-008 desktop evidence (1920x1080) for task-FEED-008/after
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-FEED-008/after";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

const tabs = page.locator(".feed-tab");
const followBtn = pid => page.locator(`.feed-scroll .post[data-pid="${pid}"] .follow-btn`);
const dBtn = () => page.locator(".page-detail .detail-seller .follow-btn").first();
const openDetail = async pid => {
  await page.locator(`.post[data-pid="${pid}"] .more-link`).click();
  await page.waitForTimeout(250);
  await page.locator(`.post[data-pid="${pid}"] .details-toggle`).click();
  await page.waitForTimeout(300);
  await page.locator(`.post[data-pid="${pid}"] .view-full`).click();
  await page.waitForTimeout(400);
};

// follow p1 then open Following tab (4 posts)
await followBtn("p1").click();
await page.waitForTimeout(200);
await tabs.nth(1).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/d-following-4posts.png` });

// unfollow confirm sheet (opened from detail seller row)
await tabs.nth(0).click();
await page.waitForTimeout(300);
await openDetail("p1");
await dBtn().click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/d-unfollow-sheet.png` });
await page.locator(".uf-confirm").click();
await page.waitForTimeout(300);
await page.locator(".page-detail .detail-back").first().click();
await page.waitForTimeout(300);

// following tab after unfollow (p1 back out)
await tabs.nth(1).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/d-following-3posts.png` });

await browser.close();
console.log("DONE");
