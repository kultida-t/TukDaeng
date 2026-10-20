// Verify fo-flow PORTFOLIO-002 — full flow matrix:
//   create  : normal post / post+drawer / asset Show / asset Hide / asset Post-to-feed
//   edit    : status transitions sale→show→hide, detach drawer, attach drawer
//   sell    : Mark as sold from Show / Hide / Sale posts + asset detail
//   display : feed, profile tabs, portfolio list, sold history — correct at every step
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-PORTFOLIO-002-flows";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
let errors = 0, failed = 0;
page.on("console", m => { if (m.type() === "error") { errors++; console.log("CONSOLE ERR:", m.text()); } });
page.on("pageerror", e => { errors++; console.log("PAGE ERR:", e.message); });
const check = (name, ok, extra = "") => { console.log(`${ok ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`); if (!ok) failed++; };
const wait = ms => page.waitForTimeout(ms);
const scr = () => page.locator(".screen");
const sub = () => page.locator(".page-sub");
const tile = pid => sub().locator(`.pf-tile[data-pid="${pid}"]`);
const feedPost = pid => page.locator(`.feed-scroll .post[data-pid="${pid}"]`);
const subOpen = async () => (await page.locator(".screen.sub-open").count()) > 0;
const pfTab = async t => { await sub().locator(`[data-pftab="${t}"]`).click(); await wait(350); };
/* bottom-nav hides while a sub page is open — the profile's own .pf-nav lives inside the sub page;
   scope the outer nav to a direct child so a stale .pf-nav in .page-sub can't collide */
const navGo = async key => {
  const loc = (await subOpen()) ? sub().locator(`.nav-item[data-navgo="${key}"]`) : page.locator(`.screen > .bottom-nav .nav-item[data-navgo="${key}"]`);
  await loc.click(); await wait(450);
};
const assetRows = async () => {
  await sub().locator('.pf-iconbtn[data-sub="portfolio"]').click(); await wait(400);
  const n = await sub().locator(".pfo-row").count();
  await sub().locator(".sub-back").first().click(); await wait(350);
  return n;
};
const soldRows = async () => {
  await sub().locator('.pf-iconbtn[data-sub="portfolio"]').click(); await wait(400);
  await sub().locator('[data-sub="soldhist"]').click(); await wait(400);
  const n = await sub().locator(".pfo-row").count();
  await sub().locator(".sub-back").first().click(); await wait(350); // soldhist -> portfolio
  await sub().locator(".sub-back").first().click(); await wait(350); // portfolio -> profile
  return n;
};
const openOwnMenu = async pid => {
  await tile(pid).first().click(); await wait(500);                    // tile -> posts viewer
  await page.locator(`.pfp-post[data-pid="${pid}"] .post-head .more`).click(); await wait(400);
};
const closeViewer = async () => { await page.locator(".pv-back").click(); await wait(400); };
const doSell = async () => {                                          // sell form already open -> save
  await sub().locator(".sell-price").fill("111000");
  await sub().locator(".sell-save").click(); await wait(500);
};

await page.addInitScript(() => {
  localStorage.setItem("fo_onboarded", "1");
  localStorage.setItem("fo_toured", "1");
  localStorage.setItem("fo_session", "member");
  localStorage.setItem("fo_lang", "en");
});
await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await wait(800);

// ==================== A1) normal post — feed + All tab only ====================
await scr().locator('.app-header [data-flow="create"]').click(); await wait(400);
await sub().locator(".ig-grid .cell[data-i]").nth(3).click();
await sub().locator(".cf-next").click(); await wait(300);
await sub().locator(".cf-share").click(); await wait(700);
const pidN = await page.evaluate(() => document.querySelector(".feed-scroll .post")?.dataset.pid);
check("A1 normal post in feed", !!pidN, pidN || "");
await navGo("profile");
await pfTab("all");   check("A1 in All tab", await tile(pidN).count() === 1);
await pfTab("sale");  check("A1 not in Sale tab", await tile(pidN).count() === 0);
await pfTab("show");  check("A1 not in Show tab", await tile(pidN).count() === 0);
await pfTab("hide");  check("A1 not in Hide tab", await tile(pidN).count() === 0);
await pfTab("sold");  check("A1 not in Sold tab", await tile(pidN).count() === 0);
check("A1 created no asset (9 rows)", (await assetRows()) === 9);

