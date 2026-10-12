// Verify fo-flow FEED-007: like-btn writes p.liked, Interested list in Content
// preferences tracks liked posts, state survives tab + theme re-renders,
// detail-page like-btn stays in sync
// (FEED-011: like-btn no longer shows a count — likeState reads p.likes instead)
// (FEED-012: Favorites tab now lists favorite ACCOUNTS — like no longer feeds
//  it; this script asserts liked posts do NOT appear there)
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = "C:/Users/Admin/Desktop/TukDaeng/Prototypes/screenshots/task-FEED-007";
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

const tabs = page.locator(".feed-tab");
const posts = () => page.locator(".feed-scroll .post");
const likeBtn = pid => page.locator(`.feed-scroll .post[data-pid="${pid}"] .like-btn`);
const likeState = async pid => ({
  liked: await likeBtn(pid).evaluate(el => el.classList.contains("liked")),
  count: String(await page.evaluate(id => POSTS.find(x => x.id === id).likes, pid)),
});

// 1) like p1 (likes 3) + p7 (likes 34) on All tab
await likeBtn("p1").click();
await page.waitForTimeout(200);
let s = await likeState("p1");
check("like p1 marks btn liked", s.liked === true);
check("like p1 count 3->4", s.count === "4", s.count);
await likeBtn("p7").click();
await page.waitForTimeout(200);
s = await likeState("p7");
check("like p7 liked + count 34->35", s.liked && s.count === "35", s.count);

// 2) Favorites tab no longer lists liked posts (FEED-012 — favorite accounts only)
await tabs.nth(2).click();
await page.waitForTimeout(300);
check("favorites ignores liked posts (empty)", await posts().count() === 0, String(await posts().count()));
check("favorites empty state shows", await page.locator(".feed-empty").count() === 1);
check("empty icon is a star", await page.locator(".feed-empty .fe-ico svg polygon").count() === 1);
await page.screenshot({ path: `${OUT}/m-fav-empty-star.png` });

// 3) back to All — like state persists through partial re-render
await tabs.nth(0).click();
await page.waitForTimeout(300);
check("all posts back to 11", await posts().count() === 11);
s = await likeState("p1");
check("p1 still liked in All + count 4", s.liked && s.count === "4", s.count);

// 4) theme toggle (full render) keeps tab + favorites still unaffected by likes
await tabs.nth(2).click();
await page.waitForTimeout(300);
await page.locator("#themeToggle").click();
await page.waitForTimeout(300);
check("favorites still empty after theme toggle", await posts().count() === 0);
check("still on Favorites tab", (await page.locator(".feed-tab.active").textContent()) === "Favorites");
await page.screenshot({ path: `${OUT}/m-fav-light.png` });
await page.locator("#themeToggle").click();
await page.waitForTimeout(300);

// 5) Interested list (Content preferences) still tracks liked posts — unlike removes
await page.locator(".set-btn").click();
await page.waitForTimeout(350);
await page.locator('.sub-row[data-sub="prefs"]').click();
await page.waitForTimeout(350);
await page.locator('.sub-row[data-sub="interested"]').click();
await page.waitForTimeout(350);
check("interested lists 2 liked posts", await page.locator(".mrow").count() === 2, String(await page.locator(".mrow").count()));
await page.locator('.m-unlike[data-pid="p7"]').click();
await page.waitForTimeout(300);
check("interested remove drops p7", await page.locator(".mrow").count() === 1);
await page.locator('.m-unlike[data-pid="p1"]').click();
await page.waitForTimeout(300);
check("interested empty after both removed", await page.locator(".sub-empty").count() === 1);
await page.locator(".sub-back").click();
await page.waitForTimeout(300);
await page.locator(".sub-back").click();
await page.waitForTimeout(300);
await page.locator(".sub-back").click();
await page.waitForTimeout(300);

// 6) detail page like-btn syncs with same post object
await tabs.nth(0).click();
await page.waitForTimeout(300);
await likeBtn("p1").click();
await page.waitForTimeout(200);
await page.locator('.post[data-pid="p1"] .details-toggle').click();
await page.waitForTimeout(300);
await page.locator('.post[data-pid="p1"] .view-full').click();
await page.waitForTimeout(400);
const dLike = page.locator(".page-detail .like-btn");
check("detail like-btn liked (synced)", await dLike.evaluate(el => el.classList.contains("liked")));
check("detail like count 4", (await page.evaluate(() => POSTS.find(x => x.id === "p1").likes)) === 4);
await page.screenshot({ path: `${OUT}/m-detail-liked.png` });
await dLike.click();
await page.waitForTimeout(200);
check("detail unlike clears class", !(await dLike.evaluate(el => el.classList.contains("liked"))));
check("detail count back to 3", (await page.evaluate(() => POSTS.find(x => x.id === "p1").likes)) === 3);
await page.locator(".page-detail .detail-back").first().click();
await page.waitForTimeout(300);
s = await likeState("p1");
check("feed card un-liked after detail unlike", !s.liked && s.count === "3", s.count);
await tabs.nth(2).click();
await page.waitForTimeout(300);
check("favorites still empty (no favorite accounts)", await posts().count() === 0);

// 7) regression sanity — following tab + comment sheet still fine
await tabs.nth(1).click();
await page.waitForTimeout(300);
check("following still 3 posts", await posts().count() === 3);
await posts().first().locator(".comment-btn").click();
await page.waitForTimeout(400);
check("comment sheet opens", await page.locator(".comment-sheet .c-row").count() > 0);
await page.locator(".sheet-handle").click();

console.log("console/page errors:", errors, "| failed checks:", failed);
await browser.close();
console.log("DONE");
