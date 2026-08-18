// Diagnostic: check pager rendering on desktop and mobile across all pages
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
    const activeBtn = pager.querySelector('.pager-num.active, .btn.active');
    return {
      prevDisabled: prevBtn ? prevBtn.disabled : null,
      nextDisabled: nextBtn ? nextBtn.disabled : null,
      numCount: numBtns.length,
      ellipsisCount: ellipses.length,
      hasMobileInfo: !!mobileInfo,
      mobileInfoText: mobileInfo ? mobileInfo.textContent.trim() : null,
      mobileInfoDisplay: mobileInfo ? window.getComputedStyle(mobileInfo).display : null,
      numDisplay: numBtns.length > 0 ? window.getComputedStyle(numBtns[0]).display : null,
      ellipsisDisplay: ellipses.length > 0 ? window.getComputedStyle(ellipses[0]).display : null,
      prevIconDisplay: prevIcon ? window.getComputedStyle(prevIcon).display : null,
      nextIconDisplay: nextIcon ? window.getComputedStyle(nextIcon).display : null,
      prevTextDisplay: prevText ? window.getComputedStyle(prevText).display : null,
      nextTextDisplay: nextText ? window.getComputedStyle(nextText).display : null,
      prevTextContent: prevText ? prevText.textContent.trim() : null,
      nextTextContent: nextText ? nextText.textContent.trim() : null,
      activePageNum: activeBtn ? activeBtn.textContent.trim() : null,
      pageNums: Array.from(numBtns).map(b => b.textContent.trim()),
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
    { name: "Asset List", module: "assets", sub: "Asset List" },
    { name: "Reported Assets", module: "assets", sub: "Reported Assets" },
    { name: "Reported Comments", module: "assets", sub: "Reported Comments" },
    { name: "Market Brands", module: "market", sub: "Brands & Models" },
  ];

  for (const p of pages) {
    await navigate(page, p.module, p.sub);
    for (const bp of [{ w: 1440, name: "desktop" }, { w: 414, name: "mobile" }]) {
      await page.setViewportSize({ width: bp.w, height: 900 });
      await page.waitForTimeout(300);
      const data = await getPagerInfo(page);
      if (!data) {
        console.log(`\n=== ${p.name} @ ${bp.name} === NO PAGER`);
        continue;
      }
      console.log(`\n=== ${p.name} @ ${bp.name} ===`);
      console.log(`  nums: [${data.pageNums.join(",")}] (${data.numDisplay}) ellipsis: ${data.ellipsisCount} (${data.ellipsisDisplay})`);
      console.log(`  prev: text="${data.prevTextContent}"(${data.prevTextDisplay}) icon=(${data.prevIconDisplay}) disabled=${data.prevDisabled}`);
      console.log(`  next: text="${data.nextTextContent}"(${data.nextTextDisplay}) icon=(${data.nextIconDisplay}) disabled=${data.nextDisabled}`);
      console.log(`  mobileInfo: "${data.mobileInfoText}" display=${data.mobileInfoDisplay} | active: ${data.activePageNum}`);
    }
  }
  await browser.close();
}
run().catch(e => { console.error(e); process.exit(1); });
