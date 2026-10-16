import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync, writeFileSync } from "fs";
import { pathToFileURL } from "url";
import path from "path";

const OUT = path.join(process.cwd(), "Prototypes/screenshots/task-CHAT-003/after");
const DELIV = path.join(process.cwd(), "Prototypes/deliverables/task-CHAT-003");
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

  // Switch to Items tab
  await page.locator('.ch-top-tab[data-chview="item"]').click();
  await page.waitForTimeout(300);

  // Check: Your listings row shows summary instead of single user message
  const rolexSub = await page.locator('.ch-list-inner .ch-row[data-iid="mi1"] .ch-prev').textContent();
  check("Your listings row shows clean summary without unread text", rolexSub === "THB 380,000 · 14 chats", rolexSub);

  const rolexTitle = await page.locator('.ch-list-inner .ch-row[data-iid="mi1"] .ch-name').textContent();
  check("Your listings title has no bracketed number", !rolexTitle.includes("(14)"), rolexTitle);

  // Check: Items you asked about shows last message preview
  const subSub = await page.locator('.ch-list-inner .ch-row[data-chgo="room"]').first().locator('.ch-prev').textContent();
  check("Asked item shows last message preview", subSub.includes("ให้ได้ 410,000"), subSub);

  await page.screenshot({ path: path.join(OUT, "m-440-items-tab.png") });
  await page.screenshot({ path: path.join(DELIV, "m-440-items-tab.png") });

  // Click on the first item "Rolex Datejust 36 · Ref. 126234"
  await page.locator('.ch-row[data-chgo="item"][data-iid="mi1"]').click();
  await page.waitForTimeout(400);

  // Check 1: Header title is "Item chats"
  const title = await page.locator('.detail-title').textContent();
  check("Header title is 'Item chats'", title.includes("Item chats"), title);

  // Check 2: Item card is displayed
  const cardCap = await page.locator('.ch-itemcard b').textContent();
  check("Item card shows Rolex Datejust 36", cardCap.includes("Rolex Datejust 36"), cardCap);

  const itemCardNote = await page.locator('.ch-itemcard em').textContent();
  check("Item chats card shows 'Your listing · 14 chats' without unread text", itemCardNote === "Your listing · 14 chats", itemCardNote);

  // Check 3: Exactly 14 chat rows
  const rowCount = await page.locator('.ch-scroll[data-iid="mi1"] .ch-row-wrap').count();
  check("Item chats list has 14 chat rows", rowCount === 14, `Found: ${rowCount}`);

  // Check 4: Row height is around 64px (not squished to 20px)
  const firstRowBox = await page.locator('.ch-scroll[data-iid="mi1"] .ch-row').first().boundingBox();
  check("First row height >= 60px", firstRowBox && firstRowBox.height >= 60, `Height: ${firstRowBox?.height}px`);

  // Check 5: Avatar is 44x44px
  const avBox = await page.locator('.ch-scroll[data-iid="mi1"] .ch-av img').first().boundingBox();
  check("Avatar image is 44x44px", avBox && Math.abs(avBox.width - 44) <= 1 && Math.abs(avBox.height - 44) <= 1, `${avBox?.width}x${avBox?.height}px`);

  // Check 6: Preview message text is visible and not empty
  const firstPrev = await page.locator('.ch-scroll[data-iid="mi1"] .ch-prev').first().textContent();
  check("First row preview text is visible", firstPrev && firstPrev.length > 5, firstPrev);

  // Check 7: Pinned chat sorting: watch.daily has pin badge
  const pinBadgeCount = await page.locator('.ch-scroll[data-iid="mi1"] .ch-row').first().locator('.ch-pin-badge').count();
  check("Top pinned chat has pin badge", pinBadgeCount === 1);

  // Check 8: Unread badge is displayed
  const unreadCount = await page.locator('.ch-scroll[data-iid="mi1"] .ch-un').count();
  check("Unread badges are present", unreadCount > 0, `Count: ${unreadCount}`);

  // Capture Mobile Item chats main view
  await page.screenshot({ path: path.join(OUT, "m-440-item-chats.png") });
  await page.screenshot({ path: path.join(DELIV, "m-440-item-chats.png") });

  // Check 9: Search filtering in Item chats
  await page.locator('.ch-iq').fill("slow");
  await page.waitForTimeout(200);
  const filteredCount = await page.locator('.ch-scroll[data-iid="mi1"] .ch-row-wrap').count();
  check("Filtering by 'slow' shows 1 chat", filteredCount === 1, `Found: ${filteredCount}`);
  await page.screenshot({ path: path.join(OUT, "m-440-item-chats-search.png") });
  await page.screenshot({ path: path.join(DELIV, "m-440-item-chats-search.png") });

  // Clear search
  await page.locator('.ch-iq').fill("");
  await page.waitForTimeout(200);
  const restoredCount = await page.locator('.ch-scroll[data-iid="mi1"] .ch-row-wrap').count();
  check("Clearing search restores 14 chats", restoredCount === 14, `Found: ${restoredCount}`);

  // Check 10: Swipe Action (Swipe right to reveal Mute/Pin)
  const targetRow = page.locator('.ch-scroll[data-iid="mi1"] .ch-row-wrap').nth(3); // dial.dude
  const targetBox = await targetRow.boundingBox();
  if (targetBox) {
    const cx = targetBox.x + 100, cy = targetBox.y + targetBox.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 120, cy, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(300);
  }
  const isRevealedLeft = await page.locator('.ch-row-wrap.revealed-left').count();
  check("Swipe right reveals Mute/Pin actions", isRevealedLeft === 1);
  await page.screenshot({ path: path.join(OUT, "m-440-item-chats-swipe.png") });
  await page.screenshot({ path: path.join(DELIV, "m-440-item-chats-swipe.png") });

  // Tap anywhere to close swipe
  await page.mouse.click(10, 10);
  await page.waitForTimeout(200);

  // Check 11: Tap chat row to open Chat Room
  await page.locator('.ch-scroll[data-iid="mi1"] .ch-row[data-chgo="room"]').first().click();
  await page.waitForTimeout(400);
  const roomUser = await page.locator('.ch-rhead .n').first().textContent();
  check("Tapping row opens Chat Room for user", roomUser.includes("watch.daily"), roomUser);

  // Click Back to return to Item chats
  await page.locator('.ch-rhead .sub-back').click();
  await page.waitForTimeout(400);
  const backTitle = await page.locator('.detail-title').textContent();
  check("Back button returns to Item chats", backTitle.includes("Item chats"), backTitle);

  // Back to Chat Center (Items tab)
  await page.locator('.detail-head .sub-back').click();
  await page.waitForTimeout(300);

  // Check 12: Tapping an item under "Items you asked about" opens Chat Room directly!
  const askedRow = page.locator('.ch-list-inner .ch-row[data-chgo="room"]').first();
  const askedRowCount = await askedRow.count();
  check("Items you asked about have direct data-chgo='room'", askedRowCount > 0);

  await askedRow.click();
  await page.waitForTimeout(400);
  const askedRoomUser = await page.locator('.ch-rhead .n').first().textContent();
  check("Tapping asked item directly opens Chat Room with seller", askedRoomUser.includes("Watch 777"), askedRoomUser);

  // Back button from direct Chat Room returns to Items view
  await page.locator('.ch-rhead .sub-back').click();
  await page.waitForTimeout(300);
  const activeTab = await page.locator('.ch-top-tab[data-chview="item"].active-pill').count();
  // Check 13: Filter selection in Items view resets when switching bottom nav to Feed and back to Chat
  // Step A: Open filter popover by tapping Items tab again
  await page.locator('.ch-top-tab[data-chview="item"]').click();
  await page.waitForTimeout(200);
  const isPopOpen = await page.locator('.ch-filter-popover').count();
  check("Filter popover opens when tapping Items tab again", isPopOpen === 1);

  // Step B: Select 'Your listings'
  await page.locator('.ch-filter-pop-row[data-chitemfilter="mine"]').click();
  await page.waitForTimeout(200);
  const askedHeaderCount = await page.locator('.ch-sec:has-text("Items you asked about")').count();
  check("Filter 'Your listings' hides asked items section", askedHeaderCount === 0);

  // Step C: Tap Feed bottom nav
  await page.locator('.bottom-nav .nav-item[data-navgo="feed"]').first().click();
  await page.waitForTimeout(300);

  // Step D: Tap Chat bottom nav to return
  await page.locator('.bottom-nav .nav-item[data-navgo="chat"]').first().click();
  await page.waitForTimeout(300);

  // Step E: Verify active view is Chats (tab Chats has active-pill)
  const isChatsActive = await page.locator('.ch-top-tab[data-chview="user"].active-pill').count();
  check("Returning to Chat from Feed defaults back to Chats view", isChatsActive === 1);

  // Step F: Tap Items tab and verify filter is reset to 'all'
  await page.locator('.ch-top-tab[data-chview="item"]').click();
  await page.waitForTimeout(300);
  const askedHeaderRestored = await page.locator('.ch-sec:has-text("Items you asked about")').count();
  const mineHeaderRestored = await page.locator('.ch-sec:has-text("Your listings")').count();
  check("Filter is cleared to 'All items' (both sections visible)", askedHeaderRestored === 1 && mineHeaderRestored === 1);

  check("No unhandled page errors on Mobile", pageErrors === 0);
  await ctx.close();
}

