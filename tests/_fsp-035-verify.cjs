// FSP-035 verify — M1–M13 + caption newline + Low (I.watch dup, dead edit branch)
// M1/M2 comment-sheet pid/replyCid hygiene · M3 null price · M4 saved-drawer · M5 explore
// archived leak · M6 PF_MINE rename · M7 settings extras · M8 chat stack · M9 toast lang
// M10 like/save re-login · M11 onerror data-fb · M12 seller esc · M13 pwH hash
// run: node tests/_fsp-035-verify.cjs
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
  await new Promise(r => srv.listen(8139, r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 440, height: 956 } });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("http://localhost:8139/fo-flow/index.html");
  await page.waitForTimeout(900);

  // ===== T1: M1 — comment จาก ps sheet (more-link path) ลงโพสต์ที่ถูก ไม่ใช่ cmtPid ค้าง =====
  {
    const r = await page.evaluate(`(() => {
      const scr = document.querySelector(".screen");
      const [a, b] = POSTS.filter(p => !p.noComments).slice(0, 2);
      scr.dataset.cmtPid = a.id;                       /* stale pid เหมือนเคยเปิดคอมเมนต์โพสต์ A */
      const aBefore = (COMMENTS[a.id] || []).length;
      COMMENTS[b.id] = []; b.comments = 0;             /* โพสต์ B ไม่มี comment row → fallback ทำงาน */
      const pv = document.createElement("div");
      pv.className = "pv-post"; pv.dataset.pid = b.id;
      const ml = document.createElement("span"); ml.className = "more-link";
      pv.appendChild(ml); scr.appendChild(pv);
      ml.click();                                      /* click path จริง */
      const pidOnSheet = scr.dataset.cmtPid;
      submitComment(scr, "lands on B");
      return { pidOnSheet, bId: b.id, bCount: COMMENTS[b.id].length, aCount: (COMMENTS[a.id] || []).length, aBefore, bComments: b.comments };
    })()`);
    check("T1 more-link ps sheet: cmtPid ชี้โพสต์ B + comment ลง B ไม่ใช่ A ค้าง",
      r.pidOnSheet === r.bId && r.bCount === 1 && r.aCount === r.aBefore && r.bComments === 1, JSON.stringify(r));
  }

  // ===== T2: M2 — replyCid เคลียร์ทุกครั้งที่เปิด comments โพสต์ใหม่ =====
  {
    const r = await page.evaluate(`(() => {
      const scr = document.querySelector(".screen");
      const cs = scr.querySelector(".comment-sheet");
      const [a, b] = POSTS.filter(p => !p.noComments).slice(0, 2);
      cs.dataset.replyCid = "stale-c123";               /* เหมือนเพิ่งกด Reply บนโพสต์ก่อน */
      scr.dataset.cmtPid = a.id;
      openSheet(scr, "nt", "comments-open", commentsHTML(a));
      const stillStale1 = cs.dataset.replyCid;          /* openSheet path ยังค่าเดิมถ้าไม่ reset */
      /* ผ่าน click path จริง (comment-btn) — ต้องเคลียร์ */
      cs.dataset.replyCid = "stale-c123";
      const art = scr.querySelector('.post[data-pid="' + b.id + '"]');
      if (art) art.querySelector(".comment-btn").click();
      const afterClick = cs.dataset.replyCid;
      return { stillStale1, afterClick, cmtPid: scr.dataset.cmtPid };
    })()`);
    check("T2 เปิด comments ผ่าน comment-btn → replyCid ถูกเคลียร์", r.afterClick === "", JSON.stringify(r));
  }

  // ===== T3: M3 — pv details sheet ไม่ render "null" เมื่อโพสต์ไม่มีราคา =====
  {
    const r = await page.evaluate(`(() => {
      const free = POSTS.find(p => !p.price) || { ...POSTS[0], price: null, specGroups: [] };
      const html = pvDetailsSheetHTML(free);
      const withPrice = pvDetailsSheetHTML(POSTS.find(p => p.price) || POSTS[0]);
      return { hasNull: /details-price">(null|undefined)</.test(html) || html.includes(">null<") || html.includes(">undefined<"), showsPrice: withPrice.includes("details-price") };
    })()`);
    check("T3 details sheet: ไม่มี 'null' เมื่อไม่มีราคา + มีราคา render ปกติ", !r.hasNull && r.showsPrice, JSON.stringify(r));
  }

  // ===== T4: M4 — save จาก drawer (PF_MINE / hide post) เข้า Saved hub =====
  {
    const r = await page.evaluate(`(() => {
      const mine = { id: "tmp-drawer-1", seller: CP_ME.name, photos: ["x.jpg"], saved: true, savedAt: Date.now(), savedCols: [], pfkind: "hide", caption: "", specs: [], specGroups: [] };
      PF_MINE.push(mine);
      const hideP = POSTS.find(p => p.pfkind === "hide") || (() => { const p = POSTS[0]; p.pfkind = "hide"; return p; })();
      hideP.saved = true;
      const inHub = savedPosts().some(p => p.id === "tmp-drawer-1");
      const hideInHub = savedPosts().some(p => p.id === hideP.id);
      return { inHub, hideInHub };
    })()`);
    check("T4 savedPosts(): PF_MINE + hide post ที่ save แล้วเข้า hub", r.inHub && r.hideInHub, JSON.stringify(r));
  }

  // ===== T5: M5 — explore viewer list ตรงกับ grid (ไม่มี archived/drawer leak) =====
  {
    const r = await page.evaluate(`(() => {
      const p = POSTS.find(x => !x.archived);
      p.archived = true;                                 /* archive โพสต์จริง */
      const scr = document.querySelector(".screen");
      openSub(scr, "search");                            /* explore landing */
      const tiles = [...scr.querySelectorAll(".xp-tile")];
      const leakedTile = tiles.some(t => t.dataset.pid === p.id);
      /* click tile แรก → viewer ต้องไม่มี archived */
      tiles[0].click();
      const viewerHasArchived = !!scr.querySelector('.pv-post[data-pid="' + p.id + '"]');
      const pvCount = scr.querySelectorAll(".pv-post").length;
      p.archived = false;
      scr.classList.remove("pv-open");
      return { leakedTile, viewerHasArchived, pvCount };
    })()`);
    check("T5 archived post ไม่โผล่ใน explore grid และไม่หลุดเข้า viewer", !r.leakedTile && !r.viewerHasArchived, JSON.stringify(r));
  }

  // ===== T6: M6 — rename username → PF_MINE seller ตามไปด้วย =====
  {
    const r = await page.evaluate(`(() => {
      const old = CP_ME.name;
      PF_MINE.push({ id: "tmp-mine-2", seller: old, photos: ["x.jpg"], pfkind: "show", caption: "", specs: [], specGroups: [] });
      pfRenameUser(null, old, "renamed.user");
      const migrated = PF_MINE.find(p => p.id === "tmp-mine-2").seller;
      pfRenameUser(null, "renamed.user", old);           /* revert */
      return { migrated };
    })()`);
    check("T6 rename → PF_MINE seller อัปเดตตาม (ไม่ orphan)", r.migrated === "renamed.user", JSON.stringify(r));
  }

  // ===== T7: M7 — settings เห็น muted/faved ที่ไม่มีโพสต์ (PF_EXTRA_*) =====
  {
    const r = await page.evaluate(`(() => {
      PF_EXTRA_MUT.add("nopost.muted"); PF_EXTRA_FAV.add("nopost.faved");
      const mut = mutedSellers().includes("nopost.muted");
      const fav = favoriteSellers().includes("nopost.faved");
      let mutedHTML = "", favHTML = "";
      try { mutedHTML = subHTML("muted", document.querySelector(".screen")); } catch (e) { mutedHTML = "ERR:" + e.message; }
      try { favHTML = subHTML("favorites", document.querySelector(".screen")); } catch (e) { favHTML = "ERR:" + e.message; }
      PF_EXTRA_MUT.delete("nopost.muted"); PF_EXTRA_FAV.delete("nopost.faved");
      return { mut, fav, mutedRow: mutedHTML.includes("nopost.muted"), favRow: favHTML.includes("nopost.faved"), mutedErr: mutedHTML.startsWith("ERR"), favErr: favHTML.startsWith("ERR") };
    })()`);
    check("T7 settings: post-less muted/faved โชว์ใน list + render ไม่ crash", r.mut && r.fav && r.mutedRow && r.favRow && !r.mutedErr && !r.favErr, JSON.stringify(r));
  }

  // ===== T8: M8 — chat openSub ไม่ทับ stack (back กลับหน้าก่อนหน้า) =====
  {
    const r = await page.evaluate(`(() => {
      const scr = document.querySelector(".screen");
      openSub(scr, "chat");
      const t = (chatInit().threads || [])[0] || { id: "tx1", user: "u.test", msgs: [], unread: 0 };
      if (!chatInit().threads.includes(t)) chatInit().threads.push(t);
      chOpenRoom(scr, t);
      const stack = (scr._subStack || []).slice();
      return { stack };
    })()`);
    check("T8 chatroom push ทับ chat list → stack=[chat, chatroom] back กลับ list ได้",
      r.stack.length === 2 && r.stack[0] === "chat" && r.stack[1].startsWith("chatroom:"), JSON.stringify(r));
  }

  // ===== T9: M9 — toast ภาษาถูก: flowToast แปลไทยได้ + chat pin/mute สองภาษา =====
  {
    const r = await page.evaluate(`(() => {
      state.lang = "th";
      toast("Report submitted · thanks for letting us know");
      const thTxt = document.getElementById("flowToast").textContent;
      state.lang = "en";
      toast("Report submitted · thanks for letting us know");
      const enTxt = document.getElementById("flowToast").textContent;
      return { thTxt, enTxt };
    })()`);
    check("T9 flowToast: TH → ไทย, EN → อังกฤษ", /[\u0E00-\u0E7F]/.test(r.thTxt) && r.enTxt === "Report submitted · thanks for letting us know", JSON.stringify(r));
  }

  // ===== T10: M10 — like/save รอด re-login =====
  {
    const r = await page.evaluate(`(() => {
      const p = POSTS[0];
      p.liked = true; p.saved = true; p.savedCols = ["Grail list"];
      setSession("guest");
      const wiped = !p.liked && !p.saved;
      setSession("member");
      return { wiped, liked: p.liked, saved: p.saved, cols: p.savedCols };
    })()`);
    check("T10 member→guest→member: like/save กลับมาครบ", r.wiped && r.liked && r.saved && r.cols.includes("Grail list"), JSON.stringify(r));
  }

  // ===== T11: M11 — onerror ไม่ interpolate URL ใน handler (data-fb pattern) =====
  {
    const r = await page.evaluate(`(() => {
      const html = svdTileHTML({ sel: new Set() }, POSTS[0]);
      return { interp: html.includes("this.src='"), hasFb: html.includes("data-fb="), keepsHandler: html.includes("onerror="), img: html.slice(0, 220) };
    })()`);
    check("T11 tile onerror อ่าน data-fb ไม่ใช่ string interpolate", !r.interp && r.hasFb && r.keepsHandler, JSON.stringify(r.img));
  }

  // ===== T12: M12 — seller ที่มี HTML ไม่ inject ในจุด render หลัก =====
  {
    const r = await page.evaluate(`(() => {
      const evil = { ...POSTS[0], seller: 'x"><img src=x onerror=alert(1)>', id: "tmp-evil" };
      const htmls = [pvPostSheetHTML(evil), likesSheetHTML(evil), chatPopHTML(evil), sellerCardHTML(evil)].join("|");
      return { rawInject: htmls.includes('seller:') ? "na" : htmls.includes('"><img src=x onerror'), sample: htmls.slice(0, 120) };
    })()`);
    check("T12 seller อักขระ HTML ถูก esc ใน sheet/card หลัก", r.rawInject === false, JSON.stringify(r.rawInject));
  }

  // ===== T13: caption newline — cfCapText แปลง <div>/<br> เป็น \n =====
  {
    const r = await page.evaluate(`(() => {
      const ta = document.createElement("div");
      ta.innerHTML = "line1<div>line2</div><div>line3<br>line4</div>";
      return { out: cfCapText(ta).trim() };
    })()`);
    check("T13 contenteditable div/br → newline จริง (ไม่ flatten)", r.out === "line1\nline2\nline3\nline4", JSON.stringify(r.out));
  }

  // ===== T14: M13 — fo_account เก็บ pwH ไม่ใช่ plaintext + sign-in เทียบ hash =====
  {
    const r = await page.evaluate(`(() => {
      obSaveAccount({ email: "hash@test.com", pwH: obHash("Secret123"), pw: undefined, user: "h", name: "H", provider: "email" });
      const rec = JSON.parse(localStorage.getItem("fo_account"));
      const noPlain = rec.pw === undefined && !JSON.stringify(rec).includes("Secret123");
      const hashed = rec.pwH === obHash("Secret123");
      return { noPlain, hashed, pwField: rec.pw, pwHPrefix: (rec.pwH || "").slice(0, 12) };
    })()`);
    check("T14 fo_account: มี pwH ไม่มี plaintext pw", r.noPlain && r.hashed, JSON.stringify(r));
  }

  // ===== T15: Low — I.watch นิยามเดียว + dead edit branch ถูกถอด =====
  {
    const src = fs.readFileSync(path.join(ROOT, "fo-flow", "index.html"), "utf8");
    const iObj = src.slice(src.indexOf("const I = {"), src.indexOf("};", src.indexOf("const I = {")));
    const watchDefs = (iObj.match(/^\s*watch\s*:/gm) || []).length;
    const deadEdit = src.includes('from === "edit"');
    check("T15a I.watch นิยามเดียว (duplicate ถูกถอด)", watchDefs === 1, `defs=${watchDefs}`);
    check("T15b ncNext ไม่มี dead `from === \"edit\"` branch", !deadEdit, "");
  }

  // ===== GLOBAL =====
  check("GLOBAL ไม่มี page error", errors.length === 0, errors.join(";"));

  console.log(`\n===== ${pass} pass / ${fail} fail =====`);
  if (findings.length) { console.log("FAILURES:"); findings.forEach(f => console.log(" - " + f)); }
  await browser.close();
  srv.close();
  process.exit(fail ? 1 : 0);
})();
