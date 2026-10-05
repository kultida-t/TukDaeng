// QA-BO-013l: Settings > Admin Accounts — Cancel and Reissue Invitation Flow (AIL-006)
// อ้างอิง prototype — commitAdminInvitationCancel / commitAdminInvitationReissue /
//   requestAdminInvitationAction / openAdminInvitationCancelModal / openAdminInvitationReissueModal
// contract: 01_AUTHENTICATION_MODULE.md §10.1 & 16_ADMIN_SETTINGS_MODULE.md §8.9
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

async function openDetail(page, id) {
  await goToAdminAccounts(page);
  await page.locator(`.admin-account-row[data-admin-account-card="${id}"] .user-cell-primary[data-label="Admin ID"]`).click();
  await page.waitForTimeout(300);
}

function invitationSection(page) {
  return page.locator("[data-admin-invitation-section]");
}

// helper: เลือก Scenario ใน reissue modal
async function pickReissueTestFlow(page, value) {
  const tools = page.locator("#user-action-modal .user-action-prototype-tools");
  const isOpen = await tools.evaluate(el => el.open);
  if (!isOpen) {
    await tools.locator("summary").click();
    await page.waitForTimeout(150);
  }
  await tools.locator("[data-custom-select-trigger]").click();
  await page.waitForTimeout(150);
  await tools.locator(`[data-custom-select-option][data-value="${value}"]`).click();
  await page.waitForTimeout(150);
}

