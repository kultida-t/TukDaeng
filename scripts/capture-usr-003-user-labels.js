// USR-003 — User Management label normalization evidence capture
// ครอบคลุม surface ของจุดแก้ตาม bo-canonical-label-table.md §8 + USR-002 plan §G.1
//   D-U01 Reset password → ส่งลิงก์ตั้งรหัสผ่านใหม่ (row menu + detail btn + feedback)
//   D-U02 No available action chip → ไม่มี action บัญชีที่ทำได้ (unreachable in UI — verify ผ่าน scan)
//   D-U03 panel-subtitle side panel · contact data visible → ข้อมูลติดต่อแสดงครบ
//   D-U04 panel-subtitle report detail · reporter identity masked → ปิดบังตัวตนผู้รายงาน
//   D-U05 warning-note Deletion dependency: → เงื่อนไขการลบบัญชี:
//   D-U06 history rows TH (Account registered / Report User / Admin action recorded)
//   D-U07 delivery note suffixes TH · D-U08 email provider note TH
//   D-U09 report-case title attr (invisible) · D-U10 alt attr (invisible) · D-U11 fallbacks
//   S-U01a..e modal titles → EN · S-U02 Confirm Close Report · historyLabel ไทยแยก
//   O-U01 status pill → EN (userStatusPill + Account Status tile)
//   O-U02 row-menu aria เมนูรายงาน → Report actions (invisible)
// usage: node scripts/capture-usr-003-user-labels.js before|after [url]
//   (ต้อง start server ที่ Prototypes ก่อน: node Prototypes/server.mjs)
// Evidence viewport standard (AGENTS.md): Desktop 1920x1080, Tablet 768x1024, Mobile 440x956
const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const PHASE = process.argv[2] === "after" ? "after" : "before";
const BASE = process.argv[3] || "http://localhost:4173/bo-prototype.html";
const OUT = path.join(__dirname, "..", "screenshots", "mission-3-objective-2", PHASE);

