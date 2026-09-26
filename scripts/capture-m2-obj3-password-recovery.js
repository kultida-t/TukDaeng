// Mission 2 — Objective 3: Password Recovery & Lock (AIL-024/025/026)
// capture หน้าจอ: Login lockout display, Forgot Password (ready/validation/accepted/system-error),
// Reset Password token states (valid/invalid/expired/used/superseded/ineligible) + success
// usage: node scripts/capture-m2-obj3-password-recovery.js  (ต้อง start http server ที่ Prototypes ก่อน)
const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const BASE = "http://localhost:8080/bo-prototype.html";
const OUT = path.join(__dirname, "..", "screenshots", "mission-2-objective-3");

const ACTIVE_EMAIL = "current.admin@tukdaeng.example";        // ADM-010 Active
const LOCKED_FAILED_LOGIN_EMAIL = "wichai@tukdaeng.example";  // ADM-007 Locked (failed_login)
const NEW_PASSWORD = "NewPassw0rd!Secure";

async function gotoLogin(page) {
  await page.goto(BASE);
  await page.waitForSelector("#login-form", { timeout: 10000 });
}

// submit login form ด้วย email + auth scenario (set select ผ่าน evaluate เหมือน qa-bo-022)
async function submitLogin(page, email, scenario = "success") {
  await page.locator("#login-email").fill(email);
  await page.locator("#auth-scenario").evaluate((el, v) => {
    el.value = v;
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, scenario);
  await page.locator("#login-form .btn.primary").click();
  await page.waitForTimeout(300);
}

async function goToForgot(page) {
  await page.locator("#forgot-password-btn").click();
  await page.waitForSelector("#forgot-form", { timeout: 5000 });
}

// seed reset request ตรงใน page (same-document) แล้วเข้า reset route ผ่าน hash — เหมือนคลิกลิงก์จริง
async function openReset(page, adminId, overrides = {}) {
  await gotoLogin(page);
  const token = await page.evaluate(([id, ov]) => {
    const acc = adminAccountData.accounts.find(a => a.id === id);
    const request = seedPasswordResetLinkFixture(acc, ov);
    return getPasswordResetLinkToken(request);
  }, [adminId, overrides]);
  await page.evaluate(t => { window.location.hash = `reset-token=${t}`; }, token);
  await page.waitForTimeout(400);
}

async function shot(page, name, opts = {}) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), ...opts });
  console.log("saved", name);
}

