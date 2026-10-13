// Verify fo-flow FEED-008: follow-btn toggles p.following (account-level).
// Feed card / IG detail post-head hide the button once followed (IG-style,
// consistent across re-render/theme toggle); unfollow goes through the
// confirm sheet from the card's fresh "Following" button or via the
// "..." -> Not interested -> Unfollow path. Detail page is model-level
// (no seller row): its mf-btn toggles p.modelFollowing only.
// Following tab adds/drops posts, per-tab empty states, state survives
// tab + theme re-renders.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = "C:/Users/Admin/Desktop/TukDaeng/Prototypes/screenshots/task-FEED-008/after";
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
const followBtn = pid => page.locator(`.feed-scroll .post[data-pid="${pid}"] .follow-btn`);
const dBtn = () => page.locator(".page-detail .mf-btn").first();
const openDetail = async pid => {
  await page.locator(`.post[data-pid="${pid}"] .more-link`).click();
  await page.waitForTimeout(250);
  await page.locator(`.post[data-pid="${pid}"] .details-toggle`).click();
  await page.waitForTimeout(300);
  await page.locator(`.post[data-pid="${pid}"] .view-full`).click();
  await page.waitForTimeout(400);
};
const closeDetail = async () => {
  await page.locator(".page-detail .detail-back").first().click();
  await page.waitForTimeout(300);
};

// 1) initial render — unfollowed card shows Follow; followed cards show no button
check("p1 card has Follow button", await followBtn("p1").count() === 1);
check("p7 card hides button (followed)", await followBtn("p7").count() === 0);
check("p10 card hides button (followed)", await followBtn("p10").count() === 0);
await page.screenshot({ path: `${OUT}/m-card-follow-btn.png`, clip: { x: 0, y: 200, width: 440, height: 340 } }).catch(() => {});

// 2) following tab baseline = 3 posts, and no follow buttons on any card there
await tabs.nth(1).click();
await page.waitForTimeout(300);
check("following tab = 3 posts", await posts().count() === 3, String(await posts().count()));
const folPids = await posts().evaluateAll(els => els.map(el => el.dataset.pid));
check("following contains p7,p2,p10", ["p7","p2","p10"].every(p => folPids.includes(p)), JSON.stringify(folPids));
check("following tab shows no follow-btn", await page.locator(".feed-scroll .follow-btn").count() === 0);

// 3) follow p1 (Watch 777) from All tab -> button flips to "Following" in place
await tabs.nth(0).click();
await page.waitForTimeout(300);
await followBtn("p1").click();
await page.waitForTimeout(200);
check("follow p1 -> button flips to Following in place",
  (await followBtn("p1").textContent()).trim() === "Following" && await followBtn("p1").evaluate(el => el.classList.contains("on")));
await page.screenshot({ path: `${OUT}/m-card-following.png`, clip: { x: 0, y: 200, width: 440, height: 340 } }).catch(() => {});

// 3b) fresh follow can be undone in place (before any re-render) — click "Following" -> sheet
await followBtn("p1").click();
await page.waitForTimeout(300);
check("unfollow sheet opens from card", await page.locator(".screen.unfollow-open").count() === 1);
await page.locator(".uf-cancel").click();
await page.waitForTimeout(300);
check("cancel keeps in-place Following", (await followBtn("p1").textContent()).trim() === "Following");
await followBtn("p1").click();
await page.waitForTimeout(300);
await page.locator(".uf-confirm").click();
await page.waitForTimeout(300);
check("confirm unfollow -> button back to Follow", (await followBtn("p1").textContent()).trim() === "Follow" && !(await followBtn("p1").evaluate(el => el.classList.contains("on"))));
await followBtn("p1").click();
await page.waitForTimeout(200);
check("re-follow works right after unfollow", (await followBtn("p1").textContent()).trim() === "Following");

// 3c) post is in Following tab
await tabs.nth(1).click();
await page.waitForTimeout(300);
check("following tab = 4 after follow", await posts().count() === 4, String(await posts().count()));
const fol4 = await posts().evaluateAll(els => els.map(el => el.dataset.pid));
check("p1 present in following tab", fol4.includes("p1"), JSON.stringify(fol4));
await page.screenshot({ path: `${OUT}/m-following-4posts.png` });

// 4) after re-render (tab switch / theme toggle) the followed card shows no button
await tabs.nth(0).click();
await page.waitForTimeout(300);
check("p1 button hidden after tab re-render", await followBtn("p1").count() === 0);
await page.locator("#themeToggle").click();
await page.waitForTimeout(300);
check("p1 button still hidden after theme toggle", await followBtn("p1").count() === 0);
check("p8 still shows Follow (untouched)", await followBtn("p8").count() === 1);
await page.locator("#themeToggle").click();
await page.waitForTimeout(300);

