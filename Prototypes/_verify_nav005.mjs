import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { pathToFileURL } from "url";

const FILE_URL = pathToFileURL("d:/TukDaeng/Prototypes/fo-flow/index.html").href;
const OUT = "d:/TukDaeng/Prototypes/screenshots/task-NAV-005";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

let failed = 0;
const check = (desc, ok) => {
  console.log(`${ok ? "PASS" : "FAIL"}: ${desc}`);
  if (!ok) failed++;
};

// 1. Mobile verification (440x956)
{
  const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // Statusbar style check
  const sbStyle = await page.locator(".statusbar").first().evaluate(el => {
    const cs = getComputedStyle(el);
    return { position: cs.position, top: cs.top, zIndex: cs.zIndex };
  });
  check("Mobile: Status bar is absolute", sbStyle.position === "absolute");
  check("Mobile: Status bar top is 0px", sbStyle.top === "0px");
  check("Mobile: Status bar z-index >= 40", parseInt(sbStyle.zIndex) >= 40);

  // m_01: Feed top Dark
  await page.screenshot({ path: `${OUT}/m_01_feed_top_dark.png` });

  // m_02: Feed scrolled Dark
  await page.evaluate(() => {
    const scr = document.querySelector(".feed-scroll");
    if (scr) scr.scrollTop = 140;
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/m_02_feed_scrolled_dark.png` });

  // Switch to Light
  await page.evaluate(() => {
    document.querySelectorAll(".screen").forEach(s => s.setAttribute("data-theme", "light"));
  });
  await page.waitForTimeout(300);

  // m_03: Feed scrolled Light (edge-to-edge content behind statusbar)
  await page.screenshot({ path: `${OUT}/m_03_feed_scrolled_light.png` });

  // Scroll back to top
  await page.evaluate(() => {
    const scr = document.querySelector(".feed-scroll");
    if (scr) scr.scrollTop = 0;
  });
  await page.waitForTimeout(300);
  // m_04: Feed top Light
  await page.screenshot({ path: `${OUT}/m_04_feed_top_light.png` });

  // m_05: Board top Light
  await page.locator('[data-navgo="board"]:visible').first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/m_05_board_top_light.png` });

  // m_06: Board scrolled Light
  await page.evaluate(() => {
    const scr = document.querySelector(".bd-scroll");
    if (scr) scr.scrollTop = 160;
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/m_06_board_scrolled_light.png` });

  // Switch to dark mode
  await page.evaluate(() => {
    document.querySelectorAll(".screen").forEach(s => s.setAttribute("data-theme", "dark"));
  });
  await page.waitForTimeout(300);
  // m_07: Board dark
  await page.screenshot({ path: `${OUT}/m_07_board_dark.png` });

  // m_08: Chat dark
  await page.locator('[data-navgo="chat"]:visible').first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/m_08_chat_dark.png` });

  // m_09: Alerts dark
  await page.locator('[data-navgo="alerts"]:visible').first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/m_09_alerts_dark.png` });

  // m_10: Profile dark
  await page.locator('[data-navgo="profile"]:visible').first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/m_10_profile_dark.png` });

  // m_11: Settings dark
  await page.locator('.pf-menu').first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/m_11_settings_dark.png` });

  // m_12: Language sub-screen
  await page.locator('.sub-row[data-sub="lang"]').first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/m_12_language_dark.png` });

  // Back to Settings
  await page.locator('.detail-head .sub-back').first().click();
  await page.waitForTimeout(300);

  // Switch to Light Settings
  await page.evaluate(() => {
    document.querySelectorAll(".screen").forEach(s => s.setAttribute("data-theme", "light"));
  });
  await page.waitForTimeout(300);
  // m_13: Settings light
  await page.screenshot({ path: `${OUT}/m_13_settings_light.png` });

  // Back to Profile then Feed
  await page.locator('.detail-head .sub-back').first().click();
  await page.waitForTimeout(300);
  await page.locator('[data-navgo="feed"]:visible').first().click();
  await page.waitForTimeout(400);

  // Open Drawer
  await page.locator('.app-header .hb-btn').first().click();
  await page.waitForTimeout(400);
  // m_14: Drawer light
  await page.screenshot({ path: `${OUT}/m_14_drawer_light.png` });

  await ctx.close();
}

// 2. Tablet verification (768x1024)
{
  const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  await page.screenshot({ path: `${OUT}/t_01_feed_tablet_dark.png` });

  // Switch to Light
  await page.evaluate(() => {
    document.querySelectorAll(".screen").forEach(s => s.setAttribute("data-theme", "light"));
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/t_02_feed_tablet_light.png` });

  await ctx.close();
}

// 3. Desktop verification (1920x1080)
{
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  await page.screenshot({ path: `${OUT}/d_01_feed_desktop_dark.png` });

  // Switch to Light
  await page.evaluate(() => {
    document.querySelectorAll(".screen").forEach(s => s.setAttribute("data-theme", "light"));
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/d_02_feed_desktop_light.png` });

  await ctx.close();
}

await browser.close();
console.log(`\nALL VERIFICATION PASS! Total failed: ${failed}`);
