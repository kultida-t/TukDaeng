// BO-AUDIT-001c: Audit UI/UX 3 module × 4 viewport
// Modules: Content Management, Market Data, Option Master
// Viewports: 390, 768, 1280, 1440
// Read-only — no edits to source.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("C:\\Users\\Admin\\AppData\\Local\\npm-cache\\_npx\\e41f203b7505f1fb\\node_modules\\playwright\\index.js");

const URL = "http://127.0.0.1:4173/";
const VIEWPORTS = [
  { w: 390, name: "390" },
  { w: 768, name: "768" },
  { w: 1280, name: "1280" },
  { w: 1440, name: "1440" },
];

let pass = 0, fail = 0, warn = 0;
const issues = [];

function record(kind, label, detail = "") {
  if (kind === "pass") { pass++; }
  else if (kind === "fail") { fail++; issues.push({ sev: "HIGH", label, detail }); }
  else if (kind === "warn") { warn++; issues.push({ sev: "MED", label, detail }); }
  const mark = kind === "pass" ? "PASS" : kind === "fail" ? "FAIL" : "WARN";
  console.log(`  [${mark}] ${label}${detail ? ` :: ${detail}` : ""}`);
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

// Force-close any open modal + row-menu before navigating.
async function resetOverlays(page) {
  await page.evaluate(() => {
    const modal = document.querySelector('#user-action-modal');
    if (modal) modal.classList.remove('show');
    document.querySelectorAll('details.row-menu[open]').forEach(d => d.removeAttribute('open'));
    document.querySelectorAll('.custom-select.open').forEach(s => s.classList.remove('open'));
  });
  await page.waitForTimeout(150);
}

async function gotoModule(page, module, sub = "") {
  await resetOverlays(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(150);
  const navItem = page.locator(`.nav-item[data-module="${module}"]`).first();
  const isExpanded = await navItem.getAttribute('aria-expanded');
  if (sub) {
    if (isExpanded !== 'true') { await navItem.click(); await page.waitForTimeout(200); }
    await page.locator(`.submenu button[data-module="${module}"][data-sub="${sub}"]`).first().click();
  } else {
    await navItem.click();
  }
  await page.waitForTimeout(450);
}

async function clickEl(page, selector, wait = 400) {
  const el = page.locator(selector).first();
  await el.click({ timeout: 5000 });
  await page.waitForTimeout(wait);
}

// Open the row-menu of a row that CONTAINS the action button, then click the action.
async function rowMenuAction(page, actionSelector, wait = 500) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(150);
  // Find a row-menu whose list contains the action button
  const menuIdx = await page.evaluate((sel) => {
    const menus = document.querySelectorAll('#table details.row-menu');
    for (let i = 0; i < menus.length; i++) {
      if (menus[i].querySelector(sel)) return i;
    }
    return -1;
  }, actionSelector);
  if (menuIdx < 0) throw new Error(`no row-menu contains ${actionSelector}`);
  const summary = page.locator('#table details.row-menu > summary').nth(menuIdx);
  await summary.click({ timeout: 5000 });
  await page.waitForTimeout(250);
  // Click the action button inside the now-open menu
  await page.evaluate(({ idx, sel }) => {
    const menus = document.querySelectorAll('#table details.row-menu');
    const btn = menus[idx]?.querySelector(sel);
    btn?.click();
  }, { idx: menuIdx, sel: actionSelector });
  await page.waitForTimeout(wait);
}

// Collect overflow / clipping metrics for the current screen at a given viewport.
async function metrics(page) {
  return await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const tableEl = document.querySelector('#table');
    const modal = document.querySelector('#user-action-modal');
    const modalInner = modal ? modal.querySelector('.modal.user-action-modal') : null;
    const modalBody = modal ? modal.querySelector('#user-action-modal-body') : null;

    const pageOverflowX = doc.scrollWidth > doc.clientWidth + 1;
    const tableOverflowX = tableEl ? (tableEl.scrollWidth > tableEl.clientWidth + 1) : false;

    const vw = window.innerWidth;
    // Only flag elements that overflow the viewport AND are NOT inside #table (scroll container).
    const overflowEls = [];
    const candidates = document.querySelectorAll(
      '#table .asset-row:not(.head), #table .user-row:not(.head), [data-reported-comment-card], [data-offer-card], ' +
      '.detail-tile, .user-card-meta-item, .article-editor-form, .filters, .user-filter-bar, .summary-card, ' +
      '.panel, .detail-section, .article-card, .category-card, .board-report-card, .market-catalog-row'
    );
    candidates.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const cs = window.getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      // Skip elements inside ANY ancestor with horizontal scroll (intentional scroll containers)
      let p = el.parentElement;
      let inScrollContainer = false;
      while (p && p !== body) {
        const pcs = window.getComputedStyle(p);
        if ((pcs.overflowX === 'auto' || pcs.overflowX === 'scroll') && p.scrollWidth > p.clientWidth + 1) {
          inScrollContainer = true;
          break;
        }
        p = p.parentElement;
      }
      if (inScrollContainer) return;
      if (r.right > vw + 1 || r.left < -1) {
        overflowEls.push({ tag: el.tagName, cls: el.className.slice(0, 60), right: Math.round(r.right), left: Math.round(r.left), vw });
      }
    });

    let modalInfo = null;
    if (modal && modal.classList.contains('show') && modalInner) {
      const mr = modalInner.getBoundingClientRect();
      const mcs = window.getComputedStyle(modalInner);
      modalInfo = {
        visible: true,
        right: Math.round(mr.right),
        left: Math.round(mr.left),
        width: Math.round(mr.width),
        maxHeight: mcs.maxHeight,
        bodyOverflowY: modalBody ? (modalBody.scrollHeight > modalBody.clientHeight + 1) : false,
        overflowsVw: mr.right > vw + 1 || mr.left < -1,
      };
    }

    return {
      vw,
      pageOverflowX,
      tableOverflowX,
      docScrollW: doc.scrollWidth,
      docClientW: doc.clientWidth,
      tableScrollW: tableEl ? tableEl.scrollWidth : null,
      tableClientW: tableEl ? tableEl.clientWidth : null,
      overflowEls: overflowEls.slice(0, 5),
      modalInfo,
    };
  });
}