// 5) detail page is model-level — no seller row; mf-btn toggles model follow in place
await openDetail("p1");
check("detail has no seller row", await page.locator(".page-detail .detail-seller").count() === 0);
check("detail has no price hero", await page.locator(".page-detail .detail-price").count() === 0);
check("detail has no ask pill", await page.locator(".page-detail .ask-pill").count() === 0);
check("detail keeps Price & Data Source group", await page.locator(".page-detail .spec-row .l", { hasText: "Asking Price" }).count() === 1);
check("detail model Follow (icon-only)", (await dBtn().getAttribute("title")) === "Follow this model" && !(await dBtn().evaluate(el => el.classList.contains("on"))));
await page.screenshot({ path: `${OUT}/m-detail-model-follow.png` });
await dBtn().click();
await page.waitForTimeout(300);
check("model follow flips on + toast",
  (await dBtn().getAttribute("title")) === "Following this model" && await dBtn().evaluate(el => el.classList.contains("on"))
    && (await page.locator(".sc-toast").textContent()).includes("Following this model"));
await page.screenshot({ path: `${OUT}/m-detail-model-following.png` });
await dBtn().click();
await page.waitForTimeout(300);
check("model unfollow back off + toast",
  (await dBtn().getAttribute("title")) === "Follow this model" && !(await dBtn().evaluate(el => el.classList.contains("on")))
    && (await page.locator(".sc-toast").textContent()).includes("Unfollowed this model"));

// 6) model unfollow leaves seller following untouched — card still has no button, tab keeps 4
await closeDetail();
check("card still hides follow-btn (seller followed)", await followBtn("p1").count() === 0);
await tabs.nth(1).click();
await page.waitForTimeout(300);
check("following still 4 posts", await posts().count() === 4, String(await posts().count()));

// 7) unfollow p2 while ON following tab (card "..." -> Not interested -> Unfollow)
//    note: ni path also flags p.ni — restore data flags afterwards to keep later checks stable
await page.locator('.post[data-pid="p2"] .more').click();
await page.waitForTimeout(300);
await page.locator(".pm-ni").click();
await page.waitForTimeout(300);
await page.locator('.post[data-pid="p2"] .ni-unfollow').click();
await page.waitForTimeout(300);
check("p2 drops from following tab", await posts().count() === 3, String(await posts().count()));
await page.evaluate(() => { const p = POSTS.find(x => x.id === "p2"); p.ni = false; p.following = true; });
await tabs.nth(0).click();
await page.waitForTimeout(300);
check("card p2 restored w/o follow-btn (still followed)", await followBtn("p2").count() === 0);
await tabs.nth(1).click();
await page.waitForTimeout(300);
check("p2 back in following tab", await posts().count() === 4, String(await posts().count()));

// 8) favorites empty state unchanged (regression of split)
await tabs.nth(2).click();
await page.waitForTimeout(300);
check("favorites empty 'No favorites yet'", (await page.locator(".feed-empty .fe-title").textContent()).trim() === "No favorites yet");

// 9) model follow is independent of seller follow + persists across detail re-open
await tabs.nth(0).click();
await page.waitForTimeout(300);
await openDetail("p1");
check("model follow off despite seller followed", (await dBtn().getAttribute("title")) === "Follow this model");
await dBtn().click();
await page.waitForTimeout(300);
check("model follow on", (await dBtn().getAttribute("title")) === "Following this model" && await dBtn().evaluate(el => el.classList.contains("on")));
await closeDetail();
await openDetail("p1");
check("model follow persists on detail re-open", (await dBtn().getAttribute("title")) === "Following this model" && await dBtn().evaluate(el => el.classList.contains("on")));
await dBtn().click();
await page.waitForTimeout(300);
await closeDetail();

// 10) regression — All=11, like no longer feeds Favorites (FEED-012), comment sheet still works
check("all posts still 11", await posts().count() === 11, String(await posts().count()));
await page.locator('.post[data-pid="p1"] .like-btn').click();
await page.waitForTimeout(200);
await tabs.nth(2).click();
await page.waitForTimeout(300);
check("favorites ignores liked p1 (empty)", await posts().count() === 0);
await tabs.nth(0).click();
await page.waitForTimeout(300);
await page.locator('.post[data-pid="p7"] .comment-btn').click();
await page.waitForTimeout(400);
check("comment sheet opens", await page.locator(".comment-sheet .c-row").count() > 0);
check("comment sheet not uf-sized", await page.locator(".comment-sheet.uf").count() === 0);
await page.locator(".sheet-handle").click();
await page.waitForTimeout(300);

console.log("console/page errors:", errors, "| failed checks:", failed);
await browser.close();
console.log("DONE");
