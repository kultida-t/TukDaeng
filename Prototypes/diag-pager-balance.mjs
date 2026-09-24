// Diagnostic: measure mobile pager layout balance
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

async function measurePager(page) {
  return await page.evaluate(() => {
    const pager = document.querySelector('.footer-range .pager');
    if (!pager) return null;
    const prev = pager.querySelector('.pager-prev');
    const next = pager.querySelector('.pager-next');
    const info = pager.querySelector('.pager-mobile-info');
    if (!prev || !next || !info) return null;
    const pb = prev.getBoundingClientRect();
    const nb = next.getBoundingClientRect();
    const ib = info.getBoundingClientRect();
    const pagerBox = pager.getBoundingClientRect();
    // center of prev button right edge to next button left edge
    const gapStart = pb.right;
    const gapEnd = nb.left;
    const gapWidth = gapEnd - gapStart;
    const infoCenter = ib.left + ib.width / 2;
    const gapCenter = gapStart + gapWidth / 2;
    const offset = Math.round(infoCenter - gapCenter);
    return {
      prevLeft: Math.round(pb.left),
      prevRight: Math.round(pb.right),
      prevWidth: Math.round(pb.width),
      nextLeft: Math.round(nb.left),
      nextRight: Math.round(nb.right),
      nextWidth: Math.round(nb.width),
      infoLeft: Math.round(ib.left),
      infoRight: Math.round(ib.right),
      infoWidth: Math.round(ib.width),
      infoCenter: Math.round(infoCenter),
      gapStart: Math.round(gapStart),
      gapEnd: Math.round(gapEnd),
      gapWidth: Math.round(gapWidth),
      gapCenter: Math.round(gapCenter),
      offsetFromCenter: offset,
      pagerWidth: Math.round(pagerBox.width),
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
    { name: "Offer List", module: "offers", sub: "" },
    { name: "Asset List", module: "assets", sub: "Asset List" },
    { name: "Market Brands", module: "market", sub: "Brands & Models" },
  ];

  for (const p of pages) {
    await navigate(page, p.module, p.sub);
    for (const bp of [{ w: 414, name: "414" }, { w: 375, name: "375" }, { w: 320, name: "320" }]) {
      await page.setViewportSize({ width: bp.w, height: 900 });
      await page.waitForTimeout(300);
      const m = await measurePager(page);
      if (!m) { console.log(`${p.name} @ ${bp.name}: no pager`); continue; }
      console.log(`\n=== ${p.name} @ ${bp.name} ===`);
      console.log(`  pager width: ${m.pagerWidth}px`);
      console.log(`  prev: [${m.prevLeft}, ${m.prevRight}] w=${m.prevWidth}`);
      console.log(`  next: [${m.nextLeft}, ${m.nextRight}] w=${m.nextWidth}`);
      console.log(`  info: [${m.infoLeft}, ${m.infoRight}] w=${m.infoWidth} center=${m.infoCenter}`);
      console.log(`  gap:  [${m.gapStart}, ${m.gapEnd}] w=${m.gapWidth} center=${m.gapCenter}`);
      console.log(`  offset from center: ${m.offsetFromCenter}px ${Math.abs(m.offsetFromCenter) <= 2 ? "OK" : "OFF-CENTER"}`);
    }
  }
  await browser.close();
}
run().catch(e => { console.error(e); process.exit(1); });
