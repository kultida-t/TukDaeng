// Verify fo-flow PROFILE-002: profile grid tile opens the IG "Posts" surface —
// centered "Posts"/username head, feed-style cards identical to the feed
// (author row + location only, swipeable photo carousel with 1/n chip + dots,
// heart w/o count, comment count, views, share, save right, liked-by, caption,
// timestamp), continuous scroll, interactions (like toggle, comments sheet),
// back returns to the same profile. PROFILE-003b: no music line, no like
// count, no comment preview on the card — comments open via the icon.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-PROFILE-002";
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

await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

// ============ 1) own profile -> Posts viewer ============
await scr().locator('.bottom-nav .nav-item[data-navgo="profile"]').click();
await page.waitForTimeout(400);
await sub().locator(".pf-tile").first().click();
await page.waitForTimeout(400);
check("posts viewer opens over own profile", await scr().getAttribute("class").then(c => c.includes("pv-open")));
check("viewer is pfp (posts) mode", await pv().getAttribute("class").then(c => c.includes("pfp")));
check("header title = Posts / king.mr.fox",
  (await pv().locator(".pfp-tt b").textContent()).trim() === "Posts" &&
  (await pv().locator(".pfp-tt span").textContent()).trim() === "king.mr.fox");
check("no search icon in posts head", await pv().locator(".pv-srch").count() === 0);
check("back button present", await pv().locator(".pv-back").count() === 1);
check("9 feed-style cards (one per grid post)", await pv().locator(".pfp-post").count() === 9, String(await pv().locator(".pfp-post").count()));

// ============ 2) card structure (first card = gfx meta w/ music) ============
const card0 = pv().locator(".pfp-post").first();
check("card head avatar + name + more", await card0.locator(".post-head .avatar-ring img").count() === 1 && await card0.locator(".post-head .more").count() === 1);
check("no Follow btn on own post", await card0.locator(".follow-btn").count() === 0);
check("no music line under username (feed parity)", await card0.locator(".pfp-music").count() === 0 && await card0.locator(".post-head .sub-line").count() === 0);
check("photo renders 4:5 slot", await card0.locator(".post-photo img").count() === 1);
check("own profile shows like count beside heart", (await card0.locator(".like-btn .lk-n").textContent()).trim() === "128");
check("comment count beside icon", (await card0.locator(".comment-btn span").textContent()).trim() === "6");
check("share + save(right) actions", await card0.locator(".share-btn").count() === 1 && await card0.locator(".act-right .save-btn").count() === 1);
check("liked-by row w/o count", (await card0.locator(".liked-by").textContent()).includes("Liked by") &&
  (await card0.locator(".liked-by").textContent()).includes("and others") &&
  !(await card0.locator(".liked-by").textContent()).includes("128"));
check("caption line", (await card0.locator(".caption").textContent()).includes("snow day rotation"));
check("no comment preview row (feed parity)", await card0.locator(".comment-preview").count() === 0);
check("timestamp", (await card0.locator(".post-time").textContent()).trim() === "2 days ago");
await page.screenshot({ path: `${OUT}/d-pfp-own.png` });

// ============ 3) like toggle updates count on grid post ============
await card0.locator(".like-btn").click();
await page.waitForTimeout(250);
check("like toggles + own count 128->129", (await card0.locator(".like-btn .lk-n").textContent()).trim() === "129" &&
  await card0.locator(".like-btn").getAttribute("class").then(c => c.includes("liked")));

// ============ 3b) own-post "..." opens own menu (not Not interested/Report) ============
await card0.locator(".post-head .more").click();
await page.waitForTimeout(300);
check("own post ... -> pm-open", await scr().getAttribute("class").then(c => c.includes("pm-open")));
check("own menu has Archive/Edit/Pin/Delete",
  await page.locator(".comment-sheet .pm-own-archive").count() === 1 &&
  await page.locator(".comment-sheet .pm-own-edit").count() === 1 &&
  await page.locator(".comment-sheet .pm-own-pin").count() === 1 &&
  await page.locator(".comment-sheet .pm-own-del").count() === 1);
check("own menu has NO Not interested/Report",
  await page.locator(".comment-sheet .pm-ni").count() === 0 &&
  await page.locator(".comment-sheet .pm-go-report").count() === 0);
await page.locator(".comment-sheet .sheet-handle").click();
await page.waitForTimeout(300);

// ============ 4) continuous scroll: next card visible below ============
check("second card exists in same scroll track", await pv().locator(".pfp-post").nth(1).locator(".caption").textContent().then(t => t.includes("new arrival")));
await pv().locator(".svf-track").evaluate(el => { el.scrollTop += 700; });
await page.waitForTimeout(300);
const c1top = await pv().locator(".pfp-post").nth(1).evaluate(el => el.getBoundingClientRect().top);
check("scrolled card 1 upward", c1top < 500, String(Math.round(c1top)));

// ============ 5) back returns to same profile ============
await pv().locator(".pv-back").click();
await page.waitForTimeout(350);
check("back lands on own profile", await sub().locator(".pf-uname").count() === 1);

