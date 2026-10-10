// Create Post review: capture section images (dark+light per option)
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const URL = "http://127.0.0.1:4173/feed-create-post.html";
const OUT = "C:/Users/Admin/Desktop/TukDaeng/deliverables/create-post-review/sections";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 950 }, deviceScaleFactor: 2 });
await page.goto(URL);
await page.waitForLoadState("domcontentloaded");
await page.waitForTimeout(600);

const BASE = { sel: false, fill: "filled" };

async function snap(name, st) {
  for (const theme of ["dark", "light"]) {
    await page.evaluate(({ st }) => { Object.assign(state, st); render(); }, { st });
    await page.waitForTimeout(130);
    await page.locator(`.screen[data-theme="${theme}"]`).locator("..")
      .screenshot({ path: `${OUT}/${name}-${theme}.png` });
    console.log(`${name}-${theme}.png`);
  }
}

// F2 IG two-step flow — picker / multi-select / caption / empty / presentation
await snap("f2-picker", { ...BASE });
await snap("f2-selmode", { ...BASE, sel: true });
await snap("f2-picker-empty", { ...BASE, fill: "empty" });
for (const theme of ["dark", "light"]) {
  await page.evaluate(({ st }) => { Object.assign(state, st); render(); }, { st: { ...BASE } });
  await page.locator(`.screen[data-theme="${theme}"] .cp-next`).click();
  await page.waitForTimeout(380);
  await page.locator(`.screen[data-theme="${theme}"]`).locator("..")
    .screenshot({ path: `${OUT}/f2-caption-${theme}.png` });
  console.log(`f2-caption-${theme}.png`);
}

await browser.close();
console.log("done");
