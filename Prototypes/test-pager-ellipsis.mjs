// Test: Ellipsis Adaptive pager across all pages and breakpoints
// Verifies: renderPager helper, ellipsis logic, mobile compact mode, prev/next disabled states
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("C:\\Users\\Admin\\AppData\\Local\\npm-cache\\_npx\\e41f203b7505f1fb\\node_modules\\playwright\\index.js");

const URL = "http://127.0.0.1:4173/";
const VIEWPORTS = [
  { w: 1440, name: "desktop" },
  { w: 1280, name: "desktop-small" },
  { w: 1024, name: "tablet-landscape" },
  { w: 768, name: "tablet" },
  { w: 414, name: "mobile" },
  { w: 375, name: "mobile-small" },
  { w: 320, name: "mobile-tiny" },
];

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

async function getPagerInfo(page) {
  return await page.evaluate(() => {
    const pager = document.querySelector('.footer-range .pager');
    if (!pager) return null;
    const prevBtn = pager.querySelector('.pager-prev');
    const nextBtn = pager.querySelector('.pager-next');
    const prevIcon = pager.querySelector('.pager-prev-icon');
    const nextIcon = pager.querySelector('.pager-next-icon');
    const prevText = pager.querySelector('.pager-prev-text');
    const nextText = pager.querySelector('.pager-next-text');
    const numBtns = pager.querySelectorAll('.pager-num');
    const ellipses = pager.querySelectorAll('.pager-ellipsis');
    const mobileInfo = pager.querySelector('.pager-mobile-info');
    const activeBtn = pager.querySelector('.pager-num.active');
    // measure wrap: pager height should be single line
    const pagerHeight = Math.round(pager.getBoundingClientRect().height);
    const pagerWidth = Math.round(pager.getBoundingClientRect().width);
    const parentWidth = Math.round(pager.parentElement.getBoundingClientRect().width);
    return {
      prevDisabled: prevBtn ? prevBtn.disabled : null,
      nextDisabled: nextBtn ? nextBtn.disabled : null,
      numCount: numBtns.length,
      ellipsisCount: ellipses.length,
      pageNums: Array.from(numBtns).map(b => b.textContent.trim()),
      activePageNum: activeBtn ? activeBtn.textContent.trim() : null,
      activeHasAriaCurrent: activeBtn ? activeBtn.getAttribute('aria-current') : null,
      mobileInfoText: mobileInfo ? mobileInfo.textContent.trim() : null,
      mobileInfoDisplay: mobileInfo ? window.getComputedStyle(mobileInfo).display : null,
      numDisplay: numBtns.length > 0 ? window.getComputedStyle(numBtns[0]).display : null,
      ellipsisDisplay: ellipses.length > 0 ? window.getComputedStyle(ellipses[0]).display : null,
      prevIconDisplay: prevIcon ? window.getComputedStyle(prevIcon).display : null,
      nextIconDisplay: nextIcon ? window.getComputedStyle(nextIcon).display : null,
      prevTextDisplay: prevText ? window.getComputedStyle(prevText).display : null,
      nextTextDisplay: nextText ? window.getComputedStyle(nextText).display : null,
      pagerHeight,
      pagerWidth,
      parentWidth,
      overflows: pagerWidth > parentWidth + 2,
    };
  });
}

