import { chromium } from "playwright";
import { pathToFileURL } from "url";

const FILE_URL = pathToFileURL("d:/TukDaeng/Prototypes/fo-flow/index.html").href;
const MODE = process.argv[2] || "audit"; /* audit = list English leaks in TH ; verify = live-switch checks */
const browser = await chromium.launch();
let failed = 0;
const check = (d, ok) => { console.log(`${ok ? "PASS" : "FAIL"}: ${d}`); if (!ok) failed++; };

const SUBS = ["settings", "about_account", "change_pwd", "del_account", "lang", "notif_settings", "help", "privacy", "terms", "about_app",
  "favorites", "muted", "blocked", "prefs", "sensitive", "theme", "alerts", "board", "boardsearch", "boardall", "chat", "chatcfg", "walerts",
  "saved", "archive", "wishlist", "interested", "ni", "report", "search", "sfilter", "recents", "create", "pedit", "portfolio", "soldhist"];

const LEAK_JS = `(() => {
  const out = new Set();
  const scr = document.querySelector(".screen");
  const w = document.createTreeWalker(scr, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    const p = n.parentElement;
    if (!p || p.closest("script,style,[data-user],.statusbar,.wordmark,svg")) continue;
    const t = n.nodeValue.trim();
    if (!t || /[\\u0E00-\\u0E7F]/.test(t)) continue;
    if (!/[A-Za-z]{3,}/.test(t)) continue;
    out.add(t.slice(0, 80));
  }
  scr.querySelectorAll("[placeholder],[title],[aria-label]").forEach(e => {
    for (const a of ["placeholder", "title", "aria-label"]) {
      const v = e.getAttribute(a);
      if (v && /[A-Za-z]{3,}/.test(v) && !/[\\u0E00-\\u0E7F]/.test(v)) out.add("@" + a + ": " + v.slice(0, 60));
    }
  });
  return [...out];
})()`;

