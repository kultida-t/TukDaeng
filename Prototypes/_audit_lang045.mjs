import { chromium } from "playwright";
import { pathToFileURL } from "url";

/* LANG-045 audit — sweep the main surfaces in TH mode and report visible text/attrs
   that still read English. User-authored content (usernames, captions, comments,
   chat text, bios, collection/alert names, spec values, prices, brand names) is
   skipped by selector; the leftover list is a candidate set for DEC-19 fixes. */
const FILE_URL = pathToFileURL("d:/TukDaeng/Prototypes/fo-flow/index.html").href;

const SKIP_SEL = [
  "script", "style", "noscript", "svg",
  /* user-authored / data values (DEC-19 keeps these in original language) */
  ".cap-short", ".cap-full", ".caption", ".c-text", ".ch-prev", ".ch-m-col", ".bio", ".pf-bio",
  "[data-pf-user]", ".pfl-name", ".pf-name", ".ch-name", ".who", ".c-head .n", ".ch-title",
  ".spec-row .v", ".spec-tile .v", ".det-spec .v", ".pf-card .v",
  ".post-time", ".ch-time", ".al-time", ".time", ".ago",
  ".price", ".price-footer", ".quiet-price", ".pv-price", ".det-price", ".pfo-num",
  ".views-stat", ".photo-counter", ".pv-count", ".lk-n", ".nav-badge", ".dur", ".prog",
  ".bd-title", ".bd-excerpt", ".bd-body", ".bd-art-body", ".bd-card",
].join(",");

const collector = `(() => {
  const SKIP = ${JSON.stringify(SKIP_SEL)};
  const hasLat = s => /[A-Za-z]{2,}/.test(s);
  const hasTh = s => /[\\u0E00-\\u0E7F]/.test(s);
  const visible = el => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const sel = el => el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\\s+/).slice(0, 3).join(".") : "");
  const out = new Map();
  const add = (txt, el, kind) => {
    const t = txt.trim().replace(/\\s+/g, " ");
    if (!t || !hasLat(t) || hasTh(t)) return;
    if (/^[\\d.,:;!?()\\[\\]{}\\-–—+*/<>=@#%&|~^$€£¥฿\\s]+$/.test(t)) return; /* numbers/punct only */
    if (!out.has(t)) out.set(t, kind + " <" + sel(el) + ">");
  };
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    const p = n.parentElement;
    if (!p || p.closest(SKIP) || !visible(p)) continue;
    add(n.nodeValue, p, "txt");
  }
  document.querySelectorAll("[placeholder],[title],[aria-label]").forEach(el => {
    if (el.closest(SKIP) || !visible(el)) return;
    for (const a of ["placeholder", "title", "aria-label"]) {
      const v = el.getAttribute(a);
      if (v) add(v, el, "@" + a);
    }
  });
  return [...out.entries()];
})()`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 440, height: 956 } });
const page = await ctx.newPage();
page.on("pageerror", e => console.log("PAGEERROR:", e.message));

await page.goto(FILE_URL, { waitUntil: "networkidle" });
await page.evaluate(() => {
  localStorage.setItem("fo_onboarded", "1");
  localStorage.setItem("fo_lang", "th");
  localStorage.setItem("fo_session", "member");
});
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(700);

const seen = new Map();
async function sweep(label, fn) {
  try { if (fn) await fn(); } catch (e) { console.log(`!! ${label} nav failed:`, e.message); }
  await page.waitForTimeout(450);
  const rows = await page.evaluate(collector);
  let fresh = 0;
  for (const [t, ctx2] of rows) if (!seen.has(t)) { seen.set(t, `${label} ${ctx2}`); fresh++; }
  console.log(`--- ${label}: ${rows.length} visible-EN (${fresh} new)`);
}

const scr = `document.querySelector("#stage .screen")`;

