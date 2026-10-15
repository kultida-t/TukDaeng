// Verify fo-flow PROFILE-005: viewer-profile "..." menu becomes functional —
// IG block confirm sheet (avatar + impact rows + Block / Block and report),
// real session block state (unfollow + out of your followers + posts leave
// feed/search, profile swaps Follow -> Unblock), Unblock center dialog +
// restrict-hint banner, Settings > Blocked profiles list, About this account
// page (joined/country/verified mock), Share opens the real share sheet.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-PROFILE-005";
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

const sub = () => page.locator(".page-sub");
const scr = () => page.locator(".screen");
const openProfile = u => page.evaluate(x => { const s = document.querySelector(".screen"); pushSub(s, "profile:" + x); }, u);

await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

// ============ 1) open viewer profile + ... menu (2 grouped cards like IG) ============
await scr().locator(".feed-scroll .post").first().locator(".post-head .avatar-ring").click();
await page.waitForTimeout(400);
check("viewer profile opened", (await sub().locator(".pf-vname").textContent()).includes("Watch 777"));
await sub().locator(".pf-more").click();
await page.waitForTimeout(300);
check("menu = 1 card of rows + separate Cancel (IG)",
  await page.locator(".comment-sheet.pm .pm-card").count() === 2);
check("row order = Report/Block/About/Copy/Share (IG)",
  (await page.locator(".comment-sheet.pm .pm-card").nth(0).locator(".pm-row span").allTextContents()).join("|") === "Report|Block|About this account|Copy profile URL|Share this profile");
check("Report row still danger", await page.locator(".pf-sh-report.danger").count() === 1);
check("Block row carries data-u", (await page.locator(".pf-sh-block").getAttribute("data-u")) === "Watch 777");
await page.screenshot({ path: `${OUT}/a-pfm-menu.png` });

// ============ 2) Block -> IG confirm sheet ============
await page.locator(".pf-sh-block").click();
await page.waitForTimeout(300);
check("block sheet: avatar + 'Block Watch 777?'",
  await page.locator(".comment-sheet .blk-av").count() === 1 &&
  (await page.locator(".blk-q").textContent()).trim() === "Block Watch 777?");
check("block sheet: 2 impact rows with icons", await page.locator(".blk-i").count() === 2);
check("block sheet: Block + Block and report buttons",
  (await page.locator(".blk-go").textContent()).trim() === "Block" &&
  (await page.locator(".blk-rp").textContent()).trim() === "Block and report");
await page.screenshot({ path: `${OUT}/b-pfm-block-sheet.png` });

// ============ 3) confirm Block -> real session state ============
const feedPostsBefore = await scr().locator(".feed-scroll .post").count();
await page.locator(".blk-go").click();
await page.waitForTimeout(400);
check("'Blocking' toast", await scr().locator(".sc-toast").textContent().then(t => t.includes("Blocking")));
check("profile Follow -> Unblock button", await sub().locator(".pf-unblock").count() === 1 &&
  (await sub().locator(".pf-unblock").textContent()).trim() === "Unblock");
check("Message button still there (IG)", await sub().locator(".pf-msg").count() === 1);
check("state: PF_BLOCKED + posts flagged", await page.evaluate(() => pfIsBlocked("Watch 777") && POSTS.filter(p => p.seller === "Watch 777" && p.blocked).length > 0));
check("block unfollowed them", await page.evaluate(() => !pfIsFollowed("Watch 777")));
check("they dropped out of own followers", await page.evaluate(() => PF_REMOVED_FOL.has("Watch 777")));
await page.screenshot({ path: `${OUT}/c-pfm-blocked-profile.png` });

// feed loses their posts
await sub().locator(".sub-back").click();
await page.waitForTimeout(400);
const feedPostsAfter = await scr().locator(".feed-scroll .post").count();
check("their posts left the feed", feedPostsAfter === feedPostsBefore - await page.evaluate(() => POSTS.filter(p => p.seller === "Watch 777").length) && feedPostsAfter < feedPostsBefore,
  `${feedPostsBefore} -> ${feedPostsAfter}`);

