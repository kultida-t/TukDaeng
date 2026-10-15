// Verify fo-flow PROFILE-006: Block confirm sheet matches IG sizing/spacing + "Block and report"
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-PROFILE-006";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
let errors = 0, failed = 0;
page.on("console", m => { if (m.type() === "error") { errors++; console.log("CONSOLE ERR:", m.text()); } });
page.on("pageerror", e => { errors++; console.log("PAGE ERR:", e.message); });
const check = (n, ok, x = "") => { console.log(`${ok ? "PASS" : "FAIL"} ${n}${x ? " — " + x : ""}`); if (!ok) failed++; };
const scr = () => page.locator(".screen");
const sub = () => page.locator(".page-sub");

async function openBlock() {
  await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await scr().locator(".feed-scroll .post").first().locator(".post-head .avatar-ring").click();
  await page.waitForTimeout(400);
  await sub().locator(".pf-more").click();
  await page.waitForTimeout(300);
  await page.locator(".pf-sh-block").click();
  await page.waitForTimeout(400);
}

await openBlock();
const m = await page.evaluate(() => {
  const r = s => document.querySelector(s).getBoundingClientRect();
  const sh = document.querySelector(".comment-sheet").getBoundingClientRect();
  const go = r(".blk-go"), rep = r(".blk-rep");
  return { sheetW: sh.width, sheetBottom: sh.bottom, goH: go.height, goW: go.width, repH: rep.height, gap: rep.top - go.bottom,
    bottomPad: sh.bottom - rep.bottom, side: go.left - sh.left, av: r(".blk-av").width,
    qAlign: getComputedStyle(document.querySelector(".blk-q")).textAlign };
});
console.log(m);
check("buttons ~41px tall (IG)", Math.abs(m.goH - 41) < 1 && Math.abs(m.repH - 41) < 1);
check("side margin ~23px", Math.abs(m.side - 23) < 1.5, String(m.side));
check("gap between buttons ~11px", Math.abs(m.gap - 11) < 1.5, String(m.gap));
check("bottom padding ~40px", Math.abs(m.bottomPad - 40) < 3, String(m.bottomPad));
check("avatar ~89px", Math.abs(m.av - 89) < 1);
check("title left aligned", m.qAlign === "left" || m.qAlign === "start");
check("Block and report present", await page.locator(".blk-rep").count() === 1);
await page.screenshot({ path: `${OUT}/a-dark-block-sheet.png` });

// Block and report -> blocks + report picker
await page.locator(".blk-rep").click();
await page.waitForTimeout(600);
check("Block and report blocks the user", await page.evaluate(() => pfIsBlocked("Watch 777")));
check("report picker opens", await page.evaluate(() => (document.querySelector(".screen")._subStack || []).at(-1)?.startsWith("report:pick:")));
await page.screenshot({ path: `${OUT}/b-block-and-report.png` });

// plain Block still works
await openBlock();
await page.locator(".blk-go").click();
await page.waitForTimeout(400);
check("plain Block still blocks", await page.evaluate(() => pfIsBlocked("Watch 777")));

// light theme
await openBlock();
await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
await page.waitForTimeout(200);
await page.screenshot({ path: `${OUT}/c-light-block-sheet.png` });

// report-flow variant keeps Block only
await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
const fr = await page.evaluate(() => blkSheetHTML("dial.dude", true).includes("blk-rep"));
check("report-flow sheet has no Block and report", !fr);

check("0 console errors", errors === 0, String(errors));
console.log(failed ? `${failed} FAILED` : "ALL PASS");
await browser.close();
process.exit(failed ? 1 : 0);
