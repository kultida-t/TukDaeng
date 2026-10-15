// Verify fo-flow PROFILE-001: IG-style Profile menu — own profile (bottom nav
// Profile item) and viewer profile (author avatar/name, search Profiles tab,
// comments, liked-by). Own: note bubble, stats, bio, Edit/Share buttons,
// 4 content tabs, in-page bottom nav with Profile active. Viewer: back head,
// verified badge, Follow/Message, Followed-by row, post grid -> post viewer.
// Follow toggles stay in sync with feed follow buttons (account-level).
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-PROFILE-001";
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

await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

// ============ 1) own profile via bottom nav ============
await scr().locator('.bottom-nav .nav-item[data-navgo="profile"]').click();
await page.waitForTimeout(400);
check("own profile opens as sub page", await scr().getAttribute("class").then(c => c.includes("sub-open")));
check("own header username = king.mr.fox", (await sub().locator(".pf-uname span").textContent()).trim() === "king.mr.fox");
check("own header plain username (no lock/chevron)", await sub().locator(".pf-uname svg").count() === 0);
check("own header hamburger + create +", await sub().locator(".pf-menu").count() === 1 && await sub().locator('.pf-head [data-flow="create"]').count() === 1);
check("no note bubble on avatar", await sub().locator(".pf-note").count() === 0);
check("no avatar add badge", await sub().locator(".pf-avadd").count() === 0);
check("3 stats posts/followers/following", (await sub().locator(".pf-stat span").allTextContents()).join("|") === "posts|followers|following");
check("display name", (await sub().locator(".pf-disp").textContent()).includes("Mr.FOX"));
check("bio shows", (await sub().locator(".pf-biot").textContent()).includes("CEO of Mr.FOX"));
check("no sleep mode pill", await sub().locator(".pf-sleep").count() === 0);
check("link chip + Add chip", await sub().locator(".pf-link").count() === 1 && await sub().locator(".pf-addchip").count() === 1);
check("Edit/Share buttons", (await sub().locator(".pf-actions .pf-btn").allTextContents()).join("|").includes("Edit profile|Share profile"));
check("5 owner tabs (All/Sale/Show/Hide/Sold)", (await sub().locator(".pf-tab").allTextContents()).join("|") === "All|Sale|Show|Hide|Sold", (await sub().locator(".pf-tab").allTextContents()).join("|"));
check("all tab active", await sub().locator('.pf-tab.on[data-pftab="all"]').count() === 1);
check("own grid populated (9 mock posts)", await sub().locator(".pf-tile").count() === 9, String(await sub().locator(".pf-tile").count()));
check("in-page bottom nav, Profile active", await sub().locator('.pf-nav .nav-item.active[data-navgo="profile"]').count() === 1);
await page.screenshot({ path: `${OUT}/d-profile-own.png` });

// ============ 2) tabs switch ============
await sub().locator('.pf-tab[data-pftab="sold"]').click();
await page.waitForTimeout(300);
check("sold tab active + filters grid", await sub().locator('.pf-tab.on[data-pftab="sold"]').count() === 1 && await sub().locator(".pf-tile").count() === 2, String(await sub().locator(".pf-tile").count()));
check("active tab stays in view", await sub().evaluate(el => {
  const t = el.querySelector(".pf-tab.on"), b = el.querySelector(".pf-tabs");
  const r = t.getBoundingClientRect(), bb = b.getBoundingClientRect();
  return r.left >= bb.left - 1 && r.right <= bb.right + 1;
}));
await sub().locator('.pf-tab[data-pftab="all"]').click();
await page.waitForTimeout(300);
check("all tab back to 9 tiles", await sub().locator(".pf-tile").count() === 9);

// ============ 3) followers list ============
await sub().locator('[data-pfgo="followers"]').click();
await page.waitForTimeout(350);
check("followers page title = username", (await sub().locator(".detail-title").textContent()).trim() === "king.mr.fox");
check("followers/following tabs", (await sub().locator(".pfl-tab").allTextContents()).join("|").includes("Followers|"));
check("follower rows shown", await sub().locator(".pfl-row").count() > 3);
const firstFlw = sub().locator(".pfl-row .pf-flw").first();
const flwBefore = (await firstFlw.textContent()).trim();
await firstFlw.click();
await page.waitForTimeout(300);
check("row follow toggles", (await sub().locator(".pfl-row .pf-flw").first().textContent()).trim() !== flwBefore || flwBefore === "Following");
await page.screenshot({ path: `${OUT}/d-profile-followers.png` });
await sub().locator(".sub-back").click();
await page.waitForTimeout(350);
check("back to own profile", await sub().locator(".pf-uname").count() === 1);

// ============ 4) edit profile ============
await sub().locator(".pf-edit").click();
await page.waitForTimeout(350);
check("edit page title", (await sub().locator(".detail-title").textContent()).trim() === "Edit profile");
check("3 fields + save", await sub().locator(".pe-in").count() === 3 && await sub().locator(".pe-save").count() === 1);
await sub().locator(".pe-bio").fill("edited bio ✅\nline two");
await sub().locator(".pe-save").click();
await page.waitForTimeout(350);
check("save returns to profile", await sub().locator(".pf-uname").count() === 1);
check("bio updated", (await sub().locator(".pf-biot").textContent()).includes("edited bio"));

