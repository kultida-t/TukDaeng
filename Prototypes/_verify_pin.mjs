// Verify fo-flow PROFILE-008: Pin to top of grid (max 3 per tab, newest first, unpin restores, limit dialog, auto-dismiss feedback)
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-PROFILE-008";
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
const tiles = async () => sub().locator(".pf-tile").evaluateAll(els => els.map(e => e.dataset.pid));
const pinned = async () => sub().locator(".pf-tile:has(.pf-pin)").evaluateAll(els => els.map(e => e.dataset.pid));

await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);
await scr().locator('.bottom-nav .nav-item[data-navgo="profile"]').click();
await page.waitForTimeout(500);

const base = await tiles();
check("9 tiles, none pinned", base.length === 9 && (await pinned()).length === 0);

async function openMenu(pid) {
  await sub().locator(`.pf-tile[data-pid="${pid}"]`).click();
  await page.waitForTimeout(400);
  await page.locator(`.page-pv .pfp-post[data-pid="${pid}"] .post-head .more`).click();
  await page.waitForTimeout(350);
}
async function backToGrid() { await page.locator(".pv-back").click(); await page.waitForTimeout(400); }
const menuLabel = () => page.locator(".comment-sheet .pm-own-pin span").textContent();

// pin 1st, 2nd, 3rd tile (from natural order)
for (let i = 0; i < 3; i++) {
  const pid = base[i];
  await openMenu(pid);
  if (i === 0) {
    check("menu label = Pin to top of grid", (await menuLabel()) === "Pin to top of grid");
    await page.screenshot({ path: `${OUT}/a-menu.png` });
  }
  await page.locator(".comment-sheet .pm-own-pin").click();
  await page.waitForTimeout(150);
  if (i === 0) {
    check("pill Pinning... shows", (await page.locator(".pin-pill.show").textContent()) === "Pinning...");
    await page.screenshot({ path: `${OUT}/b-pinning.png` });
  }
  await page.waitForTimeout(800);
  if (i === 0) {
    check("pill gone, toast shows", (await page.locator(".pin-pill.show").count()) === 0 && (await page.locator(".pin-toast.show").textContent()).includes("Your post has been pinned"));
    await page.screenshot({ path: `${OUT}/c-toast.png` });
  }
  await backToGrid();
}
check("toast auto-dismissed", await page.waitForFunction(() => !document.querySelector(".pin-toast.show"), null, { timeout: 4000 }).then(() => true).catch(() => false));
const t3 = await tiles();
check("pinned order newest first [3rd,2nd,1st]", t3.slice(0, 3).join() === [base[2], base[1], base[0]].join(), t3.slice(0, 3).join());
check("3 pin icons", (await pinned()).length === 3);
await page.screenshot({ path: `${OUT}/d-three-pinned.png` });

// 4th -> limit dialog, cancel
await openMenu(base[3]);
await page.locator(".comment-sheet .pm-own-pin").click();
await page.waitForTimeout(300);
check("limit dialog shows", (await page.locator(".dlg .dlg-q").textContent()) === "Pin limit reached" && (await page.locator(".dlg-pin-go").count()) === 1);
await page.screenshot({ path: `${OUT}/e-limit.png` });
await page.locator(".dlg .dlg-cancel").click();
await page.waitForTimeout(300);
await backToGrid();
check("cancel keeps 3 pins unchanged", (await pinned()).join() === [base[2], base[1], base[0]].join());

// 4th -> confirm replaces oldest (base[0]) which returns to natural slot
await openMenu(base[3]);
await page.locator(".comment-sheet .pm-own-pin").click();
await page.waitForTimeout(300);
await page.locator(".dlg-pin-go").click();
await page.waitForTimeout(900);
await backToGrid();
const t4 = await tiles();
check("confirm: new pin first, oldest dropped", t4.slice(0, 3).join() === [base[3], base[2], base[1]].join(), t4.slice(0, 3).join());
check("oldest back at natural slot", t4[3] === base[0], t4.slice(0, 5).join());
await page.screenshot({ path: `${OUT}/f-replaced.png` });

// unpin base[3] -> back to natural slot (index 3)
await openMenu(base[3]);
check("menu label = Unpin from grid", (await menuLabel()) === "Unpin from grid");
await page.locator(".comment-sheet .pm-own-pin").click();
await page.waitForTimeout(150);
check("pill Unpinning...", (await page.locator(".pin-pill.show").textContent()) === "Unpinning...");
await page.waitForTimeout(800);
check("toast unpinned", (await page.locator(".pin-toast.show").textContent()).includes("Your post has been unpinned"));
await backToGrid();
const t5 = await tiles();
check("unpinned returns to natural slot", t5.indexOf(base[3]) === 3 && (await pinned()).length === 2, t5.slice(0, 5).join());

// per-tab count: Sale tab independent
await sub().locator('.pf-tab[data-pftab="sale"]').click();
await page.waitForTimeout(300);
check("sale tab has no pins", (await pinned()).length === 0);
const st = await tiles();
for (let i = 0; i < Math.min(3, st.length); i++) {
  await openMenu(st[i]);
  await page.locator(".comment-sheet .pm-own-pin").click();
  await page.waitForTimeout(900);
  await backToGrid();
}
check("sale tab pins counted separately", (await pinned()).length === Math.min(3, st.length));
await sub().locator('.pf-tab[data-pftab="all"]').click();
await page.waitForTimeout(300);
check("all tab still 2 pins", (await pinned()).length === 2);

console.log(`\n${failed} failed, ${errors} errors`);
await browser.close();
process.exit(failed || errors ? 1 : 0);
