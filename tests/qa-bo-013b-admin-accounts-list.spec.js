// QA-BO-013b: Settings > Admin Accounts — List rendering & row menu (strict Playwright spec)
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล — renderAdminAccountRows() + adminAccountData (ADM-001..ADM-010)
// เป้าหมาย: รันเทสครอบ list rendering, pill สี, master badge, row menu actions, pagination, empty state, mobile card (ห้ามแก้ prototype)
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

// helper: login เข้าระบบ (ค่า default อยู่ใน form แล้ว)
async function loginIfNeeded(page) {
  const loginScreen = page.locator("#login-screen");
  if (await loginScreen.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator("#login-form button[type=\"submit\"]").click();
    await page.waitForSelector("#otp-form:not(.hidden)", { timeout: 5000 });
    await page.locator("#verify-otp-btn").click();
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

// helper: ตรวจว่า breakpoint ปัจจุบันเป็น mobile (≤760px) หรือไม่
async function isMobile(page) {
  return await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
}

// helper: ไปหน้า Admin Accounts List ผ่านเมนู Settings > Admin Accounts
async function goToAdminAccounts(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  await page.locator(".nav-item[data-module='settings']").click();
  await page.waitForTimeout(300);
  await ensureNavOpen(page);
  await page.locator(".submenu[data-submenu='settings'] button[data-module='settings'][data-sub='Admin Accounts']").click();
  await page.waitForTimeout(300);
}

// helper: เปิด filter bar ถ้ายังปิด (mobile ≤760px เท่านั้น — desktop bar แสดงเสมอและปุ่ม toggle ถูกซ่อน)
async function openFilterBar(page) {
  const mobile = await isMobile(page);
  if (!mobile) return;
  const bar = page.locator(".user-filter-bar.admin-account-filter-bar");
  const isOpen = await bar.getAttribute("data-filter-open");
  if (isOpen === "false") {
    await page.locator("[data-admin-account-filter-toggle]").click();
    await page.waitForTimeout(200);
  }
}

// helper: เลือก option ใน custom-select (ผ่าน UI จริง: เปิด trigger → กด option)
async function pickCustomOption(page, inputId, value) {
  await openFilterBar(page);
  await page
    .locator(`div[data-custom-select]:has(> #${inputId}) [data-custom-select-trigger]`)
    .click();
  await page.waitForTimeout(150);
  await page
    .locator(`div[data-custom-select]:has(> #${inputId}) [data-custom-select-option][data-value="${value}"]`)
    .click();
  await page.waitForTimeout(200);
}

// helper: locator ของ row ตาม Admin ID
function accountRow(page, id) {
  return page.locator(`.admin-account-row[data-admin-account-card="${id}"]`);
}

// helper: อ่านข้อความปุ่มทั้งหมดใน row-menu-list ของ account (ปุ่มอยู่ใน DOM เสมอ แม้เมนูยังไม่เปิด)
async function rowMenuButtonTexts(page, id) {
  return await accountRow(page, id)
    .locator(".row-menu-list button")
    .allTextContents()
    .then(texts => texts.map(t => t.trim()));
}

// ==================== B. LIST RENDERING & ROW MENU ====================

test.describe("QA-BO-013b: Settings > Admin Accounts — list rendering & row menu", () => {

  test("1. ตารางมี head 7 คอลัมน์: Admin ID / Name / Email / Role / Status / Last Login / Action", async ({ page }) => {
    await goToAdminAccounts(page);
    const headCells = page.locator(".admin-account-table .user-row.head > div");
    await expect(headCells).toHaveCount(7);
    await expect(headCells.nth(0)).toHaveText("Admin ID");
    await expect(headCells.nth(1)).toHaveText("Name");
    await expect(headCells.nth(2)).toHaveText("Email");
    await expect(headCells.nth(3)).toHaveText("Role");
    await expect(headCells.nth(4)).toHaveText("Status");
    await expect(headCells.nth(5)).toHaveText("Last Login");
    await expect(headCells.nth(6)).toHaveText("Action");
  });

  test("2. แสดง 10 rows ตรง mock (ADM-001..ADM-010) และ ADM-010 (master) อยู่บนสุด", async ({ page }) => {
    await goToAdminAccounts(page);
    const rows = page.locator(".admin-account-row");
    await expect(rows).toHaveCount(10);
    // master admin อยู่บนสุดเสมอ (default sort = latest)
    await expect(rows.first()).toHaveAttribute("data-admin-account-card", "ADM-010");
    // ครบทุก id ใน mock
    const ids = await rows.evaluateAll(rows =>
      rows.map(r => r.getAttribute("data-admin-account-card")).sort());
    expect(ids).toEqual([
      "ADM-001", "ADM-002", "ADM-003", "ADM-004", "ADM-005",
      "ADM-006", "ADM-007", "ADM-008", "ADM-009", "ADM-010"
    ]);
  });

  test("3. status pill สีถูกต้อง: Active=green, Invited=blue, Locked=amber, Suspended=red, Archived=gray", async ({ page }) => {
    await goToAdminAccounts(page);
    // เช็ค pill ใน cell [data-label="Status"] (อยู่ใน DOM ทุก viewport)
    const check = async (id, colorClass, text) => {
      const pill = accountRow(page, id).locator('[data-label="Status"] .pill');
      await expect(pill).toHaveClass(new RegExp(`\\b${colorClass}\\b`));
      await expect(pill).toHaveText(text);
    };
    await check("ADM-001", "green", "Active");
    await check("ADM-006", "red", "Suspended");
    await check("ADM-007", "amber", "Locked");
    await check("ADM-008", "blue", "Invited");
    await check("ADM-009", "gray", "Archived");
  });

  test("4. role pill สีถูกต้อง: Super Admin=purple, Content Publisher/Editor=blue, Moderator=amber, Support Agent=gray", async ({ page }) => {
    await goToAdminAccounts(page);
    const check = async (id, colorClass, text) => {
      const pill = accountRow(page, id).locator('[data-label="Role"] .pill');
      await expect(pill).toHaveClass(new RegExp(`\\b${colorClass}\\b`));
      await expect(pill).toHaveText(text);
    };
    await check("ADM-001", "purple", "Super Admin");
    await check("ADM-003", "amber", "Moderator");
    await check("ADM-004", "blue", "Content Publisher");
    await check("ADM-005", "blue", "Content Editor");
    await check("ADM-006", "gray", "Support Agent");
  });

  test("5. master admin (ADM-010) แสดง pill-master 'Master' แยกจาก status/role pill", async ({ page }) => {
    await goToAdminAccounts(page);
    const row = accountRow(page, "ADM-010");
    // pill-master เป็น element แยก (อยู่ใน Name cell + user-card-tags)
    const masterPills = row.locator(".pill.pill-master");
    expect(await masterPills.count()).toBeGreaterThanOrEqual(1);
    await expect(masterPills.first()).toHaveText("Master");
    // status/role pill ยังแสดงปกติ (Active green + Super Admin purple) — master ไม่แทนที่ pill ปกติ
    await expect(row.locator('[data-label="Status"] .pill')).toHaveClass(/\bgreen\b/);
    await expect(row.locator('[data-label="Status"] .pill')).toHaveText("Active");
    await expect(row.locator('[data-label="Role"] .pill')).toHaveClass(/\bpurple\b/);
    await expect(row.locator('[data-label="Role"] .pill')).toHaveText("Super Admin");
    // account อื่นไม่มี pill-master
    expect(await accountRow(page, "ADM-001").locator(".pill-master").count()).toBe(0);
  });

  test("6. master admin (ADM-010) อยู่ row แรกเสมอไม่ว่าจะ sort ด้วยอะไร", async ({ page }) => {
    await goToAdminAccounts(page);
    const firstRowId = async () =>
      await page.locator(".admin-account-row").first().getAttribute("data-admin-account-card");
    // sort ทีละตัวผ่าน custom-select จริง
    for (const sortValue of ["oldest", "name", "status", "latest"]) {
      await pickCustomOption(page, "admin-account-sort", sortValue);
      await page.waitForTimeout(300);
      expect(await firstRowId()).toBe("ADM-010");
    }
  });

  test("7. row menu (details/summary) เปิดได้ และทุก row มีปุ่ม 'ดูรายละเอียด'", async ({ page }) => {
    await goToAdminAccounts(page);
    // ทุก row มีปุ่ม ดูรายละเอียด ใน DOM
    const ids = ["ADM-001", "ADM-002", "ADM-003", "ADM-004", "ADM-005",
      "ADM-006", "ADM-007", "ADM-008", "ADM-009", "ADM-010"];
    for (const id of ids) {
      const detailBtn = accountRow(page, id).locator(`button[data-admin-account-open="${id}"]`);
      await expect(detailBtn).toHaveCount(1);
      await expect(detailBtn).toHaveText("ดูรายละเอียด");
    }
    // เปิดเมนูจริงด้วยการคลิก summary → details ได้ open + เมนูแสดง (is-fixed)
    const row = accountRow(page, "ADM-001");
    await row.locator(".row-menu > summary").click();
    await page.waitForTimeout(300);
    await expect(row.locator(".row-menu")).toHaveAttribute("open", "");
    await expect(row.locator(".row-menu-list")).toBeVisible();
    await expect(row.locator(`button[data-admin-account-open="ADM-001"]`)).toBeVisible();
  });

  test("8. row menu แสดง action ตรงตามสถานะ account", async ({ page }) => {
    await goToAdminAccounts(page);
    // Active (ADM-001): ดูรายละเอียด + เปลี่ยน Role + ระงับ
    expect(await rowMenuButtonTexts(page, "ADM-001")).toEqual(["ดูรายละเอียด", "เปลี่ยน Role", "ระงับ"]);
    // Suspended (ADM-006): ดูรายละเอียด + ยกเลิกการระงับ + เก็บถาวร
    expect(await rowMenuButtonTexts(page, "ADM-006")).toEqual(["ดูรายละเอียด", "ยกเลิกการระงับ", "เก็บถาวร"]);
    // Locked (ADM-007): ดูรายละเอียด + ระงับ + ปลดล็อก + เก็บถาวร (suspend ได้เพราะ Locked ไม่ใช่ Active)
    expect(await rowMenuButtonTexts(page, "ADM-007")).toEqual(["ดูรายละเอียด", "ระงับ", "ปลดล็อก", "เก็บถาวร"]);
    // Invited (ADM-008): ดูรายละเอียด + เปลี่ยน Role + ระงับ
    expect(await rowMenuButtonTexts(page, "ADM-008")).toEqual(["ดูรายละเอียด", "เปลี่ยน Role", "ระงับ"]);
    // Archived (ADM-009): ดูรายละเอียด เท่านั้น ไม่มี action
    expect(await rowMenuButtonTexts(page, "ADM-009")).toEqual(["ดูรายละเอียด"]);
  });

  test("9. self/master (ADM-010) ไม่มี action ใดๆ ใน row menu นอกจาก 'ดูรายละเอียด'", async ({ page }) => {
    await goToAdminAccounts(page);
    const texts = await rowMenuButtonTexts(page, "ADM-010");
    expect(texts).toEqual(["ดูรายละเอียด"]);
    // ไม่มีปุ่ม change-role / action เลย
    const row = accountRow(page, "ADM-010");
    await expect(row.locator("[data-admin-account-change-role]")).toHaveCount(0);
    await expect(row.locator("[data-admin-account-action]")).toHaveCount(0);
  });

  test("10. pagination 10/page + footer range 'แสดง 1-10 จาก 10' (mock 10 รายการ = 1 หน้า)", async ({ page }) => {
    await goToAdminAccounts(page);
    // footer range (scope ใน #table กันชนกับ footer ของ panel อื่น)
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 1-10 จาก 10");
    // pager มีหน้าเดียว — prev/next disabled, page 1 active
    const pager = page.locator("#table .footer-range .pager");
    await expect(pager).toBeVisible();
    await expect(pager.locator(".pager-prev")).toBeDisabled();
    await expect(pager.locator(".pager-next")).toBeDisabled();
    const pageNums = pager.locator(".pager-num");
    await expect(pageNums).toHaveCount(1);
    await expect(pageNums.first()).toHaveText("1");
    await expect(pageNums.first()).toHaveClass(/active/);
  });

  test("11. search ไม่เจอ → empty state 'ไม่พบ admin account' + subtitle", async ({ page }) => {
    await goToAdminAccounts(page);
    await page.locator("#admin-account-search").fill("zzzzzz-no-match");
    await page.waitForTimeout(300);
    // ไม่มี data rows
    await expect(page.locator(".admin-account-row")).toHaveCount(0);
    // empty state แสดง
    const empty = page.locator(".admin-account-empty-state");
    await expect(empty).toBeVisible();
    await expect(empty.locator(".empty-title")).toHaveText("ไม่พบ admin account");
    await expect(empty.locator(".empty-subtitle")).toHaveText("ลองปรับคำค้นหรือตัวกรอง แล้วลองใหม่");
    // footer range = แสดง 0 จาก 0
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 0 จาก 0");
    // ล้าง search แล้ว rows กลับมาครบ 10
    await page.locator("#admin-account-search").fill("");
    await page.waitForTimeout(300);
    await expect(page.locator(".admin-account-row")).toHaveCount(10);
  });

  test("12. คลิก cell ธรรมดา → เปิด detail; คลิกปุ่มใน row menu → ไม่เปิด detail", async ({ page }) => {
    await goToAdminAccounts(page);
    // (a) คลิก cell ที่ไม่ใช่ปุ่ม (Admin ID) → เปิด detail mode
    await accountRow(page, "ADM-001").locator('.user-cell-primary[data-label="Admin ID"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/admin-account-detail-mode/);
    // กลับไป list
    await page.locator("[data-admin-account-back]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/admin-account-list-mode/);
    // (b) คลิก summary เปิดเมนู → ไม่เปิด detail
    const row = accountRow(page, "ADM-002");
    await row.locator(".row-menu > summary").click();
    await page.waitForTimeout(300);
    await expect(row.locator(".row-menu")).toHaveAttribute("open", "");
    await expect(page.locator("body")).toHaveClass(/admin-account-list-mode/);
    await expect(page.locator("body")).not.toHaveClass(/admin-account-detail-mode/);
    // (c) คลิกปุ่ม action 'เปลี่ยน Role' ในเมนู → เปิด modal แทน ไม่เข้า detail
    await row.locator(`[data-admin-account-change-role="ADM-002"]`).click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).not.toHaveClass(/admin-account-detail-mode/);
    // ยืนยันว่าเปิด Change Role modal (ยังอยู่ list mode)
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    // ปิด modal กัน state ค้าง
    await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
    await page.waitForTimeout(200);
  });

  test("13. mobile (≤760px): card แสดง tags + meta (Name/Email/Last Login)", async ({ page }) => {
    await goToAdminAccounts(page);
    const mobile = await isMobile(page);
    if (!mobile) { test.skip(); return; }
    const row = accountRow(page, "ADM-001");
    // card tags visible (status + role pill)
    const tags = row.locator(".user-card-tags");
    await expect(tags).toBeVisible();
    // meta items: Name / Email / Last Login
    const meta = row.locator(".user-card-meta");
    await expect(meta).toBeVisible();
    await expect(meta.locator(".user-card-meta-item span", { hasText: /^Name$/ })).toBeVisible();
    await expect(meta.locator(".user-card-meta-item span", { hasText: /^Email$/ })).toBeVisible();
    await expect(meta.locator(".user-card-meta-item span", { hasText: /^Last Login$/ })).toBeVisible();
    // meta values ตรง mock
    await expect(meta.locator(".user-card-meta-item", { hasText: "Name" }).locator("strong")).toHaveText("สมชาย บริหาร");
    await expect(meta.locator(".user-card-meta-item", { hasText: "Email" }).locator("strong")).toHaveText("somchai@tukdaeng.example");
    // master row แสดง pill-master ใน card tags
    await expect(accountRow(page, "ADM-010").locator(".user-card-tags .pill-master")).toHaveText("Master");
    // desktop data-label cells ถูกซ่อน (ยกเว้น primary + actions)
    await expect(row.locator('[data-label="Email"]')).toBeHidden();
    await expect(row.locator('[data-label="Role"]')).toBeHidden();
  });
});
