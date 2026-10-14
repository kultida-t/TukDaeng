// Verify fo-flow CREATE-001: feed → "+" → in-app IG picker → caption → post lands on feed
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/fo-flow";
mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const check = (name, ok) => { console.log(`${ok ? "PASS" : "FAIL"} ${name}`); ok ? pass++ : fail++; };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 560, height: 950 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
page.on("console", m => { if (m.type() === "error") console.log("CONSOLE ERR:", m.text()); });
page.on("pageerror", e => console.log("PAGE ERR:", e.message));

// 1. Feed loads
await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);
check("feed renders phones", await page.locator(".phone").count() === 1);
await page.screenshot({ path: `${OUT}/1-feed.png` });

// 2. Tap + → create sheet slides up in-app (still on index.html)
await page.locator('[data-flow="create"]').click();
await page.waitForTimeout(500);
check("stays on index.html", page.url().endsWith("/index.html"));
check("sub-open = create sheet", await page.locator(".screen").evaluate(el => el.classList.contains("sub-open")));
check("picker visible", await page.locator(".cf .ig-grid").isVisible());
check("Next disabled with 0 photos", await page.locator(".cf-next").evaluate(el => el.classList.contains("off")));
await page.screenshot({ path: `${OUT}/2-picker-empty.png` });

// 3. Single tap selects a photo (non-multi mode)
await page.locator('.cf .ig-grid .cell[data-i="0"]').click();
await page.waitForTimeout(250);
check("hero shows photo", await page.locator(".cf .ig-hero .ig-car img").isVisible());
check("Next enabled after select", !(await page.locator(".cf-next").evaluate(el => el.classList.contains("off"))));

// 4. Multi-select mode → pick 3, ord badges 1/2/3
await page.locator("[data-selmode]").click();
await page.waitForTimeout(250);
await page.locator('.cf .ig-grid .cell[data-i="1"]').click();
await page.locator('.cf .ig-grid .cell[data-i="2"]').click();
await page.waitForTimeout(250);
const ord = await page.locator(".cf .ig-grid .radio.on").allTextContents();
check("multi-select ord badges 1,2,3", JSON.stringify(ord) === JSON.stringify(["1", "2", "3"]));
// hero follows the most recently tapped cell (IG)
const heroSrc = await page.locator(".cf [data-hero] .ig-car img").getAttribute("src");
const cellSrc = await page.locator('.cf .ig-grid .cell[data-i="2"] img').getAttribute("src");
check("hero shows last-selected photo", heroSrc === cellSrc);
await page.screenshot({ path: `${OUT}/3-selected.png` });

// 5. Next → caption step slides over
await page.locator(".cf-next").click();
await page.waitForTimeout(450);
check("caption step open", await page.locator(".cf.cap-open .cf-step2").isVisible());
check("3 thumbs in caption step", await page.locator(".cf .cf-step2 .ig-thumb").count() === 3);
await page.screenshot({ path: `${OUT}/4-caption.png` });

// 5b. Tap a thumbnail → full-sheet photo preview opens, swipe between photos, tap backdrop closes it (IG-style, no nav buttons)
await page.locator(".cf .cf-step2 .ig-thumb img").nth(0).click();
await page.waitForTimeout(300);
check("thumb tap opens photo zoom", await page.locator(".cf .ig-zoom.open").isVisible());
check("zoom shows tapped photo", await page.locator(".cf .ig-zoom img").evaluate(img => img.src.length > 0));
check("no nav arrows (swipe only)", await page.locator(".cf .ig-zoom .z-nav").count() === 0);
await page.screenshot({ path: `${OUT}/4b-caption-zoom.png` });
// swipe left on the photo → photo 2
const zimg = await page.locator(".cf .ig-zoom img").boundingBox();
await page.mouse.move(zimg.x + zimg.width / 2 + 80, zimg.y + zimg.height / 2);
await page.mouse.down();
await page.mouse.move(zimg.x + zimg.width / 2 - 120, zimg.y + zimg.height / 2, { steps: 6 });
await page.mouse.up();
await page.waitForTimeout(250);
check("swipe left → photo 2", await page.locator(".cf .ig-zoom").evaluate(z => +z.dataset.i === 1));
check("dots show position 2", await page.locator(".cf .ig-zoom .z-dots i.on").evaluate(d => [...d.parentElement.children].indexOf(d) === 1).catch(() => false));
// tap ON the photo does nothing (only backdrop closes)
await page.locator(".cf .ig-zoom img").click();
await page.waitForTimeout(250);
check("tap on photo keeps zoom open", await page.locator(".cf .ig-zoom.open").isVisible());
// tap the dark backdrop → closes
await page.locator(".cf .ig-zoom").click({ position: { x: 12, y: 12 } });
await page.waitForTimeout(300);
check("tap backdrop closes preview", await page.locator(".cf .ig-zoom.open").count() === 0);
// thumb strip scrolls horizontally (wheel)
const stripBox = await page.locator(".cf .ig-thumbs.multi").boundingBox();
await page.mouse.move(stripBox.x + stripBox.width / 2, stripBox.y + stripBox.height / 2);
await page.mouse.wheel(0, 200);
await page.waitForTimeout(200);
check("thumb strip scrolls via wheel", await page.locator(".cf .ig-thumbs.multi").evaluate(s => s.scrollLeft > 0));

