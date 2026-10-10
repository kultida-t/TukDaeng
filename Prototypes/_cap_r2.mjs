// Round-2 review: capture all section images (dark+light per option)
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const URL = "http://127.0.0.1:4173/feed-social-redesign.html";
const OUT = "C:/Users/Admin/Desktop/TukDaeng/deliverables/feed-redesign-review/round2/sections";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 950 }, deviceScaleFactor: 3 });
await page.goto(URL);
await page.waitForLoadState("domcontentloaded");
await page.waitForTimeout(700);

const BASE = { variant: "a1", tStyle: "t3", dStyle: "d2", nav: "labeled", ft: "chipsc", ask: "outline", ds: "full", pr: "pr1", dh: "dh1" };

async function shot(name, theme) {
  await page.waitForTimeout(140);
  await page.locator(`.screen[data-theme="${theme}"]`).locator('..')
    .screenshot({ path: `${OUT}/${name}-${theme}.png` });
  console.log(`${name}-${theme}.png`);
}

async function feedShot(name, theme, st, scrollMode) {
  await page.evaluate(({ theme, st, scrollMode }) => {
    Object.assign(state, st);
    render();
    const scr = document.querySelector(`.screen[data-theme="${theme}"]`);
    scr.classList.remove("detail-open", "comments-open");
    if (scrollMode === "details") {
      const t = scr.querySelector(".details-toggle");
      t?.click();
      const fs = scr.querySelector(".feed-scroll");
      fs.scrollTop = t.offsetTop - 150;
    } else if (typeof scrollMode === "number") {
      scr.querySelector(".feed-scroll").scrollTop = scrollMode;
    }
  }, { theme, st, scrollMode });
  await shot(name, theme);
}

async function detailShot(name, theme, st, scrollSpec) {
  await page.evaluate(({ theme, st, scrollSpec }) => {
    Object.assign(state, st);
    render();
    const scr = document.querySelector(`.screen[data-theme="${theme}"]`);
    const pd = scr.querySelector(".page-detail");
    pd.innerHTML = detailHTML(POSTS[0]);
    scr.classList.add("detail-open");
    const sc = pd.querySelector(".detail-scroll");
    if (scrollSpec) {
      const t = sc.querySelector(".ds-acc, .ds-tabs, .ds-cards")
        || [...sc.querySelectorAll(".detail-h")].find(h => h.textContent.includes("Watch Specifications"));
      if (t) { t.scrollIntoView(); sc.scrollTop -= 8; }
      scr.scrollTop = 0;
    } else {
      sc.scrollTop = 0;
    }
  }, { theme, st, scrollSpec });
  await shot(name, theme);
}

