import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const deliverablesDir = path.join(projectRoot, 'deliverables');
const htmlFilePath = path.join(deliverablesDir, 'Univerza_Tukdaeng_User_Manual.html');

async function run() {
  console.log('1. Starting browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 1020 });
  
  const fileUrl = pathToFileURL(htmlFilePath).href;
  console.log('2. Loading HTML:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'load', timeout: 30000 });
  
  // Wait for images and fonts to settle
  await page.waitForTimeout(2000);
  
  const targetPdf = path.join(deliverablesDir, 'Univerza_Tukdaeng_User_Manual.pdf');
  const tempPdf = path.join(deliverablesDir, 'Univerza_Tukdaeng_User_Manual_new.pdf');
  
  console.log('3. Rendering PDF...');
  await page.pdf({
    path: tempPdf,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
    preferCSSPageSize: true
  });
  console.log('Rendered temp PDF, size:', fs.statSync(tempPdf).size);
  
  // Try to overwrite targetPdf
  try {
    if (fs.existsSync(targetPdf)) {
      try {
        fs.unlinkSync(targetPdf);
      } catch (err) {
        console.warn('Cannot delete existing target PDF (may be locked by viewer):', err.message);
      }
    }
    fs.copyFileSync(tempPdf, targetPdf);
    console.log('Successfully updated:', targetPdf);
    fs.unlinkSync(tempPdf);
  } catch (err) {
    console.warn('Failed to overwrite targetPdf directly:', err.message);
    console.log('PDF is available at:', tempPdf);
  }

  // Also capture page previews
  const previewDir = path.join(deliverablesDir, 'manual-previews');
  if (!fs.existsSync(previewDir)) fs.mkdirSync(previewDir, { recursive: true });
  
  const pages = await page.$$('.page');
  console.log('4. Generating previews for', pages.length, 'pages...');
  for (let i = 0; i < pages.length; i++) {
    const previewFile = path.join(previewDir, `page-${i + 1}.png`);
    await pages[i].screenshot({ path: previewFile });
    console.log(`Saved page-${i + 1}.png`);
  }
  
  await browser.close();
  console.log('DONE_SUCCESSFULLY');
}

run().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
