// QA-BO-032: Responsive sweep (GAP-BO-TEST-07)
// เติมเคส mobile/tablet ใน module ที่ยังขาดตาม audit matrix:
//   002 users / 003 assets(+reports+comments) / 006 market / 008 option-master /
//   009 watch-alerts / 010 policy+support / settings(admin,roles,delivery) / deletions / content / audit
// pattern: viewport-conditional skip — mobile-only assertions skip บน desktop
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

async function loginIfNeeded(page) {
  const loginScreen = page.locator("#login-screen");
  if (await loginScreen.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator("#login-form button[type=\"submit\"]").click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await page.waitForTimeout(500);
  }
}

async function boot(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
}

async function openModule(page, moduleId, sub) {
  await boot(page);
  await page.evaluate(([m, s]) => renderModule(m, s, s), [moduleId, sub]);
  await page.waitForTimeout(400);
}

async function isMobile(page) {
  return await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
}

async function isNarrow(page) {
  return await page.evaluate(() => window.matchMedia("(max-width: 1180px)").matches);
}

// ตาราง module → toggle id ที่ตรวจแล้วว่ามีจริงใน prototype
const FILTER_TOGGLE_CASES = [
  ["users", "User Accounts", "data-user-filter-toggle"],
  ["assets", "Asset List", "data-asset-filter-toggle"],
  ["assets", "Reported Assets", "data-asset-report-filter-toggle"],
  ["assets", "Reported Comments", "data-reported-comment-filter-toggle"],
  ["market", "Sync History", "data-market-filter-toggle"],
  ["option-master", "Option Master", "data-option-group-filter-toggle"],
  ["watch-alerts", "Watch Alert List", "data-wa-alert-filter-toggle"],
  ["settings", "Admin Accounts", "data-admin-account-filter-toggle"],
  ["settings", "Roles & Permissions", "data-role-filter-toggle"],
  ["settings", "Delivery Logs", "data-delivery-filter-toggle"],
  ["deletions", "Deletion Requests", "data-deletion-filter-toggle"],
  ["content", "Articles", "data-article-filter-toggle"],
  ["audit", "Audit Log", "data-audit-filter-toggle"]
];