// --- zoom-strip helpers ---
async function zshot(file, clip) {
  await page.screenshot({ path: `${OUT}/${file}.png`, clip });
  console.log(`${file}.png`);
}
async function clipTop(sel, h) {
  const b = await page.locator(sel).boundingBox();
  return { x: b.x, y: b.y, width: b.width, height: h };
}
const clipFeed = (theme, h) => clipTop(`.screen[data-theme="${theme}"] .feed-scroll`, h);
// clip h px from the anchor element (found by finderSrc, eval'd in page) inside scrollSel.
// Edges snap to element boundaries — margin above anchor, last fully-visible row at bottom —
// so focused content is never clipped mid-element.
async function clipIn(theme, scrollSel, finderSrc, h = 150, padTop = 14, padBottom = 14) {
  return await page.evaluate(({ theme, scrollSel, finderSrc, h, padTop, padBottom }) => {
    const scr = document.querySelector(`.screen[data-theme="${theme}"]`);
    const sc = scr.querySelector(scrollSel);
    const el = eval(finderSrc)(sc);
    const a = el.getBoundingClientRect(), s = sc.getBoundingClientRect();
    const prev = el.previousElementSibling;
    const gapTop = prev ? Math.max(0, a.y - prev.getBoundingClientRect().bottom)
                        : Math.max(0, a.y - el.parentElement.getBoundingClientRect().top);
    const y = Math.max(s.y, a.y - Math.min(padTop, gapTop));
    let last = el;
    for (const e of sc.querySelectorAll(".spec-row, .ds-acc, .ds-card, .detail-h, .spec-sec, .tag-price-row, .inline-tag, .detail-seller, .detail-price")) {
      const r = e.getBoundingClientRect();
      if (r.top >= a.y - 1 && r.bottom <= a.y + h) last = e;
    }
    const b = last.getBoundingClientRect();
    const nxt = last.nextElementSibling;
    const gapB = nxt ? Math.max(0, nxt.getBoundingClientRect().top - b.bottom) : padBottom;
    const bottom = Math.min(s.y + s.height, b.bottom + Math.min(padBottom, gapB));
    return { x: s.x, y, width: s.width, height: bottom - y };
  }, { theme, scrollSel, finderSrc, h, padTop, padBottom });
}
// clip from startEl top to endEl bottom (+ margins only) inside the detail scrollport
async function clipRange(theme, startSrc, endSrc, padTop = 18, padBottom = 18) {
  return await page.evaluate(({ theme, startSrc, endSrc, padTop, padBottom }) => {
    const sc = document.querySelector(`.screen[data-theme="${theme}"] .page-detail .detail-scroll`);
    const s = sc.getBoundingClientRect();
    const elA = eval(startSrc)(sc), elB = eval(endSrc)(sc);
    const a = elA.getBoundingClientRect(), b = elB.getBoundingClientRect();
    const prev = elA.previousElementSibling;
    const gapTop = prev ? Math.max(0, a.y - prev.getBoundingClientRect().bottom)
                        : Math.max(0, a.y - elA.parentElement.getBoundingClientRect().top);
    const nxt = elB.nextElementSibling;
    const gapB = nxt ? Math.max(0, nxt.getBoundingClientRect().top - b.bottom) : padBottom;
    const y = Math.max(s.y, a.y - Math.min(padTop, gapTop));
    const bottom = Math.min(s.y + s.height, b.bottom + Math.min(padBottom, gapB));
    return { x: s.x, y, width: s.width, height: bottom - y };
  }, { theme, startSrc, endSrc, padTop, padBottom });
}
async function scrollDetail(theme, sel, up = 0) {
  await page.evaluate(({ theme, sel, up }) => {
    const sc = document.querySelector(`.screen[data-theme="${theme}"] .page-detail .detail-scroll`);
    sc.querySelector(sel)?.scrollIntoView();
    sc.scrollTop -= up;
  }, { theme, sel, up });
  await page.waitForTimeout(120);
}

// --- overview combo (พี่คิง selection) ---
for (const theme of ["dark", "light"]) {
  const scr = `.screen[data-theme="${theme}"]`;
  await feedShot("combo-feed", theme, { ...BASE }, 0);
  await page.locator(`${scr} .feed-tabs`).screenshot({ path: `${OUT}/combo-feed-tabs-${theme}.png` });
  console.log(`combo-feed-tabs-${theme}.png`);
  await page.locator(`${scr} .feed-scroll .post-actions`).first()
    .screenshot({ path: `${OUT}/combo-feed-act-${theme}.png` });
  console.log(`combo-feed-act-${theme}.png`);
  await feedShot("combo-details", theme, { ...BASE }, "details");
  await zshot(`combo-details-zoom-${theme}`, await clipIn(theme, ".feed-scroll",
    `sc => sc.querySelector(".details-toggle")`, 190));
  await feedShot("nav-floating", theme, { ...BASE }, 380);
  {
    const a = await page.locator(`${scr} .bottom-nav`).boundingBox();
    const b = await page.locator(`${scr} .home-ind`).boundingBox();
    await zshot(`nav-floating-zoom-${theme}`, { x: a.x, y: a.y - 12, width: a.width, height: b.y + b.height - (a.y - 12) });
  }
  await detailShot("combo-detail", theme, { ...BASE }, false);
  await page.locator(`${scr} .page-detail .detail-head`)
    .screenshot({ path: `${OUT}/combo-detail-head-${theme}.png` });
  console.log(`combo-detail-head-${theme}.png`);
  await scrollDetail(theme, ".post-actions", 40);
  await page.locator(`${scr} .page-detail .post-actions`)
    .screenshot({ path: `${OUT}/combo-detail-act-${theme}.png` });
  console.log(`combo-detail-act-${theme}.png`);
  await zshot(`combo-detail-zoom-${theme}`, await clipRange(theme,
    `sc => sc.querySelector(".post-actions")`, `sc => sc.querySelector(".detail-price")`));
}

