// verify: New post picker has no Post/Clip tabs; mixed photo+clip flow still works
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173";
const OUT = import.meta.dirname + "/screenshots/newpost-tabs";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
const errors = [];
page.on("pageerror", e => errors.push("PAGEERROR: " + e.message));
page.on("console", m => { if (m.type() === "error") errors.push("CONSOLE: " + m.text()); });

/* main app — open composer via the + button, check tabs are gone and picker works */
await page.goto(BASE + "/fo-flow/index.html");
await page.waitForLoadState("domcontentloaded");
await page.waitForTimeout(700);
await page.locator("[data-flow='create']").first().click();
await page.waitForTimeout(450);

const tabsCount = await page.locator(".cf .ig-tabs, .cf .ig-tab").count();
console.log("composer .ig-tab count:", tabsCount);
await page.screenshot({ path: `${OUT}/picker-empty.png` });

/* tap a photo cell → hero + Next enabled */
await page.locator(".cf .ig-grid .cell[data-i]").nth(1).click();
await page.waitForTimeout(250);
/* switch to multi-select and add a video cell (cells with .dur) */
await page.locator(".cf [data-selmode]").click();
await page.waitForTimeout(200);
await page.locator(".cf .ig-grid .cell:has(.dur)").first().click();
await page.waitForTimeout(250);
await page.screenshot({ path: `${OUT}/picker-mixed.png` });

/* Next → caption step */
await page.locator(".cf .cf-next").click();
await page.waitForTimeout(450);
const capTitle = await page.locator(".cf .cf-step2 .cf-head .t").textContent();
const thumbCount = await page.locator(".cf .cf-step2 .ig-thumb").count();
console.log("step2 title:", capTitle, "| thumbs:", thumbCount);
await page.screenshot({ path: `${OUT}/caption.png` });

/* back to picker, pick a lone video → caption shows clip thumb */
await page.locator(".cf .cf-back2").click();
await page.waitForTimeout(350);
await page.locator(".cf .ig-grid .cell[data-i]").nth(0).click(); // deselect current? (tap cell 0 single mode)
await page.locator(".cf [data-selmode]").click(); // leave selmode
await page.waitForTimeout(150);
await page.locator(".cf .ig-grid .cell:has(.dur)").first().click();
await page.waitForTimeout(200);
await page.locator(".cf .cf-next").click();
await page.waitForTimeout(450);
const clipThumb = await page.locator(".cf .cf-step2 .ig-thumb.clip").count();
console.log("lone clip thumb:", clipThumb);
await page.screenshot({ path: `${OUT}/caption-lone-clip.png` });

/* empty-caption share — feed card must not render a caption line at all */
await page.locator(".cf .cf-back2").click();
await page.waitForTimeout(350);
await page.locator(".cf .ig-grid .cell[data-i]").nth(2).click();
await page.waitForTimeout(200);
await page.locator(".cf .cf-next").click();
await page.waitForTimeout(450);
await page.locator(".cf .cf-share").click();
await page.waitForTimeout(600);
const firstCard = page.locator(".post").first();
const capCount = await firstCard.locator(".caption").count();
const capText = capCount ? (await firstCard.locator(".caption").textContent()).trim() : "(none)";
console.log("empty-caption post: .caption count:", capCount, "| text:", capText);
await page.screenshot({ path: `${OUT}/feed-empty-caption.png` });

/* standalone handoff pages */
for (const f of ["create-post.html", "feed-create-post.html"]) {
  await page.goto(`${BASE}/fo-flow/${f}`);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(500);
  const n = await page.locator(".ig-tabs, .ig-tab").count();
  console.log(f, "ig-tab count:", n);
  await page.screenshot({ path: `${OUT}/${f.replace(".html", "")}.png` });
}

console.log("ERRORS:", errors.length ? errors : "none");
await browser.close();
