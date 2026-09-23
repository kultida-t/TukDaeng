// QA-BO-002: User Management (User List, User Detail, Reported Users, Report Detail) — strict Playwright spec
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล, spec docs เป็นหลักสำหรับพฤติกรรม/นำทาง
// เป้าหมาย: รันเทส เจอปัญหาจริง → ลิสปัญหา + แนวทางแก้ → แก้ใน flow เดียว (ห้ามแก้ prototype)
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

// helper: login เข้าระบบ (ค่า default อยู่ใน form แล้ว)
async function loginIfNeeded(page) {
  const loginScreen = page.locator("#login-screen");
  if (await loginScreen.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator("#login-form button[type=\"submit\"]").click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await page.waitForTimeout(500);
  }
}

// helper: เปิด nav ถ้าจอแคบ (≤1180px sidebar ถูกซ่อนด้วย transform)
async function ensureNavOpen(page) {
  const needsToggle = await page.evaluate(() =>
    window.matchMedia("(max-width: 1180px)").matches && !document.body.classList.contains("nav-open"));
  if (needsToggle) {
    await page.locator("#menu-toggle").click();
    await page.waitForTimeout(300);
  }
}

// helper: ไปหน้า User Accounts ผ่านเมนู (User Management → User Accounts)
async function goToUserAccounts(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  const parent = page.locator(".nav-item[data-module='users']");
  const expanded = await parent.evaluate(el => el.classList.contains("expanded")).catch(() => false);
  if (!expanded) await parent.click();
  await page.locator(".submenu[data-submenu='users'] button[data-sub='User Accounts']").click();
  await page.waitForTimeout(300);
}

// helper: ไปหน้า Reported Users ผ่านเมนู
async function goToReportedUsers(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  const parent = page.locator(".nav-item[data-module='users']");
  const expanded = await parent.evaluate(el => el.classList.contains("expanded")).catch(() => false);
  if (!expanded) await parent.click();
  await page.locator(".submenu[data-submenu='users'] button[data-sub='Reported Users']").click();
  await page.waitForTimeout(300);
}

// helper: เปิด filter bar ถ้ายังปิด (advanced filter ถูกซ่อนเมื่อ data-filter-open="false")
// หมายเหตุ: toggle/reset อยู่ใน .user-panel-filter-actions ซึ่งแสดงเฉพาะ mobile (≤760px)
// บน desktop filter bar เปิดอยู่แล้วเสมอ
async function openFilterBar(page) {
  const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
  if (!isMobile) return;
  const bar = page.locator(".user-filter-bar");
  const isOpen = await bar.getAttribute("data-filter-open");
  if (isOpen === "false") {
    await page.locator("[data-user-filter-toggle]").click();
    await page.waitForTimeout(200);
  }
}

// helper: เลือก option ใน custom-select (ผ่าน UI จริง: เปิด trigger → กด option)
async function pickCustomOption(page, inputId, value) {
  await openFilterBar(page);
  await page
    .locator(`div[data-custom-select]:has(> #${inputId}) [data-custom-select-trigger]`)
    .click();
  await page.waitForTimeout(150);
  await page
    .locator(`div[data-custom-select]:has(> #${inputId}) [data-custom-select-option][data-value="${value}"]`)
    .click();
  await page.waitForTimeout(200);
}

// helper: คลิกแถว user เพื่อเปิด detail (คลิก primary cell หลบ row-menu/button)
async function openUserDetailByRowClick(page, userId) {
  await page.locator(`.user-row[data-user-card="${userId}"] .user-cell-primary`).click();
  await page.waitForTimeout(300);
}

// helper: เปิด row menu ของ user
async function openUserRowMenu(page, userId) {
  await page.locator(`.user-row[data-user-card="${userId}"] .row-menu > summary`).click();
  await page.waitForTimeout(200);
}

// helper: เปิด row menu ของ report
async function openReportRowMenu(page, reportId) {
  await page.locator(`.user-row.report-row[data-report-id="${reportId}"] .row-menu > summary`).click();
  await page.waitForTimeout(200);
}

// helper: ปิด row menu ที่ค้าง (คลิกพื้นที่ว่าง)
async function closeRowMenus(page) {
  await page.locator("body").click({ position: { x: 5, y: 5 } });
  await page.waitForTimeout(150);
}

// helper: กดปุ่มรีเซ็ตค่าทั้งหมด (desktop: #user-reset ใน filter bar, mobile: [data-user-reset] ใน panel actions)
async function clickResetAll(page) {
  const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
  if (isMobile) await page.locator("[data-user-reset]").click();
  else await page.locator("#user-reset").click();
}

