// FONT-001 follow-up — bottom nav labels should not be bold under Google Sans:
// inactive labels 400, active label 500 (dark + light theme). Close-up nav shots.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync, writeFileSync } from "fs";
import { pathToFileURL } from "url";
import path from "path";

const OUT = path.join(process.cwd(), "Prototypes/screenshots/task-FONT-001");
const DELIV = path.join(process.cwd(), "Prototypes/deliverables/task-FONT-001");
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
  await ctx.addInitScript(() => localStorage.setItem("fo_lang", "th"));
  const page = await ctx.newPage();
  let pageErrors = 0;
  page.on("pageerror", e => { console.error("PAGE ERR:", e.message); pageErrors++; });
  page.on("console", m => { if (m.type() === "error") { console.error("CONSOLE ERR:", m.text()); pageErrors++; } });

  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);

  const weights = async () => page.locator(".bottom-nav .nav-item").evaluateAll(items =>
    items.map(it => ({
      active: it.classList.contains("active"),
      label: it.querySelector(".nav-label")?.textContent,
      fw: getComputedStyle(it.querySelector(".nav-label")).fontWeight
    })));

  // dark theme (default)
  let w = await weights();
  console.log("   dark:", JSON.stringify(w));
  check("dark inactive labels weight 400", w.filter(x => !x.active).every(x => x.fw === "400"), JSON.stringify(w.map(x => x.fw)));
  check("dark active label weight 500", w.filter(x => x.active).every(x => x.fw === "500"));
  const navBox = await page.locator(".bottom-nav").boundingBox();
  if (navBox) {
    const clip = { x: navBox.x - 6, y: navBox.y - 8, width: navBox.width + 12, height: navBox.height + 16 };
    await page.screenshot({ path: path.join(OUT, "m-nav-labels-thin-dark.png"), clip });
    await page.screenshot({ path: path.join(DELIV, "m-nav-labels-thin-dark.png"), clip });
  }

  // light theme
  await page.locator("#themeToggle").click();
  await page.waitForTimeout(500);
  w = await weights();
  console.log("   light:", JSON.stringify(w));
  check("light inactive labels weight 400", w.filter(x => !x.active).every(x => x.fw === "400"), JSON.stringify(w.map(x => x.fw)));
  check("light active label weight 500", w.filter(x => x.active).every(x => x.fw === "500"));
  if (navBox) {
    const clip = { x: navBox.x - 6, y: navBox.y - 8, width: navBox.width + 12, height: navBox.height + 16 };
    await page.screenshot({ path: path.join(OUT, "m-nav-labels-thin-light.png"), clip });
    await page.screenshot({ path: path.join(DELIV, "m-nav-labels-thin-light.png"), clip });
  }

  check("no console/page errors", pageErrors === 0, `errors=${pageErrors}`);
  await ctx.close();
} finally {
  await browser.close();
}

console.log("\n==========================================");
console.log(`TOTAL CHECKS: ${results.length} | FAILED: ${failed}`);
console.log("==========================================");

writeFileSync(path.join(DELIV, "FONT-001-navlabel-test-results.txt"),
  `TEST RESULTS FOR TASK FONT-001 (nav label weights):\n${results.join("\n")}\n\nTOTAL: ${results.length} | FAILED: ${failed}\n`, "utf8");

if (failed > 0) process.exit(1);
console.log("DONE");
