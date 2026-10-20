// Verify fo-flow PROFILE-017: profile "+" opens Add-Asset mode — title/button
// "เพิ่มสินทรัพย์ใหม่", visibility options โชว์/ซ่อน/โพสต์ลงฟีด, drawer-only saves
// (hide never reaches feed), feed option posts with specs, feed "+" stays post mode.
// Round 2 semantics: feed posts default to ขาย on the profile (price optional),
// "Also save to My Assets" defaults ON, every feed post lands in the profile
// ทั้งหมด tab, and Edit info can switch a post between ขาย/โชว์ + drawer.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";
const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-PROFILE-017";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
let errors = 0, failed = 0;
page.on("pageerror", e => { errors++; console.log("PAGE ERR:", e.message); });
page.on("console", m => { if (m.type() === "error") { errors++; console.log("CONSOLE ERR:", m.text()); } });
const check = (n, ok, x = "") => { console.log(`${ok ? "PASS" : "FAIL"} ${n}${x ? " — " + x : ""}`); if (!ok) failed++; };
const scr = () => page.locator(".screen"), sub = () => page.locator(".page-sub");
const wait = ms => page.waitForTimeout(ms);

await page.addInitScript(() => {
  localStorage.setItem("fo_onboarded", "1");
  localStorage.setItem("fo_toured", "1");
  localStorage.setItem("fo_session", "member");
  localStorage.setItem("fo_lang", "th");
});
const nav = () => page.locator(".screen > .bottom-nav"); /* sub pages keep their own nav in the DOM */

await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" }); await wait(700);

// 0) feed "+" still opens post mode + My-Assets toggle defaults ON
await scr().locator('.app-header [data-flow="create"]').click(); await wait(400);
check("feed + header = สร้างโพสต์ใหม่", (await sub().locator(".cf-head .t").first().textContent()).includes("สร้างโพสต์ใหม่"));
await sub().locator('.ig-grid .cell[data-i="0"]').click(); await wait(200);
await sub().locator(".cf-next").click(); await wait(400);
check("my-assets toggle defaults OFF", await sub().locator(".cf-step2 .sw").count() === 1 && await sub().locator(".cf-step2 .sw.on").count() === 0);
await sub().locator(".cf-back2").click(); await wait(200);
await sub().locator(".cf-x").click(); await wait(300);
await scr().locator(".dlg-discard-go").click(); await wait(300);
check("post composer closed (discard)", !(await scr().evaluate(el => el.classList.contains("sub-open"))));

// 1) profile "+" opens Add-Asset mode
await nav().locator('.nav-item[data-navgo="profile"]').click(); await wait(400);
await sub().locator('.pf-head [data-flow="create"]').click(); await wait(400);
check("picker header = เพิ่มสินทรัพย์ใหม่", (await sub().locator(".cf-head .t").first().textContent()).includes("เพิ่มสินทรัพย์ใหม่"));
await sub().locator('.ig-grid .cell[data-i="0"]').click(); await wait(200);
await sub().locator(".cf-next").click(); await wait(400);
check("step2 header = เพิ่มสินทรัพย์ใหม่", (await sub().locator(".cf-step2 .cf-head .t").textContent()).includes("เพิ่มสินทรัพย์ใหม่"));
check("submit button = เพิ่มสินทรัพย์ใหม่", (await sub().locator(".cf-share").textContent()).includes("เพิ่มสินทรัพย์ใหม่"));
check("3 visibility options", await sub().locator(".vis-opt").count() === 3);
check("โชว์ selected by default", await sub().locator('.vis-opt[data-v="show"].on').count() === 1);
check("no My-Assets toggle in asset mode", await sub().locator(".cf-step2 .sw").count() === 0);
check("feed option = โพสต์ลงฟีด", (await sub().locator('.vis-opt[data-v="feed"] .lab').textContent()).includes("โพสต์ลงฟีด"));
await page.screenshot({ path: `${OUT}/a-asset-step2.png` });

