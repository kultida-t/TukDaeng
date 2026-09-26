// QA-BO-022: Failed Login Lockout (AIL-026) — lockout display บนหน้า Login
// อ้างอิง spec 01_AUTHENTICATION_MODULE §9/§14 + 16_ADMIN_SETTINGS_MODULE §10
//           (login พลาด 5 ครั้ง → lock 15 นาที) + AIL-019 Password Recovery Contract §7/§12
// scope: failed-attempt counting → lock ที่ครบ 5 ครั้ง, lockout message + countdown
//        บน Login, แยก failed-login lock (ปลดเอง: รอหมดเวลา / Reset Password) กับ
//        security/admin lock (authorized Unlock เท่านั้น), Suspended/Archived/Invited
//        blocked safely, ไม่สร้าง session ขณะ block, audit ADMIN_LOGIN_* ไม่มี secret
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

const ACTIVE_EMAIL = "current.admin@tukdaeng.example";        // ADM-010 Active (self)
const LOCKED_FAILED_LOGIN_EMAIL = "wichai@tukdaeng.example";  // ADM-007 Locked (failed_login)
const SUSPENDED_EMAIL = "pim@tukdaeng.example";               // ADM-006 Suspended
const ARCHIVED_EMAIL = "adisorn@tukdaeng.example";            // ADM-009 Archived
const INVITED_EMAIL = "nattapol@tukdaeng.example";            // ADM-008 Invited
const NEW_PASSWORD = "NewPassw0rd!Secure";

// helper: submit login form ด้วย email + scenario ที่กำหนด
async function submitLogin(page, email, scenario = "success") {
  await page.locator("#login-email").fill(email);
  // select อยู่ใน <details> ที่ปิดอยู่ (hidden) — set value ผ่าน evaluate + dispatch change
  // เพื่อ trigger handler เดิมที่ sync password ตาม scenario
  await page.locator("#auth-scenario").evaluate((el, v) => {
    el.value = v;
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, scenario);
  await page.locator("#login-form .btn.primary").click();
  await page.waitForTimeout(150);
}

// helper: submit bad-password n ครั้ง
async function failLogin(page, email, times = 1) {
  for (let i = 0; i < times; i += 1) {
    await submitLogin(page, email, "bad-password");
  }
}

function findAccount(page, adminId) {
  return page.evaluate(id => adminAccountData.accounts.find(a => a.id === id), adminId);
}

function auditEvents(page) {
  return page.evaluate(() => auditLogData.events);
}

function attemptEntry(page, adminId) {
  return page.evaluate(id => loginAttemptData[id] || null, adminId);
}

function isLoggedIn(page) {
  return page.evaluate(() => !document.body.classList.contains("logged-out"));
}

// ==================== A. FAILED-LOGIN LOCKOUT DISPLAY ====================

test.describe("QA-BO-022: Failed Login Lockout — display", () => {

  test("1. ADM-007 (Locked failed_login) → lockout message + countdown + forgot hint ไม่สร้าง session", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    await submitLogin(page, LOCKED_FAILED_LOGIN_EMAIL);
    const error = page.locator("#auth-error");
    await expect(error).toBeVisible();
    await expect(error).toHaveAttribute("data-lockout", "failed_login");
    await expect(error).toContainText("บัญชีถูกล็อกชั่วคราว");
    // countdown แสดงเวลาที่เหลือ (~15 นาทีจาก seed)
    await expect(page.locator("[data-lockout-countdown]")).toContainText("นาที");
    // self-service path: hint ชี้ไป forgot link (ไม่บอกว่า reset ปลด lock — generic)
    await expect(page.locator(".auth-lockout-hint")).toContainText("ลืมรหัสผ่าน?");
    await expect(error).not.toContainText("ปลดล็อก");
    await expect(error).not.toContainText("reset");
    // ไม่มี session ถูกสร้าง — ยัง logged-out
    expect(await isLoggedIn(page)).toBe(false);
  });

  test("2. countdown ลดลงจริงเมื่อเวลาผ่านไป", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    await submitLogin(page, LOCKED_FAILED_LOGIN_EMAIL);
    const cd = page.locator("[data-lockout-countdown]");
    const before = await cd.textContent();
    await page.waitForTimeout(2200);
    const after = await cd.textContent();
    expect(after).not.toBe(before);
    // format ยังคง "X นาที Y วินาที"
    await expect(cd).toContainText("วินาที");
  });

  test("3. login ที่ถูก block ระหว่าง lockout ถูก audit (ACCOUNT_LOCKED) โดยไม่มี password", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    await submitLogin(page, LOCKED_FAILED_LOGIN_EMAIL);
    const audits = await auditEvents(page);
    const blocked = audits.find(e => e.eventType === "ADMIN_LOGIN_FAILED" && e.reference === "ADM-007");
    expect(blocked).toBeTruthy();
    expect(blocked.result).toBe("Failed");
    expect(blocked.failureCode).toBe("ACCOUNT_LOCKED");
    // ห้ามมี password/secret ใน audit payload
    const serialized = JSON.stringify(blocked);
    expect(serialized).not.toContain("tukdaeng-admin");
    expect(serialized).not.toContain("password");
  });
});

