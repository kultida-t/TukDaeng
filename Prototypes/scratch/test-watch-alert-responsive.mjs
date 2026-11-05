// WA-QA-002b: Responsive 4 viewports (375/768/1280/1440) for Watch Alert List + Alert Detail
// + protected screens regression check (Login/Dashboard/User/Asset/Content/Market Data/Offer/Option Master)
// + Demand Overview compatibility check
// Read-only verification — NO edits to source.

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("C:\\Users\\Admin\\AppData\\Local\\npm-cache\\_npx\\e41f203b7505f1fb\\node_modules\\playwright\\index.js");

const URL = "http://127.0.0.1:4173/";
const VIEWPORTS = [
  { name: "mobile-375", width: 375, height: 812 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1280", width: 1280, height: 900 },
  { name: "desktop-1440", width: 1440, height: 900 }
];

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

async function setViewport(page, vp) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.waitForTimeout(300);
}

async function openSubmenu(page, module, sub, waitSelector) {
  // On mobile the sidebar collapses — temporarily widen to click nav
  const cur = page.viewportSize();
  if (cur.width < 1024) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(200);
  }
  const navItem = page.locator(`.nav-item[data-module="${module}"]`).first();
  const isExpanded = await navItem.getAttribute('aria-expanded');
  if (isExpanded !== 'true') {
    await navItem.click();
    await page.waitForTimeout(200);
  }
  await page.locator(`.submenu[data-submenu="${module}"] button[data-sub="${sub}"]`).first().click();
  await page.waitForTimeout(400);
  if (waitSelector) {
    try { await page.waitForSelector(waitSelector, { timeout: 5000 }); } catch {}
  }
}

async function openWatchAlertList(page) {
  await openSubmenu(page, "watch-alerts", "Watch Alert List", ".watch-alert-list-table .asset-row:not(.head)");
}

async function openAlertDetail(page) {
  await page.locator(".watch-alert-list-table .asset-row:not(.head)").first().click();
  await page.waitForTimeout(500);
  try { await page.waitForSelector("body.watch-alert-detail-mode", { timeout: 5000 }); } catch {}
}

async function openDemandOverview(page) {
  await openSubmenu(page, "watch-alerts", "Demand Overview", ".wa-kpi-card, #summary-grid .stat");
}

async function probeAlertList(page, vp) {
  return await page.evaluate(() => {
    const body = document.body;
    const isListMode = body.classList.contains("watch-alert-list-mode");
    const table = document.querySelector("#table");
    const listTable = document.querySelector(".watch-alert-list-table");
    const headRow = document.querySelector(".watch-alert-list-table .asset-row.head");
    const dataRows = document.querySelectorAll(".watch-alert-list-table .asset-row:not(.head)");
    const firstDataRow = dataRows[0];
    const footerRange = document.querySelector("#table > .footer-range");
    const filterBar = document.querySelector(".wa-alert-filter-bar");
    const filterToggle = document.querySelector("[data-wa-alert-filter-toggle]");
    const summaryGrid = document.querySelector("#summary-grid");
    const pageTitle = document.querySelector("#page-title")?.textContent;
    const panelTitle = document.querySelector("#panel-title")?.textContent;
    const crumb = document.querySelector("#crumb")?.textContent;

    const isMobileCard = !!firstDataRow?.querySelector("[data-watch-alert-card], .card-field, .mc-row");

    const tableOverflowX = table ? table.scrollWidth > table.clientWidth + 1 : false;
    const pageOverflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;

    const rowRect = firstDataRow ? firstDataRow.getBoundingClientRect() : null;
    const tableRect = table ? table.getBoundingClientRect() : null;

    const filterBarVisible = filterBar ? window.getComputedStyle(filterBar).display !== "none" : false;

    return {
      isListMode,
      pageTitle,
      panelTitle,
      crumb,
      rowCount: dataRows.length,
      headRowPresent: !!headRow,
      isMobileCard,
      tableOverflowX,
      pageOverflowX,
      rowWidth: rowRect ? Math.round(rowRect.width) : null,
      tableWidth: tableRect ? Math.round(tableRect.width) : null,
      filterBarPresent: !!filterBar,
      filterBarVisible,
      filterTogglePresent: !!filterToggle,
      summaryGridEmpty: summaryGrid ? summaryGrid.children.length === 0 : null
    };
  });
}

