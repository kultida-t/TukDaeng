// FEED-013 — capture post-to-post spacing (variant a1, both themes, 440x956)
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = process.argv[2] || import.meta.dirname + "/screenshots/task-FEED-013/after";
const STD = process.argv[3] === "std"; // std = evidence viewports 1440 + 390
mkdirSync(OUT, { recursive: true });

const VIEWS = STD
  ? [["d", { width: 1440, height: 900 }], ["m", { width: 390, height: 844 }]]
  : [["", { width: 440, height: 956 }]];

const browser = await chromium.launch();

for (const theme of ["dark", "light"]) {
  for (const [tag, vp] of VIEWS) {
  const ctx = await browser.newContext({
    viewport: vp,
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.addInitScript(t => { localStorage.setItem("fo_theme", t); }, theme);
  await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  // scroll so the boundary between post 1 and post 2 is visible
  await page.locator(".feed-scroll").evaluate(el => { el.scrollTop = 660; });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${tag}${theme}-gap.png` });
  // top of feed for reference
  await page.locator(".feed-scroll").evaluate(el => { el.scrollTop = 0; });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${tag}${theme}-top.png` });
  await ctx.close();
  }
}

await browser.close();
console.log("DONE →", OUT);
