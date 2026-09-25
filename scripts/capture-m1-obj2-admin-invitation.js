// Mission 1 — Objective 2: Admin-side Invitation Lifecycle (AIL-003/004/005/006)
// capture หน้าจอผลงาน admin-side: Invite creation, Invitation context, Resend/Cancel/Reissue,
// scenario states, Delivery/Audit trace
// usage: node scripts/capture-m1-obj2-admin-invitation.js  (ต้อง start http server ที่ Prototypes ก่อน)
const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const BASE = "http://localhost:8080/bo-prototype.html";
const OUT = path.join(__dirname, "..", "screenshots", "mission-1-objective-2");

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

async function goToSettingsSub(page, sub, module = "settings") {
  await ensureNavOpen(page);
  const submenu = page.locator(".submenu[data-submenu='settings']");
  if (!(await submenu.isVisible().catch(() => false))) {
    await page.locator(".nav-item[data-module='settings']").click();
    await page.waitForTimeout(300);
  }
  await ensureNavOpen(page);
  await page.locator(`.submenu[data-submenu='settings'] button[data-module='${module}'][data-sub='${sub}']`).click();
  await page.waitForTimeout(400);
}

async function goToAdminAccounts(page) {
  await goToSettingsSub(page, "Admin Accounts");
}

async function openDetail(page, id) {
  await goToAdminAccounts(page);
  await page.locator(`.admin-account-row[data-admin-account-card="${id}"] .user-cell-primary[data-label="Admin ID"]`).click();
  await page.waitForTimeout(400);
}

function invitationSection(page) {
  return page.locator("[data-admin-invitation-section]");
}

