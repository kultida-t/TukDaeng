// Diagnostic: measure Comment field layout in mobile card to understand spacing issue
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
  await page.waitForSelector('#otp-form:not(.hidden)', { timeout: 5000 });
  await page.locator('#verify-otp-btn').click();
  await page.waitForTimeout(500);
  await page.waitForSelector('#login-screen', { state: 'hidden', timeout: 5000 });
}

async function openReportedComments(page) {
  const navItem = page.locator('.nav-item[data-module="assets"]').first();
  const isExpanded = await navItem.getAttribute('aria-expanded');
  if (isExpanded !== 'true') { await navItem.click(); await page.waitForTimeout(200); }
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

  for (const w of [414, 375, 320]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(300);
    const data = await page.evaluate(() => {
      const card = document.querySelector('[data-reported-comment-card]');
      if (!card) return null;
      const cardRect = card.getBoundingClientRect();
      const fields = card.querySelectorAll('.user-card-meta-item.comment-text-meta');
      return {
        cardWidth: Math.round(cardRect.width),
        fields: Array.from(fields).map(f => {
          const span = f.querySelector('span');
          const strong = f.querySelector('strong');
          const spanRect = span.getBoundingClientRect();
          const strongRect = strong.getBoundingClientRect();
          const cs = window.getComputedStyle(f);
          return {
            label: span.textContent.trim(),
            gridColumns: cs.gridTemplateColumns,
            labelWidth: Math.round(spanRect.width),
            valueWidth: Math.round(strongRect.width),
            valueScrollWidth: strong.scrollWidth,
            valueClientWidth: strong.clientWidth,
            gapBetween: Math.round(strongRect.left - spanRect.right),
            valueText: strong.textContent.trim().substring(0, 50),
          };
        }),
      };
    });
    console.log(`\n=== ${w}px (card=${data.cardWidth}px) ===`);
    for (const f of data.fields) {
      console.log(`  ${f.label}: grid=${f.gridColumns} | label=${f.labelWidth}px value=${f.valueWidth}px (scroll=${f.valueScrollWidth}) gap=${f.gapBetween}px`);
      console.log(`    text: "${f.valueText}..."`);
    }
  }
  await browser.close();
}
run().catch(e => { console.error(e); process.exit(1); });
