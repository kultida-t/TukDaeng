// QA-BO-008: Option Master (Group List, Option Detail, modals, audit, reorder) — strict Playwright spec
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล, spec docs (17_OPTION_MASTER_MODULE.md) เป็นหลักสำหรับพฤติกรรม
// เป้าหมาย: รันเทส เจอปัญหาจริง → ลิสปัญหา + แนวทางแก้ → แก้ใน flow เดียว (ห้ามแก้ prototype)
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

// helper: ไปหน้า Option Master (Group List) ผ่านเมนู
async function goToOptionMaster(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  await page.locator(".nav-item[data-module='option-master']").click();
  await page.waitForTimeout(300);
}

// helper: เข้า Option Detail ของ group (คลิกแถว primary cell)
async function goToOptionDetail(page, groupId) {
  await goToOptionMaster(page);
  await page.locator(`.asset-row[data-option-group="${groupId}"] .asset-cell-primary`).click();
  await page.waitForTimeout(300);
}

// helper: เปิด filter bar ถ้ายังปิด (advanced filter ถูกซ่อนบน mobile เมื่อ data-filter-open="false")
async function openFilterBar(page, mode) {
  const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
  if (!isMobile) return;
  const toggleAttr = mode === "group" ? "[data-option-group-filter-toggle]" : "[data-option-detail-filter-toggle]";
  const barClass = mode === "group" ? ".user-filter-bar.option-group-filter-bar" : ".user-filter-bar.option-detail-filter-bar";
  const bar = page.locator(barClass);
  const isOpen = await bar.getAttribute("data-filter-open");
  if (isOpen === "false") {
    await page.locator(toggleAttr).click();
    await page.waitForTimeout(200);
  }
}

// helper: เลือก option ใน custom-select (ผ่าน UI จริง: เปิด trigger → กด option)
async function pickCustomOption(page, inputId, value) {
  await page
    .locator(`div[data-custom-select]:has(> #${inputId}) [data-custom-select-trigger]`)
    .click();
  await page.waitForTimeout(150);
  await page
    .locator(`div[data-custom-select]:has(> #${inputId}) [data-custom-select-option][data-value="${value}"]`)
    .click();
  await page.waitForTimeout(200);
}

// helper: เปิด row menu ของ group
async function openGroupRowMenu(page, groupId) {
  await page.locator(`.asset-row[data-option-group="${groupId}"] .row-menu > summary`).click();
  await page.waitForTimeout(200);
}

// helper: เปิด row menu ของ option ในหน้า detail
async function openOptionRowMenu(page, optionId) {
  await page.locator(`.asset-row[data-option-view="${optionId}"] .row-menu > summary`).click();
  await page.waitForTimeout(200);
}

// helper: ปิด modal
async function closeModal(page) {
  await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
  await page.waitForTimeout(200);
}

// helper: นับจำนวนคอลัมน์ที่ effective ของแถวแรก (grid-template-columns อาจออกเป็น px)
async function getEffectiveColumnCount(page, rowSelector) {
  return page.evaluate((sel) => {
    const row = document.querySelector(sel);
    if (!row) return 0;
    const cols = getComputedStyle(row).gridTemplateColumns.split(" ").filter(Boolean);
    return cols.length;
  }, rowSelector);
}

// helper: ขยับ item ใน reorder modal — จำลอง HTML5 drag event ครบวงจร (dragstart → dragover → drop → dragend)
// ผ่าน handler จริงของ prototype (desktop drag / mobile ปุ่มลูกศรตาม media query)
async function moveReorderItem(page, itemDataAttr, fromIndex, direction) {
  const targetIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
  await page.evaluate(({ attr, from, to }) => {
    const list = document.querySelector("[data-option-order-list], [data-option-group-order-list]");
    const items = [...list.querySelectorAll("[data-option-order-item], [data-option-group-order-item]")];
    const source = items[from];
    const target = items[to];
    const rect = target.getBoundingClientRect();
    const clientY = from < to ? rect.bottom - 4 : rect.top + 4;
    const init = {
      bubbles: true, cancelable: true, dataTransfer: new DataTransfer(),
      clientX: rect.left + rect.width / 2, clientY
    };
    source.dispatchEvent(new DragEvent("dragstart", init));
    target.dispatchEvent(new DragEvent("dragover", init));
    list.dispatchEvent(new DragEvent("drop", init));
    source.dispatchEvent(new DragEvent("dragend", init));
  }, { attr: itemDataAttr, from: fromIndex, to: targetIndex });
  await page.waitForTimeout(200);
}

// ==================== A. NAVIGATION & MENU ====================

test.describe("Option Master — navigation & menu", () => {
  test("1. เมนู Option Master แสดงและคลิกเข้า Group List ได้", async ({ page }) => {
    await goToOptionMaster(page);
    await expect(page.locator("body")).toHaveClass(/option-master-mode/);
    await expect(page.locator("body")).toHaveClass(/option-group-list-mode/);
  });

  test("2. breadcrumb + page title + panel title ถูกต้อง", async ({ page }) => {
    await goToOptionMaster(page);
    await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Option Master");
    await expect(page.locator("#page-title")).toHaveText("Option Master");
    await expect(page.locator("#panel-title")).toHaveText("Option Groups");
  });

  test("3. nav item option-master มี active state", async ({ page }) => {
    await goToOptionMaster(page);
    const isActive = await page.evaluate(() => {
      const el = document.querySelector(".nav-item[data-module='option-master']");
      return el ? el.classList.contains("active") || el.classList.contains("expanded") || el.querySelector(".active") !== null : false;
    });
    expect(isActive).toBeTruthy();
  });
});

// ==================== B. OPTION GROUP LIST — RENDERING ====================

