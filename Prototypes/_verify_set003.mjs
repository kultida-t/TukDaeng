import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { pathToFileURL } from "url";

const FILE_URL = pathToFileURL("d:/TukDaeng/Prototypes/fo-flow/index.html").href;
const OUT = "d:/TukDaeng/Prototypes/screenshots/task-SET-003";
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

  // Navigate to Profile tab -> Hamburger menu -> About your account
  await page.locator('.bottom-nav .nav-item[data-navgo="profile"]').first().click();
  await page.waitForTimeout(400);

  await page.locator('.pf-menu').first().click();
  await page.waitForTimeout(400);

  await page.locator('.sub-row[data-sub="about_account"]').first().click();
  await page.waitForTimeout(400);

  // Verify Change password row has data-sub="change_pwd"
  const chgRow = page.locator('.sub-scroll:visible .sub-row[data-sub="change_pwd"]');
  check("Change password button has data-sub='change_pwd'", (await chgRow.count()) > 0);

  // Open Change password sub-screen
  await chgRow.first().click();
  await page.waitForTimeout(400);

  // Verify Change password page title
  const title = await page.locator('.sub-scroll:visible').locator('..').locator('.detail-title').textContent();
  check("Header title is 'Change password'", title.trim() === "Change password", `title='${title.trim()}'`);

  // Verify Security note
  const desc = await page.locator('.sub-scroll:visible .chg-pwd-desc').textContent();
  check("Security note explains 6+ chars & special chars", desc.includes("at least 6 characters"), desc);

  // Verify 3 password inputs exist
  const curInp = page.locator('.sub-scroll:visible #cpwd-current');
  const newInp = page.locator('.sub-scroll:visible #cpwd-new');
  const confInp = page.locator('.sub-scroll:visible #cpwd-confirm');
  check("Current password input exists", (await curInp.count()) === 1);
  check("New password input exists", (await newInp.count()) === 1);
  check("Re-type new password input exists", (await confInp.count()) === 1);

  // Verify initial type is password
  check("Inputs are type='password' initially",
    (await curInp.getAttribute("type")) === "password" &&
    (await newInp.getAttribute("type")) === "password" &&
    (await confInp.getAttribute("type")) === "password"
  );

  // Screenshot empty form
  await page.screenshot({ path: `${OUT}/m-01-change-password-empty.png` });

  // Test eye toggle for Current password
  const curEye = page.locator('.sub-scroll:visible [data-pwd-toggle="cpwd-current"]');
  await curInp.fill("TestSecret123");
  await curEye.click();
  await page.waitForTimeout(200);
  check("Eye toggle switches type to 'text'", (await curInp.getAttribute("type")) === "text");

  await curEye.click();
  await page.waitForTimeout(200);
  check("Eye toggle switches back to 'password'", (await curInp.getAttribute("type")) === "password");

  await page.screenshot({ path: `${OUT}/m-02-change-password-eye-toggle.png` });

  // Test Forgot your password confirmation dialog
  await page.locator('.sub-scroll:visible [data-act="forgot-pwd"]').click();
  await page.waitForTimeout(300);

  const dlgQ = await page.locator('.dlg-q:visible').textContent();
  check("Forgot password opens confirmation dialog", dlgQ.includes("Reset password?"), dlgQ);

  const dlgDesc = await page.locator('.dlg-desc:visible').textContent();
  check("Dialog mentions sending reset link to email", dlgDesc.includes("k***@tukdaeng.com"), dlgDesc);
  await page.screenshot({ path: `${OUT}/m-03-change-password-forgot-dialog.png` });

  // Click Send reset link
  await page.locator('.dlg-forgotpwd-go').click();
  await page.waitForTimeout(300);

  const forgotToast = await page.locator('.screen .sc-toast').first().textContent();
  check("Send reset link triggers confirmation toast", forgotToast.includes("Password reset link sent to k***@tukdaeng.com"), forgotToast);
  await page.screenshot({ path: `${OUT}/m-03-change-password-forgot-toast.png` });

  await page.waitForTimeout(2200); // Wait for toast to fade

  // Test Validation 1: Empty form submit
  await curInp.fill("");
  await page.locator('.sub-scroll:visible [data-act="submit-chg-pwd"]').click();
  await page.waitForTimeout(200);
  let errText = await page.locator('.sub-scroll:visible #cpwd-err').textContent();
  check("Empty submit shows 'Please enter your current password.'", errText.includes("Please enter your current password"));

  // Test Validation 2: Incorrect current password
  await curInp.fill("wrongpass123");
  await newInp.fill("NewPassword123!");
  await confInp.fill("NewPassword123!");
  await page.locator('.sub-scroll:visible [data-act="submit-chg-pwd"]').click();
  await page.waitForTimeout(200);
  errText = await page.locator('.sub-scroll:visible #cpwd-err').textContent();
  check("Incorrect current password shows 'entered incorrectly'", errText.includes("entered incorrectly"));
  await page.screenshot({ path: `${OUT}/m-04-change-password-incorrect-cur-pwd.png` });

  // Test Validation 3: Missing new password
  await curInp.fill("fox1234");
  await newInp.fill("");
  await confInp.fill("");
  await page.locator('.sub-scroll:visible [data-act="submit-chg-pwd"]').click();
  await page.waitForTimeout(200);
  errText = await page.locator('.sub-scroll:visible #cpwd-err').textContent();
  check("Missing new password shows 'Please enter a new password.'", errText.includes("Please enter a new password"));

  // Test Validation 4: Password shorter than 6 characters
  await newInp.fill("123");
  await page.locator('.sub-scroll:visible [data-act="submit-chg-pwd"]').click();
  await page.waitForTimeout(200);
  errText = await page.locator('.sub-scroll:visible #cpwd-err').textContent();
  check("Short password shows 'at least 6 characters long'", errText.includes("at least 6 characters long"));

  // Test Validation 5: Same as current password
  await newInp.fill("fox1234");
  await confInp.fill("fox1234");
  await page.locator('.sub-scroll:visible [data-act="submit-chg-pwd"]').click();
  await page.waitForTimeout(200);
  errText = await page.locator('.sub-scroll:visible #cpwd-err').textContent();
  check("Same as current shows 'must be different from your current password'", errText.includes("must be different from your current password"));

  // Test Validation 6: Passwords do not match
  await newInp.fill("BrandNewPassword123!");
  await confInp.fill("MismatchPassword999!");
  await page.locator('.sub-scroll:visible [data-act="submit-chg-pwd"]').click();
  await page.waitForTimeout(200);
  errText = await page.locator('.sub-scroll:visible #cpwd-err').textContent();
  check("Mismatch shows 'Passwords do not match'", errText.includes("Passwords do not match"));
  await page.screenshot({ path: `${OUT}/m-04-change-password-error.png` });

  // Test Happy Path: Correct inputs (Current password = "fox1234")
  await confInp.fill("BrandNewPassword123!");
  await page.locator('.sub-scroll:visible [data-act="submit-chg-pwd"]').click();
  await page.waitForTimeout(400);

  const successToast = await page.locator('.screen .sc-toast').first().textContent();
  check("Success toast appears: 'Password changed successfully'", successToast.includes("Password changed successfully"), successToast);

  // Check that page automatically navigated back to About your account
  const backTitle = await page.locator('.sub-scroll:visible').locator('..').locator('.detail-title').textContent();
  check("Automatically pops back to 'About your account'", backTitle.trim() === "About your account", backTitle);
  await page.screenshot({ path: `${OUT}/m-05-change-password-success.png` });

  await ctx.close();
}

