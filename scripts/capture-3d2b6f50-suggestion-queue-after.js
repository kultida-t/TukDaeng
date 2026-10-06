// Task 3d2b6f50 — Suggestion Queue UI (BO Option Master) — AFTER capture
// capture: Option Group List (pending pill + queue action), Option Detail, Suggestion Queue, Suggestion Detail modal @1440/768/440
// headless:false เพื่อให้ scrollbar จริงถูกวาดลงภาพ (headless Chromium ใช้ overlay scrollbar ซ่อนเอง)
// usage: node scripts/capture-3d2b6f50-suggestion-queue-after.js (server :8080)
const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const BASE = "http://localhost:8080/bo-prototype.html";
const OUT = path.join(__dirname, "..", "screenshots", "task-3d2b6f50-suggestion-queue");

async function login(page) {
  await page.goto(BASE);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(800);
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
  if (needsToggle) { await page.locator("#menu-toggle").click(); await page.waitForTimeout(300); }
}
async function closeNavIfOpen(page) {
  const isOpen = await page.evaluate(() => document.body.classList.contains("nav-open"));
  if (isOpen) { await page.locator("#menu-toggle").click(); await page.waitForTimeout(300); }
}
async function shot(page, name) {
  await page.evaluate(() => document.activeElement?.blur());
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log("saved", name);
}

async function capture(viewport, tag) {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport });
  await login(page);
  await ensureNavOpen(page);
  await page.locator('[data-nav-module="option-master"], .nav-item[data-module="option-master"]').first().click()
    .catch(async () => { await page.getByText("Option Master", { exact: true }).first().click(); });
  await page.waitForTimeout(400);
  await closeNavIfOpen(page);
  await shot(page, `${tag}-option-group-list`);           // page action + pending pills ใน Status cell
  await page.locator('.asset-row[data-option-group="OG-003"]').click();
  await page.waitForTimeout(400);
  await shot(page, `${tag}-option-detail-case-material`);
  await page.locator("[data-back-option-groups]").click();
  await page.waitForTimeout(300);
  // Suggestion Queue (combined)
  await page.locator("[data-option-suggestion-queue-open]").click();
  await page.waitForTimeout(400);
  await shot(page, `${tag}-suggestion-queue`);
  // filter bar open (mobile toggle)
  const toggleVisible = await page.locator("[data-option-suggestion-filter-toggle]").isVisible().catch(() => false);
  if (toggleVisible) {
    await page.locator("[data-option-suggestion-filter-toggle]").click();
    await page.waitForTimeout(250);
    await shot(page, `${tag}-suggestion-queue-filters-open`);
    await page.locator("[data-option-suggestion-filter-toggle]").click();
    await page.waitForTimeout(200);
  }
  // row action menu open
  await page.locator('.asset-row[data-option-suggestion-row="SUG-001"] .row-menu summary').click();
  await page.waitForTimeout(250);
  await shot(page, `${tag}-suggestion-queue-row-menu`);
  await page.locator('[data-option-suggestion-view-action="SUG-001"]').click();
  await page.waitForTimeout(350);
  await shot(page, `${tag}-suggestion-detail-modal`);
  // Promote modal (Add Option + suggestion context)
  await page.locator('[data-option-suggestion-promote="SUG-001"]').last().click();
  await page.waitForTimeout(350);
  await shot(page, `${tag}-promote-modal`);
  await closeAllModals(page);
  // Map alias modal
  await page.locator('.asset-row[data-option-suggestion-row="SUG-002"] .row-menu summary').click();
  await page.waitForTimeout(250);
  await page.locator('[data-option-suggestion-map="SUG-002"]').click();
  await page.waitForTimeout(350);
  await shot(page, `${tag}-map-alias-modal`);
  await closeAllModals(page);
  // Ignore modal
  await page.locator('.asset-row[data-option-suggestion-row="SUG-003"] .row-menu summary').click();
  await page.waitForTimeout(250);
  await page.locator('[data-option-suggestion-ignore="SUG-003"]').click();
  await page.waitForTimeout(350);
  await shot(page, `${tag}-ignore-modal`);
  await browser.close();
}

async function closeAllModals(page) {
  for (let i = 0; i < 4; i++) {
    const closeBtn = page.locator("[data-user-action-modal-close]").first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
      await page.waitForTimeout(250);
    } else break;
  }
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  await capture({ width: 1440, height: 900 }, "after-1440");
  await capture({ width: 768, height: 1024 }, "after-768");
  await capture({ width: 440, height: 956 }, "after-440");
})();
