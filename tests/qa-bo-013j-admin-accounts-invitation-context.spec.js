// QA-BO-013j: Settings > Admin Accounts — Invitation Context & Action Gating (AIL-004)
// อ้างอิง prototype — getAdminInvitationContext / getAdminInvitationCapabilities /
//   requestAdminInvitationAction / applyAdminInvitationScenario + invitation section ใน renderAdminAccountDetail
// contract: 16_ADMIN_SETTINGS_MODULE.md §8.9 — capabilities เป็น server-calculated,
//   action ที่ไม่อนุญาตต้องไม่อยู่ใน DOM, direct dispatch ผ่าน boundary ต้อง reject unauthorized/stale
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

// helper: เลือก Prototype scenario ใน invitation section (เปิด details → trigger → option)
async function pickInvitationScenario(page, value) {
  const tools = page.locator(".admin-invitation-scenario-tools");
  const isOpen = await tools.evaluate(el => el.open);
  if (!isOpen) {
    await tools.locator("summary").click();
    await page.waitForTimeout(150);
  }
  await tools.locator("[data-custom-select-trigger]").click();
  await page.waitForTimeout(150);
  await tools.locator(`[data-custom-select-option][data-value="${value}"]`).click();
  await page.waitForTimeout(300);
}

async function invitationActionTexts(page) {
  return await invitationSection(page)
    .locator(".admin-invitation-actions button")
    .allTextContents()
    .then(texts => texts.map(t => t.trim()));
}

