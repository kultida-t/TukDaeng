// MKD-003 — Market Data label normalization evidence capture
// ครอบคลุม surface ของ 23 จุดแก้ตาม bo-canonical-label-table.md §7.1
// main set = user-reachable surfaces เท่านั้น (หลักฐานส่งตรวจ)
// console-only/ = dead-code surfaces (sync modal, audit modal) เปิดได้แค่ผ่าน
//   page.evaluate — ไม่มีปุ่มบนหน้าจอ → label พิสูจน์หลักด้วย verify-mkd-003.js
// usage: node scripts/capture-mkd-003-market-labels.js before|after [url]
//   (ต้อง start server ที่ Prototypes ก่อน: node Prototypes/server.mjs)
//   url override ใช้ตอน capture before จาก snapshot เก่า เช่น /_mkd003-before.html
// Evidence viewport standard (AGENTS.md): Desktop 1920x1080, Tablet 768x1024, Mobile 440x956
const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const PHASE = process.argv[2] === "after" ? "after" : "before";
const BASE = process.argv[3] || "http://localhost:4173/bo-prototype.html";
const OUT = path.join(__dirname, "..", "screenshots", "mission-2-objective-2", PHASE);
const OUT_CONSOLE = path.join(OUT, "console-only");

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

async function goMarketSub(page, sub) {
  await login(page);
  await ensureNavOpen(page);
  const marketNav = page.locator('button.nav-item[data-module="market"]');
  if ((await marketNav.getAttribute("aria-expanded")) !== "true") {
    await marketNav.click();
    await page.waitForTimeout(250);
  }
  await page.locator(`button[data-module="market"][data-sub="${sub}"]`).click();
  await page.waitForTimeout(400);
  await closeNavIfOpen(page);
}

async function shot(page, name, opts = {}) {
  await page.evaluate(() => document.activeElement?.blur());
  await page.screenshot({ path: path.join(OUT, `${name}.png`), ...opts });
  console.log("saved", name);
}

async function shotConsole(page, name, opts = {}) {
  await page.evaluate(() => document.activeElement?.blur());
  await page.screenshot({ path: path.join(OUT_CONSOLE, `${name}.png`), ...opts });
  console.log("saved console-only/" + name);
}

async function captureMarketSurfaces(page, prefix) {
  // ============ USER-REACHABLE surfaces (หลักฐานหลัก) ============

  // Market Overview (context)
  await goMarketSub(page, "Market Overview");
  await shot(page, `${prefix}01-market-overview`, { fullPage: true });

  // Brands & Models — row action ดูรายละเอียด
  await goMarketSub(page, "Brands & Models");
  await shot(page, `${prefix}02-brands-list`, { fullPage: true });

  // Brands empty state
  await page.locator("#market-search").fill("zzz-no-match");
  await page.waitForTimeout(300);
  await shot(page, `${prefix}03-brands-empty`, { fullPage: true });
  await page.locator("#market-search").fill("");
  await page.waitForTimeout(300);

  // Brand Detail — search placeholder + ดูรายละเอียด + back (row click drills in)
  await page.locator("[data-market-brand]").first().locator(".main-text").first().click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}04-brand-detail`, { fullPage: true });

  // Models empty state
  await page.locator("#market-model-search").fill("zzz-no-match");
  await page.waitForTimeout(300);
  await shot(page, `${prefix}05-models-empty`, { fullPage: true });
  await page.locator("#market-model-search").fill("");
  await page.waitForTimeout(300);

  // Model Detail — search placeholder + references + back (row click drills in)
  await page.locator("[data-market-model]").first().locator(".main-text").first().click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}06-model-detail`, { fullPage: true });

  // References empty state
  await page.locator("#market-reference-search").fill("zzz-no-match");
  await page.waitForTimeout(300);
  await shot(page, `${prefix}07-references-empty`, { fullPage: true });
  await page.locator("#market-reference-search").fill("");
  await page.waitForTimeout(300);

  // Reference Detail drawer — row click เปิด drawer จากขวา
  await page.locator("[data-market-reference]").first().locator(".main-text").first().click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}08-reference-drawer`);
  await page.locator("[data-user-action-modal-close]").first().click();
  await page.waitForTimeout(300);

  // Sync History — row action ดูรายละเอียด
  await goMarketSub(page, "Sync History");
  await shot(page, `${prefix}09-sync-history`, { fullPage: true });

  // Sync History empty state
  await page.locator("#market-search").fill("zzz-no-match");
  await page.waitForTimeout(300);
  await shot(page, `${prefix}10-sync-history-empty`, { fullPage: true });
  await page.locator("#market-search").fill("");
  await page.waitForTimeout(300);

  // Sync record detail — back button + breadcrumb (row click drills in)
  await page.locator("[data-market-record]").first().locator(".main-text").first().click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}11-sync-detail`, { fullPage: true });

  // ============ CONSOLE-ONLY surfaces (dead-code entry, ไม่มีปุ่มบนจอ) ============

  await goMarketSub(page, "Market Overview");

  // Sync modal — 4 states
  await page.evaluate(() => renderMarketSyncModal("confirm"));
  await page.waitForTimeout(250);
  await shotConsole(page, `${prefix}c01-sync-modal-confirm`);

  await page.evaluate(() => renderMarketSyncModal("running"));
  await page.waitForTimeout(250);
  await shotConsole(page, `${prefix}c02-sync-modal-running`);

  await page.evaluate(() => renderMarketSyncModal("success"));
  await page.waitForTimeout(250);
  await shotConsole(page, `${prefix}c03-sync-modal-success`);

  await page.evaluate(() => renderMarketSyncModal("error"));
  await page.waitForTimeout(250);
  await shotConsole(page, `${prefix}c04-sync-modal-error`);
  await page.locator("[data-user-action-modal-close]").first().click();
  await page.waitForTimeout(300);

  // Audit modal — ผ่าน openMarketManagementModal
  await page.evaluate(() => openMarketManagementModal("audit", "brand", "rolex"));
  await page.waitForTimeout(300);
  await shotConsole(page, `${prefix}c05-audit-modal`);

  // Audit modal empty state
  await page.evaluate(() => {
    marketCatalogData.auditLog.length = 0;
    openMarketManagementModal("audit", "brand", "rolex");
  });
  await page.waitForTimeout(300);
  await shotConsole(page, `${prefix}c06-audit-modal-empty`);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  // ============ Desktop 1920x1080 ============
  const desktop = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await captureMarketSurfaces(desktop, "d");
  await desktop.close();

  // ============ Tablet 768x1024 ============
  const tablet = await browser.newPage({ viewport: { width: 768, height: 1024 } });
  await captureMarketSurfaces(tablet, "t");
  await tablet.close();

  // ============ Mobile 440x956 ============
  const mobile = await browser.newPage({ viewport: { width: 440, height: 956 } });
  await captureMarketSurfaces(mobile, "m");
  await mobile.close();

  await browser.close();
  console.log("done →", OUT);
})();