await sweep("feed", async () => {
  await page.evaluate(`${''}
    const fs = ${scr}.querySelector(".feed-scroll");
    if (fs) { fs.scrollTop = fs.scrollHeight; }`);
  await page.waitForTimeout(300);
  await page.evaluate(`{ const fs = ${scr}.querySelector(".feed-scroll"); if (fs) fs.scrollTop = 0; }`);
});

await sweep("comments", async () => {
  await page.evaluate(`${scr}.querySelector(".post .comment-btn")?.click()`);
});
await page.evaluate(`${scr}.querySelector(".sheet-backdrop")?.click()`);

await sweep("post-menu", async () => {
  await page.evaluate(`${scr}.querySelector(".post .post-head .more")?.click()`);
});
await page.evaluate(`${scr}.querySelector(".sheet-backdrop")?.click()`);

await sweep("save-sheet", async () => {
  await page.evaluate(`${scr}.querySelector(".post .save-btn")?.click()`);
});
await page.evaluate(`${scr}.querySelector(".sheet-backdrop")?.click()`);

await sweep("share-sheet", async () => {
  await page.evaluate(`${scr}.querySelector(".post .share-btn")?.click()`);
});
await page.evaluate(`${scr}.querySelector(".sheet-backdrop")?.click()`);

await sweep("post-detail", async () => {
  await page.evaluate(`{ const s = ${scr}; openPostDetail(s, findPost("p1")); }`);
});
await sweep("post-detail-open-details", async () => {
  await page.evaluate(`${scr}.querySelector(".page-detail .details-toggle")?.click()`);
});
await page.evaluate(`{ const s = ${scr}; s.classList.remove("detail-open"); }`);

await sweep("search-landing", async () => {
  await page.evaluate(`openSub(${scr}, "search")`);
});
await sweep("search-results", async () => {
  await page.evaluate(`{
    const s = ${scr}, S = srchState(s);
    S.q = "rolex"; S.mode = "results"; S.tab = "foryou"; renderSub(s);
  }`);
});
await sweep("search-filters", async () => {
  await page.evaluate(`${scr}.querySelector('[data-sub="sfilter"]')?.click()`);
});
await sweep("search-noresult", async () => {
  await page.evaluate(`{
    const s = ${scr};
    s._subStack = ["search"]; const S = srchState(s);
    S.q = "zzzzqqqq"; S.mode = "results"; renderSub(s);
  }`);
});
await page.evaluate(`{ const s = ${scr}; s._subStack = []; s.classList.remove("sub-open"); }`);

await sweep("post-viewer", async () => {
  await page.evaluate(`{ const s = ${scr}; openPostViewer(s, POSTS.filter(p=>p.price), "p1", 0, false, "Results"); }`);
});
await page.evaluate(`{ ${scr}.classList.remove("pv-open"); }`);

await sweep("alerts", async () => {
  await page.evaluate(`openSub(${scr}, "alerts")`);
});
await page.evaluate(`{ const s = ${scr}; s._subStack = []; s.classList.remove("sub-open"); }`);

await sweep("board", async () => {
  await page.evaluate(`openSub(${scr}, "board")`);
});
await sweep("board-article", async () => {
  await page.evaluate(`${scr}.querySelector(".bd-card, .bd-row, [data-bdopen]")?.click()`);
});
await page.evaluate(`{ const s = ${scr}; s._subStack = []; s.classList.remove("sub-open"); }`);

await sweep("chat-list", async () => {
  await page.evaluate(`openSub(${scr}, "chat")`);
});
await sweep("chat-room", async () => {
  await page.evaluate(`{ const s = ${scr}; const t = chatInit().threads[0]; if (t) openSub(s, "chatroom:" + t.id); }`);
});
await sweep("chat-attach", async () => {
  await page.evaluate(`${scr}.querySelector('[data-chgo="attach"]')?.click()`);
});
await page.evaluate(`${scr}.querySelector(".ch-attach-sheet-backdrop")?.click()`);
await page.evaluate(`{ const s = ${scr}; s._subStack = []; s.classList.remove("sub-open"); }`);

