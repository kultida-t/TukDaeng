// Verify fo-flow SEARCH-001: IG-style search flow wired to the header search
// icon — landing (search bar + popular chips + explore grid), typing state
// (Recent + See all + per-item remove), autocomplete (keyword suggestions w/
// listing counts + seller accounts), Search Result (Sale-only feed cards +
// result count + sort sheet + active filter chips), Filters page (draft until
// Apply, Brand->Model dependency, price-range validation), empty/error states,
// explore tile -> post detail. Regression: feed tabs + "..." menu + like.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = "C:/Users/Admin/Desktop/TukDaeng/Prototypes/screenshots/task-SEARCH-001";
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

// 1) header search icon opens the search landing page
await page.locator(".app-header .search-btn").click();
await page.waitForTimeout(450);
check("search page opens (sub-open)", await page.locator(".screen.sub-open").count() === 1);
check("landing shows fake search field", await sub().locator(".sr-fake .sr-ph").count() === 1);
check("landing shows saved/bookmark icon", await sub().locator(".sr-saved").count() === 1);
check("popular chips rendered (8)", await sub().locator(".sr-pick").count() === 8);
check("filter icon chip present", await sub().locator(".sr-chip.ico").count() === 1);
check("first chip = For you (active)", (await sub().locator(".sr-pick").nth(0).textContent()).trim() === "For you");
check("explore grid rendered", await sub().locator(".xp-grid").count() === 1);
check("explore tiles >= 14", await sub().locator(".xp-tile").count() >= 14, String(await sub().locator(".xp-tile").count()));
check("some tall tiles", await sub().locator(".xp-tile.tall").count() >= 3);
check("some view-count overlays", await sub().locator(".xp-views").count() >= 2);
await page.screenshot({ path: `${OUT}/d-search-landing.png` });

// 2) tap field -> typing mode with Recent
await sub().locator(".sr-fake").click();
await page.waitForTimeout(400);
check("typing mode shows real input", await sub().locator("input.sr-q").count() === 1);
check("Cancel button shown", await sub().locator(".sr-cancel").count() === 1);
check("Recent header shown", (await sub().locator(".rc-head .t").textContent()).trim() === "Recent");
check("4 recent rows initially", await sub().locator(".rc-row").count() === 4);
check("See all link shown", await sub().locator(".rc-all").count() === 1);
check("seller recent has avatar", await sub().locator(".rc-row img").count() >= 1);
check("keyword recent has clock icon", await sub().locator(".rc-row .rc-ico").count() >= 1);
await page.screenshot({ path: `${OUT}/d-search-recent.png` });

// 3) See all -> dedicated Recent searches page (back + title + Clear all), x removes an item
await sub().locator(".rc-all").click();
await page.waitForTimeout(400);
check("See all opens Recent searches page", (await sub().locator(".detail-title").textContent()).trim() === "Recent searches");
check("Clear all link shown", await sub().locator(".rc-clear").count() === 1);
check("recents page shows all 6 rows", await sub().locator(".rc-row").count() === 6);
await page.screenshot({ path: `${OUT}/d-recent-searches.png` });
await sub().locator(".rc-x").nth(0).click();
await page.waitForTimeout(300);
check("x removes one recent row", await sub().locator(".rc-row").count() === 5);
await sub().locator(".rc-clear").click();
await page.waitForTimeout(300);
check("Clear all empties the list", await sub().locator(".rc-row").count() === 0 && (await sub().locator(".sub-empty").textContent()).includes("No recent"));
// restore a recent + back to typing
await page.evaluate(() => { srchState(document.querySelector(".screen")).recents = [{ t: "kw", v: "rolex" }, { t: "seller", v: "chrono.th" }, { t: "kw", v: "grand seiko" }]; renderSub(document.querySelector(".screen")); });
await sub().locator(".sub-back").click();
await page.waitForTimeout(350);
check("back from recents page -> typing recents", await sub().locator(".rc-row").count() === 3 && await sub().locator("input.sr-q").count() === 1);

