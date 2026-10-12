// Verify fo-flow SAVED-001: IG-style Saved hub — header (back / Saved / search / +),
// tab pills (All/Collections/Posts), Collections 2-col grid + See all,
// All posts 3-col grid + Manage (multi-select -> Move to collection / Remove),
// New collection sheet (Cancel / Next, 0/40 counter + clear X, Add people to collection),
// collection detail page, search-within-saved, empty states. Memory-only state.
// Regression: save sheet picker flow, unsave, post viewer from saved grid.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = "C:/Users/Admin/Desktop/TukDaeng/Prototypes/screenshots/task-SAVED-001";
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

const sub = () => page.locator(".page-sub");
const savedCnt = async () => page.evaluate(() => POSTS.filter(p => p.saved).length);

// 1) entry: Settings and activity -> Saved opens the hub
await page.locator(".set-btn").click();
await page.waitForTimeout(350);
check("settings Saved row + count", (await page.locator('.sub-row[data-sub="saved"] .sub-count').textContent()).trim() === String(await savedCnt()));
await page.locator('.sub-row[data-sub="saved"]').click();
await page.waitForTimeout(350);
check("saved title", (await sub().locator(".detail-title").textContent()).trim() === "Saved");
check("head search + plus icons", await sub().locator(".svd-srch").count() === 1 && await sub().locator(".svd-plus").count() === 1);
check("3 tab pills", await sub().locator(".svd-tab").count() === 3);
check("tab labels", (await sub().locator(".svd-tab").allTextContents()).join("|") === "All|Collections|Posts");
check("All tab active", await sub().locator('.svd-tab[data-tab="all"].on').count() === 1);

// 2) All tab: collections rows (max 4) + See all + posts grid + Manage
check("collections section + See all", (await sub().locator(".svd-sec .t").first().textContent()).trim() === "Collections" && (await sub().locator(".svd-see").first().textContent()).trim() === "See all");
check("collections rows show 4", await sub().locator(".svd-col").count() === 4);
check("col row has thumb + name + Private", await sub().locator(".svd-col .cv").count() === 4 && (await sub().locator(".svd-col .s").first().textContent()).trim() === "Private");
check("posts section label", (await sub().locator(".svd-sec .t").nth(1).textContent()).trim() === "All posts");
check("Manage link", (await sub().locator(".svd-manage").textContent()).trim() === "Manage");
check("all saved tiles", await sub().locator(".svd-tile").count() === await savedCnt());
check("stack icon on multi-photo tile", await sub().locator(".svd-stack").count() > 0);
await page.screenshot({ path: `${OUT}/d-saved-all.png` });

// 3) Collections tab -> all collections + See all hidden; Reels tab -> empty
await sub().locator('.svd-tab[data-tab="collections"]').click();
await page.waitForTimeout(250);
check("collections tab on", await sub().locator('.svd-tab[data-tab="collections"].on').count() === 1);
check("all 4 collections shown", await sub().locator(".svd-colbig").count() === 4);
check("collage cover for multi-post col", await sub().locator('.svd-colbig[data-col="Grail list"] .cv img').count() === 2);
check("no posts grid on collections tab", await sub().locator(".svd-tile").count() === 0);
await page.screenshot({ path: `${OUT}/d-saved-collections.png` });
await sub().locator('.svd-tab[data-tab="posts"]').click();
await page.waitForTimeout(200);
check("posts tab = grid only", await sub().locator(".svd-tile").count() === await savedCnt() && await sub().locator(".svd-col, .svd-colbig, .svd-sec").count() === 0);
await sub().locator('.svd-tab[data-tab="all"]').click();
await page.waitForTimeout(200);

