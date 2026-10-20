// Verify fo-flow PROFILE-015: Edit Profile fields have placeholder examples + validation
// (name required ≤30, bio ≤150, link = http(s) URL or @handle; errors block save, clear on type)
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";
const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-PROFILE-015";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 })).newPage();
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

// 1) placeholders present
check("name placeholder", (await sub().locator(".pe-name").getAttribute("placeholder") || "").length > 0);
check("bio placeholder", (await sub().locator(".pe-bio").getAttribute("placeholder") || "").includes("@") === false && (await sub().locator(".pe-bio").getAttribute("placeholder") || "").length > 0);
check("link placeholder mentions URL + @handle", /https?:\/\//.test(await sub().locator(".pe-link").getAttribute("placeholder") || "") && (await sub().locator(".pe-link").getAttribute("placeholder") || "").includes("@"));
await page.screenshot({ path: `${OUT}/a-placeholders.png` });

// 2) empty display name -> error, no save
await sub().locator(".pe-name").fill("   ");
await sub().locator(".pe-save").click(); await wait(300);
check("empty name shows error", await sub().locator(".pe-name.is-err").count() === 1 && !(await sub().locator(".pe-name ~ .pe-err").first().evaluate(el => el.hidden)));
check("save blocked (still on edit screen)", await sub().locator(".pe-save").count() === 1);
await page.screenshot({ path: `${OUT}/b-name-error.png` });

// 3) typing clears the error
await sub().locator(".pe-name").fill("demo");
await wait(200);
check("error clears on type", await sub().locator(".pe-name.is-err").count() === 0);

// 4) invalid link -> error, no save
await sub().locator(".pe-link").fill("not a url");
await sub().locator(".pe-save").click(); await wait(300);
check("bad link shows error", await sub().locator(".pe-link.is-err").count() === 1);
check("save blocked on bad link", await sub().locator(".pe-save").count() === 1);
await page.screenshot({ path: `${OUT}/c-link-error.png` });

// 5) valid @handle link saves
await sub().locator(".pe-link").fill("@watchclub");
await sub().locator(".pe-save").click(); await wait(500);
check("@handle link saves + back to profile", await sub().locator(".pf-uname").count() === 1);
check("profile shows @handle link", (await sub().locator(".pf-link").first().textContent()).includes("watchclub"));

// 6) valid https URL link saves
await sub().locator(".pf-edit").click(); await wait(400);
await sub().locator(".pe-link").fill("https://watchclub.example.com");
await sub().locator(".pe-save").click(); await wait(500);
check("https link saves", await sub().locator(".pf-uname").count() === 1);

// 7) stored bare-domain link (www.mrfox.com) still saves untouched
await sub().locator(".pf-edit").click(); await wait(400);
await sub().locator(".pe-link").fill("www.mrfox.com");
await sub().locator(".pe-save").click(); await wait(500);
check("bare domain link saves", await sub().locator(".pf-uname").count() === 1);
check("no console errors", errors === 0);
await browser.close();
console.log(`\n${failed} failed / ${errors} console errors`);
process.exit(failed || errors ? 1 : 0);
