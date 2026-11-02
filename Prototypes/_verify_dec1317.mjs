import { chromium } from "playwright";
import { pathToFileURL } from "url";

/* f2f1934f verification — DEC-13 feed pagination, DEC-14/16 carousel (single tap inert,
   double-tap like + guest gate, swipe stops at ends), DEC-17 flat reply-of-reply,
   DEC-25 A10 real chat timestamps */
const FILE_URL = pathToFileURL("d:/TukDaeng/Prototypes/fo-flow/index.html").href;
const browser = await chromium.launch();
let failed = 0;
const check = (desc, ok, extra = "") => { console.log(`${ok ? "PASS" : "FAIL"}: ${desc}${extra ? " — " + extra : ""}`); if (!ok) failed++; };

const ctx = await browser.newContext({ viewport: { width: 440, height: 956 } });
const page = await ctx.newPage();
page.on("pageerror", e => console.log("PAGEERROR:", e.message));
await page.goto(FILE_URL, { waitUntil: "networkidle" });
await page.evaluate(() => { localStorage.setItem("fo_onboarded", "1"); localStorage.setItem("fo_session", "member"); });
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(700);

// ---- DEC-13: feed pagination (10/page, next page when 3 cards left) ----
const feedCounts = await page.evaluate(() => {
  const scr = document.querySelector("#stage .screen");
  const list = scr.querySelector(".feed-list");
  const initial = list.querySelectorAll(".post").length;
  const total = feedPosts(scr.dataset.variant).length;
  const fs = scr.querySelector(".feed-scroll");
  fs.scrollTop = fs.scrollHeight;
  return { initial, total };
});
await page.waitForTimeout(400);
const after = await page.evaluate(() => document.querySelector(".feed-list").querySelectorAll(".post").length);
check("DEC-13 page 1 renders 10 posts", feedCounts.initial === Math.min(10, feedCounts.total), `initial=${feedCounts.initial} total=${feedCounts.total}`);
check("DEC-13 scrolling near tail appends page 2", after > feedCounts.initial || feedCounts.total <= 10, `after=${after} initial=${feedCounts.initial} total=${feedCounts.total}`);
check("DEC-13 no end-of-list marker", await page.evaluate(() => !document.querySelector(".feed-end, .feed-list .end-marker")));

// ---- DEC-14: single tap on photo does nothing (no slide change) ----
const tapRes = await page.evaluate(async () => {
  const scr = document.querySelector("#stage .screen");
  const post = feedPosts(scr.dataset.variant).find(p => p.photos.length > 1);
  const art = [...document.querySelectorAll(".feed-list .post")].find(a => a.dataset.pid === post.id);
  const ph = art.querySelector(".post-photo");
  const i0 = +ph.dataset.i || 0;
  const r = ph.getBoundingClientRect();
  // simulate single tap on right half
  ph._tapAt = 0;
  ph.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: r.left + r.width * 0.8, clientY: r.top + 10 }));
  await new Promise(r2 => setTimeout(r2, 60));
  return { i0, i1: +ph.dataset.i || 0, pid: post.id };
});
check("DEC-14 single tap on photo does nothing", tapRes.i1 === tapRes.i0, `i0=${tapRes.i0} i1=${tapRes.i1}`);

// ---- DEC-14: double-tap likes + heart pop ----
const dblRes = await page.evaluate(async () => {
  const scr = document.querySelector("#stage .screen");
  const post = findPost("${pid}".replace("${pid}", ""));
  return null;
});
const dbl = await page.evaluate(async (pid) => {
  const scr = document.querySelector("#stage .screen");
  const post = findPost(pid);
  post.liked = false; const likes0 = post.likes;
  const art = [...document.querySelectorAll(".feed-list .post")].find(a => a.dataset.pid === pid);
  const ph = art.querySelector(".post-photo");
  const r = ph.getBoundingClientRect();
  const tap = () => ph.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: r.left + r.width * 0.8, clientY: r.top + 10 }));
  ph._tapAt = 0; tap(); await new Promise(r2 => setTimeout(r2, 80)); tap();
  await new Promise(r2 => setTimeout(r2, 120));
  return { liked: post.liked, likes: post.likes, likes0, heart: !!ph.querySelector(".dtap-heart"), btnLiked: !!art.querySelector(".like-btn.liked") };
}, tapRes.pid);
check("DEC-14 double-tap likes the post", dbl.liked === true && dbl.likes === dbl.likes0 + 1, JSON.stringify(dbl));
check("DEC-14 double-tap shows heart pop + like-btn syncs", dbl.heart === true && dbl.btnLiked === true);