test.describe("QA-BO-002: User Management (strict)", () => {

  // ==================== A. NAVIGATION / MENU / ACTIVE STATE ====================

  test.describe("Navigation — menu entry, submenu, active state", () => {
    test("1. User Management menu กาง submenu ได้ มี User Accounts + Reported Users", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await ensureNavOpen(page);
      await page.locator(".nav-item[data-module='users']").click();
      await page.waitForTimeout(200);
      const submenu = page.locator(".submenu[data-submenu='users']");
      await expect(submenu).toHaveClass(/open/);
      await expect(submenu.locator("button[data-sub='User Accounts']")).toBeVisible();
      await expect(submenu.locator("button[data-sub='Reported Users']")).toBeVisible();
    });

    test("2. เข้า User Accounts: page title + breadcrumb + panel title ถูกต้อง", async ({ page }) => {
      await goToUserAccounts(page);
      await expect(page.locator("#page-title")).toHaveText("User Accounts");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / User Management / User Accounts");
      await expect(page.locator("#panel-title")).toHaveText("User List");
      await expect(page.locator("body")).toHaveClass(/user-list-mode/);
      await expect(page.locator("body")).toHaveClass(/user-accounts-mode/);
    });

    test("3. เข้า Reported Users: page title + breadcrumb + panel title ถูกต้อง", async ({ page }) => {
      await goToReportedUsers(page);
      await expect(page.locator("#page-title")).toHaveText("Reported Users");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / User Management / Reported Users");
      await expect(page.locator("#panel-title")).toHaveText("Reported Users List");
      await expect(page.locator("body")).toHaveClass(/user-list-mode/);
      await expect(page.locator("body")).not.toHaveClass(/user-accounts-mode/);
    });

    test("4. active state ของ submenu สลับถูกต้องเมื่อสลับหน้า", async ({ page }) => {
      await goToUserAccounts(page);
      const userAccountsBtn = page.locator(".submenu[data-submenu='users'] button[data-sub='User Accounts']");
      const reportedBtn = page.locator(".submenu[data-submenu='users'] button[data-sub='Reported Users']");
      await expect(userAccountsBtn).toHaveClass(/active/);
      await expect(page.locator(".nav-item[data-module='users']")).toHaveClass(/active/);
      await ensureNavOpen(page);
      await reportedBtn.click();
      await page.waitForTimeout(300);
      await expect(reportedBtn).toHaveClass(/active/);
      await expect(userAccountsBtn).not.toHaveClass(/active/);
    });
  });

  // ==================== B. USER LIST — RENDERING ====================

  test.describe("User List — rendering", () => {
    test("5. KPI summary 4 ใบ มี label/value ถูกต้อง", async ({ page }) => {
      await goToUserAccounts(page);
      const stats = page.locator("#summary-grid .stat");
      await expect(stats).toHaveCount(4);
      await expect(stats.nth(0).locator(".stat-label")).toHaveText("Active Users");
      await expect(stats.nth(0).locator(".stat-value")).toHaveText("5");
      await expect(stats.nth(1).locator(".stat-label")).toHaveText("Suspended");
      await expect(stats.nth(1).locator(".stat-value")).toHaveText("2");
      await expect(stats.nth(2).locator(".stat-label")).toHaveText("Deletion Requested");
      await expect(stats.nth(2).locator(".stat-value")).toHaveText("1");
      await expect(stats.nth(3).locator(".stat-label")).toHaveText("Reported");
      await expect(stats.nth(3).locator(".stat-value")).toHaveText("5");
    });

    test("6. KPI note แสดงจำนวน report รวมถูกต้อง (Suspended 11, Reported 26)", async ({ page }) => {
      await goToUserAccounts(page);
      await expect(page.locator("#summary-grid .stat").nth(1)).toContainText("11 รายงานทั้งหมด");
      await expect(page.locator("#summary-grid .stat").nth(3)).toContainText("26 รายงานทั้งหมด");
    });

    test("7. ตาราง head มี 8 คอลัมน์ครบ", async ({ page }) => {
      test.skip(page.viewportSize().width <= 760, "desktop only — mobile ใช้ card layout ไม่แสดง head");
      await goToUserAccounts(page);
      const head = page.locator(".user-row.head");
      await expect(head).toBeVisible();
      for (const label of ["User ID", "User", "Status", "Last Active", "Assets", "Auth", "Date Joined", "Action"]) {
        await expect(head.locator(`div:text-is("${label}")`)).toBeVisible();
      }
    });

    test("8. หน้า 1 แสดง 10 แถว + footer range ถูกต้อง", async ({ page }) => {
      await goToUserAccounts(page);
      await expect(page.locator(".user-row:not(.head)")).toHaveCount(10);
      await expect(page.locator(".footer-range > span:first-child").first()).toHaveText("แสดง 1-10 จาก 12");
    });

    test("9. แถวแรก (sort lastActive default) คือ U-1017", async ({ page }) => {
      await goToUserAccounts(page);
      await expect(page.locator(".user-row:not(.head)").first()).toHaveAttribute("data-user-card", "U-1017");
    });
  });

  // ==================== C. SEARCH ====================

  test.describe("User List — search", () => {
    test("10. ค้นหาด้วย User ID 'U-1002' เจอ 1 แถว", async ({ page }) => {
      await goToUserAccounts(page);
      await page.locator("#user-search").fill("U-1002");
      await page.waitForTimeout(200);
      await expect(page.locator(".user-row:not(.head)")).toHaveCount(1);
      await expect(page.locator(".user-row[data-user-card='U-1002']")).toBeVisible();
    });

    test("11. ค้นหาด้วยชื่อ 'Crown Time' เจอ U-1017", async ({ page }) => {
      await goToUserAccounts(page);
      await page.locator("#user-search").fill("Crown Time");
      await page.waitForTimeout(200);
      await expect(page.locator(".user-row:not(.head)")).toHaveCount(1);
      await expect(page.locator(".user-row[data-user-card='U-1017']")).toBeVisible();
    });

    test("12. ค้นหาด้วย email domain 'watchmail' เจอ U-1144", async ({ page }) => {
      await goToUserAccounts(page);
      await page.locator("#user-search").fill("watchmail");
      await page.waitForTimeout(200);
      await expect(page.locator(".user-row:not(.head)")).toHaveCount(1);
      await expect(page.locator(".user-row[data-user-card='U-1144']")).toBeVisible();
    });

    test("13. ค้นหาไม่เจอ → empty state 'ไม่พบข้อมูล' + footer 0 รายการ", async ({ page }) => {
      await goToUserAccounts(page);
      await page.locator("#user-search").fill("zzz-not-exist");
      await page.waitForTimeout(200);
      await expect(page.locator(".detail-empty.user-empty")).toHaveText("ไม่พบข้อมูล");
      await expect(page.locator(".footer-range > span:first-child")).toHaveText("แสดง 0 จาก 0");
    });

    test("14. พิมพ์ค้นหา reset หน้ากลับเป็น 1 (จาก page 2)", async ({ page }) => {
      await goToUserAccounts(page);
      await page.locator(".pager-next").click();
      await page.waitForTimeout(200);
      await expect(page.locator(".user-row:not(.head)")).toHaveCount(2);
      await page.locator("#user-search").fill("U-10");
      await page.waitForTimeout(200);
      await expect(page.locator(".footer-range > span:first-child")).toHaveText("แสดง 1-5 จาก 5");
      await expect(page.locator(".user-row:not(.head)")).toHaveCount(5);
    });
  });

  // ==================== D. FILTERS (ทุก option) ====================

  test.describe("User List — filters (ทุก option)", () => {
    test("15. filter status Active → 5 แถว ทุกแถว pill green 'ใช้งานได้'", async ({ page }) => {
      await goToUserAccounts(page);
      await pickCustomOption(page, "user-status-filter", "Active");
      const rows = page.locator(".user-row:not(.head)");
      await expect(rows).toHaveCount(5);
      for (let i = 0; i < 5; i++) {
        await expect(rows.nth(i).locator("div[data-label='Status'] .pill")).toHaveClass(/green/);
        await expect(rows.nth(i).locator("div[data-label='Status'] .pill")).toHaveText("ใช้งานได้");
      }
    });

    test("16. filter Suspended → 2 แถว (U-1002, U-1186) pill amber", async ({ page }) => {
      await goToUserAccounts(page);
      await pickCustomOption(page, "user-status-filter", "Suspended");
      const rows = page.locator(".user-row:not(.head)");
      await expect(rows).toHaveCount(2);
      await expect(page.locator(".user-row[data-user-card='U-1002']")).toBeVisible();
      await expect(page.locator(".user-row[data-user-card='U-1186']")).toBeVisible();
      await expect(rows.first().locator("div[data-label='Status'] .pill")).toHaveClass(/amber/);
    });

    test("17. filter Banned / Pending Verification / Deletion Requested / Deleted นับถูกต้อง", async ({ page }) => {
      await goToUserAccounts(page);
      const cases = [
        ["Banned", "U-1120", 1],
        ["Pending Verification", "U-1055", 2],
        ["Deletion Requested", "U-1104", 1],
        ["Deleted", "U-1222", 1]
      ];
      for (const [value, expectedId, count] of cases) {
        await pickCustomOption(page, "user-status-filter", value);
        await expect(page.locator(".user-row:not(.head)")).toHaveCount(count);
        await expect(page.locator(`.user-row[data-user-card='${expectedId}']`)).toBeVisible();
        await pickCustomOption(page, "user-status-filter", "");
      }
    });

    test("18. filter auth Email → 8 แถว, Google → 2, Apple → 2", async ({ page }) => {
      await goToUserAccounts(page);
      await pickCustomOption(page, "user-auth-filter", "Email");
      await expect(page.locator(".user-row:not(.head)")).toHaveCount(8);
      await pickCustomOption(page, "user-auth-filter", "Google");
      await expect(page.locator(".user-row:not(.head)")).toHaveCount(2);
      await expect(page.locator(".user-row[data-user-card='U-1002']")).toBeVisible();
      await pickCustomOption(page, "user-auth-filter", "Apple");
      await expect(page.locator(".user-row:not(.head)")).toHaveCount(2);
      await expect(page.locator(".user-row[data-user-card='U-1120']")).toBeVisible();
    });

    test("19. filter รวม Active + Email → 3 แถว", async ({ page }) => {
      await goToUserAccounts(page);
      await pickCustomOption(page, "user-status-filter", "Active");
      await pickCustomOption(page, "user-auth-filter", "Email");
      const rows = page.locator(".user-row:not(.head)");
      await expect(rows).toHaveCount(3);
      await expect(page.locator(".user-row[data-user-card='U-1017']")).toBeVisible();
      await expect(page.locator(".user-row[data-user-card='U-1144']")).toBeVisible();
    });
  });

  // ==================== E. SORT ====================

  test.describe("User List — sort", () => {
    test("20. sort 'joined' → แถวแรกคือสมัครล่าสุด U-1055", async ({ page }) => {
      await goToUserAccounts(page);
      await pickCustomOption(page, "user-sort", "joined");
      await expect(page.locator(".user-row:not(.head)").first()).toHaveAttribute("data-user-card", "U-1055");
    });

    test("21. sort 'reports' → แถวแรก U-1120 (8 reports)", async ({ page }) => {
      await goToUserAccounts(page);
      await pickCustomOption(page, "user-sort", "reports");
      await expect(page.locator(".user-row:not(.head)").first()).toHaveAttribute("data-user-card", "U-1120");
    });

    test("22. sort 'assets' → แถวแรก U-1017 (18 assets)", async ({ page }) => {
      await goToUserAccounts(page);
      await pickCustomOption(page, "user-sort", "assets");
      await expect(page.locator(".user-row:not(.head)").first()).toHaveAttribute("data-user-card", "U-1017");
    });

    test("23. sort กลับเป็น lastActive → แถวแรก U-1017", async ({ page }) => {
      await goToUserAccounts(page);
      await pickCustomOption(page, "user-sort", "assets");
      await pickCustomOption(page, "user-sort", "lastActive");
      await expect(page.locator(".user-row:not(.head)").first()).toHaveAttribute("data-user-card", "U-1017");
    });
  });

  // ==================== F. RESET ====================

  test.describe("User List — reset", () => {
    test("24. รีเซ็ตเคลียร์ search + filter + sort กลับค่า default", async ({ page }) => {
      await goToUserAccounts(page);
      await page.locator("#user-search").fill("U-10");
      await pickCustomOption(page, "user-status-filter", "Active");
      await pickCustomOption(page, "user-auth-filter", "Email");
      await pickCustomOption(page, "user-sort", "reports");
      await expect(page.locator(".user-row:not(.head)")).toHaveCount(2);
      await clickResetAll(page);
      await page.waitForTimeout(300);
      await expect(page.locator("#user-search")).toHaveValue("");
      await expect(page.locator("#user-status-filter")).toHaveValue("");
      await expect(page.locator("#user-auth-filter")).toHaveValue("");
      await expect(page.locator("#user-sort")).toHaveValue("lastActive");
      await expect(page.locator(".user-row:not(.head)")).toHaveCount(10);
      await expect(page.locator(".footer-range > span:first-child")).toHaveText("แสดง 1-10 จาก 12");
    });
  });

  // ==================== G. PAGINATION ====================

  test.describe("User List — pagination", () => {
    test("25. ไปหน้า 2 ได้ แสดง 11-12 จาก 12 + ปุ่ม active ถูกต้อง", async ({ page }) => {
      test.skip(page.viewportSize().width <= 760, "desktop only — mobile ซ่อนเลขหน้า ใช้ prev/next");
      await goToUserAccounts(page);
      await page.locator("[data-user-page='2']").click();
      await page.waitForTimeout(200);
      await expect(page.locator(".footer-range > span:first-child")).toHaveText("แสดง 11-12 จาก 12");
      await expect(page.locator(".user-row:not(.head)")).toHaveCount(2);
      await expect(page.locator(".pager-num.active")).toHaveText("2");
      await expect(page.locator(".pager-num.active")).toHaveAttribute("aria-current", "page");
    });

    test("26. prev/next disabled ตามหน้าปัจจุบัน", async ({ page }) => {
      await goToUserAccounts(page);
      await expect(page.locator(".pager-prev")).toBeDisabled();
      await expect(page.locator(".pager-next")).toBeEnabled();
      await page.locator(".pager-next").click();
      await page.waitForTimeout(200);
      await expect(page.locator(".pager-prev")).toBeEnabled();
      await expect(page.locator(".pager-next")).toBeDisabled();
      await expect(page.locator(".footer-range > span:first-child")).toHaveText("แสดง 11-12 จาก 12");
      await page.locator(".pager-prev").click();
      await page.waitForTimeout(200);
      await expect(page.locator(".footer-range > span:first-child")).toHaveText("แสดง 1-10 จาก 12");
    });
  });

  // ==================== H. ROW CLICK + ROW MENU ====================

  test.describe("User List — row click & row menu", () => {
    test("27. คลิกแถว U-1017 เปิด User Detail ของ U-1017", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetailByRowClick(page, "U-1017");
      await expect(page.locator("#page-title")).toHaveText("User Detail");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / User Management / User Detail / U-1017");
      await expect(page.locator("#panel-title")).toHaveText("Crown Time BKK");
    });

    test("28. row menu มีปุ่ม 'ดูรายละเอียด' + actions ตามสถานะ (U-1017: reset/suspend/ban)", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserRowMenu(page, "U-1017");
      const menu = page.locator(".user-row[data-user-card='U-1017'] .row-menu-list");
      await expect(menu.locator("button[data-user-open='U-1017']")).toHaveText("ดูรายละเอียด");
      await expect(menu.locator("button[data-user-action='Reset password']")).toHaveText("Reset password");
      await expect(menu.locator("button[data-user-action='Suspend']")).toHaveText("ระงับบัญชีชั่วคราว");
      await expect(menu.locator("button[data-user-action='Ban']")).toHaveText("ระงับบัญชีถาวร");
    });

    test("29. row menu 'ดูรายละเอียด' เปิด entity ถูกต้อง", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserRowMenu(page, "U-1002");
      await page.locator(".user-row[data-user-card='U-1002'] button[data-user-open='U-1002']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / User Management / User Detail / U-1002");
    });

    test("30. row menu actions ต่างสถานะต่างชุด: Suspended→Restore, Banned→Unban, Deletion Requested→Open deletion", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserRowMenu(page, "U-1002");
      await expect(page.locator(".user-row[data-user-card='U-1002'] button[data-user-action='Restore']")).toBeVisible();
      await closeRowMenus(page);
      await openUserRowMenu(page, "U-1120");
      await expect(page.locator(".user-row[data-user-card='U-1120'] button[data-user-action='Unban user']")).toBeVisible();
      await closeRowMenus(page);
      await openUserRowMenu(page, "U-1104");
      await expect(page.locator(".user-row[data-user-card='U-1104'] button[data-user-action='Open Account Deletion']")).toBeVisible();
    });
  });

  // ==================== I. STATUS BADGE SEMANTICS ====================

  test.describe("User List — status badge semantics", () => {
    test("31. status pill ครบ 6 สถานะ ใช้ class สีถูกต้อง (green/blue/amber/red/purple/gray)", async ({ page }) => {
      await goToUserAccounts(page);
      const cases = [
        ["Active", "green", "ใช้งานได้"],
        ["Pending Verification", "blue", "รอยืนยันตัวตน"],
        ["Suspended", "amber", "ระงับชั่วคราว"],
        ["Banned", "red", "ระงับบัญชีถาวร"],
        ["Deletion Requested", "purple", "รอลบบัญชี"],
        ["Deleted", "gray", "ลบแล้ว"]
      ];
      for (const [value, color, label] of cases) {
        await pickCustomOption(page, "user-status-filter", value);
        const pill = page.locator(".user-row:not(.head) div[data-label='Status'] .pill").first();
        await expect(pill).toHaveClass(new RegExp(color));
        await expect(pill).toHaveText(label);
      }
    });

    test("32. auth pill: Email=blue, Google=green, Apple=purple", async ({ page }) => {
      await goToUserAccounts(page);
      const emailPill = page.locator(".user-row[data-user-card='U-1017'] div[data-label='Auth'] .pill");
      await expect(emailPill).toHaveClass(/blue/);
      await expect(emailPill).toHaveText("Email");
      const googlePill = page.locator(".user-row[data-user-card='U-1002'] div[data-label='Auth'] .pill");
      await expect(googlePill).toHaveClass(/green/);
      await expect(googlePill).toHaveText("Google");
      const applePill = page.locator(".user-row[data-user-card='U-1042'] div[data-label='Auth'] .pill");
      await expect(applePill).toHaveClass(/purple/);
      await expect(applePill).toHaveText("Apple");
    });
  });

  // ==================== J. MOBILE CARD (≤760px) ====================

  test.describe("User List — mobile card (≤760px)", () => {
    test("33. mobile 390px: การ์ดแสดง User ID เป็น title + ซ่อนชื่อ desktop", async ({ page }) => {
      test.skip(page.viewportSize().width > 760, "mobile only");
      await goToUserAccounts(page);
      const row = page.locator(".user-row[data-user-card='U-1017']");
      await expect(row.locator(".mobile-user-card-title")).toBeVisible();
      await expect(row.locator(".mobile-user-card-title")).toHaveText("U-1017");
      await expect(row.locator(".desktop-user-name")).toBeHidden();
    });

    test("34. mobile 390px: card แสดง metadata ครบ (status pill + assets + user/joined/last active)", async ({ page }) => {
      test.skip(page.viewportSize().width > 760, "mobile only");
      await goToUserAccounts(page);
      const row = page.locator(".user-row[data-user-card='U-1017']");
      await expect(row.locator(".user-card-tags")).toBeVisible();
      await expect(row.locator(".user-card-tags .pill").first()).toContainText("ใช้งานได้");
      await expect(row.locator(".user-card-tag.asset-tag")).toContainText("18 assets");
      const meta = row.locator(".user-card-meta");
      await expect(meta).toBeVisible();
      await expect(meta.locator(".user-card-meta-item").nth(0)).toContainText("Crown Time BKK");
      await expect(meta.locator(".user-card-meta-item").nth(1)).toContainText("29 Jun 2026");
      await expect(meta.locator(".user-card-meta-item").nth(2)).toContainText("10 Jul 2026 20:44");
    });

    test("35. desktop 1280px: ตารางปกติ ไม่แสดง mobile card title/meta", async ({ page }) => {
      test.skip(page.viewportSize().width <= 760, "desktop only");
      await goToUserAccounts(page);
      const row = page.locator(".user-row[data-user-card='U-1017']");
      await expect(row.locator(".desktop-user-name")).toBeVisible();
      await expect(row.locator(".mobile-user-card-title")).toBeHidden();
      await expect(row.locator(".user-card-tags")).toBeHidden();
      await expect(row.locator("div[data-label='Status']")).toBeVisible();
    });
  });

  // ==================== K. USER DETAIL ====================

  test.describe("User Detail — sections, history, actions, back", () => {
    test("36. เปิด detail U-1017: head + chips + breadcrumb + back button ถูกต้อง", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetailByRowClick(page, "U-1017");
      await expect(page.locator(".user-detail-page .user-detail-heading")).toContainText("U-1017");
      await expect(page.locator(".user-detail-page .user-display-name")).toHaveText("Crown Time BKK");
      await expect(page.locator(".user-detail-page .chips .pill").first()).toHaveClass(/green/);
      await expect(page.locator(".user-detail-page .chips .pill.blue")).toHaveText("Email");
      await expect(page.locator("[data-back-user-list]")).toBeVisible();
      await expect(page.locator("#panel-title")).toHaveText("Crown Time BKK");
      await expect(page.locator("#panel-subtitle")).toContainText("U-1017");
    });

    test("37. User Detail มีครบทุก section: Account Summary / Contact Auth / Assets Summary / Reports / Account Status History", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetailByRowClick(page, "U-1017");
      const texts = await page.locator(".user-detail-page .detail-section > h4").allTextContents();
      expect(texts).toContain("Account Summary");
      expect(texts).toContain("Contact / Auth");
      expect(texts).toContain("Assets Summary");
      expect(texts).toContain("Reports");
      expect(texts).toContain("Account Status History");
    });

    test("38. Account Summary แสดง User ID / Date Joined / Last Active ถูกต้อง", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetailByRowClick(page, "U-1017");
      const section = page.locator(".user-detail-page .detail-section").filter({ hasText: "Account Summary" }).first();
      await expect(section.locator(".detail-tile").filter({ hasText: "User ID" })).toContainText("U-1017");
      await expect(section.locator(".detail-tile").filter({ hasText: "Date Joined" })).toContainText("29 Jun 2026");
      await expect(section.locator(".detail-tile").filter({ hasText: "Last Active" })).toContainText("10 Jul 2026 20:44");
    });

    test("39. Account Status History table: 6 คอลัมน์ + มีข้อมูลแถว", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetailByRowClick(page, "U-1002");
      const table = page.locator(".user-account-history-table");
      await expect(table).toBeVisible();
      if (page.viewportSize().width > 760) {
        for (const th of ["Date / Time", "Actor", "Action", "Status", "Reference", "Note"]) {
          await expect(table.locator("thead th").filter({ hasText: th })).toBeVisible();
        }
      }
      const rowCount = await table.locator("tbody tr").count();
      expect(rowCount).toBeGreaterThan(0);
    });

    test("40. action area ของ U-1017 มี 3 ปุ่ม คลาสถูกต้อง (primary/warning/danger)", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetailByRowClick(page, "U-1017");
      const actions = page.locator(".user-detail-page .user-detail-actions");
      await expect(actions.locator("button[data-user-action='Reset password']")).toHaveClass(/primary/);
      await expect(actions.locator("button[data-user-action='Suspend']")).toHaveClass(/warning/);
      await expect(actions.locator("button[data-user-action='Ban']")).toHaveClass(/danger/);
      await expect(actions.locator("button")).toHaveCount(3);
    });

    test("41. action area ของบัญชี Banned (U-1120) มีปุ่มเดียว Unban user", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetailByRowClick(page, "U-1120");
      const actions = page.locator(".user-detail-page .user-detail-actions");
      await expect(actions.locator("button[data-user-action='Unban user']")).toBeVisible();
      await expect(actions.locator("button")).toHaveCount(1);
    });

    test("42. action area ของบัญชี Deletion Requested (U-1104) มีปุ่มเปิดคำขอลบบัญชี", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetailByRowClick(page, "U-1104");
      await expect(page.locator(".user-detail-page button[data-user-action='Open Account Deletion']")).toBeVisible();
    });

    test("43. back จาก User Detail กลับ User Accounts และ context (search+filter) ยังอยู่", async ({ page }) => {
      await goToUserAccounts(page);
      await page.locator("#user-search").fill("U-10");
      await pickCustomOption(page, "user-status-filter", "Active");
      await expect(page.locator(".user-row:not(.head)")).toHaveCount(3);
      await page.locator(".user-row[data-user-card='U-1042'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("User Detail");
      await page.locator("[data-back-user-list]").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("User Accounts");
      await expect(page.locator("#user-search")).toHaveValue("U-10");
      await expect(page.locator("#user-status-filter")).toHaveValue("Active");
      await expect(page.locator(".user-row:not(.head)")).toHaveCount(3);
    });
  });

  // ==================== L. USER ACTION MODAL + CONFIRM FLOW ====================

  test.describe("User action modal — confirm/reason/result", () => {
    test("44. เปิด modal ระงับบัญชีชั่วคราว: title/target/reason options/note/suspend-until/confirm ครบ", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetailByRowClick(page, "U-1017");
      await page.locator(".user-detail-page button[data-user-action='Suspend']").click();
      await page.waitForTimeout(300);
      const modal = page.locator("#user-action-modal");
      await expect(modal).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal-title")).toHaveText("ระงับบัญชีชั่วคราว");
      await expect(modal.locator(".user-action-target")).toContainText("Crown Time BKK");
      await expect(modal.locator(".user-action-target")).toContainText("U-1017");
      await expect(page.locator("#user-action-reason")).toHaveValue("มีรายงานความเสี่ยงสูง รอตรวจสอบ");
      await expect(page.locator("div[data-custom-select]:has(> #user-action-reason) [data-custom-select-option]")).toHaveCount(4);
      await expect(page.locator("#user-action-note")).toBeVisible();
      await expect(page.locator("#user-action-suspend-until")).toBeVisible();
      await expect(modal.locator("[data-user-action-confirm='Suspend']")).toBeVisible();
      await expect(modal.locator(".user-action-impact").first()).toContainText("ผลกระทบต่อผู้ใช้");
    });

    test("45. ยกเลิก modal → ปิดโดยไม่เปลี่ยนสถานะ", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetailByRowClick(page, "U-1017");
      await page.locator(".user-detail-page button[data-user-action='Suspend']").click();
      await page.waitForTimeout(200);
      await page.locator("#user-action-modal button[data-user-action-modal-close]").last().click();
      await page.waitForTimeout(200);
      await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
      await expect(page.locator(".user-detail-page .chips .pill").first()).toHaveClass(/green/);
    });

    test("46. ยืนยัน Suspend → สถานะเปลี่ยนเป็นระงับชั่วคราว + toast + history เพิ่มแถว", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetailByRowClick(page, "U-1017");
      const historyBefore = await page.locator(".user-account-history-table tbody tr").count();
      await page.locator(".user-detail-page button[data-user-action='Suspend']").click();
      await page.waitForTimeout(200);
      await page.locator("#user-action-modal [data-user-action-confirm='Suspend']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toHaveClass(/show/);
      await expect(page.locator("#success-toast")).toContainText("Crown Time BKK ถูกระงับบัญชีชั่วคราวแล้ว");
      await expect(page.locator(".user-detail-page .chips .pill").first()).toHaveClass(/amber/);
      await expect(page.locator(".user-detail-page .chips .pill").first()).toHaveText("ระงับชั่วคราว");
      const historyAfter = await page.locator(".user-account-history-table tbody tr").count();
      expect(historyAfter).toBe(historyBefore + 1);
      await expect(page.locator(".user-account-history-table tbody tr").first()).toContainText("ระงับบัญชีชั่วคราว");
    });

    test("47. Reset password → ส่งลิงก์สำเร็จ สถานะบัญชีไม่เปลี่ยน", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetailByRowClick(page, "U-1017");
      await page.locator(".user-detail-page button[data-user-action='Reset password']").click();
      await page.waitForTimeout(200);
      await expect(page.locator("#user-action-modal-title")).toHaveText("Reset Password Link");
      await page.locator("#user-action-modal [data-user-action-confirm='Reset password']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toContainText("ส่งลิงก์ตั้งรหัสผ่านใหม่");
      await expect(page.locator(".user-detail-page .chips .pill").first()).toHaveClass(/green/);
    });

    test("48. Unban บัญชี Banned → กลับเป็นใช้งานได้ + toast", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetailByRowClick(page, "U-1120");
      await expect(page.locator(".user-detail-page .chips .pill").first()).toHaveClass(/red/);
      await page.locator(".user-detail-page button[data-user-action='Unban user']").click();
      await page.waitForTimeout(200);
      await expect(page.locator("#user-action-modal-title")).toHaveText("ยกเลิกระงับบัญชีถาวร");
      await page.locator("#user-action-modal [data-user-action-confirm='Unban user']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toContainText("The Collector กลับมาใช้งานได้แล้ว");
      await expect(page.locator(".user-detail-page .chips .pill").first()).toHaveClass(/green/);
    });

    test("49. scenario invalid_state → modal แสดง error และสถานะไม่เปลี่ยน", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetailByRowClick(page, "U-1017");
      await page.locator(".user-detail-page button[data-user-action='Suspend']").click();
      await page.waitForTimeout(200);
      await page.evaluate(() => {
        const input = document.querySelector("#user-action-scenario");
        if (input) input.value = "invalid_state";
      });
      await page.locator("#user-action-modal [data-user-action-confirm='Suspend']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal .user-action-result")).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal .user-action-result")).toContainText("ไม่สามารถดำเนินการได้");
      await expect(page.locator(".user-detail-page .chips .pill").first()).toHaveClass(/green/);
    });

    test("50. Resend verification (บัญชี Pending) → toast ส่งข้อมูลแล้ว สถานะคงรอยืนยัน", async ({ page }) => {
      await goToUserAccounts(page);
      await page.locator("#user-search").fill("U-1055");
      await page.waitForTimeout(200);
      await openUserDetailByRowClick(page, "U-1055");
      await expect(page.locator(".user-detail-page .chips .pill").first()).toHaveClass(/blue/);
      await page.locator(".user-detail-page button[data-user-action='Resend verification context']").click();
      await page.waitForTimeout(200);
      await expect(page.locator("#user-action-modal-title")).toHaveText("ส่งข้อมูลยืนยันตัวตนอีกครั้ง");
      await page.locator("#user-action-modal [data-user-action-confirm='Resend verification context']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toContainText("ส่งข้อมูลยืนยันตัวตนให้ Vintage Vault BKK แล้ว");
      await expect(page.locator(".user-detail-page .chips .pill").first()).toHaveClass(/blue/);
    });
  });

  // ==================== M. REPORTED USERS QUEUE ====================

  test.describe("Reported Users — queue, filter, sort, search", () => {
    test("51. queue แสดง 8 รายงาน + panel title + ไม่มี KPI card", async ({ page }) => {
      await goToReportedUsers(page);
      await expect(page.locator("#page-title")).toHaveText("Reported Users");
      await expect(page.locator("#panel-title")).toHaveText("Reported Users List");
      await expect(page.locator("#summary-grid .stat")).toHaveCount(0);
      await expect(page.locator(".user-row.report-row:not(.head)")).toHaveCount(8);
      await expect(page.locator(".footer-range > span:first-child")).toHaveText("แสดง 1-8 จาก 8");
    });

    test("52. queue pill: Open/In Review = Pending (amber), Closed = Closed (green)", async ({ page }) => {
      await goToReportedUsers(page);
      const openRow = page.locator(".user-row.report-row[data-report-id='RPU-512']");
      await expect(openRow.locator("div[data-label='Status'] .pill")).toHaveClass(/amber/);
      await expect(openRow.locator("div[data-label='Status'] .pill")).toHaveText("Pending");
      const closedRow = page.locator(".user-row.report-row[data-report-id='RPU-588']");
      await expect(closedRow.locator("div[data-label='Status'] .pill")).toHaveClass(/green/);
      await expect(closedRow.locator("div[data-label='Status'] .pill")).toHaveText("Closed");
    });

    test("53. filter สถานะรายงาน: Pending → 6, Closed → 2", async ({ page }) => {
      await goToReportedUsers(page);
      await pickCustomOption(page, "report-status-filter", "Pending");
      await expect(page.locator(".user-row.report-row:not(.head)")).toHaveCount(6);
      await pickCustomOption(page, "report-status-filter", "Closed");
      await expect(page.locator(".user-row.report-row:not(.head)")).toHaveCount(2);
    });

    test("54. filter priority: high → 6, low → 2, medium → ไม่พบข้อมูล", async ({ page }) => {
      await goToReportedUsers(page);
      await pickCustomOption(page, "report-priority-filter", "high");
      await expect(page.locator(".user-row.report-row:not(.head)")).toHaveCount(6);
      await pickCustomOption(page, "report-priority-filter", "low");
      await expect(page.locator(".user-row.report-row:not(.head)")).toHaveCount(2);
      await pickCustomOption(page, "report-priority-filter", "medium");
      await expect(page.locator(".detail-empty.user-empty")).toHaveText("ไม่พบข้อมูล");
    });

    test("55. sort ตามจำนวน reporters → RPU-560 (13) อยู่แถวแรก", async ({ page }) => {
      await goToReportedUsers(page);
      await pickCustomOption(page, "report-sort", "reporters");
      await expect(page.locator(".user-row.report-row:not(.head)").first()).toHaveAttribute("data-report-id", "RPU-560");
    });

    test("56. search Report ID 'RPU-505' เจอ 1 แถว + search ไม่เจอแสดง empty state", async ({ page }) => {
      await goToReportedUsers(page);
      await page.locator("#user-search").fill("RPU-505");
      await page.waitForTimeout(200);
      await expect(page.locator(".user-row.report-row:not(.head)")).toHaveCount(1);
      await page.locator("#user-search").fill("RPU-999");
      await page.waitForTimeout(200);
      await expect(page.locator(".detail-empty.user-empty")).toHaveText("ไม่พบข้อมูล");
      await expect(page.locator(".footer-range > span:first-child")).toHaveText("แสดง 0 จาก 0");
    });

    test("57. คลิกแถวรายงานเปิด Report Detail ถูกเคส + row menu ดูรายละเอียดได้", async ({ page }) => {
      await goToReportedUsers(page);
      await page.locator(".user-row.report-row[data-report-id='RPU-566'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Report Detail");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / User Management / Report Detail / RPU-566");
      await page.locator("[data-back-reported-users]").click();
      await page.waitForTimeout(300);
      await openReportRowMenu(page, "RPU-518");
      await page.locator(".user-row.report-row[data-report-id='RPU-518'] button[data-report-action='RPU-518']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / User Management / Report Detail / RPU-518");
    });
  });

  // ==================== N. REPORT DETAIL ====================

  test.describe("Report Detail — context, linked entities, audit", () => {
    test("58. Report Detail RPU-566: head + chips + breadcrumb + back button", async ({ page }) => {
      await goToReportedUsers(page);
      await page.locator(".user-row.report-row[data-report-id='RPU-566'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      await expect(page.locator(".report-user-detail-heading")).toContainText("RPU-566");
      await expect(page.locator(".report-user-detail-heading")).toContainText("Seiko Corner");
      await expect(page.locator(".report-detail-page .chips .pill").first()).toHaveText("Pending");
      await expect(page.locator(".report-detail-page .chips .pill.gray")).toHaveText("2 reporters");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / User Management / Report Detail / RPU-566");
      await expect(page.locator("#panel-title")).toHaveText("Seiko Corner");
      await expect(page.locator("#panel-subtitle")).toContainText("reporter identity masked");
      await expect(page.locator("[data-back-reported-users]")).toBeVisible();
    });

    test("59. section Reported User แสดง Report ID / User ID / User link / Account Status", async ({ page }) => {
      await goToReportedUsers(page);
      await page.locator(".user-row.report-row[data-report-id='RPU-566'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      const grid = page.locator(".report-detail-page .user-report-reference-grid");
      await expect(grid.locator(".detail-tile").filter({ hasText: "Report ID" })).toContainText("RPU-566");
      await expect(grid.locator(".detail-tile").filter({ hasText: "User ID" })).toContainText("U-1144");
      await expect(grid.locator(".detail-tile").filter({ hasText: "Account Status" })).toContainText("ใช้งานได้");
      await expect(grid.locator("button[data-user-open='U-1144']")).toHaveText("Seiko Corner");
    });

    test("60. linked user → คลิกเปิด User Detail ของ U-1144", async ({ page }) => {
      await goToReportedUsers(page);
      await page.locator(".user-row.report-row[data-report-id='RPU-566'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      await page.locator(".report-detail-page button[data-user-open='U-1144']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / User Management / User Detail / U-1144");
      await expect(page.locator("#panel-title")).toHaveText("Seiko Corner");
    });

    test("61. Reporter History + Admin Action History tables แสดงครบ", async ({ page }) => {
      await goToReportedUsers(page);
      await page.locator(".user-row.report-row[data-report-id='RPU-566'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      await expect(page.locator(".report-detail-page h4").filter({ hasText: "Reporter History" })).toBeVisible();
      await expect(page.locator(".report-detail-page h4").filter({ hasText: "Admin Action History" })).toBeVisible();
      const reporterTable = page.locator(".report-detail-page .history-table").first();
      if (page.viewportSize().width > 760) {
        await expect(reporterTable.locator("thead th").first()).toHaveText("วันที่ / เวลา");
        await expect(page.locator(".report-detail-page .history-table").nth(1).locator("thead th").filter({ hasText: "Action" })).toBeVisible();
      }
      await expect(reporterTable.locator("tbody tr")).toHaveCount(2);
    });

    test("62. back จาก Report Detail กลับ Reported Users ได้", async ({ page }) => {
      await goToReportedUsers(page);
      await page.locator(".user-row.report-row[data-report-id='RPU-566'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      await page.locator("[data-back-reported-users]").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Reported Users");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / User Management / Reported Users");
      await expect(page.locator(".user-row.report-row:not(.head)")).toHaveCount(8);
    });
  });

  // ==================== O. REPORT STATUS ACTION + CONFIRM MODAL ====================

  test.describe("Report Detail — status action, confirmation modal, result state", () => {
    test("63. RPU-566 มีปุ่มปิดรายงาน (primary) + action บัญชี Suspend/Ban", async ({ page }) => {
      await goToReportedUsers(page);
      await page.locator(".user-row.report-row[data-report-id='RPU-566'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      const actions = page.locator(".report-detail-page .user-detail-actions");
      await expect(actions.locator("button[data-report-status-action='Closed']")).toHaveClass(/primary/);
      await expect(actions.locator("button[data-user-action='Suspend']")).toHaveClass(/warning/);
      await expect(actions.locator("button[data-user-action='Ban']")).toHaveClass(/danger/);
    });

    test("64. ปิดรายงาน: modal ยืนยัน + เหตุผล + note + ยืนยัน → สถานะ Closed + toast + audit เพิ่ม", async ({ page }) => {
      await goToReportedUsers(page);
      await page.locator(".user-row.report-row[data-report-id='RPU-566'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      const auditBefore = await page.locator(".report-detail-page .history-table").nth(1).locator("tbody tr").count();
      await page.locator(".report-detail-page button[data-report-status-action='Closed']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#user-action-modal-title")).toHaveText("ยืนยันการปิดรายงาน");
      await expect(page.locator("#user-action-modal .user-action-target")).toContainText("Seiko Corner");
      await expect(page.locator("#user-action-modal .user-action-target")).toContainText("RPU-566");
      await expect(page.locator("#report-close-reason")).toHaveValue("ตรวจหลักฐานครบแล้ว ไม่พบประเด็นค้าง");
      await expect(page.locator("#report-close-note")).toBeVisible();
      await page.locator("#user-action-modal [data-report-status-confirm='Closed']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toContainText("RPU-566: ปิดรายงานแล้ว");
      await expect(page.locator(".report-detail-page .chips .pill").first()).toHaveClass(/green/);
      await expect(page.locator(".report-detail-page .chips .pill").first()).toHaveText("Closed");
      const auditAfter = await page.locator(".report-detail-page .history-table").nth(1).locator("tbody tr").count();
      expect(auditAfter).toBe(auditBefore + 1);
    });

    test("65. รายงาน Closed (RPU-588) ไม่มีปุ่ม action ใด ๆ", async ({ page }) => {
      await goToReportedUsers(page);
      await page.locator(".user-row.report-row[data-report-id='RPU-588'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      await expect(page.locator(".report-detail-page .user-detail-actions")).toHaveCount(0);
    });

    test("66. ปิดรายงานจาก Report Detail → กลับคิว แถวเปลี่ยนเป็น Closed", async ({ page }) => {
      await goToReportedUsers(page);
      await page.locator(".user-row.report-row[data-report-id='RPU-566'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      await page.locator(".report-detail-page button[data-report-status-action='Closed']").click();
      await page.waitForTimeout(300);
      await page.locator("#user-action-modal [data-report-status-confirm='Closed']").click();
      await page.waitForTimeout(400);
      await page.locator("[data-back-reported-users]").click();
      await page.waitForTimeout(300);
      const row = page.locator(".user-row.report-row[data-report-id='RPU-566']");
      await expect(row.locator("div[data-label='Status'] .pill")).toHaveClass(/green/);
      await expect(row.locator("div[data-label='Status'] .pill")).toHaveText("Closed");
    });
  });

  // ==================== P. ACCOUNT ACTION จาก REPORT CONTEXT ====================

  test.describe("Report Detail — account action from report context", () => {
    test("67. RPU-512 (Active user) มีปุ่มปิดรายงาน + Suspend + Ban", async ({ page }) => {
      await goToReportedUsers(page);
      await page.locator(".user-row.report-row[data-report-id='RPU-512'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      const actions = page.locator(".report-detail-page .user-detail-actions");
      await expect(actions.locator("button[data-report-status-action='Closed']")).toHaveText("ปิดรายงาน");
      await expect(actions.locator("button[data-user-action='Suspend']")).toBeVisible();
      await expect(actions.locator("button[data-user-action='Ban']")).toBeVisible();
    });

    test("68. Suspend จาก report context → สถานะบัญชีใน Report Detail เปลี่ยน + audit เพิ่ม + toast", async ({ page }) => {
      await goToReportedUsers(page);
      await page.locator(".user-row.report-row[data-report-id='RPU-512'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      const auditBefore = await page.locator(".report-detail-page .history-table").nth(1).locator("tbody tr").count();
      await page.locator(".report-detail-page button[data-user-action='Suspend']").click();
      await page.waitForTimeout(200);
      await expect(page.locator("#user-action-modal-title")).toHaveText("ระงับบัญชีชั่วคราว");
      await page.locator("#user-action-modal [data-user-action-confirm='Suspend']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toContainText("Crown Time BKK ถูกระงับบัญชีชั่วคราวแล้ว");
      await expect(page.locator(".report-detail-page .user-report-reference-grid .detail-tile").filter({ hasText: "Account Status" })).toContainText("ระงับชั่วคราว");
      const auditAfter = await page.locator(".report-detail-page .history-table").nth(1).locator("tbody tr").count();
      expect(auditAfter).toBe(auditBefore + 1);
    });

    test("69. Ban จาก report context → รายงานถูกปิดด้วย (queue pill เปลี่ยนเป็น Closed)", async ({ page }) => {
      await goToReportedUsers(page);
      await page.locator(".user-row.report-row[data-report-id='RPU-518'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      await page.locator(".report-detail-page button[data-user-action='Ban']").click();
      await page.waitForTimeout(200);
      await expect(page.locator("#user-action-modal-title")).toHaveText("ระงับบัญชีถาวร");
      await page.locator("#user-action-modal [data-user-action-confirm='Ban']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toContainText("Omega Club TH ถูกระงับบัญชีถาวรแล้ว");
      await expect(page.locator(".report-detail-page .chips .pill").first()).toHaveClass(/green/);
      await expect(page.locator(".report-detail-page .chips .pill").first()).toHaveText("Closed");
    });

    test("70. report ของบัญชี Suspended (RPU-505): ไม่มีปุ่มปิดรายงาน มีแต่ Restore/Ban", async ({ page }) => {
      await goToReportedUsers(page);
      await page.locator(".user-row.report-row[data-report-id='RPU-505'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      const actions = page.locator(".report-detail-page .user-detail-actions");
      await expect(actions.locator("button[data-report-status-action]")).toHaveCount(0);
      await expect(actions.locator("button[data-user-action='Restore']")).toBeVisible();
      await expect(actions.locator("button[data-user-action='Ban']")).toBeVisible();
    });
  });

  // ==================== Q. RESPONSIVE — REPORTED USERS MOBILE CARD ====================

  test.describe("Reported Users — mobile card (≤760px)", () => {
    test("71. mobile 390px: card รายงานแสดง metadata ครบ (user/reporters/reason)", async ({ page }) => {
      test.skip(page.viewportSize().width > 760, "mobile only");
      await goToReportedUsers(page);
      const row = page.locator(".user-row.report-row[data-report-id='RPU-566']");
      await expect(row.locator(".user-card-tags")).toBeVisible();
      await expect(row.locator(".user-card-tags .pill").first()).toContainText("Pending");
      await expect(row.locator(".user-card-tag.asset-tag")).toContainText("2 reporters");
      const meta = row.locator(".user-card-meta");
      await expect(meta).toBeVisible();
      await expect(meta.locator(".user-card-meta-item").nth(0)).toContainText("Seiko Corner");
      await expect(row.locator(".report-reason-meta")).toContainText("Report reason");
    });

    test("72. desktop 1440px: ตารางรายงานแสดงคอลัมน์ครบ 10 คอลัมน์", async ({ page }) => {
      test.skip(page.viewportSize().width <= 760, "desktop only");
      await goToReportedUsers(page);
      const head = page.locator(".user-row.report-row.head");
      for (const label of ["Report ID", "User", "User Status", "Status", "Reported At", "Report Reason", "Reporters", "Priority", "Sources", "Action"]) {
        await expect(head.locator(`div:text-is("${label}")`)).toBeVisible();
      }
    });

    test("73. mobile 390px: filter toggle เปิด/ปิด filter bar ได้", async ({ page }) => {
      test.skip(page.viewportSize().width > 760, "mobile only");
      await goToUserAccounts(page);
      const bar = page.locator(".user-filter-bar");
      await expect(bar).toHaveAttribute("data-filter-open", "false");
      await page.locator("[data-user-filter-toggle]").click();
      await page.waitForTimeout(200);
      await expect(bar).toHaveAttribute("data-filter-open", "true");
      await expect(page.locator("#user-status-filter").locator("xpath=ancestor::div[@data-custom-select]")).toBeVisible();
      await page.locator("[data-user-filter-toggle]").click();
      await page.waitForTimeout(200);
      await expect(bar).toHaveAttribute("data-filter-open", "false");
    });
  });
});