await sweep("profile-own", async () => {
  await page.evaluate(`openSub(${scr}, "profile:" + ((state.user && state.user.username) || "king.mr.fox"))`);
});
await sweep("profile-other", async () => {
  await page.evaluate(`{ const s = ${scr}; s._subStack = []; s.classList.remove("sub-open"); pushSub(s, "profile:the watch"); }`);
});
await page.evaluate(`{ const s = ${scr}; s._subStack = []; s.classList.remove("sub-open"); }`);

await sweep("settings", async () => {
  await page.evaluate(`pushSub(${scr}, "settings")`);
});
for (const sub of ["about_account", "saved", "wishlist", "archive", "walerts", "favorites", "muted", "blocked", "prefs", "lang", "theme", "notif_settings", "help", "cookies", "privacy", "terms", "about_app", "change_pwd", "del_account", "sensitive", "interested", "ni"]) {
  await sweep("settings/" + sub, async () => {
    await page.evaluate(`{ const s = ${scr}; s._subStack = ["settings"]; pushSub(s, "${sub}"); }`);
  });
}
await page.evaluate(`{ const s = ${scr}; s._subStack = []; s.classList.remove("sub-open"); }`);

await sweep("portfolio", async () => {
  await page.evaluate(`pushSub(${scr}, "portfolio")`);
});
await sweep("soldhist", async () => {
  await page.evaluate(`{ const s = ${scr}; s._subStack = []; s.classList.remove("sub-open"); pushSub(s, "soldhist"); }`);
});
await page.evaluate(`{ const s = ${scr}; s._subStack = []; s.classList.remove("sub-open"); }`);

await sweep("create", async () => {
  await page.evaluate(`openSub(${scr}, "create")`);
});
await page.evaluate(`{ const s = ${scr}; s._subStack = []; s.classList.remove("sub-open"); }`);

await sweep("likes-sheet", async () => {
  await page.evaluate(`${scr}.querySelector(".post .liked-by")?.click()`);
});
await page.evaluate(`${scr}.querySelector(".sheet-backdrop")?.click()`);

await sweep("wa-sheet", async () => {
  await page.evaluate(`${scr}.querySelector(".post .wa-btn, .post [class*='wa'], .post-head .icon-btn")?.click()`);
});
await page.evaluate(`${scr}.querySelector(".sheet-backdrop")?.click()`);

await sweep("edit-profile", async () => {
  await page.evaluate(`{ const s = ${scr}; s._subStack = []; s.classList.remove("sub-open"); pushSub(s, "profile:" + ((state.user && state.user.username) || "king.mr.fox")); }`);
  await page.evaluate(`${scr}.querySelector(".pf-edit")?.click()`);
});
await page.evaluate(`{ const s = ${scr}; s._subStack = []; s.classList.remove("sub-open"); }`);

await sweep("followers-list", async () => {
  await page.evaluate(`{ const s = ${scr}; pushSub(s, "profile:the watch"); s.querySelector(".pf-foll")?.click(); }`);
});
await page.evaluate(`{ const s = ${scr}; s._subStack = []; s.classList.remove("sub-open"); }`);

await sweep("report-flow", async () => {
  await page.evaluate(`{ const s = ${scr}; s.dataset.rpUser = "the watch"; s.dataset.rpTargetType = "user"; pushSub(s, "report:pick"); }`);
});
await page.evaluate(`{ const s = ${scr}; s._subStack = []; s.classList.remove("sub-open"); }`);

await sweep("chat-settings", async () => {
  await page.evaluate(`{ const s = ${scr}; pushSub(s, "chsettings:x"); }`);
});
await page.evaluate(`{ const s = ${scr}; s._subStack = []; s.classList.remove("sub-open"); }`);

