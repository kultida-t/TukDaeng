// Test: all card meta fields across User Management, Offer, Content Management, Market Data
// Verifies: comment-field-meta class, grid 50%, nowrap, ellipsis, single line, equal widths
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("C:\\Users\\Admin\\AppData\\Local\\npm-cache\\_npx\\e41f203b7505f1fb\\node_modules\\playwright\\index.js");

const URL = "http://127.0.0.1:4173/";
const VIEWPORTS = [{ w: 414, name: "414" }, { w: 375, name: "375" }, { w: 320, name: "320" }];

let pass = 0, fail = 0;
const failures = [];

function assert(cond, msg) {
  if (cond) { pass++; }
  else { fail++; failures.push(msg); console.log(`  FAIL: ${msg}`); }
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

async function navigate(page, module, sub) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(200);
  const navItem = page.locator(`.nav-item[data-module="${module}"]`).first();
  const isExpanded = await navItem.getAttribute('aria-expanded');
  if (isExpanded !== 'true') { await navItem.click(); await page.waitForTimeout(200); }
  if (sub) {
    await page.locator(`.submenu button[data-module="${module}"][data-sub="${sub}"]`).first().click();
  } else {
    await navItem.click();
  }
  await page.waitForTimeout(500);
}

async function getCardFields(page) {
  return await page.evaluate(() => {
    const card = document.querySelector('[data-asset-card], [data-reported-comment-card], [data-offer-card], .user-row:not(.head), .asset-row:not(.head), .reported-users-table .user-row.report-row:not(.head)');
    if (!card) return null;
    const cardRect = card.getBoundingClientRect();
    const meta = card.querySelector('.user-card-meta');
    if (!meta) return { cardWidth: Math.round(cardRect.width), metaWidth: 0, hasMeta: false, fields: [] };
    const metaRect = meta.getBoundingClientRect();
    const fields = meta.querySelectorAll('.user-card-meta-item');
    return {
      cardWidth: Math.round(cardRect.width),
      metaWidth: Math.round(metaRect.width),
      hasMeta: true,
      fields: Array.from(fields).map(f => {
        const span = f.querySelector('span');
        const strong = f.querySelector('strong');
        const cs = strong ? window.getComputedStyle(strong) : null;
        const fCs = window.getComputedStyle(f);
        const strongRect = strong ? strong.getBoundingClientRect() : null;
        const spanRect = span ? span.getBoundingClientRect() : null;
        return {
          label: span ? span.textContent.trim() : null,
          hasCommentFieldMeta: f.classList.contains('comment-field-meta'),
          display: fCs.display,
          gridColumns: fCs.gridTemplateColumns,
          valueWidth: strongRect ? Math.round(strongRect.width) : null,
          valueHeight: strongRect ? Math.round(strongRect.height) : null,
          labelHeight: spanRect ? Math.round(spanRect.height) : null,
          whiteSpace: cs ? cs.whiteSpace : null,
          overflow: cs ? cs.overflow : null,
          textOverflow: cs ? cs.textOverflow : null,
          scrollWidth: strong ? strong.scrollWidth : null,
          clientWidth: strong ? strong.clientWidth : null,
        };
      }),
    };
  });
}

async function testPage(page, pageName, module, sub, expectedFieldCount, options = {}) {
  await navigate(page, module, sub);
  for (const bp of VIEWPORTS) {
    await page.setViewportSize({ width: bp.w, height: 900 });
    await page.waitForTimeout(300);
    const data = await getCardFields(page);
    if (!data) {
      assert(false, `${pageName} @ ${bp.name}: card not found`);
      continue;
    }
    if (!data.hasMeta) {
      assert(false, `${pageName} @ ${bp.name}: no user-card-meta`);
      continue;
    }
    const visibleFields = data.fields.filter(f => f.display !== 'none');
    if (options.skipHidden) {
      // For Sync History, "รายการ" is intentionally hidden
      assert(visibleFields.length === expectedFieldCount, `${pageName} @ ${bp.name}: expected ${expectedFieldCount} visible fields, got ${visibleFields.length}`);
    } else {
      assert(data.fields.length === expectedFieldCount, `${pageName} @ ${bp.name}: expected ${expectedFieldCount} fields, got ${data.fields.length}`);
    }
    // Check all visible fields have comment-field-meta
    for (const f of visibleFields) {
      assert(f.hasCommentFieldMeta, `${pageName} @ ${bp.name} [${f.label}]: missing comment-field-meta`);
      assert(f.display === 'grid', `${pageName} @ ${bp.name} [${f.label}]: display=${f.display} (expected grid)`);
      assert(f.whiteSpace === 'nowrap', `${pageName} @ ${bp.name} [${f.label}]: whiteSpace=${f.whiteSpace} (expected nowrap)`);
      assert(f.overflow === 'hidden', `${pageName} @ ${bp.name} [${f.label}]: overflow=${f.overflow} (expected hidden)`);
      assert(f.textOverflow === 'ellipsis', `${pageName} @ ${bp.name} [${f.label}]: textOverflow=${f.textOverflow} (expected ellipsis)`);
    }
    // Check equal widths (within 1px tolerance)
    if (visibleFields.length > 1) {
      const widths = visibleFields.map(f => f.valueWidth);
      const minW = Math.min(...widths);
      const maxW = Math.max(...widths);
      assert(maxW - minW <= 1, `${pageName} @ ${bp.name}: widths not equal (min=${minW}, max=${maxW})`);
    }
    // Check single line (value height <= 20px approximately)
    for (const f of visibleFields) {
      assert(f.valueHeight <= 20, `${pageName} @ ${bp.name} [${f.label}]: value height=${f.valueHeight} (expected <=20 for single line)`);
    }
    // Check second grid column is ~50% of meta element content width
    for (const f of visibleFields) {
      const expected50 = data.metaWidth * 0.5;
      assert(Math.abs(f.valueWidth - expected50) <= 3, `${pageName} @ ${bp.name} [${f.label}]: valueWidth=${f.valueWidth} expected ~${expected50.toFixed(0)} (50% of meta ${data.metaWidth})`);
    }
  }
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await login(page);

  console.log("\n=== User Accounts ===");
  await testPage(page, "User Accounts", "users", "User Accounts", 3);
  console.log("\n=== Reported Users ===");
  await testPage(page, "Reported Users", "users", "Reported Users", 4);
  console.log("\n=== Offer List ===");
  await testPage(page, "Offer List", "offers", "", 4);
  console.log("\n=== Article List ===");
  await testPage(page, "Article List", "content", "Articles", 2);
  console.log("\n=== Category List ===");
  await testPage(page, "Category List", "content", "Categories", 3);
  console.log("\n=== Reported Articles ===");
  await testPage(page, "Reported Articles", "content", "Reported Articles", 3);
  console.log("\n=== Sync History ===");
  // Sync History: "รายการ" intentionally hidden, "หมายเหตุ" conditional — expect 3 visible (ข้อมูลที่อัปเดต, เริ่มเมื่อ, ใช้เวลา)
  await testPage(page, "Sync History", "market", "Sync History", 3, { skipHidden: true });

  await browser.close();
  console.log(`\n=== RESULTS ===`);
  console.log(`Pass: ${pass}, Fail: ${fail}`);
  if (fail > 0) {
    console.log(`\nFailures:`);
    failures.forEach(f => console.log(`  - ${f}`));
    process.exit(1);
  }
}
run().catch(e => { console.error(e); process.exit(1); });
