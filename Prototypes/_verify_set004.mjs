import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { pathToFileURL } from "url";

const FILE_URL = pathToFileURL("d:/TukDaeng/Prototypes/fo-flow/index.html").href;
const OUT = "d:/TukDaeng/Prototypes/screenshots/task-SET-004";
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

  // Switch to Light mode for primary testing
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

  // Verify Delete account button has data-sub="del_account"
  const delRow = page.locator('.sub-scroll:visible .sub-row[data-sub="del_account"]');
  check("Delete account button has data-sub='del_account'", (await delRow.count()) > 0);

  // Open Delete account sub-screen
  await delRow.first().click();
  await page.waitForTimeout(400);

  // Case 1: Header title is 'Delete account'
  const title1 = await page.locator('.page-sub:not(.pg-ghost) .detail-title').textContent();
  check("Header title in Step 1 is 'Delete account'", title1.trim() === "Delete account", `title='${title1.trim()}'`);

  // Case 2: Verify 30-Day Grace Period hero and cards exist
  const heroTitle = await page.locator('.sub-scroll:visible .del-hero-title').textContent();
  check("Hero title is 'We're sorry to see you go'", heroTitle.includes("We're sorry to see you go"));

  const termTitles = await page.locator('.sub-scroll:visible .del-term-title').allTextContents();
  check("30-Day Grace Period term card exists", termTitles.some(t => t.includes("30-Day Grace Period")));
  check("Permanent Deletion term card exists", termTitles.some(t => t.includes("Permanent Deletion")));
  check("Watch Alerts Cancelled term card exists", termTitles.some(t => t.includes("Watch Alerts Cancelled")));
  check("No mention of offers in term cards", !termTitles.some(t => t.toLowerCase().includes("offer")));

  await page.screenshot({ path: `${OUT}/m-01-delete-account-terms.png` });

  // Test Keep my account button (cancellation)
  const keepBtn = page.locator('.sub-scroll:visible .del-btn-secondary');
  await keepBtn.click();
  await page.waitForTimeout(450);
  const backTitle = await page.locator('.page-sub:not(.pg-ghost) .detail-title').textContent();
  check("Keep my account returns to 'About your account'", backTitle.trim() === "About your account");

  // Re-open Delete account
  await delRow.first().click();
  await page.waitForTimeout(400);

  // Click Continue to delete to enter Step 2 (Reason Selection)
  await page.locator('.sub-scroll:visible [data-act="del-go-reasons"]').click();
  await page.waitForTimeout(400);

  // Case 3: Step 2 Header & reasons list
  const title2 = await page.locator('.page-sub:not(.pg-ghost) .detail-title').textContent();
  check("Header title in Step 2 is 'Why are you leaving?'", title2.trim() === "Why are you leaving?", `title='${title2.trim()}'`);

  const reasonsCount = await page.locator('.sub-scroll:visible .del-reason-row').count();
  check("Reasons list contains 6 options", reasonsCount === 6, `count=${reasonsCount}`);

  // Test validation when no reason is selected
  await page.locator('.sub-scroll:visible [data-act="del-submit-reason"]').click();
  await page.waitForTimeout(200);
  const errDisp = await page.locator('.sub-scroll:visible #del-reason-err').evaluate(el => window.getComputedStyle(el).display);
  check("Submitting without selecting reason displays error message", errDisp === "block");
  await page.screenshot({ path: `${OUT}/m-02-delete-account-reason-err.png` });

  // Select a reason (e.g. second_account)
  const reason2 = page.locator('.sub-scroll:visible .del-reason-row[data-reason-val="second_account"]');
  await reason2.click();
  await page.waitForTimeout(200);
  check("Reason row has 'is-selected' class", (await reason2.getAttribute("class")).includes("is-selected"));

  // Fill additional feedback
  const fbInp = page.locator('.sub-scroll:visible #del-feedback-text');
  await fbInp.fill("Great app, but I am consolidating accounts.");
  await page.screenshot({ path: `${OUT}/m-03-delete-account-reason-selected.png` });

  // Test Back button in Step 2 returns to Step 1
  await page.locator('.sub-scroll:visible [data-act="del-go-terms"]').click();
  await page.waitForTimeout(400);
  const titleStep1Again = await page.locator('.page-sub:not(.pg-ghost) .detail-title').textContent();
  check("Back button in Step 2 returns to Step 1 terms", titleStep1Again.trim() === "Delete account");

  // Go to Step 2 again
  await page.locator('.sub-scroll:visible [data-act="del-go-reasons"]').click();
  await page.waitForTimeout(300);

  // Submit reason to open password confirmation dialog
  await page.locator('.sub-scroll:visible [data-act="del-submit-reason"]').click();
  await page.waitForTimeout(300);

  // Case 4: Security Password Confirmation Dialog
  const dlgQ = await page.locator('.dlg-q:visible').textContent();
  check("Dialog opens with 'Confirm account deletion'", dlgQ.includes("Confirm account deletion"));

  const pwdInp = page.locator('.dlg #del-acc-pwd');
  check("Password input exists in dialog", (await pwdInp.count()) === 1);

  // Test eye toggle in dialog
  const eyeBtn = page.locator('.dlg [data-pwd-toggle="del-acc-pwd"]');
  await pwdInp.fill("TestPwd123");
  await eyeBtn.click();
  await page.waitForTimeout(150);
  check("Eye toggle switches password type to text", (await pwdInp.getAttribute("type")) === "text");
  await eyeBtn.click();
  await page.waitForTimeout(150);
  check("Eye toggle switches password type back to password", (await pwdInp.getAttribute("type")) === "password");

  // Test incorrect password
  await pwdInp.fill("wrongpass999");
  await page.locator('.dlg-del-pwd-submit').click();
  await page.waitForTimeout(200);
  const pwdErr = await page.locator('.dlg #del-acc-pwd-err').textContent();
  check("Incorrect password shows error message", pwdErr.includes("Incorrect password"));
  await page.screenshot({ path: `${OUT}/m-04-delete-account-pwd-err.png` });

  // Test correct password ("fox1234")
  await pwdInp.fill("fox1234");
  await page.locator('.dlg-del-pwd-submit').click();
  await page.waitForTimeout(400);

  // Case 5: Success & Scheduled Deletion Dialog
  const successQ = await page.locator('.dlg-q:visible').textContent();
  check("Success dialog shows 'Account deletion scheduled'", successQ.includes("Account deletion scheduled"));

  const successDesc = await page.locator('.dlg-desc:visible').textContent();
  check("Success dialog mentions scheduled date and 30 days", successDesc.includes("30 days") && successDesc.includes("scheduled for permanent deletion"));
  await page.screenshot({ path: `${OUT}/m-05-delete-account-scheduled-dialog.png` });

  // Click Log out button
  await page.locator('.dlg-delaccount-done').click();
  await page.waitForTimeout(400);

  // Verify toast appears and user is returned safely
  const toastText = await page.locator('.screen .sc-toast').first().textContent();
  check("Toast shows 'Account deactivated. 30-day grace period started.'", toastText.includes("30-day grace period started"));
  await page.screenshot({ path: `${OUT}/m-06-delete-account-success-toast.png` });

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
  await page.locator('.sub-scroll:visible .sub-row[data-sub="del_account"]').first().click();
  await page.waitForTimeout(400);

  await page.screenshot({ path: `${OUT}/t-01-delete-account-terms.png` });
  check("Tablet Step 1 rendering completed", true);

  await page.locator('.sub-scroll:visible [data-act="del-go-reasons"]').click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/t-02-delete-account-reasons.png` });
  check("Tablet Step 2 rendering completed", true);

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
  await page.locator('.sub-scroll:visible .sub-row[data-sub="del_account"]').first().click();
  await page.waitForTimeout(400);

  await page.screenshot({ path: `${OUT}/d-01-delete-account-terms.png` });
  check("Desktop Step 1 rendering completed", true);

  await page.locator('.sub-scroll:visible [data-act="del-go-reasons"]').click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/d-02-delete-account-reasons.png` });
  check("Desktop Step 2 rendering completed", true);

  await ctx.close();
}

await browser.close();

console.log("\n==================================");
console.log(`TOTAL FAILED: ${failed}`);
console.log("==================================");
process.exit(failed > 0 ? 1 : 0);