// ==================== B. ATTEMPT COUNTING → LOCK ====================

test.describe("QA-BO-022: Failed Login Lockout — threshold", () => {

  test("4. พลาด 1-4 ครั้ง → generic invalid error เท่านั้น ไม่มี lockout / attempts นับสะสม", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    await failLogin(page, ACTIVE_EMAIL, 4);
    const error = page.locator("#auth-error");
    await expect(error).toContainText("Invalid credentials");
    // ไม่แสดง lockout/countdown — ไม่เปิดเผยว่าเหลือกี่ครั้ง
    await expect(page.locator("[data-lockout-countdown]")).toHaveCount(0);
    await expect(error).not.toHaveAttribute("data-lockout", "failed_login");
    const acc = await findAccount(page, "ADM-010");
    expect(acc.status).toBe("Active");
    expect((await attemptEntry(page, "ADM-010")).failedAttempts).toBe(4);
  });

  test("5. พลาดครบ 5 ครั้ง → account Locked + lockout display + audit ADMIN_LOGIN_LOCKED", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    await failLogin(page, ACTIVE_EMAIL, 5);
    const error = page.locator("#auth-error");
    await expect(error).toHaveAttribute("data-lockout", "failed_login");
    await expect(page.locator("[data-lockout-countdown]")).toBeVisible();
    const acc = await findAccount(page, "ADM-010");
    expect(acc.status).toBe("Locked");
    expect(await page.evaluate(() => passwordRecoveryLockReason["ADM-010"])).toBe("failed_login");
    const entry = await attemptEntry(page, "ADM-010");
    expect(entry.failedAttempts).toBe(5);
    expect(entry.lockedUntil).toBeGreaterThan(Date.now());
    // audit: 5 failed + 1 lock event
    const audits = await auditEvents(page);
    expect(audits.filter(e => e.eventType === "ADMIN_LOGIN_FAILED" && e.reference === "ADM-010" && e.failureCode === "INVALID_CREDENTIALS")).toHaveLength(5);
    const lock = audits.find(e => e.eventType === "ADMIN_LOGIN_LOCKED");
    expect(lock.result).toBe("Success");
    expect(lock.before).toBe("Active");
    expect(lock.after).toBe("Locked");
    expect(lock.reference).toBe("ADM-010");
    expect(await isLoggedIn(page)).toBe(false);
  });

  test("6. submit ซ้ำขณะล็อกอยู่ → ยังแสดง lockout (re-check จาก state ทุกครั้ง)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    await failLogin(page, ACTIVE_EMAIL, 5);
    // submit อีกครั้งด้วย password ถูก (scenario success) — ยังต้องถูก block
    await submitLogin(page, ACTIVE_EMAIL, "success");
    await expect(page.locator("#auth-error")).toHaveAttribute("data-lockout", "failed_login");
    await expect(page.locator("[data-lockout-countdown]")).toBeVisible();
    expect(await isLoggedIn(page)).toBe(false);
  });

  test("7. unknown email + bad-password → generic error เท่านั้น ไม่สร้าง attempt/audit (anti-enumeration)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    const auditsBefore = (await auditEvents(page)).length;
    await failLogin(page, "ghost@nowhere.example", 3);
    await expect(page.locator("#auth-error")).toContainText("Invalid credentials");
    // ไม่มี attempt entry / audit สำหรับ email ที่ resolve account ไม่ได้
    expect(await page.evaluate(() => Object.keys(loginAttemptData).filter(k => k !== "ADM-007"))).toHaveLength(0);
    expect((await auditEvents(page)).length).toBe(auditsBefore);
  });
});

