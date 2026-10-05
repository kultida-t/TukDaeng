// QA-BO-019b: My Account — Change Password (AIL-021) — self-only credential change
// อ้างอิง accepted self-service contract (requirement bf08de1f §6) + prototype เป็นหลักสำหรับการแสดงผล
// scope: Security section entry, modal 3 fields (current/new/confirm), live policy checklist,
//        current verify + rate-limit cooldown 60s, boundary/stale guard, audit ADMIN_PASSWORD_CHANGE
//        (ห้ามบันทึก password ลง audit), revoke session อื่น (current session คงอยู่)
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

const SELF = {
  id: "ADM-010",
  name: "ผู้ดูแลระบบ",
  role: "Super Admin"
};

const MOCK_PASSWORD = "tukdaeng-admin";
const NEW_PASSWORD = "TukDaeng!2026xyz"; // ผ่าน policy: ≥12 + upper + lower + digit + special

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

// helper: ไปหน้า My Account ผ่าน sidebar profile footer (.admin-box)
async function goToMyAccount(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  await page.locator("#my-account-entry").click();
  await page.waitForTimeout(300);
}

// helper: เปิด Change Password modal
async function openPasswordModal(page) {
  await goToMyAccount(page);
  await page.locator("[data-my-account-action='change-password']").click();
  await page.waitForTimeout(200);
}

// helper: กรอกทั้ง 3 field (input event → live checklist ทำงานเหมือน user พิมพ์)
async function fillPasswordForm(page, { current = "", next = "", confirm = "" } = {}) {
  await page.locator("#my-account-pw-current").fill(current);
  await page.locator("#my-account-pw-new").fill(next);
  await page.locator("#my-account-pw-confirm").fill(confirm);
}

async function auditEventCount(page) {
  return page.evaluate(() => auditLogData.events.length);
}

async function selfCredential(page) {
  return page.evaluate(() => adminCredentialStore["ADM-010"].password);
}

async function selfAccount(page) {
  return page.evaluate(() => adminAccountData.accounts.find(a => a.id === "ADM-010"));
}

// ==================== A. SECURITY SECTION & ENTRY ====================

test.describe("QA-BO-019b: Change Password — security section & entry", () => {

  test("1. Security actions แสดงปุ่ม เปลี่ยนรหัสผ่าน (action เดียว ไม่มี heading/tile — password ไม่ render บนหน้า)", async ({ page }) => {
    await goToMyAccount(page);
    const section = page.locator("[data-my-account-section='security']");
    await expect(section).toBeVisible();
    // ไม่มี section heading — ปุ่ม action อย่างเดียว
    expect(await section.locator("h4").count()).toBe(0);
    expect(await section.locator(".detail-tile").count()).toBe(0);
    const btn = section.locator("[data-my-account-action='change-password']");
    await expect(btn).toBeVisible();
    await expect(btn).toHaveText("เปลี่ยนรหัสผ่าน");
    // ปุ่มต้อง auto-width ซ้าย (ไม่ stretch เต็มแถว — convention .user-detail-actions ของหน้า detail อื่น)
    const fitsContent = await btn.evaluate(el => el.offsetWidth < el.closest("[data-my-account-section='security']").offsetWidth);
    expect(fitsContent).toBe(true);
  });

  test("2. ไม่มี plaintext password บนหน้า/DOM (mask เท่านั้น — credential store ไม่ render)", async ({ page }) => {
    await goToMyAccount(page);
    const content = await page.locator("[data-my-account-page]").innerText();
    expect(content).not.toContain(MOCK_PASSWORD);
    // ไม่มี password input ค้างในหน้า (modal ยังไม่เปิด)
    expect(await page.locator("[data-my-account-page] input[type='password']").count()).toBe(0);
  });
});

// ==================== B. MODAL OPEN/CLOSE & FIELD BEHAVIOR ====================

