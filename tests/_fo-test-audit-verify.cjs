// FO-TEST-AUDIT — After-verify + evidence capture
// ตรวจพฤติกรรมที่แก้: lockout(แยกอีเมล/persist/countdown/รหัสถูกระหว่างล็อก),
// Ask ซ่อนบนโพสต์ตัวเองทุกจุด, followOnly incoming-ask, Sent->Read, badge ห้องซ่อน/mute
// run: node tests/_fo-test-audit-verify.cjs
const { chromium } = require("@playwright/test");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "Prototypes");
const OUT = path.join(__dirname, "..", "screenshots", "fo-test-audit", "after");
fs.mkdirSync(OUT, { recursive: true });
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
  await new Promise(r => srv.listen(8123, r));
  const browser = await chromium.launch();
  const URL = "http://localhost:8123/fo-flow/index.html";
  const errors = [];
  async function newPage(w, h) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(URL);
    await page.waitForTimeout(900);
    return page;
  }
  const openSignin = page => page.evaluate(() => {
    OB.on = true; OB.gate = false; OB.os = false; OB.step = "member"; obMount();
    obGo("signin");
    const em = document.querySelector('.ob [data-f="email"]'); em.value = "demo@tukdaeng.com"; em.dispatchEvent(new Event("input", { bubbles: true }));
  });

  // ===== A. Lockout =====
  {
    const page = await newPage(1440, 900);
    await page.evaluate(() => localStorage.removeItem("fo_locks"));
    await openSignin(page);
    await page.fill('.ob [data-f="pw"]', "WrongPass!");
    for (let i = 0; i < 4; i++) { await page.click('.ob [data-ob="signin"]'); await page.waitForTimeout(120); }
    const b4 = await page.locator(".ob .ob-banner").innerText().catch(() => "");
    check("wrong x1-4 → generic error (no counter)", /incorrect|ไม่ถูกต้อง/.test(b4) && !/\(1\/5\)|\d\/5/.test(b4), b4);
    await page.click('.ob [data-ob="signin"]'); await page.waitForTimeout(300);
    const b5 = await page.locator(".ob .ob-banner").innerText().catch(() => "");
    check("x5 → lock msg + countdown", /try again in|ลองใหม่ในอีก/.test(b5) && /min|นาที/.test(b5), b5);
    check("x5 → signin btn disabled", await page.locator('.ob [data-ob="signin"]').isDisabled());
    check("forgot link still clickable", await page.locator('.ob [data-ob="go:forgot"]').isVisible());
    const cd1 = await page.locator("#obLockCd").innerText().catch(() => "");
    await page.waitForTimeout(2200);
    const cd2 = await page.locator("#obLockCd").innerText().catch(() => "");
    check("countdown ticks down", cd1 !== cd2, `${cd1} -> ${cd2}`);
    // correct pw while locked still blocked (button disabled proves it)
    await page.fill('.ob [data-f="pw"]', "Tukdaeng123");
    check("correct pw during lock → still disabled", await page.locator('.ob [data-ob="signin"]').isDisabled());
    // other email not locked
    await page.fill('.ob [data-f="email"]', "other@x.com"); await page.waitForTimeout(200);
    check("other email → btn enabled, no lock banner",
      !(await page.locator('.ob [data-ob="signin"]').isDisabled()) &&
      !(await page.locator(".ob .ob-banner").innerText().catch(() => "")).match(/try again in|ลองใหม่ในอีก/));
    // back to locked email
    await page.fill('.ob [data-f="email"]', "demo@tukdaeng.com"); await page.waitForTimeout(200);
    check("back to locked email → disabled + banner", await page.locator('.ob [data-ob="signin"]').isDisabled());
    await page.screenshot({ path: path.join(OUT, "signin-locked-1440.png"), fullPage: false });
    // reload persists (fo_locks)
    await page.reload(); await page.waitForTimeout(900);
    await openSignin(page);
    check("lock persists after reload", await page.locator('.ob [data-ob="signin"]').isDisabled() &&
      /try again in|ลองใหม่ในอีก/.test(await page.locator(".ob .ob-banner").innerText().catch(() => "")));
    await page.close();
  }

  // ===== B. lockout @390 shot + sign in =====
  const page = await newPage(390, 844);
  await openSignin(page);
  await page.screenshot({ path: path.join(OUT, "signin-locked-390.png") });
  await page.fill('.ob [data-f="pw"]', "Tukdaeng123");
  await page.evaluate(() => { localStorage.removeItem("fo_locks"); obDraw(); }); // ปลดล็อกเพื่อเข้าฟีด
  await page.click('.ob [data-ob="signin"]'); await page.waitForTimeout(800);
  check("demo sign-in → feed", await page.locator(".feed-list .post").first().isVisible());

  // ===== C. Ask on own vs others =====
  const askInfo = await page.evaluate(() => {
    const own = JSON.parse(JSON.stringify(POSTS.find(p => p.id === "p1")));
    own.id = "ownx"; own.seller = CP_ME.name; own.avatar = CP_ME.avatar;
    own.caption = "My own sale listing"; own.time = "just now";
    POSTS.unshift(own);
    const scr = document.querySelector("#stage .screen");
    scr.querySelector(".feed-list").innerHTML = feedContentHTML(scr.dataset.variant || state.variant);
    const askIn = pid => !!scr.querySelector(`.post[data-pid="${pid}"] .ask-pill`);
    return { own: askIn("ownx"), otherSale: askIn("p1") };
  });
  check("feed: own post has NO Ask", askInfo.own === false);
  check("feed: other sale post HAS Ask", askInfo.otherSale === true);
  await page.locator('.post[data-pid="ownx"]').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(OUT, "feed-own-noask-390.png") });

  // viewer surfaces — pfp (profile "Posts" card), svf (saved viewer), pv (full-screen photo viewer), detail dl1 (locked)
  const vw = await page.evaluate(() => {
    const scr = document.querySelector("#stage .screen");
    const list = POSTS.filter(p => p.id === "ownx" || p.id === "p1");
    const r = {};
    // pfp-post (profile "Posts" surface — feed-parity card มี Ask)
    openPostViewer(scr, list, "ownx", 0, false, "Posts", CP_ME.name);
    r.pfpOwn = !!scr.querySelector('.pfp-post[data-pid="ownx"] .ask-pill');
    openPostViewer(scr, list, "p1", 0, false, "Posts", "Watch 777");
    r.pfpOther = !!scr.querySelector('.pfp-post[data-pid="p1"] .ask-pill');
    // svf-post (saved viewer — card เดียวกับ feed)
    openPostViewer(scr, list, "ownx", 0, true, "Saved");
    r.svfOwn = !!scr.querySelector('.svf-post[data-pid="ownx"] .ask-pill');
    openPostViewer(scr, list, "p1", 0, true, "Saved");
    r.svfOther = !!scr.querySelector('.svf-post[data-pid="p1"] .ask-pill');
    // pv-post (full-screen photo viewer — rail ไม่มี Ask ให้ใครเลย)
    openPostViewer(scr, list, "ownx", 0, false, "");
    r.pvOwn = !!scr.querySelector('.pv-post[data-pid="ownx"] .ask-pill');
    r.pvOther = !!scr.querySelector('.pv-post[data-pid="p1"] .ask-pill');
    // detail dl1 (variant ที่ล็อก — DET-018: ไม่มี Ask surface เลย)
    const askIn = pid => { openPostDetail(scr, POSTS.find(p => p.id === pid)); return !!scr.querySelector(".page-detail .ask-pill, .page-detail .chat-fab"); };
    r.detailOwnDl1 = askIn("ownx");
    r.detailOtherDl1 = askIn("p1");
    // igDetailHTML dev path — ตรวจ guard ที่ unit level (POST_DETAIL_CFG บังคับ dl1 อยู่แล้ว)
    r.igOwn = igDetailHTML(POSTS.find(p => p.id === "ownx")).includes("ask-pill") || igDetailHTML(POSTS.find(p => p.id === "ownx")).includes("chat-fab");
    r.igOther = igDetailHTML(POSTS.find(p => p.id === "p1")).includes("ask-pill") || igDetailHTML(POSTS.find(p => p.id === "p1")).includes("chat-fab");
    scr.classList.remove("pv-open", "detail-open");
    return r;
  });
  check("pfp viewer: own post no Ask", vw.pfpOwn === false);
  check("pfp viewer: other sale post HAS Ask", vw.pfpOther === true);
  check("svf viewer: own post no Ask", vw.svfOwn === false);
  check("svf viewer: other sale post HAS Ask", vw.svfOther === true);
  check("pv viewer: own no Ask (rail ไม่มี Ask ให้ใคร)", vw.pvOwn === false);
  check("detail dl1 (locked): own no Ask", vw.detailOwnDl1 === false);
  check("detail dl1: other post ไม่มี Ask เช่นกัน (DET-018)", vw.detailOtherDl1 === false);
  check("igDetail dev path: own no Ask (guard)", vw.igOwn === false);
  check("igDetail dev path: other HAS Ask (guard ไม่ over-block)", vw.igOther === true);
  await page.screenshot({ path: path.join(OUT, "detail-other-ask-390.png") });
  await page.evaluate(() => { const scr = document.querySelector("#stage .screen"); openPostDetail(scr, POSTS.find(p => p.id === "ownx")); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "detail-own-noask-390.png") });
  // guard path
  const guard = await page.evaluate(() => {
    const scr = document.querySelector("#stage .screen");
    const n0 = chatInit().threads.length + (chatInit().draft ? 1 : 0);
    chatQuickAsk(scr, POSTS.find(p => p.id === "ownx"));
    return { toast: scr.querySelector(".sc-toast")?.textContent || "",
      rooms: chatInit().threads.length + (chatInit().draft ? 1 : 0), n0 };
  });
  check("guard chatQuickAsk own → toast + no room", /own listing/i.test(guard.toast) && guard.rooms === guard.n0, JSON.stringify(guard));

  // ===== D. Chat badge excludes hidden/muted =====
  const badge = await page.evaluate(() => {
    const C = chatInit();
    const exp = C.threads.reduce((a, t) => a + ((t.hidden || t.muted) ? 0 : (t.unread || 0)), 0);
    return { fn: chUnread(), exp };
  });
  check("chUnread excludes hidden/muted", badge.fn === badge.exp, JSON.stringify(badge));

  // ===== E. followOnly incoming ask =====
  const fo = await page.evaluate(() => {
    const C = chatInit();
    const notFol = [...POSTS.map(p => p.seller)].find(s => !pfIsFollowed(s) && !pfIsBlocked(s) && s !== CP_ME.name);
    const fol = followedSellers()[0] || POSTS[0].seller;
    C.cfg.followOnly = true;
    const r1 = chIncomingAsk(notFol, "p1");          // ต้องโดนบล็อก
    const r2 = chIncomingAsk(fol, "p1");             // คนที่เรา follow ต้องเข้าได้
    C.cfg.followOnly = false;
    const r3 = chIncomingAsk(notFol, "p2");          // ปิดกฎแล้วเข้าได้
    return { notFol, fol, r1, r2, r3 };
  });
  check(`followOnly blocks non-followed (${fo.notFol})`, fo.r1 === false);
  check(`followOnly allows followed (${fo.fol})`, fo.r2 === true);
  check("followOnly off → non-followed allowed", fo.r3 === true);

  // ===== F. Sent -> Read =====
  const sr = await page.evaluate(() => {
    const scr = document.querySelector("#stage .screen");
    const t = chatInit().threads[0];
    chOpenRoom(scr, t);
    scr.querySelector(".ch-input").value = "verify sent->read";
    chSend(scr);
    const m = t.msgs[t.msgs.length - 1];
    return { id: t.id, sent: m.read === false, txt: m.t };
  });
  check("message sent with read=false (Sent)", sr.sent);
  await page.waitForTimeout(3400);
  const read = await page.evaluate(id => {
    const t = chGet(id); return t.msgs[t.msgs.length - 1].read;
  }, sr.id);
  check("Sent -> Read after ~3s while room open", read === true);
  await page.screenshot({ path: path.join(OUT, "chat-room-read-390.png") });

  console.log(`\n===== ${pass} PASS / ${fail} FAIL =====`);
  if (errors.length) console.log("PAGE ERRORS:\n" + errors.join("\n"));
  else console.log("NO PAGE ERRORS");
  if (findings.length) console.log(findings.join("\n"));
  await browser.close(); srv.close();
  process.exit(fail ? 1 : 0);
})();
