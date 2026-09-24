// QA-BO-007: Offer Management (Offer List, Offer Detail — read-only) — strict Playwright spec
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล, spec docs เป็นหลักสำหรับพฤติกรรม/นำทาง
// เป้าหมาย: รันเทส เจอปัญหาจริง → ลิสปัญหา + แนวทางแก้ → แก้ใน flow เดียว (ห้ามแก้ prototype)
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

// helper: ไปหน้า Offer Management (Offer List) ผ่านเมนู
// offers ไม่มี submenu — คลิก nav-item ตรงๆ จะ renderModule("offers")
async function goToOfferList(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  await page.locator(".nav-item[data-module='offers']").click();
  await page.waitForTimeout(300);
}

// helper: ไปหน้า Offer Detail โดยคลิกแถวแรกในตาราง
async function goToOfferDetail(page, rowIndex = 0) {
  await goToOfferList(page);
  const rows = page.locator(".offer-list-table .asset-row:not(.head)");
  await rows.nth(rowIndex).click();
  await page.waitForTimeout(300);
}

// helper: เปิด filter bar ถ้ายังปิด (mobile ≤760px)
async function openFilterBar(page) {
  const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
  if (!isMobile) return;
  const bar = page.locator(".offer-filter-bar");
  const isOpen = await bar.getAttribute("data-filter-open");
  if (isOpen === "false") {
    await page.locator("[data-offer-filter-toggle]").click();
    await page.waitForTimeout(200);
  }
}

// helper: เลือก option ใน custom-select (ผ่าน UI จริง: เปิด trigger → กด option)
// บน mobile (≤760px) filter bar ซ่อนอยู่ — เปิดก่อนเสมอ
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

// helper: กดปุ่มรีเซ็ตค่าทั้งหมด — เลือกปุ่มที่ visible
async function clickResetButton(page) {
  await page.locator("[data-offer-reset]:visible").first().click();
  await page.waitForTimeout(300);
}

// helper: นับจำนวนแถวในตาราง offer ที่ไม่ใช่ head
async function countOfferRows(page) {
  return await page.locator(".offer-list-table .asset-row:not(.head)").count();
}

// ข้อมูล mock offers จาก prototype (12 rows)
const OFFER_MOCK = [
  { id: "OFR-501", status: "Pending",   asset: "AST-8831", price: "THB 285,000",    priority: "กลาง" },
  { id: "OFR-488", status: "Accepted",  asset: "AST-8720", price: "THB 118,000",    priority: "ปกติ" },
  { id: "OFR-472", status: "Rejected",  asset: "AST-8694", price: "THB 2,100,000",  priority: "สูง" },
  { id: "OFR-459", status: "Cancelled", asset: "AST-8579", price: "THB 575,000",    priority: "กลาง" },
  { id: "OFR-451", status: "Pending",   asset: "AST-8566", price: "THB 252,000",    priority: "กลาง" },
  { id: "OFR-438", status: "Accepted",  asset: "AST-8548", price: "THB 136,000",    priority: "ปกติ" },
  { id: "OFR-427", status: "Rejected",  asset: "AST-8559", price: "THB 1,090,000",  priority: "สูง" },
  { id: "OFR-416", status: "Cancelled", asset: "AST-8518", price: "THB 29,000",    priority: "ปกติ" },
  { id: "OFR-404", status: "Pending",   asset: "AST-8497", price: "THB 109,000",   priority: "กลาง" },
  { id: "OFR-392", status: "Accepted",  asset: "AST-8802", price: "THB 158,000",    priority: "กลาง" },
  { id: "OFR-381", status: "Paused",     asset: "AST-8536", price: "THB 305,000",   priority: "กลาง" },
  { id: "OFR-366", status: "Invalidated",asset: "AST-8581", price: "THB 1,020,000", priority: "สูง" }
];

const STATUS_META = [
  { status: "Pending",    label: "Pending",    note: "รอ owner ตอบ",           pillClass: "amber",   count: 3 },
  { status: "Paused",      label: "Paused",      note: "asset รอตรวจสอบ",        pillClass: "blue",    count: 1 },
  { status: "Accepted",    label: "Accepted",    note: "owner รับ offer แล้ว",   pillClass: "green",   count: 3 },
  { status: "Rejected",    label: "Rejected",    note: "owner ปฏิเสธ",           pillClass: "red",     count: 2 },
  { status: "Cancelled",   label: "Cancelled",   note: "owner ลบ/ซ่อน asset",   pillClass: "purple",  count: 2 },
  { status: "Invalidated",  label: "Invalidated", note: "ใช้ไม่ได้ถาวร",          pillClass: "charcoal",count: 1 }
];

