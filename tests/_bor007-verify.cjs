// BOR-007 verify: WAL-1440 deep link → Alert Detail + jumpToModule back-stack reset (Contract B.1/B.2/B.6)
// Standalone script — not a playwright spec. Run: node tests/_bor007-verify.cjs
const { chromium } = require("@playwright/test");

const BASE = "http://localhost:8080/bo-prototype.html";

let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log(`PASS  ${name}`); }
  else { fail++; console.log(`FAIL  ${name} ${extra}`); }
}

async function login(page) {
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");
  const loginScreen = page.locator("#login-screen");
  if (await loginScreen.isVisible({ timeout: 1500 }).catch(() => false)) {
    await page.locator("#login-form button[type='submit']").click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await page.waitForTimeout(500);
  }
}

async function navTo(page, moduleId, sub) {
  const parent = page.locator(`.nav-item[data-module='${moduleId}']`);
  const expanded = await parent.evaluate((el) => el.classList.contains("expanded")).catch(() => false);
  if (!expanded) await parent.click();
  await page.waitForTimeout(250);
  await page.locator(`.submenu[data-submenu='${moduleId}'] button[data-sub='${sub}']`).click();
  await page.waitForTimeout(400);
}

(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await login(page);

  // ---------- 1. WAL-1440 row in Demand Overview → opens Alert Detail directly ----------
  await navTo(page, "watch-alerts", "Demand Overview");
  check("N1 on Demand Overview", await page.evaluate(() =>
    document.body.classList.contains("watch-alert-overview-mode")));

  const walRow = page.locator(".wa-panel-frequent [data-wa-alert-row='WAL-1440']");
  check("N1 WAL-1440 row exists in Frequently Triggered", (await walRow.count()) === 1);
  await walRow.click();
  await page.waitForTimeout(400);

  check("N1 opens Alert Detail (detail mode)", await page.evaluate(() =>
    document.body.classList.contains("watch-alert-detail-mode")));
  check("N1 page title = Alert Detail", await page.evaluate(() =>
    document.querySelector("#page-title").textContent === "Alert Detail"));
  check("N1 crumb ends with /WAL-1440 canonical path", await page.evaluate(() =>
    document.querySelector("#crumb").textContent ===
    "งานตรวจสอบและบริการ / Market Demand / Watch Alert List / WAL-1440"),
    await page.evaluate(() => document.querySelector("#crumb").textContent));
  check("N1 detail head shows WAL-1440", await page.evaluate(() =>
    document.querySelector(".asset-report-id")?.textContent === "WAL-1440"));

  // ---------- 2. Sidebar active state — destination-owned, canonical sub ----------
  check("N2 Market Demand parent nav active", await page.evaluate(() =>
    document.querySelector(".nav-item[data-module='watch-alerts']")?.classList.contains("active")));
  check("N2 Watch Alert List sub active (canonical, not alias)", await page.evaluate(() =>
    document.querySelector(".submenu button[data-module='watch-alerts'][data-sub='Watch Alert List']")?.classList.contains("active")));

  // ---------- 3. Back → returns to Demand Overview (source context) ----------
  await page.locator(".page-back-btn").click();
  await page.waitForTimeout(400);
  check("N3 back returns to Demand Overview", await page.evaluate(() =>
    document.body.classList.contains("watch-alert-overview-mode") &&
    document.querySelector("#page-title").textContent === "Demand Overview"));
  check("N3 crumb back to Demand Overview", await page.evaluate(() =>
    document.querySelector("#crumb").textContent ===
    "งานตรวจสอบและบริการ / Market Demand / Demand Overview"));

  // ---------- 4. Watch Alert List row → detail still works (list path unchanged) ----------
  await navTo(page, "watch-alerts", "Watch Alert List");
  await page.locator(".asset-row[data-wa-alert-open='WAL-1440'] .asset-cell-primary").click();
  await page.waitForTimeout(400);
  check("N4 list row still opens Alert Detail", await page.evaluate(() =>
    document.body.classList.contains("watch-alert-detail-mode") &&
    document.querySelector(".asset-report-id")?.textContent === "WAL-1440"));
  await page.locator(".page-back-btn").click();
  await page.waitForTimeout(400);
  check("N4 back returns to Watch Alert List", await page.evaluate(() =>
    document.body.classList.contains("watch-alert-list-mode")));

  // ---------- 5. Flag 2: jumpToModule resets back stack (Contract B.6) ----------
  // Enter a detail so the stack is non-empty, then cross-module jump → stack must be empty
  await navTo(page, "watch-alerts", "Demand Overview");
  await page.locator(".wa-panel-frequent [data-wa-alert-row='WAL-1440']").click();
  await page.waitForTimeout(400);
  check("N5 stack non-empty after detail drill-in", await page.evaluate(() =>
    backNavigationStack.length > 0), String(await page.evaluate(() => backNavigationStack.length)));
  await page.evaluate(() => jumpToModule("users", "User Accounts"));
  await page.waitForTimeout(400);
  check("N5 jumpToModule lands on User Accounts", await page.evaluate(() =>
    activeModule === "users" && activeSub === "User Accounts"));
  check("N5 back stack reset by jumpToModule", await page.evaluate(() =>
    backNavigationStack.length === 0), String(await page.evaluate(() => backNavigationStack.length)));

  // ---------- 6. View All (aggregate) still lands on list, not detail ----------
  await navTo(page, "watch-alerts", "Demand Overview");
  await page.locator(".wa-panel-frequent .wa-view-all").click();
  await page.waitForTimeout(400);
  check("N6 View All lands on Watch Alert List", await page.evaluate(() =>
    document.body.classList.contains("watch-alert-list-mode") &&
    document.querySelector("#panel-title").textContent === "Watch Alert List"));

  check("no page errors", errors.length === 0, errors.join(" | "));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
