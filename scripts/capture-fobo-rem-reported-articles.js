// FOBO-REM-REPORTED-ARTICLES — evidence capture (before/after)
// ถอด Reported Articles + Board Report Detail ออกจาก BO prototype (e4 follow-up)
// usage: node scripts/capture-fobo-rem-reported-articles.js before|after [url]
//   (ต้อง start server ที่ Prototypes ก่อน: node Prototypes/server.mjs — port 4173)
// Task viewports: 1440x900 (w) + 390x844 (m)
const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const PHASE = process.argv[2] === "after" ? "after" : "before";
const BASE = process.argv[3] || "http://localhost:4173/bo-prototype.html";
const OUT = path.join(__dirname, "..", "screenshots", "task-FOBO-REM-REPORTED-ARTICLES", PHASE);

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

async function openRowMenu(card) {
  await card.locator(".row-menu summary").click();
  await card.page().waitForTimeout(300);
}

async function captureSurfaces(page, prefix) {
  // ===== 1. Sidebar nav — Content Management expanded (Reported Articles submenu) =====
  await login(page);
  await ensureNavOpen(page);
  const contentNav = page.locator('button.nav-item[data-module="content"]');
  if ((await contentNav.getAttribute("aria-expanded")) !== "true") {
    await contentNav.click();
    await page.waitForTimeout(300);
  }
  await shot(page, `${prefix}01-nav-content-expanded`, { fullPage: true });

  // ===== 2. Reported Articles list =====
  const reportedArticlesSub = page.locator('button[data-module="content"][data-sub="Reported Articles"]');
  if (await reportedArticlesSub.count()) {
    await reportedArticlesSub.click();
    await page.waitForTimeout(500);
    await closeNavIfOpen(page);
    await shot(page, `${prefix}02-reported-articles-list`, { fullPage: true });

    // ===== 3. Board Report Detail (RPC-043) =====
    const rpc = page.locator('[data-board-report-card="RPC-043"]');
    if (await rpc.count()) {
      await openRowMenu(rpc);
      await rpc.locator('[data-board-report-open="RPC-043"]').click();
      await page.waitForTimeout(500);
      await shot(page, `${prefix}03-board-report-detail`, { fullPage: true });
    }
  } else {
    await closeNavIfOpen(page);
  }

  // ===== 4. Dashboard (รายงานบทความ queue card + Reported Items chips + content card) =====
  await goModule(page, "dashboard", null);
  await closeNavIfOpen(page);
  await shot(page, `${prefix}04-dashboard`, { fullPage: true });

  // ===== 5. Roles & Permissions — ROL-008 Content Publisher detail =====
  await goModule(page, "settings", "Roles & Permissions");
  await closeNavIfOpen(page);
  const rol = page.locator('[data-role-card="ROL-008"]');
  if (await rol.count()) {
    await openRowMenu(rol);
    await rol.locator('[data-role-open="ROL-008"]').click();
    await page.waitForTimeout(600);
    await shot(page, `${prefix}05-role-detail-content-publisher`, { fullPage: true });
  } else {
    await shot(page, `${prefix}05-role-list`, { fullPage: true });
  }

  // ===== 6. Regression baseline: Articles list (shares content-mode filter bar) =====
  await goModule(page, "content", "Articles");
  await closeNavIfOpen(page);
  await shot(page, `${prefix}06-article-list`, { fullPage: true });
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
