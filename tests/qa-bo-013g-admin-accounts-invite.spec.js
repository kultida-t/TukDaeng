// QA-BO-013g: Settings > Admin Accounts — Invite Admin modal (strict Playwright spec)
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล — openAdminAccountInviteModal (บรรทัด ~22991)
//   + confirmAdminAccountInvite (บรรทัด ~23284) + isAdminAccountEmailUnique (บรรทัด ~23048)
//   + nextAdminAccountId (บรรทัด ~23054) + ensureAdminAccountInviteAuditEvent (บรรทัด ~23096)
//   + setAdminInviteFieldError (บรรทัด ~23275)
// เป้าหมาย: รันเทสครอบ Invite Admin modal — open, content, role select, note, email OTP note,
//   validation (name/email/format/unique/role/multi-field), confirm (create account + invitation + audit + delivery result),
//   permission/stale Role safeguards, cancel และ responsive flow
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

// helper: login เข้าระบบ (ค่า default อยู่ใน form แล้ว)
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

// helper: เปิด nav ถ้าจอแคบ (≤1180px sidebar ถูกซ่อนด้วย transform)
async function ensureNavOpen(page) {
  const needsToggle = await page.evaluate(() =>
    window.matchMedia("(max-width: 1180px)").matches && !document.body.classList.contains("nav-open"));
  if (needsToggle) {
    await page.locator("#menu-toggle").click();
    await page.waitForTimeout(300);
  }
}

// helper: ตรวจว่า breakpoint ปัจจุบันเป็น mobile (≤760px) หรือไม่
async function isMobile(page) {
  return await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
}

// helper: ไปหน้า Admin Accounts List ผ่านเมนู Settings > Admin Accounts
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

// helper: เปิด Invite Admin modal (คลิกปุ่ม 'Add admin' ใน page actions)
async function openInviteModal(page) {
  await goToAdminAccounts(page);
  await page.locator("[data-admin-account-invite-open]").click();
  await page.waitForTimeout(300);
}

// helper: เลือก role ใน custom-select ของ invite modal
async function pickRole(page, value) {
  await page
    .locator(`div[data-custom-select]:has(> #admin-account-invite-role) [data-custom-select-trigger]`)
    .click();
  await page.waitForTimeout(150);
  await page
    .locator(`div[data-custom-select]:has(> #admin-account-invite-role) [data-custom-select-option][data-value="${value}"]`)
    .click();
  await page.waitForTimeout(200);
}

// helper: เลือกผลส่งอีเมลจำลองของ prototype
async function pickDeliveryScenario(page, value) {
  await page.evaluate(selected => setCustomSelectValue("admin-account-invite-delivery-scenario", selected), value);
}

// helper: คลิก confirm 'ส่งคำเชิญ' ใน modal
async function clickConfirm(page) {
  await page.locator("[data-admin-account-invite-confirm]").click();
  await page.waitForTimeout(400);
}

// helper: คลิก cancel 'ยกเลิก' ใน modal
async function clickCancel(page) {
  await page.locator("#user-action-modal .admin-account-invite-form [data-user-action-modal-close]").click();
  await page.waitForTimeout(300);
}

// helper: กรอกฟอร์ม invite ครบถ้วน (ใช้ค่าที่ไม่ซ้ำ)
async function fillValidForm(page, { name = "ทดสอบ ระบบ", email = "test-invite@tukdaeng.example", role = "Trust & Safety Moderator", note = "" } = {}) {
  await page.locator("#admin-account-invite-name").fill(name);
  await page.locator("#admin-account-invite-email").fill(email);
  await pickRole(page, role);
  if (note) await page.locator("#admin-account-invite-note").fill(note);
}

// helper: นับจำนวน account ใน mock data
async function accountCount(page) {
  return await page.evaluate(() => adminAccountData.accounts.length);
}

// helper: ดึง account จาก mock data ตาม id
async function getAccount(page, id) {
  return await page.evaluate(accId => {
    const acc = adminAccountData.accounts.find(a => a.id === accId);
    return acc ? {
      id: acc.id, fullName: acc.fullName, email: acc.email, role: acc.role, status: acc.status,
      lastLogin: acc.lastLogin, lastAction: acc.lastAction, revision: acc.revision,
      roleId: acc.roleId, roleRevision: acc.roleRevision, invitationId: acc.invitationId
    } : null;
  }, id);
}

