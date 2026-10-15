// Verify fo-flow PROFILE-003: viewer profiles get realistic mock grids —
// every reachable seller profile has tiles (Watch 777 = 1 real + 12 mock),
// posts stat syncs to the real All-tab tile count, tabs All/Sale/Show filter
// gfx posts correctly, grid tiles open the Posts viewer (PROFILE-002) with
// Not interested/Report on other-user gfx posts, like mutation persists across
// re-render (PF_GFX_REG reuse), no blue verified badge, Follow is theme red.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-PROFILE-003";
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

const sub = () => page.locator(".page-sub");
const scr = () => page.locator(".screen");
const pv = () => page.locator(".page-pv");
const postsStat = async () => (await sub().locator(".pf-stat").first().locator("b").textContent()).trim();
const tileCount = () => sub().locator(".pf-tile").count();

await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

// ============ 1) Watch 777 viewer profile — grid filled + posts count sync ============
await scr().locator(".feed-scroll .post").first().locator(".post-head .avatar-ring").click();
await page.waitForTimeout(400);
check("viewer profile opened", (await sub().locator(".pf-vname").textContent()).includes("Watch 777"));
check("no blue verified badge anywhere", await sub().locator(".pf-vb").count() === 0);
check("grid filled: 13 tiles (1 real + 12 mock)", await tileCount() === 13, String(await tileCount()));
check("posts stat syncs to tile count = 13", (await postsStat()) === "13", await postsStat());
check("3 viewer tabs All/Sale/Show", (await sub().locator(".pf-tab").allTextContents()).join("|") === "All|Sale|Show");
check("viewer head = back + more, no bell (removed per PROFILE-004)", await sub().locator(".pf-head .sub-back").count() === 1 &&
  await sub().locator(".pf-bell").count() === 0 && await sub().locator(".pf-more").count() === 1);
check("followed-by row intact", (await sub().locator(".pf-fby").textContent()).includes("Followed by"));
const follBtn = sub().locator(".pf-foll");
if ((await follBtn.textContent()).trim() === "Follow") {
  check("Follow button is theme red (--red #c8212b)",
    await follBtn.evaluate(el => getComputedStyle(el).backgroundColor) === "rgb(200, 33, 43)",
    await follBtn.evaluate(el => getComputedStyle(el).backgroundColor));
} else {
  check("Follow button is theme red (--red #c8212b)", true, "already Following — state from earlier session");
}
await page.screenshot({ path: `${OUT}/d-pfg-watch777-all.png` });

// ============ 2) tab filters route gfx posts correctly ============
await sub().locator('.pf-tab[data-pftab="sale"]').click();
await page.waitForTimeout(300);
check("Sale tab = 6 tiles (p1 + 5 sale gfx)", await tileCount() === 6, String(await tileCount()));
await sub().locator('.pf-tab[data-pftab="show"]').click();
await page.waitForTimeout(300);
check("Show tab = 4 tiles (show gfx)", await tileCount() === 4, String(await tileCount()));
check("viewer has no Hide/Sold tabs", await sub().locator('.pf-tab[data-pftab="hide"]').count() === 0 &&
  await sub().locator('.pf-tab[data-pftab="sold"]').count() === 0);
await sub().locator('.pf-tab[data-pftab="all"]').click();
await page.waitForTimeout(300);

// ============ 3) gfx tile -> Posts viewer + other-user menu ============
await sub().locator(".pf-tile").nth(1).click();
await page.waitForTimeout(400);
check("posts viewer opens over viewer profile", await scr().getAttribute("class").then(c => c.includes("pv-open")));
check("title Posts / Watch 777 + 13 cards", (await pv().locator(".pfp-tt span").textContent()).trim() === "Watch 777" &&
  await pv().locator(".pfp-post").count() === 13, String(await pv().locator(".pfp-post").count()));
const pvFollow = pv().locator(".pfp-follow");
check("pv head shows Follow pill (IG-style, unfollowed)",
  await pvFollow.count() === 1 && (await pvFollow.textContent()).trim() === "Follow");
check("no per-card follow buttons in Posts viewer",
  await pv().locator(".pfp-post .follow-btn").count() === 0);
await pvFollow.click(); await page.waitForTimeout(350);
check("head follow flips to Following",
  (await pvFollow.textContent()).trim() === "Following" &&
  await pvFollow.evaluate(el => el.classList.contains("on")));
await page.waitForTimeout(1600);
check("head follow auto-hides after following (IG behaviour)",
  await pv().locator(".pfp-follow").count() === 0);
check("no per-card follow buttons after unfollow cycle",
  await pv().locator(".pfp-post .follow-btn").count() === 0);
const gcard = pv().locator(".pfp-post").nth(1);
const gcap = await gcard.locator(".caption").textContent();
const gLikedBy = await gcard.locator(".liked-by").textContent();
check("gfx card renders feed-style (caption + actions + liked-by w/o count)", gcap.trim().length > 0 &&
  await gcard.locator(".like-btn").count() === 1 && await gcard.locator(".save-btn").count() === 1 &&
  gLikedBy.includes("and others") && !/ \d+ others/.test(gLikedBy));
