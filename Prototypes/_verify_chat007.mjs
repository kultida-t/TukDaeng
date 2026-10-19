// CHAT-007 — verify chat top capsule (.ch-nav-tabs / .ch-top-tab) uses the
// same active-pill pattern as feed segment (FEED-026): active = red label on
// subtle capsule (--chip-bg light / rgba(0,0,0,.3) dark), inactive = muted
// text. Dark + light theme.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync, writeFileSync } from "fs";
import { pathToFileURL } from "url";
import path from "path";

const OUT = path.join(process.cwd(), "Prototypes/screenshots/task-CHAT-007");
const DELIV = path.join(process.cwd(), "Prototypes/deliverables/task-CHAT-007");
mkdirSync(OUT, { recursive: true });
mkdirSync(DELIV, { recursive: true });

const FILE_URL = pathToFileURL(path.join(process.cwd(), "Prototypes/fo-flow/index.html")).href;
const RED = "rgb(200, 33, 43)"; // --red: #c8212b

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

  const themeIsDark = async () =>
    (await page.locator(".screen").first().getAttribute("data-theme")) === "dark";

  const probe = async () => {
    const act = await page.locator(".ch-top-tab.active-pill").evaluate(el => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, fw: s.fontWeight, radius: s.borderRadius };
    });
    const inact = await page.locator(".ch-top-tab:not(.active-pill)").first().evaluate(el => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color };
    });
    return { act, inact };
  };

  // --- default theme is dark ---
  await page.locator('.bottom-nav .nav-item[data-navgo="chat"]').first().click();
  await page.waitForTimeout(400);
  console.log("theme:", await page.locator(".screen").first().getAttribute("data-theme"));

  let { act, inact } = await probe();
  console.log("dark active:", JSON.stringify(act), "| dark inactive:", JSON.stringify(inact));
  check("dark: active pill bg = rgba(0,0,0,.3) (feed segment pattern)", act.bg === "rgba(0, 0, 0, 0.3)", act.bg);
  check("dark: active pill label is --red", act.color === RED, act.color);
  check("dark: active pill font-weight 700", act.fw === "700", act.fw);
  check("dark: active pill is full radius capsule", act.radius === "999px", act.radius);
  check("dark: inactive label = rgba(255,255,255,.88)", inact.color === "rgba(255, 255, 255, 0.88)", inact.color);
  check("dark: no slate #475569 active bg", act.bg !== "rgb(71, 85, 105)", act.bg);

  await page.screenshot({ path: path.join(OUT, "chat-tabs-dark.png"), clip: { x: 0, y: 30, width: 440, height: 120 } });
  await page.screenshot({ path: path.join(DELIV, "chat-tabs-dark.png"), clip: { x: 0, y: 30, width: 440, height: 120 } });

  // --- switch to Items tab: active pill moves, dropdown arrow still works ---
  await page.locator('.ch-top-tab[data-chview="item"]').click();
  await page.waitForTimeout(300);
  const activeText = (await page.locator(".ch-top-tab.active-pill").textContent()).trim();
  check("Items tab becomes active on click", /Items|สินค้า/.test(activeText), activeText);
  // second click (already on item view) toggles the filter popover
  await page.locator('.ch-top-tab[data-chview="item"]').click();
  await page.waitForTimeout(300);
  const popOpen = await page.locator(".ch-filter-popover").count();
  check("Items dropdown popover still opens on 2nd click", popOpen === 1, `popover count=${popOpen}`);
  await page.screenshot({ path: path.join(OUT, "chat-tabs-dark-items.png"), clip: { x: 0, y: 30, width: 440, height: 300 } });

  // --- light theme (themeToggle re-renders, so navigate back to chat) ---
  await page.locator("#themeToggle").click();
  await page.waitForTimeout(400);
  await page.locator('.bottom-nav .nav-item[data-navgo="chat"]').first().click();
  await page.waitForTimeout(400);
  console.log("theme:", await page.locator(".screen").first().getAttribute("data-theme"));

  ({ act, inact } = await probe());
  console.log("light active:", JSON.stringify(act), "| light inactive:", JSON.stringify(inact));
  check("light: active pill bg = --chip-bg rgba(0,0,0,.06)", act.bg === "rgba(0, 0, 0, 0.06)", act.bg);
  check("light: active pill label is --red", act.color === RED, act.color);
  check("light: inactive label = color-mix text 72%", inact.color === "rgba(20, 20, 23, 0.72)" || inact.color === "color(srgb 0.0784314 0.0784314 0.0901961 / 0.72)", inact.color);
  check("light: no slate #5d6b7e active bg", act.bg !== "rgb(93, 107, 126)", act.bg);

  await page.screenshot({ path: path.join(OUT, "chat-tabs-light.png"), clip: { x: 0, y: 30, width: 440, height: 120 } });
  await page.screenshot({ path: path.join(DELIV, "chat-tabs-light.png"), clip: { x: 0, y: 30, width: 440, height: 120 } });

  check("No console/page errors", pageErrors === 0, `errors=${pageErrors}`);
  await ctx.close();
} finally {
  await browser.close();
}

console.log("\n==========================================");
console.log(`TOTAL CHECKS: ${results.length} | FAILED: ${failed}`);
console.log("==========================================");

writeFileSync(path.join(DELIV, "CHAT-007-test-results.txt"),
  `TEST RESULTS FOR TASK CHAT-007:\n${results.join("\n")}\n\nTOTAL: ${results.length} | FAILED: ${failed}\n`, "utf8");

if (failed > 0) process.exit(1);
console.log("DONE");