// 5c. Suggested hashtag chips — max 10 pills, scrollable, tap #rolex → inserted into caption
check("10 hashtag pills", await page.locator(".cf .ig-chip").count() === 10);
await page.locator('.cf .ig-chip[data-tag="#rolex"]').click();
await page.waitForTimeout(200);
check("chip inserts #rolex into caption", (await page.locator(".cf .ig-cap-line .ta").textContent()).includes("#rolex"));
const chipBox = await page.locator(".cf .ig-chip-row").boundingBox();
await page.mouse.move(chipBox.x + chipBox.width / 2, chipBox.y + chipBox.height / 2);
await page.mouse.wheel(0, 300);
await page.waitForTimeout(200);
check("chip row scrolls via wheel", await page.locator(".cf .ig-chip-row").evaluate(s => s.scrollLeft > 0));
check("Add audio / Tag people removed", await page.locator(".cf .ig-rows .ig-row").count() === 4);

// 5d. Option rows open real panes
await page.locator('.cf .ig-row[data-pane="price"]').click();
await page.waitForTimeout(350);
check("price pane opens", await page.locator(".cf .cf-pane.open").isVisible());
await page.locator('.cf .cf-pane .cf-f[data-f="price"]').fill("420000");
check("price formats digits", await page.locator('.cf .cf-pane .cf-f[data-f="price"]').evaluate(i => i.value === "420,000"));
await page.locator(".cf .cf-pane .pane-done").click();
await page.waitForTimeout(350);
check("price val on row", (await page.locator('.cf .ig-row[data-pane="price"] .val').textContent()).includes("420,000"));

await page.locator('.cf .ig-row[data-pane="cond"]').click();
await page.waitForTimeout(350);
await page.locator('.cf .cond-opt:not(.box-opt)[data-v="Like New"]').click();
await page.waitForTimeout(200);
check("condition pick keeps pane open", await page.locator(".cf .cf-pane.open").isVisible());
await page.locator('.cf .cond-opt.box-opt[data-v="Full set — box & papers"]').click();
await page.waitForTimeout(200);
check("box option selectable after condition", await page.locator('.cf .cond-opt.box-opt[data-v="Full set — box & papers"]').evaluate(el => el.classList.contains("on")));
await page.locator('.cf .cond-opt.box-opt[data-v="Box only"]').click();
await page.waitForTimeout(200);
check("box options are single-select", await page.locator(".cf .cond-opt.box-opt.on").count() === 1 && await page.locator('.cf .cond-opt.box-opt[data-v="Box only"]').evaluate(el => el.classList.contains("on")));
await page.locator(".cf .cf-pane .pane-done").click();
await page.waitForTimeout(350);
check("condition val on row", (await page.locator('.cf .ig-row[data-pane="cond"] .val').textContent()).includes("Like New"));

await page.locator('.cf .ig-row[data-pane="spec"]').click();
await page.waitForTimeout(350);
check("watch details has full spec fields", await page.locator(".cf .cf-pane .cf-f").count() === 22);
await page.locator('.cf .cf-pane .cf-f[data-f="brand"]').fill("Rolex");
await page.locator('.cf .cf-pane .cf-f[data-f="model"]').fill("Submariner Date");
await page.locator(".cf .cf-pane .pane-done").click();
await page.waitForTimeout(350);
check("spec val on row", (await page.locator('.cf .ig-row[data-pane="spec"] .val').textContent()).includes("Rolex"));

