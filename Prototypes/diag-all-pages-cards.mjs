// Diagnostic: measure all card meta fields across all pages on mobile
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("C:\\Users\\Admin\\AppData\\Local\\npm-cache\\_npx\\e41f203b7505f1fb\\node_modules\\playwright\\index.js");

const URL = "http://127.0.0.1:4173/";

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
  // Use nav click like other test scripts
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
    // Find first card with user-card-meta-item
    const card = document.querySelector('[data-asset-card], [data-reported-comment-card], [data-offer-card], .user-row:not(.head), .asset-row:not(.head), .reported-users-table .user-row.report-row:not(.head)');
    if (!card) return null;
    const cardRect = card.getBoundingClientRect();
    const meta = card.querySelector('.user-card-meta');
    if (!meta) return { cardWidth: Math.round(cardRect.width), hasMeta: false, fields: [] };
    const fields = meta.querySelectorAll('.user-card-meta-item');
    return {
      cardWidth: Math.round(cardRect.width),
      hasMeta: true,
      cardClass: card.className.substring(0, 80),
      fields: Array.from(fields).map(f => {
        const span = f.querySelector('span');
        const strong = f.querySelector('strong');
        const cs = strong ? window.getComputedStyle(strong) : null;
        const fCs = window.getComputedStyle(f);
        const strongRect = strong ? strong.getBoundingClientRect() : null;
        return {
          label: span ? span.textContent.trim() : null,
          hasCommentFieldMeta: f.classList.contains('comment-field-meta'),
          hasReportReasonMeta: f.classList.contains('report-reason-meta'),
          display: fCs.display,
          gridColumns: fCs.gridTemplateColumns,
          valueWidth: strongRect ? Math.round(strongRect.width) : null,
          whiteSpace: cs ? cs.whiteSpace : null,
          overflow: cs ? cs.overflow : null,
          textOverflow: cs ? cs.textOverflow : null,
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

  const pages = [
    { name: "User Accounts", module: "users", sub: "User Accounts" },
    { name: "Reported Users", module: "users", sub: "Reported Users" },
    { name: "Offer List", module: "offers", sub: "" },
    { name: "Article List", module: "content", sub: "Articles" },
    { name: "Category List", module: "content", sub: "Categories" },
    { name: "Reported Articles", module: "content", sub: "Reported Articles" },
    { name: "Brands & Models", module: "market", sub: "Brands & Models" },
    { name: "Sync History", module: "market", sub: "Sync History" },
  ];

  for (const p of pages) {
    await navigate(page, p.module, p.sub);
    for (const bp of [{ w: 414, name: "414" }, { w: 375, name: "375" }]) {
      await page.setViewportSize({ width: bp.w, height: 900 });
      await page.waitForTimeout(300);
      const data = await getCardFields(page);
      if (!data) {
        console.log(`\n=== ${p.name} @ ${bp.name}px === NO CARD FOUND`);
        continue;
      }
      if (!data.hasMeta) {
        console.log(`\n=== ${p.name} @ ${bp.name}px (card=${data.cardWidth}px) === NO META`);
        continue;
      }
      console.log(`\n=== ${p.name} @ ${bp.name}px (card=${data.cardWidth}px) ===`);
      for (const f of data.fields) {
        const flags = [f.hasCommentFieldMeta ? "CFM" : "", f.hasReportReasonMeta ? "RRM" : ""].filter(Boolean).join(",");
        console.log(`  ${f.label}: w=${f.valueWidth}px [${flags}] display=${f.display} ws=${f.whiteSpace} trunc=${f.textOverflow} grid=${f.gridColumns}`);
      }
    }
  }
  await browser.close();
}
run().catch(e => { console.error(e); process.exit(1); });
