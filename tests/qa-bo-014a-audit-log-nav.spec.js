// QA-BO-014a: Settings > Audit Log — Navigation & Menu (strict Playwright spec)
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล, spec docs (08_AUDIT_LOG_MODULE.md) เป็นหลักสำหรับพฤติกรรม/นำทาง
// เป้าหมาย: รันเทสครอบ navigation & menu ของ Settings > Audit Log (ห้ามแก้ prototype)
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

// helper: ไปหน้า Audit Log ผ่านเมนู Settings > Audit Log
// (submenu button มี data-module="audit" data-parent="settings" — renderModule("audit"))
async function goToAuditLog(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  // คลิก nav-item Settings เพื่อขยาย submenu
  await page.locator(".nav-item[data-module='settings']").click();
  await page.waitForTimeout(300);
  // คลิก submenu button Audit Log
  await ensureNavOpen(page);
  await page.locator(".submenu[data-submenu='settings'] button[data-module='audit'][data-sub='Audit Log']").click();
  await page.waitForTimeout(300);
}

// ==================== A. NAVIGATION & MENU ====================

test.describe("QA-BO-014a: Settings > Audit Log — navigation & menu", () => {

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

  test("2. submenu Settings มีอย่างน้อย 6 รายการ และมี 'Audit Log' (data-module='audit')", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await ensureNavOpen(page);
    await page.locator(".nav-item[data-module='settings']").click();
    await page.waitForTimeout(300);
    const subItems = page.locator(".submenu[data-submenu='settings'] button");
    const count = await subItems.count();
    expect(count).toBeGreaterThanOrEqual(6);
    // ตรวจว่ามี Audit Log — sub นี้ route ไป module "audit" ไม่ใช่ "settings"
    const auditButton = page.locator(".submenu[data-submenu='settings'] button[data-module='audit'][data-sub='Audit Log']");
    await expect(auditButton).toBeVisible();
  });

  test("3. คลิก Settings > Audit Log → เข้าหน้า list (body class audit-log-mode)", async ({ page }) => {
    await goToAuditLog(page);
    await expect(page.locator("body")).toHaveClass(/audit-log-mode/);
  });

  test("4. breadcrumb = 'เครื่องมือ & รายงาน / Settings / Audit Log'", async ({ page }) => {
    await goToAuditLog(page);
    await expect(page.locator("#crumb")).toHaveText("เครื่องมือ & รายงาน / Settings / Audit Log");
  });

  test("5. #page-title = 'Audit Log', #panel-title = 'Audit Log List', #panel-subtitle = ''", async ({ page }) => {
    await goToAuditLog(page);
    await expect(page.locator("#page-title")).toHaveText("Audit Log");
    await expect(page.locator("#panel-title")).toHaveText("Audit Log List");
    await expect(page.locator("#panel-subtitle")).toHaveText("");
  });

  test("6. #primary-action = '' (read-only module — ไม่มี action ระดับหน้า)", async ({ page }) => {
    await goToAuditLog(page);
    await expect(page.locator("#primary-action")).toHaveText("");
  });

  test("7. nav Settings active + submenu 'Audit Log' active เมื่ออยู่ใน Audit Log", async ({ page }) => {
    await goToAuditLog(page);
    // parent nav-item settings active (navParentByModule["audit"] = "settings")
    await expect(page.locator(".nav-item[data-module='settings']")).toHaveClass(/active/);
    // submenu button Audit Log active (module=audit + sub=Audit Log ตรง activeModule/activeSub)
    await expect(page.locator(".submenu[data-submenu='settings'] button[data-sub='Audit Log']")).toHaveClass(/active/);
  });

  test("8. ไม่มี KPI cards (#summary-grid, #cards ว่าง) — full-width list pattern", async ({ page }) => {
    await goToAuditLog(page);
    await expect(page.locator("#summary-grid")).toHaveText("");
    await expect(page.locator("#cards")).toHaveText("");
  });

  test("9. #user-panel-filter-actions มีปุ่ม toggle ตัวกรอง + รีเซ็ตค่าทั้งหมด", async ({ page }) => {
    await goToAuditLog(page);
    const actions = page.locator("#user-panel-filter-actions");
    await expect(actions.locator("[data-audit-filter-toggle]")).toHaveCount(1);
    await expect(actions.locator("[data-audit-reset]")).toHaveCount(1);
  });

  test("10. ไม่มี Dashboard card/link ที่ jump ตรงไป Audit Log (เข้าผ่าน nav submenu เท่านั้น)", async ({ page }) => {
    // Dashboard → Audit Log jump ถูกตัดออกจาก scope — Audit Log ไม่มี entry point จาก Dashboard
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    const statJump = await page.locator("#summary-grid .stat[data-jump='audit']").count();
    expect(statJump).toBe(0);
    const statSubJump = await page.locator("#summary-grid .stat[data-sub-jump='Audit Log']").count();
    expect(statSubJump).toBe(0);
    const queueJump = await page.locator(".dashboard-work-list .work-row[data-module-jump='audit']").count();
    expect(queueJump).toBe(0);
    const queueSubJump = await page.locator(".dashboard-work-list .work-row[data-sub-jump='Audit Log']").count();
    expect(queueSubJump).toBe(0);
  });
});
