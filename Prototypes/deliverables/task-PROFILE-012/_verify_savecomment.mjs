// Verify fo-flow PROFILE-012: Save + Comment from profile Posts viewer (counts match rows, save flow works on grid posts)
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-PROFILE-012";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
let errors = 0, failed = 0;
page.on("console", m => { if (m.type() === "error") { errors++; console.log("CONSOLE ERR:", m.text()); } });
page.on("pageerror", e => { errors++; console.log("PAGE ERR:", e.message); });
const check = (n, ok, x = "") => { console.log(`${ok ? "PASS" : "FAIL"} ${n}${x ? " — " + x : ""}`); if (!ok) failed++; };
const sub = () => page.locator(".page-sub");
const scr = () => page.locator(".screen");

await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);
await scr().locator('.bottom-nav .nav-item[data-navgo="profile"]').click();
await page.waitForTimeout(500);
const pids = await sub().locator(".pf-tile").evaluateAll(els => els.map(e => e.dataset.pid));

let first = true;
for (const pid of pids) {
  await sub().locator(`.pf-tile[data-pid="${pid}"]`).click();
  await page.waitForTimeout(400);
  const post = page.locator(`.page-pv .pfp-post[data-pid="${pid}"]`);
  const cb = post.locator(".comment-btn");
  if (await cb.count()) {
    const shown = parseInt((await cb.locator("span").textContent().catch(() => "0")) || "0", 10) || 0;
    await cb.click();
    await page.waitForTimeout(350);
    const rows = await page.locator(".comment-sheet .c-row").count();
    const empty = (await page.locator(".comment-sheet .sheet-list").textContent()).includes("No comments yet");
    check(`${pid} comment count ${shown} = rows ${rows}`, shown === rows && (shown > 0 || empty));
    if (first) await page.screenshot({ path: `${OUT}/a-comments.png` });
    await page.locator(".sheet-backdrop").click({ force: true, position: { x: 200, y: 20 } });
    await page.waitForTimeout(350);
  }
  const sv = post.locator(".save-btn");
  await sv.click();
  await page.waitForTimeout(350);
  check(`${pid} save: sheet opens + icon saved`, (await page.locator(".screen.save-open").count()) === 1 && (await sv.evaluate(e => e.classList.contains("saved"))));
  if (first) await page.screenshot({ path: `${OUT}/b-save-sheet.png` });
  await page.locator(".comment-sheet .sv-row").first().click();
  await page.waitForTimeout(350);
  check(`${pid} moved to Grail list + sheet closed + icon still saved`, (await page.evaluate(p => findPost(p).savedCol, pid)) === "Grail list" && (await page.locator(".screen.save-open").count()) === 0 && (await sv.evaluate(e => e.classList.contains("saved"))));
  await sv.click();
  await page.waitForTimeout(350);
  check(`${pid} reopen shows collection ticked`, (await page.locator(".comment-sheet .sv-row .plus.on").count()) === 1);
  await page.locator(".comment-sheet .sv-head").click();
  await page.waitForTimeout(350);
  check(`${pid} unsave via Saved row`, !(await sv.evaluate(e => e.classList.contains("saved"))) && (await page.locator(".screen.save-open").count()) === 0);
  first = false;
  await page.locator(".pv-back").click();
  await page.waitForTimeout(400);
}
console.log(`errors=${errors} failed=${failed}`);
await browser.close();
process.exit(failed || errors ? 1 : 0);
