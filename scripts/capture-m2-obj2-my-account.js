// Mission 2 — Objective 2: My Account & Self-Service (AIL-020/021/022/023a/023b)
// capture หน้าจอ: sidebar .admin-box entry, My Account page, Edit Name,
// Change Password (policy/cooldown), Active Sessions + revoke, Logout All, Session Expired
// usage: node scripts/capture-m2-obj2-my-account.js  (ต้อง start http server ที่ Prototypes ก่อน)
const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const BASE = "http://localhost:8080/bo-prototype.html";
const OUT = path.join(__dirname, "..", "screenshots", "mission-2-objective-2");

const SELF_NAME = "ผู้ดูแลระบบ";
const MOCK_PASSWORD = "tukdaeng-admin";
const NEW_PASSWORD = "TukDaeng!2026xyz";

async function login(page) {
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");
  const loginScreen = page.locator("#login-screen");
  if (await loginScreen.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator('#login-form button[type="submit"]').click();
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

async function closeNavIfOpen(page) {
  const isOpen = await page.evaluate(() => document.body.classList.contains("nav-open"));
  if (isOpen) {
    await page.locator("#menu-toggle").click();
    await page.waitForTimeout(300);
  }
}

async function goToMyAccount(page) {
  await login(page);
  await ensureNavOpen(page);
  await page.locator("#my-account-entry").click();
  await page.waitForTimeout(300);
  await closeNavIfOpen(page);
}

async function shot(page, name, opts = {}) {
  // modal/recovery screens focus() ปุ่มอัตโนมัติ → blur ก่อนแคปเพื่อให้เห็นปุ่มสถานะปกติ ไม่ติด focus ring
  await page.evaluate(() => document.activeElement?.blur());
  await page.screenshot({ path: path.join(OUT, `${name}.png`), ...opts });
  console.log("saved", name);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // ============ Session A: sessions + logout all (desktop 1440) ============
  await login(page);
  await shot(page, "01-dashboard-sidebar-entry", { fullPage: true });

  await goToMyAccount(page);
  await shot(page, "02-my-account-page", { fullPage: true });

  const sessionsSection = page.locator("[data-my-account-section='sessions']");
  await sessionsSection.scrollIntoViewIfNeeded();
  await sessionsSection.screenshot({ path: path.join(OUT, "03-active-sessions-list.png") });
  console.log("saved 03-active-sessions-list");

  // per-session revoke (AIL-022)
  await page.locator("[data-my-account-session='SES-90002'] [data-my-account-action='revoke-session']").click();
  await page.waitForTimeout(200);
  await shot(page, "04-revoke-session-modal");

  await page.locator("[data-my-account-action='confirm-revoke-session']").click();
  await page.waitForTimeout(400);
  await shot(page, "05-revoke-session-done", { fullPage: true });

  // Logout All Devices (AIL-023a) — reload เพื่อให้ session list กลับครบ 3
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");
  await goToMyAccount(page);
  await page.locator("[data-my-account-action='logout-all']").click();
  await page.waitForTimeout(200);
  await shot(page, "06-logout-all-modal");

  await page.locator("[data-my-account-action='confirm-logout-all']").click();
  await page.waitForTimeout(500);
  await shot(page, "07-logout-all-back-to-login", { fullPage: true });

  // ============ Session B: edit name + change password (desktop 1440) ============
  await goToMyAccount(page);

  // Edit Name (AIL-020)
  await page.locator("[data-my-account-action='edit-name']").click();
  await page.waitForTimeout(200);
  await shot(page, "08-edit-name-modal");

  await page.locator("#my-account-name").fill("");
  await page.locator("[data-my-account-action='save-name']").click();
  await page.waitForTimeout(200);
  await shot(page, "09-edit-name-validation");

  await page.locator("#my-account-name").fill("ผู้ดูแลระบบ ทดสอบ");
  await page.locator("[data-my-account-action='save-name']").click();
  await page.waitForTimeout(400);
  await shot(page, "10-edit-name-saved", { fullPage: true });

  // Change Password (AIL-021) — success ก่อน (fail counter ยังสะอาด)
  await page.locator("[data-my-account-action='change-password']").click();
  await page.waitForTimeout(200);
  await shot(page, "11-change-password-modal");

  await page.locator("#my-account-pw-current").fill(MOCK_PASSWORD);
  await page.locator("#my-account-pw-new").fill("short");
  await page.locator("#my-account-pw-confirm").fill("short");
  await page.locator("[data-my-account-action='save-password']").click();
  await page.waitForTimeout(200);
  await shot(page, "12-change-password-policy-error");

  await page.locator("#my-account-pw-new").fill(NEW_PASSWORD);
  await page.locator("#my-account-pw-confirm").fill(NEW_PASSWORD);
  await page.locator("[data-my-account-action='save-password']").click();
  await page.waitForTimeout(400);
  await shot(page, "13-change-password-success", { fullPage: true });

  // Wrong current + rate-limit cooldown — fresh reload เพื่อ modal/form สะอาด
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");
  await goToMyAccount(page);
  await page.locator("[data-my-account-action='change-password']").click();
  await page.waitForTimeout(200);
  for (let i = 0; i < 5; i += 1) {
    await page.locator("#my-account-pw-current").fill("wrong-password");
    await page.locator("#my-account-pw-new").fill(NEW_PASSWORD);
    await page.locator("#my-account-pw-confirm").fill(NEW_PASSWORD);
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(250);
    if (i === 0) await shot(page, "14-change-password-wrong-current");
  }
  await shot(page, "15-change-password-cooldown");
  await page.locator("[data-my-account-action='cancel-password']").click();
  await page.waitForTimeout(200);

  // Session Expired gate (AIL-023b) — จำลอง idle เกิน 8h
  await page.evaluate(() => {
    const registry = adminSessionData["ADM-010"];
    const s = registry.sessions.find(x => x.id === registry.currentSessionId);
    s.lastActiveTs = Date.now() - 9 * 3600e3;
    renderMyAccountPage();
  });
  await page.waitForTimeout(300);
  await shot(page, "16-session-expired-gate", { fullPage: true });

  await page.locator("[data-my-account-action='return-login']").click();
  await page.waitForTimeout(400);
  await shot(page, "17-session-expired-login", { fullPage: true });

  // ============ Session C: mobile 390 ============
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");
  await login(page);
  await ensureNavOpen(page);
  await shot(page, "m01-mobile-nav-entry");

  await page.locator("#my-account-entry").click();
  await page.waitForTimeout(300);
  await closeNavIfOpen(page);
  await shot(page, "m02-mobile-my-account", { fullPage: true });

  await page.locator("[data-my-account-action='edit-name']").click();
  await page.waitForTimeout(200);
  await shot(page, "m03-mobile-edit-name-modal");
  await page.locator("[data-my-account-action='cancel-name']").click();
  await page.waitForTimeout(200);

  await page.locator("[data-my-account-action='change-password']").click();
  await page.waitForTimeout(200);
  await shot(page, "m04-mobile-change-password-modal");
  await page.locator("[data-my-account-action='cancel-password']").click();
  await page.waitForTimeout(200);

  const sessionsMobile = page.locator("[data-my-account-section='sessions']");
  await sessionsMobile.scrollIntoViewIfNeeded();
  await shot(page, "m05-mobile-sessions");

  await page.locator("[data-my-account-session='SES-90002'] [data-my-account-action='revoke-session']").click();
  await page.waitForTimeout(200);
  await shot(page, "m06-mobile-revoke-modal");
  await page.locator("[data-my-account-action='cancel-revoke-session']").click();
  await page.waitForTimeout(200);

  await page.locator("[data-my-account-action='logout-all']").click();
  await page.waitForTimeout(200);
  await shot(page, "m07-mobile-logout-all-modal");
  await page.locator("[data-my-account-action='cancel-logout-all']").click();
  await page.waitForTimeout(200);

  await page.evaluate(() => {
    const registry = adminSessionData["ADM-010"];
    const s = registry.sessions.find(x => x.id === registry.currentSessionId);
    s.lastActiveTs = Date.now() - 9 * 3600e3;
    renderMyAccountPage();
  });
  await page.waitForTimeout(300);
  await shot(page, "m08-mobile-session-expired", { fullPage: true });

  await browser.close();
  console.log("done →", OUT);
})();