test.describe("QA-BO-019b: Change Password — modal open/close & fields", () => {

  test("3. กด เปลี่ยนรหัสผ่าน → modal เปิด ครบ 3 password fields + policy checklist + ปุ่ม footer", async ({ page }) => {
    await openPasswordModal(page);
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    await expect(page.locator(".my-account-password-modal")).toBeVisible();
    await expect(page.locator("#user-action-modal-title")).toHaveText("Change Password");
    for (const id of ["#my-account-pw-current", "#my-account-pw-new", "#my-account-pw-confirm"]) {
      const field = page.locator(id);
      await expect(field).toBeVisible();
      expect(await field.getAttribute("type")).toBe("password");
    }
    expect(await page.locator("[data-my-account-pw-policy] [data-my-account-pw-rule]").count()).toBe(5);
    await expect(page.locator("[data-my-account-action='cancel-password']")).toBeVisible();
    await expect(page.locator("[data-my-account-action='save-password']")).toBeVisible();
  });

  test("4. autocomplete=off ทุก field (prototype — กัน browser autofill ค่าที่เคยกรอกกลับมา)", async ({ page }) => {
    await openPasswordModal(page);
    for (const id of ["#my-account-pw-current", "#my-account-pw-new", "#my-account-pw-confirm"]) {
      expect(await page.locator(id).getAttribute("autocomplete")).toBe("off");
    }
  });

  test("5. กด ยกเลิก → modal ปิด + credential ไม่เปลี่ยน + ไม่สร้าง audit", async ({ page }) => {
    await openPasswordModal(page);
    const before = await auditEventCount(page);
    await fillPasswordForm(page, { current: MOCK_PASSWORD, next: NEW_PASSWORD, confirm: NEW_PASSWORD });
    await page.locator("[data-my-account-action='cancel-password']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    expect(await selfCredential(page)).toBe(MOCK_PASSWORD);
    expect(await auditEventCount(page)).toBe(before);
  });

  test("6. password toggle show/hide ทำงานทุก field (eye ↔ eyeOff)", async ({ page }) => {
    await openPasswordModal(page);
    const toggle = page.locator("[data-my-account-pw-toggle='my-account-pw-current']");
    await expect(page.locator("#my-account-pw-current")).toHaveAttribute("type", "password");
    await toggle.click();
    await expect(page.locator("#my-account-pw-current")).toHaveAttribute("type", "text");
    expect(await toggle.getAttribute("aria-label")).toBe("Hide password");
    await toggle.click();
    await expect(page.locator("#my-account-pw-current")).toHaveAttribute("type", "password");
  });
});

// ==================== C. VALIDATION & LIVE POLICY CHECKLIST ====================

test.describe("QA-BO-019b: Change Password — validation & live policy", () => {

  test("7. submit ทุก field ว่าง → error ใต้ current field + input invalid", async ({ page }) => {
    await openPasswordModal(page);
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(200);
    const error = page.locator("[data-my-account-pw-error='current']");
    await expect(error).toHaveClass(/show/);
    await expect(error).toHaveText("กรุณากรอกรหัสผ่านปัจจุบัน");
    await expect(page.locator("#my-account-pw-current")).toHaveClass(/article-field-invalid/);
  });

  test("8. current ผิด → error 'รหัสผ่านปัจจุบันไม่ถูกต้อง' + fail count เพิ่ม + ไม่ commit", async ({ page }) => {
    await openPasswordModal(page);
    await fillPasswordForm(page, { current: "wrong-password", next: NEW_PASSWORD, confirm: NEW_PASSWORD });
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("[data-my-account-pw-error='current']")).toHaveText("รหัสผ่านปัจจุบันไม่ถูกต้อง");
    expect(await page.evaluate(() => myAccountPwFailCount)).toBe(1);
    expect(await selfCredential(page)).toBe(MOCK_PASSWORD);
    // modal ยังเปิดให้แก้ไขต่อ
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
  });

  test("9. new ว่าง → error 'กรุณากรอกรหัสผ่านใหม่'", async ({ page }) => {
    await openPasswordModal(page);
    await fillPasswordForm(page, { current: MOCK_PASSWORD, next: "", confirm: "" });
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("[data-my-account-pw-error='new']")).toHaveText("กรุณากรอกรหัสผ่านใหม่");
  });

  test("10. new ไม่ผ่าน policy → error + checklist แสดง rule ที่ไม่ผ่าน", async ({ page }) => {
    await openPasswordModal(page);
    await fillPasswordForm(page, { current: MOCK_PASSWORD, next: "short", confirm: "short" });
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("[data-my-account-pw-error='new']")).toHaveText("รหัสผ่านยังไม่ตรงตามเงื่อนไข");
    // "short" ผ่านเฉพาะ lower — rule อื่นต้อง fail
    expect(await page.locator("[data-my-account-pw-rule='lower']").getAttribute("data-pass")).toBe("true");
    for (const rule of ["length", "upper", "digit", "special"]) {
      expect(await page.locator(`[data-my-account-pw-rule='${rule}']`).getAttribute("data-pass")).toBe("false");
    }
  });

  test("11. live checklist: พิมพ์ new password ผ่าน policy → ทุก rule data-pass=true ทันที", async ({ page }) => {
    await openPasswordModal(page);
    await page.locator("#my-account-pw-new").fill(NEW_PASSWORD);
    await page.waitForTimeout(150);
    for (const rule of ["length", "upper", "lower", "digit", "special"]) {
      expect(await page.locator(`[data-my-account-pw-rule='${rule}']`).getAttribute("data-pass")).toBe("true");
    }
    // ลบออก → rule กลับ fail (live update ทั้งสองทิศ)
    await page.locator("#my-account-pw-new").fill("abc");
    await page.waitForTimeout(150);
    expect(await page.locator("[data-my-account-pw-rule='length']").getAttribute("data-pass")).toBe("false");
  });

  test("12. confirm ว่าง → error 'กรุณายืนยันรหัสผ่านใหม่'", async ({ page }) => {
    await openPasswordModal(page);
    await fillPasswordForm(page, { current: MOCK_PASSWORD, next: NEW_PASSWORD, confirm: "" });
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("[data-my-account-pw-error='confirm']")).toHaveText("กรุณายืนยันรหัสผ่านใหม่");
  });

  test("13. confirm ไม่ตรง new → error 'รหัสผ่านไม่ตรงกัน'", async ({ page }) => {
    await openPasswordModal(page);
    await fillPasswordForm(page, { current: MOCK_PASSWORD, next: NEW_PASSWORD, confirm: NEW_PASSWORD + "!" });
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("[data-my-account-pw-error='confirm']")).toHaveText("รหัสผ่านไม่ตรงกัน");
  });

  test("14. new เหมือน current → error 'รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านปัจจุบัน' (หลังเปลี่ยนเป็นรหัสที่ผ่าน policy)", async ({ page }) => {
    // mock password เดิม "tukdaeng-admin" ไม่ผ่าน policy → เปลี่ยนเป็นรหัสที่ผ่าน policy ก่อน
    // แล้วลองตั้งรหัสใหม่ = รหัสปัจจุบันตัวนั้น เพื่อให้ถึง check new===current
    await openPasswordModal(page);
    await fillPasswordForm(page, { current: MOCK_PASSWORD, next: NEW_PASSWORD, confirm: NEW_PASSWORD });
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(300);
    // เปิด modal รอบสอง — new = current (NEW_PASSWORD) ที่เพิ่งตั้ง
    await page.locator("[data-my-account-action='change-password']").click();
    await page.waitForTimeout(200);
    await fillPasswordForm(page, { current: NEW_PASSWORD, next: NEW_PASSWORD, confirm: NEW_PASSWORD });
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("[data-my-account-pw-error='new']")).toHaveText("รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านปัจจุบัน");
    // ไม่ commit (credential คง NEW_PASSWORD รอบแรก)
    expect(await selfCredential(page)).toBe(NEW_PASSWORD);
  });

  test("15. พิมพ์ใหม่หลัง error → error ถูกเคลียร์ทันที", async ({ page }) => {
    await openPasswordModal(page);
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("[data-my-account-pw-error='current']")).toHaveClass(/show/);
    await page.locator("#my-account-pw-current").fill(MOCK_PASSWORD);
    await page.waitForTimeout(150);
    await expect(page.locator("[data-my-account-pw-error='current']")).not.toHaveClass(/show/);
    await expect(page.locator("#my-account-pw-current")).not.toHaveClass(/article-field-invalid/);
  });
});

