// Change Mission — BO Login Baseline Simplification — Objective 2 (CW-2 / AIL-015)
// capture หน้าจอ Login baseline ใหม่: Email + Password → BO โดยตรง (ไม่มี OTP step)
// usage: node scripts/capture-mlbs-obj2-login-baseline.js  (ต้อง start http server ที่ Prototypes ก่อน)
const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const BASE = "http://localhost:8080/bo-prototype.html";
const OUT = path.join(__dirname, "..", "screenshots", "mission-login-baseline-objective-2");

async function freshPage(page) {
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");
}

async function shot(page, name, opts = {}) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), ...opts });
  console.log("saved", name);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1) Login screen — Email + Password form เท่านั้น (ไม่มี OTP field)
  await freshPage(page);
  await shot(page, "01-login-email-password-form");

  // 2) Prototype scenario — เหลือ Email+Password success / Invalid credentials (ไม่มี OTP scenario)
  await page.locator(".prototype-tools summary").click();
  await page.waitForTimeout(200);
  await shot(page, "02-login-scenario-selector");

  // 3) Valid credentials → เข้า BO ได้ทันที (dashboard) โดยไม่ผ่าน OTP step
  await page.locator('#login-form button[type="submit"]').click();
  await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
  await page.waitForTimeout(600);
  await shot(page, "03-login-success-direct-to-dashboard", { fullPage: true });

  // 4) Invalid credentials → error + คงหน้า login (ยังไม่มี OTP form)
  await freshPage(page);
  await page.evaluate(() => {
    const sel = document.querySelector("#auth-scenario");
    sel.value = "bad-password";
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.locator('#login-form button[type="submit"]').click();
  await page.waitForTimeout(400);
  await shot(page, "04-login-invalid-credentials");

  // 5) Invite success copy — บอกเข้าสู่ระบบด้วยอีเมล+รหัสผ่าน (ไม่อ้าง Login OTP)
  await freshPage(page);
  await page.evaluate(() => {
    const sel = document.querySelector("#invite-scenario");
    sel.value = "valid";
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.waitForTimeout(400);
  await shot(page, "05-invite-accept-form");
  await page.locator("#invite-password").fill("Tukdaeng#2026xy");
  await page.locator("#invite-password-confirm").fill("Tukdaeng#2026xy");
  await page.locator("#invite-submit").click();
  await page.waitForTimeout(400);
  await shot(page, "06-invite-activated-email-password-copy");

  // 6) Mobile 390 — Login form responsive ไม่มี OTP field
  await page.setViewportSize({ width: 390, height: 844 });
  await freshPage(page);
  await shot(page, "07-mobile-login-form", { fullPage: true });

  await browser.close();
  console.log("done →", OUT);
})();
