// BOR-005 smoke check: Modal Action Order (Contract A) + Close Policy (Contract B)
// Standalone script — not a playwright spec. Run: node tests/_bor005-modal-consistency.cjs
const { chromium } = require("@playwright/test");

const BASE = "http://localhost:8080/bo-prototype.html";

let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log(`PASS  ${name}`); }
  else { fail++; console.log(`FAIL  ${name} ${extra}`); }
}

const modalOpen = (page) =>
  page.evaluate(() => document.querySelector("#user-action-modal")?.classList.contains("show"));

const hasDismissible = (page) =>
  page.evaluate(() => !!document.querySelector("#user-action-modal [data-modal-dismissible]"));

async function footerOrder(page) {
  return page.evaluate(() => {
    const rows = [...document.querySelectorAll("#user-action-modal .user-detail-actions")];
    for (const row of rows) {
      const btns = [...row.querySelectorAll("button")];
      const ci = btns.findIndex((b) => b.hasAttribute("data-user-action-modal-close"));
      const ki = btns.findIndex((b) => b.matches(
        "[data-user-action-confirm],[data-admin-account-action-confirm],[data-admin-account-change-role-confirm]," +
        "[data-deletion-action-confirm],[data-report-status-confirm],[data-asset-report-status-confirm]," +
        "[data-asset-action-confirm],[data-board-report-action-confirm],[data-reported-comment-action-confirm]," +
        "[data-market-sync-run],[data-market-sync-retry],[data-market-sync-view-logs]"));
      if (ci >= 0 && ki >= 0) return { ci, ki };
    }
    return null;
  });
}
const assertOrder = async (page, name) => {
  const o = await footerOrder(page);
  check(`${name} — cancel precedes confirm`, !!o && o.ci < o.ki, JSON.stringify(o));
};

async function login(page) {
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");
  const loginScreen = page.locator("#login-screen");
  if (await loginScreen.isVisible({ timeout: 1500 }).catch(() => false)) {
    await page.locator("#login-form button[type='submit']").click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await page.waitForTimeout(500);
  }
}

async function navTo(page, moduleId, sub) {
  const parent = page.locator(`.nav-item[data-module='${moduleId}']`);
  const expanded = await parent.evaluate((el) => el.classList.contains("expanded")).catch(() => false);
  if (!expanded) await parent.click();
  await page.waitForTimeout(250);
  await page.locator(`.submenu[data-submenu='${moduleId}'] button[data-sub='${sub}']`).click();
  await page.waitForTimeout(400);
}

const backdropClick = (page) => page.locator("#user-action-modal").click({ position: { x: 10, y: 400 } });
const esc = (page) => page.keyboard.press("Escape");
const closeX = (page) => page.locator("#user-action-modal .user-action-close[data-user-action-modal-close]").first().click();

