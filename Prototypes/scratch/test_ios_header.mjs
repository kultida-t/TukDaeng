import { chromium } from 'playwright';
import { pathToFileURL } from 'url';

const FILE_URL = pathToFileURL('d:/TukDaeng/Prototypes/fo-flow/index.html').href;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 440, height: 956 } });
  await page.goto(FILE_URL);
  await page.waitForTimeout(500);

  // 1. Go to Profile (king.mr.fox)
  await page.locator('.bottom-nav:visible .nav-item[data-navgo="profile"]').first().click();
  await page.waitForTimeout(400);

  // Click first post in profile grid -> opens openPostViewer with king.mr.fox (User Image 1)
  await page.locator('.pf-tile').first().click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'Prototypes/screenshots/pv_mrfox_current.png' });
  console.log('Saved pv_mrfox_current.png');

  // Scroll down in pv-track
  await page.locator('.page-pv .pv-track').evaluate(el => el.scrollTop = 250);
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'Prototypes/screenshots/pv_mrfox_scrolled.png' });
  console.log('Saved pv_mrfox_scrolled.png');

  // Close viewer
  await page.locator('.page-pv .pv-back').first().click();
  await page.waitForTimeout(300);

  // 2. Open another profile with Follow button (Watch 777)
  await page.evaluate(() => {
    const scr = document.querySelector('.screen');
    const p1 = POSTS.find(p => p.seller === "Watch 777");
    openPostViewer(scr, [p1], p1.id, 0, false, "Posts", "Watch 777");
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'Prototypes/screenshots/pv_watch777_current.png' });
  console.log('Saved pv_watch777_current.png');

  // Scroll down in pv-track
  await page.locator('.page-pv .pv-track').evaluate(el => el.scrollTop = 250);
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'Prototypes/screenshots/pv_watch777_scrolled.png' });
  console.log('Saved pv_watch777_scrolled.png');

  // 3. Also test Light Mode
  await page.evaluate(() => document.querySelector('.screen').setAttribute('data-theme', 'light'));
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'Prototypes/screenshots/pv_watch777_light.png' });
  console.log('Saved pv_watch777_light.png');

  await browser.close();
  console.log('Done!');
})();