// --- DS1-DS5 (detail specs) ---
for (const ds of ["full", "acc", "cards", "tabs", "seg"]) {
  for (const theme of ["dark", "light"]) {
    await detailShot(`ds-${ds}`, theme, { ...BASE, ds }, true);
    await zshot(`ds-${ds}-zoom-${theme}`, await clipIn(theme, ".page-detail .detail-scroll",
      `sc => sc.querySelector(".ds-acc, .ds-tabs, .ds-cards") || [...sc.querySelectorAll(".detail-h")].find(h => h.textContent.includes("Watch Specifications"))`, 150));
  }
}

// --- DS alternate states (row 2 of sheet R2-3) ---
const dsAlt = {
  "ds-full-2":       { ds: "full", scroll: "Item Details" },
  "ds-acc-closed":   { ds: "acc", close: true },
  "ds-cards-2":      { ds: "cards", scrollCard: 1 },
  "ds-tabs-pricing": { ds: "tabs", tab: 2 },
  "ds-seg-pricing":  { ds: "seg", tab: 2 },
};
for (const [name, cfg] of Object.entries(dsAlt)) {
  for (const theme of ["dark", "light"]) {
    await page.evaluate(({ theme, cfg, base }) => {
      Object.assign(state, base, { ds: cfg.ds });
      render();
      const scr = document.querySelector(`.screen[data-theme="${theme}"]`);
      const pd = scr.querySelector(".page-detail");
      pd.innerHTML = detailHTML(POSTS[0]);
      scr.classList.add("detail-open");
      const sc = pd.querySelector(".detail-scroll");
      if (cfg.close) sc.querySelectorAll(".ds-acc.open").forEach(el => el.classList.remove("open"));
      if (cfg.tab != null) sc.querySelectorAll(".ds-tab")[cfg.tab]?.click();
      const anchor = cfg.scroll
        ? [...sc.querySelectorAll(".detail-h")].find(h => h.textContent.includes(cfg.scroll))
        : cfg.scrollCard != null
          ? sc.querySelectorAll(".ds-card")[cfg.scrollCard]
          : sc.querySelector(".ds-acc, .ds-tabs, .ds-cards")
            || [...sc.querySelectorAll(".detail-h")].find(h => h.textContent.includes("Watch Specifications"));
      if (anchor) { anchor.scrollIntoView(); sc.scrollTop -= 8; }
      scr.scrollTop = 0;
    }, { theme, cfg, base: BASE });
    if (cfg.close) await page.waitForTimeout(420);
    await shot(name, theme);
    const zfind = cfg.scroll
      ? `sc => [...sc.querySelectorAll(".detail-h")].find(h => h.textContent.includes("${cfg.scroll}"))`
      : cfg.scrollCard != null
        ? `sc => sc.querySelectorAll(".ds-card")[${cfg.scrollCard}]`
        : `sc => sc.querySelector(".ds-acc, .ds-tabs, .ds-cards")`;
    await zshot(`${name}-zoom-${theme}`, await clipIn(theme, ".page-detail .detail-scroll", zfind, 150));
  }
}

