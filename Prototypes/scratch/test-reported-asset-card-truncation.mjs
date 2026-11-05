// Test: Reported Assets mobile card fields (Asset, Report reason) should be truncated with ellipsis
// and have equal proportions (50% max width) like Reported Comments.
// Scoped to .reported-assets-table only — must not affect other pages.

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

async function openReportedAssets(page) {
  const navItem = page.locator('.nav-item[data-module="assets"]').first();
  const isExpanded = await navItem.getAttribute('aria-expanded');
  if (isExpanded !== 'true') { await navItem.click(); await page.waitForTimeout(200); }
  await page.locator('.submenu button[data-module="assets"][data-sub="Reported Assets"]').first().click();
  await page.waitForTimeout(400);
  await page.waitForSelector('.reported-assets-table .user-row.report-row:not(.head)', { timeout: 5000 });
}

async function getCardFieldMetrics(page) {
  return await page.evaluate(() => {
    const card = document.querySelector('.reported-assets-table .user-row.report-row:not(.head)');
    if (!card) return null;
    const cardRect = card.getBoundingClientRect();
    const fields = card.querySelectorAll('.user-card-meta-item');
    return {
      cardWidth: Math.round(cardRect.width),
      fields: Array.from(fields).map(f => {
        const span = f.querySelector('span');
        const strong = f.querySelector('strong');
        const cs = strong ? window.getComputedStyle(strong) : null;
        const fCs = window.getComputedStyle(f);
        const spanRect = span.getBoundingClientRect();
        const strongRect = strong.getBoundingClientRect();
        return {
          label: span ? span.textContent.trim() : null,
          className: f.className,
          gridColumns: fCs.gridTemplateColumns,
          labelWidth: Math.round(spanRect.width),
          valueWidth: Math.round(strongRect.width),
          scrollWidth: strong ? strong.scrollWidth : null,
          clientWidth: strong ? strong.clientWidth : null,
          isTruncated: strong ? (strong.scrollWidth > strong.clientWidth + 1) : false,
          whiteSpace: cs ? cs.whiteSpace : null,
          overflow: cs ? cs.overflow : null,
          textOverflow: cs ? cs.textOverflow : null,
          height: Math.round(strongRect.height),
        };
      }),
    };
  });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await login(page);
  await openReportedAssets(page);

  for (const bp of [{ w: 414, name: "Mobile 414" }, { w: 375, name: "Mobile 375" }, { w: 320, name: "Mobile 320" }]) {
    await page.setViewportSize({ width: bp.w, height: 900 });
    await page.waitForTimeout(300);
    console.log(`\n--- ${bp.name} ---`);
    const data = await getCardFieldMetrics(page);
    if (!data) { log(`${bp.name}: card found`, false); continue; }
    console.log(`  card width: ${data.cardWidth}px`);
    const valueWidths = [];
    for (const f of data.fields) {
      console.log(`  ${f.label}: grid=${f.gridColumns} label=${f.labelWidth}px value=${f.valueWidth}px (scroll=${f.scrollWidth}) truncated=${f.isTruncated} whiteSpace=${f.whiteSpace} textOverflow=${f.textOverflow} h=${f.height}`);
      const isCommentField = f.className.includes('comment-field-meta');
      if (isCommentField) {
        log(`${bp.name}: ${f.label} whiteSpace=nowrap`, f.whiteSpace === "nowrap", `got ${f.whiteSpace}`);
        log(`${bp.name}: ${f.label} overflow=hidden`, f.overflow === "hidden", `got ${f.overflow}`);
        log(`${bp.name}: ${f.label} textOverflow=ellipsis`, f.textOverflow === "ellipsis", `got ${f.textOverflow}`);
        log(`${bp.name}: ${f.label} single line (≤20px)`, f.height <= 20, `h=${f.height}`);
        valueWidths.push(f.valueWidth);
      }
    }
    // Verify Asset and Report reason have equal widths
    if (valueWidths.length >= 2) {
      log(`${bp.name}: Asset and Report reason equal width`, valueWidths[0] === valueWidths[1], `${valueWidths[0]} vs ${valueWidths[1]}`);
    }
  }

  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  console.log(`\n========== SUMMARY ==========`);
  console.log(`Passed: ${passed}, Failed: ${failed}, Total: ${results.length}`);
  if (failed > 0) {
    results.filter(r => !r.ok).forEach(r => console.log(`  [FAIL] ${r.label}${r.detail ? ` :: ${r.detail}` : ""}`));
  }
  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}
run().catch(e => { console.error(e); process.exit(2); });