// auth screens บน mobile: body ล็อก height=100vh + html overflow hidden —
// content ยาวกว่า viewport จะ paint ไม่ครบ (แถบขาว/ปุ่มตัด) → ขยาย viewport ให้พอดี scrollHeight จริงก่อน capture
async function shotAuthMobile(page, name) {
  const contentH = await page.evaluate(() => document.body.scrollHeight);
  if (contentH > 844) {
    await page.setViewportSize({ width: 390, height: contentH });
    await page.waitForTimeout(150);
  }
  await shot(page, name);
  await page.setViewportSize({ width: 390, height: 844 });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // ============ A. Login: baseline + failed attempts + lockout (AIL-026) ============
  await gotoLogin(page);
  await shot(page, "01-login-baseline");

  await submitLogin(page, ACTIVE_EMAIL, "bad-password");
  await shot(page, "02-login-invalid-credentials");

  await gotoLogin(page);
  await submitLogin(page, LOCKED_FAILED_LOGIN_EMAIL);
  await shot(page, "03-login-lockout-failed-login");

  // ============ B. Forgot Password (AIL-024) ============
  await goToForgot(page);
  await shot(page, "04-forgot-ready");

  await page.locator("#forgot-submit").click();
  await page.waitForTimeout(200);
  await shot(page, "05-forgot-validation");

  await page.locator("#forgot-email").fill(ACTIVE_EMAIL);
  await page.locator("#forgot-submit").click();
  await page.waitForSelector("[data-forgot-accepted]", { timeout: 5000 });
  await shot(page, "06-forgot-accepted-generic");

  // system-error state — reload เพื่อ scenario/form สะอาด
  await gotoLogin(page);
  await goToForgot(page);
  await page.locator(".forgot-tools summary").click();
  await page.waitForTimeout(150);
  await page.locator("#forgot-scenario").selectOption("system-error");
  await page.locator("#forgot-email").fill(ACTIVE_EMAIL);
  await page.locator("#forgot-submit").click();
  await page.waitForSelector("[data-forgot-retry]", { timeout: 5000 });
  await shot(page, "07-forgot-system-error");

  // ============ C. Reset Password token states (AIL-025) ============
  // valid token — Active account
  await openReset(page, "ADM-010");
  await page.waitForSelector("#reset-form", { timeout: 5000 });
  await shot(page, "08-reset-form-valid", { fullPage: true });

  await page.locator("#reset-password").fill("abc");
  await page.locator("#reset-password-confirm").fill("abc");
  await page.locator("#reset-submit").click();
  await page.waitForTimeout(200);
  await shot(page, "09-reset-policy-error");

  await page.locator("#reset-password").fill(NEW_PASSWORD);
  await page.locator("#reset-password-confirm").fill("Different!2345678");
  await page.locator("#reset-submit").click();
  await page.waitForTimeout(200);
  await shot(page, "10-reset-confirm-mismatch");

  await page.locator("#reset-password-confirm").fill(NEW_PASSWORD);
  await page.locator("#reset-submit").click();
  await page.waitForSelector("[data-reset-success]", { timeout: 5000 });
  await shot(page, "11-reset-success");

  await page.locator("[data-reset-exit]").click();
  await page.waitForTimeout(300);
  await shot(page, "12-reset-back-to-login");

  // valid token — Locked (failed_login) account eligible
  await openReset(page, "ADM-007");
  await page.waitForSelector("#reset-form", { timeout: 5000 });
  await shot(page, "13-reset-form-locked-account", { fullPage: true });

  // terminal/safe states
  await gotoLogin(page);
  await page.evaluate(() => { window.location.hash = "reset-token=sim-rst-invalid"; });
  await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
  await shot(page, "14-reset-invalid-token");

  await openReset(page, "ADM-010", { expiresAt: new Date(Date.now() - 60e3).toISOString() });
  await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
  await shot(page, "15-reset-expired");

  await openReset(page, "ADM-010", {
    status: "Used",
    usedAt: new Date(Date.now() - 5 * 60e3).toISOString()
  });
  await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
  await shot(page, "16-reset-used");

  await openReset(page, "ADM-010", {
    status: "Superseded",
    supersededAt: new Date(Date.now() - 2 * 60e3).toISOString()
  });
  await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
  await shot(page, "17-reset-superseded");

  await openReset(page, "ADM-006"); // Suspended → generic terminal (กัน enumeration)
  await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
  await shot(page, "18-reset-account-blocked-generic");

  // ============ D. Mobile 390 ============
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoLogin(page);
  await submitLogin(page, LOCKED_FAILED_LOGIN_EMAIL);
  await shotAuthMobile(page, "m01-mobile-login-lockout");

  await goToForgot(page);
  await shotAuthMobile(page, "m02-mobile-forgot-ready");
  await page.locator("#forgot-email").fill(ACTIVE_EMAIL);
  await page.locator("#forgot-submit").click();
  await page.waitForSelector("[data-forgot-accepted]", { timeout: 5000 });
  await shotAuthMobile(page, "m03-mobile-forgot-accepted");

  await openReset(page, "ADM-010");
  await page.waitForSelector("#reset-form", { timeout: 5000 });
  await shotAuthMobile(page, "m04-mobile-reset-form");

  await page.locator("#reset-password").fill(NEW_PASSWORD);
  await page.locator("#reset-password-confirm").fill(NEW_PASSWORD);
  await page.locator("#reset-submit").click();
  await page.waitForSelector("[data-reset-success]", { timeout: 5000 });
  await shotAuthMobile(page, "m05-mobile-reset-success");

  await openReset(page, "ADM-010", { expiresAt: new Date(Date.now() - 60e3).toISOString() });
  await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
  await shotAuthMobile(page, "m06-mobile-reset-expired");

  await browser.close();
  console.log("done →", OUT);
})();
