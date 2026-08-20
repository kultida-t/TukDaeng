// Regression check: Reported Comments display after session 12:42 responsive paging + mobile scrollbar fixes.
// Verifies: min-width 1102px (desktop+tablet), footer-range alignment, mobile overflow-x hidden, mobile card layout,
// Detail page + Action Modal on mobile, comparison with Asset List card structure.
// NO edits to source — read-only verification.

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
  // Only click parent if not already expanded
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

async function openAssetList(page) {
  // Expand viewport temporarily so nav sidebar is clickable (mobile collapses it)
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(200);
  // Only click parent if not already expanded
  const navItem = page.locator('.nav-item[data-module="assets"]').first();
  const isExpanded = await navItem.getAttribute('aria-expanded');
  if (isExpanded !== 'true') {
    await navItem.click();
    await page.waitForTimeout(200);
  }
  await page.locator('.submenu button[data-module="assets"][data-sub="Asset List"]').first().click();
  await page.waitForTimeout(400);
  await page.waitForSelector('.asset-list-table .asset-row:not(.head)', { timeout: 5000 });
}

async function setViewport(page, width, height = 900) {
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(250);
}

async function getTableMetrics(page) {
  return await page.evaluate(() => {
    const tableEl = document.querySelector('#table');
    const reportedTable = document.querySelector('.reported-comment-table');
    const footerRange = document.querySelector('#table > .footer-range');
    const card = document.querySelector('[data-reported-comment-card]');
    const body = document.body;
    const cs = window.getComputedStyle(tableEl || document.body);
    const tableCs = reportedTable ? window.getComputedStyle(reportedTable) : null;
    const footerCs = footerRange ? window.getComputedStyle(footerRange) : null;
    const cardRect = card ? card.getBoundingClientRect() : null;
    // Check horizontal scrollbar on #table
    const tableScrollable = tableEl ? (tableEl.scrollWidth > tableEl.clientWidth + 1) : false;
    // Page-level scroll
    const pageScrollable = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    // Body classes
    const bodyClasses = body.className;
    // Count columns in card mode (mobile): if grid-template-columns is 1fr, it's single column
    const cardGridCs = card ? window.getComputedStyle(card) : null;
    return {
      tableWidth: tableEl ? Math.round(tableEl.getBoundingClientRect().width) : null,
      tableMinWidth: tableCs ? tableCs.minWidth : null,
      tableOverflowX: cs.overflowX,
      footerMinWidth: footerCs ? footerCs.minWidth : null,
      footerWidth: footerRange ? Math.round(footerRange.getBoundingClientRect().width) : null,
      cardWidth: cardRect ? Math.round(cardRect.width) : null,
      tableScrollable,
      pageScrollable,
      bodyClasses,
      cardGridColumns: cardGridCs ? cardGridCs.gridTemplateColumns : null,
    };
  });
}

async function getCardMetaItems(page) {
  return await page.evaluate(() => {
    const card = document.querySelector('[data-reported-comment-card]');
    if (!card) return null;
    const metaItems = card.querySelectorAll('.user-card-meta-item');
    return Array.from(metaItems).map(m => {
      const span = m.querySelector('span');
      const strong = m.querySelector('strong');
      return {
        label: span ? span.textContent.trim() : null,
        value: strong ? strong.textContent.trim() : null,
        className: m.className,
      };
    });
  });
}

async function getAssetListCardStructure(page) {
  return await page.evaluate(() => {
    const card = document.querySelector('.asset-list-table .asset-row:not(.head)');
    if (!card) return null;
    const cs = window.getComputedStyle(card);
    const rect = card.getBoundingClientRect();
    const tags = card.querySelector('.asset-card-tags');
    const meta = card.querySelector('.asset-list-card-meta');
    return {
      width: Math.round(rect.width),
      gridColumns: cs.gridTemplateColumns,
      hasTags: !!tags,
      hasMeta: !!meta,
      metaItems: meta ? Array.from(meta.querySelectorAll('.asset-list-card-meta-item, .user-card-meta-item')).map(m => {
        const span = m.querySelector('span');
        const strong = m.querySelector('strong');
        return { label: span ? span.textContent.trim() : null, value: strong ? strong.textContent.trim() : null };
      }) : null,
    };
  });
}

