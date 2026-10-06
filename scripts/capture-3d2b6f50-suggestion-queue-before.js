// Task 3d2b6f50 — Suggestion Queue UI (BO Option Master) — BEFORE capture
// capture: Option Group List + Option Detail (case_material) ที่ 1440 และ 390 ก่อนแตะ prototype
// usage: node scripts/capture-3d2b6f50-suggestion-queue-before.js (ต้อง start server ที่ Prototypes ก่อน — PORT=8080)
const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const BASE = "http://localhost:8080/bo-prototype.html";
const OUT = path.join(__dirname, "..", "screenshots", "task-3d2b6f50-suggestion-queue");

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

async function shot(page, name) {
  await page.evaluate(() => document.activeElement?.blur());
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log("saved", name);
}

async function capture(viewport, tag) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport });
  await login(page);
  await ensureNavOpen(page);
  await page.locator('[data-nav-module="option-master"], .nav-item[data-module="option-master"]').first().click()
    .catch(async () => {
      await page.getByText("Option Master", { exact: true }).first().click();
    });
  await page.waitForTimeout(400);
  await closeNavIfOpen(page);
  await shot(page, `${tag}-option-group-list`);
  // drill into case_material group (รองรับ ระบุเอง ตาม spec §23.1)
  await page.locator('.asset-row[data-option-group="OG-003"]').click();
  await page.waitForTimeout(400);
  await shot(page, `${tag}-option-detail-case-material`);
  await browser.close();
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  await capture({ width: 1440, height: 900 }, "before-1440");
  await capture({ width: 390, height: 844 }, "before-390");
})();
