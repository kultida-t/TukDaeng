// DOC-035 — evidence capture (before/after)
// ถอด consignment surface ออกจาก BO prototype (DEC-51 / DOC-034 Option 2)
// usage: node scripts/capture-doc-035-consignment.js before|after [url]
//   (ต้อง start server ที่ Prototypes ก่อน: node Prototypes/server.mjs — port 4173)
// Task viewports: 1440x900 (w) + 390x844 (m)
const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const PHASE = process.argv[2] === "after" ? "after" : "before";
const BASE = process.argv[3] || "http://localhost:4173/bo-prototype.html";
const OUT = path.join(__dirname, "..", "screenshots", "task-DOC-035", PHASE);

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
    const backdrop = page.locator("#sidebar-backdrop");
    if (await backdrop.isVisible({ timeout: 500 }).catch(() => false)) {
      await backdrop.click({ position: { x: 5, y: 5 }, force: true });
    } else {
      await page.locator("#menu-toggle").click({ force: true });
    }
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
}

async function shot(page, name, opts = {}) {
  await page.evaluate(() => document.activeElement?.blur());
  await page.screenshot({ path: path.join(OUT, `${name}.png`), ...opts });
  console.log("saved", name);
}

async function openAssetFilters(page) {
  const toggle = page.locator("[data-asset-filter-toggle]");
  if (await toggle.isVisible().catch(() => false) && (await toggle.getAttribute("aria-expanded")) !== "true") {
    await toggle.click();
    await page.waitForTimeout(300);
  }
}

async function openStatusFilterMenu(page) {
  const trigger = page.locator('[data-custom-select]:has(#asset-type-filter) [data-custom-select-trigger]');
  await trigger.click();
  await page.waitForTimeout(300);
}

async function openAssetDetail(page, assetId) {
  const card = page.locator(`[data-asset-card="${assetId}"]`);
  await card.locator(".row-menu summary").click();
  await page.waitForTimeout(250);
  await page.locator(`[data-asset-open="${assetId}"]`).click();
  await page.waitForTimeout(600);
}

async function captureSurfaces(page, prefix) {
  // ===== 1. Asset List — Consignment pill บน AST-8831 =====
  await goModule(page, "assets", "Asset List");
  await closeNavIfOpen(page);
  await shot(page, `${prefix}01-asset-list`, { fullPage: true });

  // ===== 2. Status filter dropdown open (มี Sale + Consignment) =====
  await openAssetFilters(page);
  await openStatusFilterMenu(page);
  await shot(page, `${prefix}02-asset-status-filter-open`);

  // ===== 3. เลือก Sale + Consignment → filtered list =====
  const consignOption = page.locator('[data-custom-select-option][data-value="Sale:Consignment"]');
  if (await consignOption.count()) {
    await consignOption.click();
    await page.waitForTimeout(500);
    await shot(page, `${prefix}03-asset-list-filtered-consignment`, { fullPage: true });
  } else {
    await page.locator('[data-custom-select]:has(#asset-type-filter) [data-custom-select-trigger]').click();
    await page.waitForTimeout(300);
    console.log("Sale + Consignment option not found (expected in after)");
  }

  // ===== 4. Search "consignment" keyword =====
  await page.locator("#search").fill("consignment");
  await page.waitForTimeout(500);
  await shot(page, `${prefix}04-asset-search-consignment`, { fullPage: true });
  await page.locator("#search").fill("");
  await page.waitForTimeout(400);

  // ===== 5. Asset Detail AST-8548 — Provenance + ปุ่ม purchase history =====
  await page.locator("#search").fill("AST-8548");
  await page.waitForTimeout(500);
  await openAssetDetail(page, "AST-8548");
  await shot(page, `${prefix}05-asset-detail-provenance`, { fullPage: true });

  // ===== 6. Consignment Details modal =====
  const historyBtn = page.locator('[data-asset-purchase-history="AST-8548"]');
  if (await historyBtn.count()) {
    await historyBtn.click();
    await page.waitForTimeout(500);
    await shot(page, `${prefix}06-consignment-details-modal`);
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
