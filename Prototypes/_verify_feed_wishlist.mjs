// Verify fo-flow FEED-015..019: Wish List hub mirrors Saved hub —
// empty collections show gift icon (no fake cover) in hub cards, big cards,
// picker sheet + move sheet; covers derive only from posts actually in the
// collection. Hub parity: search/+ head icons, All/Collections/Posts pills,
// See all/Manage, big cover cards, manage/select/remove/add-to-collection.
// Collection detail parity: search/more icons, spark empty state, 3-item menu.
// SAVED-002: New collection sheet from wishlist has no Add people row + name input autofocused.
// Run: needs `npx http-server -p 4173` serving Prototypes/ + playwright chromium.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-FEED-015-019";
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

const sub = () => page.locator(".page-sub");
const sheet = () => page.locator(".comment-sheet");
const wlCnt = async () => page.evaluate(() => POSTS.filter(p => p.wishlisted).length);
const openDetail = async pid => {
  const post = page.locator(`.feed-scroll .post[data-pid="${pid}"]`);
  const more = post.locator(".more-link");
  if (await more.isVisible().catch(() => false)) { await more.click(); await page.waitForTimeout(250); }
  const vf = post.locator(".view-full");
  if (!(await vf.isVisible().catch(() => false))) {
    await post.locator(".details-toggle").click();
    await page.waitForTimeout(300);
  }
  await vf.dispatchEvent("click");
  await page.waitForTimeout(400);
};

// 1) post detail -> gift button -> wishlist picker sheet (auto-wishlists)
await openDetail("p1");
check("detail page opens", (await page.locator(".screen.detail-open").count()) === 1);
await page.locator(".page-detail .wl-btn").first().click();
await page.waitForTimeout(400);
check("wl sheet opens", (await page.locator(".screen.save-open").count()) === 1);
check("wl sheet Wish List head row", await sheet().locator('.wl-pick.sv-head[data-col="Wishlist"]').count() === 1);
check("wl sheet 2 collection rows", await sheet().locator(".wl-pick.sv-row").count() === 2);
check("FEED-019: empty col rows show gift icon thumb (no img)",
  await sheet().locator(".wl-pick.sv-row .thumb.none svg").count() === 2 &&
  await sheet().locator(".wl-pick.sv-row img.thumb").count() === 0);
check("head row shows wishlisted state", await sheet().locator(".wl-pick.sv-head.saved").count() === 1);
await page.screenshot({ path: `${OUT}/a-wl-sheet.png` });
// SAVED-002: "New collection" from wishlist sheet — no Add people row, name input autofocused
await sheet().locator(".wl-new").click();
await page.waitForTimeout(300);
check("SAVED-002: nc sheet from wishlist", await page.locator(".comment-sheet.nc").count() === 1);
check("SAVED-002: no add people row (wishlist)", await page.locator(".nc-ppl-btn, .nc-ppl, .nc-fr").count() === 0);
check("SAVED-002: name input autofocused (wishlist)", await page.evaluate(() => document.activeElement && document.activeElement.classList.contains("nc-input")));
await page.locator(".nc-cancel").click();
await page.waitForTimeout(300);
check("cancel returns to wl sheet", await sheet().locator(".wl-pick.sv-head").count() === 1);
await page.locator(".sheet-backdrop").dispatchEvent("click");
await page.waitForTimeout(300);
check("backdrop closes sheet, post stays wishlisted", (await page.locator(".screen.save-open").count()) === 0 && (await wlCnt()) === 1);
await page.locator(".page-detail .detail-back").first().click();
await page.waitForTimeout(350);

// 2) Settings -> Wish List row -> hub parity (FEED-017)
await page.locator(".set-btn").click();
await page.waitForTimeout(350);
check("settings Wish List row + count", (await page.locator('.sub-row[data-sub="wishlist"] .sub-count').textContent()).trim() === "1");
await page.locator('.sub-row[data-sub="wishlist"]').click();
await page.waitForTimeout(350);
check("wishlist title", (await sub().locator(".detail-title").textContent()).trim() === "Wish List");
check("head search + plus icons", await sub().locator(".svd-srch").count() === 1 && await sub().locator(".svd-plus").count() === 1);
check("3 tab pills", await sub().locator(".svd-tab").count() === 3);
check("tab labels", (await sub().locator(".svd-tab").allTextContents()).join("|") === "All|Collections|Posts");
check("All tab active", await sub().locator('.svd-tab[data-tab="all"].on').count() === 1);

