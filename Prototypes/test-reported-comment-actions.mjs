import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("C:\\Users\\Admin\\AppData\\Local\\npm-cache\\_npx\\e41f203b7505f1fb\\node_modules\\playwright\\index.js");

const URL = "http://127.0.0.1:4173/";

const results = [];
function log(label, ok, detail = "") {
  results.push({ label, ok, detail });
  const mark = ok ? "PASS" : "FAIL";
  console.log(`[${mark}] ${label}${detail ? ` :: ${detail}` : ""}`);
}

async function login(page) {
  // Login screen: default credentials are pre-filled. Click "Send Email OTP" then "Verify OTP".
  await page.goto(URL);
  await page.waitForLoadState("domcontentloaded");
  // Wait for login form to be visible
  await page.waitForSelector('#login-form:not(.hidden)', { timeout: 5000 });
  // Submit login form (Send Email OTP)
  await page.locator('#login-form button[type="submit"]').click();
  await page.waitForTimeout(300);
  // OTP form should appear; default OTP is 123456
  await page.waitForSelector('#otp-form:not(.hidden)', { timeout: 5000 });
  await page.locator('#verify-otp-btn').click();
  await page.waitForTimeout(500);
  // Login screen should be hidden (display:none after login)
  await page.waitForSelector('#login-screen', { state: 'hidden', timeout: 5000 });
}

async function openReportedComments(page) {
  // Navigate to Asset Management > Reported Comments
  // Click parent to expand submenu
  await page.locator('.nav-item[data-module="assets"]').first().click();
  await page.waitForTimeout(200);
  // Click sub item
  await page.locator('.submenu button[data-module="assets"][data-sub="Reported Comments"]').first().click();
  await page.waitForTimeout(300);
  // Verify we're on the list page
  await page.waitForSelector('[data-reported-comment-card]', { timeout: 5000 });
}

async function getRowState(page, reportId) {
  // Returns { status, commentStatus, actionButtons: [] }
  // Read from the row by data attribute
  const row = page.locator(`[data-reported-comment-card="${reportId}"]`).first();
  if (!(await row.count())) return null;
  // Read pills inside row
  const pills = await row.locator('.pill').allTextContents();
  return { pills };
}

async function getRowActionLabels(page, reportId) {
  const row = page.locator(`[data-reported-comment-card="${reportId}"]`).first();
  if (!(await row.count())) return [];
  const menu = row.locator('details.row-menu').first();
  if (!(await menu.count())) return [];
  // Open the menu
  await menu.locator('summary').click();
  await page.waitForTimeout(100);
  const buttons = await menu.locator('[data-reported-comment-action]').allTextContents();
  // Close menu by clicking elsewhere
  await page.mouse.click(10, 10);
  await page.waitForTimeout(100);
  return buttons;
}

async function openActionFromRow(page, reportId, actionLabel) {
  const row = page.locator(`[data-reported-comment-card="${reportId}"]`).first();
  const menu = row.locator('details.row-menu').first();
  await menu.locator('summary').click();
  await page.waitForTimeout(100);
  const btn = menu.locator(`[data-reported-comment-action]`).filter({ hasText: actionLabel }).first();
  await btn.click();
  await page.waitForTimeout(300);
  // Modal should be open
  return await page.locator('#user-action-modal').isVisible();
}

async function openActionFromDetail(page, reportId, actionLabel) {
  // We're already on detail page; click the action button in user-detail-actions
  const btn = page.locator(`[data-reported-comment-action]`).filter({ hasText: actionLabel }).first();
  await btn.click();
  await page.waitForTimeout(300);
  return await page.locator('#user-action-modal').isVisible();
}

async function openDetail(page, reportId) {
  const row = page.locator(`[data-reported-comment-card="${reportId}"]`).first();
  const menu = row.locator('details.row-menu').first();
  await menu.locator('summary').click();
  await page.waitForTimeout(100);
  await menu.locator(`[data-reported-comment-open="${reportId}"]`).click();
  await page.waitForTimeout(300);
  return await page.locator('.reported-comment-detail-page').count() > 0;
}

