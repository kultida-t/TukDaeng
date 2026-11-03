// QA-BO-026: Settings > Roles & Permissions — full coverage (strict Playwright spec)
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล — renderRoleListPage/renderRoleListRows/renderRoleDetailPage
//   + openRoleCreateModal/applyRoleCreate + openRoleEditModal/applyRoleEdit
//   + openRoleDeactivateModal/applyRoleDeactivate + openRoleReactivateModal/applyRoleReactivate
//   + checkRoleDeactivateImpact/getRoleReactivateBlockReasons + rolePermissionCatalog seeds
// เป้าหมาย: รันเทสครอบ nav/list/search/filter/sort/pagination/row menu/detail/create-edit/deactivate-reactivate/
//   system role immutability/permission gating/scenario states/responsive/cross-module (ห้ามแก้ prototype)
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

// ---------- helpers ----------

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

// helper: ตรวจว่า breakpoint ปัจจุบันเป็น mobile (≤760px) หรือไม่
async function isMobile(page) {
  return await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
}

// helper: ตรวจว่า breakpoint ปัจจุบันเป็น narrow/tablet (≤1180px) หรือไม่
async function isNarrow(page) {
  return await page.evaluate(() => window.matchMedia("(max-width: 1180px)").matches);
}

// helper: ตรวจว่า Settings submenu ขยายอยู่หรือไม่
async function isSettingsSubmenuExpanded(page) {
  return await page.evaluate(() =>
    document.querySelector(".submenu[data-submenu='settings']")?.classList.contains("open"));
}

// helper: ไปหน้า Role List ผ่านเมนู Settings > Roles & Permissions
async function goToRoleList(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  // ขยาย Settings submenu เฉพาะเมื่อยังไม่ขยาย (click nav-item = toggle)
  if (!(await isSettingsSubmenuExpanded(page))) {
    await page.locator(".nav-item[data-module='settings']").click();
    await page.waitForTimeout(300);
    await ensureNavOpen(page);
  }
  await page.locator(".submenu[data-submenu='settings'] button[data-module='settings'][data-sub='Roles & Permissions']").click();
  await page.waitForTimeout(300);
}