test.describe("Option Group List — rendering", () => {
  test("4. ตารางมี 10 คอลัมน์ head ครบ", async ({ page }) => {
    await goToOptionMaster(page);
    const headCells = page.locator(".option-group-table .asset-row.head > div");
    await expect(headCells).toHaveCount(10);
    await expect(page.locator(".option-group-table .asset-row.head")).toContainText("Group ID");
    await expect(page.locator(".option-group-table .asset-row.head")).toContainText("Group Key");
    await expect(page.locator(".option-group-table .asset-row.head")).toContainText("Label (TH)");
    await expect(page.locator(".option-group-table .asset-row.head")).toContainText("Label (EN)");
    await expect(page.locator(".option-group-table .asset-row.head")).toContainText("Active Options");
    await expect(page.locator(".option-group-table .asset-row.head")).toContainText("Multi-select");
    await expect(page.locator(".option-group-table .asset-row.head")).toContainText("System");
    await expect(page.locator(".option-group-table .asset-row.head")).toContainText("Status");
    await expect(page.locator(".option-group-table .asset-row.head")).toContainText("Updated");
    await expect(page.locator(".option-group-table .asset-row.head")).toContainText("Action");
  });

  test("5. แสดง 8 group ครบ (OG-001..OG-008)", async ({ page }) => {
    await goToOptionMaster(page);
    const rows = page.locator(".option-group-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(8);
    for (let i = 1; i <= 8; i++) {
      await expect(page.locator(`.asset-row[data-option-group="OG-00${i}"]`)).toBeVisible();
    }
  });

  test("6. แถว OG-001 แสดงข้อมูลครบ (key, labels, active count, multi, system, status, updated)", async ({ page }) => {
    await goToOptionMaster(page);
    const row = page.locator(".asset-row[data-option-group='OG-001']");
    await expect(row.locator("[data-label='Group ID'] .main-text")).toHaveText("OG-001");
    await expect(row.locator("[data-label='Group Key'] .main-text")).toHaveText("condition");
    await expect(row.locator("[data-label='Label (TH)'] .main-text")).toContainText("สภาพ");
    await expect(row.locator("[data-label='Label (EN)'] .main-text")).toHaveText("Condition");
    await expect(row.locator("[data-label='Active Options'] .main-text")).toHaveText("7/7");
    await expect(row.locator("[data-label='Multi-select'] .main-text")).toHaveText("No");
    await expect(row.locator("[data-label='System']")).toContainText("System");
    await expect(row.locator("[data-label='Status'] .pill")).toContainText("Active");
    await expect(row.locator("[data-label='Updated'] .main-text")).toHaveText("12 Jul 2026 09:15");
  });

  test("7. status pill: Active = green, Inactive = gray", async ({ page }) => {
    await goToOptionMaster(page);
    await expect(page.locator(".asset-row[data-option-group='OG-001'] .pill.green").first()).toContainText("Active");
    await expect(page.locator(".asset-row[data-option-group='OG-007'] .pill.gray").first()).toContainText("Inactive");
  });

  test("8. Multi-select: OG-002 = Yes, OG-001 = No", async ({ page }) => {
    await goToOptionMaster(page);
    await expect(page.locator(".asset-row[data-option-group='OG-002'] [data-label='Multi-select'] .main-text")).toHaveText("Yes");
    await expect(page.locator(".asset-row[data-option-group='OG-001'] [data-label='Multi-select'] .main-text")).toHaveText("No");
  });

  test("9. Active Options: OG-005 (dial_color) = 18/18, OG-003 = 13/13", async ({ page }) => {
    await goToOptionMaster(page);
    await expect(page.locator(".asset-row[data-option-group='OG-005'] [data-label='Active Options'] .main-text")).toHaveText("18/18");
    await expect(page.locator(".asset-row[data-option-group='OG-003'] [data-label='Active Options'] .main-text")).toHaveText("13/13");
  });

  test("10. Updated ของ inactive group (OG-007) = วันที่ deactivate", async ({ page }) => {
    await goToOptionMaster(page);
    await expect(page.locator(".asset-row[data-option-group='OG-007'] [data-label='Updated'] .main-text")).toHaveText("14 Jul 2026 11:00");
  });

  test("11. footer-range แสดง 'แสดง 1-8 จาก 8' (8 กลุ่ม < 10/page)", async ({ page }) => {
    await goToOptionMaster(page);
    await expect(page.locator("#table > .footer-range span").first()).toContainText("แสดง 1-8 จาก 8");
  });

  test("12. page actions มีปุ่ม 'จัดเรียง' + 'เพิ่ม Group' (active group ≥ 2)", async ({ page }) => {
    await goToOptionMaster(page);
    await expect(page.locator("[data-option-group-reorder-open]")).toBeVisible();
    await expect(page.locator("[data-option-group-add-open]")).toBeVisible();
  });
});

// ==================== C. GROUP LIST — SEARCH / FILTER / RESET / PAGINATION ====================

test.describe("Option Group List — search / filter / reset / pagination", () => {
  test("13. ค้นหา 'condition' เจอ 1 แถว", async ({ page }) => {
    await goToOptionMaster(page);
    await page.locator("#option-group-search").fill("condition");
    await page.waitForTimeout(300);
    const rows = page.locator(".option-group-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toHaveAttribute("data-option-group", "OG-001");
  });

  test("14. ค้นหาด้วย Group ID 'OG-008' เจอ 1 แถว", async ({ page }) => {
    await goToOptionMaster(page);
    await page.locator("#option-group-search").fill("OG-008");
    await page.waitForTimeout(300);
    const rows = page.locator(".option-group-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toHaveAttribute("data-option-group", "OG-008");
  });

  test("15. ค้นหาด้วย Label (TH) 'สภาพ' เจอ 1 แถว", async ({ page }) => {
    await goToOptionMaster(page);
    await page.locator("#option-group-search").fill("สภาพ");
    await page.waitForTimeout(300);
    const rows = page.locator(".option-group-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toHaveAttribute("data-option-group", "OG-001");
  });

  test("16. ค้นหาไม่เจอ → empty state 'ไม่พบข้อมูล'", async ({ page }) => {
    await goToOptionMaster(page);
    await page.locator("#option-group-search").fill("zzz-not-exist");
    await page.waitForTimeout(300);
    await expect(page.locator(".option-group-table .detail-empty")).toContainText("ไม่พบข้อมูล");
  });

  test("17. filter status = Active เจอ 6 แถว", async ({ page }) => {
    await goToOptionMaster(page);
    await openFilterBar(page, "group");
    await pickCustomOption(page, "option-group-status-filter", "active");
    await page.waitForTimeout(300);
    await expect(page.locator(".option-group-table .asset-row:not(.head)")).toHaveCount(6);
  });

  test("18. filter status = Inactive เจอ 2 แถว (OG-007, OG-008)", async ({ page }) => {
    await goToOptionMaster(page);
    await openFilterBar(page, "group");
    await pickCustomOption(page, "option-group-status-filter", "inactive");
    await page.waitForTimeout(300);
    const rows = page.locator(".option-group-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(2);
    await expect(rows.first()).toHaveAttribute("data-option-group", "OG-007");
    await expect(rows.nth(1)).toHaveAttribute("data-option-group", "OG-008");
  });

  test("19. reset ล้าง search + filter กลับค่า default", async ({ page }) => {
    await goToOptionMaster(page);
    await page.locator("#option-group-search").fill("condition");
    await page.waitForTimeout(200);
    await openFilterBar(page, "group");
    await pickCustomOption(page, "option-group-status-filter", "inactive");
    await page.waitForTimeout(200);
    await page.locator("[data-option-group-reset]:visible").first().click();
    await page.waitForTimeout(300);
    await expect(page.locator(".option-group-table .asset-row:not(.head)")).toHaveCount(8);
    await expect(page.locator("#option-group-search")).toHaveValue("");
  });

  test("20. pagination: 8 แถว < 10/page → 1 หน้า, prev disabled", async ({ page }) => {
    await goToOptionMaster(page);
    await expect(page.locator("#table .pager-num.active")).toHaveText("1");
    await expect(page.locator("#table .pager-prev")).toBeDisabled();
    await expect(page.locator("#table .pager-next")).toBeDisabled();
  });
});

// ==================== C. GROUP LIST — ROW CLICK + ACTION MENU ====================

test.describe("Option Group List — row click + action menu", () => {
  test("21. คลิกแถว OG-001 → เข้า Option Detail ของ condition", async ({ page }) => {
    await goToOptionMaster(page);
    await page.locator(".asset-row[data-option-group='OG-001'] .asset-cell-primary").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/option-detail-mode/);
    await expect(page.locator("#page-title")).toHaveText("condition");
  });

  test("22. row menu OG-001 (Active + ใช้ใน asset): ดูรายละเอียด, แก้ไข, ดู Audit Log — ไม่มี ปิดใช้งาน/ลบ", async ({ page }) => {
    await goToOptionMaster(page);
    await openGroupRowMenu(page, "OG-001");
    const menu = page.locator(".asset-row[data-option-group='OG-001'] .row-menu-list");
    await expect(menu.locator("[data-option-group-view='OG-001']")).toBeVisible();
    await expect(menu.locator("[data-option-group-edit='OG-001']")).toBeVisible();
    await expect(menu.locator("[data-option-group-audit-open='OG-001']")).toBeVisible();
    await expect(menu.locator("[data-option-group-deactivate]")).toHaveCount(0);
    await expect(menu.locator("[data-option-group-delete]")).toHaveCount(0);
  });

  test("23. row menu OG-007 (Inactive + ไม่ใช้ใน asset): เปิดใช้งาน + ลบ + ดู Audit Log", async ({ page }) => {
    await goToOptionMaster(page);
    await openGroupRowMenu(page, "OG-007");
    const menu = page.locator(".asset-row[data-option-group='OG-007'] .row-menu-list");
    await expect(menu.locator("[data-option-group-reactivate='OG-007']")).toBeVisible();
    await expect(menu.locator("[data-option-group-delete='OG-007']")).toBeVisible();
    await expect(menu.locator("[data-option-group-audit-open='OG-007']")).toBeVisible();
    await expect(menu.locator("[data-option-group-deactivate]")).toHaveCount(0);
  });

  test("24. row menu OG-008 (Inactive + ใช้ใน asset): เปิดใช้งาน แต่ไม่มี ลบ", async ({ page }) => {
    await goToOptionMaster(page);
    await openGroupRowMenu(page, "OG-008");
    const menu = page.locator(".asset-row[data-option-group='OG-008'] .row-menu-list");
    await expect(menu.locator("[data-option-group-reactivate='OG-008']")).toBeVisible();
    await expect(menu.locator("[data-option-group-delete]")).toHaveCount(0);
  });

  test("25. กด 'ดูรายละเอียด' → เข้า Option Detail", async ({ page }) => {
    await goToOptionMaster(page);
    await openGroupRowMenu(page, "OG-002");
    await page.locator(".asset-row[data-option-group='OG-002'] .row-menu-list [data-option-group-view='OG-002']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/option-detail-mode/);
    await expect(page.locator("#page-title")).toHaveText("delivery");
  });

  test("26. คลิกแถว (นอกปุ่ม) → เข้า Option Detail", async ({ page }) => {
    await goToOptionMaster(page);
    await page.locator(".asset-row[data-option-group='OG-003'] .asset-cell-primary").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#page-title")).toHaveText("case_material");
  });
});

// ==================== D. GROUP LIST — MOBILE CARD ====================

test.describe("Option Group List — mobile card layout", () => {
  test("27. mobile (390): head ซ่อน, card 1 คอลัมน์, คง Group ID/Key/labels/Updated", async ({ page, isMobile }) => {
    test.skip(!isMobile, "เฉพาะ mobile");
    await goToOptionMaster(page);
    await expect(page.locator(".option-group-table .asset-row.head")).toBeHidden();
    const row = page.locator(".asset-row[data-option-group='OG-001']");
    await expect(row.locator(".mobile-user-card-title")).toHaveText("OG-001");
    await expect(row.locator(".asset-card-tags")).toContainText("7/7 active");
    await expect(row.locator(".asset-card-tags")).toContainText("Multi-select");
    await expect(row.locator(".asset-card-tags")).toContainText("System");
    const meta = row.locator(".user-card-meta");
    await expect(meta).toContainText("condition");
    await expect(meta).toContainText("สภาพ");
    await expect(meta).toContainText("Condition");
  });

  test("28. mobile: row menu (...) ยังกดได้ และมีปุ่มครบ", async ({ page }) => {
    const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    test.skip(!isMobile, "เฉพาะ mobile");
    await goToOptionMaster(page);
    await openGroupRowMenu(page, "OG-001");
    const menu = page.locator(".asset-row[data-option-group='OG-001'] .row-menu-list");
    await expect(menu.locator("[data-option-group-view='OG-001']")).toBeVisible();
  });

  test("29. desktop: ตาราง head แสดงปกติ (ไม่ใช่ card)", async ({ page }) => {
    test.skip(test.info().project.name !== "desktop-1440", "เฉพาะ desktop");
    await goToOptionMaster(page);
    await expect(page.locator(".option-group-table .asset-row.head")).toBeVisible();
    const colCount = await getEffectiveColumnCount(page, ".option-group-table .asset-row.head");
    expect(colCount).toBeGreaterThan(1);
  });
});

// ==================== E. OPTION DETAIL — HEADER / BREADCRUMB / BACK ====================

test.describe("Option Detail — header, breadcrumb, back", () => {
  test("30. คลิกแถว OG-001 → body option-detail-mode + breadcrumb 'การดำเนินงาน / Option Master / condition'", async ({ page }) => {
    await goToOptionMaster(page);
    await page.locator(".asset-row[data-option-group='OG-001'] .asset-cell-primary").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/option-detail-mode/);
    await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Option Master / condition");
  });

  test("31. page title = group key, panel title = 'Options (7)'", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await expect(page.locator("#page-title")).toHaveText("condition");
    await expect(page.locator("#panel-title")).toHaveText("Options (7)");
  });

  test("32. page actions มี 'จัดเรียง' + 'เพิ่ม Option' + back button", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await expect(page.locator("[data-option-reorder-open]")).toBeVisible();
    await expect(page.locator("[data-option-add-open]")).toBeVisible();
    await expect(page.locator("[data-back-option-groups]")).toBeVisible();
  });

  test("33. กด Back to Option Groups → กลับ Group List (breadcrumb + body class)", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await page.locator("[data-back-option-groups]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/option-group-list-mode/);
    await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Option Master");
  });

  test("34. filter toggle แสดงและกดสลับได้ (mobile)", async ({ page }) => {
    const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    test.skip(!isMobile, "เฉพาะ mobile");
    await goToOptionDetail(page, "OG-001");
    const bar = page.locator(".user-filter-bar.option-detail-filter-bar");
    await expect(bar).toHaveAttribute("data-filter-open", "false");
    await page.locator("[data-option-detail-filter-toggle]").click();
    await page.waitForTimeout(200);
    await expect(bar).toHaveAttribute("data-filter-open", "true");
  });

  test("35. filter actions มีปุ่มเปิดตัวกรอง + รีเซ็ตค่าทั้งหมด (mobile — toggle ซ่อนบน desktop)", async ({ page }) => {
    const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    test.skip(!isMobile, "filter toggle แสดงเฉพาะ mobile");
    await goToOptionDetail(page, "OG-001");
    await expect(page.locator("[data-option-detail-filter-toggle]")).toBeVisible();
    await expect(page.locator("[data-option-detail-reset]:visible").first()).toBeVisible();
  });
});

// ==================== F. OPTION DETAIL — TABLE & ROWS ====================

test.describe("Option Detail — option list table", () => {
  test("36. head มี 9 คอลัมน์ครบ", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    const head = page.locator(".option-detail-table .asset-row.head");
    await expect(head).toContainText("Option ID");
    await expect(head).toContainText("Option Key");
    await expect(head).toContainText("Label (EN)");
    await expect(head).toContainText("Label (TH)");
    await expect(head).toContainText("Sort Order");
    await expect(head).toContainText("System");
    await expect(head).toContainText("Status");
    await expect(head).toContainText("Updated");
    await expect(head).toContainText("Action");
  });

  test("37. condition: 7 แถว OPT-001..OPT-007 เรียงตาม sort_order", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    const rows = page.locator(".option-detail-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(7);
    await expect(rows.first()).toHaveAttribute("data-option-view", "OPT-001");
    await expect(rows.last()).toHaveAttribute("data-option-view", "OPT-007");
  });

  test("38. แถว OPT-001 แสดงครบ (key, labels, sort, system, status, updated)", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    const row = page.locator(".asset-row[data-option-view='OPT-001']");
    await expect(row.locator("[data-label='Option Key'] .main-text")).toHaveText("new_unworn");
    await expect(row.locator("[data-label='Label (EN)'] .desktop-user-name")).toHaveText("New / Unworn");
    await expect(row.locator("[data-label='Label (TH)'] .main-text")).toHaveText("ใหม่ / ยังไม่ผ่านการใช้งาน");
    await expect(row.locator("[data-label='Sort Order'] .main-text")).toHaveText("10");
    await expect(row.locator("[data-label='System']")).toContainText("System");
    await expect(row.locator("[data-label='Status'] .pill")).toContainText("Active");
  });

  test("39. footer-range 'แสดง 1-7 จาก 7'", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await expect(page.locator("#table > .footer-range span").first()).toContainText("แสดง 1-7 จาก 7");
  });

  test("40. คลิกแถว option → เปิด view modal 'Option Detail' (read-only)", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await page.locator(".asset-row[data-option-view='OPT-001'] .asset-cell-primary").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Option Detail");
    const body = page.locator("#user-action-modal-body");
    await expect(body).toContainText("OPT-001");
    await expect(body).toContainText("new_unworn");
    await expect(body).toContainText("Used in Assets");
    await closeModal(page);
  });

  test("41. row menu option Active + used (OPT-001): ดูรายละเอียด/แก้ไข/ดู Audit Log — ไม่มี ปิดใช้งาน/ลบ", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await openOptionRowMenu(page, "OPT-001");
    const menu = page.locator(".asset-row[data-option-view='OPT-001'] .row-menu-list");
    await expect(menu.locator("[data-option-view-action='OPT-001']")).toBeVisible();
    await expect(menu.locator("[data-option-edit='OPT-001']")).toBeVisible();
    await expect(menu.locator("[data-option-audit-open='OPT-001']")).toBeVisible();
    await expect(menu.locator("[data-option-deactivate]")).toHaveCount(0);
    await expect(menu.locator("[data-option-delete]")).toHaveCount(0);
  });

  test("42. row menu option ที่ไม่ได้ใช้ (OPT-006 fair): มี ปิดใช้งาน + ลบ", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await openOptionRowMenu(page, "OPT-006");
    const menu = page.locator(".asset-row[data-option-view='OPT-006'] .row-menu-list");
    await expect(menu.locator("[data-option-deactivate='OPT-006']")).toBeVisible();
    await expect(menu.locator("[data-option-delete='OPT-006']")).toBeVisible();
  });

  test("43. row menu option Inactive (หลัง deactivate) มี 'เปิดใช้งาน' แทน 'ปิดใช้งาน'", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await openOptionRowMenu(page, "OPT-006");
    await page.locator("[data-option-deactivate='OPT-006']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-option-deactivate-reason]").fill("ทดสอบ deactivate");
    await page.locator("[data-option-deactivate-confirm]").click();
    await page.waitForTimeout(300);
    await openOptionRowMenu(page, "OPT-006");
    const menu = page.locator(".asset-row[data-option-view='OPT-006'] .row-menu-list");
    await expect(menu.locator("[data-option-reactivate='OPT-006']")).toBeVisible();
    await expect(menu.locator("[data-option-deactivate]")).toHaveCount(0);
  });
});

