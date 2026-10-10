// Verify photo carousel swipe — IG-style clamped at edges
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const page = await (await chromium.launch()).newPage({ viewport: { width: 560, height: 950 }, deviceScaleFactor: 2 });
page.on("pageerror", e => console.log("PAGE ERR:", e.message));
await page.goto("http://127.0.0.1:4173/fo-flow/index.html", { waitUntil: "networkidle" });
await page.waitForTimeout(700);

const counter = () => page.locator(".post").first().locator(".photo-counter").textContent();
const ph = page.locator(".post").first().locator(".post-photo");
const box = await ph.boundingBox();
const cx = box.x + box.width / 2, cy = box.y + box.height / 2;

async function drag(dxTotal) {
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  const steps = 10;
  for (let i = 1; i <= steps; i++) await page.mouse.move(cx + (dxTotal * i) / steps, cy);
  await page.mouse.up();
  await page.waitForTimeout(500);
}

console.log("start:", await counter());

await drag(-160); console.log("drag left  →", await counter());   // expect 2/3
await drag(-160); console.log("drag left  →", await counter());   // expect 3/3
await drag(-160); console.log("drag left@3→", await counter());   // expect 3/3 (clamped)
await drag(160);  console.log("drag right →", await counter());   // expect 2/3
await drag(160);  console.log("drag right →", await counter());   // expect 1/3
await drag(160);  console.log("drag right@1→", await counter());  // expect 1/3 (clamped)

// tap clamp: tap right twice to 3/3, once more → stays 3/3
await ph.click({ position: { x: box.width - 20, y: box.height / 2 } });
await ph.click({ position: { x: box.width - 20, y: box.height / 2 } });
await ph.click({ position: { x: box.width - 20, y: box.height / 2 } });
await page.waitForTimeout(300);
console.log("tap right ×3 →", await counter());                   // expect 3/3

await page.context().browser().close();
console.log("DONE");
