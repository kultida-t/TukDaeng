import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync, writeFileSync } from "fs";
import { pathToFileURL } from "url";
import path from "path";

const OUT = path.join(process.cwd(), "Prototypes/screenshots/task-CHAT-006/after");
const DELIV = path.join(process.cwd(), "Prototypes/deliverables/task-CHAT-006");
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
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true
});

try {
  // 1. Detailed functional verification on Mobile (440x956)
  const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  let pageErrors = 0;
  page.on("pageerror", e => { console.error("PAGE ERR:", e.message); pageErrors++; });

  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  // Navigate to Chat
  await page.locator('.bottom-nav .nav-item[data-navgo="chat"]').first().click();
  await page.waitForTimeout(300);

  // Initial screenshot of chat list
  await page.screenshot({ path: path.join(OUT, "m-440-chat-list-initial.png") });
  await page.screenshot({ path: path.join(DELIV, "m-440-chat-list-initial.png") });

  // Find target unpinned thread: e.g. "nat_collection" or "dial.dude"
  const unpinnedRow = page.locator('.ch-list-inner .ch-row-wrap:not(:has(.ch-pin-badge)) .ch-row').first();
  await unpinnedRow.scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  const unpinnedWrap = unpinnedRow.locator('xpath=..');
  const unpinnedUser = (await unpinnedRow.locator('.ch-name').textContent()).trim();
  console.log("Testing on unpinned user:", unpinnedUser);

  // Test 1: Swipe Right on unpinned chat to reveal Pin and Mute
  const box1 = await unpinnedRow.boundingBox();
  if (box1) {
    const cx = box1.x + 100, cy = box1.y + box1.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 140, cy, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(250);
  }

  const isRevealedLeft = await unpinnedWrap.evaluate(el => el.classList.contains("revealed-left"));
  check("Swipe right reveals left action buttons", isRevealedLeft);

  const pinBtn = unpinnedWrap.locator('.ch-act-pin');
  const muteBtn = unpinnedWrap.locator('.ch-act-mute');
  const pinCount = await pinBtn.count();
  const muteCount = await muteBtn.count();
  check("Pin button is present in swipe right", pinCount === 1);
  check("Mute button is present in swipe right", muteCount === 1);

  // Screenshot Swipe Right
  await page.screenshot({ path: path.join(OUT, "m-440-swipe-right.png") });
  await page.screenshot({ path: path.join(DELIV, "m-440-swipe-right.png") });

  // Test 2: Click Pin -> Chat should move to top with blue pin badge
  await pinBtn.click();
  await page.waitForTimeout(300);

  const firstChatName = (await page.locator('.ch-list-inner .ch-row .ch-name').first().textContent()).trim();
  check("Pinned chat moves to the top of the chat list", firstChatName === unpinnedUser, `First is: ${firstChatName}`);
  const hasPinBadge = await page.locator('.ch-list-inner .ch-row').first().locator('.ch-pin-badge').count();
  check("Pinned chat shows blue pin badge on avatar", hasPinBadge === 1);

  // Test 3: Swipe Right on the pinned chat -> Should show Unpin button
  const pinnedRow = page.locator('.ch-list-inner .ch-row').first();
  const pinnedWrap = pinnedRow.locator('xpath=..');
  const boxPinned = await pinnedRow.boundingBox();
  if (boxPinned) {
    const cx = boxPinned.x + 100, cy = boxPinned.y + boxPinned.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 140, cy, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(250);
  }
  const unpinTitle = await pinnedWrap.locator('.ch-act-pin').getAttribute('title');
  check("Pinned chat displays 'ยกเลิกปักหมุด' (Unpin) button", unpinTitle === "ยกเลิกปักหมุด", unpinTitle);

  // Click Unpin -> Should remove badge and close swipe
  await pinnedWrap.locator('.ch-act-pin').click();
  await page.waitForTimeout(300);

  // Test 4: Mute and Unmute
  const targetRowForMute = page.locator('.ch-list-inner .ch-row-wrap').nth(2).locator('.ch-row');
  await targetRowForMute.scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  const targetWrapForMute = targetRowForMute.locator('xpath=..');
  const boxMute = await targetRowForMute.boundingBox();
  if (boxMute) {
    const cx = boxMute.x + 100, cy = boxMute.y + boxMute.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 140, cy, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(250);
  }
  await targetWrapForMute.locator('.ch-act-mute').click();
  await page.waitForTimeout(300);
  const muteIcoCount = await targetWrapForMute.locator('.ch-mute-ico').count();
  check("Muting a chat displays mute speaker icon next to name", muteIcoCount === 1);

  // Test 5: Swipe Left to reveal Hide and Delete
  const rowForLeft = page.locator('.ch-list-inner .ch-row-wrap').nth(3).locator('.ch-row');
  await rowForLeft.scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  const wrapForLeft = rowForLeft.locator('xpath=..');
  const boxLeft = await rowForLeft.boundingBox();
  if (boxLeft) {
    const cx = boxLeft.x + boxLeft.width - 50, cy = boxLeft.y + boxLeft.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 170, cy, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(250);
  }

  const isRevealedRight = await wrapForLeft.evaluate(el => el.classList.contains("revealed-right"));
  check("Swipe left reveals right action buttons", isRevealedRight);

  const hideBtn = wrapForLeft.locator('.ch-act-hide');
  const delBtn = wrapForLeft.locator('.ch-act-del');
  check("Hide button is present in swipe left", (await hideBtn.count()) === 1);
  check("Delete button is present in swipe left", (await delBtn.count()) === 1);

  await page.screenshot({ path: path.join(OUT, "m-440-swipe-left.png") });
  await page.screenshot({ path: path.join(DELIV, "m-440-swipe-left.png") });

  // Test 6: Click Hide -> Opens Hide confirmation modal with exact LINE copy
  await hideBtn.click();
  await page.waitForTimeout(250);

  const hideModalTitle = await page.locator('#chConfirmModal .ch-modal-title').textContent();
  check("Hide modal shows exact copy 'Hiding chats doesn\\'t delete their messages.'",
    hideModalTitle.trim() === "Hiding chats doesn't delete their messages.", hideModalTitle);

  const hideCancelBtn = page.locator('#chConfirmModal #chHideCancel');
  const hideConfirmBtn = page.locator('#chConfirmModal #chHideConfirm');
  check("Hide modal has Cancel button", (await hideCancelBtn.count()) === 1);
  check("Hide modal has Hide confirm button", (await hideConfirmBtn.count()) === 1);

  await page.screenshot({ path: path.join(OUT, "m-440-modal-hide.png") });
  await page.screenshot({ path: path.join(DELIV, "m-440-modal-hide.png") });

  // Cancel Hide -> Modal closes, chat stays
  await hideCancelBtn.click();
  await page.waitForTimeout(250);
  check("Cancel Hide closes the modal", (await page.locator('#chConfirmModal').count()) === 0);

  // Test 7: Swipe Left again and Click Delete -> Opens Delete confirmation modal
  const boxLeft2 = await rowForLeft.boundingBox();
  if (boxLeft2) {
    const cx = boxLeft2.x + boxLeft2.width - 50, cy = boxLeft2.y + boxLeft2.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 170, cy, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(250);
  }
  await wrapForLeft.locator('.ch-act-del').click();
  await page.waitForTimeout(250);

  const delModalTitle = await page.locator('#chConfirmModal .ch-modal-title').textContent();
  check("Delete modal shows exact copy 'Are you sure you want to delete this chat?'",
    delModalTitle.trim() === "Are you sure you want to delete this chat?", delModalTitle);

  await page.screenshot({ path: path.join(OUT, "m-440-modal-delete.png") });
  await page.screenshot({ path: path.join(DELIV, "m-440-modal-delete.png") });

  // Cancel Delete
  await page.locator('#chConfirmModal #chDelCancel').click();
  await page.waitForTimeout(250);
  check("Cancel Delete closes modal", (await page.locator('#chConfirmModal').count()) === 0);

  // Test 8: Auto close swipe on tapping outside
  const boxLeft3 = await rowForLeft.boundingBox();
  if (boxLeft3) {
    const cx = boxLeft3.x + boxLeft3.width - 50, cy = boxLeft3.y + boxLeft3.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 170, cy, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(250);
  }
  check("Row revealed before outside tap", await wrapForLeft.evaluate(el => el.classList.contains("revealed-right")));
  await page.mouse.click(20, 100);
  await page.waitForTimeout(200);
  check("Row closes when tapping outside", !(await wrapForLeft.evaluate(el => el.classList.contains("revealed-right"))));

  check("No unhandled console errors during tests", pageErrors === 0, `Page errors: ${pageErrors}`);

  await ctx.close();

  // 2. Viewport Screenshots (Desktop 1920x1080, Tablet 768x1024, Mobile 390x844)
  const viewports = [
    { name: "d-1920", width: 1920, height: 1080 },
    { name: "t-768", width: 768, height: 1024 },
    { name: "m-390", width: 390, height: 844 }
  ];

  for (const vp of viewports) {
    const c = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
    const p = await c.newPage();
    await p.goto(FILE_URL, { waitUntil: "networkidle" });
    await p.waitForTimeout(400);

    // Go to chat
    await p.locator('.bottom-nav .nav-item[data-navgo="chat"]').first().click();
    await p.waitForTimeout(300);

    // Swipe right on second row to show Pin/Mute buttons
    const row = p.locator('.ch-list-inner .ch-row').nth(1);
    const box = await row.boundingBox();
    if (box) {
      const cx = box.x + 50, cy = box.y + box.height / 2;
      await p.mouse.move(cx, cy);
      await p.mouse.down();
      await p.mouse.move(cx + 140, cy, { steps: 6 });
      await p.mouse.up();
      await p.waitForTimeout(250);
    }

    await p.screenshot({ path: path.join(OUT, `${vp.name}-chat-swipe.png`) });
    await p.screenshot({ path: path.join(DELIV, `${vp.name}-chat-swipe.png`) });

    await c.close();
  }

} finally {
  await browser.close();
}

console.log("\n==========================================");
console.log(`TOTAL CHECKS: ${results.length} | FAILED: ${failed}`);
console.log("==========================================");

const report = `==========================================
TEST RESULTS FOR TASK CHAT-006:
${results.join("\n")}

TOTAL: ${results.length} | FAILED: ${failed}
==========================================`;

writeFileSync(path.join(DELIV, "CHAT-006-test-results.txt"), report, "utf8");

if (failed > 0) {
  process.exit(1);
}