// ==================== G. OPTION DETAIL — SEARCH / FILTER / RESET / PAGINATION ====================

test.describe("Option Detail — search / filter / reset / pagination", () => {
  test("44. ค้นหา 'new_unworn' เจอ 1 แถว", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await page.locator("#option-detail-search").fill("new_unworn");
    await page.waitForTimeout(300);
    const rows = page.locator(".option-detail-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toHaveAttribute("data-option-view", "OPT-001");
  });

  test("45. ค้นหาด้วย Label (EN) 'Mint' เจอ 1 แถว", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await page.locator("#option-detail-search").fill("Mint");
    await page.waitForTimeout(300);
    const rows = page.locator(".option-detail-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toHaveAttribute("data-option-view", "OPT-002");
  });

  test("46. ค้นหาด้วย Label (TH) 'เหมือนใหม่' เจอ 1 แถว (mint)", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await page.locator("#option-detail-search").fill("เหมือนใหม่");
    await page.waitForTimeout(300);
    const rows = page.locator(".option-detail-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toHaveAttribute("data-option-view", "OPT-002");
  });

  test("47. ค้นหาไม่เจอ → empty state 'ไม่พบข้อมูล'", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await page.locator("#option-detail-search").fill("zzz-none");
    await page.waitForTimeout(300);
    await expect(page.locator(".option-detail-table .detail-empty")).toContainText("ไม่พบข้อมูล");
  });

  test("48. filter status = Active ใน condition → 7 แถว", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await openFilterBar(page, "detail");
    await pickCustomOption(page, "option-status-filter", "active");
    await page.waitForTimeout(300);
    await expect(page.locator(".option-detail-table .asset-row:not(.head)")).toHaveCount(7);
  });

  test("49. filter status = Inactive ก่อนมีการ deactivate → empty state", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await openFilterBar(page, "detail");
    await pickCustomOption(page, "option-status-filter", "inactive");
    await page.waitForTimeout(300);
    await expect(page.locator(".option-detail-table .detail-empty")).toContainText("ไม่พบข้อมูล");
  });

  test("50. reset ล้าง search + filter", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await page.locator("#option-detail-search").fill("mint");
    await page.waitForTimeout(200);
    await page.locator("[data-option-detail-reset]:visible").first().click();
    await page.waitForTimeout(300);
    await expect(page.locator(".option-detail-table .asset-row:not(.head)")).toHaveCount(7);
    await expect(page.locator("#option-detail-search")).toHaveValue("");
  });

  test("51. pagination: dial_color 18 options → footer 'แสดง 1-10 จาก 18', 2 หน้า", async ({ page }) => {
    await goToOptionDetail(page, "OG-005");
    await expect(page.locator("#table > .footer-range span").first()).toContainText("แสดง 1-10 จาก 18");
    const rows = page.locator(".option-detail-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(10);
    await expect(rows.first()).toHaveAttribute("data-option-view", "OPT-030");
  });

  test("52. ไปหน้า 2 (desktop กดเลขหน้า / mobile กด next) → แถวแรก OPT-040, เหลือ 8 แถว", async ({ page }) => {
    await goToOptionDetail(page, "OG-005");
    const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    if (isMobile) {
      await page.locator("#table .pager-next").click();
    } else {
      await page.locator("[data-option-detail-page='2']").click();
    }
    await page.waitForTimeout(300);
    const rows = page.locator(".option-detail-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(8);
    await expect(rows.first()).toHaveAttribute("data-option-view", "OPT-040");
    await expect(page.locator("#table .footer-range span").first()).toContainText("แสดง 11-18 จาก 18");
  });

  test("53. next → prev กลับมาหน้า 1 (case_material 13 options)", async ({ page }) => {
    await goToOptionDetail(page, "OG-003");
    await page.locator("#table .pager-next").click();
    await page.waitForTimeout(300);
    await expect(page.locator(".option-detail-table .asset-row:not(.head)").first()).toHaveAttribute("data-option-view", "OPT-020");
    await page.locator("#table .pager-prev").click();
    await page.waitForTimeout(300);
    await expect(page.locator(".option-detail-table .asset-row:not(.head)").first()).toHaveAttribute("data-option-view", "OPT-010");
  });
});

