import { chromium } from '@playwright/test';
console.log('1. Starting test-runner...');

try {
  console.log('2. Launching chromium...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  console.log('3. Chromium launched successfully!');
  const page = await browser.newPage();
  console.log('4. Page created!');
  await page.setContent('<h1>Hello World</h1>');
  console.log('5. Content set!');
  await browser.close();
  console.log('6. Browser closed! Test PASSED!');
} catch (err) {
  console.error('Test FAILED:', err);
}