const ctx = await browser.newContext({ viewport: { width: 440, height: 956 } });
const page = await ctx.newPage();
page.on("pageerror", e => console.log("PAGEERROR", e.message));
await page.addInitScript(() => localStorage.setItem("fo_lang", "th"));
await page.goto(FILE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

if (MODE === "audit") {
  let base = null;
  const report = async (label, fn, arg) => {
    await page.evaluate(fn, arg);
    await page.waitForTimeout(150);
    let leaks = await page.evaluate(LEAK_JS);
    if (base) leaks = leaks.filter(l => !base.has(l)); else base = new Set(leaks);
    console.log(`\n## ${label} (${leaks.length})`);
    leaks.forEach(l => console.log("  - " + l));
  };
  await report("feed", () => { });
  for (const s of SUBS) {
    await report("sub:" + s, name => {
      const scr = document.querySelector(".screen");
      try { openSub(scr, name); } catch (e) { console.log("ERR", e.message); }
    }, s);
    await page.evaluate(() => { const scr = document.querySelector(".screen"); scr.classList.remove("sub-open"); scr._subStack = []; });
  }
  const dyn = await page.evaluate(() => {
    const C = chatInit();
    const threads = (C.threads || []).map(t => t.id);
    const items = chItemGroups().map(g => g.item.id);
    const arts = [...document.querySelectorAll("[data-art]")].map(e => e.dataset.art);
    return { threads: threads.slice(0, 2), items: items.slice(0, 1), arts, pf: PF_ASSETS.slice(0, 1).map(a => a.id), sold: PF_SOLD.slice(0, 1).map(a => a.id) };
  });
  console.log("DYN", JSON.stringify(dyn));
  const DSUBS = ["boardart:" + ("b1"), ...dyn.items.map(i => "chatitem:" + i), ...dyn.threads.flatMap(t => ["chatroom:" + t, "chsettings:" + t, "chmedia:" + t]),
    "profile:king.mr.fox", "profile:the watch", "profile:Watch 777", "pfollow:king.mr.fox:followers", "pfollow:king.mr.fox:following", "pfollow:the watch:followers",
    "about:the watch", "about:king.mr.fox", ...dyn.pf.map(i => "pfasset:" + i), ...dyn.sold.map(i => "sold:" + i), "report:pick:the watch", "report:user", "report:post"];
  for (const s of DSUBS) {
    await report("dsub:" + s, name => {
      const scr = document.querySelector(".screen");
      try { openSub(scr, name); } catch (e) { console.log("ERR", e.message); }
    }, s);
    await page.evaluate(() => { const scr = document.querySelector(".screen"); scr.classList.remove("sub-open"); scr._subStack = []; });
  }
  for (const id of ["p1", "p2", "p3", "p6", "p7"]) {
    await report("detail:" + id, pid => {
      const scr = document.querySelector(".screen");
      const p = POSTS.find(x => x.id === pid) || POSTS[0];
      openPostDetail(scr, p);
    }, id);
    await page.evaluate(() => document.querySelector(".screen").classList.remove("detail-open"));
  }
  await report("postviewer", () => {
    const scr = document.querySelector(".screen"); const p = POSTS[0];
    openPostViewer(scr, [p, POSTS[1]], p.id, 0, false, "Posts", "king.mr.fox");
  });
  await report("postviewer-feed", () => {
    const scr = document.querySelector(".screen"); const p = POSTS[0];
    openPostViewer(scr, [p, POSTS[1]], p.id, 0, true, "Saved");
  });
}
if (MODE === "verify") {
  const ctx2 = await browser.newContext({ viewport: { width: 440, height: 956 } });
  const pg = await ctx2.newPage();
  pg.on("pageerror", e => { console.log("PAGEERROR", e.message); failed++; });
  await pg.goto(FILE_URL, { waitUntil: "networkidle" });
  await pg.waitForTimeout(400);
  const txt = sel => pg.evaluate(s => [...document.querySelectorAll(s)].map(e => e.textContent.trim()).join("|"), sel);
  const hasThai = s => /[\u0E00-\u0E7F]/.test(s);
  const spec = ".page-detail .spec-row .l, .page-detail .spec-row .v, .page-detail .detail-h";
  const layers = {
    detail: () => { const s = document.querySelector(".screen"); openPostDetail(s, POSTS.find(p => p.id === "p2")); },
    viewer: () => { const s = document.querySelector(".screen"); const p = POSTS.find(x => x.id === "p2"); openPostViewer(s, [p, POSTS[0]], p.id, 0, true, "Saved"); },
    settings: () => { const s = document.querySelector(".screen"); openSub(s, "terms"); },
  };
  for (const [name, open] of Object.entries(layers)) {
    await pg.evaluate(() => { const s = document.querySelector(".screen"); s.classList.remove("detail-open", "pv-open", "sub-open"); setLang("en"); });
    await pg.evaluate(open);
    await pg.waitForTimeout(200);
    const enBefore = await pg.evaluate(() => document.querySelector(".screen").innerText);
    await pg.evaluate(() => setLang("th"));
    await pg.waitForTimeout(200);
    const th = await pg.evaluate(() => document.querySelector(".screen").innerText);
    if (name === "detail") {
      const t = await txt(spec);
      check("detail: spec rows switched to TH live", hasThai(t) && !/Watch Specifications|Case Diameter|Stainless Steel|Movement Type/.test(t));
    }
    check(`${name}: layer content changed after setLang(th) without reload`, th !== enBefore);
    check(`${name}: <html lang> = th`, await pg.evaluate(() => document.documentElement.lang === "th"));
    check(`${name}: feed behind layer re-rendered in TH`, await pg.evaluate(() => /[\u0E00-\u0E7F]/.test(document.querySelector(".feed-list").innerHTML)));
    await pg.evaluate(() => setLang("en"));
    await pg.waitForTimeout(200);
    const en = await pg.evaluate(() => document.querySelector(".screen").innerText);
    check(`${name}: TH -> EN restores original text (no Thai left in spec/legal)`, name === "settings" ? !hasThai(en.split("Terms")[1] || "") : (name === "detail" ? !hasThai(await txt(spec)) : true));
    check(`${name}: EN identical to first EN render`, en === enBefore);
  }
  /* persistence: reload keeps TH */
  await pg.evaluate(() => setLang("th"));
  await pg.reload({ waitUntil: "networkidle" });
  await pg.waitForTimeout(400);
  check("reload keeps TH (html lang + translated feed nav)", await pg.evaluate(() => document.documentElement.lang === "th" && /ฟีด/.test(document.querySelector(".bottom-nav").innerText)));
  await pg.evaluate(() => { const s = document.querySelector(".screen"); openPostDetail(s, POSTS.find(p => p.id === "p2")); });
  await pg.waitForTimeout(200);
  check("after reload: detail specs in TH on first open", !/Watch Specifications|Case Diameter/.test(await txt(spec)));
  await pg.screenshot({ path: "d:/TukDaeng/Prototypes/screenshots/task-I18N-001/detail-th.png" });
}
await browser.close();
process.exit(failed ? 1 : 0);
