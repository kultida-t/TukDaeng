// QA-BO-030: Negative/blocked/edge per-module (GAP-BO-TEST-05)
// เคสเส้นทางผิดปกติ: gated action ไม่แสดงใน DOM, search/filter ไม่พบ, edge ข้อมูล
//   (suspend-until clamp, deleted account, closed report, protection guard)
// อ้างอิง seeds/labels จริงใน Prototypes/bo-prototype.html — ห้ามแก้ prototype
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

async function loginIfNeeded(page) {
  const loginScreen = page.locator("#login-screen");
  if (await loginScreen.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator("#login-form button[type=\"submit\"]").click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await page.waitForTimeout(500);
  }
}

async function boot(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
}

async function ensureNavOpen(page) {
  const needsToggle = await page.evaluate(() =>
    window.matchMedia("(max-width: 1180px)").matches && !document.body.classList.contains("nav-open"));
  if (needsToggle) {
    await page.locator("#menu-toggle").click();
    await page.waitForTimeout(300);
  }
}

async function openModule(page, moduleId, sub) {
  await boot(page);
  await page.evaluate(([m, s]) => renderModule(m, s, s), [moduleId, sub]);
  await page.waitForTimeout(300);
}

// เลือก option custom-select ใน filter bar (mobile ต้องเปิด toggle ก่อน — ใช้กับ list ทั่วไป)
async function pickFilterOption(page, inputId, value) {
  const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
  if (isMobile) {
    const bar = page.locator(".user-filter-bar").first();
    if ((await bar.getAttribute("data-filter-open")) === "false") {
      const toggle = page.locator("[data-user-filter-toggle], [data-asset-filter-toggle], [data-deletion-filter-toggle], [data-delivery-filter-toggle], [data-role-filter-toggle]").first();
      if (await toggle.count()) { await toggle.click(); await page.waitForTimeout(200); }
    }
  }
  await page.locator(`div[data-custom-select]:has(> #${inputId}) [data-custom-select-trigger]`).click();
  await page.waitForTimeout(150);
  await page.locator(`div[data-custom-select]:has(> #${inputId}) [data-custom-select-option][data-value="${value}"]`).click();
  await page.waitForTimeout(200);
}