await page.locator('.cf .ig-row[data-pane="loc"]').click();
await page.waitForTimeout(350);
check("location pane has suggestions", await page.locator(".cf .loc-opt").count() === 8);
await page.locator('.cf .loc-opt[data-v="Siam Paragon"]').click();
await page.waitForTimeout(350);
check("location row shows picked place + km", (await page.locator('.cf .ig-row[data-pane="loc"] .lab2').textContent()).includes("Siam Paragon") && (await page.locator('.cf .ig-row[data-pane="loc"] .lab2 .sub').textContent()).includes("km"));
check("location note shown", (await page.locator(".cf .row-note").textContent()).includes("location you tag"));
await page.screenshot({ path: `${OUT}/4d-location-picked.png` });
await page.locator(".cf .loc-x").click();
await page.waitForTimeout(250);
check("X clears location", (await page.locator('.cf .ig-row[data-pane="loc"]').textContent()).includes("Add location"));
await page.locator('.cf .ig-row[data-pane="loc"]').click();
await page.waitForTimeout(300);
await page.locator('.cf .loc-opt[data-v="Siam Paragon"]').click();
await page.waitForTimeout(300);

await page.locator('.cf .ig-row[data-pane="more"]').click();
await page.waitForTimeout(350);
check("more-options has sections", await page.locator(".cf .pane-sec").count() === 2);
check("Selling section removed", (await page.locator(".cf .cf-pane .pane-body").textContent()).includes("Allow offers") === false);
await page.locator('.cf .pane-sw[data-f="noComments"]').click();
check("more-options toggle works", await page.locator('.cf .pane-sw[data-f="noComments"]').evaluate(el => el.classList.contains("on")));
// toggles share one visual language across the app (composer .sw vs settings .tg-sw)
const swColors = await page.evaluate(() => {
  const scr = document.querySelector(".screen"), cf = scr.querySelector(".cf");
  const mk = (cls, host) => { const el = document.createElement("span"); el.className = cls; host.appendChild(el); return el; };
  const [a, b, c, d] = [mk("sw on", cf), mk("tg-sw on", scr), mk("sw", cf), mk("tg-sw", scr)];
  const r = [a, b, c, d].map(el => getComputedStyle(el).backgroundColor);
  [a, b, c, d].forEach(el => el.remove());
  return r;
});
check("toggles same on/off colors", swColors[0] === swColors[1] && swColors[2] === swColors[3] && swColors[0] === "rgb(200, 33, 43)");
await page.locator('.cf .aud-opt[data-v="followers"]').click();
await page.waitForTimeout(200);
check("audience radio selects followers", await page.locator('.cf .aud-opt[data-v="followers"]').evaluate(el => el.classList.contains("on")));
await page.screenshot({ path: `${OUT}/4c-more-options.png` });
await page.locator(".cf .cf-pane .pane-done").click();
await page.waitForTimeout(350);
check("pane closed back to caption", await page.locator(".cf .cf-pane.open").count() === 0);
check("audience val on more row", (await page.locator('.cf .ig-row[data-pane="more"] .val').textContent()).includes("Followers only"));

// 6. Back to picker then forward again (draft kept)
await page.locator(".cf-back2").click();
await page.waitForTimeout(350);
check("back returns to picker", await page.locator(".cf .ig-grid").isVisible());
await page.locator(".cf-next").click();
await page.waitForTimeout(350);

