import { chromium } from "playwright";
import { pathToFileURL } from "url";
const FILE_URL = pathToFileURL("d:/TukDaeng/Prototypes/fo-flow/index.html").href;
const OUT = "d:/TukDaeng/Prototypes/screenshots/task-NAV-012/before";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(FILE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
for (const theme of ["dark", "light"]) {
  await page.evaluate(t => document.querySelector(".screen").setAttribute("data-theme", t), theme);
  for (const k of ["profile", "chat"]) {
    await page.evaluate(k => document.querySelector(`.screen [data-navgo="${k}"]`).click(), k);
    await page.waitForTimeout(500);
    const b = await page.locator(".screen").first().boundingBox();
    await page.screenshot({ path: `${OUT}/nav-zoom-${k}-${theme}.png`, clip: { x: b.x, y: b.y + b.height - 110, width: b.width, height: 110 } });
    if (k==="chat") await page.screenshot({ path: `${OUT}/chathead-zoom-${theme}.png`, clip: { x: b.x, y: b.y, width: b.width, height: 130 } });
  }
}
console.log(await page.evaluate(() => { const n=document.querySelector(".bottom-nav"); const cs=getComputedStyle(n); const a=document.querySelector(".nav-item.active"); const ca=getComputedStyle(a); return JSON.stringify({bg:cs.backgroundColor,bf:cs.backdropFilter,bd:cs.border,sh:cs.boxShadow,abg:ca.backgroundColor,chip:getComputedStyle(document.querySelector(".screen")).getPropertyValue("--chip-bg"), h:n.getBoundingClientRect().height}); }));
await browser.close();