// --- DS in feed expander (sheet R2-4: first + alt states) ---
for (const ds of ["full", "acc", "cards", "tabs", "seg"]) {
  for (const theme of ["dark", "light"]) {
    await page.evaluate(({ theme, ds, base }) => {
      Object.assign(state, base, { ds });
      render();
      const scr = document.querySelector(`.screen[data-theme="${theme}"]`);
      scr.classList.remove("detail-open", "comments-open");
      scr.querySelector(".details-toggle")?.click();
    }, { theme, ds, base: BASE });
    await page.waitForTimeout(380);
    await page.evaluate(({ theme, ds }) => {
      const scr = document.querySelector(`.screen[data-theme="${theme}"]`);
      const fs = scr.querySelector(".feed-scroll");
      const inner = scr.querySelector(".details-inner");
      const anchor = inner.querySelector(".ds-acc, .ds-tabs, .ds-cards, .spec-sec");
      if (anchor) fs.scrollTop = anchor.getBoundingClientRect().top - fs.getBoundingClientRect().top + fs.scrollTop - 70;
    }, { theme, ds });
    await shot(`ds-${ds}-feed`, theme);
    await zshot(`ds-${ds}-feed-zoom-${theme}`, await clipFeed(theme, 240));
    const altName = ds === "acc" ? "ds-acc-closed-feed" : `ds-${ds}-pricing-feed`;
    await page.evaluate(({ theme, ds }) => {
      const scr = document.querySelector(`.screen[data-theme="${theme}"]`);
      const fs = scr.querySelector(".feed-scroll");
      const inner = scr.querySelector(".details-inner");
      if (ds === "acc") inner.querySelectorAll(".ds-acc.open").forEach(el => el.classList.remove("open"));
      if (ds === "tabs" || ds === "seg") inner.querySelectorAll(".ds-tab")[2]?.click();
      let anchor;
      if (ds === "full") anchor = [...inner.querySelectorAll(".spec-sec")].find(h => h.textContent.includes("Item Details"));
      else if (ds === "cards") anchor = inner.querySelectorAll(".ds-card")[1];
      else anchor = inner.querySelector(".ds-acc, .ds-tabs, .spec-sec");
      if (anchor) fs.scrollTop = anchor.getBoundingClientRect().top - fs.getBoundingClientRect().top + fs.scrollTop - 70;
    }, { theme, ds });
    if (ds === "acc") await page.waitForTimeout(420);
    await shot(altName, theme);
    await zshot(`${altName}-zoom-${theme}`, await clipFeed(theme, 240));
  }
}

// --- PR1-PR4 (detail price placement) ---
for (const pr of ["pr1", "pr2", "pr3", "pr4"]) {
  for (const theme of ["dark", "light"]) {
    await detailShot(`pr-${pr}`, theme, { ...BASE, pr }, false);
    const startSel = (pr === "pr2" || pr === "pr3") ? ".tag-price-row" : ".inline-tag";
    const endSel = pr === "pr1" ? ".detail-price" : ".detail-seller";
    await scrollDetail(theme, startSel, 40);
    await zshot(`pr-${pr}-zoom-${theme}`, await clipRange(theme,
      `sc => sc.querySelector("${startSel}")`, `sc => sc.querySelector("${endSel}")`));
  }
}
// PR4 extra: scrolled to Price & Data Source group
for (const theme of ["dark", "light"]) {
  await page.evaluate(({ theme, st }) => {
    Object.assign(state, st);
    render();
    const scr = document.querySelector(`.screen[data-theme="${theme}"]`);
    const pd = scr.querySelector(".page-detail");
    pd.innerHTML = detailHTML(POSTS[0]);
    scr.classList.add("detail-open");
    const sc = pd.querySelector(".detail-scroll");
    const t = [...sc.querySelectorAll(".detail-h")].find(h => h.textContent.includes("Price"));
    if (t) { t.scrollIntoView(); sc.scrollTop -= 8; }
    scr.scrollTop = 0;
  }, { theme, st: { ...BASE, pr: "pr4" } });
  await shot("pr-pr4-specs", theme);
  await zshot(`pr-pr4-specs-zoom-${theme}`, await clipIn(theme, ".page-detail .detail-scroll",
    `sc => [...sc.querySelectorAll(".detail-h")].find(h => h.textContent.includes("Price"))`, 220));
}

