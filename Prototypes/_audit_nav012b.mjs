import { chromium } from "playwright";
import { mkdirSync, readdirSync } from "fs";
import { pathToFileURL } from "url";
const FILE_URL = pathToFileURL("d:/TukDaeng/Prototypes/fo-flow/index.html").href;
const OUT = "d:/TukDaeng/Prototypes/screenshots/task-NAV-012/before/sub";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
page.on("pageerror", e => console.log("PAGEERR", e.message));
await page.goto(FILE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
const scr = page.locator(".screen").first();
const names = ["create","search","sfilter","recents","settings","about_account","change_pwd","del_account","lang","notif_settings","help","privacy","terms","about_app","favorites","muted","blocked","prefs","sensitive","theme","alerts","board","boardsearch","boardall","chat","chatcfg","walerts","saved","archive","savedcol","wishlist","wishcol","interested","ni","report","report:user","report:post","profile:king.mr.fox","profile:Watch 777","pfollow:king.mr.fox","about:Watch 777","pedit","portfolio","soldhist","chsettings:t1","chatroom:t1"];
await page.evaluate(() => { document.querySelector(".screen").setAttribute("data-theme","dark"); });
for (const n of names) {
  try {
    await page.evaluate(n => { const s = document.querySelector(".screen"); pushSub(s, n); }, n);
    await page.waitForTimeout(450);
    await scr.screenshot({ path: `${OUT}/${n.replace(/[^a-z0-9_]/gi,"_")}.png` });
    await page.evaluate(() => { const s = document.querySelector(".screen"); s._subStack = []; s.classList.remove("sub-open"); });
    await page.waitForTimeout(150);
  } catch (e) { console.log("ERR", n, e.message.slice(0,100)); }
}
await browser.close();
console.log(readdirSync(OUT).length);
