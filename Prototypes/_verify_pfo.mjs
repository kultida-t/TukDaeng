// Verify fo-flow PORTFOLIO-001: owner-only Portfolio page per spec
// 14_PORTFOLIO_MODULE — dashboard (total value + coverage, unrealized G/L,
// YTD, top brands), asset list (status chips, valuation source, gain/loss,
// market comparison, holding), asset detail, sold history + detail,
// and preview states (no market data / empty / load failed / denied).
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-PORTFOLIO-001";
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
const scr = () => page.locator(".screen");

await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

// open own profile -> portfolio
await scr().locator('.bottom-nav .nav-item[data-navgo="profile"]').click();
await page.waitForTimeout(400);
await sub().locator('.pf-iconbtn[data-sub="portfolio"]').click();
await page.waitForTimeout(400);

// ============ 1) dashboard ============
check("portfolio page opens", (await sub().locator(".detail-title").textContent()).trim() === "Portfolio");
check("total card label + THB value", (await sub().locator(".pfo-total").textContent()).includes("Total invested") && /THB [\d,]+/.test(await sub().locator(".pfo-total b").textContent()));
check("total = THB 1,789,500 (sum of purchase prices)", (await sub().locator(".pfo-total b").textContent()).includes("1,789,500"), await sub().locator(".pfo-total b").textContent());
check("coverage 8/9 + private", (await sub().locator(".pfo-total").textContent()).includes("Purchase cost of 8/9") && await sub().locator(".pfo-lock").count() === 1);
check("hero market line (value + %)", (await sub().locator(".pfo-total").textContent()).includes("Market value ฿1,888,500") && (await sub().locator(".pfo-total").textContent()).includes("+5.5%"), (await sub().locator(".pfo-total").textContent()).replace(/\s+/g, " "));
check("no stat tiles (merged into hero per feedback)", await sub().locator(".pfo-stat, .pfo-stats").count() === 0);
check("no top brands card (minimal per feedback)", await sub().locator(".pfo-brow").count() === 0);
check("no sold-history row on page (lives in ⋯ menu)", await sub().locator(".pfo-soldrow").count() === 0);
await page.screenshot({ path: `${OUT}/pfo-dashboard.png` });

// ============ 2) asset list ============
check("9 asset rows", await sub().locator(".pfo-row").count() === 9);
check("no chips on rows (IG minimal)", await sub().locator(".pfo-row .pfo-chip").count() === 0);
check("rows = name + ref·meta only", (await sub().locator(".pfo-row .mn").first().textContent()).includes("Cartier Tank Must XL") && (await sub().locator(".pfo-row .md").first().textContent()).includes("WSTA0040"));
check("no-valuation row shows —", (await sub().locator(".pfo-val").allTextContents()).includes("—"));
check("rows show purchase price as main value", (await sub().locator(".pfo-val").first().textContent()).includes("119,000"), await sub().locator(".pfo-val").first().textContent());
check("no secondary line on rows (no Mkt/gl/src)", await sub().locator(".pfo-row .pfo-gl, .pfo-row .pfo-src").count() === 0);
await page.screenshot({ path: `${OUT}/pfo-assets.png`, fullPage: false });

// ============ 3) asset detail ============
await sub().locator(".pfo-row").nth(1).click(); // Cartier Tank Must Large (sale)
await page.waitForTimeout(350);
check("asset detail opens", (await sub().locator(".detail-title").textContent()).trim() === "Asset");
check("hero = detail-hero + counter 1/2 + dots", await sub().locator(".detail-hero[data-pfaid='pfa-02']").count() === 1 && (await sub().locator(".photo-counter").textContent()).trim() === "1/2" && await sub().locator(".photo-dots span").count() === 2);
check("detail name + sale chip", (await sub().locator(".pfd-name").textContent()).includes("Cartier Tank Must Large") && await sub().locator(".pfo-chip.st-sale").count() === 1);
const heroBox = await sub().locator(".detail-hero").boundingBox();
await page.mouse.click(heroBox.x + heroBox.width - 20, heroBox.y + heroBox.height / 2);
await page.waitForTimeout(250);
check("tap right half advances photo → 2/2", (await sub().locator(".photo-counter").textContent()).trim() === "2/2");
const kvTxt = await sub().locator(".pfd-kv").allTextContents();
check("detail value fields", kvTxt.some(t => t.includes("Current value")) && kvTxt.some(t => t.includes("Purchase price")) && kvTxt.some(t => t.includes("Unrealized gain/loss")) && kvTxt.some(t => t.includes("Holding period")));
check("detail data-source rows", kvTxt.some(t => t.includes("Estimated market") && t.includes("–")) && kvTxt.some(t => t.includes("Last price update")) && kvTxt.some(t => t.includes("TukDaeng Market Data")), kvTxt.filter(t => t.includes("Estimated") || t.includes("Data source")).join("|"));
check("listing card: asking + expected profit + above market", (await sub().locator(".pfo-card").nth(1).textContent()).includes("Asking price") && (await sub().locator(".pfo-card").nth(1).textContent()).includes("Expected profit") && (await sub().locator(".pfo-card").nth(1).textContent()).includes("Above market"));
check("owner-only note", (await sub().locator(".pfo-note").textContent()).includes("Owner-only"));
await page.screenshot({ path: `${OUT}/pfo-asset-detail.png` });
await sub().locator(".sub-back").click();
await page.waitForTimeout(300);
check("back to portfolio", (await sub().locator(".detail-title").textContent()).trim() === "Portfolio");

