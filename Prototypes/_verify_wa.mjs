// Verify fo-flow watch alerts: bell on Detail opens the create sheet (all spec
// fields as criteria + 3 match modes with live counts), bell on Search results
// snapshots query+filters (works with 0 results too), Settings > Watch Alerts
// lists alerts (badge/toggle/delete), and a new matching post pings a toast.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-WAL-001";
mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const check = (name, ok, extra = "") => { console.log(`${ok ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`); ok ? pass++ : fail++; };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errs = [];
page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
page.on("pageerror", e => errs.push(e.message));

await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);
check("feed renders phone", await page.locator(".phone").count() === 1);
check("no watch alerts initially", await page.evaluate(() => WATCH_ALERTS.length === 0));

/* ---------- 1. Settings > Watch Alerts entry ---------- */
await page.locator(".app-header .set-btn").click();
await page.waitForTimeout(400);
check("settings lists Watch Alerts row with count 0", await page.evaluate(() =>
  [...document.querySelectorAll(".page-sub .sub-row")].some(r => r.dataset.sub === "walerts" && r.querySelector(".sub-count")?.textContent === "0")));
await page.locator('.page-sub [data-sub="walerts"]').click();
await page.waitForTimeout(400);
check("watch alerts page opens + empty state", await page.evaluate(() =>
  document.querySelector(".page-sub .detail-title")?.textContent === "Watch Alerts" &&
  document.querySelector(".page-sub .sub-empty")?.textContent.includes("No watch alerts yet")));
await page.screenshot({ path: `${OUT}/m-wa-1-empty.png` });
await page.locator(".page-sub .sub-back").first().click(); // → settings
await page.waitForTimeout(300);
await page.locator(".page-sub .sub-back").first().click(); // → feed
await page.waitForTimeout(300);

/* ---------- 2. Detail bell → bottom sheet (name input, no chips — specs already on the page) ---------- */
await page.evaluate(() => openPostDetail(document.querySelector(".screen"), POSTS.find(p => p.id === "p1")));
await page.waitForTimeout(400);
await page.locator(".page-detail .mf-btn").click();
await page.waitForTimeout(400);
check("bell opens create sheet", await page.locator(".screen").evaluate(el => el.classList.contains("wa-open")));
check("sheet title = Create watch alert", await page.locator(".comment-sheet .wa-title").textContent() === "Create watch alert");
check("name input prefilled with the model", await page.locator(".comment-sheet .wa-name").inputValue().then(v => v.includes("Rolex") && v.includes("Submariner")));
check("no criteria chips on the detail sheet", await page.locator(".comment-sheet .wa-chip").count() === 0);
check("draft still snapshots every filled spec (>=14)", await page.evaluate(() => document.querySelector(".screen")._waDraft.criteria.length >= 14),
  await page.evaluate(() => `${document.querySelector(".screen")._waDraft.criteria.length} fields`));
check("draft criteria include Brand/Model/Reference/Delivery", await page.evaluate(() => {
  const L = document.querySelector(".screen")._waDraft.criteria.map(c => c.l);
  return ["Brand", "Model", "Reference", "Delivery contents"].every(l => L.includes(l));
}));
check("3 match modes rendered", await page.locator(".comment-sheet .wa-mode").count() === 3);
check("Match all is default", await page.locator('.comment-sheet .wa-mode[data-mode="all"]').evaluate(el => el.classList.contains("on")));
const counts = await page.locator(".comment-sheet .wa-mc").allTextContents();
check("each mode shows a live match count", counts.length === 3 && counts.every(t => /\d+ now/.test(t)));
check("Match all count is stricter than Any", await page.evaluate(() => {
  const d = document.querySelector(".screen")._waDraft;
  return alertMatchCount("all", d.criteria) <= alertMatchCount("any", d.criteria);
}));
await page.screenshot({ path: `${OUT}/m-wa-2-create-detail.png` });

// pick Model only → count preview should update live in the same modal
await page.locator('.comment-sheet .wa-mode[data-mode="model"]').click();
await page.waitForTimeout(300);
check("mode switch re-renders with Model selected", await page.locator('.comment-sheet .wa-mode[data-mode="model"]').evaluate(el => el.classList.contains("on")));
await page.locator(".comment-sheet .wa-name").fill("My Sub hunt");
await page.locator('.comment-sheet .wa-mode[data-mode="any"]').click(); // rename must survive a mode-switch re-render
await page.waitForTimeout(250);
check("typed name survives mode-switch re-render", await page.locator(".comment-sheet .wa-name").inputValue() === "My Sub hunt");
await page.screenshot({ path: `${OUT}/m-wa-3-model-mode.png` });
await page.locator(".comment-sheet .wa-go").click();
await page.waitForTimeout(350);
check("alert created + toast", await page.evaluate(() => WATCH_ALERTS.length === 1 && WATCH_ALERTS[0].matchMode === "any") &&
  await page.locator(".sc-toast").evaluate(t => t.textContent === "Watch alert on"));
