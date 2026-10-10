import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1500, height: 900 } });
await p.goto('http://127.0.0.1:4173/feed-social-redesign.html');
await p.waitForTimeout(400);

for (const ds of ['acc', 'tabs']) {
  await p.locator(`.ds-btn[data-ds="${ds}"]`).click();
  await p.waitForTimeout(300);
  const scr = p.locator('.screen').last();
  await scr.locator('.details-toggle').first().click();
  await p.waitForTimeout(400);
  await scr.locator('.feed-scroll').evaluate(el => { el.scrollTop = 700; });
  await p.waitForTimeout(200);
  await p.screenshot({ path: `C:/Users/Admin/Desktop/TukDaeng/tmp-evidence/feed-r2-exp-${ds}.png` });
}
await b.close();
console.log('ok');
