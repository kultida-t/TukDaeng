// FSP-039 verify — Low consistency findings triage (fo-flow)
// A21 priceless vs price bound · A22 self out of Accounts · A23 pv rail hideCounts ·
// A24 lk-n on own posts (all surfaces + 0→1 create) · A26 board liked per-account ·
// A27 pf-fby hidden when following · A29 watch "Just now" localize ·
// A30 chat titles / pvPostSheet / injected Follow / More+Clear / stub toasts ·
// A31 dead code cull (report-chat, .set-btn, avov qr, isTag, I18N_WD, data-i18n-skip)
// run: node tests/_fsp-039-verify.cjs
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

/* static source asserts — dead code must be gone from the file, not just unreachable */
const SRC = fs.readFileSync(path.join(ROOT, "fo-flow", "index.html"), "utf8");

(async () => {
  await new Promise(r => srv.listen(8142, r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 440, height: 956 } });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.addInitScript(() => {
    localStorage.setItem("fo_onboarded", "1");
    localStorage.setItem("fo_session", "member");
    localStorage.setItem("fo_toured", "1");
    localStorage.setItem("fo_toured_guest", "1");
  });
  await page.goto("http://localhost:8142/fo-flow/index.html");
  await page.waitForTimeout(900);

  // ===== T1: A21 — priceless post fails an active price bound, passes with none =====
  {
    const r = await page.evaluate(`(() => {
      const base = POSTS.find(p => p.price) || POSTS[0];
      const f = { brand: [], model: [], cond: [], ref: [], year: [], csz: [], move: [], dial: [], strap: [], deliv: [], pmin: "", pmax: "" };
      const priceless = { ...base, price: null };
      const cheap = { ...base, price: "฿100,000" };
      return {
        noBound: matchFilters(priceless, f),
        boundMax: matchFilters(priceless, { ...f, pmax: "500000" }),
        boundMin: matchFilters(priceless, { ...f, pmin: "200000" }),
        pricedUnder: matchFilters(cheap, { ...f, pmax: "500000" }),
        pricedOver: matchFilters(cheap, { ...f, pmin: "200000" }),
      };
    })()`);
    check("T1 priceless post filtered out by any price bound (kept when no bound)",
      r.noBound === true && r.boundMax === false && r.boundMin === false && r.pricedUnder === true && r.pricedOver === false, JSON.stringify(r));
  }

  // ===== T2: A22 — own account never lands in search Accounts (no self-follow) =====
  {
    const r = await page.evaluate(`(() => {
      POSTS.push({ seller: CP_ME.name, avatar: CP_ME.avatar, photos: [""] });
      const self = resultSellers({ q: "king" }).map(p => p.seller);
      const other = POSTS.find(p => p.seller !== CP_ME.name).seller;
      const others = resultSellers({ q: other.slice(0, 4) }).map(p => p.seller);
      POSTS.pop();
      return { self, other, others };
    })()`);
    check("T2 resultSellers excludes CP_ME (self gone, other sellers still match)",
      !r.self.includes("king.mr.fox") && r.others.includes(r.other), JSON.stringify(r));
  }

  // ===== T3: A23 — pv rail Likes label respects hideCounts like every other surface =====
  {
    const r = await page.evaluate(`(() => {
      const p = POSTS.find(p => p.likes && p.likedBy);
      return {
        normal: pvPostHTML(p).includes("pv-lbl"),
        hidden: pvPostHTML({ ...p, hideCounts: true }).includes("pv-lbl"),
      };
    })()`);
    check("T3 pv rail Likes shows normally, hides when hideCounts", r.normal === true && r.hidden === false, JSON.stringify(r));
  }

  // ===== T4: A24 — lk-n like count on own posts: feed card, pv rail, pfp card, both detail paths =====
  {
    const r = await page.evaluate(`(() => {
      const base = POSTS.find(p => p.seller !== CP_ME.name);
      const own = { ...base, seller: CP_ME.name, likes: 5 };
      const other = { ...base, likes: 5 };
      const dl = state.dl; state.dl = "dl1";
      const dlHtml = detailHTML(own);
      state.dl = dl;
      return {
        feedOwn: postCard(own, state.variant).includes("lk-n"),
        pvOwn: pvPostHTML(own).includes("lk-n"),
        pfpOwn: pfpPostHTML(own).includes("lk-n"),
        igOwn: igDetailHTML(own).includes("lk-n"),
        dlOwn: dlHtml.includes("lk-n"),
        feedOther: postCard(other, state.variant).includes("lk-n"),
        igOther: igDetailHTML(other).includes("lk-n"),
      };
    })()`);
    check("T4 lk-n on own post across all surfaces, never on others'",
      r.feedOwn && r.pvOwn && r.pfpOwn && r.igOwn && r.dlOwn && r.feedOther === false && r.igOther === false, JSON.stringify(r));
  }

  // ===== T4b: A24 — liking an own post at 0 likes creates lk-n (0→1 transition) =====
  {
    const r = await page.evaluate(`(async () => {
      const scr = document.querySelector("#stage .screen");
      POSTS.unshift({ ...POSTS.find(p => p.seller !== CP_ME.name), id: "own-0like", seller: CP_ME.name, likes: 0, liked: false, likedBy: null });
      const post = POSTS[0];
      openPostDetail(scr, post);
      await new Promise(r => setTimeout(r, 60));
      scr.querySelector(".page-detail .like-btn").click(); /* first .like-btn in scr is a feed card behind the detail — scope to the detail page */
      await new Promise(r => setTimeout(r, 60));
      const ln = scr.querySelector(".page-detail .lk-n");
      const out = { exists: !!ln, txt: ln ? ln.textContent : null };
      scr.classList.remove("detail-open");
      POSTS.shift();
      return out;
    })()`);
    check("T4b like on own 0-like post creates lk-n=1", r.exists === true && r.txt === "1", JSON.stringify(r));
  }

  // ===== T5: A26 — board article like is per-account: guest/new never see member's, member's persists =====
  {
    const r = await page.evaluate(`(async () => {
      const scr = document.querySelector("#stage .screen");
      localStorage.removeItem("fo_bdlike:king.mr.fox");
      rpPush(scr, "boardart:" + BOARD[0].id);
      await new Promise(r => setTimeout(r, 60));
      scr.querySelector("[data-bdlike]").click();
      await new Promise(r => setTimeout(r, 60));
      const base = BD_LIKES0.get(BOARD[0].id);
      const liked = { liked: BOARD[0].liked, likes: BOARD[0].likes, stored: localStorage.getItem("fo_bdlike:king.mr.fox") };
      setSession("guest");
      await new Promise(r => setTimeout(r, 60));
      const guest = { liked: BOARD[0].liked, likes: BOARD[0].likes };
      setSession("member");
      await new Promise(r => setTimeout(r, 60));
      const back = { liked: BOARD[0].liked, likes: BOARD[0].likes };
      return { base, liked, guest, back };
    })()`);
    check("T5 board like: member liked+persisted, guest sees count (unfilled heart), back-to-member restores",
      r.liked.liked === true && r.liked.likes === r.base + 1 && r.liked.stored === '["' + "b1" + '"]'
      && r.guest.liked === false && r.guest.likes === r.base + 1
      && r.back.liked === true && r.back.likes === r.base + 1, JSON.stringify(r));
  }

  // ===== T6: A27 — pf-fby hidden on profiles we already follow, shown otherwise =====
  {
    const r = await page.evaluate(`(() => {
      const scr = document.querySelector("#stage .screen");
      /* pick by pfIsFollowed (first-post flag), not raw p.following — mock sellers can be mixed */
      const fol = POSTS.map(p => p.seller).find(n => n !== CP_ME.name && pfIsFollowed(n));
      const un = POSTS.map(p => p.seller).find(n => n !== CP_ME.name && n !== fol && !pfIsFollowed(n));
      return {
        /* profileHTML takes the key already stripped of "profile:" — caller slices it off first */
        followed: profileHTML(scr, fol).includes("pf-fby"),
        unfollowed: profileHTML(scr, un).includes("pf-fby"),
        fol, un,
      };
    })()`);
    check("T6 pf-fby: hidden when already following, shown when not",
      r.followed === false && r.unfollowed === true, JSON.stringify(r));
  }

  // ===== T7: A29 — alert-time helper localizes "Just now" =====
  {
    const r = await page.evaluate(`({
      jn: formatAlertTime("Just now", true),
      m: formatAlertTime("23m", true),
      en: formatAlertTime("Just now", false),
    })`);
    check("T7 formatAlertTime: Just now→เมื่อสักครู่, 23m→23 นาที, EN passthrough",
      r.jn === "เมื่อสักครู่" && r.m === "23 นาที" && r.en === "Just now", JSON.stringify(r));
  }

  // ===== T8: A30 — chat row titles localized EN (were Thai-only) =====
  {
    const r = await page.evaluate(`(() => {
      const html = chRowHTML({ id: "x", user: "u.user", msgs: [{ t: "hi" }], unread: 0, pinned: true, muted: true });
      return { html };
    })()`);
    check("T8 chat swipe titles EN: Unpin / Unmute / Muted",
      r.html.includes('title="Unpin"') && r.html.includes('title="Unmute"') && r.html.includes('title="Muted"'), "");
  }

  // ===== T9: A30 — chat room header titles EN (were Thai-only) =====
  {
    const r = await page.evaluate(`(() => {
      const t = { id: "x", user: "u.user", msgs: [{ t: "hi", f: "them" }], unread: 0, searching: true, roomQuery: "q" };
      return { html: chatRoomHTML ? chatRoomHTML("x") : "" };
    })()`);
    /* room render may need CHAT state — fall back to source asserts if it throws */
    const srcOk = /title="\$\{isTh \? "ล้างข้อความ" : "Clear"\}"/.test(SRC)
      && /title="\$\{isTh \? "ยกเลิก" : "Cancel"\}"/.test(SRC)
      && /title="\$\{isTh \? "ค้นหาในแชท" : "Search in chat"\}"/.test(SRC)
      && /title="\$\{isTh \? "เมนู" : "Menu"\}"/.test(SRC);
    check("T9 chat room header titles localized (clear/cancel/search/menu)", srcOk, r.html.slice(0, 120));
  }

  // ===== T10: A30 — pvPostSheet + board clear + stub toasts translate =====
  {
    const r = await page.evaluate(`(() => {
      const p = POSTS.find(p => p.seller !== CP_ME.name);
      /* comments:0 → commentsFor returns [] → the empty-state copy actually renders */
      const sheet = pvPostSheetHTML({ ...p, id: "zz-no-comm", comments: 0, commentPreview: null });
      const lang = state.lang; state.lang = "th";
      const sheetTh = pvPostSheetHTML({ ...p, id: "zz-no-comm", comments: 0, commentPreview: null });
      const bdClear = boardSearchHTML();
      state.lang = lang;
      return {
        enEmpty: sheet.includes("No comments yet"),
        enPh: sheet.includes('placeholder="Add a comment for'),
        thEmpty: sheetTh.includes("ยังไม่มีความคิดเห็น"),
        thClear: bdClear.includes('aria-label="ล้าง"'),
        enClear: boardSearchHTML().includes('aria-label="Clear"'),
        stub1: i18nTr("Not in this prototype yet", null),
        stub2: i18nTr("Chat options aren't in this prototype yet", null),
        stub3: i18nTr("Listing detail isn't in this prototype yet", null),
        cap: i18nTr("You can add up to 10 photos or clips", null),
      };
    })()`);
    check("T10 pvPostSheet TH/EN + board clear aria + stub toast dict + add-cap pattern",
      r.enEmpty && r.enPh && r.thEmpty && r.thClear && r.enClear
      && r.stub1 === "ยังไม่เปิดใช้งานในเดโมนี้"
      && r.stub2 === "ตัวเลือกแชทยังไม่เปิดใช้งานในเดโมนี้"
      && r.stub3 === "รายละเอียดสินค้ายังไม่เปิดใช้งานในเดโมนี้"
      && r.cap === "เพิ่มรูปหรือคลิปได้สูงสุด 10 รายการ", JSON.stringify(r));
  }

  // ===== T11: A31 — dead code culled (source-level) =====
  {
    check("T11a report-chat handler branch gone", !SRC.includes('a === "report-chat"'), "");
    check("T11b .set-btn gone (handler + gate + dead-zone)", !SRC.includes("set-btn"), "");
    check("T11c avov qr stub branch gone", !SRC.includes('a === "qr"'), "");
    check("T11d I18N_WD removed", !SRC.includes("I18N_WD"), "");
    check("T11e data-i18n-skip selector gone", !SRC.includes("data-i18n-skip"), "");
    check("T11f unused isTag removed", !SRC.includes("const isTag"), "");
    check("T11g injected follow-btn no longer hardcodes EN", !SRC.includes('class="follow-btn">Follow</button>`'), "");
  }

  // ===== T12: no page errors during the whole run =====
  check("T12 no page errors", errors.length === 0, errors.join(" | "));

  console.log(`\n${pass} passed, ${fail} failed`);
  if (findings.length) { console.log("--- failures ---"); findings.forEach(f => console.log(f)); }
  await browser.close();
  srv.close();
  process.exit(fail ? 1 : 0);
})();
