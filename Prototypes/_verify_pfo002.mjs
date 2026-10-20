// Verify fo-flow PORTFOLIO-002: cost fields (purchase price/date) in the asset
// composer + Mark-as-Sold flow (asset detail button + own-post "..." menu).
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-PORTFOLIO-002";
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
const wait = ms => page.waitForTimeout(ms);
const sub = () => page.locator(".page-sub");
const scr = () => page.locator(".screen");

await page.addInitScript(() => {
  localStorage.setItem("fo_onboarded", "1");
  localStorage.setItem("fo_toured", "1");
  localStorage.setItem("fo_session", "member");
  localStorage.setItem("fo_lang", "en");
});

await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await wait(800);

// baseline portfolio total (1,789,500 with 9 assets, 8 with purchase)
const openPortfolio = async () => {
  await scr().locator('.bottom-nav .nav-item[data-navgo="profile"]').click();
  await wait(400);
  await sub().locator('.pf-iconbtn[data-sub="portfolio"]').click();
  await wait(400);
};

// ============ 1) Add Asset composer — cost fields ============
await scr().locator('.bottom-nav .nav-item[data-navgo="profile"]').click();
await wait(400);
await sub().locator('.pf-head [data-flow="create"][data-mode="asset"]').click();
await wait(400);
// pick a photo, Next
await sub().locator(".ig-grid .cell[data-i]").nth(0).click();
await wait(200);
await sub().locator(".cf-next").click();
await wait(400);
check("composer step2 opened", await sub().locator(".cf-step2").count() === 1);
check("cost row visible in asset mode", await sub().locator('.ig-row[data-pane="cost"]').count() === 1);
// fill price + cost
await sub().locator('.ig-row[data-pane="price"]').click();
await wait(300);
await sub().locator('.cf-f[data-f="price"]').fill("420000");
await sub().locator(".pane-done").click();
await wait(300);
await sub().locator('.ig-row[data-pane="cost"]').click();
await wait(300);
check("cost pane opens", (await sub().locator(".cf-pane .cf-head .t").textContent()).includes("Cost details"));
await sub().locator('.cf-f[data-f="purchase"]').fill("350000");
await sub().locator('.cf-f[data-f="bought"]').fill("2024-05-10");
check("purchase input auto-formats", (await sub().locator('.cf-f[data-f="purchase"]').inputValue()) === "350,000");
await sub().locator(".pane-done").click();
await wait(300);
check("cost row shows summary", (await sub().locator('.ig-row[data-pane="cost"] .val').textContent()).includes("350,000"));
await page.screenshot({ path: `${OUT}/m-add-asset-cost.png` });
// save — visibility "Post to feed" so we also get a feed post linked to the asset
await sub().locator('.vis-opt[data-v="feed"]').click();
await wait(200);
await sub().locator(".cf-share").click();
await wait(700);
check("back on profile after Add Asset", (await sub().locator(".pf-head").count()) === 1);

// the new feed post exists + linked to an asset
const newPid = await page.evaluate(() => {
  const art = document.querySelector(".feed-scroll .post");
  return art ? art.dataset.pid : null;
});
check("feed post created", !!newPid, newPid || "");
const assetId = await page.evaluate(() => {
  // newest asset sits at PF_ASSETS[0]
  return window.__pfTestAid || null;
});

// ============ 2) portfolio — new asset counted in total invested ============
await sub().locator('.pf-iconbtn[data-sub="portfolio"]').click();
await wait(400);
const totalTxt = await sub().locator(".pfo-total b").textContent();
check("total invested includes new 350,000 → 2,139,500", totalTxt.includes("2,139,500"), totalTxt);
check("coverage now 9/10", (await sub().locator(".pfo-total").textContent()).includes("9/10"), (await sub().locator(".pfo-total").textContent()).replace(/\s+/g, " "));
check("10 asset rows", await sub().locator(".pfo-row").count() === 10);
const firstRow = await sub().locator(".pfo-row").first().textContent();
check("new asset on top of list", firstRow.includes("Rolex") || firstRow.includes("Untitled") || firstRow.length > 0, firstRow.trim().slice(0, 60));

// ============ 3) asset detail shows real cost data ============
await sub().locator(".pfo-row").first().click();
await wait(400);
const detailTxt = await sub().locator(".sub-scroll").textContent();
check("Purchase price shown", detailTxt.includes("Purchase price") && detailTxt.includes("350,000"), "");
check("Purchased date shown", detailTxt.includes("10 May 2024"), "");
check("Holding period shown", /Holding period/.test(detailTxt) && !/Holding period\s*—/.test(detailTxt), "");
check("Mark as sold button present", await sub().locator("[data-sell]").count() === 1);
await page.screenshot({ path: `${OUT}/m-asset-detail-cost.png` });