// 7. Type caption + Post → feed refreshes with new post on top
await page.locator(".cf .ig-cap-line .ta").fill("Test post from flow — Rolex Sub full set #rolex 📩");
await page.locator(".cf-share").click();
await page.waitForTimeout(600);
check("composer closed", !(await page.locator(".screen").evaluate(el => el.classList.contains("sub-open"))));
const firstSeller = await page.locator(".feed-scroll .post .who .name").first().textContent();
const firstTime = await page.locator(".feed-scroll .post .post-time").first().textContent();
check("new post on top (mycollection / Just now)", firstSeller.trim() === "mycollection" && firstTime.includes("Just now"));
check("post carries location", (await page.locator(".feed-scroll .post .post-head .sub-line").first().textContent()).includes("Siam Paragon"));
check("post carries price (sale)", (await page.locator(".feed-scroll .post").first().innerHTML()).includes("THB 420,000"));
check("post has spec groups", await page.evaluate(() => POSTS[0].specGroups.length === 3 && POSTS[0].specGroups[0].rows.some(r => r[0] === "Brand" && r[1] === "Rolex")));
check("price & data source auto rows", await page.evaluate(() => {
  const g = POSTS[0].specGroups.find(g => g.title === "Price & Data Source");
  const keys = (g?.rows || []).map(r => r[0]);
  return ["Asking Price", "Estimated Market Price", "Last Price Update", "Data Source"].every(k => keys.includes(k))
    && g.rows.find(r => r[0] === "Estimated Market Price")[1].includes("THB")
    && g.rows.find(r => r[0] === "Data Source")[1] === "TukDaeng Market Data";
}));
check("noComments hides comment btn", await page.locator(".feed-scroll .post").first().locator(".comment-btn").count() === 0);
check("0 views hidden on new post", await page.locator(".feed-scroll .post").first().locator(".views-stat").count() === 0);
check("0 likes hides liked-by row", await page.locator(".feed-scroll .post").first().locator(".liked-by").count() === 0);
check("new post has details toggle", await page.locator(".feed-scroll .post").first().locator(".details-toggle").count() === 1);
check("caption hashtag is blue tag", await page.locator(".feed-scroll .post").first().locator(".igd-tag").count() > 0);
check("toast shown", await page.locator(".sc-toast.show").count() === 1);
await page.screenshot({ path: `${OUT}/5-feed-after-post.png` });

// 7b. more → details affordance, then hashtag → search results
await page.locator(".feed-scroll .post").first().locator(".more-link").click();
await page.waitForTimeout(250);
check("more reveals details toggle", await page.locator(".feed-scroll .post").first().locator(".details-toggle").isVisible());
await page.locator(".feed-scroll .post").first().locator(".details-toggle").click();
await page.waitForTimeout(350);
check("details body shows specs", (await page.locator(".feed-scroll .post").first().locator(".details-body").textContent()).includes("Rolex"));
const detailsTxt = await page.locator(".feed-scroll .post").first().locator(".details-body").textContent();
check("unfilled spec fields show N/A", detailsTxt.includes("N/A") && detailsTxt.includes("Calibre") && detailsTxt.includes("Service History"));
await page.screenshot({ path: `${OUT}/5b-post-details.png` });
await page.locator(".feed-scroll .post").first().locator(".cap-full .igd-tag").click();
await page.waitForTimeout(450);
check("tag tap opens search results", (await page.locator(".page-sub .sr-qv").textContent()).includes("#rolex"));
check("tag results list posts", await page.locator(".page-sub .xp-tile").count() > 0);
await page.screenshot({ path: `${OUT}/5c-tag-search.png` });
// Tags tab — IG-style tag rows (# circle icon + "N posts")
await page.locator('.page-sub .sr-tab[data-tab="tags"]').click();
await page.waitForTimeout(300);
check("tags tab lists tag rows", await page.locator(".page-sub .ac-row .tag-ic").count() > 0);
check("tag row shows post count", (await page.locator(".page-sub .ac-row .ac-who .d").first().textContent()).includes("post"));
await page.screenshot({ path: `${OUT}/5e-tags-tab.png` });
await page.locator(".page-sub .ac-row").first().click();
await page.waitForTimeout(350);
check("tag row → results for that tag", (await page.locator(".page-sub .sr-qv").textContent()).startsWith("#"));
await page.locator(".page-sub .sub-back").click();
await page.waitForTimeout(350);
check("back from results → explore landing", await page.locator(".page-sub .sr-fake").isVisible());
await page.locator(".page-sub .sub-back").click();
await page.waitForTimeout(350);
check("back from search to feed", !(await page.locator(".screen").evaluate(el => el.classList.contains("sub-open"))));

