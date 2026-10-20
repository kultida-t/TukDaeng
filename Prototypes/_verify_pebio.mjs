// PROFILE-016 verify — bio textarea must show up to 150 chars with no scrollbar
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4173/fo-flow";
const results = [];
const ok = (name, cond) => results.push([cond ? "PASS" : "FAIL", name]);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
const errors = [];
page.on("pageerror", (e) => errors.push("PAGE ERR: " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("CONSOLE: " + m.text()); });
const sub = () => page.locator(".page-sub"), scr = () => page.locator(".screen");
const wait = (ms) => page.waitForTimeout(ms);

await page.addInitScript(() => {
  localStorage.setItem("fo_onboarded", "1");
  localStorage.setItem("fo_toured", "1");
  localStorage.setItem("fo_session", "member");
  localStorage.setItem("fo_lang", "th");
});
await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" }); await wait(700);
await scr().locator('.bottom-nav .nav-item[data-navgo="profile"]').click(); await wait(400);
await sub().locator(".pf-edit").click(); await wait(400);

const bio = sub().locator(".pe-bio");
await bio.waitFor({ timeout: 5000 });

// Thai worst case — 150 chars
await bio.fill("กขคงจงฉชซญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหอฮกขคงจงฉชซญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหอฮกขคงจงฉชซญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหอฮ".slice(0, 150));
await wait(150);
const m1 = await bio.evaluate((el) => ({
  scrollH: el.scrollHeight, clientH: el.clientHeight,
  overflowY: getComputedStyle(el).overflowY,
  scrollW: el.scrollWidth, clientW: el.clientWidth,
}));
ok("150 Thai chars: content fits (scrollH <= clientH)", m1.scrollH <= m1.clientH + 2);
ok("overflow-y hidden (no visible scrollbar)", m1.overflowY === "hidden");
ok("no horizontal scroll", m1.scrollW <= m1.clientW + 2);

// Latin worst case — 150 chars
await bio.fill("a".repeat(150));
await wait(150);
const m2 = await bio.evaluate((el) => ({ scrollH: el.scrollHeight, clientH: el.clientHeight }));
ok("150 latin chars: content fits", m2.scrollH <= m2.clientH + 2);

ok("150 chars retained", (await bio.inputValue()).length === 150);

await page.screenshot({ path: "screenshots/task-PROFILE-016/bio-full-150.png" });
ok("no console errors", errors.length === 0);
errors.forEach((e) => console.log(e));

await browser.close();
results.forEach(([s, n]) => console.log(`${s} ${n}`));
const fails = results.filter(([s]) => s === "FAIL").length;
console.log(`\n${fails} failed / ${errors.length} console errors`);
process.exit(fails ? 1 : 0);
