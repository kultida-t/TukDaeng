// BOR-010 verify: Market Data > Dashboard → "Market Overview" rename (Contract C.2)
// Scope: display label only — internal keys stay (market-dashboard list key,
// market-dashboard-mode body class, market.dashboard.view permission key)
// Standalone script — not a playwright spec. Run: node tests/_bor010-verify.cjs
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

(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await login(page);

  // ---------- 1. Sidebar: navGroups sub label ----------
  await page.locator(".nav-item[data-module='market']").click();
  await page.waitForTimeout(200);
  const submenu = page.locator(".submenu[data-submenu='market']");
  check("N1 submenu 'Market Overview' visible", await page.evaluate(() =>
    !!document.querySelector(".submenu[data-submenu='market'] button[data-sub='Market Overview']")));
  check("N1 submenu 'Market Overview' text", await page.evaluate(() =>
    document.querySelector(".submenu[data-submenu='market'] button[data-sub='Market Overview']")?.textContent === "Market Overview"));
  check("N1 old data-sub='Dashboard' gone from market submenu", await page.evaluate(() =>
    !document.querySelector(".submenu[data-submenu='market'] button[data-sub='Dashboard']")));
  check("N1 top-level Dashboard module untouched", await page.evaluate(() =>
    document.querySelector(".nav-item[data-module='dashboard']")?.textContent.includes("Dashboard")));

  // ---------- 2. Market Overview surface ----------
  await submenu.locator("button[data-sub='Market Overview']").click();
  await page.waitForTimeout(300);
  check("N2 page-title = 'Market Overview'", await page.evaluate(() =>
    document.querySelector("#page-title")?.textContent === "Market Overview"),
    await page.evaluate(() => document.querySelector("#page-title")?.textContent));
  check("N2 crumb = 'การดำเนินงาน / Market Data / Market Overview'", await page.evaluate(() =>
    document.querySelector("#crumb")?.textContent === "การดำเนินงาน / Market Data / Market Overview"),
    await page.evaluate(() => document.querySelector("#crumb")?.textContent));
  check("N2 sub active state", await page.evaluate(() =>
    document.querySelector(".submenu[data-submenu='market'] button[data-sub='Market Overview']")?.classList.contains("active")));
  check("N2 parent nav active", await page.evaluate(() =>
    document.querySelector(".nav-item[data-module='market']")?.classList.contains("active")));
  check("N2 market-dashboard-mode class kept (internal key)", await page.evaluate(() =>
    document.body.classList.contains("market-dashboard-mode")));
  check("N2 panel title = 'Recently Updated Brands'", await page.evaluate(() =>
    document.querySelector("#panel-title")?.textContent === "Recently Updated Brands"),
    await page.evaluate(() => document.querySelector("#panel-title")?.textContent));
  check("N2 dashboard table renders rows", await page.evaluate(() =>
    document.querySelectorAll(".market-dashboard-brand-table .asset-row:not(.head)").length > 0));

  // ---------- 3. renderModule default sub ----------
  await page.evaluate(() => jumpToModule("market"));
  await page.waitForTimeout(300);
  check("N3 jumpToModule('market') lands on Market Overview", await page.evaluate(() =>
    document.querySelector("#page-title")?.textContent === "Market Overview" &&
    document.body.classList.contains("market-dashboard-mode")));

  // ---------- 4. Other market subs unaffected ----------
  await page.evaluate(() => jumpToModule("market", "Brands & Models"));
  await page.waitForTimeout(300);
  check("N4 Brands & Models renders + mode class off", await page.evaluate(() =>
    document.querySelector("#page-title")?.textContent === "Brands & Models" &&
    !document.body.classList.contains("market-dashboard-mode")));
  await page.evaluate(() => jumpToModule("market", "Sync History"));
  await page.waitForTimeout(300);
  check("N4 Sync History renders", await page.evaluate(() =>
    document.querySelector("#page-title")?.textContent === "Sync History" &&
    document.querySelector("#crumb")?.textContent === "การดำเนินงาน / Market Data / Sync History"));

  // ---------- 5. Roles & Permissions matrix sub label ----------
  await page.evaluate(() => jumpToModule("settings", "Roles & Permissions"));
  await page.waitForTimeout(400);
  check("N5 Role List renders", await page.evaluate(() =>
    document.querySelector("#page-title")?.textContent === "Roles & Permissions"),
    await page.evaluate(() => document.querySelector("#page-title")?.textContent));
  const roleRow = page.locator(".user-row[data-role-card]").first();
  await roleRow.waitFor({ state: "visible", timeout: 10000 });
  await roleRow.click();
  await page.waitForTimeout(800);
  check("N5 perm matrix shows 'Market Overview' sub group", await page.evaluate(() =>
    [...document.querySelectorAll(".perm-sub-title")].some(el => el.textContent === "Market Overview")),
    await page.evaluate(() => [...document.querySelectorAll(".perm-sub-title")].map(el => el.textContent).join(",")));
  check("N5 perm matrix shows 'ดู Market Overview'", await page.evaluate(() =>
    [...document.querySelectorAll(".perm-item-name")].some(el => el.textContent === "ดู Market Overview")));
  check("N5 no stale 'ดู Market Dashboard'", await page.evaluate(() =>
    ![...document.querySelectorAll(".perm-item-name")].some(el => el.textContent.includes("Market Dashboard"))));

  // ---------- 6. Top-level Dashboard module unaffected ----------
  await page.evaluate(() => jumpToModule("dashboard"));
  await page.waitForTimeout(300);
  check("N6 main Dashboard renders 'Dashboard'", await page.evaluate(() =>
    document.querySelector("#page-title")?.textContent === "Dashboard" &&
    document.querySelector("#crumb")?.textContent === "การดำเนินงาน / Dashboard"));

  check("no page errors", errors.length === 0, errors.join(" | "));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
