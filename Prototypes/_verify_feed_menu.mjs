// Verify fo-flow FEED-009+010+011: post "..." menu + IG-style Not interested /
// Report flow + working feedback-card actions. "..." opens a bottom sheet with
// Not interested / Report(red); Not interested -> Thanks-for-feedback card
// (Undo + working rows: Mute -> center dialog -> hides seller + Settings unmute,
// Manage content preferences -> prefs page, This post made me uncomfortable ->
// ack card with Report/Undo); Report -> full-page 9-reason list (TukDaeng-adapted,
// incl. Counterfeit or replica item). FEED-010 adds center "Unfollowed"/"Posts
// muted" toasts. FEED-011: action row — like heart has no count, eye is a
// display-only filled-eye view stat, "x and others liked" opens a Likes sheet
// (no search, Follow toggles), share opens an IG-style sheet (search + 2-row
// scrollable friend grid + Messenger/Direct/LINE/Facebook/Copy link), save
// opens a Collections sheet (Saved + collections + New collection) and saved
// posts list under Settings > Saved. FEED-012: Favorites tab filters
// favorite ACCOUNTS (seller-level flag) instead of liked posts — "..." menu
// gains a separate top card with Add/Remove from favorites (star icon), and
// the empty state uses a star instead of a heart. like/unlike no longer
// affects the Favorites tab. Regression: comments/unfollow/like/follow/swipe.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-FEED-010/after";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
let errors = 0, failed = 0;
page.on("console", m => { if (m.type() === "error") { errors++; console.log("CONSOLE ERR:", m.text()); } });
page.on("pageerror", e => { errors++; console.log("PAGE ERR:", e.message); });