// ==================== D. COMMIT — SUCCESS / AUDIT / SESSION ====================

test.describe("QA-BO-019b: Change Password — commit & audit", () => {

  test("16. เปลี่ยนสำเร็จ → success toast + credential อัปเดต + revision/sessionRevision bump + modal ปิด", async ({ page }) => {
    await openPasswordModal(page);
    const revBefore = (await selfAccount(page)).revision;
    const sessRevBefore = (await selfAccount(page)).sessionRevision || 0;
    await fillPasswordForm(page, { current: MOCK_PASSWORD, next: NEW_PASSWORD, confirm: NEW_PASSWORD });
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#success-toast")).toHaveClass(/show/);
    await expect(page.locator("#success-toast")).toContainText("เปลี่ยนรหัสผ่านเรียบร้อย");
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    expect(await selfCredential(page)).toBe(NEW_PASSWORD);
    const acc = await selfAccount(page);
    expect(acc.revision).toBe(revBefore + 1);
    // contract §6: revoke session อื่น → sessionRevision bump; current session คงอยู่ (ยังอยู่หน้า My Account)
    expect(acc.sessionRevision).toBe(sessRevBefore + 1);
    await expect(page.locator("body")).toHaveClass(/my-account-mode/);
    await expect(page.locator("#login-screen")).not.toBeVisible();
  });

  test("17. เปลี่ยนสำเร็จ → audit ADMIN_PASSWORD_CHANGE (module My Account, risk High, ไม่มี password ใน payload)", async ({ page }) => {
    await openPasswordModal(page);
    const before = await auditEventCount(page);
    await fillPasswordForm(page, { current: MOCK_PASSWORD, next: NEW_PASSWORD, confirm: NEW_PASSWORD });
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(300);
    expect(await auditEventCount(page)).toBe(before + 1);
    const evt = await page.evaluate(() => auditLogData.events[0]);
    expect(evt.eventType).toBe("ADMIN_PASSWORD_CHANGE");
    expect(evt.action).toBe("Change Password");
    expect(evt.module).toBe("My Account");
    expect(evt.risk).toBe("High");
    expect(evt.reference).toBe(SELF.id);
    expect(evt.result).toBe("Success");
    expect(evt.id).toMatch(/^AUD-\d{5}$/);
    // ห้ามมี password value ไหน ๆ ใน audit (ทั้งเก่า/ใหม่)
    const serialized = JSON.stringify(evt);
    expect(serialized).not.toContain(MOCK_PASSWORD);
    expect(serialized).not.toContain(NEW_PASSWORD);
  });

  test("18. Enter ใน field → submit เหมือนกดปุ่มเปลี่ยนรหัสผ่าน", async ({ page }) => {
    await openPasswordModal(page);
    await fillPasswordForm(page, { current: MOCK_PASSWORD, next: NEW_PASSWORD, confirm: NEW_PASSWORD });
    await page.locator("#my-account-pw-confirm").press("Enter");
    await page.waitForTimeout(300);
    expect(await selfCredential(page)).toBe(NEW_PASSWORD);
    await expect(page.locator("#success-toast")).toHaveClass(/show/);
  });

  test("19. fail count reset หลังเปลี่ยนสำเร็จ (attempt ก่อนหน้าไม่ติดลบค้าง)", async ({ page }) => {
    await openPasswordModal(page);
    // พลาด 1 ครั้งก่อน
    await fillPasswordForm(page, { current: "wrong-password", next: NEW_PASSWORD, confirm: NEW_PASSWORD });
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => myAccountPwFailCount)).toBe(1);
    // แก้ current ให้ถูก → สำเร็จ + reset
    await page.locator("#my-account-pw-current").fill(MOCK_PASSWORD);
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(300);
    expect(await selfCredential(page)).toBe(NEW_PASSWORD);
    expect(await page.evaluate(() => myAccountPwFailCount)).toBe(0);
  });
});

