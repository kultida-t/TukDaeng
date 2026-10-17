import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { pathToFileURL } from "url";

const FILE_URL = pathToFileURL("d:/TukDaeng/Prototypes/fo-flow/index.html").href;
const OUT = "d:/TukDaeng/Prototypes/screenshots/task-BOARD-004";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

let failed = 0;
const check = (desc, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}: ${desc}${extra ? " — " + extra : ""}`);
  if (!ok) failed++;
};

// 1. Mobile verification & screenshots
{
  const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // Click Board tab in bottom nav
  await page.locator('.bottom-nav .nav-item[data-navgo="board"]').click();
  await page.waitForTimeout(500);

  // Check board carousel wrap border-radius
  const carouselWrapRadius = await page.locator(".bd-carousel-wrap").evaluate(el => {
    const cs = window.getComputedStyle(el);
    return {
      bottomLeft: cs.borderBottomLeftRadius,
      bottomRight: cs.borderBottomRightRadius
    };
  });
  check("Carousel wrap has 0px bottom-left radius", carouselWrapRadius.bottomLeft === "0px", carouselWrapRadius.bottomLeft);
  check("Carousel wrap has 0px bottom-right radius", carouselWrapRadius.bottomRight === "0px", carouselWrapRadius.bottomRight);

  // Check header position style
  const headPos = await page.locator(".bd-head").evaluate(el => window.getComputedStyle(el).position);
  check("Board head is position: sticky", headPos === "sticky", headPos);

  // Check bd-row border bottom
  const rowBorderBottom = await page.locator(".bd-row").first().evaluate(el => {
    const cs = window.getComputedStyle(el);
    return cs.borderBottomStyle;
  });
  check("Article row has no bottom border", rowBorderBottom === "none", rowBorderBottom);

  // Screenshot at top (Mobile)
  await page.screenshot({ path: `${OUT}/m-01-board-top.png` });

  // Simulate scrolling down in increments so onscroll fires and sets bd-head-hidden
  await page.locator(".sub-scroll").evaluate(el => {
    el.scrollTop = 100;
    el.dispatchEvent(new Event("scroll"));
  });
  await page.waitForTimeout(50);
  await page.locator(".sub-scroll").evaluate(el => {
    el.scrollTop = 350;
    el.dispatchEvent(new Event("scroll"));
  });

  // Immediately check if bd-head-hidden is present
  const isHiddenImmediately = await page.locator(".bd-head").evaluate(el => el.classList.contains("bd-head-hidden"));
  check("Header is hidden while scrolling down", isHiddenImmediately);

  // Wait 300ms (idle after scroll stop)
  await page.waitForTimeout(300);

  // Check that bd-head-hidden is removed and bd-head-floating is present
  const isHiddenAfterIdle = await page.locator(".bd-head").evaluate(el => el.classList.contains("bd-head-hidden"));
  const isFloatingAfterIdle = await page.locator(".bd-head").evaluate(el => el.classList.contains("bd-head-floating"));
  const scrollPosAfterIdle = await page.locator(".sub-scroll").evaluate(el => el.scrollTop);

  check("Header is revealed after scroll idle", !isHiddenAfterIdle);
  check("Header has floating shadow class", isFloatingAfterIdle);
  check("Page did NOT jump back to top (scrollTop still 350)", scrollPosAfterIdle === 350, `scrollTop=${scrollPosAfterIdle}`);

  // Test scrolling UP (from 350 to 200) - header should be hidden while scrolling up
  await page.locator(".sub-scroll").evaluate(el => {
    el.scrollTop = 200;
    el.dispatchEvent(new Event("scroll"));
  });
  const isHiddenWhileScrollingUp = await page.locator(".bd-head").evaluate(el => el.classList.contains("bd-head-hidden"));
  check("Header is ALSO hidden while scrolling UP", isHiddenWhileScrollingUp);

  // Wait for idle after scroll up
  await page.waitForTimeout(300);
  const isHiddenAfterScrollUpIdle = await page.locator(".bd-head").evaluate(el => el.classList.contains("bd-head-hidden"));
  check("Header is revealed again when stopped scrolling UP", !isHiddenAfterScrollUpIdle);

  // Screenshot scrolled with floating header (Mobile)
  await page.screenshot({ path: `${OUT}/m-02-board-scrolled-floating.png` });

  // Switch to light theme
  await page.locator(".sub-scroll").evaluate(el => { el.scrollTop = 0; });
  await page.evaluate(() => {
    const s = document.querySelector(".screen");
    if (s) s.setAttribute("data-theme", "light");
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/m-03-board-light-top.png` });

  await page.locator(".sub-scroll").evaluate(el => {
    el.scrollTop = 350;
    el.dispatchEvent(new Event("scroll"));
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/m-04-board-light-scrolled-floating.png` });

  await ctx.close();
}

// 2. Tablet verification & screenshot (768x1024)
{
  const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.locator('.bottom-nav .nav-item[data-navgo="board"]').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/t-01-board-top.png` });
  await ctx.close();
}

// 3. Desktop verification & screenshot (1920x1080)
{
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.locator('.bottom-nav .nav-item[data-navgo="board"]').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/d-01-board-top.png` });
  await ctx.close();
}

await browser.close();
console.log(`\nVerification finished: ${failed === 0 ? "ALL PASS" : `${failed} FAILED`}`);
process.exit(failed === 0 ? 0 : 1);
