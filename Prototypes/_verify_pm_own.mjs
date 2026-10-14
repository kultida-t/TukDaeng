// Verify fo-flow FEED-024: own-post "..." menu — IG own-post sheet trimmed to TukDaeng actions
// (Save / Share / Archive / Hide counts / Turn off commenting / Edit / Pin / Delete; no music/QR/reel/adjust-preview)
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-FEED-024";
mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const check = (name, ok) => { console.log(`${ok ? "PASS" : "FAIL"} ${name}`); ok ? pass++ : fail++; };

const OWN_LABELS = ["Save", "Archive", "Turn off commenting", "Edit", "Pin to profile", "Delete"];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 560, height: 950 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errs = [];
page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
page.on("pageerror", e => errs.push(e.message));

await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);
check("feed renders phone", await page.locator(".phone").count() === 1);

// inject an own post at the top of the feed (same shape as the create flow produces)
await page.evaluate(() => {
  POSTS.unshift({
    id: "own1", seller: CP_ME.name, avatar: CP_ME.avatar,
    time: "Just now", following: true, favorite: false, type: "showcase",
    photos: ["./assets/asset-uploads/ast-8831-1.png", "./assets/asset-uploads/ast-8831-2.png"],
    clip: null, clips: null,
    likes: 12, comments: 3, views: "1,240", liked: false,
    caption: "my own test post", captionFull: "my own test post",
    price: null, chips: [], specGroups: [], specs: [], location: null,
    desc: "my own test post",
    likedBy: { name: "the watch", avatar: "./assets/user-avatars/u-1042.png" },
  });
  const scr = document.querySelector(".screen");
  scr.querySelector(".feed-scroll").innerHTML = feedContentHTML(scr.dataset.variant);
});
check("own post card injected on top of feed", await page.locator('.feed-scroll .post[data-pid="own1"]').count() === 1);

// 1. other-post "..." menu unchanged
await page.locator('.feed-scroll .post:not([data-pid="own1"]) .post-head .more').first().click();
await page.waitForTimeout(350);
let labels = await page.locator(".comment-sheet .pm-row span").allTextContents();
check("other post menu keeps Not interested + Report", labels.includes("Not interested") && labels.includes("Report"));
await page.locator(".sheet-backdrop").click({ force: true });
await page.waitForTimeout(300);

// 2. own-post "..." menu — IG-style sheet
await page.locator('.feed-scroll .post[data-pid="own1"] .post-head .more').click();
await page.waitForTimeout(350);
check("pm sheet opens for own post", await page.locator(".screen").evaluate(el => el.classList.contains("pm-open")));
check("no preview card on top of menu", await page.locator(".comment-sheet .pm-post").count() === 0);
labels = await page.locator(".comment-sheet .pm-row span").allTextContents();
check("6 own-post menu rows in order", JSON.stringify(labels) === JSON.stringify(OWN_LABELS));
check("no Share / hide-counts / QR / reel / adjust-preview rows", !labels.some(l => /share|like count|qr|reel|preview|audio/i.test(l)));
check("Delete row is danger-styled", await page.locator(".comment-sheet .pm-row.danger span").allTextContents().then(t => t.join() === "Delete"));
await page.screenshot({ path: `${OUT}/pm-own-1-menu-dark.png` });

// 3. Save toggles saved state + syncs card save-btn
await page.locator(".pm-own-save").click();
await page.waitForTimeout(300);
check("Save → toast + saved flag + card save-btn on", await page.evaluate(() =>
  POSTS.find(p => p.id === "own1").saved === true &&
  document.querySelector('.post[data-pid="own1"] .save-btn')?.classList.contains("saved")));
check("toast says Saved", await page.locator(".sc-toast").evaluate(t => t.classList.contains("show") && t.textContent === "Saved"));

// 4. Archive / Pin — memory-only flags + toast
await page.locator('.feed-scroll .post[data-pid="own1"] .post-head .more').click();
await page.locator(".pm-own-archive").click();
await page.waitForTimeout(250);
check("Archive → archived flag + toast", await page.evaluate(() => POSTS.find(p => p.id === "own1").archived === true) &&
  await page.locator(".sc-toast").evaluate(t => t.textContent === "Post archived"));
await page.locator('.feed-scroll .post[data-pid="own1"] .post-head .more').click();
await page.locator(".pm-own-pin").click();
await page.waitForTimeout(250);
check("Pin to profile → pinned flag + toast", await page.evaluate(() => POSTS.find(p => p.id === "own1").pinned === true) &&
  await page.locator(".sc-toast").evaluate(t => t.textContent === "Pinned to your profile"));

// 6. Turn off commenting → comment button gone from card
await page.locator('.feed-scroll .post[data-pid="own1"] .post-head .more').click();
await page.locator(".pm-own-nocomm").click();
await page.waitForTimeout(300);
check("noComments → comment btn hidden on card", await page.evaluate(() => {
  const art = document.querySelector('.feed-scroll .post[data-pid="own1"]');
  return POSTS.find(p => p.id === "own1").noComments === true && !art.querySelector(".comment-btn");
}));
await page.locator('.feed-scroll .post[data-pid="own1"] .post-head .more').click();
await page.waitForTimeout(300);
labels = await page.locator(".comment-sheet .pm-row span").allTextContents();
check("menu labels flip (Turn on commenting / Remove from saved / Unarchive / Unpin)",
  labels.includes("Remove from saved") && labels.includes("Unarchive") &&
  labels.includes("Turn on commenting") && labels.includes("Unpin from profile"));
