// verify F2 IG flow
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const URL = "http://127.0.0.1:4173/feed-create-post.html";
const OUT = "C:/Users/Admin/Desktop/TukDaeng/Prototypes/screenshots/cp";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 950 }, deviceScaleFactor: 2 });
const errors = [];
page.on("pageerror", e => errors.push("PAGEERROR: " + e.message));
page.on("console", m => { if (m.type() === "error") errors.push("CONSOLE: " + m.text()); });
await page.goto(URL);
await page.waitForLoadState("domcontentloaded");
await page.waitForTimeout(600);

async function snap(name, theme = "dark") {
  await page.waitForTimeout(140);
  await page.locator(`.screen[data-theme="${theme}"]`).locator("..")
    .screenshot({ path: `${OUT}/${name}-${theme}.png` });
  console.log(`${name}-${theme}`);
}

// default = f2 picker filled
await snap("f2-picker");
await snap("f2-picker", "light");
// click ถัดไป → step2 caption
await page.locator('.screen[data-theme="dark"] .cp-next').click();
await page.waitForTimeout(400);
await snap("f2-cap");
await page.locator('.screen[data-theme="light"] .cp-next').click();
await page.waitForTimeout(400);
await snap("f2-cap", "light");
// multi-select mode
await page.evaluate(() => { Object.assign(state, { fill: "filled" }); render(); });
await page.locator('.screen[data-theme="dark"] [data-selmode]').click();
await page.waitForTimeout(250);
await snap("f2-selmode");
await page.locator('.screen[data-theme="light"] [data-selmode]').click();
await page.waitForTimeout(250);
await snap("f2-selmode", "light");
// empty state picker
await page.evaluate(() => { Object.assign(state, { sel: false, fill: "empty" }); render(); });
await snap("f2-picker-empty");
await snap("f2-picker-empty", "light");
console.log("ERRORS:", errors.length ? errors : "none");
await browser.close();
