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
  await page.goto(URL);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForSelector('#login-form:not(.hidden)', { timeout: 5000 });
  await page.locator('#login-form button[type="submit"]').click();
  await page.waitForTimeout(300);
  await page.waitForTimeout(500);
  await page.waitForSelector('#login-screen', { state: 'hidden', timeout: 5000 });
}

async function openReportedComments(page) {
  await page.locator('.nav-item[data-module="assets"]').first().click();
  await page.waitForTimeout(200);
  await page.locator('.submenu button[data-module="assets"][data-sub="Reported Comments"]').first().click();
  await page.waitForTimeout(300);
  await page.waitForSelector('[data-reported-comment-card]', { timeout: 5000 });
}

async function reset(page) {
  await login(page);
  await openReportedComments(page);
}

async function openActionFromRow(page, reportId, actionLabel) {
  const row = page.locator(`[data-reported-comment-card="${reportId}"]`).first();
  const menu = row.locator('details.row-menu').first();
  await menu.locator('summary').click();
  await page.waitForTimeout(100);
  const btn = menu.locator(`[data-reported-comment-action]`).filter({ hasText: actionLabel }).first();
  await btn.click();
  await page.waitForTimeout(300);
  return await page.locator('#user-action-modal').isVisible();
}

async function selectScenario(page, scenarioValue) {
  // Open the prototype-tools details
  const details = page.locator('details.user-action-prototype-tools').first();
  if (await details.count()) {
    const isOpen = await details.evaluate(el => el.hasAttribute('open'));
    if (!isOpen) {
      await details.locator('summary').click();
      await page.waitForTimeout(100);
    }
  }
  // Set hidden input value via evaluate then dispatch change
  await page.evaluate((val) => {
    const input = document.querySelector('#reported-comment-action-scenario');
    if (!input) return;
    input.value = val;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    // Also update the custom-select trigger label
    const select = input.closest('[data-custom-select]');
    if (select) {
      const option = select.querySelector(`[data-custom-select-option][data-value="${val}"]`);
      const trigger = select.querySelector('[data-custom-select-trigger]');
      if (option && trigger) trigger.textContent = option.textContent.trim();
    }
  }, scenarioValue);
  await page.waitForTimeout(150);
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

async function getRowPills(page, reportId) {
  const row = page.locator(`[data-reported-comment-card="${reportId}"]`).first();
  if (!(await row.count())) return [];
  return await row.locator('.pill').allTextContents();
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Toast observer: capture toast show/hide events
  let toastShown = false;
  let toastMessage = "";
  let toastHiddenAfter = 0;
  page.on('console', msg => { /* ignore */ });

  try {
    await reset(page);
    log("Setup: login + open Reported Comments", true);

    // ============================================================
    // SUCCESS SCENARIOS — 4 actions
    // ============================================================
    console.log("\n=== SUCCESS: Close no violation ===");
    await openActionFromRow(page, "RCO-711", "ปิดรายงาน");
    const closeImpact = await page.locator('.user-action-impact-warning').count();
    log("Close: impact note (warning) shown", closeImpact === 1, `count=${closeImpact}`);
    const closeEmailNote = await page.locator('.user-action-impact-notice').count();
    log("Close: NO email note (notice)", closeEmailNote === 0, `count=${closeEmailNote}`);
    const closeEmailPreview = await page.locator('[data-reported-comment-action-email-preview]').count();
    log("Close: NO email preview", closeEmailPreview === 0, `count=${closeEmailPreview}`);

    // Capture toast after confirm
    await page.evaluate(() => {
      window.__toastEvents = [];
      const toast = document.querySelector('#success-toast');
      if (!toast) return;
      const obs = new MutationObserver(() => {
        window.__toastEvents.push({ classes: toast.className, t: Date.now() });
      });
      obs.observe(toast, { attributes: true, attributeFilter: ['class'] });
    });
    await confirmModal(page);
    const closeToast = await page.evaluate(() => {
      const toast = document.querySelector('#success-toast');
      return { shown: toast?.classList.contains('show'), text: toast?.textContent || "" };
    });
    log("Close: success toast shown (green)", Boolean(closeToast.shown), `text="${closeToast.text.trim().substring(0, 80)}"`);
    log("Close: toast mentions 'ปิดรายงาน'", closeToast.text.includes("ปิดรายงาน"), closeToast.text.trim().substring(0, 80));
    // Wait to check toast auto-hide
    await page.waitForTimeout(3500);
    const closeToastAfter = await page.evaluate(() => {
      const toast = document.querySelector('#success-toast');
      return { shown: toast?.classList.contains('show') };
    });
    log("Close: toast auto-hide after 3.2s", !closeToastAfter.shown, `shown=${closeToastAfter.shown}`);
    const closePills = await getRowPills(page, "RCO-711");
    log("Close: report status = Closed", closePills.includes("Closed"), JSON.stringify(closePills));
    log("Close: comment status unchanged (no Hidden/Removed pill)", !closePills.some(p => p.includes("ซ่อน") || p.includes("ลบ")), JSON.stringify(closePills));

    console.log("\n=== SUCCESS: Hide comment ===");
    await reset(page);
    await openActionFromRow(page, "RCO-711", "ซ่อนชั่วคราว");
    const hideImpact = await page.locator('.user-action-impact-warning').count();
    log("Hide: impact note (warning) shown", hideImpact === 1, `count=${hideImpact}`);
    const hideEmailNote = await page.locator('.user-action-impact-notice').count();
    log("Hide: email note (notice) shown", hideEmailNote === 1, `count=${hideEmailNote}`);
    const hideEmailPreview = await page.locator('[data-reported-comment-action-email-preview]').count();
    log("Hide: email preview shown", hideEmailPreview === 1, `count=${hideEmailPreview}`);
    await confirmModal(page);
    const hideToast = await page.evaluate(() => {
      const toast = document.querySelector('#success-toast');
      return { shown: toast?.classList.contains('show'), text: toast?.textContent || "" };
    });
    log("Hide: success toast shown", Boolean(hideToast.shown), hideToast.text.trim().substring(0, 80));
    const hidePills = await getRowPills(page, "RCO-711");
    log("Hide: commentStatus = Hidden (ซ่อนชั่วคราว)", hidePills.some(p => p.includes("ซ่อนชั่วคราว")), JSON.stringify(hidePills));
    log("Hide: report still Pending", hidePills.includes("Pending"), JSON.stringify(hidePills));

    console.log("\n=== SUCCESS: Remove comment ===");
    await reset(page);
    await openActionFromRow(page, "RCO-711", "ซ่อนถาวร");
    const removeImpact = await page.locator('.user-action-impact-warning').count();
    log("Remove: impact note (warning) shown", removeImpact === 1, `count=${removeImpact}`);
    const removeEmailNote = await page.locator('.user-action-impact-notice').count();
    log("Remove: email note (notice) shown", removeEmailNote === 1, `count=${removeEmailNote}`);
    const removeEmailPreview = await page.locator('[data-reported-comment-action-email-preview]').count();
    log("Remove: email preview shown", removeEmailPreview === 1, `count=${removeEmailPreview}`);
    await confirmModal(page);
    const removeToast = await page.evaluate(() => {
      const toast = document.querySelector('#success-toast');
      return { shown: toast?.classList.contains('show'), text: toast?.textContent || "" };
    });
    log("Remove: success toast shown", Boolean(removeToast.shown), removeToast.text.trim().substring(0, 80));
    const removePills = await getRowPills(page, "RCO-711");
    log("Remove: commentStatus = Removed (ซ่อนถาวร)", removePills.some(p => p.includes("ซ่อนถาวร")), JSON.stringify(removePills));
    log("Remove: report = Closed", removePills.includes("Closed"), JSON.stringify(removePills));

    console.log("\n=== SUCCESS: Restore comment ===");
    await reset(page);
    await openActionFromRow(page, "RCO-711", "ซ่อนชั่วคราว");
    await confirmModal(page);
    // Now Hidden, open Restore
    await openActionFromRow(page, "RCO-711", "ยกเลิกการซ่อนชั่วคราว");
    const restoreImpact = await page.locator('.user-action-impact-warning').count();
    log("Restore: impact note (warning) shown", restoreImpact === 1, `count=${restoreImpact}`);
    const restoreEmailNote = await page.locator('.user-action-impact-notice').count();
    log("Restore: email note (notice) shown", restoreEmailNote === 1, `count=${restoreEmailNote}`);
    const restoreEmailPreview = await page.locator('[data-reported-comment-action-email-preview]').count();
    log("Restore: email preview shown", restoreEmailPreview === 1, `count=${restoreEmailPreview}`);
    await confirmModal(page);
    const restoreToast = await page.evaluate(() => {
      const toast = document.querySelector('#success-toast');
      return { shown: toast?.classList.contains('show'), text: toast?.textContent || "" };
    });
    log("Restore: success toast shown", Boolean(restoreToast.shown), restoreToast.text.trim().substring(0, 80));
    const restorePills = await getRowPills(page, "RCO-711");
    log("Restore: commentStatus = Visible (no Hidden pill)", !restorePills.some(p => p.includes("ซ่อน")), JSON.stringify(restorePills));
    log("Restore: report = Closed", restorePills.includes("Closed"), JSON.stringify(restorePills));

    // ============================================================
    // ERROR SCENARIOS — 6 scenarios (each action × each error)
    // Test with Hide action as representative (has impact note + email)
    // ============================================================
    const errorScenarios = [
      { value: "invalid_state", label: "invalid_state" },
      { value: "stale_data", label: "stale_data" },
      { value: "policy_blocked", label: "policy_blocked" },
      { value: "save_failed", label: "save_failed" },
      { value: "audit_failed", label: "audit_failed" },
      { value: "session_expired", label: "session_expired" }
    ];

    for (const scenario of errorScenarios) {
      console.log(`\n=== ERROR: ${scenario.label} (Hide action) ===`);
      await reset(page);
      const pillsBefore = await getRowPills(page, "RCO-711");
      await openActionFromRow(page, "RCO-711", "ซ่อนชั่วคราว");
      await selectScenario(page, scenario.value);
      await confirmModal(page);
      // After error: modal should re-render with error message
      const errorBox = await page.locator('.action-feedback.user-action-result.show.error').count();
      log(`${scenario.label}: error feedback box shown (red)`, errorBox === 1, `count=${errorBox}`);
      const errorText = await page.locator('.action-feedback.user-action-result.show.error').first().textContent().catch(() => "");
      log(`${scenario.label}: error box has content`, Boolean(errorText && errorText.trim().length > 0), errorText.trim().substring(0, 80));
      // Status must NOT change
      const pillsAfter = await getRowPills(page, "RCO-711");
      log(`${scenario.label}: report status unchanged (still Pending)`, pillsAfter.includes("Pending"), `before=${JSON.stringify(pillsBefore)} after=${JSON.stringify(pillsAfter)}`);
      log(`${scenario.label}: comment status unchanged (no Hidden pill)`, !pillsAfter.some(p => p.includes("ซ่อน")), JSON.stringify(pillsAfter));
      // No success toast
      const toastVisible = await page.evaluate(() => {
        const toast = document.querySelector('#success-toast');
        return toast?.classList.contains('show') || false;
      });
      log(`${scenario.label}: NO success toast`, !toastVisible, `shown=${toastVisible}`);
      // Impact note + email note + email preview still present (consistent with other report menus)
      const impactAfterError = await page.locator('.user-action-impact-warning').count();
      log(`${scenario.label}: impact note still shown (consistent with other menus)`, impactAfterError === 1, `count=${impactAfterError}`);
      await closeModal(page);
    }

    // ============================================================
    // Error scenarios with Close action — verify no email note ever
    // ============================================================
    console.log("\n=== ERROR + Close: invalid_state ===");
    await reset(page);
    await openActionFromRow(page, "RCO-711", "ปิดรายงาน");
    await selectScenario(page, "invalid_state");
    await confirmModal(page);
    const closeErrEmailNote = await page.locator('.user-action-impact-notice').count();
    log("Close+error: NO email note", closeErrEmailNote === 0, `count=${closeErrEmailNote}`);
    const closeErrImpact = await page.locator('.user-action-impact-warning').count();
    log("Close+error: impact note shown", closeErrImpact === 1, `count=${closeErrImpact}`);
    const closeErrErrorBox = await page.locator('.action-feedback.user-action-result.show.error').count();
    log("Close+error: error feedback shown", closeErrErrorBox === 1, `count=${closeErrErrorBox}`);
    const closeErrPills = await getRowPills(page, "RCO-711");
    log("Close+error: status unchanged (Pending)", closeErrPills.includes("Pending"), JSON.stringify(closeErrPills));
    await closeModal(page);

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
