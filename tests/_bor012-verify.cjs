// BOR-012 verify: Navigation, Deep Link and Back Context Regression
// Contracts: docs/bo-navigation-naming-contract.md (Contract A, B, C)
// + docs/bo-shared-remediation-coverage.md
// Covers:
// 1. Sidebar Nav Active State across ALL modules & submodules (navGroups)
// 2. Outside navGroups: My Account active state & single-level crumb
// 3. Destination-owned active state on Detail Pages across all modules
// 4. WAL-1440 Deep Link → Watch Alert Detail + Back to Demand Overview (BOR-007)
// 5. Account Deletion → User Detail (destination-owned) + Back to Request Detail (BOR-008)
// 6. Market Overview Naming on all surfaces (BOR-010)
// 7. Navigation boundaries & Filter persistence (Contract B.4, B.5, B.6)
// 8. Responsive verification across 4 viewports (1440, 1280, 768, 390)
//
// Standalone script — run: node tests/_bor012-verify.cjs

const { chromium } = require("@playwright/test");

const BASE = "http://localhost:8080/bo-prototype.html";

let pass = 0, fail = 0;
const findings = [];
function check(name, ok, extra = "") {
  if (ok) {
    pass++;
    console.log(`PASS  ${name}`);
  } else {
    fail++;
    findings.push(`${name} ${extra}`);
    console.log(`FAIL  ${name} ${extra}`);
  }
}
function suite(name) {
  console.log(`\n=== [SUITE] ${name} ===`);
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

// Navigate via sidebar or mobile drawer
async function navTo(page, moduleId, sub) {
  const vw = (page.viewportSize() || { width: 1440 }).width;
  if (vw <= 1180) {
    const isNavOpen = await page.evaluate(() => document.body.classList.contains("nav-open"));
    if (!isNavOpen) {
      await page.locator("#menu-toggle").click();
      await page.waitForTimeout(250);
    }
  }

  const parent = page.locator(`.nav-item[data-module='${moduleId}']`);
  if (sub) {
    const expanded = await parent.evaluate((el) => el.classList.contains("expanded")).catch(() => false);
    if (!expanded) {
      await parent.click();
      await page.waitForTimeout(250);
    }
    const subBtn = page.locator(`.submenu[data-submenu='${moduleId}'] button[data-sub='${sub}']`);
    await subBtn.click();
  } else {
    await parent.click();
  }
  await page.waitForTimeout(400);

  if (vw <= 1180) {
    await page.evaluate(() => setNavOpen(false));
    await page.waitForTimeout(200);
  }
}

const navActive = (page, mod) => page.evaluate((m) =>
  document.querySelector(`.nav-item[data-module='${m}']`)?.classList.contains("active") || false, mod);

const subActive = (page, mod, sub) => page.evaluate(({ m, s }) => {
  const btn = document.querySelector(`.submenu button[data-module='${m}'][data-sub='${s}']`);
  return btn?.classList.contains("active") || false;
}, { m: mod, s: sub });

const submenuOpen = (page, mod) => page.evaluate((m) =>
  document.querySelector(`.submenu[data-submenu='${m}']`)?.classList.contains("open") || false, mod);

// Nav definitions from navGroups
const NAV_DEFINITIONS = [
  // section: การดำเนินงาน
  { module: "dashboard", label: "Dashboard", section: "การดำเนินงาน", subs: [] },
  { module: "users", label: "User Management", section: "การดำเนินงาน", subs: ["User Accounts", "Reported Users"] },
  { module: "assets", label: "Asset Management", section: "การดำเนินงาน", subs: ["Asset List", "Reported Assets", "Reported Comments"] },
  { module: "offers", label: "Offer Management", section: "การดำเนินงาน", subs: [] },
  { module: "content", label: "Content Management", section: "การดำเนินงาน", subs: ["Articles", "Categories", "Reported Articles"] },
  { module: "market", label: "Market Data", section: "การดำเนินงาน", subs: ["Market Overview", "Brands & Models", "Sync History"] },
  { module: "option-master", label: "Option Master", section: "การดำเนินงาน", subs: [] },
  // section: งานตรวจสอบและบริการ
  { module: "watch-alerts", label: "Market Demand", section: "งานตรวจสอบและบริการ", subs: ["Demand Overview", "Search Insights", "Watch Alert List"] },
  { module: "deletions", label: "Account Deletion", section: "งานตรวจสอบและบริการ", subs: [] },
  // section: เครื่องมือ & รายงาน
  { module: "settings", label: "Settings", section: "เครื่องมือ & รายงาน", subs: [
    "Admin Accounts", "Roles & Permissions", "Policy & Versioning", "Support Center", "Delivery Logs",
    { label: "Audit Log", subModule: "audit" }
  ]}
];

(async () => {
  const browser = await chromium.launch();

  // =========================================================================
  // PART 1: Desktop 1440x900 — Full Navigation & Contract Verification
  // =========================================================================
  {
    suite("Part 1: Desktop 1440x900 — All Modules Nav Active State (Contract A)");
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push(e.message));
    await login(page);

    // 1.1 Verify all modules and submodules in navGroups
    for (const def of NAV_DEFINITIONS) {
      if (def.subs.length === 0) {
        // Module without sub
        await navTo(page, def.module);
        const isActiveParent = await navActive(page, def.module);
        check(`A.1 [1440] ${def.label} nav item active`, isActiveParent);

        // Verify no other module nav item is active
        const activeNavCount = await page.evaluate(() =>
          document.querySelectorAll(".nav-item.active").length);
        check(`A.1 [1440] ${def.label} exactly 1 parent nav active`, activeNavCount === 1, `count=${activeNavCount}`);

        // If not dashboard, verify dashboard is NOT active
        if (def.module !== "dashboard") {
          const isDashActive = await navActive(page, "dashboard");
          check(`A.1 [1440] ${def.label} dashboard NOT active`, !isDashActive);
        }

        // Verify crumb
        const expectedCrumb = def.module === "deletions"
          ? "งานตรวจสอบและบริการ / Account Deletion"
          : `${def.section} / ${def.label}`;
        const actualCrumb = await page.evaluate(() => document.querySelector("#crumb")?.textContent?.trim());
        check(`A.1 [1440] ${def.label} crumb matches "${expectedCrumb}"`, actualCrumb === expectedCrumb, `got="${actualCrumb}"`);

        // Verify page-title
        const expectedTitle = def.module === "deletions" ? "Account Deletion Requests" : def.label;
        const actualTitle = await page.evaluate(() => document.querySelector("#page-title")?.textContent?.trim());
        check(`A.1 [1440] ${def.label} page-title matches "${expectedTitle}"`, actualTitle === expectedTitle, `got="${actualTitle}"`);
      } else {
        // Module with subs
        for (const subItem of def.subs) {
          const subLabel = typeof subItem === "string" ? subItem : subItem.label;
          const subMod = typeof subItem === "object" && subItem.subModule ? subItem.subModule : def.module;

          await navTo(page, def.module, subLabel);

          // Check parent active
          const isParentActive = await navActive(page, def.module);
          check(`A.1 [1440] ${def.label} > ${subLabel} parent nav active`, isParentActive);

          // Check submenu open
          const isOpen = await submenuOpen(page, def.module);
          check(`A.4 [1440] ${def.label} > ${subLabel} submenu open`, isOpen);

          // Check sub button active
          const isSubActive = await subActive(page, subMod, subLabel);
          check(`A.1/A.3 [1440] ${def.label} > ${subLabel} sub active (canonical)`, isSubActive);

          // Check dashboard NOT active
          const isDashActive = await navActive(page, "dashboard");
          check(`A.1 [1440] ${def.label} > ${subLabel} dashboard NOT active`, !isDashActive);

          // Check crumb: Asset List displayLabel is "Assets"
          const displaySub = (def.module === "assets" && subLabel === "Asset List") ? "Assets" : subLabel;
          const expectedCrumb = `${def.section} / ${def.label} / ${displaySub}`;
          const actualCrumb = await page.evaluate(() => document.querySelector("#crumb")?.textContent?.trim());
          check(`A.1 [1440] ${def.label} > ${subLabel} crumb matches`, actualCrumb === expectedCrumb, `got="${actualCrumb}"`);

          // Check page-title: Asset List title is "Assets"
          const expectedTitle = displaySub;
          const actualTitle = await page.evaluate(() => document.querySelector("#page-title")?.textContent?.trim());
          check(`A.1 [1440] ${def.label} > ${subLabel} page-title "${expectedTitle}"`, actualTitle === expectedTitle, `got="${actualTitle}"`);
        }
      }
    }

    // 1.2 Display override check (Contract C.1): Asset List shows as "Assets" on sidebar
    {
      const assetText = await page.evaluate(() =>
        document.querySelector(".submenu[data-submenu='assets'] button[data-sub='Asset List']")?.textContent?.trim());
      check(`C.1 Asset List displays as "Assets" on sidebar`, assetText === "Assets", `got="${assetText}"`);
    }

    // 1.3 Outside navGroups: My Account (Contract A.5)
    suite("Part 2: Contract A.5 — My Account Outside navGroups");
    {
      await page.locator(".admin-box").click();
      await page.waitForTimeout(400);

      const noNavActive = await page.evaluate(() =>
        document.querySelectorAll(".nav-item.active").length === 0);
      check(`A.5 My Account: no .nav-item active`, noNavActive);

      const noSubActive = await page.evaluate(() =>
        document.querySelectorAll(".submenu button.active").length === 0);
      check(`A.5 My Account: no submenu button active`, noSubActive);

      const adminBoxBg = await page.locator("#my-account-entry").evaluate(el =>
        getComputedStyle(el).backgroundColor);
      check(`A.5 My Account: .admin-box has active background #1a365f`, adminBoxBg === "rgb(26, 54, 95)", `got="${adminBoxBg}"`);

      const isMyAccountMode = await page.evaluate(() =>
        document.body.classList.contains("my-account-mode"));
      check(`A.5 My Account: body has .my-account-mode`, isMyAccountMode);

      const crumb = await page.evaluate(() => document.querySelector("#crumb")?.textContent?.trim());
      check(`A.5 My Account: single-level crumb "My Account"`, crumb === "My Account", `got="${crumb}"`);

      const title = await page.evaluate(() => document.querySelector("#page-title")?.textContent?.trim());
      check(`A.5 My Account: page-title "My Account"`, title === "My Account", `got="${title}"`);
    }

    // 1.4 Destination-Owned Active State on Detail Pages (Contract A.1, A.2)
    suite("Part 3: Contract A.1 / A.2 — Destination-Owned Active State on Detail Pages");
    {
      // Detail 1: User Detail (from User Accounts list)
      await navTo(page, "users", "User Accounts");
      await page.locator(".user-row[data-user-card] .user-cell-primary").first().click();
      await page.waitForTimeout(400);
      check(`A.2 User Detail: activeModule = users`, await page.evaluate(() => activeModule === "users"));
      check(`A.2 User Detail: activeSub = User Accounts`, await page.evaluate(() => activeSub === "User Accounts"));
      check(`A.2 User Detail: users nav-item active`, await navActive(page, "users"));
      check(`A.2 User Detail: User Accounts sub active`, await subActive(page, "users", "User Accounts"));
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(300);

      // Detail 2: Reported User Detail
      await navTo(page, "users", "Reported Users");
      await page.locator(".user-row[data-report-id]").first().click();
      await page.waitForTimeout(400);
      check(`A.2 Reported User Detail: activeSub = Reported Users`, await page.evaluate(() => activeSub === "Reported Users"));
      check(`A.2 Reported User Detail: users nav-item active`, await navActive(page, "users"));
      check(`A.2 Reported User Detail: Reported Users sub active`, await subActive(page, "users", "Reported Users"));
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(300);

      // Detail 3: Asset Detail (from Asset List)
      await navTo(page, "assets", "Asset List");
      await page.locator(".asset-row[data-asset-card] .asset-cell-primary").first().click();
      await page.waitForTimeout(400);
      check(`A.2 Asset Detail: activeModule = assets`, await page.evaluate(() => activeModule === "assets"));
      check(`A.2 Asset Detail: activeSub = Asset List`, await page.evaluate(() => activeSub === "Asset List"));
      check(`A.2 Asset Detail: assets nav-item active`, await navActive(page, "assets"));
      check(`A.2 Asset Detail: Asset List sub active`, await subActive(page, "assets", "Asset List"));
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(300);

      // Detail 4: Reported Asset Detail
      await navTo(page, "assets", "Reported Assets");
      await page.locator(".user-row[data-asset-report-card]").first().click();
      await page.waitForTimeout(400);
      check(`A.2 Reported Asset Detail: activeSub = Reported Assets`, await page.evaluate(() => activeSub === "Reported Assets"));
      check(`A.2 Reported Asset Detail: assets nav-item active`, await navActive(page, "assets"));
      check(`A.2 Reported Asset Detail: Reported Assets sub active`, await subActive(page, "assets", "Reported Assets"));
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(300);

      // Detail 5: Reported Comment Detail
      await navTo(page, "assets", "Reported Comments");
      await page.locator(".user-row[data-reported-comment-card]").first().click();
      await page.waitForTimeout(400);
      check(`A.2 Reported Comment Detail: activeSub = Reported Comments`, await page.evaluate(() => activeSub === "Reported Comments"));
      check(`A.2 Reported Comment Detail: assets nav-item active`, await navActive(page, "assets"));
      check(`A.2 Reported Comment Detail: Reported Comments sub active`, await subActive(page, "assets", "Reported Comments"));
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(300);

      // Detail 6: Article Detail
      await navTo(page, "content", "Articles");
      await page.locator(".asset-row[data-article-card] .asset-cell-primary").first().click();
      await page.waitForTimeout(400);
      check(`A.2 Article Detail: activeModule = content`, await page.evaluate(() => activeModule === "content"));
      check(`A.2 Article Detail: activeSub = Articles`, await page.evaluate(() => activeSub === "Articles"));
      check(`A.2 Article Detail: content nav-item active`, await navActive(page, "content"));
      check(`A.2 Article Detail: Articles sub active`, await subActive(page, "content", "Articles"));
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(300);

      // Detail 7: Board Report Detail
      await navTo(page, "content", "Reported Articles");
      await page.locator(".asset-row[data-board-report-card]").first().click();
      await page.waitForTimeout(400);
      check(`A.2 Board Report Detail: activeSub = Reported Articles`, await page.evaluate(() => activeSub === "Reported Articles"));
      check(`A.2 Board Report Detail: content nav-item active`, await navActive(page, "content"));
      check(`A.2 Board Report Detail: Reported Articles sub active`, await subActive(page, "content", "Reported Articles"));
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(300);

      // Detail 8: Watch Alert Detail (from Watch Alert List)
      await navTo(page, "watch-alerts", "Watch Alert List");
      await page.locator(".asset-row[data-wa-alert-open] .asset-cell-primary").first().click();
      await page.waitForTimeout(400);
      check(`A.2 Alert Detail: activeModule = watch-alerts`, await page.evaluate(() => activeModule === "watch-alerts"));
      check(`A.2 Alert Detail: activeSub = Watch Alert List`, await page.evaluate(() => activeSub === "Watch Alert List"));
      check(`A.2 Alert Detail: watch-alerts nav-item active`, await navActive(page, "watch-alerts"));
      check(`A.2 Alert Detail: Watch Alert List sub active`, await subActive(page, "watch-alerts", "Watch Alert List"));
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(300);

      // Detail 9: Request Detail (Account Deletion)
      await navTo(page, "deletions");
      await page.locator(".user-row[data-deletion-card]").first().click();
      await page.waitForTimeout(400);
      check(`A.2 Request Detail: activeModule = deletions`, await page.evaluate(() => activeModule === "deletions"));
      check(`A.2 Request Detail: deletions nav-item active`, await navActive(page, "deletions"));
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(300);

      // Detail 10: Admin Account Detail
      await navTo(page, "settings", "Admin Accounts");
      await page.locator(".user-row[data-admin-account-card]").first().click();
      await page.waitForTimeout(400);
      check(`A.2 Admin Detail: activeModule = settings`, await page.evaluate(() => activeModule === "settings"));
      check(`A.2 Admin Detail: activeSub = Admin Accounts`, await page.evaluate(() => activeSub === "Admin Accounts"));
      check(`A.2 Admin Detail: settings nav-item active`, await navActive(page, "settings"));
      check(`A.2 Admin Detail: Admin Accounts sub active`, await subActive(page, "settings", "Admin Accounts"));
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(300);

      // Detail 11: Role Detail
      await navTo(page, "settings", "Roles & Permissions");
      await page.locator(".user-row[data-role-card]").first().click();
      await page.waitForTimeout(400);
      check(`A.2 Role Detail: activeModule = settings`, await page.evaluate(() => activeModule === "settings"));
      check(`A.2 Role Detail: activeSub = Roles & Permissions`, await page.evaluate(() => activeSub === "Roles & Permissions"));
      check(`A.2 Role Detail: settings nav-item active`, await navActive(page, "settings"));
      check(`A.2 Role Detail: Roles & Permissions sub active`, await subActive(page, "settings", "Roles & Permissions"));
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(300);

      // Detail 12: Policy Detail
      await navTo(page, "settings", "Policy & Versioning");
      await page.locator(".asset-row[data-policy-open]").first().click();
      await page.waitForTimeout(400);
      check(`A.2 Policy Detail: activeModule = settings`, await page.evaluate(() => activeModule === "settings"));
      check(`A.2 Policy Detail: activeSub = Policy & Versioning`, await page.evaluate(() => activeSub === "Policy & Versioning"));
      check(`A.2 Policy Detail: settings nav-item active`, await navActive(page, "settings"));
      check(`A.2 Policy Detail: Policy & Versioning sub active`, await subActive(page, "settings", "Policy & Versioning"));
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(300);

      // Detail 13: Option Detail (from Option Master group list)
      await navTo(page, "option-master");
      await page.locator(".asset-row[data-option-group] .asset-cell-primary").first().click();
      await page.waitForTimeout(400);
      check(`A.2 Option Detail: activeModule = option-master`, await page.evaluate(() => activeModule === "option-master"));
      check(`A.2 Option Detail: option-master nav-item active`, await navActive(page, "option-master"));
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(300);
    }

    // 1.5 WAL-1440 Deep Link & Back Context (Contract B.1, B.2, B.3, BOR-007)
    suite("Part 4: Contract B.1/B.2/B.3 — WAL-1440 Deep Link & Back Context");
    {
      await navTo(page, "watch-alerts", "Demand Overview");
      check(`B.1 WAL-1440: on Demand Overview`, await page.evaluate(() =>
        document.body.classList.contains("watch-alert-overview-mode")));

      const walRow = page.locator(".wa-panel-frequent [data-wa-alert-row='WAL-1440']");
      check(`B.1 WAL-1440: row exists in Frequently Triggered`, (await walRow.count()) === 1);
      await walRow.click();
      await page.waitForTimeout(400);

      check(`B.1 WAL-1440: opens Alert Detail directly`, await page.evaluate(() =>
        document.body.classList.contains("watch-alert-detail-mode")));
      check(`B.1 WAL-1440: page-title = "Alert Detail"`, await page.evaluate(() =>
        document.querySelector("#page-title")?.textContent === "Alert Detail"));
      check(`B.1 WAL-1440: crumb ends with /WAL-1440`, await page.evaluate(() =>
        document.querySelector("#crumb")?.textContent ===
        "งานตรวจสอบและบริการ / Market Demand / Watch Alert List / WAL-1440"));
      check(`B.1 WAL-1440: detail head shows WAL-1440`, await page.evaluate(() =>
        document.querySelector(".asset-report-id")?.textContent === "WAL-1440"));

      // Destination-owned active state: watch-alerts / Watch Alert List
      check(`A.1 WAL-1440: parent nav active = watch-alerts`, await navActive(page, "watch-alerts"));
      check(`A.3 WAL-1440: canonical sub active = Watch Alert List`, await subActive(page, "watch-alerts", "Watch Alert List"));

      // Back preserves source context (Demand Overview)
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(400);
      check(`B.3 WAL-1440: back returns to Demand Overview`, await page.evaluate(() =>
        document.body.classList.contains("watch-alert-overview-mode") &&
        document.querySelector("#page-title")?.textContent === "Demand Overview"));
      check(`B.3 WAL-1440: crumb restored to Demand Overview`, await page.evaluate(() =>
        document.querySelector("#crumb")?.textContent ===
        "งานตรวจสอบและบริการ / Market Demand / Demand Overview"));

      // Watch Alert List path: row opens detail and back returns to list
      await navTo(page, "watch-alerts", "Watch Alert List");
      await page.locator(".asset-row[data-wa-alert-open='WAL-1440'] .asset-cell-primary").click();
      await page.waitForTimeout(400);
      check(`B.1 WAL-1440 from list: opens detail`, await page.evaluate(() =>
        document.body.classList.contains("watch-alert-detail-mode")));
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(400);
      check(`B.3 WAL-1440 from list: back returns to Watch Alert List`, await page.evaluate(() =>
        document.body.classList.contains("watch-alert-list-mode")));
    }

    // 1.6 Account Deletion → User Detail (destination-owned) + Back (Contract A.1, B.3, BOR-008)
    suite("Part 5: Contract A.1 / B.3 — Account Deletion → User Detail (BOR-008)");
    {
      await page.evaluate(() => jumpToModule("deletions"));
      await page.waitForTimeout(400);
      await page.locator("#deletion-search").fill("DEL-033");
      await page.waitForTimeout(300);
      await page.locator(".user-row[data-deletion-card]").filter({ hasText: "DEL-033" }).first().click();
      await page.waitForTimeout(400);
      check(`B.1 DEL-033: opens Request Detail`, await page.evaluate(() =>
        document.body.classList.contains("deletion-detail-mode")));

      // Click user open link to U-1104
      await page.locator("[data-user-open='U-1104']").first().click();
      await page.waitForTimeout(400);

      // Verify destination-owned active state
      check(`A.1 DEL-033→U-1104: opens User Detail`, await page.evaluate(() =>
        document.body.classList.contains("user-detail-mode")));
      check(`A.1 DEL-033→U-1104: activeModule = users`, await page.evaluate(() => activeModule === "users"));
      check(`A.1 DEL-033→U-1104: activeSub = User Accounts`, await page.evaluate(() => activeSub === "User Accounts"));
      check(`A.1 DEL-033→U-1104: users nav active`, await navActive(page, "users"));
      check(`A.1 DEL-033→U-1104: deletions nav NOT active`, !(await navActive(page, "deletions")));
      check(`A.4 DEL-033→U-1104: users submenu open`, await submenuOpen(page, "users"));
      check(`A.1 DEL-033→U-1104: User Accounts sub button active`, await subActive(page, "users", "User Accounts"));

      // Back returns to DEL-033 Request Detail
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(400);
      check(`B.3 DEL-033→U-1104: back returns to Request Detail DEL-033`, await page.evaluate(() =>
        document.body.classList.contains("deletion-detail-mode") &&
        document.querySelector("#crumb")?.textContent?.includes("DEL-033")));
      check(`B.3 DEL-033→U-1104: deletions nav active again`, await navActive(page, "deletions"));
      check(`B.3 DEL-033→U-1104: users nav NOT active`, !(await navActive(page, "users")));
      check(`B.3 DEL-033→U-1104: users submenu closed`, !(await submenuOpen(page, "users")));

      // Reverse path: User Detail U-1104 → ดูคำขอลบบัญชี → Request Detail → Back → User Detail
      await page.evaluate(() => jumpToModule("users", "User Accounts"));
      await page.waitForTimeout(400);
      await page.locator("#user-search").fill("U-1104");
      await page.waitForTimeout(300);
      await page.locator(".user-row[data-user-card='U-1104'] .user-cell-primary").click();
      await page.waitForTimeout(400);
      const delAction = page.locator("[data-user-action='Open Account Deletion']").first();
      await delAction.click();
      await page.waitForTimeout(400);
      check(`B.1 U-1104→DEL-033: opens Request Detail`, await page.evaluate(() =>
        document.body.classList.contains("deletion-detail-mode")));
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(400);
      check(`B.3 U-1104→DEL-033: back returns to User Detail U-1104`, await page.evaluate(() =>
        document.body.classList.contains("user-detail-mode") &&
        document.querySelector("#crumb")?.textContent?.includes("U-1104") &&
        activeModule === "users"));
    }

    // 1.7 Market Overview Naming (Contract C.2, BOR-010)
    suite("Part 6: Contract C.2 — Market Overview Naming (BOR-010)");
    {
      await page.locator(".nav-item[data-module='market']").click();
      await page.waitForTimeout(200);
      check(`C.2 Market Overview sub visible`, await page.evaluate(() =>
        !!document.querySelector(".submenu[data-submenu='market'] button[data-sub='Market Overview']")));
      check(`C.2 Old 'Dashboard' sub NOT in market submenu`, await page.evaluate(() =>
        !document.querySelector(".submenu[data-submenu='market'] button[data-sub='Dashboard']")));
      check(`C.2 Top-level Dashboard module untouched`, await page.evaluate(() =>
        document.querySelector(".nav-item[data-module='dashboard']")?.textContent?.includes("Dashboard")));

      await page.locator(".submenu[data-submenu='market'] button[data-sub='Market Overview']").click();
      await page.waitForTimeout(300);
      check(`C.2 Market Overview page-title`, await page.evaluate(() =>
        document.querySelector("#page-title")?.textContent === "Market Overview"));
      check(`C.2 Market Overview crumb`, await page.evaluate(() =>
        document.querySelector("#crumb")?.textContent === "การดำเนินงาน / Market Data / Market Overview"));
      check(`C.2 Market Overview body mode kept (market-dashboard-mode)`, await page.evaluate(() =>
        document.body.classList.contains("market-dashboard-mode")));

      // Default sub for market
      await page.evaluate(() => jumpToModule("market"));
      await page.waitForTimeout(300);
      check(`C.2 jumpToModule('market') lands on Market Overview`, await page.evaluate(() =>
        document.querySelector("#page-title")?.textContent === "Market Overview" &&
        document.body.classList.contains("market-dashboard-mode")));

      // Role permission matrix check
      await page.evaluate(() => jumpToModule("settings", "Roles & Permissions"));
      await page.waitForTimeout(400);
      const roleRow = page.locator(".user-row[data-role-card]").first();
      await roleRow.click();
      await page.waitForTimeout(600);
      check(`C.2 Role matrix shows 'Market Overview' group`, await page.evaluate(() =>
        [...document.querySelectorAll(".perm-sub-title")].some(el => el.textContent === "Market Overview")));
      check(`C.2 Role matrix shows 'ดู Market Overview'`, await page.evaluate(() =>
        [...document.querySelectorAll(".perm-item-name")].some(el => el.textContent === "ดู Market Overview")));
      check(`C.2 Role matrix has NO stale 'ดู Market Dashboard'`, await page.evaluate(() =>
        ![...document.querySelectorAll(".perm-item-name")].some(el => el.textContent === "ดู Market Dashboard")));

      // Market detail back button (Contract C.4 / Flag 1: data-market-back exists and navigates back)
      await page.evaluate(() => jumpToModule("market", "Brands & Models"));
      await page.waitForTimeout(400);
      await page.locator("[data-market-brand]").first().click();
      await page.waitForTimeout(400);
      const brandBackBtn = page.locator("[data-market-back='catalog']");
      check(`C.4 Market brand detail back button exists`, (await brandBackBtn.count()) === 1);

      await page.locator("[data-market-model]").first().click();
      await page.waitForTimeout(400);
      const modelBackBtn = page.locator("[data-market-back='brand']");
      check(`C.4 Market model detail back button exists`, (await modelBackBtn.count()) === 1);

      // Back from Model detail returns to Brand detail
      await modelBackBtn.click();
      await page.waitForTimeout(400);
      check(`B.3 Market model back returns to Brand detail`, await page.evaluate(() =>
        document.querySelector("#crumb")?.textContent?.includes("Brands & Models /")));

      // Back from Brand detail returns to Brands & Models catalog
      await page.locator("[data-market-back='catalog']").click();
      await page.waitForTimeout(400);
      check(`B.3 Market brand back returns to Brands & Models`, await page.evaluate(() =>
        document.querySelector("#page-title")?.textContent === "Brands & Models"));
    }

    // 1.8 Navigation Boundaries & Filter Persistence (Contract B.4, B.5, B.6)
    suite("Part 7: Contract B.4/B.5/B.6 — Navigation Boundaries & Filter Persistence");
    {
      // B.5 Filter persistence in list → detail → back within same route
      await page.evaluate(() => jumpToModule("users", "User Accounts"));
      await page.waitForTimeout(400);
      await page.locator("#user-search").fill("U-1002");
      await page.waitForTimeout(300);
      const rowCountFiltered = await page.locator(".user-row[data-user-card]").count();
      check(`B.5 Filter applied in User Accounts`, rowCountFiltered === 1);

      // Drill into detail
      await page.locator(".user-row[data-user-card] .user-cell-primary").first().click();
      await page.waitForTimeout(400);
      check(`B.5 User Detail opened`, await page.evaluate(() => document.body.classList.contains("user-detail-mode")));

      // Back to list → filter preserved
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(400);
      const restoredSearch = await page.locator("#user-search").inputValue();
      check(`B.5 Search filter preserved after back: "${restoredSearch}"`, restoredSearch === "U-1002");

      // B.5 Filter cleared when switching to another route
      await navTo(page, "assets", "Asset List");
      await page.waitForTimeout(300);
      await navTo(page, "users", "User Accounts");
      await page.waitForTimeout(300);
      const resetSearch = await page.locator("#user-search").inputValue();
      check(`B.5 Filter cleared on new route: "${resetSearch}"`, resetSearch === "");

      // B.6 jumpToModule resets back stack
      await navTo(page, "watch-alerts", "Demand Overview");
      await page.locator(".wa-panel-frequent [data-wa-alert-row='WAL-1440']").click();
      await page.waitForTimeout(400);
      check(`B.6 Back stack has entry after detail open`, await page.evaluate(() => backNavigationStack.length > 0));
      await page.evaluate(() => jumpToModule("users", "User Accounts"));
      await page.waitForTimeout(400);
      check(`B.6 jumpToModule resets back stack (length=0)`, await page.evaluate(() => backNavigationStack.length === 0));

      // B.4 Sidebar nav click resets back stack
      await navTo(page, "watch-alerts", "Demand Overview");
      await page.locator(".wa-panel-frequent [data-wa-alert-row='WAL-1440']").click();
      await page.waitForTimeout(400);
      check(`B.4 Back stack has entry after detail open`, await page.evaluate(() => backNavigationStack.length > 0));
      await page.locator(".nav-item[data-module='offers']").click();
      await page.waitForTimeout(300);
      check(`B.4 Nav click resets back stack (length=0)`, await page.evaluate(() => backNavigationStack.length === 0));
    }

    check(`Desktop 1440: no unhandled page errors`, pageErrors.length === 0, pageErrors.join(", "));
    await ctx.close();
  }

  // =========================================================================
  // PART 2: Desktop 1280x800 — Spot checks on 1280
  // =========================================================================
  {
    suite("Part 8: Desktop 1280x800 — Navigation Spot Checks");
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await login(page);

    // Spot check key modules & subs
    const spotChecks = [
      { mod: "dashboard", sub: null, expTitle: "Dashboard" },
      { mod: "users", sub: "User Accounts", expTitle: "User Accounts" },
      { mod: "assets", sub: "Reported Comments", expTitle: "Reported Comments" },
      { mod: "market", sub: "Market Overview", expTitle: "Market Overview" },
      { mod: "watch-alerts", sub: "Watch Alert List", expTitle: "Watch Alert List" },
      { mod: "settings", sub: "Audit Log", subMod: "audit", expTitle: "Audit Log" },
      { mod: "deletions", sub: null, expTitle: "Account Deletion Requests" }
    ];

    for (const sc of spotChecks) {
      await navTo(page, sc.mod, sc.sub);
      const isParentActive = await navActive(page, sc.mod);
      check(`A.1 [1280] ${sc.mod} parent active`, isParentActive);
      if (sc.sub) {
        const isSubActive = await subActive(page, sc.subMod || sc.mod, sc.sub);
        check(`A.1 [1280] ${sc.mod} > ${sc.sub} sub active`, isSubActive);
      }
      const title = await page.evaluate(() => document.querySelector("#page-title")?.textContent?.trim());
      check(`A.1 [1280] ${sc.mod} title "${sc.expTitle}"`, title === sc.expTitle, `got="${title}"`);
    }

    // Spot check WAL-1440 deep link & back
    await navTo(page, "watch-alerts", "Demand Overview");
    await page.locator(".wa-panel-frequent [data-wa-alert-row='WAL-1440']").click();
    await page.waitForTimeout(400);
    check(`B.1 [1280] WAL-1440 opens Alert Detail`, await page.evaluate(() =>
      document.body.classList.contains("watch-alert-detail-mode")));
    check(`A.1 [1280] WAL-1440 destination active (watch-alerts)`, await navActive(page, "watch-alerts"));
    await page.locator(".page-back-btn").click();
    await page.waitForTimeout(400);
    check(`B.3 [1280] Back returns to Demand Overview`, await page.evaluate(() =>
      document.body.classList.contains("watch-alert-overview-mode")));

    // Spot check DEL-033 -> U-1104
    await page.evaluate(() => jumpToModule("deletions"));
    await page.waitForTimeout(300);
    await page.locator(".user-row[data-deletion-card]").filter({ hasText: "DEL-033" }).first().click();
    await page.waitForTimeout(400);
    await page.locator("[data-user-open='U-1104']").first().click();
    await page.waitForTimeout(400);
    check(`A.1 [1280] DEL-033→U-1104 destination active users`, await navActive(page, "users"));
    check(`A.1 [1280] DEL-033→U-1104 deletions NOT active`, !(await navActive(page, "deletions")));
    await page.locator(".page-back-btn").click();
    await page.waitForTimeout(400);
    check(`B.3 [1280] Back returns to DEL-033 Request Detail`, await page.evaluate(() =>
      document.body.classList.contains("deletion-detail-mode")));

    await ctx.close();
  }

  // =========================================================================
  // PART 3: Tablet 768x1024 — Mobile Drawer & Navigation
  // =========================================================================
  {
    suite("Part 9: Tablet 768x1024 — Mobile Drawer & Nav Verification");
    const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
    const page = await ctx.newPage();
    await login(page);

    // 3.1 Verify menu toggle opens navigation drawer
    const toggle = page.locator("#menu-toggle");
    check(`A.4 [768] #menu-toggle visible`, await toggle.isVisible());
    await toggle.click();
    await page.waitForTimeout(300);
    check(`A.4 [768] body has .nav-open`, await page.evaluate(() => document.body.classList.contains("nav-open")));

    // 3.2 Navigate via mobile drawer
    // Click Market Data -> Market Overview
    const marketParent = page.locator(`.nav-item[data-module='market']`);
    await marketParent.click();
    await page.waitForTimeout(300);
    check(`A.4 [768] Market Data expanded`, await marketParent.evaluate(el => el.classList.contains("expanded")));
    const mktOverviewBtn = page.locator(".submenu[data-submenu='market'] button[data-sub='Market Overview']");
    check(`C.2 [768] Market Overview sub button exists`, (await mktOverviewBtn.count()) === 1);
    await mktOverviewBtn.click();
    await page.waitForTimeout(400);
    await page.evaluate(() => setNavOpen(false));
    await page.waitForTimeout(200);

    check(`A.1 [768] Market Overview active`, await navActive(page, "market"));
    check(`C.2 [768] page-title = 'Market Overview'`, await page.evaluate(() =>
      document.querySelector("#page-title")?.textContent === "Market Overview"));

    // 3.3 Deep Link WAL-1440 on 768
    await navTo(page, "watch-alerts", "Demand Overview");
    await page.locator(".wa-panel-frequent [data-wa-alert-row='WAL-1440']").click();
    await page.waitForTimeout(400);
    check(`B.1 [768] WAL-1440 opens Alert Detail`, await page.evaluate(() =>
      document.body.classList.contains("watch-alert-detail-mode")));
    check(`A.1 [768] Destination active watch-alerts`, await navActive(page, "watch-alerts"));
    await page.locator(".page-back-btn").click();
    await page.waitForTimeout(400);
    check(`B.3 [768] Back returns to Demand Overview`, await page.evaluate(() =>
      document.body.classList.contains("watch-alert-overview-mode")));

    // 3.4 DEL-033 -> U-1104 on 768
    await page.evaluate(() => jumpToModule("deletions"));
    await page.waitForTimeout(300);
    await page.locator(".user-row[data-deletion-card]").filter({ hasText: "DEL-033" }).first().click();
    await page.waitForTimeout(400);
    await page.locator("[data-user-open='U-1104']").first().click();
    await page.waitForTimeout(400);
    check(`A.1 [768] DEL-033→U-1104 active = users`, await navActive(page, "users"));
    check(`A.1 [768] DEL-033→U-1104 deletions NOT active`, !(await navActive(page, "deletions")));
    await page.locator(".page-back-btn").click();
    await page.waitForTimeout(400);
    check(`B.3 [768] Back returns to DEL-033`, await page.evaluate(() =>
      document.body.classList.contains("deletion-detail-mode")));

    await ctx.close();
  }

  // =========================================================================
  // PART 4: Mobile 390x844 — Mobile Viewport Full Sweep
  // =========================================================================
  {
    suite("Part 10: Mobile 390x844 — Mobile Viewport Full Verification");
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push(e.message));
    await login(page);

    // 4.1 Mobile Menu Open & Close
    const toggle = page.locator("#menu-toggle");
    check(`A.4 [390] #menu-toggle visible`, await toggle.isVisible());
    await toggle.click();
    await page.waitForTimeout(250);
    check(`A.4 [390] body has .nav-open`, await page.evaluate(() => document.body.classList.contains("nav-open")));

    // 4.2 Test mobile navigation to all modules
    const mobileModuleTests = [
      { mod: "dashboard", sub: null, title: "Dashboard" },
      { mod: "users", sub: "User Accounts", title: "User Accounts" },
      { mod: "assets", sub: "Asset List", title: "Assets" },
      { mod: "offers", sub: null, title: "Offer Management" },
      { mod: "content", sub: "Articles", title: "Articles" },
      { mod: "market", sub: "Market Overview", title: "Market Overview" },
      { mod: "option-master", sub: null, title: "Option Master" },
      { mod: "watch-alerts", sub: "Demand Overview", title: "Demand Overview" },
      { mod: "deletions", sub: null, title: "Account Deletion Requests" },
      { mod: "settings", sub: "Audit Log", subMod: "audit", title: "Audit Log" }
    ];

    for (const mt of mobileModuleTests) {
      await navTo(page, mt.mod, mt.sub);
      const isParentActive = await navActive(page, mt.mod);
      check(`A.1 [390] ${mt.title} parent active`, isParentActive);
      if (mt.sub) {
        const isSubActive = await subActive(page, mt.subMod || mt.mod, mt.sub);
        check(`A.1 [390] ${mt.title} sub active`, isSubActive);
      }
      const title = await page.evaluate(() => document.querySelector("#page-title")?.textContent?.trim());
      check(`A.1 [390] ${mt.title} page title`, title === mt.title, `got="${title}"`);
    }

    // 4.3 My Account on 390
    await page.locator("#menu-toggle").click();
    await page.waitForTimeout(250);
    await page.locator(".admin-box").click();
    await page.waitForTimeout(400);
    check(`A.5 [390] My Account body mode`, await page.evaluate(() =>
      document.body.classList.contains("my-account-mode")));
    check(`A.5 [390] My Account no nav-item active`, await page.evaluate(() =>
      document.querySelectorAll(".nav-item.active").length === 0));

    // 4.4 WAL-1440 Deep Link on 390
    await navTo(page, "watch-alerts", "Demand Overview");
    await page.locator(".wa-panel-frequent [data-wa-alert-row='WAL-1440']").click();
    await page.waitForTimeout(400);
    check(`B.1 [390] WAL-1440 opens Alert Detail`, await page.evaluate(() =>
      document.body.classList.contains("watch-alert-detail-mode")));
    check(`B.1 [390] WAL-1440 title Alert Detail`, await page.evaluate(() =>
      document.querySelector("#page-title")?.textContent === "Alert Detail"));
    check(`A.1 [390] WAL-1440 active watch-alerts`, await navActive(page, "watch-alerts"));
    await page.locator(".page-back-btn").click();
    await page.waitForTimeout(400);
    check(`B.3 [390] Back returns to Demand Overview`, await page.evaluate(() =>
      document.body.classList.contains("watch-alert-overview-mode")));

    // 4.5 DEL-033 -> U-1104 on 390
    await page.evaluate(() => jumpToModule("deletions"));
    await page.waitForTimeout(300);
    await page.locator(".user-row[data-deletion-card]").filter({ hasText: "DEL-033" }).first().click();
    await page.waitForTimeout(400);
    await page.locator("[data-user-open='U-1104']").first().click();
    await page.waitForTimeout(400);
    check(`A.1 [390] DEL-033→U-1104 destination active users`, await navActive(page, "users"));
    check(`A.1 [390] DEL-033→U-1104 deletions NOT active`, !(await navActive(page, "deletions")));
    await page.locator(".page-back-btn").click();
    await page.waitForTimeout(400);
    check(`B.3 [390] Back returns to DEL-033`, await page.evaluate(() =>
      document.body.classList.contains("deletion-detail-mode")));

    check(`Mobile 390: no unhandled page errors`, pageErrors.length === 0, pageErrors.join(", "));
    await ctx.close();
  }

  await browser.close();

  // Summary
  console.log("\n=======================================================");
  console.log(`BOR-012 Verification Complete: ${pass} passed, ${fail} failed`);
  if (findings.length > 0) {
    console.log(`\nFINDINGS (${findings.length}):`);
    findings.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  } else {
    console.log("Verdict: All Navigation, Deep Link & Back Context contracts PASSED.");
  }
  console.log("=======================================================");

  process.exit(fail > 0 ? 1 : 0);
})();