// 3) All tab: collections rows + See all + posts grid + Manage
check("collections section + See all", (await sub().locator(".svd-sec .t").first().textContent()).trim() === "Collections" && (await sub().locator(".svd-see").first().textContent()).trim() === "See all");
check("2 collection cards", await sub().locator(".wl-col").count() === 2);
check("FEED-015: empty col cards show gift icon cover (no img)",
  await sub().locator(".wl-col .cv svg").count() === 2 &&
  await sub().locator(".wl-col .cv img").count() === 0);
check("col row has name + Private", (await sub().locator(".wl-col .s").first().textContent()).trim() === "Private");
check("all items section label", (await sub().locator(".svd-sec .t").nth(1).textContent()).trim() === "All items");
check("Manage link", (await sub().locator(".svd-manage").textContent()).trim() === "Manage");
check("1 wishlist tile", await sub().locator(".svd-tile").count() === 1);
await page.screenshot({ path: `${OUT}/b-wl-hub-all.png` });

// 4) Collections tab: big cards, empty -> gift icon (FEED-018)
await sub().locator('.svd-tab[data-tab="collections"]').click();
await page.waitForTimeout(250);
check("collections tab on", await sub().locator('.svd-tab[data-tab="collections"].on').count() === 1);
check("2 big collection cards", await sub().locator(".wl-colbig").count() === 2);
check("FEED-018: empty big cards show gift icon (no img)",
  await sub().locator(".wl-colbig .cv.none svg").count() === 2 &&
  await sub().locator(".wl-colbig .cv img").count() === 0);
await page.screenshot({ path: `${OUT}/c-wl-collections.png` });

// 5) Collection detail parity (FEED-016)
await sub().locator('.wl-colbig[data-col="Next buy"]').click();
await page.waitForTimeout(300);
check("col detail title", (await sub().locator(".detail-title").textContent()).trim() === "Next buy");
check("col head search + more icons", await sub().locator(".svd-srch").count() === 1 && await sub().locator(".svd-more").count() === 1);
check("empty state text", (await sub().locator(".sub-scroll").textContent()).includes("No wish list posts yet"));
check("spark icon in empty state", await sub().locator(".svd-empty svg").count() > 0);
await sub().locator(".svd-more").click();
await page.waitForTimeout(250);
check("empty col menu = 3 items, no Select", await sub().locator(".svd-mi").count() === 3);
check("menu labels", (await sub().locator(".svd-mi span").allTextContents()).join("|") === "Add to collection|Edit collection|Delete collection");
await page.locator(".svd-menuwrap").dispatchEvent("click");
await page.waitForTimeout(250);
check("menuwrap click closes menu", await sub().locator(".svd-menuwrap").count() === 0);
await page.screenshot({ path: `${OUT}/d-wl-col-detail.png` });
await sub().locator(".sub-back").click();
await page.waitForTimeout(300);
check("back at hub", (await sub().locator(".detail-title").textContent()).trim() === "Wish List");

// 6) Posts tab = grid only
await sub().locator('.svd-tab[data-tab="posts"]').click();
await page.waitForTimeout(250);
check("posts tab = 1 tile, no cols", await sub().locator(".svd-tile").count() === 1 && await sub().locator(".wl-col, .wl-colbig").count() === 0);