const check = (name, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`);
  if (!ok) failed++;
};

await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

const scr = () => page.locator(".screen").first();
const moreBtn = pid => page.locator(`.feed-scroll .post[data-pid="${pid}"] .post-head .more`);
const openMenu = async pid => {
  await moreBtn(pid).click();
  await page.waitForTimeout(350);
};
const closeSheet = async () => {
  await page.locator(".sheet-backdrop").click({ position: { x: 20, y: 120 } });
  await page.waitForTimeout(350);
};

// 1) icon is "..." (3 circles), no hamburger path left in post heads
check("card p1 .more shows 3-dot icon", await moreBtn("p1").locator("svg circle").count() === 3);
check("no hamburger <path> left in any .more", await page.locator(".post-head .more svg path").count() === 0);
check("every post-head has .more", await page.locator(".feed-scroll .post-head .more").count() === 11);

// 2) "..." opens menu sheet. Followed post (p7): top card = Add to favorites (star),
// bottom card = Not interested + Report(red). Non-followed post (p1): bottom card only.
await openMenu("p7");
check("pm sheet opens", await page.locator(".screen.pm-open").count() === 1);
check("followed post: menu has 2 cards", await page.locator(".pm-card").count() === 2);
check("followed post: 3 rows", await page.locator(".pm-row").count() === 3);
check("row 1 = Add to favorites", (await page.locator(".pm-row").nth(0).textContent()).trim() === "Add to favorites");
check("row 2 = Not interested", (await page.locator(".pm-row").nth(1).textContent()).trim() === "Not interested");
check("row 3 = Report", (await page.locator(".pm-row").nth(2).textContent()).trim() === "Report");
check("favorites row has star icon", await page.locator(".pm-fav svg").count() === 1);
check("fav row in separate top card", await page.locator(".pm-card.pm-top .pm-fav").count() === 1 && await page.locator(".pm-card.pm-top .pm-row").count() === 1);
await page.screenshot({ path: `${OUT}/d-menu-sheet.png` });
await closeSheet();
await openMenu("p1");
check("non-followed post: single card", await page.locator(".pm-card").count() === 1);
check("non-followed post: 2 rows (no favorites)", await page.locator(".pm-row").count() === 2 && await page.locator(".pm-fav").count() === 0);
check("non-followed row 1 = Not interested", (await page.locator(".pm-row").nth(0).textContent()).trim() === "Not interested");
const rpColor = await page.locator(".pm-row.danger").evaluate(el => getComputedStyle(el).color);
check("Report row is red", /rgb\(200, ?33, ?43\)/.test(rpColor), rpColor);

// 3) Not interested -> post replaced inline by Thanks-for-feedback card (IG-style)
await page.locator(".pm-ni").click();
await page.waitForTimeout(350);
check("sheet closes after Not interested", await page.locator(".screen.pm-open").count() === 0);
const niCard = page.locator('.feed-scroll .post.ni-card[data-pid="p1"]');
check("p1 replaced by feedback card", await niCard.count() === 1);
check("title = Thanks for your feedback", (await niCard.locator(".ni-title").textContent()).trim() === "Thanks for your feedback");
check("sub = We'll suggest fewer posts like this.", (await niCard.locator(".ni-sub").textContent()).includes("fewer posts like this"));
check("Undo present top-right", await niCard.locator(".ni-head .pm-undo").count() === 1);
check("2 items (not-followed variant)", await niCard.locator(".ni-item").count() === 2);
check("no Mute row when not followed", await niCard.locator(".ni-mute").count() === 0 && await niCard.locator(".ni-unfollow").count() === 0);
check("item 1 = Manage content preferences", (await niCard.locator(".ni-item").nth(0).textContent()).includes("Manage content preferences"));
check("item 2 = This post made me uncomfortable", (await niCard.locator(".ni-item").nth(1).textContent()).includes("This post made me uncomfortable"));
check("items have leading icons", await niCard.locator(".ni-item svg").count() === 2);
await niCard.scrollIntoViewIfNeeded();
await page.screenshot({ path: `${OUT}/d-ni-card.png` });

// 4) Undo restores the post in place
await niCard.locator(".pm-undo").click();
await page.waitForTimeout(350);
check("Undo restores post p1", await page.locator('.feed-scroll .post[data-pid="p1"] .post-photo').count() === 1);
check("feedback card gone", await page.locator(".post.ni-card").count() === 0);

// 5) Report -> full-screen report page (IG-style: centered title + X top-right, question, desc, 9 reasons)
await openMenu("p1");
await page.locator(".pm-go-report").click();
await page.waitForTimeout(400);
check("menu sheet closes for report", await page.locator(".screen.pm-open").count() === 0);
check("report page opens", await page.locator(".screen.sub-open").count() === 1);
check("report slides up from bottom", await page.locator(".page-sub.pg-up").count() === 1);
check("report title = Report", (await page.locator(".page-sub .detail-title").textContent()).trim() === "Report");
check("X close button present", await page.locator(".page-sub .sub-x").count() === 1);
check("question = Why are you reporting this post?", (await page.locator(".pm-rp-q").textContent()).trim() === "Why are you reporting this post?");
check("anonymous desc", (await page.locator(".pm-rp-desc").textContent()).includes("Your report is anonymous"));
check("9 reason rows", await page.locator(".pm-reason").count() === 9);
const r1 = (await page.locator(".pm-reason").nth(0).textContent()).trim();
const r5 = (await page.locator(".pm-reason").nth(4).textContent()).trim();
const r9 = (await page.locator(".pm-reason").nth(8).textContent()).trim();
check("reason 1 = I just don't like it", r1.startsWith("I just don't like it"), r1);
check("reason 5 = Counterfeit or replica item", r5.startsWith("Counterfeit or replica item"), r5);
check("reason 9 = Intellectual property", r9.startsWith("Intellectual property"), r9);
check("reasons have chevrons", await page.locator(".pm-reason .pm-chev").count() === 9);
await page.screenshot({ path: `${OUT}/d-report-page.png` });

// 6) X closes report page
await page.locator(".page-sub .sub-x").click();
await page.waitForTimeout(350);
check("X closes report page", await page.locator(".screen.sub-open").count() === 0);

// 7) pick a reason -> closes + toast
await openMenu("p1");
await page.locator(".pm-go-report").click();
await page.waitForTimeout(350);
await page.locator(".pm-reason").nth(5).click();
await page.waitForTimeout(300);
check("reason pick closes report page", await page.locator(".screen.sub-open").count() === 0);
check("toast shown", await page.locator("#flowToast.show").count() === 1, await page.locator("#flowToast").textContent());
await page.waitForTimeout(1800);

// 8) feedback card sub-item -> opens Content preferences page (FEED-010); card stays; post gone entirely on re-render
await openMenu("p1");
await page.locator(".pm-ni").click();
await page.waitForTimeout(300);
await page.locator('.post.ni-card .ni-item').nth(0).click();
await page.waitForTimeout(400);
check("sub-item opens Content preferences", await page.locator(".screen.sub-open").count() === 1 && (await page.locator(".page-sub .detail-title").textContent()).includes("Content preferences"));
await page.locator(".sub-back").click();
await page.waitForTimeout(350);
check("prefs back closes page", await page.locator(".screen.sub-open").count() === 0);
check("card still shown", await page.locator(".post.ni-card").count() === 1);
await page.locator(".feed-tab").nth(1).click();
await page.waitForTimeout(300);
await page.locator(".feed-tab").nth(0).click();
await page.waitForTimeout(300);
check("post gone after tab re-render", await page.locator('.post[data-pid="p1"]').count() === 0);
check("posts count 10 after ni + re-render", await page.locator(".feed-scroll .post").count() === 10);

// 8b) ni on a FOLLOWED post (p7) -> "Unfollow {seller}" row unfollows for real
await openMenu("p7");
await page.locator(".pm-ni").click();
await page.waitForTimeout(300);
const ni7 = page.locator('.post.ni-card[data-pid="p7"]');
check("followed variant = 3 items", await ni7.locator(".ni-item").count() === 3);
check("followed post gets Mute row", (await ni7.locator(".ni-mute").textContent()).includes("Mute wrist.story") && (await ni7.locator(".ni-desc").textContent()).includes("Stop seeing new posts"));
check("followed post gets Unfollow row", await ni7.locator(".ni-unfollow").count() === 1);
check("row = Unfollow wrist.story", (await ni7.locator(".ni-unfollow").textContent()).includes("Unfollow wrist.story"));
await ni7.locator(".ni-unfollow").click();
await page.waitForTimeout(250);
await page.locator(".feed-tab").nth(1).click();
await page.waitForTimeout(300);
check("unfollow via card drops p7 (following=2)", await page.locator(".feed-scroll .post").count() === 2);
await page.locator(".feed-tab").nth(0).click();
await page.waitForTimeout(300);
check("p7 fully gone after re-render (ni)", await page.locator('.post[data-pid="p7"]').count() === 0);
// restore p7 baseline (ni flag + follow) — UI undo is gone after re-render
await page.evaluate(() => { const p = POSTS.find(x => x.id === "p7"); p.ni = false; p.following = true; });
await page.locator(".feed-tab").nth(1).click();
await page.waitForTimeout(300);
await page.locator(".feed-tab").nth(0).click();
await page.waitForTimeout(300);
check("p7 restored to feed", await page.locator('.post[data-pid="p7"]').count() === 1);

// 9) backdrop tap closes menu sheet
await openMenu("p4");
await closeSheet();
check("backdrop closes sheet", await page.locator(".screen.pm-open").count() === 0);

// 10) detail page "..." also opens the menu — DL1 header dots (p4) + DL2 post-head (p5)
await page.locator('.post[data-pid="p4"] .more-link').click();
await page.waitForTimeout(250);
await page.locator('.post[data-pid="p4"] .details-toggle').click();
await page.waitForTimeout(300);
await page.locator('.post[data-pid="p4"] .view-full').click();
await page.waitForTimeout(400);
check("DL1 detail head has pm-btn", await page.locator(".page-detail .detail-head .pm-btn").count() === 1);
await page.locator(".page-detail .detail-head .pm-btn").click();
await page.waitForTimeout(350);
check("menu opens from DL1 detail head (non-followed: 2 rows)", await page.locator(".screen.pm-open").count() === 1 && await page.locator(".pm-row").count() === 2);
await page.screenshot({ path: `${OUT}/d-menu-from-detail.png` });
await page.locator(".pm-ni").click();
await page.waitForTimeout(300);
check("sheet closes from detail ni", await page.locator(".screen.pm-open").count() === 0);
await page.locator(".page-detail .detail-back").first().click();
await page.waitForTimeout(300);
check("feed card replaced via detail ni", await page.locator('.post.ni-card[data-pid="p4"]').count() === 1);
await page.locator('.post.ni-card .pm-undo').click();
await page.waitForTimeout(300);
check("post restored after undo", await page.locator('.post[data-pid="p4"] .post-photo').count() === 1);

await page.locator('.post[data-pid="p5"] .more-link').click();
await page.waitForTimeout(250);
await page.locator('.post[data-pid="p5"] .details-toggle').click();
await page.waitForTimeout(300);
await page.locator('.post[data-pid="p5"] .view-full').click();
await page.waitForTimeout(400);
await page.locator(".page-detail .post-head .more").click();
await page.waitForTimeout(350);
check("menu opens from DL2 detail post-head (non-followed: 2 rows)", await page.locator(".screen.pm-open").count() === 1 && await page.locator(".pm-row").count() === 2);
await page.locator(".sheet-handle").click();
await page.waitForTimeout(300);
await page.locator(".page-detail .detail-back").first().click();
await page.waitForTimeout(300);

// 11) light theme — same flow
await page.locator("#themeToggle").click();
await page.waitForTimeout(300);
await openMenu("p4");
check("menu opens in light theme", await page.locator(".screen.pm-open").count() === 1);
await page.locator(".pm-ni").click();
await page.waitForTimeout(300);
check("ni-card shows in light theme", await page.locator('.post.ni-card[data-pid="p4"]').count() === 1);
await page.locator('.post.ni-card').scrollIntoViewIfNeeded();
await page.screenshot({ path: `${OUT}/l-ni-card.png` });
await page.locator('.post.ni-card .pm-undo').click();
await page.waitForTimeout(300);
await page.locator("#themeToggle").click();
await page.waitForTimeout(300);

// 12) regression — comment sheet, unfollow sheet, like->favorites, following, swipe
// (p1 is ni'd + gone after step 8's re-render — use p8 for follow/like)
await page.locator('.post[data-pid="p7"] .comment-btn').click();
await page.waitForTimeout(400);
check("comment sheet still opens", await page.locator(".comment-sheet .c-row").count() > 0);
await page.locator(".sheet-handle").click();
await page.waitForTimeout(350);
// favorites gated on follow (IG): non-followed seller shows no favorites row
await openMenu("p8");
check("no favorites row before following", await page.locator(".pm-fav").count() === 0 && await page.locator(".pm-row").count() === 2);
await closeSheet();
await page.locator('.post[data-pid="p8"] .follow-btn').click();
await page.waitForTimeout(250);
check("follow p8 still flips in place", (await page.locator('.post[data-pid="p8"] .follow-btn').textContent()).trim() === "Following");
await page.locator('.post[data-pid="p8"] .follow-btn').click();
await page.waitForTimeout(300);
check("unfollow sheet still opens", await page.locator(".screen.unfollow-open").count() === 1);
await page.locator(".uf-cancel").click();
await page.waitForTimeout(300);
await page.locator('.post[data-pid="p8"] .like-btn').click();
await page.waitForTimeout(250);
await page.locator(".feed-tab").nth(2).click();
await page.waitForTimeout(300);
check("like does NOT feed Favorites anymore", await page.locator(".feed-scroll .post").count() === 0);
check("favorites empty state = star icon", await page.locator(".feed-empty .fe-ico svg polygon").count() === 1);
check("favorites empty title", (await page.locator(".feed-empty .fe-title").textContent()).trim() === "No favorites yet");
await page.locator(".feed-tab").nth(0).click();
await page.waitForTimeout(300);
// favorite account via "..." top card -> seller's post lands in Favorites
await openMenu("p8");
check("row 1 = Add to favorites (not-yet-fav)", (await page.locator(".pm-fav").textContent()).trim() === "Add to favorites");
await page.locator(".pm-fav").click();
await page.waitForTimeout(300);
check("fav sheet closes", await page.locator(".screen.pm-open").count() === 0);
check("toast = Added to favorites", (await page.locator(".sc-toast").textContent()).trim() === "Added to favorites" && await page.locator(".sc-toast.show").count() === 1);
await page.waitForTimeout(1900);
await page.locator(".feed-tab").nth(2).click();
await page.waitForTimeout(300);
check("favorite account p8 lands in Favorites", await page.locator(".feed-scroll .post").count() === 1 && (await page.locator(".feed-scroll .post").first().getAttribute("data-pid")) === "p8");
// remove via "..." on the favorites tab -> drops inline to empty state
await openMenu("p8");
check("row 1 = Remove from favorites (faved)", (await page.locator(".pm-fav").textContent()).trim() === "Remove from favorites");
check("remove star is amber filled (IG)", await page.locator(".pm-fav svg").evaluate(el => el.getAttribute("fill") === "#f5a623"));
await page.screenshot({ path: `${OUT}/d-menu-favorites-card.png` });
await page.locator(".pm-fav").click();
await page.waitForTimeout(300);
check("toast = Removed from favorites", (await page.locator(".sc-toast").textContent()).trim() === "Removed from favorites");
check("remove drops to empty state in-tab", await page.locator(".feed-scroll .post").count() === 0 && await page.locator(".feed-empty").count() === 1);
await page.waitForTimeout(1900);
// unfollow also clears the favorite flag (IG: favorites ⊆ following)
await page.locator(".feed-tab").nth(0).click();
await page.waitForTimeout(300);
await openMenu("p8");
await page.locator(".pm-fav").click();
await page.waitForTimeout(1900);
check("re-added to favorites", await page.evaluate(() => POSTS.find(x => x.id === "p8").favorite === true));
// followed posts render without Follow btn after re-render — unfollow via ni-card row
await openMenu("p8");
await page.locator(".pm-ni").click();
await page.waitForTimeout(300);
check("followed ni-card has Unfollow row", await page.locator('.post.ni-card[data-pid="p8"] .ni-unfollow').count() === 1);
await page.locator('.post.ni-card[data-pid="p8"] .ni-unfollow').click();
await page.waitForTimeout(300);
check("unfollow toast = Unfollowed", (await page.locator(".sc-toast").textContent()).trim() === "Unfollowed");
await page.waitForTimeout(1900);
await page.locator(".feed-tab").nth(2).click();
await page.waitForTimeout(300);
check("unfollow removes seller from Favorites", await page.locator(".feed-scroll .post").count() === 0 && await page.locator(".feed-empty").count() === 1);
// restore p8 baseline (ni + following) — UI undo is gone after card removal
await page.evaluate(() => { const p = POSTS.find(x => x.id === "p8"); p.ni = false; p.following = true; });
await page.locator(".feed-tab").nth(0).click();
await page.waitForTimeout(300);
check("p8 restored to feed", await page.locator('.post[data-pid="p8"]').count() === 1);
await page.locator(".feed-tab").nth(1).click();
await page.waitForTimeout(300);
check("following tab = 4 posts", await page.locator(".feed-scroll .post").count() === 4, String(await page.locator(".feed-scroll .post").count()));
await page.locator(".feed-tab").nth(0).click();
await page.waitForTimeout(300);

// swipe regression on p10 (2 photos) — scroll into view first, drag like _verify_feed_posts
const p10photo = page.locator('.post[data-pid="p10"] .post-photo');
await p10photo.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const counter = page.locator('.post[data-pid="p10"] .photo-counter');
const box = await p10photo.boundingBox();
const cy = box.y + box.height / 2;
await page.mouse.move(box.x + box.width * 0.7, cy);
await page.mouse.down();
for (let i = 1; i <= 10; i++) await page.mouse.move(box.x + box.width * (0.7 - 0.5 * i / 10), cy);
await page.mouse.up();
await page.waitForTimeout(500);
check("swipe still works (p10 -> 2/2)", (await counter.textContent()).trim() === "2/2", await counter.textContent());

/* ===== FEED-010 — feedback-card actions work for real ===== */

// 13) "This post made me uncomfortable" -> card swaps to IG ack state (check + Report + Undo)
await openMenu("p6");
await page.locator(".pm-ni").click();
await page.waitForTimeout(300);
await page.locator('.post.ni-card[data-pid="p6"] .ni-uncomf').click();
await page.waitForTimeout(300);
const uc6 = page.locator('.post.ni-card[data-pid="p6"]');
check("uncomfortable swaps card (no sheet)", await page.locator(".screen.pm-open").count() === 0 && await uc6.count() === 1);
check("green check icon shown", await uc6.locator(".ni-check svg").count() === 1);
check("title = Thanks for letting us know", (await uc6.locator(".ni-t2").textContent()).trim() === "Thanks for letting us know");
check("desc mentions Community Standards + report", (await uc6.locator(".ni-d2").textContent()).includes("Community Standards"));
check("action 1 = Report (red)", (await uc6.locator(".ni-action").nth(0).textContent()).trim() === "Report" && await uc6.locator(".ni-action.danger").count() === 1);
check("action 2 = Undo", (await uc6.locator(".ni-action").nth(1).textContent()).trim() === "Undo");
await uc6.scrollIntoViewIfNeeded();
await page.screenshot({ path: `${OUT}/d-uncomfortable-card.png` });
// Undo -> closes the card and restores the post entirely (like the main Undo)
await uc6.locator(".uc-undo").click();
await page.waitForTimeout(300);
check("uc Undo restores post (card gone)", await page.locator('.post.ni-card[data-pid="p6"]').count() === 0 && await page.locator('.post[data-pid="p6"] .post-head').count() === 1);

// 14) uncomfortable -> Report enters existing 9-reason report flow
await openMenu("p9");
await page.locator(".pm-ni").click();
await page.waitForTimeout(300);
await page.locator('.post.ni-card[data-pid="p9"] .ni-uncomf').click();
await page.waitForTimeout(300);
await page.locator('.post.ni-card[data-pid="p9"] .uc-report').click();
await page.waitForTimeout(400);
check("uc Report -> report page", await page.locator(".screen.sub-open").count() === 1 && await page.locator(".pm-reason").count() === 9);
await page.locator(".pm-reason").nth(0).click();
await page.waitForTimeout(300);
check("uc report reason closes + toast", await page.locator(".screen.sub-open").count() === 0 && await page.locator("#flowToast.show").count() === 1);
await page.waitForTimeout(1900);

// 15) Mute {seller} -> center dialog (Mute posts only) -> hides seller posts + "Posts muted" toast
await openMenu("p10");
await page.locator(".pm-ni").click();
await page.waitForTimeout(300);
const ni10 = page.locator('.post.ni-card[data-pid="p10"]');
check("followed ni-card has Mute row", (await ni10.locator(".ni-mute").textContent()).includes("Mute slow.hand"));
await ni10.locator(".ni-mute").click();
await page.waitForTimeout(300);
check("mute dialog opens", await page.locator(".screen.dialog-open").count() === 1);
check("dialog title = Mute slow.hand?", (await page.locator(".dlg-q").textContent()).trim() === "Mute slow.hand?");
check("dialog desc mentions Settings unmute", (await page.locator(".dlg-desc").textContent()).includes("Settings"));
check("single red action = Mute posts", (await page.locator(".dlg-btn.danger").textContent()).trim() === "Mute posts" && await page.locator(".dlg-btn").count() === 2);
await page.screenshot({ path: `${OUT}/d-mute-dialog.png` });
await page.locator(".dlg-cancel").click();
await page.waitForTimeout(300);
check("cancel keeps card + post", await page.locator(".screen.dialog-open").count() === 0 && await page.locator('.post.ni-card[data-pid="p10"]').count() === 1);
await ni10.locator(".ni-mute").click();
await page.waitForTimeout(300);
await page.locator(".dlg-mute-go").click();
await page.waitForTimeout(300);
check("mute closes dialog", await page.locator(".screen.dialog-open").count() === 0);
check("toast = Posts muted", (await page.locator(".sc-toast").textContent()).trim() === "Posts muted" && await page.locator(".sc-toast.show").count() === 1);
check("p10 gone after mute", await page.locator('.post[data-pid="p10"]').count() === 0);
await page.screenshot({ path: `${OUT}/d-posts-muted.png` });
await page.waitForTimeout(1900);
await page.locator(".feed-tab").nth(1).click();
await page.waitForTimeout(300);
check("following tab drops muted seller (3)", await page.locator(".feed-scroll .post").count() === 3, String(await page.locator(".feed-scroll .post").count()));
await page.locator(".feed-tab").nth(0).click();
await page.waitForTimeout(300);

// 16) Settings (header sliders) -> Muted accounts -> Unmute restores posts
await page.locator(".set-btn").click();
await page.waitForTimeout(400);
check("sliders opens Settings and activity", await page.locator(".screen.sub-open").count() === 1 && (await page.locator(".page-sub .detail-title").textContent()).includes("Settings and activity"));
check("settings has What you see + Muted accounts row", (await page.locator(".sub-sec").textContent()).includes("What you see") && (await page.locator('.sub-row[data-sub="muted"]').textContent()).includes("Muted accounts"));
check("muted count = 1", (await page.locator('.sub-row[data-sub="muted"] .sub-count').textContent()).trim() === "1");
check("settings has Content preferences row", (await page.locator('.sub-row[data-sub="prefs"]').textContent()).includes("Content preferences"));
await page.screenshot({ path: `${OUT}/d-settings.png` });
await page.locator('.sub-row[data-sub="muted"]').click();
await page.waitForTimeout(350);
check("muted accounts page", (await page.locator(".page-sub .detail-title").textContent()).includes("Muted accounts"));
check("muted list shows slow.hand + Unmute", (await page.locator(".mrow .mn").textContent()).includes("slow.hand") && await page.locator(".m-unmute").count() === 1);
await page.screenshot({ path: `${OUT}/d-muted-accounts.png` });
await page.locator(".m-unmute").click();
await page.waitForTimeout(300);
check("unmute toast = Posts unmuted", (await page.locator(".sc-toast").textContent()).trim() === "Posts unmuted");
check("muted list empty after unmute", await page.locator(".mrow").count() === 0 && (await page.locator(".sub-empty").textContent()).includes("No muted accounts"));
await page.locator(".sub-back").click();
await page.waitForTimeout(350);
check("back to settings, count now 0", (await page.locator('.sub-row[data-sub="muted"] .sub-count').textContent()).trim() === "0");
await page.locator(".sub-back").click();
await page.waitForTimeout(350);
check("settings closed", await page.locator(".screen.sub-open").count() === 0);
// p10 was marked Not interested before muting — unmute clears muted only; ni state survives
check("p10 still hidden (ni'd survives unmute)", await page.locator('.post[data-pid="p10"]').count() === 0);
check("p10 muted flag cleared", await page.evaluate(() => POSTS.find(x => x.id === "p10").muted === false));
await page.waitForTimeout(1900);

// 17) Manage content preferences from ni-card -> real prefs page
await openMenu("p3");
await page.locator(".pm-ni").click();
await page.waitForTimeout(300);
await page.locator('.post.ni-card[data-pid="p3"] .ni-pref').click();
await page.waitForTimeout(400);
check("prefs page opens", (await page.locator(".page-sub .detail-title").textContent()).includes("Content preferences"));
const prefsTxt = await page.locator(".page-sub").textContent();
check("prefs rows present", ["Sensitive content", "Interested", "Not interested", "Snooze suggested posts", "Reset suggested content"].every(t => prefsTxt.includes(t)));
check("snooze toggle rendered", await page.locator(".tg-sw").count() === 1);
await page.screenshot({ path: `${OUT}/d-content-preferences.png` });
// Not interested list -> Restore brings post back
await page.locator('.sub-row[data-sub="ni"]').click();
await page.waitForTimeout(350);
check("ni list page", (await page.locator(".page-sub .detail-title").textContent()).includes("Not interested"));
check("ni list = 4 rows (p1,p9,p10,p3)", await page.locator(".mrow").count() === 4, String(await page.locator(".mrow").count()));
await page.locator('.m-restore[data-pid="p3"]').click();
await page.waitForTimeout(300);
check("restore removes row (3 left)", await page.locator(".mrow").count() === 3);
await page.locator('.m-restore[data-pid="p10"]').click();
await page.waitForTimeout(300);
check("restore p10 -> 2 left", await page.locator(".mrow").count() === 2);
check("p3 + p10 back in feed", await page.locator('.post[data-pid="p3"]').count() === 1 && await page.locator('.post[data-pid="p10"]').count() === 1);
await page.locator(".sub-back").click();
await page.waitForTimeout(350);
// Sensitive content -> pick Less
await page.locator('.sub-row[data-sub="sensitive"]').click();
await page.waitForTimeout(350);
check("sensitive page, Standard checked", await page.locator('[data-sens="standard"] .sens-check svg').count() === 1 && await page.locator('[data-sens="less"] .sens-check svg').count() === 0);
await page.locator('[data-sens="less"]').click();
await page.waitForTimeout(300);
check("sensitive switches to Less", await page.locator('[data-sens="less"] .sens-check svg').count() === 1);
await page.locator(".sub-back").click();
await page.waitForTimeout(350);
// Interested list -> Remove unlikes
await page.locator('.sub-row[data-sub="interested"]').click();
await page.waitForTimeout(350);
check("interested list = 1 row (p8)", await page.locator(".mrow").count() === 1, String(await page.locator(".mrow").count()));
await page.locator(".m-unlike").click();
await page.waitForTimeout(300);
check("interested empty after remove", await page.locator(".sub-empty").count() === 1);
await page.locator(".sub-back").click();
await page.waitForTimeout(350);
// Snooze toggle -> all tab shows only followed posts
await page.locator('[data-tgl="snooze"]').click();
await page.waitForTimeout(300);
check("snooze on -> feed = followed only (4)", await page.locator(".feed-scroll .post").count() === 4, String(await page.locator(".feed-scroll .post").count()));
// Reset suggested content -> confirm dialog -> all posts back
await page.locator('[data-dlg="reset"]').click();
await page.waitForTimeout(300);
check("reset dialog opens", await page.locator(".screen.dialog-open").count() === 1 && (await page.locator(".dlg-q").textContent()).includes("Reset suggested content"));
await page.locator(".dlg-reset-go").click();
await page.waitForTimeout(300);
check("reset restores feed (11 posts)", await page.locator(".feed-scroll .post").count() === 11, String(await page.locator(".feed-scroll .post").count()));
check("reset toast", (await page.locator(".sc-toast").textContent()).trim() === "Suggested content reset");
await page.waitForTimeout(1900);
await page.locator(".sub-back").click();
await page.waitForTimeout(350);
check("prefs back closes to feed", await page.locator(".screen.sub-open").count() === 0);

// 18) Unfollow from ni-card -> "Unfollowed" toast + feedback card removed entirely
await openMenu("p2");
await page.locator(".pm-ni").click();
await page.waitForTimeout(300);
const ni2 = page.locator('.post.ni-card[data-pid="p2"]');
await ni2.locator(".ni-unfollow").click();
await page.waitForTimeout(300);
check("unfollow toast = Unfollowed", (await page.locator(".sc-toast").textContent()).trim() === "Unfollowed" && await page.locator(".sc-toast.show").count() === 1);
check("feedback card removed after unfollow", await page.locator('.post.ni-card[data-pid="p2"]').count() === 0);
await page.screenshot({ path: `${OUT}/d-unfollowed-toast.png` });
// restore p2: clear ni -> re-render -> shows Follow button (not followed)
await page.evaluate(() => { const p = POSTS.find(x => x.id === "p2"); p.ni = false; });
await page.locator(".feed-tab").nth(1).click();
await page.waitForTimeout(300);
await page.locator(".feed-tab").nth(0).click();
await page.waitForTimeout(300);
check("p2 back with Follow button", (await page.locator('.post[data-pid="p2"] .follow-btn').textContent()).trim() === "Follow");
// uf-sheet unfollow path also toasts — mark followed so the stale Follow btn opens the sheet
await page.evaluate(() => { const p = POSTS.find(x => x.id === "p2"); p.following = true; });
await page.locator('.post[data-pid="p2"] .follow-btn').click();
await page.waitForTimeout(300);
check("uf sheet opens for followed seller", await page.locator(".screen.unfollow-open").count() === 1);
await page.locator(".uf-confirm").click();
await page.waitForTimeout(300);
check("uf-sheet toast = Unfollowed", (await page.locator(".sc-toast").textContent()).trim() === "Unfollowed");
await page.waitForTimeout(1900);
await page.evaluate(() => { const p = POSTS.find(x => x.id === "p2"); p.following = true; });
await page.locator(".feed-tab").nth(1).click();
await page.waitForTimeout(300);
await page.locator(".feed-tab").nth(0).click();
await page.waitForTimeout(300);

// 19) light theme — settings/prefs still work
await page.locator("#themeToggle").click();
await page.waitForTimeout(300);
await page.locator(".set-btn").click();
await page.waitForTimeout(400);
await page.locator('.sub-row[data-sub="prefs"]').click();
await page.waitForTimeout(350);
check("prefs opens in light theme", (await page.locator(".page-sub .detail-title").textContent()).includes("Content preferences"));
await page.screenshot({ path: `${OUT}/l-content-preferences.png` });
await page.locator(".sub-back").click();
await page.waitForTimeout(300);
await page.locator(".sub-back").click();
await page.waitForTimeout(300);
await page.locator("#themeToggle").click();
await page.waitForTimeout(300);

/* ===== FEED-011 — action row: like (no count) / views (display-only eye) /
   liked-by -> Likes sheet / share sheet / save -> collections sheet ===== */
const OUT11 = import.meta.dirname + "/screenshots/task-FEED-011/after";
mkdirSync(OUT11, { recursive: true });

// 20) like-btn = heart only, no count span; toggle still works
check("like-btn has no count span", await page.locator('.post[data-pid="p5"] .like-btn span').count() === 0);
await page.locator('.post[data-pid="p5"] .like-btn').click();
await page.waitForTimeout(250);
check("p5 heart toggles liked", await page.locator('.post[data-pid="p5"] .like-btn.liked').count() === 1);
await page.locator('.post[data-pid="p5"] .like-btn').click();
await page.waitForTimeout(250);
check("p5 heart untoggles", await page.locator('.post[data-pid="p5"] .like-btn.liked').count() === 0);

// 21) views = filled-eye stat, not a button, click does nothing
check("views stat rendered as span", await page.locator('.post[data-pid="p5"] span.views-stat').count() === 1);
check("no .act button for views", await page.locator('.post[data-pid="p5"] .post-actions .act:not(.like-btn):not(.comment-btn):not(.share-btn)').count() === 0);
check("views shows count", (await page.locator('.post[data-pid="p5"] .views-stat').textContent()).includes("1.5K"));
await page.locator('.post[data-pid="p5"] .views-stat').click();
await page.waitForTimeout(300);
check("clicking views does nothing", await page.locator(".screen.likes-open, .screen.share-open, .screen.save-open, .screen.comments-open, .screen.pm-open, #flowToast.show").count() === 0);

// 22) "x and others liked" opens Likes sheet (no search / no views tab)
await page.locator('.post[data-pid="p5"] .liked-by').click();
await page.waitForTimeout(350);
check("likes sheet opens", await page.locator(".screen.likes-open").count() === 1);
check("likes title", (await page.locator(".comment-sheet .sheet-title").textContent()).trim() === "Likes");
check("note names the seller", (await page.locator(".lk-note").textContent()).includes("watch.daily"));
check("no search input in likes sheet", await page.locator(".comment-sheet input").count() === 0);
check("liker rows >= 6", await page.locator(".lk-row").count() >= 6, String(await page.locator(".lk-row").count()));
check("first liker = the watch", (await page.locator(".lk-row .u").nth(0).textContent()).trim() === "the watch");
check("every liker has Follow btn", await page.locator(".lk-follow").count() === await page.locator(".lk-row").count());
await page.screenshot({ path: `${OUT11}/d-likes-sheet.png` });
await page.locator(".lk-follow").nth(0).click();
await page.waitForTimeout(200);
check("liker Follow flips to Following", (await page.locator(".lk-follow").nth(0).textContent()).trim() === "Following");
await closeSheet();
check("backdrop closes likes sheet", await page.locator(".screen.likes-open").count() === 0);

// 23) share sheet — search + friend grid + app row (no Add to story)
await page.locator('.post[data-pid="p5"] .share-btn').click();
await page.waitForTimeout(350);
check("share sheet opens", await page.locator(".screen.share-open").count() === 1);
check("share has search field", await page.locator(".sh-field input").count() === 1);
check("13 friend circles (all friends, scrollable)", await page.locator(".sh-fr").count() === 13);
const gridBox = await page.locator(".sh-grid").boundingBox();
const frBox = await page.locator(".sh-fr").first().boundingBox();
check("grid shows ~2 rows then scrolls", gridBox.height < frBox.height * 2.5 && await page.locator(".sh-grid").evaluate(el => el.scrollHeight > el.clientHeight), `gridH=${gridBox.height} rowH=${frBox.height}`);
const appNames = (await page.locator(".sh-app .t").allTextContents()).map(t => t.trim());
check("apps row order", JSON.stringify(appNames) === JSON.stringify(["Messenger","Direct","LINE","Facebook","Copy link"]), appNames.join(","));
check("no Add to story", !appNames.some(t => /story/i.test(t)));
const copyBox = await page.locator('.sh-app[data-app="copy"]').boundingBox();
check("Copy link fully in view", copyBox.x + copyBox.width <= 440, `right=${Math.round(copyBox.x + copyBox.width)}`);
await page.screenshot({ path: `${OUT11}/d-share-sheet.png` });
await page.locator(".sh-q").fill("chrono");
await page.waitForTimeout(200);
check("search filters friends to 1", await page.locator(".sh-fr:visible").count() === 1);
await page.locator(".sh-q").fill("");
await page.waitForTimeout(150);
await page.locator('.sh-fr[data-name="davikah"]').click();
await page.waitForTimeout(250);
check("friend send closes + toast", await page.locator(".screen.share-open").count() === 0 && (await page.locator(".sc-toast").textContent()).includes("Sent to davikah"));
await page.waitForTimeout(1900);
await page.locator('.post[data-pid="p5"] .share-btn').click();
await page.waitForTimeout(300);
await page.locator('.sh-app[data-app="copy"]').click();
await page.waitForTimeout(250);
check("copy link toast", (await page.locator(".sc-toast").textContent()).trim() === "Link copied");
await page.waitForTimeout(1900);
await page.locator('.post[data-pid="p5"] .share-btn').click();
await page.waitForTimeout(300);
await page.locator('.sh-app[data-app="line"]').click();
await page.waitForTimeout(250);
check("share to LINE toast", (await page.locator(".sc-toast").textContent()).trim() === "Shared to LINE");
await page.waitForTimeout(1900);

// 24) save -> collections sheet; pick collection -> icon filled + toast
await page.locator('.post[data-pid="p5"] .save-btn').click();
await page.waitForTimeout(300);
check("save fills bookmark + opens sheet", await page.locator('.post[data-pid="p5"] .save-btn.saved').count() === 1 && await page.locator(".screen.save-open").count() === 1);
check("Saved head row", (await page.locator(".sv-head .t").textContent()).trim() === "Saved" && (await page.locator(".sv-head .s").textContent()).trim() === "Private");
check("Collections + New collection", (await page.locator(".sv-sec .l").textContent()).trim() === "Collections" && (await page.locator(".sv-new").textContent()).trim() === "New collection");
check("4 collection rows", await page.locator(".sv-row").count() === 4);
await page.screenshot({ path: `${OUT11}/d-save-sheet.png` });
await page.locator('.sv-row[data-col="Wishlist"]').click();
await page.waitForTimeout(250);
check("saved-to-collection toast", (await page.locator(".sc-toast").textContent()).trim() === "Saved to Wishlist");
check("save sheet closed", await page.locator(".screen.save-open").count() === 0);
await page.waitForTimeout(1900);
// tap saved bookmark again -> sheet reopens; unsave only via Saved row in sheet
await page.locator('.post[data-pid="p5"] .save-btn').click();
await page.waitForTimeout(250);
check("saved bookmark reopens sheet", await page.locator(".screen.save-open").count() === 1 && await page.locator('.post[data-pid="p5"] .save-btn.saved').count() === 1);
check("Saved row shows filled bookmark", await page.locator(".sv-head.saved").count() === 1);
await page.locator('.sv-head[data-col="Saved"]').click();
await page.waitForTimeout(250);
check("unsave via Saved row clears icon + toast", await page.locator('.post[data-pid="p5"] .save-btn.saved').count() === 0 && (await page.locator(".sc-toast").textContent()).trim() === "Removed from your saved");
check("sheet closed after unsave", await page.locator(".screen.save-open").count() === 0);
await page.waitForTimeout(1900);
// save p5 to default Saved + p6 via New collection sheet (SAVED-001 — IG Cancel/Next sheet)
await page.locator('.post[data-pid="p5"] .save-btn').click();
await page.waitForTimeout(250);
await page.locator(".sheet-handle").click();  // already in default Saved — dismiss sheet
await page.waitForTimeout(250);
await page.locator('.post[data-pid="p6"] .save-btn').click();
await page.waitForTimeout(250);
await page.locator(".sv-new").click();
await page.waitForTimeout(300);
check("new collection sheet opens", (await page.locator(".nc-title").textContent()).trim() === "New collection" && await page.locator(".nc-next").isDisabled());
await page.locator(".nc-input").fill("Seiko picks");
await page.waitForTimeout(150);
check("counter + Next enabled", (await page.locator(".nc-count").textContent()).trim() === "11 / 40" && !(await page.locator(".nc-next").isDisabled()));
await page.locator(".nc-next").click();
await page.waitForTimeout(300);
check("new collection saves + toast", (await page.locator(".sc-toast").textContent()).trim() === "Saved to Seiko picks");
check("p6 bookmark filled", await page.locator('.post[data-pid="p6"] .save-btn.saved').count() === 1);
await page.waitForTimeout(1900);
// reopen p6 sheet -> its collection row is checked; tap it -> remove from collection
await page.locator('.post[data-pid="p6"] .save-btn').click();
await page.waitForTimeout(250);
check("current collection row checked", await page.locator('.sv-row[data-col="Seiko picks"] .plus.on').count() === 1);
await page.locator('.sv-row[data-col="Seiko picks"]').click();
await page.waitForTimeout(250);
check("removed-from-collection toast", (await page.locator(".sc-toast").textContent()).trim() === "Removed from Seiko picks");
await page.waitForTimeout(1900);

// 25) Settings > Saved — IG-style hub; Manage select + Remove unsaves (SAVED-001)
await page.locator(".set-btn").click();
await page.waitForTimeout(350);
check("settings has Saved row", (await page.locator('.sub-row[data-sub="saved"]').textContent()).includes("Saved"));
const savedCnt = await page.evaluate(() => POSTS.filter(p => p.saved).length);
check("saved count = seeded + 2", (await page.locator('.sub-row[data-sub="saved"] .sub-count').textContent()).trim() === String(savedCnt));
await page.locator('.sub-row[data-sub="saved"]').click();
await page.waitForTimeout(350);
check("saved hub head + actions", (await page.locator(".page-sub .detail-title").textContent()).trim() === "Saved" && await page.locator(".svd-srch").count() === 1 && await page.locator(".svd-plus").count() === 1);
check("3 tab pills, All on", await page.locator(".svd-tab").count() === 3 && await page.locator('.svd-tab[data-tab="all"].on').count() === 1);
check("collections grid 4 + See all", await page.locator(".svd-col").count() === 4 && (await page.locator(".svd-see").first().textContent()).trim() === "See all");
check("posts grid = all saved", await page.locator(".svd-tile").count() === savedCnt);
await page.screenshot({ path: `${OUT11}/d-saved-page.png` });
await page.locator(".svd-see:not(.svd-manage)").click();
await page.waitForTimeout(250);
check("collections tab shows all incl new", await page.locator(".svd-colbig").count() === 5 && (await page.locator(".page-sub").textContent()).includes("Seiko picks"));
await page.locator('.svd-tab[data-tab="all"]').click();
await page.waitForTimeout(200);
await page.locator(".svd-manage").click();
await page.waitForTimeout(250);
check("manage mode: select header + bar", (await page.locator(".page-sub .svd-seltitle").textContent()).trim() === "All posts" && (await page.locator(".svd-selall").textContent()).trim() === "Select all" && await page.locator(".svd-bar").count() === 1 && await page.locator(".svd-unsave").isDisabled());
await page.locator('.svd-tile[data-pid="p5"]').click();
await page.waitForTimeout(150);
check("1 selected + Remove enabled", await page.locator('.svd-tile[data-pid="p5"].on').count() === 1 && !(await page.locator(".svd-unsave").isDisabled()));
await page.locator(".svd-unsave").click();
await page.waitForTimeout(300);
check("unsave confirm dialog", (await page.locator(".dlg-q").textContent()).trim() === "Unsave post?" && (await page.locator(".dlg-unsave-go").textContent()).trim() === "Unsave");
await page.locator(".dlg-unsave-go").click();
await page.waitForTimeout(300);
check("p5 removed from grid + toast", await page.locator('.svd-tile[data-pid="p5"]').count() === 0 && (await page.locator(".sc-toast").textContent()).trim() === "Removed from All posts");
check("p5 icon cleared in feed", await page.locator('.post[data-pid="p5"] .save-btn.saved').count() === 0);
await page.locator(".sub-back").click();
await page.waitForTimeout(300);
await page.locator(".sub-back").click();
await page.waitForTimeout(300);

// 26) detail pages — DL1 (p4) share/save work over the page; DL2 (p5) liked-by opens likes
await page.locator('.post[data-pid="p4"] .more-link').click();
await page.waitForTimeout(250);
await page.locator('.post[data-pid="p4"] .details-toggle').click();
await page.waitForTimeout(300);
await page.locator('.post[data-pid="p4"] .view-full').click();
await page.waitForTimeout(400);
check("DL1 detail has views-stat + share + save", await page.locator(".page-detail .views-stat").count() === 1 && await page.locator(".page-detail .share-btn").count() === 1 && await page.locator(".page-detail .save-btn").count() === 1);
await page.locator(".page-detail .save-btn").click();
await page.waitForTimeout(300);
check("save sheet over DL1 detail", await page.locator(".screen.save-open").count() === 1);
await page.locator('.sv-row[data-col="Grail list"]').click();
await page.waitForTimeout(250);
check("detail save syncs feed card", await page.locator('.post[data-pid="p4"] .save-btn.saved').count() === 1);
await page.waitForTimeout(1900);
await page.locator(".page-detail .share-btn").click();
await page.waitForTimeout(300);
check("share sheet over DL1 detail", await page.locator(".screen.share-open").count() === 1);
await page.locator('.sh-app[data-app="fb"]').click();
await page.waitForTimeout(250);
check("share to Facebook toast", (await page.locator(".sc-toast").textContent()).trim() === "Shared to Facebook");
await page.waitForTimeout(1900);
await page.locator(".page-detail .detail-back").first().click();
await page.waitForTimeout(300);
await page.evaluate(() => { const p = POSTS.find(x => x.id === "p4"); p.saved = false; p.savedCol = null; });

await page.locator('.post[data-pid="p5"] .more-link').click();
await page.waitForTimeout(250);
await page.locator('.post[data-pid="p5"] .details-toggle').click();
await page.waitForTimeout(300);
await page.locator('.post[data-pid="p5"] .view-full').click();
await page.waitForTimeout(400);
await page.locator(".page-detail .liked-by").click();
await page.waitForTimeout(300);
check("likes sheet from DL2 detail", await page.locator(".screen.likes-open").count() === 1 && (await page.locator(".lk-note").textContent()).includes("watch.daily"));
await page.screenshot({ path: `${OUT11}/d-likes-from-detail.png` });
await closeSheet();
await page.locator(".page-detail .detail-back").first().click();
await page.waitForTimeout(300);

// 27) light theme — sheets still work + screenshots
await page.locator("#themeToggle").click();
await page.waitForTimeout(300);
await page.locator('.post[data-pid="p6"] .liked-by').click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT11}/l-likes-sheet.png` });
await closeSheet();
await page.locator('.post[data-pid="p6"] .share-btn').click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT11}/l-share-sheet.png` });
await page.locator('.sh-app[data-app="copy"]').click();
await page.waitForTimeout(250);
check("light theme share works", (await page.locator(".sc-toast").textContent()).trim() === "Link copied");
await page.waitForTimeout(1900);
await page.locator('.post[data-pid="p3"] .save-btn').click();
await page.waitForTimeout(250);
check("light theme save sheet opens", await page.locator(".screen.save-open").count() === 1);
await page.screenshot({ path: `${OUT11}/l-save-sheet.png` });
await closeSheet();
await page.locator("#themeToggle").click();
await page.waitForTimeout(300);

/* ===== FEED-012 — Settings > Favorites management page (IG) ===== */
const OUT12 = import.meta.dirname + "/screenshots/task-FEED-012/after";
mkdirSync(OUT12, { recursive: true });

// 28) Settings > What you see > Favorites row + management page
await page.locator(".set-btn").click();
await page.waitForTimeout(350);
check("settings has Favorites row", (await page.locator('.sub-row[data-sub="favorites"]').textContent()).includes("Favorites"));
check("favorites count = 0", (await page.locator('.sub-row[data-sub="favorites"] .sub-count').textContent()).trim() === "0");
await page.locator('.sub-row[data-sub="favorites"]').click();
await page.waitForTimeout(350);
check("favorites page opens", (await page.locator(".page-sub .detail-title").textContent()).trim() === "Favorites");
check("desc mentions appear higher in feed", (await page.locator(".fav-desc").textContent()).includes("higher in feed"));
check("search field present", await page.locator(".fav-search input").count() === 1);
check("no favorites yet empty state", await page.locator(".sub-empty").count() === 1);
check("suggested lists 4 followed sellers", await page.locator(".fav-add").count() === 4, String(await page.locator(".fav-add").count()));

// add dial.dude via Suggested -> moves to Favorites section
await page.locator('.fav-add[data-seller="dial.dude"]').click();
await page.waitForTimeout(300);
check("add toast = Added to favorites", (await page.locator(".sc-toast").textContent()).trim() === "Added to favorites");
check("dial.dude in Favorites section", await page.locator(".fav-remove").count() === 1);
check("suggested now 3", await page.locator(".fav-add").count() === 3);
check("Remove all link appears", await page.locator(".fav-removeall").count() === 1);
await page.waitForTimeout(1900);

// search filter narrows rows
await page.locator(".fav-q").fill("dial");
await page.waitForTimeout(200);
check("search filters rows to 1", await page.locator(".mrow:visible").count() === 1);
await page.locator(".fav-q").fill("");
await page.waitForTimeout(200);
await page.screenshot({ path: `${OUT12}/d-favorites-page.png` });

// favorites tab reflects the page add
await page.locator(".sub-back").click();
await page.waitForTimeout(300);
await page.locator(".sub-back").click();
await page.waitForTimeout(300);
await page.locator(".feed-tab").nth(2).click();
await page.waitForTimeout(300);
check("favorites tab shows p8 after page add", await page.locator('.feed-scroll .post[data-pid="p8"]').count() === 1);

// Remove single row -> re-add -> Remove all clears everything
await page.locator(".set-btn").click();
await page.waitForTimeout(300);
check("settings count = 1 after add", (await page.locator('.sub-row[data-sub="favorites"] .sub-count').textContent()).trim() === "1");
await page.locator('.sub-row[data-sub="favorites"]').click();
await page.waitForTimeout(300);
await page.locator('.fav-remove[data-seller="dial.dude"]').click();
await page.waitForTimeout(300);
check("remove toast", (await page.locator(".sc-toast").textContent()).trim() === "Removed from favorites");
check("back to suggested after remove", await page.locator('.fav-add[data-seller="dial.dude"]').count() === 1);
await page.waitForTimeout(1900);
await page.locator('.fav-add[data-seller="dial.dude"]').click();
await page.waitForTimeout(300);
await page.locator('.fav-add[data-seller="wrist.story"]').click();
await page.waitForTimeout(300);
await page.locator(".fav-removeall").click();
await page.waitForTimeout(300);
check("remove all toast", (await page.locator(".sc-toast").textContent()).trim() === "Removed all favorites");
check("empty again after remove all", await page.locator(".fav-remove").count() === 0 && await page.locator(".sub-empty").count() === 1);
await page.locator(".sub-back").click();
await page.waitForTimeout(300);
await page.locator(".sub-back").click();
await page.waitForTimeout(300);

console.log("console/page errors:", errors, "| failed checks:", failed);
await browser.close();
console.log("DONE");