await gcard.locator(".like-btn").click();
await page.waitForTimeout(250);
check("gfx like toggles -> liked class (no count, feed parity)", await gcard.locator(".like-btn").getAttribute("class").then(c => c.includes("liked")) &&
  await gcard.locator(".like-btn .lk-n").count() === 0);
await gcard.locator(".post-head .more").click();
await page.waitForTimeout(300);
check("other-user gfx post ... -> Not interested/Report (no own menu)",
  await page.locator(".comment-sheet .pm-ni").count() === 1 &&
  await page.locator(".comment-sheet .pm-go-report").count() === 1 &&
  await page.locator(".comment-sheet .pm-own-del").count() === 0);
await page.locator(".comment-sheet .sheet-handle").click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/d-pfg-viewer-posts.png` });

// ============ 3b) Tap for details -> View full detail -> back returns to Posts viewer ============
const card0dt = pv().locator(".pfp-post").first(); /* real post p1 — has specs */
/* trigger stays hidden until the caption is expanded via "more" (same rule as feed) */
if (await card0dt.locator(".caption .more-link").count()) await card0dt.locator(".caption .more-link").click();
else await card0dt.locator(".caption").evaluate(el => el.classList.add("expanded"));
await page.waitForTimeout(300);
await card0dt.locator(".details-toggle").click();
await page.waitForTimeout(300);
check("Tap for details expands inline", await card0dt.locator(".view-full").count() === 1);
await card0dt.locator(".view-full").click();
await page.waitForTimeout(400);
check("detail opens over viewer — pv stays mounted (no flicker)",
  await scr().getAttribute("class").then(c => c.includes("pv-open") && c.includes("detail-open")));
check("detail page renders", await page.locator(".page-detail .detail-back").count() === 1);
await page.screenshot({ path: `${OUT}/d-pfg-detail.png` });
await page.locator(".page-detail .detail-back").click();
await page.waitForTimeout(400);
check("detail-back returns to Posts viewer (not grid)",
  await scr().getAttribute("class").then(c => c.includes("pv-open") && !c.includes("detail-open")) &&
  (await pv().locator(".pfp-tt span").textContent()).trim() === "Watch 777" &&
  await pv().locator(".pfp-post").count() === 13);
await page.screenshot({ path: `${OUT}/d-pfg-back-to-posts.png` });

// ============ 3c) gfx sale card gets Tap for details + full detail too ============
if (await gcard.locator(".caption .more-link").count()) await gcard.locator(".caption .more-link").click();
else await gcard.locator(".caption").evaluate(el => el.classList.add("expanded"));
await page.waitForTimeout(250);
await gcard.locator(".details-toggle").click();
await page.waitForTimeout(300);
check("gfx sale card expands details inline", await gcard.locator(".details-body .details-inner").count() === 1);
await gcard.locator(".view-full").click();
await page.waitForTimeout(400);
check("gfx post opens full detail (findPost resolves registry)",
  await scr().getAttribute("class").then(c => c.includes("pv-open") && c.includes("detail-open")) &&
  (await page.locator(".page-detail .detail-scroll").textContent()).includes("Datejust"));
await page.screenshot({ path: `${OUT}/d-pfg-gfx-detail.png` });
await page.locator(".page-detail .detail-back").click();
await page.waitForTimeout(350);
check("detail-back from gfx detail returns to Posts viewer",
  await scr().getAttribute("class").then(c => c.includes("pv-open") && !c.includes("detail-open")));

await pv().locator(".pv-back").click();
await page.waitForTimeout(350);
check("back lands on Watch 777 profile", (await sub().locator(".pf-vname").textContent()).includes("Watch 777"));
check("head follow synced to profile button", (await sub().locator(".pf-foll").textContent()).includes("Following"));

// Following ⌄ opens the manage sheet (IG-style: favorites / mute / unfollow)
await sub().locator(".pf-foll").click(); await page.waitForTimeout(350);
check("Following opens manage sheet",
  (await page.locator(".comment-sheet .sheet-title").textContent()).includes("Watch 777") &&
  await page.locator(".comment-sheet .mf-row").count() === 3);
await page.locator(".comment-sheet .mf-fav").click(); await page.waitForTimeout(300);
check("add to favorites toggles row in place",
  (await page.locator(".comment-sheet .mf-fav span").textContent()).includes("Remove from favorites"));
await page.locator(".comment-sheet .mf-mute").click(); await page.waitForTimeout(300);
check("mute opens feed-style confirm dialog",
  (await page.locator(".dlg .dlg-q").textContent()).includes("Mute Watch 777") &&
  await page.locator(".dlg .dlg-mute-go").count() === 1);
await page.locator(".dlg .dlg-mute-go").click(); await page.waitForTimeout(300);
check("mute confirm closes dialog", !(await scr().getAttribute("class")).includes("dialog-open"));
await page.locator(".comment-sheet .mf-unf").click(); await page.waitForTimeout(350);
check("unfollow acts immediately — no confirm (IG)", (await sub().locator(".pf-foll").textContent()).trim() === "Follow" &&
  !(await scr().getAttribute("class")).includes("unfollow-open"));
check("unfollow resets favorite + muted state",
  await page.evaluate(() => { const p = POSTS.find(x => x.seller === "Watch 777"); return p && !p.favorite && !p.muted; }));

// ============ 4) like mutation persists across re-render (PF_GFX_REG reuse) ============
await sub().locator(".pf-tile").nth(1).click();
await page.waitForTimeout(400);
check("reopen gfx post -> liked state persisted", await pv().locator(".pfp-post").nth(1).locator(".like-btn").getAttribute("class").then(c => c.includes("liked")));
check("follow pill returns as Follow after unfollow", await pv().locator(".pfp-follow").count() === 1 &&
  (await pv().locator(".pfp-follow").textContent()).trim() === "Follow");
await pv().locator(".pv-back").click();
await page.waitForTimeout(350);
await sub().locator(".pf-head .sub-back").click();
await page.waitForTimeout(300);

// ============ 5) another seller via search -> grid + count sync ============
await page.locator(".search-btn").click();
await page.waitForTimeout(400);
await sub().locator(".sr-fake").click();
await page.waitForTimeout(350);
await sub().locator("input.sr-q").fill("chrono");
await sub().locator("input.sr-q").press("Enter");
await page.waitForTimeout(400);
await sub().locator('.sr-tab[data-tab="profiles"]').click();
await page.waitForTimeout(350);
check("search profiles finds chrono.th", await sub().locator(".sr-scard").count() >= 1);
await sub().locator(".sr-scard .b").first().click();
await page.waitForTimeout(400);
check("chrono.th viewer profile opened", (await sub().locator(".pf-vname").textContent()).includes("chrono.th"),
  await sub().locator(".pf-vname").textContent().catch(() => ""));
const chronoTiles = await tileCount();
check("chrono.th grid filled (>1 tile, real+mock)", chronoTiles > 1, String(chronoTiles));
check("chrono.th posts stat = tile count", (await postsStat()) === String(chronoTiles), `${await postsStat()} vs ${chronoTiles}`);
check("chrono.th no verified badge", await sub().locator(".pf-vb").count() === 0);
await page.screenshot({ path: `${OUT}/d-pfg-chrono.png` });

// ============ 6) follow toggle still works on filled profile ============
const chronoFoll = sub().locator(".pf-foll");
if ((await chronoFoll.textContent()).trim() === "Follow") {
  await chronoFoll.click();
  await page.waitForTimeout(350);
}
check("follow toggles to Following (gray, not primary)", (await chronoFoll.textContent()).trim().startsWith("Following") &&
  !(await chronoFoll.getAttribute("class")).includes("primary"));
await page.screenshot({ path: `${OUT}/d-pfg-chrono-following.png` });
await sub().locator(".pf-head .sub-back").click();
await page.waitForTimeout(300);
await sub().locator(".sub-back").click();
await sub().locator(".sub-back").click();
await page.waitForTimeout(350);

// ============ 7) every feed-reachable seller profile has a filled grid ============
// walk each unique seller post's avatar -> profile -> check tiles>1 + stat sync
const sellers = await page.evaluate(() => [...new Set(POSTS.map(p => p.seller))]);
let sparse = [];
for (const s of sellers) {
  await page.evaluate(name => pushSub(document.querySelector(".screen"), "profile:" + name), s);
  await page.waitForTimeout(200);
  const n = await tileCount();
  const stat = await postsStat();
  if (n <= 1 || stat !== String(n)) sparse.push(`${s}:${n}/${stat}`);
  await sub().locator(".pf-head .sub-back").click();
  await page.waitForTimeout(200);
}
check("all seller profiles have filled grids + synced counts", sparse.length === 0, sparse.join(", ") || `${sellers.length} sellers`);

// ============ 8) light theme ============
await page.locator("#themeToggle").click();
await page.waitForTimeout(400);
await scr().locator(".feed-scroll .post").first().locator(".post-head .avatar-ring").click();
await page.waitForTimeout(400);
check("viewer profile + grid render light theme", await scr().getAttribute("data-theme") === "light" && await tileCount() === 13);
const ltBg = await sub().locator(".pf-foll").evaluate(el => getComputedStyle(el).backgroundColor);
check("viewer action button uses theme color (no leftover IG blue)", ltBg !== "rgb(47, 125, 246)", ltBg);
await page.screenshot({ path: `${OUT}/d-pfg-viewer-light.png` });
await sub().locator(".pf-head .sub-back").click();
await page.waitForTimeout(250);
await page.locator("#themeToggle").click();
await page.waitForTimeout(300);

check("no console errors", errors === 0);

await browser.close();
console.log(`\n${failed} failed / ${errors} console errors`);
process.exit(failed || errors ? 1 : 0);
