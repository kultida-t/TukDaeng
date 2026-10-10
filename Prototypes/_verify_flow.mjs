// Verify fo-flow: feed → create post → back to feed with new post
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = "C:/Users/Admin/Desktop/TukDaeng/Prototypes/screenshots/fo-flow";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 560, height: 950 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
page.on("console", m => { if (m.type() === "error") console.log("CONSOLE ERR:", m.text()); });
page.on("pageerror", e => console.log("PAGE ERR:", e.message));

// 1. Feed loads, single phone
await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);
const phones = await page.locator(".phone").count();
console.log("phones on feed:", phones);
await page.screenshot({ path: `${OUT}/1-feed.png` });

// 2. Tap + → goes to create-post
await page.locator('[data-flow="create"]').click();
await page.waitForLoadState("domcontentloaded");
await page.waitForTimeout(600);
console.log("after + url:", page.url());
await page.screenshot({ path: `${OUT}/2-picker-empty.png` });

// 3. Select photos via Select mode (multi)
await page.locator("[data-selmode]").click();
await page.waitForTimeout(200);
await page.locator('.ig-grid .cell[data-i="0"]').click();
await page.locator('.ig-grid .cell[data-i="1"]').click();
await page.locator('.ig-grid .cell[data-i="2"]').click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/3-selected.png` });
const nextOff = await page.locator(".cp-next").evaluate(el => el.classList.contains("off"));
console.log("next disabled after select?", nextOff);

// 4. Next → caption step, type caption, Post
await page.locator(".cp-next").click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/4-caption.png` });
await page.locator(".ig-cap-line .ta").fill("Test post from flow — Rolex Sub Full set 📩");
await page.locator("[data-post]").click();
await page.waitForURL("**/index.html", { timeout: 8000 });
await page.waitForLoadState("networkidle");
await page.waitForTimeout(700);
console.log("after post url:", page.url());
await page.screenshot({ path: `${OUT}/5-feed-after-post.png` });

// 5. Verify new post at top
const firstSeller = await page.locator(".post .who .name").first().textContent();
const firstTime = await page.locator(".post .post-time").first().textContent();
console.log("first post:", firstSeller, "|", firstTime);

// 6. Open comment sheet + detail to confirm in-screen interactions still work
await page.locator(".post").nth(1).locator(".comment-btn").click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/6-comments.png` });
await page.locator(".sheet-handle").click();
await page.locator(".post").nth(1).locator(".details-toggle").click();
await page.waitForTimeout(300);
await page.locator(".post").nth(1).locator(".details-inner").click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/7-detail.png` });

await browser.close();
console.log("DONE");
