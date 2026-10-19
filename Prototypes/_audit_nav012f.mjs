import { chromium } from "playwright";
import { pathToFileURL } from "url";
const FILE_URL = pathToFileURL("d:/TukDaeng/Prototypes/fo-flow/index.html").href;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
await page.goto(FILE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
const reset = async () => { await page.evaluate(() => { const s=document.querySelector(".screen"); s._subStack=[]; s.classList.remove("sub-open","pv-open"); }); await page.waitForTimeout(300); };
const dump = (sel) => page.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0).slice(0,1).map(e => { const c = getComputedStyle(e); const r=e.getBoundingClientRect(); return `${sel}: bg=${c.backgroundColor} bf=${c.backdropFilter} bd=${c.borderTopWidth} ${c.borderTopColor} sh=${c.boxShadow.slice(0,70)} r=${c.borderRadius} size=${Math.round(r.width)}x${Math.round(r.height)}`; }).join(""), sel);
for (const theme of ["dark", "light"]) {
  console.log("== " + theme);
  await page.evaluate(t => document.querySelector(".screen").setAttribute("data-theme", t), theme);
  await page.evaluate(() => document.querySelector(`.screen [data-navgo="chat"]`).click()); await page.waitForTimeout(500);
  for (const s of [".bottom-nav", ".ch-nav-tabs", ".ch-head-actions", ".ch-top-tab.on, .ch-top-tab.active"]) console.log(await dump(s));
  await page.locator(".ch-top-tab:visible").nth(1).click(); await page.waitForTimeout(400);
  await page.locator("[data-chgo='item']:visible").first().click(); await page.waitForTimeout(600);
  console.log(await dump(".ch-itemcard"));
  await reset();
  await page.evaluate(() => document.querySelector(`.screen [data-navgo="board"]`).click()); await page.waitForTimeout(500);
  await page.locator("[data-bdart]:visible").first().click(); await page.waitForTimeout(600);
  for (const s of [".bd-pill-btn", ".bd-pill-group"]) console.log(await dump(s));
  await reset();
  await page.evaluate(() => { const s=document.querySelector(".screen"); const p = POSTS.find(x=>x.seller==="king.mr.fox")||POSTS[0]; openPostViewer(s,[p,p],p.id,0,false,"Posts","king.mr.fox"); }); await page.waitForTimeout(600);
  for (const s of [".page-pv .pv-back", ".page-pv .pfp-follow", ".page-pv .pv-srch"]) console.log(await dump(s));
  await page.evaluate(() => document.querySelector(".screen").classList.remove("pv-open")); await reset();
}
await browser.close();