// ============ 4) ... menu shows Unblock -> center dialog ============
await openProfile("Watch 777");
await page.waitForTimeout(350);
check("blocked profile grid still renders (IG)", await sub().locator(".pf-tile").count() > 0);
await sub().locator(".pf-more").click();
await page.waitForTimeout(300);
check("menu row reads 'Unblock' when blocked", (await page.locator(".pf-sh-block span").textContent()).trim() === "Unblock");
await page.locator(".pf-sh-block").click();
await page.waitForTimeout(300);
check("unblock = center dialog (not sheet)", await scr().locator(".dlg").isVisible() &&
  (await page.locator(".dlg-q").textContent()).trim() === "Unblock Watch 777?");
check("dialog: red Unblock + Cancel", await page.locator(".dlg-unblock-go.danger").count() === 1 &&
  await page.locator(".dlg-cancel").count() === 1);
await page.screenshot({ path: `${OUT}/d-pfm-unblock-dialog.png` });
await page.locator(".dlg-unblock-go").click();
await page.waitForTimeout(400);
check("unblocked: Follow button back", await sub().locator(".pf-foll").count() === 1 &&
  (await sub().locator(".pf-foll").textContent()).includes("Follow"));
check("restrict hint banner (IG)", await scr().locator(".pf-rhint").isVisible() &&
  (await scr().locator(".pf-rhint").textContent()).includes("restrict"));
check("unblock did NOT re-follow (IG)", await page.evaluate(() => !pfIsFollowed("Watch 777")));
await page.screenshot({ path: `${OUT}/e-pfm-restrict-hint.png` });

// ============ 5) Block and report -> blocks + opens report page ============
await scr().locator(".pf-rhint").click(); /* dismiss banner */
await sub().locator(".pf-more").click();
await page.waitForTimeout(250);
await page.locator(".pf-sh-block").click();
await page.waitForTimeout(250);
await page.locator(".blk-rp").click();
await page.waitForTimeout(400);
check("Block and report -> report picker (IG)", await sub().locator(".pm-rp-q").isVisible() &&
  (await sub().locator(".pm-rp-q").textContent()).includes("What do you want to report"));
check("...picker lists 2 targets (post/account)", (await sub().locator(".rp-opt").count()) === 2);
check("...and they ARE blocked", await page.evaluate(() => pfIsBlocked("Watch 777")));
await page.screenshot({ path: `${OUT}/f-pfm-block-and-report.png` });
await sub().locator(".sub-x").click();
await page.waitForTimeout(300);

// ============ 6) Settings > Blocked profiles list ============
await openProfile("king.mr.fox");
await page.waitForTimeout(350);
await sub().locator(".pf-menu").click();
await page.waitForTimeout(350);
check("settings has Blocked row with count", (await sub().locator('[data-sub="blocked"]').textContent()).includes("1"));
await sub().locator('[data-sub="blocked"]').click();
await page.waitForTimeout(350);
check("Blocked profiles page lists them", await sub().locator(".mrow .mn").allTextContents().then(t => t.includes("Watch 777")));
check("row subtitle IG-style + Unblock button",
  (await sub().locator(".mrow .md").textContent()).includes("other profiles") &&
  await sub().locator(".m-unblock").count() === 1);
await page.screenshot({ path: `${OUT}/g-pfm-blocked-list.png` });
await sub().locator(".m-unblock").click();
await page.waitForTimeout(300);
check("unblock from settings = same center dialog", (await page.locator(".dlg-q").textContent()).includes("Unblock"));
await page.locator(".dlg-unblock-go").click();
await page.waitForTimeout(400);
check("empty state after last unblock", (await sub().locator(".sub-empty").textContent()).includes("No blocked accounts"));
await sub().locator(".sub-back").click();
await page.waitForTimeout(300);

