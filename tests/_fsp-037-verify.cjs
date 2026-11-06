// FSP-037 verify — High consistency findings
// A1 ATT consent persist (os:no → obLog + Personalized disabled+explanation)
// A2 chat post card = send-time snapshot (deleted post → card stays + tap toast)
// A3 board search clear-X un-hide · A4 .sr-saved guest gate
// run: node tests/_fsp-037-verify.cjs
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
  await new Promise(r => srv.listen(8140, r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 440, height: 956 } });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.addInitScript(() => {
    localStorage.setItem("fo_onboarded", "1");
    localStorage.setItem("fo_session", "member");
  });
  await page.goto("http://localhost:8140/fo-flow/index.html");
  await page.waitForTimeout(900);

  // ===== T1: A1 — ATT "Ask App Not to Track" persist ลง consent record + fo_att =====
  {
    const r = await page.evaluate(`(() => {
      localStorage.setItem("fo_consent", JSON.stringify({ terms: "1.0", privacy: "1.0", termsAt: "x", analytics: true, personalized: true, lang: "en", at: "seed" }));
      OB.opt = { analytics: true, personalized: true };
      OB.on = true; OB.gate = false; OB.step = "track"; OB.os = "track"; obMount();
      document.querySelector('.ob [data-ob="os:no"]').click(); /* Ask App Not to Track */
      const rec = JSON.parse(localStorage.getItem("fo_consent") || "null");
      return { att: localStorage.getItem("fo_att"), recP: rec && rec.personalized, optP: OB.opt.personalized, step: OB.step };
    })()`);
    check("T1 ATT deny → fo_att=denied + consent record personalized=false",
      r.att === "denied" && r.recP === false && r.optP === false, JSON.stringify(r));
  }

  // ===== T2: A1 — Settings > Privacy & cookies: Personalized disabled + explanation =====
  {
    const r = await page.evaluate(`(() => {
      const scr = document.querySelector("#stage .screen");
      openSub(scr, "cookies");
      const pg = scr.querySelector(".page-sub");
      const tgl = pg.querySelector('[data-cookie-tgl="personalized"]');
      const dis = pg.querySelector(".tg-sw.dis");
      const hint = pg.querySelector(".sub-hint");
      /* guard: fake a cookie-tgl click — ต้องไม่ flip */
      const fake = document.createElement("button");
      fake.dataset.cookieTgl = "personalized"; pg.appendChild(fake); fake.click();
      return { tgl: !!tgl, dis: !!dis, hint: hint ? hint.textContent : "", optP: OB.opt.personalized };
    })()`);
    check("T2 cookies (ATT denied): ไม่มี toggle + tg-sw.dis + hint + guard ไม่ flip",
      !r.tgl && r.dis && /Track|ติดตาม/.test(r.hint) && r.optP === false, JSON.stringify(r));
  }

  // ===== T3: A1 — cookies view ปกติเมื่อ fo_att=granted: toggle ใช้งานได้ =====
  {
    const r = await page.evaluate(`(() => {
      localStorage.setItem("fo_att", "granted");
      const scr = document.querySelector("#stage .screen");
      renderSub(scr);
      const pg = scr.querySelector(".page-sub");
      const tgl = pg.querySelector('[data-cookie-tgl="personalized"]');
      const dis = pg.querySelector(".tg-sw.dis");
      if (tgl) tgl.click();
      const rec = JSON.parse(localStorage.getItem("fo_consent") || "null");
      return { tgl: !!tgl, dis: !!dis, optP: OB.opt.personalized, recP: rec && rec.personalized };
    })()`);
    check("T3 cookies (ATT granted): toggle มี + กดแล้ว personalized=true persist",
      r.tgl && !r.dis && r.optP === true && r.recP === true, JSON.stringify(r));
  }

  // ===== T4: A2 — chat post card = snapshot: post ถูกลบการ์ดยังอยู่ + tap → toast =====
  {
    const r = await page.evaluate(`(() => {
      const scr = document.querySelector("#stage .screen");
      const post = POSTS.find(p => p.seller !== CP_ME.name && !pfIsBlocked(p.seller));
      const snapCap = post.caption, snapPid = post.id;
      chatQuickAsk(scr, post);
      const C = chatInit();
      const t = C.threads.find(x => x.msgs.some(m => m.pid === snapPid));
      const hasSnap = !!(t && t.msgs.find(m => m.pid === snapPid && m.snap && m.snap.cap === snapCap));
      POSTS.splice(POSTS.indexOf(post), 1);          /* seller ลบโพสต์ */
      rpPush(scr, "chatroom:" + t.id);               /* re-render ห้อง */
      const card = scr.querySelector(".ch-post-card");
      const capShown = card ? card.querySelector(".ch-post-card-title").textContent : "";
      card.click();                                   /* tap → toast */
      const toast = scr.querySelector(".sc-toast").textContent;
      POSTS.unshift(post);                            /* restore */
      return { hasSnap, card: !!card, capShown, snapCap, toast };
    })()`);
    check("T4 deleted post: snapshot เก็บไว้ + การ์ดยัง render + tap → toast",
      r.hasSnap && r.card && r.capShown === r.snapCap && r.toast === "Listing detail isn't in this prototype yet", JSON.stringify(r));
  }

  // ===== T5: A3 — board search clear-X โผล่เมื่อมีข้อความ/หายเมื่อว่าง =====
  {
    const r = await page.evaluate(`(() => {
      const scr = document.querySelector("#stage .screen");
      rpPush(scr, "boardsearch");
      const inp = scr.querySelector(".bd-q");
      const xvis = () => scr.querySelector("[data-bdqclear]").style.visibility;
      const out = { empty: xvis() };
      inp.value = "rolex"; inp.dispatchEvent(new Event("input", { bubbles: true }));
      out.typed = xvis();
      scr.querySelector("[data-bdqclear]").click();
      out.afterClear = xvis(); out.qAfterClear = bdQ; out.inpAfterClear = inp.value;
      const tag = scr.querySelector("[data-bdtag]");
      out.tagLabel = tag ? tag.dataset.bdtag : null;
      if (tag) tag.click();
      out.afterTag = xvis(); out.qAfterTag = bdQ;
      return out;
    })()`);
    check("T5 clear-X: hidden เมื่อว่าง → โผล่เมื่อพิมพ์ → หายหลัง clear → โผล่หลังเลือก tag",
      r.empty === "hidden" && r.typed === "" && r.afterClear === "hidden" && r.qAfterClear === "" && r.inpAfterClear === "" && (!r.tagLabel || (r.afterTag === "" && r.qAfterTag === r.tagLabel)), JSON.stringify(r));
  }

  // ===== T6: A4 — .sr-saved ผ่าน member sheet เมื่อเป็น guest =====
  {
    const r = await page.evaluate(`(() => {
      const scr = document.querySelector("#stage .screen");
      setSession("guest");
      OB.on = false; OB.gate = false;                 /* เคลียร์ state จาก T1 */
      openSub(scr, "search");
      const topBefore = (scr._subStack || []).slice(-1)[0];
      scr.querySelector(".sr-saved").click();
      const gated = OB.on && OB.gate;
      const topAfter = (scr._subStack || []).slice(-1)[0];
      /* member ยังเข้า saved ได้ปกติ */
      OB.on = false; OB.gate = false; obMount();
      setSession("member");
      scr.querySelector(".sr-saved").click();
      const memberTop = (scr._subStack || []).slice(-1)[0];
      return { topBefore, gated, topAfter, memberTop };
    })()`);
    check("T6 guest tap .sr-saved → member sheet ไม่เข้า saved; member เข้า saved ปกติ",
      r.gated && r.topAfter !== "saved" && r.memberTop === "saved", JSON.stringify(r));
  }

  // ===== T7: QA find — share→friend ต้อง landing ในห้องแชทจริง (pv overlay ปิด) + back 1 ครั้งกลับ profile =====
  {
    const r = await page.evaluate(`(async () => {
      const scr = document.querySelector("#stage .screen");
      document.querySelector('[data-navgo="profile"]').click();
      scr.querySelector(".pf-tile").click();
      await new Promise(r => setTimeout(r, 300));
      const post = POSTS.find(p => p.seller === CP_ME.name) || POSTS[0];
      scr.dataset.shPid = post.id; scr.dataset.shKind = "post";
      openSheet(scr, "sh", "share-open", shareSheetHTML());
      scr.querySelector(".sh-fr").click();          /* click path จริงผ่าน delegated handler */
      await new Promise(r => setTimeout(r, 300));
      const pvAfterSend = scr.classList.contains("pv-open");
      const stackAfterSend = scr._subStack.slice();
      scr.querySelector(".page-sub .sub-back, .page-sub .ch-back, .sub-back").click();
      await new Promise(r => setTimeout(r, 350));
      return { pvAfterSend, stackAfterSend, stackAfterBack: scr._subStack.slice(), pvAfterBack: scr.classList.contains("pv-open") };
    })()`);
    check("T7 share→friend ผ่าน click จริง: pv ปิด + stack มี chatroom ชั้นเดียว + back ครั้งเดียวกลับ profile",
      !r.pvAfterSend && r.stackAfterSend.filter(s => s.startsWith("chatroom:")).length === 1 && !r.stackAfterBack.some(s => s.startsWith("chatroom:")) && !r.pvAfterBack, JSON.stringify(r));
  }

  // ===== GLOBAL =====
  check("GLOBAL ไม่มี page error", errors.length === 0, errors.join(";"));

  console.log(`\n===== ${pass} pass / ${fail} fail =====`);
  if (findings.length) { console.log("FAILURES:"); findings.forEach(f => console.log(" - " + f)); }
  await browser.close();
  srv.close();
  process.exit(fail ? 1 : 0);
})();