// 2. Responsive screenshots across all standard viewports
const viewports = [
  { name: "m-390-item-chats.png", w: 390, h: 844 },
  { name: "t-768-item-chats.png", w: 768, h: 1024 },
  { name: "d-1440-item-chats.png", w: 1440, h: 900 },
  { name: "d-1920-item-chats.png", w: 1920, h: 1080 }
];

for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  await page.locator('.bottom-nav .nav-item[data-navgo="chat"]').first().click();
  await page.waitForTimeout(200);
  await page.locator('.ch-top-tab[data-chview="item"]').click();
  await page.waitForTimeout(200);
  await page.locator('.ch-row[data-chgo="item"][data-iid="mi1"]').click();
  await page.waitForTimeout(400);

  await page.screenshot({ path: path.join(OUT, vp.name) });
  await page.screenshot({ path: path.join(DELIV, vp.name) });
  check(`Captured viewport: ${vp.name} (${vp.w}x${vp.h})`, true);
  await ctx.close();
}

await browser.close();

// Write results file
const summary = [
  `=== CHAT-003 Verification Results ===`,
  `Timestamp: ${new Date().toISOString()}`,
  `Total Tests: ${results.length}`,
  `Passed: ${results.length - failed}`,
  `Failed: ${failed}`,
  ``,
  ...results
].join("\n");

writeFileSync(path.join(DELIV, "CHAT-003-test-results.txt"), summary, "utf8");
console.log("\n" + summary);

if (failed > 0) {
  process.exit(1);
} else {
  console.log("\nALL TESTS PASSED!");
}