async function login(page) {
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");
  const loginScreen = page.locator("#login-screen");
  if (await loginScreen.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator('#login-form button[type="submit"]').click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await page.waitForTimeout(400);
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

async function goUserSub(page, sub) {
  await login(page);
  await ensureNavOpen(page);
  const usersNav = page.locator('button.nav-item[data-module="users"]');
  if ((await usersNav.getAttribute("aria-expanded")) !== "true") {
    await usersNav.click();
    await page.waitForTimeout(250);
  }
  await page.locator(`button[data-module="users"][data-sub="${sub}"]`).click();
  await page.waitForTimeout(400);
  await closeNavIfOpen(page);
}

async function shot(page, name, opts = {}) {
  await page.evaluate(() => document.activeElement?.blur());
  await page.screenshot({ path: path.join(OUT, `${name}.png`), ...opts });
  console.log("saved", name);
}

async function closeModal(page) {
  const closeBtn = page.locator("[data-user-action-modal-close]").first();
  if (await closeBtn.isVisible({ timeout: 500 }).catch(() => false)) {
    await closeBtn.click();
    await page.waitForTimeout(300);
  }
}

async function openUserDetailFromList(page, userId) {
  await page.locator("#user-search").fill(userId);
  await page.waitForTimeout(400);
  await page.locator(`[data-user-card="${userId}"]`).first().click();
  await page.waitForTimeout(400);
}

async function backToUserList(page) {
  await page.locator("[data-back-user-list]").click();
  await page.waitForTimeout(400);
}

async function captureUserSurfaces(page, prefix) {
  // ============ User Accounts list ============
  await goUserSub(page, "User Accounts");
  await shot(page, `${prefix}01-user-list`, { fullPage: true });

  // Row menu บน U-1017 (Reset password / Suspend / Ban)
  await page.locator("#user-search").fill("U-1017");
  await page.waitForTimeout(400);
  await page.locator('[data-user-card="U-1017"] .row-menu summary').click();
  await page.waitForTimeout(300);
  await shot(page, `${prefix}02-user-list-rowmenu`, { fullPage: true });

  // User Detail full page — pills + Account Status History + action buttons
  await page.locator('[data-user-card="U-1017"] .row-menu [data-user-open="U-1017"]').click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}03-user-detail-page`, { fullPage: true });

  // Modal: Reset password (title EN เดิม / button label เปลี่ยน + email note)
  await page.locator('[data-user-action="Reset password"][data-user-id="U-1017"]').first().click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}04-modal-reset-password`);
  await closeModal(page);

  // Modal: Suspend (title ไทย → EN)
  await page.locator('[data-user-action="Suspend"][data-user-id="U-1017"]').first().click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}05-modal-suspend`);
  await closeModal(page);

  // Modal: Ban (title ไทย → EN)
  await page.locator('[data-user-action="Ban"][data-user-id="U-1017"]').first().click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}06-modal-ban`);
  await closeModal(page);

  // U-1002 (Suspended) — Restore/Unsuspend modal
  await backToUserList(page);
  await openUserDetailFromList(page, "U-1002");
  await page.locator('[data-user-action="Restore"][data-user-id="U-1002"]').first().click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}07-modal-unsuspend`);
  await closeModal(page);

  // U-1120 (Banned) — Unban modal
  await backToUserList(page);
  await openUserDetailFromList(page, "U-1120");
  await page.locator('[data-user-action="Unban user"][data-user-id="U-1120"]').first().click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}08-modal-unban`);
  await closeModal(page);

  // U-1055 (Pending Verification) — Resend verification modal
  await backToUserList(page);
  await openUserDetailFromList(page, "U-1055");
  await page.locator('[data-user-action="Resend verification context"][data-user-id="U-1055"]').first().click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}09-modal-resend-verification`);
  await closeModal(page);

  // Side panel subtitle "contact data visible" — reachable เฉพาะหลัง confirm action
  // จาก list mode (refreshUserActionSurface → renderUserDetail)
  await backToUserList(page);
  await page.locator("#user-search").fill("U-1017");
  await page.waitForTimeout(400);
  await page.locator('[data-user-card="U-1017"] .row-menu summary').click();
  await page.waitForTimeout(300);
  await page.locator('[data-user-card="U-1017"] .row-menu [data-user-action="Reset password"]').click();
  await page.waitForTimeout(400);
  await page.locator('[data-user-action-confirm="Reset password"]').click();
  await page.waitForTimeout(500);
  await shot(page, `${prefix}10-sidepanel-after-reset`, { fullPage: true });

  // ============ Reported Users ============
  await goUserSub(page, "Reported Users");
  await shot(page, `${prefix}11-reported-users`, { fullPage: true });

  // Report Detail — RPU-505 (subtitle masked + Account Status tile + histories)
  await page.locator('[data-report-id="RPU-505"] .row-menu summary').click();
  await page.waitForTimeout(300);
  await page.locator('[data-report-id="RPU-505"] .row-menu [data-report-action="RPU-505"]').click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}12-report-detail`, { fullPage: true });

  // Report Detail — RPU-579 (Deletion Requested → warning-note + ปิดรายงาน)
  await page.locator("[data-back-reported-users]").click();
  await page.waitForTimeout(400);
  await page.locator('[data-report-id="RPU-579"] .row-menu summary').click();
  await page.waitForTimeout(300);
  await page.locator('[data-report-id="RPU-579"] .row-menu [data-report-action="RPU-579"]').click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}13-report-detail-deletion`, { fullPage: true });

  // Confirm Close Report modal (title ไทย → EN)
  const closeBtn = page.locator('[data-report-status-action="Closed"][data-report-id="RPU-579"]');
  if (await closeBtn.first().isVisible({ timeout: 500 }).catch(() => false)) {
    await closeBtn.first().click();
    await page.waitForTimeout(400);
    await shot(page, `${prefix}14-modal-confirm-close-report`);
    await closeModal(page);
  } else {
    console.log("skip 14-modal-confirm-close-report (ปิดรายงาน button not found)");
  }
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  // ============ Desktop 1920x1080 ============
  const desktop = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await captureUserSurfaces(desktop, "d");
  await desktop.close();

  // ============ Tablet 768x1024 ============
  const tablet = await browser.newPage({ viewport: { width: 768, height: 1024 } });
  await captureUserSurfaces(tablet, "t");
  await tablet.close();

  // ============ Mobile 440x956 ============
  const mobile = await browser.newPage({ viewport: { width: 440, height: 956 } });
  await captureUserSurfaces(mobile, "m");
  await mobile.close();

  await browser.close();
  console.log("done →", OUT);
})();
