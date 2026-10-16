import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";
import { pathToFileURL } from "url";
import path from "path";

const OUT = path.join(process.cwd(), "Prototypes/screenshots/task-CHAT-005/after");
const DELIV = path.join(process.cwd(), "Prototypes/deliverables/task-CHAT-005");
mkdirSync(OUT, { recursive: true });
mkdirSync(DELIV, { recursive: true });

const FILE_URL = pathToFileURL(path.join(process.cwd(), "Prototypes/fo-flow/index.html")).href;

let failed = 0;
const results = [];
function check(name, ok, msg = "") {
  const line = `${ok ? "PASS" : "FAIL"}: ${name}${msg ? " — " + msg : ""}`;
  console.log(line);
  results.push(line);
  if (!ok) failed++;
}

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
});

// 1. Detailed functional verification on Mobile (440x956)
{
  const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  let pageErrors = 0;
  page.on("pageerror", e => { console.error("PAGE ERR:", e.message); pageErrors++; });

  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  // Navigate to Chat
  await page.locator('.bottom-nav .nav-item[data-navgo="chat"]').first().click();
  await page.waitForTimeout(300);

  // Click on watch.daily chat room (tid = t1)
  await page.locator('.ch-row[data-tid="t1"]').click();
  await page.waitForTimeout(300);

  // Check initial state: input is present
  const hasCompBefore = await page.locator(".ch-comp").isVisible();
  check("Chat room has input bar initially", hasCompBefore);

  // Open Chat Room Menu
  await page.locator('button[data-chgo="more"]').click();
  await page.waitForTimeout(300);

  // Check Block button exists and is not active
  const blockBtn = page.locator('button[data-chact="block-user"]');
  const isBlockActiveBefore = await blockBtn.evaluate(el => el.classList.contains("active"));
  check("Block button is not active before blocking", !isBlockActiveBefore);

  // Click Block button -> opens bottom sheet
  await blockBtn.click();
  await page.waitForTimeout(300);

  const blkSheet = page.locator(".blk-body");
  check("Block confirmation sheet is open", await blkSheet.isVisible());

  // Click "Block" in sheet
  await page.locator(".blk-go").click();
  await page.waitForTimeout(400);

  // Menu re-rendered: Block button should now be "Unblock" and active red
  const unblockBtnText = await page.locator('button[data-chact="block-user"] .ch-menu-act-label').textContent();
  const isBlockActiveAfter = await page.locator('button[data-chact="block-user"]').evaluate(el => el.classList.contains("active"));
  check("Block button label switched to Unblock", unblockBtnText.trim() === "Unblock", unblockBtnText);
  check("Unblock button has active class", isBlockActiveAfter);

  // Go back to Chat Room
  await page.locator(".sub-back").first().click();
  await page.waitForTimeout(300);

  // Check Chat Room: .ch-comp is replaced by .ch-blocked-bar
  const hasCompAfter = await page.locator(".ch-comp").isVisible();
  const hasBlockedBar = await page.locator(".ch-blocked-bar").isVisible();
  check("Chat room hides message input bar when user is blocked", !hasCompAfter);
  check("Chat room displays .ch-blocked-bar with Unblock button", hasBlockedBar);

  const blockedTitle = await page.locator(".ch-blocked-title").textContent();
  check("Blocked bar shows warning title", blockedTitle.includes("You blocked this account"), blockedTitle);

  // Take screenshot: Mobile view of blocked chat room
  await page.screenshot({ path: path.join(OUT, "m-440-chat-room-blocked.png") });
  await page.screenshot({ path: path.join(DELIV, "m-440-chat-room-blocked.png") });

  // Go back to Chat List
  await page.locator(".sub-back").first().click();
  await page.waitForTimeout(300);

  // Check Chat List: watch.daily shows "Blocked" badge
  const blkBadge = await page.locator('.ch-row[data-tid="t1"] .ch-blk-badge').textContent();
  check("Chat list row shows Blocked badge", blkBadge.trim() === "Blocked", blkBadge);

  await page.screenshot({ path: path.join(OUT, "m-440-chat-list-blocked.png") });
  await page.screenshot({ path: path.join(DELIV, "m-440-chat-list-blocked.png") });

  // Re-enter watch.daily chat room
  await page.locator('.ch-row[data-tid="t1"]').click();
  await page.waitForTimeout(300);

  // Test Unblock directly from chat room banner
  await page.locator(".ch-blocked-unblock-btn").click();
  await page.waitForTimeout(300);

  const dlgOpen = await page.locator(".dialog-open").isVisible();
  check("Unblock confirmation dialog opened from chat room", dlgOpen);

  // Confirm Unblock
  await page.locator(".dlg-unblock-go").click();
  await page.waitForTimeout(400);

  // Check that chat room input bar is restored
  const hasCompRestored = await page.locator(".ch-comp").isVisible();
  const hasBlockedBarGone = !(await page.locator(".ch-blocked-bar").isVisible());
  check("Chat input bar is restored after Unblock", hasCompRestored);
  check("Blocked bar is removed after Unblock", hasBlockedBarGone);

  await page.screenshot({ path: path.join(OUT, "m-440-chat-room-unblocked.png") });
  await page.screenshot({ path: path.join(DELIV, "m-440-chat-room-unblocked.png") });

  // Now test Profile flow when blocked
  // Re-block watch.daily via menu
  await page.locator('button[data-chgo="more"]').click();
  await page.waitForTimeout(300);
  await page.locator('button[data-chact="block-user"]').click();
  await page.waitForTimeout(300);
  await page.locator(".blk-go").click();
  await page.waitForTimeout(400);

  // Click "Profile" from chat menu
  await page.locator('button[data-pf-user="watch.daily"]').click();
  await page.waitForTimeout(400);

  // Check Profile: Unblock button is full width, Message button is absent, posts grid shows "No posts yet"
  const hasPfUnblock = await page.locator(".pf-unblock").isVisible();
  const hasPfMsg = await page.locator(".pf-msg").isVisible();
  const pfEmptyText = await page.locator(".pf-et").textContent();
  check("Profile shows Unblock button when blocked", hasPfUnblock);
  check("Profile hides Message button when blocked", !hasPfMsg);
  check("Profile posts grid shows 'No posts yet'", pfEmptyText.includes("No posts yet"), pfEmptyText);

  await page.screenshot({ path: path.join(OUT, "m-440-profile-blocked.png") });
  await page.screenshot({ path: path.join(DELIV, "m-440-profile-blocked.png") });

  // Click Unblock on Profile
  await page.locator(".pf-unblock").click();
  await page.waitForTimeout(300);
  await page.locator(".dlg-unblock-go").click();
  await page.waitForTimeout(400);

  // Verify profile restored: Follow button and Message button back, posts back
  const hasPfFollowRestored = await page.locator(".pf-foll").isVisible();
  const hasPfMsgRestored = await page.locator(".pf-msg").isVisible();
  const tilesCount = await page.locator(".pf-tile").count();
  check("Profile Follow button restored", hasPfFollowRestored);
  check("Profile Message button restored", hasPfMsgRestored);
  check("Profile posts grid restored", tilesCount > 0, `${tilesCount} tiles`);

  // Test case requested by user: Settings -> Blocked -> Profile -> Unblock -> Back
  // 1. Block watch.daily again
  await page.locator(".pf-more").click();
  await page.waitForTimeout(300);
  await page.locator(".pf-sh-block").click();
  await page.waitForTimeout(300);
  await page.locator(".blk-go").click();
  await page.waitForTimeout(400);

  // Close sub stack and navigate to Profile Tab -> Settings -> Blocked
  await page.evaluate(() => {
    const scr = document.querySelector(".screen");
    scr._subStack = [];
    scr.classList.remove("sub-open");
  });
  await page.waitForTimeout(200);
  await page.locator('.bottom-nav .nav-item[data-navgo="profile"]').first().click();
  await page.waitForTimeout(300);

  // Open settings
  await page.locator(".pf-menu").click();
  await page.waitForTimeout(300);

  // Click "Blocked" in settings
  await page.locator('[data-sub="blocked"]').click();
  await page.waitForTimeout(300);

  // Click on watch.daily in Blocked profiles list
  await page.locator('.mrow[data-pf-user="watch.daily"]').click();
  await page.waitForTimeout(400);

  // Click Unblock on Profile
  await page.locator(".pf-unblock").click();
  await page.waitForTimeout(300);
  await page.locator(".dlg-unblock-go").click();
  await page.waitForTimeout(400);

  // Click < back button on Profile
  await page.locator(".page-sub:not(.pg-ghost) .sub-back").first().click();
  await page.waitForTimeout(400);

  // Verify: page-sub does NOT slide in as a new page (has pg-swap or no subSlideIn animation re-triggering)
  const isBlockedPageShown = await page.locator(".svd-head, .detail-head").first().textContent();
  check("Navigated back to Blocked profiles cleanly", isBlockedPageShown.includes("Blocked profiles"), isBlockedPageShown);

  const subPageEl = page.locator(".page-sub");
  const hasPgSwap = await subPageEl.evaluate(el => el.classList.contains("pg-swap") || !el.style.animation);
  check("Underlying page did not re-slide in from right", hasPgSwap);

  // Back from Blocked to Settings
  await page.locator(".page-sub:not(.pg-ghost) .sub-back").first().click();
  await page.waitForTimeout(400);
  const isSettingsShown = await page.locator(".detail-head").first().textContent();
  check("Navigated back to Settings cleanly", isSettingsShown.includes("Settings"), isSettingsShown);

  // Back from Settings to own Profile screen
  await page.locator(".page-sub:not(.pg-ghost) .sub-back").first().click();
  await page.waitForTimeout(400);
  const isProfileShown = await page.locator(".pf-uname").isVisible();
  check("Settings closed and returned to own Profile screen", isProfileShown);

  check("No unhandled JS errors", pageErrors === 0, `errors: ${pageErrors}`);
  await ctx.close();
}

