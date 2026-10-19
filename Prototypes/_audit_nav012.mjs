import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { pathToFileURL } from "url";
const FILE_URL = pathToFileURL("d:/TukDaeng/Prototypes/fo-flow/index.html").href;
const OUT = "d:/TukDaeng/Prototypes/screenshots/task-NAV-012/before";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
await page.goto(FILE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
console.log(await page.evaluate(() => [document.querySelectorAll(".screen").length, [...document.querySelectorAll(".screen")].map(s => JSON.stringify(s.getBoundingClientRect()))].join("\n")));
const scr = page.locator(".screen").first();
for (const theme of ["dark", "light"]) {
  await page.evaluate(t => document.querySelector(".screen").setAttribute("data-theme", t), theme);
  for (const [i, k] of ["feed", "chat", "board", "alerts", "profile"].entries()) {
    await page.evaluate(k => document.querySelector(`.screen [data-navgo="${k}"]`).click(), k);
    await page.waitForTimeout(500);
    await scr.screenshot({ path: `${OUT}/tab${i}-${k}-${theme}.png` });
  }
}
await browser.close();
