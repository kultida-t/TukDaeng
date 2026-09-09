// DEL-PTO-003: Account Deletion admin action modals — automate test
// ตรวจ 2 modals (Restore Account / Reject Restore) + audit log + responsive
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

// helper: login เข้าระบบ (ค่า default อยู่ใน form แล้ว — กด submit 2 ครั้ง)
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

// helper: เข้า Account Deletion > Deletion Requests > คลิกคำขอ
async function openDeletionDetail(page, requestId) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  // เปิดเมนู Account Deletion > Deletion Requests โดยตรง (prototype — เรียก renderModule)
  await page.evaluate(() => {
    if (typeof renderModule === "function") renderModule("deletions", "Deletion Requests");
  });
  await page.waitForSelector('.deletion-list-mode, #deletion-search', { timeout: 5000 });
  // ค้นหาคำขอ
  const searchInput = page.locator('#deletion-search');
  if (await searchInput.count() > 0) {
    await searchInput.fill(requestId);
    await page.waitForTimeout(300);
  }
  // คลิกแถวที่ตรง
  const row = page.locator(`text=${requestId}`).first();
  await row.click();
  await page.waitForSelector('.deletion-detail-page', { timeout: 5000 });
}

// helper: นับจำนวนปุ่ม action ในหน้า detail
async function countActionButtons(page) {
  return await page.locator('[data-deletion-action]').count();
}

// helper: ดึงรายการ audit log rows — map คอลัมน์จาก data-label ของ td (ทนต่อการเพิ่ม/สลับคอลัมน์ เช่น คอลัมน์ ส่งอีเมล จาก BO-13-v0.5)
async function getAuditLogRows(page) {
  const rows = page.locator('.deletion-action-section .history-table tbody tr');
  const count = await rows.count();
  const logs = [];
  for (let i = 0; i < count; i++) {
    const cell = label => rows.nth(i).locator(`td[data-label="${label}"]`);
    const at = (await cell("วันที่ / เวลา").textContent()) || "";
    const actor = (await cell("ผู้ดำเนินการ").textContent()) || "";
    const action = (await cell("Action").textContent()) || "";
    const email = (await cell("ส่งอีเมล").innerHTML()) || "";
    const note = (await cell("รายละเอียด").innerHTML()) || "";
    logs.push({ at: at.trim(), actor: actor.trim(), action: action.trim(), email: email.trim(), note: note.trim() });
  }
  return logs;
}

// helper: เปิด action modal และเลือกเหตุผล + ใส่ note
async function fillActionModal(page, action, note) {
  await page.click(`[data-deletion-action="${action}"]`);
  await page.waitForSelector('#user-action-modal.show', { timeout: 3000 });
  // เลือกเหตุผล — click trigger ของ custom select (เพราะ #deletion-action-reason เป็น hidden input)
  const reasonContainer = page.locator('[data-custom-select]').filter({ has: page.locator('#deletion-action-reason') });
  await reasonContainer.locator('[data-custom-select-trigger]').click();
  await page.waitForSelector('[data-custom-select-option]', { timeout: 3000 });
  await page.locator('[data-custom-select-option]').first().click();
  // ใส่ note
  if (note) await page.locator('#deletion-action-note').fill(note);
}

// helper: กดยืนยัน action และรอ toast
async function confirmActionAndWaitToast(page, action) {
  await page.click(`[data-deletion-action-confirm="${action}"]`);
  await page.waitForSelector('#success-toast.show', { timeout: 3000 });
  await page.waitForTimeout(500);
}

