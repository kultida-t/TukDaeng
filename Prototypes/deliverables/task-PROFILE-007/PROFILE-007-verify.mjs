// Verify PROFILE-007: own profile Posts viewer "..." > Edit opens the composer in edit mode,
// Cancel/Done return to the Posts viewer, Done updates caption in viewer + grid.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";
const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-PROFILE-007";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 })).newPage();
let errors = 0, failed = 0;
page.on("pageerror", e => { errors++; console.log("PAGE ERR:", e.message); });
page.on("console", m => { if (m.type() === "error") { errors++; console.log("CONSOLE ERR:", m.text()); } });
const check = (n, ok, x = "") => { console.log(`${ok ? "PASS" : "FAIL"} ${n}${x ? " — " + x : ""}`); if (!ok) failed++; };
const scr = () => page.locator(".screen"), sub = () => page.locator(".page-sub"), pv = () => page.locator(".page-pv");
const cls = async () => (await scr().getAttribute("class")) || "";
const wait = ms => page.waitForTimeout(ms);

await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" }); await wait(700);
await scr().locator('.bottom-nav .nav-item[data-navgo="profile"]').click(); await wait(400);
await sub().locator(".pf-tile").first().click(); await wait(400);
const card = pv().locator(".pfp-post").first();
const openEdit = async () => { await card.locator(".post-head .more").click(); await wait(300); await page.locator(".comment-sheet .pm-own-edit").click(); await wait(500); };

// 1) Edit opens composer in edit mode
await openEdit();
check("edit composer visible (Edit info head)", await sub().locator(".cf-edit-x + .t").textContent().then(t => t.trim() === "Edit info"));
check("viewer stays open (not slid out) while editing", (await cls()).includes("pv-open") && (await pv().evaluate(e => getComputedStyle(e).transform)) === "none");
check("caption prefilled", (await sub().locator(".ig-cap-line .ta").textContent()).includes("snow day rotation"));
await page.screenshot({ path: `${OUT}/edit-open.png` });

// 2) Cancel -> discard -> back to Posts viewer
await sub().locator(".cf-edit-x").click(); await wait(300);
await page.locator(".dlg-discard-go").click(); await wait(500);
check("cancel returns to Posts viewer", (await cls()).includes("pv-open") && await pv().locator(".pfp-post").count() === 9);
check("profile restored underneath", await sub().locator(".pf-uname").count() === 1);

// 3) Edit caption + Done
await openEdit();
await sub().locator(".ig-cap-line .ta").evaluate(el => { el.textContent = "edited from profile"; el.dispatchEvent(new Event("input", { bubbles: true })); });
await sub().locator(".cf-done").click(); await wait(600);
check("done returns to Posts viewer", (await cls()).includes("pv-open"));
check("viewer caption updated", (await pv().locator(".pfp-post").first().locator(".caption").textContent()).includes("edited from profile"));
await page.screenshot({ path: `${OUT}/edit-done.png` });
await pv().locator(".pv-back").click(); await wait(400);
check("back lands on own profile", await sub().locator(".pf-uname").count() === 1);
check("no console errors", errors === 0);
await browser.close();
console.log(`\n${failed} failed / ${errors} console errors`);
process.exit(failed || errors ? 1 : 0);