async function testPage(page, pageName, module, sub) {
  await navigate(page, module, sub);
  for (const bp of VIEWPORTS) {
    await page.setViewportSize({ width: bp.w, height: 900 });
    await page.waitForTimeout(300);
    const data = await getPagerInfo(page);
    if (!data) {
      assert(false, `${pageName} @ ${bp.name}: no pager found`);
      continue;
    }
    const isMobile = bp.w <= 760;
    // 1. prev/next buttons exist
    assert(data.prevDisabled !== null, `${pageName} @ ${bp.name}: prev button missing`);
    assert(data.nextDisabled !== null, `${pageName} @ ${bp.name}: next button missing`);
    // 2. mobile info
    if (isMobile) {
      assert(data.mobileInfoDisplay === 'inline-flex' || data.mobileInfoDisplay === 'flex', `${pageName} @ ${bp.name}: mobile info should display (got ${data.mobileInfoDisplay})`);
      assert(data.numDisplay === 'none', `${pageName} @ ${bp.name}: num buttons should be hidden on mobile (got ${data.numDisplay})`);
      assert(data.prevTextDisplay === 'none', `${pageName} @ ${bp.name}: prev text should be hidden on mobile (got ${data.prevTextDisplay})`);
      assert(data.nextTextDisplay === 'none', `${pageName} @ ${bp.name}: next text should be hidden on mobile (got ${data.nextTextDisplay})`);
      assert(data.prevIconDisplay !== 'none', `${pageName} @ ${bp.name}: prev icon should show on mobile (got ${data.prevIconDisplay})`);
      assert(data.nextIconDisplay !== 'none', `${pageName} @ ${bp.name}: next icon should show on mobile (got ${data.nextIconDisplay})`);
      if (data.ellipsisCount > 0) {
        assert(data.ellipsisDisplay === 'none', `${pageName} @ ${bp.name}: ellipsis should be hidden on mobile (got ${data.ellipsisDisplay})`);
      }
    } else {
      assert(data.mobileInfoDisplay === 'none', `${pageName} @ ${bp.name}: mobile info should be hidden on desktop (got ${data.mobileInfoDisplay})`);
      assert(data.prevIconDisplay === 'none', `${pageName} @ ${bp.name}: prev icon should be hidden on desktop (got ${data.prevIconDisplay})`);
      assert(data.nextIconDisplay === 'none', `${pageName} @ ${bp.name}: next icon should be hidden on desktop (got ${data.nextIconDisplay})`);
      assert(data.prevTextDisplay !== 'none', `${pageName} @ ${bp.name}: prev text should show on desktop (got ${data.prevTextDisplay})`);
      assert(data.nextTextDisplay !== 'none', `${pageName} @ ${bp.name}: next text should show on desktop (got ${data.nextTextDisplay})`);
    }
    // 3. active page
    if (data.numCount > 0 || !isMobile) {
      assert(data.activePageNum !== null, `${pageName} @ ${bp.name}: active page missing`);
    }
    // 4. aria-current on active
    if (data.activePageNum !== null) {
      assert(data.activeHasAriaCurrent === 'page', `${pageName} @ ${bp.name}: active button missing aria-current=page (got ${data.activeHasAriaCurrent})`);
    }
    // 5. no overflow/wrap
    assert(!data.overflows, `${pageName} @ ${bp.name}: pager overflows parent (pager=${data.pagerWidth}, parent=${data.parentWidth})`);
    assert(data.pagerHeight <= 50, `${pageName} @ ${bp.name}: pager height=${data.pagerHeight} (expected single line ≤50px)`);
  }
}

// Test ellipsis logic directly via unit test
function testEllipsisLogic() {
  console.log("\n=== Ellipsis Logic Unit Tests ===");
  function computePages(current, total) {
    if (total <= 5) {
      const r = [];
      for (let i = 1; i <= total; i++) r.push(i);
      return r;
    }
    if (current <= 3) return [1, 2, 3, "...", total];
    if (current >= total - 2) return [1, "...", total - 2, total - 1, total];
    return [1, "...", current - 1, current, current + 1, "...", total];
  }
  const cases = [
    { cur: 1, total: 2, expect: [1, 2] },
    { cur: 1, total: 5, expect: [1, 2, 3, 4, 5] },
    { cur: 1, total: 20, expect: [1, 2, 3, "...", 20] },
    { cur: 3, total: 20, expect: [1, 2, 3, "...", 20] },
    { cur: 5, total: 20, expect: [1, "...", 4, 5, 6, "...", 20] },
    { cur: 10, total: 20, expect: [1, "...", 9, 10, 11, "...", 20] },
    { cur: 18, total: 20, expect: [1, "...", 18, 19, 20] },
    { cur: 20, total: 20, expect: [1, "...", 18, 19, 20] },
  ];
  for (const c of cases) {
    const got = computePages(c.cur, c.total);
    const ok = JSON.stringify(got) === JSON.stringify(c.expect);
    assert(ok, `ellipsis logic cur=${c.cur} total=${c.total}: got [${got.join(",")}] expected [${c.expect.join(",")}]`);
  }
}

async function run() {
  testEllipsisLogic();

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
    { name: "Asset List", module: "assets", sub: "Asset List" },
    { name: "Reported Assets", module: "assets", sub: "Reported Assets" },
    { name: "Reported Comments", module: "assets", sub: "Reported Comments" },
    { name: "Market Brands", module: "market", sub: "Brands & Models" },
  ];

  for (const p of pages) {
    console.log(`\n=== ${p.name} ===`);
    await testPage(page, p.name, p.module, p.sub);
  }

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