async function probeAlertDetail(page, vp) {
  return await page.evaluate(() => {
    const body = document.body;
    const isDetailMode = body.classList.contains("watch-alert-detail-mode");
    const detailHead = document.querySelector(".user-detail-head, .asset-report-heading");
    const sections = document.querySelectorAll(".user-detail-page .panel, .detail-section, .user-detail-page > div");
    const matchedTable = document.querySelector("[data-wa-matched-assets], .wa-matched-assets-table");
    const triggerTable = document.querySelector("[data-wa-trigger-history], .wa-trigger-history-table");
    const userActionTable = document.querySelector("[data-wa-user-action-history], .wa-user-action-history-table");
    const breadcrumb = document.querySelector("#crumb")?.textContent;
    const backBtn = document.querySelector("[data-wa-back], .back-btn, .breadcrumb-back");

    const sectionCount = sections.length;
    const pageOverflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    const headRect = detailHead ? detailHead.getBoundingClientRect() : null;

    const matchedOverflow = matchedTable ? matchedTable.scrollWidth > matchedTable.clientWidth + 1 : null;
    const triggerOverflow = triggerTable ? triggerTable.scrollWidth > triggerTable.clientWidth + 1 : null;
    const userActionOverflow = userActionTable ? userActionTable.scrollWidth > userActionTable.clientWidth + 1 : null;

    return {
      isDetailMode,
      breadcrumb,
      sectionCount,
      backBtnPresent: !!backBtn,
      pageOverflowX,
      headWidth: headRect ? Math.round(headRect.width) : null,
      matchedTablePresent: !!matchedTable,
      triggerTablePresent: !!triggerTable,
      userActionTablePresent: !!userActionTable,
      matchedOverflow,
      triggerOverflow,
      userActionOverflow
    };
  });
}

