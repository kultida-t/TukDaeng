// CHAT-008 — verify the Items filter popover (.ch-filter-popover) renders as
// translucent frosted glass (iOS context-menu look): lower bg alpha so blurred
// content shows through, backdrop blur(30px) saturate(1.8), radius 20px.
// Dark + light theme.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync, writeFileSync } from "fs";
import { pathToFileURL } from "url";
import path from "path";

const OUT = path.join(process.cwd(), "Prototypes/screenshots/task-CHAT-008");
const DELIV = path.join(process.cwd(), "Prototypes/deliverables/task-CHAT-008");
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

  const openPopover = async () => {
    await page.locator('.bottom-nav .nav-item[data-navgo="chat"]').first().click();
    await page.waitForTimeout(400);
    await page.locator('.ch-top-tab[data-chview="item"]').click(); // switch view
    await page.waitForTimeout(300);
    await page.locator('.ch-top-tab[data-chview="item"]').click(); // toggle popover
    await page.waitForTimeout(300);
  };

  const probe = async () =>
    page.locator(".ch-filter-popover").evaluate(el => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, bd: s.backdropFilter || s.webkitBackdropFilter, radius: s.borderRadius };
    });

  // --- dark theme ---
  await openPopover();
  let p = await probe();
  console.log("dark popover:", JSON.stringify(p));
  check("dark: popover bg = rgba(28,33,41,.55) translucent", p.bg === "rgba(28, 33, 41, 0.55)", p.bg);
  check("dark: backdrop blur(30px) saturate(1.8)", /blur\(30px\)/.test(p.bd) && /saturate\(1\.8\)/.test(p.bd), p.bd);
  check("dark: radius 20px", p.radius === "20px", p.radius);
  check("dark: 3 filter rows visible", (await page.locator(".ch-filter-pop-row").count()) === 3);
  await page.screenshot({ path: path.join(OUT, "popover-dark.png"), clip: { x: 0, y: 30, width: 440, height: 400 } });
  await page.screenshot({ path: path.join(DELIV, "popover-dark.png"), clip: { x: 0, y: 30, width: 440, height: 400 } });

  // select "Your listings" still filters + closes
  await page.locator('.ch-filter-pop-row[data-chitemfilter="mine"]').click();
  await page.waitForTimeout(300);
  check("selecting a filter closes popover", (await page.locator(".ch-filter-popover").count()) === 0);
  check("Items tab stays active after filter pick", await page.locator('.ch-top-tab[data-chview="item"]').evaluate(el => el.classList.contains("active-pill")));

  // --- light theme ---
  await page.locator("#themeToggle").click();
  await page.waitForTimeout(400);
  await openPopover();
  p = await probe();
  console.log("light popover:", JSON.stringify(p));
  check("light: popover bg = rgba(255,255,255,.55) translucent", p.bg === "rgba(255, 255, 255, 0.55)", p.bg);
  check("light: backdrop blur(30px) saturate(1.8)", /blur\(30px\)/.test(p.bd) && /saturate\(1\.8\)/.test(p.bd), p.bd);
  check("light: radius 20px", p.radius === "20px", p.radius);
  await page.screenshot({ path: path.join(OUT, "popover-light.png"), clip: { x: 0, y: 30, width: 440, height: 400 } });
  await page.screenshot({ path: path.join(DELIV, "popover-light.png"), clip: { x: 0, y: 30, width: 440, height: 400 } });

  check("No console/page errors", pageErrors === 0, `errors=${pageErrors}`);
  await ctx.close();
} finally {
  await browser.close();
}

console.log("\n==========================================");
console.log(`TOTAL CHECKS: ${results.length} | FAILED: ${failed}`);
console.log("==========================================");

writeFileSync(path.join(DELIV, "CHAT-008-test-results.txt"),
  `TEST RESULTS FOR TASK CHAT-008:\n${results.join("\n")}\n\nTOTAL: ${results.length} | FAILED: ${failed}\n`, "utf8");

if (failed > 0) process.exit(1);
console.log("DONE");
