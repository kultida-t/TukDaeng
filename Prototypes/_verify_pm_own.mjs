// Verify fo-flow FEED-024: own-post "..." menu — IG sheet trimmed to TukDaeng actions
// (Save / Archive / Turn off commenting / Edit / Pin / Delete) + Edit info composer
// (prefilled media/caption/meta, drag-reorder, add/remove media, min 1 / max 10)
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-FEED-024";
mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const check = (name, ok) => { console.log(`${ok ? "PASS" : "FAIL"} ${name}`); ok ? pass++ : fail++; };

const OWN_LABELS = ["Archive", "Turn off commenting", "Edit", "Pin to profile", "Delete"];

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
check("5 own-post menu rows in order", JSON.stringify(labels) === JSON.stringify(OWN_LABELS));
check("no Save / Share / hide-counts / QR / reel / adjust-preview rows", !labels.some(l => /save|share|like count|qr|reel|preview|audio/i.test(l)));
check("Delete row is danger-styled", await page.locator(".comment-sheet .pm-row.danger span").allTextContents().then(t => t.join() === "Delete"));
await page.screenshot({ path: `${OUT}/pm-own-1-menu-dark.png` });
await page.locator(".sheet-backdrop").click({ force: true });
await page.waitForTimeout(300);

// 3. Pin to profile — memory-only flag + toast
await page.locator('.feed-scroll .post[data-pid="own1"] .post-head .more').click();
await page.locator(".pm-own-pin").click();
await page.waitForTimeout(250);
check("Pin to profile → pinned flag + toast", await page.evaluate(() => POSTS.find(p => p.id === "own1").pinned === true) &&
  await page.locator(".sc-toast").evaluate(t => t.textContent === "Pinned to your profile"));

// 4. Turn off commenting → comment button gone from card
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
check("menu labels flip (Turn on commenting / Unpin)",
  labels.includes("Turn on commenting") && labels.includes("Unpin from profile") && labels.includes("Archive"));
await page.locator(".sheet-backdrop").click({ force: true });
await page.waitForTimeout(300);

// 5. Archive — post leaves the feed and lands in Settings → Archive
await page.locator('.feed-scroll .post[data-pid="own1"] .post-head .more').click();
await page.locator(".pm-own-archive").click();
await page.waitForTimeout(300);
check("Archive → archived flag + card leaves feed + toast", await page.evaluate(() =>
  POSTS.find(p => p.id === "own1").archived === true &&
  !document.querySelector('.feed-scroll .post[data-pid="own1"]')) &&
  await page.locator(".sc-toast").evaluate(t => t.textContent === "Post archived"));

await page.evaluate(() => pushSub(document.querySelector(".screen"), "settings"));
await page.waitForTimeout(350);
check("settings shows Archive row with count 1", await page.evaluate(() =>
  [...document.querySelectorAll(".page-sub .sub-row")].some(r => r.dataset.sub === "archive" && r.querySelector(".sub-count")?.textContent === "1")));
await page.locator('.page-sub [data-sub="archive"]').click();
await page.waitForTimeout(350);
check("archive page lists the archived post", await page.locator(".arc-grid .svd-tile").count() === 1);
await page.screenshot({ path: `${OUT}/pm-own-8-archive.png` });
await page.locator(".arc-grid .svd-tile").first().click();
await page.waitForTimeout(400);
check("archive tile opens Archive viewer", await page.evaluate(() =>
  document.querySelector(".screen").classList.contains("pv-open") &&
  document.querySelector(".page-pv .detail-title")?.textContent === "Archive"));
await page.locator(".page-pv .post-head .more").first().click();
await page.waitForTimeout(350);
await page.locator(".pm-own-archive").click(); // Unarchive from the menu
await page.waitForTimeout(350);
check("Unarchive → post back in feed + archive page emptied", await page.evaluate(() =>
  POSTS.find(p => p.id === "own1").archived === false &&
  !!document.querySelector('.feed-scroll .post[data-pid="own1"]')) &&
  await page.locator(".arc-grid .svd-tile").count() === 0);
await page.locator(".pv-back").click();
await page.waitForTimeout(300);
await page.locator(".page-sub .sub-back").first().click(); // archive → settings
await page.waitForTimeout(300);
await page.locator(".page-sub .sub-back").first().click(); // settings → feed
await page.waitForTimeout(300);

