// Capture feed-redesign options as per-section comparison images.
// Output: deliverables/feed-redesign-review/sections/
//   01-layouts-dark.png / 01-layouts-light.png   (grid of all 10 variants)
//   02-details-trigger.png  (T1 T2 T3, dark+light rows)
//   03-details-content.png  (D1 D2 D3, dark+light rows)
//   04-bottom-nav.png       (N1 N2, dark+light rows)
//   + raw files in layouts/ trigger/ content/ nav/

const { chromium } = require("playwright");
const { mkdirSync, writeFileSync } = require("fs");
const { join } = require("path");

const FILE = "file:///C:/Users/Admin/Desktop/TukDaeng/Prototypes/feed-social-redesign.html";
const ROOT = join(__dirname, "..", "deliverables", "feed-redesign-review", "sections");
for (const sub of ["", "layouts", "trigger", "content", "nav", "tabs", "detail", "ask"])
  mkdirSync(join(ROOT, sub), { recursive: true });

const NAMES = ["dark", "light"];

const VARIANTS = [
  ["a1", "A1 — Flat / hidden price"],
  ["a2", "A2 — Flat / price overlay"],
  ["a3", "A3 — Flat / quiet price"],
  ["b1", "B1 — Card / hidden price"],
  ["b2", "B2 — Card / price overlay"],
  ["b3", "B3 — Card / price footer"],
  ["c1", "C1 — Edge-photo card / hidden"],
  ["c2", "C2 — Edge-photo card / overlay"],
  ["c3", "C3 — Edge-photo card / footer"],
  ["mixed", "Mixed — FOR SALE vs SHOWCASE"],
];
const TRIGGERS = [
  ["t1", "T1 — Bar"],
  ["t2", "T2 — Line + knob"],
  ["t3", "T3 — Hairline text"],
];
const CONTENTS = [
  ["d1", "D1 — Spec tiles"],
  ["d2", "D2 — List rows"],
  ["d3", "D3 — Chips"],
];
const NAVS = [
  ["labeled", "N1 — With labels"],
  ["icons", "N2 — Icons only (IG)"],
];
const ASKS = [
  ["outline", "K1 — Outline pill"],
  ["solid", "K2 — Solid red"],
  ["txt", "K3 — Text link"],
  ["ico", "K4 — Icon only"],
];
const TABS = [
  ["text", "F1 — Text underline"],
  ["textc", "F1c — Text centered"],
  ["chips", "F2 — Chips"],
  ["chipsc", "F2c — Chips centered"],
  ["segment", "F3 — Segmented"],
  ["none", "F4 — None (pure IG)"],
];

const css = `
  body{font-family:"Segoe UI",Arial,sans-serif;background:#141417;color:#eee;margin:0;padding:30px}
  h1{font-size:24px;margin:0 0 24px;font-weight:700}
  h1 span{color:#c8212b}
  .grid{display:grid;grid-template-columns:repeat(5,1fr);gap:16px}
  .card{background:#1e1e24;border:1px solid #333;border-radius:14px;padding:14px;margin-bottom:18px}
  .lbl{font-size:14px;font-weight:600;margin-bottom:10px;color:#d8d8de}
  .imgs{display:flex;gap:14px;align-items:flex-start}
  .it{text-align:center}
  .tag{font-size:10px;color:#8b8b95;margin-top:6px;text-transform:uppercase;letter-spacing:.08em}
  img{display:block;border-radius:8px;background:#0a0a0c}
`;

