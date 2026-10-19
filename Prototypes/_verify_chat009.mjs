// CHAT-009 — verify Items filter popover text is not all-bold:
// rows font-weight 400, pop-title 500. Screenshot light theme.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync, writeFileSync } from "fs";
import { pathToFileURL } from "url";
import path from "path";

const OUT = path.join(process.cwd(), "Prototypes/screenshots/task-CHAT-009");
const DELIV = path.join(process.cwd(), "Prototypes/deliverables/task-CHAT-009");
mkdirSync(OUT, { recursive: true });
mkdirSync(DELIV, { recursive: true });

const FILE_URL = pathToFileURL(path.join(process.cwd(), "Prototypes/fo-flow/index.html")).href;

let failed = 0;
const results = [];
function check(name, ok, msg = "") {
  const line = `${ok ? "PASS" : "FAIL"}: ${name}${msg ? " — " + msg : ""}`;
  console.log(line);
  results.push(line);
  if (!ok) failed++;
}

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true
});

try {
  const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  let pageErrors = 0;
  page.on("pageerror", e => { console.error("PAGE ERR:", e.message); pageErrors++; });
  page.on("console", m => { if (m.type() === "error") { console.error("CONSOLE ERR:", m.text()); pageErrors++; } });

  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);

  // light theme first for the screenshot match with the user's capture
  await page.locator("#themeToggle").click();
  await page.waitForTimeout(400);

  await page.locator('.bottom-nav .nav-item[data-navgo="chat"]').first().click();
  await page.waitForTimeout(400);
  await page.locator('.ch-top-tab[data-chview="item"]').click();
  await page.waitForTimeout(300);
  await page.locator('.ch-top-tab[data-chview="item"]').click();
  await page.waitForTimeout(300);

  const titleFw = await page.locator(".ch-filter-pop-title").evaluate(el => getComputedStyle(el).fontWeight);
  const rowFws = await page.locator(".ch-filter-pop-row").evaluateAll(els => els.map(el => getComputedStyle(el).fontWeight));
  console.log("title fw:", titleFw, "| row fws:", JSON.stringify(rowFws));
  check("popover open", (await page.locator(".ch-filter-popover").count()) === 1);
  check("pop-title font-weight 500", titleFw === "500", titleFw);
  check("all 3 rows font-weight 400", rowFws.length === 3 && rowFws.every(w => w === "400"), JSON.stringify(rowFws));

  await page.screenshot({ path: path.join(OUT, "popover-light-weights.png"), clip: { x: 0, y: 30, width: 440, height: 340 } });
  await page.screenshot({ path: path.join(DELIV, "popover-light-weights.png"), clip: { x: 0, y: 30, width: 440, height: 340 } });

  check("No console/page errors", pageErrors === 0, `errors=${pageErrors}`);
  await ctx.close();
} finally {
  await browser.close();
}

console.log("\n==========================================");
console.log(`TOTAL CHECKS: ${results.length} | FAILED: ${failed}`);
console.log("==========================================");

writeFileSync(path.join(DELIV, "CHAT-009-test-results.txt"),
  `TEST RESULTS FOR TASK CHAT-009:\n${results.join("\n")}\n\nTOTAL: ${results.length} | FAILED: ${failed}\n`, "utf8");

if (failed > 0) process.exit(1);
console.log("DONE");