// ==================== E. RATE LIMIT — COOLDOWN 60s ====================

test.describe("QA-BO-019b: Change Password — rate limit cooldown", () => {

  test("20. current ผิดครบ 5 ครั้ง → cooldown: submit disabled + countdown + audit Failed/RATE_LIMITED", async ({ page }) => {
    await openPasswordModal(page);
    // เร่ง simulation: failCount = 4 → submit ผิดอีก 1 ครั้ง = ครบ limit
    await page.evaluate(() => { myAccountPwFailCount = 4; });
    const before = await auditEventCount(page);
    await fillPasswordForm(page, { current: "wrong-password", next: NEW_PASSWORD, confirm: NEW_PASSWORD });
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(200);
    // cooldown state — submit disabled + form-level error มี countdown ~60s
    await expect(page.locator("[data-my-account-action='save-password']")).toBeDisabled();
    const formError = page.locator("[data-my-account-pw-error='form']");
    await expect(formError).toBeVisible();
    await expect(formError).toContainText("วินาที");
    expect(await page.evaluate(() => myAccountPwCooldownUntil > Date.now())).toBe(true);
    // audit Failed + failureCode RATE_LIMITED — ไม่มี password ใน payload
    expect(await auditEventCount(page)).toBe(before + 1);
    const evt = await page.evaluate(() => auditLogData.events[0]);
    expect(evt.eventType).toBe("ADMIN_PASSWORD_CHANGE");
    expect(evt.result).toBe("Failed");
    expect(evt.failureCode).toBe("RATE_LIMITED");
    expect(JSON.stringify(evt)).not.toContain("wrong-password");
  });

  test("21. cooldown คงอยู่ข้ามการปิด/เปิด modal (state ระดับ account ไม่ใช่ modal)", async ({ page }) => {
    await openPasswordModal(page);
    await page.evaluate(() => {
      myAccountPwFailCount = 4;
      // เรียก save ผ่าน click จริงหลังเติมค่า — ทำให้ cooldown trigger
    });
    await fillPasswordForm(page, { current: "wrong-password", next: NEW_PASSWORD, confirm: NEW_PASSWORD });
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("[data-my-account-pw-error='form']")).toBeVisible();
    // ปิด modal แล้วเปิดใหม่ → ยัง locked
    await page.locator("[data-my-account-action='cancel-password']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-my-account-action='change-password']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("[data-my-account-action='save-password']")).toBeDisabled();
    await expect(page.locator("[data-my-account-pw-error='form']")).toBeVisible();
  });

  test("22. submit ระหว่าง cooldown → no-op (guard ระดับ function ไม่พึ่ง disabled เพียงอย่างเดียว)", async ({ page }) => {
    await openPasswordModal(page);
    await page.evaluate(() => {
      myAccountPwFailCount = 4;
      myAccountPwCooldownUntil = Date.now() + 60000;
    });
    const before = await auditEventCount(page);
    // bypass disabled → call handler ตรง ๆ (เทียบเท่า programmatic submit)
    await fillPasswordForm(page, { current: MOCK_PASSWORD, next: NEW_PASSWORD, confirm: NEW_PASSWORD });
    await page.evaluate(() => saveMyAccountPassword());
    await page.waitForTimeout(200);
    expect(await selfCredential(page)).toBe(MOCK_PASSWORD);
    expect(await auditEventCount(page)).toBe(before);
  });

  test("23. cooldown หมด → submit กลับมาใช้ได้ + fail count reset", async ({ page }) => {
    await openPasswordModal(page);
    await page.evaluate(() => {
      myAccountPwFailCount = 5;
      myAccountPwCooldownUntil = Date.now() + 1500; // cooldown สั้นสำหรับ test
      renderMyAccountPwCooldownState();
      startMyAccountPwCooldownTick();
    });
    await expect(page.locator("[data-my-account-action='save-password']")).toBeDisabled();
    // รอ cooldown หมด → tick เคลียร์ state อัตโนมัติ
    await page.waitForTimeout(2000);
    await expect(page.locator("[data-my-account-action='save-password']")).toBeEnabled();
    await expect(page.locator("[data-my-account-pw-error='form']")).not.toBeVisible();
    expect(await page.evaluate(() => myAccountPwFailCount)).toBe(0);
  });

  test("24. cooldown หมดตอน modal ปิด → เปิดใหม่ไม่มี banner + counter reset (attempt ใหม่นับจาก 1)", async ({ page }) => {
    await openPasswordModal(page);
    // lock แล้วปิด modal ข้ามช่วง cooldown (timer หยุด — counter ไม่ถูก reset)
    await page.evaluate(() => {
      myAccountPwFailCount = 5;
      myAccountPwCooldownUntil = Date.now() + 1200;
      renderMyAccountPwCooldownState();
      startMyAccountPwCooldownTick();
    });
    await page.locator("[data-my-account-action='cancel-password']").click();
    await page.waitForTimeout(1600); // cooldown หมดขณะ modal ปิด
    await page.locator("[data-my-account-action='change-password']").click();
    await page.waitForTimeout(200);
    // เปิดใหม่ → ไม่มี banner, ปุ่มใช้ได้, counter ถูก consume/reset
    await expect(page.locator("[data-my-account-pw-error='form']")).not.toBeVisible();
    await expect(page.locator("[data-my-account-action='save-password']")).toBeEnabled();
    expect(await page.evaluate(() => myAccountPwFailCount)).toBe(0);
    // attempt ใหม่ต้องนับจาก 1 (ไม่ re-lock ทันทีจาก count เก่าที่ค้าง)
    await fillPasswordForm(page, { current: "wrong-password", next: NEW_PASSWORD, confirm: NEW_PASSWORD });
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => myAccountPwFailCount)).toBe(1);
    await expect(page.locator("[data-my-account-action='save-password']")).toBeEnabled();
  });
});

