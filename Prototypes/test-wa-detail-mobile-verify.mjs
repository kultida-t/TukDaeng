// WA-QA-002b supplement: verify Alert Detail mobile card layout on 375px
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

  // Open Watch Alert List → click first row → Alert Detail
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(200);
  const navItem = page.locator('.nav-item[data-module="watch-alerts"]').first();
  if (await navItem.getAttribute('aria-expanded') !== 'true') {
    await navItem.click();
    await page.waitForTimeout(200);
  }
  await page.locator('.submenu[data-submenu="watch-alerts"] button[data-sub="Watch Alert List"]').first().click();
  await page.waitForTimeout(400);
  await page.locator(".watch-alert-list-table .asset-row:not(.head)").first().click();
  await page.waitForTimeout(500);
  await page.waitForSelector("body.watch-alert-detail-mode", { timeout: 5000 });

  // Switch to mobile
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(300);

  const probe = await page.evaluate(() => {
    // Check all tables in detail page
    const tables = Array.from(document.querySelectorAll('.user-detail-page table, .user-detail-page .data-table, .user-detail-page .asset-row'));
    const headRows = Array.from(document.querySelectorAll('.user-detail-page .asset-row.head, .user-detail-page thead'));
    const detailHead = document.querySelector('.user-detail-head, .asset-report-heading');
    const headRect = detailHead ? detailHead.getBoundingClientRect() : null;
    const headCs = detailHead ? window.getComputedStyle(detailHead) : null;

    // Check section headings
    const sectionHeadings = Array.from(document.querySelectorAll('.user-detail-page h3, .user-detail-page h2, .user-detail-page .section-title')).map(h => ({
      text: h.textContent?.trim().slice(0, 50),
      width: Math.round(h.getBoundingClientRect().width)
    }));

    // Check page overflow
    const pageOverflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;

    // Check grids (2-col → 1-col on mobile)
    const grids = Array.from(document.querySelectorAll('.user-detail-page .detail-grid, .user-detail-page [style*="grid"]')).map(g => {
      const cs = window.getComputedStyle(g);
      return { gridCols: cs.gridTemplateColumns, width: Math.round(g.getBoundingClientRect().width) };
    });

    return {
      tableCount: tables.length,
      headRowCount: headRows.length,
      headRowsHidden: headRows.map(h => window.getComputedStyle(h).display === 'none'),
      headWidth: headRect ? Math.round(headRect.width) : null,
      headDisplay: headCs ? headCs.display : null,
      sectionHeadingCount: sectionHeadings.length,
      sectionHeadings,
      pageOverflowX,
      gridCount: grids.length,
      grids
    };
  });

  console.log("=== Alert Detail mobile layout (375px) ===");
  console.log("Detail head width:", probe.headWidth, "display:", probe.headDisplay);
  console.log("Table/row count:", probe.tableCount);
  console.log("Head row count:", probe.headRowCount, "hidden:", probe.headRowsHidden);
  console.log("Section headings:", probe.sectionHeadingCount);
  probe.sectionHeadings.forEach(h => console.log(`  - "${h.text}" width=${h.width}`));
  console.log("Page overflow X:", probe.pageOverflowX);
  console.log("Grids:", probe.gridCount);
  probe.grids.forEach((g, i) => console.log(`  [${i}] cols="${g.gridCols}" width=${g.width}`));

  const ok = !probe.pageOverflowX && probe.headWidth <= 375;
  console.log("\nDetail mobile layout:", ok ? "PASS" : "FAIL");

  await browser.close();
  process.exit(ok ? 0 : 1);
})();
