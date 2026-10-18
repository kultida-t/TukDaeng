import { chromium } from 'playwright';
import { pathToFileURL } from 'url';

const FILE_URL = pathToFileURL('d:/TukDaeng/Prototypes/fo-flow/index.html').href;

(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 440, height: 956 } });
    await page.goto(FILE_URL);
    await page.waitForTimeout(500);
    
    // Navigate to chat
    await page.locator('.bottom-nav:visible .nav-item[data-navgo="chat"]').first().click();
    await page.waitForTimeout(400);
    
    // Switch to item view
    await page.locator('.ch-top-tab[data-chview="item"]').first().click();
    await page.waitForTimeout(400);
    
    // Click first item row
    await page.locator('button.ch-row[data-chgo="item"]').first().click();
    await page.waitForTimeout(600);

    // Before scroll
    await page.screenshot({ path: 'Prototypes/screenshots/pill_before_scroll.png' });
    console.log('Saved pill_before_scroll.png');
    
    // Light mode before and after scroll
    await page.evaluate(() => document.querySelector('.screen').setAttribute('data-theme', 'light'));
    await page.locator('.sub-scroll').evaluate(el => el.scrollTop = 0);
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'Prototypes/screenshots/pill_light_before.png' });
    
    await page.locator('.sub-scroll').evaluate(el => el.scrollTop = 150);
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'Prototypes/screenshots/pill_light_after.png' });
    console.log('Saved pill_light_after.png');

    await browser.close();
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err);
  }
})();