async function checkScreen(page, screenLabel, viewport) {
  await page.setViewportSize({ width: viewport.w, height: 900 });
  await page.waitForTimeout(300);
  const m = await metrics(page);
  const tag = `${screenLabel} @${viewport.name}`;

  if (m.pageOverflowX) {
    record("fail", `${tag}: page horizontal overflow`, `scrollW=${m.docScrollW} > clientW=${m.docClientW}`);
  } else {
    record("pass", `${tag}: no page horizontal overflow`);
  }
  if (m.tableOverflowX) {
    record("pass", `${tag}: #table scrolls horizontally (intentional for wide tables)`);
  }
  if (m.overflowEls.length) {
    for (const e of m.overflowEls) {
      record("fail", `${tag}: element overflows viewport`, `<${e.tag} class="${e.cls}"> right=${e.right} left=${e.left} vw=${e.vw}`);
    }
  } else {
    record("pass", `${tag}: no element overflows viewport`);
  }
  if (m.modalInfo && m.modalInfo.visible) {
    if (m.modalInfo.overflowsVw) {
      record("fail", `${tag}: modal overflows viewport`, `right=${m.modalInfo.right} left=${m.modalInfo.left} vw=${m.vw}`);
    } else {
      record("pass", `${tag}: modal fits viewport`);
    }
  }
  return m;
}

