import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const srcDir = path.resolve('deliverables/appstore-screenshots');
  const outDir = path.resolve('deliverables/appstore-phones');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (let i = 1; i <= 6; i++) {
    const srcFile = path.join(srcDir, `screenshot_${i}.png`).replace(/\\/g, '/');
    const outFile = path.join(outDir, `phone_${i}.png`);

    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body style="margin:0; background: transparent;">
        <canvas id="c"></canvas>
      </body>
      </html>
    `);

    await page.evaluate(async (imgSrc) => {
      const img = new Image();
      img.src = imgSrc;
      await new Promise(r => img.onload = r);

      const canvas = document.getElementById('c');
      // The phone is centered horizontally, roughly from y=190 to y=1260
      // Let's crop from y=185 to 1255, height ~1070, width ~540 from x=30
      const sx = 40;
      const sy = 190;
      const sw = 520;
      const sh = 1070;

      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    }, `file:///${srcFile}`);

    const canvasEl = await page.$('#c');
    await canvasEl.screenshot({ path: outFile, omitBackground: true });
    console.log(`Cropped phone_${i}.png saved to ${outFile}`);
  }

  await browser.close();
  console.log('All 6 phones cropped successfully!');
})();