// 1b) picker X with draft -> IG-style Thai sheet -> keep editing -> back to step 2
await sub().locator(".cf-back2").click(); await wait(300);
await sub().locator(".cf-x").click(); await wait(300);
const dlgTxt = await scr().locator(".dlg").textContent();
check("discard sheet is Thai (IG-style)", dlgTxt.includes("เริ่มใหม่") && dlgTxt.includes("แก้ไขต่อไป"), dlgTxt.trim().slice(0, 60));
check("no save-draft option", !dlgTxt.includes("บันทึกเป็นฉบับร่าง"));
await scr().locator(".dlg-cancel").click(); await wait(250);
await sub().locator(".cf-next").click(); await wait(400);

// 2) fill price + brand spec, pick ซ่อน -> save -> lands on profile, tile in grid + hide tab
await sub().locator('.ig-row[data-pane="price"]').click(); await wait(250);
await sub().locator('.cf-f[data-f="price"]').fill("150000");
await sub().locator(".pane-done").click(); await wait(300);
await sub().locator('.ig-row[data-pane="spec"]').click(); await wait(250);
await sub().locator('.cf-f[data-f="brand"]').fill("Rolex");
await sub().locator('.cf-f[data-f="model"]').fill("Submariner");
await sub().locator(".pane-done").click(); await wait(300);
await sub().locator(".ig-cap-line .ta").click();
await page.keyboard.type("TEST-ASSET-HIDE-999");
await sub().locator('.vis-opt[data-v="hide"]').click(); await wait(150);
check("ซ่อน selected", await sub().locator('.vis-opt[data-v="hide"].on').count() === 1);
await sub().locator(".cf-share").click(); await wait(500);
check("back on profile after save", await sub().locator(".pf-tabs").count() === 1);
await page.screenshot({ path: `${OUT}/b-profile-after-hide.png` });
await sub().locator('[data-pftab="hide"]').click(); await wait(300);
check("hidden asset in ซ่อน tab", await sub().locator(".pf-tile").count() >= 1);
await page.screenshot({ path: `${OUT}/c-hide-tab.png` });

// 3) feed must NOT contain the hidden asset
await sub().locator('.nav-item[data-navgo="feed"]').click(); await wait(400);
check("hidden asset not in feed", !(await scr().locator(".feed-list").textContent()).includes("TEST-ASSET-HIDE-999"));

// 3b) X -> เริ่มใหม่ discards and lands back on profile (not feed)
await nav().locator('.nav-item[data-navgo="profile"]').click(); await wait(400);
await sub().locator('.pf-head [data-flow="create"]').click(); await wait(400);
await sub().locator('.ig-grid .cell[data-i="2"]').click(); await wait(200);
await sub().locator(".cf-x").click(); await wait(300);
await scr().locator(".dlg-discard-go").click(); await wait(400);
check("discard returns to profile", await sub().locator(".pf-tabs").count() === 1);

// 4) profile "+" -> โพสต์ลงฟีด -> appears in feed with specs + lands in ขาย tab
await sub().locator('.pf-head [data-flow="create"]').click(); await wait(400);
await sub().locator('.ig-grid .cell[data-i="1"]').click(); await wait(200);
await sub().locator(".cf-next").click(); await wait(400);
await sub().locator('.ig-row[data-pane="price"]').click(); await wait(250);
await sub().locator('.cf-f[data-f="price"]').fill("220000");
await sub().locator(".pane-done").click(); await wait(300);
await sub().locator(".ig-cap-line .ta").click();
await page.keyboard.type("TEST-ASSET-FEED-888");
await sub().locator('.vis-opt[data-v="feed"]').click(); await wait(150);
await sub().locator(".cf-share").click(); await wait(500);
check("back on profile after feed post", await sub().locator(".pf-tabs").count() === 1);
await sub().locator('.nav-item[data-navgo="feed"]').click(); await wait(400);
const feedTxt = await scr().locator(".feed-list").textContent();
check("asset posted to feed", feedTxt.includes("TEST-ASSET-FEED-888"));
check("feed post carries price", feedTxt.includes("220,000") || feedTxt.includes("THB 220"));
await page.screenshot({ path: `${OUT}/d-feed-posted.png` });

// 5) feed-posted asset sits in the ขาย (sale) tab on profile
await nav().locator('.nav-item[data-navgo="profile"]').click(); await wait(400);
await sub().locator('[data-pftab="sale"]').click(); await wait(300);
check("feed-posted asset in ขาย tab", await sub().locator('.pf-tile img[src*="ast-8831-2"]').count() === 1);