// ============ 7) About this account (verified) ============
await sub().locator(".sub-back").click();
await page.waitForTimeout(300);
await openProfile("the watch");
await page.waitForTimeout(350);
await sub().locator(".pf-more").click();
await page.waitForTimeout(250);
await page.locator(".pf-sh-about").click();
await page.waitForTimeout(350);
check("About title", (await sub().locator(".detail-title").textContent()).trim() === "About this account");
check("hero avatar + username + verified badge", await sub().locator(".ab-av").count() === 1 &&
  (await sub().locator(".ab-name").textContent()).includes("the watch") &&
  await sub().locator(".ab-vb").count() === 1);
check("authenticity note", (await sub().locator(".ab-note").textContent()).includes("community authentic"));
check("Date joined + Account based in rows", (await sub().locator(".ab-row .ab-t").allTextContents()).join("|") === "Date joined|Account based in|Verified");
check("verified foot note", (await sub().locator(".ab-foot").textContent()).includes("Verified badges"));
await page.screenshot({ path: `${OUT}/h-pfm-about-verified.png` });
await sub().locator(".sub-back").click();
await page.waitForTimeout(300);

// ============ 8) About this account (non-verified) ============
await openProfile("dial.dude");
await page.waitForTimeout(300);
await sub().locator(".pf-more").click();
await page.waitForTimeout(250);
await page.locator(".pf-sh-about").click();
await page.waitForTimeout(300);
check("non-verified: 2 rows, no badge, no foot",
  (await sub().locator(".ab-row .ab-t").allTextContents()).join("|") === "Date joined|Account based in" &&
  await sub().locator(".ab-vb").count() === 0 && await sub().locator(".ab-foot").count() === 0);
await sub().locator(".sub-back").click();
await page.waitForTimeout(300);

// ============ 9) Share opens share sheet / Copy stays toast ============
await sub().locator(".pf-more").click();
await page.waitForTimeout(250);
await page.locator(".pf-sh-share").click();
await page.waitForTimeout(300);
check("Share this profile -> share sheet", await page.locator(".comment-sheet.sh .sh-fr").count() > 0 &&
  await page.locator(".comment-sheet.sh .sh-app").count() > 0);
await page.screenshot({ path: `${OUT}/i-pfm-share-sheet.png` });
await page.locator(".sh-app").last().click();
await page.waitForTimeout(300);
await sub().locator(".pf-more").click();
await page.waitForTimeout(250);
await page.locator(".pf-sh-copy").click();
await page.waitForTimeout(300);
check("Copy profile URL -> link toast", await scr().locator(".sc-toast").textContent().then(t => t.includes("Profile link copied")));

// ============ 10) Report row still works ============
await sub().locator(".pf-more").click();
await page.waitForTimeout(250);
await page.locator(".pf-sh-report").click();
await page.waitForTimeout(350);
check("Report -> picker first (IG)", (await sub().locator(".pm-rp-q").textContent()).includes("What do you want to report"));
await sub().locator('.rp-opt[data-rp="acct"]').click();
await page.waitForTimeout(300);
check("'Something about this account' -> reason list", (await sub().locator(".pm-rp-q").textContent()).includes("account") &&
  (await sub().locator(".pm-reason").count()) === 9);

// reason -> IG "Thanks for your feedback" + Other steps page
await sub().locator(".pm-reason").first().click();
await page.waitForTimeout(350);
check("thanks page: check + 'Thanks for your feedback'",
  await sub().locator(".rp-thanks-ck").count() === 1 &&
  (await sub().locator(".rp-thanks-t").textContent()).includes("Thanks for your feedback"));
const stepLabels = await sub().locator(".rp-step .rp-step-t").allTextContents();
check("other steps = Block/Mute only (TukDaeng-adapted)",
  stepLabels.join("|") === `Block dial.dude|Mute dial.dude`, stepLabels.join("|"));
check("no Restrict/message/Community-Standards steps", !stepLabels.some(t => /restrict|message|community/i.test(t)));
await page.screenshot({ path: `${OUT}/k-pfm-report-thanks.png` });
// Mute step -> IG mute dialog (posts / posts and story / Cancel) -> green check
await sub().locator('.rp-step[data-act="mute"]').click();
await page.waitForTimeout(300);
check("Mute step -> center dialog with 2 mute options",
  (await page.locator(".dlg-q").textContent()).includes("Mute dial.dude") &&
  (await page.locator(".dlg-mute-go").count()) === 2);
