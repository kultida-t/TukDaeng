// QA-BO-013k: Settings > Admin Accounts — Resend Invitation Flow (AIL-005)
// อ้างอิง prototype — commitAdminInvitationResend / requestAdminInvitationAction /
//   ensureAdminInvitationResendAuditEvent / openAdminInvitationResendModal / resendIssuanceLog
// contract: 01_AUTHENTICATION_MODULE.md §10.1 — cooldown 60s, quota 5/rolling 24h ต่อ target,
//   issuance ใหม่ supersede Pending เดิมทันที, audit ทุก attempt, provider failure ไม่ rollback
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

async function openDetail(page, id) {
  await goToAdminAccounts(page);
  await page.locator(`.admin-account-row[data-admin-account-card="${id}"] .user-cell-primary[data-label="Admin ID"]`).click();
  await page.waitForTimeout(300);
}

function invitationSection(page) {
  return page.locator("[data-admin-invitation-section]");
}

// helper: เลือก Test flow ใน resend modal (เปิด details → trigger → option)
async function pickResendTestFlow(page, value) {
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

// helper: resend ผ่าน UI จนจบ — เปิด modal → (เลือก test flow) → ยืนยัน
async function resendViaUI(page, testFlow = "sent") {
  await invitationSection(page).locator('[data-admin-invitation-action="resend"]').click();
  await page.waitForTimeout(300);
  if (testFlow !== "sent") await pickResendTestFlow(page, testFlow);
  await page.locator("[data-admin-invitation-resend-confirm]").click();
  await page.waitForTimeout(300);
}

// helper: ปลด cooldown ของ current invitation (จำลองเวลาผ่านไปแล้ว) — in-memory เท่านั้น
async function clearResendCooldown(page) {
  await page.evaluate(() => {
    const current = adminAccountData.invitations
      .filter(i => i.targetAdminId === "ADM-008" && i.status === "Pending")
      .sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt))[0];
    if (current) current.resendAvailableAt = new Date(Date.now() - 1000).toISOString();
  });
}