// 8. Edit — full "Edit info" composer prefilled with the post's data (IG edit info)
await page.locator('.feed-scroll .post[data-pid="own1"] .post-head .more').click();
await page.locator(".pm-own-edit").click();
await page.waitForTimeout(450);
check("Edit → composer opens on Edit info step", await page.locator(".screen").evaluate(el =>
  el.classList.contains("sub-open") && !!el.querySelector(".cf.cap-open .cf-step2")));
check("Edit info head: Cancel + title + Done (no Share btn)", await page.evaluate(() => {
  const cf = document.querySelector(".cf-step2");
  return !!cf.querySelector(".cf-edit-x") && cf.querySelector(".t").textContent === "Edit info" &&
    !!cf.querySelector(".cf-done") && !cf.querySelector(".cf-share");
}));
check("caption prefilled with post caption", await page.locator(".cf .ig-cap-line .ta").evaluate(el => el.textContent === "my own test post"));
const mediaThumbs = () => page.locator('.cf .ig-thumbs.multi .ig-thumb:not(.ig-add)');
check("existing media prefilled as thumbs (2)", await mediaThumbs().count() === 2);
check("+ add-media tile shown (no reorder hint text)", await page.locator(".cf .ig-thumb.ig-add").count() === 1 &&
  await page.locator(".ig-reord-hint").count() === 0);
await page.screenshot({ path: `${OUT}/pm-own-4-edit-info.png` });

// 8a. drag-and-drop reorder — hold thumb 0, drop over thumb 1 → order flips
const thumbSrcs = () => page.locator('.cf .ig-thumbs.multi .ig-thumb:not(.ig-add) img')
  .evaluateAll(els => els.map(e => e.getAttribute("src")));