test.describe("QA-BO-013j: Settings > Admin Accounts — invitation context & action gating", () => {

  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");
  });

  // ---- 1. baseline: Invited + Pending (Sent) แสดง context ครบ + resend/cancel ----

  test("1. ADM-008 (Invited/Pending): invitation section แสดง ID/status/issued/expires/delivery/quota + resend & cancel", async ({ page }) => {
    await openDetail(page, "ADM-008");
    const section = invitationSection(page);
    await expect(section).toBeVisible();
    await expect(section.locator("h4")).toHaveText("Invitation");

    const tiles = section.locator(".detail-tile");
    await expect(tiles).toHaveCount(6);
    await expect(tiles.nth(0).locator("> span")).toHaveText("Invitation ID");
    await expect(tiles.nth(0).locator("strong")).toHaveText("INV-00001");
    await expect(tiles.nth(1).locator("> span")).toHaveText("Invitation Status");
    await expect(tiles.nth(1).locator(".pill.blue")).toHaveText("Pending");
    await expect(tiles.nth(2).locator("> span")).toHaveText("Issued");
    await expect(tiles.nth(3).locator("> span")).toHaveText("Expires");
    await expect(tiles.nth(4).locator("> span")).toHaveText("Latest Delivery");
    await expect(tiles.nth(4).locator(".pill.green")).toHaveText("Sent");
    await expect(tiles.nth(5).locator("> span")).toHaveText("Resend Quota / Cooldown");
    await expect(tiles.nth(5).locator("strong")).toContainText("0/5");
    await expect(tiles.nth(5).locator("strong")).toContainText("พร้อมส่งใหม่");

    // safe status message (role=status)
    await expect(section.locator(".admin-invitation-message")).toHaveAttribute("role", "status");
    await expect(section.locator(".admin-invitation-message")).toContainText("รอผู้รับยืนยันอีเมล");

    // gating: Pending → resend + cancel เท่านั้น (ไม่มี reissue)
    expect(await invitationActionTexts(page)).toEqual(["ส่งคำเชิญอีกครั้ง", "ยกเลิกคำเชิญ"]);
    await expect(section.locator('[data-admin-invitation-action="resend"]')).toBeVisible();
    await expect(section.locator('[data-admin-invitation-action="cancel"]')).toBeVisible();
    await expect(section.locator('[data-admin-invitation-action="reissue"]')).toHaveCount(0);

    // ไม่มี token/secret/raw email รั่วใน section (คำว่า "ตั้ง password" ใน copy เป็นปกติ — ห้ามเผยค่า token/secret)
    const html = await section.innerHTML();
    expect(html.toLowerCase()).not.toContain("token");
    expect(html.toLowerCase()).not.toContain("secret");
    expect(html).not.toContain("nattapol@tukdaeng.example");
  });

  // ---- 2. non-invited accounts ไม่มี invitation section/action ใน DOM ----

  test("2. non-invited accounts (Active/Suspended/Locked/Archived/master) ไม่มี invitation section และไม่มี invitation action ใน DOM", async ({ page }) => {
    for (const id of ["ADM-001", "ADM-006", "ADM-007", "ADM-009", "ADM-010"]) {
      await openDetail(page, id);
      await expect(invitationSection(page)).toHaveCount(0);
      await expect(page.locator("[data-admin-invitation-action]")).toHaveCount(0);
    }
  });

  // ---- 3. history แสดง invitation/delivery reference + audit link เดิม ----

  test("3. History & Actions แสดง audit link เดิมของ INV-00001 — delivery ref เก็บใน data ไม่ render pill", async ({ page }) => {
    await openDetail(page, "ADM-008");
    const historyRow = page.locator(".admin-account-action-section tbody tr").first();
    // คอลัมน์ Audit ยังเป็น link AUD-88203 (behavior เดิมจาก AIL-003)
    await expect(historyRow.locator("button.history-audit-link")).toHaveText("AUD-88203");
    // delivery ref pill ถูกนำออกจาก UI — แต่ underlying delivery/activity data ยังเชื่อมโยงถูกต้อง
    await expect(historyRow.locator(".history-delivery-ref")).toHaveCount(0);
    await expect(historyRow).toContainText("รอผู้รับยืนยันอีเมล");
    const linked = await page.evaluate(() => {
      const row = adminAccountData.detail["ADM-008"].activity[0];
      const delivery = adminAccountData.deliveryAttempts.find(d => d.id === row.deliveryRef);
      return { deliveryRef: row.deliveryRef, deliveryStatus: row.deliveryStatus, deliveryRecordStatus: delivery?.status, deliveryInvitation: delivery?.invitationId };
    });
    expect(linked).toEqual({ deliveryRef: "DLV-ACCT-008-INV-001", deliveryStatus: "Sent", deliveryRecordStatus: "Sent", deliveryInvitation: "INV-00001" });
  });

  // ---- 4-5. cooldown / quota gating ----

  test("4. scenario cooldown: resend หายจาก DOM, cancel ยังอยู่, tile แสดงเวลาส่งใหม่ได้", async ({ page }) => {
    await openDetail(page, "ADM-008");
    await pickInvitationScenario(page, "cooldown");
    const section = invitationSection(page);
    await expect(section.locator('[data-admin-invitation-action="resend"]')).toHaveCount(0);
    await expect(section.locator('[data-admin-invitation-action="cancel"]')).toBeVisible();
    expect(await invitationActionTexts(page)).toEqual(["ยกเลิกคำเชิญ"]);
    await expect(section.locator(".detail-tile").nth(5).locator("strong")).toContainText("ส่งใหม่ได้หลัง");
  });

  test("5. scenario quota เต็ม: resend หายจาก DOM, tile แสดง 5/5 ครบโควตา", async ({ page }) => {
    await openDetail(page, "ADM-008");
    await pickInvitationScenario(page, "quota");
    const section = invitationSection(page);
    await expect(section.locator('[data-admin-invitation-action="resend"]')).toHaveCount(0);
    await expect(section.locator('[data-admin-invitation-action="cancel"]')).toBeVisible();
    await expect(section.locator(".detail-tile").nth(5).locator("strong")).toContainText("ใช้ครบ 5/5");
    await expect(section.locator(".admin-invitation-message")).toContainText("โควตา");
  });

  // ---- 6. Failed delivery ----

  test("6. scenario failed: Latest Delivery = Failed (pill red) + message แจ้งส่งไม่สำเร็จ + resend/cancel ยังอยู่", async ({ page }) => {
    await openDetail(page, "ADM-008");
    await pickInvitationScenario(page, "failed");
    const section = invitationSection(page);
    await expect(section.locator(".detail-tile").nth(4).locator(".pill.red")).toHaveText("Failed");
    await expect(section.locator(".admin-invitation-message")).toContainText("ส่งไม่สำเร็จ");
    expect(await invitationActionTexts(page)).toEqual(["ส่งคำเชิญอีกครั้ง", "ยกเลิกคำเชิญ"]);
  });

  // ---- 7-8. Expired / Cancelled → reissue เท่านั้น ----

  test("7. scenario expired: status Expired + เฉพาะปุ่มส่งคำเชิญใหม่ (reissue)", async ({ page }) => {
    await openDetail(page, "ADM-008");
    await pickInvitationScenario(page, "expired");
    const section = invitationSection(page);
    await expect(section.locator(".detail-tile").nth(1).locator(".pill.amber")).toHaveText("Expired");
    await expect(section.locator(".admin-invitation-message")).toContainText("หมดอายุ");
    expect(await invitationActionTexts(page)).toEqual(["ส่งคำเชิญใหม่"]);
    await expect(section.locator('[data-admin-invitation-action="resend"]')).toHaveCount(0);
    await expect(section.locator('[data-admin-invitation-action="cancel"]')).toHaveCount(0);
  });

  test("8. scenario cancelled: status Cancelled + เฉพาะปุ่มส่งคำเชิญใหม่ (reissue)", async ({ page }) => {
    await openDetail(page, "ADM-008");
    await pickInvitationScenario(page, "cancelled");
    const section = invitationSection(page);
    await expect(section.locator(".detail-tile").nth(1).locator(".pill.red")).toHaveText("Cancelled");
    await expect(section.locator(".admin-invitation-message")).toContainText("ยกเลิก");
    expect(await invitationActionTexts(page)).toEqual(["ส่งคำเชิญใหม่"]);
  });

  // ---- 9. Superseded → resolve current, ห้าม action บน stale record ----

  test("9. scenario superseded: แสดง current Pending (INV-00002) + list stale + stale dispatch reject", async ({ page }) => {
    await openDetail(page, "ADM-008");
    await pickInvitationScenario(page, "superseded");
    const section = invitationSection(page);
    // resolve current invitation — แสดง INV-00002 Pending, ไม่ใช่ stale INV-00001
    await expect(section.locator(".detail-tile").nth(0).locator("strong")).toHaveText("INV-00002");
    await expect(section.locator(".detail-tile").nth(1).locator(".pill.blue")).toHaveText("Pending");
    // stale record แสดงในบรรทัด "คำเชิญก่อนหน้า"
    await expect(section.locator(".admin-invitation-history")).toContainText("INV-00001 · Superseded");
    // action ผูกกับ current → resend/cancel ใช้ได้, ไม่มี reissue เพราะ current เป็น Pending
    expect(await invitationActionTexts(page)).toEqual(["ส่งคำเชิญอีกครั้ง", "ยกเลิกคำเชิญ"]);

    // direct dispatch ด้วย stale invitationId/tokenRevision → reject
    const stale = await page.evaluate(() =>
      requestAdminInvitationAction("resend", "ADM-008", { invitationId: "INV-00001", tokenRevision: 1 }));
    expect(stale.ok).toBe(false);
    expect(stale.code).toBe("stale_invitation");
    // dispatch ด้วย expected ตรง current (INV-00002, tokenRevision 2) → ผ่าน validation
    const fresh = await page.evaluate(() =>
      requestAdminInvitationAction("resend", "ADM-008", { invitationId: "INV-00002", tokenRevision: 2 }));
    expect(fresh.ok).toBe(true);
  });

  // ---- 10. Used → ไม่มี action ----

  test("10. scenario used: status Used + ไม่มี invitation action ใดๆ ใน DOM", async ({ page }) => {
    await openDetail(page, "ADM-008");
    await pickInvitationScenario(page, "used");
    const section = invitationSection(page);
    await expect(section.locator(".detail-tile").nth(1).locator(".pill.green")).toHaveText("Used");
    await expect(section.locator("[data-admin-invitation-action]")).toHaveCount(0);
    await expect(section.locator(".admin-invitation-actions")).toHaveCount(0);
  });

  // ---- 11. service boundary: direct dispatch validation + ไม่มี mutation ----

  test("11. requestAdminInvitationAction: allowed → validated; denied/invalid/non-invited → not_allowed; ไม่มี mutation", async ({ page }) => {
    await openDetail(page, "ADM-008");
    const results = await page.evaluate(() => ({
      resend: requestAdminInvitationAction("resend", "ADM-008"),
      cancel: requestAdminInvitationAction("cancel", "ADM-008"),
      reissueOnPending: requestAdminInvitationAction("reissue", "ADM-008"),
      nonInvited: requestAdminInvitationAction("resend", "ADM-001"),
      master: requestAdminInvitationAction("cancel", "ADM-010"),
      invalidAction: requestAdminInvitationAction("activate", "ADM-008"),
      missingAccount: requestAdminInvitationAction("resend", "ADM-999"),
      // snapshot หลัง dispatch — ต้องไม่มี mutation (execution เป็น scope AIL-005/006)
      after: {
        invitationStatus: adminAccountData.invitations.find(i => i.id === "INV-00001").status,
        accountStatus: adminAccountData.accounts.find(a => a.id === "ADM-008").status,
        accountCount: adminAccountData.accounts.length,
        invitationCount: adminAccountData.invitations.length
      }
    }));
    expect(results.resend).toMatchObject({ ok: true, code: "validated", invitationId: "INV-00001" });
    expect(results.cancel).toMatchObject({ ok: true, code: "validated" });
    expect(results.reissueOnPending).toMatchObject({ ok: false, code: "not_allowed" });
    expect(results.nonInvited).toMatchObject({ ok: false, code: "not_allowed" });
    expect(results.master).toMatchObject({ ok: false, code: "not_allowed" });
    expect(results.invalidAction).toMatchObject({ ok: false, code: "not_allowed" });
    expect(results.missingAccount).toMatchObject({ ok: false, code: "not_allowed" });
    // no side effects
    expect(results.after).toEqual({
      invitationStatus: "Pending",
      accountStatus: "Invited",
      accountCount: 10,
      invitationCount: 1
    });
  });

  // ---- 12. คลิกปุ่ม resend → เปิด confirmation modal (commit flow ของ AIL-005), ยังไม่มี mutation ----

  test("12. คลิก 'ส่งคำเชิญอีกครั้ง' → เปิด confirmation modal + state เดิมคงอยู่ (ยังไม่ commit)", async ({ page }) => {
    await openDetail(page, "ADM-008");
    await invitationSection(page).locator('[data-admin-invitation-action="resend"]').click();
    await page.waitForTimeout(300);
    const modal = page.locator("#user-action-modal");
    await expect(modal).toHaveClass(/show/);
    await expect(modal.locator("#user-action-modal-title")).toHaveText("Resend Invitation");
    await expect(modal.locator("[data-admin-invitation-resend-confirm]")).toBeVisible();
    // ยังไม่มี resend side-effect — invitation/counter เดิม
    const after = await page.evaluate(() => ({
      status: adminAccountData.invitations[0].status,
      resendCount: adminAccountData.invitations[0].resendCountRolling24h,
      deliveries: adminAccountData.deliveryAttempts.length
    }));
    expect(after).toEqual({ status: "Pending", resendCount: 0, deliveries: 1 });
    // ปิด modal คืน state ก่อนจบ test
    await modal.locator("[data-user-action-modal-close]").first().click();
    await page.waitForTimeout(200);
  });

  // ---- 13. permission denied → ปุ่มหายจาก DOM + dispatch reject ----

  test("13. permission denied (admin_accounts.manage = none): context ยังแสดงแต่ action ทุกตัวหายจาก DOM + dispatch reject", async ({ page }) => {
    await openDetail(page, "ADM-008");
    // จำลอง actor ไม่มีสิทธิ์ manage — override server-calculated capability source ชั่วคราว
    await page.evaluate(() => {
      window.__origCanManage = canManageAdminAccounts;
      window.canManageAdminAccounts = () => false;
      renderAdminAccountDetail("ADM-008");
    });
    await page.waitForTimeout(200);
    const section = invitationSection(page);
    // read model ยังแสดง (view) แต่ action ทั้งหมดหายจาก DOM
    await expect(section).toBeVisible();
    await expect(section.locator(".detail-tile").nth(0).locator("strong")).toHaveText("INV-00001");
    await expect(page.locator("[data-admin-invitation-action]")).toHaveCount(0);
    // direct dispatch ก็ reject
    const denied = await page.evaluate(() => requestAdminInvitationAction("cancel", "ADM-008"));
    expect(denied).toMatchObject({ ok: false, code: "not_allowed" });
    // restore
    await page.evaluate(() => { window.canManageAdminAccounts = window.__origCanManage; });
  });

  // ---- 14. role ineligible → reissue หาย + dispatch reject ----

  test("14. role ไม่ eligible (ROL-002 Inactive): expired → ไม่มีปุ่ม reissue ใน DOM + dispatch reject", async ({ page }) => {
    await openDetail(page, "ADM-008");
    await pickInvitationScenario(page, "expired");
    // reissue แสดงก่อน role ถูกปิด
    await expect(invitationSection(page).locator('[data-admin-invitation-action="reissue"]')).toBeVisible();
    await page.evaluate(() => {
      const role = roleListData.roles.find(r => r.id === "ROL-002");
      role.status = "Inactive";
      renderAdminAccountDetail("ADM-008");
    });
    await page.waitForTimeout(200);
    const section = invitationSection(page);
    await expect(section.locator('[data-admin-invitation-action="reissue"]')).toHaveCount(0);
    await expect(section.locator("[data-admin-invitation-action]")).toHaveCount(0);
    const denied = await page.evaluate(() => requestAdminInvitationAction("reissue", "ADM-008"));
    expect(denied).toMatchObject({ ok: false, code: "not_allowed" });
  });

  // ---- 15. sequential scenario switching — ไม่มี stale/cross-scenario state ----
  // regression สำหรับ defect ที่พบใน User Acceptance: สลับ scenario หลายครั้งต่อเนื่อง
  // ทุก transition ต้อง rebuild state จาก scenario ปัจจุบันเต็มชุด ไม่ใช่ patch เฉพาะ field

  test("15. sequential switching: Pending → Superseded → Pending → Expired → Failed → Cancelled → Superseded → Used → Pending — ทุก transition deterministic", async ({ page }) => {
    await openDetail(page, "ADM-008");
    const section = invitationSection(page);

    // assert context ครบทุกส่วนหลังแต่ละ transition
    async function assertScenario(expected) {
      const tiles = section.locator(".detail-tile");
      await expect(tiles.nth(0).locator("strong")).toHaveText(expected.id);
      await expect(tiles.nth(1).locator("strong .pill")).toHaveText(expected.status);
      // Latest Delivery pill (ถ้าระบุ)
      if (expected.delivery) {
        await expect(tiles.nth(4).locator(".pill")).toHaveText(expected.delivery);
      }
      // quota/cooldown tile
      if (expected.quota) {
        await expect(tiles.nth(5).locator("strong")).toContainText(expected.quota);
      }
      // status message
      if (expected.message) {
        await expect(section.locator(".admin-invitation-message")).toContainText(expected.message);
      }
      // previous invitations line
      if (expected.previous) {
        await expect(section.locator(".admin-invitation-history")).toContainText(expected.previous);
      } else {
        await expect(section.locator(".admin-invitation-history")).toHaveCount(0);
      }
      // actions — exact match และไม่มี action อื่นหลงเหลือ
      expect(await invitationActionTexts(page)).toEqual(expected.actions);
      expect(await section.locator("[data-admin-invitation-action]").count()).toBe(expected.actions.length);
      // selector ต้องแสดง scenario ที่เลือก
      await expect(section.locator("#admin-invitation-scenario")).toHaveValue(expected.scenario);
      // data-level invariant: ไม่มี artifact record เหลือเมื่อไม่ใช่ superseded
      const counts = await page.evaluate(() => ({
        invitations: adminAccountData.invitations.length,
        artifacts: adminAccountData.invitations.filter(i => i.scenarioArtifact).length
      }));
      expect(counts.artifacts).toBe(expected.hasArtifact ? 1 : 0);
      expect(counts.invitations).toBe(expected.hasArtifact ? 2 : 1);
    }

    // (a) superseded → artifact INV-00002 เป็น current, INV-00001 แสดงเป็น previous
    await pickInvitationScenario(page, "superseded");
    await assertScenario({
      scenario: "superseded", id: "INV-00002", status: "Pending", delivery: "Sent",
      quota: "0/5", previous: "INV-00001 · Superseded",
      actions: ["ส่งคำเชิญอีกครั้ง", "ยกเลิกคำเชิญ"], hasArtifact: true
    });

    // (b) superseded → pending: artifact ต้องถูกล้าง, INV-00001 กลับเป็น Pending
    await pickInvitationScenario(page, "pending");
    await assertScenario({
      scenario: "pending", id: "INV-00001", status: "Pending", delivery: "Sent",
      quota: "0/5", previous: null,
      actions: ["ส่งคำเชิญอีกครั้ง", "ยกเลิกคำเชิญ"], hasArtifact: false
    });

    // (c) pending → expired
    await pickInvitationScenario(page, "expired");
    await assertScenario({
      scenario: "expired", id: "INV-00001", status: "Expired", delivery: "Sent",
      quota: "—", message: "หมดอายุ", previous: null,
      actions: ["ส่งคำเชิญใหม่"], hasArtifact: false
    });

    // (d) expired → failed: status ต้องกลับ Pending + delivery Failed
    await pickInvitationScenario(page, "failed");
    await assertScenario({
      scenario: "failed", id: "INV-00001", status: "Pending", delivery: "Failed",
      quota: "0/5", message: "ส่งไม่สำเร็จ", previous: null,
      actions: ["ส่งคำเชิญอีกครั้ง", "ยกเลิกคำเชิญ"], hasArtifact: false
    });

    // (e) failed → cancelled: delivery กลับ Sent, status Cancelled
    await pickInvitationScenario(page, "cancelled");
    await assertScenario({
      scenario: "cancelled", id: "INV-00001", status: "Cancelled", delivery: "Sent",
      quota: "—", message: "ยกเลิก", previous: null,
      actions: ["ส่งคำเชิญใหม่"], hasArtifact: false
    });

    // (f) cancelled → superseded อีกครั้ง: artifact สร้างใหม่ deterministic (INV-00002 เสมอ)
    await pickInvitationScenario(page, "superseded");
    await assertScenario({
      scenario: "superseded", id: "INV-00002", status: "Pending", delivery: "Sent",
      quota: "0/5", previous: "INV-00001 · Superseded",
      actions: ["ส่งคำเชิญอีกครั้ง", "ยกเลิกคำเชิญ"], hasArtifact: true
    });

    // (g) superseded → used: artifact ล้าง, INV-00001 = Used, ไม่มี action
    await pickInvitationScenario(page, "used");
    await assertScenario({
      scenario: "used", id: "INV-00001", status: "Used", delivery: "Sent",
      quota: "—", previous: null, actions: [], hasArtifact: false
    });

    // (h) used → pending: กลับ baseline สมบูรณ์
    await pickInvitationScenario(page, "pending");
    await assertScenario({
      scenario: "pending", id: "INV-00001", status: "Pending", delivery: "Sent",
      quota: "0/5", message: "รอผู้รับยืนยันอีเมล", previous: null,
      actions: ["ส่งคำเชิญอีกครั้ง", "ยกเลิกคำเชิญ"], hasArtifact: false
    });
  });
});

// ---- responsive: invitation section บน mobile/tablet ----

test.describe("QA-BO-013j: invitation context — responsive", () => {

  test("16. invitation section + action buttons render ครบบนทุก viewport", async ({ page }) => {
    await openDetail(page, "ADM-008");
    const section = invitationSection(page);
    await expect(section).toBeVisible();
    await expect(section.locator(".detail-tile")).toHaveCount(6);
    await expect(section.locator('[data-admin-invitation-action="resend"]')).toBeVisible();
    await expect(section.locator('[data-admin-invitation-action="cancel"]')).toBeVisible();
    await expect(section.locator(".admin-invitation-scenario-tools")).toBeVisible();
  });
});
