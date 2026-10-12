// Verify fo-flow feed tabs: All Posts shows all posts, Following filters p.following,
// Favorites filters favorite accounts (FEED-012) — empty state shows a star icon,
// tab switch re-renders feed content
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = "C:/Users/Admin/Desktop/TukDaeng/Prototypes/screenshots/task-FEED-006/after";
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

// 1) default = All Posts active, all posts render
console.log("default active tab:", await page.locator(".feed-tab.active").textContent());
console.log("all posts count:", await posts.count());

// 2) Following — only posts from followed accounts (p7 wrist.story, p2 the watch, p10 slow.hand)
await tabs.nth(1).click();
await page.waitForTimeout(300);
const fSellers = await posts.evaluateAll(els => els.map(el => el.querySelector(".who .name")?.textContent));
console.log("following count:", fSellers.length, JSON.stringify(fSellers));
await page.screenshot({ path: `${OUT}/m-tab-following.png` });

// interactions still work inside Following tab (comment sheet on first post)
await posts.first().locator(".comment-btn").click();
await page.waitForTimeout(400);
console.log("following comment rows:", await page.locator(".comment-sheet .c-row").count());
await page.locator(".sheet-handle").click();

// 3) Favorites — empty state: star icon + "No favorites yet", no posts
await tabs.nth(2).click();
await page.waitForTimeout(300);
console.log("favorites posts count:", await posts.count());
const empty = page.locator(".feed-empty");
console.log("empty state visible:", await empty.count());
console.log("empty title:", await empty.locator(".fe-title").textContent());
console.log("empty star svg:", await empty.locator(".fe-ico svg").count());
await page.screenshot({ path: `${OUT}/m-tab-favorites.png` });

// 4) back to All Posts — full feed again
await tabs.nth(0).click();
await page.waitForTimeout(300);
console.log("all posts count after switch-back:", await posts.count());
await page.screenshot({ path: `${OUT}/m-tab-all.png` });

// 5) light theme favorites (empty state contrast check)
await page.locator("#themeToggle").click();
await page.waitForTimeout(300);
await tabs.nth(2).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/m-tab-favorites-light.png` });
await page.locator("#themeToggle").click();

console.log("console/page errors:", errors);
await browser.close();
console.log("DONE");