async function getModalInfo(page) {
  const title = await page.locator('#user-action-modal-title').textContent().catch(() => "");
  // Custom select: hidden input + trigger button + menu with options
  // Find the custom-select that contains #reported-comment-action-reason via evaluate
  const reasonInfo = await page.evaluate(() => {
    const input = document.querySelector('#reported-comment-action-reason');
    if (!input) return { reasonLabel: false, reasonCount: 0 };
    const select = input.closest('[data-custom-select]');
    if (!select) return { reasonLabel: false, reasonCount: 0 };
    const trigger = select.querySelector('[data-custom-select-trigger]');
    const options = select.querySelectorAll('[data-custom-select-option]');
    return {
      reasonLabel: trigger ? !!(trigger.offsetParent || trigger.getClientRects().length) : false,
      reasonCount: options.length
    };
  }).catch(() => ({ reasonLabel: false, reasonCount: 0 }));
  const noteVisible = await page.locator('#reported-comment-action-note').first().isVisible().catch(() => false);
  return { title: title.trim(), reasonLabel: reasonInfo.reasonLabel, noteVisible, reasonCount: reasonInfo.reasonCount };
}

async function confirmModal(page) {
  const btn = page.locator('[data-reported-comment-action-confirm]').first();
  await btn.click();
  await page.waitForTimeout(400);
}

async function closeModal(page) {
  const close = page.locator('[data-user-action-modal-close]').first();
  if (await close.count()) {
    await close.click();
    await page.waitForTimeout(200);
  }
}

async function getDetailState(page) {
  // Read pills from detail page head
  const head = page.locator('.reported-comment-detail-page .user-detail-head').first();
  if (!(await head.count())) return null;
  const pills = await head.locator('.pill').allTextContents();
  // Read action buttons
  const actions = await page.locator('.reported-comment-detail-page .user-detail-actions [data-reported-comment-action]').allTextContents();
  // Read audit history last row (audit table = .asset-status-history-table)
  const auditTable = page.locator('.reported-comment-detail-page .asset-status-history-table tbody').first();
  let lastAuditRow = [];
  if (await auditTable.count()) {
    lastAuditRow = await auditTable.locator('tr').first().locator('td').allTextContents();
  }
  return { pills, actions, lastAuditRow };
}

async function backToList(page) {
  const back = page.locator('[data-back-to-reported-comments-list]').first();
  if (await back.count()) {
    await back.click();
    await page.waitForTimeout(300);
  }
  return await page.locator('[data-reported-comment-card]').count() > 0;
}