// 4) typing "rolex" -> autocomplete: keyword suggestions + counts, no accounts for "rolex"
await sub().locator("input.sr-q").fill("rolex");
await page.waitForTimeout(350);
check("suggestions shown for rolex", await sub().locator(".ac-row").count() >= 2, String(await sub().locator(".ac-row").count()));
check("kw suggestion has magnifier icon", await sub().locator(".ac-ico").count() >= 1);
const firstAc = await sub().locator(".ac-row .u").nth(0).textContent();
check("first suggestion mentions Rolex", /rolex/i.test(firstAc), firstAc);
const acSub = await sub().locator(".ac-row .d").nth(0).textContent();
check("suggestion shows listing count", /listing/.test(acSub), acSub);
await page.screenshot({ path: `${OUT}/d-search-autocomplete.png` });

// 4b) typing a seller name -> account row appears
await sub().locator("input.sr-q").fill("chrono");
await page.waitForTimeout(300);
check("seller suggestion appears", await sub().locator('.ac-row[data-kind="seller"]').count() === 1);
check("seller row has avatar", await sub().locator('.ac-row[data-kind="seller"] img').count() === 1);
// clear input via x -> back to recents
await sub().locator(".sr-x").click();
await page.waitForTimeout(300);
check("x clears to recents", await sub().locator(".rc-row").count() >= 1 && await sub().locator("input.sr-q").inputValue() === "");

// 5) submit "rolex" w/o picking a suggestion -> IG-style results page (tabs + seller card + grid)
await sub().locator("input.sr-q").fill("rolex");
await page.waitForTimeout(250);
await sub().locator("input.sr-q").press("Enter");
await page.waitForTimeout(450);
check("results mode: query in field", (await sub().locator(".sr-qv").textContent()).trim() === "rolex");
check("3 result tabs rendered", await sub().locator(".sr-tab").count() === 3);
check("tab labels For you/Profiles/Tags", (await sub().locator(".sr-tab").nth(1).textContent()).trim() === "Profiles");
check("For you tab active", await sub().locator('.sr-tab[data-tab="foryou"].on').count() === 1);
check("Accounts hidden (no seller named rolex)", await sub().locator('.ac-row[data-kind="seller"]').count() === 0 && !(await sub().locator(".sr-sec").nth(0).textContent()).includes("Accounts"));
check("Posts section shown", (await sub().locator(".sr-sec").nth(0).textContent()).trim() === "Posts");
check("results as 2-col grid tiles (2, Sale only)", await sub().locator(".xp-grid.two .xp-tile").count() === 2);
check("Filters icon in head", await sub().locator(".sr-head .flt-open").count() === 1);
check("no result-count text", await sub().locator(".sr-meta").count() === 0);
check("no sort control", await sub().locator(".sr-sort").count() === 0);
check("no save icon on results head", await sub().locator(".sr-head .sr-saved").count() === 0);
await page.screenshot({ path: `${OUT}/d-search-results.png` });

// 5b) Profiles tab lists related seller accounts; Tags tab lists option keywords
await sub().locator('.sr-tab[data-tab="profiles"]').click();
await page.waitForTimeout(350);
check("Profiles tab empty for rolex (no name match)", await sub().locator(".sr-empty-block").count() === 1);
// name-matched query -> Accounts + Profiles populate
await sub().locator(".sr-fake").click();
await page.waitForTimeout(300);
await sub().locator("input.sr-q").fill("watch");
await sub().locator("input.sr-q").press("Enter");
await page.waitForTimeout(400);
check("watch -> Accounts section shown", (await sub().locator(".sr-sec").nth(0).textContent()).trim() === "Accounts");
check("watch -> 3 name-matched sellers", await sub().locator('.ac-row[data-kind="seller"]').count() === 3, String(await sub().locator('.ac-row[data-kind="seller"]').count()));
await sub().locator('.sr-tab[data-tab="profiles"]').click();
await page.waitForTimeout(350);
check("Profiles tab lists matched sellers w/ Follow", await sub().locator(".sr-scard").count() === 3 && await sub().locator(".sr-scard .follow-btn").count() === 3);
await page.screenshot({ path: `${OUT}/d-results-profiles.png` });
await sub().locator('.sr-tab[data-tab="foryou"]').click();
await page.waitForTimeout(300);
await sub().locator(".sr-fake").click();
await page.waitForTimeout(300);
await sub().locator("input.sr-q").fill("rolex");
await sub().locator("input.sr-q").press("Enter");
await page.waitForTimeout(400);
await sub().locator('.sr-tab[data-tab="tags"]').click();
await page.waitForTimeout(350);
check("Tags tab lists matching options", await sub().locator(".ac-row").count() >= 2);
await page.screenshot({ path: `${OUT}/d-results-tags.png` });
await sub().locator('.sr-tab[data-tab="foryou"]').click();
await page.waitForTimeout(350);
check("back on For you tab", await sub().locator('.sr-tab[data-tab="foryou"].on').count() === 1);

