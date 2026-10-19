import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { pathToFileURL } from "url";

const FILE_URL = pathToFileURL("d:/TukDaeng/Prototypes/fo-flow/index.html").href;
const OUT = "d:/TukDaeng/Prototypes/screenshots/task-SET-005";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

let failed = 0;
const check = (desc, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}: ${desc}${extra ? " — " + extra : ""}`);
  if (!ok) failed++;
};

// 1. Mobile verification (440x956)
{
  const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // Switch to Light mode
  await page.evaluate(() => {
    document.querySelectorAll(".screen").forEach(s => s.setAttribute("data-theme", "light"));
  });
  await page.waitForTimeout(300);

  // Navigate to Profile -> Settings
  await page.locator('.bottom-nav .nav-item[data-navgo="profile"]').first().click();
  await page.waitForTimeout(400);

  await page.locator('.pf-menu').first().click();
  await page.waitForTimeout(400);

  // Open Language menu
  await page.locator('.sub-row[data-sub="lang"]').first().click();
  await page.waitForTimeout(400);

  // Check 1: Title is "Language" (initially English)
  const langTitleEn = await page.locator('.page-sub:not(.pg-ghost) .detail-title').textContent();
  check("Initial title is 'Language'", langTitleEn.trim() === "Language", `got '${langTitleEn.trim()}'`);

  // Check 2: Flag icons exist for both options
  const enFlagCount = await page.locator('.sub-row[data-lang-opt="en"] .sub-ic svg').count();
  check("English row has flag icon in .sub-ic", enFlagCount > 0);

  const thFlagCount = await page.locator('.sub-row[data-lang-opt="th"] .sub-ic svg').count();
  check("Thai row has flag icon in .sub-ic", thFlagCount > 0);

  // Capture Mobile Light mode Language screen
  await page.screenshot({ path: `${OUT}/m_01_language_light_en.png` });

  // Check 3: Switch to Dark mode and capture
  await page.evaluate(() => {
    document.querySelectorAll(".screen").forEach(s => s.setAttribute("data-theme", "dark"));
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/m_02_language_dark_en.png` });

  // Check 4: Click Thai language option
  await page.locator('.sub-row[data-lang-opt="th"]').first().click();
  await page.waitForTimeout(400);

  // Verify toast
  const toastText = await page.locator('.sc-toast').first().textContent();
  check("Toast informs 'เปลี่ยนภาษาเรียบร้อย'", toastText.includes("เปลี่ยนภาษาเรียบร้อย"), `toast='${toastText}'`);

  // Check 5: Title updated to "ภาษา" and desc to Thai
  const langTitleTh = await page.locator('.page-sub:not(.pg-ghost) .detail-title').textContent();
  check("Title updated to 'ภาษา'", langTitleTh.trim() === "ภาษา", `got '${langTitleTh.trim()}'`);

  const descTh = await page.locator('.page-sub:not(.pg-ghost) .fav-desc').textContent();
  check("Desc updated to Thai", descTh.includes("เลือกภาษาที่ต้องการใช้งาน"), `desc='${descTh}'`);

  await page.screenshot({ path: `${OUT}/m_03_language_dark_th.png` });

  // Check 6: Go back to Settings and verify Thai labels
  await page.locator('.page-sub:not(.pg-ghost) .sub-back').first().click();
  await page.waitForTimeout(400);

  const settingsTitleTh = await page.locator('.page-sub:not(.pg-ghost) .detail-title').textContent();
  check("Settings title in Thai is 'การตั้งค่าและกิจกรรม'", settingsTitleTh.trim() === "การตั้งค่าและกิจกรรม", `got '${settingsTitleTh.trim()}'`);

  const langCountLabel = await page.locator('.sub-row[data-sub="lang"] .sub-count').textContent();
  check("Language menu badge says 'ภาษาไทย'", langCountLabel.trim() === "ภาษาไทย", `got '${langCountLabel.trim()}'`);

  // Switch back to Light mode for settings screenshot
  await page.evaluate(() => {
    document.querySelectorAll(".screen").forEach(s => s.setAttribute("data-theme", "light"));
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/m_04_settings_light_th.png` });

  // Check 7: Open Theme mode and check Thai translations
  await page.locator('.sub-row[data-sub="theme"]').first().click();
  await page.waitForTimeout(400);

  const themeTitleTh = await page.locator('.page-sub:not(.pg-ghost) .detail-title').textContent();
  check("Theme mode title in Thai is 'โหมดธีม'", themeTitleTh.trim() === "โหมดธีม", `got '${themeTitleTh.trim()}'`);
  await page.screenshot({ path: `${OUT}/m_05_theme_mode_th.png` });

  // Back to Settings
  await page.locator('.page-sub:not(.pg-ghost) .sub-back').first().click();
  await page.waitForTimeout(400);

  // Check 8: Open About your account in Thai
  await page.locator('.sub-row[data-sub="about_account"]').first().click();
  await page.waitForTimeout(400);

  const aboutTitleTh = await page.locator('.page-sub:not(.pg-ghost) .detail-title').textContent();
  check("About account title in Thai is 'เกี่ยวกับบัญชีของคุณ'", aboutTitleTh.trim() === "เกี่ยวกับบัญชีของคุณ", `got '${aboutTitleTh.trim()}'`);
  await page.screenshot({ path: `${OUT}/m_06_about_account_th.png` });

  // Back to Settings
  await page.locator('.page-sub:not(.pg-ghost) .sub-back').first().click();
  await page.waitForTimeout(400);

  // Check 9: Open Log out dialog in Thai
  await page.locator('.sub-row-logout').first().click();
  await page.waitForTimeout(400);

  const logoutDlgQ = await page.locator('.dlg-q').textContent();
  check("Log out dialog question in Thai contains 'ออกจากระบบ'", logoutDlgQ.includes("ออกจากระบบ"), `got '${logoutDlgQ}'`);
  await page.screenshot({ path: `${OUT}/m_07_logout_dialog_th.png` });

  // Cancel logout dialog
  await page.locator('.dlg-cancel').first().click();
  await page.waitForTimeout(300);

  // Check 10: Persistence across reload
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  const persistedLang = await page.evaluate(() => localStorage.getItem("fo_lang"));
  check("LocalStorage fo_lang persisted as 'th'", persistedLang === "th", `got '${persistedLang}'`);

  await ctx.close();
}

// 2. Tablet verification (768x1024)
{
  const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // Navigate to Profile -> Settings -> Language
  await page.locator('.bottom-nav .nav-item[data-navgo="profile"]').first().click();
  await page.waitForTimeout(400);
  await page.locator('.pf-menu').first().click();
  await page.waitForTimeout(400);
  await page.locator('.sub-row[data-sub="lang"]').first().click();
  await page.waitForTimeout(400);

  await page.screenshot({ path: `${OUT}/t_01_language_tablet.png` });
  await ctx.close();
}

// 3. Desktop verification (1920x1080)
{
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // Navigate to Profile -> Settings -> Language
  await page.locator('.bottom-nav .nav-item[data-navgo="profile"]').first().click();
  await page.waitForTimeout(400);
  await page.locator('.pf-menu').first().click();
  await page.waitForTimeout(400);
  await page.locator('.sub-row[data-sub="lang"]').first().click();
  await page.waitForTimeout(400);

  await page.screenshot({ path: `${OUT}/d_01_language_desktop.png` });

  // Switch back to English for cleanliness
  await page.locator('.sub-row[data-lang-opt="en"]').first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/d_02_language_en_desktop.png` });

  await ctx.close();
}

await browser.close();

console.log("\n==============================");
console.log(`TOTAL FAILED: ${failed}`);
console.log("==============================");
if (failed > 0) process.exit(1);