// ==================== A2) normal post + "save to My Assets" ON ====================
await navGo("feed");
await scr().locator('.app-header [data-flow="create"]').click(); await wait(400);
await sub().locator(".ig-grid .cell[data-i]").nth(4).click();
await sub().locator(".cf-next").click(); await wait(300);
await sub().locator('.cf .sw:not(.pane-sw)').click(); await wait(300); /* Also save to My Assets ON */
await sub().locator(".cf-share").click(); await wait(700);
const pidD = await page.evaluate(() => document.querySelector(".feed-scroll .post")?.dataset.pid);
check("A2 post+drawer in feed", !!pidD && pidD !== pidN, pidD || "");
await navGo("profile");
await pfTab("sale"); check("A2 in Sale tab", await tile(pidD).count() === 1);
check("A2 asset created (10 rows)", (await assetRows()) === 10);

// ==================== A3) Add Asset + Show ====================
await sub().locator('.pf-head [data-flow="create"][data-mode="asset"]').click(); await wait(400);
await sub().locator(".ig-grid .cell[data-i]").nth(5).click();
await sub().locator(".cf-next").click(); await wait(300);
await sub().locator('.vis-opt[data-v="show"]').click();
await sub().locator(".cf-share").click(); await wait(700);
await pfTab("show");
const pidS = await sub().locator(".pf-tile").first().getAttribute("data-pid");
check("A3 asset-Show post in Show tab", !!pidS && pidS.startsWith("mine"), pidS || "");
check("A3 never in feed", await feedPost(pidS).count() === 0);
check("A3 asset created (11 rows)", (await assetRows()) === 11);

// ==================== A4) Add Asset + Hide ====================
await sub().locator('.pf-head [data-flow="create"][data-mode="asset"]').click(); await wait(400);
await sub().locator(".ig-grid .cell[data-i]").nth(6).click();
await sub().locator(".cf-next").click(); await wait(300);
await sub().locator('.vis-opt[data-v="hide"]').click();
await sub().locator(".cf-share").click(); await wait(700);
await pfTab("hide");
const pidH = await sub().locator(".pf-tile").first().getAttribute("data-pid");
check("A4 asset-Hide post in Hide tab", !!pidH && pidH.startsWith("mine"), pidH || "");
check("A4 never in feed", await feedPost(pidH).count() === 0);
check("A4 asset created (12 rows)", (await assetRows()) === 12);

// ==================== A5) Add Asset + Post to feed ====================
await sub().locator('.pf-head [data-flow="create"][data-mode="asset"]').click(); await wait(400);
await sub().locator(".ig-grid .cell[data-i]").nth(7).click();
await sub().locator(".cf-next").click(); await wait(300);
await sub().locator('.vis-opt[data-v="feed"]').click();
await sub().locator(".cf-share").click(); await wait(700);
const pidF = await page.evaluate(() => document.querySelector(".feed-scroll .post")?.dataset.pid);
check("A5 asset-feed post in feed", !!pidF && pidF.startsWith("px"), pidF || "");
await pfTab("sale");
check("A5 in Sale tab", await tile(pidF).count() === 1);
check("A5 asset created (13 rows)", (await assetRows()) === 13);

// ==================== B1) edit: Sale -> Show ====================
await openOwnMenu(pidD);
await page.locator(".pm-own-edit").click(); await wait(500);
check("B1 edit shows status picker", await sub().locator(".stt-opt").count() === 3);
check("B1 edit shows cost row", await sub().locator('.ig-row[data-pane="cost"]').count() === 1);
await sub().locator('.stt-opt[data-v="show"]').click();
await sub().locator(".cf-done").click(); await wait(600);
await closeViewer();
await pfTab("show"); check("B1 moved to Show tab", await tile(pidD).count() === 1);
await pfTab("sale"); check("B1 left Sale tab", await tile(pidD).count() === 0);
check("B1 left feed", await feedPost(pidD).count() === 0);

// ==================== B2) edit: Show -> Hide ====================
await pfTab("show");
await openOwnMenu(pidD);
await page.locator(".pm-own-edit").click(); await wait(500);
await sub().locator('.stt-opt[data-v="hide"]').click();
await sub().locator(".cf-done").click(); await wait(600);
await closeViewer();
await pfTab("hide"); check("B2 moved to Hide tab", await tile(pidD).count() === 1);
await pfTab("show"); check("B2 left Show tab", await tile(pidD).count() === 0);

// ==================== B3) edit: detach from drawer ====================
await pfTab("hide");
await openOwnMenu(pidD);
await page.locator(".pm-own-edit").click(); await wait(500);
await sub().locator('.cf .sw:not(.pane-sw)').click(); await wait(300); /* drawer toggle OFF */
check("B3 status picker hidden when OFF", await sub().locator(".stt-opt").count() === 0);
await sub().locator(".cf-done").click(); await wait(600);
await closeViewer();
await pfTab("hide");  check("B3 left Hide tab", await tile(pidD).count() === 0);
await pfTab("all");   check("B3 back in All tab only", await tile(pidD).count() === 1);
check("B3 asset removed (12 rows)", (await assetRows()) === 12);
await openOwnMenu(pidD);
check("B3 ordinary post menu has Edit", await page.locator(".pm-own-edit").count() === 1);
check("B3 ordinary post has no sell menu", await page.locator(".pm-own-sold").count() === 0);
await page.locator(".sheet-backdrop").click(); await wait(300);
await closeViewer();
check("B3 detached post back in feed", await feedPost(pidD).count() === 1);

