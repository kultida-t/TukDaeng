// Diagnostic: measure border thickness between last row and footer-range on Reported Users
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

async function measureBorders(page) {
  return await page.evaluate(() => {
    const table = document.querySelector('.reported-users-table');
    if (!table) return null;
    const rows = table.querySelectorAll('.user-row.report-row:not(.head)');
    if (rows.length < 2) return { rows: rows.length, msg: "not enough rows" };
    const lastRow = rows[rows.length - 1];
    const secondLastRow = rows[rows.length - 2];
    const footer = table.querySelector('.footer-range');
    if (!footer) return { rows: rows.length, msg: "no footer-range" };

    // Measure gap between second-to-last and last row (normal border)
    const r2Box = secondLastRow.getBoundingClientRect();
    const r1Box = lastRow.getBoundingClientRect();
    const footerBox = footer.getBoundingClientRect();

    // Gap between rows = top of last row - bottom of second-to-last
    const rowGap = Math.round(r1Box.top - r2Box.bottom);
    // Gap between last row and footer = top of footer - bottom of last row
    const footerGap = Math.round(footerBox.top - r1Box.bottom);

    // Also check computed border
    const lastRowBorderBottom = window.getComputedStyle(lastRow).borderBottomWidth;
    const footerBorderTop = window.getComputedStyle(footer).borderTopWidth;
    const secondLastBorderBottom = window.getComputedStyle(secondLastRow).borderBottomWidth;

    return {
      rows: rows.length,
      rowGap,
      footerGap,
      secondLastBorderBottom,
      lastRowBorderBottom,
      footerBorderTop,
      equal: rowGap === footerGap,
    };
  });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await login(page);

  await navigate(page, "users", "Reported Users");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);

  const data = await measureBorders(page);
  console.log("=== Reported Users @ desktop ===");
  console.log(JSON.stringify(data, null, 2));

  await browser.close();
}
run().catch(e => { console.error(e); process.exit(1); });
