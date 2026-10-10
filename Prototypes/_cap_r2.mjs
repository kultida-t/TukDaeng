// Round-2 review: capture all section images (dark+light per option)
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const URL = "http://127.0.0.1:4173/feed-social-redesign.html";
const OUT = "C:/Users/Admin/Desktop/TukDaeng/deliverables/feed-redesign-review/round2/sections";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
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
  }, { theme, st: { ...BASE, pr: "pr4" } });
  await shot("pr-pr4-specs", theme);
}

// --- DH1-DH5 (detail header) ---
for (const dh of ["dh1", "dh2", "dh3", "dh4", "dh5"]) {
  for (const theme of ["dark", "light"]) {
    await detailShot(`dh-${dh}`, theme, { ...BASE, dh }, false);
  }
}

await browser.close();
console.log("done");
