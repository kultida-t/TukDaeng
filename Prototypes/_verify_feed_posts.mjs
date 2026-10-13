// Verify fo-flow feed: 11 posts render, showcase posts have no details/ask, comments work
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-FEED-005/after";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 560, height: 950 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
page.on("console", m => { if (m.type() === "error") console.log("CONSOLE ERR:", m.text()); });
page.on("pageerror", e => console.log("PAGE ERR:", e.message));

await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

const count = await page.locator(".post").count();
console.log("posts rendered:", count);

// per-post summary: seller, has details toggle, has ask button, type
const rows = await page.locator(".post").evaluateAll(els => els.map(el => ({
  seller: el.querySelector(".who .name")?.textContent,
  details: !!el.querySelector(".details-toggle"),
  ask: !!el.querySelector(".ask-pill"),
  photos: el.querySelector(".photo-counter")?.textContent || "1",
  caption: el.querySelector(".cap-short")?.textContent.trim().slice(0, 50),
})));
rows.forEach((r, i) => console.log(i, JSON.stringify(r)));

// showcase post (nth index 1 = p7 wrist.story) — no details toggle, no ask
const showcase = page.locator(".post").nth(1);
console.log("p7 details toggle:", await showcase.locator(".details-toggle").count());
console.log("p7 ask pill:", await showcase.locator(".ask-pill").count());

// comment sheet on showcase post
await showcase.locator(".comment-btn").click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/comments-showcase.png` });
const cRows = await page.locator(".comment-sheet .c-row").count();
console.log("p7 comment rows:", cRows);
await page.locator(".sheet-handle").click();

// swipe on multi-photo showcase post (p10, index 7) — scroll into view first
const multi = page.locator(".post").nth(7);
await multi.locator(".post-photo").scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const counter = await multi.locator(".photo-counter").textContent();
console.log("p10 counter before:", counter);
const box = await multi.locator(".post-photo").boundingBox();
const cy = box.y + box.height / 2;
await page.mouse.move(box.x + box.width * 0.7, cy);
await page.mouse.down();
for (let i = 1; i <= 10; i++) await page.mouse.move(box.x + box.width * (0.7 - 0.5 * i / 10), cy);
await page.mouse.up();
await page.waitForTimeout(500);
console.log("p10 counter after:", await multi.locator(".photo-counter").textContent());

await page.screenshot({ path: `${OUT}/feed-top.png` });
// scroll to bottom for showcase section shot
await page.locator(".feed-scroll").evaluate(el => el.scrollTo(0, el.scrollHeight / 2));
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/feed-mid.png` });

// dark theme shot
await page.locator("#themeToggle").click();
await page.waitForTimeout(300);
await page.locator(".feed-scroll").evaluate(el => el.scrollTo(0, 0));
await page.screenshot({ path: `${OUT}/feed-dark.png` });

await browser.close();
console.log("DONE");