// ==================== F. BOUNDARY — SELF-ONLY / ACTIVE / STALE ====================

test.describe("QA-BO-019b: Change Password — boundary checks", () => {

  test("25. stale revision → reject ไม่ commit + error toast (revision เปลี่ยนระหว่างเปิด modal)", async ({ page }) => {
    await openPasswordModal(page);
    const before = await auditEventCount(page);
    await fillPasswordForm(page, { current: MOCK_PASSWORD, next: NEW_PASSWORD, confirm: NEW_PASSWORD });
    await page.evaluate(() => {
      adminAccountData.accounts.find(a => a.id === "ADM-010").revision += 5;
    });
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#success-toast")).toContainText("หมดอายุ");
    expect(await selfCredential(page)).toBe(MOCK_PASSWORD);
    expect(await auditEventCount(page)).toBe(before);
    // modal ถูกปิด + page re-render เป็น state ล่าสุด
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
  });

  test("26. self account ไม่ใช่ Active ตอน commit → reject (boundary check ระดับ commit)", async ({ page }) => {
    await openPasswordModal(page);
    const before = await auditEventCount(page);
    await fillPasswordForm(page, { current: MOCK_PASSWORD, next: NEW_PASSWORD, confirm: NEW_PASSWORD });
    await page.evaluate(() => {
      adminAccountData.accounts.find(a => a.id === "ADM-010").status = "Locked";
    });
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#success-toast")).toContainText("หมดอายุ");
    expect(await selfCredential(page)).toBe(MOCK_PASSWORD);
    expect(await auditEventCount(page)).toBe(before);
    await page.evaluate(() => {
      adminAccountData.accounts.find(a => a.id === "ADM-010").status = "Active";
    });
  });

  test("27. self-only: auth.admin.accountId เปลี่ยนเป็น account อื่นระหว่างเปิด modal → commit ถูก reject", async ({ page }) => {
    await openPasswordModal(page);
    const before = await auditEventCount(page);
    await fillPasswordForm(page, { current: MOCK_PASSWORD, next: NEW_PASSWORD, confirm: NEW_PASSWORD });
    await page.evaluate(() => { auth.admin.accountId = "ADM-001"; });
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#success-toast")).toContainText("หมดอายุ");
    expect(await selfCredential(page)).toBe(MOCK_PASSWORD);
    expect(await auditEventCount(page)).toBe(before);
    await page.evaluate(() => { auth.admin.accountId = "ADM-010"; });
  });
});

