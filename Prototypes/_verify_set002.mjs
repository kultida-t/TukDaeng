import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { pathToFileURL } from "url";

const FILE_URL = pathToFileURL("d:/TukDaeng/Prototypes/fo-flow/index.html").href;
const OUT = "d:/TukDaeng/Prototypes/screenshots/task-SET-002";
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

  // Switch to Light mode to match reference screenshot
  await page.evaluate(() => {
    document.querySelectorAll(".screen").forEach(s => s.setAttribute("data-theme", "light"));
  });
  await page.waitForTimeout(300);

  // Navigate to Profile tab
  await page.locator('.bottom-nav .nav-item[data-navgo="profile"]').first().click();
  await page.waitForTimeout(400);

  // Open Settings via .pf-menu (hamburger)
  await page.locator('.pf-menu').first().click();
  await page.waitForTimeout(400);

  // Open "About your account"
  await page.locator('.sub-row[data-sub="about_account"]').first().click();
  await page.waitForTimeout(400);

  // Verify Header
  const title = await page.locator('.sub-scroll:visible').locator('..').locator('.detail-title').textContent();
  check("Header title is 'About your account'", title.trim() === "About your account", `title='${title.trim()}'`);

  // Verify Profile Hero
  const heroName = await page.locator('.about-acc-name').textContent();
  check("Display name is 'Mr.FOX'", heroName.trim() === "Mr.FOX", heroName);

  const heroUname = await page.locator('.about-acc-uname').textContent();
  check("Handle is '@king.mr.fox'", heroUname.trim() === "@king.mr.fox", heroUname);

  const avatarBorder = await page.locator('.about-acc-hero img').evaluate(el => window.getComputedStyle(el).borderStyle);
  check("Avatar has no outer border (border-style is 'none')", avatarBorder === "none", avatarBorder);

  // Verify Account information items
  const subRows = await page.locator('.sub-scroll:visible .sub-row-static').allTextContents();
  check("2 rows in Account information", subRows.length === 2, `count=${subRows.length}`);
  check("Row 1 contains Date joined & October 2024", subRows[0].includes("Date joined") && subRows[0].includes("October 2024"), subRows[0]);
  check("Row 2 contains Account based in & Thailand", subRows[1].includes("Account based in") && subRows[1].includes("Thailand"), subRows[1]);

  // Verify Former usernames is REMOVED
  const allSubText = await page.locator('.sub-scroll:visible').textContent();
  check("Former usernames is completely removed", !allSubText.includes("Former usernames"), "Cleaned up");

  // Verify Dividers
  const dividerCount = await page.locator('.sub-scroll:visible .about-acc-divider').count();
  check("2 horizontal dividers separating sections", dividerCount === 2, `count=${dividerCount}`);

  // Verify Security Section
  const changePwdText = await page.locator('.sub-scroll:visible [data-act="change-pwd"]').textContent();
  check("Security has Change password row", changePwdText.includes("Change password"), changePwdText);

  // Verify Account management Section
  const delAccText = await page.locator('.sub-scroll:visible [data-dlg="del-account"]').textContent();
  check("Account management has Delete account row", delAccText.includes("Delete account"), delAccText);

  // Screenshot Mobile Light Mode (Matches reference screenshot)
  await page.screenshot({ path: `${OUT}/m-01-about-account-light.png` });

  // Test Change password toast
  await page.locator('.sub-scroll:visible [data-act="change-pwd"]').click();
  await page.waitForTimeout(300);
  const toastText = await page.locator('.screen .sc-toast').first().textContent();
  check("Change password triggers reset toast", toastText.includes("Password reset link sent"), toastText);
  await page.screenshot({ path: `${OUT}/m-02-about-account-toast.png` });

  // Test Delete account dialog
  await page.locator('.sub-scroll:visible [data-dlg="del-account"]').click();
  await page.waitForTimeout(300);
  const dlgTitle = await page.locator('.dlg-q').textContent();
  check("Delete account opens confirmation dialog", dlgTitle.includes("Delete account?"), dlgTitle);
  const dlgDesc = await page.locator('.dlg-desc').textContent();
  check("Dialog mentions 30-day grace period", dlgDesc.includes("30-day grace period"), dlgDesc);
  await page.screenshot({ path: `${OUT}/m-03-about-account-delete-dialog.png` });

  // Cancel dialog
  await page.locator('.dlg-cancel').click();
  await page.waitForTimeout(2200);

  // Switch to Dark mode and screenshot
  await page.evaluate(() => {
    document.querySelectorAll(".screen").forEach(s => s.setAttribute("data-theme", "dark"));
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/m-04-about-account-dark.png` });

  await ctx.close();
}

// 2. Tablet verification (768x1024)
{
  const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  await page.evaluate(() => {
    document.querySelectorAll(".screen").forEach(s => s.setAttribute("data-theme", "light"));
  });

  await page.locator('.bottom-nav .nav-item[data-navgo="profile"]').first().click();
  await page.waitForTimeout(300);
  await page.locator('.pf-menu').first().click();
  await page.waitForTimeout(300);
  await page.locator('.sub-row[data-sub="about_account"]').first().click();
  await page.waitForTimeout(300);

  await page.screenshot({ path: `${OUT}/t-01-about-account-tablet.png` });
  await ctx.close();
}

// 3. Desktop verification (1920x1080)
{
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  await page.evaluate(() => {
    document.querySelectorAll(".screen").forEach(s => s.setAttribute("data-theme", "light"));
  });

  await page.locator('.bottom-nav .nav-item[data-navgo="profile"]').first().click();
  await page.waitForTimeout(300);
  await page.locator('.pf-menu').first().click();
  await page.waitForTimeout(300);
  await page.locator('.sub-row[data-sub="about_account"]').first().click();
  await page.waitForTimeout(300);

  await page.screenshot({ path: `${OUT}/d-01-about-account-desktop.png` });
  await ctx.close();
}

await browser.close();
console.log(`\nVerification finished. Total failures: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
