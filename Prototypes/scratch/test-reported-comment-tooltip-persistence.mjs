// Regression test: comment hover tooltip should NOT persist when navigating to detail page.
// Bug: hovering comment cell shows tooltip; clicking row to open detail left tooltip visible on detail page.
// Fix: hideCommentHoverTooltip() + clearTimeout called before renderReportedCommentDetail().

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
  const navItem = page.locator('.nav-item[data-module="assets"]').first();
  const isExpanded = await navItem.getAttribute('aria-expanded');
  if (isExpanded !== 'true') {
    await navItem.click();
    await page.waitForTimeout(200);
  }
  await page.locator('.submenu button[data-module="assets"][data-sub="Reported Comments"]').first().click();
  await page.waitForTimeout(400);
  await page.waitForSelector('[data-reported-comment-card]', { timeout: 5000 });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await login(page);
  await openReportedComments(page);

  // Find the Comment cell with data-comment-full on first row
  const commentCell = page.locator(".reported-comment-table .user-row.reported-comment-row:not(.head) > div[data-label='Comment'][data-comment-full]").first();
  const cellExists = await commentCell.count() > 0;
  log("Comment cell with data-comment-full exists", cellExists, "");

  if (!cellExists) {
    console.log("FATAL: no comment cell found");
    await browser.close();
    process.exit(2);
  }

  // Step 1: Hover the comment cell — tooltip should appear
  await commentCell.scrollIntoViewIfNeeded();
  await commentCell.hover();
  await page.waitForTimeout(200); // wait for mouseover + showCommentHoverTooltip

  const tooltipVisibleAfterHover = await page.evaluate(() => {
    const t = document.querySelector('.comment-hover-tooltip');
    if (!t) return false;
    return t.classList.contains('is-visible');
  });
  log("Tooltip visible after hovering comment cell", tooltipVisibleAfterHover, "");

  // Step 2: Click the row (not the cell, the row card) to open detail
  // Use the row element (data-reported-comment-card) but click on a non-interactive area
  const firstRowId = await page.locator('[data-reported-comment-card]').first().getAttribute('data-reported-comment-card');
  // Click on the Report ID cell (non-interactive, opens detail)
  const reportIdCell = page.locator(`[data-reported-comment-card="${firstRowId}"] > div[data-label="Report ID"]`).first();
  await reportIdCell.click();
  await page.waitForTimeout(500); // wait for detail page render

  // Step 3: Check tooltip is HIDDEN on detail page
  const detailVisible = await page.locator('.reported-comment-detail-page').count() > 0;
  log("Detail page opened after row click", detailVisible, `reportId=${firstRowId}`);

  const tooltipVisibleOnDetail = await page.evaluate(() => {
    const t = document.querySelector('.comment-hover-tooltip');
    if (!t) return false;
    return t.classList.contains('is-visible');
  });
  log("Tooltip HIDDEN on detail page (bug fix)", !tooltipVisibleOnDetail, `is-visible=${tooltipVisibleOnDetail}`);

  // Step 4: Navigate back to list via the "Back to list" button on detail page, then test row-menu path
  // Find back button on detail page
  const backBtn = page.locator('[data-back-to-reported-comments-list]').first();
  if (await backBtn.count()) {
    await backBtn.click();
    await page.waitForTimeout(400);
  } else {
    // Fallback: re-navigate via menu
    await openReportedComments(page);
  }
  const backOnList = await page.locator('[data-reported-comment-card]').first().count() > 0;
  if (!backOnList) {
    await openReportedComments(page);
  }

  // Hover comment cell again
  const commentCell2 = page.locator(".reported-comment-table .user-row.reported-comment-row:not(.head) > div[data-label='Comment'][data-comment-full]").first();
  await commentCell2.scrollIntoViewIfNeeded();
  await commentCell2.hover();
  await page.waitForTimeout(200);

  const tooltipVisibleAfterHover2 = await page.evaluate(() => {
    const t = document.querySelector('.comment-hover-tooltip');
    return t ? t.classList.contains('is-visible') : false;
  });
  log("Tooltip visible after hovering comment cell (2nd round)", tooltipVisibleAfterHover2, "");

  // Open row menu and click "ดูรายละเอียด"
  const rowMenu = page.locator('[data-reported-comment-card]').first().locator('details.row-menu').first();
  await rowMenu.locator('summary').click();
  await page.waitForTimeout(150);
  const detailBtn = rowMenu.locator('[data-reported-comment-open]').first();
  await detailBtn.click();
  await page.waitForTimeout(500);

  const detailVisible2 = await page.locator('.reported-comment-detail-page').count() > 0;
  log("Detail page opened via row-menu button", detailVisible2, "");

  const tooltipVisibleOnDetail2 = await page.evaluate(() => {
    const t = document.querySelector('.comment-hover-tooltip');
    return t ? t.classList.contains('is-visible') : false;
  });
  log("Tooltip HIDDEN on detail page (via row-menu path)", !tooltipVisibleOnDetail2, `is-visible=${tooltipVisibleOnDetail2}`);

  // ===== SUMMARY =====
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  console.log(`\n========== SUMMARY ==========`);
  console.log(`Passed: ${passed}, Failed: ${failed}, Total: ${results.length}`);
  if (failed > 0) {
    console.log(`\n--- FAILED TESTS ---`);
    results.filter(r => !r.ok).forEach(r => console.log(`  [FAIL] ${r.label}${r.detail ? ` :: ${r.detail}` : ""}`));
  }

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error("Fatal error:", err);
  process.exit(2);
});
