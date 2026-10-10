// Temporary verification: DH1-DH5 detail header variants
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const URL = "http://127.0.0.1:4173/feed-social-redesign.html";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
await page.goto(URL);
await page.waitForLoadState("domcontentloaded");
await page.waitForTimeout(600);

for (const dh of ["dh1", "dh2", "dh3", "dh4", "dh5"]) {
  const info = await page.evaluate((dh) => {
    state.dh = dh;
    const scr = document.querySelector('.screen[data-theme="dark"]');
    const pd = scr.querySelector('.page-detail');
    pd.innerHTML = detailHTML(POSTS[0]);
    scr.classList.add('detail-open');
    return {
      hasHead: !!pd.querySelector('.detail-head'),
      title: pd.querySelector('.detail-head .detail-title')?.textContent ?? null,
      fabs: pd.querySelectorAll('.hero-fab').length,
      hasAv: !!pd.querySelector('.head-av'),
      backBtn: !!pd.querySelector('.detail-back'),
    };
  }, dh);
  console.log(dh, JSON.stringify(info));
  await page.waitForTimeout(150);
  const phone = page.locator('.screen[data-theme="dark"]').locator('..');
  await phone.screenshot({ path: `screenshots/dh-${dh}-dark.png` });
}

await browser.close();
console.log("done");
