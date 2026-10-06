// Task 3d2b6f50 — regression (existing Option Master flows) + mobile smoke
const { chromium } = require("@playwright/test");
const BASE = "http://localhost:8080/bo-prototype.html";
let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; console.log("  PASS", name); }
  else { fail++; console.log("  FAIL", name); }
}
async function login(page) {
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");
  if (await page.locator("#login-screen").isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator('#login-form button[type="submit"]').click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await page.waitForTimeout(400);
  }
}
async function gotoOptionMaster(page) {
  await page.locator('[data-nav-module="option-master"], .nav-item[data-module="option-master"]').first().click()
    .catch(async () => page.getByText("Option Master", { exact: true }).first().click());
  await page.waitForTimeout(400);
}
(async () => {
  const browser = await chromium.launch();

  // ===== Regression: existing flows at 1440 =====
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await login(page);
  await gotoOptionMaster(page);

  ok("group list renders", await page.locator(".option-group-table .asset-row:not(.head)").count() > 0);
  // drill into OG-003
  await page.locator('.asset-row[data-option-group="OG-003"]').click();
  await page.waitForTimeout(400);
  ok("option detail renders", await page.locator(".option-detail-table .asset-row:not(.head)").count() > 0);
  // normal Add Option (no suggestion context)
  await page.locator("[data-option-add-open]").click();
  await page.waitForTimeout(300);
  ok("add modal title = Add Option", (await page.locator("#user-action-modal-title").textContent()).includes("Add Option"));
  ok("no suggestion context", await page.locator('[data-option-form][data-option-suggestion=""]').count() === 1);
  await page.locator("[data-option-label-en]").fill("Regression Test");
  await page.locator("[data-option-label-th]").fill("ทดสอบ regression");
  await page.locator('[data-option-form] button[type="submit"]').click();
  await page.waitForTimeout(300);
  ok("confirm modal (no suggestion row)", (await page.locator(".option-confirm-summary").textContent()).includes("From Suggestion") === false);
  await page.locator("[data-option-add-confirm]").click();
  await page.waitForTimeout(400);
  ok("option added to detail list", await page.evaluate(() =>
    getOptionGroup("OG-003").options.some(o => o.key === "regression_test")));
  ok("still in detail mode", await page.evaluate(() => document.body.classList.contains("option-detail-mode")));

  // audit modal still works
  const optId = await page.evaluate(() => getOptionGroup("OG-003").options[0].id);
  await page.locator(`.asset-row[data-option-view="${optId}"] .row-menu summary`).click();
  await page.waitForTimeout(200);
  await page.locator(`[data-option-audit-open="${optId}"]`).click();
  await page.waitForTimeout(300);
  ok("audit modal opens", await page.locator(".option-audit-list").count() === 1);
  await page.locator("[data-user-action-modal-close]").click();
  await page.waitForTimeout(200);

  // back to group list, mode cleanup
  await page.locator("[data-back-option-groups]").click();
  await page.waitForTimeout(300);
  ok("back: group-list-mode only", await page.evaluate(() =>
    document.body.classList.contains("option-group-list-mode") && !document.body.classList.contains("option-suggestion-mode")));

  // navigate away → Dashboard, verify no leak
  await page.locator('[data-nav-module="dashboard"], .nav-item[data-module="dashboard"]').first().click()
    .catch(async () => page.getByText("Dashboard", { exact: true }).first().click());
  await page.waitForTimeout(400);
  ok("dashboard: no option classes leak", await page.evaluate(() =>
    !document.body.classList.contains("option-master-mode")
    && !document.body.classList.contains("option-group-list-mode")
    && !document.body.classList.contains("option-suggestion-mode")));

  // back to option-master via nav
  await gotoOptionMaster(page);
  ok("group list again, queue flag reset", await page.evaluate(() =>
    optionSuggestionQueueActive === false && document.body.classList.contains("option-group-list-mode")));

  await page.close();

  // ===== Mobile 393 =====
  const mp = await browser.newPage({ viewport: { width: 393, height: 852 } });
  mp.on("pageerror", e => errors.push(e.message));
  await login(mp);
  // open nav on mobile
  const needsToggle = await mp.evaluate(() =>
    window.matchMedia("(max-width: 1180px)").matches && !document.body.classList.contains("nav-open"));
  if (needsToggle) { await mp.locator("#menu-toggle").click(); await mp.waitForTimeout(300); }
  await gotoOptionMaster(mp);
  // close nav overlay if open
  const navOpen = await mp.evaluate(() => document.body.classList.contains("nav-open"));
  if (navOpen) { await mp.locator("#menu-toggle").click(); await mp.waitForTimeout(300); }

  ok("mobile: queue button exists", await mp.locator("[data-option-suggestion-queue-open]").count() === 1);
  ok("mobile: no horizontal overflow (group list)", await mp.evaluate(() =>
    document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  await mp.locator("[data-option-suggestion-queue-open]").click();
  await mp.waitForTimeout(400);
  ok("mobile: suggestion mode", await mp.evaluate(() => document.body.classList.contains("option-suggestion-mode")));
  ok("mobile: no horizontal overflow (queue)", await mp.evaluate(() =>
    document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  ok("mobile: reset button within viewport", await mp.evaluate(() => {
    const b = document.querySelector("[data-option-suggestion-reset]");
    return b && b.getBoundingClientRect().right <= window.innerWidth;
  }));
  ok("mobile: head hidden (card mode)", await mp.locator(".option-suggestion-table .asset-row.head").isHidden());
  ok("mobile: cards render", await mp.locator(".option-suggestion-table .asset-row:not(.head)").count() === 8);
  // filter toggle visible on mobile
  ok("mobile: filter toggle visible", await mp.locator("[data-option-suggestion-filter-toggle]").isVisible());
  await mp.locator("[data-option-suggestion-filter-toggle]").click();
  await mp.waitForTimeout(200);
  ok("mobile: filter bar opens", await mp.locator(".option-suggestion-filter-bar[data-filter-open='true']").count() === 1);
  // row menu opens + detail modal
  await mp.locator('.asset-row[data-option-suggestion-row="SUG-004"] .row-menu summary').click();
  await mp.waitForTimeout(200);
  await mp.locator('[data-option-suggestion-view-action="SUG-004"]').click();
  await mp.waitForTimeout(300);
  ok("mobile: detail modal opens", (await mp.locator("#user-action-modal-title").textContent()).includes("Suggestion Detail"));
  // pending suggestion has no audit event yet → Audit Log button hidden
  ok("pending: audit button hidden", (await mp.locator('#user-action-modal [data-audit-ref="SUG-004"]').count()) === 0);
  await mp.locator("[data-user-action-modal-close]").click();
  await mp.waitForTimeout(300);
  // resolved suggestion (SUG-006, mapped) has audit event → audit ref jump works
  await mp.locator('.asset-row[data-option-suggestion-row="SUG-006"] .row-menu summary').click();
  await mp.waitForTimeout(200);
  await mp.locator('[data-option-suggestion-view-action="SUG-006"]').click();
  await mp.waitForTimeout(300);
  await mp.locator('#user-action-modal [data-audit-ref="SUG-006"]').first().click();
  await mp.waitForTimeout(500);
  ok("audit log filtered by SUG-006", await mp.evaluate(() =>
    document.body.classList.contains("audit-log-mode") && document.querySelector("#audit-search")?.value === "SUG-006"));

  console.log(`\n${pass} passed, ${fail} failed`);
  if (errors.length) console.log("page errors:", errors);
  await browser.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error("FATAL", e); process.exit(1); });