// ==================== G. REGRESSION — NO LEAK / EXISTING FLOW ====================

test.describe("QA-BO-019b: Change Password — regression", () => {

  test("28. ปิด modal แล้ว state/class ถูกล้าง — ไม่ค้าง my-account-password-modal หรือ password field", async ({ page }) => {
    await openPasswordModal(page);
    await fillPasswordForm(page, { current: MOCK_PASSWORD, next: NEW_PASSWORD, confirm: NEW_PASSWORD });
    await page.locator("[data-my-account-action='cancel-password']").click();
    await page.waitForTimeout(200);
    // modal body ถูกล้าง — password ไม่ค้างใน DOM
    expect(await page.locator("#user-action-modal-body").innerHTML()).toBe("");
    expect(await page.locator("#my-account-pw-current").count()).toBe(0);
    expect(await page.locator(".user-action-modal").evaluate(el => el.className)).not.toContain("my-account-password-modal");
  });

  test("29. Edit Name flow เดิมยังทำงานปกติหลังมี Change Password (regression AIL-020)", async ({ page }) => {
    await goToMyAccount(page);
    const newName = "ผู้ดูแลระบบ Regression";
    await page.locator("[data-my-account-action='edit-name']").click();
    await page.locator("#my-account-name").fill(newName);
    await page.locator("[data-my-account-action='save-name']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("[data-my-account-name-display]")).toHaveText(newName);
    await expect(page.locator("#success-toast")).toHaveClass(/show/);
  });
});