// 4) tile click -> feed-style Saved viewer opens at that post (IG)
await sub().locator(".svd-tile").first().click();
await page.waitForTimeout(400);
check("post viewer opens", await page.locator(".screen.pv-open").count() === 1);
check("saved feed viewer", (await page.locator(".page-pv.feed .detail-title").textContent()).trim() === "Saved" && await page.locator(".svf-post").count() === await savedCnt());
check("card has head + photo + actions + caption", await page.locator(".svf-post .post-head .name").count() > 0 && await page.locator(".svf-post .post-actions .save-btn").count() > 0 && await page.locator(".svf-post .caption").count() > 0);
await page.screenshot({ path: `${OUT}/d-saved-viewer.png` });
await page.locator(".pv-back").click();
await page.waitForTimeout(300);

// 5) "+" -> New collection sheet (Cancel/Next, counter, clear X, add people)
await sub().locator(".svd-plus").click();
await page.waitForTimeout(300);
check("nc sheet opens", await page.locator(".comment-sheet.nc").count() === 1 && (await page.locator(".nc-title").textContent()).trim() === "New collection");
check("nc Cancel + disabled Next", (await page.locator(".nc-cancel").textContent()).trim() === "Cancel" && await page.locator(".nc-next").isDisabled());
check("nc counter 0/40", (await page.locator(".nc-count").textContent()).trim() === "0 / 40");
check("add people row", (await page.locator(".nc-ppl-btn .t").textContent()).trim() === "Add people to collection");
await page.locator(".nc-ppl-btn").click();
await page.waitForTimeout(200);
check("people list expands", await page.locator(".nc-ppl:not([hidden]) .nc-fr").count() > 0);
await page.locator(".nc-fr").first().click();
await page.waitForTimeout(150);
check("friend toggle on", await page.locator(".nc-fr.on").count() === 1);
await page.locator(".nc-input").fill("Divers");
await page.waitForTimeout(150);
check("counter 6/40 + Next enabled", (await page.locator(".nc-count").textContent()).trim() === "6 / 40" && !(await page.locator(".nc-next").isDisabled()));
check("clear X visible", await page.locator(".nc-x").isVisible());
await page.locator(".nc-x").click();
await page.waitForTimeout(150);
check("clear X resets", (await page.locator(".nc-input").inputValue()) === "" && (await page.locator(".nc-count").textContent()).trim() === "0 / 40" && await page.locator(".nc-next").isDisabled());
await page.locator(".nc-input").fill("Divers");
await page.waitForTimeout(100);
await page.locator(".nc-next").click();
await page.waitForTimeout(300);
check("collection created toast", (await page.locator(".sc-toast").textContent()).trim() === "Collection created");
await page.waitForTimeout(1900);

// 6) Collections tab -> new collection appears (5th card), open it -> empty detail
await sub().locator('.svd-tab[data-tab="collections"]').click();
await page.waitForTimeout(250);
check("new collection in grid", await sub().locator(".svd-colbig").count() === 5 && (await sub().textContent()).includes("Divers"));
check("new col card name", (await page.locator('.svd-colbig[data-col="Divers"] .n').textContent()).trim() === "Divers");
check("friend saved on new col", await page.evaluate(() => COLLECTIONS.find(c => c.name === "Divers").people.length === 1));
await page.screenshot({ path: `${OUT}/d-saved-collections-new.png` });
await page.locator('.svd-colbig[data-col="Divers"]').click();
await page.waitForTimeout(350);
check("collection detail title", (await sub().locator(".detail-title").textContent()).trim() === "Divers");
check("empty col: no title block", await sub().locator(".svd-coltitle").count() === 0);
check("col head search + dots", await sub().locator(".svd-srch").count() === 1 && await sub().locator(".svd-more").count() === 1);
check("empty collection state", (await sub().locator(".svd-empty .t").textContent()).trim() === "No saved posts yet");
await sub().locator(".svd-more").click();
await page.waitForTimeout(200);
check("empty col menu = 3 items, no Select", (await sub().locator(".svd-mi span").allTextContents()).join("|") === "Add to collection|Edit collection|Delete collection");
await page.screenshot({ path: `${OUT}/d-saved-colmenu-empty.png` });
await sub().locator('.svd-mi[data-act="edit"]').click();
await page.waitForTimeout(300);
check("empty col edit: no cover block", await sub().locator(".ec-cover").count() === 0 && (await sub().locator(".detail-title").textContent()).trim() === "Edit collection");
await page.screenshot({ path: `${OUT}/d-saved-edit-empty.png` });
await sub().locator(".svd-cancel").click();
await page.waitForTimeout(250);
await page.screenshot({ path: `${OUT}/d-saved-col-empty.png` });
await page.locator(".sub-back").click();
await page.waitForTimeout(300);

