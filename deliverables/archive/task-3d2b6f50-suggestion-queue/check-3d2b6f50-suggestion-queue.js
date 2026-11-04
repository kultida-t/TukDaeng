// Task 3d2b6f50 — Suggestion Queue functional check (BO Option Master)
// usage: node scripts/check-3d2b6f50-suggestion-queue.js (server :8080)
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

async function openQueue(page) {
  await page.locator("[data-option-suggestion-queue-open]").click();
  await page.waitForTimeout(400);
}

async function countRows(page) {
  return page.locator(".option-suggestion-table .asset-row:not(.head)").count();
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));

  await login(page);
  await gotoOptionMaster(page);

  // 1. entry point: queue button + pending pills (2 render spots per group: Status cell + mobile card tags)
  ok("queue button exists", await page.locator("[data-option-suggestion-queue-open]").count() === 1);
  const pillCount = await page.locator('.asset-row [data-label="Status"] [data-option-suggestion-pill]').count();
  ok("pending pills rendered (expect 4 groups w/ pending)", pillCount === 4);

  // 2. open queue
  await openQueue(page);
  ok("suggestion mode on body", await page.evaluate(() => document.body.classList.contains("option-suggestion-mode")));
  ok("queue rows = 8", await countRows(page) === 8);
  ok("default sort = usage desc (SUG-001 first, usage 8)",
    (await page.locator(".option-suggestion-table .asset-row:not(.head) .main-text").first().textContent()).trim() === "SUG-001");
  ok("pending pills in queue hidden (not group list)", await page.locator("[data-option-suggestion-pill]").count() === 0);

  // 3. statuses present
  const statuses = await page.locator(".option-suggestion-table .asset-row:not(.head) [data-label='Status'] .pill").allTextContents();
  ok("has Pending", statuses.includes("Pending"));
  ok("has Promoted", statuses.includes("Promoted"));
  ok("has Mapped", statuses.includes("Mapped"));
  ok("has Ignored", statuses.includes("Ignored"));

  // 4. status filter = ignored (desktop: filter bar visible, no toggle needed)
  await page.locator('[data-custom-select]:has(#option-suggestion-status-filter) [data-custom-select-trigger]').click();
  await page.waitForTimeout(200);
  await page.locator('[data-custom-select]:has(#option-suggestion-status-filter) [data-custom-select-option][data-value="ignored"]').click();
  await page.waitForTimeout(300);
  ok("filter ignored → 2 rows", await countRows(page) === 2);
  // reset
  await page.locator(".option-suggestion-filter-bar .filter-reset").click();
  await page.waitForTimeout(300);
  ok("reset → 8 rows", await countRows(page) === 8);

  // 5. search
  await page.locator("#option-suggestion-search").fill("jubilee");
  await page.waitForTimeout(300);
  ok("search 'jubilee' → 1 row", await countRows(page) === 1);
  await page.locator("#option-suggestion-search").fill("");
  await page.waitForTimeout(300);

  // 6. group filter via custom select
  await page.locator('[data-custom-select]:has(#option-suggestion-group-filter) [data-custom-select-trigger]').click();
  await page.waitForTimeout(200);
  await page.locator('[data-custom-select]:has(#option-suggestion-group-filter) [data-custom-select-option][data-value="OG-006"]').click();
  await page.waitForTimeout(300);
  ok("group OG-006 → 2 rows", await countRows(page) === 2);
  await page.locator('[data-custom-select]:has(#option-suggestion-group-filter) [data-custom-select-trigger]').click();
  await page.waitForTimeout(200);
  await page.locator('[data-custom-select]:has(#option-suggestion-group-filter) [data-custom-select-option][data-value=""]').click();
  await page.waitForTimeout(300);

  // 7. Ignore SUG-003 with note
  await page.locator('.asset-row[data-option-suggestion-row="SUG-003"] .row-menu summary').click();
  await page.waitForTimeout(200);
  await page.locator('[data-option-suggestion-ignore="SUG-003"]').click();
  await page.waitForTimeout(300);
  // confirm without note → error, modal stays
  await page.locator('[data-option-suggestion-ignore-confirm]').click();
  await page.waitForTimeout(200);
  ok("ignore w/o note blocked", (await page.locator("[data-option-suggestion-ignore-error]").textContent()).trim().length > 0);
  await page.locator("[data-option-suggestion-ignore-note]").fill("test ignore note");
  await page.locator('[data-option-suggestion-ignore-confirm]').click();
  await page.waitForTimeout(400);
  ok("SUG-003 now Ignored", await page.evaluate(() => optionSuggestions.find(s => s.id === "SUG-003").status === "ignored"));
  ok("SUG-003 has audit entry", await page.evaluate(() => optionSuggestions.find(s => s.id === "SUG-003").auditHistory[0]?.action === "OPTION_SUGGESTION_IGNORE"));
  ok("global audit event created", await page.evaluate(() => auditLogData.events.some(e => e.eventType === "OPTION_SUGGESTION_IGNORE" && e.reference === "SUG-003")));

  // 8. Map SUG-002 → option in OG-005
  await page.locator('.asset-row[data-option-suggestion-row="SUG-002"] .row-menu summary').click();
  await page.waitForTimeout(200);
  await page.locator('[data-option-suggestion-map="SUG-002"]').click();
  await page.waitForTimeout(300);
  // confirm without target → error
  await page.locator('[data-option-suggestion-map-confirm]').click();
  await page.waitForTimeout(200);
  ok("map w/o target blocked", (await page.locator("[data-option-suggestion-map-error]").textContent()).trim().length > 0);
  const firstOpt = await page.evaluate(() => {
    const g = optionMasterGroups.find(x => x.group_id === "OG-005");
    return g.options[0].id;
  });
  await page.locator(`[data-custom-select]:has(#option-suggestion-map-target) [data-custom-select-trigger]`).click();
  await page.waitForTimeout(200);
  await page.locator(`[data-custom-select]:has(#option-suggestion-map-target) [data-custom-select-option][data-value="${firstOpt}"]`).click();
  await page.waitForTimeout(200);
  await page.locator('[data-option-suggestion-map-confirm]').click();
  await page.waitForTimeout(400);
  ok("SUG-002 now Mapped", await page.evaluate(() => optionSuggestions.find(s => s.id === "SUG-002").status === "mapped"));
  ok("alias recorded", await page.evaluate(() => optionSuggestionAliases.some(a => a.suggestion_id === "SUG-002")));
  ok("global audit event for map", await page.evaluate(() => auditLogData.events.some(e => e.eventType === "OPTION_SUGGESTION_MAP_ALIAS" && e.reference === "SUG-002")));

  // 9. Promote SUG-001 → Add Option modal with prefill
  await page.locator('.asset-row[data-option-suggestion-row="SUG-001"] .row-menu summary').click();
  await page.waitForTimeout(200);
  await page.locator('[data-option-suggestion-promote="SUG-001"]').click();
  await page.waitForTimeout(300);
  ok("promote modal title", (await page.locator("#user-action-modal-title").textContent()).includes("Promote"));
  ok("label_en prefilled", (await page.locator("[data-option-label-en]").inputValue()) === "Two-tone gold/steel");
  ok("key prefilled", (await page.locator("[data-option-key]").inputValue()) === "two_tone_gold_steel");
  await page.locator("[data-option-label-th]").fill("ทูโทน ทอง/เหล็ก");
  await page.locator('[data-option-form] button[type="submit"]').click();
  await page.waitForTimeout(300);
  ok("confirm modal shows suggestion row", (await page.locator(".option-confirm-summary").textContent()).includes("SUG-001"));
  await page.locator("[data-option-add-confirm]").click();
  await page.waitForTimeout(400);
  ok("SUG-001 now Promoted", await page.evaluate(() => optionSuggestions.find(s => s.id === "SUG-001").status === "promoted"));
  ok("new option created in OG-003", await page.evaluate(() => {
    const s = optionSuggestions.find(x => x.id === "SUG-001");
    return !!s.resolved_option_id && getOptionById(s.resolved_option_id)?.key === "two_tone_gold_steel";
  }));
  ok("OPTION_ADD audit on new option", await page.evaluate(() => {
    const s = optionSuggestions.find(x => x.id === "SUG-001");
    return getOptionById(s.resolved_option_id)?.auditHistory?.[0]?.action === "OPTION_ADD";
  }));
  ok("promote audit entry + global event", await page.evaluate(() =>
    optionSuggestions.find(s => s.id === "SUG-001").auditHistory[0]?.action === "OPTION_SUGGESTION_PROMOTE"
    && auditLogData.events.some(e => e.eventType === "OPTION_SUGGESTION_PROMOTE" && e.reference === "SUG-001")));

  // 10. back to group list — pill for OG-003 gone (SUG-001 resolved, SUG-005 promoted already)
  await page.locator("[data-back-option-groups]").click();
  await page.waitForTimeout(400);
  ok("back to group list", await page.evaluate(() => document.body.classList.contains("option-group-list-mode") && !document.body.classList.contains("option-suggestion-mode")));
  ok("OG-003 pill gone (0 pending)", await page.locator('.asset-row[data-option-group="OG-003"] [data-option-suggestion-pill]').count() === 0);
  ok("queue count badge updated", (await page.locator("[data-option-suggestion-queue-open] .option-queue-count").textContent()).trim() === "1");

  // 11. reopen queue → pending only SUG-004 remains pending? (SUG-004 pending + others resolved)
  await openQueue(page);
  const pendingRows = await page.evaluate(() => optionSuggestions.filter(s => s.status === "pending").map(s => s.id));
  ok("only SUG-004 pending", pendingRows.length === 1 && pendingRows[0] === "SUG-004");

  console.log(`\n${pass} passed, ${fail} failed`);
  if (errors.length) console.log("page errors:", errors);
  await browser.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error("FATAL", e); process.exit(1); });