// ==================== G. ADD OPTION MODAL ====================

test.describe("Add Option modal", () => {
  async function openAddOption(page) {
    await goToOptionDetail(page, "OG-001");
    await page.locator("[data-option-add-open]").click();
    await page.waitForTimeout(300);
  }

  test("54. modal 'Add Option' เปิดจาก page action + subtitle ชื่อกลุ่ม", async ({ page }) => {
    await openAddOption(page);
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Add Option");
    await expect(page.locator("#user-action-modal-body")).toContainText("Condition");
  });

  test("55. Option ID readonly และเป็นค่าถัดไป OPT-066", async ({ page }) => {
    await openAddOption(page);
    const idInput = page.locator("[data-option-form] .option-field-option-id input");
    await expect(idInput).toHaveValue("OPT-066");
    await expect(idInput).toHaveAttribute("readonly", "");
  });

  test("56. ฟอร์มมีฟิลด์ครบ + Status toggle default Active", async ({ page }) => {
    await openAddOption(page);
    const form = page.locator("[data-option-form]");
    await expect(form.locator("[data-option-key]")).toBeVisible();
    await expect(form.locator("[data-option-label-en]")).toBeVisible();
    await expect(form.locator("[data-option-label-th]")).toBeVisible();
    await expect(form.locator("[data-option-description-en]")).toBeVisible();
    await expect(form.locator("[data-option-is-active]")).toBeChecked();
  });

  test("57. submit ว่าง → error ครบ 3 ฟิลด์ (key, label EN, label TH)", async ({ page }) => {
    await openAddOption(page);
    const form = page.locator("[data-option-form]");
    await form.locator("button[type='submit']").click();
    await page.waitForTimeout(200);
    await expect(form.locator("[data-option-key-error]")).toContainText("กรุณากรอก Option Key");
    await expect(form.locator("[data-option-label-en-error]")).toContainText("กรุณากรอก Label (EN)");
    await expect(form.locator("[data-option-label-th-error]")).toContainText("กรุณากรอก Label (TH)");
  });

  test("58. พิมพ์ Label (EN) → key auto สร้างแบบ lowercase snake_case", async ({ page }) => {
    await openAddOption(page);
    const form = page.locator("[data-option-form]");
    await form.locator("[data-option-label-en]").fill("Like New");
    await expect(form.locator("[data-option-key]")).toHaveValue("like_new");
  });

  test("59. พิมพ์อักขระใหญ่/พิเศษใน key → auto-lowercase + ตัดอักขระไม่ valid", async ({ page }) => {
    await openAddOption(page);
    const keyInput = page.locator("[data-option-form] [data-option-key]");
    await keyInput.fill("Like-New!X");
    await expect(keyInput).toHaveValue("likenewx");
  });

  test("60. key ซ้ำในกลุ่ม ('mint') → error ซ้ำ", async ({ page }) => {
    await openAddOption(page);
    const form = page.locator("[data-option-form]");
    await form.locator("[data-option-key]").fill("mint");
    await form.locator("[data-option-label-en]").fill("Mint Two");
    await form.locator("[data-option-label-th]").fill("มินต์ทู");
    await form.locator("button[type='submit']").click();
    await page.waitForTimeout(200);
    await expect(form.locator("[data-option-key-error]")).toContainText("Option Key ซ้ำในกลุ่มนี้");
  });

  test("61. Label (EN) ซ้ำในกลุ่ม → error", async ({ page }) => {
    await openAddOption(page);
    const form = page.locator("[data-option-form]");
    await form.locator("[data-option-label-en]").fill("Mint");
    await form.locator("[data-option-label-th]").fill("มินต์ใหม่");
    await form.locator("button[type='submit']").click();
    await page.waitForTimeout(200);
    await expect(form.locator("[data-option-label-en-error]")).toContainText("Label (EN) ซ้ำในกลุ่มนี้");
  });

  test("62. Label (TH) ซ้ำในกลุ่ม → error", async ({ page }) => {
    await openAddOption(page);
    const form = page.locator("[data-option-form]");
    await form.locator("[data-option-label-en]").fill("Mint Two");
    await form.locator("[data-option-label-th]").fill("เหมือนใหม่");
    await form.locator("button[type='submit']").click();
    await page.waitForTimeout(200);
    await expect(form.locator("[data-option-label-th-error]")).toContainText("Label (TH) ซ้ำในกลุ่มนี้");
  });

  test("63. พิมพ์ภาษาไทยใน Label (EN) → ถูกบล็อก + error", async ({ page }) => {
    await openAddOption(page);
    const form = page.locator("[data-option-form]");
    await form.locator("[data-option-label-en]").fill("สวย");
    await expect(form.locator("[data-option-label-en]")).toHaveValue("");
    await expect(form.locator("[data-option-label-en-error]")).toContainText("ภาษาอังกฤษ");
  });

  test("64. key > 64 ตัวอักษร → error 'ต้องไม่เกิน 64 ตัวอักษร'", async ({ page }) => {
    await openAddOption(page);
    const form = page.locator("[data-option-form]");
    await form.locator("[data-option-label-en]").fill("Long Key Test");
    await form.locator("[data-option-label-th]").fill("คีย์ยาว");
    await form.locator("[data-option-key]").fill("a".repeat(65));
    await form.locator("button[type='submit']").click();
    await page.waitForTimeout(200);
    await expect(form.locator("[data-option-key-error]")).toContainText("Option Key ต้องไม่เกิน 64 ตัวอักษร");
  });

  test("65. สร้าง option สำเร็จ: confirm → ยืนยัน → toast + แถวใหม่ + panel 'Options (8)'", async ({ page }) => {
    await openAddOption(page);
    const form = page.locator("[data-option-form]");
    await form.locator("[data-option-label-en]").fill("Like New");
    await form.locator("[data-option-label-th]").fill("เหมือนใหม่มาก");
    await form.locator("button[type='submit']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Confirm Create Option");
    await page.locator("[data-option-add-confirm]").click();
    await page.waitForTimeout(400);
    await expect(page.locator("#success-toast")).toHaveClass(/show/);
    await expect(page.locator("#panel-title")).toHaveText("Options (8)");
    await expect(page.locator(".asset-row[data-option-view='OPT-066']")).toBeVisible();
    await expect(page.locator(".asset-row[data-option-view='OPT-066'] [data-label='Option Key'] .main-text")).toHaveText("like_new");
  });

  test("66. ยืนยันสร้างแล้ว audit OPTION_ADD ถูกบันทึก", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await page.locator("[data-option-add-open]").click();
    await page.waitForTimeout(200);
    const form = page.locator("[data-option-form]");
    await form.locator("[data-option-label-en]").fill("Like New");
    await form.locator("[data-option-label-th]").fill("เหมือนใหม่มาก");
    await form.locator("button[type='submit']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-option-add-confirm]").click();
    await page.waitForTimeout(400);
    await openOptionRowMenu(page, "OPT-066");
    await page.locator("[data-option-audit-open='OPT-066']").click();
    await page.waitForTimeout(300);
    await expect(page.locator(".option-audit-entry").first()).toContainText("Option Add");
  });

  test("67. ย้อนกลับจาก confirm → ฟอร์มคงค่าที่กรอก", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await page.locator("[data-option-add-open]").click();
    await page.waitForTimeout(200);
    const form = page.locator("[data-option-form]");
    await form.locator("[data-option-label-en]").fill("Like New");
    await form.locator("[data-option-label-th]").fill("เหมือนใหม่มาก");
    await form.locator("button[type='submit']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-option-add-back]").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Add Option");
    await expect(page.locator("[data-option-form] [data-option-label-en]")).toHaveValue("Like New");
  });

  test("68. ยกเลิก Add Option → modal ปิด", async ({ page }) => {
    await openAddOption(page);
    await page.locator("[data-option-form] [data-user-action-modal-close]").first().click();
    await page.waitForTimeout(200);
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
  });
});

// ==================== H. EDIT OPTION MODAL ====================

