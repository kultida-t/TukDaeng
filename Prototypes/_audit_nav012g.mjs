import { chromium } from "playwright";
import { pathToFileURL } from "url";
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 })).newPage();
await page.goto(pathToFileURL("d:/TukDaeng/Prototypes/fo-flow/index.html").href, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
for (const th of ["dark","light"]) {
  await page.evaluate(t => document.querySelector(".screen").setAttribute("data-theme", t), th);
  await page.evaluate(() => document.querySelector('.screen [data-navgo="chat"]').click()); await page.waitForTimeout(500);
  await page.locator(".ch-scroll:visible").first().evaluate(e => e.scrollTop = 140); await page.waitForTimeout(300);
  const b = await page.locator(".screen").first().boundingBox();
  await page.screenshot({ path: `d:/TukDaeng/Prototypes/screenshots/task-NAV-012/after2/chat-scrolled-${th}.png`, clip: { x: b.x, y: b.y, width: b.width, height: 160 } });
  await page.screenshot({ path: `d:/TukDaeng/Prototypes/screenshots/task-NAV-012/after2/nav-${th}.png`, clip: { x: b.x, y: b.y + b.height - 110, width: b.width, height: 110 } });
}
await browser.close();
