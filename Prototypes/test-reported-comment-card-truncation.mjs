// Test: Reported Comments mobile card fields (Comment, Asset, Report reason) should be truncated with ellipsis
// instead of wrapping to multiple lines. Scoped to .reported-comment-table only — must not affect other pages.

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
  await page.waitForSelector('#otp-form:not(.hidden)', { timeout: 5000 });
  await page.locator('#verify-otp-btn').click();
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

async function getCardFieldMetrics(page) {
  return await page.evaluate(() => {
    const card = document.querySelector('[data-reported-comment-card]');
    if (!card) return null;
    const fields = card.querySelectorAll('.user-card-meta-item.comment-text-meta');
    return Array.from(fields).map(f => {
      const span = f.querySelector('span');
      const strong = f.querySelector('strong');
      const cs = strong ? window.getComputedStyle(strong) : null;
      const rect = strong ? strong.getBoundingClientRect() : null;
      return {
        label: span ? span.textContent.trim() : null,
        value: strong ? strong.textContent.trim() : null,
        whiteSpace: cs ? cs.whiteSpace : null,
        overflow: cs ? cs.overflow : null,
        textOverflow: cs ? cs.textOverflow : null,
        display: cs ? cs.display : null,
        width: cs ? cs.width : null,
        maxWidth: cs ? cs.maxWidth : null,
        scrollWidth: strong ? strong.scrollWidth : null,
        clientWidth: strong ? strong.clientWidth : null,
        isTruncated: strong ? (strong.scrollWidth > strong.clientWidth + 1) : false,
        height: rect ? Math.round(rect.height) : null,
      };
    });
  });
}

async function getReportedUsersCardFieldMetrics(page) {
  // Check that Reported Users card is NOT affected (should still wrap)
  return await page.evaluate(() => {
    const card = document.querySelector('.reported-users-table [data-reported-user-card], .reported-users-table .user-row.report-row:not(.head)');
    if (!card) return null;
    const reasonField = card.querySelector('.user-card-meta-item.report-reason-meta');
    if (!reasonField) return null;
    const strong = reasonField.querySelector('strong');
    const cs = strong ? window.getComputedStyle(strong) : null;
    return {
      label: reasonField.querySelector('span') ? reasonField.querySelector('span').textContent.trim() : null,
      whiteSpace: cs ? cs.whiteSpace : null,
      textOverflow: cs ? cs.textOverflow : null,
      overflow: cs ? cs.overflow : null,
    };
  });
}

async function openReportedUsers(page) {
  const navItem = page.locator('.nav-item[data-module="users"]').first();
  const isExpanded = await navItem.getAttribute('aria-expanded');
  if (isExpanded !== 'true') {
    await navItem.click();
    await page.waitForTimeout(200);
  }
  await page.locator('.submenu button[data-module="users"][data-sub="Reported Users"]').first().click();
  await page.waitForTimeout(400);
  await page.waitForSelector('.reported-users-table .user-row.report-row:not(.head)', { timeout: 5000 });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await login(page);
  await openReportedComments(page);

  // Test at multiple mobile breakpoints
  const mobileBreakpoints = [
    { w: 414, name: "Mobile 414" },
    { w: 375, name: "Mobile 375" },
    { w: 320, name: "Mobile 320" },
  ];

  for (const bp of mobileBreakpoints) {
    await page.setViewportSize({ width: bp.w, height: 900 });
    await page.waitForTimeout(300);

    console.log(`\n--- ${bp.name}: Card field truncation ---`);
    const fields = await getCardFieldMetrics(page);
    if (!fields || fields.length === 0) {
      log(`${bp.name}: card has comment-text-meta fields`, false, "no fields found");
      continue;
    }

    for (const field of fields) {
      console.log(`  ${field.label}: whiteSpace=${field.whiteSpace} overflow=${field.overflow} textOverflow=${field.textOverflow} display=${field.display} truncated=${field.isTruncated} height=${field.height}`);
      log(`${bp.name}: ${field.label} whiteSpace=nowrap`, field.whiteSpace === "nowrap", `got ${field.whiteSpace}`);
      log(`${bp.name}: ${field.label} overflow=hidden`, field.overflow === "hidden", `got ${field.overflow}`);
      log(`${bp.name}: ${field.label} textOverflow=ellipsis`, field.textOverflow === "ellipsis", `got ${field.textOverflow}`);
      // If text is long enough to overflow, it should be truncated
      if (field.isTruncated) {
        log(`${bp.name}: ${field.label} is truncated (scrollWidth > clientWidth)`, true, `scroll=${field.scrollWidth} client=${field.clientWidth}`);
      } else {
        log(`${bp.name}: ${field.label} fits without truncation`, true, `scroll=${field.scrollWidth} client=${field.clientWidth}`);
      }
      // Height should be single line (roughly 12px font * 1.35 line-height ≈ 16-18px)
      log(`${bp.name}: ${field.label} single line height (≤20px)`, field.height !== null && field.height <= 20, `height=${field.height}`);
    }
  }

  // ===== VERIFY Reported Users is NOT affected =====
  console.log(`\n--- Verify Reported Users NOT affected (Mobile 375) ---`);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(200);
  await openReportedUsers(page);
  await page.setViewportSize({ width: 375, height: 900 });
  await page.waitForTimeout(300);

  const ruField = await getReportedUsersCardFieldMetrics(page);
  if (ruField) {
    console.log(`  Reported Users report-reason: whiteSpace=${ruField.whiteSpace} textOverflow=${ruField.textOverflow} overflow=${ruField.overflow}`);
    // Reported Users uses scoped override that allows wrapping — should NOT be nowrap/ellipsis
    log(`Reported Users report-reason NOT truncated (no side effect)`, ruField.whiteSpace !== "nowrap" || ruField.textOverflow !== "ellipsis", `whiteSpace=${ruField.whiteSpace} textOverflow=${ruField.textOverflow}`);
  } else {
    log(`Reported Users card found`, false, "no card found");
  }

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
