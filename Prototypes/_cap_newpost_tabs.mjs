// capture after-evidence for CREATE-002 at standard evidence viewports (d/t/m)
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const URL = "http://127.0.0.1:4173/fo-flow/index.html";
const OUT = import.meta.dirname + "/screenshots/task-CREATE-002/after";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

for (const [prefix, vp] of [["d", { width: 1920, height: 1080 }], ["t", { width: 768, height: 1024 }], ["m", { width: 440, height: 956 }]]) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 2 });
  const errors = [];
  page.on("pageerror", e => errors.push("PAGEERROR: " + e.message));
  await page.goto(URL);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(700);

  await page.locator("[data-flow='create']").first().click();
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${OUT}/${prefix}-picker.png` });

  /* mixed select: photo + video */
  await page.locator(".cf [data-selmode]").click();
  await page.locator(".cf .ig-grid .cell[data-i]").nth(1).click();
  await page.locator(".cf .ig-grid .cell:has(.dur)").first().click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT}/${prefix}-picker-mixed.png` });

  await page.locator(".cf .cf-next").click();
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${OUT}/${prefix}-caption.png` });

  /* share with empty caption → feed card has no caption line */
  await page.locator(".cf .cf-share").click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/${prefix}-feed-empty-caption.png` });
  if (errors.length) console.log(prefix, "ERRORS:", errors);
  await page.close();
  console.log(prefix, "done");
}
await browser.close();