async function resetCase(page, reportId) {
  // Reset mock state by reloading the page (mock data is in-memory, auth state resets)
  await page.goto(URL);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(200);
  await login(page);
  await openReportedComments(page);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    await login(page);
    await openReportedComments(page);
    log("Open Reported Comments list", true);

    // Verify initial state of rows
    const row711 = await getRowState(page, "RCO-711");
    const row706 = await getRowState(page, "RCO-706");
    const row690 = await getRowState(page, "RCO-690");
    log("RCO-711 initial pills", row711 && row711.pills.includes("Pending"), JSON.stringify(row711?.pills));
    log("RCO-706 initial pills", row706 && row706.pills.includes("Pending"), JSON.stringify(row706?.pills));
    log("RCO-690 initial pills", row690 && row690.pills.includes("Closed"), JSON.stringify(row690?.pills));

    // Verify action buttons per state
    const actions711 = await getRowActionLabels(page, "RCO-711");
    log("RCO-711 (Pending/Visible) row actions = [ปิดรายงาน, ซ่อนชั่วคราว, ซ่อนถาวร]",
        JSON.stringify(actions711) === JSON.stringify(["ปิดรายงาน", "ซ่อนชั่วคราว", "ซ่อนถาวร"]),
        JSON.stringify(actions711));

    const actions690 = await getRowActionLabels(page, "RCO-690");
    log("RCO-690 (Closed) row actions = [] (empty)",
        Array.isArray(actions690) && actions690.length === 0,
        JSON.stringify(actions690));

    // ===== TEST 1: Close no violation (from list) =====
    console.log("\n--- TEST 1: Close no violation (from list) ---");
    const modalOpened = await openActionFromRow(page, "RCO-711", "ปิดรายงาน");
    log("Close action opens modal", modalOpened);
    const modalInfo = await getModalInfo(page);
    log("Modal title = 'ยืนยันการปิดรายงาน'", modalInfo.title === "ยืนยันการปิดรายงาน", modalInfo.title);
    log("Reason selector visible", modalInfo.reasonLabel);
    log("Note textarea visible", modalInfo.noteVisible);
    log("Reason count = 4 (Close)", modalInfo.reasonCount === 4, `got ${modalInfo.reasonCount}`);
    // Check no email note for Close
    const emailNoteForClose = await page.locator('.user-action-impact-notice').count();
    log("Close: NO email/impact notice (no email sent)", emailNoteForClose === 0, `count=${emailNoteForClose}`);
    // Actually impact note is shown but email note should not. Let's recheck:
    // renderReportedCommentActionImpactNote returns warning for all actions including Close
    // renderReportedCommentActionEmailNote returns "" for Close
    // So .user-action-impact-notice (email) should be 0, .user-action-impact-warning should be 1
    const impactWarning = await page.locator('.user-action-impact-warning').count();
    log("Close: impact warning note shown (1)", impactWarning === 1, `count=${impactWarning}`);
    const emailPreviewForClose = await page.locator('[data-reported-comment-action-email-preview]').count();
    log("Close: NO email preview", emailPreviewForClose === 0, `count=${emailPreviewForClose}`);

    await confirmModal(page);
    // After confirm: status=Closed, commentStatus still Visible, actions=[]
    const row711AfterClose = await getRowState(page, "RCO-711");
    log("RCO-711 after Close: status=Closed", row711AfterClose && row711AfterClose.pills.includes("Closed"), JSON.stringify(row711AfterClose?.pills));
    log("RCO-711 after Close: NO comment status pill (Visible)", row711AfterClose && !row711AfterClose.pills.some(p => p.includes("ซ่อน") || p.includes("ลบ")), JSON.stringify(row711AfterClose?.pills));
    const actions711AfterClose = await getRowActionLabels(page, "RCO-711");
    log("RCO-711 after Close: row actions = [] (empty)", Array.isArray(actions711AfterClose) && actions711AfterClose.length === 0, JSON.stringify(actions711AfterClose));

    // Reset and test Close from detail
    await resetCase(page, "RCO-711");
    await openDetail(page, "RCO-711");
    const detailActions = await page.locator('.reported-comment-detail-page .user-detail-actions [data-reported-comment-action]').allTextContents();
    log("Detail: action buttons = [ปิดรายงาน, ซ่อนชั่วคราว, ซ่อนถาวร]",
        JSON.stringify(detailActions) === JSON.stringify(["ปิดรายงาน", "ซ่อนชั่วคราว", "ซ่อนถาวร"]),
        JSON.stringify(detailActions));
    const modalOpened2 = await openActionFromDetail(page, "RCO-711", "ปิดรายงาน");
    log("Close from detail opens modal", modalOpened2);
    await confirmModal(page);
    const detailAfterClose = await getDetailState(page);
    log("Detail after Close: status=Closed", detailAfterClose && detailAfterClose.pills.includes("Closed"), JSON.stringify(detailAfterClose?.pills));
    log("Detail after Close: NO action buttons", detailAfterClose && detailAfterClose.actions.length === 0, JSON.stringify(detailAfterClose?.actions));
    log("Detail after Close: audit history has new row", detailAfterClose && detailAfterClose.lastAuditRow && detailAfterClose.lastAuditRow.length > 0, JSON.stringify(detailAfterClose?.lastAuditRow));

    // ===== TEST 2: Hide comment (from list) =====
    console.log("\n--- TEST 2: Hide comment (from list) ---");
    await resetCase(page, "RCO-711");
    const modalHide = await openActionFromRow(page, "RCO-711", "ซ่อนชั่วคราว");
    log("Hide action opens modal", modalHide);
    const hideInfo = await getModalInfo(page);
    log("Hide modal title = 'ซ่อนความคิดเห็นชั่วคราว'", hideInfo.title === "ซ่อนความคิดเห็นชั่วคราว", hideInfo.title);
    log("Hide reason count = 4", hideInfo.reasonCount === 4, `got ${hideInfo.reasonCount}`);
    const hideEmailNote = await page.locator('.user-action-impact-notice').count();
    log("Hide: email note shown (1)", hideEmailNote === 1, `count=${hideEmailNote}`);
    const hideEmailPreview = await page.locator('[data-reported-comment-action-email-preview]').count();
    log("Hide: email preview shown (1)", hideEmailPreview === 1, `count=${hideEmailPreview}`);
    await confirmModal(page);
    const row711AfterHide = await getRowState(page, "RCO-711");
    log("RCO-711 after Hide: commentStatus=Hidden (pill 'ซ่อนชั่วคราว')", row711AfterHide && row711AfterHide.pills.some(p => p.includes("ซ่อนชั่วคราว")), JSON.stringify(row711AfterHide?.pills));
    log("RCO-711 after Hide: report still Pending", row711AfterHide && row711AfterHide.pills.includes("Pending"), JSON.stringify(row711AfterHide?.pills));
    const actionsAfterHide = await getRowActionLabels(page, "RCO-711");
    log("RCO-711 after Hide: row actions = [ยกเลิกการซ่อนชั่วคราว, ซ่อนถาวร]",
        JSON.stringify(actionsAfterHide) === JSON.stringify(["ยกเลิกการซ่อนชั่วคราว", "ซ่อนถาวร"]),
        JSON.stringify(actionsAfterHide));

    // Hide from detail
    await resetCase(page, "RCO-711");
    await openDetail(page, "RCO-711");
    const modalHideDetail = await openActionFromDetail(page, "RCO-711", "ซ่อนชั่วคราว");
    log("Hide from detail opens modal", modalHideDetail);
    await confirmModal(page);
    const detailAfterHide = await getDetailState(page);
    log("Detail after Hide: commentStatus=Hidden", detailAfterHide && detailAfterHide.pills.some(p => p.includes("ซ่อนชั่วคราว")), JSON.stringify(detailAfterHide?.pills));
    log("Detail after Hide: report still Pending", detailAfterHide && detailAfterHide.pills.includes("Pending"), JSON.stringify(detailAfterHide?.pills));
    log("Detail after Hide: actions = [ยกเลิกการซ่อนชั่วคราว, ซ่อนถาวร]",
        detailAfterHide && JSON.stringify(detailAfterHide.actions) === JSON.stringify(["ยกเลิกการซ่อนชั่วคราว", "ซ่อนถาวร"]),
        JSON.stringify(detailAfterHide?.actions));

    // ===== TEST 3: Remove comment (from list, Visible) =====
    console.log("\n--- TEST 3: Remove comment (from list, Visible) ---");
    await resetCase(page, "RCO-711");
    const modalRemove = await openActionFromRow(page, "RCO-711", "ซ่อนถาวร");
    log("Remove action opens modal", modalRemove);
    const removeInfo = await getModalInfo(page);
    log("Remove modal title = 'ซ่อนความคิดเห็นถาวร'", removeInfo.title === "ซ่อนความคิดเห็นถาวร", removeInfo.title);
    log("Remove reason count = 3", removeInfo.reasonCount === 3, `got ${removeInfo.reasonCount}`);
    const removeEmailNote = await page.locator('.user-action-impact-notice').count();
    log("Remove: email note shown (1)", removeEmailNote === 1, `count=${removeEmailNote}`);
    await confirmModal(page);
    const row711AfterRemove = await getRowState(page, "RCO-711");
    log("RCO-711 after Remove: commentStatus=Removed (pill 'ซ่อนถาวร')", row711AfterRemove && row711AfterRemove.pills.some(p => p.includes("ซ่อนถาวร")), JSON.stringify(row711AfterRemove?.pills));
    log("RCO-711 after Remove: report=Closed", row711AfterRemove && row711AfterRemove.pills.includes("Closed"), JSON.stringify(row711AfterRemove?.pills));
    const actionsAfterRemove = await getRowActionLabels(page, "RCO-711");
    log("RCO-711 after Remove: row actions = [] (empty)", Array.isArray(actionsAfterRemove) && actionsAfterRemove.length === 0, JSON.stringify(actionsAfterRemove));

    // Remove from detail (Hidden state)
    console.log("\n--- TEST 3b: Remove comment (from detail, after Hide) ---");
    await resetCase(page, "RCO-711");
    await openActionFromRow(page, "RCO-711", "ซ่อนชั่วคราว");
    await confirmModal(page);
    // Now Hidden, open detail
    await openDetail(page, "RCO-711");
    const detailActionsHidden = await page.locator('.reported-comment-detail-page .user-detail-actions [data-reported-comment-action]').allTextContents();
    log("Detail (Hidden): actions = [ยกเลิกการซ่อนชั่วคราว, ซ่อนถาวร]",
        JSON.stringify(detailActionsHidden) === JSON.stringify(["ยกเลิกการซ่อนชั่วคราว", "ซ่อนถาวร"]),
        JSON.stringify(detailActionsHidden));
    await openActionFromDetail(page, "RCO-711", "ซ่อนถาวร");
    const removeInfoHidden = await getModalInfo(page);
    log("Remove (from Hidden) modal title = 'ซ่อนความคิดเห็นถาวร'", removeInfoHidden.title === "ซ่อนความคิดเห็นถาวร", removeInfoHidden.title);
    log("Remove (from Hidden) reason count = 3", removeInfoHidden.reasonCount === 3, `got ${removeInfoHidden.reasonCount}`);
    await confirmModal(page);
    const detailAfterRemoveHidden = await getDetailState(page);
    log("Detail after Remove (Hidden): commentStatus=Removed", detailAfterRemoveHidden && detailAfterRemoveHidden.pills.some(p => p.includes("ซ่อนถาวร")), JSON.stringify(detailAfterRemoveHidden?.pills));
    log("Detail after Remove (Hidden): report=Closed", detailAfterRemoveHidden && detailAfterRemoveHidden.pills.includes("Closed"), JSON.stringify(detailAfterRemoveHidden?.pills));
    log("Detail after Remove (Hidden): actions = []", detailAfterRemoveHidden && detailAfterRemoveHidden.actions.length === 0, JSON.stringify(detailAfterRemoveHidden?.actions));

    // ===== TEST 4: Restore comment (from list) =====
    console.log("\n--- TEST 4: Restore comment (from list) ---");
    await resetCase(page, "RCO-711");
    await openActionFromRow(page, "RCO-711", "ซ่อนชั่วคราว");
    await confirmModal(page);
    // Now Hidden, open Restore
    const modalRestore = await openActionFromRow(page, "RCO-711", "ยกเลิกการซ่อนชั่วคราว");
    log("Restore action opens modal", modalRestore);
    const restoreInfo = await getModalInfo(page);
    log("Restore modal title = 'ยกเลิกการซ่อนชั่วคราว'", restoreInfo.title === "ยกเลิกการซ่อนชั่วคราว", restoreInfo.title);
    log("Restore reason count = 3", restoreInfo.reasonCount === 3, `got ${restoreInfo.reasonCount}`);
    const restoreEmailNote = await page.locator('.user-action-impact-notice').count();
    log("Restore: email note shown (1)", restoreEmailNote === 1, `count=${restoreEmailNote}`);
    await confirmModal(page);
    const row711AfterRestore = await getRowState(page, "RCO-711");
    log("RCO-711 after Restore: commentStatus=Visible (no Hidden pill)", row711AfterRestore && !row711AfterRestore.pills.some(p => p.includes("ซ่อน")), JSON.stringify(row711AfterRestore?.pills));
    log("RCO-711 after Restore: report=Closed", row711AfterRestore && row711AfterRestore.pills.includes("Closed"), JSON.stringify(row711AfterRestore?.pills));
    const actionsAfterRestore = await getRowActionLabels(page, "RCO-711");
    log("RCO-711 after Restore: row actions = [] (empty)", Array.isArray(actionsAfterRestore) && actionsAfterRestore.length === 0, JSON.stringify(actionsAfterRestore));

    // Restore from detail
    console.log("\n--- TEST 4b: Restore comment (from detail) ---");
    await resetCase(page, "RCO-711");
    await openActionFromRow(page, "RCO-711", "ซ่อนชั่วคราว");
    await confirmModal(page);
    await openDetail(page, "RCO-711");
    const modalRestoreDetail = await openActionFromDetail(page, "RCO-711", "ยกเลิกการซ่อนชั่วคราว");
    log("Restore from detail opens modal", modalRestoreDetail);
    await confirmModal(page);
    const detailAfterRestore = await getDetailState(page);
    log("Detail after Restore: commentStatus=Visible (no Hidden pill)", detailAfterRestore && !detailAfterRestore.pills.some(p => p.includes("ซ่อน")), JSON.stringify(detailAfterRestore?.pills));
    log("Detail after Restore: report=Closed", detailAfterRestore && detailAfterRestore.pills.includes("Closed"), JSON.stringify(detailAfterRestore?.pills));
    log("Detail after Restore: actions = []", detailAfterRestore && detailAfterRestore.actions.length === 0, JSON.stringify(detailAfterRestore?.actions));

    // ===== TEST 5: Flow sequences =====
    console.log("\n--- TEST 5: Flow sequences ---");
    // Visible → Hidden → Removed
    await resetCase(page, "RCO-711");
    await openActionFromRow(page, "RCO-711", "ซ่อนชั่วคราว");
    await confirmModal(page);
    let state = await getRowState(page, "RCO-711");
    log("Flow V→H→R: after Hide = Hidden+Pending", state && state.pills.some(p => p.includes("ซ่อนชั่วคราว")) && state.pills.includes("Pending"), JSON.stringify(state?.pills));
    await openActionFromRow(page, "RCO-711", "ซ่อนถาวร");
    await confirmModal(page);
    state = await getRowState(page, "RCO-711");
    log("Flow V→H→R: after Remove = Removed+Closed", state && state.pills.some(p => p.includes("ซ่อนถาวร")) && state.pills.includes("Closed"), JSON.stringify(state?.pills));

    // Visible → Hidden → Visible (Restore)
    await resetCase(page, "RCO-711");
    await openActionFromRow(page, "RCO-711", "ซ่อนชั่วคราว");
    await confirmModal(page);
    await openActionFromRow(page, "RCO-711", "ยกเลิกการซ่อนชั่วคราว");
    await confirmModal(page);
    state = await getRowState(page, "RCO-711");
    log("Flow V→H→V: after Restore = Visible+Closed", state && !state.pills.some(p => p.includes("ซ่อน")) && state.pills.includes("Closed"), JSON.stringify(state?.pills));

    // Visible → Closed (Close without hide)
    await resetCase(page, "RCO-711");
    await openActionFromRow(page, "RCO-711", "ปิดรายงาน");
    await confirmModal(page);
    state = await getRowState(page, "RCO-711");
    log("Flow V→Closed: after Close = Visible+Closed", state && !state.pills.some(p => p.includes("ซ่อน")) && state.pills.includes("Closed"), JSON.stringify(state?.pills));

    // Hidden → Closed (via Remove)
    await resetCase(page, "RCO-711");
    await openActionFromRow(page, "RCO-711", "ซ่อนชั่วคราว");
    await confirmModal(page);
    await openActionFromRow(page, "RCO-711", "ซ่อนถาวร");
    await confirmModal(page);
    state = await getRowState(page, "RCO-711");
    log("Flow H→Closed (via Remove): = Removed+Closed", state && state.pills.some(p => p.includes("ซ่อนถาวร")) && state.pills.includes("Closed"), JSON.stringify(state?.pills));

    // ===== TEST 6: Audit history accumulates =====
    console.log("\n--- TEST 6: Audit history accumulates ---");
    await resetCase(page, "RCO-711");
    await openDetail(page, "RCO-711");
    // Initial audit count = 1 (Report Received)
    let auditRows = await page.locator('.reported-comment-detail-page .asset-status-history-table tbody tr').count();
    log("Initial audit history = 1 row (Report Received)", auditRows === 1, `count=${auditRows}`);
    await openActionFromDetail(page, "RCO-711", "ซ่อนชั่วคราว");
    await confirmModal(page);
    auditRows = await page.locator('.reported-comment-detail-page .asset-status-history-table tbody tr').count();
    log("After Hide: audit history = 2 rows", auditRows === 2, `count=${auditRows}`);
    await openActionFromDetail(page, "RCO-711", "ซ่อนถาวร");
    await confirmModal(page);
    auditRows = await page.locator('.reported-comment-detail-page .asset-status-history-table tbody tr').count();
    log("After Remove: audit history = 3 rows", auditRows === 3, `count=${auditRows}`);

  } catch (err) {
    console.error("ERROR:", err.message);
    console.error(err.stack);
  } finally {
    await browser.close();
    const passed = results.filter(r => r.ok).length;
    const failed = results.filter(r => !r.ok).length;
    console.log(`\n=== SUMMARY: ${passed} passed, ${failed} failed ===`);
    if (failed > 0) {
      console.log("\nFailures:");
      results.filter(r => !r.ok).forEach(r => console.log(`  - ${r.label}${r.detail ? ` :: ${r.detail}` : ""}`));
    }
  }
}

main();
