// FOBO-REMEDIATION-C — protected screens evidence capture (before/after)
// c1 Reported Users + Report Detail · c2 Reported Assets + Asset Report Detail
// c3 Reported Comments + Comment Report Detail · c4 Reported Articles + Board Report Detail
// c5 Categories + Article editor · c6 Support Center · c7 Dashboard
// usage: node scripts/capture-fobo-remediation-c.js before|after [url]
//   (ต้อง start server ที่ Prototypes ก่อน: node Prototypes/server.mjs — port 4173)
// Task viewports: 1440x900 (w) + 390x844 (m)
const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const PHASE = process.argv[2] === "after" ? "after" : "before";
const BASE = process.argv[3] || "http://localhost:4173/bo-prototype.html";
const OUT = path.join(__dirname, "..", "screenshots", "fobo-remediation-c", PHASE);

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
  // ===== c7 Dashboard =====
  await goModule(page, "dashboard", null);
  await shot(page, `${prefix}01-dashboard`, { fullPage: true });

  // ===== c1 Reported Users =====
  await goModule(page, "users", "Reported Users");
  await shot(page, `${prefix}02-reported-users-list`, { fullPage: true });
  // detail RPU-505 (5 reporters — submissions table)
  const rpu = page.locator('[data-report-id="RPU-505"]');
  await openRowMenu(rpu);
  await rpu.locator('[data-report-action="RPU-505"]').click();
  await page.waitForTimeout(500);
  await shot(page, `${prefix}03-user-report-detail`, { fullPage: true });

  // ===== c2 Reported Assets =====
  await goModule(page, "assets", "Reported Assets");
  await shot(page, `${prefix}04-reported-assets-list`, { fullPage: true });
  const rpa = page.locator('[data-asset-report-card="AST-8831"]');
  await openRowMenu(rpa);
  await rpa.locator('[data-asset-report-open="AST-8831"]').click();
  await page.waitForTimeout(500);
  await shot(page, `${prefix}05-asset-report-detail`, { fullPage: true });

  // ===== c3 Reported Comments =====
  await goModule(page, "assets", "Reported Comments");
  await shot(page, `${prefix}06-reported-comments-list`, { fullPage: true });
  const rco = page.locator('[data-reported-comment-card="RCO-711"]');
  await openRowMenu(rco);
  await rco.locator('[data-reported-comment-open="RCO-711"]').click();
  await page.waitForTimeout(500);
  await shot(page, `${prefix}07-comment-report-detail`, { fullPage: true });

  // ===== c4 Reported Articles =====
  await goModule(page, "content", "Reported Articles");
  await shot(page, `${prefix}08-reported-articles-list`, { fullPage: true });
  const rpc = page.locator('[data-board-report-card="RPC-043"]');
  await openRowMenu(rpc);
  await rpc.locator('[data-board-report-open="RPC-043"]').click();
  await page.waitForTimeout(500);
  await shot(page, `${prefix}09-board-report-detail`, { fullPage: true });

  // ===== c5 Categories =====
  await goModule(page, "content", "Categories");
  await shot(page, `${prefix}10-category-list`, { fullPage: true });

  // ===== c5 Article editor (category select) =====
  await goModule(page, "content", "Articles");
  await shot(page, `${prefix}11-article-list`, { fullPage: true });
  await page.locator("[data-article-add]").click();
  await page.waitForTimeout(500);
  await shot(page, `${prefix}12-article-editor`, { fullPage: true });
  // เปิด category dropdown ให้เห็น options
  const catTrigger = page.locator("#article-category-field").locator("..")
    .locator("[data-custom-select-trigger]").first();
  if (await catTrigger.isVisible({ timeout: 1000 }).catch(() => false)) {
    await catTrigger.click();
    await page.waitForTimeout(400);
    await shot(page, `${prefix}13-article-editor-category-options`, { fullPage: true });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  }

  // ===== c6 Support Center =====
  await goModule(page, "settings", "Support Center");
  await shot(page, `${prefix}14-support-center`, { fullPage: true });
  await page.locator("[data-support-preview]").click();
  await page.waitForTimeout(500);
  await shot(page, `${prefix}15-support-preview-modal`, { fullPage: true });
  await page.locator("[data-user-action-modal-close]").first().click().catch(() => {});
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