await sweep("member-gate-ob", async () => {
  await page.evaluate(`{ setSession("guest"); obGate(); }`);
});
await page.evaluate(`{ const s = ${scr}; const ob = document.querySelector(".ob"); if (ob) ob.remove(); OB.on = false; OB.gate = false; setSession("member"); }`);

await sweep("unavailable", async () => {
  await page.evaluate(`{ const s = ${scr}; pushSub(s, "al_unavail"); }`);
});
await page.evaluate(`{ const s = ${scr}; s._subStack = []; s.classList.remove("sub-open"); }`);

/* second pass — deeper surfaces */
await sweep("sort-sheet", async () => {
  await page.evaluate(`{ const s = ${scr}; openSub(s, "search"); const S = srchState(s); S.q = "rolex"; S.mode = "results"; renderSub(s); s.querySelector(".so-btn, [class*='sort'], .sr-sort")?.click(); }`);
});
await page.evaluate(`${scr}.querySelector(".sheet-backdrop")?.click()`);

await sweep("alert-row-detail", async () => {
  await page.evaluate(`{ const s = ${scr}; s._subStack = []; s.classList.remove("sub-open"); openSub(s, "alerts"); s.querySelector(".al-row")?.click(); }`);
});
await page.evaluate(`{ const s = ${scr}; s._subStack = []; s.classList.remove("sub-open"); }`);

await sweep("delcomment-dlg", async () => {
  await page.evaluate(`{ const s = ${scr}; const post = findPost("p1"); openSheet(s, "comments", "comments-open", commentsHTML(post)); openDlg(s, delCommentDlgHTML(true, "p1", "p1-c1", "")); }`);
});
await page.evaluate(`{ const s = ${scr}; s.classList.remove("dialog-open", "comments-open"); }`);

await sweep("block-sheet", async () => {
  await page.evaluate(`{ const s = ${scr}; openSheet(s, "pm", "pm-open", blkSheetHTML("the watch")); }`);
});
await page.evaluate(`{ const s = ${scr}; s.classList.remove("pm-open"); }`);

await sweep("unfollow-sheet", async () => {
  await page.evaluate(`{ const s = ${scr}; openSheet(s, "uf", "unfollow-open", ufSheetHTML ? ufSheetHTML("the watch") : ""); }`);
});
await page.evaluate(`{ const s = ${scr}; s.classList.remove("unfollow-open"); }`);

await sweep("likes-detail", async () => {
  await page.evaluate(`{ const s = ${scr}; const post = findPost("p1"); openSheet(s, "lk", "likes-open", likesSheetHTML(post)); }`);
});
await page.evaluate(`{ const s = ${scr}; s.classList.remove("likes-open"); }`);

await sweep("wa-create", async () => {
  await page.evaluate(`{ const s = ${scr}; openSheet(s, "wa", "wa-open", waSheetHTML(s)); }`);
});
await page.evaluate(`{ const s = ${scr}; s.classList.remove("wa-open"); }`);

await sweep("sold-record", async () => {
  await page.evaluate(`{ const s = ${scr}; pushSub(s, "soldhist"); const r = s.querySelector("[data-sub^='sold'], .sold-row, .shl-row"); if (r) r.click(); }`);
});
await page.evaluate(`{ const s = ${scr}; s._subStack = []; s.classList.remove("sub-open"); }`);

await sweep("alerts-paged", async () => {
  await page.evaluate(`{ const s = ${scr}; openSub(s, "alerts"); const sc = s.querySelector(".al-scroll"); if (sc) { sc.scrollTop = sc.scrollHeight; } }`);
  await page.waitForTimeout(400);
});

console.log("\n===== UNIQUE EN LEFTOVERS =====");
[...seen.entries()].sort().forEach(([t, ctx2]) => console.log(`${t}\t${ctx2}`));
console.log("total unique:", seen.size);
await browser.close();