test.describe("Edit Option modal", () => {
  async function openEditOption(page, optionId) {
    await goToOptionDetail(page, "OG-001");
    await openOptionRowMenu(page, optionId);
    await page.locator(`.asset-row[data-option-view='${optionId}'] .row-menu-list [data-option-edit='${optionId}']`).click();
    await page.waitForTimeout(300);
  }

  test("69. Edit Option: key readonly + note ล็อก", async ({ page }) => {
    await openEditOption(page, "OPT-006");
    await expect(page.locator("#user-action-modal-title")).toHaveText("Edit Option");
    const keyInput = page.locator("[data-option-form] [data-option-key]");
    await expect(keyInput).toHaveAttribute("readonly", "");
    await expect(keyInput).toHaveValue("fair");
    await expect(page.locator("[data-option-form]")).toContainText("Option Key ล็อกไว้");
  });

  test("70. แก้ Label (TH) → confirm modal แสดง before → after", async ({ page }) => {
    await openEditOption(page, "OPT-006");
    const form = page.locator("[data-option-form]");
    await form.locator("[data-option-label-th]").fill("พอใช้งาน");
    await form.locator("button[type='submit']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Confirm Edit Option");
    const changedRow = page.locator("#user-action-modal-body .option-confirm-changed", { hasText: "Label (TH)" });
    await expect(changedRow).toContainText("พอใช้");
    await expect(changedRow).toContainText("พอใช้งาน");
  });

  test("71. ยืนยันแก้ไข → toast + แถวอัปเดต", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await openOptionRowMenu(page, "OPT-006");
    await page.locator("[data-option-edit='OPT-006']").click();
    await page.waitForTimeout(200);
    const form = page.locator("[data-option-form]");
    await form.locator("[data-option-label-th]").fill("พอใช้งาน");
    await form.locator("button[type='submit']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-option-edit-confirm]").click();
    await page.waitForTimeout(400);
    await expect(page.locator("#success-toast")).toHaveClass(/show/);
    await expect(page.locator(".asset-row[data-option-view='OPT-006'] [data-label='Label (TH)'] .main-text")).toHaveText("พอใช้งาน");
  });

  test("72. used option: สลับ status ใน edit → banner block", async ({ page }) => {
    await openEditOption(page, "OPT-001");
    const form = page.locator("[data-option-form]");
    await form.locator("[data-option-is-active]").click({ force: true });
    await form.locator("button[type='submit']").click();
    await page.waitForTimeout(200);
    await expect(form.locator("[data-option-status-banner]")).toBeVisible();
    await expect(form.locator("[data-option-status-banner]")).toContainText("ไม่สามารถเปลี่ยนสถานะได้");
  });

  test("73. toggle status อัปเดตข้อความ Active/Inactive", async ({ page }) => {
    await openEditOption(page, "OPT-006");
    const toggleBox = page.locator("[data-option-form] .option-status-toggle-box");
    await expect(toggleBox.locator(".option-status-toggle-text")).toHaveText("Active");
    await page.locator("[data-option-form] [data-option-is-active]").click();
    await expect(toggleBox.locator(".option-status-toggle-text")).toHaveText("Inactive");
  });

  test("74. ย้อนกลับจาก confirm → กลับฟอร์มพร้อมค่าที่แก้", async ({ page }) => {
    await openEditOption(page, "OPT-006");
    const form = page.locator("[data-option-form]");
    await form.locator("[data-option-label-th]").fill("พอใช้งานจ้า");
    await form.locator("button[type='submit']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-option-edit-back]").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Edit Option");
    await expect(page.locator("[data-option-form] [data-option-label-th]")).toHaveValue("พอใช้งานจ้า");
  });
});

// ==================== I. DELETE OPTION MODAL ====================

test.describe("Delete Option modal", () => {
  async function openDeleteOption(page, optionId) {
    await goToOptionDetail(page, "OG-001");
    await openOptionRowMenu(page, optionId);
    await page.locator(`.asset-row[data-option-view='${optionId}'] .row-menu-list [data-option-delete='${optionId}']`).click();
    await page.waitForTimeout(300);
  }

  test("75. modal Delete Option: คำเตือนถาวร + summary + type-to-confirm ปุ่ม disabled", async ({ page }) => {
    await openDeleteOption(page, "OPT-006");
    await expect(page.locator("#user-action-modal-title")).toHaveText("Delete Option");
    const body = page.locator("#user-action-modal-body");
    await expect(body).toContainText("ไม่สามารถย้อนกลับได้");
    await expect(body).toContainText("ลบออกจากระบบอย่างถาวร");
    await expect(body.locator("[data-option-delete-confirm-input]")).toBeVisible();
    await expect(body.locator("[data-option-delete-confirm]")).toBeDisabled();
  });

  test("76. พิมพ์ key ไม่ตรง → disabled / พิมพ์ 'fair' ตรง → enabled", async ({ page }) => {
    await openDeleteOption(page, "OPT-006");
    const confirmBtn = page.locator("[data-option-delete-confirm]");
    await page.locator("[data-option-delete-confirm-input]").fill("wrong");
    await expect(confirmBtn).toBeDisabled();
    await page.locator("[data-option-delete-confirm-input]").fill("fair");
    await expect(confirmBtn).toBeEnabled();
  });

  test("77. ยืนยันลบ → toast + แถวหาย เหลือ 6 options", async ({ page }) => {
    await openDeleteOption(page, "OPT-006");
    await page.locator("[data-option-delete-confirm-input]").fill("fair");
    await page.locator("[data-option-delete-confirm]").click();
    await page.waitForTimeout(400);
    await expect(page.locator("#success-toast")).toHaveClass(/show/);
    await expect(page.locator(".asset-row[data-option-view='OPT-006']")).toHaveCount(0);
    await expect(page.locator(".option-detail-table .asset-row:not(.head)")).toHaveCount(6);
  });

  test("78. used option (OPT-001) ไม่มีปุ่มลบ (safeguard used_in_assets)", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await openOptionRowMenu(page, "OPT-001");
    await expect(page.locator(".asset-row[data-option-view='OPT-001'] .row-menu-list [data-option-delete]")).toHaveCount(0);
  });

  test("79. ยกเลิกลบ → modal ปิด แถวยังอยู่", async ({ page }) => {
    await openDeleteOption(page, "OPT-006");
    await page.locator("#user-action-modal .user-detail-action-btn", { hasText: "ยกเลิก" }).click();
    await page.waitForTimeout(200);
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    await expect(page.locator(".asset-row[data-option-view='OPT-006']")).toBeVisible();
  });
});

// ==================== J. DEACTIVATE / REACTIVATE OPTION ====================

test.describe("Deactivate / Reactivate Option", () => {
  test("80. modal Deactivate Option: Active → Inactive + impact FO + reason required (ปุ่ม disabled)", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await openOptionRowMenu(page, "OPT-006");
    await page.locator("[data-option-deactivate='OPT-006']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Deactivate Option");
    const body = page.locator("#user-action-modal-body");
    await expect(body).toContainText("Active");
    await expect(body).toContainText("Inactive");
    await expect(body).toContainText("ผลกระทบต่อ Front Office");
    await expect(body.locator("[data-option-deactivate-confirm]")).toBeDisabled();
  });

  test("81. กรอก reason → ยืนยัน → toast + status pill Inactive", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await openOptionRowMenu(page, "OPT-006");
    await page.locator("[data-option-deactivate='OPT-006']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-option-deactivate-reason]").fill("พัก option ชั่วคราว");
    await page.locator("[data-option-deactivate-confirm]").click();
    await page.waitForTimeout(400);
    await expect(page.locator("#success-toast")).toHaveClass(/show/);
    await expect(page.locator(".asset-row[data-option-view='OPT-006'] [data-label='Status'] .pill.gray")).toContainText("Inactive");
  });

  test("82. used option (OPT-001) ไม่มีปุ่มปิดใช้งาน (safeguard)", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await openOptionRowMenu(page, "OPT-001");
    await expect(page.locator(".asset-row[data-option-view='OPT-001'] .row-menu-list [data-option-deactivate]")).toHaveCount(0);
  });

  test("83. safeguard: จะเหลือ active < 1 → safeguard error ไม่มีปุ่มยืนยัน", async ({ page }) => {
    await goToOptionDetail(page, "OG-002");
    await openOptionRowMenu(page, "OPT-008");
    await page.locator("[data-option-deactivate='OPT-008']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-option-deactivate-reason]").fill("ปิดก่อน");
    await page.locator("[data-option-deactivate-confirm]").click();
    await page.waitForTimeout(400);
    await openOptionRowMenu(page, "OPT-009");
    await page.locator("[data-option-deactivate='OPT-009']").click();
    await page.waitForTimeout(300);
    const body = page.locator("#user-action-modal-body");
    await expect(body.locator(".option-safeguard-error")).toContainText("ไม่สามารถปิดใช้งานได้");
    await expect(body.locator("[data-option-deactivate-confirm]")).toHaveCount(0);
  });

  test("84. reactivate option ที่ปิดไป → toast + Active กลับมา", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await openOptionRowMenu(page, "OPT-006");
    await page.locator("[data-option-deactivate='OPT-006']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-option-deactivate-reason]").fill("ปิดก่อนเปิดใหม่");
    await page.locator("[data-option-deactivate-confirm]").click();
    await page.waitForTimeout(400);
    await openOptionRowMenu(page, "OPT-006");
    await page.locator("[data-option-reactivate='OPT-006']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Reactivate Option");
    await page.locator("[data-option-reactivate-confirm]").click();
    await page.waitForTimeout(400);
    await expect(page.locator("#success-toast")).toHaveClass(/show/);
    await expect(page.locator(".asset-row[data-option-view='OPT-006'] [data-label='Status'] .pill.green")).toContainText("Active");
  });

  test("85. audit หลัง deactivate: OPTION_DEACTIVATE + reason + before/after", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await openOptionRowMenu(page, "OPT-006");
    await page.locator("[data-option-deactivate='OPT-006']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-option-deactivate-reason]").fill("เหตุผลทดสอบ QA");
    await page.locator("[data-option-deactivate-confirm]").click();
    await page.waitForTimeout(400);
    await openOptionRowMenu(page, "OPT-006");
    await page.locator("[data-option-audit-open='OPT-006']").click();
    await page.waitForTimeout(300);
    const entry = page.locator(".option-audit-entry").first();
    await expect(entry).toContainText("Option Deactivate");
    await expect(entry).toContainText("เหตุผลทดสอบ QA");
    await expect(entry.locator(".option-audit-diff-before")).toContainText("Active");
    await expect(entry.locator(".option-audit-diff-after")).toContainText("Inactive");
  });
});