test.describe("DEL-PTO-003: Account Deletion admin action modals", () => {

  test("1. หน้า detail มี 2 ปุ่ม action (คืนบัญชี + ปฏิเสธคืนบัญชี) ในช่วง grace period", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    const restoreBtn = page.locator('[data-deletion-action="restore"]');
    const rejectBtn = page.locator('[data-deletion-action="reject-restore"]');
    await expect(restoreBtn).toBeVisible();
    await expect(restoreBtn).toHaveText("คืนบัญชี");
    await expect(rejectBtn).toBeVisible();
    await expect(rejectBtn).toHaveText("ปฏิเสธคืนบัญชี");
    // ไม่ควรมีปุ่ม info อื่น ๆ
    const count = await countActionButtons(page);
    expect(count).toBe(2);
  });

  test("2. คลิก 'คืนบัญชี' → เปิด modal 'Restore Account'", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await page.click('[data-deletion-action="restore"]');
    await page.waitForSelector('#user-action-modal.show', { timeout: 3000 });
    const title = page.locator('#user-action-modal-title');
    await expect(title).toHaveText("Restore Account");
    // มี reason selector + note textarea + ปุ่มยืนยัน/ยกเลิก
    await expect(page.locator('#deletion-action-note')).toBeVisible();
    await expect(page.locator('[data-deletion-action-confirm="restore"]')).toBeVisible();
    // ปุ่มยกเลิกใน modal — เลือกปุ่มที่มีข้อความ "ยกเลิก" โดยใช้ .last() เพราะมี X อยู่ด้วย
    await expect(page.locator('#user-action-modal [data-user-action-modal-close]').last()).toBeVisible();
  });

  test("3. คลิก 'ปฏิเสธคืนบัญชี' → เปิด modal 'Reject Restore'", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await page.click('[data-deletion-action="reject-restore"]');
    await page.waitForSelector('#user-action-modal.show', { timeout: 3000 });
    const title = page.locator('#user-action-modal-title');
    await expect(title).toHaveText("Reject Restore");
    await expect(page.locator('#deletion-action-note')).toBeVisible();
    await expect(page.locator('[data-deletion-action-confirm="reject-restore"]')).toBeVisible();
  });

  test("4. ปิด modal ด้วยปุ่ม 'ยกเลิก'", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await page.click('[data-deletion-action="restore"]');
    await page.waitForSelector('#user-action-modal.show', { timeout: 3000 });
    // ใช้ data-user-action-modal-close ใน modal เพราะ text=ยกเลิก มีหลาย element
    await page.locator('#user-action-modal [data-user-action-modal-close]').last().click();
    await expect(page.locator('#user-action-modal')).not.toHaveClass(/show/);
  });

  test("5. ปิด modal ด้วยปุ่ม X", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await page.click('[data-deletion-action="restore"]');
    await page.waitForSelector('#user-action-modal.show', { timeout: 3000 });
    await page.click('[data-user-action-modal-close]');
    await expect(page.locator('#user-action-modal')).not.toHaveClass(/show/);
  });

  test("6. คืนบัญชี: เปลี่ยนสถานะเป็น 'คืนบัญชีแล้ว' + ปุ่มหาย", async ({ page }) => {
    await openDeletionDetail(page, "DEL-034");
    await fillActionModal(page, "restore", "ทดสอบ automate: คืนบัญชี");
    await confirmActionAndWaitToast(page, "restore");
    // สถานะเปลี่ยนเป็น "คืนบัญชีแล้ว"
    const statusPill = page.locator('.pill', { hasText: "คืนบัญชีแล้ว" });
    await expect(statusPill).toBeVisible();
    // ปุ่มคืนบัญชี + ปฏิเสธ หายไป
    await expect(page.locator('[data-deletion-action="restore"]')).toHaveCount(0);
    await expect(page.locator('[data-deletion-action="reject-restore"]')).toHaveCount(0);
  });

  test("7. คืนบัญชี: audit log เพิ่ม row 'คืนบัญชี' พร้อมเหตุผล + หมายเหตุ", async ({ page }) => {
    await openDeletionDetail(page, "DEL-035");
    await fillActionModal(page, "restore", "ทดสอบ audit log");
    await confirmActionAndWaitToast(page, "restore");
    // ตรวจ audit log
    const logs = await getAuditLogRows(page);
    const restoreLog = logs.find(l => l.action === "คืนบัญชี");
    expect(restoreLog).toBeTruthy();
    // note ควรมีเหตุผล + หมายเหตุแยกบรรทัด (มี <br>)
    expect(restoreLog.note).toContain("หมายเหตุ: ทดสอบ audit log");
    // คอลัมน์ ส่งอีเมล (BO-13-v0.5): คืนบัญชีมี delivery log jump ได้
    expect(restoreLog.email).toContain("Email ส่งแล้ว");
    expect(restoreLog.email).toContain("DLV-DEL-035-RES");
  });

  test("8. ปฏิเสธคืนบัญชี: เปลี่ยนสถานะ + ปุ่มยังแสดง", async ({ page }) => {
    await openDeletionDetail(page, "DEL-034");
    await fillActionModal(page, "reject-restore", "ทดสอบปฏิเสธ");
    await confirmActionAndWaitToast(page, "reject-restore");
    // สถานะเปลี่ยนเป็น "ปฏิเสธคืนบัญชี"
    const statusPill = page.locator('.pill', { hasText: "ปฏิเสธคืนบัญชี" });
    await expect(statusPill).toBeVisible();
    // ปุ่มยังแสดง (ยังอยู่ใน grace period)
    await expect(page.locator('[data-deletion-action="restore"]')).toBeVisible();
    await expect(page.locator('[data-deletion-action="reject-restore"]')).toBeVisible();
  });

  test("9. ปฏิเสธคืนบัญชี: audit log เพิ่ม row 'ปฏิเสธคืนบัญชี'", async ({ page }) => {
    await openDeletionDetail(page, "DEL-035");
    await fillActionModal(page, "reject-restore", "ทดสอบปฏิเสธ audit");
    await confirmActionAndWaitToast(page, "reject-restore");
    const logs = await getAuditLogRows(page);
    const rejectLog = logs.find(l => l.action === "ปฏิเสธคืนบัญชี");
    expect(rejectLog).toBeTruthy();
    expect(rejectLog.email).toContain("Email ส่งแล้ว");
    expect(rejectLog.email).toContain("DLV-DEL-035-REJ");
    expect(rejectLog.note).toContain("หมายเหตุ: ทดสอบปฏิเสธ audit");
  });

  test("10. ปฏิเสธซ้ำ: audit log แสดงทุกครั้ง (ไม่เขียนทับ)", async ({ page }) => {
    await openDeletionDetail(page, "DEL-036");
    // ปฏิเสธครั้งที่ 1
    await fillActionModal(page, "reject-restore", "ปฏิเสธครั้งที่ 1");
    await confirmActionAndWaitToast(page, "reject-restore");
    // ปฏิเสธครั้งที่ 2
    await fillActionModal(page, "reject-restore", "ปฏิเสธครั้งที่ 2");
    await confirmActionAndWaitToast(page, "reject-restore");
    // ตรวจ audit log ต้องมี "ปฏิเสธคืนบัญชี" 2 ครั้ง
    const logs = await getAuditLogRows(page);
    const rejectLogs = logs.filter(l => l.action === "ปฏิเสธคืนบัญชี");
    expect(rejectLogs.length).toBe(2);
    expect(rejectLogs[0].email).toContain("DLV-DEL-036-REJ");
    expect(rejectLogs[0].note).toContain("ปฏิเสธครั้งที่ 1");
    expect(rejectLogs[1].note).toContain("ปฏิเสธครั้งที่ 2");
  });

  test("11. ปฏิเสธแล้วคืนบัญชี: audit log แสดงครบทั้งคู่", async ({ page }) => {
    await openDeletionDetail(page, "DEL-036");
    // ปฏิเสธก่อน
    await fillActionModal(page, "reject-restore", "ปฏิเสธก่อนคืน");
    await confirmActionAndWaitToast(page, "reject-restore");
    // คืนบัญชี
    await fillActionModal(page, "restore", "คืนหลังปฏิเสธ");
    await confirmActionAndWaitToast(page, "restore");
    // ตรวจ audit log ต้องมีทั้ง "ปฏิเสธคืนบัญชี" และ "คืนบัญชี"
    const logs = await getAuditLogRows(page);
    const rejectLog = logs.find(l => l.action === "ปฏิเสธคืนบัญชี");
    const restoreLog = logs.find(l => l.action === "คืนบัญชี");
    expect(rejectLog).toBeTruthy();
    expect(restoreLog).toBeTruthy();
    expect(rejectLog.email).toContain("DLV-DEL-036-REJ");
    expect(restoreLog.email).toContain("DLV-DEL-036-RES");
    expect(rejectLog.note).toContain("ปฏิเสธก่อนคืน");
    expect(restoreLog.note).toContain("คืนหลังปฏิเสธ");
  });

  test("12. รูปแบบวันที่ของ action ใหม่ตรงกับ mock data (DD MMM YYYY HH:MM)", async ({ page }) => {
    await openDeletionDetail(page, "DEL-034");
    await fillActionModal(page, "restore", "");
    await confirmActionAndWaitToast(page, "restore");
    const logs = await getAuditLogRows(page);
    const restoreLog = logs.find(l => l.action === "คืนบัญชี");
    expect(restoreLog).toBeTruthy();
    // รูปแบบ: "DD MMM YYYY HH:MM" (ไม่มี comma, ไม่มี GMT+7) — เดือนอาจเป็น 3-4 ตัวอักษร (Sep/Sept)
    expect(restoreLog.at).toMatch(/^\d{2} \w{3,4} \d{4} \d{2}:\d{2}$/);
    expect(restoreLog.at).not.toContain(",");
    expect(restoreLog.at).not.toContain("GMT");
  });

  test("13. mock data DEL-031 (คืนบัญชีแล้ว) มี audit log คืนบัญชีพร้อมเหตุผล + หมายเหตุ", async ({ page }) => {
    await openDeletionDetail(page, "DEL-031");
    const logs = await getAuditLogRows(page);
    const restoreLog = logs.find(l => l.action === "คืนบัญชี");
    expect(restoreLog).toBeTruthy();
    // mock data ควรมีเหตุผล + หมายเหตุ
    expect(restoreLog.note).toContain("ผู้ใช้ติดต่อ support และยืนยันตัวตนแล้ว");
    expect(restoreLog.note).toContain("หมายเหตุ:");
    expect(restoreLog.email).toContain("Email ส่งแล้ว");
  });

  test("14. mock data DEL-028 (ปฏิเสธคืนบัญชี) มี audit log ปฏิเสธพร้อมเหตุผล + หมายเหตุ", async ({ page }) => {
    await openDeletionDetail(page, "DEL-028");
    const logs = await getAuditLogRows(page);
    const rejectLog = logs.find(l => l.action === "ปฏิเสธคืนบัญชี");
    expect(rejectLog).toBeTruthy();
    expect(rejectLog.email).toContain("Email ส่งแล้ว");
    expect(rejectLog.note).toContain("พฤติกรรมละเมิดซ้ำ");
    expect(rejectLog.note).toContain("หมายเหตุ:");
  });

  test("15. คำขอที่คืนบัญชีแล้ว (DEL-031) ไม่แสดงปุ่ม action", async ({ page }) => {
    await openDeletionDetail(page, "DEL-031");
    await expect(page.locator('[data-deletion-action="restore"]')).toHaveCount(0);
    await expect(page.locator('[data-deletion-action="reject-restore"]')).toHaveCount(0);
  });

  test("16. คำขอที่ลบบัญชีแล้ว (DEL-025) ไม่แสดงปุ่ม action", async ({ page }) => {
    await openDeletionDetail(page, "DEL-025");
    await expect(page.locator('[data-deletion-action="restore"]')).toHaveCount(0);
    await expect(page.locator('[data-deletion-action="reject-restore"]')).toHaveCount(0);
  });

  test("17. ไม่มีคำว่า 'เก็บถาวร' ในหน้า detail", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    const bodyText = await page.locator('.deletion-detail-page').textContent();
    expect(bodyText).not.toContain("เก็บถาวร");
  });

  test("18. ผลกระทบต่อผู้ใช้ใน modal คืนบัญชีใช้คำว่า 'ลบบัญชี' ไม่ใช่ 'เก็บถาวร'", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await page.click('[data-deletion-action="restore"]');
    await page.waitForSelector('#user-action-modal.show', { timeout: 3000 });
    const modalText = await page.locator('#user-action-modal-body').textContent();
    expect(modalText).not.toContain("เก็บถาวร");
  });
});