// 6) submitted query lands in Recent (field keeps query -> clear x reveals recents)
await sub().locator(".sr-fake").click();
await page.waitForTimeout(300);
check("back in typing mode w/ query kept", (await sub().locator("input.sr-q").inputValue()) === "rolex");
await sub().locator(".sr-x").click();
await page.waitForTimeout(300);
const rcFirst = await sub().locator(".rc-row .u").nth(0).textContent();
check("rolex landed in Recent", rcFirst.trim() === "rolex", rcFirst);

// 7) back to results for filter checks (cancel -> landing -> type -> enter)
await sub().locator(".sr-cancel").click();
await page.waitForTimeout(300);
await sub().locator(".sr-fake").click();
await page.waitForTimeout(300);
await sub().locator("input.sr-q").fill("rolex");
await sub().locator("input.sr-q").press("Enter");
await page.waitForTimeout(400);
check("back on results page", await sub().locator(".sr-tabs").count() === 1);

// 8) Filters page — brand chips with counts, model dependency, draft until Apply
await sub().locator(".flt-open").click();
await page.waitForTimeout(400);
check("filters page opens", (await sub().locator(".detail-title").textContent()).trim() === "Filters");
check("brand chips rendered", await sub().locator('.flt-chip[data-fk="brand"]').count() === 6);
const rolexChip = await sub().locator('.flt-chip[data-fk="brand"][data-v="Rolex"]').textContent();
check("Rolex chip shows (2)", rolexChip.includes("(2)"), rolexChip.trim());
const omegaChip = await sub().locator('.flt-chip[data-fk="brand"][data-v="Omega"]').textContent();
check("Omega chip shows (0) selectable", omegaChip.includes("(0)"), omegaChip.trim());
await sub().locator('.flt-chip[data-fk="brand"][data-v="Rolex"]').click();
await page.waitForTimeout(350);
check("brand chip toggles on", await sub().locator('.flt-chip[data-fk="brand"][data-v="Rolex"].on').count() === 1);
check("model list now Rolex-only (5)", await sub().locator('.flt-chip[data-fk="model"]').count() === 5);
check("model section shows Rolex context", (await sub().locator(".flt-t").nth(1).textContent()).includes("Rolex"));
check("Apply shows count (1)", (await sub().locator(".flt-apply").textContent()).includes("(1)"));
// back = discard draft
await sub().locator(".sub-back").click();
await page.waitForTimeout(400);
check("back returns to results", await sub().locator(".sr-tabs").count() === 1);
check("no active filter chips after discard", await sub().locator("[data-rm]").count() === 0);

// 9) Apply filters -> filtered results + removable chips
await sub().locator(".flt-open").click();
await page.waitForTimeout(350);
await sub().locator('.flt-chip[data-fk="brand"][data-v="Rolex"]').click();
await page.waitForTimeout(300);
await sub().locator('.flt-chip[data-fk="model"][data-v="Submariner"]').click();
await page.waitForTimeout(300);
await sub().locator(".flt-apply").click();
await page.waitForTimeout(400);
check("apply returns to results", await sub().locator(".sr-tabs").count() === 1);
check("active chips Rolex + Submariner", await sub().locator("[data-rm]").count() === 2);
check("filtered to 1 result (Submariner only)", await sub().locator(".sub-scroll .xp-tile").count() === 1);
check("Datejust filtered out", (await sub().locator(".sub-scroll .xp-tile").nth(0).getAttribute("data-pid")) === "p1");
// remove Submariner chip -> back to 2
await sub().locator('[data-rm="model:Submariner"]').click();
await page.waitForTimeout(350);
check("removing chip widens to 2 results", await sub().locator(".sub-scroll .xp-tile").count() === 2);
check("1 filter chip left", await sub().locator("[data-rm]").count() === 1);