const before = await thumbSrcs();
const b0 = await mediaThumbs().nth(0).boundingBox();
const b1 = await mediaThumbs().nth(1).boundingBox();
await page.mouse.move(b0.x + b0.width / 2, b0.y + b0.height / 2);
await page.mouse.down();
await page.waitForTimeout(450); // past the 380ms hold-to-reorder delay
await page.mouse.move(b1.x + b1.width / 2 + 20, b1.y + b1.height / 2, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(400);
const after = await thumbSrcs();
check("reorder drag flips thumb order", after[0] === before[1] && after[1] === before[0]);

// 8b. "+" tile → media picker (add mode) — tap a cell to append
await page.locator(".cf .ig-thumb.ig-add").click();
await page.waitForTimeout(350);
check("add-media picker opens (title + Done + no Post/Clip tabs)", await page.evaluate(() => {
  const cf = document.querySelector(".cf");
  return cf.querySelector(".cf-head .t").textContent === "Add photos or clips" && !cf.querySelector(".ig-tabs") &&
    [...cf.querySelectorAll(".cf-act")].some(b => b.textContent === "Done");
}));
const addedSrc = await page.locator(".cf .ig-grid .cell[data-i] img").first().getAttribute("src");
await page.locator(".cf .ig-grid .cell[data-i]").first().click();
await page.waitForTimeout(250);
check("picker cell appends media (order=3, radio shows 3)", await page.evaluate(() => {
  const V = cpState(document.querySelector(".screen"));
  return V.order.length === 3 && document.querySelector(".cf .ig-grid .cell.sel .radio").textContent === "3";
}));

// 8c. max-10 guard — fill order to 10, another tap is blocked with a toast
await page.evaluate(() => {
  const V = cpState(document.querySelector(".screen"));
  while (V.order.length < 10) V.order.push({ src: "./assets/asset-uploads/ast-8831-3.png", dur: null });
});
await page.locator(".cf .ig-grid .cell[data-i]").nth(3).click();
await page.waitForTimeout(250);
check("adding beyond 10 blocked + toast", await page.evaluate(() =>
  cpState(document.querySelector(".screen")).order.length === 10) &&
  await page.locator(".sc-toast").evaluate(t => t.classList.contains("show") && /10/.test(t.textContent)));
await page.evaluate(() => { // restore draft to the 3 edited media, back to Edit info
  const scr = document.querySelector(".screen");
  cpState(scr).order.splice(3);
  renderSub(scr);
});
await page.locator(".cf-add-done").click(); // Done in add-media picker → Edit info
await page.waitForTimeout(400);
check("picker Done returns to Edit info with 3 thumbs", await mediaThumbs().count() === 3);

// picker "<" cancels additions — order restored to the snapshot
await page.locator(".cf .ig-thumb.ig-add").click();
await page.waitForTimeout(300);
await page.locator(".cf .ig-grid .cell[data-i]").nth(2).click();
await page.waitForTimeout(200);
await page.locator(".cf-add-cancel").click();
await page.waitForTimeout(350);
check("picker < cancels added media (back to 3 thumbs)", await mediaThumbs().count() === 3);

// 8d. remove media — down to 1 allowed, removing the last is blocked
await mediaThumbs().nth(2).locator(".rm-mini").click();
await page.waitForTimeout(300);
await mediaThumbs().nth(1).locator(".rm-mini").click();
await page.waitForTimeout(300);
check("remove down to 1 media ok", await mediaThumbs().count() === 1);
await mediaThumbs().nth(0).locator(".rm-mini").click();
await page.waitForTimeout(300);
check("removing last media blocked + toast", await mediaThumbs().count() === 1 &&
  await page.locator(".sc-toast").evaluate(t => /at least 1/.test(t.textContent)));
// re-add one media via the picker so the draft ends with 2
await page.locator(".cf .ig-thumb.ig-add").click();
await page.waitForTimeout(300);
await page.locator(".cf .ig-grid .cell[data-i]").nth(1).click();
await page.locator(".cf-add-done").click();
await page.waitForTimeout(350);
check("add-media via picker restores 2 thumbs", await mediaThumbs().count() === 2);

// 8e. edit caption → Done → same POSTS entry updated in place, feed re-renders
await page.locator(".cf .ig-cap-line .ta").fill("edited caption 🎉");
const postCountBefore = await page.evaluate(() => POSTS.length);
await page.screenshot({ path: `${OUT}/pm-own-5-edit-filled.png` });
await page.locator(".cf-done").click();
await page.waitForTimeout(400);
check("Done closes composer + toast Post updated", await page.locator(".screen").evaluate(el => !el.classList.contains("sub-open")) &&
  await page.locator(".sc-toast").evaluate(t => t.textContent === "Post updated"));
check("post updated in place (no duplicate, caption + 2 photos saved)", await page.evaluate(() => {
  const p = POSTS.find(x => x.id === "own1");
  return p.caption === "edited caption 🎉" && p.photos.length === 2 &&
    document.querySelector('.feed-scroll .post[data-pid="own1"]').textContent.includes("edited caption 🎉");
}) && await page.evaluate(c => POSTS.length === c, postCountBefore));

// 8g. detail page polish — centered "Detail" title, no N/A in name, "Ref. -", Price & Data Source N/A
await page.evaluate(() => {
  POSTS.unshift({
    id: "ownSpec", seller: CP_ME.name, avatar: CP_ME.avatar, time: "Just now", following: true, favorite: false,
    type: "showcase", photos: ["./assets/asset-uploads/ast-8831-1.png"], clip: null, clips: null,
    likes: 0, comments: 0, views: 0, liked: false, caption: "rolex for sale", captionFull: "rolex for sale",
    price: null, chips: ["Fair"],
    specGroups: [
      { title: "Watch Specifications", rows: [["Brand", "rolex"], ["Model", "N/A"], ["Reference", "N/A"]] },
      { title: "Item Details", rows: [["Condition", "Fair"]] },
    ],
    specs: [["Brand", "rolex"], ["Model", "N/A"], ["Reference", "N/A"], ["Condition", "Fair"]],
    location: null, desc: "",
    likedBy: { name: "the watch", avatar: "./assets/user-avatars/u-1042.png" },
  });
  const scr = document.querySelector(".screen");
  openPostDetail(scr, POSTS.find(p => p.id === "ownSpec"));
});
await page.waitForTimeout(400);
check("detail head centers the Detail title", await page.evaluate(() => {
  const h = document.querySelector(".page-detail .detail-head");
  const kids = [...h.children];
  const ti = kids.findIndex(k => k.classList.contains("detail-title"));
  return kids[ti - 1]?.classList.contains("spacer") && kids[ti + 1]?.classList.contains("spacer");
}));
check("detail name hides N/A parts ('rolex' not 'rolex N/A')",
  await page.locator(".page-detail .detail-name").textContent() === "rolex");
check("missing reference shows 'Ref. -' not 'Ref. N/A'",
  await page.locator(".page-detail .detail-ref").textContent() === "Ref. -");
check("spec list still shows N/A values", await page.locator(".page-detail").evaluate(el => el.textContent.includes("N/A")));
check("descriptions shows '-' when no desc filled", await page.locator(".page-detail .detail-desc").evaluate(el => el.textContent === "-"));
await page.screenshot({ path: `${OUT}/pm-own-6-detail.png` });

// 8h. edit adds Price & Data Source (N/A rows) + Description field in Watch details
await page.locator(".page-detail .pm-btn, .page-detail .post-head .more").first().click();
await page.waitForTimeout(350);
await page.locator(".pm-own-edit").click();
await page.waitForTimeout(450);
await page.locator('.ig-row[data-pane="spec"]').click();
await page.waitForTimeout(350);
check("Watch details pane has a Description textarea", await page.locator('.cf-pane textarea.cf-f[data-f="desc"]').count() === 1);
await page.locator('.cf-pane textarea.cf-f[data-f="desc"]').fill("Long description — serviced in 2024, keeps great time, hairline scratches on the clasp.");
await page.locator(".cf-pane .pane-done").click();
await page.waitForTimeout(250);
await page.locator(".cf-done").click();
await page.waitForTimeout(400);
check("saved post gains Price & Data Source with N/A rows", await page.evaluate(() => {
  const g = (POSTS.find(p => p.id === "ownSpec").specGroups || []).find(g => g.title === "Price & Data Source");
  return !!g && g.rows.some(r => r[0] === "Asking Price" && r[1] === "N/A");
}));
check("detail shows Price & Data Source section", await page.locator(".page-detail").evaluate(el => el.textContent.includes("Price & Data Source")));
check("descriptions shows the real description field", await page.evaluate(() => {
  const p = POSTS.find(x => x.id === "ownSpec");
  return p.desc.startsWith("Long description") && document.querySelector(".page-detail .detail-desc").textContent.startsWith("Long description");
}));
await page.screenshot({ path: `${OUT}/pm-own-7-detail-price.png` });
await page.locator(".page-detail .detail-back").first().click();
await page.waitForTimeout(350);
await page.evaluate(() => { // clean up
  POSTS.splice(POSTS.findIndex(x => x.id === "ownSpec"), 1);
  const scr = document.querySelector(".screen");
  scr.querySelector(".feed-scroll").innerHTML = feedContentHTML(scr.dataset.variant);
});

// 8h. clip post edit — clip badge + dur preserved through the flow
await page.evaluate(() => {
  POSTS.unshift({
    id: "ownClip", seller: CP_ME.name, avatar: CP_ME.avatar, time: "Just now", following: true, favorite: false,
    type: "showcase", photos: ["./assets/asset-uploads/feed-tudor-bb.jpg"], clip: "0:12", clips: ["0:12"],
    likes: 0, comments: 0, views: 0, liked: false, caption: "clip edit test", captionFull: "clip edit test",
    price: null, chips: [], specGroups: [], specs: [], location: null, desc: "clip edit test",
    likedBy: { name: "the watch", avatar: "./assets/user-avatars/u-1042.png" },
  });
  const scr = document.querySelector(".screen");
  scr.querySelector(".feed-scroll").innerHTML = feedContentHTML(scr.dataset.variant);
});
await page.locator('.feed-scroll .post[data-pid="ownClip"] .post-head .more').click();
await page.locator(".pm-own-edit").click();
await page.waitForTimeout(450);
check("clip post → thumb keeps dur badge in edit", await page.locator(".cf .ig-thumb.clip .dur").count() === 1);
await page.locator(".cf-done").click();
await page.waitForTimeout(350);
check("Done keeps clip on the post", await page.evaluate(() => {
  const p = POSTS.find(x => x.id === "ownClip");
  return p.clip === "0:12" && p.clips[0] === "0:12";
}));
await page.evaluate(() => { // clean up the clip post
  POSTS.splice(POSTS.findIndex(x => x.id === "ownClip"), 1);
  const scr = document.querySelector(".screen");
  scr.querySelector(".feed-scroll").innerHTML = feedContentHTML(scr.dataset.variant);
});

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
check("light theme own menu renders", await page.locator(".comment-sheet .pm-row").count() === 5);
await page.screenshot({ path: `${OUT}/pm-own-3-menu-light.png` });
await page.locator(".sheet-backdrop").click({ force: true });

check("no console/page errors", errs.length === 0);
if (errs.length) console.log("ERRORS:", errs);
console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
