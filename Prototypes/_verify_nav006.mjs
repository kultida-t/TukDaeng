import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { pathToFileURL } from "url";

const FILE_URL = pathToFileURL("d:/TukDaeng/Prototypes/fo-flow/index.html").href;
const OUT = "d:/TukDaeng/Prototypes/screenshots/task-NAV-006";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

let failed = 0;
const check = (desc, ok) => {
  console.log(`${ok ? "PASS" : "FAIL"}: ${desc}`);
  if (!ok) failed++;
};

// Helper to click visible bottom nav
async function clickNav(page, target) {
  const item = page.locator(`.bottom-nav:visible .nav-item[data-navgo="${target}"]`).first();
  await item.click();
  await page.waitForTimeout(400);
}

// 1. Mobile verification (440x956)
{
  const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // Switch to Board
  await clickNav(page, "board");

  // Check Board Header style
  const bdHeadStyle = await page.locator(".bd-head").first().evaluate(el => {
    const cs = getComputedStyle(el);
    return { position: cs.position, top: cs.top, paddingTop: cs.paddingTop };
  });
  check("Board: Header position is relative (not sticky)", bdHeadStyle.position === "relative");
  check("Board: Header has safe-area top padding >= 38px", parseInt(bdHeadStyle.paddingTop) >= 38);

  // m_01: Board top (Dark)
  await page.screenshot({ path: `${OUT}/m_01_board_top_dark.png` });

  // Scroll board down
  await page.evaluate(() => {
    const scr = document.querySelector(".bd-scroll");
    if (scr) scr.scrollTop = 240;
  });
  await page.waitForTimeout(400);

  // Check no hidden or floating class on board header
  const bdClasses = await page.locator(".bd-head").first().evaluate(el => ({
    hasHidden: el.classList.contains("bd-head-hidden"),
    hasFloating: el.classList.contains("bd-head-floating")
  }));
  check("Board: Header does not have .bd-head-hidden when scrolled", !bdClasses.hasHidden);
  check("Board: Header does not have .bd-head-floating when scrolled", !bdClasses.hasFloating);

  // m_02: Board scrolled down full-screen (Dark)
  await page.screenshot({ path: `${OUT}/m_02_board_scrolled_dark.png` });

  // Open an article to test Article Detail (User's second issue)
  await page.locator(".bd-slide").first().click();
  await page.waitForTimeout(500);

  // Check Article detail nav style
  const bdDnavStyle = await page.locator(".bd-dnav").first().evaluate(el => {
    const cs = getComputedStyle(el);
    return { position: cs.position, paddingTop: cs.paddingTop };
  });
  check("Article Detail: Nav position is relative (not sticky)", bdDnavStyle.position === "relative");
  check("Article Detail: Nav has safe-area top padding >= 38px (no overlap with 9:41)", parseInt(bdDnavStyle.paddingTop) >= 38);

  // m_08: Article detail top (clean, buttons below status bar)
  await page.screenshot({ path: `${OUT}/m_08_article_detail_top.png` });

  // Scroll article down
  await page.evaluate(() => {
    const scr = document.querySelector(".bd-dscroll");
    if (scr) scr.scrollTop = 300;
  });
  await page.waitForTimeout(400);

  // m_09: Article detail scrolled down full-screen (Natural scroll like Feed)
  await page.screenshot({ path: `${OUT}/m_09_article_detail_scrolled.png` });

  // Back to Board
  await page.locator(".bd-dnav .sub-back").first().click();
  await page.waitForTimeout(400);

  // Navigate to Chat
  await clickNav(page, "chat");

  // Check Chat list header style
  const chHeadStyle = await page.locator(".ch-head").first().evaluate(el => {
    const cs = getComputedStyle(el);
    return { position: cs.position, paddingTop: cs.paddingTop };
  });
  check("Chat List: Header position is relative", chHeadStyle.position === "relative");
  check("Chat List: Header has safe-area top padding >= 38px", parseInt(chHeadStyle.paddingTop) >= 38);

  // m_03: Chat list (Dark)
  await page.screenshot({ path: `${OUT}/m_03_chat_list_dark.png` });

  // Open watch.daily chat room (tid = t1)
  await page.locator('.ch-row[data-tid="t1"]').click();
  await page.waitForTimeout(500);

  // Check Chat room header style & padding
  const chRheadStyle = await page.locator(".ch-rhead").first().evaluate(el => {
    const cs = getComputedStyle(el);
    return { paddingTop: cs.paddingTop, minHeight: cs.minHeight };
  });
  check("Chat Room: Header has safe-area top padding >= 38px", parseInt(chRheadStyle.paddingTop) >= 38);

  // Check Chat room input bar padding-bottom
  const chCompStyle = await page.locator(".ch-comp").first().evaluate(el => {
    const cs = getComputedStyle(el);
    return { paddingBottom: cs.paddingBottom, paddingTop: cs.paddingTop };
  });
  check("Chat Room: Input bar has comfortable bottom padding >= 24px", parseInt(chCompStyle.paddingBottom) >= 24);

  // m_04: Chat room (Dark)
  await page.screenshot({ path: `${OUT}/m_04_chat_room_dark.png` });

  // Switch to Light theme
  await page.evaluate(() => {
    document.querySelectorAll(".screen").forEach(s => s.setAttribute("data-theme", "light"));
  });
  await page.waitForTimeout(300);

  // m_05: Chat room (Light)
  await page.screenshot({ path: `${OUT}/m_05_chat_room_light.png` });

  // Back to Chat list
  await page.locator(".ch-rhead .sub-back").first().click();
  await page.waitForTimeout(400);

  // Go to Profile
  await clickNav(page, "profile");

  // Open Settings (User's first issue)
  await page.locator(".pf-menu").first().click();
  await page.waitForTimeout(500);

  // Check Settings header is inside sub-scroll
  const setInScroll = await page.evaluate(() => {
    const scrollEl = document.querySelector(".page-sub .sub-scroll");
    const headEl = scrollEl ? scrollEl.querySelector(".detail-head") : null;
    return !!headEl;
  });
  check("Settings: Header is inside .sub-scroll container (not fixed)", setInScroll);

  // m_10: Settings top (Light)
  await page.screenshot({ path: `${OUT}/m_10_settings_top.png` });

  // Scroll Settings down
  await page.evaluate(() => {
    const scr = document.querySelector(".page-sub .sub-scroll");
    if (scr) scr.scrollTop = 250;
  });
  await page.waitForTimeout(400);

  // m_11: Settings scrolled down (Header scrolls out of view naturally like Feed)
  await page.screenshot({ path: `${OUT}/m_11_settings_scrolled.png` });

  // Back to Profile
  await page.locator(".page-sub .sub-back").first().click();
  await page.waitForTimeout(400);

  // m_06: Profile top (Light)
  await page.screenshot({ path: `${OUT}/m_06_profile_top_light.png` });

  // Scroll profile
  await page.evaluate(() => {
    const scr = document.querySelector(".pf-scroll");
    if (scr) scr.scrollTop = 180;
  });
  await page.waitForTimeout(300);

  // m_07: Profile scrolled (Light)
  await page.screenshot({ path: `${OUT}/m_07_profile_scrolled_light.png` });

  // 8. Item chats pill verification (Dark & Light)
  await clickNav(page, "chat");
  await page.locator('.ch-top-tab[data-chview="item"]').first().click();
  await page.waitForTimeout(400);
  await page.locator('button.ch-row[data-chgo="item"]').first().click();
  await page.waitForTimeout(500);

  // m_12: Item chats pill top
  await page.screenshot({ path: `${OUT}/m_12_item_chats_pill_top.png` });

  // Scroll down 150px
  await page.locator('.page-sub .sub-scroll').evaluate(el => el.scrollTop = 150);
  await page.waitForTimeout(400);

  // Check bounding box of pill card after scroll
  const pillBox = await page.locator('.ch-itemcard').boundingBox();
  const clearsStatusBar = pillBox && pillBox.y >= 38;
  check("Item chats: floating pill clears status bar (9:41) and does not overlap time", clearsStatusBar);

  // m_13: Item chats pill scrolled
  await page.screenshot({ path: `${OUT}/m_13_item_chats_pill_scrolled.png` });

  // 9. Post Viewer: iOS Floating Frosted Glass Navigation Bar (Solo & with Action Button)
  await page.evaluate(() => {
    const scr = document.querySelector('.screen');
    const p1 = POSTS.find(p => p.seller === "Watch 777");
    openPostViewer(scr, [p1], p1.id, 0, false, "Posts", "Watch 777");
  });
  await page.waitForTimeout(500);

  // Check floating glass header styling
  const pvHeaderState = await page.evaluate(() => {
    const head = document.querySelector('.page-pv .detail-head');
    const backBtn = document.querySelector('.page-pv .pv-back');
    const followBtn = document.querySelector('.page-pv .pfp-follow');
    const st = head ? window.getComputedStyle(head) : null;
    const bst = backBtn ? window.getComputedStyle(backBtn) : null;
    return {
      isAbsolute: st && st.position === 'absolute',
      hasBackBtn: !!backBtn,
      backRadius: bst ? bst.borderRadius : '',
      hasFollow: !!followBtn
    };
  });
  check("Post Viewer: Header is floating (position: absolute)", pvHeaderState.isAbsolute);
  check("Post Viewer: Back button is frosted glass circle", pvHeaderState.backRadius.includes("50%"));
  check("Post Viewer: Action button (Follow) exists on right", pvHeaderState.hasFollow);

  // Scroll down in pv-track
  await page.locator('.page-pv .pv-track').evaluate(el => el.scrollTop = 220);
  await page.waitForTimeout(400);

  // Check bounding box of back button and title after scroll
  const backBox = await page.locator('.page-pv .pv-back').boundingBox();
  check("Post Viewer: floating back button clears 9:41 status bar", backBox && backBox.y >= 38);

  // m_14: Post Viewer with Follow Action button (iOS Floating Glass Bar)
  await page.screenshot({ path: `${OUT}/m_14_post_viewer_follow_scrolled.png` });

  // Now test solo title (king.mr.fox - no action button)
  await page.evaluate(() => {
    const scr = document.querySelector('.screen');
    const pMrFox = POSTS.find(p => p.seller === "king.mr.fox") || POSTS[0];
    openPostViewer(scr, [pMrFox], pMrFox.id, 0, false, "Posts", "king.mr.fox");
  });
  await page.waitForTimeout(400);
  await page.locator('.page-pv .pv-track').evaluate(el => el.scrollTop = 220);
  await page.waitForTimeout(300);

  // m_15: Post Viewer Solo Title (iOS Floating Glass Bar without Action button)
  await page.screenshot({ path: `${OUT}/m_15_post_viewer_solo_scrolled.png` });

  // Light mode test
  await page.evaluate(() => document.querySelector('.screen').setAttribute('data-theme', 'light'));
  await page.waitForTimeout(300);

  // m_16: Post Viewer Light Mode (iOS Floating Glass Bar)
  await page.screenshot({ path: `${OUT}/m_16_post_viewer_light.png` });

  await ctx.close();
}