async function getReportedCommentCardStructure(page) {
  return await page.evaluate(() => {
    const card = document.querySelector('[data-reported-comment-card]');
    if (!card) return null;
    const cs = window.getComputedStyle(card);
    const rect = card.getBoundingClientRect();
    const tags = card.querySelector('.user-card-tags');
    const meta = card.querySelector('.user-card-meta');
    return {
      width: Math.round(rect.width),
      gridColumns: cs.gridTemplateColumns,
      hasTags: !!tags,
      hasMeta: !!meta,
      metaItems: meta ? Array.from(meta.querySelectorAll('.user-card-meta-item')).map(m => {
        const span = m.querySelector('span');
        const strong = m.querySelector('strong');
        return { label: span ? span.textContent.trim() : null, value: strong ? strong.textContent.trim() : null, className: m.className };
      }) : null,
    };
  });
}

async function openDetail(page, reportId) {
  const card = page.locator(`[data-reported-comment-card="${reportId}"]`).first();
  await card.click();
  await page.waitForTimeout(400);
  return await page.locator('.reported-comment-detail-page').count() > 0;
}

async function openActionModalFromDetail(page, actionLabel) {
  const btn = page.locator(`.reported-comment-detail-page [data-reported-comment-action]`).filter({ hasText: actionLabel }).first();
  if (!(await btn.count())) return false;
  await btn.click();
  await page.waitForTimeout(300);
  return await page.locator('#user-action-modal').isVisible();
}