test.describe("QA-BO-013k: Settings > Admin Accounts — resend invitation flow", () => {

  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");
  });

  // ---- 1. happy path: confirm → supersede เดิม + revision ใหม่ + delivery + quota/cooldown + audit + history ----

  test("1. resend สำเร็จ: INV-00001 → Superseded, INV-00002 Pending (rev 2), delivery Sent, quota 1/5 + cooldown, audit Success", async ({ page }) => {
    await openDetail(page, "ADM-008");
    await resendViaUI(page);

    // toast ยืนยัน + modal ปิด — Sent: semantic success + title/message ตาม outcome
    const toast = page.locator("#success-toast");
    await expect(toast).toBeVisible();
    await expect(toast).not.toHaveClass(/error/);
    await expect(toast).not.toHaveClass(/warning/);
    await expect(toast).toHaveAttribute("role", "status");
    await expect(toast.locator("strong")).toHaveText("ส่งคำเชิญแล้ว");
    await expect(toast).toContainText("INV-00002 · ส่งอีเมลสำเร็จ");
    await expect(page.locator("#user-action-modal.show")).toHaveCount(0);

    // data-level: เก่า Superseded + ชี้ไป record ใหม่, ใหม่ Pending rev 2
    const state = await page.evaluate(() => ({
      old: adminAccountData.invitations.find(i => i.id === "INV-00001"),
      current: getCurrentAdminInvitation("ADM-008"),
      delivery: adminAccountData.deliveryAttempts.find(d => d.id === "DLV-ACCT-008-INV-002"),
      log: adminAccountData.resendIssuanceLog["ADM-008"],
      acc: adminAccountData.accounts.find(a => a.id === "ADM-008"),
      audit: auditLogData.events[0]
    }));
    expect(state.old.status).toBe("Superseded");
    expect(state.old.supersededByInvitationId).toBe("INV-00002");
    expect(state.current.id).toBe("INV-00002");
    expect(state.current.status).toBe("Pending");
    expect(state.current.tokenRevision).toBe(2);
    expect(state.current.accountRevision).toBe(2);
    expect(state.acc.revision).toBe(2);
    expect(state.acc.invitationId).toBe("INV-00002");
    expect(state.acc.status).toBe("Invited");
    expect(state.delivery.status).toBe("Sent");
    expect(state.delivery.invitationId).toBe("INV-00002");
    expect(state.delivery.attemptSequence).toBe(2);
    expect(state.delivery.recipientMasked).toBe("na***@tukdaeng.example");
    expect(state.log).toHaveLength(1);
    // cooldown 60s ติดกับ invitation ใหม่
    expect(new Date(state.current.resendAvailableAt).getTime()).toBeGreaterThan(Date.now());

    // audit: canonical event + result Success + ไม่มี secret field
    expect(state.audit.eventType).toBe("ADMIN_INVITATION_RESEND");
    expect(state.audit.result).toBe("Success");
    expect(state.audit.supersededInvitationId).toBe("INV-00001");
    expect(state.audit.invitationId).toBe("INV-00002");
    expect(state.audit.deliveryId).toBe("DLV-ACCT-008-INV-002");
    const auditJson = JSON.stringify(state.audit).toLowerCase();
    expect(auditJson).not.toContain("token_hash");
    expect(auditJson).not.toContain("password");
    expect(auditJson).not.toContain("secret");

    // UI: tile แสดง invitation ใหม่ + quota 1/5 + cooldown, resend หายเพราะติด cooldown
    const section = invitationSection(page);
    await expect(section.locator(".detail-tile").nth(0).locator("strong")).toHaveText("INV-00002");
    await expect(section.locator(".detail-tile").nth(4).locator(".pill.green")).toHaveText("Sent");
    await expect(section.locator(".detail-tile").nth(5).locator("strong")).toContainText("1/5");
    await expect(section.locator(".detail-tile").nth(5).locator("strong")).toContainText("ส่งใหม่ได้หลัง");
    await expect(section.locator(".admin-invitation-history")).toContainText("INV-00001 · Superseded");
    await expect(section.locator('[data-admin-invitation-action="resend"]')).toHaveCount(0);
    await expect(section.locator('[data-admin-invitation-action="cancel"]')).toBeVisible();

    // History & Actions: row ใหม่มี audit link — delivery ref pill ไม่ render (data ผูกอยู่ใน activity.deliveryRef ที่ assert ผ่าน state.delivery แล้ว)
    const historyRow = page.locator(".admin-account-action-section tbody tr").first();
    await expect(historyRow).toContainText("Invitation Resent");
    await expect(historyRow.locator(".history-delivery-ref")).toHaveCount(0);
    await expect(historyRow.locator("button.history-audit-link")).toHaveText(state.audit.id);
  });

  // ---- 2. stale protection: token/invitation เดิมใช้ไม่ได้ทันทีหลัง resend ----

  test("2. หลัง resend: dispatch ด้วย invitation/tokenRevision เก่า → stale_invitation + audit Failed + ไม่มี mutation", async ({ page }) => {
    await openDetail(page, "ADM-008");
    await resendViaUI(page);
    // ปลด cooldown ก่อน — capability gate มาก่อน stale check, ต้องผ่าน cooldown ถึงจะเห็น stale_invitation
    await clearResendCooldown(page);

    const before = await page.evaluate(() => ({
      invitations: adminAccountData.invitations.length,
      deliveries: adminAccountData.deliveryAttempts.length,
      log: adminAccountData.resendIssuanceLog["ADM-008"].length
    }));
    const stale = await page.evaluate(() =>
      requestAdminInvitationAction("resend", "ADM-008", { invitationId: "INV-00001", tokenRevision: 1 }));
    expect(stale).toMatchObject({ ok: false, code: "stale_invitation" });

    // blocked attempt ต้อง audit (result Failed + failureCode)
    const audit = await page.evaluate(() => auditLogData.events[0]);
    expect(audit.eventType).toBe("ADMIN_INVITATION_RESEND");
    expect(audit.result).toBe("Failed");
    expect(audit.failureCode).toBe("STALE_INVITATION");

    const after = await page.evaluate(() => ({
      invitations: adminAccountData.invitations.length,
      deliveries: adminAccountData.deliveryAttempts.length,
      log: adminAccountData.resendIssuanceLog["ADM-008"].length,
      currentStatus: getCurrentAdminInvitation("ADM-008").status
    }));
    expect(after.invitations).toBe(before.invitations);
    expect(after.deliveries).toBe(before.deliveries);
    expect(after.log).toBe(before.log); // rejected attempt ไม่นับ quota
    expect(after.currentStatus).toBe("Pending");
  });

  // ---- 3. stale accountRevision ----

  test("3. dispatch ด้วย accountRevision เก่า → stale_invitation + ไม่มี mutation", async ({ page }) => {
    await openDetail(page, "ADM-008");
    const stale = await page.evaluate(() =>
      requestAdminInvitationAction("resend", "ADM-008", { accountRevision: 99 }));
    expect(stale).toMatchObject({ ok: false, code: "stale_invitation" });
    const ok = await page.evaluate(() =>
      requestAdminInvitationAction("resend", "ADM-008", { invitationId: "INV-00001", tokenRevision: 1, accountRevision: 1 }));
    expect(ok).toMatchObject({ ok: true, code: "validated" });
  });

  // ---- 4. cooldown 60s: ติดทันทีหลัง resend, ปลดเมื่อครบเวลา ----

  test("4. cooldown: resend ครั้งถัดไปถูก block (cooldown_active + audit) จนกว่าครบ 60 วินาที", async ({ page }) => {
    await openDetail(page, "ADM-008");
    await resendViaUI(page);

    // dispatch ทันที → cooldown_active (ไม่ใช่ not_allowed) + audit Failed
    const blocked = await page.evaluate(() => requestAdminInvitationAction("resend", "ADM-008"));
    expect(blocked).toMatchObject({ ok: false, code: "cooldown_active" });
    const audit = await page.evaluate(() => auditLogData.events[0]);
    expect(audit.result).toBe("Failed");
    expect(audit.failureCode).toBe("COOLDOWN_ACTIVE");
    // capability ก็ปิด → ปุ่มไม่อยู่ใน DOM (rendered หลัง resend แล้วใน test 1)
    const caps = await page.evaluate(() =>
      getAdminInvitationCapabilities(adminAccountData.accounts.find(a => a.id === "ADM-008")));
    expect(caps.resend).toBe(false);
    expect(caps.cancel).toBe(true);

    // จำลองเวลาผ่าน cooldown → resend กลับมาใช้ได้
    await clearResendCooldown(page);
    const afterCooldown = await page.evaluate(() => requestAdminInvitationAction("resend", "ADM-008"));
    expect(afterCooldown).toMatchObject({ ok: true, code: "validated" });
  });

  // ---- 5. quota: 5 ครั้ง/rolling 24h ต่อ target — ครั้งที่ 5 ผ่าน, ครั้งที่ 6 ถูก block ----

  test("5. quota: resend สำเร็จครบ 5 ครั้งใน 24h → ครั้งที่ 6 quota_exceeded + audit + ไม่มี mutation", async ({ page }) => {
    await openDetail(page, "ADM-008");

    // commit 5 ครั้งต่อเนื่อง (ปลด cooldown ระหว่างครั้ง — จำลองเวลาผ่านไป)
    for (let i = 0; i < 5; i++) {
      await clearResendCooldown(page);
      const res = await page.evaluate(() => commitAdminInvitationResend("ADM-008", {}, "sent"));
      expect(res.ok).toBe(true);
    }
    const quotaState = await page.evaluate(() => ({
      count: getAdminInvitationResendCount24h("ADM-008"),
      caps: getAdminInvitationCapabilities(adminAccountData.accounts.find(a => a.id === "ADM-008"))
    }));
    expect(quotaState.count).toBe(5);
    expect(quotaState.caps.resend).toBe(false);
    expect(quotaState.caps.cancel).toBe(true); // quota เต็มไม่กระทบ cancel

    // ครั้งที่ 6 → quota_exceeded (ปลด cooldown ก่อนเพื่อให้ code แยกได้ชัด)
    const before = await page.evaluate(() => ({
      invitations: adminAccountData.invitations.length,
      deliveries: adminAccountData.deliveryAttempts.length
    }));
    await clearResendCooldown(page);
    const blocked = await page.evaluate(() => requestAdminInvitationAction("resend", "ADM-008"));
    expect(blocked).toMatchObject({ ok: false, code: "quota_exceeded" });
    const audit = await page.evaluate(() => auditLogData.events[0]);
    expect(audit.result).toBe("Failed");
    expect(audit.failureCode).toBe("QUOTA_EXCEEDED");
    const after = await page.evaluate(() => ({
      invitations: adminAccountData.invitations.length,
      deliveries: adminAccountData.deliveryAttempts.length
    }));
    expect(after).toEqual(before); // ไม่มี partial mutation
  });

  // ---- 6. rolling window: issuance เก่ากว่า 24h ไม่นับ quota ----

  test("6. rolling 24h: log entry เก่ากว่า window ถูก prune — quota คืนและ resend ได้", async ({ page }) => {
    await openDetail(page, "ADM-008");
    // seed 5 entries: 4 เก่ากว่า 24h + 1 ใหม่ → นับเหลือ 1
    await page.evaluate(() => {
      const dayAgo = Date.now() - 25 * 60 * 60 * 1000;
      adminAccountData.resendIssuanceLog["ADM-008"] = [
        new Date(dayAgo).toISOString(),
        new Date(dayAgo - 1000).toISOString(),
        new Date(dayAgo - 2000).toISOString(),
        new Date(dayAgo - 3000).toISOString(),
        new Date(Date.now() - 60 * 60 * 1000).toISOString()
      ];
    });
    const count = await page.evaluate(() => getAdminInvitationResendCount24h("ADM-008"));
    expect(count).toBe(1);
    const res = await page.evaluate(() => commitAdminInvitationResend("ADM-008", {}, "sent"));
    expect(res.ok).toBe(true);
  });

  // ---- 7. quota นับรวมทุก actor — issuance ที่ commit แล้วนับเข้า quota ของ target เสมอ ----

  test("7. quota aggregate ทุก actor: log 4 ครั้ง (actor อื่น) + resend ผ่าน UI 1 ครั้ง → ครบ 5, ครั้งถัดไปถูก block", async ({ page }) => {
    await openDetail(page, "ADM-008");
    // จำลอง resend ที่ actor อื่น commit ไปแล้ว — log เป็น per-target ไม่ผูก actor
    await page.evaluate(() => {
      adminAccountData.resendIssuanceLog["ADM-008"] = [1, 2, 3, 4]
        .map(h => new Date(Date.now() - h * 60 * 60 * 1000).toISOString());
      renderAdminAccountDetail("ADM-008");
    });
    await page.waitForTimeout(200);
    // tile แสดง 4/5 ก่อน resend
    await expect(invitationSection(page).locator(".detail-tile").nth(5).locator("strong")).toContainText("4/5");
    await resendViaUI(page);
    const count = await page.evaluate(() => getAdminInvitationResendCount24h("ADM-008"));
    expect(count).toBe(5);
    await clearResendCooldown(page);
    const blocked = await page.evaluate(() => requestAdminInvitationAction("resend", "ADM-008"));
    expect(blocked).toMatchObject({ ok: false, code: "quota_exceeded" });
  });

  // ---- 8-9. provider failure: Failed/Retry ไม่ rollback issuance, account คง Invited ----

  test("8. delivery Failed: issuance commit แล้ว — account Invited, invitation ใหม่ Pending, delivery Failed, resend ได้หลัง cooldown", async ({ page }) => {
    await openDetail(page, "ADM-008");
    await resendViaUI(page, "failed");
    // toast: Failed → semantic error + title/message ตาม outcome
    const toast = page.locator("#success-toast");
    await expect(toast).toHaveClass(/error/);
    await expect(toast).toHaveAttribute("role", "alert");
    await expect(toast.locator("strong")).toHaveText("ส่งอีเมลไม่สำเร็จ");
    await expect(toast).toContainText("INV-00002 ถูกสร้างแล้ว · ลองส่งใหม่ได้ภายหลัง");
    const state = await page.evaluate(() => ({
      acc: adminAccountData.accounts.find(a => a.id === "ADM-008"),
      current: getCurrentAdminInvitation("ADM-008"),
      delivery: adminAccountData.deliveryAttempts.find(d => d.id === "DLV-ACCT-008-INV-002"),
      log: adminAccountData.resendIssuanceLog["ADM-008"].length,
      audit: auditLogData.events[0]
    }));
    expect(state.acc.status).toBe("Invited");
    expect(state.current.status).toBe("Pending");
    expect(state.delivery.status).toBe("Failed");
    expect(state.log).toBe(1); // issuance commit แล้วนับ quota แม้ delivery fail
    expect(state.audit.result).toBe("Success");
    expect(state.audit.deliveryStatus).toBe("Failed");
    // UI: Latest Delivery = Failed + safe message
    const section = invitationSection(page);
    await expect(section.locator(".detail-tile").nth(4).locator(".pill.red")).toHaveText("Failed");
    await expect(section.locator(".admin-invitation-message")).toContainText("ส่งไม่สำเร็จ");
    // recovery ได้หลัง cooldown
    await clearResendCooldown(page);
    const retry = await page.evaluate(() => requestAdminInvitationAction("resend", "ADM-008"));
    expect(retry.ok).toBe(true);
  });

  test("9. delivery Retry: account Invited, invitation Pending, delivery Retry + safe message", async ({ page }) => {
    await openDetail(page, "ADM-008");
    await resendViaUI(page, "retry");
    // toast: Retry → semantic warning + title/message ตาม outcome
    const toast = page.locator("#success-toast");
    await expect(toast).toHaveClass(/warning/);
    await expect(toast).toHaveAttribute("role", "status");
    await expect(toast.locator("strong")).toHaveText("รอส่งอีเมลอีกครั้ง");
    await expect(toast).toContainText("INV-00002 ถูกสร้างแล้ว · อยู่ในคิว Retry");
    const state = await page.evaluate(() => ({
      acc: adminAccountData.accounts.find(a => a.id === "ADM-008"),
      current: getCurrentAdminInvitation("ADM-008"),
      delivery: adminAccountData.deliveryAttempts.find(d => d.id === "DLV-ACCT-008-INV-002")
    }));
    expect(state.acc.status).toBe("Invited");
    expect(state.current.status).toBe("Pending");
    expect(state.delivery.status).toBe("Retry");
    const section = invitationSection(page);
    await expect(section.locator(".detail-tile").nth(4).locator(".pill.amber")).toHaveText("Retry");
    await expect(section.locator(".admin-invitation-message")).toContainText("Retry");
  });

  // ---- 10. permission denied: dispatch ตรง reject + audit + ไม่มี mutation ----

  test("10. permission denied: resend dispatch → not_allowed + audit Failed + ไม่มี mutation", async ({ page }) => {
    await openDetail(page, "ADM-008");
    const denied = await page.evaluate(() => {
      window.__origCanManage = canManageAdminAccounts;
      window.canManageAdminAccounts = () => false;
      const result = requestAdminInvitationAction("resend", "ADM-008");
      window.canManageAdminAccounts = window.__origCanManage;
      return result;
    });
    expect(denied).toMatchObject({ ok: false, code: "not_allowed" });
    const audit = await page.evaluate(() => auditLogData.events[0]);
    expect(audit.eventType).toBe("ADMIN_INVITATION_RESEND");
    expect(audit.result).toBe("Failed");
    expect(audit.failureCode).toBe("NOT_ALLOWED");
    const state = await page.evaluate(() => ({
      invitations: adminAccountData.invitations.length,
      deliveries: adminAccountData.deliveryAttempts.length,
      log: adminAccountData.resendIssuanceLog["ADM-008"].length
    }));
    expect(state).toEqual({ invitations: 1, deliveries: 1, log: 0 });
  });

  // ---- 11. modal: masked recipient + quota + expected revision, cancel ไม่ mutate, ไม่มี secret ----

  test("11. resend modal: masked email, quota usage, expected attrs ครบ; ยกเลิกไม่มี mutation; ไม่รั่ว raw email/token", async ({ page }) => {
    await openDetail(page, "ADM-008");
    await invitationSection(page).locator('[data-admin-invitation-action="resend"]').click();
    await page.waitForTimeout(300);
    const modal = page.locator("#user-action-modal");
    const html = await modal.innerHTML();
    expect(html).toContain("na***@tukdaeng.example");
    expect(html).not.toContain("nattapol@tukdaeng.example");
    expect(html.toLowerCase()).not.toContain("token_hash");
    await expect(modal.locator(".option-confirm-label").nth(3)).toHaveText("Resend Quota");
    await expect(modal.locator(".option-confirm-value").nth(3)).toContainText("ใช้ไป 0/5");
    const confirm = modal.locator("[data-admin-invitation-resend-confirm]");
    await expect(confirm).toHaveAttribute("data-expected-invitation-id", "INV-00001");
    await expect(confirm).toHaveAttribute("data-expected-token-revision", "1");
    await expect(confirm).toHaveAttribute("data-expected-account-revision", "1");
    // ยกเลิก → modal ปิด + ไม่มี mutation
    await modal.locator(".user-action-footer [data-user-action-modal-close]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal.show")).toHaveCount(0);
    const state = await page.evaluate(() => ({
      invitations: adminAccountData.invitations.length,
      deliveries: adminAccountData.deliveryAttempts.length,
      log: adminAccountData.resendIssuanceLog["ADM-008"].length
    }));
    expect(state).toEqual({ invitations: 1, deliveries: 1, log: 0 });
  });

  // ---- 12. double-confirm/replay: expected ใน modal เป็น snapshot — กดยืนยันซ้ำหลัง commit ต้อง stale ----

  test("12. replay: modal เก่าที่ snapshot revision เดิม กดยืนยันซ้ำหลัง commit แล้ว → stale_invitation ไม่สร้าง invitation ซ้ำ", async ({ page }) => {
    await openDetail(page, "ADM-008");
    // เปิด modal 2 ครั้ง (modal แรกถูกแทนที่ แต่เรียก commit ตรงด้วย expected เดิมเพื่อจำลอง replay)
    await resendViaUI(page); // commit ครั้งแรก → INV-00002 rev 2
    await clearResendCooldown(page); // ผ่าน capability gate ก่อนถึง stale check
    const replayed = await page.evaluate(() =>
      commitAdminInvitationResend("ADM-008", { invitationId: "INV-00001", tokenRevision: 1, accountRevision: 1 }, "sent"));
    expect(replayed).toMatchObject({ ok: false, code: "stale_invitation" });
    const count = await page.evaluate(() => adminAccountData.invitations.length);
    expect(count).toBe(2); // ไม่มี invitation ที่สาม
  });
});

// ---- responsive: resend modal + context หลัง resend บน mobile/tablet ----

test.describe("QA-BO-013k: resend flow — responsive", () => {

  test("13. resend modal + ผลลัพธ์หลัง commit render ครบบนทุก viewport", async ({ page }) => {
    await openDetail(page, "ADM-008");
    await invitationSection(page).locator('[data-admin-invitation-action="resend"]').click();
    await page.waitForTimeout(300);
    const modal = page.locator("#user-action-modal");
    await expect(modal).toHaveClass(/show/);
    await expect(modal.locator("[data-admin-invitation-resend-confirm]")).toBeVisible();
    await modal.locator("[data-admin-invitation-resend-confirm]").click();
    await page.waitForTimeout(300);
    const section = invitationSection(page);
    await expect(section).toBeVisible();
    await expect(section.locator(".detail-tile").nth(0).locator("strong")).toHaveText("INV-00002");
    await expect(section.locator(".admin-invitation-history")).toContainText("INV-00001 · Superseded");
  });
});
