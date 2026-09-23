// DEL-PTO-004: quick automated QA — Audit Log + dependency links + Account Status History rows
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

async function loginIfNeeded(page) {
  const loginScreen = page.locator('#login-screen');
  if (await loginScreen.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator('#login-form button[type="submit"]').click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await page.waitForTimeout(500);
  }
}

test.describe("DEL-PTO-004: Audit Log + cross-module links + Account Status History", () => {

  test("1. Audit Log view renders with required fields", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await page.evaluate(() => renderModule("audit"));
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    const rows = await page.locator(".audit-log-table .user-row:not(.head):not(.empty)").count();
    expect(rows).toBeGreaterThan(0);
    // required fields: Event ID primary cell + Note cell (before/after diff lives in detail drawer)
    const firstRow = page.locator(".audit-log-table .user-row.audit-row").first();
    await expect(firstRow.locator('[data-label="Event ID"] .main-text')).toContainText("AUD-");
    await expect(firstRow.locator('[data-label="Note"]')).toHaveCount(1);
    // module badge + risk pill
    const pills = await page.locator(".audit-log-table .pill").count();
    expect(pills).toBeGreaterThan(0);
  });

  test("2. Audit Log filter by search works", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await page.evaluate(() => renderModule("audit"));
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    await page.locator("#audit-search").fill("DEL-028");
    await page.waitForTimeout(300);
    const rows = await page.locator(".audit-log-table .user-row:not(.head):not(.empty)").count();
    expect(rows).toBeGreaterThan(0);
  });

  test("3. Audit Log empty state shows when no match", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await page.evaluate(() => renderModule("audit"));
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    await page.locator("#audit-search").fill("NONEXISTENTXYZ123");
    await page.waitForTimeout(300);
    const emptyTitle = await page.locator(".empty-title").textContent();
    expect(emptyTitle).toContain("ไม่พบ audit event");
  });

  test("4. Dependency links have data-deletion-req-id", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await page.evaluate(() => renderModule("deletions"));
    await page.waitForSelector(".deletion-list-mode", { timeout: 5000 });
    await page.locator("#deletion-search").fill("DEL-033");
    await page.waitForTimeout(300);
    await page.locator("text=DEL-033").first().click();
    await page.waitForSelector(".deletion-detail-page", { timeout: 5000 });
    const depLinks = await page.locator(".deletion-dep-link").count();
    expect(depLinks).toBeGreaterThan(0);
    const reqId = await page.locator(".deletion-dep-link").first().getAttribute("data-deletion-req-id");
    expect(reqId).toBe("DEL-033");
  });

  test("5. Assets dependency link navigates to Asset Management", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await page.evaluate(() => renderModule("deletions"));
    await page.waitForSelector(".deletion-list-mode", { timeout: 5000 });
    await page.locator("#deletion-search").fill("DEL-033");
    await page.waitForTimeout(300);
    await page.locator("text=DEL-033").first().click();
    await page.waitForSelector(".deletion-detail-page", { timeout: 5000 });
    await page.locator('.deletion-dep-link[data-deletion-dep="assets"]').click();
    await page.waitForTimeout(500);
    const activeMod = await page.evaluate(() => activeModule);
    expect(activeMod).toBe("assets");
    const searchVal = await page.locator("#search").inputValue();
    expect(searchVal).toContain("U-1104");
  });

  test("6. Account Status History for deleted user has lifecycle rows", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await page.evaluate(() => {
      const user = userManagementData.users.find(u => u.id === "U-1222");
      if (user) renderUserDetailPage(user);
    });
    await page.waitForTimeout(500);
    const historyText = await page.locator(".user-account-history-table tbody").textContent();
    expect(historyText).toContain("ขอลบบัญชี");
    expect(historyText).toContain("ลบบัญชีอัตโนมัติ");
  });

  test("7. Account Status History for deletion-requested user has request row", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await page.evaluate(() => {
      const user = userManagementData.users.find(u => u.id === "U-1104");
      if (user) renderUserDetailPage(user);
    });
    await page.waitForTimeout(500);
    const historyText = await page.locator(".user-account-history-table tbody").textContent();
    expect(historyText).toContain("ขอลบบัญชี");
  });

  test("8. Account Status History for deletion-requested user (DEL-033) has request row", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await page.evaluate(() => {
      const user = userManagementData.users.find(u => u.id === "U-1104");
      if (user) renderUserDetailPage(user);
    });
    await page.waitForTimeout(500);
    const historyText = await page.locator(".user-account-history-table tbody").textContent();
    expect(historyText).toContain("ขอลบบัญชี");
  });

  test("9. Account Status History for deleted user (DEL-020) has combined auto-delete row", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await page.evaluate(() => {
      const user = userManagementData.users.find(u => u.id === "U-1222");
      if (user) renderUserDetailPage(user);
    });
    await page.waitForTimeout(500);
    const historyText = await page.locator(".user-account-history-table tbody").textContent();
    expect(historyText).toContain("ขอลบบัญชี");
    // เก็บถาวร + ลบตัวตน รวมเป็นขั้นเดียว "ลบบัญชีอัตโนมัติ" (ตาม lifecycle decision)
    expect(historyText).toContain("ลบบัญชีอัตโนมัติ");
    expect(historyText).not.toContain("เก็บถาวร");
  });

  test("10. Settings > Audit Log submenu navigates to Audit Log", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await page.evaluate(() => renderModule("settings", "Audit Log", "Audit Log"));
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    const panelTitle = await page.locator("#panel-title").textContent();
    expect(panelTitle).toContain("Audit Log List");
  });

  test("11. U-1222 'View deleted summary' opens DEL-020 detail directly", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await page.evaluate(() => {
      const user = userManagementData.users.find(u => u.id === "U-1222");
      if (user) handleUserAction(user, "View deleted summary");
    });
    // ต้องเปิด Request Detail ตรง ไม่หยุดที่ list กรอง
    await page.waitForSelector(".deletion-detail-mode", { timeout: 5000 });
    const crumb = await page.locator("#crumb").textContent();
    expect(crumb).toContain("DEL-020");
    const pageTitle = await page.locator("#page-title").textContent();
    expect(pageTitle).toContain("Request Detail");
  });

  test("11b. U-1104 'Open Account Deletion' opens DEL-033 detail directly", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await page.evaluate(() => {
      const user = userManagementData.users.find(u => u.id === "U-1104");
      if (user) handleUserAction(user, "Open Account Deletion");
    });
    await page.waitForSelector(".deletion-detail-mode", { timeout: 5000 });
    const crumb = await page.locator("#crumb").textContent();
    expect(crumb).toContain("DEL-033");
  });

  test("13. Account Status History sorts newest-first + month format 'Sep' after reject + restore", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    // จำลอง scenario ของ user: ปฏิเสธคืนบัญชีก่อน แล้วคืนบัญชีทีหลัง
    await page.evaluate(() => {
      const req = deletionRequestData.requests.find(r => r.id === "DEL-033");
      confirmDeletionAction(req, "reject-restore");
      confirmDeletionAction(req, "restore");
    });
    await page.evaluate(() => {
      const user = userManagementData.users.find(u => u.id === "U-1104");
      if (user) renderUserDetailPage(user);
    });
    await page.waitForTimeout(500);
    const historyText = await page.locator(".user-account-history-table").textContent();
    // เดือนต้องเป็น "Sep" ไม่ใช่ "Sept" (en-GB short บน ICU ใหม่)
    expect(historyText).not.toContain("Sept");
    // row แรกต้องเป็น action ล่าสุด (คืนบัญชี — ทำทีหลังปฏิเสธ)
    const firstAction = await page.locator(".user-account-history-table tbody tr").first().locator("td").nth(2).textContent();
    expect(firstAction.trim()).toBe("คืนบัญชี");
    // ทุกแถว parse เวลาได้และเรียงใหม่ → เก่า
    const ranks = await page.evaluate(() => {
      return [...document.querySelectorAll(".user-account-history-table tbody tr td:first-child")]
        .map(td => parseBangkokAuditTime(td.textContent.trim()) || 0);
    });
    for (let i = 1; i < ranks.length; i++) {
      expect(ranks[i]).toBeLessThanOrEqual(ranks[i - 1]);
    }
  });

  test("14. Restore action syncs user status back to User Management (list + detail)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    // กดคืนบัญชี DEL-033 จากหน้า deletion detail
    await page.evaluate(() => {
      const req = deletionRequestData.requests.find(r => r.id === "DEL-033");
      confirmDeletionAction(req, "restore");
    });
    // data ใน userManagementData ต้องเป็น Active
    const userStatus = await page.evaluate(() => userManagementData.users.find(u => u.id === "U-1104")?.status || "");
    expect(userStatus).toBe("Active");
    // User List ต้องแสดง pill ใช้งานได้ (ไม่ใช่รอลบบัญชี)
    await page.evaluate(() => renderModule("users"));
    await page.waitForTimeout(500);
    const listText = await page.locator("#table").textContent();
    expect(listText).not.toContain("รอลบบัญชี");
    // User Detail header ต้องแสดงสถานะ Active
    await page.evaluate(() => {
      const user = userManagementData.users.find(u => u.id === "U-1104");
      if (user) renderUserDetailPage(user);
    });
    await page.waitForTimeout(500);
    const detailText = await page.locator(".user-detail-head").textContent();
    expect(detailText).toContain("ใช้งานได้");
  });

  test("15. Reject restore keeps user status as Deletion Requested", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await page.evaluate(() => {
      const req = deletionRequestData.requests.find(r => r.id === "DEL-033");
      confirmDeletionAction(req, "reject-restore");
    });
    const userStatus = await page.evaluate(() => userManagementData.users.find(u => u.id === "U-1104")?.status || "");
    expect(userStatus).toBe("Deletion Requested");
  });

  test("16. Serious flag hides after restore (completed request)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    // ก่อน restore: คำขอยังอยู่ใน grace period → แสดง serious flag
    await page.evaluate(() => renderDeletionDetail("DEL-033"));
    await page.waitForSelector(".deletion-detail-mode", { timeout: 5000 });
    expect(await page.locator(".deletion-serious-pill").count()).toBe(1);
    // restore แล้ว: คำขอจบแล้ว → ซ่อน serious flag
    await page.evaluate(() => {
      const req = deletionRequestData.requests.find(r => r.id === "DEL-033");
      confirmDeletionAction(req, "restore");
    });
    await page.waitForTimeout(300);
    expect(await page.locator(".deletion-serious-pill").count()).toBe(0);
  });

  test("17. RPU-579 report history snapshot shows Active (before deletion request)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    // เปิด user detail U-1104 แล้วดู Account Status History — Report User row ต้องแสดงสถานะ ณ วันที่รายงาน (Active)
    await page.evaluate(() => {
      const user = userManagementData.users.find(u => u.id === "U-1104");
      if (user) renderUserDetailPage(user);
    });
    await page.waitForTimeout(500);
    const reportRow = page.locator(".user-account-history-table tbody tr", { hasText: "Report User" });
    const rowText = await reportRow.first().textContent();
    expect(rowText).toContain("ใช้งานได้");
    expect(rowText).not.toContain("รอลบบัญชี");
  });

  test("18. Back from report detail (opened via user detail) returns to user detail", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    // เข้าผ่าน flow จริง: User Management → User Detail (ให้ activeModule = "users")
    await page.evaluate(() => renderModule("users"));
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      const user = userManagementData.users.find(u => u.id === "U-1104");
      if (user) renderUserDetailPage(user);
    });
    await page.waitForTimeout(500);
    // คลิก report case chip RPU-579 ในส่วน Reports ของ user detail
    await page.locator('[data-report-action="RPU-579"]').click();
    await page.waitForTimeout(500);
    let crumb = await page.locator("#crumb").textContent();
    expect(crumb).toContain("Report Detail");
    // กด back → ต้องกลับ User Detail ไม่ใช่ Reported Users list
    await page.locator(".page-back-btn").click();
    await page.waitForTimeout(500);
    crumb = await page.locator("#crumb").textContent();
    expect(crumb).toContain("User Detail");
  });

  test("12. U-1222 action button shows Thai label", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await page.evaluate(() => {
      const user = userManagementData.users.find(u => u.id === "U-1222");
      if (user) renderUserDetailPage(user);
    });
    await page.waitForTimeout(500);
    const btn = page.locator('[data-user-action="View deleted summary"]');
    await expect(btn).toHaveText("ดูสรุปบัญชีที่ลบแล้ว");
  });
});