let compPage;
async function shotHtml(page, title, bodyHtml, outfile, width) {
  const fp = join(ROOT, "_tmp.html");
  writeFileSync(fp, `<!doctype html><meta charset="utf-8"><style>${css}</style><h1><span>TUK DAENG</span> · ${title}</h1>${bodyHtml}`);
  await compPage.goto("file:///" + fp.replace(/\\/g, "/"));
  await compPage.waitForTimeout(400);
  await compPage.screenshot({ path: join(ROOT, outfile), fullPage: true });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1500, height: 1200 } });
  compPage = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
  await page.goto(FILE);
  await page.waitForTimeout(700);

  // ---------- SECTION 1: layouts ----------
  const SCROLL_FOR_PRICE = new Set(["a3", "b3", "c3"]);
  for (const [v] of VARIANTS) {
    await page.click(`[data-v="${v}"]`);
    await page.waitForTimeout(400);
    const phones = await page.$$(".phone");
    if (SCROLL_FOR_PRICE.has(v)) {
      for (const ph of phones)
        await ph.$eval(".feed-scroll", (el) => {
          const t = el.querySelector(".quiet-price, .price-footer");
          if (t) el.scrollTop = t.offsetTop - el.clientHeight + t.offsetHeight + 110;
        });
      await page.waitForTimeout(300);
    }
    for (let i = 0; i < 2; i++)
      await phones[i].screenshot({ path: join(ROOT, "layouts", `${v}-${NAMES[i]}.png`) });
  }
  for (let i = 0; i < 2; i++) {
    const cells = VARIANTS.map(([v, label]) =>
      `<div class="it"><div class="lbl" style="font-size:12px">${label}</div><img src="layouts/${v}-${NAMES[i]}.png" width="215"></div>`
    ).join("");
    await shotHtml(page, `Feed layouts — ${NAMES[i].toUpperCase()}`, `<div class="grid">${cells}</div>`, `01-layouts-${NAMES[i]}.png`);
  }

  // ---------- SECTION 2: details trigger ----------
  await page.click(`[data-v="a1"]`);
  await page.click(`[data-d="d1"]`);
  await page.waitForTimeout(300);
  const tRows = [];
  for (const [t, label] of TRIGGERS) {
    await page.click(`[data-t="${t}"]`);
    await page.waitForTimeout(400);
    const phones = await page.$$(".phone");
    const imgs = [];
    for (let i = 0; i < 2; i++) {
      await phones[i].$eval(".feed-scroll", (el) => {
        const t = el.querySelector(".details-toggle");
        if (t) t.scrollIntoView({ block: "center" });
      });
      await page.waitForTimeout(250);
      const tgl = await phones[i].$(".details-toggle");
      const fp = join(ROOT, "trigger", `${t}-${NAMES[i]}.png`);
      await tgl.screenshot({ path: fp });
      await phones[i].screenshot({ path: join(ROOT, "trigger", `${t}-${NAMES[i]}-ctx.png`) });
      imgs.push(`<div class="it"><img src="trigger/${t}-${NAMES[i]}.png" width="340"><div class="tag">${NAMES[i]}</div></div>`);
    }
    tRows.push({ label, imgs });
  }
  await shotHtml(page, "Details trigger styles",
    tRows.map(r => `<div class="card"><div class="lbl">${r.label}</div><div class="imgs">${r.imgs.join("")}</div></div>`).join(""),
    "02-details-trigger.png");

  // ---------- SECTION 3: details content ----------
  await page.click(`[data-t="t1"]`);
  await page.waitForTimeout(300);
  const cRows = [];
  for (const [d, label] of CONTENTS) {
    await page.click(`[data-d="${d}"]`);
    await page.waitForTimeout(400);
    const phones = await page.$$(".phone");
    const imgs = [];
    for (let i = 0; i < 2; i++) {
      const tgl = await phones[i].$(".details-toggle");
      await tgl.click();
      await page.waitForTimeout(300);
      await phones[i].$eval(".feed-scroll", (el) => {
        const t = el.querySelector(".details-inner");
        if (t) t.scrollIntoView({ block: "center" });
      });
      await page.waitForTimeout(250);
      const inner = await phones[i].$(".details-inner");
      const fp = join(ROOT, "content", `${d}-${NAMES[i]}.png`);
      await inner.screenshot({ path: fp });
      await phones[i].screenshot({ path: join(ROOT, "content", `${d}-${NAMES[i]}-ctx.png`) });
      imgs.push(`<div class="it"><img src="content/${d}-${NAMES[i]}.png" width="340"><div class="tag">${NAMES[i]}</div></div>`);
    }
    cRows.push({ label, imgs });
  }
  await shotHtml(page, "Details content styles",
    cRows.map(r => `<div class="card"><div class="lbl">${r.label}</div><div class="imgs">${r.imgs.join("")}</div></div>`).join(""),
    "03-details-content.png");

  // ---------- SECTION 3.5: feed tabs ----------
  const fRows = [];
  for (const [f, label] of TABS) {
    await page.click(`[data-ft="${f}"]`);
    await page.waitForTimeout(400);
    const phones = await page.$$(".phone");
    for (const ph of phones)
      await ph.$eval(".feed-scroll", (el) => { el.scrollTop = 0; });
    await page.waitForTimeout(250);
    const imgs = [];
    for (let i = 0; i < 2; i++) {
      await phones[i].screenshot({ path: join(ROOT, "tabs", `${f}-${NAMES[i]}-ctx.png`) });
      if (f !== "none") {
        const tabs = await phones[i].$(".feed-tabs");
        const fp = join(ROOT, "tabs", `${f}-${NAMES[i]}.png`);
        await tabs.screenshot({ path: fp });
        imgs.push(`<div class="it"><img src="tabs/${f}-${NAMES[i]}.png" width="340"><div class="tag">${NAMES[i]}</div></div>`);
      } else {
        await phones[i].$eval(".wordmark", (w) => w.click());
        await page.waitForTimeout(250);
        await phones[i].screenshot({ path: join(ROOT, "tabs", `${f}-${NAMES[i]}-menu.png`) });
        const menu = await phones[i].$(".brand-menu");
        await menu.screenshot({ path: join(ROOT, "tabs", `${f}-${NAMES[i]}-menu-crop.png`) });
        imgs.push(`<div class="it"><img src="tabs/${f}-${NAMES[i]}-menu-crop.png" width="200"><div class="tag">${NAMES[i]}</div></div>`);
      }
    }
    fRows.push({ label, imgs });
  }
  await shotHtml(page, "Feed tabs styles",
    fRows.map(r => `<div class="card"><div class="lbl">${r.label}</div><div class="imgs">${r.imgs.join("")}</div></div>`).join(""),
    "05-feed-tabs.png");
  await page.click(`[data-ft="text"]`);

  // ---------- SECTION 4: bottom nav ----------
  const nRows = [];
  for (const [n, label] of NAVS) {
    await page.click(`[data-n="${n}"]`);
    await page.waitForTimeout(400);
    const phones = await page.$$(".phone");
    for (const ph of phones)
      await ph.$eval(".feed-scroll", (el) => { el.scrollTop = 0; });
    await page.waitForTimeout(250);
    const imgs = [];
    for (let i = 0; i < 2; i++) {
      await phones[i].screenshot({ path: join(ROOT, "nav", `${n}-${NAMES[i]}-ctx.png`) });
      const nav = await phones[i].$(".bottom-nav");
      const home = await phones[i].$(".home-ind");
      const nb = await nav.boundingBox();
      const hb = await home.boundingBox();
      const clip = { x: nb.x, y: nb.y, width: nb.width, height: hb.y + hb.height - nb.y };
      const fp = join(ROOT, "nav", `${n}-${NAMES[i]}.png`);
      await page.screenshot({ path: fp, clip });
      imgs.push(`<div class="it"><img src="nav/${n}-${NAMES[i]}.png" width="340"><div class="tag">${NAMES[i]}</div></div>`);
    }
    nRows.push({ label, imgs });
  }
  await shotHtml(page, "Bottom nav styles",
    nRows.map(r => `<div class="card"><div class="lbl">${r.label}</div><div class="imgs">${r.imgs.join("")}</div></div>`).join(""),
    "04-bottom-nav.png");

  // ---------- SECTION 5.5: ask button ----------
  const kRows = [];
  for (const [k, label] of ASKS) {
    await page.click(`[data-k="${k}"]`);
    await page.waitForTimeout(400);
    const phones = await page.$$(".phone");
    const imgs = [];
    for (let i = 0; i < 2; i++) {
      await phones[i].$eval(".feed-scroll", (el) => {
        const t = el.querySelector(".post-actions");
        if (t) t.scrollIntoView({ block: "center" });
      });
      await page.waitForTimeout(250);
      await phones[i].screenshot({ path: join(ROOT, "ask", `${k}-${NAMES[i]}-ctx.png`) });
      const row = await phones[i].$(".post-actions");
      const fp = join(ROOT, "ask", `${k}-${NAMES[i]}.png`);
      await row.screenshot({ path: fp });
      imgs.push(`<div class="it"><img src="ask/${k}-${NAMES[i]}.png" width="340"><div class="tag">${NAMES[i]}</div></div>`);
    }
    kRows.push({ label, imgs });
  }
  await shotHtml(page, "Ask button styles",
    kRows.map(r => `<div class="card"><div class="lbl">${r.label}</div><div class="imgs">${r.imgs.join("")}</div></div>`).join(""),
    "07-ask-button.png");
  await page.click(`[data-k="auto"]`);

  // ---------- SECTION 6: detail page ----------
  await page.click(`[data-v="a1"]`);
  await page.click(`[data-ft="text"]`);
  await page.waitForTimeout(400);
  const dPhones = await page.$$(".phone");
  const detImgs = [];
  for (let i = 0; i < 2; i++) {
    const ph = dPhones[i];
    await ph.$eval(".feed-scroll", (el) => { el.scrollTop = 0; });
    const tgl = await ph.$(".details-toggle");
    await tgl.click();
    await page.waitForTimeout(250);
    const inner = await ph.$(".details-inner");
    await inner.click();
    await page.waitForTimeout(450);
    await ph.screenshot({ path: join(ROOT, "detail", `top-${NAMES[i]}.png`) });
    await ph.$eval(".detail-scroll", (el) => { el.scrollTop = el.scrollHeight; });
    await page.waitForTimeout(300);
    await ph.screenshot({ path: join(ROOT, "detail", `specs-${NAMES[i]}.png`) });
    const cb = await ph.$(".page-detail .comment-btn");
    await cb.click();
    await page.waitForTimeout(450);
    await ph.screenshot({ path: join(ROOT, "detail", `comments-${NAMES[i]}.png`) });
    detImgs.push(`<div class="it"><img src="detail/top-${NAMES[i]}.png" width="215"><div class="tag">${NAMES[i]} · top</div></div>`,
      `<div class="it"><img src="detail/specs-${NAMES[i]}.png" width="215"><div class="tag">${NAMES[i]} · specs</div></div>`,
      `<div class="it"><img src="detail/comments-${NAMES[i]}.png" width="215"><div class="tag">${NAMES[i]} · comments</div></div>`);
  }
  await shotHtml(page, "Detail page (Layer 3)",
    `<div class="imgs">${detImgs.join("")}</div>`, "06-detail.png");

  await browser.close();
  console.log("done ->", ROOT);
})().catch(e => { console.error(e); process.exit(1); });
