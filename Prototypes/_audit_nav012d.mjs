import { chromium } from "playwright";
import { pathToFileURL } from "url";
import { readFileSync } from "fs";
const FILE_URL = pathToFileURL("d:/TukDaeng/Prototypes/fo-flow/index.html").href;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
await page.goto(FILE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.evaluate(() => document.querySelector(`.screen [data-navgo="profile"]`).click());
await page.waitForTimeout(500);
const info = await page.evaluate(() => {
  const n = document.querySelector(".bottom-nav"); const chain = [];
  for (let e = n; e; e = e.parentElement) { const c = getComputedStyle(e); chain.push(`${e.tagName}.${e.className}|op=${c.opacity}|f=${c.filter}|mask=${c.maskImage}|wc=${c.willChange}|tr=${c.transform}|ov=${c.overflow}|iso=${c.isolation}|bf=${c.backdropFilter}`); }
  return chain.join("\n");
});
console.log(info);

const b = await page.locator(".bottom-nav:visible").last().boundingBox();
console.log(JSON.stringify(b));
const clip = { x: b.x + 10, y: b.y + 4, width: b.width - 20, height: b.height - 8 };
const a = await page.screenshot({ clip });
await page.evaluate(() => document.querySelectorAll(".bottom-nav").forEach(n=>n.style.setProperty("backdrop-filter", "none", "important")));
await page.evaluate(() => document.querySelectorAll(".bottom-nav").forEach(n=>n.style.setProperty("-webkit-backdrop-filter", "none", "important")));
await page.waitForTimeout(200);
const c = await page.screenshot({ clip });
console.log("same bytes:", a.equals(c), a.length, c.length);
const fs = await import("fs");
fs.writeFileSync("d:/TukDaeng/Prototypes/screenshots/task-NAV-012/before/blur-on.png", a);
fs.writeFileSync("d:/TukDaeng/Prototypes/screenshots/task-NAV-012/before/blur-off.png", c);
await browser.close();
