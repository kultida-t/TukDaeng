// Verify fo-flow PROFILE-015 (rev 2): Edit Profile — ชื่อผู้ใช้ = same field as sign-up
// (3–20 a-z0-9_. + unique), placeholders, red errors matching .ob-msg (#e5484d),
// and social sign-up auto-pulls provider name + photo.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";
const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-PROFILE-015";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
let errors = 0, failed = 0;
page.on("pageerror", e => { errors++; console.log("PAGE ERR:", e.message); });
page.on("console", m => { if (m.type() === "error") { errors++; console.log("CONSOLE ERR:", m.text()); } });
const check = (n, ok, x = "") => { console.log(`${ok ? "PASS" : "FAIL"} ${n}${x ? " — " + x : ""}`); if (!ok) failed++; };
const scr = () => page.locator(".screen"), sub = () => page.locator(".page-sub");
const wait = ms => page.waitForTimeout(ms);

await page.addInitScript(() => {
  localStorage.setItem("fo_onboarded", "1");
  localStorage.setItem("fo_toured", "1");
  localStorage.setItem("fo_session", "member");
  localStorage.setItem("fo_lang", "th");
});
await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" }); await wait(700);
await scr().locator('.bottom-nav .nav-item[data-navgo="profile"]').click(); await wait(400);
await sub().locator(".pf-edit").click(); await wait(400);

// 1) ชื่อผู้ใช้ field = same field as sign-up (shows username, not display name)
check("label is ชื่อผู้ใช้", (await sub().locator(".pe-f span").first().textContent()).includes("ชื่อผู้ใช้"));
check("field holds username 'king.mr.fox'", (await sub().locator(".pe-name").inputValue()) === "king.mr.fox");
check("placeholders on all 3 fields", await sub().locator(".pe-name[placeholder], .pe-bio[placeholder], .pe-link[placeholder]").count() === 3);

// 2) invalid username -> red error like onboarding, save blocked
await sub().locator(".pe-name").fill("Bad Name!");
await sub().locator(".pe-save").click(); await wait(300);
check("invalid username shows error", await sub().locator(".pe-name.is-err").count() === 1);
const errTxt = await sub().locator(".pe-name ~ .pe-err").first().textContent();
check("same error message as sign-up", errTxt.includes("3–20 ตัวอักษร"), errTxt.trim());
const errColor = await sub().locator(".pe-name ~ .pe-err").first().evaluate(el => getComputedStyle(el).color);
check("error color = #e5484d (same as .ob-msg)", errColor === "rgb(229, 72, 77)", errColor);
check("save blocked", await sub().locator(".pe-save").count() === 1);
await page.screenshot({ path: `${OUT}/b-name-error.png` });

// 3) typing clears error
await sub().locator(".pe-name").fill("mrfox"); await wait(150);
check("error clears on type", await sub().locator(".pe-name.is-err").count() === 0);

// 4) taken username -> error
await sub().locator(".pe-name").fill("dial.dude"); await wait(150);
await sub().locator(".pe-save").click(); await wait(300);
check("taken username shows error", await sub().locator(".pe-name.is-err").count() === 1);
await sub().locator(".pe-name").fill("king.mr.fox"); await wait(150);

// 5) bad link -> error; valid forms save
await sub().locator(".pe-link").fill("not a url");
await sub().locator(".pe-save").click(); await wait(300);
check("bad link shows error", await sub().locator(".pe-link.is-err").count() === 1);
await sub().locator(".pe-link").fill("www.mrfox.com"); await wait(150);

// 6) rename username -> propagates to profile (disp = username too)
await sub().locator(".pe-name").fill("king.watch");
await sub().locator(".pe-save").click(); await wait(500);
check("rename saves + back to profile", await sub().locator(".pf-uname").count() === 1);
check("profile username updated", (await sub().locator(".pf-uname").textContent()).includes("king.watch"));
check("display name = username (same field)", (await sub().locator(".pf-disp").textContent()).includes("king.watch"));
await page.screenshot({ path: `${OUT}/d-renamed-profile.png` });

// 7) social sign-up pulls provider name + photo automatically
const ctx2 = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
await ctx2.addInitScript(() => { localStorage.setItem("fo_toured", "1"); localStorage.setItem("fo_lang", "th"); });
const p2 = await ctx2.newPage();
p2.on("pageerror", e => { errors++; console.log("PAGE ERR(2):", e.message); });
await p2.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await p2.waitForTimeout(3600); // splash -> lang
const ob = p2.locator(".ob");
await ob.locator('[data-ob="go:welcome"]').click(); await wait(300);
await ob.locator('[data-ob="welcome"]').click(); await p2.waitForTimeout(1900); // -> consent
await ob.locator('[data-ob="cons:all"]').click(); await wait(300); // -> notif
await ob.locator('[data-ob="go:track"]').click(); await wait(300); // skip notif -> track
await ob.locator('[data-ob="os:open"]').click(); await wait(300); // OS ask dialog
await ob.locator('[data-ob="os:yes"]').click(); await wait(400); // -> member sheet
await ob.locator('[data-ob="social:google"]').click(); await wait(400); // -> profile step
const avSrc = await ob.locator(".ob-avatar img").getAttribute("src");
check("google photo pulled to profile setup", (avSrc || "").includes("u-1088.png"), avSrc);
const uVal = await ob.locator('input[data-f="user"]').inputValue();
check("username prefilled from google name", /^[a-z0-9_.]{3,20}$/.test(uVal), uVal);
await p2.screenshot({ path: `${OUT}/e-social-prefill.png` });
await ob.locator('[data-ob="profile"]').click(); await p2.waitForTimeout(700);
await p2.locator('.screen .bottom-nav .nav-item[data-navgo="profile"]').click(); await p2.waitForTimeout(500);
check("profile shows google username", (await p2.locator(".pf-uname").textContent()).includes(uVal));
check("profile avatar = google photo", (await p2.locator(".pf-av img").getAttribute("src") || "").includes("u-1088.png"));
check("no console errors", errors === 0);
await browser.close();
console.log(`\n${failed} failed / ${errors} console errors`);
process.exit(failed || errors ? 1 : 0);