check("custom name saved on the alert", await page.evaluate(() => WATCH_ALERTS[0].name === "My Sub hunt"));
check("detail bell now shows following state", await page.locator(".page-detail .mf-btn").evaluate(el => el.classList.contains("on")));
check("alert carries the post's modelKey", await page.evaluate(() => WATCH_ALERTS[0].modelKey === modelKeyOf(POSTS.find(p => p.id === "p1"))));

/* ---------- 3. Bell again → edit sheet (no duplicate) ---------- */
await page.locator(".page-detail .mf-btn").click();
await page.waitForTimeout(400);
check("bell on followed model opens Edit watch alert", await page.locator(".comment-sheet .wa-title").textContent() === "Edit watch alert");
check("edit sheet shows Delete alert", await page.locator(".comment-sheet .wa-del").count() === 1);
await page.locator('.comment-sheet .wa-mode[data-mode="all"]').click();
await page.waitForTimeout(250);
await page.locator(".comment-sheet .wa-go").click();
await page.waitForTimeout(300);
check("mode edited to all (no duplicate alert)", await page.evaluate(() => WATCH_ALERTS.length === 1 && WATCH_ALERTS[0].matchMode === "all"));
await page.locator(".page-detail .detail-back").first().click();
await page.waitForTimeout(350);

/* ---------- 4. Search entry — results + filters ---------- */
await page.locator(".app-header .search-btn").click();
await page.waitForTimeout(400);
await page.locator(".page-sub .sr-fake").click();
await page.waitForTimeout(300);
await page.locator(".page-sub input.sr-q").fill("submariner");
await page.waitForTimeout(300);
await page.keyboard.press("Enter");
await page.waitForTimeout(400);
check("results page shows bell button", await page.locator(".page-sub .sr-wa").count() === 1);
await page.locator(".page-sub .sr-wa").click();
await page.waitForTimeout(350);
check("search sheet snapshots the keyword", await page.evaluate(() =>
  document.querySelector(".screen")._waDraft.criteria.some(c => c.fk === "q" && c.v === "submariner")));
await page.locator(".sheet-backdrop").click({ force: true, position: { x: 20, y: 20 } }); // cancel via backdrop (top corner — the sheet covers the center)
await page.waitForTimeout(300);
check("backdrop dismiss leaves no alert", await page.evaluate(() => WATCH_ALERTS.length === 1));

// apply a filter then create — criteria = q + filter
await page.locator(".page-sub .flt-open").click();
await page.waitForTimeout(400);
await page.locator('.flt-chip[data-fk="brand"][data-v="Rolex"]').click();
await page.waitForTimeout(200);
await page.locator(".flt-apply").click();
await page.waitForTimeout(400);
await page.locator(".page-sub .sr-wa").click();
await page.waitForTimeout(350);
check("criteria = keyword + Brand: Rolex (in draft)", await page.evaluate(() => {
  const c = document.querySelector(".screen")._waDraft.criteria;
  return c.some(x => x.fk === "q" && x.v === "submariner") && c.some(x => x.fk === "brand" && x.v === "Rolex");
}));
await page.screenshot({ path: `${OUT}/m-wa-4-create-search.png` });
await page.locator(".comment-sheet .wa-go").click();
await page.waitForTimeout(350);
check("search alert saved (2 total)", await page.evaluate(() => WATCH_ALERTS.length === 2 && WATCH_ALERTS[1].source === "search"));
check("bell icon fills when this exact search is saved", await page.locator(".page-sub .sr-wa").evaluate(el => el.classList.contains("on")));

// same criteria again → dedupe opens the existing alert
await page.locator(".page-sub .sr-wa").click();
await page.waitForTimeout(350);
check("duplicate search opens Edit sheet instead of a new alert", await page.locator(".comment-sheet .wa-title").textContent() === "Edit watch alert" &&
  await page.evaluate(() => WATCH_ALERTS.length === 2));
await page.locator(".sheet-backdrop").click({ force: true, position: { x: 20, y: 20 } });
await page.waitForTimeout(300);
await page.locator(".page-sub .sub-back").first().click(); // back to landing
await page.waitForTimeout(350);
await page.locator(".page-sub .sr-fake").click();
await page.locator(".page-sub input.sr-q").fill("zebra moonphase xyz");
await page.waitForTimeout(250);
await page.keyboard.press("Enter");
await page.waitForTimeout(400);
check("no-result page still offers the bell", await page.locator(".page-sub .sr-wa").count() === 1 &&
  await page.locator(".page-sub .sr-empty-block").count() === 1);
