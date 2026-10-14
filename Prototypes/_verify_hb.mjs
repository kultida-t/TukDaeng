// Verify fo-flow NAV-001: burger (top-left) → IG settings-style side drawer with 9 menu entries
// NAV-002 additions: profile pill lives INSIDE the panel, drawer is the topmost in-screen layer,
// and the + (create) header button opens a right-slide page like search/settings (no more pg-up)
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/fo-flow";
mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const check = (name, ok) => { console.log(`${ok ? "PASS" : "FAIL"} ${name}`); ok ? pass++ : fail++; };

const ITEMS = ["Watch Brands", "Watch Price Index", "Watch Shops", "Accessories Shop", "Repair Shop", "Auction Center", "Consignment Center", "Authentication Center", "Community"];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 560, height: 950 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errs = [];
page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
page.on("pageerror", e => errs.push(e.message));

// 1. Feed loads, burger button present in app-header
await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);
check("feed renders phone", await page.locator(".phone").count() === 1);
check("burger button in app-header", await page.locator(".app-header .hb-btn").count() === 1);
check("drawer hidden before open", await page.locator(".hb-panel").evaluate(p => p.getBoundingClientRect().right < p.closest(".screen").getBoundingClientRect().x));

// 2. Tap burger → drawer slides in from the left
await page.locator(".app-header .hb-btn").click();
await page.waitForTimeout(450);
check("screen gets hb-open", await page.locator(".screen").evaluate(el => el.classList.contains("hb-open")));
check("scrim visible", await page.locator(".hb-scrim").evaluate(s => +getComputedStyle(s).opacity === 1));
const panelBox = await page.locator(".hb-panel").boundingBox();
const screenBox = await page.locator(".screen").boundingBox();
check("panel pinned to left edge", Math.abs(panelBox.x - screenBox.x) < 1);
check("panel width ~82% (feed peeks on right)", Math.abs(panelBox.width / screenBox.width - 0.82) < 0.02);
check("panel starts below statusbar", Math.abs(panelBox.y - (screenBox.y + 34)) < 2);
await page.screenshot({ path: `${OUT}/hb-1-drawer-dark.png` });

// 3. Menu entries — exactly 9, in the order of the reference image, each with an icon
const labels = await page.locator(".hb-list .hb-item span:not(.hb-chev)").allTextContents();
check("9 menu items in order", JSON.stringify(labels) === JSON.stringify(ITEMS));
check("every item has an icon", await page.locator(".hb-list .hb-item > svg").count() === 9);
check("IG settings row style — 14px regular label", await page.locator(".hb-list .hb-item").first().evaluate(el => {
  const cs = getComputedStyle(el);
  return cs.fontSize === "14px" && cs.fontWeight === "400";
}));
check("every item has a trailing chevron", await page.locator(".hb-list .hb-item .hb-chev").count() === 9);

// 4. Menu item is a dead action → toast, drawer stays open
await page.locator(".hb-list .hb-item", { hasText: "Watch Brands" }).click();
await page.waitForTimeout(250);
check("item tap → prototype toast", await page.locator("#flowToast").evaluate(t => t.classList.contains("show") && t.textContent === "Not in this prototype yet"));
check("drawer stays open after item tap", await page.locator(".screen").evaluate(el => el.classList.contains("hb-open")));

// 5. NAV-002 — drawer contains ONLY the 9 menu items; no Profile entry inside the drawer at all
check("no profile entry inside the drawer", await page.locator(".hb-wrap .hb-profile, .hb-panel [class*='profile']").count() === 0);
check("drawer has exactly the 9 menu rows", await page.locator(".hb-panel .hb-item").count() === 9);

// 5b. NAV-002 — open drawer is the topmost layer in the phone
check("hb-wrap z-index above all in-screen layers", await page.locator(".hb-wrap").evaluate(el => +getComputedStyle(el).zIndex >= 80));
check("theme toggle hidden while drawer open", await page.locator("#themeToggle").evaluate(t => getComputedStyle(t).opacity === "0"));

// 6. Tap the scrim (right strip) → drawer closes
await page.locator(".hb-scrim").click({ position: { x: 320, y: 400 }, force: true });
await page.waitForTimeout(400);
check("scrim tap closes drawer", !(await page.locator(".screen").evaluate(el => el.classList.contains("hb-open"))));
check("panel slid back out", await page.locator(".hb-panel").evaluate(p => p.getBoundingClientRect().right < p.closest(".screen").getBoundingClientRect().x));

// 7. Light theme — same behavior
await page.locator("#themeToggle").click();
await page.waitForTimeout(500);
await page.locator(".app-header .hb-btn").click();
await page.waitForTimeout(450);
check("light theme drawer opens", await page.locator(".screen").evaluate(el => el.classList.contains("hb-open")));
check("light theme shows 9 items", await page.locator(".hb-list .hb-item").count() === 9);
await page.screenshot({ path: `${OUT}/hb-2-drawer-light.png` });
await page.locator(".hb-scrim").click({ position: { x: 320, y: 400 }, force: true });
await page.waitForTimeout(400);
check("light theme scrim closes", !(await page.locator(".screen").evaluate(el => el.classList.contains("hb-open"))));
check("theme toggle visible again after drawer closes", await page.locator("#themeToggle").evaluate(t => getComputedStyle(t).opacity === "1"));

// 8. Regression — burger no longer hits the dead-action toast; search + create still work
await page.locator(".app-header .search-btn").click();
await page.waitForTimeout(400);
check("search page still opens", await page.locator(".screen").evaluate(el => el.classList.contains("sub-open")));
await page.locator(".page-sub .sub-back").click();
await page.waitForTimeout(350);
await page.locator('[data-flow="create"]').click();
await page.waitForTimeout(450);
check("create sheet still opens", await page.locator(".cf .ig-grid").isVisible());
check("NAV-002: create opens as right-slide page (no pg-up)", await page.locator(".page-sub").evaluate(el => !el.classList.contains("pg-up")));
await page.screenshot({ path: `${OUT}/hb-3-create-rightslide.png` });
await page.locator(".cf-x").click();
await page.waitForTimeout(300);
await page.locator(".dlg-discard-go").click().catch(() => {});
await page.waitForTimeout(300);

check("no console/page errors", errs.length === 0);
if (errs.length) console.log("ERRORS:", errs);
console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