// ==================== J2. REORDER OPTION ====================

test.describe("Reorder Option modal", () => {
  async function openReorder(page, groupId) {
    await goToOptionDetail(page, groupId);
    await page.locator("[data-option-reorder-open]").click();
    await page.waitForTimeout(300);
  }

  test("86. modal 'Reorder Options — Condition' มี 7 items + index #1..#7", async ({ page }) => {
    await openReorder(page, "OG-001");
    await expect(page.locator("#user-action-modal-title")).toHaveText("Reorder Options — Condition");
    const items = page.locator("[data-option-order-item]");
    await expect(items).toHaveCount(7);
    await expect(items.first().locator(".option-order-index")).toHaveText("#1");
    await expect(items.last().locator(".option-order-index")).toHaveText("#7");
  });

  test("87. item แรก up disabled / สุดท้าย down disabled", async ({ page }) => {
    await openReorder(page, "OG-001");
    const items = page.locator("[data-option-order-item]");
    await expect(items.first().locator("[data-option-order-up]")).toBeDisabled();
    await expect(items.last().locator("[data-option-order-down]")).toBeDisabled();
  });

  test("88. ขยับ item แรกลง (drag บน desktop / ปุ่ม down บน mobile) → สลับลำดับ + index อัปเดต", async ({ page }) => {
    await openReorder(page, "OG-001");
    await expect(page.locator("[data-option-order-item]").first()).toContainText("New / Unworn");
    await moveReorderItem(page, "data-option-order-item", 0, "down");
    await expect(page.locator("[data-option-order-item]").first()).toContainText("Mint");
    await expect(page.locator("[data-option-order-item]").nth(1)).toContainText("New / Unworn");
  });

  test("89. บันทึกลำดับ → toast + sort_order ใหม่รัน 10,20,30...", async ({ page }) => {
    await openReorder(page, "OG-001");
    await moveReorderItem(page, "data-option-order-item", 0, "down");
    await page.locator("[data-option-order-save]").click();
    await page.waitForTimeout(400);
    await expect(page.locator("#success-toast")).toHaveClass(/show/);
    const rows = page.locator(".option-detail-table .asset-row:not(.head)");
    await expect(rows.first()).toHaveAttribute("data-option-view", "OPT-002");
    await expect(rows.first().locator("[data-label='Sort Order'] .main-text")).toHaveText("10");
    await expect(rows.nth(1).locator("[data-label='Sort Order'] .main-text")).toHaveText("20");
  });

  test("90. ยกเลิก → ลำดับเดิม", async ({ page }) => {
    await openReorder(page, "OG-001");
    await moveReorderItem(page, "data-option-order-item", 0, "down");
    await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
    await page.waitForTimeout(300);
    await expect(page.locator(".asset-row[data-option-view='OPT-001'] [data-label='Sort Order'] .main-text")).toHaveText("10");
  });

  test("91. หลัง save → audit OPTION_REORDER บน option แรกที่ขยับเข้ามา (OPT-002)", async ({ page }) => {
    await openReorder(page, "OG-001");
    await moveReorderItem(page, "data-option-order-item", 0, "down");
    await page.locator("[data-option-order-save]").click();
    await page.waitForTimeout(400);
    await openOptionRowMenu(page, "OPT-002");
    await page.locator("[data-option-audit-open='OPT-002']").click();
    await page.waitForTimeout(300);
    await expect(page.locator(".option-audit-entry").first()).toContainText("Option Reorder");
  });

  test("92. safeguard: เหลือ active < 2 → ปุ่มจัดเรียงหาย (refresh page actions หลัง deactivate)", async ({ page }) => {
    await goToOptionDetail(page, "OG-002");
    await openOptionRowMenu(page, "OPT-008");
    await page.locator("[data-option-deactivate='OPT-008']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-option-deactivate-reason]").fill("ทดสอบ");
    await page.locator("[data-option-deactivate-confirm]").click();
    await page.waitForTimeout(400);
    await expect(page.locator("[data-option-reorder-open]")).toHaveCount(0);
    await expect(page.locator("[data-option-add-open]")).toBeVisible();
    await expect(page.locator("[data-back-option-groups]")).toBeVisible();
  });
});

// ==================== L. ADD GROUP MODAL ====================

test.describe("Add Group modal", () => {
  async function openAddGroup(page) {
    await goToOptionMaster(page);
    await page.locator("[data-option-group-add-open]").click();
    await page.waitForTimeout(300);
  }

  test("93. modal 'Add Group' เปิดจาก page action + Group ID readonly OG-009", async ({ page }) => {
    await openAddGroup(page);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Add Group");
    const idInput = page.locator("[data-option-group-form] .option-field-group-id input");
    await expect(idInput).toHaveValue("OG-009");
    await expect(idInput).toHaveAttribute("readonly", "");
  });

  test("94. ฟอร์มมีฟิลด์ครบ + Multi-select default No + Status default Active", async ({ page }) => {
    await openAddGroup(page);
    const form = page.locator("[data-option-group-form]");
    await expect(form.locator("[data-option-group-identifier]")).toBeVisible();
    await expect(form.locator("[data-option-group-multi-select]")).not.toBeChecked();
    await expect(form.locator("[data-option-is-active]")).toBeChecked();
    await expect(form.locator("[data-option-group-name-en]")).toBeVisible();
    await expect(form.locator("[data-option-group-name-th]")).toBeVisible();
  });

  test("95. submit ว่าง → error 3 ฟิลด์ (key, label TH, label EN)", async ({ page }) => {
    await openAddGroup(page);
    const form = page.locator("[data-option-group-form]");
    await form.locator("button[type='submit']").click();
    await page.waitForTimeout(200);
    await expect(form.locator("[data-option-group-identifier-error]")).toContainText("กรุณากรอก Group Key");
    await expect(form.locator("[data-option-group-name-th-error]")).toContainText("กรุณากรอก Label (TH)");
    await expect(form.locator("[data-option-group-name-en-error]")).toContainText("กรุณากรอก Label (EN)");
  });

  test("96. Group Key auto จาก Label (EN) แบบ lowercase snake_case", async ({ page }) => {
    await openAddGroup(page);
    const form = page.locator("[data-option-group-form]");
    await form.locator("[data-option-group-name-en]").fill("Complication");
    await expect(form.locator("[data-option-group-identifier]")).toHaveValue("complication");
  });

  test("97. Group Key ซ้ำ ('condition') → error", async ({ page }) => {
    await openAddGroup(page);
    const form = page.locator("[data-option-group-form]");
    await form.locator("[data-option-group-identifier]").fill("condition");
    await form.locator("[data-option-group-name-en]").fill("Condition Two");
    await form.locator("[data-option-group-name-th]").fill("สภาพสอง");
    await form.locator("button[type='submit']").click();
    await page.waitForTimeout(200);
    await expect(form.locator("[data-option-group-identifier-error]")).toContainText("Group Key ซ้ำกับที่มีอยู่");
  });

  test("98. Label (TH) ซ้ำกับกลุ่มอื่น → error", async ({ page }) => {
    await openAddGroup(page);
    const form = page.locator("[data-option-group-form]");
    await form.locator("[data-option-group-identifier]").fill("condition_two");
    await form.locator("[data-option-group-name-en]").fill("Condition Two");
    await form.locator("[data-option-group-name-th]").fill("สภาพ");
    await form.locator("button[type='submit']").click();
    await page.waitForTimeout(200);
    await expect(form.locator("[data-option-group-name-th-error]")).toContainText("Label (TH) ซ้ำกับกลุ่มอื่น");
  });

  test("99. สร้าง group สำเร็จ: confirm → ยืนยัน → toast + แถว OG-009 (9 แถว)", async ({ page }) => {
    await openAddGroup(page);
    const form = page.locator("[data-option-group-form]");
    await form.locator("[data-option-group-name-en]").fill("Complication");
    await form.locator("[data-option-group-name-th]").fill("ฟังก์ชันพิเศษ");
    await form.locator("button[type='submit']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Confirm Create Group");
    await page.locator("[data-option-group-add-confirm]").click();
    await page.waitForTimeout(400);
    await expect(page.locator("#success-toast")).toHaveClass(/show/);
    await expect(page.locator(".option-group-table .asset-row:not(.head)")).toHaveCount(9);
    await expect(page.locator(".asset-row[data-option-group='OG-009']")).toBeVisible();
  });

  test("100. ย้อนกลับจาก confirm → ฟอร์มคงค่าที่กรอก", async ({ page }) => {
    await openAddGroup(page);
    const form = page.locator("[data-option-group-form]");
    await form.locator("[data-option-group-identifier]").fill("complication");
    await form.locator("[data-option-group-name-en]").fill("Complication");
    await form.locator("[data-option-group-name-th]").fill("ฟังก์ชันพิเศษ");
    await form.locator("button[type='submit']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-option-group-add-back]").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Add Group");
    await expect(page.locator("[data-option-group-form] [data-option-group-identifier]")).toHaveValue("complication");
  });
});

// ==================== N. EDIT GROUP MODAL ====================

