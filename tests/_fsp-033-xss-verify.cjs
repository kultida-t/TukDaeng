// FSP-033 XSS verify — esc() ครอบ comment/caption/spec/scrToast/collection/chat/library
// ยิง payload <img src=x onerror=...> เข้า user-controlled fields ทุกจุดที่แก้
// ผ่าน = payload แสดงเป็น text ล้วน ไม่มี <img>/[onerror] element เกิดขึ้น และ window.__xss ไม่ถูกเรียก
// run: node tests/_fsp-033-xss-verify.cjs
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

const PAYLOAD = '<img src=x onerror="window.__xss=(window.__xss||0)+1">';

let pass = 0, fail = 0;
const findings = [];
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log(`PASS  ${name}`); }
  else { fail++; findings.push(`${name} ${extra}`); console.log(`FAIL  ${name} ${extra}`); }
}
/* render html เข้า probe div ใน document จริง แล้ววัดผล */
const probeScript = `(html) => {
  const host = document.createElement("div");
  document.body.appendChild(host);
  host.innerHTML = html;
  const res = {
    bad: host.querySelectorAll('img[src="x"], [onerror], script').length,
    lit: host.textContent.includes("<img src=x"),
    xss: window.__xss || 0
  };
  host.remove();
  return res;
}`;