async function openModalAndCheck(page, openSelector, screenLabel, viewport, useRowMenu = false) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(150);
  try {
    if (useRowMenu) {
      await rowMenuAction(page, openSelector, 350);
    } else {
      await clickEl(page, openSelector, 350);
    }
  } catch (e) {
    record("warn", `${screenLabel}: could not open`, e.message.split("\n")[0]);
    return;
  }
  // verify modal opened
  const isOpen = await page.evaluate(() => document.querySelector('#user-action-modal')?.classList.contains('show'));
  if (!isOpen) {
    record("warn", `${screenLabel}: modal did not open via ${openSelector}`);
    return;
  }
  await checkScreen(page, `${screenLabel} [modal]`, viewport);
  await resetOverlays(page);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await login(page);

  // ============================================================
  // CONTENT MANAGEMENT
  // ============================================================
  console.log("\n=== Content Management > Articles (List) ===");
  await gotoModule(page, "content", "Articles");
  await page.waitForSelector('#table .asset-row:not(.head)', { timeout: 5000 });
  for (const vp of VIEWPORTS) await checkScreen(page, "Article List", vp);

  console.log("\n=== Content Management > Article Detail ===");
  await gotoModule(page, "content", "Articles");
  try {
    await rowMenuAction(page, '[data-article-open]', 500);
    await page.waitForSelector('.detail-section, [data-article-detail]', { timeout: 5000 });
    for (const vp of VIEWPORTS) await checkScreen(page, "Article Detail", vp);
  } catch (e) {
    record("warn", "Article Detail: could not open", e.message.split("\n")[0]);
  }

  console.log("\n=== Content Management > Add Article (editor) ===");
  await gotoModule(page, "content", "Articles");
  try {
    await clickEl(page, '[data-article-add]', 500);
    await page.waitForSelector('[data-article-editor]', { timeout: 5000 });
    for (const vp of VIEWPORTS) await checkScreen(page, "Add Article editor", vp);
    // preview button inside editor
    try {
      await clickEl(page, '[data-article-preview-open]', 350);
      await page.waitForTimeout(400);
      for (const vp of VIEWPORTS) await checkScreen(page, "Article preview", vp);
    } catch (e) {
      record("warn", "Article preview: could not open", e.message.split("\n")[0]);
    }
  } catch (e) {
    record("warn", "Add Article editor: could not open", e.message.split("\n")[0]);
  }

  console.log("\n=== Content Management > Edit Article (editor) ===");
  await gotoModule(page, "content", "Articles");
  try {
    await rowMenuAction(page, '[data-article-edit]', 500);
    await page.waitForSelector('[data-article-editor]', { timeout: 5000 });
    for (const vp of VIEWPORTS) await checkScreen(page, "Edit Article editor", vp);
  } catch (e) {
    record("warn", "Edit Article editor: could not open", e.message.split("\n")[0]);
  }

  console.log("\n=== Content Management > Categories (List) ===");
  await gotoModule(page, "content", "Categories");
  await page.waitForSelector('#table .asset-row:not(.head), [data-category-id]', { timeout: 5000 });
  for (const vp of VIEWPORTS) await checkScreen(page, "Category List", vp);

  console.log("\n=== Content Management > Category Add modal ===");
  await gotoModule(page, "content", "Categories");
  for (const vp of VIEWPORTS) await openModalAndCheck(page, '[data-category-add]', "Category Add modal", vp);

  console.log("\n=== Content Management > Category Edit modal ===");
  await gotoModule(page, "content", "Categories");
  for (const vp of VIEWPORTS) await openModalAndCheck(page, '[data-category-edit]', "Category Edit modal", vp, true);

  console.log("\n=== Content Management > Reported Articles (List) ===");
  await gotoModule(page, "content", "Reported Articles");
  await page.waitForSelector('#table .asset-row:not(.head)', { timeout: 5000 });
  for (const vp of VIEWPORTS) await checkScreen(page, "Reported Articles list", vp);

  console.log("\n=== Content Management > Board Report Detail ===");
  await gotoModule(page, "content", "Reported Articles");
  try {
    await rowMenuAction(page, '[data-board-report-open]', 500);
    await page.waitForSelector('.detail-section', { timeout: 5000 });
    for (const vp of VIEWPORTS) await checkScreen(page, "Board Report Detail", vp);
  } catch (e) {
    record("warn", "Board Report Detail: could not open", e.message.split("\n")[0]);
  }

  // ============================================================
  // MARKET DATA
  // ============================================================
  console.log("\n=== Market Data > Dashboard ===");
  await gotoModule(page, "market", "Dashboard");
  await page.waitForTimeout(400);
  for (const vp of VIEWPORTS) await checkScreen(page, "Market Dashboard", vp);

  console.log("\n=== Market Data > Brands & Models (list) ===");
  await gotoModule(page, "market", "Brands & Models");
  await page.waitForSelector('[data-market-brand]', { timeout: 5000 });
  for (const vp of VIEWPORTS) await checkScreen(page, "Brands & Models list", vp);

  console.log("\n=== Market Data > Brand drilldown (models) ===");
  await gotoModule(page, "market", "Brands & Models");
  try {
    await clickEl(page, '[data-market-brand].market-arrow-action', 500);
    await page.waitForSelector('[data-market-model], #market-model-search', { timeout: 5000 });
    for (const vp of VIEWPORTS) await checkScreen(page, "Brand drilldown", vp);
  } catch (e) {
    record("warn", "Brand drilldown: could not open", e.message.split("\n")[0]);
  }

  console.log("\n=== Market Data > Model drilldown (references) ===");
  try {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(150);
    await clickEl(page, '[data-market-model].market-arrow-action', 500);
    await page.waitForSelector('[data-market-reference], #market-reference-search', { timeout: 5000 });
    for (const vp of VIEWPORTS) await checkScreen(page, "Model drilldown", vp);
  } catch (e) {
    record("warn", "Model drilldown: could not open", e.message.split("\n")[0]);
  }

  console.log("\n=== Market Data > Sync History (list) ===");
  await gotoModule(page, "market", "Sync History");
  await page.waitForSelector('[data-market-record]', { timeout: 5000 });
  for (const vp of VIEWPORTS) await checkScreen(page, "Sync History list", vp);

  console.log("\n=== Market Data > Sync log detail page ===");
  await gotoModule(page, "market", "Sync History");
  try {
    await clickEl(page, '[data-market-record].market-arrow-action', 500);
    await page.waitForSelector('.market-brand-detail, .detail-tile, .market-detail-grid', { timeout: 5000 });
    for (const vp of VIEWPORTS) await checkScreen(page, "Sync log detail page", vp);
  } catch (e) {
    record("warn", "Sync log detail page: could not open", e.message.split("\n")[0]);
  }

  // ============================================================
  // OPTION MASTER
  // ============================================================
  console.log("\n=== Option Master > Option Group List ===");
  await gotoModule(page, "option-master");
  await page.waitForSelector('[data-option-group]', { timeout: 5000 });
  for (const vp of VIEWPORTS) await checkScreen(page, "Option Group List", vp);

  console.log("\n=== Option Master > Add Group modal ===");
  await gotoModule(page, "option-master");
  for (const vp of VIEWPORTS) await openModalAndCheck(page, '[data-option-group-add-open]', "Add Group modal", vp);

  console.log("\n=== Option Master > Edit Group modal ===");
  await gotoModule(page, "option-master");
  for (const vp of VIEWPORTS) await openModalAndCheck(page, '[data-option-group-edit]', "Edit Group modal", vp, true);

  console.log("\n=== Option Master > Deactivate Group modal ===");
  await gotoModule(page, "option-master");
  for (const vp of VIEWPORTS) await openModalAndCheck(page, '[data-option-group-deactivate]', "Deactivate Group modal", vp, true);

  console.log("\n=== Option Master > Reactivate Group modal ===");
  await gotoModule(page, "option-master");
  for (const vp of VIEWPORTS) await openModalAndCheck(page, '[data-option-group-reactivate]', "Reactivate Group modal", vp, true);

  console.log("\n=== Option Master > Delete Group modal ===");
  await gotoModule(page, "option-master");
  for (const vp of VIEWPORTS) await openModalAndCheck(page, '[data-option-group-delete]', "Delete Group modal", vp, true);

  console.log("\n=== Option Master > Group Audit Log view ===");
  await gotoModule(page, "option-master");
  try {
    await rowMenuAction(page, '[data-option-group-audit-open]', 500);
    await page.waitForSelector('#user-action-modal.show', { timeout: 5000 });
    for (const vp of VIEWPORTS) await checkScreen(page, "Group Audit Log", vp);
    await resetOverlays(page);
  } catch (e) {
    record("warn", "Group Audit Log: could not open", e.message.split("\n")[0]);
  }

  console.log("\n=== Option Master > Reorder Groups modal ===");
  await gotoModule(page, "option-master");
  for (const vp of VIEWPORTS) await openModalAndCheck(page, '[data-option-group-reorder-open]', "Reorder Groups modal", vp);

  console.log("\n=== Option Master > Option Detail (inside group) ===");
  await gotoModule(page, "option-master");
  try {
    await rowMenuAction(page, '[data-option-group-view]', 500);
    await page.waitForSelector('[data-option-view], .option-detail', { timeout: 5000 });
    for (const vp of VIEWPORTS) await checkScreen(page, "Option Detail", vp);
  } catch (e) {
    record("warn", "Option Detail: could not open", e.message.split("\n")[0]);
  }

  console.log("\n=== Option Master > Add Option modal ===");
  await gotoModule(page, "option-master");
  try {
    await rowMenuAction(page, '[data-option-group-view]', 400);
    await page.waitForTimeout(300);
    for (const vp of VIEWPORTS) await openModalAndCheck(page, '[data-option-add-open]', "Add Option modal", vp);
  } catch (e) {
    record("warn", "Add Option modal: could not open", e.message.split("\n")[0]);
  }

  console.log("\n=== Option Master > Edit Option modal ===");
  await gotoModule(page, "option-master");
  try {
    await rowMenuAction(page, '[data-option-group-view]', 400);
    await page.waitForTimeout(300);
    for (const vp of VIEWPORTS) await openModalAndCheck(page, '[data-option-edit]', "Edit Option modal", vp, true);
  } catch (e) {
    record("warn", "Edit Option modal: could not open", e.message.split("\n")[0]);
  }

  console.log("\n=== Option Master > Deactivate Option modal ===");
  await gotoModule(page, "option-master");
  try {
    await rowMenuAction(page, '[data-option-group-view]', 400);
    await page.waitForTimeout(300);
    for (const vp of VIEWPORTS) await openModalAndCheck(page, '[data-option-deactivate]', "Deactivate Option modal", vp, true);
  } catch (e) {
    record("warn", "Deactivate Option modal: could not open", e.message.split("\n")[0]);
  }

  console.log("\n=== Option Master > Reorder Options modal ===");
  await gotoModule(page, "option-master");
  try {
    await rowMenuAction(page, '[data-option-group-view]', 400);
    await page.waitForTimeout(300);
    for (const vp of VIEWPORTS) await openModalAndCheck(page, '[data-option-reorder-open]', "Reorder Options modal", vp);
  } catch (e) {
    record("warn", "Reorder Options modal: could not open", e.message.split("\n")[0]);
  }

  await browser.close();

  console.log(`\n=== RESULTS ===`);
  console.log(`Pass: ${pass}, Warn: ${warn}, Fail: ${fail}`);
  if (issues.length) {
    console.log(`\nIssues (${issues.length}):`);
    issues.forEach(i => console.log(`  [${i.sev}] ${i.label}${i.detail ? ` :: ${i.detail}` : ""}`));
  }
  if (fail > 0) process.exit(1);
}

run().catch(e => { console.error(e); process.exit(1); });