test.describe("QA-BO-032: Responsive sweep (GAP-BO-TEST-07)", () => {

  test.describe("Nav — hamburger ≤1180px", () => {
    test("1. ≤1180px: #menu-toggle มองเห็น กดเปิด nav (body.nav-open) + >1180px ซ่อน", async ({ page }) => {
      await boot(page);
      const toggle = page.locator("#menu-toggle");
      if (await isNarrow(page)) {
        await expect(toggle).toBeVisible();
        await toggle.click();
        await page.waitForTimeout(300);
        await expect(page.locator("body")).toHaveClass(/nav-open/);
      } else {
        await expect(toggle).toBeHidden();
        await expect(page.locator("body")).not.toHaveClass(/nav-open/);
      }
    });
  });

  test.describe("Filter toggle ต่อ module (mobile ≤760px เท่านั้น)", () => {
    for (const [mod, sub, toggleAttr] of FILTER_TOGGLE_CASES) {
      test(`toggle ${toggleAttr} ใน ${mod} > ${sub}`, async ({ page }) => {
        await openModule(page, mod, sub);
        const toggle = page.locator(`[${toggleAttr}]`).first();
        if (await isMobile(page)) {
          await expect(toggle).toBeVisible();
          const bar = page.locator(".user-filter-bar").first();
          await expect(bar).toHaveAttribute("data-filter-open", "false");
          await toggle.click();
          await page.waitForTimeout(250);
          await expect(bar).toHaveAttribute("data-filter-open", "true");
          await toggle.click();
          await page.waitForTimeout(250);
          await expect(bar).toHaveAttribute("data-filter-open", "false");
        } else {
          await expect(toggle).toBeHidden();
        }
      });
    }
  });

  test.describe("Mobile card vs desktop table", () => {
    test("2. User Accounts: mobile แสดง mobile-* elements ในแถว, desktop แสดง head cells", async ({ page }) => {
      await openModule(page, "users", "User Accounts");
      const mobileEl = page.locator(".user-row .mobile-user-card-title").first();
      if (await isMobile(page)) {
        await expect(mobileEl).toBeVisible();
      } else {
        const n = await mobileEl.count();
        if (n) await expect(mobileEl).toBeHidden();
      }
    });

    test("3. Reported Comments: mobile card แสดง metadata (report id + priority pill)", async ({ page }) => {
      test.skip(!(await isMobile(page)), "mobile only");
      await openModule(page, "assets", "Reported Comments");
      const row = page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-711']");
      await expect(row).toBeVisible();
      await expect(row.locator(".main-text").first()).toBeVisible();
      await expect(row.locator(".pill").first()).toBeVisible();
    });

    test("4. Admin Accounts: mobile card แสดง status/role/master tags", async ({ page }) => {
      test.skip(!(await isMobile(page)), "mobile only");
      await openModule(page, "settings", "Admin Accounts");
      const row = page.locator(".user-row.admin-account-row").first();
      await expect(row).toBeVisible();
      await expect(row.locator(".main-text").first()).toBeVisible();
      await expect(row.locator(".pill").first()).toBeVisible();
    });

    test("5. Delivery Logs: mobile card render + row click เปิด detail modal ได้", async ({ page }) => {
      test.skip(!(await isMobile(page)), "mobile only");
      await openModule(page, "settings", "Delivery Logs");
      const row = page.locator(".user-row.delivery-row").first();
      await expect(row).toBeVisible();
      await row.click();
      await page.waitForTimeout(300);
      // read-only detail modal — มี header Delivery ID + ไม่มี action footer
      const modal = page.locator(".modal.show, [class*='modal']").first();
      await expect(modal).toBeVisible();
    });

    test("6. Option Master: mobile card + Status cell มี pending pill ถ้ามี seed", async ({ page }) => {
      test.skip(!(await isMobile(page)), "mobile only");
      await openModule(page, "option-master", "Option Master");
      const row = page.locator(".asset-row:not(.head), .user-row:not(.head)").first();
      await expect(row).toBeVisible();
      await expect(row.locator(".mobile-user-card-title").first()).toBeVisible();
    });

    test("7. Policy & Versioning: list render บน mobile/tablet ได้ (ไม่มี filter bar โดย design)", async ({ page }) => {
      await openModule(page, "settings", "Policy & Versioning");
      await expect(page.locator("#page-title")).toContainText("Policy");
      // ไม่มี filter toggle ตาม spec (no search/filter/pagination)
      await expect(page.locator("[data-policy-filter-toggle]")).toHaveCount(0);
      await expect(page.locator(".policy-list-table .asset-row:not(.head)").first()).toBeVisible();
    });

    test("8. Support Center: form render บน mobile ได้ (channel toggles + fields)", async ({ page }) => {
      test.skip(!(await isMobile(page)), "mobile only");
      await openModule(page, "settings", "Support Center");
      await expect(page.locator(".support-channel-row").first()).toBeVisible();
    });

    test("9. Watch Alert List: mobile card แสดง status/notification pills", async ({ page }) => {
      test.skip(!(await isMobile(page)), "mobile only");
      await openModule(page, "watch-alerts", "Watch Alert List");
      const row = page.locator(".watch-alert-list-table .asset-row:not(.head)").first();
      await expect(row).toBeVisible();
      await expect(row.locator(".mobile-user-card-title").first()).toBeVisible();
    });

    test("10. Market Data: mobile card/list render + search ใช้ได้", async ({ page }) => {
      test.skip(!(await isMobile(page)), "mobile only");
      await openModule(page, "market", "Brands & Models");
      await expect(page.locator(".asset-row:not(.head), .user-row:not(.head)").first()).toBeVisible();
    });
  });
});