// 7c. Minimal post (no metadata) — zero stats all hidden, no details toggle
await page.locator('[data-flow="create"]').click();
await page.waitForTimeout(400);
await page.locator('.cf .ig-grid .cell[data-i="6"]').click();
await page.locator(".cf-next").click();
await page.waitForTimeout(400);
await page.locator(".cf .ig-cap-line .ta").fill("minimal post no meta");
await page.locator(".cf-share").click();
await page.waitForTimeout(600);
check("minimal post on top", (await page.locator(".feed-scroll .post .who .name").first().textContent()).trim() === "mycollection");
check("short caption → no more link", await page.locator(".feed-scroll .post").first().locator(".more-link").count() === 0);
check("no meta → no details toggle", await page.locator(".feed-scroll .post").first().locator(".details-toggle").count() === 0);
check("0 comments → icon w/o count", await page.locator(".feed-scroll .post").first().locator(".comment-btn").count() === 1 && await page.locator(".feed-scroll .post").first().locator(".comment-btn span").count() === 0);
check("0 views → no views-stat", await page.locator(".feed-scroll .post").first().locator(".views-stat").count() === 0);
check("0 likes → no liked-by", await page.locator(".feed-scroll .post").first().locator(".liked-by").count() === 0);
await page.screenshot({ path: `${OUT}/5d-minimal-post.png` });

// 8. Reopen + → X with draft → discard dialog → Discard
await page.locator('[data-flow="create"]').click();
await page.waitForTimeout(400);
await page.locator('.cf .ig-grid .cell[data-i="4"]').click();
await page.locator(".cf-x").click();
await page.waitForTimeout(300);
check("discard dialog shown", await page.locator(".screen").evaluate(el => el.classList.contains("dialog-open")));
await page.screenshot({ path: `${OUT}/6-discard.png` });
await page.locator(".dlg-discard-go").click();
await page.waitForTimeout(300);
check("discard closes composer", !(await page.locator(".screen").evaluate(el => el.classList.contains("sub-open"))));

// 9. Comment sheet still works (regression)
await page.locator(".feed-scroll .post").nth(2).locator(".comment-btn").click();
await page.waitForTimeout(400);
check("comment sheet opens", await page.locator(".screen").evaluate(el => el.classList.contains("comments-open")));
await page.screenshot({ path: `${OUT}/7-comments.png` });

// 10. Post-tab Recents mixes photos + clips; multi-select works across types
await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.locator('[data-flow="create"]').click();
await page.waitForTimeout(500);
check("post grid mixes video cells", await page.locator(".cf .ig-grid:not(.clips) .cell .dur").count() === 5);
await page.locator("[data-selmode]").click();
await page.waitForTimeout(250);
await page.locator('.cf .ig-grid .cell[data-i="0"]').click();   // photo
await page.locator('.cf .ig-grid .cell[data-i="2"]').click();   // video 0:12
await page.waitForTimeout(250);
const mixOrd = await page.locator(".cf .ig-grid .radio.on").allTextContents();
check("mixed photo+video multi-select", JSON.stringify(mixOrd) === JSON.stringify(["1", "2"]));
await page.screenshot({ path: `${OUT}/8a-mixed-picker.png` });
await page.locator(".cf-next").click();
await page.waitForTimeout(450);
check("mixed draft → 2 thumbs, video has dur badge",
  await page.locator(".cf .cf-step2 .ig-thumb").count() === 2
  && (await page.locator(".cf .cf-step2 .ig-thumb .dur").textContent()).includes("0:12"));
// clip thumb in a MIXED draft must open the playable clip viewer, not the photo zoom
await page.locator(".cf .cf-step2 .ig-thumb.clip img").click();
await page.waitForTimeout(350);
check("mixed clip thumb opens clip viewer", await page.locator(".cf .ig-zoom.is-clip.open").isVisible());
check("clip viewer shows full duration", (await page.locator(".cf .ig-zoom .dur").textContent()).includes("0:12"));
await page.locator(".cf .ig-zoom img").click();
await page.waitForTimeout(300);
check("mixed clip viewer plays", await page.locator(".cf .ig-zoom.is-clip").evaluate(el => el.classList.contains("playing")));
await page.waitForTimeout(1100);
check("mixed clip countdown runs", !(await page.locator(".cf .ig-zoom .dur").textContent()).includes("0:12"));
// swipe right → photo item → viewer switches back to plain photo mode
let mz = await page.locator(".cf .ig-zoom img").boundingBox();
await page.mouse.move(mz.x + 60, mz.y + mz.height / 2);
await page.mouse.down();
await page.mouse.move(mz.x + 60 + 160, mz.y + mz.height / 2, { steps: 6 });
await page.mouse.up();
await page.waitForTimeout(300);
check("swipe to photo → photo zoom mode", await page.locator(".cf .ig-zoom.open:not(.is-clip)").isVisible()
  && await page.locator(".cf .ig-zoom").evaluate(z => +z.dataset.i === 0));