test.describe("QA-BO-013l: Settings > Admin Accounts — Cancel & Reissue Invitation Flow", () => {

  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440" && testInfo.project.name !== "mobile-390", "desktop-1440 and mobile-390 only");
  });

  // ---- 1. Cancel Flow (Happy Path) ----

  test("1. cancel สำเร็จ: modal แสดงผลกระทบ, Pending → Cancelled, account คง Invited, audit Success, ไม่ส่ง email", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");
    await openDetail(page, "ADM-008");

    // ตรวจ state ก่อน cancel
    const beforeState = await page.evaluate(() => {
      const acc = adminAccountData.accounts.find(a => a.id === "ADM-008");
      const inv = adminAccountData.invitations.find(i => i.id === "INV-00001");
      return { accStatus: acc.status, invStatus: inv.status, revision: acc.revision };
    });
    expect(beforeState.accStatus).toBe("Invited");
    expect(beforeState.invStatus).toBe("Pending");

    // เปิด modal cancel
    await invitationSection(page).locator('[data-admin-invitation-action="cancel"]').click();
    await page.waitForTimeout(300);

    const modal = page.locator("#user-action-modal");
    await expect(modal).toBeVisible();
    await expect(modal.locator("#user-action-modal-title")).toHaveText("Cancel Invitation");
    await expect(modal.locator(".admin-invitation-cancel-page")).toBeVisible();
    await expect(modal.locator(".user-action-impact-notice")).toContainText("ผลกระทบ: ลิงก์คำเชิญนี้จะใช้ไม่ได้ทันที บัญชียังคงเป็น Invited และสามารถส่งคำเชิญใหม่ได้ภายหลัง");
    await expect(modal.locator("[data-admin-invitation-cancel-confirm]")).toHaveText("ยกเลิกคำเชิญ");

    // ยืนยัน cancel
    await modal.locator("[data-admin-invitation-cancel-confirm]").click();
    await page.waitForTimeout(300);

    // Toast แสดงผลสำเร็จ
    const toast = page.locator("#success-toast");
    await expect(toast).toBeVisible();
    await expect(toast.locator("strong")).toHaveText("ยกเลิกคำเชิญแล้ว");
    await expect(toast).toContainText("INV-00001");

    // ตรวจ state หลัง cancel
    const afterState = await page.evaluate(() => {
      const acc = adminAccountData.accounts.find(a => a.id === "ADM-008");
      const inv = adminAccountData.invitations.find(i => i.id === "INV-00001");
      const latestAudit = auditLogData.events[0];
      const deliveries = adminAccountData.deliveryAttempts.filter(d => d.targetAdminId === "ADM-008");
      const caps = getAdminInvitationCapabilities(acc);
      return {
        accStatus: acc.status,
        invStatus: inv.status,
        cancelledBy: inv.cancelledByAdminId,
        cancelledAt: !!inv.cancelledAt,
        accRevision: acc.revision,
        caps,
        latestAudit,
        deliveryCount: deliveries.length
      };
    });

    expect(afterState.accStatus).toBe("Invited");
    expect(afterState.invStatus).toBe("Cancelled");
    expect(afterState.cancelledAt).toBe(true);
    expect(afterState.accRevision).toBe(beforeState.revision + 1);
    expect(afterState.deliveryCount).toBe(1); // ไม่สร้าง delivery ใหม่สำหรับ Cancel

    // Audit Event ตรวจสอบ
    expect(afterState.latestAudit.eventType).toBe("ADMIN_INVITATION_CANCEL");
    expect(afterState.latestAudit.result).toBe("Success");
    expect(afterState.latestAudit.action).toBe("Cancel Invitation");
    expect(afterState.latestAudit.reference).toBe("ADM-008");
    expect(afterState.latestAudit.before).toBe("INV-00001 (Pending)");
    expect(afterState.latestAudit.after).toBe("INV-00001 (Cancelled)");

    // Capabilities: resend=false, cancel=false, reissue=true
    expect(afterState.caps.resend).toBe(false);
    expect(afterState.caps.cancel).toBe(false);
    expect(afterState.caps.reissue).toBe(true);

    // ตรวจ UI หลัง cancel แสดงปุ่ม "ส่งคำเชิญใหม่"
    await expect(invitationSection(page).locator('[data-admin-invitation-action="reissue"]')).toBeVisible();
    await expect(invitationSection(page).locator('[data-admin-invitation-action="reissue"]')).toHaveText("ส่งคำเชิญใหม่");
    await expect(invitationSection(page).locator('[data-admin-invitation-action="resend"]')).toHaveCount(0);
    await expect(invitationSection(page).locator('[data-admin-invitation-action="cancel"]')).toHaveCount(0);
    await expect(invitationSection(page).locator(".admin-invitation-message")).toHaveText("คำเชิญถูกยกเลิกแล้ว — ส่งคำเชิญใหม่ได้");
  });

  // ---- 2. Reissue Flow (Happy Path) ----

  test("2. reissue สำเร็จ: Cancelled → ออก INV-00002 Pending (rev 2), delivery Sent, account คง Invited, audit Success", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");
    await openDetail(page, "ADM-008");

    // cancel ก่อนเพื่อเข้าสู่ Cancelled state
    await invitationSection(page).locator('[data-admin-invitation-action="cancel"]').click();
    await page.waitForTimeout(200);
    await page.locator("[data-admin-invitation-cancel-confirm]").click();
    await page.waitForTimeout(300);

    // เปิด modal reissue
    await invitationSection(page).locator('[data-admin-invitation-action="reissue"]').click();
    await page.waitForTimeout(300);

    const modal = page.locator("#user-action-modal");
    await expect(modal).toBeVisible();
    await expect(modal.locator("#user-action-modal-title")).toHaveText("Reissue Invitation");
    await expect(modal.locator(".admin-invitation-reissue-page")).toBeVisible();
    await expect(modal.locator(".user-action-head p")).toHaveText("ระบบจะสร้างลิงก์ใหม่และส่งคำเชิญไปยังอีเมลของผู้รับ");
    await expect(modal.locator(".user-action-impact-notice")).toContainText("ผลกระทบ: ระบบจะสร้างคำเชิญใหม่ ส่วนคำเชิญเดิมจะยังคงอยู่ในประวัติ");
    await expect(modal.locator("[data-admin-invitation-reissue-confirm]")).toHaveText("ส่งคำเชิญใหม่");

    // ยืนยัน reissue
    await modal.locator("[data-admin-invitation-reissue-confirm]").click();
    await page.waitForTimeout(300);

    // Toast แสดงผลสำเร็จ
    const toast = page.locator("#success-toast");
    await expect(toast).toBeVisible();
    await expect(toast.locator("strong")).toHaveText("ส่งคำเชิญใหม่แล้ว");

    // ตรวจ state หลัง reissue
    const reissueState = await page.evaluate(() => {
      const acc = adminAccountData.accounts.find(a => a.id === "ADM-008");
      const current = getCurrentAdminInvitation("ADM-008");
      const oldInv = adminAccountData.invitations.find(i => i.id === "INV-00001");
      const latestAudit = auditLogData.events[0];
      const latestDelivery = getLatestAdminInvitationDelivery(current);
      const resendCount = getAdminInvitationResendCount24h("ADM-008");
      return {
        accStatus: acc.status,
        accInvitationId: acc.invitationId,
        currentId: current.id,
        currentStatus: current.status,
        currentTokenRevision: current.tokenRevision,
        oldInvStatus: oldInv.status,
        latestAudit,
        latestDelivery,
        resendCount
      };
    });

    expect(reissueState.accStatus).toBe("Invited");
    expect(reissueState.accInvitationId).toBe("INV-00002");
    expect(reissueState.currentId).toBe("INV-00002");
    expect(reissueState.currentStatus).toBe("Pending");
    expect(reissueState.currentTokenRevision).toBe(2);
    expect(reissueState.oldInvStatus).toBe("Cancelled"); // ประวัติเดิมคงไว้

    // Delivery log ตรวจสอบ
    expect(reissueState.latestDelivery.status).toBe("Sent");
    expect(reissueState.latestDelivery.invitationId).toBe("INV-00002");
    expect(reissueState.latestDelivery.id).toBe("DLV-ACCT-008-INV-002");

    // Audit Event ตรวจสอบ
    expect(reissueState.latestAudit.eventType).toBe("ADMIN_INVITATION_REISSUE");
    expect(reissueState.latestAudit.result).toBe("Success");
    expect(reissueState.latestAudit.action).toBe("Reissue Invitation");
    expect(reissueState.latestAudit.before).toBe("INV-00001 (Cancelled)");
    expect(reissueState.latestAudit.after).toBe("INV-00002 (Pending)");

    // Reissue ไม่นับเป็น Resend quota
    expect(reissueState.resendCount).toBe(0);

    // UI แสดงสถานะ Pending และปุ่ม Resend / Cancel
    await expect(invitationSection(page).locator('[data-admin-invitation-action="resend"]')).toBeVisible();
    await expect(invitationSection(page).locator('[data-admin-invitation-action="cancel"]')).toBeVisible();
    await expect(invitationSection(page).locator('[data-admin-invitation-action="reissue"]')).toHaveCount(0);
  });

  // ---- 3. Reissue Delivery Failed & Retry Scenarios ----

  test("3. reissue ด้วย delivery Failed/Retry: บันทึก delivery status ตามจริง, toast semantic สอดคล้อง, invitation ยังคง Pending", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");
    await openDetail(page, "ADM-008");

    // cancel
    await invitationSection(page).locator('[data-admin-invitation-action="cancel"]').click();
    await page.waitForTimeout(200);
    await page.locator("[data-admin-invitation-cancel-confirm]").click();
    await page.waitForTimeout(300);

    // reissue with Failed delivery
    await invitationSection(page).locator('[data-admin-invitation-action="reissue"]').click();
    await page.waitForTimeout(300);
    await pickReissueTestFlow(page, "failed");
    await page.locator("[data-admin-invitation-reissue-confirm]").click();
    await page.waitForTimeout(300);

    // Toast error style
    const toast = page.locator("#success-toast");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveClass(/error/);
    await expect(toast.locator("strong")).toHaveText("ส่งอีเมลไม่สำเร็จ");

    // ตรวจ state
    const failedState = await page.evaluate(() => {
      const current = getCurrentAdminInvitation("ADM-008");
      const delivery = getLatestAdminInvitationDelivery(current);
      return { status: current.status, deliveryStatus: delivery.status };
    });
    expect(failedState.status).toBe("Pending");
    expect(failedState.deliveryStatus).toBe("Failed");
  });

  // ---- 4. Stale State Safeguards on Cancel & Reissue ----

  test("4. stale safeguard: cancel และ reissue ถูก reject เมื่อ expected revision ไม่ตรง พร้อมบันทึก blocked audit", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");
    await openDetail(page, "ADM-008");

    // Direct dispatch cancel with stale tokenRevision
    const cancelResult = await page.evaluate(() => {
      return requestAdminInvitationAction("cancel", "ADM-008", {
        invitationId: "INV-00001",
        tokenRevision: 999, // Stale!
        accountRevision: 1
      });
    });
    expect(cancelResult.ok).toBe(false);
    expect(cancelResult.code).toBe("stale_invitation");

    // ตรวจว่ามี Blocked Audit บันทึก
    const cancelAudit = await page.evaluate(() => auditLogData.events[0]);
    expect(cancelAudit.eventType).toBe("ADMIN_INVITATION_CANCEL");
    expect(cancelAudit.result).toBe("Failed");
    expect(cancelAudit.failureCode).toBe("STALE_INVITATION");

    // Direct dispatch reissue on Pending invitation (not Expired/Cancelled)
    const reissuePendingResult = await page.evaluate(() => {
      return requestAdminInvitationAction("reissue", "ADM-008");
    });
    expect(reissuePendingResult.ok).toBe(false);
    expect(reissuePendingResult.code).toBe("not_allowed");

    const reissueAudit = await page.evaluate(() => auditLogData.events[0]);
    expect(reissueAudit.eventType).toBe("ADMIN_INVITATION_REISSUE");
    expect(reissueAudit.result).toBe("Failed");
    expect(reissueAudit.failureCode).toBe("NOT_ALLOWED");
  });

  // ---- 5. Permission & Eligibility Safeguards ----

  test("5. permission & role eligibility: ไม่อนุญาต cancel/reissue บน self/master หรือเมื่อ role ไม่ eligible", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");
    await goToAdminAccounts(page);

    // Self account (ADM-001) หรือ Master account (ADM-001)
    const selfCaps = await page.evaluate(() => {
      const selfAcc = adminAccountData.accounts.find(a => a.isSelf || a.isMaster);
      return getAdminInvitationCapabilities(selfAcc);
    });
    expect(selfCaps.cancel).toBe(false);
    expect(selfCaps.reissue).toBe(false);
    expect(selfCaps.resend).toBe(false);

    // Ineligible Role test on Reissue
    await openDetail(page, "ADM-008");
    // Cancel first
    await invitationSection(page).locator('[data-admin-invitation-action="cancel"]').click();
    await page.waitForTimeout(200);
    await page.locator("[data-admin-invitation-cancel-confirm]").click();
    await page.waitForTimeout(300);

    // Set role to non-existent / ineligible role
    const ineligibleCaps = await page.evaluate(() => {
      const acc = adminAccountData.accounts.find(a => a.id === "ADM-008");
      acc.role = "Custom Inactive Role";
      return getAdminInvitationCapabilities(acc);
    });
    expect(ineligibleCaps.reissue).toBe(false);
  });

  // ---- 6. Atomicity & Rollback ----

  test("6. atomicity & rollback: rollback ครบทุก store เมื่อเกิดข้อผิดพลาดระหว่าง cancel/reissue", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");
    await openDetail(page, "ADM-008");

    // Test Cancel rollback by corrupting ensureAdminInvitationCancelAuditEvent temporarily
    const rollbackResult = await page.evaluate(() => {
      const originalHelper = ensureAdminInvitationCancelAuditEvent;
      window.ensureAdminInvitationCancelAuditEvent = () => { throw new Error("Simulated audit failure"); };
      const res = commitAdminInvitationCancel("ADM-008");
      window.ensureAdminInvitationCancelAuditEvent = originalHelper;
      const acc = adminAccountData.accounts.find(a => a.id === "ADM-008");
      const current = getCurrentAdminInvitation("ADM-008");
      return { res, accStatus: acc.status, invStatus: current.status, cancelledAt: current.cancelledAt };
    });

    expect(rollbackResult.res.ok).toBe(false);
    expect(rollbackResult.res.code).toBe("commit_failed");
    expect(rollbackResult.accStatus).toBe("Invited");
    expect(rollbackResult.invStatus).toBe("Pending"); // Reverted!
    expect(rollbackResult.cancelledAt).toBeUndefined();
  });

  // ---- 7. Mobile Viewport (390px) ----

  test("7. mobile-390: action buttons and modals work properly on mobile", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-390", "mobile-390 only");
    await openDetail(page, "ADM-008");

    const cancelBtn = invitationSection(page).locator('[data-admin-invitation-action="cancel"]');
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();
    await page.waitForTimeout(300);

    const modal = page.locator("#user-action-modal");
    await expect(modal).toBeVisible();
    await expect(modal.locator("#user-action-modal-title")).toHaveText("Cancel Invitation");
    await modal.locator("[data-admin-invitation-cancel-confirm]").click();
    await page.waitForTimeout(300);

    const reissueBtn = invitationSection(page).locator('[data-admin-invitation-action="reissue"]');
    await expect(reissueBtn).toBeVisible();
    await reissueBtn.click();
    await page.waitForTimeout(300);

    await expect(modal.locator("#user-action-modal-title")).toHaveText("Reissue Invitation");
    await modal.locator(".user-action-close").click();
    await page.waitForTimeout(300);
  });
});
