// Verify fo-flow PROFILE-004: followers/following page gets IG parity —
// 2 tabs with lowercase counts, search bar filters username+display name,
// own followers rows carry a Remove button (center confirm dialog, session
// persistence), every other row has a red Follow / grey Following pill that
// flips in place and syncs account-level via pfSetFollow/setFollowing, your
// own account never appears in other people's lists, row tap opens profile.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-PROFILE-004";
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
const visRows = () => sub().locator(".pfl-row:visible").count();

await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

// ============ 1) own followers — IG layout ============
await scr().locator('.bottom-nav .nav-item[data-navgo="profile"]').click();
await page.waitForTimeout(400);
await sub().locator('[data-pfgo="followers"]').click();
await page.waitForTimeout(350);
check("followers page title = username", (await sub().locator(".detail-title").textContent()).trim() === "king.mr.fox");
check("header title centered (IG)", await sub().evaluate(el => {
  const t = el.querySelector(".pfl-head .detail-title").getBoundingClientRect();
  const h = el.querySelector(".pfl-head").getBoundingClientRect();
  return Math.abs((t.left + t.width / 2) - (h.left + h.width / 2)) <= 2;
}));
check("exactly 2 tabs, IG lowercase counts",
  (await sub().locator(".pfl-tab").allTextContents()).join("|") === "21.1K followers|4,173 following",
  (await sub().locator(".pfl-tab").allTextContents()).join("|"));
check("followers tab active by default", await sub().locator('.pfl-tab.on[data-pftab="followers"]').count() === 1);
check("search bar with IG placeholder",
  (await sub().locator(".pfl-q").getAttribute("placeholder")) === "Search username or display name");
check("own follower rows render", await visRows() > 3);
check("own followers: Remove on every row, no follow buttons",
  await sub().locator(".pfl-row .pf-rmf").count() === await sub().locator(".pfl-row").count() &&
  await sub().locator(".pfl-row .pf-flw").count() === 0);
check("row buttons equal width + compact height (IG)", await sub().evaluate(el => {
  const rs = [...el.querySelectorAll(".pfl-row .mact")].map(b => b.getBoundingClientRect());
  return rs.length > 1 && rs.every(r => Math.round(r.width) === Math.round(rs[0].width)) &&
    rs[0].height <= 34;
}));
await page.screenshot({ path: `${OUT}/d-pfl-own-followers.png` });

// ============ 2) search filters username + display name ============
const totalRows = await sub().locator(".pfl-row").count();
await sub().locator(".pfl-q").fill("watch");
await page.waitForTimeout(250);
const watchHits = await visRows();
check("search 'watch' narrows the list", watchHits > 0 && watchHits < totalRows, `${watchHits}/${totalRows}`);
check("search matches display name too", await sub().locator(".pfl-row:visible").evaluateAll(
  rows => rows.every(r => (r.querySelector(".mn").textContent + " " + r.querySelector(".md").textContent).toLowerCase().includes("watch"))));
await page.screenshot({ path: `${OUT}/d-pfl-search.png` });
await sub().locator(".pfl-q").fill("zzzznothing");
await page.waitForTimeout(250);
check("no-match search shows No results found", await visRows() === 0 &&
  await sub().locator(".pfl-none").isVisible());
await sub().locator(".pfl-q").fill("");
await page.waitForTimeout(250);
check("clearing search restores all rows", await visRows() === totalRows);

// ============ 3) Remove follower — confirm dialog + persists ============
const firstName = await sub().locator(".pfl-row").first().locator(".mn").textContent();
await sub().locator(".pfl-row .pf-rmf").first().click();
await page.waitForTimeout(300);
check("Remove opens center confirm dialog", (await page.locator(".dlg .dlg-q").textContent()).includes("Remove follower") &&
  (await page.locator(".dlg .dlg-desc").textContent()).includes(firstName.trim()));
await page.screenshot({ path: `${OUT}/d-pfl-remove-dialog.png` });
await page.locator(".dlg .dlg-cancel").click();
await page.waitForTimeout(250);
check("Cancel keeps the row", await visRows() === totalRows);
await sub().locator(".pfl-row .pf-rmf").first().click();
await page.waitForTimeout(250);
await page.locator(".dlg .dlg-rmf-go").click();
await page.waitForTimeout(300);
check("confirm removes the follower row", await sub().locator(".pfl-row").count() === totalRows - 1,
  `${totalRows} -> ${await sub().locator(".pfl-row").count()}`);
await sub().locator('.pfl-tab[data-pftab="following"]').click();
await page.waitForTimeout(250);
await sub().locator('.pfl-tab[data-pftab="followers"]').click();
await page.waitForTimeout(250);
check("removed follower stays gone after tab switch", await sub().locator(".pfl-row").count() === totalRows - 1);
check("removed user absent from the list", await sub().locator(".pfl-row .mn").allTextContents().then(t => !t.includes(firstName)));

// ============ 4) own following tab — Following pills unfollow in place ============
await sub().locator('.pfl-tab[data-pftab="following"]').click();
await page.waitForTimeout(300);
check("own following rows all show Following pill", await visRows() > 0 &&
  await sub().locator(".pfl-row .pf-flw.on").count() === await sub().locator(".pfl-row").count());