// swipe left → back onto the clip → playable mode again (fresh countdown, paused)
mz = await page.locator(".cf .ig-zoom img").boundingBox();
await page.mouse.move(mz.x + mz.width - 60, mz.y + mz.height / 2);
await page.mouse.down();
await page.mouse.move(mz.x + mz.width - 60 - 160, mz.y + mz.height / 2, { steps: 6 });
await page.mouse.up();
await page.waitForTimeout(300);
check("swipe back to clip → clip viewer mode", await page.locator(".cf .ig-zoom.is-clip.open").isVisible());
check("clip viewer paused on re-entry", await page.locator(".cf .ig-zoom.is-clip").evaluate(el => !el.classList.contains("playing")));
await page.screenshot({ path: `${OUT}/8a2-mixed-clip-viewer.png` });
await page.locator(".cf .ig-zoom").click({ position: { x: 12, y: 12 } });
await page.waitForTimeout(300);
check("mixed viewer backdrop closes", await page.locator(".cf .ig-zoom.open").count() === 0);
check("caption still open after mixed viewer", await page.locator(".cf.cap-open .cf-step2").isVisible());
// discard the mixed draft before continuing
await page.locator(".cf-back2").click();
await page.waitForTimeout(300);
await page.locator(".cf-x").click();
await page.waitForTimeout(300);
await page.locator(".dlg-discard-go").click();
await page.waitForTimeout(300);

// 11. Clip flow — Clip tab → single-select video → full preview → caption → feed
await page.locator('[data-flow="create"]').click();
await page.waitForTimeout(500);
await page.locator('.cf .ig-tab[data-ctab="clip"]').click();
await page.waitForTimeout(350);
check("clip tab becomes active", await page.locator('.cf .ig-tab[data-ctab="clip"]').evaluate(el => el.classList.contains("on")));
check("clip grid renders video cells w/ duration", await page.locator(".cf .ig-grid.clips .cell .dur").count() === 12);
check("no multi-select Select button in clip tab", await page.locator(".cf [data-selmode]").count() === 0);
check("clip hero empty state", (await page.locator(".cf [data-hero] .add-tile").textContent()).includes("Select a clip"));
check("Next still disabled w/o clip", await page.locator(".cf-next").evaluate(el => el.classList.contains("off")));
await page.screenshot({ path: `${OUT}/8-clip-picker.png` });

// single-select: tap clip 0 → tap clip 2 replaces it
await page.locator('.cf .ig-grid.clips .cell[data-i="0"]').click();
await page.waitForTimeout(250);
check("clip select → hero preview w/ play glyph", await page.locator(".cf [data-hero] .clip-play").isVisible());
check("clip hero shows duration", (await page.locator(".cf [data-hero] .dur").textContent()).includes("0:12"));
await page.locator('.cf .ig-grid.clips .cell[data-i="2"]').click();
await page.waitForTimeout(250);
check("clip single-select (only last picked)", await page.locator(".cf .ig-grid.clips .cell.sel").count() === 1
  && await page.locator('.cf .ig-grid.clips .cell[data-i="2"]').evaluate(el => el.classList.contains("sel")));
await page.screenshot({ path: `${OUT}/8b-clip-selected.png` });

// Next → full-screen preview: play/pause toggle + duration + progress bar
await page.locator(".cf-next").click();
await page.waitForTimeout(450);
check("clip preview layer opens", await page.locator(".cf.pv-open .cf-clipv").isVisible());
check("preview shows duration badge", (await page.locator(".cf-clipv .clip-stage .dur").textContent()).includes("0:31"));
check("preview has progress bar", await page.locator(".cf-clipv .prog i").count() === 1);
await page.locator(".cf-clipv .clip-stage").click();
await page.waitForTimeout(250);
check("tap stage plays clip", await page.locator(".cf .cf-clipv").evaluate(el => el.classList.contains("playing")));
await page.waitForTimeout(1200);
check("duration counts down while playing", !(await page.locator(".cf-clipv .clip-stage .dur").textContent()).includes("0:31"));
check("progress bar advances", await page.locator(".cf-clipv .prog i").evaluate(el => parseFloat(el.style.width) > 0));
await page.screenshot({ path: `${OUT}/8c-clip-preview.png` });
await page.locator(".cf-clipv .clip-stage").click();
await page.waitForTimeout(250);
check("tap stage again pauses", !(await page.locator(".cf .cf-clipv").evaluate(el => el.classList.contains("playing"))));
check("countdown holds when paused", await page.locator(".cf-clipv .clip-stage .dur").evaluate(async el => {
  const t = el.textContent; await new Promise(r => setTimeout(r, 400)); return el.textContent === t;
}));