// 7) collection detail with posts -> "···" menu -> Select... -> remove from collection
await page.locator('.svd-colbig[data-col="Grail list"]').click();
await page.waitForTimeout(300);
check("grail detail has 2 tiles", await sub().locator(".svd-tile").count() === 2);
check("grail count label", (await sub().locator(".svd-coltitle .c").textContent()).trim() === "2 saved posts");
await sub().locator(".svd-more").click();
await page.waitForTimeout(250);
check("menu 4 items", await sub().locator(".svd-mi").count() === 4);
check("menu labels", (await sub().locator(".svd-mi span").allTextContents()).join("|") === "Add to collection|Edit collection|Select...|Delete collection");
await page.screenshot({ path: `${OUT}/d-saved-colmenu.png` });
await sub().locator('.svd-mi[data-act="sel"]').click();
await page.waitForTimeout(250);
check("select head: Cancel/name/Select all", (await sub().locator(".svd-cancel").first().textContent()).trim() === "Cancel" && (await sub().locator(".detail-title").textContent()).trim() === "Grail list" && (await sub().locator(".svd-selall").textContent()).trim() === "Select all");
check("select bar = Remove + Move to collection", (await sub().locator(".svd-unsave").textContent()).trim() === "Remove" && (await sub().locator(".svd-move").textContent()).trim() === "Move to collection");
await sub().locator(".svd-tile").first().click();
await page.waitForTimeout(150);
check("title stays collection name", (await sub().locator(".svd-seltitle").textContent()).trim() === "Grail list");
await page.screenshot({ path: `${OUT}/d-saved-select.png` });
await sub().locator(".svd-selall").click();
await page.waitForTimeout(200);
check("select all picks every tile", await sub().locator(".svd-tile.on").count() === await sub().locator(".svd-tile").count());
check("select all -> Deselect all", (await sub().locator(".svd-selall").textContent()).trim() === "Deselect all");
await sub().locator(".svd-tile").nth(1).click();
await page.waitForTimeout(150);
await sub().locator(".svd-unsave").click();
await page.waitForTimeout(300);
check("remove confirm dialog", (await page.locator(".dlg-q").textContent()).trim() === "Remove from this collection?" && (await page.locator(".dlg-desc").textContent()).includes("still be saved in all posts"));
await page.screenshot({ path: `${OUT}/d-saved-rmconfirm.png` });
await page.locator(".dlg-rmcol-go").click();
await page.waitForTimeout(300);
check("removed toast + still saved", (await page.locator(".sc-toast").textContent()).trim() === "Removed from Grail list" && await sub().locator(".svd-tile").count() === 1);
check("post still saved", await page.evaluate(() => POSTS.filter(p => p.saved).length) === await savedCnt() && await page.evaluate(() => POSTS.find(p => p.savedCol === "Grail list") !== undefined));
await page.waitForTimeout(1900);

// 7b) "···" -> Add to collection page -> select -> Done adds posts
await sub().locator(".svd-more").click();
await page.waitForTimeout(200);
await sub().locator('.svd-mi[data-act="add"]').click();
await page.waitForTimeout(300);
check("add page: Saved/Add from + Cancel/Done", (await sub().locator(".svd-addsub").textContent()).trim() === "Add from" && (await sub().locator(".svd-cancel").first().textContent()).trim() === "Cancel" && (await sub().locator(".svd-adddone").textContent()).trim() === "Done");
check("picker excludes collection posts", await sub().locator(".svd-tile").count() === await page.evaluate(() => POSTS.filter(p => p.saved && p.savedCol !== "Grail list").length));
await sub().locator(".svd-tile").first().click();
await page.waitForTimeout(150);
check("title -> 1 Selected", (await sub().locator(".svd-addtitle").textContent()).trim() === "1 Selected");
await page.screenshot({ path: `${OUT}/d-saved-add.png` });
await sub().locator(".svd-adddone").click();
await page.waitForTimeout(300);
check("added toast + grid grows", (await page.locator(".sc-toast").textContent()).trim() === "Added 1 post" && await sub().locator(".svd-tile").count() === 2);
await page.waitForTimeout(1900);