// 7) Manage -> select -> move to "Next buy" (FEED-019 move sheet)
await sub().locator('.svd-tab[data-tab="all"]').click();
await page.waitForTimeout(250);
await sub().locator(".svd-manage").click();
await page.waitForTimeout(300);
check("select head = All items", (await sub().locator(".svd-seltitle").textContent()).trim() === "All items");
check("bar = Remove + Add to collection", (await sub().locator(".svd-unsave").textContent()).trim() === "Remove" && (await sub().locator(".svd-move").textContent()).trim() === "Add to collection");
await sub().locator(".svd-selall").click();
await page.waitForTimeout(200);
check("select all -> 1 sel + Deselect all + bar enabled",
  (await sub().locator(".svd-selall").textContent()).trim() === "Deselect all" &&
  await sub().locator(".svd-tile.on").count() === 1 &&
  !(await sub().locator(".svd-unsave").isDisabled()) && !(await sub().locator(".svd-move").isDisabled()));
await sub().locator(".svd-move").click();
await page.waitForTimeout(350);
check("move picker sheet opens", (await page.locator(".screen.save-open").count()) === 1);
check("move sheet 2 rows", await sheet().locator(".svd-mv.sv-row").count() === 2);
check("FEED-019: move sheet empty rows show gift icon thumb (no img)",
  await sheet().locator(".svd-mv.sv-row .thumb.none svg").count() === 2 &&
  await sheet().locator(".svd-mv.sv-row img.thumb").count() === 0);
await page.screenshot({ path: `${OUT}/e-wl-move-sheet.png` });
await sheet().locator('.svd-mv[data-col="Next buy"]').click();
await page.waitForTimeout(350);
check("moved -> sheet closed", (await page.locator(".screen.save-open").count()) === 0);
check("post now in Next buy", await page.evaluate(() => POSTS.filter(p => p.wishlisted && p.wlCol === "Next buy").length) === 1);
await sub().locator(".sub-back").click();
await page.waitForTimeout(300);

// 8) Cover derivation: Next buy now has real cover, Grail goals still gift icon
check("Next buy card shows real cover img", await sub().locator('.wl-col[data-col="Next buy"] .cv img').count() === 1);
check("Grail goals card still gift icon", await sub().locator('.wl-col[data-col="Grail goals"] .cv svg').count() === 1 &&
  await sub().locator('.wl-col[data-col="Grail goals"] .cv img').count() === 0);
await sub().locator('.svd-tab[data-tab="collections"]').click();
await page.waitForTimeout(250);
check("Next buy big card shows single cover", await sub().locator('.wl-colbig[data-col="Next buy"] .cv img').count() === 1);
check("Grail goals big card still gift icon", await sub().locator('.wl-colbig[data-col="Grail goals"] .cv.none svg').count() === 1);
await page.screenshot({ path: `${OUT}/f-wl-covers-derived.png` });

// 9) Next buy detail now shows the post
await sub().locator('.wl-colbig[data-col="Next buy"]').click();
await page.waitForTimeout(300);
check("Next buy has 1 tile + count", await sub().locator(".svd-tile").count() === 1 && (await sub().locator(".svd-coltitle .c").textContent()).includes("1 item"));

// 10) back to feed -> reopen detail -> sheet: Next buy thumb = img, Grail goals = gift
await sub().locator(".sub-back").click();
await page.waitForTimeout(250);
await sub().locator(".sub-back").click();
await page.waitForTimeout(250);
await sub().locator(".sub-back").click();
await page.waitForTimeout(300);
check("back at feed", await page.locator(".screen.sub-open").count() === 0);
await openDetail("p1");
await page.locator(".page-detail .wl-btn").first().click();
await page.waitForTimeout(400);
check("wl sheet reopens from detail", (await page.locator(".screen.save-open").count()) === 1);
check("Next buy row has img thumb now", await sheet().locator('.wl-pick.sv-row[data-col="Next buy"] img.thumb').count() === 1);
check("Grail goals row still gift icon", await sheet().locator('.wl-pick.sv-row[data-col="Grail goals"] .thumb.none svg').count() === 1);
check("check mark on Next buy", await sheet().locator('.wl-pick.sv-row[data-col="Next buy"] .plus.on').count() === 1);
await page.screenshot({ path: `${OUT}/g-wl-sheet-after.png` });

await browser.close();
console.log(`\n===== ${failed ? "FAIL" : "ALL PASS"} — ${failed} failed, ${errors} console errors =====`);
process.exit(failed || errors ? 1 : 0);
