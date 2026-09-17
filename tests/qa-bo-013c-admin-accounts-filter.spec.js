// QA-BO-013c: Settings > Admin Accounts — Filter bar, search & sort (strict Playwright spec)
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล — renderAdminAccountRows() filter/sort logic + filterOptions
// เป้าหมาย: รันเทสครอบ filter bar, search, status/role filter, sort, toggle, reset, persistence, pagination, empty (ห้ามแก้ prototype)
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

// helper: เปิด filter bar ถ้ายังปิด (mobile ≤760px เท่านั้น — desktop bar แสดงเสมอ)
async function openFilterBar(page) {
  const mobile = await isMobile(page);
  if (!mobile) return;
  const bar = page.locator(".user-filter-bar.admin-account-filter-bar");
  const isOpen = await bar.getAttribute("data-filter-open");
  if (isOpen === "false") {
    await page.locator("#user-panel-filter-actions [data-admin-account-filter-toggle]").click();
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

// helper: อ่าน label ที่แสดงใน custom-select trigger
function selectLabel(page, inputId) {
  return page.locator(`div[data-custom-select]:has(> #${inputId}) [data-custom-select-label]`);
}

// helper: อ่านค่า hidden input ของ custom-select
async function selectValue(page, inputId) {
  return await page.locator(`#${inputId}`).inputValue();
}

// helper: อ่าน Admin ID ของทุก row ในหน้าปัจจุบัน (เรียงตาม DOM)
async function rowIds(page) {
  return await page.locator(".admin-account-row").evaluateAll(rows =>
    rows.map(r => r.getAttribute("data-admin-account-card")));
}

// helper: คลิกปุ่ม reset ที่มองเห็นได้ (desktop = ใน filter bar, mobile = ใน panel actions)
async function clickReset(page) {
  const mobile = await isMobile(page);
  if (mobile) {
    await page.locator("#user-panel-filter-actions [data-admin-account-reset]").click();
  } else {
    await page.locator(".admin-account-filter-bar [data-admin-account-reset]").click();
  }
  await page.waitForTimeout(300);
}

// ==================== C. FILTER BAR, SEARCH & SORT ====================

test.describe("QA-BO-013c: Settings > Admin Accounts — filter bar, search & sort", () => {

  test("1. filter bar มี search + status filter + role filter + sort + reset", async ({ page }) => {
    await goToAdminAccounts(page);
    // search input
    await expect(page.locator("#admin-account-search")).toBeVisible();
    await expect(page.locator("#admin-account-search")).toHaveAttribute("placeholder", "ค้นหา Admin ID, ชื่อ, อีเมล, Role");
    // status filter (custom-select hidden input)
    await expect(page.locator("#admin-account-status-filter")).toHaveCount(1);
    // role filter
    await expect(page.locator("#admin-account-role-filter")).toHaveCount(1);
    // sort
    await expect(page.locator("#admin-account-sort")).toHaveCount(1);
    // reset button — มี 2 ตัว: ใน panel actions (mobile) + ใน filter bar (desktop)
    // ตรวจว่ามีอย่างน้อย 1 ตัวที่ visible
    const mobile = await isMobile(page);
    if (mobile) {
      await expect(page.locator("#user-panel-filter-actions [data-admin-account-reset]")).toBeVisible();
      await expect(page.locator("#user-panel-filter-actions [data-admin-account-filter-toggle]")).toBeVisible();
    } else {
      // desktop: panel actions hidden, reset อยู่ใน filter bar
      await expect(page.locator(".admin-account-filter-bar [data-admin-account-reset]")).toBeVisible();
    }
  });

  test("2. search ค้นได้ทุก field: Admin ID, ชื่อ, อีเมล, Role", async ({ page }) => {
    await goToAdminAccounts(page);
    // Admin ID
    await page.locator("#admin-account-search").fill("ADM-006");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ADM-006"]);
    // ชื่อ (Thai)
    await page.locator("#admin-account-search").fill("พิมพ์ใจ");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ADM-006"]);
    // อีเมล
    await page.locator("#admin-account-search").fill("pim@");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ADM-006"]);
    // Role (default sort = latest)
    await page.locator("#admin-account-search").fill("Trust & Safety");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ADM-003"]);
    // ล้าง search แล้วกลับครบ 10
    await page.locator("#admin-account-search").fill("");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toHaveLength(10);
  });

  test("3. status filter: เลือก Active/Invited/Locked/Suspended/Archived → row กรองถูก", async ({ page }) => {
    await goToAdminAccounts(page);
    // Active → 6 rows (master + 5 active)
    await pickCustomOption(page, "admin-account-status-filter", "Active");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toHaveLength(6);
    expect(await rowIds(page)).toContain("ADM-010");
    // Invited → 1 row
    await pickCustomOption(page, "admin-account-status-filter", "Invited");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ADM-008"]);
    // Locked → 1 row
    await pickCustomOption(page, "admin-account-status-filter", "Locked");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ADM-007"]);
    // Suspended → 1 row
    await pickCustomOption(page, "admin-account-status-filter", "Suspended");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ADM-006"]);
    // Archived → 1 row
    await pickCustomOption(page, "admin-account-status-filter", "Archived");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ADM-009"]);
    // กลับเป็นทุกสถานะ → 10 rows
    await pickCustomOption(page, "admin-account-status-filter", "");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toHaveLength(10);
  });

  test("4. role filter: เลือก 8 standard roles → row กรองถูก", async ({ page }) => {
    await goToAdminAccounts(page);
    // Super Admin → 2 rows (master + ADM-001)
    await pickCustomOption(page, "admin-account-role-filter", "Super Admin");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ADM-010", "ADM-001"]);
    // Admin Manager → 1 row
    await pickCustomOption(page, "admin-account-role-filter", "Admin Manager");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ADM-008"]);
    // Operations Manager → 1 row
    await pickCustomOption(page, "admin-account-role-filter", "Operations Manager");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ADM-002"]);
    // Support Agent → 1 row
    await pickCustomOption(page, "admin-account-role-filter", "Support Agent");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ADM-006"]);
    // Trust & Safety Moderator → 1 row
    await pickCustomOption(page, "admin-account-role-filter", "Trust & Safety Moderator");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ADM-003"]);
    // Asset Operations → 1 row
    await pickCustomOption(page, "admin-account-role-filter", "Asset Operations");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ADM-007"]);
    // Content Editor → 2 rows (latest sort: ADM-005 ก่อน ADM-009)
    await pickCustomOption(page, "admin-account-role-filter", "Content Editor");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ADM-005", "ADM-009"]);
    // Content Publisher → 1 row
    await pickCustomOption(page, "admin-account-role-filter", "Content Publisher");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ADM-004"]);
    // กลับเป็น Role ทั้งหมด → 10 rows
    await pickCustomOption(page, "admin-account-role-filter", "");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toHaveLength(10);
  });

  test("5. sort: latest (desc, master บน), oldest (asc), name (localeCompare th), status (localeCompare en)", async ({ page }) => {
    await goToAdminAccounts(page);
    // latest (default) — createdAtRank desc, master บนสุด
    await pickCustomOption(page, "admin-account-sort", "latest");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual([
      "ADM-010", "ADM-008", "ADM-007", "ADM-006", "ADM-005",
      "ADM-004", "ADM-003", "ADM-002", "ADM-001", "ADM-009"
    ]);
    // oldest — createdAtRank asc, master บนสุด
    await pickCustomOption(page, "admin-account-sort", "oldest");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual([
      "ADM-010", "ADM-009", "ADM-001", "ADM-002", "ADM-003",
      "ADM-004", "ADM-005", "ADM-006", "ADM-007", "ADM-008"
    ]);
    // name — fullName.localeCompare(th), master บนสุด
    // Thai collation: ชื่อไทยเรียงตามอักษรไทย (ก→อ), ชื่ออังกฤษ (Orn Admin) อยู่หลังสุด
    await pickCustomOption(page, "admin-account-sort", "name");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual([
      "ADM-010", "ADM-004", "ADM-008", "ADM-006", "ADM-003",
      "ADM-007", "ADM-001", "ADM-009", "ADM-002", "ADM-005"
    ]);
    // status — status.localeCompare(en), master บนสุด
    // Active < Archived < Invited < Locked < Suspended
    await pickCustomOption(page, "admin-account-sort", "status");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual([
      "ADM-010", "ADM-001", "ADM-002", "ADM-003", "ADM-004",
      "ADM-005", "ADM-009", "ADM-008", "ADM-007", "ADM-006"
    ]);
  });

  test("6. ใช้ filter ร่วมกัน (search + status + role) ได้", async ({ page }) => {
    await goToAdminAccounts(page);
    // search 'super' + status 'Active' + role 'Super Admin' → ADM-010 (master), ADM-001
    await page.locator("#admin-account-search").fill("super");
    await page.waitForTimeout(300);
    await pickCustomOption(page, "admin-account-status-filter", "Active");
    await page.waitForTimeout(300);
    await pickCustomOption(page, "admin-account-role-filter", "Super Admin");
    await page.waitForTimeout(300);
    const ids = await rowIds(page);
    expect(ids).toHaveLength(2);
    expect(ids[0]).toBe("ADM-010"); // master บนสุดเสมอ
    expect(ids.slice().sort()).toEqual(["ADM-001", "ADM-010"]);
  });

  test("7. เปิด/ปิดตัวกรอง toggle สลับ data-filter-open + aria-expanded + label (mobile เท่านั้น)", async ({ page }) => {
    await goToAdminAccounts(page);
    const mobile = await isMobile(page);
    if (!mobile) { test.skip(); return; }
    const toggle = page.locator("#user-panel-filter-actions [data-admin-account-filter-toggle]");
    const bar = page.locator(".user-filter-bar.admin-account-filter-bar");
    // initial state: closed
    await expect(bar).toHaveAttribute("data-filter-open", "false");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle.locator("span")).toHaveText("เปิดตัวกรอง");
    // click → open
    await toggle.click();
    await page.waitForTimeout(200);
    await expect(bar).toHaveAttribute("data-filter-open", "true");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(toggle.locator("span")).toHaveText("ปิดตัวกรอง");
    // click again → closed
    await toggle.click();
    await page.waitForTimeout(200);
    await expect(bar).toHaveAttribute("data-filter-open", "false");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle.locator("span")).toHaveText("เปิดตัวกรอง");
  });

  test("7b. mobile (≤760px): toggle ซ่อน/แสดง advanced filters จริง", async ({ page }) => {
    await goToAdminAccounts(page);
    const mobile = await isMobile(page);
    if (!mobile) { test.skip(); return; }
    const bar = page.locator(".user-filter-bar.admin-account-filter-bar");
    const statusFilter = bar.locator(".user-advanced-filter").first();
    // closed → advanced filters hidden
    await expect(bar).toHaveAttribute("data-filter-open", "false");
    await expect(statusFilter).toBeHidden();
    // open → advanced filters visible
    await page.locator("#user-panel-filter-actions [data-admin-account-filter-toggle]").click();
    await page.waitForTimeout(200);
    await expect(bar).toHaveAttribute("data-filter-open", "true");
    await expect(statusFilter).toBeVisible();
  });

  test("8. รีเซ็ตค่าทั้งหมด → ล้าง search/filter/sort + กลับหน้า 1", async ({ page }) => {
    await goToAdminAccounts(page);
    // set search + status + role + sort (non-default)
    await page.locator("#admin-account-search").fill("super");
    await page.waitForTimeout(300);
    await pickCustomOption(page, "admin-account-status-filter", "Active");
    await page.waitForTimeout(300);
    await pickCustomOption(page, "admin-account-role-filter", "Super Admin");
    await page.waitForTimeout(300);
    await pickCustomOption(page, "admin-account-sort", "name");
    await page.waitForTimeout(300);
    // verify filtered state
    expect(await rowIds(page)).toHaveLength(2);
    // reset
    await clickReset(page);
    // search cleared
    await expect(page.locator("#admin-account-search")).toHaveValue("");
    // status filter = "" (ทุกสถานะ)
    expect(await selectValue(page, "admin-account-status-filter")).toBe("");
    await expect(selectLabel(page, "admin-account-status-filter")).toHaveText("ทุกสถานะ");
    // role filter = "" (Role ทั้งหมด)
    expect(await selectValue(page, "admin-account-role-filter")).toBe("");
    await expect(selectLabel(page, "admin-account-role-filter")).toHaveText("Role ทั้งหมด");
    // sort = "latest" (default)
    expect(await selectValue(page, "admin-account-sort")).toBe("latest");
    await expect(selectLabel(page, "admin-account-sort")).toHaveText("ล่าสุดก่อน");
    // page 1 — all 10 rows back
    expect(await rowIds(page)).toHaveLength(10);
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 1-10 จาก 10");
  });

  test("9. filter state persistence: เข้า detail แล้วกลับมา ค่า filter ยังอยู่", async ({ page }) => {
    await goToAdminAccounts(page);
    // set search + status + sort (non-default)
    // 'orn admin' ตรงเฉพาะ ADM-005 (Orn Admin) — ไม่ตรง ADM-002 (email ornnuch@ ไม่มี 'orn admin')
    await page.locator("#admin-account-search").fill("orn admin");
    await page.waitForTimeout(300);
    await pickCustomOption(page, "admin-account-status-filter", "Active");
    await page.waitForTimeout(300);
    await pickCustomOption(page, "admin-account-sort", "oldest");
    await page.waitForTimeout(300);
    // verify filtered state
    const idsBefore = await rowIds(page);
    expect(idsBefore).toEqual(["ADM-005"]);
    // go to detail (click Admin ID cell)
    await page.locator('.admin-account-row[data-admin-account-card="ADM-005"] .user-cell-primary[data-label="Admin ID"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/admin-account-detail-mode/);
    // back to list
    await page.locator("[data-admin-account-back]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/admin-account-list-mode/);
    // filter values restored
    await expect(page.locator("#admin-account-search")).toHaveValue("orn admin");
    expect(await selectValue(page, "admin-account-status-filter")).toBe("Active");
    expect(await selectValue(page, "admin-account-sort")).toBe("oldest");
    // rows still filtered
    expect(await rowIds(page)).toEqual(["ADM-005"]);
  });

  test("10. pagination หน้าเดียวแล้วค่า filter คงอยู่ (mock 10 รายการ = 1 หน้า)", async ({ page }) => {
    await goToAdminAccounts(page);
    // search 'super admin' → ตรง role Super Admin + lastAction ที่มีคำว่า Super Admin
    await page.locator("#admin-account-search").fill("super admin");
    await page.waitForTimeout(300);
    const filteredIds = await rowIds(page);
    expect(filteredIds).toEqual(["ADM-010", "ADM-006", "ADM-001"]);
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 1-3 จาก 3");
    // ถ้ามี pager control ให้คลิกหน้า 1 เพื่อยืนยันว่า re-render แล้วยังคง filter; ถ้าไม่มี ให้ยืนยัน state หน้าเดียวแทน
    const pagerNum = page.locator("#table .footer-range .pager .pager-num").first();
    if (await pagerNum.count()) {
      if (await pagerNum.isVisible()) {
        await expect(pagerNum).toHaveText("1");
        await pagerNum.click();
        await page.waitForTimeout(300);
      }
    }
    // search term still in input after pager interaction (or no interaction on mobile)
    await expect(page.locator("#admin-account-search")).toHaveValue("super admin");
    // rows still filtered
    expect(await rowIds(page)).toEqual(filteredIds);
  });

  test("11. empty result เมื่อ filter ไม่ตรงเลย (status + role ที่ไม่มี account ร่วม)", async ({ page }) => {
    await goToAdminAccounts(page);
    // Archived + Super Admin → 0 rows (ADM-009 is Archived but Content Editor)
    await pickCustomOption(page, "admin-account-status-filter", "Archived");
    await page.waitForTimeout(300);
    await pickCustomOption(page, "admin-account-role-filter", "Super Admin");
    await page.waitForTimeout(300);
    // no rows
    await expect(page.locator(".admin-account-row")).toHaveCount(0);
    // empty state
    const empty = page.locator(".admin-account-empty-state");
    await expect(empty).toBeVisible();
    await expect(empty.locator(".empty-title")).toHaveText("ไม่พบ admin account");
    await expect(empty.locator(".empty-subtitle")).toHaveText("ลองปรับคำค้นหรือตัวกรอง แล้วลองใหม่");
    // footer range = 0 จาก 0
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 0 จาก 0");
  });
});