async function probeProtectedScreen(page, module, sub, waitSelector) {
  await openSubmenu(page, module, sub, waitSelector);
  return await page.evaluate(() => {
    const pageTitle = document.querySelector("#page-title")?.textContent;
    const panelTitle = document.querySelector("#panel-title")?.textContent;
    const table = document.querySelector("#table");
    const tableVisible = table ? window.getComputedStyle(table).display !== "none" : false;
    const pageOverflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    return { pageTitle, panelTitle, tableVisible, pageOverflowX };
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on("console", m => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", e => consoleErrors.push(String(e)));

  await login(page);
  log("login: success", true);

  // ===== Part 1: Alert List responsive 4 viewports =====
  console.log("\n=== Part 1: Alert List responsive 4 viewports ===");
  for (const vp of VIEWPORTS) {
    await openWatchAlertList(page);
    await setViewport(page, vp);
    await page.evaluate(() => window.dispatchEvent(new Event("resize")));
    await page.waitForTimeout(200);

    const probe = await probeAlertList(page, vp);
    const ok = probe.isListMode && probe.rowCount > 0 && !probe.pageOverflowX;
    log(`AlertList[${vp.name}]: mode=${probe.isListMode} rows=${probe.rowCount} pageOverflowX=${probe.pageOverflowX} tableOverflowX=${probe.tableOverflowX} mobileCard=${probe.isMobileCard} filterBar=${probe.filterBarVisible} rowW=${probe.rowWidth} tableW=${probe.tableWidth}`, ok, `title="${probe.pageTitle}"`);
  }

  // ===== Part 2: Alert Detail responsive 4 viewports =====
  console.log("\n=== Part 2: Alert Detail responsive 4 viewports ===");
  await setViewport(page, VIEWPORTS[3]);
  await openWatchAlertList(page);
  await openAlertDetail(page);
  for (const vp of VIEWPORTS) {
    await setViewport(page, vp);
    await page.evaluate(() => window.dispatchEvent(new Event("resize")));
    await page.waitForTimeout(200);
    const probe = await probeAlertDetail(page, vp);
    const ok = probe.isDetailMode && !probe.pageOverflowX;
    log(`AlertDetail[${vp.name}]: mode=${probe.isDetailMode} sections=${probe.sectionCount} pageOverflowX=${probe.pageOverflowX} headW=${probe.headWidth} matched=${probe.matchedTablePresent} trigger=${probe.triggerTablePresent} userAction=${probe.userActionTablePresent} matchedOverflow=${probe.matchedOverflow} triggerOverflow=${probe.triggerOverflow} userActionOverflow=${probe.userActionOverflow}`, ok, `crumb="${probe.breadcrumb}"`);
  }

  // ===== Part 3: Protected screens regression (at 1280 + 375) =====
  console.log("\n=== Part 3: Protected screens regression ===");
  const protectedChecks = [
    { module: "dashboard", sub: null, wait: ".kpi-card, .dashboard-card, #summary-grid", label: "Dashboard" },
    { module: "users", sub: "User Accounts", wait: ".user-list-table .asset-row:not(.head), .user-row, [data-user-card]", label: "User List" },
    { module: "assets", sub: "Asset List", wait: ".asset-list-table .asset-row:not(.head), [data-asset-card]", label: "Asset List" },
    { module: "assets", sub: "Reported Assets", wait: ".reported-asset-table, [data-reported-asset-card]", label: "Reported Assets" },
    { module: "assets", sub: "Reported Comments", wait: ".reported-comment-table, [data-reported-comment-card]", label: "Reported Comments" },
    { module: "content", sub: "Articles", wait: ".article-list-table, [data-article-card], .article-row", label: "Content Articles" },
    { module: "market", sub: "Dashboard", wait: ".market-data-table, [data-market-data-card], #summary-grid, .kpi-card", label: "Market Data" },
    { module: "offers", sub: null, wait: ".offer-list-table, [data-offer-card], .offer-row", label: "Offer Management" },
    { module: "option-master", sub: null, wait: ".option-group-table, [data-option-group-card], #table .asset-row", label: "Option Master" }
  ];

  for (const vp of [VIEWPORTS[2], VIEWPORTS[0]]) {
    for (const chk of protectedChecks) {
      try {
        if (chk.sub) {
          const probe = await probeProtectedScreen(page, chk.module, chk.sub, chk.wait);
          const ok = !!probe.pageTitle && !probe.pageOverflowX;
          log(`Protected[${chk.label} @ ${vp.name}]: title="${probe.pageTitle}" tableVisible=${probe.tableVisible} pageOverflowX=${probe.pageOverflowX}`, ok);
        } else {
          await setViewport(page, { width: 1440, height: 900 });
          await page.waitForTimeout(200);
          await page.locator(`.nav-item[data-module="${chk.module}"]`).first().click();
          await page.waitForTimeout(400);
          try { await page.waitForSelector(chk.wait, { timeout: 3000 }); } catch {}
          await setViewport(page, vp);
          await page.waitForTimeout(300);
          const probe = await page.evaluate(() => {
            const pageTitle = document.querySelector("#page-title")?.textContent;
            const pageOverflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
            return { pageTitle, pageOverflowX };
          });
          const ok = !!probe.pageTitle && !probe.pageOverflowX;
          log(`Protected[${chk.label} @ ${vp.name}]: title="${probe.pageTitle}" pageOverflowX=${probe.pageOverflowX}`, ok);
        }
      } catch (e) {
        log(`Protected[${chk.label} @ ${vp.name}]: ERROR`, false, String(e).slice(0, 120));
      }
    }
  }

  // ===== Part 4: Demand Overview compatibility =====
  console.log("\n=== Part 4: Demand Overview compatibility ===");
  for (const vp of VIEWPORTS) {
    await setViewport(page, { width: 1440, height: 900 });
    await openDemandOverview(page);
    await setViewport(page, vp);
    await page.evaluate(() => window.dispatchEvent(new Event("resize")));
    await page.waitForTimeout(200);
    const probe = await page.evaluate(() => {
      const isOverview = document.body.classList.contains("watch-alert-overview-mode");
      const kpiCards = document.querySelectorAll(".wa-kpi-card, #summary-grid .stat");
      const panels = document.querySelectorAll(".panel");
      const pageOverflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
      const pageTitle = document.querySelector("#page-title")?.textContent;
      return { isOverview, kpiCount: kpiCards.length, panelCount: panels.length, pageOverflowX, pageTitle };
    });
    const ok = probe.isOverview && probe.kpiCount > 0 && !probe.pageOverflowX;
    log(`DemandOverview[${vp.name}]: mode=${probe.isOverview} kpi=${probe.kpiCount} panels=${probe.panelCount} pageOverflowX=${probe.pageOverflowX}`, ok, `title="${probe.pageTitle}"`);
  }

  // ===== Console errors =====
  console.log("\n=== Console errors ===");
  if (consoleErrors.length === 0) {
    log("console: no errors", true);
  } else {
    log(`console: ${consoleErrors.length} errors`, false, consoleErrors.slice(0, 5).join(" | "));
  }

  await browser.close();

  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  console.log(`\n=== SUMMARY: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) {
    console.log("\nFailures:");
    results.filter(r => !r.ok).forEach(r => console.log(`  - ${r.label}${r.detail ? ` :: ${r.detail}` : ""}`));
  }
  process.exit(failed > 0 ? 1 : 0);
})();