async function closeModal(page) {
  // Use Escape key to close modal (more reliable than finding cancel button)
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // ===== DESKTOP / TABLET BREAKPOINTS (List view) =====
  const breakpoints = [
    { w: 1440, name: "Desktop 1440", expectMinWidth: "1102px", expectOverflow: "auto" },
    { w: 1280, name: "Desktop 1280", expectMinWidth: "1102px", expectOverflow: "auto" },
    { w: 1024, name: "Tablet 1024", expectMinWidth: "1102px", expectOverflow: "auto" },
  ];

  await login(page);
  await openReportedComments(page);

  for (const bp of breakpoints) {
    await setViewport(page, bp.w);
    const m = await getTableMetrics(page);
    console.log(`\n--- ${bp.name} ---`);
    console.log(`  tableWidth=${m.tableWidth} tableMinWidth=${m.tableMinWidth} footerMinWidth=${m.footerMinWidth} footerWidth=${m.footerWidth}`);
    console.log(`  tableOverflowX=${m.tableOverflowX} tableScrollable=${m.tableScrollable} pageScrollable=${m.pageScrollable}`);
    console.log(`  bodyClasses=${m.bodyClasses}`);

    log(`${bp.name}: reported-comment-table min-width = ${bp.expectMinWidth}`, m.tableMinWidth === bp.expectMinWidth, `got ${m.tableMinWidth}`);
    log(`${bp.name}: footer-range min-width = ${bp.expectMinWidth}`, m.footerMinWidth === bp.expectMinWidth, `got ${m.footerMinWidth}`);
    // footer-range should match min-width (1102px) when table is scrollable, or table width when not scrollable
    const expectedFooterWidth = m.tableScrollable ? 1102 : m.tableWidth;
    log(`${bp.name}: footer-range width aligns (${m.tableScrollable ? "scrollable: should be 1102" : "not scrollable: should match table"})`, m.footerWidth === expectedFooterWidth, `footer=${m.footerWidth} expected=${expectedFooterWidth}`);
    log(`${bp.name}: #table overflow-x = ${bp.expectOverflow}`, m.tableOverflowX === bp.expectOverflow, `got ${m.tableOverflowX}`);
    log(`${bp.name}: no page-level horizontal scroll`, !m.pageScrollable, `scrollWidth check`);
  }

  // ===== TABLET 768 (boundary: > 760 so still in tablet rules) =====
  await setViewport(page, 768);
  let m = await getTableMetrics(page);
  console.log(`\n--- Tablet 768 ---`);
  console.log(`  tableWidth=${m.tableWidth} tableMinWidth=${m.tableMinWidth} footerMinWidth=${m.footerMinWidth} footerWidth=${m.footerWidth}`);
  console.log(`  tableOverflowX=${m.tableOverflowX} tableScrollable=${m.tableScrollable} pageScrollable=${m.pageScrollable}`);
  console.log(`  bodyClasses=${m.bodyClasses}`);
  // 768 > 760 so should still use tablet rules (min-width 1102, overflow auto)
  log(`Tablet 768: still uses tablet rules (min-width 1102px)`, m.tableMinWidth === "1102px", `got ${m.tableMinWidth}`);
  log(`Tablet 768: footer-range min-width = 1102px`, m.footerMinWidth === "1102px", `got ${m.footerMinWidth}`);
  log(`Tablet 768: #table overflow-x = auto`, m.tableOverflowX === "auto", `got ${m.tableOverflowX}`);

  // ===== MOBILE BREAKPOINTS (≤ 760px) =====
  const mobileBreakpoints = [
    { w: 414, name: "Mobile 414" },
    { w: 375, name: "Mobile 375" },
    { w: 320, name: "Mobile 320" },
  ];

  for (const bp of mobileBreakpoints) {
    await setViewport(page, bp.w);
    m = await getTableMetrics(page);
    console.log(`\n--- ${bp.name} ---`);
    console.log(`  tableWidth=${m.tableWidth} tableMinWidth=${m.tableMinWidth} footerMinWidth=${m.footerMinWidth} footerWidth=${m.footerWidth}`);
    console.log(`  tableOverflowX=${m.tableOverflowX} tableScrollable=${m.tableScrollable} pageScrollable=${m.pageScrollable}`);
    console.log(`  cardWidth=${m.cardWidth} cardGridColumns=${m.cardGridColumns}`);
    console.log(`  bodyClasses=${m.bodyClasses}`);

    log(`${bp.name}: #table overflow-x = hidden (no scrollbar)`, m.tableOverflowX === "hidden", `got ${m.tableOverflowX}`);
    log(`${bp.name}: reported-comment-table min-width = 0px`, m.tableMinWidth === "0px", `got ${m.tableMinWidth}`);
    log(`${bp.name}: footer-range min-width = 0px`, m.footerMinWidth === "0px", `got ${m.footerMinWidth}`);
    log(`${bp.name}: no #table horizontal scrollbar`, !m.tableScrollable, `scrollWidth=${m.tableScrollable}`);
    log(`${bp.name}: no page-level horizontal scroll`, !m.pageScrollable, ``);
    log(`${bp.name}: card visible (single column)`, m.cardWidth !== null && m.cardWidth > 0, `cardWidth=${m.cardWidth}`);
    // Card should be roughly viewport width (minus padding)
    if (m.cardWidth) {
      log(`${bp.name}: card width fits viewport`, m.cardWidth <= bp.w, `cardWidth=${m.cardWidth} viewport=${bp.w}`);
    }
  }

  // ===== MOBILE CARD METADATA CHECK (414px) =====
  await setViewport(page, 414);
  const metaItems = await getCardMetaItems(page);
  console.log(`\n--- Mobile 414: Card metadata ---`);
  if (metaItems) {
    console.log(`  meta items: ${JSON.stringify(metaItems, null, 2)}`);
    const labels = metaItems.map(m => m.label).filter(Boolean);
    log(`Mobile 414: card has metadata items`, metaItems.length > 0, `${metaItems.length} items`);
    // Expected: Comment, Asset, Report reason, Reported at (based on session notes)
    const expectedLabels = ["Comment", "Asset", "Report reason", "Reported at"];
    for (const expected of expectedLabels) {
      const found = labels.some(l => l && l.toLowerCase().includes(expected.toLowerCase()));
      log(`Mobile 414: metadata includes "${expected}"`, found, `labels=${labels.join(", ")}`);
    }
  } else {
    log(`Mobile 414: card has metadata items`, false, `no meta items found`);
  }

  // ===== COMPARE CARD STRUCTURE: Reported Comments vs Asset List (mobile 414) =====
  console.log(`\n--- Card structure comparison (Mobile 414) ---`);
  const rcCard = await getReportedCommentCardStructure(page);
  console.log(`  Reported Comments card: ${JSON.stringify(rcCard, null, 2)}`);

  await openAssetList(page);
  await setViewport(page, 414);
  await page.waitForTimeout(300);
  const alCard = await getAssetListCardStructure(page);
  console.log(`  Asset List card: ${JSON.stringify(alCard, null, 2)}`);

  if (rcCard && alCard) {
    log(`Card width similar (within 30px)`, Math.abs(rcCard.width - alCard.width) <= 30, `RC=${rcCard.width} AL=${alCard.width}`);
    log(`Both have tags element`, rcCard.hasTags === alCard.hasTags, `RC=${rcCard.hasTags} AL=${alCard.hasTags}`);
    log(`Both have meta element`, rcCard.hasMeta === alCard.hasMeta, `RC=${rcCard.hasMeta} AL=${alCard.hasMeta}`);
  }

  // ===== DETAIL PAGE ON MOBILE (375px) =====
  console.log(`\n--- Detail page on Mobile 375 ---`);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(200);
  await openReportedComments(page);
  await setViewport(page, 375);
  // Open detail for first card
  const firstCardId = await page.locator('[data-reported-comment-card]').first().getAttribute('data-reported-comment-card');
  const detailOpened = await openDetail(page, firstCardId);
  log(`Mobile 375: detail page opens`, detailOpened, `reportId=${firstCardId}`);

  if (detailOpened) {
    const detailMetrics = await page.evaluate(() => {
      const detail = document.querySelector('.reported-comment-detail-page');
      if (!detail) return null;
      const rect = detail.getBoundingClientRect();
      const cs = window.getComputedStyle(detail);
      // Check comment-detail-meta-grid (2 cols) and comment-detail-text-grid (1 col)
      const metaGrid = detail.querySelector('.comment-detail-meta-grid');
      const textGrid = detail.querySelector('.comment-detail-text-grid');
      const metaGridCs = metaGrid ? window.getComputedStyle(metaGrid) : null;
      const textGridCs = textGrid ? window.getComputedStyle(textGrid) : null;
      return {
        width: Math.round(rect.width),
        pageScrollable: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        metaGridColumns: metaGridCs ? metaGridCs.gridTemplateColumns : null,
        textGridColumns: textGridCs ? textGridCs.gridTemplateColumns : null,
      };
    });
    console.log(`  detail metrics: ${JSON.stringify(detailMetrics, null, 2)}`);
    if (detailMetrics) {
      log(`Mobile 375: detail fits viewport (no page scroll)`, !detailMetrics.pageScrollable, `width=${detailMetrics.width}`);
      log(`Mobile 375: comment-detail-meta-grid has 2 columns`, detailMetrics.metaGridColumns && detailMetrics.metaGridColumns.split(' ').length === 2, `cols=${detailMetrics.metaGridColumns}`);
      log(`Mobile 375: comment-detail-text-grid has 1 column`, detailMetrics.textGridColumns && detailMetrics.textGridColumns.split(' ').length === 1, `cols=${detailMetrics.textGridColumns}`);
    }

    // ===== ACTION MODAL ON MOBILE (375px) =====
    console.log(`\n--- Action Modal on Mobile 375 ---`);
    // Try to open an action modal from detail
    const modalOpened = await openActionModalFromDetail(page, "ปิดรายงาน");
    log(`Mobile 375: action modal opens from detail`, modalOpened, ``);

    if (modalOpened) {
      const modalMetrics = await page.evaluate(() => {
        const modal = document.querySelector('#user-action-modal');
        if (!modal) return null;
        const rect = modal.getBoundingClientRect();
        const cs = window.getComputedStyle(modal);
        const modalBody = modal.querySelector('.modal-body, .user-action-modal-body');
        const bodyRect = modalBody ? modalBody.getBoundingClientRect() : null;
        return {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          left: Math.round(rect.left),
          top: Math.round(rect.top),
          pageScrollable: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          bodyWidth: bodyRect ? Math.round(bodyRect.width) : null,
        };
      });
      console.log(`  modal metrics: ${JSON.stringify(modalMetrics, null, 2)}`);
      if (modalMetrics) {
        log(`Mobile 375: modal fits viewport width`, modalMetrics.width <= 375, `width=${modalMetrics.width}`);
        log(`Mobile 375: modal no page-level scroll`, !modalMetrics.pageScrollable, ``);
        log(`Mobile 375: modal visible (left >= 0)`, modalMetrics.left >= 0, `left=${modalMetrics.left}`);
      }
      await closeModal(page);
    }
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
