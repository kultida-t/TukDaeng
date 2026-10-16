// Verify fo-flow PROFILE-010: Share profile = IG-style QR page (COLOR, scan, Share profile / Copy link / Download)
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-PROFILE-010";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] });
const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2, acceptDownloads: true, permissions: ["clipboard-read", "clipboard-write", "camera"] });
const page = await ctx.newPage();
let errors = 0, failed = 0;
page.on("console", m => { if (m.type() === "error") { errors++; console.log("CONSOLE ERR:", m.text()); } });
page.on("pageerror", e => { errors++; console.log("PAGE ERR:", e.message); });
const check = (n, ok, x = "") => { console.log(`${ok ? "PASS" : "FAIL"} ${n}${x ? " — " + x : ""}`); if (!ok) failed++; };
const scr = () => page.locator(".screen");
const toast = () => page.locator(".sc-toast.show").textContent();

await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);
await scr().locator('.bottom-nav .nav-item[data-navgo="profile"]').click();
await page.waitForTimeout(500);

await page.locator(".pf-share").click();
await page.waitForTimeout(500);
check("QR page opens", await page.locator(".pf-qr").isVisible());
check("QR svg + handle", (await page.locator(".pf-qr-card svg text").last().textContent()) === "@KING.MR.FOX");
check("3 actions", (await page.locator(".pf-qr-act").allTextContents()).join("|") === "Share profile|Copy link|Download");
await page.screenshot({ path: OUT + "/01-qr.png" });

const bg0 = await page.locator(".pf-qr").evaluate(e => e.style.background);
await page.locator(".pf-qr-color").click();
const bg1 = await page.locator(".pf-qr").evaluate(e => e.style.background);
check("COLOR changes theme", bg0 !== bg1);
await page.screenshot({ path: OUT + "/02-color.png" });

await page.locator(".pf-qr-scan").click();
await page.waitForTimeout(600);
check("scan opens camera", await page.locator(".pf-cam video").isVisible());
check("camera stream live", await page.locator(".pf-cam video").evaluate(v => !!v.srcObject && v.srcObject.getTracks().some(t => t.readyState === "live")));
await page.screenshot({ path: OUT + "/02b-camera.png" });
await page.locator(".pf-cam-x").click();
await page.waitForTimeout(200);
check("camera X returns to QR", (await page.locator(".pf-cam").count()) === 0 && await page.locator(".pf-qr-card").isVisible());
const fonts = await page.locator(".pf-qr-act, .pf-qr-color").evaluateAll(els => els.map(e => getComputedStyle(e).fontFamily));
const ref = await page.locator(".pf-edit").evaluate(e => getComputedStyle(e).fontFamily);
check("QR buttons use app font", fonts.every(f => f === ref), ref);

await page.locator(".pf-qr-copy").click();
await page.waitForTimeout(250);
check("Copy link toast", (await toast()) === "Link copied");
check("clipboard has link", (await page.evaluate(() => navigator.clipboard.readText())) === "https://tukdaeng.app/u/king.mr.fox");

const [dl] = await Promise.all([page.waitForEvent("download"), page.locator(".pf-qr-dl").click()]);
check("Download png", dl.suggestedFilename() === "king.mr.fox-qr.png", dl.suggestedFilename());
await page.waitForTimeout(300);
check("Download toast", (await toast()) === "QR code saved");

await page.locator(".pf-qr-share").click();
await page.waitForTimeout(500);
check("Share profile opens share sheet over QR", await page.locator(".comment-sheet.sh .sh-app").first().isVisible());
await page.screenshot({ path: OUT + "/03-share-sheet.png" });
await page.locator(".sh-app[data-app=line]").click();
await page.waitForTimeout(300);
check("share app toast", (await toast()) === "Shared to LINE");
check("QR page still open", await page.locator(".pf-qr").isVisible());

await page.locator(".pf-qr-x").click();
await page.waitForTimeout(300);
check("X closes QR", (await page.locator(".pf-qr").count()) === 0);
check("Profile intact", await page.locator(".pf-edit").isVisible());
await page.locator(".pf-share").click();
await page.waitForTimeout(300);
check("reopen single overlay", (await page.locator(".pf-qr").count()) === 1);

console.log(`\nerrors=${errors} failed=${failed}`);
await browser.close();
process.exit(failed || errors ? 1 : 0);
