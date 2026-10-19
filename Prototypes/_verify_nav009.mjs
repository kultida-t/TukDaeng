import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { pathToFileURL } from "url";

const FILE_URL = pathToFileURL("d:/TukDaeng/Prototypes/fo-flow/index.html").href;
const OUT = "d:/TukDaeng/Prototypes/screenshots/task-NAV-009";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
let failed = 0;
const check = (d, ok) => { console.log(`${ok ? "PASS" : "FAIL"}: ${d}`); if (!ok) failed++; };

for (const [name, vp] of [["m", { width: 440, height: 956 }], ["d", { width: 1440, height: 900 }]]) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  for (const [who, seller] of [["own", "Watch 777"], ["other", "king.mr.fox"]]) {
    for (const theme of ["dark", "light"]) {
      await page.evaluate(([s, t]) => {
        const scr = document.querySelector(".screen");
        scr.setAttribute("data-theme", t);
        const p = POSTS.find(x => x.seller === s) || POSTS[0];
        openPostViewer(scr, [p, p], p.id, 0, false, "Posts", s);
      }, [seller, theme]);
      await page.waitForTimeout(500);
      const st = await page.evaluate(() => {
        const h = document.querySelector(".page-pv .svd-head");
        const b = getComputedStyle(h, "::before");
        return { pos: getComputedStyle(h).position, bf: b.backdropFilter, content: b.content };
      });
      check(`${name}/${who}/${theme}: glass ::before present`, st.content !== "none" && st.bf.includes("blur"));
      await page.locator(".page-pv .pv-track").evaluate(el => el.scrollTop = 200);
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${OUT}/${name}-${who}-${theme}.png` });
    }
  }
  await ctx.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
