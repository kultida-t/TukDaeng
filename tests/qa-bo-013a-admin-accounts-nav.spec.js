// QA-BO-013a: Settings > Admin Accounts — Navigation & Menu (strict Playwright spec)
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล, spec docs (16_ADMIN_SETTINGS_MODULE.md) เป็นหลักสำหรับพฤติกรรม/นำทาง
// เป้าหมาย: รันเทสครอบ navigation & menu ของ Settings > Admin Accounts (ห้ามแก้ prototype)
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

// helper: login เข้าระบบ (ค่า default อยู่ใน form แล้ว)
async function loginIfNeeded(page) {
  const loginScreen = page.locator("#login-screen");
  if (await loginScreen.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator("#login-form button[type=\"submit\"]").click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await page.waitForTimeout(500);
  }
}

// helper: เปิด nav ถ้าจอแคบ (≤1180px sidebar ถูกซ่อนด้วย transform)
async function ensureNavOpen(page) {
  const needsToggle = await page.evaluate(() =>
    window.matchMedia("(max-width: 1180px)").matches && !document.body.classList.contains("nav-open"));
  if (needsToggle) {
    await page.locator("#menu-toggle").click();
    await page.waitForTimeout(300);
  }
}

// helper: ไปหน้า Admin Accounts List ผ่านเมนู Settings > Admin Accounts
async function goToAdminAccounts(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  // คลิก nav-item Settings เพื่อขยาย submenu
  await page.locator(".nav-item[data-module='settings']").click();
  await page.waitForTimeout(300);
  // คลิก submenu button Admin Accounts
  await ensureNavOpen(page);
  await page.locator(".submenu[data-submenu='settings'] button[data-module='settings'][data-sub='Admin Accounts']").click();
  await page.waitForTimeout(300);
}

// ==================== A. NAVIGATION & MENU ====================

test.describe("QA-BO-013a: Settings > Admin Accounts — navigation & menu", () => {

  test("1. เมนู Settings แสดงและคลิกขยายได้", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await ensureNavOpen(page);
    const navItem = page.locator(".nav-item[data-module='settings']");
    await expect(navItem).toBeVisible();
    await navItem.click();
    await page.waitForTimeout(300);
    // หลังคลิก submenu ควรแสดง
    const submenu = page.locator(".submenu[data-submenu='settings']");
    await expect(submenu).toBeVisible();
  });

  test("2. submenu Settings มีอย่างน้อย 6 รายการ และมี 'Admin Accounts'", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await ensureNavOpen(page);
    await page.locator(".nav-item[data-module='settings']").click();
    await page.waitForTimeout(300);
    const subItems = page.locator(".submenu[data-submenu='settings'] button");
    const count = await subItems.count();
    expect(count).toBeGreaterThanOrEqual(6);
    // ตรวจว่ามี Admin Accounts
    const aaButton = page.locator(".submenu[data-submenu='settings'] button[data-sub='Admin Accounts']");
    await expect(aaButton).toBeVisible();
  });

  test("3. คลิก Settings > Admin Accounts → เข้าหน้า list (body class admin-account-list-mode)", async ({ page }) => {
    await goToAdminAccounts(page);
    await expect(page.locator("body")).toHaveClass(/admin-account-list-mode/);
  });

  test("4. breadcrumb = 'เครื่องมือ & รายงาน / Settings / Admin Accounts'", async ({ page }) => {
    await goToAdminAccounts(page);
    await expect(page.locator("#crumb")).toHaveText("เครื่องมือ & รายงาน / Settings / Admin Accounts");
  });

  test("5. #page-title = 'Admin Accounts', #panel-title = 'Admin Account List', #panel-subtitle = ''", async ({ page }) => {
    await goToAdminAccounts(page);
    await expect(page.locator("#page-title")).toHaveText("Admin Accounts");
    await expect(page.locator("#panel-title")).toHaveText("Admin Account List");
    await expect(page.locator("#panel-subtitle")).toHaveText("");
  });

  test("6. #primary-action = '' (ปุ่มเชิญอยู่ที่ #page-actions ไม่ใช่ panel head)", async ({ page }) => {
    await goToAdminAccounts(page);
    await expect(page.locator("#primary-action")).toHaveText("");
  });

  test("7. nav item settings มี active/expanded state เมื่ออยู่ใน Admin Accounts", async ({ page }) => {
    await goToAdminAccounts(page);
    const isActive = await page.evaluate(() => {
      const el = document.querySelector(".nav-item[data-module='settings']");
      return el ? el.classList.contains("active") || el.classList.contains("expanded") || el.querySelector(".active") !== null : false;
    });
    expect(isActive).toBeTruthy();
  });

  test("8. ไม่มี KPI cards (#summary-grid, #cards ว่าง)", async ({ page }) => {
    await goToAdminAccounts(page);
    await expect(page.locator("#summary-grid")).toHaveText("");
    await expect(page.locator("#cards")).toHaveText("");
  });

  test("9. ปุ่ม 'Add admin' อยู่ใน #page-actions (data-admin-account-invite-open)", async ({ page }) => {
    await goToAdminAccounts(page);
    const inviteBtn = page.locator("#page-actions [data-admin-account-invite-open]");
    await expect(inviteBtn).toBeVisible();
    await expect(inviteBtn).toContainText("Add admin");
  });

  test("10. ไม่มี Dashboard card ที่ link ตรงไป settings/Admin Accounts (เข้าผ่าน nav submenu เท่านั้น)", async ({ page }) => {
    // เข้า Dashboard แล้วตรวจว่าไม่มี stat/queue ที่ data-jump="settings" data-sub-jump="Admin Accounts"
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    // ตรวจ summary-grid stats
    const adminAccountJump = await page.locator("#summary-grid .stat[data-jump='settings'][data-sub-jump='Admin Accounts']").count();
    expect(adminAccountJump).toBe(0);
    // ตรวจ work queue rows
    const queueJump = await page.locator(".dashboard-work-list .work-row[data-module-jump='settings'][data-sub-jump='Admin Accounts']").count();
    expect(queueJump).toBe(0);
  });
});
