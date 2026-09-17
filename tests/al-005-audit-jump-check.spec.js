// AL-005: quick automated check — audit jump จาก Account Deletion History & Actions → Audit Log
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

async function loginIfNeeded(page) {
  const loginScreen = page.locator('#login-screen');
  if (await loginScreen.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator('#login-form button[type="submit"]').click();
    await page.waitForSelector('#otp-form:not(.hidden)', { timeout: 5000 });
    await page.locator('#verify-otp-btn').click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await page.waitForTimeout(500);
  }
}

async function openDeletionDetail(page, reqId) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await page.evaluate(id => renderDeletionDetail(id), reqId);
  await page.waitForSelector(".deletion-detail-mode", { timeout: 5000 });
}

test.describe("AL-005: audit jump จาก Account Deletion → Audit Log", () => {

  test("1. History & Actions มีคอลัมน์ Audit + pill event id ที่ match (DEL-033)", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    const head = await page.locator(".deletion-detail-page .history-table thead").textContent();
    expect(head).toContain("Audit");
    // DEL-033: ขอลบบัญชี → AUD-88195 (module Account Deletion + reference DEL-033 + action ขอลบบัญชี)
    await expect(page.locator('.deletion-detail-page .history-table [data-audit-ref="AUD-88195"]')).toBeVisible();
  });

  test("2. row ที่ไม่มี audit event แสดง —", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    // "ยกเลิก session" / "ระงับบัญชี + ยกเลิก offer" ไม่มี event ใน auditLogData → —
    const auditCells = await page.locator('.deletion-detail-page .history-table td[data-label="Audit"]').allTextContents();
    expect(auditCells).toContain("—");
  });

  test("3. คลิก audit link → กระโดดไป Audit Log + กรองด้วย event id + toast", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await page.locator('.deletion-detail-page .history-table [data-audit-ref="AUD-88195"]').click();
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    expect(await page.locator("#audit-search").inputValue()).toBe("AUD-88195");
    const rows = page.locator(".audit-log-table .user-row:not(.head):not(.empty)");
    expect(await rows.count()).toBe(1);
    expect(await page.locator(".audit-log-table").textContent()).toContain("AUD-88195");
    // toast ยืนยันการกระโดด
    await expect(page.locator(".toast, [class*='toast']").first()).toBeVisible();
  });

  test("4. audit ref jump จาก DEL-028 (ปฏิเสธคืนบัญชี → AUD-88198)", async ({ page }) => {
    await openDeletionDetail(page, "DEL-028");
    await page.locator('.deletion-detail-page .history-table [data-audit-ref="AUD-88198"]').click();
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    expect(await page.locator("#audit-search").inputValue()).toBe("AUD-88198");
    const rows = page.locator(".audit-log-table .user-row:not(.head):not(.empty)");
    expect(await rows.count()).toBe(1);
    expect(await page.locator(".audit-log-table").textContent()).toContain("DEL-028");
  });

  test("5. Reference pill ใน audit drawer → jump ไปหน้า entity จริง (DEL-028 → Deletion Detail)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await page.evaluate(() => renderModule("audit"));
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    // AUD-88198 reference = DEL-028 → คลิก pill ต้องไปหน้า Deletion Request Detail
    await page.locator('.user-row[data-audit-event="AUD-88198"]').click();
    await page.waitForSelector(".audit-log-detail-modal", { timeout: 5000 });
    const pill = page.locator(".audit-detail-ref-pill");
    await expect(pill).toBeVisible();
    expect(await pill.evaluate(el => el.tagName)).toBe("BUTTON");
    await pill.click();
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    await page.waitForSelector(".deletion-detail-mode", { timeout: 5000 });
    expect(await page.locator("#panel-title").textContent()).toBe("DEL-028");
  });

  test("5b. Reference pill ADM-xxx → Admin Account Detail", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await page.evaluate(() => renderModule("audit"));
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    // AUD-88203 reference = ADM-008 → คลิก pill ต้องไปหน้า Admin Account Detail
    await page.locator('.user-row[data-audit-event="AUD-88203"]').click();
    await page.waitForSelector(".audit-log-detail-modal", { timeout: 5000 });
    await page.locator(".audit-detail-ref-pill").click();
    await page.waitForSelector(".admin-account-detail-mode", { timeout: 5000 });
    expect(await page.locator("#panel-title").textContent()).toBe("ADM-008");
  });

  test("5c. Reference pill ที่ map ไม่ได้ → fallback กรอง Audit Log (RPT-USER)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await page.evaluate(() => renderModule("audit"));
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    // AUD-88120 reference = RPT-USER (ไม่มีหน้า entity) → กรอง audit log ด้วย ref
    await page.locator('.user-row[data-audit-event="AUD-88120"]').click();
    await page.waitForSelector(".audit-log-detail-modal", { timeout: 5000 });
    await page.locator(".audit-detail-ref-pill").click();
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    expect(await page.locator("#audit-search").inputValue()).toBe("RPT-USER");
    const rows = page.locator(".audit-log-table .user-row:not(.head):not(.empty)");
    expect(await rows.count()).toBe(1);
  });

  test("6. deletion flow เดิมไม่กระทบ — ปุ่ม restore/reject + delivery link ยังอยู่ (grace period)", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await expect(page.locator('[data-deletion-action="restore"]')).toBeVisible();
    await expect(page.locator('[data-deletion-action="reject-restore"]')).toBeVisible();
    // delivery log jump เดิมยังอยู่ในคอลัมน์ ส่งอีเมล
    await expect(page.locator(".deletion-detail-page .history-table [data-delivery-log-jump]").first()).toBeVisible();
  });
});
