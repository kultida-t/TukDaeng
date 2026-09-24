// Test: All card meta fields in Reported Comments, Reported Assets, and Asset List
// should have equal proportions (50% max width) with truncation on mobile.

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

async function navigate(page, module, sub) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(200);
  const navItem = page.locator(`.nav-item[data-module="${module}"]`).first();
  const isExpanded = await navItem.getAttribute('aria-expanded');
  if (isExpanded !== 'true') { await navItem.click(); await page.waitForTimeout(200); }
  await page.locator(`.submenu button[data-module="${module}"][data-sub="${sub}"]`).first().click();
  await page.waitForTimeout(400);
}

async function getCardFields(page, selector) {
  return await page.evaluate((sel) => {
    const card = document.querySelector(sel);
    if (!card) return null;
    const cardRect = card.getBoundingClientRect();
    const fields = card.querySelectorAll('.user-card-meta-item');
    return {
      cardWidth: Math.round(cardRect.width),
      fields: Array.from(fields).map(f => {
        const span = f.querySelector('span');
        const strong = f.querySelector('strong');
        const cs = strong ? window.getComputedStyle(strong) : null;
        const strongRect = strong.getBoundingClientRect();
        return {
          label: span ? span.textContent.trim() : null,
          hasCommentFieldMeta: f.classList.contains('comment-field-meta'),
          valueWidth: Math.round(strongRect.width),
          whiteSpace: cs ? cs.whiteSpace : null,
          overflow: cs ? cs.overflow : null,
          textOverflow: cs ? cs.textOverflow : null,
          isTruncated: strong ? (strong.scrollWidth > strong.clientWidth + 1) : false,
          height: Math.round(strongRect.height),
        };
      }),
    };
  }, selector);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await login(page);

  const pages = [
    { name: "Reported Comments", module: "assets", sub: "Reported Comments", selector: '[data-reported-comment-card]' },
    { name: "Reported Assets", module: "assets", sub: "Reported Assets", selector: '.reported-assets-table .user-row.report-row:not(.head)' },
    { name: "Asset List", module: "assets", sub: "Asset List", selector: '.asset-list-table .asset-row:not(.head)' },
  ];

  for (const p of pages) {
    await navigate(page, p.module, p.sub);
    await page.waitForSelector(p.selector, { timeout: 5000 });

    for (const bp of [{ w: 414, name: "414" }, { w: 375, name: "375" }, { w: 320, name: "320" }]) {
      await page.setViewportSize({ width: bp.w, height: 900 });
      await page.waitForTimeout(300);
      const data = await getCardFields(page, p.selector);
      if (!data) { log(`${p.name} ${bp.name}: card found`, false); continue; }

      console.log(`\n--- ${p.name} @ ${bp.name}px (card=${data.cardWidth}px) ---`);
      const valueWidths = [];
      for (const f of data.fields) {
        console.log(`  ${f.label}: w=${f.valueWidth}px meta=${f.hasCommentFieldMeta} ws=${f.whiteSpace} trunc=${f.isTruncated} h=${f.height}`);
        log(`${p.name} ${bp.name}: ${f.label} has comment-field-meta`, f.hasCommentFieldMeta, ``);
        log(`${p.name} ${bp.name}: ${f.label} whiteSpace=nowrap`, f.whiteSpace === "nowrap", `got ${f.whiteSpace}`);
        log(`${p.name} ${bp.name}: ${f.label} overflow=hidden`, f.overflow === "hidden", `got ${f.overflow}`);
        log(`${p.name} ${bp.name}: ${f.label} textOverflow=ellipsis`, f.textOverflow === "ellipsis", `got ${f.textOverflow}`);
        log(`${p.name} ${bp.name}: ${f.label} single line (≤20px)`, f.height <= 20, `h=${f.height}`);
        valueWidths.push(f.valueWidth);
      }
      // All fields should have equal width
      const allEqual = valueWidths.every(w => w === valueWidths[0]);
      log(`${p.name} ${bp.name}: all fields equal width`, allEqual, `widths=${valueWidths.join(",")}`);
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
