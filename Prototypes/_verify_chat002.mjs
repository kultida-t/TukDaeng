import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync, writeFileSync } from "fs";
import { pathToFileURL } from "url";
import path from "path";

const OUT = path.join(process.cwd(), "Prototypes/screenshots/task-CHAT-002/after");
const DELIV = path.join(process.cwd(), "Prototypes/deliverables/task-CHAT-002");
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

const browser = await chromium.launch();

// 1. Detailed functional verification on Mobile (440x956)
{
  const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  let pageErrors = 0;
  page.on("pageerror", e => { console.error("PAGE ERR:", e.message); pageErrors++; });

  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  // Navigate to Chat
  await page.locator('.bottom-nav .nav-item[data-navgo="chat"]').first().click();
  await page.waitForTimeout(300);

  // Test 1: Chats tab has no arrow, Items tab has arrow
  const chatsArrowCount = await page.locator('.ch-top-tab[data-chview="user"] .ch-tab-arrow').count();
  const itemsArrowCount = await page.locator('.ch-top-tab[data-chview="item"] .ch-tab-arrow').count();
  check("Chats tab has NO arrow", chatsArrowCount === 0);
  check("Items tab has arrow ▼", itemsArrowCount === 1);

  // Test 2: Switch to Items tab
  await page.locator('.ch-top-tab[data-chview="item"]').click();
  await page.waitForTimeout(300);
  const isItemActive = await page.locator('.ch-top-tab[data-chview="item"].active-pill').count();
  check("Items tab becomes active", isItemActive === 1);
  check("Popover closed initially upon switching to Items", (await page.locator('.ch-filter-popover').count()) === 0);

  // Test 3: Tap Items tab again to open Popover
  await page.locator('.ch-top-tab[data-chview="item"]').click();
  await page.waitForTimeout(300);
  const popCount = await page.locator('.ch-filter-popover').count();
  check("Tapping Items tab opens Popover", popCount === 1);
  await page.screenshot({ path: path.join(OUT, "m-440-popover-open-all.png") });

  // Test 4: Verify Popover options & initial checkmark
  const optAll = page.locator('.ch-filter-pop-row[data-chitemfilter="all"]');
  const optMine = page.locator('.ch-filter-pop-row[data-chitemfilter="mine"]');
  const optAsked = page.locator('.ch-filter-pop-row[data-chitemfilter="asked"]');
  check("Popover has All items option", (await optAll.count()) === 1);
  check("Popover has Your listings option", (await optMine.count()) === 1);
  check("Popover has Items you asked about option", (await optAsked.count()) === 1);
  check("All items has checkmark initially", (await optAll.locator('.ch-filter-pop-check svg').count()) === 1);
  check("Your listings has no checkmark initially", (await optMine.locator('.ch-filter-pop-check svg').count()) === 0);

  // Test 5: Select "Your listings"
  await optMine.click();
  await page.waitForTimeout(300);
  check("Popover closed after selecting Your listings", (await page.locator('.ch-filter-popover').count()) === 0);
  const secsAfterMine = await page.locator('.ch-sec').allTextContents();
  check("Only Your listings section is visible", secsAfterMine.length === 1 && secsAfterMine[0].includes("Your listings"));
  await page.screenshot({ path: path.join(OUT, "m-440-items-filtered-mine.png") });

  // Test 6: Re-open Popover, verify checkmark moved to "Your listings"
  await page.locator('.ch-top-tab[data-chview="item"]').click();
  await page.waitForTimeout(300);
  check("Your listings now has checkmark", (await optMine.locator('.ch-filter-pop-check svg').count()) === 1);
  check("All items no longer has checkmark", (await optAll.locator('.ch-filter-pop-check svg').count()) === 0);

  // Test 7: Select "Items you asked about"
  await optAsked.click();
  await page.waitForTimeout(300);
  const secsAfterAsked = await page.locator('.ch-sec').allTextContents();
  check("Only Items you asked about section is visible", secsAfterAsked.length === 1 && secsAfterAsked[0].includes("Items you asked about"));
  await page.screenshot({ path: path.join(OUT, "m-440-items-filtered-asked.png") });

  // Test 8: Backdrop tap closes popover
  await page.locator('.ch-top-tab[data-chview="item"]').click();
  await page.waitForTimeout(300);
  check("Popover opened for backdrop test", (await page.locator('.ch-filter-popover').count()) === 1);
  await page.locator('.ch-filter-backdrop').click({ position: { x: 50, y: 300 } });
  await page.waitForTimeout(300);
  check("Backdrop tap closes popover", (await page.locator('.ch-filter-popover').count()) === 0);

  // Test 9: Reset filter when switching to Chats tab
  await page.locator('.ch-top-tab[data-chview="user"]').click();
  await page.waitForTimeout(300);
  check("Switched to Chats tab", (await page.locator('.ch-top-tab[data-chview="user"].active-pill').count()) === 1);
  await page.locator('.ch-top-tab[data-chview="item"]').click();
  await page.waitForTimeout(300);
  const secsAfterReturn = await page.locator('.ch-sec').allTextContents();
  check("Switching to Chats resets filter to All items on return", secsAfterReturn.length === 2);

  // Test 10: Dark mode test
  await page.evaluate(() => {
    document.querySelectorAll('.screen').forEach(s => s.setAttribute('data-theme', 'dark'));
  });
  await page.waitForTimeout(200);
  await page.locator('.ch-top-tab[data-chview="item"]').click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "m-440-dark-popover.png") });

  check("No JS page errors during tests", pageErrors === 0);
  await ctx.close();
}

// 2. Viewport evidence capture across viewports
const vpList = [
  { name: "d-1920", width: 1920, height: 1080 },
  { name: "d-1440", width: 1440, height: 900 },
  { name: "t-768", width: 768, height: 1024 },
  { name: "m-440", width: 440, height: 956 },
  { name: "m-390", width: 390, height: 844 }
];

for (const vp of vpList) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  // Navigate to Chat
  await page.locator('.bottom-nav .nav-item[data-navgo="chat"]').first().click();
  await page.waitForTimeout(300);

  // Switch to Items
  await page.locator('.ch-top-tab[data-chview="item"]').click();
  await page.waitForTimeout(300);

  // Open Popover
  await page.locator('.ch-top-tab[data-chview="item"]').click();
  await page.waitForTimeout(300);

  await page.screenshot({ path: path.join(OUT, `${vp.name}-items-popover.png`) });
  await page.screenshot({ path: path.join(DELIV, `${vp.name}-items-popover.png`) });

  await ctx.close();
}

await browser.close();

const summary = `CHAT-002 Verification Test Results
Date: ${new Date().toISOString()}
Passed: ${results.filter(r => r.startsWith("PASS")).length}
Failed: ${failed}

${results.join("\n")}
`;
writeFileSync(path.join(DELIV, "CHAT-002-test-results.txt"), summary, "utf-8");
console.log("\n=================================");
console.log(summary);
process.exit(failed ? 1 : 0);