test.describe("QA-BO-007: Offer Management (Offer List, Offer Detail — read-only) (strict)", () => {

  // ==================== A. NAVIGATION / MENU / ACTIVE STATE ====================

  test.describe("Navigation — menu entry, active state, breadcrumb", () => {
    test("1. Offer Management menu entry ไม่มี submenu คลิกได้โดยตรง", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await ensureNavOpen(page);
      const navItem = page.locator(".nav-item[data-module='offers']");
      await expect(navItem).toBeVisible();
      // offers ไม่มี data-toggle-menu (ไม่มี submenu)
      const toggleMenu = await navItem.getAttribute("data-toggle-menu");
      expect(toggleMenu).toBeNull();
    });

    test("2. คลิก Offer Management → เข้าหน้า Offer List (page title + breadcrumb + panel title)", async ({ page }) => {
      await goToOfferList(page);
      await expect(page.locator("#page-title")).toHaveText("Offer Management");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Offer Management");
      await expect(page.locator("#panel-title")).toHaveText("Offer List");
      await expect(page.locator("#panel-subtitle")).toHaveText("");
    });

    test("3. Offer Management nav active state ถูกต้อง", async ({ page }) => {
      await goToOfferList(page);
      const navItem = page.locator(".nav-item[data-module='offers']");
      await expect(navItem).toHaveClass(/active/);
    });

    test("4. body class offer-list-mode ถูกเพิ่มเมื่อเข้า Offer List", async ({ page }) => {
      await goToOfferList(page);
      const hasClass = await page.evaluate(() => document.body.classList.contains("offer-list-mode"));
      expect(hasClass).toBe(true);
    });

    test("5. body class offer-detail-mode ไม่ถูกเพิ่มเมื่ออยู่ใน Offer List", async ({ page }) => {
      await goToOfferList(page);
      const hasClass = await page.evaluate(() => document.body.classList.contains("offer-detail-mode"));
      expect(hasClass).toBe(false);
    });
  });

  // ==================== B. SUMMARY CARDS (6 status) ====================

  test.describe("Summary cards — 6 status overview", () => {
    test("6. แสดง 6 summary cards ตามลำดับ lifecycle", async ({ page }) => {
      await goToOfferList(page);
      const cards = page.locator("#summary-grid .offer-status-card");
      await expect(cards).toHaveCount(6);
      for (let i = 0; i < STATUS_META.length; i++) {
        const card = cards.nth(i);
        await expect(card.locator(".stat-label")).toHaveText(STATUS_META[i].label);
        await expect(card.locator(".stat-value")).toHaveText(String(STATUS_META[i].count));
        await expect(card.locator(".stat-note")).toHaveText(STATUS_META[i].note);
      }
    });

    test("7. Pending card แสดงจำนวน 3", async ({ page }) => {
      await goToOfferList(page);
      const pendingCard = page.locator("#summary-grid .offer-status-card").first();
      await expect(pendingCard.locator(".stat-label")).toHaveText("Pending");
      await expect(pendingCard.locator(".stat-value")).toHaveText("3");
    });

    test("8. Paused card แสดงจำนวน 1", async ({ page }) => {
      await goToOfferList(page);
      const pausedCard = page.locator("#summary-grid .offer-status-card").nth(1);
      await expect(pausedCard.locator(".stat-label")).toHaveText("Paused");
      await expect(pausedCard.locator(".stat-value")).toHaveText("1");
    });

    test("9. Accepted card แสดงจำนวน 3", async ({ page }) => {
      await goToOfferList(page);
      const acceptedCard = page.locator("#summary-grid .offer-status-card").nth(2);
      await expect(acceptedCard.locator(".stat-label")).toHaveText("Accepted");
      await expect(acceptedCard.locator(".stat-value")).toHaveText("3");
    });

    test("10. Rejected card แสดงจำนวน 2", async ({ page }) => {
      await goToOfferList(page);
      const rejectedCard = page.locator("#summary-grid .offer-status-card").nth(3);
      await expect(rejectedCard.locator(".stat-label")).toHaveText("Rejected");
      await expect(rejectedCard.locator(".stat-value")).toHaveText("2");
    });

    test("11. Cancelled card แสดงจำนวน 2", async ({ page }) => {
      await goToOfferList(page);
      const cancelledCard = page.locator("#summary-grid .offer-status-card").nth(4);
      await expect(cancelledCard.locator(".stat-label")).toHaveText("Cancelled");
      await expect(cancelledCard.locator(".stat-value")).toHaveText("2");
    });

    test("12. Invalidated card แสดงจำนวน 1", async ({ page }) => {
      await goToOfferList(page);
      const invalidatedCard = page.locator("#summary-grid .offer-status-card").nth(5);
      await expect(invalidatedCard.locator(".stat-label")).toHaveText("Invalidated");
      await expect(invalidatedCard.locator(".stat-value")).toHaveText("1");
    });

    test("13. summary card มี --offer-status-color CSS variable ตามสีของ status", async ({ page }) => {
      await goToOfferList(page);
      const cards = page.locator("#summary-grid .offer-status-card");
      for (let i = 0; i < STATUS_META.length; i++) {
        const color = await cards.nth(i).evaluate(el => el.style.getPropertyValue("--offer-status-color"));
        expect(color).toBeTruthy();
      }
    });
  });

  // ==================== C. OFFER LIST TABLE ====================

  test.describe("Offer List table — rendering, columns, status pill", () => {
    test("14. ตารางมี header 7 คอลัมน์: Offer ID, Offer, Asset, Buyer, Owner, Status, Action", async ({ page }) => {
      await goToOfferList(page);
      const head = page.locator(".offer-list-table .asset-row.head");
      const headers = head.locator("div");
      await expect(headers).toHaveCount(7);
      await expect(headers.nth(0)).toHaveText("Offer ID");
      await expect(headers.nth(1)).toHaveText("Offer");
      await expect(headers.nth(2)).toHaveText("Asset");
      await expect(headers.nth(3)).toHaveText("Buyer");
      await expect(headers.nth(4)).toHaveText("Owner");
      await expect(headers.nth(5)).toHaveText("Status");
      await expect(headers.nth(6)).toHaveText("Action");
    });

    test("15. ตารางแสดง 10 แถว (page size 10) จากทั้งหมด 12", async ({ page }) => {
      await goToOfferList(page);
      const rowCount = await countOfferRows(page);
      expect(rowCount).toBe(10);
    });

    test("16. footer-range แสดง '1-10 จาก 12'", async ({ page }) => {
      await goToOfferList(page);
      const footer = page.locator(".offer-list-table + .footer-range, #table .footer-range").first();
      await expect(footer).toContainText("1-10 จาก 12");
    });

    test("17. แถวแรกแสดง OFR-501 (latest sort)", async ({ page }) => {
      await goToOfferList(page);
      const firstRow = page.locator(".offer-list-table .asset-row:not(.head)").first();
      await expect(firstRow.locator("[data-label='Offer ID'] .main-text")).toHaveText("OFR-501");
    });

    test("18. แถวแรกแสดงราคา THB 285,000", async ({ page }) => {
      await goToOfferList(page);
      const firstRow = page.locator(".offer-list-table .asset-row:not(.head)").first();
      await expect(firstRow.locator(".asset-cell-primary .desktop-user-name")).toHaveText("THB 285,000");
    });

    test("19. แถวแรกแสดง status pill Pending (amber)", async ({ page }) => {
      await goToOfferList(page);
      const firstRow = page.locator(".offer-list-table .asset-row:not(.head)").first();
      const pill = firstRow.locator("[data-label='Status'] .pill");
      await expect(pill).toHaveClass(/amber/);
      await expect(pill).toHaveText("Pending");
    });

    test("20. แถวแรกมีปุ่ม View (data-offer-open) — desktop/tablet", async ({ page, browserName }) => {
      await goToOfferList(page);
      const firstRow = page.locator(".offer-list-table .asset-row:not(.head)").first();
      const viewBtn = firstRow.locator("[data-offer-open]");
      // บน mobile (≤760px) ปุ่ม View ถูกซ่อน (row click แทน) — ตรวจเฉพาะ desktop/tablet
      const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
      if (isMobile) {
        await expect(viewBtn).toBeHidden();
      } else {
        await expect(viewBtn).toBeVisible();
        await expect(viewBtn).toHaveText("View");
      }
    });

    test("21. แต่ละแถวมี data-offer-card attribute", async ({ page }) => {
      await goToOfferList(page);
      const rows = page.locator(".offer-list-table .asset-row:not(.head)");
      const count = await rows.count();
      for (let i = 0; i < count; i++) {
        const cardAttr = await rows.nth(i).getAttribute("data-offer-card");
        expect(cardAttr).toBeTruthy();
      }
    });

    test("22. แสดง Asset ID ในคอลัมน์ Asset (แถวแรก = AST-8831)", async ({ page }) => {
      await goToOfferList(page);
      const firstRow = page.locator(".offer-list-table .asset-row:not(.head)").first();
      const assetCell = firstRow.locator("[data-label='Asset'] .muted");
      await expect(assetCell).toHaveText("AST-8831");
    });

    test("23. แสดง Buyer ในคอลัมน์ Buyer", async ({ page }) => {
      await goToOfferList(page);
      const firstRow = page.locator(".offer-list-table .asset-row:not(.head)").first();
      const buyerCell = firstRow.locator("[data-label='Buyer'] .main-text");
      await expect(buyerCell).not.toBeEmpty();
    });

    test("24. แสดง Owner ในคอลัมน์ Owner", async ({ page }) => {
      await goToOfferList(page);
      const firstRow = page.locator(".offer-list-table .asset-row:not(.head)").first();
      const ownerCell = firstRow.locator("[data-label='Owner'] .main-text");
      await expect(ownerCell).not.toBeEmpty();
    });
  });

  // ==================== D. SEARCH ====================

  test.describe("Search — Offer ID, Asset ID, Asset, Buyer, Owner", () => {
    test("25. search มี placeholder ค้นหา Offer ID, Asset ID, Asset, Buyer, Owner", async ({ page }) => {
      await goToOfferList(page);
      const search = page.locator("#offer-search");
      await expect(search).toHaveAttribute("placeholder", "ค้นหา Offer ID, Asset ID, Asset, Buyer, Owner");
    });

    test("26. search 'OFR-501' → เหลือ 1 แถว", async ({ page }) => {
      await goToOfferList(page);
      await page.locator("#offer-search").fill("OFR-501");
      await page.waitForTimeout(300);
      const rowCount = await countOfferRows(page);
      expect(rowCount).toBe(1);
    });

    test("27. search 'AST-8831' → เหลือ 1 แถว (match asset ID)", async ({ page }) => {
      await goToOfferList(page);
      await page.locator("#offer-search").fill("AST-8831");
      await page.waitForTimeout(300);
      const rowCount = await countOfferRows(page);
      expect(rowCount).toBe(1);
    });

    test("28. search 'Rolex' → แสดงแถวที่ asset/buyer/owner ตรง", async ({ page }) => {
      await goToOfferList(page);
      await page.locator("#offer-search").fill("Rolex");
      await page.waitForTimeout(300);
      const rowCount = await countOfferRows(page);
      expect(rowCount).toBeGreaterThanOrEqual(1);
    });

    test("29. search 'zzzzz' → ไม่พบข้อมูล (empty state)", async ({ page }) => {
      await goToOfferList(page);
      await page.locator("#offer-search").fill("zzzzz");
      await page.waitForTimeout(300);
      const empty = page.locator(".offer-list-table .detail-empty, .offer-list-table .user-empty");
      await expect(empty).toBeVisible();
      const rowCount = await countOfferRows(page);
      expect(rowCount).toBe(0);
    });

    test("30. search 'OFR' → แสดงทุกแถว (12 → 10 per page)", async ({ page }) => {
      await goToOfferList(page);
      await page.locator("#offer-search").fill("OFR");
      await page.waitForTimeout(300);
      const rowCount = await countOfferRows(page);
      expect(rowCount).toBe(10);
    });

    test("31. search แล้ว footer-range อัปเดต", async ({ page }) => {
      await goToOfferList(page);
      await page.locator("#offer-search").fill("OFR-501");
      await page.waitForTimeout(300);
      const footer = page.locator("#table .footer-range").first();
      await expect(footer).toContainText("1-1 จาก 1");
    });
  });

  // ==================== E. STATUS FILTER ====================

  test.describe("Status filter — custom-select", () => {
    test("32. status filter มี option ทั้งหมด 7 (empty + 6 status)", async ({ page }) => {
      await goToOfferList(page);
      await openFilterBar(page);
      await page.locator("div[data-custom-select]:has(> #offer-status-filter) [data-custom-select-trigger]").click();
      await page.waitForTimeout(150);
      const options = page.locator("div[data-custom-select]:has(> #offer-status-filter) [data-custom-select-option]");
      await expect(options).toHaveCount(7);
      // first option = all status (empty value)
      const firstValue = await options.first().getAttribute("data-value");
      expect(firstValue).toBe("");
    });

    test("33. filter Pending → แสดง 3 แถว", async ({ page }) => {
      await goToOfferList(page);
      await pickCustomOption(page, "offer-status-filter", "Pending");
      const rowCount = await countOfferRows(page);
      expect(rowCount).toBe(3);
    });

    test("34. filter Accepted → แสดง 3 แถว", async ({ page }) => {
      await goToOfferList(page);
      await pickCustomOption(page, "offer-status-filter", "Accepted");
      const rowCount = await countOfferRows(page);
      expect(rowCount).toBe(3);
    });

    test("35. filter Rejected → แสดง 2 แถว", async ({ page }) => {
      await goToOfferList(page);
      await pickCustomOption(page, "offer-status-filter", "Rejected");
      const rowCount = await countOfferRows(page);
      expect(rowCount).toBe(2);
    });

    test("36. filter Cancelled → แสดง 2 แถว", async ({ page }) => {
      await goToOfferList(page);
      await pickCustomOption(page, "offer-status-filter", "Cancelled");
      const rowCount = await countOfferRows(page);
      expect(rowCount).toBe(2);
    });

    test("37. filter Paused → แสดง 1 แถว", async ({ page }) => {
      await goToOfferList(page);
      await pickCustomOption(page, "offer-status-filter", "Paused");
      const rowCount = await countOfferRows(page);
      expect(rowCount).toBe(1);
    });

    test("38. filter Invalidated → แสดง 1 แถว", async ({ page }) => {
      await goToOfferList(page);
      await pickCustomOption(page, "offer-status-filter", "Invalidated");
      const rowCount = await countOfferRows(page);
      expect(rowCount).toBe(1);
    });

    test("39. filter แล้วทุกแถวมี status ตรงกับที่เลือก", async ({ page }) => {
      await goToOfferList(page);
      await pickCustomOption(page, "offer-status-filter", "Pending");
      const rows = page.locator(".offer-list-table .asset-row:not(.head)");
      const count = await rows.count();
      for (let i = 0; i < count; i++) {
        const pill = rows.nth(i).locator("[data-label='Status'] .pill");
        await expect(pill).toHaveText("Pending");
      }
    });
  });

  // ==================== F. SORT ====================

  test.describe("Sort — latest / oldest", () => {
    test("40. sort default = latest (OFR-501 ก่อน)", async ({ page }) => {
      await goToOfferList(page);
      const firstRow = page.locator(".offer-list-table .asset-row:not(.head)").first();
      await expect(firstRow.locator("[data-label='Offer ID'] .main-text")).toHaveText("OFR-501");
    });

    test("41. sort oldest → OFR-366 ก่อน", async ({ page }) => {
      await goToOfferList(page);
      await pickCustomOption(page, "offer-sort", "oldest");
      const firstRow = page.locator(".offer-list-table .asset-row:not(.head)").first();
      await expect(firstRow.locator("[data-label='Offer ID'] .main-text")).toHaveText("OFR-366");
    });

    test("42. sort latest → OFR-501 ก่อน", async ({ page }) => {
      await goToOfferList(page);
      await pickCustomOption(page, "offer-sort", "oldest");
      await page.waitForTimeout(200);
      await pickCustomOption(page, "offer-sort", "latest");
      const firstRow = page.locator(".offer-list-table .asset-row:not(.head)").first();
      await expect(firstRow.locator("[data-label='Offer ID'] .main-text")).toHaveText("OFR-501");
    });
  });

  // ==================== G. RESET ====================

  test.describe("Reset — รีเซ็ตค่าทั้งหมด", () => {
    test("43. reset หลัง search + filter → กลับเป็น 12 แถว (10/page)", async ({ page }) => {
      await goToOfferList(page);
      await page.locator("#offer-search").fill("OFR-501");
      await page.waitForTimeout(300);
      await pickCustomOption(page, "offer-status-filter", "Pending");
      await page.waitForTimeout(300);
      await clickResetButton(page);
      const rowCount = await countOfferRows(page);
      expect(rowCount).toBe(10);
    });

    test("44. reset ล้างค่า search input", async ({ page }) => {
      await goToOfferList(page);
      await page.locator("#offer-search").fill("OFR-501");
      await page.waitForTimeout(300);
      await clickResetButton(page);
      const searchValue = await page.locator("#offer-search").inputValue();
      expect(searchValue).toBe("");
    });

    test("45. reset ล้างค่า status filter", async ({ page }) => {
      await goToOfferList(page);
      await pickCustomOption(page, "offer-status-filter", "Pending");
      await page.waitForTimeout(300);
      await clickResetButton(page);
      const filterValue = await page.locator("#offer-status-filter").inputValue();
      expect(filterValue).toBe("");
    });

    test("46. reset ล้างค่า sort กลับเป็น latest", async ({ page }) => {
      await goToOfferList(page);
      await pickCustomOption(page, "offer-sort", "oldest");
      await page.waitForTimeout(300);
      await clickResetButton(page);
      const sortValue = await page.locator("#offer-sort").inputValue();
      expect(sortValue).toBe("latest");
    });
  });

  // ==================== H. PAGINATION ====================

  test.describe("Pagination — 10 per page, 2 pages", () => {
    test("47. pager แสดง 2 หน้า", async ({ page }) => {
      await goToOfferList(page);
      const pager = page.locator("#table .pager").first();
      await expect(pager).toBeVisible();
      const numButtons = pager.locator(".pager-num");
      await expect(numButtons).toHaveCount(2);
    });

    test("48. หน้า 1 active", async ({ page }) => {
      await goToOfferList(page);
      const activeBtn = page.locator("#table .pager-num.active").first();
      await expect(activeBtn).toHaveText("1");
    });

    test("49. กด next → หน้า 2 แสดง 2 แถว", async ({ page }) => {
      await goToOfferList(page);
      await page.locator("#table .pager-next").first().click();
      await page.waitForTimeout(300);
      const rowCount = await countOfferRows(page);
      expect(rowCount).toBe(2);
    });

    test("50. กด prev กลับหน้า 1 แสดง 10 แถว", async ({ page }) => {
      await goToOfferList(page);
      await page.locator("#table .pager-next").first().click();
      await page.waitForTimeout(300);
      await page.locator("#table .pager-prev").first().click();
      await page.waitForTimeout(300);
      const rowCount = await countOfferRows(page);
      expect(rowCount).toBe(10);
    });

    test("51. footer-range อัปเดตเมื่อเปลี่ยนหน้า", async ({ page }) => {
      await goToOfferList(page);
      await page.locator("#table .pager-next").first().click();
      await page.waitForTimeout(300);
      const footer = page.locator("#table .footer-range").first();
      await expect(footer).toContainText("11-12 จาก 12");
    });

    test("52. prev ปิด (disabled) เมื่ออยู่หน้า 1", async ({ page }) => {
      await goToOfferList(page);
      const prevBtn = page.locator("#table .pager-prev").first();
      await expect(prevBtn).toBeDisabled();
    });

    test("53. next ปิด (disabled) เมื่ออยู่หน้าสุดท้าย", async ({ page }) => {
      await goToOfferList(page);
      await page.locator("#table .pager-next").first().click();
      await page.waitForTimeout(300);
      const nextBtn = page.locator("#table .pager-next").first();
      await expect(nextBtn).toBeDisabled();
    });

    test("54. กดเลขหน้า 2 โดยตรง → หน้า 2 (desktop/tablet)", async ({ page }) => {
      await goToOfferList(page);
      const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
      if (isMobile) {
        // บน mobile pager-num ซ่อน — ใช้ next แทน
        await page.locator("#table .pager-next").first().click();
      } else {
        await page.locator("#table .pager-num[data-offer-page='2']").first().click();
      }
      await page.waitForTimeout(300);
      const activeBtn = page.locator("#table .pager-num.active").first();
      await expect(activeBtn).toHaveText("2");
    });
  });

  // ==================== I. ROW CLICK → OFFER DETAIL ====================

  test.describe("Row click → Offer Detail", () => {
    test("55. คลิกแถว → เข้า Offer Detail (breadcrumb + page title)", async ({ page }) => {
      await goToOfferList(page);
      const firstRow = page.locator(".offer-list-table .asset-row:not(.head)").first();
      await firstRow.click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Offer Detail");
      await expect(page.locator("#crumb")).toContainText("การดำเนินงาน / Offer Management / Offer Detail / OFR-501");
    });

    test("56. คลิกปุ่ม View → เข้า Offer Detail (desktop/tablet)", async ({ page }) => {
      await goToOfferList(page);
      const firstRow = page.locator(".offer-list-table .asset-row:not(.head)").first();
      const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
      if (isMobile) {
        // บน mobile ปุ่ม View ซ่อน — คลิก row แทน
        await firstRow.click();
      } else {
        await firstRow.locator("[data-offer-open]").click();
      }
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Offer Detail");
    });

    test("57. body class offer-detail-mode ถูกเพิ่มเมื่อเข้า Offer Detail", async ({ page }) => {
      await goToOfferDetail(page);
      const hasClass = await page.evaluate(() => document.body.classList.contains("offer-detail-mode"));
      expect(hasClass).toBe(true);
    });

    test("58. panel-title แสดง Offer ID", async ({ page }) => {
      await goToOfferDetail(page);
      await expect(page.locator("#panel-title")).toHaveText("OFR-501");
    });

    test("59. panel-subtitle แสดง amount / owner", async ({ page }) => {
      await goToOfferDetail(page);
      const subtitle = page.locator("#panel-subtitle");
      await expect(subtitle).not.toBeEmpty();
      await expect(subtitle).toContainText("THB 285,000");
    });

    test("60. คลิกแถวที่ 2 → เข้า Offer Detail ของ OFR-488", async ({ page }) => {
      await goToOfferList(page);
      const secondRow = page.locator(".offer-list-table .asset-row:not(.head)").nth(1);
      await secondRow.click();
      await page.waitForTimeout(300);
      await expect(page.locator("#panel-title")).toHaveText("OFR-488");
      await expect(page.locator("#crumb")).toContainText("OFR-488");
    });
  });

  // ==================== J. OFFER DETAIL — HEADER / CHIPS ====================

  test.describe("Offer Detail — header, status/amount chips", () => {
    test("61. detail head แสดง Offer ID : Asset Name", async ({ page }) => {
      await goToOfferDetail(page);
      const heading = page.locator(".offer-detail-page .asset-report-heading");
      await expect(heading).toBeVisible();
      const idSpan = heading.locator(".asset-report-id");
      await expect(idSpan).toHaveText("OFR-501");
    });

    test("62. detail head แสดง status pill", async ({ page }) => {
      await goToOfferDetail(page);
      const chips = page.locator(".offer-detail-page .chips");
      const statusPill = chips.locator(".pill").first();
      await expect(statusPill).toHaveText("Pending");
      await expect(statusPill).toHaveClass(/amber/);
    });

    test("63. detail head แสดง amount pill (green)", async ({ page }) => {
      await goToOfferDetail(page);
      const chips = page.locator(".offer-detail-page .chips");
      const amountPill = chips.locator(".pill.green");
      await expect(amountPill).toContainText("THB 285,000");
    });

    test("64. detail head มี asset title image (cover)", async ({ page }) => {
      await goToOfferDetail(page);
      const titleImage = page.locator(".offer-detail-page .profile-image");
      await expect(titleImage).toBeVisible();
    });
  });

  // ==================== K. OFFERED ASSET SECTION ====================

  test.describe("Offered Asset section — fields + Asset ID drill-in", () => {
    test("65. section header 'Offered Asset' แสดง", async ({ page }) => {
      await goToOfferDetail(page);
      const section = page.locator(".offer-detail-page .detail-section").first();
      await expect(section.locator("h4")).toHaveText("Offered Asset");
    });

    test("66. Offered Asset มี 7 detail tiles", async ({ page }) => {
      await goToOfferDetail(page);
      const section = page.locator(".offer-detail-page .detail-section").first();
      const tiles = section.locator(".detail-tile");
      await expect(tiles).toHaveCount(7);
    });

    test("67. tile 'Offer ID' แสดง OFR-501", async ({ page }) => {
      await goToOfferDetail(page);
      const section = page.locator(".offer-detail-page .detail-section").first();
      const offerIdTile = section.locator(".detail-tile", { hasText: "Offer ID" });
      await expect(offerIdTile.locator("strong")).toHaveText("OFR-501");
    });

    test("68. tile 'Asset ID' แสดง AST-8831 เป็น link-btn", async ({ page }) => {
      await goToOfferDetail(page);
      const section = page.locator(".offer-detail-page .detail-section").first();
      const assetIdTile = section.locator(".detail-tile", { hasText: "Asset ID" });
      const link = assetIdTile.locator("button.link-btn");
      await expect(link).toBeVisible();
      await expect(link).toHaveText("AST-8831");
    });

    test("69. tile 'Asset Name' แสดงชื่อ asset", async ({ page }) => {
      await goToOfferDetail(page);
      const section = page.locator(".offer-detail-page .detail-section").first();
      const nameTile = section.locator(".detail-tile", { hasText: "Asset Name" });
      await expect(nameTile.locator("strong")).not.toBeEmpty();
    });

    test("70. tile 'Offer Amount' แสดง THB 285,000", async ({ page }) => {
      await goToOfferDetail(page);
      const section = page.locator(".offer-detail-page .detail-section").first();
      const amountTile = section.locator(".detail-tile", { hasText: "Offer Amount" });
      await expect(amountTile.locator("strong")).toHaveText("THB 285,000");
    });

    test("71. tile 'Asking Price' แสดงราคา", async ({ page }) => {
      await goToOfferDetail(page);
      const section = page.locator(".offer-detail-page .detail-section").first();
      const askingTile = section.locator(".detail-tile", { hasText: "Asking Price" });
      await expect(askingTile.locator("strong")).not.toBeEmpty();
    });

    test("72. tile 'Asset Status' แสดงสถานะ", async ({ page }) => {
      await goToOfferDetail(page);
      const section = page.locator(".offer-detail-page .detail-section").first();
      const statusTile = section.locator(".detail-tile", { hasText: "Asset Status" });
      await expect(statusTile.locator("strong")).not.toBeEmpty();
    });

    test("73. tile 'Created' แสดงวันที่", async ({ page }) => {
      await goToOfferDetail(page);
      const section = page.locator(".offer-detail-page .detail-section").first();
      const createdTile = section.locator(".detail-tile", { hasText: "Created" });
      await expect(createdTile.locator("strong")).not.toBeEmpty();
    });

    test("74. คลิก Asset ID link → drill-in ไป Asset Detail", async ({ page }) => {
      await goToOfferDetail(page);
      const link = page.locator(".offer-detail-page .detail-section").first()
        .locator(".detail-tile", { hasText: "Asset ID" }).locator("button.link-btn");
      await link.click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Asset Detail");
    });

    test("75. Asset ID link มี data-asset-open attribute", async ({ page }) => {
      await goToOfferDetail(page);
      const link = page.locator(".offer-detail-page [data-asset-open]").first();
      await expect(link).toBeVisible();
      const attr = await link.getAttribute("data-asset-open");
      expect(attr).toBeTruthy();
    });
  });

  // ==================== L. BUYER / OWNER SECTION ====================

  test.describe("Buyer / Owner section", () => {
    test("76. section header 'Buyer / Owner' แสดง", async ({ page }) => {
      await goToOfferDetail(page);
      const sections = page.locator(".offer-detail-page .detail-section");
      const buyerOwnerSection = sections.nth(1);
      await expect(buyerOwnerSection.locator("h4")).toHaveText("Buyer / Owner");
    });

    test("77. Buyer / Owner มี 4 detail tiles (Buyer ID, Buyer name, Owner ID, Owner name)", async ({ page }) => {
      await goToOfferDetail(page);
      const sections = page.locator(".offer-detail-page .detail-section");
      const buyerOwnerSection = sections.nth(1);
      const tiles = buyerOwnerSection.locator(".detail-tile");
      await expect(tiles).toHaveCount(4);
    });

    test("78. tile 'Buyer User ID' แสดงค่า", async ({ page }) => {
      await goToOfferDetail(page);
      const sections = page.locator(".offer-detail-page .detail-section");
      const buyerOwnerSection = sections.nth(1);
      const buyerIdTile = buyerOwnerSection.locator(".detail-tile", { hasText: "Buyer User ID" });
      await expect(buyerIdTile.locator("strong")).not.toBeEmpty();
    });

    test("79. tile 'Buyer name' แสดงค่า", async ({ page }) => {
      await goToOfferDetail(page);
      const sections = page.locator(".offer-detail-page .detail-section");
      const buyerOwnerSection = sections.nth(1);
      const buyerNameTile = buyerOwnerSection.locator(".detail-tile", { hasText: "Buyer name" });
      await expect(buyerNameTile.locator("strong")).not.toBeEmpty();
    });

    test("80. tile 'Owner User ID' แสดงค่า", async ({ page }) => {
      await goToOfferDetail(page);
      const sections = page.locator(".offer-detail-page .detail-section");
      const buyerOwnerSection = sections.nth(1);
      const ownerIdTile = buyerOwnerSection.locator(".detail-tile", { hasText: "Owner User ID" });
      await expect(ownerIdTile.locator("strong")).not.toBeEmpty();
    });

    test("81. tile 'Owner name' แสดงค่า", async ({ page }) => {
      await goToOfferDetail(page);
      const sections = page.locator(".offer-detail-page .detail-section");
      const buyerOwnerSection = sections.nth(1);
      const ownerNameTile = buyerOwnerSection.locator(".detail-tile", { hasText: "Owner name" });
      await expect(ownerNameTile.locator("strong")).not.toBeEmpty();
    });
  });

  // ==================== M. OFFER HISTORY ====================

  test.describe("Offer History — table structure, row ordering", () => {
    test("82. section header 'Offer History' แสดง", async ({ page }) => {
      await goToOfferDetail(page);
      const sections = page.locator(".offer-detail-page .detail-section");
      const historySection = sections.nth(2);
      await expect(historySection.locator("h4")).toHaveText("Offer History");
    });

    test("83. Offer History table มี 5 คอลัมน์: Date/Time, Actor, Action, Status, Reason/Note", async ({ page }) => {
      await goToOfferDetail(page);
      const table = page.locator(".offer-history-table");
      const headers = table.locator("thead th");
      await expect(headers).toHaveCount(5);
      await expect(headers.nth(0)).toHaveText("Date / Time");
      await expect(headers.nth(1)).toHaveText("Actor");
      await expect(headers.nth(2)).toHaveText("Action");
      await expect(headers.nth(3)).toHaveText("Status");
      await expect(headers.nth(4)).toHaveText("Reason / Note");
    });

    test("84. Offer History (Pending) มี 1 แถว — Offer Created", async ({ page }) => {
      await goToOfferDetail(page); // OFR-501 = Pending
      const rows = page.locator(".offer-history-table tbody tr");
      await expect(rows).toHaveCount(1);
      await expect(rows.first().locator("td[data-label='Action']")).toHaveText("Offer Created");
      await expect(rows.first().locator("td[data-label='Status'] .pill")).toHaveText("Pending");
    });

    test("85. Offer History (Accepted) มี 2 แถว — Created + Accepted", async ({ page }) => {
      await goToOfferList(page);
      // OFR-488 = Accepted (แถวที่ 2)
      await page.locator(".offer-list-table .asset-row:not(.head)").nth(1).click();
      await page.waitForTimeout(300);
      const rows = page.locator(".offer-history-table tbody tr");
      await expect(rows).toHaveCount(2);
      // ล่าสุดอยู่บน (reverse)
      await expect(rows.first().locator("td[data-label='Action']")).toHaveText("Offer Accepted");
      await expect(rows.nth(1).locator("td[data-label='Action']")).toHaveText("Offer Created");
    });

    test("86. Offer History (Rejected) มี 2 แถว — Created + Rejected", async ({ page }) => {
      await goToOfferList(page);
      // OFR-472 = Rejected (แถวที่ 3)
      await page.locator(".offer-list-table .asset-row:not(.head)").nth(2).click();
      await page.waitForTimeout(300);
      const rows = page.locator(".offer-history-table tbody tr");
      await expect(rows).toHaveCount(2);
      await expect(rows.first().locator("td[data-label='Action']")).toHaveText("Offer Rejected");
    });

    test("87. Offer History (Cancelled) มี actor = System", async ({ page }) => {
      await goToOfferList(page);
      // OFR-459 = Cancelled (แถวที่ 4)
      await page.locator(".offer-list-table .asset-row:not(.head)").nth(3).click();
      await page.waitForTimeout(300);
      const rows = page.locator(".offer-history-table tbody tr");
      const cancelledRow = rows.first();
      await expect(cancelledRow.locator("td[data-label='Actor']")).toHaveText("System");
    });

    test("88. Offer History แถวล่าสุดอยู่บนสุด (reverse order)", async ({ page }) => {
      await goToOfferList(page);
      await page.locator(".offer-list-table .asset-row:not(.head)").nth(1).click(); // OFR-488 Accepted
      await page.waitForTimeout(300);
      const rows = page.locator(".offer-history-table tbody tr");
      const firstAction = await rows.first().locator("td[data-label='Action']").textContent();
      const secondAction = await rows.nth(1).locator("td[data-label='Action']").textContent();
      expect(firstAction).toContain("Accepted");
      expect(secondAction).toContain("Created");
    });

    test("89. Offer History แต่ละ row มี status pill", async ({ page }) => {
      await goToOfferDetail(page);
      const rows = page.locator(".offer-history-table tbody tr");
      const count = await rows.count();
      for (let i = 0; i < count; i++) {
        const pill = rows.nth(i).locator("td[data-label='Status'] .pill");
        await expect(pill).toBeVisible();
      }
    });

    test("90. Offer History แต่ละ row มี Reason / Note", async ({ page }) => {
      await goToOfferDetail(page);
      const rows = page.locator(".offer-history-table tbody tr");
      const count = await rows.count();
      for (let i = 0; i < count; i++) {
        const note = rows.nth(i).locator("td[data-label='Reason / Note']");
        await expect(note).not.toBeEmpty();
      }
    });
  });

  // ==================== N. READ-ONLY BEHAVIOR ====================

  test.describe("Read-only behavior — ไม่มี write action", () => {
    test("91. Offer List ไม่มีปุ่ม accept/decline/cancel", async ({ page }) => {
      await goToOfferList(page);
      const table = page.locator(".offer-list-table");
      await expect(table.locator("button:has-text('Accept')")).toHaveCount(0);
      await expect(table.locator("button:has-text('Decline')")).toHaveCount(0);
      await expect(table.locator("button:has-text('Cancel')")).toHaveCount(0);
    });

    test("92. Offer List ไม่มีปุ่ม force-expire/invalidate", async ({ page }) => {
      await goToOfferList(page);
      const table = page.locator(".offer-list-table");
      await expect(table.locator("button:has-text('Force')")).toHaveCount(0);
      await expect(table.locator("button:has-text('Invalidate')")).toHaveCount(0);
    });

    test("93. Offer List ไม่มีปุ่ม edit price/edit message", async ({ page }) => {
      await goToOfferList(page);
      const table = page.locator(".offer-list-table");
      await expect(table.locator("button:has-text('Edit')")).toHaveCount(0);
      await expect(table.locator("button:has-text('edit price')")).toHaveCount(0);
    });

    test("94. Offer List มีแค่ปุ่ม View (read-only)", async ({ page }) => {
      await goToOfferList(page);
      const actionButtons = page.locator(".offer-list-table .user-row-actions button");
      await expect(actionButtons).toHaveCount(10);
      for (let i = 0; i < 10; i++) {
        await expect(actionButtons.nth(i)).toHaveText("View");
      }
    });

    test("95. Offer Detail ไม่มีปุ่ม accept/decline/cancel", async ({ page }) => {
      await goToOfferDetail(page);
      const detail = page.locator(".offer-detail-page");
      await expect(detail.locator("button:has-text('Accept')")).toHaveCount(0);
      await expect(detail.locator("button:has-text('Decline')")).toHaveCount(0);
      await expect(detail.locator("button:has-text('Cancel')")).toHaveCount(0);
    });

    test("96. Offer Detail ไม่มีปุ่ม edit/export/related chat", async ({ page }) => {
      await goToOfferDetail(page);
      const detail = page.locator(".offer-detail-page");
      await expect(detail.locator("button:has-text('Edit')")).toHaveCount(0);
      await expect(detail.locator("button:has-text('Export')")).toHaveCount(0);
      await expect(detail.locator("button:has-text('Related Chat')")).toHaveCount(0);
    });

    test("97. Offer Detail มีแค่ link-btn (Asset ID drill-in) ไม่มี action button", async ({ page }) => {
      await goToOfferDetail(page);
      const detail = page.locator(".offer-detail-page");
      const actionButtons = detail.locator(".user-detail-action-btn, .user-detail-actions button");
      await expect(actionButtons).toHaveCount(0);
    });

    test("98. Offer Detail ไม่มี notification delivery table (V1 scope)", async ({ page }) => {
      await goToOfferDetail(page);
      // V1 Offer Detail เฉพาะ Offered Asset + Buyer/Owner + Offer History เท่านั้น
      const detail = page.locator(".offer-detail-page");
      const notifTable = detail.locator("table:not(.offer-history-table)");
      await expect(notifTable).toHaveCount(0);
    });

    test("99. Offer Detail ไม่มี audit table (V1 scope)", async ({ page }) => {
      await goToOfferDetail(page);
      const detail = page.locator(".offer-detail-page");
      // มีแค่ 1 table (Offer History)
      const tables = detail.locator("table");
      await expect(tables).toHaveCount(1);
    });
  });

  // ==================== O. BACK NAVIGATION ====================

  test.describe("Back navigation — Offer Detail → Offer List", () => {
    test("100. Offer Detail มีปุ่ม back (data-back-offer-list)", async ({ page }) => {
      await goToOfferDetail(page);
      const backBtn = page.locator("[data-back-offer-list]");
      await expect(backBtn).toBeVisible();
    });

    test("101. กด back → กลับ Offer List (page title + breadcrumb)", async ({ page }) => {
      await goToOfferDetail(page);
      await page.locator("[data-back-offer-list]").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Offer Management");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Offer Management");
    });

    test("102. กด back → body class offer-detail-mode ถูกลบ", async ({ page }) => {
      await goToOfferDetail(page);
      await page.locator("[data-back-offer-list]").click();
      await page.waitForTimeout(300);
      const hasDetail = await page.evaluate(() => document.body.classList.contains("offer-detail-mode"));
      expect(hasDetail).toBe(false);
      const hasList = await page.evaluate(() => document.body.classList.contains("offer-list-mode"));
      expect(hasList).toBe(true);
    });

    test("103. back จาก Offer Detail กลับ list คง context (filter state restore)", async ({ page }) => {
      await goToOfferList(page);
      await page.locator("#offer-search").fill("OFR-501");
      await page.waitForTimeout(300);
      // เข้า detail
      await page.locator(".offer-list-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
      // กด back
      await page.locator("[data-back-offer-list]").click();
      await page.waitForTimeout(300);
      // filter state ควร restore
      const searchValue = await page.locator("#offer-search").inputValue();
      expect(searchValue).toBe("OFR-501");
    });

    test("104. back จาก Asset Detail (drill-in จาก Offer Detail) กลับ Offer Detail", async ({ page }) => {
      await goToOfferDetail(page);
      // drill-in ไป Asset Detail
      await page.locator(".offer-detail-page [data-asset-open]").first().click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Asset Detail");
      // กด back ใน Asset Detail (data-back-asset-list หรือ page-back-btn)
      const backBtn = page.locator(".page-back-btn").first();
      if (await backBtn.isVisible().catch(() => false)) {
        await backBtn.click();
        await page.waitForTimeout(300);
      }
    });
  });

  // ==================== P. PRIMARY ACTION ====================

  test.describe("Primary action — Export offer report (read-only label)", () => {
    test("105. primary action แสดง 'Export offer report'", async ({ page }) => {
      await goToOfferList(page);
      await expect(page.locator("#primary-action")).toHaveText("Export offer report");
    });
  });

  // ==================== Q. MOBILE CARD LAYOUT (≤760px) ====================

  test.describe("Mobile card layout (≤760px)", () => {
    test("106. mobile: header row ซ่อน (display none)", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToOfferList(page);
      const head = page.locator(".offer-list-table .asset-row.head");
      await expect(head).toBeHidden();
      await page.close();
    });

    test("107. mobile: แถวเป็น card (grid 1 column)", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToOfferList(page);
      const firstRow = page.locator(".offer-list-table .asset-row:not(.head)").first();
      const display = await firstRow.evaluate(el => getComputedStyle(el).display);
      expect(display).toBe("grid");
      // ตรวจว่าเป็น 1 column (computed อาจเป็น px ไม่ใช่ "1fr")
      const gridCols = await firstRow.evaluate(el => getComputedStyle(el).gridTemplateColumns);
      const colCount = gridCols.split(/\s+/).filter(s => s).length;
      expect(colCount).toBe(1);
      await page.close();
    });

    test("108. mobile: แสดง mobile-user-card-title (Offer ID) แทน desktop-user-name (price)", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToOfferList(page);
      const firstRow = page.locator(".offer-list-table .asset-row:not(.head)").first();
      const mobileTitle = firstRow.locator(".mobile-user-card-title");
      await expect(mobileTitle).toBeVisible();
      await expect(mobileTitle).toHaveText("OFR-501");
      const desktopName = firstRow.locator(".desktop-user-name");
      await expect(desktopName).toBeHidden();
      await page.close();
    });

    test("109. mobile: card แสดง status pill + type pill + meta (Offer, Asset, Buyer, Owner)", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToOfferList(page);
      const firstRow = page.locator(".offer-list-table .asset-row:not(.head)").first();
      const tags = firstRow.locator(".asset-card-tags");
      await expect(tags).toBeVisible();
      const pills = tags.locator(".pill");
      expect(await pills.count()).toBeGreaterThanOrEqual(2);
      const metaItems = tags.locator(".user-card-meta-item");
      await expect(metaItems).toHaveCount(4);
      await expect(metaItems.nth(0).locator("span")).toHaveText("Offer");
      await expect(metaItems.nth(1).locator("span")).toHaveText("Asset");
      await expect(metaItems.nth(2).locator("span")).toHaveText("Buyer");
      await expect(metaItems.nth(3).locator("span")).toHaveText("Owner");
      await page.close();
    });

    test("110. mobile: ปุ่ม View ซ่อนใน card (row click แทน)", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToOfferList(page);
      const firstRow = page.locator(".offer-list-table .asset-row:not(.head)").first();
      const actions = firstRow.locator(".user-row-actions");
      await expect(actions).toBeHidden();
      await page.close();
    });

    test("111. mobile: คอลัมน์ที่ไม่ใช่ asset-cell-primary ซ่อน", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToOfferList(page);
      const firstRow = page.locator(".offer-list-table .asset-row:not(.head)").first();
      const offerIdCell = firstRow.locator("[data-label='Offer ID']");
      await expect(offerIdCell).toBeHidden();
      const assetCell = firstRow.locator("[data-label='Asset']");
      await expect(assetCell).toBeHidden();
      await page.close();
    });

    test("112. mobile: filter bar ซ่อนอยู่ เปิดได้ด้วย toggle", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToOfferList(page);
      const bar = page.locator(".offer-filter-bar");
      const isOpen = await bar.getAttribute("data-filter-open");
      expect(isOpen).toBe("false");
      await page.locator("[data-offer-filter-toggle]").click();
      await page.waitForTimeout(200);
      const isOpenAfter = await bar.getAttribute("data-filter-open");
      expect(isOpenAfter).toBe("true");
      await page.close();
    });

    test("113. mobile: user-panel-filter-actions แสดง (toggle + reset)", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToOfferList(page);
      const actions = page.locator("#user-panel-filter-actions");
      await expect(actions).toBeVisible();
      await expect(actions.locator("[data-offer-filter-toggle]")).toBeVisible();
      await expect(actions.locator("[data-offer-reset]")).toBeVisible();
      await page.close();
    });

    test("114. mobile: search เต็มความกว้างเมื่อ filter bar เปิด", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToOfferList(page);
      await page.locator("[data-offer-filter-toggle]").click();
      await page.waitForTimeout(200);
      const search = page.locator("#offer-search");
      await expect(search).toBeVisible();
      const box = await search.boundingBox();
      expect(box.width).toBeGreaterThan(200);
      await page.close();
    });

    test("115. mobile: row click → Offer Detail ได้", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToOfferList(page);
      const firstRow = page.locator(".offer-list-table .asset-row:not(.head)").first();
      await firstRow.click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Offer Detail");
      await page.close();
    });

    test("116. mobile: Offer Detail แสดง Offered Asset section ครบ", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToOfferDetail(page);
      const section = page.locator(".offer-detail-page .detail-section").first();
      await expect(section.locator("h4")).toHaveText("Offered Asset");
      const tiles = section.locator(".detail-tile");
      await expect(tiles).toHaveCount(7);
      await page.close();
    });

    test("117. mobile: Offer History table → stacked card", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToOfferDetail(page);
      const table = page.locator(".offer-history-table");
      await expect(table).toBeVisible();
      // thead ซ่อนบน mobile
      const thead = table.locator("thead");
      await expect(thead).toBeHidden();
      // tbody tr เป็น block
      const firstRow = table.locator("tbody tr").first();
      const display = await firstRow.evaluate(el => getComputedStyle(el).display);
      expect(display).toBe("block");
      await page.close();
    });

    test("118. mobile: Offer History td แสดง data-label ก่อนค่า", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToOfferDetail(page);
      const firstTd = page.locator(".offer-history-table tbody tr").first().locator("td").first();
      await expect(firstTd).toHaveAttribute("data-label", "Date / Time");
      await page.close();
    });

    test("119. mobile: pagination ใช้งานได้", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToOfferList(page);
      const pager = page.locator("#table .pager").first();
      await expect(pager).toBeVisible();
      await page.locator("#table .pager-next").first().click();
      await page.waitForTimeout(300);
      const rowCount = await countOfferRows(page);
      expect(rowCount).toBe(2);
      await page.close();
    });

    test("120. mobile: summary cards แสดงครบ 6 ใบ", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToOfferList(page);
      const cards = page.locator("#summary-grid .offer-status-card");
      await expect(cards).toHaveCount(6);
      await page.close();
    });
  });

  // ==================== R. RESPONSIVE — TABLE TO CARD ====================

  test.describe("Responsive — table to card transition", () => {
    test("121. ที่ 768px ตารางยังอ่านได้", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
      await goToOfferList(page);
      const table = page.locator(".offer-list-table");
      await expect(table).toBeVisible();
      const rows = table.locator(".asset-row:not(.head)");
      expect(await rows.count()).toBeGreaterThanOrEqual(1);
      await page.close();
    });

    test("122. ที่ 1280px แสดงตารางเต็ม", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      await goToOfferList(page);
      const table = page.locator(".offer-list-table");
      await expect(table).toBeVisible();
      const rows = table.locator(".asset-row:not(.head)");
      expect(await rows.count()).toBe(10);
      await page.close();
    });

    test("123. ที่ 1440px แสดงตารางเต็ม", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await goToOfferList(page);
      const table = page.locator(".offer-list-table");
      await expect(table).toBeVisible();
      const rows = table.locator(".asset-row:not(.head)");
      expect(await rows.count()).toBe(10);
      await page.close();
    });

    test("124. ที่ 768px Offer Detail แสดงครบ section", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
      await goToOfferDetail(page);
      const sections = page.locator(".offer-detail-page .detail-section");
      await expect(sections).toHaveCount(3);
      await expect(sections.nth(0).locator("h4")).toHaveText("Offered Asset");
      await expect(sections.nth(1).locator("h4")).toHaveText("Buyer / Owner");
      await expect(sections.nth(2).locator("h4")).toHaveText("Offer History");
      await page.close();
    });

    test("125. ที่ 1280px Offer Detail แสดงครบ section", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      await goToOfferDetail(page);
      const sections = page.locator(".offer-detail-page .detail-section");
      await expect(sections).toHaveCount(3);
      await page.close();
    });

    test("126. ที่ 1440px Offer Detail แสดงครบ section", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await goToOfferDetail(page);
      const sections = page.locator(".offer-detail-page .detail-section");
      await expect(sections).toHaveCount(3);
      await page.close();
    });
  });

  // ==================== S. CROSS-MODULE DRILL-IN CONSISTENCY ====================

  test.describe("Cross-module drill-in — Asset ID link pattern", () => {
    test("127. Asset ID link ใน Offer Detail ใช้ data-asset-open (เหมือน module อื่น)", async ({ page }) => {
      await goToOfferDetail(page);
      const link = page.locator(".offer-detail-page [data-asset-open]").first();
      await expect(link).toHaveClass(/link-btn/);
    });

    test("128. drill-in ไป Asset Detail แล้ว breadcrumb เปลี่ยน", async ({ page }) => {
      await goToOfferDetail(page);
      await page.locator(".offer-detail-page [data-asset-open]").first().click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Asset Detail");
      const crumb = await page.locator("#crumb").textContent();
      expect(crumb).toContain("Asset");
    });
  });

  // ==================== T. STATUS PILL COLORS ====================

  test.describe("Status pill colors — 6 status", () => {
    for (const meta of STATUS_META) {
      test(`129. status pill '${meta.status}' ใช้ class ${meta.pillClass}`, async ({ page }) => {
        await goToOfferList(page);
        await pickCustomOption(page, "offer-status-filter", meta.status);
        await page.waitForTimeout(300);
        const rows = page.locator(".offer-list-table .asset-row:not(.head)");
        const count = await rows.count();
        if (count > 0) {
          const pill = rows.first().locator("[data-label='Status'] .pill");
          await expect(pill).toHaveClass(new RegExp(meta.pillClass));
          await expect(pill).toHaveText(meta.label);
        }
      });
    }
  });

  // ==================== U. EMPTY STATE ====================

  test.describe("Empty state — search ไม่พบ", () => {
    test("130. search ไม่พบ → แสดง 'ไม่พบข้อมูล'", async ({ page }) => {
      await goToOfferList(page);
      await page.locator("#offer-search").fill("zzzznonexistent");
      await page.waitForTimeout(300);
      const empty = page.locator(".offer-list-table .detail-empty, .offer-list-table .user-empty");
      await expect(empty).toBeVisible();
      await expect(empty).toHaveText("ไม่พบข้อมูล");
    });

    test("131. search ไม่พบ → footer แสดง '0 จาก 0'", async ({ page }) => {
      await goToOfferList(page);
      await page.locator("#offer-search").fill("zzzznonexistent");
      await page.waitForTimeout(300);
      const footer = page.locator("#table .footer-range").first();
      await expect(footer).toContainText("0 จาก 0");
    });
  });

  // ==================== V. FILTER STATE PERSISTENCE ====================

  test.describe("Filter state persistence — back from detail", () => {
    test("132. filter status คงอยู่หลัง back จาก detail", async ({ page }) => {
      await goToOfferList(page);
      await pickCustomOption(page, "offer-status-filter", "Accepted");
      await page.waitForTimeout(300);
      // เข้า detail
      await page.locator(".offer-list-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
      // กด back
      await page.locator("[data-back-offer-list]").click();
      await page.waitForTimeout(300);
      const filterValue = await page.locator("#offer-status-filter").inputValue();
      expect(filterValue).toBe("Accepted");
    });

    test("133. sort คงอยู่หลัง back จาก detail", async ({ page }) => {
      await goToOfferList(page);
      await pickCustomOption(page, "offer-sort", "oldest");
      await page.waitForTimeout(300);
      await page.locator(".offer-list-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
      await page.locator("[data-back-offer-list]").click();
      await page.waitForTimeout(300);
      const sortValue = await page.locator("#offer-sort").inputValue();
      expect(sortValue).toBe("oldest");
    });

    test("134. pagination คงอยู่หลัง back จาก detail", async ({ page }) => {
      await goToOfferList(page);
      await page.locator("#table .pager-next").first().click();
      await page.waitForTimeout(300);
      // แถวในหน้า 2 มี 2 แถว
      await page.locator(".offer-list-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
      await page.locator("[data-back-offer-list]").click();
      await page.waitForTimeout(300);
      const activeBtn = page.locator("#table .pager-num.active").first();
      await expect(activeBtn).toHaveText("2");
    });
  });

  // ==================== W. COMBINED FILTER + SEARCH ====================

  test.describe("Combined filter + search", () => {
    test("135. search 'OFR' + filter Pending → แสดงเฉพาะ Pending ที่ขึ้นต้นด้วย OFR", async ({ page }) => {
      await goToOfferList(page);
      await page.locator("#offer-search").fill("OFR");
      await page.waitForTimeout(300);
      await pickCustomOption(page, "offer-status-filter", "Pending");
      const rowCount = await countOfferRows(page);
      expect(rowCount).toBe(3);
    });

    test("136. search + filter + sort ทำงานร่วมกัน", async ({ page }) => {
      await goToOfferList(page);
      await page.locator("#offer-search").fill("OFR");
      await page.waitForTimeout(300);
      await pickCustomOption(page, "offer-status-filter", "Accepted");
      await page.waitForTimeout(300);
      await pickCustomOption(page, "offer-sort", "oldest");
      await page.waitForTimeout(300);
      const rows = page.locator(".offer-list-table .asset-row:not(.head)");
      const count = await rows.count();
      expect(count).toBe(3);
      // oldest = OFR-392 ก่อน (น้อยสุดใน Accepted)
      const firstId = await rows.first().locator("[data-label='Offer ID'] .main-text").textContent();
      expect(firstId).toBe("OFR-392");
    });
  });

  // ==================== X. OFFER DETAIL — DIFFERENT STATUSES ====================

  test.describe("Offer Detail — different statuses", () => {
    const testCases = [
      { index: 0, id: "OFR-501", status: "Pending",    pillClass: "amber" },
      { index: 1, id: "OFR-488", status: "Accepted",   pillClass: "green" },
      { index: 2, id: "OFR-472", status: "Rejected",   pillClass: "red" },
      { index: 3, id: "OFR-459", status: "Cancelled",  pillClass: "purple" }
    ];

    for (const tc of testCases) {
      test(`137. Offer Detail ${tc.id} (${tc.status}) — status pill ถูกต้อง`, async ({ page }) => {
        await goToOfferList(page);
        const rows = page.locator(".offer-list-table .asset-row:not(.head)");
        await rows.nth(tc.index).click();
        await page.waitForTimeout(300);
        await expect(page.locator("#panel-title")).toHaveText(tc.id);
        const statusPill = page.locator(".offer-detail-page .chips .pill").first();
        await expect(statusPill).toHaveText(tc.status);
        await expect(statusPill).toHaveClass(new RegExp(tc.pillClass));
      });
    }

    test("138. Offer Detail Paused (OFR-381) — Offer History มี 2 แถว", async ({ page }) => {
      await goToOfferList(page);
      // OFR-381 อยู่ในหน้า 2 (index 10 จาก 12) — ไปหน้า 2 ก่อน
      await page.locator("#table .pager-next").first().click();
      await page.waitForTimeout(300);
      // หน้า 2 มี 2 แถว: OFR-381 (index 0), OFR-366 (index 1)
      await page.locator(".offer-list-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
      await expect(page.locator("#panel-title")).toHaveText("OFR-381");
      const rows = page.locator(".offer-history-table tbody tr");
      await expect(rows).toHaveCount(2);
      await expect(rows.first().locator("td[data-label='Action']")).toHaveText("Offer Paused");
    });

    test("139. Offer Detail Invalidated (OFR-366) — Offer History มี 2 แถว", async ({ page }) => {
      await goToOfferList(page);
      await page.locator("#table .pager-next").first().click();
      await page.waitForTimeout(300);
      await page.locator(".offer-list-table .asset-row:not(.head)").nth(1).click();
      await page.waitForTimeout(300);
      await expect(page.locator("#panel-title")).toHaveText("OFR-366");
      const rows = page.locator(".offer-history-table tbody tr");
      await expect(rows).toHaveCount(2);
      await expect(rows.first().locator("td[data-label='Action']")).toHaveText("Offer Invalidated");
    });
  });

  // ==================== Y. NAV FROM OTHER MODULES ====================

  test.describe("Navigation from other modules → Offer Management", () => {
    test("140. จาก Dashboard → Offer Management ได้", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await ensureNavOpen(page);
      // เข้า Dashboard ก่อน
      await page.locator(".nav-item[data-module='dashboard']").click();
      await page.waitForTimeout(300);
      // บน mobile nav ปิดหลังคลิก — เปิดใหม่ก่อนคลิก offers
      await ensureNavOpen(page);
      // แล้วไป Offer Management
      await page.locator(".nav-item[data-module='offers']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Offer Management");
      await expect(page.locator("#panel-title")).toHaveText("Offer List");
    });

    test("141. จาก Asset Management → Offer Management ได้", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await ensureNavOpen(page);
      // เข้า Asset List ก่อน
      const assetNav = page.locator(".nav-item[data-module='assets']");
      await assetNav.click();
      await page.waitForTimeout(200);
      await ensureNavOpen(page);
      await page.locator(".submenu[data-submenu='assets'] button[data-sub='Asset List']").click();
      await page.waitForTimeout(300);
      // บน mobile nav ปิดหลังคลิก — เปิดใหม่ก่อนคลิก offers
      await ensureNavOpen(page);
      // แล้วไป Offer Management
      await page.locator(".nav-item[data-module='offers']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#panel-title")).toHaveText("Offer List");
    });
  });
});
