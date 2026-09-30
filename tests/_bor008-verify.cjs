// BOR-008 verify: Account Deletion → User Detail active state (destination-owned) + back context
// Contract A.1/A.4 (active state follows destination) + B.3 (back preserves source context, DEL-PTO-006)
// Standalone script — not a playwright spec. Run: node tests/_bor008-verify.cjs
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

const navActive = (page, mod) => page.evaluate((m) =>
  document.querySelector(`.nav-item[data-module='${m}']`)?.classList.contains("active") || false, mod);

(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await login(page);

  // ---------- 1. Deletion Requests → DEL-033 Request Detail ----------
  await page.evaluate(() => jumpToModule("deletions"));
  await page.waitForTimeout(400);
  check("N1 on Deletion Requests list", await page.evaluate(() =>
    document.body.classList.contains("deletion-list-mode")));
  await page.locator("#deletion-search").fill("DEL-033");
  await page.waitForTimeout(300);
  await page.locator(".user-row[data-deletion-card]").filter({ hasText: "DEL-033" }).first().click();
  await page.waitForTimeout(400);
  check("N1 Request Detail opens (deletion-detail-mode)", await page.evaluate(() =>
    document.body.classList.contains("deletion-detail-mode")));
  check("N1 crumb ends /DEL-033", await page.evaluate(() =>
    document.querySelector("#crumb").textContent ===
    "งานตรวจสอบและบริการ / Account Deletion / Requests / DEL-033"),
    await page.evaluate(() => document.querySelector("#crumb").textContent));
  check("N1 deletions nav active on Request Detail", await navActive(page, "deletions"));

  // ---------- 2. data-user-open → User Detail U-1104: destination-owned active state ----------
  await page.locator("[data-user-open='U-1104']").first().click();
  await page.waitForTimeout(400);
  check("N2 User Detail opens (user-detail-mode)", await page.evaluate(() =>
    document.body.classList.contains("user-detail-mode")));
  check("N2 page title = User Detail", await page.evaluate(() =>
    document.querySelector("#page-title").textContent === "User Detail"));
  check("N2 crumb = User Management path", await page.evaluate(() =>
    document.querySelector("#crumb").textContent ===
    "การดำเนินงาน / User Management / User Detail / U-1104"),
    await page.evaluate(() => document.querySelector("#crumb").textContent));
  check("N2 activeModule = users (destination-owned)", await page.evaluate(() =>
    activeModule === "users"), await page.evaluate(() => activeModule));
  check("N2 activeSub = User Accounts (canonical)", await page.evaluate(() =>
    activeSub === "User Accounts"), await page.evaluate(() => activeSub));
  check("N2 User Management nav active", await navActive(page, "users"));
  check("N2 Account Deletion nav NOT active", !(await navActive(page, "deletions")));
  check("N2 User Accounts sub active", await page.evaluate(() =>
    document.querySelector(".submenu button[data-module='users'][data-sub='User Accounts']")?.classList.contains("active") || false));
  check("N2 users submenu open (A.4)", await page.evaluate(() =>
    document.querySelector(".submenu[data-submenu='users']")?.classList.contains("open") || false));
  check("N2 back stack top = deletion-detail DEL-033 (B.3)", await page.evaluate(() => {
    const top = backNavigationStack[backNavigationStack.length - 1];
    return top && top.type === "deletion-detail" && top.id === "DEL-033";
  }), await page.evaluate(() => JSON.stringify(backNavigationStack)));

  // ---------- 3. Back → returns to Request Detail DEL-033 (DEL-PTO-006) ----------
  await page.locator(".page-back-btn").click();
  await page.waitForTimeout(400);
  check("N3 back returns to Request Detail", await page.evaluate(() =>
    document.body.classList.contains("deletion-detail-mode") &&
    document.querySelector("#page-title").textContent === "Request Detail"));
  check("N3 crumb back to DEL-033", await page.evaluate(() =>
    document.querySelector("#crumb").textContent ===
    "งานตรวจสอบและบริการ / Account Deletion / Requests / DEL-033"),
    await page.evaluate(() => document.querySelector("#crumb").textContent));
  check("N3 deletions nav active again", await navActive(page, "deletions"));
  check("N3 users nav NOT active after back", !(await navActive(page, "users")));
  check("N3 users submenu NOT left open (A.4)", await page.evaluate(() =>
    !(document.querySelector(".submenu[data-submenu='users']")?.classList.contains("open") || false) &&
    !expandedMenus.has("users")));

  // ---------- 4. Same-module path: User Accounts → User Detail still works ----------
  await page.evaluate(() => jumpToModule("users", "User Accounts"));
  await page.waitForTimeout(400);
  await page.locator(".user-row[data-user-card] .user-cell-primary").first().click();
  await page.waitForTimeout(400);
  check("N4 User Detail from User Accounts", await page.evaluate(() =>
    document.body.classList.contains("user-detail-mode") &&
    activeModule === "users" && activeSub === "User Accounts"));
  check("N4 users nav + sub active", (await navActive(page, "users")) && await page.evaluate(() =>
    document.querySelector(".submenu button[data-module='users'][data-sub='User Accounts']")?.classList.contains("active") || false));
  await page.locator(".page-back-btn").click();
  await page.waitForTimeout(400);
  check("N4 back returns to User Accounts list", await page.evaluate(() =>
    document.body.classList.contains("user-list-mode") && activeSub === "User Accounts"));

  // ---------- 5. Reported Users → Report Detail → data-user-open → User Detail ----------
  await page.evaluate(() => jumpToModule("users", "Reported Users"));
  await page.waitForTimeout(400);
  await page.locator(".user-row[data-report-id]").first().click();
  await page.waitForTimeout(400);
  check("N5 Report Detail opens", await page.evaluate(() =>
    document.querySelector("#page-title").textContent === "Report Detail"));
  const reportUserLink = page.locator("[data-user-open]").first();
  check("N5 report detail has user link", (await reportUserLink.count()) === 1);
  await reportUserLink.click();
  await page.waitForTimeout(400);
  check("N5 User Detail with users active", await page.evaluate(() =>
    document.body.classList.contains("user-detail-mode") &&
    activeModule === "users" && activeSub === "User Accounts"));
  await page.locator(".page-back-btn").click();
  await page.waitForTimeout(400);
  check("N5 back returns to Report Detail", await page.evaluate(() =>
    document.querySelector("#page-title").textContent === "Report Detail"));

  // ---------- 6. User Detail U-1104 → ดูคำขอลบบัญชี → Request Detail → back → User Detail ----------
  await page.evaluate(() => jumpToModule("users", "User Accounts"));
  await page.waitForTimeout(400);
  await page.locator("#user-search").fill("U-1104");
  await page.waitForTimeout(300);
  await page.locator(".user-row[data-user-card='U-1104'] .user-cell-primary").click();
  await page.waitForTimeout(400);
  check("N6 User Detail U-1104 opens", await page.evaluate(() =>
    document.body.classList.contains("user-detail-mode") && activeRow?.id === "U-1104"));
  const delAction = page.locator("[data-user-action='Open Account Deletion']").first();
  check("N6 'ดูคำขอลบบัญชี' action exists", (await delAction.count()) >= 1);
  await delAction.click();
  await page.waitForTimeout(400);
  check("N6 Request Detail DEL-033 opens directly", await page.evaluate(() =>
    document.body.classList.contains("deletion-detail-mode") &&
    document.querySelector("#crumb").textContent.includes("DEL-033")));
  check("N6 stack top = user-detail U-1104", await page.evaluate(() => {
    const top = backNavigationStack[backNavigationStack.length - 1];
    return top && top.type === "user-detail" && top.id === "U-1104";
  }), await page.evaluate(() => JSON.stringify(backNavigationStack)));
  await page.locator(".page-back-btn").click();
  await page.waitForTimeout(400);
  check("N6 back returns to User Detail U-1104 (not list)", await page.evaluate(() =>
    document.body.classList.contains("user-detail-mode") &&
    document.querySelector("#page-title").textContent === "User Detail" &&
    activeModule === "users" && activeSub === "User Accounts"));
  check("N6 crumb back to U-1104", await page.evaluate(() =>
    document.querySelector("#crumb").textContent ===
    "การดำเนินงาน / User Management / User Detail / U-1104"));

  check("no page errors", errors.length === 0, errors.join(" | "));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
