// Mission 1 — Objective 3: Recipient Activation & Delivery Trace (AIL-007/008/009)
// capture หน้าจอ recipient-side: Accept Invitation form, password policy, activation success,
// safe recovery states 7 แบบ, delivery log trace
// usage: node scripts/capture-m1-obj3-recipient-activation.js  (ต้อง start http server ที่ Prototypes ก่อน)
const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const BASE = "http://localhost:8080/bo-prototype.html";
const TOKEN = "sim-token-kq8f2x7m4d9e1b6a";
const OUT = path.join(__dirname, "..", "screenshots", "mission-1-objective-3");

async function freshPage(page) {
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");
}

async function loginAsAdmin(page) {
  const loginScreen = page.locator("#login-screen");
  if (await loginScreen.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator('#login-form button[type="submit"]').click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await page.waitForTimeout(500);
  }
}

async function goToSettingsSub(page, sub, module = "settings") {
  const needsToggle = await page.evaluate(() =>
    window.matchMedia("(max-width: 1180px)").matches && !document.body.classList.contains("nav-open"));
  if (needsToggle) {
    await page.locator("#menu-toggle").click();
    await page.waitForTimeout(300);
  }
  const submenu = page.locator(".submenu[data-submenu='settings']");
  if (!(await submenu.isVisible().catch(() => false))) {
    await page.locator(".nav-item[data-module='settings']").click();
    await page.waitForTimeout(300);
  }
  await page.locator(`.submenu[data-submenu='settings'] button[data-module='${module}'][data-sub='${sub}']`).click();
  await page.waitForTimeout(400);
}

async function shot(page, name, opts = {}) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), ...opts });
  console.log("saved", name);
}

// reset ADM-008 + role ROL-002 กลับ seed-เหมือน แล้ว apply scenario (เรียกหลัง reload เสมอ)
async function setupScenario(page, scenario, mutate) {
  await page.evaluate(({ scenario, mutate, token }) => {
    const acc = adminAccountData.accounts.find(a => a.id === "ADM-008");
    const role = roleListData.roles.find(r => r.id === "ROL-002");
    if (acc) acc.status = "Invited";
    if (role) role.status = "Active";
    if (scenario === "account") {
      applyAdminInvitationScenario("ADM-008", "pending");
      acc.status = "Suspended";
    } else if (scenario === "role") {
      applyAdminInvitationScenario("ADM-008", "pending");
      role.status = "Inactive";
    } else if (scenario) {
      applyAdminInvitationScenario("ADM-008", scenario);
    }
    if (mutate === "transient") {
      applyAdminInvitationScenario("ADM-008", "pending");
      enterInviteMode(token);
      adminAccountData.accounts.find(a => a.id === "ADM-008").revision = 99;
      document.querySelector("#invite-password").value = "Tukdaeng#2026xy";
      document.querySelector("#invite-password-confirm").value = "Tukdaeng#2026xy";
      document.querySelector("#invite-submit").click();
      return;
    }
    enterInviteMode(scenario === null ? "totally-invalid-token" : token);
  }, { scenario, mutate, token: TOKEN });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // ============ AIL-008: Accept Invitation + Initial Password ============
  await freshPage(page);
  await page.evaluate(token => enterInviteMode(token), TOKEN);
  await page.waitForTimeout(300);
  await shot(page, "01-accept-invitation-form");

  // checklist live update — password ผ่านบาง rule
  await page.locator("#invite-password").fill("tukdaeng");
  await page.waitForTimeout(200);
  await shot(page, "02-password-checklist-partial");

  // submit ตอนยังไม่ผ่าน policy → field-level error
  await page.locator("#invite-submit").click();
  await page.waitForTimeout(300);
  await shot(page, "03-password-validation-error");

  // password ครบ policy + confirm ตรง → checklist pass ทั้งหมด
  await page.locator("#invite-password").fill("Tukdaeng#2026xy");
  await page.locator("#invite-password-confirm").fill("Tukdaeng#2026xy");
  await page.waitForTimeout(300);
  await shot(page, "04-password-valid-checklist");

  await page.locator("#invite-submit").click();
  await page.waitForTimeout(400);
  await shot(page, "05-account-activated");

  await page.locator("[data-invite-exit]").click();
  await page.waitForTimeout(400);
  await shot(page, "06-back-to-login");

  // ---- trace หลัง activation: admin detail (Active), audit, delivery ----
  await loginAsAdmin(page);
  await goToSettingsSub(page, "Admin Accounts");
  await page.locator('.admin-account-row[data-admin-account-card="ADM-008"] .user-cell-primary[data-label="Admin ID"]').click();
  await page.waitForTimeout(400);
  await shot(page, "07-admin-detail-activated", { fullPage: true });

  await goToSettingsSub(page, "Audit Log", "audit");
  await page.locator("#audit-search").fill("ADM-008");
  await page.waitForTimeout(400);
  await shot(page, "08-audit-log-activation", { fullPage: true });

  // ============ AIL-007: Delivery trace ============
  await goToSettingsSub(page, "Delivery Logs");
  await page.locator("#delivery-search").fill("INV");
  await page.waitForTimeout(400);
  await shot(page, "09-delivery-logs-invitation", { fullPage: true });

  const deliveryRow = page.locator(".delivery-log-table .user-row.delivery-row", { hasText: "DLV-ACCT-008-INV-001" }).first();
  if (await deliveryRow.isVisible().catch(() => false)) {
    await deliveryRow.click();
    await page.waitForTimeout(400);
    await shot(page, "10-delivery-detail-modal");
    await page.locator("#user-action-modal [data-user-action-modal-close]").first().click().catch(() => {});
    await page.waitForTimeout(200);
  }

  // ============ AIL-009: Safe recovery states (reload ทุก state ให้ state สะอาด) ============
  const states = [
    ["11-recovery-invalid", null],
    ["12-recovery-expired", "expired"],
    ["13-recovery-used", "used"],
    ["14-recovery-cancelled", "cancelled"],
    ["15-recovery-superseded", "superseded"],
    ["16-recovery-account-ineligible", "account"],
    ["17-recovery-role-ineligible", "role"],
  ];
  for (const [name, scenario] of states) {
    await freshPage(page);
    await setupScenario(page, scenario);
    await page.waitForTimeout(300);
    await shot(page, name);
    console.log("captured", name);
  }

  // transient — stale revision ตอน commit (TRY AGAIN + BACK TO LOGIN)
  await freshPage(page);
  await setupScenario(page, "pending", "transient");
  await page.waitForTimeout(300);
  await shot(page, "18-recovery-transient");

  // ============ Mobile 390 ============
  await page.setViewportSize({ width: 390, height: 844 });
  await freshPage(page);
  await page.evaluate(token => enterInviteMode(token), TOKEN);
  await page.waitForTimeout(300);
  await shot(page, "19-mobile-accept-form", { fullPage: true });

  await freshPage(page);
  await setupScenario(page, "expired");
  await page.waitForTimeout(300);
  await shot(page, "20-mobile-recovery-expired");

  await browser.close();
  console.log("done →", OUT);
})();