// 2. Tablet verification (768x1024)
{
  const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  await page.locator('.bottom-nav .nav-item[data-navgo="profile"]').first().click();
  await page.waitForTimeout(300);
  await page.locator('.pf-menu').first().click();
  await page.waitForTimeout(300);
  await page.locator('.sub-row[data-sub="about_account"]').first().click();
  await page.waitForTimeout(300);
  await page.locator('.sub-scroll:visible .sub-row[data-sub="change_pwd"]').first().click();
  await page.waitForTimeout(400);

  await page.screenshot({ path: `${OUT}/t-01-change-password.png` });
  check("Tablet rendering completed", true);
  await ctx.close();
}

// 3. Desktop verification (1920x1080)
{
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  await page.locator('.bottom-nav .nav-item[data-navgo="profile"]').first().click();
  await page.waitForTimeout(300);
  await page.locator('.pf-menu').first().click();
  await page.waitForTimeout(300);
  await page.locator('.sub-row[data-sub="about_account"]').first().click();
  await page.waitForTimeout(300);
  await page.locator('.sub-scroll:visible .sub-row[data-sub="change_pwd"]').first().click();
  await page.waitForTimeout(400);

  await page.screenshot({ path: `${OUT}/d-01-change-password.png` });
  check("Desktop rendering completed", true);
  await ctx.close();
}

await browser.close();

console.log("\n==================================");
console.log(`TOTAL FAILED: ${failed}`);
console.log("==================================");
process.exit(failed > 0 ? 1 : 0);