test.describe("Edit Group modal", () => {
  async function openEditGroup(page, groupId) {
    await goToOptionMaster(page);
    await openGroupRowMenu(page, groupId);
    await page.locator(`.asset-row[data-option-group='${groupId}'] .row-menu-list [data-option-group-edit='${groupId}']`).click();
    await page.waitForTimeout(300);
  }

  test("101. Edit Group: title + Group Key readonly (ล็อก) + Group ID readonly", async ({ page }) => {
    await openEditGroup(page, "OG-002");
    await expect(page.locator("#user-action-modal-title")).toHaveText("Edit Group");
    const form = page.locator("[data-option-group-form]");
    await expect(form.locator(".option-field-identifier input")).toHaveAttribute("readonly", "");
    await expect(form.locator(".option-field-identifier input")).toHaveValue("delivery");
    await expect(form.locator(".option-field-group-id input")).toHaveAttribute("readonly", "");
    await expect(form).toContainText("Group Key ล็อกไว้");
  });

  test("102. แก้ Label (TH) → confirm modal ไฮไลต์ before → after", async ({ page }) => {
    await openEditGroup(page, "OG-002");
    const form = page.locator("[data-option-group-form]");
    await form.locator("[data-option-group-name-th]").fill("อุปกรณ์ที่มาด้วย (แก้)");
    await form.locator("button[type='submit']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Confirm Edit Group");
    const changedRow = page.locator("#user-action-modal-body .option-confirm-changed").filter({ hasText: "Label (TH)" });
    await expect(changedRow).toContainText("อุปกรณ์ที่มาด้วย");
    await expect(changedRow).toContainText("อุปกรณ์ที่มาด้วย (แก้)");
  });

  test("103. ยืนยันแก้ไข → toast + แถวอัปเดต", async ({ page }) => {
    await openEditGroup(page, "OG-002");
    const form = page.locator("[data-option-group-form]");
    await form.locator("[data-option-group-name-th]").fill("อุปกรณ์ที่มาด้วย (แก้)");
    await form.locator("button[type='submit']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-option-group-edit-confirm]").click();
    await page.waitForTimeout(400);
    await expect(page.locator("#success-toast")).toHaveClass(/show/);
    await expect(page.locator(".asset-row[data-option-group='OG-002'] [data-label='Label (TH)'] .main-text")).toContainText("แก้");
  });

  test("104. used group (OG-001) สลับเป็น Inactive ใน edit → banner block", async ({ page }) => {
    await openEditGroup(page, "OG-001");
    const form = page.locator("[data-option-group-form]");
    await form.locator("[data-option-is-active]").click({ force: true });
    await form.locator("button[type='submit']").click();
    await page.waitForTimeout(200);
    await expect(form.locator("[data-option-group-status-banner]")).toBeVisible();
    await expect(form.locator("[data-option-group-status-banner]")).toContainText("ไม่สามารถเปลี่ยนสถานะเป็น Inactive ได้");
  });

  test("105. Group Key ใน edit เป็น readonly (ห้ามแก้)", async ({ page }) => {
    await openEditGroup(page, "OG-002");
    const keyInput = page.locator("[data-option-group-form] .option-field-identifier input");
    await expect(keyInput).toHaveAttribute("readonly", "");
    await expect(keyInput).toHaveValue("delivery");
  });

  test("106. ย้อนกลับจาก confirm edit group → ฟอร์มคงค่าที่แก้", async ({ page }) => {
    await openEditGroup(page, "OG-002");
    const form = page.locator("[data-option-group-form]");
    await form.locator("[data-option-group-name-th]").fill("อุปกรณ์แถม");
    await form.locator("button[type='submit']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-option-group-edit-back]").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Edit Group");
    await expect(page.locator("[data-option-group-form] [data-option-group-name-th]")).toHaveValue("อุปกรณ์แถม");
  });
});

// ==================== O. DEACTIVATE / REACTIVATE / DELETE GROUP ====================

test.describe("Deactivate / Reactivate / Delete Group", () => {
  test("107. modal Deactivate Group: Active → Inactive + reason required", async ({ page }) => {
    await goToOptionMaster(page);
    await openGroupRowMenu(page, "OG-002");
    await page.locator("[data-option-group-deactivate='OG-002']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Deactivate Group");
    const body = page.locator("#user-action-modal-body");
    await expect(body).toContainText("Active");
    await expect(body).toContainText("Inactive");
    await expect(body.locator("[data-option-group-deactivate-confirm]")).toBeDisabled();
  });

  test("108. ยืนยัน deactivate group → toast + status Inactive + ปุ่มเปิดใช้งานในเมนู", async ({ page }) => {
    await goToOptionMaster(page);
    await openGroupRowMenu(page, "OG-002");
    await page.locator("[data-option-group-deactivate='OG-002']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-option-group-deactivate-reason]").fill("เลิกใช้ชั่วคราว");
    await page.locator("[data-option-group-deactivate-confirm]").click();
    await page.waitForTimeout(400);
    await expect(page.locator("#success-toast")).toHaveClass(/show/);
    await expect(page.locator(".asset-row[data-option-group='OG-002'] .pill.gray").first()).toContainText("Inactive");
  });

  test("109. reactivate group (OG-007) → toast + Active กลับมา", async ({ page }) => {
    await goToOptionMaster(page);
    await openGroupRowMenu(page, "OG-007");
    await page.locator("[data-option-group-reactivate='OG-007']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Reactivate Group");
    await page.locator("[data-option-group-reactivate-confirm]").click();
    await page.waitForTimeout(400);
    await expect(page.locator("#success-toast")).toHaveClass(/show/);
    await expect(page.locator(".asset-row[data-option-group='OG-007'] .pill.green").first()).toContainText("Active");
  });

  test("110. modal Delete Group (OG-007): คำเตือนถาวร + impact count 3 options + type-to-confirm", async ({ page }) => {
    await goToOptionMaster(page);
    await openGroupRowMenu(page, "OG-007");
    await page.locator("[data-option-group-delete='OG-007']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Delete Group");
    const body = page.locator("#user-action-modal-body");
    await expect(body).toContainText("ไม่สามารถย้อนกลับได้");
    await expect(body).toContainText("จะลบ option ใน group นี้ทั้งหมด");
    await expect(body).toContainText("crystal_type");
    await expect(body.locator("[data-option-group-delete-confirm]")).toBeDisabled();
  });

  test("111. type-to-confirm 'crystal_type' → ปุ่ม enable → ยืนยันลบ → toast + group หาย", async ({ page }) => {
    await goToOptionMaster(page);
    await openGroupRowMenu(page, "OG-007");
    await page.locator("[data-option-group-delete='OG-007']").click();
    await page.waitForTimeout(300);
    await page.locator("[data-option-group-delete-confirm-input]").fill("crystal_type");
    await page.locator("[data-option-group-delete-confirm]").click();
    await page.waitForTimeout(400);
    await expect(page.locator("#success-toast")).toHaveClass(/show/);
    await expect(page.locator(".asset-row[data-option-group='OG-007']")).toHaveCount(0);
    await expect(page.locator(".option-group-table .asset-row:not(.head)")).toHaveCount(7);
  });

  test("112. used group (OG-008) ไม่มีปุ่มลบใน action menu (safeguard)", async ({ page }) => {
    await goToOptionMaster(page);
    await openGroupRowMenu(page, "OG-008");
    const menu = page.locator(".asset-row[data-option-group='OG-008'] .row-menu-list");
    await expect(menu.locator("[data-option-group-delete]")).toHaveCount(0);
    await expect(menu.locator("[data-option-group-reactivate='OG-008']")).toBeVisible();
  });

  test("113. Active group (OG-001) ไม่มีปุ่ม ปิดใช้งาน/ลบ (มีแต่ ดูรายละเอียด/แก้ไข/Audit)", async ({ page }) => {
    await goToOptionMaster(page);
    await openGroupRowMenu(page, "OG-001");
    const menu = page.locator(".asset-row[data-option-group='OG-001'] .row-menu-list");
    await expect(menu.locator("[data-option-group-deactivate]")).toHaveCount(0);
    await expect(menu.locator("[data-option-group-delete]")).toHaveCount(0);
    await expect(menu.locator("[data-option-group-edit='OG-001']")).toBeVisible();
    await expect(menu.locator("[data-option-group-audit-open='OG-001']")).toBeVisible();
  });

  test("114. Inactive group ไม่ได้ใช้ (OG-007) มีปุ่ม เปิดใช้งาน + ลบ", async ({ page }) => {
    await goToOptionMaster(page);
    await openGroupRowMenu(page, "OG-007");
    const menu = page.locator(".asset-row[data-option-group='OG-007'] .row-menu-list");
    await expect(menu.locator("[data-option-group-reactivate='OG-007']")).toBeVisible();
    await expect(menu.locator("[data-option-group-delete='OG-007']")).toBeVisible();
  });

  test("115. audit หลัง deactivate group: GROUP_DEACTIVATE + reason", async ({ page }) => {
    await goToOptionMaster(page);
    await openGroupRowMenu(page, "OG-002");
    await page.locator("[data-option-group-deactivate='OG-002']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-option-group-deactivate-reason]").fill("เหตุผลทดสอบ QA");
    await page.locator("[data-option-group-deactivate-confirm]").click();
    await page.waitForTimeout(400);
    await openGroupRowMenu(page, "OG-002");
    await page.locator("[data-option-group-audit-open='OG-002']").click();
    await page.waitForTimeout(300);
    const entry = page.locator(".option-audit-entry").first();
    await expect(entry).toContainText("Group Deactivate");
    await expect(entry).toContainText("เหตุผลทดสอบ QA");
  });
});

// ==================== P. REORDER GROUPS MODAL ====================

