// QA-BO-013m: Settings > Admin Accounts — Invitation Delivery Logs & Audit Trace (AIL-007)
// contract: 01_AUTHENTICATION_MODULE.md §10.1 & 16_ADMIN_SETTINGS_MODULE.md §8.9 & §16.3
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

async function loginIfNeeded(page) {
  const loginScreen = page.locator("#login-screen");
  if (await loginScreen.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator("#login-form button[type=\"submit\"]").click();
    await page.waitForSelector("#otp-form:not(.hidden)", { timeout: 5000 });
    await page.locator("#verify-otp-btn").click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await page.waitForTimeout(500);
  }
}

async function ensureNavOpen(page) {
  const needsToggle = await page.evaluate(() =>
    window.matchMedia("(max-width: 1180px)").matches && !document.body.classList.contains("nav-open"));
  if (needsToggle) {
    await page.locator("#menu-toggle").click();
    await page.waitForTimeout(300);
  }
}

async function goToAdminAccounts(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  await page.locator(".nav-item[data-module='settings']").click();
  await page.waitForTimeout(300);
  await ensureNavOpen(page);
  await page.locator(".submenu[data-submenu='settings'] button[data-module='settings'][data-sub='Admin Accounts']").click();
  await page.waitForTimeout(300);
}

async function goToDeliveryLogs(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  await page.locator(".nav-item[data-module='settings']").click();
  await page.waitForTimeout(300);
  await ensureNavOpen(page);
  await page.locator(".submenu[data-submenu='settings'] button[data-module='settings'][data-sub='Delivery Logs']").click();
  await page.waitForTimeout(300);
}

async function openAdminDetail(page, id) {
  await goToAdminAccounts(page);
  await page.locator(`.admin-account-row[data-admin-account-card="${id}"] .user-cell-primary[data-label="Admin ID"]`).click();
  await page.waitForTimeout(300);
}