// preview back → picker keeps the clip draft
await page.locator(".cf-pv-back").click();
await page.waitForTimeout(350);
check("preview back → picker", await page.locator(".cf .ig-grid.clips").isVisible());
check("clip draft kept", await page.locator('.cf .ig-grid.clips .cell[data-i="2"]').evaluate(el => el.classList.contains("sel")));
await page.locator(".cf-next").click();
await page.waitForTimeout(350);
await page.locator(".cf-pv-next").click();
await page.waitForTimeout(450);

// caption step — clip keeps the normal thumb look, tap opens the big viewer like photos
check("clip caption step open", await page.locator(".cf.cap-open .cf-step2").isVisible());
check("caption title is New clip", (await page.locator(".cf .cf-step2 .cf-head .t").textContent()).includes("New clip"));
check("clip shows as normal thumb w/ duration", await page.locator(".cf .cf-step2 .ig-thumb.clip").isVisible()
  && (await page.locator(".cf .cf-step2 .ig-thumb .dur").textContent()).includes("0:3"));
check("composer rows reused", await page.locator(".cf .ig-rows .ig-row").count() === 4);
await page.screenshot({ path: `${OUT}/8d-clip-caption.png` });
// tap thumb → big viewer w/ play + countdown (no page navigation)
await page.locator(".cf .cf-step2 .ig-thumb.clip img").click();
await page.waitForTimeout(350);
check("clip thumb opens big viewer", await page.locator(".cf .ig-zoom.is-clip.open").isVisible());
await page.locator(".cf .ig-zoom img").click();
await page.waitForTimeout(300);
check("tap viewer plays clip", await page.locator(".cf .ig-zoom.is-clip").evaluate(el => el.classList.contains("playing")));
await page.waitForTimeout(1100);
check("viewer countdown runs", !(await page.locator(".cf .ig-zoom .dur").textContent()).includes("0:31"));
await page.screenshot({ path: `${OUT}/8d2-clip-viewer.png` });
await page.locator(".cf .ig-zoom").click({ position: { x: 12, y: 12 } });
await page.waitForTimeout(300);
check("viewer backdrop tap closes", await page.locator(".cf .ig-zoom.open").count() === 0);
check("caption still open after viewer", await page.locator(".cf.cap-open .cf-step2").isVisible());

// caption back → preview again (picker → preview → caption nav)
await page.locator(".cf-back2").click();
await page.waitForTimeout(350);
check("caption back → clip preview", await page.locator(".cf.pv-open").count() === 1 && await page.locator(".cf.cap-open").count() === 0);
await page.locator(".cf-pv-next").click();
await page.waitForTimeout(400);

