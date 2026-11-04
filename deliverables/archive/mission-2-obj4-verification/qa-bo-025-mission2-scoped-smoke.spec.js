// QA-BO-025: Mission 2 — Scoped UI/Responsive/Accessibility Smoke (AIL-030)
// contract: AIL-018 self-service contract + AIL-019 password recovery contract
//   (requirement bf08de1f) + 01_AUTHENTICATION_MODULE §8/§9/§13-15
//   + 16_ADMIN_SETTINGS_MODULE §7/§10
// scope: เฉพาะ surface ที่ Mission 2 เพิ่ม/แก้ — Login boundary + lockout display,
//   Forgot Password (ready/validation/accepted/system-error), Reset Password
//   (token lifecycle states + form + success/transient), My Account page,
//   Edit Name modal, Change Password modal, Active Sessions + revoke modal,
//   Logout All Devices modal, Session Expired gate
// viewports: ครบทั้ง 4 projects (desktop-1440 / desktop-1280 / tablet-768 /
//   mobile-390) ตาม viewport ของ config โดยตรง — ไม่ skip project
// ไม่ครอบ Mission 3 (full regression/protected lock) — additive เท่านั้น
// ไม่ซ้ำ functional assertions ของ 019a-e/020/021/022
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

const ACTIVE_EMAIL = "current.admin@tukdaeng.example";        // ADM-010 Active (self)
const LOCKED_FAILED_LOGIN_EMAIL = "wichai@tukdaeng.example";  // ADM-007 Locked (failed_login)
const SUSPENDED_EMAIL = "pim@tukdaeng.example";               // ADM-006 Suspended
const NEW_PASSWORD = "NewPassw0rd!Secure";
const GENERIC_MESSAGE = "ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ไปยังอีเมลที่ลงทะเบียน";

// ---------- helpers (pattern เดียวกับ qa-bo-018/019a-e/020/021/022) ----------

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

async function goToMyAccount(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  await page.locator("#my-account-entry").click();
  await page.waitForTimeout(300);
}