// 5b) Edit info -> switch ขาย -> โชว์ moves the tile between tabs
await sub().locator('.nav-item[data-navgo="feed"]').click(); await wait(300);
await scr().locator('.post:has-text("TEST-ASSET-FEED-888") .more').click(); await wait(350);
await scr().locator(".pm-own-edit").click(); await wait(500);
check("edit composer opens (แก้ไขข้อมูล)", (await sub().locator(".cf-step2 .cf-head .t").textContent()).includes("แก้ไขข้อมูล"));
check("status selector = 3 options", await sub().locator(".stt-opt").count() === 3);
check("ขาย selected initially", await sub().locator('.stt-opt[data-v="sale"].on').count() === 1);
check("my-assets toggle ON (drawer-linked)", await sub().locator(".cf-step2 .sw.on").count() === 1);
await sub().locator('.stt-opt[data-v="show"]').click(); await wait(150);
await sub().locator(".cf-done").click(); await wait(500);
check("โชว์ post leaves the feed", !(await scr().locator(".feed-list").textContent()).includes("TEST-ASSET-FEED-888"));
await nav().locator('.nav-item[data-navgo="profile"]').click(); await wait(400);
await sub().locator('[data-pftab="sale"]').click(); await wait(250);
check("edited post left ขาย tab", await sub().locator('.pf-tile img[src*="ast-8831-2"]').count() === 0);
await sub().locator('[data-pftab="show"]').click(); await wait(250);
check("edited post in โชว์ tab", await sub().locator('.pf-tile img[src*="ast-8831-2"]').count() === 1);
await sub().locator('[data-pftab="all"]').click(); await wait(250);
check("edited post still in ทั้งหมด tab", await sub().locator('.pf-tile img[src*="ast-8831-2"]').count() === 1);
await page.screenshot({ path: `${OUT}/f-edited-show.png` });

// 6) Portfolio: asset-mode saves landed + edited post's status followed to Show
await sub().locator(".pf-pfo").click(); await wait(500);
check("drawer asset in Portfolio list", (await sub().textContent()).includes("Rolex Submariner"));
await sub().locator('.pfo-row:has-text("TEST-ASSET-FEED-888")').click(); await wait(400);
check("edited asset status = Show in Portfolio", await sub().locator(".pfo-chip.st-show").count() === 1);
await sub().locator(".sub-back").click(); await wait(300);
const pfoCount0 = await sub().locator(".pfo-row").count();
await sub().locator(".sub-back").click(); await wait(300);

// 7) feed "+" with the toggle OFF -> feed-only post: no Portfolio row,
//    but still lands in profile ทั้งหมด + ขาย (sale needs no price)
await sub().locator('[data-pftab="all"]').click(); await wait(250);
const allCount0 = await sub().locator(".pf-tile").count();
await sub().locator('[data-pftab="sale"]').click(); await wait(250);
const saleCount0 = await sub().locator(".pf-tile").count();
await sub().locator('.nav-item[data-navgo="feed"]').click(); await wait(300);
await scr().locator('.app-header [data-flow="create"]').click(); await wait(400);
await sub().locator('.ig-grid .cell[data-i="4"]').click(); await wait(200);
await sub().locator(".cf-next").click(); await wait(400);
check("my-assets toggle off (default)", await sub().locator(".cf-step2 .sw.on").count() === 0);
await sub().locator(".ig-cap-line .ta").click();
await page.keyboard.type("TEST-ASSET-NOSAVE-777");
await sub().locator(".cf-share").click(); await wait(500);
await nav().locator('.nav-item[data-navgo="profile"]').click(); await wait(400);
await sub().locator('[data-pftab="all"]').click(); await wait(250);
check("feed-only post lands in ทั้งหมด tab", await sub().locator(".pf-tile").count() === allCount0 + 1, `${allCount0} -> ${await sub().locator(".pf-tile").count()}`);
await sub().locator('[data-pftab="sale"]').click(); await wait(250);
check("feed-only post stays OUT of ขาย tab", await sub().locator(".pf-tile").count() === saleCount0, `still ${saleCount0}`);
await sub().locator('[data-pftab="all"]').click(); await wait(250);
await sub().locator(".pf-pfo").click(); await wait(500);
check("untoggled post not in Portfolio", (await sub().locator(".pfo-row").count()) === pfoCount0, `count ${pfoCount0}`);
await sub().locator(".sub-back").click(); await wait(300);