await page.screenshot({ path: `${OUT}/l-pfm-mute-dialog.png` });
await page.locator(".dlg-mute-go").first().click();
await page.waitForTimeout(350);
check("muted -> toast + row keeps green check (IG)",
  await page.evaluate(() => pfIsMuted("dial.dude")) &&
  (await sub().locator('.rp-step[data-act="mute"][disabled] .rp-ck').count()) === 1);
// Block step -> report-variant sheet (3 impact rows, no Block-and-report)
await sub().locator('.rp-step[data-act="block"]').click();
await page.waitForTimeout(300);
check("Block step -> report sheet: 3 impact rows, Block button only",
  (await page.locator(".blk-q").textContent()).includes("Block dial.dude") &&
  (await page.locator(".blk-i").count()) === 3 &&
  (await page.locator(".blk-rp").count()) === 0);
await page.screenshot({ path: `${OUT}/m-pfm-block-sheet-report.png` });
await page.locator(".blk-go").click();
await page.waitForTimeout(350);
check("blocked from thanks page -> row flips to Unblock", await page.evaluate(() => pfIsBlocked("dial.dude")) &&
  (await sub().locator('.rp-step[data-act="unblock"]').count()) === 1);
// Done closes the whole report stack
await sub().locator(".rp-done").click();
await page.waitForTimeout(350);
check("Done closes report + submitted toast",
  !(await scr().getAttribute("class")).includes("sub-open") &&
  (await scr().locator(".sc-toast").textContent()).includes("Report submitted"));
await page.evaluate(() => { const s = document.querySelector(".screen"); pfSetBlocked(s, "dial.dude", false); pfSetMuted(s, "dial.dude", false); });

// ============ 10b) Unfollow step -> toast + green check (IG image 3) ============
await page.evaluate(() => pfSetFollow(document.querySelector(".screen"), "the watch", true));
await openProfile("the watch");
await page.waitForTimeout(350);
await sub().locator(".pf-more").click();
await page.waitForTimeout(250);
await page.locator(".pf-sh-report").click();
await page.waitForTimeout(300);
await sub().locator('.rp-opt[data-rp="acct"]').click();
await page.waitForTimeout(250);
await sub().locator(".pm-reason").first().click();
await page.waitForTimeout(350);
check("Unfollow row shows for followed account",
  (await sub().locator('.rp-step[data-act="unfollow"]').count()) === 1);
await sub().locator('.rp-step[data-act="unfollow"]').click();
await page.waitForTimeout(350);
check("'Unfollowed' toast + row gets green check (IG)",
  (await scr().locator(".sc-toast").textContent()).includes("Unfollowed") &&
  (await sub().locator('.rp-step[data-act="unfollow"][disabled] .rp-ck').count()) === 1 &&
  await page.evaluate(() => !pfIsFollowed("the watch")));
check("done checks are per-user (Mute the watch still unchecked)",
  (await sub().locator('.rp-step[data-act="mute"] .rp-ck').count()) === 0);
await page.screenshot({ path: `${OUT}/n-pfm-report-unfollowed.png` });
await sub().locator(".rp-done").click();
await page.waitForTimeout(300);

// ============ 11) light theme ============
await page.locator("#themeToggle").click();
await page.waitForTimeout(400);
await openProfile("the watch");
await page.waitForTimeout(350);
await sub().locator(".pf-more").click();
await page.waitForTimeout(250);
await page.locator(".pf-sh-about").click();
await page.waitForTimeout(300);
check("about page renders in light theme", await scr().getAttribute("data-theme") === "light" &&
  await sub().locator(".ab-hero").count() === 1);
await page.screenshot({ path: `${OUT}/j-pfm-about-light.png` });
await page.locator("#themeToggle").click();
await page.waitForTimeout(300);

check("no console errors", errors === 0);

await browser.close();
console.log(`\n${failed} failed / ${errors} console errors`);
process.exit(failed || errors ? 1 : 0);
