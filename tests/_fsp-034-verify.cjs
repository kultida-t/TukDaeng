// FSP-034 verify — H1 comment count sync, H2 sheet variant strip, H3 waLoad dedupe
// H1: โพสต์/ลบคอมเมนต์แล้ว badge บน feed card + detail page ต้องเปลี่ยนทันที (สร้างตอน 0→1, ลบตอน →0)
// H2: manual open paths ต้อง strip variant เหมือน openSheet — wl/ps ค้างแล้ว comments หด
// H3: waLoad push โดยไม่ clear → sign-in ซ้ำเห็น watch alert ซ้ำ
// run: node tests/_fsp-034-verify.cjs
const { chromium } = require("@playwright/test");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "Prototypes");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".json": "application/json", ".woff2": "font/woff2" };
const srv = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
  fs.readFile(p.endsWith("/") ? p + "index.html" : p, (e, d) => {
    if (e) { res.writeHead(404); res.end("nf"); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" });
    res.end(d);
  });
});

let pass = 0, fail = 0;
const findings = [];
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log(`PASS  ${name}`); }
  else { fail++; findings.push(`${name} ${extra}`); console.log(`FAIL  ${name} ${extra}`); }
}

(async () => {
  await new Promise(r => srv.listen(8138, r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 440, height: 956 } });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("http://localhost:8138/fo-flow/index.html");
  await page.waitForTimeout(900);

  // ===== T1: H1 — comment count sync บน feed card =====
  {
    const r = await page.evaluate(`(() => {
      const scr = document.querySelector(".screen");
      const art = scr.querySelector(".feed-scroll .post[data-pid]") || scr.querySelector(".post[data-pid]");
      const p = findPost(art.dataset.pid);
      scr.dataset.cmtPid = p.id;
      openSheet(scr, "nt", "comments-open", commentsHTML(p));
      const before = p.comments;
      submitComment(scr, "count check");
      const badge = art.querySelector(".comment-btn .comment-count");
      const rows = scr.querySelectorAll(".comment-sheet .c-row").length;
      scr._t1art = art.dataset.pid;
      return { before, after: p.comments, badge: badge ? badge.textContent : null, rows };
    })()`);
    check("T1 โพสต์คอมเมนต์ → badge บน feed card +1 ทันที", r.after === r.before + 1 && r.badge === String(r.after), JSON.stringify(r));
    check("T1b sheet re-render มีคอมเมนต์ใหม่ใน list", r.rows > 0, `rows=${r.rows}`);
  }

  // ===== T2: H1 — badge บน detail page sync พร้อมกัน =====
  {
    const r = await page.evaluate(`(() => {
      const scr = document.querySelector(".screen");
      const p = findPost(scr._t1art);
      openPostDetail(scr, p);
      const dBadge0 = scr.querySelector(".page-detail .comment-btn .comment-count");
      const before = p.comments;
      const dBadge0Text = dBadge0 ? dBadge0.textContent : null;
      submitComment(scr, "count check 2");
      const dBadge = scr.querySelector(".page-detail .comment-btn .comment-count");
      const fBadge = scr.querySelector('.feed-scroll .post[data-pid="' + p.id + '"] .comment-btn .comment-count, .post[data-pid="' + p.id + '"] .comment-btn .comment-count');
      return { before, after: p.comments, dBadge0: dBadge0Text, dBadge: dBadge ? dBadge.textContent : null, fBadge: fBadge ? fBadge.textContent : null };
    })()`);
    check("T2 badge บน detail page มีตั้งแต่ render + โพสต์แล้ว +1 ทั้ง detail/feed",
      r.dBadge0 === String(r.before) && r.dBadge === String(r.after) && r.fBadge === String(r.after), JSON.stringify(r));
  }

  // ===== T3: H1 — 0→1 สร้าง span ใหม่, ลบ→0 เอา span ออก (ผ่านปุ่มลบจริง) =====
  {
    const r = await page.evaluate(`(() => {
      const scr = document.querySelector(".screen");
      const p = findPost(scr._t1art);
      p.comments = 0; COMMENTS[p.id] = [];
      openPostDetail(scr, p); /* re-render: ไม่มี badge */
      const none = !scr.querySelector(".page-detail .comment-count");
      scr.dataset.cmtPid = p.id;
      openSheet(scr, "nt", "comments-open", commentsHTML(p));
      submitComment(scr, "first comment");
      const made = scr.querySelector(".page-detail .comment-btn .comment-count");
      const cid = commentsFor(p).at(-1).id;
      openDlg(scr, delCommentDlgHTML(false, p.id, cid, ""));
      scr.querySelector(".dlg-delcomment-go").click();
      const goneFeed = !scr.querySelector('.post[data-pid="' + p.id + '"] .comment-count');
      const goneDetail = !scr.querySelector(".page-detail .comment-count");
      return { none, made: made ? made.textContent : null, afterDel: p.comments, goneFeed, goneDetail };
    })()`);
    check("T3a comments=0 render → ไม่มี badge; โพสต์แรก → badge เกิดใหม่ = 1", r.none && r.made === "1", JSON.stringify(r));
    check("T3b ลบคอมเมนต์สุดท้ายผ่านปุ่มลบจริง → count=0 และ badge หายทั้ง feed/detail", r.afterDel === 0 && r.goneFeed && r.goneDetail, JSON.stringify(r));
  }

  // ===== T4: H2 — เปิด wishlist (wl) แล้วปิด → เปิด comments ต้องไม่หด/ไม่ค้าง wl =====
  {
    const r = await page.evaluate(`(() => {
      const scr = document.querySelector(".screen");
      const p = findPost(scr._t1art);
      openPostDetail(scr, p);
      scr.querySelector(".page-detail .wl-btn").click();      /* wl sheet เปิดจริง */
      const openedWl = scr.querySelector(".comment-sheet").classList.contains("wl");
      closeTopLayer(scr);                                      /* ปิด sheet — variant ค้างตามจริง */
      scr.querySelector(".page-detail .comment-btn").click();  /* เปิด comments */
      const cs = scr.querySelector(".comment-sheet");
      const stale = SHEET_VARIANTS.filter(v => v !== "nt" && cs.classList.contains(v));
      const ratio = cs.offsetHeight / scr.offsetHeight;
      return { openedWl, stale, ratio: +ratio.toFixed(2), open: scr.classList.contains("comments-open"), title: (cs.querySelector(".sheet-title") || {}).textContent || "" };
    })()`);
    check("T4 wishlist→comments: ไม่มี variant ค้าง + sheet สูงปกติ (ไม่หด)",
      r.openedWl && r.stale.length === 0 && r.open && r.ratio > 0.5 && r.title !== "", JSON.stringify(r));
  }

  // ===== T5: H2 — ps caption sheet ค้าง → เปิด comments ต้อง strip =====
  {
    const r = await page.evaluate(`(() => {
      const scr = document.querySelector(".screen");
      const cs = scr.querySelector(".comment-sheet");
      const art = scr.querySelector('.post[data-pid="' + scr._t1art + '"]');
      cs.classList.add("ps", "wl", "sv"); /* จำลองค้างหลาย variant */
      art.querySelector(".comment-btn").click();
      const stale = SHEET_VARIANTS.filter(v => v !== "nt" && cs.classList.contains(v));
      return { stale, cls: cs.className };
    })()`);
    check("T5 ps/wl/sv ค้าง → comment-btn strip หมด เหลือเฉพาะ nt", r.stale.length === 0, JSON.stringify(r));
  }

  // ===== T6: H2 — strip เหมือนกันใน pm menu / pv-add / unfollow paths =====
  {
    const r = await page.evaluate(`(() => {
      const scr = document.querySelector(".screen");
      const cs = scr.querySelector(".comment-sheet");
      const out = {};
      /* pm menu (post "...") */
      cs.className = "comment-sheet wl ps sv";
      scr.querySelector('.post[data-pid="' + scr._t1art + '"] .post-head .more, .post[data-pid="' + scr._t1art + '"] .pm-btn').click();
      out.pm = { stale: SHEET_VARIANTS.filter(v => v !== "pm" && cs.classList.contains(v)), ok: cs.classList.contains("pm") && scr.classList.contains("pm-open") };
      scr.classList.remove("pm-open");
      /* pv-add "Add comment…" — inject เข้า post จริง */
      cs.className = "comment-sheet wl ps";
      const pvAdd = document.createElement("div"); pvAdd.className = "pv-add";
      scr.querySelector('.post[data-pid="' + scr._t1art + '"]').appendChild(pvAdd);
      pvAdd.click();
      out.pvAdd = { stale: SHEET_VARIANTS.filter(v => v !== "nt" && cs.classList.contains(v)), ok: cs.classList.contains("nt") && scr.classList.contains("comments-open") };
      pvAdd.remove();
      /* unfollow sheet จาก follow-btn */
      const p = findPost(scr._t1art); p.following = true;
      cs.className = "comment-sheet wl sv ps";
      const fb = document.createElement("button"); fb.className = "follow-btn";
      scr.querySelector('.post[data-pid="' + p.id + '"]').appendChild(fb);
      fb.click();
      out.uf = { stale: SHEET_VARIANTS.filter(v => v !== "uf" && cs.classList.contains(v)), ok: cs.classList.contains("uf") && scr.classList.contains("unfollow-open") };
      p.following = false; fb.remove();
      closeTopLayer(scr);
      return out;
    })()`);
    check("T6a pm menu strip ครบ เหลือแค่ pm", r.pm.ok && r.pm.stale.length === 0, JSON.stringify(r.pm));
    check("T6b pv-add strip ครบ เหลือแค่ nt", r.pvAdd.ok && r.pvAdd.stale.length === 0, JSON.stringify(r.pvAdd));
    check("T6c unfollow strip ครบ เหลือแค่ uf", r.uf.ok && r.uf.stale.length === 0, JSON.stringify(r.uf));
  }

  // ===== T7: H3 — waLoad ซ้ำ / sign-in ซ้ำไม่เห็น alert ซ้ำ =====
  {
    const r = await page.evaluate(`(() => {
      localStorage.setItem("fo_walerts", JSON.stringify({ seq: 3, list: [
        { id: "wa1", name: "a", source: "search", criteria: [], matchMode: "all", on: true },
        { id: "wa2", name: "b", source: "post", criteria: [], matchMode: "all", on: true }
      ] }));
      WATCH_ALERTS.length = 0;
      waLoad(); waLoad();
      const after2 = WATCH_ALERTS.length;
      state.session = "guest"; applySessionData();
      const afterGuest = WATCH_ALERTS.length;
      state.session = "member"; applySessionData(); applySessionData();
      const afterRelogin = WATCH_ALERTS.length;
      const ids = WATCH_ALERTS.map(a => a.id);
      return { after2, afterGuest, afterRelogin, ids, dupes: ids.length - new Set(ids).size };
    })()`);
    check("T7a waLoad() ซ้ำ → list ไม่เบิ้ล (2 ไม่ใช่ 4)", r.after2 === 2, JSON.stringify(r));
    check("T7b sign-out→sign-in ซ้ำ → ไม่มี alert ซ้ำ", r.afterGuest === 0 && r.afterRelogin === 2 && r.dupes === 0, JSON.stringify(r));
  }

  // ===== T8: pv-post preview ไม่ emit photo dots — เหลือแค่เลข counter (manual QA feedback) =====
  {
    const r = await page.evaluate(`(() => {
      const p = POSTS.find(x => x.photos && x.photos.length > 1);
      const html = pvPostHTML(p);
      return { dots: html.includes("pv-dots"), counter: html.includes("photo-counter") };
    })()`);
    check("T8 pv-post: ไม่มี dots เหลือแค่เลข n/N บนรูป", !r.dots && r.counter, JSON.stringify(r));
  }

  // ===== GLOBAL =====
  check("GLOBAL ไม่มี page error", errors.length === 0, errors.join(";"));

  console.log(`\n===== ${pass} pass / ${fail} fail =====`);
  if (findings.length) { console.log("FAILURES:"); findings.forEach(f => console.log(" - " + f)); }
  await browser.close();
  srv.close();
  process.exit(fail ? 1 : 0);
})();