// 10) price range — comma format + validation (Rolex brand chip still active -> rolex+Rolex+350k-450k = p1+p4)
await sub().locator(".flt-open").click();
await page.waitForTimeout(350);
await sub().locator(".flt-pmin").fill("450000");
await page.waitForTimeout(200);
check("min auto-formats comma", (await sub().locator(".flt-pmin").inputValue()) === "450,000");
await sub().locator(".flt-pmax").fill("350000");
await sub().locator(".flt-apply").click();
await page.waitForTimeout(250);
check("min>max shows error, stays on page", await sub().locator(".flt-err").isVisible() && (await sub().locator(".flt-err").textContent()).includes("must not exceed"), await sub().locator(".flt-err").textContent());
check("still on filters page", await sub().locator(".flt-apply").count() === 1);
await sub().locator(".flt-pmin").fill("350000");
await sub().locator(".flt-pmax").fill("450000");
await sub().locator(".flt-apply").click();
await page.waitForTimeout(400);
check("price range 350k-450k -> 2 results (Datejust+Submariner)", await sub().locator(".sub-scroll .xp-tile").count() === 2);
check("price chip shown", await sub().locator('[data-rm^="price:"]').count() === 1);

// 11) empty state — nonsense query
await sub().locator(".sr-fake").click();
await page.waitForTimeout(300);
await sub().locator("input.sr-q").fill("zzzz nothing");
await sub().locator("input.sr-q").press("Enter");
await page.waitForTimeout(400);
check("empty state = No data found", (await sub().locator(".sr-empty-block .t").textContent()).trim() === "No data found");
check("0 result tiles", await sub().locator(".sub-scroll .xp-tile").count() === 0);
await page.screenshot({ path: `${OUT}/d-search-empty.png` });