await page.locator(".sheet-backdrop").click({ force: true });
await page.waitForTimeout(300);

// 8. Edit — caption dialog updates the post everywhere
await page.locator('.feed-scroll .post[data-pid="own1"] .post-head .more').click();
await page.locator(".pm-own-edit").click();
await page.waitForTimeout(300);
check("Edit → dialog with caption textarea", await page.locator(".screen").evaluate(el =>
  el.classList.contains("dialog-open") && el.querySelector(".dlg-ta")?.value === "my own test post"));
await page.locator(".dlg-ta").fill("edited caption 🎉");
await page.locator(".dlg-edit-go").click();
await page.waitForTimeout(300);
check("Edit saves caption → card re-renders new caption", await page.evaluate(() =>
  POSTS.find(p => p.id === "own1").caption === "edited caption 🎉" &&
  document.querySelector('.feed-scroll .post[data-pid="own1"]').textContent.includes("edited caption 🎉")));

// 9. own menu also opens from post detail page (.pm-btn)
await page.evaluate(() => {
  const scr = document.querySelector(".screen");
  openPostDetail(scr, POSTS.find(p => p.id === "own1"));
});
await page.waitForTimeout(400);
await page.locator(".page-detail .pm-btn, .page-detail .post-head .more").first().click();
await page.waitForTimeout(350);
labels = await page.locator(".comment-sheet .pm-row span").allTextContents();
check("detail page ... shows own-post menu", labels.includes("Delete") && labels.some(l => /profile/i.test(l)));
await page.locator(".sheet-backdrop").click({ force: true });
await page.waitForTimeout(300);
await page.locator(".page-detail .detail-back").first().click();
await page.waitForTimeout(350);

// 10. Delete — confirm dialog then post removed from feed + POSTS
await page.locator('.feed-scroll .post[data-pid="own1"] .post-head .more').click();
await page.locator(".pm-own-del").click();
await page.waitForTimeout(300);
check("Delete → confirm dialog", await page.locator(".screen").evaluate(el =>
  el.classList.contains("dialog-open") && el.querySelector(".dlg-q")?.textContent === "Delete post?"));
await page.screenshot({ path: `${OUT}/pm-own-2-delete-dark.png` });
await page.locator(".dlg-delpost-go").click();
await page.waitForTimeout(350);
check("Delete removes post from POSTS + feed", await page.evaluate(() =>
  !POSTS.find(p => p.id === "own1") && !document.querySelector('.post[data-pid="own1"]')));
check("toast says Post deleted", await page.locator(".sc-toast").evaluate(t => t.textContent === "Post deleted"));

// 11. create flow — More options pane no longer has "Hide like and view counts"
await page.locator('[data-flow="create"]').click();
await page.waitForTimeout(450);
await page.locator(".cf .ig-grid .cell[data-i]").first().click();
await page.waitForTimeout(250);
await page.locator(".cf-next").click();
await page.waitForTimeout(400);
await page.locator('.ig-row[data-pane="more"]').click();
await page.waitForTimeout(350);
check("More options pane opens", await page.locator(".cf-pane").evaluate(el => el.classList.contains("open")));
check("no hideCounts toggle in More options", await page.locator('.cf-pane [data-f="hideCounts"]').count() === 0);
check("Turn off commenting toggle still there", await page.locator('.cf-pane [data-f="noComments"]').count() === 1);
check("audience options still there", await page.locator(".cf-pane .aud-opt").count() === 2);
await page.locator(".cf-pane .pane-done").click();
await page.waitForTimeout(250);
await page.locator(".cf-back2").click();
await page.waitForTimeout(300);
await page.locator(".cf-x").click();
await page.waitForTimeout(300);
await page.locator(".dlg-discard-go").click().catch(() => {});
await page.waitForTimeout(300);

// 12. light theme sanity
await page.locator("#themeToggle").click();
await page.waitForTimeout(400);
await page.evaluate(() => {
  POSTS.unshift({ id: "own2", seller: CP_ME.name, avatar: CP_ME.avatar, time: "Just now", following: true, favorite: false,
    type: "showcase", photos: ["./assets/asset-uploads/ast-8831-1.png"], clip: null, clips: null,
    likes: 0, comments: 0, views: 0, liked: false, caption: "light theme post", captionFull: "light theme post",
    price: null, chips: [], specGroups: [], specs: [], location: null, desc: "light theme post",
    likedBy: { name: "the watch", avatar: "./assets/user-avatars/u-1042.png" } });
  const scr = document.querySelector(".screen");
  scr.querySelector(".feed-scroll").innerHTML = feedContentHTML(scr.dataset.variant);
});
await page.locator('.feed-scroll .post[data-pid="own2"] .post-head .more').click();
await page.waitForTimeout(350);
check("light theme own menu renders", await page.locator(".comment-sheet .pm-row").count() === 6);
await page.screenshot({ path: `${OUT}/pm-own-3-menu-light.png` });
await page.locator(".sheet-backdrop").click({ force: true });

check("no console/page errors", errs.length === 0);
if (errs.length) console.log("ERRORS:", errs);
console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
