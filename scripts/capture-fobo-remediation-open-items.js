// FOBO-REMEDIATION-OPEN-ITEMS — protected screens evidence capture (before/after)
// 1) Roles & Permissions — "Reported Board" → "Reported Articles" (GAP-09 tail)
// 2) Reported Assets — post-only report seed POST- ref (GAP-08/d3)
// 3) User Detail report brief — ลบ Waiting time display (GAP-03 tail)
// 4) Watch Alert List/Detail — source field (OPEN-3)
// usage: node scripts/capture-fobo-remediation-open-items.js before|after [url]
//   (ต้อง start server ที่ Prototypes ก่อน: node Prototypes/server.mjs — port 4173)
// Task viewports: 1440x900 (w) + 390x844 (m)
const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const PHASE = process.argv[2] === "after" ? "after" : "before";
const BASE = process.argv[3] || "http://localhost:4173/bo-prototype.html";
const OUT = path.join(__dirname, "..", "screenshots", "fobo-remediation-open-items", PHASE);

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

async function goModule(page, module, sub) {
  await login(page);
  await ensureNavOpen(page);
  if (sub) {
    const nav = page.locator(`button.nav-item[data-module="${module}"]`);
    if ((await nav.getAttribute("aria-expanded")) !== "true") {
      await nav.click();
      await page.waitForTimeout(250);
    }
    await page.locator(`button[data-module="${module}"][data-sub="${sub}"]`).click();
  } else {
    await page.locator(`button.nav-item[data-module="${module}"]`).click();
  }
  await page.waitForTimeout(500);
  await closeNavIfOpen(page);
}

async function shot(page, name, opts = {}) {
  await page.evaluate(() => document.activeElement?.blur());
  await page.screenshot({ path: path.join(OUT, `${name}.png`), ...opts });
  console.log("saved", name);
}

async function openRowMenu(card) {
  await card.locator(".row-menu summary").click();
  await card.page().waitForTimeout(300);
}

async function captureSurfaces(page, prefix) {
  // ===== Roles & Permissions — ROL-005 Trust & Safety Moderator =====
  await goModule(page, "settings", "Roles & Permissions");
  await shot(page, `${prefix}01-role-list`, { fullPage: true });
  const rol5 = page.locator('[data-role-card="ROL-005"]');
  await openRowMenu(rol5);
  await rol5.locator('[data-role-open="ROL-005"]').click();
  await page.waitForTimeout(500);
  await shot(page, `${prefix}02-role-detail-moderator`, { fullPage: true });
  // ROL-008 Content Publisher — กลับมา list แล้วเปิด detail
  await goModule(page, "settings", "Roles & Permissions");
  const rol8 = page.locator('[data-role-card="ROL-008"]');
  await openRowMenu(rol8);
  await rol8.locator('[data-role-open="ROL-008"]').click();
  await page.waitForTimeout(500);
  await shot(page, `${prefix}03-role-detail-publisher`, { fullPage: true });

  // ===== Reported Assets — queue + post-only case (after) =====
  await goModule(page, "assets", "Reported Assets");
  await shot(page, `${prefix}04-reported-assets-list`, { fullPage: true });
  const post = page.locator('[data-asset-report-card="POST-7720"]');
  if (await post.isVisible({ timeout: 800 }).catch(() => false)) {
    await openRowMenu(post);
    await post.locator('[data-asset-report-open="POST-7720"]').click();
    await page.waitForTimeout(500);
    await shot(page, `${prefix}05-post-report-detail`, { fullPage: true });
  }

  // ===== User Detail U-1002 — report brief (Waiting removal) =====
  await goModule(page, "users", "User Accounts");
  const u = page.locator('[data-user-card="U-1002"]');
  if (await u.isVisible({ timeout: 800 }).catch(() => false)) {
    await u.click();
    await page.waitForTimeout(500);
    await shot(page, `${prefix}06-user-detail-report-brief`, { fullPage: true });
  }

  // ===== Watch Alert List + Detail (source field) =====
  await goModule(page, "watch-alerts", "Watch Alert List");
  await shot(page, `${prefix}07-watch-alert-list`, { fullPage: true });
  const wa = page.locator('[data-wa-alert-card="WAL-1180"]');
  if (await wa.isVisible({ timeout: 800 }).catch(() => false)) {
    await wa.click();
    await page.waitForTimeout(500);
    await shot(page, `${prefix}08-watch-alert-detail`, { fullPage: true });
  }
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  for (const [prefix, viewport] of [["w", { width: 1440, height: 900 }], ["m", { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport });
    await captureSurfaces(page, prefix);
    await page.close();
  }
  await browser.close();
  console.log("done →", OUT);
})();
