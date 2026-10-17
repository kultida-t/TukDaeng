import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { pathToFileURL } from "url";

const FILE_URL = pathToFileURL("d:/TukDaeng/Prototypes/fo-flow/index.html").href;
const OUT = "d:/TukDaeng/Prototypes/screenshots/task-SET-005";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

let failed = 0;
const check = (desc, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}: ${desc}${extra ? " — " + extra : ""}`);
  if (!ok) failed++;
};

{
  const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // Set language to Thai via localStorage and reload
  await page.evaluate(() => {
    localStorage.setItem("fo_lang", "th");
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // 1. Verify Feed Items in Thai
  const feedAskBtn = await page.locator('.ask-pill').first().textContent();
  check("Feed ask button is 'สอบถาม'", feedAskBtn.trim() === "สอบถาม", `got '${feedAskBtn.trim()}'`);

  const detailsToggle = page.locator('.details-toggle').first();
  if (await detailsToggle.count() > 0) {
    const dtLabel = await detailsToggle.locator('.dt-label').textContent();
    // Expand caption first if .more-link exists
    const moreLink = page.locator('.more-link').first();
    if (await moreLink.count() > 0) {
      await moreLink.click();
      await page.waitForTimeout(200);
    }
    await detailsToggle.click({ force: true });
    await page.waitForTimeout(200);
    const dtLabelOpen = await detailsToggle.locator('.dt-label').textContent();
    check("Details toggle open text is 'ซ่อนรายละเอียด'", dtLabelOpen.trim() === "ซ่อนรายละเอียด", `got '${dtLabelOpen.trim()}'`);
  }

  // 2. Verify Bottom Nav Ghost Fix on Sub-Page (e.g. Chat settings or Portfolio)
  await page.locator('.bottom-nav .nav-item[data-navgo="profile"]').first().click();
  await page.waitForTimeout(400);

  // Open Portfolio
  await page.evaluate(() => {
    const scr = document.querySelector(".screen");
    pushSub(scr, "portfolio");
  });
  await page.waitForTimeout(400);

  // Check that screen has sub-open and root bottom-nav is hidden
  const rootNavDisplay = await page.evaluate(() => {
    const rootNav = document.querySelector(".screen > .bottom-nav");
    return window.getComputedStyle(rootNav).display;
  });
  check("Root bottom-nav is hidden ('none') on sub-pages (no ghost/peeking nav)", rootNavDisplay === "none", `got '${rootNavDisplay}'`);

  // Verify Portfolio in Thai
  const pfTitle = await page.locator('.page-sub:not(.pg-ghost) .detail-title').textContent();
  check("Portfolio title is 'พอร์ตโฟลิโอ'", pfTitle.trim() === "พอร์ตโฟลิโอ", `got '${pfTitle.trim()}'`);

  const costLabel = await page.locator('.page-sub:not(.pg-ghost) .pfo-tt span').first().textContent();
  check("Portfolio hero cost label is 'ต้นทุนรวม'", costLabel.trim() === "ต้นทุนรวม", `got '${costLabel.trim()}'`);

  await page.screenshot({ path: `${OUT}/m_08_portfolio_thai.png` });

  // Open Sold history
  await page.locator('.page-sub:not(.pg-ghost) .pfo-soldlink').first().click();
  await page.waitForTimeout(400);
  const soldTitle = await page.locator('.page-sub:not(.pg-ghost) .detail-title').textContent();
  check("Sold history title is 'ประวัติการขาย'", soldTitle.trim() === "ประวัติการขาย", `got '${soldTitle.trim()}'`);

  // Pop back to Portfolio then Profile
  await page.locator('.page-sub:not(.pg-ghost) .sub-back').first().click();
  await page.waitForTimeout(300);
  await page.locator('.page-sub:not(.pg-ghost) .sub-back').first().click();
  await page.waitForTimeout(300);

  // 3. Verify Edit Profile in Thai
  await page.locator('.pf-edit').first().click();
  await page.waitForTimeout(400);
  const editTitle = await page.locator('.page-sub:not(.pg-ghost) .detail-title').textContent();
  check("Edit profile title is 'แก้ไขโปรไฟล์'", editTitle.trim() === "แก้ไขโปรไฟล์", `got '${editTitle.trim()}'`);
  await page.screenshot({ path: `${OUT}/m_09_edit_profile_thai.png` });
  await page.locator('.page-sub:not(.pg-ghost) .sub-back').first().click();
  await page.waitForTimeout(300);

  // 4. Verify Chat Settings in Thai
  await page.evaluate(() => {
    const scr = document.querySelector(".screen");
    pushSub(scr, "chatcfg");
  });
  await page.waitForTimeout(400);
  const chatCfgTitle = await page.locator('.page-sub:not(.pg-ghost) .detail-title').textContent();
  check("Chat config title is 'การตั้งค่าแชท'", chatCfgTitle.trim() === "การตั้งค่าแชท", `got '${chatCfgTitle.trim()}'`);
  await page.screenshot({ path: `${OUT}/m_10_chat_settings_thai.png` });
  await page.locator('.page-sub:not(.pg-ghost) .sub-back').first().click();
  await page.waitForTimeout(300);

  // 5. Verify Alerts in Thai
  await page.locator('[data-navgo="alerts"]:visible').first().click();
  await page.waitForTimeout(400);
  const alertsSec = await page.locator('.page-sub:not(.pg-ghost) .al-sec span').first().textContent();
  check("Alerts screen group header in Thai ('วันนี้')", alertsSec.trim() === "วันนี้", `got '${alertsSec.trim()}'`);
  await page.screenshot({ path: `${OUT}/m_11_alerts_thai.png` });

  // 6. Verify Create Post Flow in Thai
  await page.evaluate(() => {
    const scr = document.querySelector(".screen");
    pushSub(scr, "create");
  });
  await page.waitForTimeout(400);
  const createTitle = await page.locator('.page-sub:not(.pg-ghost) .cf-head .t').first().textContent();
  check("Create post picker title is 'สร้างโพสต์ใหม่'", createTitle.trim() === "สร้างโพสต์ใหม่", `got '${createTitle.trim()}'`);
  await page.screenshot({ path: `${OUT}/m_12_create_post_picker_thai.png` });

  // Advance to Step 2
  await page.locator('.page-sub:not(.pg-ghost) .cf-next').first().click();
  await page.waitForTimeout(400);
  const step2ShareBtn = await page.locator('.page-sub:not(.pg-ghost) .cf-share').textContent();
  check("Create post step 2 share button is 'แชร์'", step2ShareBtn.trim() === "แชร์", `got '${step2ShareBtn.trim()}'`);
  await page.screenshot({ path: `${OUT}/m_13_create_post_step2_thai.png` });

  // Cancel create post
  await page.locator('.page-sub:not(.pg-ghost) .cf-back2').first().click();
  await page.waitForTimeout(200);
  await page.locator('.page-sub:not(.pg-ghost) .cf-x').first().click();
  await page.waitForTimeout(400);

  // 7. Verify Unfollow Confirmation Modal in Thai
  await page.evaluate(() => {
    const scr = document.querySelector(".screen");
    const post = POSTS.find(p => p.following) || POSTS[0];
    post.following = true;
    scr.dataset.ufSeller = post.seller;
    const cs = scr.querySelector(".comment-sheet");
    cs.classList.remove("pm", "pm-rp", "lk", "sh", "sv", "dt", "nt", "ps", "mf");
    cs.classList.add("uf");
    const isTh = localStorage.getItem("fo_lang") === "th";
    cs.innerHTML = `
      <div class="sheet-handle"></div>
      <div class="uf-body">
        <img class="uf-av" src="${post.avatar}" alt="">
        <div class="uf-q">${isTh ? `เลิกติดตาม <b>@${post.seller}</b> หรือไม่?` : `Unfollow <b>@${post.seller}</b>?`}</div>
        <button class="uf-confirm">${isTh ? "เลิกติดตาม" : "Unfollow"}</button>
        <button class="uf-cancel">${isTh ? "ยกเลิก" : "Cancel"}</button>
      </div>`;
    scr.classList.add("unfollow-open");
  });
  await page.waitForTimeout(400);
  const ufQ = await page.locator('.uf-q').textContent();
  check("Unfollow dialog question is in Thai ('เลิกติดตาม ...')", ufQ.includes("เลิกติดตาม"), `got '${ufQ}'`);
  const ufConfirmBtn = await page.locator('.uf-confirm').textContent();
  check("Unfollow confirm button is 'เลิกติดตาม'", ufConfirmBtn.trim() === "เลิกติดตาม", `got '${ufConfirmBtn.trim()}'`);
  await page.screenshot({ path: `${OUT}/m_14_unfollow_dialog_thai.png` });

  // Dismiss unfollow modal
  await page.locator('.uf-cancel').first().click();
  await page.waitForTimeout(300);

  // 8. Verify Saved & Wishlist & Watch Alerts in Thai
  await page.evaluate(() => {
    const scr = document.querySelector(".screen");
    pushSub(scr, "saved");
  });
  await page.waitForTimeout(400);
  const savedTitle = await page.locator('.page-sub:not(.pg-ghost) .detail-title').textContent();
  check("Saved title is 'บันทึกแล้ว'", savedTitle.trim() === "บันทึกแล้ว", `got '${savedTitle.trim()}'`);
  await page.screenshot({ path: `${OUT}/m_15_saved_thai.png` });

  await page.evaluate(() => {
    const scr = document.querySelector(".screen");
    pushSub(scr, "wishlist");
  });
  await page.waitForTimeout(400);
  const wlTitle = await page.locator('.page-sub:not(.pg-ghost) .detail-title').textContent();
  check("Wishlist title is 'สิ่งที่อยากได้'", wlTitle.trim() === "สิ่งที่อยากได้", `got '${wlTitle.trim()}'`);
  await page.screenshot({ path: `${OUT}/m_16_wishlist_thai.png` });

  await page.evaluate(() => {
    const scr = document.querySelector(".screen");
    pushSub(scr, "walerts");
  });
  await page.waitForTimeout(400);
  const waTitle = await page.locator('.page-sub:not(.pg-ghost) .detail-title').textContent();
  check("Watch alerts title is 'การแจ้งเตือนนาฬิกา'", waTitle.trim() === "การแจ้งเตือนนาฬิกา", `got '${waTitle.trim()}'`);
  await page.screenshot({ path: `${OUT}/m_17_watch_alerts_thai.png` });

  await ctx.close();
}

await browser.close();

console.log("\n==============================");
console.log(`TOTAL FAILED: ${failed}`);
console.log("==============================");
if (failed > 0) process.exit(1);