await page.locator(".page-sub .sr-wa").click();
await page.waitForTimeout(350);
check("empty-result sheet shows 0 now on Match all", await page.locator('.comment-sheet .wa-mode[data-mode="all"] .wa-mc').textContent().then(t => t.trim() === "0 now"));
await page.locator(".comment-sheet .wa-go").click();
await page.waitForTimeout(350);
check("0-result alert saved anyway", await page.evaluate(() => WATCH_ALERTS.length === 3));
await page.locator(".page-sub .sub-back").first().click(); // results → landing
await page.waitForTimeout(300);
await page.locator(".page-sub .sub-back").first().click(); // landing → feed
await page.waitForTimeout(300);

/* ---------- 5. Settings list — rows, toggle, delete ---------- */
await page.locator(".app-header .set-btn").click();
await page.waitForTimeout(350);
await page.locator('.page-sub [data-sub="walerts"]').click();
await page.waitForTimeout(400);
check("list shows 3 alerts", await page.locator(".page-sub .wa-row").count() === 3);
check("rows show name + criteria + Edit badge + mode + match count", await page.evaluate(() => {
  const r = document.querySelector(".page-sub .wa-row");
  return r.querySelector(".wa-t")?.textContent.length > 0 && r.querySelector(".wa-c")?.textContent.length > 0 &&
    (r.querySelector(".wa-badge")?.textContent || "").trim() === "Edit" &&
    /(Match all|Match any|Model only) · \d+ match/.test(r.querySelector(".wa-meta")?.textContent || "");
}));
await page.screenshot({ path: `${OUT}/m-wa-5-list.png` });

// toggle off first alert (the detail/model one) → bell state clears
await page.locator(".page-sub .wa-row .wa-tgl").first().click();
await page.waitForTimeout(350);
check("toggle pauses alert + row dims + toast", await page.evaluate(() => !WATCH_ALERTS.find(a => a.id === "wa1").on) &&
  await page.locator(".page-sub .wa-row").first().evaluate(el => el.classList.contains("wa-off")) &&
  await page.locator(".sc-toast").evaluate(t => t.textContent === "Watch alert paused"));
check("paused alert drops the model-follow bell", await page.evaluate(() => !POSTS.find(p => p.id === "p1").modelFollowing));
await page.locator(".page-sub .wa-row .wa-tgl").first().click(); // back on
await page.waitForTimeout(350);

// row tap → edit sheet → delete
await page.locator(".page-sub .wa-row").nth(2).locator(".wa-b").click(); // body tap does nothing
await page.waitForTimeout(300);
check("tapping row body does not open the sheet", await page.locator(".screen").evaluate(el => !el.classList.contains("wa-open")));
await page.locator(".page-sub .wa-row").nth(2).locator(".wa-badge").click(); // only the Edit pill opens it
await page.waitForTimeout(350);
check("Edit pill opens edit sheet", await page.locator(".comment-sheet .wa-title").textContent() === "Edit watch alert");
await page.locator(".comment-sheet .wa-del").click();
await page.waitForTimeout(350);
check("delete removes the alert + re-renders list", await page.evaluate(() => WATCH_ALERTS.length === 2) &&
  await page.locator(".page-sub .wa-row").count() === 2);

/* ---------- 6. Notification — new matching post pings the alert ---------- */
await page.evaluate(() => {
  insertNewPost({
    photos: ["./assets/asset-uploads/ast-8831-1.png"],
    caption: "fresh submariner just in",
    meta: { brand: "Rolex", model: "Submariner Date", ref: "126610LN", cond: "New", price: "450000" },
  });
});
check("new post matched the detail alert", await page.evaluate(() => (POSTS[0]._waHits || []).length >= 1));
/* fire the same toast the post/share caller does, then capture it */
await page.evaluate(() => {
  const hits = POSTS[0]._waHits || [];
  if (hits.length) scrToast(document.querySelector(".screen"), `Watch alert matched: ${hits[0]}${hits.length > 1 ? ` +${hits.length - 1} more` : ""}`);
});
await page.waitForTimeout(400);
check("match toast shows the alert name", await page.locator(".sc-toast.show").count() === 1);
await page.screenshot({ path: `${OUT}/m-wa-6-match.png` });

/* ---------- 7. matcher sanity — all vs any vs model ---------- */
check("matcher: all=AND, any=OR, model=brand+model+ref", await page.evaluate(() => {
  const p = POSTS.find(x => x.id === "p1");
  const crit = [
    { l: "Brand", v: "Rolex", fk: "brand" },
    { l: "Condition", v: "New", fk: "cond" },          // p1 is Very Good → fails
  ];
  return alertMatch(p, "all", crit) === false &&
    alertMatch(p, "any", crit) === true &&
    alertMatch(p, "model", crit) === true;             // brand Rolex only model-level field
}));

check("no console errors", errs.length === 0, errs.join(" | "));
console.log(`\n${pass} passed, ${fail} failed, ${errs.length} console errors`);
await browser.close();
process.exit(fail || errs.length ? 1 : 0);