// ==================== C. LOCK KIND DISTINCTION ====================

test.describe("QA-BO-022: Failed Login Lockout — lock kinds", () => {

  test("8. security/admin lock → generic blocked message ไม่มี countdown/self-service hint", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    // QA สลับ ADM-007 เป็น security/admin lock
    await page.evaluate(() => { passwordRecoveryLockReason["ADM-007"] = "security_admin"; });
    await submitLogin(page, LOCKED_FAILED_LOGIN_EMAIL);
    const error = page.locator("#auth-error");
    await expect(error).toHaveAttribute("data-lockout", "security_admin");
    await expect(error).toContainText("ไม่สามารถเข้าสู่ระบบได้");
    await expect(page.locator("[data-lockout-countdown]")).toHaveCount(0);
    await expect(page.locator(".auth-lockout-hint")).toHaveCount(0);
    expect(await isLoggedIn(page)).toBe(false);
    // audit บล็อกด้วย failureCode LOCK_REASON_BLOCKED
    const audits = await auditEvents(page);
    const blocked = audits.find(e => e.eventType === "ADMIN_LOGIN_FAILED" && e.reference === "ADM-007");
    expect(blocked.failureCode).toBe("LOCK_REASON_BLOCKED");
  });

  test("9. Suspended (ADM-006) → blocked message เดียวกัน ไม่มี countdown", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    await submitLogin(page, SUSPENDED_EMAIL);
    const error = page.locator("#auth-error");
    await expect(error).toHaveAttribute("data-lockout", "unavailable");
    await expect(error).toContainText("ไม่สามารถเข้าสู่ระบบได้");
    await expect(page.locator("[data-lockout-countdown]")).toHaveCount(0);
    expect(await isLoggedIn(page)).toBe(false);
    const audits = await auditEvents(page);
    const blocked = audits.find(e => e.eventType === "ADMIN_LOGIN_FAILED" && e.reference === "ADM-006");
    expect(blocked.failureCode).toBe("ACCOUNT_UNAVAILABLE");
  });

  test("10. Archived + Invited accounts → blocked safely เหมือนกัน", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    for (const [email, ref] of [[ARCHIVED_EMAIL, "ADM-009"], [INVITED_EMAIL, "ADM-008"]]) {
      await submitLogin(page, email);
      await expect(page.locator("#auth-error")).toHaveAttribute("data-lockout", "unavailable");
      expect(await isLoggedIn(page)).toBe(false);
      const audits = await auditEvents(page);
      expect(audits.find(e => e.eventType === "ADMIN_LOGIN_FAILED" && e.reference === ref)?.failureCode).toBe("ACCOUNT_UNAVAILABLE");
    }
  });
});

// ==================== D. RECOVERY PATHS ====================