(async () => {
  await new Promise(r => srv.listen(8137, r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 440, height: 956 } });
  const dialogs = [];
  page.on("dialog", async d => { dialogs.push(d.message()); await d.dismiss(); });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("http://localhost:8137/fo-flow/index.html");
  await page.waitForTimeout(900);

  // ===== T1: comment name/text + reply name/text (C1) =====
  {
    const r = await page.evaluate(`((PL) => {
      const p = POSTS[0];
      COMMENTS[p.id] = [{
        id: "xss-c1", name: PL, avatar: "", time: "now", text: PL, likes: 0,
        replies: [{ id: "xss-r1", name: PL, avatar: "", time: "now", text: PL, likes: 0 }]
      }];
      const host = document.createElement("div");
      document.body.appendChild(host);
      host.innerHTML = commentsHTML(p);
      const res = {
        bad: host.querySelectorAll('img[src="x"], [onerror], script').length,
        names: [...host.querySelectorAll(".c-head .n")].map(e => e.textContent),
        texts: [...host.querySelectorAll(".c-text")].map(e => e.textContent),
        xss: window.__xss || 0
      };
      host.remove();
      return res;
    })(${JSON.stringify(PAYLOAD)})`);
    check("T1 comment c.name/c.text + reply r.name/r.text → text ไม่ execute",
      r.bad === 0 && r.names.every(t => t.includes("<img src=x")) && r.texts.every(t => t.includes("<img src=x")) && r.xss === 0,
      JSON.stringify(r));
  }

  // ===== T2: caption/desc ผ่าน igCaptionHTML (C2) + regression hashtag/newline =====
  {
    const r = await page.evaluate(`((PL) => {
      const probe = ${probeScript};
      const p = { caption: PL, captionFull: PL };
      const a = probe("<p class='caption'>" + igCaptionHTML(p) + "</p>");
      const b = probe("<p class='caption'>" + igCaptionHTML(p, PL) + "</p>");
      const reg = igCaptionHTML({ caption: "" }, "line one\\n#Rolex ok");
      return { a, b, regBr: reg.includes("<br>"), regTag: reg.includes('class="igd-tag"'), regHas: reg.includes("#Rolex") };
    })(${JSON.stringify(PAYLOAD)})`);
    check("T2 igCaptionHTML (p.caption path) → text", r.a.bad === 0 && r.a.lit && r.a.xss === 0, JSON.stringify(r.a));
    check("T2b igCaptionHTML (raw arg path) → text", r.b.bad === 0 && r.b.lit && r.b.xss === 0, JSON.stringify(r.b));
    check("T2c regression newline→<br> + hashtag wrap ยังทำงาน", r.regBr && r.regTag && r.regHas, r.reg);
  }

  // ===== T3: spec rows s[0]/s[1] ทุก dStyle + spec-sec title (C3) =====
  for (const ds of ["d1", "d2", "d3"]) {
    const r = await page.evaluate(`(({ PL, ds }) => {
      state.dStyle = ds;
      const p = { specGroups: [{ title: PL, rows: [[PL, PL]] }] };
      const probe = ${probeScript};
      return probe(detailsHTML(p, false));
    })({ PL: ${JSON.stringify(PAYLOAD)}, ds: "${ds}" })`);
    check(`T3 spec rows dStyle=${ds} + group title → text`, r.bad === 0 && r.lit && r.xss === 0, JSON.stringify(r));
  }
  for (const dsv of ["acc", "cards", "tabs"]) {
    const r = await page.evaluate(`(({ PL, dsv }) => {
      state.ds = dsv;
      const p = { specGroups: [{ title: PL, rows: [[PL, PL]] }] };
      const probe = ${probeScript};
      return probe(detailSpecsHTML(p));
    })({ PL: ${JSON.stringify(PAYLOAD)}, dsv: "${dsv}" })`);
    check(`T3b spec group title ds=${dsv} → text`, r.bad === 0 && r.lit && r.xss === 0, JSON.stringify(r));
  }

  // ===== T4: detail-name / detail-ref จากช่อง Brand/Reference (C3) =====
  {
    const r = await page.evaluate(`((PL) => {
      state.dl = "dl1";
      const p = JSON.parse(JSON.stringify(POSTS[0]));
      p.specs = [["Brand", PL], ["Model", "Sub"], ["Reference", PL]];
      p.specGroups = [];
      p.caption = PL;
      p.desc = PL;
      const host = document.createElement("div");
      document.body.appendChild(host);
      host.innerHTML = detailHTML(p);
      const res = {
        bad: host.querySelectorAll('img[src="x"], [onerror], script').length,
        name: (host.querySelector(".detail-name") || {}).textContent || "",
        ref: (host.querySelector(".detail-ref") || {}).textContent || "",
        xss: window.__xss || 0
      };
      host.remove();
      return res;
    })(${JSON.stringify(PAYLOAD)})`);
    check("T4 detail-name (Brand) + detail-ref (Reference) → text",
      r.bad === 0 && r.name.includes("<img src=x") && r.ref.includes("<img src=x") && r.xss === 0,
      JSON.stringify(r));
  }

  // ===== T5: scrToast msg + thumb (C4) =====
  {
    const r = await page.evaluate(`((PL) => {
      const scr = document.querySelector(".screen");
      const el = scr.querySelector(".sc-toast");
      scrToast(scr, PL, "./assets/x.jpg");
      const withThumb = {
        bad: el.querySelectorAll('img[src="x"], [onerror], script').length,
        span: (el.querySelector("span") || {}).textContent || "",
        thumbSrc: (el.querySelector("img") || {}).getAttribute ? el.querySelector("img").getAttribute("src") : ""
      };
      scrToast(scr, PL);
      const noThumb = { lit: el.textContent === PL, imgs: el.querySelectorAll("img").length };
      return { withThumb, noThumb, xss: window.__xss || 0 };
    })(${JSON.stringify(PAYLOAD)})`);
    check("T5 scrToast thumb path — msg text + thumb src ไม่แตก",
      r.withThumb.bad === 0 && r.withThumb.span.includes("<img src=x") && r.withThumb.thumbSrc === "./assets/x.jpg" && r.xss === 0,
      JSON.stringify(r.withThumb));
    check("T5b scrToast no-thumb — textContent ล้วน", r.noThumb.lit && r.noThumb.imgs === 0, JSON.stringify(r.noThumb));
  }

  // ===== T6: collection name ใน sv/wl pick rows =====
  {
    const r = await page.evaluate(`((PL) => {
      COLLECTIONS.push({ name: PL, thumb: "" });
      WISHLISTS.push({ name: PL, thumb: "" });
      const p = POSTS[0];
      const host = document.createElement("div");
      document.body.appendChild(host);
      host.innerHTML = saveSheetHTML(p) + wlSheetHTML(p);
      const picks = [...host.querySelectorAll(".sv-pick, .wl-pick")];
      const res = {
        bad: host.querySelectorAll('img[src="x"], [onerror], script').length,
        rows: picks.filter(b => b.textContent.includes("<img src=x")).length,
        attrs: picks.filter(b => (b.getAttribute("data-col") || "").includes("<img src=x")).map(b => b.getAttribute("data-col")),
        xss: window.__xss || 0
      };
      host.remove();
      return res;
    })(${JSON.stringify(PAYLOAD)})`);
    check("T6 collection name sv+wl pick rows → text + data-col attr ปลอดภัย",
      r.bad === 0 && r.rows === 2 && r.attrs.length === 2 && r.attrs.every(a => a === PAYLOAD) && r.xss === 0,
      JSON.stringify(r));
  }

  // ===== T7: chatPopHTML caption + price =====
  {
    const r = await page.evaluate(`((PL) => {
      const probe = ${probeScript};
      return probe(chatPopHTML({ seller: "s", avatar: "", photos: [""], caption: PL, price: PL }));
    })(${JSON.stringify(PAYLOAD)})`);
    check("T7 chatPop caption/price → text", r.bad === 0 && r.lit && r.xss === 0, JSON.stringify(r));
  }

  // ===== T8: library row caption (subPostRows) =====
  {
    const r = await page.evaluate(`((PL) => {
      const probe = ${probeScript};
      return probe(subPostRows([{ id: "z", photos: [""], seller: "s", caption: PL }], "Manage", "m-act"));
    })(${JSON.stringify(PAYLOAD)})`);
    check("T8 library row caption → text", r.bad === 0 && r.lit && r.xss === 0, JSON.stringify(r));
  }

  // ===== T9: live input path — พิมพ์ payload ในช่อง comment จริงแล้วกดโพสต์ =====
  {
    const r = await page.evaluate(`((PL) => {
      const scr = document.querySelector(".screen");
      const post = POSTS[0];
      const cs = scr.querySelector(".comment-sheet");
      cs.innerHTML = commentsHTML(post);
      scr.dataset.cmtPid = post.id;
      scr.classList.add("comments-open");
      const inp = cs.querySelector(".ci-field");
      inp.value = PL;
      submitComment(scr);
      const texts = [...cs.querySelectorAll(".c-text")].map(e => e.textContent);
      const res = {
        bad: cs.querySelectorAll('img[src="x"], [onerror], script').length,
        lit: texts.some(t => t.includes("<img src=x")),
        xss: window.__xss || 0
      };
      scr.classList.remove("comments-open");
      return res;
    })(${JSON.stringify(PAYLOAD)})`);
    check("T9 live comment input → โพสต์ payload แสดงเป็น text", r.bad === 0 && r.lit && r.xss === 0, JSON.stringify(r));
  }

  // ===== T10: composer summary rows (TC-04 path) — Watch details / price / cond / loc preview =====
  {
    const r = await page.evaluate(`((PL) => {
      const scr = document.querySelector(".screen");
      const V = cpState(scr);
      V.step = 2; V.order = [0];
      V.meta = { brand: PL, model: PL, price: "420000", cond: PL, loc: PL, purchase: "", desc: "" };
      const host = document.createElement("div");
      document.body.appendChild(host);
      host.innerHTML = cfStep2HTML(scr);
      const res = {
        bad: host.querySelectorAll('img[src="x"], [onerror], script').length,
        vals: [...host.querySelectorAll(".ig-rows .val, .ig-rows .lab2")].map(e => e.textContent),
        xss: window.__xss || 0
      };
      host.remove();
      return res;
    })(${JSON.stringify(PAYLOAD)})`);
    check("T10 composer summary rows (brand/model/cond/loc) → text",
      r.bad === 0 && r.vals.some(t => t.includes("<img src=x")) && r.xss === 0,
      JSON.stringify(r));
  }

  // ===== global: ไม่มี alert/dialog + ไม่มี onerror execute + page ไม่ error =====
  check("GLOBAL window.__xss counter = 0 (ไม่มี onerror fire เลย)", await page.evaluate("window.__xss || 0") === 0);
  check("GLOBAL ไม่มี dialog/alert เด้ง", dialogs.length === 0, dialogs.join(";"));
  check("GLOBAL ไม่มี page error", errors.length === 0, errors.join(";"));

  console.log(`\n===== ${pass} pass / ${fail} fail =====`);
  if (findings.length) { console.log("FAILURES:"); findings.forEach(f => console.log(" - " + f)); }
  await browser.close();
  srv.close();
  process.exit(fail ? 1 : 0);
})();