// --- N/A missing-data case (post 2 / sheet R2-7) ---
for (const theme of ["dark", "light"]) {
  // detail post 1 reference: same scroll region as the N/A shot
  await page.evaluate(({ theme, base }) => {
    Object.assign(state, base);
    render();
    const scr = document.querySelector(`.screen[data-theme="${theme}"]`);
    const pd = scr.querySelector(".page-detail");
    pd.innerHTML = detailHTML(POSTS[0]);
    scr.classList.add("detail-open");
    const sc = pd.querySelector(".detail-scroll");
    const row = [...sc.querySelectorAll(".spec-row")].find(r => r.querySelector(".l")?.textContent.trim() === "Reference");
    if (row) { row.scrollIntoView(); sc.scrollTop -= 8; }
    scr.scrollTop = 0;
  }, { theme, base: BASE });
  await shot("na-detail-p1", theme);
  await zshot(`na-detail-p1-zoom-${theme}`, await clipIn(theme, ".page-detail .detail-scroll",
    `sc => [...sc.querySelectorAll(".spec-row")].find(r => r.querySelector(".l")?.textContent.trim() === "Reference")`, 170));
  await page.evaluate(theme => {
    const sc = document.querySelector(`.screen[data-theme="${theme}"] .page-detail .detail-scroll`);
    [...sc.querySelectorAll(".detail-h")].find(h => h.textContent.includes("Price"))?.scrollIntoView();
  }, theme);
  await page.waitForTimeout(120);
  await zshot(`na-detail-p1-price-zoom-${theme}`, await clipIn(theme, ".page-detail .detail-scroll",
    `sc => [...sc.querySelectorAll(".detail-h")].find(h => h.textContent.includes("Price"))`, 220));
  // detail: scrolled to N/A rows in Watch Specifications
  await page.evaluate(({ theme, base }) => {
    Object.assign(state, base);
    render();
    const scr = document.querySelector(`.screen[data-theme="${theme}"]`);
    const pd = scr.querySelector(".page-detail");
    pd.innerHTML = detailHTML(POSTS[1]);
    scr.classList.add("detail-open");
    const sc = pd.querySelector(".detail-scroll");
    const naRow = [...sc.querySelectorAll(".spec-row")].find(r => r.querySelector(".v")?.textContent.trim() === "N/A");
    const target = naRow?.previousElementSibling?.previousElementSibling || naRow;
    if (target) { target.scrollIntoView(); sc.scrollTop -= 8; }
    scr.scrollTop = 0;
  }, { theme, base: BASE });
  await shot("na-detail", theme);
  await zshot(`na-detail-zoom-${theme}`, await clipIn(theme, ".page-detail .detail-scroll",
    `sc => { const n = [...sc.querySelectorAll(".spec-row")].find(r => r.querySelector(".v")?.textContent.trim() === "N/A"); return n?.previousElementSibling?.previousElementSibling || n; }`, 170));
  // detail: scrolled to Price & Data Source group
  await page.evaluate(({ theme, base }) => {
    Object.assign(state, base);
    render();
    const scr = document.querySelector(`.screen[data-theme="${theme}"]`);
    const pd = scr.querySelector(".page-detail");
    pd.innerHTML = detailHTML(POSTS[1]);
    scr.classList.add("detail-open");
    const sc = pd.querySelector(".detail-scroll");
    const t = [...sc.querySelectorAll(".detail-h")].find(h => h.textContent.includes("Item Details"));
    if (t) { t.scrollIntoView(); sc.scrollTop -= 8; }
    scr.scrollTop = 0;
  }, { theme, base: BASE });
  await shot("na-detail-2", theme);
  await zshot(`na-detail-2-zoom-${theme}`, await clipIn(theme, ".page-detail .detail-scroll",
    `sc => [...sc.querySelectorAll(".detail-h")].find(h => h.textContent.includes("Price"))`, 220));
  // feed expander of post 2 with N/A rows
  await page.evaluate(({ theme, base }) => {
    Object.assign(state, base);
    render();
    const scr = document.querySelector(`.screen[data-theme="${theme}"]`);
    scr.classList.remove("detail-open", "comments-open");
    scr.querySelector('.post[data-pid="p2"] .details-toggle')?.click();
  }, { theme, base: BASE });
  await page.waitForTimeout(380);
  await page.evaluate((theme) => {
    const scr = document.querySelector(`.screen[data-theme="${theme}"]`);
    const fs = scr.querySelector(".feed-scroll");
    const inner = scr.querySelector('.post[data-pid="p2"] .details-inner');
    const naRow = inner && [...inner.querySelectorAll(".spec-row")].find(r => r.querySelector(".v")?.textContent.trim() === "N/A");
    const target = naRow?.previousElementSibling?.previousElementSibling || naRow || inner;
    if (target) fs.scrollTop = target.getBoundingClientRect().top - fs.getBoundingClientRect().top + fs.scrollTop - 60;
  }, theme);
  await shot("na-feed", theme);
  await zshot(`na-feed-zoom-${theme}`, await clipIn(theme, ".feed-scroll",
    `sc => { const inner = sc.querySelector('.post[data-pid="p2"] .details-inner'); const n = inner && [...inner.querySelectorAll(".spec-row")].find(r => r.querySelector(".v")?.textContent.trim() === "N/A"); return n?.previousElementSibling?.previousElementSibling || n || inner; }`, 240));
  // feed expander post 2: scrolled to Item Details + Price groups
  await page.evaluate((theme) => {
    const scr = document.querySelector(`.screen[data-theme="${theme}"]`);
    const fs = scr.querySelector(".feed-scroll");
    const inner = scr.querySelector('.post[data-pid="p2"] .details-inner');
    const h = inner && [...inner.querySelectorAll(".spec-sec")].find(x => x.textContent.includes("Item Details"));
    const target = h || inner;
    if (target) fs.scrollTop = target.getBoundingClientRect().top - fs.getBoundingClientRect().top + fs.scrollTop - 60;
  }, theme);
  await shot("na-feed-2", theme);
  await zshot(`na-feed-2-zoom-${theme}`, await clipIn(theme, ".feed-scroll",
    `sc => { const inner = sc.querySelector('.post[data-pid="p2"] .details-inner'); return (inner && [...inner.querySelectorAll(".spec-sec")].find(x => x.textContent.includes("Price"))) || inner; }`, 230));
}

// --- DH1-DH5 (detail header) ---
for (const dh of ["dh1", "dh2", "dh3", "dh4", "dh5"]) {
  for (const theme of ["dark", "light"]) {
    await detailShot(`dh-${dh}`, theme, { ...BASE, dh }, false);
    if (dh === "dh4") {
      const hb = await page.locator(`.screen[data-theme="${theme}"] .page-detail .detail-hero`).boundingBox();
      await page.screenshot({
        path: `${OUT}/dh-${dh}-head-${theme}.png`,
        clip: { x: hb.x, y: hb.y, width: hb.width, height: 92 },
      });
    } else {
      await page.locator(`.screen[data-theme="${theme}"] .page-detail .detail-head`)
        .screenshot({ path: `${OUT}/dh-${dh}-head-${theme}.png` });
    }
    console.log(`dh-${dh}-head-${theme}.png`);
  }
}

await browser.close();
console.log("done");