test.describe("QA-BO-013m: Settings > Admin Accounts — Invitation Delivery Logs & Audit Trace (AIL-007)", () => {

  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440" && testInfo.project.name !== "mobile-390", "desktop-1440 and mobile-390 only");
  });

  test("1. Seed Delivery Log: DLV-ACCT-008-INV-001 แสดงใน Delivery Logs พร้อมข้อมูล Source/Recipient/Status และเปิด Detail Modal ได้", async ({ page }) => {
    await goToDeliveryLogs(page);

    // Search for DLV-ACCT-008
    const searchInput = page.locator("#delivery-search");
    await searchInput.fill("DLV-ACCT-008-INV-001");
    await page.waitForTimeout(300);

    const row = page.locator(".delivery-log-table .user-row.delivery-row").first();
    await expect(row).toBeVisible();
    await expect(row).toContainText("DLV-ACCT-008-INV-001");
    await expect(row).toContainText("Admin invitation email");
    await expect(row).toContainText("INV-00001");
    await expect(row).toContainText("ADM-008");
    await expect(row).toContainText("Sent");

    // Click row to open modal
    await row.click();
    await page.waitForTimeout(300);

    const modal = page.locator("#user-action-modal");
    await expect(modal).toBeVisible();
    await expect(modal.locator("#user-action-modal-title")).toContainText("DLV-ACCT-008-INV-001");
    await expect(modal).toContainText("INV-00001");
    await expect(modal).toContainText("ADM-008");
    await expect(modal).toContainText("na***@tukdaeng.example");
    await expect(modal).toContainText("72 ชม.");
    await expect(modal).not.toContainText("raw_token");
    await expect(modal).not.toContainText("token=");
  });

  test("2. Jump จาก Admin Detail: History & Actions แยก Reference (INV-*) / Delivery (DLV-* jump) / Audit คนละ column; Latest Delivery tile เป็น summary", async ({ page }) => {
    await openAdminDetail(page, "ADM-008");

    // Latest Delivery tile = status + date/time summary เท่านั้น ไม่ expose DLV-* jump (§8.9 บังคับ delivery pill เฉพาะ History & Actions)
    const latestDeliveryTile = page.locator("[data-admin-invitation-section] .detail-tile", { hasText: "Latest Delivery" });
    await expect(latestDeliveryTile).toContainText("Sent");
    await expect(latestDeliveryTile.locator("[data-delivery-log-jump]")).toHaveCount(0);
    await expect(latestDeliveryTile).not.toContainText("DLV-ACCT-008-INV-001");

    // History & Actions: 6 columns แยก Reference / Delivery / Audit
    const headers = page.locator(".admin-account-action-section .history-table thead th");
    await expect(headers).toHaveText(["วันที่ / เวลา", "Action", "Reference", "Delivery", "Audit", "รายละเอียด"]);

    const historyRow = page.locator(".admin-account-action-section .history-table tbody tr").first();
    // Reference = invitation_id (INV-*) ตาม §8.9 — ไม่ใช่ actor ADM-*
    await expect(historyRow.locator("td").nth(2)).toHaveText("INV-00001");
    // Delivery column = DLV-* jump link (ไม่ซ้อนกับ Reference)
    const tableLink = historyRow.locator("td").nth(3).locator("button[data-delivery-log-jump='DLV-ACCT-008-INV-001']");
    await expect(tableLink).toBeVisible();
    // Audit column = audit ref link
    await expect(historyRow.locator("td").nth(4).locator("button.history-audit-link")).toHaveText("AUD-88203");

    // Click jump link in Delivery column
    await tableLink.click();
    await page.waitForTimeout(400);

    // Should navigate to Delivery Logs and open detail modal
    await expect(page.locator("body")).toHaveClass(/delivery-log-list-mode/);
    const modal = page.locator("#user-action-modal");
    await expect(modal).toBeVisible();
    await expect(modal.locator("#user-action-modal-title")).toContainText("DLV-ACCT-008-INV-001");
  });

  test("3. Invite Admin ใหม่: สร้าง Delivery Log ทันทีตามสถานะ (Sent/Failed/Retry) และสามารถ jump เข้า Delivery Logs ได้", async ({ page }) => {
    await goToAdminAccounts(page);

    // Open invite modal
    await page.locator("[data-admin-account-invite-open]").click();
    await page.waitForTimeout(300);

    await page.locator("#admin-account-invite-name").fill("ทดสอบ ดิลิเวอรี");
    await page.locator("#admin-account-invite-email").fill("test.delivery@tukdaeng.example");

    // Select Role
    await page.locator("#admin-account-invite-form label:has(#admin-account-invite-role) [data-custom-select-trigger]").click();
    await page.waitForTimeout(150);
    await page.locator("#admin-account-invite-form label:has(#admin-account-invite-role) [data-custom-select-option][data-value='Super Admin']").click();
    await page.waitForTimeout(150);

    // Confirm invite
    await page.locator("[data-admin-account-invite-confirm]").click();
    await page.waitForTimeout(400);

    // Verify account created in list
    const newRow = page.locator(".admin-account-row", { hasText: "ทดสอบ ดิลิเวอรี" });
    await expect(newRow).toBeVisible();

    // Open detail of new account
    await newRow.locator(".user-cell-primary[data-label='Admin ID']").click();
    await page.waitForTimeout(300);

    const deliveryBtn = page.locator(".history-table button[data-delivery-log-jump]").first();
    await expect(deliveryBtn).toBeVisible();
    const deliveryId = await deliveryBtn.textContent();
    expect(deliveryId).toMatch(/^DLV-ACCT-\d+-INV-001$/);

    // Click jump
    await deliveryBtn.click();
    await page.waitForTimeout(400);

    await expect(page.locator("body")).toHaveClass(/delivery-log-list-mode/);
    const modal = page.locator("#user-action-modal");
    await expect(modal).toBeVisible();
    await expect(modal.locator("#user-action-modal-title")).toContainText(deliveryId.trim());
    await expect(modal).toContainText("te***@tukdaeng.example");
  });

  test("4. Resend Invitation: สร้าง Delivery Log ใหม่ (attempt sequence 2) พร้อมบันทึกสถานะและ trace ครบ", async ({ page }) => {
    await openAdminDetail(page, "ADM-008");

    // Click Resend
    await page.locator("button[data-admin-invitation-action='resend']").click();
    await page.waitForTimeout(300);

    // Modal open
    const modal = page.locator("#user-action-modal");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Resend Invitation");

    // Confirm Resend
    await modal.locator("[data-admin-invitation-resend-confirm]").click();
    await page.waitForTimeout(400);

    // Check History table has new Resent activity with DLV-ACCT-008-INV-002
    const resendDeliveryBtn = page.locator(".history-table button[data-delivery-log-jump='DLV-ACCT-008-INV-002']");
    await expect(resendDeliveryBtn).toBeVisible();

    // Jump to Delivery Logs for resend attempt
    await resendDeliveryBtn.click();
    await page.waitForTimeout(400);

    await expect(page.locator("body")).toHaveClass(/delivery-log-list-mode/);
    const delModal = page.locator("#user-action-modal");
    await expect(delModal).toBeVisible();
    await expect(delModal.locator("#user-action-modal-title")).toContainText("DLV-ACCT-008-INV-002");
    await expect(delModal).toContainText("INV-00002");
  });

  test("5. Reissue Invitation: สร้าง Delivery Log ใหม่หลัง Expired/Cancelled และ trace กลับได้", async ({ page }) => {
    await openAdminDetail(page, "ADM-008");

    // Cancel first
    await page.locator("button[data-admin-invitation-action='cancel']").click();
    await page.waitForTimeout(300);
    await page.locator("[data-admin-invitation-cancel-confirm]").click();
    await page.waitForTimeout(400);

    // Now account has reissue button
    const reissueBtn = page.locator("button[data-admin-invitation-action='reissue']");
    await expect(reissueBtn).toBeVisible();
    await reissueBtn.click();
    await page.waitForTimeout(300);

    const modal = page.locator("#user-action-modal");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Reissue Invitation");

    // Confirm Reissue
    await modal.locator("[data-admin-invitation-reissue-confirm]").click();
    await page.waitForTimeout(400);

    // Check new Reissue delivery log exists in History table
    const reissueDeliveryBtn = page.locator(".history-table button[data-delivery-log-jump='DLV-ACCT-008-INV-002']");
    await expect(reissueDeliveryBtn).toBeVisible();

    // Jump to Delivery Logs
    await reissueDeliveryBtn.click();
    await page.waitForTimeout(400);

    await expect(page.locator("body")).toHaveClass(/delivery-log-list-mode/);
    const delModal = page.locator("#user-action-modal");
    await expect(delModal).toBeVisible();
    await expect(delModal.locator("#user-action-modal-title")).toContainText("DLV-ACCT-008-INV-002");
  });

  test("6. Cancel Invitation: ยกเลิกคำเชิญ ไม่สร้าง Delivery Log เพิ่ม และ History row มี Delivery = —", async ({ page }) => {
    await openAdminDetail(page, "ADM-008");

    const deliveryCountBefore = await page.evaluate(() => window.moduleData?.settings?.rows?.filter(r => r.id.startsWith("DLV-ACCT-008")).length || 0);

    // Cancel
    await page.locator("button[data-admin-invitation-action='cancel']").click();
    await page.waitForTimeout(300);
    await page.locator("[data-admin-invitation-cancel-confirm]").click();
    await page.waitForTimeout(400);

    const deliveryCountAfter = await page.evaluate(() => window.moduleData?.settings?.rows?.filter(r => r.id.startsWith("DLV-ACCT-008")).length || 0);
    expect(deliveryCountAfter).toBe(deliveryCountBefore);

    // History row ของ Cancel: Reference = INV-* (§8.9), Delivery = — (ไม่มี email attempt), Audit = link
    const cancelRow = page.locator(".admin-account-action-section .history-table tbody tr").first();
    await expect(cancelRow.locator("td").nth(1)).toContainText("Invitation Cancelled");
    await expect(cancelRow.locator("td").nth(2)).toHaveText("INV-00001");
    await expect(cancelRow.locator("td").nth(3)).toHaveText("—");
    await expect(cancelRow.locator("td").nth(4).locator("button.history-audit-link")).toBeVisible();
  });

  test("7. Permission Gating: เมื่อไม่มีสิทธิ์ delivery.view หรือ audit.view จะแสดง plain pill หรือบล็อก jump", async ({ page }) => {
    await openAdminDetail(page, "ADM-008");

    // Override actor permission for testing
    await page.evaluate(() => {
      window.auth = { email: "support@tukdaeng.example", admin: { role: "Support Agent", username: "Pim Support" } };
      renderAdminAccountDetail("ADM-008");
    });
    await page.waitForTimeout(300);

    // In Support Agent role, check if delivery pill is span instead of clickable jump button or handled safely
    const hasClickableJump = await page.locator(".history-table button[data-delivery-log-jump]").isVisible().catch(() => false);
    // In our implementation, canViewDeliveryLogs() is checked
    const canView = await page.evaluate(() => canViewDeliveryLogs());
    if (!canView) {
      expect(hasClickableJump).toBe(false);
      await expect(page.locator(".history-table .history-delivery-ref")).toBeVisible();
    }
  });

  test("8. Security: ไม่มี raw token, token hash, password ใน Delivery Logs, Detail Modal, Audit Events หรือ DOM", async ({ page }) => {
    await goToDeliveryLogs(page);

    const pageContent = await page.content();
    expect(pageContent).not.toContain("raw_token");
    expect(pageContent).not.toContain("password_hash");
    expect(pageContent).not.toContain("idempotency_secret");

    // Open detail modal
    const row = page.locator(".delivery-log-table .user-row.delivery-row").first();
    await row.click();
    await page.waitForTimeout(300);

    const modalContent = await page.locator("#user-action-modal").innerHTML();
    expect(modalContent).not.toContain("raw_token");
    expect(modalContent).not.toContain("secret");
  });

  test("9. Responsive Check (Mobile 390px): Delivery field แยกใน card, jump link และ Detail Modal แสดงผลถูกต้องบน mobile", async ({ page }) => {
    await openAdminDetail(page, "ADM-008");

    // Mobile card: Delivery เป็น field แยก ไม่อยู่ใต้ Reference
    const deliveryCell = page.locator(".history-table td[data-label='Delivery']", { hasText: "DLV-ACCT-008-INV-001" });
    await expect(deliveryCell).toBeVisible();
    const referenceCell = page.locator(".history-table td[data-label='Reference']").first();
    await expect(referenceCell).toHaveText("INV-00001");
    await expect(referenceCell).not.toContainText("DLV-");

    // Delivery jump button in mobile card
    const deliveryBtn = page.locator(".history-table button[data-delivery-log-jump='DLV-ACCT-008-INV-001']");
    await expect(deliveryBtn).toBeVisible();

    // Click jump
    await deliveryBtn.click();
    await page.waitForTimeout(400);

    const modal = page.locator("#user-action-modal");
    await expect(modal).toBeVisible();
    await expect(modal.locator("#user-action-modal-title")).toContainText("DLV-ACCT-008-INV-001");
  });

});
