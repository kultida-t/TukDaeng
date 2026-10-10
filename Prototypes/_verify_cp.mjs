// quick verify: screenshot create-post states (F2 only)
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const URL = "http://127.0.0.1:4173/feed-create-post.html";
const OUT = "C:/Users/Admin/Desktop/TukDaeng/Prototypes/screenshots/cp";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 950 }, deviceScaleFactor: 2 });
const errors = [];
page.on("pageerror", e => errors.push("PAGEERROR: " + e.message));
page.on("console", m => { if (m.type() === "error") errors.push("CONSOLE: " + m.text()); });
await page.goto(URL);
await page.waitForLoadState("domcontentloaded");
await page.waitForTimeout(600);

const BASE = { sel: false, fill: "filled" };

async function snap(name, st, theme = "dark") {
  await page.evaluate(st => { Object.assign(state, st); render(); }, st);
  await page.waitForTimeout(150);
  await page.locator(`.screen[data-theme="${theme}"]`).locator("..")
    .screenshot({ path: `${OUT}/${name}-${theme}.png` });
  console.log(name);
}

await snap("default", { ...BASE });
await snap("default-empty", { ...BASE, fill: "empty" });
await snap("selmode", { ...BASE, sel: true });
await snap("default-light", { ...BASE }, "light");

console.log("ERRORS:", errors.length ? errors : "none");
await browser.close();