async function shot(page, name, opts = {}) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), ...opts });
  console.log("saved", name);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // ============ Session A: lifecycle flow ต่อเนื่อง (desktop 1440) ============
  await login(page);
  await goToAdminAccounts(page);
  await shot(page, "01-admin-account-list", { fullPage: true });

  // --- AIL-003: Invite creation ---
  await page.locator("[data-admin-account-invite-open]").click();
  await page.waitForTimeout(300);
  await shot(page, "02-invite-modal-empty");

  await page.locator("[data-admin-account-invite-confirm]").click();
  await page.waitForTimeout(300);
  await shot(page, "03-invite-modal-validation");

  await page.locator("#admin-account-invite-name").fill("สมชาย ใจดี");
  await page.locator("#admin-account-invite-email").fill("somchai.jaidee@tukdaeng.example");
  await page.locator("#admin-account-invite-form label:has(#admin-account-invite-role) [data-custom-select-trigger]").click();
  await page.waitForTimeout(150);
  await shot(page, "04-invite-role-dropdown");
  await page.locator("#admin-account-invite-form label:has(#admin-account-invite-role) [data-custom-select-option][data-value='Support Agent']").click();
  await page.waitForTimeout(150);
  await page.locator("#admin-account-invite-note").fill("เชิญเข้าทีม Support ประจำกะเช้า");
  await page.waitForTimeout(150);
  await shot(page, "05-invite-modal-filled");

  await page.locator("[data-admin-account-invite-confirm]").click();
  await page.waitForTimeout(500);
  await shot(page, "06-invite-sent-toast");

  // --- AIL-004: Invitation context ใน Admin Detail ---
  await openDetail(page, "ADM-008");
  await shot(page, "07-admin-detail-invitation-context", { fullPage: true });
  await invitationSection(page).screenshot({ path: path.join(OUT, "08-invitation-section-pending.png") });
  console.log("saved 08-invitation-section-pending");

  // --- AIL-005: Resend ---
  await invitationSection(page).locator('[data-admin-invitation-action="resend"]').click();
  await page.waitForTimeout(300);
  await shot(page, "09-resend-confirm-modal");

  await page.locator("[data-admin-invitation-resend-confirm]").click();
  await page.waitForTimeout(500);
  await invitationSection(page).scrollIntoViewIfNeeded();
  await shot(page, "10-resend-done-cooldown", { fullPage: true });

  // --- AIL-006: Cancel + Reissue ---
  await invitationSection(page).locator('[data-admin-invitation-action="cancel"]').click();
  await page.waitForTimeout(300);
  await shot(page, "11-cancel-confirm-modal");

  await page.locator("[data-admin-invitation-cancel-confirm]").click();
  await page.waitForTimeout(500);
  await invitationSection(page).scrollIntoViewIfNeeded();
  await shot(page, "12-cancelled-state", { fullPage: true });

  await invitationSection(page).locator('[data-admin-invitation-action="reissue"]').click();
  await page.waitForTimeout(300);
  await shot(page, "13-reissue-confirm-modal");

  await page.locator("[data-admin-invitation-reissue-confirm]").click();
  await page.waitForTimeout(500);
  await invitationSection(page).scrollIntoViewIfNeeded();
  await shot(page, "14-reissued-state", { fullPage: true });

  // History & Actions — Reference / Delivery / Audit columns ครบ
  const history = page.locator(".admin-account-action-section");
  await history.scrollIntoViewIfNeeded();
  await history.screenshot({ path: path.join(OUT, "15-history-and-actions.png") });
  console.log("saved 15-history-and-actions");

  // --- Delivery / Audit trace ---
  await goToSettingsSub(page, "Delivery Logs");
  await page.locator("#delivery-search").fill("INV");
  await page.waitForTimeout(400);
  await shot(page, "16-delivery-logs-invitation", { fullPage: true });

  const deliveryRow = page.locator(".delivery-log-table .user-row.delivery-row").first();
  if (await deliveryRow.isVisible().catch(() => false)) {
    await deliveryRow.click();
    await page.waitForTimeout(400);
    await shot(page, "17-delivery-detail-modal");
    await page.locator("#user-action-modal [data-user-action-modal-close]").first().click().catch(() => {});
    await page.waitForTimeout(200);
  }

  await goToSettingsSub(page, "Audit Log", "audit");
  await page.locator("#audit-search").fill("ADM-008");
  await page.waitForTimeout(400);
  await shot(page, "18-audit-log-invitation", { fullPage: true });

  // ============ Session B: reload → scenario states สะอาด ============
  await login(page);
  await openDetail(page, "ADM-008");
  const scenarios = ["cooldown", "quota", "failed", "retry", "expired", "cancelled", "superseded", "used"];
  const scenarioNames = {
    cooldown: "19-scenario-cooldown",
    quota: "20-scenario-quota-full",
    failed: "21-scenario-failed",
    retry: "22-scenario-retry",
    expired: "23-scenario-expired",
    cancelled: "24-scenario-cancelled",
    superseded: "25-scenario-superseded",
    used: "26-scenario-used"
  };
  for (const s of scenarios) {
    await page.evaluate(({ accountId, scenario }) => {
      applyAdminInvitationScenario(accountId, scenario);
      renderAdminAccountDetail(accountId);
    }, { accountId: "ADM-008", scenario: s });
    await page.waitForTimeout(300);
    await invitationSection(page).screenshot({ path: path.join(OUT, `${scenarioNames[s]}.png`) });
    console.log("saved", scenarioNames[s]);
  }

  // ============ Session C: mobile 390 ============
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await goToAdminAccounts(page);
  await shot(page, "27-mobile-list", { fullPage: true });

  await page.locator("[data-admin-account-invite-open]").click();
  await page.waitForTimeout(300);
  await shot(page, "28-mobile-invite-modal");
  await page.locator("#user-action-modal .admin-account-invite-form [data-user-action-modal-close]").click().catch(() => {});
  await page.waitForTimeout(200);

  await openDetail(page, "ADM-008");
  await shot(page, "29-mobile-detail-invitation", { fullPage: true });
  await invitationSection(page).screenshot({ path: path.join(OUT, "30-mobile-invitation-section.png") });
  console.log("saved 30-mobile-invitation-section");

  await browser.close();
  console.log("done →", OUT);
})();