// 7c) "···" -> Edit collection page -> Change cover -> rename -> Done
await sub().locator(".svd-more").click();
await page.waitForTimeout(200);
await sub().locator('.svd-mi[data-act="edit"]').click();
await page.waitForTimeout(300);
check("edit page: title + Cancel/Done", (await sub().locator(".detail-title").textContent()).trim() === "Edit collection" && (await sub().locator(".svd-editdone").textContent()).trim() === "Done");
check("edit page: cover + Change cover link", await sub().locator(".ec-cover .ecv").count() === 1 && (await sub().locator(".ec-chgcover").textContent()).trim() === "Change cover");
check("edit page: name field prefilled", (await sub().locator(".ec-input").inputValue()) === "Grail list");
check("edit page: delete row + note", (await sub().locator(".ec-del").textContent()).trim() === "Delete collection" && (await sub().locator(".ec-note").textContent()).includes("will still be saved"));
await page.screenshot({ path: `${OUT}/d-saved-edit.png` });
await sub().locator(".ec-chgcover").click();
await page.waitForTimeout(300);
check("cover picker: title + tiles", (await sub().locator(".detail-title").textContent()).trim() === "Change cover" && await sub().locator(".ec-ctile").count() === 2);
await sub().locator(".ec-ctile").nth(1).click();
await page.waitForTimeout(300);
check("cover picked -> back to edit", (await sub().locator(".detail-title").textContent()).trim() === "Edit collection" && await page.evaluate(() => !!COLLECTIONS.find(c => c.name === "Grail list").coverPid));
await sub().locator(".ec-input").fill("Grail list X");
await page.waitForTimeout(100);
await sub().locator(".svd-editdone").click();
await page.waitForTimeout(300);
check("rename toast + title", (await page.locator(".sc-toast").textContent()).trim() === "Collection updated" && (await sub().locator(".detail-title").textContent()).trim() === "Grail list X");
check("posts moved with rename", await page.evaluate(() => POSTS.filter(p => p.savedCol === "Grail list X").length === 2 && !POSTS.some(p => p.savedCol === "Grail list")));
await page.waitForTimeout(1900);

// 7d) search inside collection + "···" -> Delete collection -> back to hub
await sub().locator(".svd-srch").click();
await page.waitForTimeout(250);
check("col search placeholder", (await sub().locator(".svd-q").getAttribute("placeholder")) === "Search Grail list X");
await sub().locator(".svd-cancel").click();
await page.waitForTimeout(250);
await sub().locator(".svd-more").click();
await page.waitForTimeout(200);
await sub().locator('.svd-mi[data-act="del"]').click();
await page.waitForTimeout(250);
check("delete confirm dialog", (await page.locator(".dlg-q").textContent()).trim() === "Delete collection?" && (await page.locator(".dlg-desc").textContent()).includes("will still be saved") && (await page.locator(".dlg-delcol-go").textContent()).trim() === "Delete");
check("menu closed under dialog", await sub().locator(".svd-menu").count() === 0);
await page.screenshot({ path: `${OUT}/d-saved-delconfirm.png` });
await page.locator(".dlg-cancel").click();
await page.waitForTimeout(250);
check("cancel keeps collection, no menu", await page.evaluate(() => !!COLLECTIONS.find(c => c.name === "Grail list X")) && await sub().locator(".svd-menu").count() === 0);
await sub().locator(".svd-more").click();
await page.waitForTimeout(200);
await sub().locator('.svd-mi[data-act="del"]').click();
await page.waitForTimeout(250);
await page.locator(".dlg-delcol-go").click();
await page.waitForTimeout(350);
check("delete -> back to hub + toast", await sub().locator(".svd-tab").count() === 3 && (await page.locator(".sc-toast").textContent()).trim() === "Collection deleted");
check("collection gone, posts still saved", await page.evaluate(() => !COLLECTIONS.some(c => c.name === "Grail list X") && POSTS.filter(p => p.savedCol === "Saved").length >= 3));
await page.waitForTimeout(1900);

