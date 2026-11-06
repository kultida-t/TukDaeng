// FSP-038 verify — Medium consistency findings + DEC-61 auth verb
// A5 board article share link · A6 Ask pill in pv · A7 feedTab reset · A8 guest
// comment popover · A9 PF_EXTRA_* unmute/fav · A10 Suggested PF_EXTRA_FOL ·
// A11 snooze persist+expiry · A12 re-consent decline · A13/15 signup copy+uniq ·
// A14 created→signin prefill · A16 member coach marks · A17 device lang ·
// A18 followOnly wire · A19 TH gaps · DEC-61 Sign out
// run: node tests/_fsp-038-verify.cjs
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
  await new Promise(r => srv.listen(8141, r));
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
  await page.goto("http://localhost:8141/fo-flow/index.html");
  await page.waitForTimeout(900);

  // ===== T1: A5 — board article share carries article id + copy link = /a/{id} =====
  {
    const r = await page.evaluate(`(async () => {
      window.__copied = null;
      Object.defineProperty(navigator, "clipboard", { value: { writeText: t => { window.__copied = t; return Promise.resolve(); } }, configurable: true });
      const scr = document.querySelector("#stage .screen");
      rpPush(scr, "boardart:" + BOARD[0].id);
      await new Promise(r => setTimeout(r, 50));
      scr.querySelector("[data-bdshare]").click();
      await new Promise(r => setTimeout(r, 50));
      const kind = scr.dataset.shKind, aid = scr.dataset.shAid;
      scr.querySelector('.sh-app[data-app="copy"]').click();
      await new Promise(r => setTimeout(r, 50));
      return { kind, aid, copied: window.__copied, artId: BOARD[0].id };
    })()`);
    check("T1 article share → shKind=article + copy = https://tukdaeng.app/a/{id}",
      r.kind === "article" && r.aid === r.artId && r.copied === `https://tukdaeng.app/a/${r.artId}`, JSON.stringify(r));
  }

  // ===== T2: A6 — pv post card แสดง Ask pill ทุก non-own post (ไม่ใช่เฉพาะ sale) =====
  {
    const r = await page.evaluate(`(() => {
      const showcase = POSTS.find(p => !isOwnPost(p) && p.type !== "sale");
      const sale = POSTS.find(p => !isOwnPost(p) && p.type === "sale");
      const own = sale ? { ...sale, seller: CP_ME.name } : null; /* own posts live in PF_MINE — fabricate one */
      return {
        showcaseAsk: showcase ? pfpPostHTML(showcase).includes("ask-pill") : null,
        saleAsk: sale ? pfpPostHTML(sale).includes("ask-pill") : null,
        ownAsk: own ? pfpPostHTML(own).includes("ask-pill") : null,
      };
    })()`);
    check("T2 pv Ask pill: showcase ✓ / sale ✓ / own ✗",
      r.showcaseAsk === true && r.saleAsk === true && r.ownAsk === false, JSON.stringify(r));
  }

  // ===== T3: A7 — member sign-in reset feedTab → all =====
  {
    const r = await page.evaluate(`(() => {
      state.session = "guest"; state.feedTab = "favorites";
      setSession("member"); /* member branch path */
      return { feedTab: state.feedTab };
    })()`);
    check("T3 member sign-in → feedTab reset เป็น all", r.feedTab === "all", JSON.stringify(r));
  }

  // ===== T4: A8 — guest long-press popover เปิด → item gate =====
  {
    const r = await page.evaluate(`(async () => {
      const scr = document.querySelector("#stage .screen");
      setSession("guest"); OB.on = false; OB.gate = false; obMount();
      const p = POSTS.find(x => !x.noComments && commentsFor(x).length);
      openSheet(scr, "cm", "comments-open", commentsHTML(p));
      const row = scr.querySelector(".c-row");
      row.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, clientX: 100, clientY: 100 }));
      await new Promise(r => setTimeout(r, 30));
      const pop = scr.querySelector(".c-popover");
      const gatedBefore = OB.on && OB.gate;
      pop.querySelector(".c-pop-item").click();
      const gatedAfter = OB.on && OB.gate;
      return { pop: !!pop, gatedBefore, gatedAfter };
    })()`);
    check("T4 guest long-press: popover เปิด (ไม่ gate ตั้งแต่ trigger) → item กดแล้ว gate",
      r.pop && !r.gatedBefore && r.gatedAfter, JSON.stringify(r));
  }

  // ===== T5: A9 — Settings unmute/fav-remove ครอบ PF_EXTRA_* =====
  {
    const r = await page.evaluate(`(() => {
      const scr = document.querySelector("#stage .screen");
      setSession("member"); OB.on = false; OB.gate = false; obMount();
      PF_EXTRA_MUT.add("ghost_seller_x"); PF_EXTRA_FAV.add("ghost_seller_y");
      openSub(scr, "muted");
      scr.querySelector('.m-unmute[data-seller="ghost_seller_x"]').click();
      const mutGone = !PF_EXTRA_MUT.has("ghost_seller_x");
      openSub(scr, "favorites");
      scr.querySelector('.fav-remove[data-seller="ghost_seller_y"]').click();
      const favGone = !PF_EXTRA_FAV.has("ghost_seller_y");
      return { mutGone, favGone, pfSaved: !!localStorage.getItem("fo_pfstate:member") };
    })()`);
    check("T5 unmute/fav-remove ลบ PF_EXTRA_MUT/PF_EXTRA_FAV + persist",
      r.mutGone && r.favGone && r.pfSaved, JSON.stringify(r));
  }

  // ===== T6: A10 — Favorites Suggested แสดง PF_EXTRA_FOL =====
  {
    const r = await page.evaluate(`(() => {
      const scr = document.querySelector("#stage .screen");
      PF_EXTRA_FOL.add("followed_no_post_z");
      renderSub(scr);
      const row = scr.querySelector('.mrow[data-pf-user="followed_no_post_z"] .fav-add');
      PF_EXTRA_FOL.delete("followed_no_post_z");
      return { row: !!row };
    })()`);
    check("T6 post-less followed account โผล่ใน Suggested + ปุ่ม Add", r.row, JSON.stringify(r));
  }

  // ===== T7: A11 — snooze toggle persist + toggle-off ลบ key =====
  {
    const r = await page.evaluate(`(() => {
      const scr = document.querySelector("#stage .screen");
      localStorage.removeItem("fo_snooze"); state.snooze = false;
      openSub(scr, "prefs");
      scr.querySelector('[data-tgl="snooze"]').click();
      const onAt = +localStorage.getItem("fo_snooze");
      scr.querySelector('[data-tgl="snooze"]').click();
      const off = localStorage.getItem("fo_snooze");
      return { onAt: onAt > 0, stateOn: true, off };
    })()`);
    check("T7 snooze on → fo_snooze timestamp, off → key removed",
      r.onAt && r.off === null, JSON.stringify(r));
  }

  // ===== T7b: A11 — reload: snooze รอดจาก refresh, เกิน 30 วันหมดอายุ =====
  {
    await page.evaluate(() => localStorage.setItem("fo_snooze", String(Date.now())));
    await page.goto("http://localhost:8141/fo-flow/index.html");
    await page.waitForTimeout(600);
    const keep = await page.evaluate(() => state.snooze);
    await page.evaluate(() => localStorage.setItem("fo_snooze", String(Date.now() - 31 * 864e5)));
    await page.goto("http://localhost:8141/fo-flow/index.html");
    await page.waitForTimeout(600);
    const exp = await page.evaluate(() => ({ snooze: state.snooze, key: localStorage.getItem("fo_snooze") }));
    check("T7b snooze รอดจาก reload + เกิน 30 วันหมดอายุเอง",
      keep === true && exp.snooze === false && exp.key === null, JSON.stringify({ keep, exp }));
  }

  // ===== T8: A12 — re-consent decline: guest เห็น Exit app / member เห็น Sign out + sign out จริง =====
  {
    const r = await page.evaluate(`(async () => {
      const out = {};
      setSession("guest");
      Object.assign(OB, { on: true, recon: true, step: "consent", ver: "1.1", legal: null, declined: false, os: false });
      obMount();
      document.querySelector('.ob [data-ob="decline"]').click();
      out.guestBtn = document.querySelector('.ob [data-ob="exit"]').textContent;
      setSession("member");
      OB.on = false; obMount();
      Object.assign(OB, { on: true, recon: true, step: "consent", ver: "1.1", legal: null, declined: false, os: false });
      obMount();
      document.querySelector('.ob [data-ob="decline"]').click();
      out.memberBtn = document.querySelector('.ob [data-ob="exit"]').textContent;
      document.querySelector('.ob [data-ob="exit"]').click();
      await new Promise(r => setTimeout(r, 50));
      out.sessionAfter = state.session;
      out.memberSheet = OB.on && OB.step === "member";
      return out;
    })()`);
    check("T8 decline: guest=Exit app, member=Sign out → session guest + member sheet",
      r.guestBtn === "Exit app" && r.memberBtn === "Sign out" && r.sessionAfter === "guest" && r.memberSheet, JSON.stringify(r));
  }

  // ===== T9: A13 — signup validation canonical copy =====
  {
    const r = await page.evaluate(`(() => {
      OB.f = { name: "", email: "", pw: "", user: "", photo: "" }; OB.errs = {};
      obSignup();
      const e1 = { email: OB.errs.email, pw: OB.errs.pw };
      OB.f.email = "not-an-email"; obSignup();
      const e2 = OB.errs.email;
      return { e1, e2 };
    })()`);
    check("T9 signup: ว่าง → Enter your email./Enter your password., format ผิด → Enter a valid email address.",
      r.e1.email === "Enter your email." && r.e1.pw === "Enter your password." && r.e2 === "Enter a valid email address.", JSON.stringify(r));
  }

  // ===== T10: A14 — created → signin: email ค้าง, password ไม่ prefill =====
  {
    const r = await page.evaluate(`(() => {
      OB.f = { name: "N", email: "new@x.com", pw: "secret123", user: "u", photo: "" };
      OB.step = "created"; obDraw(); /* obLast = created */
      obGo("signin");
      return { email: OB.f.email, pw: OB.f.pw, input: document.querySelector('.ob [data-f="pw"]').value };
    })()`);
    check("T10 created→signin: email คงอยู่, pw ว่าง (form ก็ว่าง)",
      r.email === "new@x.com" && r.pw === "" && r.input === "", JSON.stringify(r));
  }

  // ===== T11: A15 — email uniqueness vs fo_account + demo =====
  {
    const r = await page.evaluate(`(() => {
      localStorage.setItem("fo_account", JSON.stringify({ email: "reg@x.com", pwH: "h", user: "reg", provider: "email" }));
      const try_ = em => { OB.f = { name: "", email: em, pw: "abcd1234", user: "", photo: "" }; OB.errs = {}; obSignup(); return OB.errs.email || ""; };
      return { demo: try_("demo@tukdaeng.com"), saved: try_("reg@x.com"), fixture: try_("taken@example.com"), free: try_("free@x.com") };
    })()`);
    check("T11 uniqueness: demo/saved/fixture → already registered; free → ผ่าน",
      /already registered/.test(r.demo) && /already registered/.test(r.saved) && /already registered/.test(r.fixture) && r.free === "", JSON.stringify(r));
  }

  // ===== T12: A16 — member sign-in → member coach marks (fo_toured); guest → fo_toured_guest =====
  {
    const r = await page.evaluate(`(async () => {
      localStorage.removeItem("fo_toured"); localStorage.removeItem("fo_toured_guest");
      document.querySelectorAll(".ob-coach").forEach(c => c.remove());
      setSession("member"); OB.on = false; obMount();
      obFinish("", true);
      await new Promise(r => setTimeout(r, 30));
      const memberCoach = !!document.querySelector(".ob-coach");
      const memberKey = localStorage.getItem("fo_toured");
      document.querySelectorAll(".ob-coach").forEach(c => c.remove());
      setSession("guest"); OB.on = true; OB.gate = true; OB.step = "member"; obMount();
      obFinish("", false); obFinish("", true);
      await new Promise(r => setTimeout(r, 30));
      const guestKey = localStorage.getItem("fo_toured_guest");
      const guestCoach = !!document.querySelector(".ob-coach");
      setSession("member");
      return { memberCoach, memberKey, guestKey, guestCoach };
    })()`);
    check("T12 member sign-in เด้ง member tour + guest path เด้ง guest tour (keys แยก)",
      r.memberCoach && r.memberKey === "1" && r.guestKey === "1" && r.guestCoach, JSON.stringify(r));
  }

  // ===== T13: A17 — device language → lang step default =====
  {
    const page2 = await browser.newPage({ viewport: { width: 440, height: 956 } });
    page2.on("pageerror", e => errors.push("p2: " + e.message));
    await page2.addInitScript(() => {
      Object.defineProperty(navigator, "language", { get: () => "th-TH" });
      localStorage.removeItem("fo_lang");
      localStorage.setItem("fo_onboarded", "1");
      localStorage.setItem("fo_session", "member");
    });
    await page2.goto("http://localhost:8141/fo-flow/index.html");
    await page2.waitForTimeout(700);
    const lang = await page2.evaluate(() => state.lang);
    await page2.close();
    check("T13 device th-TH + ไม่มี fo_lang → state.lang = th", lang === "th", lang);
  }

  // ===== T14: A18 — followOnly enforcement ผ่าน dev msg sim =====
  {
    const r = await page.evaluate(`(async () => {
      const C = chatInit(); C.cfg.followOnly = true;
      const pool = POSTS.filter(p => p.seller !== CP_ME.name && !pfIsBlocked(p.seller));
      const post = pool.find(p => !pfIsFollowed(p.seller)) || pool[0];
      const threadsBefore = C.threads.length;
      const blocked = !chIncomingAsk(post.seller, post.id);
      C.cfg.followOnly = false;
      const ok = chIncomingAsk(post.seller, post.id);
      const t = C.threads.find(x => x.user === post.seller);
      const msgBtn = !!document.getElementById("obMsg");
      return { blocked, ok, inThread: !!(t && t.msgs.length), msgBtn, threadsBefore, threadsAfter: C.threads.length };
    })()`);
    check("T14 followOnly ON → incoming ask blocked; OFF → ข้อความเข้า + #obMsg มีจริง",
      r.blocked && r.ok && r.inThread && r.msgBtn, JSON.stringify(r));
  }

  // ===== T15: A19 — TH dict keys + chat preview คุณ: =====
  {
    const r = await page.evaluate(`(() => {
      const keys = ["Collection deleted", "Messages", "Sent", "Confirm", "COLOR", "Share profile", "Add location"];
      const dict = keys.map(k => [k, i18nTr(k, null)]);
      const scr = document.querySelector("#stage .screen");
      setLang("th");
      const C = chatInit();
      const t = C.threads[0];
      t.msgs.push({ f: "me", t: "สวัสดีครับ", ...chNow(), read: false });
      openSub(scr, "chat");
      const prev = scr.querySelector(".ch-prev").textContent;
      setLang("en");
      return { dict, prev };
    })()`);
    const dictOk = r.dict.every(([k, v]) => !!v && v !== k);
    check("T15 TH gaps: dict keys 7 ตัวแปลได้ + preview 'คุณ: '",
      dictOk && r.prev.startsWith("คุณ: "), JSON.stringify(r));
  }

  // ===== T16: DEC-61 — Sign out verb บน settings row + dialog (ไม่เหลือ Log out) =====
  {
    const r = await page.evaluate(`(() => {
      const dlg = logoutDlgHTML();
      const scr = document.querySelector("#stage .screen");
      openSub(scr, "settings");
      const row = scr.querySelector(".sub-row-logout span").textContent;
      return { signQ: dlg.includes("Sign out of @"), signBtn: dlg.includes(">Sign out<"), noLog: !dlg.includes("Log out"), row };
    })()`);
    check("T16 DEC-61: dialog 'Sign out of @u?' + ปุ่ม Sign out + row Sign out",
      r.signQ && r.signBtn && r.noLog && r.row === "Sign out", JSON.stringify(r));
  }

  // ===== GLOBAL =====
  check("GLOBAL ไม่มี page error", errors.length === 0, errors.join(";"));

  console.log(`\n===== ${pass} pass / ${fail} fail =====`);
  if (findings.length) { console.log("FAILURES:"); findings.forEach(f => console.log(" - " + f)); }
  await browser.close();
  srv.close();
  process.exit(fail ? 1 : 0);
})();