// ---- DEC-14: swipe still stops at ends (no wrap) ----
const swipeRes = await page.evaluate(async () => {
  const scr = document.querySelector("#stage .screen");
  const post = feedPosts(scr.dataset.variant).find(p => p.photos.length > 1);
  const art = [...document.querySelectorAll(".feed-list .post")].find(a => a.dataset.pid === post.id);
  const ph = art.querySelector(".post-photo");
  const last = post.photos.length - 1;
  ph.dataset.i = last;
  swipe = { ph, post, dotsEl: null, x0: 300, y0: 100, dx: -200, i: last, moved: true };
  endSwipe();
  await new Promise(r => setTimeout(r, 60));
  return { i: +ph.dataset.i, last };
});
check("DEC-14 swipe at last slide does not wrap", swipeRes.i === swipeRes.last, `i=${swipeRes.i}`);

// ---- DEC-16: detail hero same rules ----
const det = await page.evaluate(async () => {
  const scr = document.querySelector("#stage .screen");
  const post = feedPosts(scr.dataset.variant).find(p => p.photos.length > 1);
  openPostDetail(scr, post);
  await new Promise(r => setTimeout(r, 100));
  const ph = scr.querySelector(".page-detail .detail-hero");
  if (!ph) return { hero: false };
  const i0 = +ph.dataset.i || 0;
  ph._tapAt = 0;
  const r = ph.getBoundingClientRect();
  ph.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: r.left + r.width * 0.8, clientY: r.top + 10 }));
  await new Promise(r2 => setTimeout(r2, 60));
  return { hero: true, i0, i1: +ph.dataset.i || 0 };
});
check("DEC-16 detail hero single tap does nothing", det.hero && det.i1 === det.i0, JSON.stringify(det));
await page.evaluate(`document.querySelector("#stage .screen").classList.remove("detail-open")`);

// ---- DEC-14 guest gate ----
const guest = await page.evaluate(async (pid) => {
  setSession("guest");
  const post = findPost(pid); post.liked = false;
  const art = [...document.querySelectorAll(".feed-list .post")].find(a => a.dataset.pid === pid);
  const ph = art.querySelector(".post-photo");
  const r = ph.getBoundingClientRect();
  const tap = () => ph.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: r.left + r.width * 0.8, clientY: r.top + 10 }));
  ph._tapAt = 0; tap(); await new Promise(r2 => setTimeout(r2, 80)); tap();
  await new Promise(r2 => setTimeout(r2, 150));
  const gated = !!document.querySelector(".ob .ob-msheet, .ob-sheet");
  document.querySelector(".ob")?.remove(); OB.on = false; OB.gate = false;
  setSession("member");
  return { liked: post.liked, gated };
}, tapRes.pid);
check("DEC-14 guest double-tap opens member gate, no like", guest.gated === true && guest.liked === false, JSON.stringify(guest));

// ---- DEC-17: reply-of-reply stays flat under root + @author ----
const reply = await page.evaluate(async () => {
  const scr = document.querySelector("#stage .screen");
  const post = findPost("p1"); /* p1 has seeded reply threads */
  const list = commentsFor(post);
  const root = list.find(c => (c.replies || []).length > 0);
  if (!root) return { seed: false };
  const r0 = root.replies.length;
  openSheet(scr, "comments", "comments-open", commentsHTML(post));
  await new Promise(r => setTimeout(r, 80));
  const cs = scr.querySelector(".comment-sheet");
  const replyRow = cs.querySelector(".c-row.reply .c-meta");
  if (!replyRow) return { seed: true, hasReplyBtn: false };
  replyRow.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await new Promise(r => setTimeout(r, 40));
  const inp = cs.querySelector(".ci-field");
  const prefilled = inp.value;
  inp.value = prefilled + "test reply";
  submitComment(scr, inp.value);
  await new Promise(r => setTimeout(r, 60));
  const last = root.replies[root.replies.length - 1];
  return { seed: true, hasReplyBtn: true, prefilled, flat: root.replies.length === r0 + 1, lastText: last.text, lastName: last.name };
});
check("DEC-17 reply rows have Reply + prefill @author", reply.hasReplyBtn === true && /^@\S+ /.test(reply.prefilled || ""), JSON.stringify(reply.prefilled));
check("DEC-17 reply-of-reply lands flat under root", reply.flat === true && /^@\S+/.test(reply.lastText || ""), `flat=${reply.flat} text=${reply.lastText}`);

// ---- DEC-25 A10: real chat timestamps ----
const t1 = await page.evaluate(() => {
  const d = new Date();
  const want = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  const t = chGet(chatInit().threads[0].id);
  const n = t.msgs.length;
  const scr = document.querySelector("#stage .screen");
  openSub(scr, "chatroom:" + t.id);
  const inp = scr.querySelector(".ch-input");
  inp.value = "timestamp check"; chSend(scr);
  const m = t.msgs[t.msgs.length - 1];
  scr._subStack = []; scr.classList.remove("sub-open");
  return { ok: t.msgs.length === n + 1 && m.at === want && m.day === "Today", at: m.at, want };
});
check("DEC-25 A10 sent message stamps real time", t1.ok, `at=${t1.at} want=${t1.want}`);

console.log(failed ? `\n${failed} FAIL` : "\nALL PASS");
await browser.close();
process.exit(failed ? 1 : 0);