// 2. Tablet verification (768x1024)
{
  const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // Open Article Detail on tablet
  await clickNav(page, "board");
  await page.locator(".bd-slide").first().click();
  await page.waitForTimeout(400);

  // t_01: Article Detail on Tablet
  await page.screenshot({ path: `${OUT}/t_01_article_detail.png` });

  // Back and go to Profile -> Settings on Tablet
  await page.locator(".bd-dnav .sub-back").first().click();
  await page.waitForTimeout(300);
  await clickNav(page, "profile");
  await page.locator(".pf-menu").first().click();
  await page.waitForTimeout(400);

  // t_02: Settings on Tablet
  await page.screenshot({ path: `${OUT}/t_02_settings.png` });

  await ctx.close();
}

// 3. Desktop verification (1920x1080)
{
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // Open Article Detail Desktop Simulator
  await clickNav(page, "board");
  await page.locator(".bd-slide").first().click();
  await page.waitForTimeout(400);

  // d_01: Article detail Desktop Simulator
  await page.screenshot({ path: `${OUT}/d_01_article_detail_desktop.png` });

  // Back and go to Profile -> Settings on Desktop
  await page.locator(".bd-dnav .sub-back").first().click();
  await page.waitForTimeout(300);
  await clickNav(page, "profile");
  await page.locator(".pf-menu").first().click();
  await page.waitForTimeout(400);

  // d_02: Settings Desktop Simulator
  await page.screenshot({ path: `${OUT}/d_02_settings_desktop.png` });

  await ctx.close();
}

await browser.close();

console.log(`\n=============================`);
console.log(`Verification completed with ${failed} failure(s)`);
console.log(`Screenshots saved to: ${OUT}`);
process.exit(failed > 0 ? 1 : 0);
