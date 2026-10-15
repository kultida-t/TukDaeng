import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 440, height: 956 } });
await page.goto("http://127.0.0.1:4173/fo-flow/index.html", { waitUntil: "networkidle" });
await page.waitForTimeout(700);
await page.locator(".feed-scroll .post").first().locator(".post-head .avatar-ring").click();
await page.waitForTimeout(600);
await page.locator(".pf-more").click();
await page.waitForTimeout(500);
await page.locator(".pf-sh-report").click();
await page.waitForTimeout(90); /* mid-slide */
const info = await page.evaluate(() => {
  const scr = document.querySelector(".screen");
  const els = [...scr.querySelectorAll(".page-sub, .pg-ghost, .comment-sheet, .sheet-backdrop")];
  return els.map(el => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return { cls: el.className, bg: cs.backgroundColor, z: cs.zIndex, y: Math.round(r.top), anim: cs.animationName, op: cs.opacity };
  });
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