// 12) explore tile -> post detail opens OVER search, back returns to search
await sub().locator(".sr-fake").click();
await page.waitForTimeout(300);
await sub().locator(".sr-cancel").click();
await page.waitForTimeout(350);
check("cancel returns to landing", await sub().locator(".xp-grid").count() === 1);
await sub().locator(".xp-tile").nth(0).click();
await page.waitForTimeout(450);
check("tile opens IG-style post viewer", await page.locator(".screen.pv-open").count() === 1);
check("viewer shows full post", await page.locator(".page-pv .pv-post").count() >= 1);
check("viewer has action rail", await page.locator(".page-pv .pv-rail .like-btn").count() >= 1 && await page.locator(".page-pv .pv-rail .comment-btn").count() >= 1);
check("rail has views + more icons", await page.locator(".page-pv .pv-rail .pm-btn").count() >= 1 && await page.locator(".page-pv .pv-rail .pv-act").count() >= 6);
check("rail like shows Likes label not count", (await page.locator(".page-pv .pv-lbl").first().textContent()).trim() === "Likes");
check("viewer has add-comment bar", await page.locator(".page-pv .pv-add").count() >= 1);
check("no Liked-by row in viewer", await page.locator(".page-pv .pv-foot .liked-by").count() === 0);
// caption "…" opens caption + comments sheet (IG-style)
await page.locator(".page-pv .pv-cap .more-link").first().click();
await page.waitForTimeout(400);
check("… opens caption+comments sheet", await page.locator(".screen.comments-open").count() === 1 && await page.locator(".comment-sheet.ps").count() === 1);
check("sheet shows seller head + full caption", await page.locator(".comment-sheet.ps .ps-head").count() === 1 && (await page.locator(".comment-sheet.ps .ps-cap").textContent()).includes("Full set"));
check("sheet has comment input", await page.locator(".comment-sheet.ps .comment-input").count() === 1);
await page.locator(".comment-sheet .sheet-handle").click();
await page.waitForTimeout(250);
// Likes label opens the likes sheet
await page.locator(".page-pv .pv-lbl").first().click();
await page.waitForTimeout(300);
check("Likes label opens likes sheet", await page.locator(".screen.likes-open").count() === 1);
await page.locator(".comment-sheet .sheet-handle").click();
await page.waitForTimeout(250);
check("handle closes likes sheet", await page.locator(".screen.likes-open").count() === 0);
// comment sheet from viewer has no title (IG-style)
await page.locator(".page-pv .pv-add").first().click();
await page.waitForTimeout(350);
check("viewer comment sheet hides title", await page.locator(".screen.comments-open").count() === 1 && await page.locator(".comment-sheet.nt").count() === 1 && !(await page.locator(".comment-sheet .sheet-title").isVisible()));
await page.locator(".comment-sheet .sheet-handle").click();
await page.waitForTimeout(250);
await page.screenshot({ path: `${OUT}/d-post-viewer.png` });
// like inside viewer works
await page.locator(".page-pv .pv-post").first().locator(".like-btn").click();
await page.waitForTimeout(250);
check("like toggles inside viewer", await page.locator(".page-pv .pv-post").first().locator(".like-btn.liked").count() === 1);
await page.locator(".page-pv .pv-post").first().locator(".like-btn").click();
// Tap for details on a sale post expands specs; View full detail closes viewer + opens detail page
check("sale posts show Tap for details", await page.locator(".page-pv .pv-dt").count() >= 1);
await page.locator(".page-pv .pv-dt").first().click();
await page.waitForTimeout(400);
check("details open as bottom sheet", await page.locator(".screen.details-open").count() === 1 && await page.locator(".comment-sheet.dt").count() === 1);
check("details sheet has no title", await page.locator(".comment-sheet.dt .sheet-title").count() === 0);
check("details sheet shows price + specs", (await page.locator(".comment-sheet.dt .details-price").textContent()).includes("THB") && await page.locator(".comment-sheet.dt .spec-row, .comment-sheet.dt .spec-tile, .comment-sheet.dt .chip").count() > 5);
await page.locator(".comment-sheet.dt .view-full").first().dispatchEvent("click");
await page.waitForTimeout(450);
check("view full detail closes viewer", await page.locator(".screen.pv-open").count() === 0);
check("detail page opened", await page.locator(".screen.detail-open").count() === 1);
await page.locator(".page-detail .detail-back").click();
await page.waitForTimeout(400);
check("detail back returns to search landing", await sub().locator(".xp-grid").count() === 1);
// reopen viewer — scroll to next post via track
await sub().locator(".xp-tile").nth(0).click();
await page.waitForTimeout(400);
await page.locator(".page-pv .pv-track").evaluate(el => { el.scrollTop = el.clientHeight; });
await page.waitForTimeout(300);
check("scroll-snap shows second post", (await page.locator(".page-pv .pv-track").evaluate(el => el.scrollTop)) > 0);
// pv-back returns to search landing
await page.locator(".pv-back").click();
await page.waitForTimeout(400);
check("back returns to search landing", await page.locator(".screen.sub-open").count() === 1 && await sub().locator(".xp-grid").count() === 1);

// 13) saved icon -> Saved page pushed over search
await sub().locator(".sr-saved").click();
await page.waitForTimeout(400);
check("saved page opens over search", (await sub().locator(".detail-title").textContent()).trim() === "Saved");
await sub().locator(".sub-back").click();
await page.waitForTimeout(350);
check("back returns to search landing", await sub().locator(".xp-grid").count() === 1);
// close search -> feed
await sub().locator(".sr-head .sub-back").click();
await page.waitForTimeout(400);
check("back closes search to feed", await page.locator(".screen.sub-open").count() === 0 && await page.locator(".feed-scroll .post").count() > 0);

// 14) light theme — landing + results
await page.locator("#themeToggle").click();
await page.waitForTimeout(300);
await page.locator(".app-header .search-btn").click();
await page.waitForTimeout(400);
check("landing renders in light theme", await sub().locator(".xp-grid").count() === 1);
await page.screenshot({ path: `${OUT}/l-search-landing.png` });
await sub().locator(".sr-fake").click();
await page.waitForTimeout(250);
await sub().locator("input.sr-q").fill("tudor");
await sub().locator("input.sr-q").press("Enter");
await page.waitForTimeout(400);
check("results render in light theme", await sub().locator(".sub-scroll .xp-tile").count() === 1);
await page.screenshot({ path: `${OUT}/l-search-results.png` });
await page.locator("#themeToggle").click();
await page.waitForTimeout(300);

