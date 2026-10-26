// Capture each .slide in slides.html as a 1600x900 PNG (2x scale)
// Usage: node _capture.mjs  (run from this folder; requires playwright from repo deps)
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { writeFileSync } from "fs";

const OUT = import.meta.dirname;
const SRC = OUT + "/slides.html";
const slides = [
  ["s1", "FO-DIAG-001-01-overview"],
  ["s2", "FO-DIAG-001-02-feature-map"],
  ["s3", "FO-DIAG-001-03-sitemap"],
  ["s4", "FO-DIAG-001-04-screen-flow"],
  ["s5", "FO-DIAG-001-05-user-flow"],
  ["s6", "FO-DIAG-001-06-journey"],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1700, height: 980 }, deviceScaleFactor: 2 });
await page.goto("file:///" + SRC.replace(/\\/g, "/"));
await page.waitForLoadState("domcontentloaded");
await page.waitForTimeout(600);

for (const [id, name] of slides) {
  const buf = await page.locator(`#${id}`).screenshot();
  const target = `${OUT}/${name}.png`;
  for (let i = 0; i < 15; i++) {
    try { writeFileSync(target, buf); break; }
    catch (e) {
      if (i === 14) throw e;
      await page.waitForTimeout(400);
    }
  }
  console.log(`${name}.png`);
}
await browser.close();
