// FEED-026 — verify feed tabs render as segmented control (single rounded
// container, equal-width segments, highlighted active, no icons) and tab
// switching still filters posts correctly. Dark + light theme, TH labels.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-FEED-026";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
let errors = 0;
page.on("console", m => { if (m.type() === "error") { errors++; console.log("CONSOLE ERR:", m.text()); } });
page.on("pageerror", e => { errors++; console.log("PAGE ERR:", e.message); });

await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

const tabs = page.locator(".feed-tab");
const posts = page.locator(".feed-scroll .post");

console.log("data-ft:", await page.locator(".screen").first().getAttribute("data-ft"));
console.log("tab count:", await tabs.count());
console.log("icons inside tabs:", await page.locator(".feed-tab svg").count());
console.log("default active tab:", await page.locator(".feed-tab.active").textContent());
console.log("all posts count:", await posts.count());

// geometry — single container, equal-width segments
const geo = await page.locator(".feed-tabs").evaluate(el => {
  const r = el.getBoundingClientRect();
  const kids = [...el.querySelectorAll(".feed-tab")].map(b => {
    const br = b.getBoundingClientRect();
    return { w: Math.round(br.width), x: Math.round(br.x - r.x) };
  });
  return { containerW: Math.round(r.width), containerH: Math.round(r.height), radius: getComputedStyle(el).borderRadius, kids };
});
console.log("feed-tabs geometry:", JSON.stringify(geo));

await page.screenshot({ path: `${OUT}/seg-all.png`, clip: { x: 0, y: 30, width: 440, height: 120 } });

// Following tab filters + active segment moves
await tabs.nth(1).click();
await page.waitForTimeout(300);
console.log("following active:", await page.locator(".feed-tab.active").textContent());
console.log("following count:", await posts.count());
await page.screenshot({ path: `${OUT}/seg-following.png`, clip: { x: 0, y: 30, width: 440, height: 120 } });

// Favorites empty state still works
await tabs.nth(2).click();
await page.waitForTimeout(300);
console.log("favorites posts:", await posts.count(), "empty:", await page.locator(".feed-empty").count());
await page.screenshot({ path: `${OUT}/seg-favorites.png`, clip: { x: 0, y: 30, width: 440, height: 120 } });
await tabs.nth(0).click();
await page.waitForTimeout(300);

// light theme
await page.locator("#themeToggle").click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/seg-light.png`, clip: { x: 0, y: 30, width: 440, height: 120 } });
await page.locator("#themeToggle").click();

// TH labels
const langBtn = page.locator("#langToggle");
if (await langBtn.count()) {
  await langBtn.click();
  await page.waitForTimeout(300);
  console.log("th tab 1:", await tabs.nth(0).textContent());
  await page.screenshot({ path: `${OUT}/seg-th.png`, clip: { x: 0, y: 30, width: 440, height: 120 } });
}

console.log("console/page errors:", errors);
await browser.close();
console.log("DONE");