// ==================== B4) edit: attach drawer to a normal post ====================
await openOwnMenu(pidN);
await page.locator(".pm-own-edit").click(); await wait(500);
await sub().locator('.cf .sw:not(.pane-sw)').click(); await wait(300); /* drawer toggle ON */
check("B4 status picker appears when ON", await sub().locator(".stt-opt").count() === 3);
await sub().locator('.stt-opt[data-v="show"]').click();
await sub().locator(".cf-done").click(); await wait(600);
await closeViewer();
await pfTab("show"); check("B4 normal post now in Show tab", await tile(pidN).count() === 1);
check("B4 asset materialized (13 rows)", (await assetRows()) === 13);
check("B4 left feed (show status)", await feedPost(pidN).count() === 0);

// ==================== C1) Mark as sold — Show post ====================
await openOwnMenu(pidS);
check("C1 Show post has Mark as sold", await page.locator(".pm-own-sold").count() === 1);
await page.locator(".pm-own-sold").click(); await wait(400);
check("C1 sell form opens", (await sub().locator(".detail-title").last().textContent()).includes("Mark as sold"));
await doSell();
check("C1 lands on sold detail", (await sub().locator(".detail-title").last().textContent()).includes("Sold item"));
await sub().locator(".sub-back").first().click(); await wait(400); // -> viewer
await closeViewer();
await pfTab("sold"); check("C1 post in Sold tab", await tile(pidS).count() === 1);
await pfTab("show"); check("C1 left Show tab", await tile(pidS).count() === 0);
check("C1 asset sold (12 rows)", (await assetRows()) === 12);

// ==================== C2) Mark as sold — Hide post ====================
await pfTab("hide");
await openOwnMenu(pidH);
check("C2 Hide post has Mark as sold", await page.locator(".pm-own-sold").count() === 1);
await page.locator(".pm-own-sold").click(); await wait(400);
await doSell();
await sub().locator(".sub-back").first().click(); await wait(400);
await closeViewer();
await pfTab("sold"); check("C2 post in Sold tab", await tile(pidH).count() === 1);
await pfTab("hide"); check("C2 left Hide tab", await tile(pidH).count() === 0);
check("C2 asset sold (11 rows)", (await assetRows()) === 11);

// ==================== C3) Mark as sold — feed Sale post ====================
await pfTab("sale");
await openOwnMenu(pidF);
await page.locator(".pm-own-sold").click(); await wait(400);
await doSell();
await sub().locator(".sub-back").first().click(); await wait(400);
await closeViewer();
await pfTab("sold"); check("C3 post in Sold tab", await tile(pidF).count() === 1);
check("C3 left feed", await feedPost(pidF).count() === 0);
check("C3 asset sold (10 rows)", (await assetRows()) === 10);

// ==================== C4) sold post never returns to feed ====================
await navGo("feed");
await scr().locator('.feed-tab[data-tab="following"]').click(); await wait(400);
check("C4 sold post absent in Following feed", await feedPost(pidF).count() === 0);
await scr().locator('.feed-tab[data-tab="all"]').click(); await wait(400);
check("C4 sold post absent after feed re-render", await feedPost(pidF).count() === 0);

// ==================== C5) sold post menu — View sale record only ====================
await navGo("profile");
await pfTab("sold");
await openOwnMenu(pidF);
check("C5 sold menu: View sale record", await page.locator(".pm-own-soldview").count() === 1);
check("C5 sold menu: no Edit", await page.locator(".pm-own-edit").count() === 0);
check("C5 sold menu: no Mark as sold", await page.locator(".pm-own-sold").count() === 0);
await page.locator(".pm-own-soldview").click(); await wait(500);
check("C5 view opens sold detail", (await sub().locator(".detail-title").last().textContent()).includes("Sold item"));
const soldTxt = await sub().locator(".sub-scroll").last().textContent();
check("C5 record shows price+date only", soldTxt.includes("111,000") && soldTxt.includes("Sale date"), "");
await sub().locator(".sub-back").first().click(); await wait(400);
await closeViewer();

// ==================== D) sold history grew by the 3 sales ====================
check("D sold history 3 + 3 sales = 6 rows", (await soldRows()) === 6);
await page.screenshot({ path: `${OUT}/flows-final-profile.png` });

console.log(`\n${failed} failed, ${errors} console/page errors`);
await browser.close();
process.exit(failed || errors ? 1 : 0);