check("no Remove on own following", await sub().locator(".pfl-row .pf-rmf").count() === 0);
const unfTarget = await sub().locator(".pfl-row .mn").first().textContent();
await sub().locator(".pfl-row .pf-flw").first().click();
await page.waitForTimeout(250);
check("Following unfollows in place -> Follow (row stays, IG)", (await sub().locator(".pfl-row .pf-flw").first().textContent()).trim() === "Follow");
check("unfollow synced to account state", await page.evaluate(u => !pfIsFollowed(u), unfTarget.trim()));
await page.screenshot({ path: `${OUT}/d-pfl-own-following.png` });
await sub().locator(".pfl-row .pf-flw").first().click();
await page.waitForTimeout(250);
check("re-follow flips back to Following + state sync", (await sub().locator(".pfl-row .pf-flw").first().textContent()).trim() === "Following" &&
  await page.evaluate(u => pfIsFollowed(u), unfTarget.trim()));
await sub().locator(".sub-back").click();
await page.waitForTimeout(300);
await sub().locator('.pf-nav .nav-item[data-navgo="feed"]').click();
await page.waitForTimeout(400);

// ============ 5) viewer profile followers — Follow pills, no Remove, no self ============
await scr().locator(".feed-scroll .post").first().locator(".post-head .avatar-ring").click();
await page.waitForTimeout(400);
check("viewer profile opened", (await sub().locator(".pf-vname").textContent()).includes("Watch 777"));
await sub().locator('[data-pfgo="followers"]').click();
await page.waitForTimeout(350);
check("viewer followers title = their username", (await sub().locator(".detail-title").textContent()).trim() === "Watch 777");
check("viewer followers have Follow/Following, no Remove", await sub().locator(".pfl-row .pf-flw").count() === await sub().locator(".pfl-row").count() &&
  await sub().locator(".pfl-row .pf-rmf").count() === 0);
check("mixed Follow/Following pills equal width (IG)", await sub().evaluate(el => {
  const rs = [...el.querySelectorAll(".pfl-row .mact")].map(b => b.getBoundingClientRect());
  return rs.length > 1 && rs.every(r => Math.round(r.width) === Math.round(rs[0].width)) &&
    rs[0].height <= 34;
}));
check("you never appear in other people's lists", await sub().locator(".pfl-row .mn").allTextContents().then(t => !t.includes("king.mr.fox")));
const folRowBtn = sub().locator(".pfl-row .pf-flw:not(.on)").first();
const folName = await folRowBtn.evaluate(el => el.dataset.u);
check("Follow pill is theme red", await folRowBtn.evaluate(el => getComputedStyle(el).backgroundColor) === "rgb(200, 33, 43)",
  await folRowBtn.evaluate(el => getComputedStyle(el).backgroundColor));
await folRowBtn.click();
await page.waitForTimeout(250);
check("Follow -> Following in place + state sync", (await sub().locator(`.pfl-row .pf-flw[data-u="${folName}"]`).textContent()).trim() === "Following" &&
  await page.evaluate(u => pfIsFollowed(u), folName));
await page.screenshot({ path: `${OUT}/d-pfl-viewer-followers.png` });

// ============ 6) row tap opens that user's profile, back returns ============
await sub().locator(".pfl-row").first().locator(".mn").click();
await page.waitForTimeout(400);
check("row tap opens the user's profile", await sub().locator(".pf-vname, .pf-uname").count() === 1);
const profName = (await sub().locator(".pf-vname, .pf-uname").textContent()).trim();
await sub().locator(".sub-back").click();
await page.waitForTimeout(350);
check("back returns to the followers list", (await sub().locator(".detail-title").textContent()).trim() === "Watch 777" &&
  await sub().locator(".pfl-tabs").count() === 1, `opened ${profName}`);

// ============ 7) viewer following tab ============
await sub().locator('.pfl-tab[data-pftab="following"]').click();
await page.waitForTimeout(300);
check("viewer following rows use Follow/Following pills", await visRows() > 0 &&
  await sub().locator(".pfl-row .pf-flw").count() === await sub().locator(".pfl-row").count());
await page.screenshot({ path: `${OUT}/d-pfl-viewer-following.png` });

// ============ 8) light theme (toggle re-renders the screen — re-navigate in) ============
await page.locator("#themeToggle").click();
await page.waitForTimeout(400);
await scr().locator('.bottom-nav .nav-item[data-navgo="profile"]').click();
await page.waitForTimeout(400);
await sub().locator('[data-pfgo="followers"]').click();
await page.waitForTimeout(350);
check("followers page renders in light theme", await scr().getAttribute("data-theme") === "light" &&
  await sub().locator(".pfl-tabs").count() === 1 && await visRows() > 0);
await page.screenshot({ path: `${OUT}/d-pfl-light.png` });
await page.locator("#themeToggle").click();
await page.waitForTimeout(300);

check("no console errors", errors === 0);

await browser.close();
console.log(`\n${failed} failed / ${errors} console errors`);
process.exit(failed || errors ? 1 : 0);