test.describe("Reorder Groups modal", () => {
  async function openGroupReorder(page) {
    await goToOptionMaster(page);
    await page.locator("[data-option-group-reorder-open]").click();
    await page.waitForTimeout(300);
  }

  test("116. modal 'Reorder Option Groups' แสดงเฉพาะ active groups (6 items)", async ({ page }) => {
    await openGroupReorder(page);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Reorder Option Groups");
    const items = page.locator("[data-option-group-order-item]");
    await expect(items).toHaveCount(6);
    await expect(items.first()).toContainText("Condition");
    await expect(items.last()).toContainText("Strap / Bracelet Type");
  });

  test("117. ไม่มี inactive group ใน reorder modal (OG-007/OG-008 หายไป)", async ({ page }) => {
    await openGroupReorder(page);
    const listText = await page.locator("[data-option-group-order-list]").textContent();
    expect(listText).not.toContain("crystal_type");
    expect(listText).not.toContain("gender");
  });

  test("118. item แรก up disabled / สุดท้าย down disabled", async ({ page }) => {
    await openGroupReorder(page);
    const items = page.locator("[data-option-group-order-item]");
    await expect(items.first().locator("[data-option-group-order-up]")).toBeDisabled();
    await expect(items.last().locator("[data-option-group-order-down]")).toBeDisabled();
  });

  test("119. ขยับ item แรกลง (drag บน desktop / ปุ่ม down บน mobile) → สลับ + index อัปเดต", async ({ page }) => {
    await openGroupReorder(page);
    await expect(page.locator("[data-option-group-order-item]").first()).toContainText("Condition");
    await moveReorderItem(page, "data-option-group-order-item", 0, "down");
    await expect(page.locator("[data-option-group-order-item]").first()).toContainText("Scope of Delivery");
    await expect(page.locator("[data-option-group-order-item]").nth(1)).toContainText("Condition");
  });

  test("120. บันทึกลำดับ → toast + แถวแรกใน list เปลี่ยนเป็น Scope of Delivery", async ({ page }) => {
    await openGroupReorder(page);
    await moveReorderItem(page, "data-option-group-order-item", 0, "down");
    await page.locator("[data-option-group-order-save]").click();
    await page.waitForTimeout(400);
    await expect(page.locator("#success-toast")).toHaveClass(/show/);
    const firstRow = page.locator(".option-group-table .asset-row:not(.head)").first();
    await expect(firstRow).toHaveAttribute("data-option-group", "OG-002");
  });

  test("121. ยกเลิก → ลำดับเดิมคงเดิม", async ({ page }) => {
    await openGroupReorder(page);
    await moveReorderItem(page, "data-option-group-order-item", 0, "down");
    await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
    await page.waitForTimeout(300);
    await expect(page.locator(".option-group-table .asset-row:not(.head)").first()).toHaveAttribute("data-option-group", "OG-001");
  });

  test("122. หลัง save → audit GROUP_REORDER บน group แรกที่ขยับเข้ามา (OG-002)", async ({ page }) => {
    await openGroupReorder(page);
    await moveReorderItem(page, "data-option-group-order-item", 0, "down");
    await page.locator("[data-option-group-order-save]").click();
    await page.waitForTimeout(400);
    await openGroupRowMenu(page, "OG-002");
    await page.locator("[data-option-group-audit-open='OG-002']").click();
    await page.waitForTimeout(300);
    await expect(page.locator(".option-audit-entry").first()).toContainText("Group Reorder");
  });
});

// ==================== Q. GROUP AUDIT LOG (read-only view) ====================

test.describe("Group Audit Log view", () => {
  async function openGroupAudit(page, groupId) {
    await goToOptionMaster(page);
    await openGroupRowMenu(page, groupId);
    await page.locator(`.asset-row[data-option-group='${groupId}'] .row-menu-list [data-option-group-audit-open='${groupId}']`).click();
    await page.waitForTimeout(300);
  }

  test("123. group ที่ยังไม่มี audit → empty state", async ({ page }) => {
    await openGroupAudit(page, "OG-003");
    await expect(page.locator("#user-action-modal-title")).toHaveText("Audit Log");
    await expect(page.locator(".option-audit-empty")).toContainText("ยังไม่มีประวัติ audit สำหรับ group นี้");
  });

  test("124. audit summary แสดง Group ID / Group Key / Label (EN) / Status", async ({ page }) => {
    await openGroupAudit(page, "OG-001");
    const body = page.locator("#user-action-modal-body");
    await expect(body).toContainText("OG-001");
    await expect(body).toContainText("condition");
    await expect(body).toContainText("Condition");
    await expect(body.locator(".pill.green")).toContainText("Active");
  });

  test("125. หลัง edit group → audit GROUP_EDIT พร้อม before/after diff", async ({ page }) => {
    await goToOptionMaster(page);
    await openGroupRowMenu(page, "OG-002");
    await page.locator("[data-option-group-edit='OG-002']").click();
    await page.waitForTimeout(200);
    const form = page.locator("[data-option-group-form]");
    await form.locator("[data-option-group-name-th]").fill("อุปกรณ์ที่มาด้วย (แก้)");
    await form.locator("button[type='submit']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-option-group-edit-confirm]").click();
    await page.waitForTimeout(400);
    await openGroupRowMenu(page, "OG-002");
    await page.locator("[data-option-group-audit-open='OG-002']").click();
    await page.waitForTimeout(300);
    const entry = page.locator(".option-audit-entry").first();
    await expect(entry).toContainText("Group Edit");
    await expect(entry.locator(".option-audit-diff-before")).toContainText("อุปกรณ์ที่มาด้วย");
    await expect(entry.locator(".option-audit-diff-after")).toContainText("(แก้)");
  });

  test("126. audit เป็น read-only: ไม่มีปุ่ม action ใน modal", async ({ page }) => {
    await openGroupAudit(page, "OG-003");
    await expect(page.locator("#user-action-modal-body .user-detail-actions")).toHaveCount(0);
    await expect(page.locator("#user-action-modal-body button:not([data-user-action-modal-close])")).toHaveCount(0);
  });

  test("127. audit entry แสดง actor + access", async ({ page }) => {
    await goToOptionMaster(page);
    await openGroupRowMenu(page, "OG-002");
    await page.locator("[data-option-group-edit='OG-002']").click();
    await page.waitForTimeout(200);
    const form = page.locator("[data-option-group-form]");
    await form.locator("[data-option-group-name-th]").fill("อุปกรณ์ครบชุด");
    await form.locator("button[type='submit']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-option-group-edit-confirm]").click();
    await page.waitForTimeout(400);
    await openGroupRowMenu(page, "OG-002");
    await page.locator("[data-option-group-audit-open='OG-002']").click();
    await page.waitForTimeout(300);
    const entry = page.locator(".option-audit-entry").first();
    await expect(entry).toContainText("สมชาย รักงาน");
    await expect(entry).toContainText("Super Admin");
  });
});

// ==================== R. RESPONSIVE STRICT (ต่อ viewport) ====================

test.describe("Option Master — responsive strict", () => {
  test("128. mobile 390: filter bar ปิด → search ยังมองเห็น, advanced filter ซ่อน", async ({ page }) => {
    const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    test.skip(!isMobile, "เฉพาะ mobile");
    await goToOptionMaster(page);
    await expect(page.locator("#option-group-search")).toBeVisible();
    const bar = page.locator(".user-filter-bar.option-group-filter-bar");
    await expect(bar).toHaveAttribute("data-filter-open", "false");
  });

  test("129. mobile 390: ปุ่ม page actions (จัดเรียง/เพิ่ม Group) ยังกดได้", async ({ page }) => {
    const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    test.skip(!isMobile, "เฉพาะ mobile");
    await goToOptionMaster(page);
    await expect(page.locator("[data-option-group-add-open]")).toBeVisible();
    await page.locator("[data-option-group-add-open]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Add Group");
  });

  test("130. tablet 768: ตาราง group ยังเป็นตาราง (head แสดง)", async ({ page }) => {
    const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    test.skip(isMobile, "เฉพาะจอ > 760px");
    await goToOptionMaster(page);
    await expect(page.locator(".option-group-table .asset-row.head")).toBeVisible();
  });

  test("131. mobile 390: Option Detail card คง Sort Order + Status + System", async ({ page }) => {
    const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    test.skip(!isMobile, "เฉพาะ mobile");
    await goToOptionDetail(page, "OG-001");
    const row = page.locator(".asset-row[data-option-view='OPT-001']");
    await expect(row.locator(".asset-card-tags")).toContainText("Sort 10");
    await expect(row.locator(".asset-card-tags")).toContainText("System");
    await expect(row.locator(".user-card-meta")).toContainText("new_unworn");
  });

  test("132. filter state persistence: กลับจาก Option Detail → search คงเดิม (BO-UX-001)", async ({ page }) => {
    await goToOptionMaster(page);
    await page.locator("#option-group-search").fill("condition");
    await page.waitForTimeout(300);
    await page.locator(".asset-row[data-option-group='OG-001'] .asset-cell-primary").click();
    await page.waitForTimeout(300);
    await page.locator("[data-back-option-groups]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#option-group-search")).toHaveValue("condition");
    await expect(page.locator(".option-group-table .asset-row:not(.head)")).toHaveCount(1);
  });

  test("133. modal เปิด-ปิดซ้ำได้ (Add Option → ปิด → เปิดใหม่)", async ({ page }) => {
    await goToOptionDetail(page, "OG-001");
    await page.locator("[data-option-add-open]").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    await page.locator("[data-option-form] [data-user-action-modal-close]").first().click();
    await page.waitForTimeout(200);
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    await page.locator("[data-option-add-open]").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Add Option");
  });
});