test.describe("QA-BO-022: Failed Login Lockout — recovery", () => {

  test("11. lock หมดอายุ (scenario lockout-expired) → lazy unlock + login สำเร็จ + attempts เคลียร์", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    await submitLogin(page, LOCKED_FAILED_LOGIN_EMAIL, "lockout-expired");
    expect(await isLoggedIn(page)).toBe(true);
    const acc = await findAccount(page, "ADM-007");
    expect(acc.status).toBe("Active");
    expect(await page.evaluate(() => passwordRecoveryLockReason["ADM-007"])).toBeUndefined();
    expect(await attemptEntry(page, "ADM-007")).toBeNull();
    await expect(page.locator("#login-screen")).toBeHidden();
  });

  test("12. countdown ถึง 0 → ปลดล็อกตาม state จริง + แสดง info state", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    // QA: ทำให้ lock เหลือ ~2 วินาทีแล้ว submit → countdown วิ่งจนหมด
    await page.evaluate(() => {
      loginAttemptData["ADM-007"].lockedUntil = Date.now() + 2000;
    });
    await submitLogin(page, LOCKED_FAILED_LOGIN_EMAIL);
    await expect(page.locator("[data-lockout-countdown]")).toBeVisible();
    await page.waitForSelector("#auth-error[data-lockout='expired']", { timeout: 8000 });
    const acc = await findAccount(page, "ADM-007");
    expect(acc.status).toBe("Active");
    expect(await page.evaluate(() => passwordRecoveryLockReason["ADM-007"])).toBeUndefined();
    await expect(page.locator("#auth-error")).toHaveClass(/is-info/);
    // login ด้วย credentials ถูกหลังปลดล็อก → สำเร็จ
    await submitLogin(page, LOCKED_FAILED_LOGIN_EMAIL);
    expect(await isLoggedIn(page)).toBe(true);
  });

  test("13. Reset Password ปลด failed-login lock → login ได้ (เส้นทาง AIL-025)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    // ออก reset token จริงผ่าน issuance path (ADM-007 = failed_login → eligible)
    const token = await page.evaluate(async (email) => {
      const result = processPasswordResetRequest(email, `qa-${Date.now()}`);
      for (const [t, ref] of passwordResetTokenFixtures) {
        if (ref.requestId === result.requestId) return t;
      }
      return null;
    }, LOCKED_FAILED_LOGIN_EMAIL);
    expect(token).toBeTruthy();
    await page.goto(`${PROTOTYPE_URL}#reset-token=${token}`);
    await page.waitForSelector("#reset-form", { timeout: 5000 });
    await page.locator("#reset-password").fill(NEW_PASSWORD);
    await page.locator("#reset-password-confirm").fill(NEW_PASSWORD);
    await page.locator("#reset-submit").click();
    await page.waitForSelector("[data-reset-success]", { timeout: 5000 });
    // commit ปลด lock + เคลียร์ attempts ใน atomic boundary เดียวกัน
    const acc = await findAccount(page, "ADM-007");
    expect(acc.status).toBe("Active");
    expect(await page.evaluate(() => passwordRecoveryLockReason["ADM-007"])).toBeUndefined();
    expect(await attemptEntry(page, "ADM-007")).toBeNull();
    // กลับ Login → login สำเร็จ ไม่เห็น lockout อีก
    await page.locator("[data-reset-exit]").click();
    await page.waitForSelector("#login-form", { timeout: 5000 });
    await submitLogin(page, LOCKED_FAILED_LOGIN_EMAIL);
    expect(await isLoggedIn(page)).toBe(true);
  });

  test("14. security/admin lock → Reset Password ไม่ปลดล็อก (lock_reason_blocked)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    const token = await page.evaluate(() => {
      const acc = adminAccountData.accounts.find(a => a.id === "ADM-007");
      const request = seedPasswordResetLinkFixture(acc);
      passwordRecoveryLockReason["ADM-007"] = "security_admin";
      return getPasswordResetLinkToken(request);
    });
    await page.goto(`${PROTOTYPE_URL}#reset-token=${token}`);
    await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
    await expect(page.locator("[data-reset-failure]")).toHaveAttribute("data-reset-failure", "lock_reason_blocked");
    // login ยังถูก block และยังเป็น security_admin lock (ไม่มี countdown)
    await page.locator("[data-reset-exit]").click();
    await page.waitForSelector("#login-form", { timeout: 5000 });
    await submitLogin(page, LOCKED_FAILED_LOGIN_EMAIL);
    await expect(page.locator("#auth-error")).toHaveAttribute("data-lockout", "security_admin");
    expect(await isLoggedIn(page)).toBe(false);
  });

  test("15. login สำเร็จปกติ → เคลียร์ failed-attempt counter (ไม่มี lock)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    await failLogin(page, ACTIVE_EMAIL, 3);
    expect((await attemptEntry(page, "ADM-010")).failedAttempts).toBe(3);
    await submitLogin(page, ACTIVE_EMAIL, "success");
    expect(await isLoggedIn(page)).toBe(true);
    expect(await attemptEntry(page, "ADM-010")).toBeNull();
  });
});