// ============ 5) hamburger -> settings, back ============
await sub().locator(".pf-menu").click();
await page.waitForTimeout(350);
check("hamburger opens settings", (await sub().locator(".detail-title").textContent()).trim() === "Settings and activity");
await sub().locator(".sub-back").click();
await page.waitForTimeout(300);
check("back to profile from settings", await sub().locator(".pf-uname").count() === 1);

// ============ 5b) asset value button -> portfolio page ============
check("portfolio icon button on own profile", await sub().locator('.pf-iconbtn[data-sub="portfolio"]').count() === 1);
check("no discover-people btn on own", await sub().locator(".pf-addp").count() === 0);
await sub().locator('.pf-iconbtn[data-sub="portfolio"]').click();
await page.waitForTimeout(350);
check("portfolio page opens", (await sub().locator(".detail-title").textContent()).trim() === "Portfolio");
check("total value card", (await sub().locator(".pfo-total").textContent()).includes("Total invested") && /THB [\d,]+/.test(await sub().locator(".pfo-total b").textContent()));
check("asset rows with values", await sub().locator(".pfo-row").count() === 9 && await sub().locator(".pfo-val").count() === 9);
await page.screenshot({ path: `${OUT}/d-profile-portfolio.png` });
await sub().locator(".sub-back").click();
await page.waitForTimeout(300);
check("back to profile from portfolio", await sub().locator(".pf-uname").count() === 1);

// ============ 6) in-page nav Feed exits to feed ============
await sub().locator('.pf-nav .nav-item[data-navgo="feed"]').click();
await page.waitForTimeout(350);
check("feed nav exits profile", !(await scr().getAttribute("class")).includes("sub-open"));

// ============ 7) viewer profile via feed post avatar ============
await scr().locator(".feed-scroll .post").first().locator(".post-head .avatar-ring").click();
await page.waitForTimeout(400);
check("viewer profile opens", await scr().getAttribute("class").then(c => c.includes("sub-open")));
check("viewer header username (no blue verified badge — removed per PROFILE-003)", (await sub().locator(".pf-vname").textContent()).includes("Watch 777") && await sub().locator(".pf-vb").count() === 0);
check("viewer back + more", await sub().locator(".pf-head .sub-back").count() === 1 && await sub().locator(".pf-more").count() === 1);
check("viewer has no discover-people btn (IG parity)", await sub().locator(".pf-addp").count() === 0 && await sub().locator('[data-sub="portfolio"]').count() === 0);
check("Follow/Message buttons", /^(Follow|Following)\s*\|Message/.test((await sub().locator(".pf-actions .pf-btn").allTextContents()).join("|")), (await sub().locator(".pf-actions .pf-btn").allTextContents()).join("|"));
check("Follow/Message equal height (IG parity)", await sub().locator(".pf-actions").evaluate(el => {
  const btns = [...el.querySelectorAll(".pf-btn")].map(b => Math.round(b.getBoundingClientRect().height));
  return btns.length === 2 && btns[0] === btns[1];
}));
check("followed-by row", (await sub().locator(".pf-fby").textContent()).includes("Followed by"));
check("no note/sleep/add-badge on viewer", await sub().locator(".pf-note").count() === 0 && await sub().locator(".pf-sleep").count() === 0 && await sub().locator(".pf-avadd").count() === 0);
check("viewer post grid populated (13 = 1 real + 12 mock)", await sub().locator(".pf-tile").count() === 13, String(await sub().locator(".pf-tile").count()));
await page.screenshot({ path: `${OUT}/d-profile-viewer.png` });

// ============ 8) follow syncs to feed ============
const folBtn = sub().locator(".pf-foll");
if ((await folBtn.textContent()).trim() === "Follow") {
  await folBtn.click();
  await page.waitForTimeout(350);
}
check("profile shows Following", (await sub().locator(".pf-foll").textContent()).trim() === "Following");
check("post stats row intact", await sub().locator(".pf-stat").count() === 3);
await page.screenshot({ path: `${OUT}/d-profile-viewer-following.png` });

// ============ 9) grid tile -> post viewer -> back ============
await sub().locator(".pf-tile").first().click();
await page.waitForTimeout(400);
check("post viewer opens over profile", await scr().getAttribute("class").then(c => c.includes("pv-open")));
await page.locator(".pv-back").click();
await page.waitForTimeout(350);
check("back lands on same profile", (await sub().locator(".pf-vname").textContent()).includes("Watch 777"));

// ============ 10) ... menu sheet (IG-style, app-relevant only) ============
await sub().locator(".pf-more").click();
await page.waitForTimeout(300);
check("profile ... sheet opens", await scr().getAttribute("class").then(c => c.includes("pm-open")));
const pmLabels = await page.locator(".comment-sheet.pm .pm-row span").allTextContents();
check("IG menu rows = Report/Block/About/Copy/Share + Cancel",
  pmLabels.join("|") === "Report|Block|About this account|Copy profile URL|Share this profile|Cancel", pmLabels.join("|"));