// 7b) Edit info on a feed-only post -> status picker hidden until the drawer toggle turns on
await sub().locator('.nav-item[data-navgo="feed"]').click(); await wait(300);
await scr().locator('.post:has-text("TEST-ASSET-NOSAVE-777") .more').click(); await wait(350);
await scr().locator(".pm-own-edit").click(); await wait(500);
check("no status picker while drawer toggle off", await sub().locator(".stt-opt").count() === 0);
await sub().locator(".cf-step2 .sw").click(); await wait(300);
check("status picker appears once toggle on", await sub().locator(".stt-opt").count() === 3);
check("ขาย seeded for a feed post", await sub().locator('.stt-opt[data-v="sale"].on').count() === 1);
await sub().locator(".cf-step2 .sw").click(); await wait(300);
check("status picker hides again on toggle off", await sub().locator(".stt-opt").count() === 0);
await sub().locator(".cf-edit-x").click(); await wait(300);
await scr().locator(".dlg-discard-go").click(); await wait(400);
check("edit cancelled -> back on feed", !(await scr().evaluate(el => el.classList.contains("sub-open"))));

// 7c) Edit -> toggle on -> pick ซ่อน -> Done: leaves feed, lands in ซ่อน tab, Portfolio = Hide
await scr().locator('.post:has-text("TEST-ASSET-NOSAVE-777") .more').click(); await wait(350);
await scr().locator(".pm-own-edit").click(); await wait(500);
await sub().locator(".cf-step2 .sw").click(); await wait(300);
await sub().locator('.stt-opt[data-v="hide"]').click(); await wait(150);
await sub().locator(".cf-done").click(); await wait(500);
check("hidden post leaves the feed", !(await scr().locator(".feed-list").textContent()).includes("TEST-ASSET-NOSAVE-777"));
await nav().locator('.nav-item[data-navgo="profile"]').click(); await wait(400);
await sub().locator('[data-pftab="hide"]').click(); await wait(250);
check("hidden post lands in ซ่อน tab", await sub().locator(".pf-tile").count() >= 2); /* Rolex asset + this post */
await sub().locator('[data-pftab="all"]').click(); await wait(250);
await sub().locator(".pf-pfo").click(); await wait(500);
await sub().locator('.pfo-row:has-text("TEST-ASSET-NOSAVE-777")').click(); await wait(400);
check("hidden post status = Hide in Portfolio", await sub().locator(".pfo-chip.st-hide").count() === 1);
await sub().locator(".sub-back").click(); await wait(300);
const pfoAfterHide = await sub().locator(".pfo-row").count();
await sub().locator(".sub-back").click(); await wait(300);

// 8) feed "+" with the toggle ON -> post AND a Portfolio drawer entry
await sub().locator('.nav-item[data-navgo="feed"]').click(); await wait(300);
await scr().locator('.app-header [data-flow="create"]').click(); await wait(400);
await sub().locator('.ig-grid .cell[data-i="3"]').click(); await wait(200);
await sub().locator(".cf-next").click(); await wait(400);
await sub().locator(".cf-step2 .sw").click(); await wait(150); /* opt in to the drawer */
check("my-assets toggle on", await sub().locator(".cf-step2 .sw.on").count() === 1);
await sub().locator('.ig-row[data-pane="spec"]').click(); await wait(250);
await sub().locator('.cf-f[data-f="brand"]').fill("Tudor");
await sub().locator('.cf-f[data-f="model"]').fill("Black Bay");
await sub().locator(".pane-done").click(); await wait(300);
await sub().locator(".cf-share").click(); await wait(500);
await nav().locator('.nav-item[data-navgo="profile"]').click(); await wait(400);
await sub().locator(".pf-pfo").click(); await wait(500);
const pfoCount1 = await sub().locator(".pfo-row").count();
check("toggled post saved to Portfolio", pfoCount1 === pfoAfterHide + 1, `${pfoAfterHide} -> ${pfoCount1}`);
check("asset name built from specs", (await sub().textContent()).includes("Tudor Black Bay"));
await page.screenshot({ path: `${OUT}/e-portfolio.png` });

check("no console errors", errors === 0);
await browser.close();
console.log(`\n${failed} failed / ${errors} console errors`);
process.exit(failed || errors ? 1 : 0);