// panes reused — set price, type caption, share → clip post lands on feed
await page.locator('.cf .ig-row[data-pane="price"]').click();
await page.waitForTimeout(350);
await page.locator('.cf .cf-pane .cf-f[data-f="price"]').fill("185000");
await page.locator(".cf .cf-pane .pane-done").click();
await page.waitForTimeout(350);
check("price pane reused in clip", (await page.locator('.cf .ig-row[data-pane="price"] .val').textContent()).includes("185,000"));
await page.locator(".cf .ig-cap-line .ta").fill("Quick look at this one 🎥 #breguet");
await page.locator(".cf-share").click();
await page.waitForTimeout(600);
check("composer closed after clip share", !(await page.locator(".screen").evaluate(el => el.classList.contains("sub-open"))));
const clipPost = page.locator(".feed-scroll .post").first();
check("clip post on top (mycollection)", (await clipPost.locator(".who .name").textContent()).trim() === "mycollection");
check("clip badge w/ duration on feed", (await clipPost.locator(".post-photo .clip-badge").textContent()).includes("0:31"));
check("clip badge has play icon", await clipPost.locator(".post-photo .clip-badge svg").count() === 1);
check("clip post keeps price", (await clipPost.innerHTML()).includes("THB 185,000"));
check("clip toast", (await page.locator(".sc-toast").textContent()).includes("Clip shared"));
// clip posts autoplay while in view on the feed — badge counts down + progress runs, pause when scrolled past
await page.waitForTimeout(500);
check("feed clip autoplays in view", await clipPost.locator(".post-photo.clip-ph.playing").count() === 1);
const feedDur1 = await clipPost.locator(".clip-badge").textContent();
await page.waitForTimeout(1300);
check("feed clip badge counts down", (await clipPost.locator(".clip-badge").textContent()) !== feedDur1);
check("feed clip progress bar runs", await clipPost.locator(".prog i").evaluate(el => parseFloat(el.style.width) > 0));
await page.screenshot({ path: `${OUT}/8e-feed-clip.png` });
await page.locator(".feed-scroll").first().evaluate(el => el.scrollBy(0, 1600));
await page.waitForTimeout(400);
check("clip pauses when scrolled past", await clipPost.locator(".post-photo.playing").count() === 0);
await page.locator(".feed-scroll").first().evaluate(el => el.scrollTo(0, 0));
await page.waitForTimeout(500);
check("clip resumes on scroll back", await clipPost.locator(".post-photo.playing").count() === 1);

// clip discard dialog reuses the post draft dialog wording
await page.locator('[data-flow="create"]').click();
await page.waitForTimeout(400);
await page.locator('.cf .ig-tab[data-ctab="clip"]').click();
await page.waitForTimeout(300);
await page.locator('.cf .ig-grid.clips .cell[data-i="4"]').click();
await page.locator(".cf-x").click();
await page.waitForTimeout(300);
check("clip discard dialog", (await page.locator(".dlg .dlg-q").textContent()).includes("Discard clip"));
await page.screenshot({ path: `${OUT}/8f-clip-discard.png` });
await page.locator(".dlg-discard-go").click();
await page.waitForTimeout(300);
check("discard clip closes composer", !(await page.locator(".screen").evaluate(el => el.classList.contains("sub-open"))));

// post tab regression — reopening defaults to Post picker w/ Select button
await page.locator('[data-flow="create"]').click();
await page.waitForTimeout(400);
check("default tab is Post", await page.locator('.cf .ig-tab[data-ctab="post"]').evaluate(el => el.classList.contains("on")));
check("post picker keeps Select btn", await page.locator(".cf [data-selmode]").count() === 1);
await page.locator(".cf-x").click();
await page.waitForTimeout(300);

// 12. Single video picked via Post tab → inline player in caption, clip badge on feed
await page.locator('[data-flow="create"]').click();
await page.waitForTimeout(400);
await page.locator('.cf .ig-grid .cell[data-i="5"]').click();   // video 0:08
await page.waitForTimeout(250);
check("post-tab video hero has play glyph", await page.locator(".cf [data-hero] .clip-play").isVisible());
await page.locator(".cf-next").click();
await page.waitForTimeout(450);
check("video-only draft → clip thumb w/ dur", await page.locator(".cf .cf-step2 .ig-thumb.clip").isVisible()
  && (await page.locator(".cf .cf-step2 .ig-thumb .dur").textContent()).includes("0:08"));
check("title stays New post", (await page.locator(".cf .cf-step2 .cf-head .t").textContent()).includes("New post"));
// thumb tap opens playable viewer too
await page.locator(".cf .cf-step2 .ig-thumb.clip img").click();
await page.waitForTimeout(300);
check("post-tab video thumb opens viewer", await page.locator(".cf .ig-zoom.is-clip.open").isVisible());
await page.locator(".cf .ig-zoom").click({ position: { x: 12, y: 12 } });
await page.waitForTimeout(250);
await page.locator(".cf .ig-cap-line .ta").fill("video only via post tab");
await page.locator(".cf-share").click();
await page.waitForTimeout(600);
const vidPost = page.locator(".feed-scroll .post").first();
check("video post gets clip badge", (await vidPost.locator(".post-photo .clip-badge").textContent()).includes("0:08"));
await page.screenshot({ path: `${OUT}/8g-post-video.png` });

await browser.close();
console.log(`DONE — ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
