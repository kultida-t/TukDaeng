// Temporary verification: PR1-PR4 detail price variants + duplicate header like removal
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const URL = "http://127.0.0.1:4173/feed-social-redesign.html";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
await page.goto(URL);
await page.waitForLoadState("domcontentloaded");
await page.waitForTimeout(600);

for (const pr of ["pr1", "pr2", "pr3", "pr4"]) {
  const info = await page.evaluate((pr) => {
    state.pr = pr;
    const scr = document.querySelector('.screen[data-theme="dark"]');
    const pd = scr.querySelector('.page-detail');
    pd.innerHTML = detailHTML(POSTS[0]);
    scr.classList.add('detail-open');
    const headBtns = pd.querySelectorAll('.detail-head .icon-btn').length;
    const headHasHeart = !!pd.querySelector('.detail-head .icon-btn svg path[d^="M20.8"]');
    const heroPrice = !!pd.querySelector('.detail-price');
    const tagRow = !!pd.querySelector('.tag-price-row');
    const priceTag = !!pd.querySelector('.price-tag');
    const priceGroup = [...pd.querySelectorAll('.spec-row .l')].some(l => l.textContent.trim() === 'Asking Price');
    return { headBtns, headHasHeart, heroPrice, tagRow, priceTag, priceGroup };
  }, pr);
  console.log(pr, JSON.stringify(info));
  await page.waitForTimeout(150);
  const phone = page.locator('.screen[data-theme="dark"]').locator('..');
  await phone.screenshot({ path: `screenshots/pr-${pr}-dark.png` });
}

await browser.close();
console.log("done");
