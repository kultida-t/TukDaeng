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

// --- overview combo (พี่คิง selection) ---
for (const theme of ["dark", "light"]) {
  await feedShot("combo-feed", theme, { ...BASE }, 0);
  await feedShot("combo-details", theme, { ...BASE }, "details");
  await feedShot("nav-floating", theme, { ...BASE }, 380);
  await detailShot("combo-detail", theme, { ...BASE }, false);
}

// --- DS1-DS5 (detail specs) ---
for (const ds of ["full", "acc", "cards", "tabs", "seg"]) {
  for (const theme of ["dark", "light"]) {
    await detailShot(`ds-${ds}`, theme, { ...BASE, ds }, true);
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
      if (cfg.close) sc.querySelector(".ds-acc.open")?.classList.remove("open");
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
    await shot(name, theme);
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
    const altName = ds === "acc" ? "ds-acc-closed-feed" : `ds-${ds}-pricing-feed`;
    await page.evaluate(({ theme, ds }) => {
      const scr = document.querySelector(`.screen[data-theme="${theme}"]`);
      const fs = scr.querySelector(".feed-scroll");
      const inner = scr.querySelector(".details-inner");
      if (ds === "acc") inner.querySelector(".ds-acc.open")?.classList.remove("open");
      if (ds === "tabs" || ds === "seg") inner.querySelectorAll(".ds-tab")[2]?.click();
      let anchor;
      if (ds === "full") anchor = [...inner.querySelectorAll(".spec-sec")].find(h => h.textContent.includes("Item Details"));
      else if (ds === "cards") anchor = inner.querySelectorAll(".ds-card")[1];
      else anchor = inner.querySelector(".ds-acc, .ds-tabs, .spec-sec");
      if (anchor) fs.scrollTop = anchor.getBoundingClientRect().top - fs.getBoundingClientRect().top + fs.scrollTop - 70;
    }, { theme, ds });
    await shot(altName, theme);
  }
}

// --- PR1-PR4 (detail price placement) ---
for (const pr of ["pr1", "pr2", "pr3", "pr4"]) {
  for (const theme of ["dark", "light"]) {
    await detailShot(`pr-${pr}`, theme, { ...BASE, pr }, false);
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
}

// --- DH1-DH5 (detail header) ---
for (const dh of ["dh1", "dh2", "dh3", "dh4", "dh5"]) {
  for (const theme of ["dark", "light"]) {
    await detailShot(`dh-${dh}`, theme, { ...BASE, dh }, false);
  }
}

await browser.close();
console.log("done");