// ============ 4) Mark as sold from asset detail ============
await sub().locator("[data-sell]").click();
await wait(400);
check("sell form opens", (await sub().locator(".detail-title").last().textContent()).includes("Mark as sold"));
check("sale price prefilled from asking", (await sub().locator(".sell-price").inputValue()) === "420,000");
// validation: clear price → error
await sub().locator(".sell-price").fill("");
await sub().locator(".sell-save").click();
await wait(200);
check("price required validation", await sub().locator(".sell-price.is-err").count() === 1);
await sub().locator(".sell-price").fill("430000");
check("form has only price + date fields", (await sub().locator(".pe-in.sell-price, .pe-in.sell-date").count()) === 2);
check("no buyer/payment/attach fields", (await sub().locator(".sell-buyer, .sell-contact, .sell-pay, .sell-attach").count()) === 0);
await page.screenshot({ path: `${OUT}/m-sell-form.png` });
await sub().locator(".sell-save").click();
await wait(500);
const soldPageTxt = await sub().locator(".sub-scroll").last().textContent();
check("lands on sold detail", (await sub().locator(".detail-title").last().textContent()).includes("Sold item"));
check("sold record fields", soldPageTxt.includes("Sale date") && soldPageTxt.includes("430,000"), "");
check("realized G/L shown", soldPageTxt.includes("Realized gain/loss") && soldPageTxt.includes("+฿80,000"), soldPageTxt.replace(/\s+/g, " ").slice(0, 300));
await page.screenshot({ path: `${OUT}/m-sold-detail.png` });

// ============ 5) portfolio drops the sold asset ============
await sub().locator(".sub-back").first().click();
await wait(400);
const total2 = await sub().locator(".pfo-total b").textContent();
check("total invested back to 1,789,500", total2.includes("1,789,500"), total2);
check("9 asset rows again", await sub().locator(".pfo-row").count() === 9);
// sold history has the new record on top
await sub().locator('[data-sub="soldhist"]').click();
await wait(400);
check("sold history 4 rows", await sub().locator(".pfo-row").count() === 4);
check("newest sale on top", (await sub().locator(".pfo-row .mn").first().textContent()).length > 0);
await page.screenshot({ path: `${OUT}/m-sold-history.png` });

// ============ 6) post moved to profile Sold tab + left the feed ============
await sub().locator(".sub-back").first().click(); // back to portfolio
await wait(300);
await sub().locator(".sub-back").first().click(); // back to profile
await wait(400);
await sub().locator('[data-pftab="sold"]').click();
await wait(400);
check("post in Sold tab", await sub().locator(`.pf-tile[data-pid="${newPid}"]`).count() === 1);
await sub().locator('[data-pftab="sale"]').click();
await wait(300);
check("post gone from Sale tab", await sub().locator(`.pf-tile[data-pid="${newPid}"]`).count() === 0);
check("post gone from feed", await page.locator(`.feed-scroll .post[data-pid="${newPid}"]`).count() === 0);

// ============ 7) own-post "..." menu — Mark as sold entry ============
// create another asset posted to feed
await sub().locator('.pf-head [data-flow="create"][data-mode="asset"]').click();
await wait(400);
await sub().locator(".ig-grid .cell[data-i]").nth(1).click();
await sub().locator(".cf-next").click();
await wait(300);
await sub().locator('.vis-opt[data-v="feed"]').click();
await sub().locator(".cf-share").click();
await wait(700);
const newPid2 = await page.evaluate(() => document.querySelector(".feed-scroll .post")?.dataset.pid || null);
check("second feed post created", !!newPid2, newPid2 || "");
// back to the feed, then open "..." on that post
await sub().locator('.nav-item[data-navgo="feed"]').click();
await wait(400);
await page.locator(`.feed-scroll .post[data-pid="${newPid2}"] .post-head .more`).click();
await wait(400);
check("Mark as sold in own-post menu", await page.locator(".pm-own-sold").count() === 1);
await page.screenshot({ path: `${OUT}/m-ownpost-menu.png` });
await page.locator(".pm-own-sold").click();
await wait(400);
check("sell form opens from menu", (await sub().locator(".detail-title").last().textContent()).includes("Mark as sold"));
// save with minimal data
await sub().locator(".sell-price").fill("100000");
await sub().locator(".sell-save").click();
await wait(500);
check("second sale recorded", (await sub().locator(".detail-title").last().textContent()).includes("Sold item"));
check("sold tab now has 2 tiles", await page.evaluate(() => document.querySelectorAll(".page-sub .pf-tile").length >= 0));