// 8) search within saved
await sub().locator(".svd-srch").click();
await page.waitForTimeout(300);
check("search field shown", await sub().locator(".svd-q").count() === 1 && (await sub().locator(".svd-cancel").textContent()).trim() === "Cancel");
check("search placeholder + no back btn", (await sub().locator(".svd-q").getAttribute("placeholder")) === "Search your saved" && await sub().locator(".sr-head .sub-back").count() === 0);
await sub().locator(".svd-q").fill("snowflake");
await page.waitForTimeout(250);
// nothing seeded matches; save p6 then search
check("no match -> empty", (await sub().locator(".svd-empty .t").textContent()).trim() === "No results found");
await sub().locator(".svd-cancel").click();
await page.waitForTimeout(250);
check("cancel returns to hub", await sub().locator(".svd-tab").count() === 3);
await page.locator(".sub-back").click();
await page.waitForTimeout(300);
await page.locator(".sub-back").click();
await page.waitForTimeout(300);
check("back at feed", await page.locator(".screen.sub-open").count() === 0);

// 9) save p6 -> picker -> New collection from save sheet -> post lands in it
await page.locator('.post[data-pid="p6"] .save-btn').click();
await page.waitForTimeout(300);
check("save sheet opens", await page.locator(".screen.save-open").count() === 1 && await page.locator(".sv-head").count() === 1);
await page.locator(".sv-new").click();
await page.waitForTimeout(300);
check("nc sheet from save flow", await page.locator(".comment-sheet.nc").count() === 1);
await page.locator(".nc-cancel").click();
await page.waitForTimeout(300);
check("cancel returns to save sheet", await page.locator(".sv-head .t").count() === 1);
await page.locator(".sv-new").click();
await page.waitForTimeout(300);
await page.locator(".nc-input").fill("Snowflake fund");
await page.waitForTimeout(100);
await page.locator(".nc-input").press("Enter");
await page.waitForTimeout(300);
check("Enter creates + saves post", (await page.locator(".sc-toast").textContent()).trim() === "Saved to Snowflake fund");
check("p6 in new collection", await page.evaluate(() => POSTS.find(p => p.id === "p6").savedCol === "Snowflake fund"));
await page.waitForTimeout(1900);