// 2. Tablet Viewport (768x1024)
{
  const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  await page.locator('.bottom-nav .nav-item[data-navgo="chat"]').first().click();
  await page.waitForTimeout(300);

  // Open watch.daily -> Block -> return to room
  await page.locator('.ch-row[data-tid="t1"]').click();
  await page.waitForTimeout(300);
  await page.locator('button[data-chgo="more"]').click();
  await page.waitForTimeout(300);
  await page.locator('button[data-chact="block-user"]').click();
  await page.waitForTimeout(300);
  await page.locator(".blk-go").click();
  await page.waitForTimeout(400);
  await page.locator(".sub-back").first().click();
  await page.waitForTimeout(300);

  await page.screenshot({ path: path.join(OUT, "t-768-chat-room-blocked.png") });
  await page.screenshot({ path: path.join(DELIV, "t-768-chat-room-blocked.png") });

  // Unblock to leave clean
  await page.locator(".ch-blocked-unblock-btn").click();
  await page.waitForTimeout(300);
  await page.locator(".dlg-unblock-go").click();
  await page.waitForTimeout(300);

  await ctx.close();
}

// 3. Desktop Viewport (1920x1080)
{
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  await page.locator('.bottom-nav .nav-item[data-navgo="chat"]').first().click();
  await page.waitForTimeout(300);

  // Open watch.daily -> Block -> return to room
  await page.locator('.ch-row[data-tid="t1"]').click();
  await page.waitForTimeout(300);
  await page.locator('button[data-chgo="more"]').click();
  await page.waitForTimeout(300);
  await page.locator('button[data-chact="block-user"]').click();
  await page.waitForTimeout(300);
  await page.locator(".blk-go").click();
  await page.waitForTimeout(400);
  await page.locator(".sub-back").first().click();
  await page.waitForTimeout(300);

  await page.screenshot({ path: path.join(OUT, "d-1920-chat-room-blocked.png") });
  await page.screenshot({ path: path.join(DELIV, "d-1920-chat-room-blocked.png") });

  // Unblock to leave clean
  await page.locator(".ch-blocked-unblock-btn").click();
  await page.waitForTimeout(300);
  await page.locator(".dlg-unblock-go").click();
  await page.waitForTimeout(300);

  await ctx.close();
}

await browser.close();

console.log("\n================ SUMMARY ================");
console.log(`TOTAL: ${results.length}, PASSED: ${results.length - failed}, FAILED: ${failed}`);
if (failed > 0) process.exit(1);