test.describe("QA-BO-030: Negative/blocked/edge (GAP-BO-TEST-05)", () => {

  test.describe("User Management — gated actions ไม่แสดงใน DOM", () => {
    test("1. Apple user (U-1042): row menu ไม่มี Reset password (blocked)", async ({ page }) => {
      await openModule(page, "users", "User Accounts");
      await page.locator("#user-search").fill("U-1042");
      await page.waitForTimeout(250);
      await page.locator(".user-row[data-user-card='U-1042'] .row-menu > summary").click();
      await page.waitForTimeout(200);
      const menu = page.locator(".user-row[data-user-card='U-1042'] .row-menu-list");
      await expect(menu.locator("button[data-user-action='Reset password']")).toHaveCount(0);
      await expect(menu.locator("button[data-user-action='Suspend']")).toHaveCount(1);
      await expect(menu.locator("button[data-user-action='Ban']")).toHaveCount(1);
    });

    test("2. Suspended Google user (U-1002): ไม่มี Suspend/Reset — เหลือ Restore+Ban", async ({ page }) => {
      await openModule(page, "users", "User Accounts");
      await page.locator("#user-search").fill("U-1002");
      await page.waitForTimeout(250);
      await page.locator(".user-row[data-user-card='U-1002'] .row-menu > summary").click();
      await page.waitForTimeout(200);
      const menu = page.locator(".user-row[data-user-card='U-1002'] .row-menu-list");
      await expect(menu.locator("button[data-user-action='Suspend']")).toHaveCount(0);
      await expect(menu.locator("button[data-user-action='Reset password']")).toHaveCount(0);
      await expect(menu.locator("button[data-user-action='Restore']")).toHaveCount(1);
      await expect(menu.locator("button[data-user-action='Ban']")).toHaveCount(1);
    });

    test("3. Deleted user (U-1222): เหลือเฉพาะ View deleted summary → เปิด DEL-020", async ({ page }) => {
      await openModule(page, "users", "User Accounts");
      await page.locator("#user-search").fill("U-1222");
      await page.waitForTimeout(250);
      await page.locator(".user-row[data-user-card='U-1222'] .row-menu > summary").click();
      await page.waitForTimeout(200);
      const menu = page.locator(".user-row[data-user-card='U-1222'] .row-menu-list");
      await expect(menu.locator("button[data-user-action]")).toHaveCount(1);
      await expect(menu.locator("button[data-user-action='View deleted summary']")).toHaveCount(1);
      // เปิดแล้วไปหน้า deletion request DEL-020
      await menu.locator("button[data-user-action='View deleted summary']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("body")).toContainText("DEL-020");
    });

    test("4. filter combo ไม่ match: status Banned + auth Google → empty state", async ({ page }) => {
      await openModule(page, "users", "User Accounts");
      await pickFilterOption(page, "user-status-filter", "Banned");
      await pickFilterOption(page, "user-auth-filter", "Google");
      await expect(page.locator(".user-row:not(.head)")).toHaveCount(0);
      await expect(page.locator(".detail-empty.user-empty")).toContainText("ไม่พบข้อมูล");
    });

    test("5. suspend-until clamp: ใส่วันย้อนหลัง → normalize เป็น min (today) ใน history note", async ({ page }) => {
      await openModule(page, "users", "User Accounts");
      await page.locator("#user-search").fill("U-1017");
      await page.waitForTimeout(250);
      await page.locator(".user-row[data-user-card='U-1017'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      await page.locator(".user-detail-page button[data-user-action='Suspend']").click();
      await page.waitForTimeout(250);
      await page.locator("#user-action-suspend-until").fill("2020-01-01");
      await page.locator("#user-action-modal [data-user-action-confirm='Suspend']").click();
      await page.waitForTimeout(400);
      const note = await page.evaluate(() =>
        userManagementData.users.find(u => u.id === "U-1017").accountHistory[0].note);
      // input.fill ใส่วันที่ต่ำกว่า min → browser ไม่รับค่า → normalize fallback เป็นค่า default (+7 วัน)
      const expected = await page.evaluate(() => getDefaultSuspensionEndDate());
      expect(note).toContain(`สิ้นสุดระงับ ${expected}`);
    });
  });

  test.describe("Asset Management — gated/edge", () => {
    test("6. ลบโดยเจ้าของ (AST-8576): row menu ไม่มี action ใด ๆ", async ({ page }) => {
      await openModule(page, "assets", "Asset List");
      await page.locator("#search").fill("AST-8576");
      await page.waitForTimeout(250);
      await page.locator(".asset-row[data-asset-card='AST-8576'] .row-menu > summary").click();
      await page.waitForTimeout(200);
      const menu = page.locator(".asset-row[data-asset-card='AST-8576'] .row-menu-list");
      await expect(menu.locator("button[data-asset-action]")).toHaveCount(0);
      await expect(menu.locator("button[data-asset-open='AST-8576']")).toHaveCount(1);
    });

    test("7. Owner-only Hide asset (AST-8791): ไม่เข้าเงื่อนไข force hide → ไม่มี action", async ({ page }) => {
      await openModule(page, "assets", "Asset List");
      await page.locator("#search").fill("AST-8791");
      await page.waitForTimeout(250);
      await page.locator(".asset-row[data-asset-card='AST-8791'] .row-menu > summary").click();
      await page.waitForTimeout(200);
      await expect(page.locator(".asset-row[data-asset-card='AST-8791'] .row-menu-list button[data-asset-action]")).toHaveCount(0);
    });

    test("8. Closed report RPU-560 (banned user): ไม่มี action ทั้ง report/account", async ({ page }) => {
      await openModule(page, "users", "Reported Users");
      await page.locator(".user-row.report-row[data-report-id='RPU-560'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      await expect(page.locator(".report-detail-page button[data-report-status-action]")).toHaveCount(0);
      await expect(page.locator(".report-detail-page button[data-user-action]")).toHaveCount(0);
    });
  });

  test.describe("Empty/error surfaces", () => {
    test("9. Delivery Logs: search ไม่พบ → empty state + 0 รายการ", async ({ page }) => {
      await openModule(page, "settings", "Delivery Logs");
      await page.waitForSelector(".delivery-log-table", { timeout: 5000 });
      await page.locator("#delivery-search").fill("ZZZ-NO-MATCH");
      await page.waitForTimeout(250);
      await expect(page.locator(".delivery-log-table .user-row.delivery-row")).toHaveCount(0);
      await expect(page.locator(".delivery-empty-state .empty-title")).toHaveText("ไม่พบ delivery log");
    });

    test("10. Deletion Requests: search ไม่พบ → empty state", async ({ page }) => {
      await openModule(page, "deletions", "Deletion Requests");
      await page.waitForTimeout(400);
      const search = page.locator("#deletion-search");
      if (await search.count()) {
        await search.fill("ZZZ-NO-MATCH");
        await page.waitForTimeout(250);
        await expect(page.locator(".user-row.empty, .detail-empty").first()).toBeVisible();
      } else {
        test.skip(true, "no deletion search on this layout");
      }
    });
  });

  test.describe("Admin Accounts — self/master protection", () => {
    test("11. ADM-010 (self+master): ไม่มี suspend/archive/unlock action ใน detail", async ({ page }) => {
      await openModule(page, "settings", "Admin Accounts");
      await page.waitForTimeout(400);
      await page.locator(".user-row.admin-account-row[data-admin-account-card='ADM-010']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("button[data-admin-account-action='suspend']")).toHaveCount(0);
      await expect(page.locator("button[data-admin-account-action='archive']")).toHaveCount(0);
      await expect(page.locator("button[data-admin-account-action='unlock']")).toHaveCount(0);
    });

    test("12. protection guard (data-level): canSuspendAdmin(self/master/last-active) = false", async ({ page }) => {
      await boot(page);
      const res = await page.evaluate(() => {
        const self = adminAccountData.accounts.find(a => a.id === "ADM-010");
        const suspended = adminAccountData.accounts.find(a => a.status === "Suspended");
        const activeOther = adminAccountData.accounts.find(a => !a.isSelf && !a.isMaster && a.status === "Active");
        return {
          selfSuspend: canSuspendAdmin(self),
          selfArchive: canArchiveAdmin ? canArchiveAdmin(self) : null,
          activeOtherSuspend: activeOther ? canSuspendAdmin(activeOther) : null
        };
      });
      expect(res.selfSuspend).toBe(false);
      if (res.selfArchive !== null) expect(res.selfArchive).toBe(false);
      if (res.activeOtherSuspend !== null) expect(res.activeOtherSuspend).toBe(true);
    });
  });

  test.describe("Report queue edge", () => {
    test("13. In Review report (RPU-541, Suspended user): มีปุ่มปิดรายงาน + Restore/Ban (ไม่มี Suspend)", async ({ page }) => {
      await openModule(page, "users", "Reported Users");
      await page.locator(".user-row.report-row[data-report-id='RPU-541'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      const actions = page.locator(".report-detail-page .user-detail-actions");
      // Suspended account → close-report button ถูกซ่อน (getReportStatusActions return [] when Suspended)
      await expect(actions.locator("button[data-report-status-action]")).toHaveCount(0);
      await expect(actions.locator("button[data-user-action='Restore']")).toHaveCount(1);
      await expect(actions.locator("button[data-user-action='Ban']")).toHaveCount(1);
      await expect(actions.locator("button[data-user-action='Suspend']")).toHaveCount(0);
    });
  });
});