// ============ 4) sold history + detail (link under list) ============
check("no ⋯ menu in normal mode (dev-only)", await sub().locator(".pfo-more").count() === 0);
check("sold history link sits in Assets header row", await sub().locator(".pfo-sec .pfo-soldlink").count() === 1 && !(await sub().locator(".pfo-soldlink").textContent()).includes("sold"));
await sub().locator(".pfo-soldlink").click();
await page.waitForTimeout(400);
check("sold history opens", (await sub().locator(".detail-title").textContent()).trim() === "Sold history");
check("3 sold rows", await sub().locator(".pfo-row").count() === 3);
check("sold row minimal = sale price only", (await sub().locator(".pfo-row").first().textContent()).includes("295,000") && (await sub().locator(".pfo-row").first().textContent()).includes("Sold") && await sub().locator(".pfo-row .pfo-gl").count() === 0);
await page.screenshot({ path: `${OUT}/pfo-sold.png` });
await sub().locator(".pfo-row").first().click();
await page.waitForTimeout(350);
check("sold detail opens", (await sub().locator(".detail-title").textContent()).trim() === "Sold item");
const skv = (await sub().locator(".pfd-kv").allTextContents()).join("|");
check("sold detail all fields", ["Sale date", "Buyer", "Contact", "Sale price", "Payment method", "Attachment", "Purchase price", "Realized gain/loss", "Holding period"].every(k => skv.includes(k)), skv.slice(0, 120));
check("realized +฿34,000", skv.includes("+฿34,000"), skv.match(/Realized[^|]*/)?.[0] || "");
await page.screenshot({ path: `${OUT}/pfo-sold-detail.png` });
await sub().locator(".sub-back").click();
await page.waitForTimeout(300);
await sub().locator(".sub-back").click();
await page.waitForTimeout(300);
check("back to portfolio from sold", (await sub().locator(".detail-title").textContent()).trim() === "Portfolio");

// ============ 5) preview states via ⋯ menu (dev-only, needs ?dev=1) ============
await page.goto(`${BASE}/index.html?dev=1`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);
await scr().locator('.bottom-nav .nav-item[data-navgo="profile"]').click();
await page.waitForTimeout(400);
await sub().locator('.pf-iconbtn[data-sub="portfolio"]').click();
await page.waitForTimeout(400);
check("⋯ visible only in dev mode", await sub().locator(".pfo-more").count() === 1);
await sub().locator(".pfo-more").click();
await page.waitForTimeout(300);
check("preview sheet opens (5 options)", await scr().getAttribute("class").then(c => c.includes("pm-open")) && await page.locator(".comment-sheet [data-pfosim]").count() === 5);
await page.locator('[data-pfosim="nomkt"]').click();
await page.waitForTimeout(350);
check("nomkt banner shows", (await sub().locator(".pfo-banner").textContent()).includes("unavailable"));
check("nomkt: rows stay minimal (no market lines)", await sub().locator(".pfo-row .pfo-gl, .pfo-row .pfo-src, .pfo-row .pfo-chip").count() === 0);
check("nomkt: market line unavailable", (await sub().locator(".pfo-total").textContent()).includes("Market value unavailable"));
check("simbar visible", (await sub().locator(".pfo-simbar").textContent()).includes("Preview:"));
await page.screenshot({ path: `${OUT}/pfo-nomkt.png` });

await sub().locator(".pfo-more").click();
await page.waitForTimeout(250);
await page.locator('[data-pfosim="empty"]').click();
await page.waitForTimeout(350);
check("empty state = No data found", (await sub().locator(".sr-empty-block .t").textContent()).includes("No data found"));
await page.screenshot({ path: `${OUT}/pfo-empty.png` });

await sub().locator(".pfo-more").click();
await page.waitForTimeout(250);
await page.locator('[data-pfosim="failed"]').click();
await page.waitForTimeout(350);
check("load failed state", (await sub().locator(".sr-empty-block .t").textContent()).includes("Unable to load data"));
await sub().locator(".pfo-retry").click();
await page.waitForTimeout(350);
check("retry restores normal", await sub().locator(".pfo-total").count() === 1);

await sub().locator(".pfo-more").click();
await page.waitForTimeout(250);
await page.locator('[data-pfosim="denied"]').click();
await page.waitForTimeout(350);
check("permission denied state", (await sub().locator(".sr-empty-block .t").textContent()).includes("Permission denied"));
await page.screenshot({ path: `${OUT}/pfo-denied.png` });
await sub().locator('.pfo-simbar [data-pfosim=""]').click();
await page.waitForTimeout(350);
check("reset restores normal", await sub().locator(".pfo-total").count() === 1);

// ============ 6) back to profile + light theme ============
await sub().locator(".sub-back").click();
await page.waitForTimeout(300);
check("back to own profile", await sub().locator(".pf-uname").count() === 1);
await page.locator("#themeToggle").click();
await page.waitForTimeout(300);
await scr().locator('.bottom-nav .nav-item[data-navgo="profile"]').click();
await page.waitForTimeout(400);
await sub().locator('.pf-iconbtn[data-sub="portfolio"]').click();
await page.waitForTimeout(400);
check("portfolio renders in light theme", await scr().getAttribute("data-theme") === "light" && await sub().locator(".pfo-row").count() === 9);
await page.screenshot({ path: `${OUT}/pfo-light.png` });
await page.locator("#themeToggle").click();
await page.waitForTimeout(300);

check("no console errors", errors === 0);

await browser.close();
console.log(`\n${failed} failed / ${errors} console errors`);
process.exit(failed || errors ? 1 : 0);