// ==================== G. INVITE ADMIN MODAL ====================

test.describe("QA-BO-013g: Settings > Admin Accounts — Invite Admin modal", () => {

  test("1. คลิก 'Add admin' → เปิด modal", async ({ page }) => {
    await openInviteModal(page);
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Add admin");
    await clickCancel(page);
  });

  test("2. modal แสดง title + summary + form 4 ฟิลด์ (ชื่อ/อีเมล/Role/Note)", async ({ page }) => {
    await openInviteModal(page);
    const modal = page.locator("#user-action-modal");
    // title + summary
    await expect(modal.locator("#user-action-modal-title")).toHaveText("Add admin");
    await expect(modal.locator(".user-action-head p")).toHaveText("ระบบจะส่งคำเชิญเข้าอีเมล ผู้รับต้องยืนยันอีเมลและตั้ง password ก่อนเข้าใช้งาน");
    // form 4 ฟิลด์
    await expect(modal.locator("#admin-account-invite-name")).toBeVisible();
    await expect(modal.locator("#admin-account-invite-email")).toBeVisible();
    await expect(modal.locator("#admin-account-invite-role")).toBeAttached();
    await expect(modal.locator("#admin-account-invite-note")).toBeVisible();
    // required mark 3 ฟิลด์ (ชื่อ/อีเมล/Role) — Note ไม่มี
    await expect(modal.locator("label:has(#admin-account-invite-name) .article-required-mark")).toHaveCount(1);
    await expect(modal.locator("label:has(#admin-account-invite-email) .article-required-mark")).toHaveCount(1);
    await expect(modal.locator("label:has(#admin-account-invite-role) .article-required-mark")).toHaveCount(1);
    await expect(modal.locator("label:has(#admin-account-invite-note) .article-required-mark")).toHaveCount(0);
    await clickCancel(page);
  });

  test("3. Role template = custom select มี placeholder 'เลือก role template' + 8 ตัวเลือก", async ({ page }) => {
    await openInviteModal(page);
    await page.locator(`div[data-custom-select]:has(> #admin-account-invite-role) [data-custom-select-trigger]`).click();
    await page.waitForTimeout(150);
    const options = page.locator(`div[data-custom-select]:has(> #admin-account-invite-role) [data-custom-select-option]`);
    await expect(options).toHaveCount(9);
    const texts = await options.allTextContents();
    expect(texts.map(t => t.trim())).toEqual([
      "เลือก role template",
      "Super Admin",
      "Admin Manager",
      "Operations Manager",
      "Support Agent",
      "Trust & Safety Moderator",
      "Asset Operations",
      "Content Editor",
      "Content Publisher"
    ]);
    // placeholder "" เป็นค่า default → trigger แสดง 'เลือก role template' + hidden input ว่าง
    expect(await page.locator("#admin-account-invite-role").inputValue()).toBe("");
    await expect(
      page.locator('div[data-custom-select]:has(> #admin-account-invite-role) [data-custom-select-label]')
    ).toHaveText("เลือก role template");
    await page.locator(`div[data-custom-select]:has(> #admin-account-invite-role) [data-custom-select-trigger]`).click();
    await page.waitForTimeout(150);
    await clickCancel(page);
  });

  test("4. Note = textarea ไม่บังคับ — มี placeholder และ confirm ได้โดยไม่กรอก", async ({ page }) => {
    await openInviteModal(page);
    const note = page.locator("#admin-account-invite-note");
    await expect(note).toBeVisible();
    await expect(note).toHaveAttribute("placeholder", "หมายเหตุเพิ่มเติม (ไม่บังคับ)");
    // ไม่กรอก note — กรอก name + email + role อย่างเดียว → confirm ผ่าน
    await fillValidForm(page, { note: "" });
    await clickConfirm(page);
    // account ใหม่ถูกสร้าง (ADM-011)
    const newAcc = await getAccount(page, "ADM-011");
    expect(newAcc).not.toBeNull();
    await expect(page.locator("#success-toast")).toBeVisible();
  });

  test("5. email OTP note แสดง 'ผู้รับต้องยืนยันตัวตนด้วย Email OTP ทุกครั้งที่เข้าสู่ระบบ'", async ({ page }) => {
    await openInviteModal(page);
    const note = page.locator("#user-action-modal .user-action-impact-notice p");
    await expect(note).toContainText("ผู้รับต้องยืนยันตัวตนด้วย Email OTP ทุกครั้งที่เข้าสู่ระบบ");
    await clickCancel(page);
  });

  test("6. validation: ไม่กรอกชื่อ → error 'กรุณาระบุชื่อ-นามสกุล'", async ({ page }) => {
    await openInviteModal(page);
    // กรอก email + role แต่ไม่กรอก name → confirm → name error เดียว
    await page.locator("#admin-account-invite-email").fill("no-name@tukdaeng.example");
    await pickRole(page, "Trust & Safety Moderator");
    await clickConfirm(page);
    const nameError = page.locator("[data-admin-invite-name-error]");
    await expect(nameError).toHaveText("กรุณาระบุชื่อ-นามสกุล");
    await expect(nameError).toHaveClass(/show/);
    // email + role error ไม่แสดง + modal ยังเปิด + ไม่สร้าง account
    await expect(page.locator("[data-admin-invite-email-error]")).not.toHaveClass(/show/);
    await expect(page.locator("[data-admin-invite-role-error]")).not.toHaveClass(/show/);
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    expect(await accountCount(page)).toBe(10);
  });

  test("7. validation: ไม่กรอกอีเมล → error 'กรุณาระบุอีเมล'", async ({ page }) => {
    await openInviteModal(page);
    // กรอก name + role แต่ไม่กรอก email → confirm → email error เดียว
    await page.locator("#admin-account-invite-name").fill("ไม่มีอีเมล");
    await pickRole(page, "Trust & Safety Moderator");
    await clickConfirm(page);
    const emailError = page.locator("[data-admin-invite-email-error]");
    await expect(emailError).toHaveText("กรุณาระบุอีเมล");
    await expect(emailError).toHaveClass(/show/);
    // name + role error ไม่แสดง + modal ยังเปิด + ไม่สร้าง account
    await expect(page.locator("[data-admin-invite-name-error]")).not.toHaveClass(/show/);
    await expect(page.locator("[data-admin-invite-role-error]")).not.toHaveClass(/show/);
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    expect(await accountCount(page)).toBe(10);
  });

  test("8. validation: อีเมลผิด format → error 'รูปแบบอีเมลไม่ถูกต้อง'", async ({ page }) => {
    await openInviteModal(page);
    await page.locator("#admin-account-invite-name").fill("ฟอร์แมตผิด");
    await pickRole(page, "Trust & Safety Moderator");
    // อีเมลผิด format หลายกรณี
    for (const badEmail of ["abc", "a@b", "a@b."]) {
      await page.locator("#admin-account-invite-email").fill(badEmail);
      await clickConfirm(page);
      const emailError = page.locator("[data-admin-invite-email-error]");
      await expect(emailError).toHaveText("รูปแบบอีเมลไม่ถูกต้อง");
      await expect(emailError).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
      expect(await accountCount(page)).toBe(10);
    }
  });

  test("9. validation: อีเมลซ้ำกับที่มี → error 'อีเมลนี้มีอยู่ในระบบแล้ว — ต้องใช้อีเมลอื่น'", async ({ page }) => {
    await openInviteModal(page);
    await page.locator("#admin-account-invite-name").fill("ซ้ำอีเมล");
    await pickRole(page, "Trust & Safety Moderator");
    // อีเมลซ้ำกับ ADM-001 (somchai@tukdaeng.example)
    await page.locator("#admin-account-invite-email").fill("somchai@tukdaeng.example");
    await clickConfirm(page);
    const emailError = page.locator("[data-admin-invite-email-error]");
    await expect(emailError).toHaveText("อีเมลนี้มีอยู่ในระบบแล้ว — ต้องใช้อีเมลอื่น");
    await expect(emailError).toHaveClass(/show/);
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    expect(await accountCount(page)).toBe(10);
  });

  test("10. validation: ไม่เลือก role → error 'กรุณาเลือก role template'", async ({ page }) => {
    await openInviteModal(page);
    // กรอก name + email แต่ไม่เลือก role → confirm → role error เดียว
    await page.locator("#admin-account-invite-name").fill("ไม่เลือก Role");
    await page.locator("#admin-account-invite-email").fill("no-role@tukdaeng.example");
    await clickConfirm(page);
    const roleError = page.locator("[data-admin-invite-role-error]");
    await expect(roleError).toHaveText("กรุณาเลือก role template");
    await expect(roleError).toHaveClass(/show/);
    // name + email error ไม่แสดง + modal ยังเปิด + ไม่สร้าง account
    await expect(page.locator("[data-admin-invite-name-error]")).not.toHaveClass(/show/);
    await expect(page.locator("[data-admin-invite-email-error]")).not.toHaveClass(/show/);
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    expect(await accountCount(page)).toBe(10);
  });

  test("11. validation: หลายฟิลด์ผิดพร้อมกัน → แสดง error ครบ", async ({ page }) => {
    await openInviteModal(page);
    // ไม่กรอก name + email + ไม่เลือก role → confirm → error ทั้ง 3 ฟิลด์
    await clickConfirm(page);
    await expect(page.locator("[data-admin-invite-name-error]")).toHaveText("กรุณาระบุชื่อ-นามสกุล");
    await expect(page.locator("[data-admin-invite-name-error]")).toHaveClass(/show/);
    await expect(page.locator("[data-admin-invite-email-error]")).toHaveText("กรุณาระบุอีเมล");
    await expect(page.locator("[data-admin-invite-email-error]")).toHaveClass(/show/);
    await expect(page.locator("[data-admin-invite-role-error]")).toHaveText("กรุณาเลือก role template");
    await expect(page.locator("[data-admin-invite-role-error]")).toHaveClass(/show/);
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    expect(await accountCount(page)).toBe(10);
  });

  test("12. confirm สำเร็จ → สร้าง account ใหม่ status 'Invited' + lastLogin '—' + ID ADM-011", async ({ page }) => {
    await openInviteModal(page);
    await fillValidForm(page, { name: "ใหม่ จริงจัง", email: "new-admin@tukdaeng.example", role: "Content Editor" });
    await clickConfirm(page);
    // account ใหม่ถูกสร้าง
    expect(await accountCount(page)).toBe(11);
    const newAcc = await getAccount(page, "ADM-011");
    expect(newAcc).not.toBeNull();
    expect(newAcc.id).toBe("ADM-011");
    expect(newAcc.fullName).toBe("ใหม่ จริงจัง");
    expect(newAcc.email).toBe("new-admin@tukdaeng.example");
    expect(newAcc.role).toBe("Content Editor");
    expect(newAcc.status).toBe("Invited");
    expect(newAcc.lastLogin).toBe("—");
    expect(newAcc.lastAction).toBe("Invited — รอผู้รับยืนยันอีเมลและตั้ง password");
  });

  test("13. confirm สำเร็จ → activity history 'Invited โดย ...' + audit (Invite Admin, before '-', after 'Invited') + toast + re-render list", async ({ page }) => {
    await openInviteModal(page);
    await fillValidForm(page, { name: "ออดิต ตรวจสอบ", email: "audit-test@tukdaeng.example", role: "Support Agent", note: "เชิญตามคำขอ HR" });
    await clickConfirm(page);

    // modal ปิด + toast + อยู่ใน list mode (re-render)
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    await expect(page.locator("#success-toast")).toBeVisible();
    await expect(page.locator("#success-toast")).toContainText("ออดิต ตรวจสอบ ได้รับคำเชิญแล้ว — ส่งอีเมลไปที่ audit-test@tukdaeng.example");
    await expect(page.locator("body")).toHaveClass(/admin-account-list-mode/);

    // audit event ล่าสุด = Invite Admin + before/after = '-' → 'Invited'
    const auditInfo = await page.evaluate(() => {
      const ev = auditLogData.events[0];
      return ev ? { id: ev.id, action: ev.action, module: ev.module, risk: ev.risk, reference: ev.reference, before: ev.before, after: ev.after, reason: ev.reason, note: ev.note } : null;
    });
    expect(auditInfo).not.toBeNull();
    expect(auditInfo.action).toBe("Invite Admin");
    expect(auditInfo.module).toBe("Settings");
    expect(auditInfo.risk).toBe("สูง");
    expect(auditInfo.reference).toBe("ADM-011");
    expect(auditInfo.before).toBe("-");
    expect(auditInfo.after).toBe("Invited");
    expect(auditInfo.reason).toContain("Invite Support Agent");
    expect(auditInfo.reason).toContain("au***@tukdaeng.example");
    expect(auditInfo.reason).not.toContain("audit-test@tukdaeng.example");
    expect(auditInfo.note).toBe("เชิญตามคำขอ HR");

    // activity history ของ account ใหม่ — 'Invited โดย ...' + auditRef เชื่อม audit event
    const history = await page.evaluate(() => {
      const d = adminAccountData.detail["ADM-011"] || {};
      return {
        action: d.activity && d.activity[0] ? d.activity[0].action : null,
        note: d.activity && d.activity[0] ? d.activity[0].note : null,
        auditRef: d.auditRefs && d.auditRefs[0] ? d.auditRefs[0] : null
      };
    });
    expect(history.action).toMatch(/^Invited โดย /);
    expect(history.note).toBe("เชิญตามคำขอ HR");
    expect(history.auditRef).toBe(auditInfo.id);
  });

  test("14. confirm สำเร็จ → account ใหม่ปรากฏใน list (sort latest บนสุด ใต้ master)", async ({ page }) => {
    await openInviteModal(page);
    await fillValidForm(page, { name: "ลิสต์ แรนเดอร์", email: "list-render@tukdaeng.example", role: "Trust & Safety Moderator" });
    await clickConfirm(page);

    // อยู่ใน list mode
    await expect(page.locator("body")).toHaveClass(/admin-account-list-mode/);
    // row แรก = master (ADM-010) เสมอ ไม่ว่าจะเรียงด้วยอะไร
    const rows = page.locator(".admin-account-row");
    const firstId = await rows.nth(0).locator('[data-label="Admin ID"] .main-text').textContent();
    expect(firstId.trim()).toBe("ADM-010");
    // footer แสดงจำนวนรวม 11 (เดิม 10 + ใหม่ 1)
    await expect(page.locator(".footer-range > span:first-child")).toContainText("จาก 11");
    // account ใหม่ (ADM-011) ปรากฏในหน้า 1 ใต้ master เพราะ createdAtRank คำนวณเป็น YYYYMMDDHHMM
    // ตรง format seed data → sort latest อยู่บนสุดใต้ master + pagination 10/page → หน้า 1 พอดี (row ที่ 11)
    const newRow = page.locator(`.admin-account-row[data-admin-account-card="ADM-011"]`);
    await expect(newRow).toHaveCount(1);
    await expect(newRow.locator('[data-label="Name"] .main-text')).toContainText("ลิสต์ แรนเดอร์");
    await expect(newRow.locator('[data-label="Email"]')).toContainText("list-render@tukdaeng.example");
    await expect(newRow.locator('[data-label="Status"] .pill')).toHaveText("Invited");
  });

  test("15. cancel ปิด modal ไม่สร้าง account", async ({ page }) => {
    await goToAdminAccounts(page);
    const beforeCount = await accountCount(page);
    await page.locator("[data-admin-account-invite-open]").click();
    await page.waitForTimeout(300);
    // กรอกข้อมูลบางส่วนแล้ว cancel — ต้องไม่มีผล
    await fillValidForm(page, { name: "ยกเลิก ทดสอบ", email: "cancel-test@tukdaeng.example", role: "Trust & Safety Moderator" });
    await clickCancel(page);
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    expect(await accountCount(page)).toBe(beforeCount);
    // ไม่มี toast แสดง
    await expect(page.locator("#success-toast")).not.toBeVisible();
  });

  test("16. กรอกครบถ้วน + confirm → ไม่มี error แสดง", async ({ page }) => {
    await openInviteModal(page);
    await fillValidForm(page, { name: "ครบถ้วน สมบูรณ์", email: "complete@tukdaeng.example", role: "Content Publisher", note: "กรอกครบทุกฟิลด์" });
    await clickConfirm(page);
    // ไม่มี error แสดง (modal ปิดแล้ว แต่ตรวจก่อนปิดไม่ได้ → ตรวจจากการที่ account ถูกสร้าง + toast แสดง)
    expect(await accountCount(page)).toBe(11);
    await expect(page.locator("#success-toast")).toBeVisible();
    const newAcc = await getAccount(page, "ADM-011");
    expect(newAcc).not.toBeNull();
    expect(newAcc.fullName).toBe("ครบถ้วน สมบูรณ์");
  });

  test("17. mobile (≤760px): invite modal เปิดได้ + confirm สร้าง account ได้", async ({ page }) => {
    const mobile = await isMobile(page);
    if (!mobile) { test.skip(); return; }
    await openInviteModal(page);
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Add admin");
    await fillValidForm(page, { name: "มือถือ ทดสอบ", email: "mobile@tukdaeng.example", role: "Trust & Safety Moderator" });
    await clickConfirm(page);
    expect(await accountCount(page)).toBe(11);
    await expect(page.locator("#success-toast")).toBeVisible();
    const newAcc = await getAccount(page, "ADM-011");
    expect(newAcc).not.toBeNull();
    expect(newAcc.status).toBe("Invited");
  });

  test("18. confirm สำเร็จ → สร้าง invitation Pending revision 1 และ expiry 72 ชั่วโมง พร้อม safe references", async ({ page }) => {
    await openInviteModal(page);
    await fillValidForm(page, { name: "วงจร คำเชิญ", email: "lifecycle@tukdaeng.example", role: "Admin Manager" });
    await clickConfirm(page);

    const result = await page.evaluate(() => {
      const account = adminAccountData.accounts.find(item => item.id === "ADM-011");
      const invitation = adminAccountData.invitations.find(item => item.targetAdminId === "ADM-011");
      const delivery = invitation
        ? adminAccountData.deliveryAttempts.find(item => item.id === invitation.deliveryAttemptRefs[0])
        : null;
      const audit = invitation ? auditLogData.events.find(item => item.id === invitation.auditRef) : null;
      return { account, invitation, delivery, audit };
    });

    expect(result.account.status).toBe("Invited");
    expect(result.account.revision).toBe(1);
    expect(result.account.invitationId).toBe(result.invitation.id);
    expect(result.invitation.id).toMatch(/^INV-\d{5}$/);
    expect(result.invitation.status).toBe("Pending");
    expect(result.invitation.tokenRevision).toBe(1);
    expect(result.invitation.accountRevision).toBe(1);
    expect(result.invitation.targetEmailNormalized).toBe("lifecycle@tukdaeng.example");
    expect(new Date(result.invitation.expiresAt).getTime() - new Date(result.invitation.issuedAt).getTime()).toBe(72 * 60 * 60 * 1000);
    expect(result.invitation.auditRef).toBe(result.audit.id);
    expect(result.invitation.deliveryAttemptRefs).toEqual([result.delivery.id]);
    expect(result.delivery.status).toBe("Sent");
    expect(result.audit.eventType).toBe("ADMIN_INVITATION_CREATE");
    expect(result.audit.invitationId).toBe(result.invitation.id);
    expect(result.audit.correlationId).toBe(result.invitation.correlationId);
  });

  test("19. delivery Failed → account/invitation ยังถูกสร้างเป็น Invited/Pending และแสดง recovery ที่ถูกต้อง", async ({ page }) => {
    await openInviteModal(page);
    await fillValidForm(page, { name: "ส่งไม่สำเร็จ", email: "failed-delivery@tukdaeng.example", role: "Support Agent" });
    await pickDeliveryScenario(page, "failed");
    await clickConfirm(page);

    const result = await page.evaluate(() => ({
      account: adminAccountData.accounts.find(item => item.id === "ADM-011"),
      invitation: adminAccountData.invitations.find(item => item.targetAdminId === "ADM-011"),
      delivery: adminAccountData.deliveryAttempts.find(item => item.targetAdminId === "ADM-011")
    }));
    expect(result.account.status).toBe("Invited");
    expect(result.invitation.status).toBe("Pending");
    expect(result.delivery.status).toBe("Failed");
    expect(result.account.lastAction).toContain("ส่งใหม่ได้");
    await expect(page.locator("#success-toast")).toContainText("อีเมลส่งไม่สำเร็จ");
    await expect(page.locator("#success-toast")).toContainText("บัญชียังคง Invited และส่งใหม่ได้");
  });

  test("20. delivery Retry → account/invitation ยังเป็น Invited/Pending และบันทึก Retry attempt", async ({ page }) => {
    await openInviteModal(page);
    await fillValidForm(page, { name: "รอส่งซ้ำ", email: "retry-delivery@tukdaeng.example", role: "Content Editor" });
    await pickDeliveryScenario(page, "retry");
    await clickConfirm(page);

    const result = await page.evaluate(() => ({
      account: adminAccountData.accounts.find(item => item.id === "ADM-011"),
      invitation: adminAccountData.invitations.find(item => item.targetAdminId === "ADM-011"),
      delivery: adminAccountData.deliveryAttempts.find(item => item.targetAdminId === "ADM-011")
    }));
    expect(result.account.status).toBe("Invited");
    expect(result.invitation.status).toBe("Pending");
    expect(result.delivery.status).toBe("Retry");
    expect(result.account.lastAction).toContain("Retry");
    await expect(page.locator("#success-toast")).toContainText("อีเมลอยู่ในคิว Retry");
  });

  test("21. Role ถูกปิดหลังเปิด modal → reject ทั้ง account/invitation/audit/delivery โดยไม่เกิด partial mutation", async ({ page }) => {
    await openInviteModal(page);
    await fillValidForm(page, { name: "Role ปิดใช้งาน", email: "inactive-role@tukdaeng.example", role: "Support Agent" });
    const before = await page.evaluate(() => ({
      accounts: adminAccountData.accounts.length,
      invitations: adminAccountData.invitations.length,
      deliveries: adminAccountData.deliveryAttempts.length,
      audits: auditLogData.events.length
    }));
    await page.evaluate(() => {
      roleListData.roles.find(item => item.name === "Support Agent").status = "Inactive";
    });
    await clickConfirm(page);

    await expect(page.locator("[data-admin-invite-role-error]")).toContainText("Role นี้ไม่พร้อมใช้งานแล้ว");
    const after = await page.evaluate(() => ({
      accounts: adminAccountData.accounts.length,
      invitations: adminAccountData.invitations.length,
      deliveries: adminAccountData.deliveryAttempts.length,
      audits: auditLogData.events.length
    }));
    expect(after).toEqual(before);
  });

  test("22. Role revision เปลี่ยนหลังเปิด modal → reject stale request โดยไม่สร้างข้อมูล", async ({ page }) => {
    await openInviteModal(page);
    await fillValidForm(page, { name: "Role เปลี่ยน", email: "stale-role@tukdaeng.example", role: "Content Publisher" });
    await page.evaluate(() => {
      roleListData.roles.find(item => item.name === "Content Publisher").updatedRank += 1;
    });
    await clickConfirm(page);

    await expect(page.locator("[data-admin-invite-role-error]")).toContainText("ข้อมูล Role เปลี่ยนแล้ว");
    expect(await accountCount(page)).toBe(10);
    expect(await page.evaluate(() => adminAccountData.invitations.length)).toBe(1);
  });

  test("23. ผู้ไม่มี admin_accounts.manage → action Add admin ไม่อยู่ใน DOM", async ({ page }) => {
    await goToAdminAccounts(page);
    await page.evaluate(() => {
      auth.admin.role = "Support Agent";
      renderAdminAccounts();
    });
    await expect(page.locator("[data-admin-account-invite-open]")).toHaveCount(0);
  });

  test("24. permission เปลี่ยนก่อน confirm → revalidate และไม่สร้าง account/invitation", async ({ page }) => {
    await openInviteModal(page);
    await fillValidForm(page, { name: "ไม่มีสิทธิ์", email: "permission-changed@tukdaeng.example", role: "Operations Manager" });
    await page.evaluate(() => { auth.admin.role = "Support Agent"; });
    await clickConfirm(page);

    expect(await accountCount(page)).toBe(10);
    expect(await page.evaluate(() => adminAccountData.invitations.length)).toBe(1);
    await expect(page.locator("#success-toast")).toContainText("ไม่มีสิทธิ์เชิญ Admin");
  });

  test("25. invitation/audit/delivery state ไม่เก็บ raw token, token hash, password หรือ OTP", async ({ page }) => {
    await openInviteModal(page);
    await fillValidForm(page, { name: "ตรวจ Secret", email: "secret-check@tukdaeng.example", role: "Asset Operations" });
    await clickConfirm(page);

    const state = await page.evaluate(() => {
      const invitation = adminAccountData.invitations.find(item => item.targetAdminId === "ADM-011");
      const delivery = adminAccountData.deliveryAttempts.find(item => item.targetAdminId === "ADM-011");
      const audit = auditLogData.events.find(item => item.invitationId === invitation.id);
      return {
        invitation: JSON.stringify(invitation),
        trace: JSON.stringify({ delivery, audit })
      };
    });
    expect(state.invitation).not.toMatch(/"(rawToken|token|tokenHash|password|passwordHash|otp)"/i);
    expect(state.trace).not.toContain("secret-check@tukdaeng.example");
    expect(state.trace).not.toMatch(/"(rawToken|token|tokenHash|password|passwordHash|otp)"/i);
    expect(state.trace).toContain("se***@tukdaeng.example");
  });

  test("26. แก้ค่า text field หลัง Submit → clear เฉพาะ error/visual/ARIA ของ field นั้นทันที แม้ค่าใหม่ยังไม่ valid", async ({ page }) => {
    await openInviteModal(page);
    await clickConfirm(page);

    const name = page.locator("#admin-account-invite-name");
    const email = page.locator("#admin-account-invite-email");
    const roleTrigger = page.locator('div[data-custom-select]:has(> #admin-account-invite-role) [data-custom-select-trigger]');
    await expect(name).toHaveClass(/article-field-invalid/);
    await expect(email).toHaveClass(/article-field-invalid/);
    await expect(roleTrigger).toHaveClass(/article-field-invalid/);
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(email).toHaveAttribute("aria-errormessage", "admin-account-invite-email-error");

    await email.fill("abc");

    await expect(page.locator("[data-admin-invite-email-error]")).toHaveText("");
    await expect(page.locator("[data-admin-invite-email-error]")).not.toHaveClass(/show/);
    await expect(email).not.toHaveClass(/article-field-invalid/);
    await expect(email).toHaveAttribute("aria-invalid", "false");
    await expect(email).not.toHaveAttribute("aria-errormessage", /.+/);
    await expect(page.locator("[data-admin-invite-name-error]")).toHaveClass(/show/);
    await expect(page.locator("[data-admin-invite-role-error]")).toHaveClass(/show/);
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(roleTrigger).toHaveAttribute("aria-invalid", "true");
  });

  test("27. เปลี่ยน Role หลัง Submit → clear เฉพาะ Role error/visual/ARIA และคง error ของ field อื่น", async ({ page }) => {
    await openInviteModal(page);
    await clickConfirm(page);

    const roleInput = page.locator("#admin-account-invite-role");
    const roleTrigger = page.locator('div[data-custom-select]:has(> #admin-account-invite-role) [data-custom-select-trigger]');
    await expect(roleInput).toHaveAttribute("aria-invalid", "true");
    await expect(roleTrigger).toHaveAttribute("aria-errormessage", "admin-account-invite-role-error");

    await pickRole(page, "Support Agent");

    await expect(page.locator("[data-admin-invite-role-error]")).toHaveText("");
    await expect(page.locator("[data-admin-invite-role-error]")).not.toHaveClass(/show/);
    await expect(roleTrigger).not.toHaveClass(/article-field-invalid/);
    await expect(roleInput).toHaveAttribute("aria-invalid", "false");
    await expect(roleTrigger).toHaveAttribute("aria-invalid", "false");
    await expect(roleTrigger).not.toHaveAttribute("aria-errormessage", /.+/);
    await expect(page.locator("[data-admin-invite-name-error]")).toHaveClass(/show/);
    await expect(page.locator("[data-admin-invite-email-error]")).toHaveClass(/show/);
  });
});
