// Extract frames from the IG block-flow reference video
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const VID = "file:///C:/Users/mailt/Downloads/%E0%B8%95%E0%B8%B6%E0%B8%81%E0%B9%81%E0%B8%94%E0%B8%87/813752856.187328.mp4";
const OUT = import.meta.dirname + "/screenshots/_ref-report";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 440, height: 956 } });
await page.goto(VID, { waitUntil: "load" });
await page.waitForTimeout(1500);

const dur = await page.evaluate(() => {
  const v = document.querySelector("video");
  return v ? v.duration : 0;
});
console.log("duration:", dur);

const steps = Math.max(6, Math.min(24, Math.round(dur / 1.2)));
for (let i = 0; i <= steps; i++) {
  const t = (dur * i) / steps;
  await page.evaluate(tt => {
    const v = document.querySelector("video");
    v.pause();
    v.currentTime = tt;
  }, t);
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${OUT}/f-${String(i).padStart(2, "0")}-${t.toFixed(1)}s.png` });
}
await browser.close();
console.log("done", steps + 1, "frames");