check("no Restrict/shared-activity/hide-story/QR rows", !pmLabels.some(t => /restrict|shared activity|story|qr code/i.test(t)));
check("Report row is danger-styled", await page.locator(".pf-sh-report.danger").count() === 1);
await page.screenshot({ path: `${OUT}/d-profile-more-menu.png` });
await page.locator(".pf-sh-report").click();
await page.waitForTimeout(400);
check("Report opens account-report page", (await page.locator(".pm-rp-q").textContent()).includes("account"));
await page.locator(".rp-x").click();
await page.waitForTimeout(350);
await sub().locator(".pf-more").click();
await page.waitForTimeout(300);
await page.locator(".pf-sh-copy").click();
await page.waitForTimeout(300);
check("copy link -> toast", (await page.locator(".sc-toast").textContent()).includes("copied"));
await sub().locator(".pf-more").click();
await page.waitForTimeout(300);
await page.locator(".pf-sh-cancel").click();
await page.waitForTimeout(300);
check("Cancel closes sheet silently", !(await scr().getAttribute("class")).includes("pm-open"));

// ============ 10b) avatar tap -> full view overlay ============
await sub().locator("[data-pfav]").click();
await page.waitForTimeout(300);
check("avatar overlay opens", await sub().locator(".pf-avov").count() === 1);
check("overlay has 4 actions", (await sub().locator(".pf-avov-act").allTextContents()).join("|") === "Following|Share|Copy link|QR code", (await sub().locator(".pf-avov-act").allTextContents()).join("|"));
await page.screenshot({ path: `${OUT}/d-profile-avov.png` });
await sub().locator('.pf-avov-act[data-avact="copy"]').click();
await page.waitForTimeout(300);
check("overlay copy -> toast + closes", await sub().locator(".pf-avov").count() === 0 && (await page.locator(".sc-toast").textContent()).includes("copied"));
await sub().locator("[data-pfav]").click();
await page.waitForTimeout(250);
await sub().locator(".pf-avov").click({ position: { x: 10, y: 60 } });
await page.waitForTimeout(250);
check("backdrop tap closes overlay", await sub().locator(".pf-avov").count() === 0);

// ============ 11) back to feed ============
await sub().locator(".pf-head .sub-back").click();
await page.waitForTimeout(350);
check("back to feed", !(await scr().getAttribute("class")).includes("sub-open"));
const fb = scr().locator(".feed-scroll .post").first().locator(".follow-btn");
check("feed follow button synced", await fb.count() === 0 || (await fb.textContent()).trim() === "Following");

// ============ 12) search Profiles tab -> viewer profile ============
await page.locator(".search-btn").click();
await page.waitForTimeout(400);
await sub().locator(".sr-fake").click();
await page.waitForTimeout(350);
await sub().locator("input.sr-q").fill("watch");
await sub().locator("input.sr-q").press("Enter");
await page.waitForTimeout(400);
await sub().locator('.sr-tab[data-tab="profiles"]').click();
await page.waitForTimeout(350);
check("profile cards listed", await sub().locator(".sr-scard").count() >= 2);
await sub().locator(".sr-scard .b").first().click();
await page.waitForTimeout(400);
check("sr-scard opens viewer profile", await sub().locator(".pf-vname").count() === 1, await sub().locator(".pf-vname").textContent().catch(() => ""));
await page.screenshot({ path: `${OUT}/d-profile-from-search.png` });
await sub().locator(".pf-head .sub-back").click();
await page.waitForTimeout(300);
check("back to search results", await sub().locator(".sr-tab").count() === 3);
await sub().locator(".sub-back").click();
await sub().locator(".sub-back").click();
await page.waitForTimeout(350);

// ============ 13) comment author -> profile ============
await scr().locator(".feed-scroll .post").first().locator(".comment-btn").click();
await page.waitForTimeout(400);
check("comments sheet open", await scr().getAttribute("class").then(c => c.includes("comments-open")));
await page.locator(".comment-sheet .c-row .n").first().click();
await page.waitForTimeout(400);
check("comment author opens profile", await sub().locator(".pf-vname").count() === 1, await sub().locator(".pf-vname").textContent().catch(() => ""));
await sub().locator(".pf-head .sub-back").click();
await page.waitForTimeout(300);

// ============ 14) light theme render ============
await page.locator("#themeToggle").click();
await page.waitForTimeout(400);
await scr().locator('.bottom-nav .nav-item[data-navgo="profile"]').click();
await page.waitForTimeout(400);
check("profile renders in light theme", await scr().getAttribute("data-theme") === "light" && await sub().locator(".pf-uname").count() === 1);
await page.screenshot({ path: `${OUT}/d-profile-own-light.png` });
await page.locator("#themeToggle").click();
await page.waitForTimeout(300);

check("no console errors", errors === 0);

await browser.close();
console.log(`\n${failed} failed / ${errors} console errors`);
process.exit(failed || errors ? 1 : 0);