(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await login(page);

  // ---------- A7 + negative close policy: User action modal (confirm/form) ----------
  await navTo(page, "users", "User Accounts");
  await page.locator(".user-row[data-user-card='U-1017'] .user-cell-primary").click();
  await page.waitForTimeout(400);
  await page.locator("button[data-user-action='Suspend']").click();
  await page.waitForTimeout(300);
  check("A7 user action modal opens", await modalOpen(page));
  await assertOrder(page, "A7 user action modal");
  check("A7 not marked dismissible", !(await hasDismissible(page)));
  await backdropClick(page); await page.waitForTimeout(250);
  check("A7 backdrop click does NOT close", await modalOpen(page));
  await esc(page); await page.waitForTimeout(250);
  check("A7 ESC does NOT close", await modalOpen(page));
  await closeX(page); await page.waitForTimeout(250);
  check("A7 X closes", !(await modalOpen(page)));

  // ---------- A5: Admin account action modal ----------
  await navTo(page, "settings", "Admin Accounts");
  await page.locator(".admin-account-row[data-admin-account-card='ADM-001'] .row-menu > summary").click();
  await page.waitForTimeout(250);
  await page.locator("[data-admin-account-action='suspend'][data-admin-account-id='ADM-001']").click();
  await page.waitForTimeout(300);
  check("A5 admin action modal opens", await modalOpen(page));
  await assertOrder(page, "A5 admin action modal");
  check("A5 not marked dismissible", !(await hasDismissible(page)));
  await esc(page); await page.waitForTimeout(250);
  check("A5 ESC does NOT close", await modalOpen(page));
  await closeX(page);

  // ---------- A10: Market Sync confirm (rendered directly; opener not wired in UI) ----------
  await page.evaluate(() => renderMarketSyncModal("confirm"));
  await page.waitForTimeout(200);
  check("A10 market sync confirm opens", await modalOpen(page));
  await assertOrder(page, "A10 market sync confirm");
  check("A10 confirm state not dismissible", !(await hasDismissible(page)));
  await esc(page); await page.waitForTimeout(200);
  check("A10 ESC does NOT close confirm state", await modalOpen(page));
  await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
  await page.waitForTimeout(200);

  // ---------- A12: Reported comment action modal ----------
  await navTo(page, "assets", "Reported Comments");
  await page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-711'] .user-cell-primary").click();
  await page.waitForTimeout(400);
  await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Hide comment']").click();
  await page.waitForTimeout(300);
  check("A12 reported-comment modal opens", await modalOpen(page));
  await assertOrder(page, "A12 reported-comment modal");
  check("A12 not marked dismissible", !(await hasDismissible(page)));
  await closeX(page);

  // ---------- B5: Delivery Log detail (dismissible) ----------
  await navTo(page, "settings", "Delivery Logs");
  await page.locator(".delivery-log-table .user-row.delivery-row").first().click();
  await page.waitForTimeout(400);
  check("B5 delivery detail opens", await modalOpen(page));
  check("B5 marked dismissible", await hasDismissible(page));
  await backdropClick(page); await page.waitForTimeout(250);
  check("B5 backdrop click closes", !(await modalOpen(page)));
  await page.locator(".delivery-log-table .user-row.delivery-row").first().click();
  await page.waitForTimeout(400);
  await esc(page); await page.waitForTimeout(250);
  check("B5 ESC closes", !(await modalOpen(page)));

  // ---------- B9: WA criteria drill-down (dismissible) ----------
  await navTo(page, "watch-alerts", "Demand Overview");
  await page.locator(".wa-panel-criteria [data-wa-criteria-viewall]").click();
  await page.waitForTimeout(300);
  check("B9 criteria modal opens", await modalOpen(page));
  check("B9 marked dismissible", await hasDismissible(page));
  await esc(page); await page.waitForTimeout(250);
  check("B9 ESC closes", !(await modalOpen(page)));
  await page.locator(".wa-panel-criteria [data-wa-criteria-viewall]").click();
  await page.waitForTimeout(300);
  await backdropClick(page); await page.waitForTimeout(250);
  check("B9 backdrop click closes", !(await modalOpen(page)));

  // ---------- B11: Option view modal (dismissible) ----------
  await page.locator(".nav-item[data-module='option-master']").click();
  await page.waitForTimeout(400);
  await page.locator(".asset-row[data-option-group='OG-001'] .asset-cell-primary").click();
  await page.waitForTimeout(400);
  await page.locator(".asset-row[data-option-view='OPT-001']").first().click();
  await page.waitForTimeout(300);
  check("B11 option view modal opens", await modalOpen(page));
  check("B11 marked dismissible", await hasDismissible(page));
  await esc(page); await page.waitForTimeout(250);
  check("B11 ESC closes", !(await modalOpen(page)));

  // ---------- B14: Category detail modal (dismissible) ----------
  await navTo(page, "content", "Categories");
  await page.locator(".asset-row[data-category-card='CAT-001'] .row-menu > summary").click();
  await page.waitForTimeout(250);
  await page.locator(".asset-row[data-category-card='CAT-001'] .row-menu-list [data-category-open='CAT-001']").click();
  await page.waitForTimeout(300);
  check("B14 category detail opens", await modalOpen(page));
  check("B14 marked dismissible", await hasDismissible(page));
  await backdropClick(page); await page.waitForTimeout(250);
  check("B14 backdrop click closes", !(await modalOpen(page)));

  // ---------- Ack: blocked category action (acknowledge modal — UI-gated, trigger directly) ----------
  await page.evaluate(() => {
    const cat = categoryRows.find((c) => c.id === "CAT-001");
    openCategoryActionConfirmModal(cat, "deactivate");
  });
  await page.waitForTimeout(300);
  check("Ack blocked modal opens", await modalOpen(page));
  check("Ack marked dismissible", await hasDismissible(page));
  await esc(page); await page.waitForTimeout(250);
  check("Ack ESC closes", !(await modalOpen(page)));

  // ---------- Audit drawer: canonical X/backdrop/ESC ----------
  await navTo(page, "settings", "Audit Log");
  await page.locator(".audit-row").first().click();
  await page.waitForTimeout(400);
  check("Audit drawer opens", await modalOpen(page));
  check("Audit drawer marked dismissible", await hasDismissible(page));
  await closeX(page); await page.waitForTimeout(250);
  check("Audit drawer X closes", !(await modalOpen(page)));
  await page.locator(".audit-row").first().click(); await page.waitForTimeout(400);
  await backdropClick(page); await page.waitForTimeout(250);
  check("Audit drawer backdrop closes", !(await modalOpen(page)));
  await page.locator(".audit-row").first().click(); await page.waitForTimeout(400);
  await esc(page); await page.waitForTimeout(250);
  check("Audit drawer ESC closes", !(await modalOpen(page)));

  // ---------- Market reference drawer (dismissible) ----------
  await navTo(page, "market", "Brands & Models");
  await page.locator(".market-catalog-table .asset-row:not(.head)").first().click();
  await page.waitForTimeout(400);
  await page.locator(".market-model-table .asset-row:not(.head)").first().click();
  await page.waitForTimeout(400);
  await page.locator(".market-reference-list-table .asset-row:not(.head)").first().click();
  await page.waitForTimeout(400);
  check("Market ref drawer opens", await modalOpen(page));
  check("Market ref marked dismissible", await hasDismissible(page));
  await esc(page); await page.waitForTimeout(250);
  check("Market ref ESC closes", !(await modalOpen(page)));

  check("no page errors", errors.length === 0, errors.join(" | "));
  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
