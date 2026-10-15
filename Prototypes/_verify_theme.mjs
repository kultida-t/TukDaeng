// Verify fo-flow THEME-001: Settings > Theme mode — Display section row shows
// current mode, picker page (Dark/Light + check mark, same pattern as
// Sensitive content), selecting applies instantly via .screen[data-theme]
// (settings stack stays open), persists to localStorage fo_theme, stays in
// sync with the sidebar #themeToggle, and survives a page reload.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-THEME-001";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
let errors = 0, failed = 0;
page.on("console", m => { if (m.type() === "error") { errors++; console.log("CONSOLE ERR:", m.text()); } });
page.on("pageerror", e => { errors++; console.log("PAGE ERR:", e.message); });

const check = (name, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`);
  if (!ok) failed++;
};

const sub = () => page.locator(".page-sub");
const scrTheme = () => page.locator(".screen").getAttribute("data-theme");
const lsTheme = () => page.evaluate(() => localStorage.getItem("fo_theme"));
const tglIcon = () => page.locator("#themeToggle").textContent();

await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

// 1) default state: dark theme, toggle shows moon
check("default data-theme dark", await scrTheme() === "dark");
check("default fo_theme (null = dark)", (await lsTheme() ?? "dark") === "dark");
check("sidebar toggle shows ☾", (await tglIcon()).trim() === "☾");

// 2) Settings -> Display section + Theme mode row with current value
await page.locator(".set-btn").click();
await page.waitForTimeout(350);
check("settings title", (await sub().locator(".detail-title").textContent()).trim() === "Settings and activity");
check("Display section label", (await sub().locator(".sub-sec").last().textContent()).trim() === "Display");
check("theme row exists", await sub().locator('.sub-row[data-sub="theme"]').count() === 1);
check("theme row shows Dark", (await sub().locator('.sub-row[data-sub="theme"] .sub-count').textContent()).trim() === "Dark");
check("theme row has icon", await sub().locator('.sub-row[data-sub="theme"] .sub-ic svg').count() === 1);
await page.screenshot({ path: `${OUT}/d-settings-theme-row.png` });

// 3) open Theme mode picker
await sub().locator('.sub-row[data-sub="theme"]').click();
await page.waitForTimeout(350);
check("theme page title", (await sub().locator(".detail-title").textContent()).trim() === "Theme mode");
check("2 options", await sub().locator("[data-theme-opt]").count() === 2);
check("option labels", (await sub().locator("[data-theme-opt] .lg-t").allTextContents()).join("|") === "Light mode|Dark mode");
check("options have icons", await sub().locator("[data-theme-opt] .sub-ic svg").count() === 2);
check("check on Dark mode", await sub().locator('[data-theme-opt="dark"] .theme-check svg').count() === 1 &&
      await sub().locator('[data-theme-opt="light"] .theme-check svg').count() === 0);
await page.screenshot({ path: `${OUT}/d-theme-picker-dark.png` });

// 4) pick Light -> instant apply, check moves, storage + toggle sync, page stays open
await sub().locator('[data-theme-opt="light"]').click();
await page.waitForTimeout(300);
check("screen switches to light", await scrTheme() === "light");
check("check moves to Light", await sub().locator('[data-theme-opt="light"] .theme-check svg').count() === 1 &&
      await sub().locator('[data-theme-opt="dark"] .theme-check svg').count() === 0);
check("fo_theme=light", await lsTheme() === "light");
check("toggle shows ☀", (await tglIcon()).trim() === "☀");
check("theme page still open", (await sub().locator(".detail-title").textContent()).trim() === "Theme mode");
await page.screenshot({ path: `${OUT}/l-theme-picker-light.png` });

// 5) back -> Settings row shows new value
await sub().locator(".sub-back").click();
await page.waitForTimeout(300);
check("settings row shows Light", (await sub().locator('.sub-row[data-sub="theme"] .sub-count').textContent()).trim() === "Light");
await page.screenshot({ path: `${OUT}/l-settings-theme-row-light.png` });

// 6) back to feed: whole screen is light
await sub().locator(".sub-back").click();
await page.waitForTimeout(300);
check("back at feed", await page.locator(".screen.sub-open").count() === 0);
check("feed screen is light", await scrTheme() === "light");
await page.screenshot({ path: `${OUT}/l-feed-light.png` });

// 7) reload -> persists
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(700);
check("persisted data-theme light", await scrTheme() === "light");
check("persisted fo_theme", await lsTheme() === "light");
check("persisted toggle ☀", (await tglIcon()).trim() === "☀");
await page.locator(".set-btn").click();
await page.waitForTimeout(350);
check("persisted row shows Light", (await sub().locator('.sub-row[data-sub="theme"] .sub-count').textContent()).trim() === "Light");

// 8) sidebar toggle still works from inside settings flow + back in sync
await page.locator(".sub-back").click();
await page.waitForTimeout(300);
await page.locator("#themeToggle").click();
await page.waitForTimeout(400);
check("sidebar toggle -> dark", await scrTheme() === "dark" && await lsTheme() === "dark" && (await tglIcon()).trim() === "☾");
await page.locator(".set-btn").click();
await page.waitForTimeout(350);
check("row follows toggle -> Dark", (await sub().locator('.sub-row[data-sub="theme"] .sub-count').textContent()).trim() === "Dark");

// 9) picker still applies after toggle path (dark -> light once more)
await sub().locator('.sub-row[data-sub="theme"]').click();
await page.waitForTimeout(300);
await sub().locator('[data-theme-opt="light"]').click();
await page.waitForTimeout(300);
check("re-pick light applies", await scrTheme() === "light" && await lsTheme() === "light");
check("no console errors", errors === 0);

await browser.close();
console.log(`\n${failed} failed / ${errors} console errors`);
process.exit(failed || errors ? 1 : 0);