// 15) error state via flag + retry (theme toggle rebuilt .screen -> re-init via srchState)
await page.evaluate(() => {
  const scr = document.querySelector(".screen");
  const S = srchState(scr);
  S.q = "tudor"; S.mode = "results"; S.err = true;
  scr._subStack = ["search"]; scr.classList.add("sub-open"); renderSub(scr);
});
await page.waitForTimeout(250);
check("error state renders", (await sub().locator(".sr-empty-block .t").textContent()).includes("Something went wrong"));
check("retry button present", await sub().locator(".sr-retry").count() === 1);
await page.screenshot({ path: `${OUT}/d-search-error.png` });
await sub().locator(".sr-retry").click();
await page.waitForTimeout(350);
check("retry restores results", await sub().locator(".sub-scroll .xp-tile").count() >= 1);
await sub().locator(".sr-head .sub-back").click();
await page.waitForTimeout(300);
await sub().locator(".sr-head .sub-back").click();
await page.waitForTimeout(350);
check("search closed back to feed", await page.locator(".screen.sub-open").count() === 0);

// 16) regression — feed tabs + "..." menu + like still work
check("feed byline says Liked by", (await page.locator(".feed-scroll .liked-by").first().textContent()).trim().startsWith("Liked by"));
await page.locator(".feed-scroll .comment-btn").first().click();
await page.waitForTimeout(350);
check("feed comment sheet keeps title", (await page.locator(".comment-sheet .sheet-title").textContent()).trim() === "Comments");
await page.locator(".comment-sheet .sheet-handle").click();
await page.waitForTimeout(250);
check("p1 details-toggle hidden until more", !(await page.locator('.post[data-pid="p1"] .details-toggle').isVisible()));
await page.locator('.post[data-pid="p1"] .more-link').click();
await page.waitForTimeout(250);
check("feed more still expands inline", await page.locator(".feed-scroll .caption.expanded").count() === 1);
check("p1 details-toggle visible after more", await page.locator('.post[data-pid="p1"] .details-toggle').isVisible());
await page.locator('.post[data-pid="p1"] .details-toggle').click();
await page.waitForTimeout(300);
check("details expand + Hide details label", await page.locator('.post[data-pid="p1"] .details-body.open').count() === 1 && (await page.locator('.post[data-pid="p1"] .dt-label').textContent()).trim() === "Hide details");
await page.locator('.post[data-pid="p1"] .caption .cap-full').click();
await page.waitForTimeout(300);
check("tap expanded caption collapses + closes spec", await page.locator('.post[data-pid="p1"] .caption.expanded').count() === 0 && await page.locator('.post[data-pid="p1"] .details-body.open').count() === 0);
check("p1 details-toggle hidden again", !(await page.locator('.post[data-pid="p1"] .details-toggle').isVisible()));
await page.locator('.post[data-pid="p1"] .more-link').click();
await page.waitForTimeout(250);
await page.locator('.post[data-pid="p1"] .details-toggle').click();
await page.waitForTimeout(300);
check("details expand again after re-more", await page.locator('.post[data-pid="p1"] .details-body.open').count() === 1);
await page.locator('.post[data-pid="p1"] .details-toggle').click();
await page.waitForTimeout(300);
check("details collapse again", await page.locator('.post[data-pid="p1"] .details-body.open').count() === 0);
await page.locator(".feed-tab").nth(1).click();
await page.waitForTimeout(300);
check("following tab still works", await page.locator(".feed-scroll .post").count() === 3);
await page.locator(".feed-tab").nth(0).click();
await page.waitForTimeout(300);
await page.locator('.post[data-pid="p1"] .post-head .more').click();
await page.waitForTimeout(350);
check('"..." menu still opens', await page.locator(".screen.pm-open").count() === 1 && await page.locator(".pm-row").count() === 2);
await page.locator(".sheet-handle").click();
await page.waitForTimeout(300);
await page.locator('.post[data-pid="p1"] .like-btn').click();
await page.waitForTimeout(250);
check("like still toggles", await page.locator('.post[data-pid="p1"] .like-btn.liked').count() === 1);
await page.locator('.post[data-pid="p1"] .like-btn').click();

console.log(`\nDONE — ${failed} failed, ${errors} console/page errors`);
await browser.close();
process.exit(failed || errors ? 1 : 0);