// ============ 6) viewer profile -> Posts viewer (real post p1) ============
await sub().locator('.pf-nav .nav-item[data-navgo="feed"]').click(); /* exit own profile back to feed */
await page.waitForTimeout(350);
await scr().locator(".feed-scroll .post").first().locator(".post-head .avatar-ring").click();
await page.waitForTimeout(400);
check("viewer profile opened", await sub().locator(".pf-vname").count() === 1);
await sub().locator(".pf-tile").first().click();
await page.waitForTimeout(400);
check("posts viewer title = Watch 777", (await pv().locator(".pfp-tt span").textContent()).trim() === "Watch 777");
const vcard = pv().locator(".pfp-post").first();
check("no music line on p1", await vcard.locator(".pfp-music").count() === 0);
check("multi-photo renders one swipeable photo", await vcard.locator(".post-photo").count() === 1, String(await vcard.locator(".post-photo").count()));
check("counter chip 1/3", (await vcard.locator(".post-photo .photo-counter").textContent()).trim() === "1/3");
check("3 dots under photo", await vcard.locator(".photo-dots span").count() === 3);
// swipe left -> 2/3, tap right -> 3/3 (same carousel mechanics as feed)
const vbox = await vcard.locator(".post-photo").boundingBox();
const vcx = vbox.x + vbox.width / 2, vcy = vbox.y + vbox.height / 2;
await page.mouse.move(vcx, vcy); await page.mouse.down();
for (let i = 1; i <= 10; i++) await page.mouse.move(vcx - 16 * i, vcy);
await page.mouse.up();
await page.waitForTimeout(500);
check("swipe left -> 2/3 + dot moves", (await vcard.locator(".photo-counter").textContent()).trim() === "2/3" &&
  await vcard.locator(".photo-dots span").nth(1).getAttribute("class").then(c => c.includes("on")));
await vcard.locator(".post-photo").click({ position: { x: vbox.width - 20, y: vbox.height / 2 } });
await page.waitForTimeout(300);
check("tap right -> 3/3", (await vcard.locator(".photo-counter").textContent()).trim() === "3/3");
check("comment count 1 + no like count + views stat", (await vcard.locator(".comment-btn span").textContent()).trim() === "1" &&
  await vcard.locator(".like-btn .lk-n").count() === 0 && await vcard.locator(".views-stat").count() === 1);
check("sale post keeps Ask pill", await vcard.locator(".act-right .ask-pill").count() === 1);
check("caption + time, no comment preview", (await vcard.locator(".caption").textContent()).includes("Rolex Submariner") && await vcard.locator(".comment-preview").count() === 0 && (await vcard.locator(".post-time").textContent()).includes("3 days ago"));
await page.screenshot({ path: `${OUT}/d-pfp-viewer.png` });

// ============ 7) interactions inside posts viewer ============
await vcard.locator(".like-btn").click();
await page.waitForTimeout(250);
check("viewer like -> liked class", await vcard.locator(".like-btn").getAttribute("class").then(c => c.includes("liked")));
await vcard.locator(".comment-btn").click();
await page.waitForTimeout(350);
check("comment opens comments sheet", await scr().getAttribute("class").then(c => c.includes("comments-open")));
await page.screenshot({ path: `${OUT}/d-pfp-comments.png` });
await page.locator(".comment-sheet .sheet-handle").click();
await page.waitForTimeout(300);
await vcard.locator(".more").click();
await page.waitForTimeout(300);
check("... opens post menu sheet", await scr().getAttribute("class").then(c => c.includes("pm-open")));
check("other-user post keeps Not interested/Report menu",
  await page.locator(".comment-sheet .pm-ni").count() === 1 &&
  await page.locator(".comment-sheet .pm-go-report").count() === 1 &&
  await page.locator(".comment-sheet .pm-own-del").count() === 0);
await page.locator(".comment-sheet .sheet-handle").click();
await page.waitForTimeout(300);

// ============ 8) back to viewer profile ============
await pv().locator(".pv-back").click();
await page.waitForTimeout(350);
check("back lands on Watch 777 profile", (await sub().locator(".pf-vname").textContent()).includes("Watch 777"));
await sub().locator(".pf-head .sub-back").click();
await page.waitForTimeout(300);

// ============ 9) light theme ============
await page.locator("#themeToggle").click();
await page.waitForTimeout(400);
await scr().locator('.bottom-nav .nav-item[data-navgo="profile"]').click();
await page.waitForTimeout(400);
await sub().locator(".pf-tile").first().click();
await page.waitForTimeout(400);
check("posts viewer renders light theme", await scr().getAttribute("data-theme") === "light" && await pv().locator(".pfp-post").count() === 9);
await page.screenshot({ path: `${OUT}/d-pfp-own-light.png` });
await page.locator("#themeToggle").click();
await page.waitForTimeout(300);

check("no console errors", errors === 0);

await browser.close();
console.log(`\n${failed} failed / ${errors} console errors`);
process.exit(failed || errors ? 1 : 0);