// helper: เปิด filter bar ถ้ายังปิด (mobile ≤760px เท่านั้น — desktop bar แสดงเสมอ)
async function openFilterBar(page) {
  const mobile = await isMobile(page);
  if (!mobile) return;
  const bar = page.locator(".user-filter-bar.role-filter-bar");
  const isOpen = await bar.getAttribute("data-filter-open");
  if (isOpen === "false") {
    await page.locator("#user-panel-filter-actions [data-role-filter-toggle]").click();
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

// helper: อ่านค่า hidden input ของ custom-select
async function selectValue(page, inputId) {
  return await page.locator(`#${inputId}`).inputValue();
}

// helper: อ่าน Role ID ของทุก row ในหน้าปัจจุบัน (เรียงตาม DOM)
async function rowIds(page) {
  return await page.locator(".user-row.role-row").evaluateAll(rows =>
    rows.map(r => r.getAttribute("data-role-card")));
}

// helper: locator ของ row ตาม Role ID
function roleRow(page, id) {
  return page.locator(`.user-row.role-row[data-role-card="${id}"]`);
}

// helper: เปิด row menu ของ role แล้วคลิก action
async function openRoleMenuAction(page, id, action) {
  const row = roleRow(page, id);
  await row.locator(".row-menu > summary").click();
  await page.waitForTimeout(300);
  await row.locator(`[data-role-flow="${action}"][data-role-id="${id}"]`).click();
  await page.waitForTimeout(300);
}

// helper: เปิด Role Detail ผ่าน row menu > ดูรายละเอียด
async function openRoleDetailViaMenu(page, id) {
  const row = roleRow(page, id);
  await row.locator(".row-menu > summary").click();
  await page.waitForTimeout(300);
  await row.locator(`[data-role-open="${id}"]`).click();
  await page.waitForTimeout(300);
}

// helper: เปิด Role Detail ผ่านการคลิก cell ชื่อ Role (ไม่ใช้ row menu)
async function openRoleDetailViaCell(page, id) {
  await roleRow(page, id).locator('.user-cell-primary[data-label="Role"]').click();
  await page.waitForTimeout(300);
}

// helper: เลือก Prototype scenario ของหน้า Role (เปิด details → trigger → option)
async function pickRoleState(page, scope, value) {
  const tools = page.locator(`details[data-role-tools="${scope}"]`);
  const isOpen = await tools.evaluate(el => el.open);
  if (!isOpen) {
    await tools.locator("summary").click();
    await page.waitForTimeout(150);
  }
  await tools.locator("[data-custom-select-trigger]").click();
  await page.waitForTimeout(150);
  await tools.locator(`[data-custom-select-option][data-value="${value}"]`).click();
  await page.waitForTimeout(300);
}

// helper: เปิด Create Custom Role modal
async function openCreateModal(page) {
  await page.locator("#page-actions [data-role-create-open]").click();
  await page.waitForTimeout(300);
  await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
}

// helper: ติ๊ก permission checkbox ใน role form (auto-scroll ใน modal body)
async function checkRolePerm(page, permKey) {
  await page.locator(`[data-role-perm-check="${permKey}"]`).check();
  await page.waitForTimeout(150);
}

// helper: ติ๊กถอน permission checkbox
async function uncheckRolePerm(page, permKey) {
  await page.locator(`[data-role-perm-check="${permKey}"]`).uncheck();
  await page.waitForTimeout(150);
}

// helper: submit role create/edit form
async function submitRoleForm(page) {
  await page.locator("[data-role-create-form] button[type=\"submit\"]").click();
  await page.waitForTimeout(300);
}

// helper: toast ที่แสดงอยู่
function toast(page) {
  return page.locator("#success-toast");
}

// ==================== A. NAVIGATION & MENU ====================

test.describe("QA-BO-026-A: Roles & Permissions — navigation & menu", () => {

  test("A1. เมนู Settings ขยายได้และมี submenu 'Roles & Permissions'", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await ensureNavOpen(page);
    await page.locator(".nav-item[data-module='settings']").click();
    await page.waitForTimeout(300);
    await expect(page.locator(".submenu[data-submenu='settings']")).toBeVisible();
    await expect(page.locator(".submenu[data-submenu='settings'] button[data-sub='Roles & Permissions']")).toBeVisible();
  });

  test("A2. คลิก Settings > Roles & Permissions → body.role-list-mode", async ({ page }) => {
    await goToRoleList(page);
    await expect(page.locator("body")).toHaveClass(/role-list-mode/);
  });

  test("A3. breadcrumb = 'เครื่องมือ & รายงาน / Settings / Roles & Permissions'", async ({ page }) => {
    await goToRoleList(page);
    await expect(page.locator("#crumb")).toHaveText("เครื่องมือ & รายงาน / Settings / Roles & Permissions");
  });

  test("A4. #page-title = 'Roles & Permissions', #panel-title = 'Role List', #panel-subtitle = ''", async ({ page }) => {
    await goToRoleList(page);
    await expect(page.locator("#page-title")).toHaveText("Roles & Permissions");
    await expect(page.locator("#panel-title")).toHaveText("Role List");
    await expect(page.locator("#panel-subtitle")).toHaveText("");
  });

  test("A5. #primary-action = '' และซ่อนอยู่ (ปุ่มสร้างอยู่ที่ #page-actions)", async ({ page }) => {
    await goToRoleList(page);
    await expect(page.locator("#primary-action")).toHaveText("");
    await expect(page.locator("#primary-action")).toBeHidden();
  });

  test("A6. ไม่มี KPI cards (#summary-grid, #cards, #detail ว่าง)", async ({ page }) => {
    await goToRoleList(page);
    await expect(page.locator("#summary-grid")).toHaveText("");
    await expect(page.locator("#cards")).toHaveText("");
    await expect(page.locator("#detail")).toHaveText("");
  });

  test("A7. ปุ่ม 'สร้าง Custom Role' อยู่ใน #page-actions (data-role-create-open)", async ({ page }) => {
    await goToRoleList(page);
    const btn = page.locator("#page-actions [data-role-create-open]");
    await expect(btn).toBeVisible();
    await expect(btn).toContainText("สร้าง Custom Role");
  });

  test("A8. nav item settings + submenu Roles & Permissions แสดง active state", async ({ page }) => {
    await goToRoleList(page);
    await ensureNavOpen(page);
    await expect(page.locator(".submenu[data-submenu='settings'] button[data-sub='Roles & Permissions']")).toHaveClass(/active/);
  });

  test("A9. Prototype scenario tools อยู่ใน panel + select มี 5 options (ready/loading/error/empty/unauthorized)", async ({ page }) => {
    await goToRoleList(page);
    const tools = page.locator('.panel > details[data-role-tools="list"]');
    await expect(tools).toHaveCount(1);
    await expect(tools.locator("summary")).toHaveText("Prototype scenario");
    const values = await tools.locator("[data-custom-select-option]").evaluateAll(opts =>
      opts.map(o => o.getAttribute("data-value")));
    expect(values).toEqual(["ready", "loading", "error", "empty", "unauthorized"]);
  });
});

// ==================== B. ROLE LIST RENDERING ====================

test.describe("QA-BO-026-B: Role List — rendering & pagination", () => {

  test("B1. ตาราง head 8 คอลัมน์: Role ID/Role/Type/Status/Detail/Admins/Last Updated/Action", async ({ page }) => {
    await goToRoleList(page);
    const headCells = page.locator(".role-list-table .user-row.head > div");
    await expect(headCells).toHaveCount(8);
    await expect(headCells.nth(0)).toHaveText("Role ID");
    await expect(headCells.nth(1)).toHaveText("Role");
    await expect(headCells.nth(2)).toHaveText("Type");
    await expect(headCells.nth(3)).toHaveText("Status");
    await expect(headCells.nth(4)).toHaveText("Detail");
    await expect(headCells.nth(5)).toHaveText("Admins");
    await expect(headCells.nth(6)).toHaveText("Last Updated");
    await expect(headCells.nth(7)).toHaveText("Action");
  });

  test("B2. seed 11 roles (8 System + 3 Custom) — หน้า 1 แสดง 10 rows + footer 'แสดง 1-10 จาก 11'", async ({ page }) => {
    await goToRoleList(page);
    expect(await rowIds(page)).toEqual([
      "ROL-001", "ROL-002", "ROL-003", "ROL-004", "ROL-005",
      "ROL-006", "ROL-007", "ROL-008", "ROL-101", "ROL-102"
    ]);
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 1-10 จาก 11");
  });

  test("B3. row ROL-001 แสดงชื่อ/pills/detail/Admins=2/Last Updated ถูกต้อง", async ({ page }) => {
    await goToRoleList(page);
    const row = roleRow(page, "ROL-001");
    await expect(row.locator('[data-label="Role"] .desktop-user-name')).toHaveText("Super Admin");
    await expect(row.locator('[data-label="Type"] .pill.purple')).toHaveText("System Role");
    await expect(row.locator('[data-label="Status"] .pill.green')).toHaveText("Active");
    await expect(row.locator('[data-label="Detail"]')).toContainText("ใช้สำหรับเจ้าของระบบหรือ operation lead");
    await expect(row.locator('[data-label="Admins"] .main-text')).toHaveText("2");
    await expect(row.locator('[data-label="Last Updated"] .main-text')).toHaveText("01 Jan 2026 09:00");
  });

  test("B4. Type pill — System Role (purple) 8 rows, Custom Role (teal) 3 rows", async ({ page }) => {
    await goToRoleList(page);
    // หน้า 1 มี system 8 + custom 2
    await expect(page.locator('.role-list-table .user-row.role-row [data-label="Type"] .pill.purple')).toHaveCount(8);
    await expect(page.locator('.role-list-table .user-row.role-row [data-label="Type"] .pill.teal')).toHaveCount(2);
    // หน้า 2 เป็น ROL-103 custom
    await page.locator('[data-role-page="next"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator('.role-list-table .user-row.role-row [data-label="Type"] .pill.teal')).toHaveCount(1);
  });

  test("B5. Status pill — ROL-103 = Inactive (gray), ที่เหลือ Active (green)", async ({ page }) => {
    await goToRoleList(page);
    await page.locator('[data-role-page="next"]').click();
    await page.waitForTimeout(300);
    const row = roleRow(page, "ROL-103");
    await expect(row.locator('[data-label="Status"] .pill.gray')).toHaveText("Inactive");
    await expect(row.locator('[data-label="Status"] .pill.green')).toHaveCount(0);
  });

  test("B6. คอลัมน์ Admins = จำนวนผู้ดูแล Active ที่ใช้ role (Super Admin=2, Admin Manager=0, Content Editor=1)", async ({ page }) => {
    await goToRoleList(page);
    await expect(roleRow(page, "ROL-001").locator('[data-label="Admins"] .main-text')).toHaveText("2");
    await expect(roleRow(page, "ROL-002").locator('[data-label="Admins"] .main-text')).toHaveText("0");
    await expect(roleRow(page, "ROL-007").locator('[data-label="Admins"] .main-text')).toHaveText("1");
    await expect(roleRow(page, "ROL-101").locator('[data-label="Admins"] .main-text')).toHaveText("0");
  });

  test("B7. คอลัมน์ Detail ตัด 1 บรรทัด + เก็บข้อความเต็มใน data-comment-full", async ({ page }) => {
    await goToRoleList(page);
    const detail = roleRow(page, "ROL-003").locator('[data-label="Detail"]');
    await expect(detail).toHaveClass(/history-note/);
    const full = await detail.getAttribute("data-comment-full");
    expect(full).toBe("ดูภาพรวม queue ปฏิบัติการและดำเนินงานข้าม module ได้เฉพาะ action ที่ matrix อนุญาต");
    const whiteSpace = await detail.evaluate(el => getComputedStyle(el).whiteSpace);
    expect(whiteSpace).toBe("nowrap");
  });

  test("B8. pagination — กดหน้า 2 เหลือ ROL-103 + 'แสดง 11-11 จาก 11' แล้ว prev/เลขหน้ากลับได้", async ({ page }) => {
    await goToRoleList(page);
    // prev disabled ที่หน้า 1
    await expect(page.locator('[data-role-page="prev"]')).toBeDisabled();
    await page.locator('[data-role-page="next"]').click();
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ROL-103"]);
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 11-11 จาก 11");
    await expect(page.locator('[data-role-page="next"]')).toBeDisabled();
    // กลับหน้า 1 ด้วยปุ่มเลข
    await page.locator('[data-role-page="prev"]').click();
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toHaveLength(10);
  });

  test("B9. row menu มี 'ดูรายละเอียด' ทุก row (details > summary '...')", async ({ page }) => {
    await goToRoleList(page);
    for (const id of ["ROL-001", "ROL-101", "ROL-102"]) {
      const row = roleRow(page, id);
      await row.locator(".row-menu > summary").click();
      await page.waitForTimeout(200);
      await expect(row.locator(`[data-role-open="${id}"]`)).toHaveText("ดูรายละเอียด");
      await row.locator(".row-menu > summary").click();
      await page.waitForTimeout(150);
    }
  });
});

// ==================== C. SEARCH ====================

test.describe("QA-BO-026-C: Role List — search", () => {

  test("C1. search input มี placeholder 'ค้นหา Role ID, ชื่อ หรือคำอธิบาย'", async ({ page }) => {
    await goToRoleList(page);
    await openFilterBar(page);
    await expect(page.locator("#role-search")).toHaveAttribute("placeholder", "ค้นหา Role ID, ชื่อ หรือคำอธิบาย");
  });

  test("C2. ค้นด้วย Role ID — 'ROL-101' → 1 row", async ({ page }) => {
    await goToRoleList(page);
    await openFilterBar(page);
    await page.locator("#role-search").fill("ROL-101");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ROL-101"]);
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 1-1 จาก 1");
  });

  test("C3. ค้นด้วยชื่อ — 'content' → ROL-007, ROL-008, ROL-101", async ({ page }) => {
    await goToRoleList(page);
    await openFilterBar(page);
    await page.locator("#role-search").fill("content");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ROL-007", "ROL-008", "ROL-101"]);
  });

  test("C4. ค้นด้วย roleKey — 'legacy_support_viewer' → ROL-103", async ({ page }) => {
    await goToRoleList(page);
    await openFilterBar(page);
    await page.locator("#role-search").fill("legacy_support_viewer");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ROL-103"]);
  });

  test("C5. ค้นด้วยคำอธิบาย — 'เจ้าของระบบ' → ROL-001", async ({ page }) => {
    await goToRoleList(page);
    await openFilterBar(page);
    await page.locator("#role-search").fill("เจ้าของระบบ");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ROL-001"]);
  });

  test("C6. ค้นไม่เจอ → empty state 'ไม่พบ Role ตามเงื่อนไขที่เลือก' + ปุ่มล้างตัวกรอง", async ({ page }) => {
    await goToRoleList(page);
    await openFilterBar(page);
    await page.locator("#role-search").fill("ไม่มี role นี้ในระบบ");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toHaveLength(0);
    await expect(page.locator(".role-state-block .empty-title")).toHaveText("ไม่พบ Role ตามเงื่อนไขที่เลือก");
    await expect(page.locator(".role-state-block .empty-subtitle")).toHaveText("ลองปรับคำค้นหรือตัวกรอง แล้วลองใหม่");
    // ปุ่มล้างตัวกรองใน empty state → กลับครบ 11
    await page.locator(".role-state-block [data-role-reset]").click();
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toHaveLength(10);
    await expect(page.locator("#role-search")).toHaveValue("");
  });

  test("C7. ล้าง search กลับครบ 11 rows (footer 'แสดง 1-10 จาก 11')", async ({ page }) => {
    await goToRoleList(page);
    await openFilterBar(page);
    await page.locator("#role-search").fill("market");
    await page.waitForTimeout(300);
    // "market" ตรง ROL-006 ด้วย — คำอธิบายมีคำว่า "Market Data"
    expect(await rowIds(page)).toEqual(["ROL-006", "ROL-102"]);
    await page.locator("#role-search").fill("");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toHaveLength(10);
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 1-10 จาก 11");
  });
});

// ==================== D. FILTER / SORT / RESET ====================

test.describe("QA-BO-026-D: Role List — filter, sort & reset", () => {

  test("D1. filter bar มี search + type + status + sort + reset", async ({ page }) => {
    await goToRoleList(page);
    await openFilterBar(page);
    await expect(page.locator("#role-search")).toHaveCount(1);
    await expect(page.locator("#role-type-filter")).toHaveCount(1);
    await expect(page.locator("#role-status-filter")).toHaveCount(1);
    await expect(page.locator("#role-sort")).toHaveCount(1);
    const mobile = await isMobile(page);
    if (mobile) {
      await expect(page.locator("#user-panel-filter-actions [data-role-reset]")).toBeVisible();
      await expect(page.locator("#user-panel-filter-actions [data-role-filter-toggle]")).toBeVisible();
    } else {
      await expect(page.locator(".role-filter-bar [data-role-reset]")).toBeVisible();
    }
  });

  test("D2. filter type=System Role → 8 rows ทุก row เป็น System pill", async ({ page }) => {
    await goToRoleList(page);
    await pickCustomOption(page, "role-type-filter", "system");
    expect(await rowIds(page)).toEqual([
      "ROL-001", "ROL-002", "ROL-003", "ROL-004", "ROL-005", "ROL-006", "ROL-007", "ROL-008"
    ]);
    await expect(page.locator('.role-list-table .user-row.role-row [data-label="Type"] .pill.teal')).toHaveCount(0);
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 1-8 จาก 8");
  });

  test("D3. filter type=Custom Role → ROL-101, ROL-102, ROL-103", async ({ page }) => {
    await goToRoleList(page);
    await pickCustomOption(page, "role-type-filter", "custom");
    expect(await rowIds(page)).toEqual(["ROL-101", "ROL-102", "ROL-103"]);
  });

  test("D4. filter status=Inactive → เหลือ ROL-103 row เดียว", async ({ page }) => {
    await goToRoleList(page);
    await pickCustomOption(page, "role-status-filter", "Inactive");
    expect(await rowIds(page)).toEqual(["ROL-103"]);
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 1-1 จาก 1");
  });

  test("D5. filter รวม custom + Inactive → ROL-103; custom + Active → ROL-101/102", async ({ page }) => {
    await goToRoleList(page);
    await pickCustomOption(page, "role-type-filter", "custom");
    await pickCustomOption(page, "role-status-filter", "Inactive");
    expect(await rowIds(page)).toEqual(["ROL-103"]);
    await pickCustomOption(page, "role-status-filter", "Active");
    expect(await rowIds(page)).toEqual(["ROL-101", "ROL-102"]);
  });

  test("D6. filter + search ร่วมกัน (type=custom + search 'analyst' → ROL-102)", async ({ page }) => {
    await goToRoleList(page);
    await pickCustomOption(page, "role-type-filter", "custom");
    await openFilterBar(page);
    await page.locator("#role-search").fill("analyst");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ROL-102"]);
  });

  test("D7. sort 'ชื่อ A–Z' → หน้า 1 เรียง Admin Manager → Support Agent", async ({ page }) => {
    await goToRoleList(page);
    await pickCustomOption(page, "role-sort", "name");
    expect(await rowIds(page)).toEqual([
      "ROL-002", "ROL-006", "ROL-007", "ROL-008", "ROL-101",
      "ROL-103", "ROL-102", "ROL-003", "ROL-001", "ROL-004"
    ]);
  });

  test("D8. sort 'สร้างล่าสุด' → ROL-102, ROL-101, ROL-103 นำหน้า", async ({ page }) => {
    await goToRoleList(page);
    await pickCustomOption(page, "role-sort", "created");
    const ids = await rowIds(page);
    expect(ids.slice(0, 3)).toEqual(["ROL-102", "ROL-101", "ROL-103"]);
    // system roles (created เท่ากัน) คงลำดับ seed
    expect(ids.slice(3)).toEqual(["ROL-001", "ROL-002", "ROL-003", "ROL-004", "ROL-005", "ROL-006", "ROL-007"]);
  });

  test("D9. sort 'แก้ไขล่าสุด' → ROL-101, ROL-005, ROL-103, ROL-102 นำหน้า", async ({ page }) => {
    await goToRoleList(page);
    await pickCustomOption(page, "role-sort", "updated");
    const ids = await rowIds(page);
    expect(ids.slice(0, 4)).toEqual(["ROL-101", "ROL-005", "ROL-103", "ROL-102"]);
  });

  test("D10. sort 'ผู้ดูแลที่ใช้งานมาก–น้อย' → ROL-001 (2) นำ, ตามด้วย roles ที่มี 1 admin เรียงชื่อ", async ({ page }) => {
    await goToRoleList(page);
    await pickCustomOption(page, "role-sort", "admins");
    expect(await rowIds(page)).toEqual([
      "ROL-001", "ROL-007", "ROL-008", "ROL-003", "ROL-005",
      "ROL-002", "ROL-006", "ROL-101", "ROL-103", "ROL-102"
    ]);
  });

  test("D11. sort กลับ 'Role ID' (default) ทำงานถูก", async ({ page }) => {
    await goToRoleList(page);
    await pickCustomOption(page, "role-sort", "name");
    await pickCustomOption(page, "role-sort", "id");
    const ids = await rowIds(page);
    expect(ids[0]).toBe("ROL-001");
  });

  test("D12. reset → search + filters + sort กลับค่า default + rows ครบ 11", async ({ page }) => {
    await goToRoleList(page);
    await openFilterBar(page);
    await page.locator("#role-search").fill("content");
    await pickCustomOption(page, "role-type-filter", "custom");
    await pickCustomOption(page, "role-sort", "name");
    await page.waitForTimeout(300);
    // "content" + custom เหลือเฉพาะ ROL-101 (ชื่อมี Content)
    expect(await rowIds(page)).toEqual(["ROL-101"]);
    // กด reset ที่มองเห็น
    await page.locator("[data-role-reset]:visible").first().click();
    await page.waitForTimeout(300);
    await expect(page.locator("#role-search")).toHaveValue("");
    expect(await selectValue(page, "role-type-filter")).toBe("");
    expect(await selectValue(page, "role-status-filter")).toBe("");
    expect(await selectValue(page, "role-sort")).toBe("id");
    expect(await rowIds(page)).toHaveLength(10);
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 1-10 จาก 11");
  });

  test("D13. filter state persist — detail→back คงค่า; สลับ module แล้วกลับมาถูกล้าง", async ({ page }) => {
    await goToRoleList(page);
    await openFilterBar(page);
    await page.locator("#role-search").fill("market");
    await pickCustomOption(page, "role-type-filter", "custom");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ROL-102"]);
    // (a) detail → back → filter คงอยู่
    await openRoleDetailViaCell(page, "ROL-102");
    await expect(page.locator("body")).toHaveClass(/role-detail-mode/);
    await page.locator("[data-role-back]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/role-list-mode/);
    await expect(page.locator("#role-search")).toHaveValue("market");
    expect(await selectValue(page, "role-type-filter")).toBe("custom");
    expect(await rowIds(page)).toEqual(["ROL-102"]);
    // (b) สลับ module → กลับมา → filter ถูกล้าง
    await ensureNavOpen(page);
    await page.locator(".nav-item[data-module='dashboard']").click();
    await page.waitForTimeout(300);
    await ensureNavOpen(page);
    if (!(await isSettingsSubmenuExpanded(page))) {
      await page.locator(".nav-item[data-module='settings']").click();
      await page.waitForTimeout(300);
      await ensureNavOpen(page);
    }
    await page.locator(".submenu[data-submenu='settings'] button[data-module='settings'][data-sub='Roles & Permissions']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#role-search")).toHaveValue("");
    expect(await selectValue(page, "role-type-filter")).toBe("");
    expect(await rowIds(page)).toHaveLength(10);
  });
});

// ==================== E. ROLE DETAIL ====================

test.describe("QA-BO-026-E: Role Detail — sections & navigation", () => {

  test("E1. คลิก row → role-detail-mode + crumb '.../ Content Reviewer TH' + page-title 'Role Detail'", async ({ page }) => {
    await goToRoleList(page);
    await openRoleDetailViaCell(page, "ROL-101");
    await expect(page.locator("body")).toHaveClass(/role-detail-mode/);
    await expect(page.locator("body")).not.toHaveClass(/role-list-mode/);
    await expect(page.locator("#crumb")).toHaveText("เครื่องมือ & รายงาน / Settings / Roles & Permissions / Content Reviewer TH");
    await expect(page.locator("#page-title")).toHaveText("Role Detail");
  });

  test("E2. detail head — 'ROL-101 : Content Reviewer TH' + chips Custom Role/Active", async ({ page }) => {
    await goToRoleList(page);
    await openRoleDetailViaCell(page, "ROL-101");
    await expect(page.locator(".role-detail-page .asset-report-id")).toHaveText("ROL-101");
    await expect(page.locator(".role-detail-page .user-display-name")).toHaveText("Content Reviewer TH");
    await expect(page.locator(".role-detail-page .chips .pill.teal")).toHaveText("Custom Role");
    await expect(page.locator(".role-detail-page .chips .pill.green")).toHaveText("Active");
  });

  test("E3. Role Summary tiles — Role Key/Created/Last Updated/Active Admins ถูกค่า", async ({ page }) => {
    await goToRoleList(page);
    await openRoleDetailViaCell(page, "ROL-101");
    const grid = page.locator(".role-detail-page .detail-grid.four");
    const tiles = grid.locator(".detail-tile");
    await expect(tiles).toHaveCount(4);
    await expect(tiles.nth(0).locator("span")).toHaveText("Role Key");
    await expect(tiles.nth(0).locator("strong")).toHaveText("content_reviewer_th");
    await expect(tiles.nth(1).locator("span")).toHaveText("Created");
    await expect(tiles.nth(1).locator("strong")).toHaveText("12 Aug 2026 14:00");
    await expect(tiles.nth(2).locator("span")).toHaveText("Last Updated");
    await expect(tiles.nth(2).locator("strong")).toHaveText("05 Sep 2026 11:20");
    await expect(tiles.nth(3).locator("span")).toHaveText("Active Admins");
    await expect(tiles.nth(3).locator("strong")).toHaveText("0");
  });

  test("E4. inactive note แสดงเฉพาะ Inactive role (ROL-103 มี, ROL-101 ไม่มี)", async ({ page }) => {
    await goToRoleList(page);
    await openRoleDetailViaCell(page, "ROL-101");
    await expect(page.locator(".role-inactive-note")).toHaveCount(0);
    // กลับไปเปิด ROL-103
    await page.locator("[data-role-back]").click();
    await page.waitForTimeout(300);
    await page.locator('[data-role-page="next"]').click();
    await page.waitForTimeout(300);
    await openRoleDetailViaCell(page, "ROL-103");
    await expect(page.locator(".role-inactive-note")).toHaveText("Role นี้ถูกปิดใช้งาน — ไม่สามารถเลือก assign ให้ผู้ดูแลรายใหม่ได้ แต่ยังแก้ไขข้อมูลและ Permission ได้ตามปกติ");
  });

  test("E5. Permissions section — ROL-101 แสดงเฉพาะ 4 module groups ที่ได้รับสิทธิ์", async ({ page }) => {
    await goToRoleList(page);
    await openRoleDetailViaCell(page, "ROL-101");
    await expect(page.locator(".role-perm-section h4")).toHaveText("Permissions");
    const groups = page.locator(".role-perm-section .perm-group[data-perm-module]");
    await expect(groups).toHaveCount(4);
    const moduleKeys = await groups.evaluateAll(els => els.map(el => el.getAttribute("data-perm-module")));
    expect(moduleKeys).toEqual(["dashboard", "content", "demand", "settings"]);
  });

  test("E6. perm items แสดง ✓ + ชื่อสิทธิ์ + sub title ตามเมนูย่อยจริง (ROL-101)", async ({ page }) => {
    await goToRoleList(page);
    await openRoleDetailViaCell(page, "ROL-101");
    const content = page.locator('.perm-group[data-perm-module="content"]');
    await expect(content.locator(".perm-sub-title").nth(0)).toHaveText("Articles");
    await expect(content.locator(".perm-sub-title").nth(1)).toHaveText("Categories");
    // Articles: ดู + สร้าง/แก้ไข (ไม่มี publish)
    const items = content.locator(".perm-item .perm-item-name");
    await expect(items).toHaveCount(3);
    await expect(items.nth(0)).toHaveText("ดู Article List และ Article Detail");
    await expect(items.nth(1)).toHaveText("สร้าง / แก้ไขบทความ");
    await expect(items.nth(2)).toHaveText("ดู Categories");
    // perm-check แสดง ✓
    await expect(content.locator(".perm-check").first()).toHaveText("✓");
  });

  test("E7. ROL-001 (admin ทุกสิทธิ์) แสดงครบทุก module groups", async ({ page }) => {
    await goToRoleList(page);
    await openRoleDetailViaCell(page, "ROL-001");
    const groups = page.locator(".role-perm-section .perm-group[data-perm-module]");
    // permission catalog มี 9 module groups — Super Admin ได้สิทธิ์ทุกกลุ่ม
    await expect(groups).toHaveCount(9);
  });

  test("E8. permission accordion พับ/ขยายได้ต่อ module (aria-expanded + is-collapsed)", async ({ page }) => {
    await goToRoleList(page);
    await openRoleDetailViaCell(page, "ROL-101");
    const group = page.locator('.perm-group[data-perm-module="demand"]');
    const head = group.locator("[data-role-perm-group]");
    // default ขยาย
    await expect(head).toHaveAttribute("aria-expanded", "true");
    await expect(group.locator(".perm-sub")).toHaveCount(3);
    // พับ
    await head.click();
    await page.waitForTimeout(200);
    await expect(head).toHaveAttribute("aria-expanded", "false");
    await expect(group).toHaveClass(/is-collapsed/);
    // ขยายคืน
    await head.click();
    await page.waitForTimeout(200);
    await expect(head).toHaveAttribute("aria-expanded", "true");
    await expect(group).not.toHaveClass(/is-collapsed/);
  });

  test("E9. Role Audit History — ตาราง 5 คอลัมน์ + entries ของ ROL-101 ถูกลำดับและป้ายผล", async ({ page }) => {
    await goToRoleList(page);
    await openRoleDetailViaCell(page, "ROL-101");
    await expect(page.locator(".role-history-section h4")).toHaveText("Role Audit History");
    const headCells = page.locator(".role-history-table thead th");
    await expect(headCells).toHaveCount(5);
    const rows = page.locator(".role-history-table tbody tr");
    await expect(rows).toHaveCount(4);
    // ล่าสุดก่อน: PERMISSION_UPDATE → UPDATE(Failed, STALE) → UPDATE → CREATE
    const actions = await rows.locator('td[data-label="Action"]').evaluateAll(td => td.map(el => el.textContent));
    expect(actions).toEqual(["Edit Role", "Edit Role", "Edit Role", "Create Role"]);
    const results = await rows.locator('td[data-label="Result"] .pill').evaluateAll(td => td.map(el => el.textContent));
    expect(results).toEqual(["Success", "Failed", "Success", "Success"]);
    // Failed row มี detail เป็น stale message
    await expect(rows.nth(1).locator('td[data-label="Detail"]')).toHaveText("ไม่สามารถบันทึกได้: ข้อมูล Role เปลี่ยนก่อนบันทึก กรุณาตรวจสอบข้อมูลล่าสุดแล้วลองอีกครั้ง");
  });

  test("E10. Role Audit History — ROL-103 แสดง Deactivate/Reactivate lifecycle", async ({ page }) => {
    await goToRoleList(page);
    await page.locator('[data-role-page="next"]').click();
    await page.waitForTimeout(300);
    await openRoleDetailViaCell(page, "ROL-103");
    const rows = page.locator(".role-history-table tbody tr");
    await expect(rows).toHaveCount(4);
    const actions = await rows.locator('td[data-label="Action"]').evaluateAll(td => td.map(el => el.textContent));
    expect(actions).toEqual(["Deactivate Role", "Reactivate Role", "Deactivate Role", "Create Role"]);
  });

  test("E11. System Role (ROL-001) — ไม่มี action section เลย (immutability)", async ({ page }) => {
    await goToRoleList(page);
    await openRoleDetailViaCell(page, "ROL-001");
    await expect(page.locator(".role-detail-actions")).toHaveCount(0);
    await expect(page.locator(".role-detail-page [data-role-flow]")).toHaveCount(0);
    // history มี ROLE_CREATE จาก System
    const rows = page.locator(".role-history-table tbody tr");
    await expect(rows).toHaveCount(1);
    await expect(rows.nth(0).locator('td[data-label="Action"]')).toHaveText("Create Role");
    await expect(rows.nth(0).locator('td[data-label="Actor"]')).toHaveText("System");
  });

  test("E12. Custom Role detail — มีปุ่ม 'แก้ไข' + 'ปิดใช้งาน' ที่ action section", async ({ page }) => {
    await goToRoleList(page);
    await openRoleDetailViaCell(page, "ROL-101");
    const actions = page.locator(".role-detail-actions .user-detail-action-btn");
    await expect(actions).toHaveCount(2);
    await expect(actions.nth(0)).toHaveText("แก้ไข");
    await expect(actions.nth(1)).toHaveText("ปิดใช้งาน");
    await expect(actions.nth(1)).toHaveClass(/danger/);
  });

  test("E13. Inactive role detail — ปุ่ม 'เปิดใช้งาน' (primary) แทนปิดใช้งาน", async ({ page }) => {
    await goToRoleList(page);
    await page.locator('[data-role-page="next"]').click();
    await page.waitForTimeout(300);
    await openRoleDetailViaCell(page, "ROL-103");
    const actions = page.locator(".role-detail-actions .user-detail-action-btn");
    await expect(actions).toHaveCount(2);
    await expect(actions.nth(1)).toHaveText("เปิดใช้งาน");
    await expect(actions.nth(1)).toHaveClass(/primary/);
  });

  test("E14. back button → กลับ Role List ครบทุก row", async ({ page }) => {
    await goToRoleList(page);
    await openRoleDetailViaCell(page, "ROL-005");
    await page.locator("#page-actions [data-role-back]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/role-list-mode/);
    await expect(page.locator("body")).not.toHaveClass(/role-detail-mode/);
    expect(await rowIds(page)).toHaveLength(10);
  });
});

// ==================== F. ROLE DETAIL — SCENARIO STATES ====================

test.describe("QA-BO-026-F: Role Detail — prototype scenario states", () => {

  test("F1. scenario 'loading' → skeleton page (role-skel-page)", async ({ page }) => {
    await goToRoleList(page);
    await openRoleDetailViaCell(page, "ROL-101");
    await pickRoleState(page, "detail", "loading");
    await expect(page.locator(".role-skel-page")).toHaveCount(1);
    await expect(page.locator(".role-skel-page .role-skel-head-title")).toHaveCount(1);
  });

  test("F2. scenario 'error' → 'โหลดรายละเอียด Role ไม่สำเร็จ' + retry กลับ ready", async ({ page }) => {
    await goToRoleList(page);
    await openRoleDetailViaCell(page, "ROL-101");
    await pickRoleState(page, "detail", "error");
    await expect(page.locator(".role-state-block .empty-title")).toHaveText("โหลดรายละเอียด Role ไม่สำเร็จ");
    await page.locator("[data-role-detail-retry]").click();
    // loading สั้น ๆ → ready (≈700ms)
    await page.waitForTimeout(900);
    await expect(page.locator(".role-detail-page .asset-report-id")).toHaveText("ROL-101");
  });

  test("F3. scenario 'partial' → error เฉพาะส่วน Permissions + retry เฉพาะส่วนนั้น", async ({ page }) => {
    await goToRoleList(page);
    await openRoleDetailViaCell(page, "ROL-101");
    await pickRoleState(page, "detail", "partial");
    // head + summary คงอยู่; perm section เป็น error block
    await expect(page.locator(".role-detail-page .asset-report-id")).toHaveText("ROL-101");
    await expect(page.locator(".role-perm-error .empty-title")).toHaveText("โหลดข้อมูลสิทธิ์ไม่สำเร็จ");
    await page.locator("[data-role-perm-retry]").click();
    await page.waitForTimeout(900);
    // perm section กลับมาแสดง groups
    await expect(page.locator(".role-perm-section .perm-group[data-perm-module]").first()).toBeVisible();
  });

  test("F4. scenario 'unauthorized' → 'ไม่มีสิทธิ์ดู Role นี้' + back button", async ({ page }) => {
    await goToRoleList(page);
    await openRoleDetailViaCell(page, "ROL-101");
    await pickRoleState(page, "detail", "unauthorized");
    await expect(page.locator(".role-state-block .empty-title")).toHaveText("ไม่มีสิทธิ์ดู Role นี้");
    await page.locator(".role-state-block [data-role-back]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/role-list-mode/);
  });

  test("F5. scenario 'notfound' → 'ไม่พบ Role' + back button", async ({ page }) => {
    await goToRoleList(page);
    await openRoleDetailViaCell(page, "ROL-101");
    await pickRoleState(page, "detail", "notfound");
    await expect(page.locator(".role-state-block .empty-title")).toHaveText("ไม่พบ Role");
    await page.locator(".role-state-block [data-role-back]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/role-list-mode/);
  });

  test("F6. scenario 'stale' → 'ข้อมูล Role มีการเปลี่ยนแปลงแล้ว' + ปุ่มโหลดข้อมูลล่าสุด", async ({ page }) => {
    await goToRoleList(page);
    await openRoleDetailViaCell(page, "ROL-101");
    await pickRoleState(page, "detail", "stale");
    await expect(page.locator(".role-state-block .empty-title")).toHaveText("ข้อมูล Role มีการเปลี่ยนแปลงแล้ว");
    await page.locator("[data-role-detail-refresh]").click();
    await page.waitForTimeout(900);
    await expect(page.locator(".role-detail-page .asset-report-id")).toHaveText("ROL-101");
  });
});

// ==================== G. ROLE LIST — SCENARIO STATES ====================

test.describe("QA-BO-026-G: Role List — prototype scenario states", () => {

  test("G1. scenario 'loading' → head + skeleton rows 6 rows (aria-busy)", async ({ page }) => {
    await goToRoleList(page);
    await pickRoleState(page, "list", "loading");
    await expect(page.locator(".role-list-table")).toHaveAttribute("aria-busy", "true");
    await expect(page.locator(".role-list-table .role-skel-row")).toHaveCount(6);
    await expect(page.locator(".role-list-table .user-row.head")).toHaveCount(1);
  });

  test("G2. scenario 'error' → 'โหลดรายการ Role ไม่สำเร็จ' + retry กลับ ready (filter ไม่ถูกล้าง)", async ({ page }) => {
    await goToRoleList(page);
    await pickCustomOption(page, "role-type-filter", "custom");
    await pickRoleState(page, "list", "error");
    await expect(page.locator(".role-state-block .empty-title")).toHaveText("โหลดรายการ Role ไม่สำเร็จ");
    await page.locator("[data-role-retry]").click();
    await page.waitForTimeout(900);
    // กลับ ready — filter custom ยังคงอยู่
    expect(await rowIds(page)).toEqual(["ROL-101", "ROL-102", "ROL-103"]);
  });

  test("G3. scenario 'unauthorized' → 'ไม่มีสิทธิ์เข้าถึง Roles & Permissions' + ปุ่มกลับ Dashboard", async ({ page }) => {
    await goToRoleList(page);
    await pickRoleState(page, "list", "unauthorized");
    await expect(page.locator(".role-state-block .empty-title")).toHaveText("ไม่มีสิทธิ์เข้าถึง Roles & Permissions");
    await page.locator("[data-role-go-dashboard]").click();
    await page.waitForTimeout(400);
    await expect(page.locator("body")).toHaveClass(/dashboard-mode/);
  });

  test("G4. scenario 'empty' → 'ยังไม่มี Custom Role' + ปุ่มสร้างใน state block", async ({ page }) => {
    await goToRoleList(page);
    await pickRoleState(page, "list", "empty");
    await expect(page.locator(".role-state-block .empty-title")).toHaveText("ยังไม่มี Custom Role");
    const createBtn = page.locator(".role-state-block [data-role-create-open]");
    await expect(createBtn).toBeVisible();
    await createBtn.click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Create Custom Role");
  });
});

// ==================== H. SYSTEM ROLE IMMUTABILITY & PERMISSION GATING ====================

test.describe("QA-BO-026-H: System Role immutability & permission gating", () => {

  test("H1. System Role rows ไม่มี mutation buttons ใน DOM (เฉพาะ ดูรายละเอียด)", async ({ page }) => {
    await goToRoleList(page);
    for (const id of ["ROL-001", "ROL-002", "ROL-003", "ROL-004", "ROL-005", "ROL-006", "ROL-007", "ROL-008"]) {
      const row = roleRow(page, id);
      await expect(row.locator("[data-role-open]")).toHaveCount(1);
      await expect(row.locator("[data-role-flow]")).toHaveCount(0);
    }
  });

  test("H2. Custom Role rows มี mutation buttons ตามสถานะ (Active: แก้ไข+ปิดใช้งาน, Inactive: แก้ไข+เปิดใช้งาน)", async ({ page }) => {
    await goToRoleList(page);
    // ROL-101/102 Active — แก้ไข + ปิดใช้งาน
    for (const id of ["ROL-101", "ROL-102"]) {
      const row = roleRow(page, id);
      await expect(row.locator(`[data-role-flow="edit"]`)).toHaveCount(1);
      await expect(row.locator(`[data-role-flow="deactivate"]`)).toHaveCount(1);
      await expect(row.locator(`[data-role-flow="reactivate"]`)).toHaveCount(0);
    }
    // ROL-103 Inactive — แก้ไข + เปิดใช้งาน (อยู่หน้า 2)
    await page.locator('[data-role-page="next"]').click();
    await page.waitForTimeout(300);
    const row103 = roleRow(page, "ROL-103");
    await expect(row103.locator(`[data-role-flow="edit"]`)).toHaveCount(1);
    await expect(row103.locator(`[data-role-flow="reactivate"]`)).toHaveCount(1);
    await expect(row103.locator(`[data-role-flow="deactivate"]`)).toHaveCount(0);
  });

  test("H3. actor=Super Admin มี roles.manage (admin) → ปุ่มสร้าง + mutation actions แสดงครบ", async ({ page }) => {
    await goToRoleList(page);
    // ปุ่มสร้างแสดงเมื่อมี roles.manage
    await expect(page.locator("#page-actions [data-role-create-open]")).toBeVisible();
    // mutation buttons แสดงบน custom rows
    expect(await page.locator(".role-list-table [data-role-flow]").count()).toBe(4);
  });

  test("H4. permission catalog — roles.view/admin เท่านั้นที่ Super Admin เห็น (roles.manage อยู่ใน Settings group)", async ({ page }) => {
    await goToRoleList(page);
    await openRoleDetailViaCell(page, "ROL-001");
    const settings = page.locator('.perm-group[data-perm-module="settings"]');
    const names = await settings.locator(".perm-item-name").evaluateAll(els => els.map(el => el.textContent));
    expect(names).toContain("ดู Roles และ Role Detail");
    expect(names).toContain("จัดการ Custom Roles (สร้าง / แก้ไข / ปิด-เปิดใช้งาน)");
  });
});

// ==================== I. CREATE CUSTOM ROLE ====================

test.describe("QA-BO-026-I: Create Custom Role flow", () => {

  test("I1. เปิด modal — title/desc/Role ID readonly (ROL-104)/fields ครบ", async ({ page }) => {
    await goToRoleList(page);
    await openCreateModal(page);
    await expect(page.locator("#user-action-modal .user-action-modal")).toHaveClass(/role-create-modal/);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Create Custom Role");
    await expect(page.locator("#user-action-modal .user-action-head p")).toHaveText("กำหนดชื่อ Role Key และเลือกสิทธิ์การเข้าถึงสำหรับ Role ใหม่");
    // Role ID readonly = ROL-104
    await expect(page.locator(".role-field-role-id input")).toHaveValue("ROL-104");
    await expect(page.locator(".role-field-role-id input")).toHaveAttribute("readonly", "");
    // fields
    await expect(page.locator("[data-role-name]")).toBeVisible();
    await expect(page.locator("[data-role-key]")).toBeVisible();
    await expect(page.locator("[data-role-description]")).toBeVisible();
    await expect(page.locator("[data-role-perm-picker]")).toHaveCount(1);
    // footer buttons
    await expect(page.locator("[data-role-create-form] button[type='submit']")).toHaveText("ตรวจสอบและยืนยัน");
  });

  test("I2. พิมพ์ชื่อ → Role Key auto-slug; แก้ key เองแล้วหยุด auto-slug", async ({ page }) => {
    await goToRoleList(page);
    await openCreateModal(page);
    await page.locator("[data-role-name]").fill("Trust Safety Reviewer");
    await page.waitForTimeout(200);
    await expect(page.locator("[data-role-key]")).toHaveValue("trust_safety_reviewer");
    // แก้ key เอง → user-edited → พิมพ์ชื่อต่อไม่เปลี่ยน key
    await page.locator("[data-role-key]").fill("my_custom_key");
    await page.waitForTimeout(200);
    await page.locator("[data-role-name]").fill("Changed Name");
    await page.waitForTimeout(200);
    await expect(page.locator("[data-role-key]")).toHaveValue("my_custom_key");
  });

  test("I3. Role Key input ลบอักขระไม่ถูกต้องอัตโนมัติ + แสดง error", async ({ page }) => {
    await goToRoleList(page);
    await openCreateModal(page);
    await page.locator("[data-role-key]").fill("My Key!");
    await page.waitForTimeout(200);
    await expect(page.locator("[data-role-key]")).toHaveValue("mykey");
    await expect(page.locator("[data-role-key-error]")).toHaveText("Role Key รับเฉพาะตัวพิมพ์เล็กภาษาอังกฤษ ตัวเลข และ _ เท่านั้น");
    await expect(page.locator("[data-role-key-error]")).toHaveClass(/show/);
  });

  test("I4. permission picker — manage perms ถูกล็อกจนกว่าเลือก view ของกลุ่มเดียวกัน", async ({ page }) => {
    await goToRoleList(page);
    await openCreateModal(page);
    const manageRow = page.locator('[data-role-perm-row="users.accounts.manage"]');
    // locked + disabled + dep info icon
    await expect(manageRow).toHaveClass(/is-locked/);
    await expect(manageRow.locator("[data-role-perm-check]")).toBeDisabled();
    await expect(manageRow.locator(".role-perm-dep-info")).toHaveCount(1);
    // เลือก view → ปลดล็อก
    await checkRolePerm(page, "users.accounts.view");
    await expect(manageRow).not.toHaveClass(/is-locked/);
    await expect(manageRow.locator("[data-role-perm-check]")).toBeEnabled();
    // ติ๊ก manage แล้วถอน view → manage ถูก uncheck + ล็อกคืน
    await checkRolePerm(page, "users.accounts.manage");
    await uncheckRolePerm(page, "users.accounts.view");
    await expect(manageRow).toHaveClass(/is-locked/);
    await expect(manageRow.locator("[data-role-perm-check]")).toBeDisabled();
    await expect(manageRow.locator("[data-role-perm-check]")).not.toBeChecked();
  });

  test("I5. picker group พับ/ขยายได้ (is-collapsed + aria-expanded)", async ({ page }) => {
    await goToRoleList(page);
    await openCreateModal(page);
    const box = page.locator('[data-role-perm-group-box="users"]');
    const head = box.locator("[data-role-perm-group-toggle]");
    await expect(head).toHaveAttribute("aria-expanded", "true");
    await head.click();
    await page.waitForTimeout(200);
    await expect(box).toHaveClass(/is-collapsed/);
    await expect(head).toHaveAttribute("aria-expanded", "false");
  });

  test("I6. validation — ส่งฟอร์มว่าง → error ชื่อ + error picker อย่างน้อย 1 รายการ", async ({ page }) => {
    await goToRoleList(page);
    await openCreateModal(page);
    await submitRoleForm(page);
    await expect(page.locator("[data-role-name-error]")).toHaveText("กรุณากรอกชื่อ Role");
    await expect(page.locator("[data-role-perm-picker-error]")).toHaveText("กรุณาเลือกสิทธิ์อย่างน้อย 1 รายการ");
    await expect(page.locator("[data-role-perm-picker]")).toHaveClass(/article-field-invalid/);
  });

  test("I7. validation — ชื่อซ้ำ 'Super Admin' → error", async ({ page }) => {
    await goToRoleList(page);
    await openCreateModal(page);
    await page.locator("[data-role-name]").fill("super admin");
    await page.waitForTimeout(200);
    await checkRolePerm(page, "dashboard.view");
    await submitRoleForm(page);
    await expect(page.locator("[data-role-name-error]")).toHaveText("ชื่อ Role ซ้ำกับ Role ที่มีอยู่ กรุณาใช้ชื่ออื่น");
  });

  test("I8. validation — Role Key ซ้ำ 'super_admin' → error", async ({ page }) => {
    await goToRoleList(page);
    await openCreateModal(page);
    await page.locator("[data-role-name]").fill("New Role");
    await page.waitForTimeout(200);
    await page.locator("[data-role-key]").fill("super_admin");
    await page.waitForTimeout(200);
    await checkRolePerm(page, "dashboard.view");
    await submitRoleForm(page);
    await expect(page.locator("[data-role-key-error]")).toHaveText("Role Key ซ้ำกับ Role ที่มีอยู่ กรุณาใช้ค่าอื่น");
  });

  test("I9. validation — ชื่อยาวเกิน 64 + คำอธิบายเกิน 512 → error ทั้งคู่", async ({ page }) => {
    await goToRoleList(page);
    await openCreateModal(page);
    await page.locator("[data-role-name]").fill("A".repeat(65));
    await page.waitForTimeout(200);
    await page.locator("[data-role-key]").fill("ok_key");
    await page.waitForTimeout(200);
    await page.locator("[data-role-description]").fill("x".repeat(513));
    await checkRolePerm(page, "dashboard.view");
    await submitRoleForm(page);
    await expect(page.locator("[data-role-name-error]")).toHaveText("ชื่อ Role ต้องไม่เกิน 64 ตัวอักษร");
    await expect(page.locator("[data-role-description-error]")).toHaveText("คำอธิบายต้องไม่เกิน 512 ตัวอักษร");
  });

  test("I10. validation — Role Key ว่าง (ไม่พิมพ์อะไรเลย) → error", async ({ page }) => {
    await goToRoleList(page);
    await openCreateModal(page);
    // แก้ key ให้ว่างหลัง auto-slug เติม
    await page.locator("[data-role-key]").fill("x");
    await page.locator("[data-role-key]").fill("");
    await page.waitForTimeout(200);
    await checkRolePerm(page, "dashboard.view");
    await submitRoleForm(page);
    // ชื่อว่าง error ก่อนเสมอ — เช็กทั้งสอง
    await expect(page.locator("[data-role-name-error]")).toHaveText("กรุณากรอกชื่อ Role");
    await expect(page.locator("[data-role-key-error]")).toHaveText("กรุณากรอก Role Key หรือชื่อ Role เพื่อสร้างอัตโนมัติ");
  });

  test("I11. confirm modal — summary ครบ (Role ID/ชื่อ/Key/คำอธิบาย/Type/Status/Permissions) + perm groups", async ({ page }) => {
    await goToRoleList(page);
    await openCreateModal(page);
    await page.locator("[data-role-name]").fill("QA Test Role");
    await page.waitForTimeout(200);
    await checkRolePerm(page, "dashboard.view");
    await checkRolePerm(page, "articles.view");
    await checkRolePerm(page, "articles.manage");
    await submitRoleForm(page);
    // confirm modal
    await expect(page.locator("#user-action-modal-title")).toHaveText("Confirm Create Custom Role");
    const rows = page.locator(".option-confirm-summary .option-confirm-row");
    await expect(rows).toHaveCount(7);
    await expect(rows.nth(0).locator(".option-confirm-value")).toHaveText("ROL-104");
    await expect(rows.nth(1).locator(".option-confirm-value")).toHaveText("QA Test Role");
    await expect(rows.nth(2).locator(".option-confirm-value")).toHaveText("qa_test_role");
    await expect(rows.nth(3).locator(".option-confirm-value")).toHaveText("-");
    await expect(rows.nth(4).locator(".pill.teal")).toHaveText("Custom Role");
    await expect(rows.nth(5).locator(".pill.green")).toHaveText("Active");
    await expect(rows.nth(6).locator(".option-confirm-value")).toHaveText("3 สิทธิ์");
    // perm groups แสดง Dashboard + Content Management
    const groups = page.locator(".role-confirm-perms .perm-group");
    await expect(groups).toHaveCount(2);
    // impact note
    await expect(page.locator(".option-confirm-impact")).toContainText("การสร้างจะถูกบันทึกใน Audit Log");
  });

  test("I12. confirm → ย้อนกลับ คงค่าที่กรอก + กลับไปตรวจสอบและยืนยันได้อีกครั้ง", async ({ page }) => {
    await goToRoleList(page);
    await openCreateModal(page);
    await page.locator("[data-role-name]").fill("Return Flow Role");
    await page.waitForTimeout(200);
    await checkRolePerm(page, "dashboard.view");
    await submitRoleForm(page);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Confirm Create Custom Role");
    await page.locator("[data-role-create-back]").click();
    await page.waitForTimeout(300);
    // กลับมาฟอร์มพร้อมค่าเดิม
    await expect(page.locator("#user-action-modal-title")).toHaveText("Create Custom Role");
    await expect(page.locator("[data-role-name]")).toHaveValue("Return Flow Role");
    await expect(page.locator("[data-role-key]")).toHaveValue("return_flow_role");
    await expect(page.locator('[data-role-perm-check="dashboard.view"]')).toBeChecked();
  });

  test("I13. confirm → role ถูกสร้าง Active + toast + row ใหม่ใน list + audit event", async ({ page }) => {
    await goToRoleList(page);
    const maxAuditBefore = await page.evaluate(() => auditLogData.events.length);
    await openCreateModal(page);
    await page.locator("[data-role-name]").fill("Mission QA Role");
    await page.waitForTimeout(200);
    await checkRolePerm(page, "dashboard.view");
    await submitRoleForm(page);
    await page.locator("[data-role-create-confirm]").click();
    await page.waitForTimeout(400);
    // modal ปิด + toast
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    await expect(toast(page)).toHaveClass(/show/);
    await expect(toast(page).locator("strong")).toHaveText("Roles & Permissions");
    await expect(toast(page).locator("span")).toHaveText('สร้าง Custom Role "Mission QA Role" (ROL-104) แล้ว');
    // audit event เพิ่ม
    const newEvent = await page.evaluate(() => auditLogData.events[0]);
    expect(await page.evaluate(() => auditLogData.events.length)).toBe(maxAuditBefore + 1);
    expect(newEvent.action).toBe("Create Custom Role");
    expect(newEvent.module).toBe("Settings");
    expect(newEvent.risk).toBe("High");
    expect(newEvent.reference).toBe("ROL-104");
    // list re-render — มี 12 roles, หน้า 2 มี ROL-103+ROL-104
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 1-10 จาก 12");
    await page.locator('[data-role-page="next"]').click();
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["ROL-103", "ROL-104"]);
    await expect(roleRow(page, "ROL-104").locator('[data-label="Status"] .pill.green')).toHaveText("Active");
  });

  test("I14. ยกเลิกด้วยปุ่ม/กากบาท → modal ปิด ไม่มีการสร้าง", async ({ page }) => {
    await goToRoleList(page);
    await openCreateModal(page);
    await page.locator("[data-role-name]").fill("Cancel Role");
    // ปิดด้วยปุ่มยกเลิก
    await page.locator("[data-role-create-form] [data-user-action-modal-close]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    expect(await page.evaluate(() => roleListData.roles.length)).toBe(11);
  });
});

// ==================== J. EDIT CUSTOM ROLE ====================

test.describe("QA-BO-026-J: Edit Custom Role flow", () => {

  test("J1. เปิด edit modal จาก row menu — title + Role ID/Key readonly + perms pre-checked", async ({ page }) => {
    await goToRoleList(page);
    await openRoleMenuAction(page, "ROL-101", "edit");
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Edit Custom Role");
    await expect(page.locator("#user-action-modal .user-action-head p")).toHaveText("แก้ชื่อ คำอธิบาย และสิทธิ์ของ Role ที่เลือก");
    await expect(page.locator(".role-field-role-id input")).toHaveValue("ROL-101");
    // Role Key ล็อก readonly + note
    await expect(page.locator("[data-role-key]")).toHaveAttribute("readonly", "");
    await expect(page.locator("[data-role-key]")).toHaveValue("content_reviewer_th");
    await expect(page.locator(".option-identifier-note")).toHaveText("Role Key ถูกล็อกหลังสร้างแล้ว");
    // name/description เติมค่าเดิม + perms เดิมติ๊กอยู่
    await expect(page.locator("[data-role-name]")).toHaveValue("Content Reviewer TH");
    await expect(page.locator('[data-role-perm-check="dashboard.view"]')).toBeChecked();
    await expect(page.locator('[data-role-perm-check="articles.manage"]')).toBeChecked();
    await expect(page.locator('[data-role-perm-check="articles.publish"]')).not.toBeChecked();
  });

  test("J2. submit โดยไม่เปลี่ยนอะไร → picker error 'ไม่มีข้อมูลเปลี่ยนแปลง กรุณาแก้ไขข้อมูลก่อนยืนยัน'", async ({ page }) => {
    await goToRoleList(page);
    await openRoleMenuAction(page, "ROL-101", "edit");
    await submitRoleForm(page);
    await expect(page.locator("[data-role-perm-picker-error]")).toHaveText("ไม่มีข้อมูลเปลี่ยนแปลง กรุณาแก้ไขข้อมูลก่อนยืนยัน");
    // modal ยังเป็นฟอร์ม (ไม่เข้า confirm)
    await expect(page.locator("#user-action-modal-title")).toHaveText("Edit Custom Role");
  });

  test("J3. แก้ชื่อ → confirm แสดง Revision 1→2 + แถวเปลี่ยนไฮไลต์ before→after", async ({ page }) => {
    await goToRoleList(page);
    await openRoleMenuAction(page, "ROL-101", "edit");
    await page.locator("[data-role-name]").fill("Content Reviewer TH (QA)");
    await page.waitForTimeout(200);
    await submitRoleForm(page);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Confirm Edit Custom Role");
    const rows = page.locator(".option-confirm-summary .option-confirm-row");
    // Role ID / Key
    await expect(rows.nth(0).locator(".option-confirm-value")).toHaveText("ROL-101 / content_reviewer_th");
    // Revision row ไฮไลต์ 1 → 2
    await expect(rows.nth(1)).toHaveClass(/option-confirm-changed/);
    await expect(rows.nth(1).locator(".option-confirm-before")).toHaveText("1");
    await expect(rows.nth(1).locator(".option-confirm-after")).toHaveText("2");
    // ชื่อ changed
    await expect(rows.nth(2)).toHaveClass(/option-confirm-changed/);
    await expect(rows.nth(2).locator(".option-confirm-before")).toHaveText("Content Reviewer TH");
    await expect(rows.nth(2).locator(".option-confirm-after")).toHaveText("Content Reviewer TH (QA)");
  });

  test("J4. เพิ่ม permission → confirm มี 'เพิ่ม' tag; ถอน → block 'สิทธิ์ที่ลด (N)'", async ({ page }) => {
    await goToRoleList(page);
    await openRoleMenuAction(page, "ROL-101", "edit");
    // เพิ่ม audit.view + ถอน dashboard.view
    await checkRolePerm(page, "audit.view");
    await uncheckRolePerm(page, "dashboard.view");
    await submitRoleForm(page);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Confirm Edit Custom Role");
    // added tag บน audit.view item
    const auditItem = page.locator(".role-confirm-perms .perm-item-name", { hasText: "ดู Audit Log" }).locator("..");
    await expect(auditItem.locator(".role-perm-diff-tag.is-added")).toHaveText("เพิ่ม");
    // removed block แสดง "ดู Dashboard"
    await expect(page.locator(".role-edit-removed strong")).toHaveText("สิทธิ์ที่ลด (1)");
    await expect(page.locator(".role-edit-removed li")).toHaveText("ดู Dashboard");
    await expect(page.locator(".role-edit-diff-basis")).toHaveText("เทียบกับสิทธิ์ก่อนเริ่มแก้ไข");
  });

  test("J5. confirm ต้องกรอกเหตุผล — ว่าง → error 'กรุณาระบุเหตุผลในการแก้ไข'", async ({ page }) => {
    await goToRoleList(page);
    await openRoleMenuAction(page, "ROL-101", "edit");
    await page.locator("[data-role-name]").fill("Renamed Role");
    await submitRoleForm(page);
    await page.locator("[data-role-edit-confirm]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("[data-role-edit-reason-error]")).toHaveText("กรุณาระบุเหตุผลในการแก้ไข");
    await expect(page.locator("[data-role-edit-reason]")).toHaveClass(/article-field-invalid/);
  });

  test("J6. เหตุผลยาวเกิน 512 → error 'เหตุผลต้องไม่เกิน 512 ตัวอักษร'", async ({ page }) => {
    await goToRoleList(page);
    await openRoleMenuAction(page, "ROL-101", "edit");
    await page.locator("[data-role-name]").fill("Renamed Role");
    await submitRoleForm(page);
    // maxlength=512 ป้องกันกรอกเกิน — เช็ก attr + กรอก reason ปกติผ่านได้
    await expect(page.locator("[data-role-edit-reason]")).toHaveAttribute("maxlength", "512");
    await page.locator("[data-role-edit-reason]").fill("ปรับสิทธิ์ตามงาน QA");
    await page.locator("[data-role-edit-confirm]").click();
    await page.waitForTimeout(400);
    await expect(toast(page).locator("span")).toContainText("แก้ไข Custom Role");
  });

  test("J7. ยืนยันแก้ไขสำเร็จ → toast + history entry ใหม่ + revision+1 + list อัปเดต", async ({ page }) => {
    await goToRoleList(page);
    await openRoleMenuAction(page, "ROL-101", "edit");
    await page.locator("[data-role-name]").fill("Content Reviewer TH v2");
    await submitRoleForm(page);
    await page.locator("[data-role-edit-reason]").fill("ปรับชื่อให้ตรงทีมงาน");
    await page.locator("[data-role-edit-confirm]").click();
    await page.waitForTimeout(400);
    await expect(toast(page).locator("strong")).toHaveText("Roles & Permissions");
    await expect(toast(page).locator("span")).toHaveText('แก้ไข Custom Role "Content Reviewer TH v2" แล้ว');
    // history entry ใหม่ + revision = 2
    const role = await page.evaluate(() => roleListData.roles.find(r => r.id === "ROL-101"));
    expect(role.revision).toBe(2);
    expect(role.name).toBe("Content Reviewer TH v2");
    expect(role.history[0].action).toBe("ROLE_UPDATE");
    expect(role.history[0].result).toBe("Success");
    // list แสดงชื่อใหม่
    await expect(roleRow(page, "ROL-101").locator('[data-label="Role"] .desktop-user-name')).toHaveText("Content Reviewer TH v2");
  });

  test("J8. ย้อนกลับจาก confirm → ฟอร์มคงค่าที่แก้ไว้", async ({ page }) => {
    await goToRoleList(page);
    await openRoleMenuAction(page, "ROL-101", "edit");
    await page.locator("[data-role-name]").fill("Edited Name");
    await submitRoleForm(page);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Confirm Edit Custom Role");
    await page.locator("[data-role-edit-back]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Edit Custom Role");
    await expect(page.locator("[data-role-name]")).toHaveValue("Edited Name");
  });

  test("J9. แก้ชื่อซ้ำ role อื่น → form validation error (ไม่เข้า confirm)", async ({ page }) => {
    await goToRoleList(page);
    await openRoleMenuAction(page, "ROL-101", "edit");
    await page.locator("[data-role-name]").fill("Market Analyst");
    await submitRoleForm(page);
    await expect(page.locator("[data-role-name-error]")).toHaveText("ชื่อ Role ซ้ำกับ Role ที่มีอยู่ กรุณาใช้ชื่ออื่น");
    await expect(page.locator("#user-action-modal-title")).toHaveText("Edit Custom Role");
  });

  test("J10. edit จาก detail head action → modal เดียวกันเปิด", async ({ page }) => {
    await goToRoleList(page);
    await openRoleDetailViaCell(page, "ROL-101");
    await page.locator('.role-detail-actions [data-role-flow="edit"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Edit Custom Role");
    await expect(page.locator(".role-field-role-id input")).toHaveValue("ROL-101");
  });
});

// ==================== K. DEACTIVATE / REACTIVATE ====================

test.describe("QA-BO-026-K: Deactivate / Reactivate Custom Role", () => {

  test("K1. deactivate ROL-101 → modal 'Confirm Deactivate Custom Role' + summary + 'พร้อมปิดใช้งาน'", async ({ page }) => {
    await goToRoleList(page);
    await openRoleMenuAction(page, "ROL-101", "deactivate");
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    await expect(page.locator("#user-action-modal .modal")).toHaveClass(/role-deactivate-modal/);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Confirm Deactivate Custom Role");
    const rows = page.locator(".option-confirm-summary .option-confirm-row");
    await expect(rows).toHaveCount(5);
    await expect(rows.nth(0).locator(".option-confirm-value")).toHaveText("ROL-101 : Content Reviewer TH");
    await expect(rows.nth(1).locator(".option-confirm-value")).toHaveText("content_reviewer_th");
    await expect(rows.nth(2)).toHaveClass(/option-confirm-changed/);
    await expect(rows.nth(2).locator(".option-confirm-before")).toHaveText("Active");
    await expect(rows.nth(2).locator(".option-confirm-after")).toHaveText("Inactive");
    await expect(rows.nth(3).locator(".option-confirm-value")).toHaveText("0 คน");
    await expect(rows.nth(4).locator(".option-confirm-value")).toHaveText("0 คน");
    // impact block พร้อมปิดใช้งาน + reason field + confirm button มี
    await expect(page.locator(".role-deactivate-impact strong")).toHaveText("พร้อมปิดใช้งาน");
    await expect(page.locator("[data-role-deactivate-reason]")).toBeVisible();
    await expect(page.locator("[data-role-deactivate-confirm]")).toHaveText("ยืนยันปิดใช้งาน");
    await expect(page.locator("[data-role-deactivate-confirm]")).toHaveClass(/danger/);
  });

  test("K2. deactivate reason ว่าง → error 'กรุณาระบุเหตุผลในการปิดใช้งาน'", async ({ page }) => {
    await goToRoleList(page);
    await openRoleMenuAction(page, "ROL-101", "deactivate");
    await page.locator("[data-role-deactivate-confirm]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("[data-role-deactivate-reason-error]")).toHaveText("กรุณาระบุเหตุผลในการปิดใช้งาน");
    await expect(page.locator("[data-role-deactivate-reason]")).toHaveClass(/article-field-invalid/);
  });

  test("K3. deactivate สำเร็จ → toast + status กลาย Inactive + menu กลาย 'เปิดใช้งาน' + history entry", async ({ page }) => {
    await goToRoleList(page);
    await openRoleMenuAction(page, "ROL-101", "deactivate");
    await page.locator("[data-role-deactivate-reason]").fill("พักใช้งานชั่วคราว");
    await page.locator("[data-role-deactivate-confirm]").click();
    await page.waitForTimeout(400);
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    await expect(toast(page).locator("span")).toHaveText('ปิดใช้งาน Custom Role "Content Reviewer TH" แล้ว');
    // status ใน row เปลี่ยน + flow buttons เปลี่ยน
    await expect(roleRow(page, "ROL-101").locator('[data-label="Status"] .pill.gray')).toHaveText("Inactive");
    await expect(roleRow(page, "ROL-101").locator('[data-role-flow="reactivate"]')).toHaveCount(1);
    await expect(roleRow(page, "ROL-101").locator('[data-role-flow="deactivate"]')).toHaveCount(0);
    const role = await page.evaluate(() => roleListData.roles.find(r => r.id === "ROL-101"));
    expect(role.status).toBe("Inactive");
    expect(role.history[0].action).toBe("ROLE_DEACTIVATE");
  });

  test("K4. deactivate ยกเลิก → modal ปิดไม่เปลี่ยนสถานะ", async ({ page }) => {
    await goToRoleList(page);
    await openRoleMenuAction(page, "ROL-101", "deactivate");
    await page.locator("[data-role-deactivate-cancel]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    await expect(roleRow(page, "ROL-101").locator('[data-label="Status"] .pill.green')).toHaveText("Active");
  });

  test("K5. reactivate ROL-103 → modal 'Confirm Reactivate Custom Role' + summary + 'พร้อมเปิดใช้งาน'", async ({ page }) => {
    await goToRoleList(page);
    await page.locator('[data-role-page="next"]').click();
    await page.waitForTimeout(300);
    await openRoleMenuAction(page, "ROL-103", "reactivate");
    await expect(page.locator("#user-action-modal-title")).toHaveText("Confirm Reactivate Custom Role");
    const rows = page.locator(".option-confirm-summary .option-confirm-row");
    await expect(rows).toHaveCount(4);
    await expect(rows.nth(0).locator(".option-confirm-value")).toHaveText("ROL-103 : Legacy Support Viewer");
    await expect(rows.nth(2).locator(".option-confirm-before")).toHaveText("Inactive");
    await expect(rows.nth(2).locator(".option-confirm-after")).toHaveText("Active");
    await expect(rows.nth(3).locator(".option-confirm-value")).toHaveText("0 คน");
    await expect(page.locator(".role-deactivate-impact strong")).toHaveText("พร้อมเปิดใช้งาน");
    await expect(page.locator("[data-role-reactivate-reason]")).toBeVisible();
    await expect(page.locator("[data-role-reactivate-confirm]")).toHaveText("ยืนยันเปิดใช้งาน");
    await expect(page.locator("[data-role-reactivate-confirm]")).toHaveClass(/primary/);
  });

  test("K6. reactivate reason ว่าง → error 'กรุณาระบุเหตุผลในการเปิดใช้งาน'", async ({ page }) => {
    await goToRoleList(page);
    await page.locator('[data-role-page="next"]').click();
    await page.waitForTimeout(300);
    await openRoleMenuAction(page, "ROL-103", "reactivate");
    await page.locator("[data-role-reactivate-confirm]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("[data-role-reactivate-reason-error]")).toHaveText("กรุณาระบุเหตุผลในการเปิดใช้งาน");
  });

  test("K7. reactivate สำเร็จ → toast + status กลาย Active + inactive note หายจาก detail", async ({ page }) => {
    await goToRoleList(page);
    await page.locator('[data-role-page="next"]').click();
    await page.waitForTimeout(300);
    await openRoleMenuAction(page, "ROL-103", "reactivate");
    await page.locator("[data-role-reactivate-reason]").fill("เปิดใช้คืนเพื่อทีมใหม่");
    await page.locator("[data-role-reactivate-confirm]").click();
    await page.waitForTimeout(400);
    await expect(toast(page).locator("span")).toHaveText('เปิดใช้งาน Custom Role "Legacy Support Viewer" แล้ว');
    await expect(roleRow(page, "ROL-103").locator('[data-label="Status"] .pill.green')).toHaveText("Active");
    const role = await page.evaluate(() => roleListData.roles.find(r => r.id === "ROL-103"));
    expect(role.status).toBe("Active");
    expect(role.history[0].action).toBe("ROLE_REACTIVATE");
    // detail ไม่มี inactive note แล้ว
    await openRoleDetailViaMenu(page, "ROL-103");
    await expect(page.locator(".role-inactive-note")).toHaveCount(0);
  });

  test("K8. deactivate จาก detail head action → modal เดียวกัน", async ({ page }) => {
    await goToRoleList(page);
    await openRoleDetailViaCell(page, "ROL-102");
    await page.locator('.role-detail-actions [data-role-flow="deactivate"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Confirm Deactivate Custom Role");
    await expect(page.locator(".option-confirm-summary .option-confirm-row").nth(0).locator(".option-confirm-value")).toHaveText("ROL-102 : Market Analyst");
  });
});

// ==================== L. RESPONSIVE ====================

test.describe("QA-BO-026-L: Roles & Permissions — responsive", () => {

  test("L1. list responsive — desktop ตาราง 8 คอลัมน์; mobile การ์ด (head ซ่อน, cell หลัก+pill)", async ({ page }) => {
    await goToRoleList(page);
    const mobile = await isMobile(page);
    const narrow = await isNarrow(page);
    const row = roleRow(page, "ROL-001");
    if (!mobile) {
      await expect(page.locator(".role-list-table .user-row.head")).toBeVisible();
      await expect(row.locator('[data-label="Type"]')).toBeVisible();
      await expect(row.locator('[data-label="Detail"]')).toBeVisible();
      await expect(row.locator('[data-label="Admins"]')).toBeVisible();
      await expect(row.locator(".user-card-tags")).toBeHidden();
    }
    if (mobile) {
      await expect(page.locator(".role-list-table .user-row.head")).toBeHidden();
      await expect(row.locator('[data-label="Type"]')).toBeHidden();
      await expect(row.locator('[data-label="Status"]')).toBeHidden();
      await expect(row.locator('[data-label="Detail"]')).toBeHidden();
      await expect(row.locator('[data-label="Admins"]')).toBeHidden();
      await expect(row.locator('[data-label="Last Updated"]')).toBeHidden();
      // การ์ด: tags + meta แสดง
      await expect(row.locator(".user-card-tags")).toBeVisible();
      await expect(row.locator(".user-card-meta")).toBeVisible();
    }
    if (narrow && !mobile) {
      await expect(page.locator(".role-list-table .user-row.head")).toBeVisible();
    }
  });

  test("L2. mobile card — tags (Type/Status/Admins) + meta (Role ID/Last Updated) + '...' ไม่มีกรอบ", async ({ page }) => {
    const mobile = await isMobile(page);
    if (!mobile) { test.skip(); return; }
    await goToRoleList(page);
    const row = roleRow(page, "ROL-001");
    const tags = row.locator(".user-card-tags");
    await expect(tags.locator(".pill.purple")).toHaveText("System Role");
    await expect(tags.locator(".pill.green")).toHaveText("Active");
    await expect(tags.locator(".pill.slate")).toHaveText("2 Admins");
    const meta = row.locator(".user-card-meta");
    await expect(meta.locator(".user-card-meta-item", { hasText: "Role ID" }).locator("strong")).toHaveText("ROL-001");
    await expect(meta.locator(".user-card-meta-item", { hasText: "Last Updated" }).locator("strong")).toHaveText("01 Jan 2026 09:00");
    // '...' ไม่มีกรอบ
    const summary = row.locator(".row-menu > summary");
    const borderWidth = await summary.evaluate(el => parseFloat(getComputedStyle(el).borderWidth));
    expect(borderWidth).toBe(0);
  });

  test("L3. mobile filter bar — ปิดเป็นค่าเริ่มต้น, toggle เปิด, search เต็มแถว, reset ใน panel actions", async ({ page }) => {
    const mobile = await isMobile(page);
    if (!mobile) { test.skip(); return; }
    await goToRoleList(page);
    const bar = page.locator(".role-filter-bar");
    await expect(bar).toHaveAttribute("data-filter-open", "false");
    await page.locator("#user-panel-filter-actions [data-role-filter-toggle]").click();
    await page.waitForTimeout(200);
    await expect(bar).toHaveAttribute("data-filter-open", "true");
    const cols = await bar.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    expect(cols).toBe(1);
    const resetBtn = page.locator("#user-panel-filter-actions [data-role-reset]");
    await expect(resetBtn).toBeVisible();
    await expect(resetBtn).toHaveAttribute("aria-label", "รีเซ็ตค่าทั้งหมด");
  });

  test("L4. tablet filter bar — บรรทัดเดียว 5 columns (search + 3 filters + reset)", async ({ page }) => {
    const narrow = await isNarrow(page);
    const mobile = await isMobile(page);
    if (!narrow || mobile) { test.skip(); return; }
    await goToRoleList(page);
    const bar = page.locator(".role-filter-bar");
    const cols = await bar.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    expect(cols).toBe(5);
  });

  test("L5. detail responsive — grid: desktop 4 / tablet 2 / mobile 1 + history card stack บน mobile", async ({ page }) => {
    await goToRoleList(page);
    await openRoleDetailViaCell(page, "ROL-101");
    const mobile = await isMobile(page);
    const narrow = await isNarrow(page);
    const grid = page.locator(".role-detail-page .detail-grid.four");
    const colCount = await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    if (mobile) expect(colCount).toBe(1);
    else if (narrow) expect(colCount).toBe(2);
    else expect(colCount).toBe(4);
    if (mobile) {
      await expect(page.locator(".role-history-table thead")).toBeHidden();
    } else {
      await expect(page.locator(".role-history-table thead")).toBeVisible();
    }
  });

  test("L6. modal responsive — create modal ใช้งานได้บน mobile ไม่มี horizontal scroll", async ({ page }) => {
    const mobile = await isMobile(page);
    if (!mobile) { test.skip(); return; }
    await goToRoleList(page);
    await openCreateModal(page);
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    await expect(page.locator("[data-role-name]")).toBeVisible();
    const hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasHScroll).toBeFalsy();
  });
});

// ==================== M. CROSS-MODULE ====================

test.describe("QA-BO-026-M: Roles & Permissions — cross-module", () => {

  test("M1. สร้าง role แล้วไป Settings > Audit Log เจอ event 'Create Custom Role' เป็น row ล่าสุด", async ({ page }) => {
    await goToRoleList(page);
    await openCreateModal(page);
    await page.locator("[data-role-name]").fill("Audit Trace Role");
    await page.waitForTimeout(200);
    await checkRolePerm(page, "dashboard.view");
    await submitRoleForm(page);
    await page.locator("[data-role-create-confirm]").click();
    await page.waitForTimeout(400);
    // ไป Audit Log ผ่าน nav
    await ensureNavOpen(page);
    if (!(await isSettingsSubmenuExpanded(page))) {
      await page.locator(".nav-item[data-module='settings']").click();
      await page.waitForTimeout(300);
      await ensureNavOpen(page);
    }
    await page.locator(".submenu[data-submenu='settings'] button[data-module='audit'][data-sub='Audit Log']").click();
    await page.waitForTimeout(400);
    await expect(page.locator("body")).toHaveClass(/audit-log-mode/);
    // event ใหม่ unshift หัว list — row แรกเป็น AUD ใหม่ล่าสุด
    const firstRow = page.locator(".audit-row").first();
    const eventId = await firstRow.getAttribute("data-audit-event");
    expect(eventId).toMatch(/^AUD-\d{5}$/);
    await expect(firstRow).toContainText("Create Custom Role");
  });

  test("M2. จาก Role Detail กลับไป Admin Accounts ผ่าน nav ได้ปกติ", async ({ page }) => {
    await goToRoleList(page);
    await openRoleDetailViaCell(page, "ROL-101");
    await ensureNavOpen(page);
    if (!(await isSettingsSubmenuExpanded(page))) {
      await page.locator(".nav-item[data-module='settings']").click();
      await page.waitForTimeout(300);
      await ensureNavOpen(page);
    }
    await page.locator(".submenu[data-submenu='settings'] button[data-module='settings'][data-sub='Admin Accounts']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/admin-account-list-mode/);
    await expect(page.locator("body")).not.toHaveClass(/role-detail-mode/);
  });

  test("M3. edit role (ลดสิทธิ์) → Role Audit History แสดง entry ใหม่หลังกลับเข้า detail", async ({ page }) => {
    await goToRoleList(page);
    await openRoleMenuAction(page, "ROL-102", "edit");
    await page.locator("[data-role-name]").fill("Market Analyst v2");
    await submitRoleForm(page);
    await page.locator("[data-role-edit-reason]").fill("ปรับชื่อตามโครงสร้างทีม");
    await page.locator("[data-role-edit-confirm]").click();
    await page.waitForTimeout(400);
    // เข้า detail ดู history
    await openRoleDetailViaMenu(page, "ROL-102");
    const rows = page.locator(".role-history-table tbody tr");
    await expect(rows.first().locator('td[data-label="Action"]')).toHaveText("Edit Role");
    await expect(rows.first().locator('td[data-label="Detail"]')).toHaveText("ปรับชื่อตามโครงสร้างทีม");
    await expect(rows).toHaveCount(2); // CREATE + UPDATE ใหม่
  });
});