// helper: submit login form ด้วย email + scenario (select อยู่ใน <details> — set ผ่าน evaluate)
async function submitLogin(page, email, scenario = "success") {
  await page.locator("#login-email").fill(email);
  await page.locator("#auth-scenario").evaluate((el, v) => {
    el.value = v;
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, scenario);
  await page.locator("#login-form .btn.primary").click();
  await page.waitForTimeout(150);
}

// helper: สร้าง reset request จริงผ่าน issuance path แล้วคืน raw token
async function mintResetToken(page, email) {
  return page.evaluate(async (normalizedEmail) => {
    const result = processPasswordResetRequest(normalizedEmail, `qa-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    if (!result.ok || !result.requestId) return null;
    for (const [token, ref] of passwordResetTokenFixtures) {
      if (ref.requestId === result.requestId) return token;
    }
    return null;
  }, email);
}

// helper: seed request record ตรง (สำหรับ token states ที่ issuance path ไม่สร้าง)
async function seedResetToken(page, adminId, overrides = {}) {
  return page.evaluate(([id, ov]) => {
    const acc = adminAccountData.accounts.find(a => a.id === id);
    if (!acc) return null;
    const request = seedPasswordResetLinkFixture(acc, ov);
    return getPasswordResetLinkToken(request);
  }, [adminId, overrides]);
}

// viewport smoke primitives — overflow / อยู่ในจอ / action ใช้ได้
async function expectNoHorizontalScroll(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

async function expectWithinViewport(page, locator, label) {
  const box = await locator.boundingBox();
  const vw = await page.evaluate(() => window.innerWidth);
  expect(box, `${label}: no bounding box`).toBeTruthy();
  expect(box.x, `${label}: ล้นซ้าย`).toBeGreaterThanOrEqual(-1);
  expect(box.x + box.width, `${label}: ล้นขวา (viewport ${vw})`).toBeLessThanOrEqual(vw + 1);
}

// ==================== Scoped smoke — Mission 2 surfaces ====================

test.describe("QA-BO-025: Mission 2 scoped UI/responsive/accessibility smoke (AIL-030)", () => {

  // ---------- 1. Login boundary + Forgot entry ----------

  test("1. Login boundary: form render ครบทุก viewport ไม่ overflow + Email + Password → BO ตรง ไม่มี OTP step", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#login-screen")).toBeVisible();
    await expect(page.locator("#login-form")).toBeVisible();
    await expect(page.locator("#login-email")).toBeVisible();
    await expect(page.locator("#login-password")).toBeVisible();
    await expect(page.locator("#password-toggle")).toHaveAttribute("aria-label", "Show password");
    await expect(page.locator("#forgot-password-btn")).toBeVisible();
    await expect(page.locator("#login-form button[type=\"submit\"]")).toBeVisible();
    await expectNoHorizontalScroll(page);

    // Email + Password → BO ตรง — baseline ไม่มี intermediate OTP step
    await page.locator("#login-form button[type=\"submit\"]").click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await expect(page.locator("#otp-form")).toHaveCount(0);
    await expect(page.locator("#login-screen")).toBeHidden();
    await expect(page.locator("#page-title")).toHaveText("Dashboard");
    await expectNoHorizontalScroll(page);
  });

  // ---------- 2. Failed-login lockout display บน Login ----------

  test("2. Lockout display (failed_login): lockout message + countdown + forgot hint ครบทุก viewport ไม่ overflow", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    await submitLogin(page, LOCKED_FAILED_LOGIN_EMAIL);

    const error = page.locator("#auth-error");
    await expect(error).toBeVisible();
    await expect(error).toHaveAttribute("role", "alert");
    await expect(error).toHaveAttribute("data-lockout", "failed_login");
    await expect(error).toContainText("บัญชีถูกล็อกชั่วคราว");
    const countdown = page.locator("[data-lockout-countdown]");
    await expect(countdown).toContainText("นาที");
    // self-service hint ชี้ forgot link — generic ไม่เปิดเผยว่า reset ปลด lock
    await expect(page.locator(".auth-lockout-hint")).toContainText("ลืมรหัสผ่าน?");
    await expectWithinViewport(page, error, "lockout error block");
    await expectNoHorizontalScroll(page);

    // countdown วิ่งจริง (format "X นาที Y วินาที" เปลี่ยนตามเวลา)
    const before = await countdown.textContent();
    await page.waitForTimeout(2200);
    expect(await countdown.textContent()).not.toBe(before);
    // ยัง logged-out — block ไม่สร้าง session
    expect(await page.evaluate(() => document.body.classList.contains("logged-out"))).toBe(true);
  });

  test("3. Lock kinds: security_admin / Suspended → blocked message ไม่มี countdown/hint ทุก viewport", async ({ page }) => {
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
    await expectWithinViewport(page, error, "security_admin error");
    await expectNoHorizontalScroll(page);

    // Suspended → unavailable display เดียวกัน ไม่มี countdown
    await submitLogin(page, SUSPENDED_EMAIL);
    await expect(error).toHaveAttribute("data-lockout", "unavailable");
    await expect(page.locator("[data-lockout-countdown]")).toHaveCount(0);
    await expectNoHorizontalScroll(page);
    expect(await page.evaluate(() => document.body.classList.contains("logged-out"))).toBe(true);
  });

  // ---------- 4. Forgot Password — ready state ----------

  test("4. Forgot Password ready state: fields + brand + exit ครบทุก viewport + initial focus ที่ email", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#forgot-password-btn", { timeout: 10000 });
    await page.locator("#forgot-password-btn").click();
    await page.waitForSelector("#forgot-form", { timeout: 5000 });

    await expect(page.locator("#forgot-screen")).toBeVisible();
    await expect(page.locator("#login-screen")).toBeHidden();
    await expect(page.locator("#forgot-screen .login-title")).toContainText("FORGOT");
    await expect(page.locator("#forgot-screen .forgot-brand .brand-name")).toHaveText("Tuk Daeng");
    const email = page.locator("#forgot-email");
    await expect(email).toBeVisible();
    await expect(email).toHaveAttribute("type", "email");
    await expect(email).toHaveAttribute("autocomplete", "username");
    expect(await email.evaluate(el => el.closest("label")?.textContent || "")).toContain("Email");
    const submit = page.locator("#forgot-submit");
    await expect(submit).toBeVisible();
    await expect(submit).toBeEnabled();
    await expectWithinViewport(page, submit, "forgot submit");
    const exit = page.locator("[data-forgot-exit]");
    await expect(exit).toBeVisible();
    await expectWithinViewport(page, exit, "forgot back link");
    await expectNoHorizontalScroll(page);
    // initial focus อยู่ที่ email field — keyboard entry ทันที
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("forgot-email");
  });

  // ---------- 5. Forgot Password — error association + keyboard ----------

  test("5. Forgot validation: error ผูก field (role=alert + aria) + focus กลับ field + keyboard submit ทำงาน", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#forgot-password-btn", { timeout: 10000 });
    await page.locator("#forgot-password-btn").click();
    await page.waitForSelector("#forgot-form", { timeout: 5000 });

    // submit ว่าง → error ผูก field
    await page.locator("#forgot-submit").click();
    await page.waitForTimeout(200);
    const error = page.locator("#forgot-email-error");
    await expect(error).toHaveClass(/show/);
    await expect(error).toHaveAttribute("role", "alert");
    await expect(error).toHaveText("กรุณากรอกอีเมล");
    const input = page.locator("#forgot-email");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAttribute("aria-errormessage", "forgot-email-error");
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("forgot-email");

    // พิมพ์แก้ → error เคลียร์ (aria-invalid กลับ false)
    await input.fill(ACTIVE_EMAIL);
    await page.waitForTimeout(150);
    await expect(error).not.toHaveClass(/show/);
    await expect(input).toHaveAttribute("aria-invalid", "false");

    // keyboard submit (Enter ใน form) → accepted state โดยไม่ต้องคลิก
    await input.press("Enter");
    await page.waitForSelector("[data-forgot-accepted]", { timeout: 5000 });
    await expect(page.locator("[data-forgot-accepted]")).toHaveText(GENERIC_MESSAGE);
  });

  // ---------- 6. Forgot Password — accepted + system-error recovery ----------

  test("6. Forgot accepted/system-error states: generic response role=status + action focus/ใช้ได้ทุก viewport", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#forgot-password-btn", { timeout: 10000 });
    await page.locator("#forgot-password-btn").click();
    await page.waitForSelector("#forgot-form", { timeout: 5000 });
    await page.locator("#forgot-email").fill(ACTIVE_EMAIL);
    await page.locator("#forgot-submit").click();
    await page.waitForSelector("[data-forgot-accepted]", { timeout: 5000 });

    // accepted — generic message เดียวกันทุก outcome + exit focus/within viewport
    const accepted = page.locator("[data-forgot-accepted]");
    await expect(accepted).toHaveAttribute("role", "status");
    await expect(accepted).toHaveText(GENERIC_MESSAGE);
    const exit = page.locator("[data-forgot-exit]");
    await expect(exit).toBeVisible();
    await expect(exit).toHaveText("กลับไปหน้า Login");
    await expectWithinViewport(page, exit, "accepted exit");
    expect(await page.evaluate(() => document.activeElement?.hasAttribute("data-forgot-exit"))).toBe(true);
    await expectNoHorizontalScroll(page);
    await exit.click();
    await page.waitForTimeout(300);
    await expect(page.locator("#login-screen")).toBeVisible();

    // system-error scenario → error recovery role=alert + ลองอีกครั้ง focus
    await page.locator("#forgot-password-btn").click();
    await page.waitForSelector("#forgot-form", { timeout: 5000 });
    await page.evaluate(() => {
      const s = document.querySelector("#forgot-scenario");
      s.value = "system-error";
      s.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.locator("#forgot-email").fill(ACTIVE_EMAIL);
    await page.locator("#forgot-submit").click();
    await page.waitForSelector("[data-forgot-error]", { timeout: 5000 });
    await expect(page.locator("[data-forgot-error]")).toHaveAttribute("role", "alert");
    const retry = page.locator("[data-forgot-retry]");
    await expect(retry).toBeVisible();
    await expect(retry).toBeEnabled();
    await expectWithinViewport(page, retry, "forgot retry");
    expect(await page.evaluate(() => document.activeElement?.hasAttribute("data-forgot-retry"))).toBe(true);
    await expectNoHorizontalScroll(page);
  });

  // ---------- 7. Reset Password — token lifecycle states sweep ----------

  test("7. Reset token states sweep: ทุก terminal state render title + role=alert + action ครบทุก viewport", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });

    // seed token ต่อ state (invalid ใช้ token ตรง ไม่ต้อง seed)
    const expiredToken = await seedResetToken(page, "ADM-010", { expiresAt: new Date(Date.now() - 60e3).toISOString() });
    const usedToken = await seedResetToken(page, "ADM-010", { status: "Used", usedAt: new Date().toISOString() });
    const supersededToken = await seedResetToken(page, "ADM-010", { status: "Superseded" });
    const ineligibleToken = await seedResetToken(page, "ADM-006"); // Suspended

    const cases = [
      { name: "invalid", token: "sim-rst-invalid", failure: "invalid_token", title: "LINK NOT VALID", primary: "data-reset-forgot" },
      { name: "expired", token: expiredToken, failure: "expired", title: "LINK EXPIRED", primary: "data-reset-forgot" },
      { name: "used", token: usedToken, failure: "already_used", title: "LINK ALREADY USED", primary: "data-reset-exit" },
      { name: "superseded", token: supersededToken, failure: "superseded", title: "LINK REPLACED", primary: "data-reset-exit" },
      { name: "ineligible", token: ineligibleToken, failure: "account_ineligible", title: "RESET UNAVAILABLE", primary: "data-reset-exit" }
    ];

    for (const c of cases) {
      expect(c.token, `${c.name}: token seed`).toBeTruthy();
      // same-document hash navigation — state เดิมใน page
      await page.evaluate(t => { window.location.hash = `reset-token=${t}`; }, c.token);
      await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });

      const failure = page.locator("[data-reset-failure]");
      await expect(failure, c.name).toHaveAttribute("data-reset-failure", c.failure);
      await expect(failure, c.name).toHaveAttribute("role", "alert");
      await expect(page.locator("#reset-screen .login-title"), c.name).toContainText(c.title);
      // ไม่มี password form ใน recovery state
      await expect(page.locator("#reset-form")).toHaveCount(0);
      // primary recovery action แสดง/กดได้/อยู่ในจอ/ได้ focus
      const primary = page.locator(`[${c.primary}]`);
      await expect(primary, c.name).toBeVisible();
      await expect(primary, c.name).toBeEnabled();
      await expectWithinViewport(page, primary, `${c.name} primary action`);
      const exit = page.locator("[data-reset-exit]");
      await expect(exit, c.name).toBeVisible();
      await expectWithinViewport(page, exit, `${c.name} exit`);
      expect(await page.evaluate(sel =>
        document.activeElement?.hasAttribute(sel), c.primary), c.name).toBe(true);
      await expectNoHorizontalScroll(page);
    }

    // recovery channel จาก invalid → forgot screen (action ใช้ได้จริง)
    await page.evaluate(() => { window.location.hash = "reset-token=sim-rst-invalid"; });
    await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
    await page.locator("[data-reset-forgot]").click();
    await page.waitForSelector("#forgot-form", { timeout: 5000 });
    expect(await page.evaluate(() => document.body.classList.contains("forgot-mode"))).toBe(true);
    expect(await page.evaluate(() => document.body.classList.contains("reset-mode"))).toBe(false);
  });

  // ---------- 8. Reset Password — form render ----------

  test("8. Reset form: masked email + fields/labels + toggles + policy + submit ครบทุก viewport + initial focus", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    const token = await mintResetToken(page, ACTIVE_EMAIL);
    await page.goto(`${PROTOTYPE_URL}#reset-token=${token}`);
    await page.waitForSelector("#reset-form", { timeout: 5000 });

    await expect(page.locator("#reset-screen .login-title")).toContainText("RESET");
    await expect(page.locator("#reset-screen .reset-brand .brand-name")).toHaveText("Tuk Daeng");
    // masked email — ไม่เปิดเผย email เต็ม
    await expect(page.locator("[data-reset-field='email']")).toContainText("***@tukdaeng.example");
    const pw = page.locator("#reset-password");
    const confirm = page.locator("#reset-password-confirm");
    await expect(pw).toBeVisible();
    await expect(confirm).toBeVisible();
    // input อยู่ใน label — association ครบ
    expect(await pw.evaluate(el => el.closest("label")?.textContent || "")).toContain("รหัสผ่านใหม่");
    expect(await confirm.evaluate(el => el.closest("label")?.textContent || "")).toContain("ยืนยันรหัสผ่าน");
    await expect(pw).toHaveAttribute("type", "password");
    await expect(pw).toHaveAttribute("autocomplete", "new-password");
    await expect(confirm).toHaveAttribute("autocomplete", "new-password");
    // ไม่มี current password field (recovery = possession proof แล้ว)
    await expect(page.locator("#reset-screen input[type='password']")).toHaveCount(2);
    await expect(page.locator("#reset-password-toggle")).toHaveAttribute("aria-label", "Show password");
    await expect(page.locator("#reset-password-confirm-toggle")).toHaveAttribute("aria-label", "Show password");
    await expect(page.locator("#reset-policy li")).toHaveCount(5);
    const submit = page.locator("#reset-submit");
    await expect(submit).toBeVisible();
    await expect(submit).toBeEnabled();
    await expectWithinViewport(page, submit, "reset submit");
    await expectNoHorizontalScroll(page);
    // initial focus ที่ password field แรก
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("reset-password");
  });

  // ---------- 9. Reset Password — validation association + keyboard ----------

  test("9. Reset validation: errors ผูก aria + focus ไป field แรกที่ผิด + policy live-update + Enter submit", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    const token = await mintResetToken(page, ACTIVE_EMAIL);
    await page.goto(`${PROTOTYPE_URL}#reset-token=${token}`);
    await page.waitForSelector("#reset-form", { timeout: 5000 });

    // submit ว่าง → error ผูก field (role=alert + aria-invalid + aria-errormessage)
    await page.locator("#reset-submit").click();
    await page.waitForTimeout(200);
    const pwError = page.locator("#reset-password-error");
    await expect(pwError).toHaveClass(/show/);
    await expect(pwError).toHaveAttribute("role", "alert");
    await expect(pwError).toHaveText("กรุณากรอกรหัสผ่านใหม่");
    await expect(page.locator("#reset-password")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#reset-password"))
      .toHaveAttribute("aria-errormessage", "reset-password-error");
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("reset-password");

    // password ผ่าน policy แต่ confirm ไม่ตรง → error ผูก confirm field
    await page.locator("#reset-password").fill(NEW_PASSWORD);
    await page.locator("#reset-password-confirm").fill("Mismatch#12345");
    await page.locator("#reset-submit").click();
    await page.waitForTimeout(200);
    const confirmError = page.locator("#reset-password-confirm-error");
    await expect(confirmError).toHaveClass(/show/);
    await expect(confirmError).toHaveText("รหัสผ่านไม่ตรงกัน");
    await expect(page.locator("#reset-password-confirm")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#reset-password-confirm"))
      .toHaveAttribute("aria-errormessage", "reset-password-confirm-error");
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("reset-password-confirm");

    // policy checklist live-update ตอนพิมพ์
    const passedRules = await page.locator("#reset-policy li").evaluateAll(
      items => items.filter(li => li.getAttribute("data-pass") === "true").length);
    expect(passedRules).toBe(5);

    // keyboard submit (Enter ใน form) → สำเร็จโดยไม่ต้องคลิก
    await page.locator("#reset-password-confirm").fill(NEW_PASSWORD);
    await page.locator("#reset-password-confirm").press("Enter");
    await page.waitForSelector("[data-reset-success]", { timeout: 5000 });
    await expect(page.locator("#reset-screen .login-title")).toContainText("PASSWORD");
  });

  // ---------- 10. Reset Password — success + transient recovery ----------

  test("10. Reset success + transient states: role=status/alert + action focus/keyboard ใช้ได้ทุก viewport", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    const token = await mintResetToken(page, ACTIVE_EMAIL);
    await page.goto(`${PROTOTYPE_URL}#reset-token=${token}`);
    await page.waitForSelector("#reset-form", { timeout: 5000 });

    // transient: scenario commit-failed → RESET NOT COMPLETED + ลองอีกครั้ง focus
    await page.evaluate(() => {
      const s = document.querySelector("#reset-scenario");
      s.value = "commit-failed";
      s.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.locator("#reset-password").fill(NEW_PASSWORD);
    await page.locator("#reset-password-confirm").fill(NEW_PASSWORD);
    await page.locator("#reset-submit").click();
    await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
    await expect(page.locator("[data-reset-failure]")).toHaveAttribute("data-reset-recovery", "transient");
    await expect(page.locator("[data-reset-failure]")).toHaveAttribute("role", "alert");
    await expect(page.locator("#reset-screen .login-title")).toContainText("RESET NOT COMPLETED");
    const retry = page.locator("[data-reset-retry]");
    const exitGhost = page.locator("[data-reset-exit]");
    await expect(retry).toBeVisible();
    await expect(retry).toBeEnabled();
    await expectWithinViewport(page, retry, "reset retry");
    await expectWithinViewport(page, exitGhost, "reset exit");
    expect(await page.evaluate(() => document.activeElement?.hasAttribute("data-reset-retry"))).toBe(true);
    await expectNoHorizontalScroll(page);

    // retry → form กลับมา → commit-ok → success state role=status + exit focus
    await retry.click();
    await page.waitForSelector("#reset-form", { timeout: 5000 });
    await page.evaluate(() => {
      const s = document.querySelector("#reset-scenario");
      s.value = "commit-ok";
      s.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.locator("#reset-password").fill(NEW_PASSWORD);
    await page.locator("#reset-password-confirm").fill(NEW_PASSWORD);
    await page.locator("#reset-submit").click();
    await page.waitForSelector("[data-reset-success]", { timeout: 5000 });
    await expect(page.locator("[data-reset-success]")).toHaveAttribute("role", "status");
    const exit = page.locator("[data-reset-exit]");
    await expect(exit).toBeVisible();
    await expect(exit).toHaveText("กลับไปหน้า Login");
    await expectWithinViewport(page, exit, "success exit");
    expect(await page.evaluate(() => document.activeElement?.hasAttribute("data-reset-exit"))).toBe(true);
    await expectNoHorizontalScroll(page);

    // keyboard Enter บน focused action → กลับ Login
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
    await expect(page.locator("#reset-screen")).toBeHidden();
    await expect(page.locator("#login-screen")).toBeVisible();
    await expect(page.locator("#login-form")).toBeVisible();
  });

  // ---------- 11. My Account — page render + responsive grid ----------

  test("11. My Account: entry .admin-box → หน้า render ครบ + detail-grid responsive ตาม viewport + ไม่ overflow", async ({ page }) => {
    await goToMyAccount(page);
    await expect(page.locator("body")).toHaveClass(/my-account-mode/);
    await expect(page.locator("#page-title")).toHaveText("My Account");
    await expect(page.locator("#crumb")).toHaveText("My Account");

    // Account Summary 6 tiles + grid columns ตาม convention (≤760 → 1 / ≤1180 → 2 / อื่น → 3)
    const grid = page.locator("[data-my-account-section='profile'] .detail-grid.three");
    expect(await page.locator("[data-my-account-section='profile'] .detail-grid.three .detail-tile").count()).toBe(6);
    const colCount = await grid.evaluate(
      el => getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length);
    const width = page.viewportSize().width;
    const expected = width <= 760 ? 1 : width <= 1180 ? 2 : 3;
    expect(colCount).toBe(expected);

    // sections ครบ + action entry อยู่ในจอทุก viewport
    await expect(page.locator("[data-my-account-section='security']")).toBeVisible();
    await expect(page.locator("[data-my-account-section='sessions']")).toBeVisible();
    await expect(page.locator("[data-my-account-action='edit-name']")).toBeVisible();
    const changePw = page.locator("[data-my-account-action='change-password']");
    await expect(changePw).toBeVisible();
    await expectWithinViewport(page, changePw, "change password action");
    await expectNoHorizontalScroll(page);
  });

  // ---------- 12. My Account — Edit Name modal ----------

  test("12. Edit Name modal: ครบทุก viewport ไม่ overflow + error association + focus + ปิดได้", async ({ page }) => {
    await goToMyAccount(page);
    await page.locator("[data-my-account-action='edit-name']").click();
    await page.waitForTimeout(200);

    const modal = page.locator("#user-action-modal");
    await expect(modal).toHaveClass(/show/);
    await expect(page.locator(".my-account-name-modal")).toBeVisible();
    await expectWithinViewport(page, modal.locator(".user-action-modal"), "edit name modal");
    const input = page.locator("#my-account-name");
    await expect(input).toBeVisible();
    expect(await input.evaluate(el => el.closest("div")?.querySelector("label")?.getAttribute("for") || ""))
      .toBe("my-account-name");
    await expect(page.locator("[data-my-account-action='cancel-name']")).toBeVisible();
    await expect(page.locator("[data-my-account-action='save-name']")).toBeVisible();

    // submit ว่าง → error ผูก field (role=alert + aria-invalid) + focus กลับ input
    await input.fill("");
    await page.locator("[data-my-account-action='save-name']").click();
    await page.waitForTimeout(200);
    const error = page.locator("[data-my-account-name-error]");
    await expect(error).toHaveClass(/show/);
    await expect(error).toHaveAttribute("role", "alert");
    await expect(error).toHaveText("กรุณากรอกชื่อ");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("my-account-name");

    // พิมพ์แก้ → error เคลียร์ + aria-invalid กลับ false
    await input.fill("สโมค ทดสอบ");
    await page.waitForTimeout(150);
    await expect(error).not.toHaveClass(/show/);
    await expect(input).toHaveAttribute("aria-invalid", "false");

    // ยกเลิก → modal ปิด ชื่อไม่เปลี่ยน + page ยัง interactive
    await page.locator("[data-my-account-action='cancel-name']").click();
    await page.waitForTimeout(200);
    await expect(modal).not.toHaveClass(/show/);
    await expect(page.locator("[data-my-account-name-display]")).toHaveText("ผู้ดูแลระบบ");
    await expect(page.locator("[data-my-account-action='edit-name']")).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  // ---------- 13. My Account — Change Password modal ----------

  test("13. Change Password modal: 3 fields + policy + toggles ครบทุก viewport + initial focus + error association", async ({ page }) => {
    await goToMyAccount(page);
    await page.locator("[data-my-account-action='change-password']").click();
    await page.waitForTimeout(200);

    const modal = page.locator("#user-action-modal");
    await expect(modal).toHaveClass(/show/);
    await expect(page.locator(".my-account-password-modal")).toBeVisible();
    await expectWithinViewport(page, modal.locator(".user-action-modal"), "change password modal");
    await expect(page.locator("#user-action-modal-title")).toHaveText("Change Password");

    // 3 password fields + label for + required mark + toggle aria-label
    for (const id of ["my-account-pw-current", "my-account-pw-new", "my-account-pw-confirm"]) {
      const field = page.locator(`#${id}`);
      await expect(field).toBeVisible();
      expect(await field.getAttribute("type")).toBe("password");
      const label = await field.evaluate(el =>
        el.closest(".my-account-pw-field")?.querySelector("label")?.getAttribute("for") || "");
      expect(label).toBe(id);
      await expect(page.locator(`[data-my-account-pw-toggle='${id}']`))
        .toHaveAttribute("aria-label", "Show password");
    }
    expect(await page.locator("[data-my-account-pw-policy] [data-my-account-pw-rule]").count()).toBe(5);
    await expect(page.locator("[data-my-account-action='cancel-password']")).toBeVisible();
    const save = page.locator("[data-my-account-action='save-password']");
    await expect(save).toBeVisible();
    await expectWithinViewport(page, save, "save password action");
    // initial focus อยู่ที่ current password field
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("my-account-pw-current");

    // submit ว่าง → errors ผูกทุก field (role=alert + aria-invalid) + focus ไป field แรก
    await save.click();
    await page.waitForTimeout(200);
    for (const key of ["current", "new", "confirm"]) {
      const err = page.locator(`[data-my-account-pw-error='${key}']`);
      await expect(err).toHaveClass(/show/);
      await expect(err).toHaveAttribute("role", "alert");
      await expect(err).not.toBeEmpty();
    }
    await expect(page.locator("#my-account-pw-current")).toHaveAttribute("aria-invalid", "true");
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("my-account-pw-current");
    await expectNoHorizontalScroll(page);

    // ยกเลิก → modal ปิด page ยัง interactive
    await page.locator("[data-my-account-action='cancel-password']").click();
    await page.waitForTimeout(200);
    await expect(modal).not.toHaveClass(/show/);
    await expect(page.locator("[data-my-account-action='change-password']")).toBeVisible();
  });

  // ---------- 14. My Account — Active Sessions + revoke modal ----------

  test("14. Active Sessions: list + masked metadata + revoke modal ครบทุก viewport ไม่ overflow", async ({ page }) => {
    await goToMyAccount(page);
    const section = page.locator("[data-my-account-section='sessions']");
    await expect(section).toBeVisible();
    await expect(section.locator("h4")).toHaveText("Active Sessions");

    // 3 sessions — current แถวแรก + pill + ไม่มีปุ่มออกจากระบบ
    const rows = page.locator("[data-my-account-session]");
    expect(await rows.count()).toBe(3);
    await expect(rows.first()).toHaveAttribute("data-my-account-session", "SES-90001");
    await expect(rows.first().locator(".pill")).toHaveText("อุปกรณ์นี้");
    expect(await rows.first().locator("[data-my-account-action='revoke-session']").count()).toBe(0);

    // session อื่น — masked IP + revoke action อยู่ในจอ
    const other = page.locator("[data-my-account-session='SES-90002']");
    await expect(other).toContainText("IP 171.96.34.xx");
    const revoke = other.locator("[data-my-account-action='revoke-session']");
    await expect(revoke).toBeVisible();
    await expect(revoke).toBeEnabled();
    await expectWithinViewport(page, revoke, "revoke action");
    // logout-all entry ท้าย section อยู่ในจอ
    await expectWithinViewport(page, page.locator("[data-my-account-action='logout-all']"), "logout all action");
    await expectNoHorizontalScroll(page);

    // revoke modal — context + warning + footer ครบทุก viewport
    await revoke.click();
    await page.waitForTimeout(200);
    const modal = page.locator("#user-action-modal");
    await expect(modal).toHaveClass(/show/);
    await expect(page.locator(".my-account-session-modal")).toBeVisible();
    await expectWithinViewport(page, modal.locator(".user-action-modal"), "revoke session modal");
    const body = page.locator("#user-action-modal-body");
    await expect(body.locator("#user-action-modal-title")).toHaveText("Revoke Session");
    await expect(body.locator(".user-action-target")).toContainText("iPhone 15 Pro · Safari");
    await expect(body.locator(".user-action-impact-warning")).toContainText("ถูกออกจากระบบทันที");
    await expect(body.locator("[data-my-account-action='cancel-revoke-session']")).toBeVisible();
    await expect(body.locator("[data-my-account-action='confirm-revoke-session']")).toBeVisible();
    await expectNoHorizontalScroll(page);

    // ยกเลิก → ปิด + session ยัง Active
    await body.locator("[data-my-account-action='cancel-revoke-session']").click();
    await page.waitForTimeout(200);
    await expect(modal).not.toHaveClass(/show/);
    expect(await page.evaluate(() =>
      adminSessionData["ADM-010"].sessions.find(s => s.id === "SES-90002").status)).toBe("Active");
  });

  // ---------- 15. My Account — Logout All Devices modal ----------

  test("15. Logout All Devices modal: context + warning ครบทุก viewport + ยกเลิกไม่ mutate", async ({ page }) => {
    await goToMyAccount(page);
    await page.locator("[data-my-account-action='logout-all']").click();
    await page.waitForTimeout(200);

    const modal = page.locator("#user-action-modal");
    await expect(modal).toHaveClass(/show/);
    await expect(page.locator(".my-account-logout-all-modal-page")).toBeVisible();
    await expectWithinViewport(page, modal.locator(".user-action-modal"), "logout all modal");
    const body = page.locator("#user-action-modal-body");
    await expect(body.locator("#user-action-modal-title")).toHaveText("Logout All Devices");
    await expect(body.locator(".user-action-target")).toContainText("3 sessions ที่ใช้งานอยู่");
    await expect(body.locator(".user-action-impact-warning")).toContainText("รวมเครื่องนี้");
    const cancel = body.locator("[data-my-account-action='cancel-logout-all']");
    await expect(cancel).toBeVisible();
    await expect(body.locator("[data-my-account-action='confirm-logout-all']")).toBeVisible();
    await expectNoHorizontalScroll(page);

    // ยกเลิก → ปิด + sessions ยัง Active + ยังอยู่หน้า My Account
    await cancel.click();
    await page.waitForTimeout(200);
    await expect(modal).not.toHaveClass(/show/);
    expect(await page.locator("[data-my-account-session]").count()).toBe(3);
    await expect(page.locator("body")).toHaveClass(/my-account-mode/);
    await expect(page.locator("#login-screen")).not.toBeVisible();
  });

  // ---------- 16. Session Expired gate ----------

  test("16. Session Expired gate: state block + CTA ครบทุก viewport ไม่ overflow → กลับ Login", async ({ page }) => {
    await goToMyAccount(page);
    await expect(page.locator("[data-my-account-page]")).toBeVisible();
    // จำลอง session ถูก revoke จากอุปกรณ์อื่น → render ถัดไป gate expired
    await page.evaluate(() => {
      adminSessionData["ADM-010"].sessions.find(x => x.id === "SES-90001").status = "Revoked";
      renderMyAccountPage();
    });
    await page.waitForTimeout(300);

    const block = page.locator("[data-my-account-state='session-expired']");
    await expect(block).toBeVisible();
    await expect(block).toContainText("Session หมดอายุ");
    await expect(block).toContainText("เข้าสู่ระบบอีกครั้ง");
    expect(await page.locator("[data-my-account-page]").count()).toBe(0);
    const cta = block.locator("[data-my-account-action='return-login']");
    await expect(cta).toBeVisible();
    await expect(cta).toBeEnabled();
    await expectWithinViewport(page, cta, "return to login CTA");
    await expectNoHorizontalScroll(page);

    // CTA → teardown + login screen (ไม่มี expired message ค้างบน login)
    await cta.click();
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => document.body.classList.contains("logged-out"))).toBe(true);
    await expect(page.locator("#login-screen")).toBeVisible();
    await expect(page.locator("#login-form")).toBeVisible();
    await expect(page.locator("#auth-state")).toBeEmpty();
    await expect(page.locator("#auth-error")).not.toHaveClass(/show/);
  });

  // ---------- 17. Out-of-scope guard — exit recovery modes ไม่ทิ้ง state ----------

  test("17. Out-of-scope guard: exit reset/forgot mode แล้ว body/nav/login กลับสภาพเดิม ไม่มี class ค้าง", async ({ page }) => {
    await page.goto(`${PROTOTYPE_URL}#reset-token=sim-rst-invalid`);
    await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
    await expect(page.locator("#reset-screen")).toBeVisible();

    // nav modules ของ app ต้องคงเดิม — navigation นอก scope ห้ามเปลี่ยน
    const navModules = await page.locator(".nav .nav-item").evaluateAll(
      items => items.map(i => i.getAttribute("data-module")));
    expect(navModules).toContain("settings");
    expect(navModules.length).toBeGreaterThanOrEqual(9);

    // exit reset → login ปกติ ไม่มี reset-mode ค้าง
    await page.locator("[data-reset-exit]").click();
    await page.waitForTimeout(300);
    const bodyClass = await page.evaluate(() => document.body.className);
    expect(bodyClass).not.toContain("reset-mode");
    expect(bodyClass).toContain("logged-out");
    await expect(page.locator("#reset-screen")).toBeHidden();
    await expect(page.locator("#login-screen")).toBeVisible();
    expect(await page.locator(".nav .nav-item").count()).toBe(navModules.length);

    // forgot → exit → ไม่มี forgot-mode ค้าง และ login ใช้ได้ตามเดิม
    await page.locator("#forgot-password-btn").click();
    await page.waitForSelector("#forgot-form", { timeout: 5000 });
    await page.locator("[data-forgot-exit]").click();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => document.body.className)).not.toContain("forgot-mode");
    await page.locator("#login-form button[type=\"submit\"]").click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await expect(page.locator("#page-title")).toHaveText("Dashboard");
  });
});