// 10) manage -> Move to collection sheet
await page.locator(".set-btn").click();
await page.waitForTimeout(350);
await page.locator('.sub-row[data-sub="saved"]').click();
await page.waitForTimeout(350);
await sub().locator('.svd-tab[data-tab="all"]').click();
await page.waitForTimeout(200);
await sub().locator('.svd-tile[data-pid="p10"]').dispatchEvent("contextmenu");
await page.waitForTimeout(300);
check("long-press enters select mode", await sub().locator(".svd-selall").count() === 1 && await sub().locator('.svd-tile[data-pid="p10"].on').count() === 1);
check("hub select head = All posts", (await sub().locator(".svd-seltitle").textContent()).trim() === "All posts");
check("hub bar = Unsave + Add to collection", (await sub().locator(".svd-unsave").textContent()).trim() === "Unsave" && (await sub().locator(".svd-move").textContent()).trim() === "Add to collection");
await sub().locator('.svd-tile[data-pid="p7"]').click();
await page.waitForTimeout(150);
check("2 selected", await sub().locator(".svd-tile.on").count() === 2);
await sub().locator(".svd-move").click();
await page.waitForTimeout(300);
check("move picker sheet", (await page.locator(".comment-sheet .sv-sec .l").textContent()).trim() === "Collections");
check("move rows = 5 cols, no Saved row", await page.locator(".svd-mv").count() === 5);
await page.screenshot({ path: `${OUT}/d-saved-move.png` });
const orderBefore = await page.evaluate(() => savedPosts().map(p => p.id).join(","));
await page.locator('.svd-mv[data-col="Snowflake fund"]').click();
await page.waitForTimeout(300);
check("added toast w/ thumb", (await page.locator(".sc-toast").textContent()).trim() === "Added to Snowflake fund" && await page.locator(".sc-toast .st-img").count() === 1);
check("allposts order unchanged", await page.evaluate(() => savedPosts().map(p => p.id).join(",")) === orderBefore);
check("posts moved", await page.evaluate(() => POSTS.find(p => p.id === "p10").savedCol === "Snowflake fund" && POSTS.find(p => p.id === "p7").savedCol === "Snowflake fund"));
await page.waitForTimeout(1900);
check("after move -> All posts page", (await sub().locator(".detail-title").textContent()).trim() === "All posts" && await sub().locator(".svd-tab").count() === 0 && await sub().locator(".svd-more").count() === 1);
await sub().locator(".svd-more").click();
await page.waitForTimeout(250);
check("allposts menu = Select only", await sub().locator(".svd-mi").count() === 1 && (await sub().locator(".svd-mi span").textContent()).trim() === "Select...");
await sub().locator('.svd-mi[data-act="sel"]').click();
await page.waitForTimeout(250);
check("select re-enters select mode", await sub().locator(".svd-selall").count() === 1);
await sub().locator(".svd-cancel").first().click();
await page.waitForTimeout(250);
check("cancel select -> back on All posts page", (await sub().locator(".detail-title").textContent()).trim() === "All posts" && await sub().locator(".svd-selall").count() === 0);
await sub().locator(".sub-back").click();
await page.waitForTimeout(300);
check("back -> Saved hub", (await sub().locator(".detail-title").textContent()).trim() === "Saved" && await sub().locator(".svd-tab").count() === 3);

// 11) search finds real matches now
await sub().locator(".svd-srch").click();
await page.waitForTimeout(250);
await sub().locator(".svd-q").fill("rotation");
await page.waitForTimeout(250);
check("search filters saved grid", await sub().locator(".svd-tile").count() === 1);
await sub().locator(".svd-x").click();
await page.waitForTimeout(150);
check("clear X restores grid", await sub().locator(".svd-tile").count() === await savedCnt());
await page.screenshot({ path: `${OUT}/d-saved-search.png` });
await page.locator(".svd-cancel").click(); // cancel exits search mode
await page.waitForTimeout(250);
check("cancel exits search to hub", await sub().locator(".svd-tab").count() === 3);
await page.locator(".sub-back").click();
await page.waitForTimeout(250);
check("back to settings", (await sub().locator(".detail-title").textContent()).trim() === "Settings and activity");
await page.locator(".sub-back").click();
await page.waitForTimeout(300);

// 12) light theme pass
await page.locator("#themeToggle").click();
await page.waitForTimeout(400);
await page.locator(".set-btn").click();
await page.waitForTimeout(350);
await page.locator('.sub-row[data-sub="saved"]').click();
await page.waitForTimeout(350);
check("light: hub renders", await sub().locator(".svd-tile").count() > 0 && await sub().locator(".svd-tab").count() === 3);
await page.screenshot({ path: `${OUT}/l-saved-all.png` });
await sub().locator(".svd-plus").click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/l-new-collection.png` });
await page.locator(".nc-cancel").click();
await page.waitForTimeout(200);

console.log(`\n===== ${failed === 0 && errors === 0 ? "ALL PASS" : "FAILED"} — ${failed} failed, ${errors} console errors =====`);
await browser.close();
process.exit(failed || errors ? 1 : 0);
