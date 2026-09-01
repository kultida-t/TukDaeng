// WA-QA-002b supplement: verify Alert List mobile card layout on 375px
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

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();
  await login(page);

  // Open Watch Alert List at wide viewport
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(200);
  const navItem = page.locator('.nav-item[data-module="watch-alerts"]').first();
  if (await navItem.getAttribute('aria-expanded') !== 'true') {
    await navItem.click();
    await page.waitForTimeout(200);
  }
  await page.locator('.submenu[data-submenu="watch-alerts"] button[data-sub="Watch Alert List"]').first().click();
  await page.waitForTimeout(400);
  await page.waitForSelector('.watch-alert-list-table .asset-row:not(.head)', { timeout: 5000 });

  // Switch to mobile
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(300);

  const probe = await page.evaluate(() => {
    const headRow = document.querySelector('.watch-alert-list-table .asset-row.head');
    const firstRow = document.querySelector('.watch-alert-list-table .asset-row:not(.head)');
    const headCs = headRow ? window.getComputedStyle(headRow) : null;
    const rowCs = firstRow ? window.getComputedStyle(firstRow) : null;
    const rowRect = firstRow ? firstRow.getBoundingClientRect() : null;
    // Check which cells are visible in the row
    const cells = firstRow ? Array.from(firstRow.children).map(c => {
      const cs = window.getComputedStyle(c);
      const r = c.getBoundingClientRect();
      return {
        label: c.getAttribute('data-label') || c.className || '',
        display: cs.display,
        visible: r.width > 0 && r.height > 0,
        width: Math.round(r.width)
      };
    }) : [];
    return {
      headDisplay: headCs ? headCs.display : null,
      rowDisplay: rowCs ? rowCs.display : null,
      rowGridCols: rowCs ? rowCs.gridTemplateColumns : null,
      rowPadding: rowCs ? rowCs.padding : null,
      rowBorderRadius: rowCs ? rowCs.borderRadius : null,
      rowWidth: rowRect ? Math.round(rowRect.width) : null,
      rowHeight: rowRect ? Math.round(rowRect.height) : null,
      visibleCellCount: cells.filter(c => c.visible).length,
      cells
    };
  });

  console.log("=== Alert List mobile card layout (375px) ===");
  console.log("Head row display:", probe.headDisplay, "(expected: none)");
  console.log("Row display:", probe.rowDisplay);
  console.log("Row grid-template-columns:", probe.rowGridCols);
  console.log("Row padding:", probe.rowPadding);
  console.log("Row border-radius:", probe.rowBorderRadius);
  console.log("Row width:", probe.rowWidth, "height:", probe.rowHeight);
  console.log("Visible cells:", probe.visibleCellCount, "of", probe.cells.length);
  console.log("Cells:");
  probe.cells.forEach((c, i) => console.log(`  [${i}] label="${c.label}" display=${c.display} visible=${c.visible} width=${c.width}`));

  const isCardLayout = probe.headDisplay === 'none' && probe.rowBorderRadius && probe.rowBorderRadius !== '0px';
  console.log("\nCard layout active:", isCardLayout ? "PASS" : "FAIL");

  await browser.close();
  process.exit(isCardLayout ? 0 : 1);
})();