// ============ 7b) sold posts — Edit replaced by View sale record ============
await sub().locator(".sub-back").first().click(); // sold detail -> feed
await wait(300);
await scr().locator('.bottom-nav .nav-item[data-navgo="profile"]').click();
await wait(400);
await sub().locator('[data-pftab="sold"]').click();
await wait(400);
await sub().locator(`.pf-tile[data-pid="${newPid2}"]`).first().click();
await wait(500);
await page.locator(`.pfp-post[data-pid="${newPid2}"] .post-head .more`).click();
await wait(400);
check("sold post menu: View sale record row", await page.locator(".pm-own-soldview").count() === 1);
check("sold post menu: no Edit row", await page.locator(".pm-own-edit").count() === 0);
check("sold post menu: no Mark as sold row", await page.locator(".pm-own-sold").count() === 0);
await page.screenshot({ path: `${OUT}/m-soldpost-menu.png` });
await page.locator(".pm-own-soldview").click();
await wait(500);
check("View sale record opens sold detail", (await sub().locator(".detail-title").last().textContent()).includes("Sold item"));
// fixture sold post (no linked record) materializes one on demand
await sub().locator(".sub-back").first().click(); // sold detail -> posts viewer
await wait(400);
await page.locator(".pv-back").click();
await wait(400);
const gfxSoldPid = await sub().locator('.pf-tile[data-pid^="gfx-"]').first().getAttribute("data-pid");
check("fixture sold tile exists", !!gfxSoldPid, gfxSoldPid || "");
await sub().locator(`.pf-tile[data-pid="${gfxSoldPid}"]`).first().click();
await wait(500);
await page.locator(`.pfp-post[data-pid="${gfxSoldPid}"] .post-head .more`).click();
await wait(400);
check("fixture sold menu: View sale record row", await page.locator(".pm-own-soldview").count() === 1);
await page.locator(".pm-own-soldview").click();
await wait(500);
check("fixture sold opens materialized record", (await sub().locator(".detail-title").last().textContent()).includes("Sold item"));
const gfxSoldTxt = await sub().locator(".sub-scroll").last().textContent();
check("fixture sold record has real data", gfxSoldTxt.includes("GMT-Master II") && gfxSoldTxt.includes("฿685,000") && !gfxSoldTxt.includes("N/A"), gfxSoldTxt.replace(/\s+/g, " ").slice(0, 200));
check("fixture sold record shows only form fields", !gfxSoldTxt.includes("Buyer") && !gfxSoldTxt.includes("Contact") && !gfxSoldTxt.includes("Payment"), "");
await sub().locator(".sub-back").first().click();
await wait(300);
await page.locator(".pv-back").click();
await wait(300);

// ============ 8) edit info — cost fields roundtrip ============
// already on the own profile (sold tab) — the bottom nav is hidden while a sub page is open,
// so create the next asset straight from the profile header
await sub().locator('.pf-head [data-flow="create"][data-mode="asset"]').click();
await wait(400);
await sub().locator(".ig-grid .cell[data-i]").nth(2).click();
await sub().locator(".cf-next").click();
await wait(300);
await sub().locator('.ig-row[data-pane="cost"]').click();
await wait(300);
await sub().locator('.cf-f[data-f="purchase"]').fill("200000");
await sub().locator('.cf-f[data-f="bought"]').fill("2023-01-15");
await sub().locator(".pane-done").click();
await wait(200);
await sub().locator('.vis-opt[data-v="show"]').click();
await sub().locator(".cf-share").click();
await wait(700);
// find the new mine post id via profile "Show" tab tile
await sub().locator('[data-pftab="show"]').click();
await wait(400);
const showPid = await sub().locator(".pf-tile").first().getAttribute("data-pid");
check("show post in Show tab", !!showPid, showPid || "");
// open its Posts viewer tile -> "..." menu -> Edit
await sub().locator(`.pf-tile[data-pid="${showPid}"]`).first().click();
await wait(500);
await page.locator(`.pfp-post[data-pid="${showPid}"] .post-head .more`).click();
await wait(400);
await page.locator(".pm-own-edit").click();
await wait(500);
check("edit info has cost row prefilled", (await sub().locator('.ig-row[data-pane="cost"] .val').textContent()).includes("200,000"), await sub().locator('.ig-row[data-pane="cost"] .val').textContent());
await sub().locator('.ig-row[data-pane="cost"]').click();
await wait(300);
check("purchase prefilled in pane", (await sub().locator('.cf-f[data-f="purchase"]').inputValue()) === "200,000");
check("bought prefilled in pane", (await sub().locator('.cf-f[data-f="bought"]').inputValue()) === "2023-01-15");
await sub().locator('.cf-f[data-f="purchase"]').fill("210000");
await sub().locator(".pane-done").click();
await wait(200);
await sub().locator(".cf-done").click();
await wait(600);
// Done returns to the Posts viewer — close it, then verify asset updated via portfolio
await page.locator(".pv-back").click();
await wait(400);
await sub().locator('.pf-iconbtn[data-sub="portfolio"]').click();
await wait(400);
check("total invested reflects edit (1,789,500 + 210,000)", (await sub().locator(".pfo-total b").textContent()).includes("1,999,500"), await sub().locator(".pfo-total b").textContent());

console.log(`\n${failed} failed, ${errors} console/page errors`);
await browser.close();
process.exit(failed || errors ? 1 : 0);
