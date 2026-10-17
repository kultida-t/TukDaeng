import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { pathToFileURL } from "url";

const FILE_URL = pathToFileURL("d:/TukDaeng/Prototypes/fo-flow/index.html").href;
const OUT = "d:/TukDaeng/Prototypes/screenshots/task-BOARD-005";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

let failed = 0;
const check = (desc, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}: ${desc}${extra ? " — " + extra : ""}`);
  if (!ok) failed++;
};

// 1. Mobile verification & screenshots (440x956)
{
  const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // Click Board tab in bottom nav
  await page.locator('.bottom-nav .nav-item[data-navgo="board"]').click();
  await page.waitForTimeout(400);

  // Click View all to go to Latest Articles (boardall)
  await page.locator('.bd-viewall[data-bdall]').click();
  await page.waitForTimeout(400);

  // 1. Verify Header is NOT in DOM for boardall
  const headCount = await page.locator('.sub-scroll .bd-head').count();
  check("Top Header (.bd-head) is removed from Latest Articles view", headCount === 0, `headCount=${headCount}`);

  // 2. Verify Breadcrumb is present
  const crumbText = await page.locator('.bd-crumb').textContent();
  check("Breadcrumb shows Latest Articles", crumbText.includes("Latest Articles"), crumbText);

  // 3. Verify Redundant H1 Latest Articles is REMOVED
  const h1Count = await page.locator('.sub-scroll .bd-rtitle').count();
  check("Redundant H1 (.bd-rtitle) is removed for airy spacious layout", h1Count === 0, `h1Count=${h1Count}`);

  // 4. Verify Breadcrumb font-family
  const crumbFont = await page.locator('.bd-crumb').evaluate(el => window.getComputedStyle(el).fontFamily);
  check("Breadcrumb has system/sans font-family", crumbFont.includes("sans-serif") || crumbFont.includes("Plex") || crumbFont.includes("apple-system"), crumbFont);

  // 5. Verify Pill font-family matches
  const pillFont = await page.locator('.bd-pill').first().evaluate(el => window.getComputedStyle(el).fontFamily);
  check("Pill font-family matches breadcrumb font-family", pillFont === crumbFont, pillFont);

  // 6. Verify Article row font-family matches
  const rowFont = await page.locator('.bd-row .bd-ct').first().evaluate(el => window.getComputedStyle(el).fontFamily);
  check("Article title font-family matches breadcrumb font-family", rowFont === crumbFont, rowFont);

  // 6. Verify Category Pills count and horizontal scroll
  const pillCount = await page.locator('.bd-pills .bd-pill').count();
  check("7 category pills rendered", pillCount === 7, `count=${pillCount}`);

  // Screenshot at top (Dark mode, All category)
  await page.screenshot({ path: `${OUT}/m-01-latest-articles-top-dark.png` });

  // Test scrolling pills horizontally to the right
  await page.locator('.bd-pills').evaluate(el => {
    el.scrollLeft = 280;
  });
  await page.waitForTimeout(250);

  const scrollInfo = await page.locator('.bd-pills').evaluate(el => {
    return {
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      scrollLeft: el.scrollLeft
    };
  });
  check("Category pills container can be scrolled horizontally", scrollInfo.scrollWidth > scrollInfo.clientWidth, `scrollWidth=${scrollInfo.scrollWidth}, clientWidth=${scrollInfo.clientWidth}`);

  // Screenshot scrolled pills
  await page.screenshot({ path: `${OUT}/m-02-latest-articles-pills-scrolled.png` });

  // Click Rolex pill to filter
  await page.locator('.bd-pill[data-bdcat="Rolex"]').click();
  await page.waitForTimeout(300);

  const activePill = await page.locator('.bd-pill.active').textContent();
  check("Active pill is now Rolex", activePill.trim() === "Rolex", activePill);

  // Check filtered rows contain Rolex
  const firstCat = await page.locator('.bd-row .bd-cat').first().textContent();
  check("Filtered articles display Rolex category", firstCat.toUpperCase().includes("ROLEX"), firstCat);

  // Screenshot filtered Rolex
  await page.screenshot({ path: `${OUT}/m-03-latest-articles-rolex-filtered.png` });

  // Switch to light theme
  await page.evaluate(() => {
    const s = document.querySelector(".screen");
    if (s) s.setAttribute("data-theme", "light");
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/m-04-latest-articles-rolex-light.png` });

  // Reset to All category in light theme
  await page.locator('.bd-pill[data-bdcat="All"]').click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/m-05-latest-articles-all-light.png` });

  // Click Industry (last pill) in Light theme - this is the exact bug scenario reported by user
  await page.locator('.bd-pill[data-bdcat="Industry"]').click();
  await page.waitForTimeout(400);

  // Verify that page/container scrollLeft did NOT shift horizontally!
  const shiftCheck = await page.evaluate(() => {
    const sub = document.querySelector(".page-sub");
    const scroll = document.querySelector(".sub-scroll");
    const scr = document.querySelector(".screen");
    const crumb = document.querySelector(".bd-crumb");
    const scrRect = scr ? scr.getBoundingClientRect() : { left: 0 };
    const crumbRect = crumb ? crumb.getBoundingClientRect() : { left: 0 };
    return {
      pageSubScrollLeft: sub ? sub.scrollLeft : 0,
      subScrollScrollLeft: scroll ? scroll.scrollLeft : 0,
      screenScrollLeft: scr ? scr.scrollLeft : 0,
      crumbOffsetFromScreen: crumbRect.left - scrRect.left
    };
  });
  check("Page sub has 0 horizontal scroll", shiftCheck.pageSubScrollLeft === 0, `scrollLeft=${shiftCheck.pageSubScrollLeft}`);
  check("Sub scroll container has 0 horizontal scroll", shiftCheck.subScrollScrollLeft === 0, `scrollLeft=${shiftCheck.subScrollScrollLeft}`);
  check("Screen has 0 horizontal scroll", shiftCheck.screenScrollLeft === 0, `scrollLeft=${shiftCheck.screenScrollLeft}`);
  check("Breadcrumb is properly aligned with screen (not shifted off-screen)", shiftCheck.crumbOffsetFromScreen >= 0 && shiftCheck.crumbOffsetFromScreen <= 25, `offset=${shiftCheck.crumbOffsetFromScreen}`);

  // Screenshot Industry in light mode (reproduction verification)
  await page.screenshot({ path: `${OUT}/m-06-latest-articles-industry-light.png` });

  await ctx.close();
}

// 2. Tablet verification & screenshots (768x1024)
{
  const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  await page.locator('.bottom-nav .nav-item[data-navgo="board"]').click();
  await page.waitForTimeout(400);
  await page.locator('.bd-viewall[data-bdall]').click();
  await page.waitForSelector('.bd-crumb', { timeout: 3000 });
  await page.waitForTimeout(400);

  const hasHead = await page.evaluate(() => !!document.querySelector('.sub-scroll:has(.bd-crumb) .bd-head'));
  check("Tablet: Header not present in Latest Articles", !hasHead);
  await page.screenshot({ path: `${OUT}/t-01-latest-articles-tablet.png` });

  await ctx.close();
}

// 3. Desktop verification & screenshots (1920x1080)
{
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  await page.locator('.bottom-nav .nav-item[data-navgo="board"]').click();
  await page.waitForTimeout(400);
  await page.locator('.bd-viewall[data-bdall]').click();
  await page.waitForSelector('.bd-crumb', { timeout: 3000 });
  await page.waitForTimeout(400);

  const hasHead = await page.evaluate(() => !!document.querySelector('.sub-scroll:has(.bd-crumb) .bd-head'));
  check("Desktop: Header not present in Latest Articles", !hasHead);
  await page.screenshot({ path: `${OUT}/d-01-latest-articles-desktop.png` });

  await ctx.close();
}

await browser.close();

console.log(`\n========================================`);
console.log(`Verification completed with ${failed} failure(s).`);
console.log(`========================================\n`);

process.exit(failed > 0 ? 1 : 0);
