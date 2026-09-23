// QA-BO-003: Asset Management 1 (Asset List, Asset Detail, Reported Assets, Asset Report Detail) — strict Playwright spec
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

// helper: ไปหน้า Asset List ผ่านเมนู (Asset Management → Asset List)
async function goToAssetList(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  const parent = page.locator(".nav-item[data-module='assets']");
  const expanded = await parent.evaluate(el => el.classList.contains("expanded")).catch(() => false);
  if (!expanded) await parent.click();
  await page.locator(".submenu[data-submenu='assets'] button[data-sub='Asset List']").click();
  await page.waitForTimeout(300);
}

// helper: ไปหน้า Reported Assets ผ่านเมนู
async function goToReportedAssets(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  const parent = page.locator(".nav-item[data-module='assets']");
  const expanded = await parent.evaluate(el => el.classList.contains("expanded")).catch(() => false);
  if (!expanded) await parent.click();
  await page.locator(".submenu[data-submenu='assets'] button[data-sub='Reported Assets']").click();
  await page.waitForTimeout(300);
}

// helper: เปิด filter bar ถ้ายังปิด (advanced filter ถูกซ่อนเมื่อ data-filter-open="false")
async function openFilterBar(page) {
  const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
  if (!isMobile) return;
  const bar = page.locator(".user-filter-bar.asset-mode");
  const isOpen = await bar.getAttribute("data-filter-open");
  if (isOpen === "false") {
    await page.locator("[data-asset-filter-toggle]").click();
    await page.waitForTimeout(200);
  }
}

// helper: เปิด filter bar ของ Reported Assets (mobile)
async function openReportedAssetFilterBar(page) {
  const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
  if (!isMobile) return;
  const bar = page.locator(".user-filter-bar.report-mode");
  const isOpen = await bar.getAttribute("data-filter-open");
  if (isOpen === "false") {
    await page.locator("[data-asset-report-filter-toggle]").click();
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

// helper: เลือก option ใน custom-select ของ Reported Assets (ใช้ report filter bar)
async function pickReportedAssetCustomOption(page, inputId, value) {
  await openReportedAssetFilterBar(page);
  await page
    .locator(`div[data-custom-select]:has(> #${inputId}) [data-custom-select-trigger]`)
    .click();
  await page.waitForTimeout(150);
  await page
    .locator(`div[data-custom-select]:has(> #${inputId}) [data-custom-select-option][data-value="${value}"]`)
    .click();
  await page.waitForTimeout(200);
}

// helper: คลิกแถว asset เพื่อเปิด detail (คลิก primary cell)
async function openAssetDetailByRowClick(page, assetId) {
  await page.locator(`.asset-row[data-asset-card="${assetId}"] .asset-cell-primary`).click();
  await page.waitForTimeout(300);
}

// helper: เปิด row menu ของ asset
async function openAssetRowMenu(page, assetId) {
  await page.locator(`.asset-row[data-asset-card="${assetId}"] .row-menu > summary`).click();
  await page.waitForTimeout(200);
}

// helper: เปิด row menu ของ asset report
async function openAssetReportRowMenu(page, assetId) {
  await page.locator(`.user-row.report-row.asset-report-row[data-asset-report-card="${assetId}"] .row-menu > summary`).click();
  await page.waitForTimeout(200);
}

// helper: ปิด row menu ที่ค้าง
async function closeRowMenus(page) {
  await page.locator("body").click({ position: { x: 5, y: 5 } });
  await page.waitForTimeout(150);
}

// helper: กดปุ่มรีเซ็ตค่าทั้งหมด — เลือกปุ่มที่ visible (desktop: filter-reset in advanced bar, mobile: in mobile filter bar)
async function clickAssetReset(page) {
  await page.locator("[data-asset-reset]:visible").first().click();
  await page.waitForTimeout(300);
}

// helper: กดปุ่มรีเซ็ตค่าทั้งหมดของ Reported Assets
async function clickAssetReportReset(page) {
  await page.locator("[data-asset-report-reset]:visible").first().click();
  await page.waitForTimeout(300);
}

test.describe("QA-BO-003: Asset Management 1 (strict)", () => {

  // ==================== A. NAVIGATION / MENU / ACTIVE STATE ====================

  test.describe("Navigation — menu entry, submenu, active state", () => {
    test("1. Asset Management menu กาง submenu ได้ มี Asset List + Reported Assets + Reported Comments", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await ensureNavOpen(page);
      await page.locator(".nav-item[data-module='assets']").click();
      await page.waitForTimeout(200);
      const submenu = page.locator(".submenu[data-submenu='assets']");
      await expect(submenu).toHaveClass(/open/);
      await expect(submenu.locator("button[data-sub='Asset List']")).toBeVisible();
      await expect(submenu.locator("button[data-sub='Reported Assets']")).toBeVisible();
      await expect(submenu.locator("button[data-sub='Reported Comments']")).toBeVisible();
    });

    test("2. เข้า Asset List: page title + breadcrumb + panel title ถูกต้อง", async ({ page }) => {
      await goToAssetList(page);
      await expect(page.locator("#page-title")).toHaveText("Assets");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Asset Management / Assets");
      await expect(page.locator("#panel-title")).toHaveText("Assets List");
      await expect(page.locator("body")).toHaveClass(/asset-list-mode/);
    });

    test("3. เข้า Reported Assets: page title + breadcrumb + panel title ถูกต้อง", async ({ page }) => {
      await goToReportedAssets(page);
      await expect(page.locator("#page-title")).toHaveText("Reported Assets");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Asset Management / Reported Assets");
      await expect(page.locator("#panel-title")).toHaveText("Reported Assets List");
    });

    test("4. active state ของ submenu สลับถูกต้องเมื่อสลับหน้า", async ({ page }) => {
      await goToAssetList(page);
      const assetListBtn = page.locator(".submenu[data-submenu='assets'] button[data-sub='Asset List']");
      const reportedBtn = page.locator(".submenu[data-submenu='assets'] button[data-sub='Reported Assets']");
      await expect(assetListBtn).toHaveClass(/active/);
      await expect(page.locator(".nav-item[data-module='assets']")).toHaveClass(/active/);
      await ensureNavOpen(page);
      await reportedBtn.click();
      await page.waitForTimeout(300);
      await expect(reportedBtn).toHaveClass(/active/);
      await expect(assetListBtn).not.toHaveClass(/active/);
    });
  });

  // ==================== B. ASSET LIST — RENDERING ====================

  test.describe("Asset List — rendering", () => {
    test("5. KPI summary มี 2 ใบ: Asset Status + Top Asset Brands", async ({ page }) => {
      await goToAssetList(page);
      const stats = page.locator("#summary-grid .asset-kpi-card");
      await expect(stats).toHaveCount(2);
      await expect(stats.nth(0).locator(".asset-kpi-title")).toHaveText("Asset Status");
      await expect(stats.nth(1).locator(".asset-kpi-title")).toHaveText("Top Asset Brands");
    });

    test("6. Asset Status KPI มี 4 แถว: Sale, Show, Hide, Sold พร้อม count", async ({ page }) => {
      await goToAssetList(page);
      const statusList = page.locator("#summary-grid .asset-kpi-card").first().locator(".asset-status-row");
      await expect(statusList).toHaveCount(4);
      const labels = await statusList.locator(".asset-status-name").allTextContents();
      expect(labels).toEqual(["Sale", "Show", "Hide", "Sold"]);
      // Sale = 12, Show = 4, Hide = 2, Sold = 2
      await expect(statusList.nth(0).locator(".asset-status-value")).toHaveText("12");
      await expect(statusList.nth(1).locator(".asset-status-value")).toHaveText("4");
      await expect(statusList.nth(2).locator(".asset-status-value")).toHaveText("2");
      await expect(statusList.nth(3).locator(".asset-status-value")).toHaveText("2");
    });

    test("7. Top Asset Brands KPI มี brand rows พร้อม count + percent + bar", async ({ page }) => {
      await goToAssetList(page);
      const brandRows = page.locator("#summary-grid .asset-kpi-card").nth(1).locator(".wa-stat-bar-row");
      const count = await brandRows.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        await expect(brandRows.nth(i).locator(".wa-stat-bar-label")).not.toBeEmpty();
        await expect(brandRows.nth(i).locator(".wa-stat-bar-count")).toContainText("(");
        await expect(brandRows.nth(i).locator(".wa-stat-bar-percent")).toContainText("%");
        await expect(brandRows.nth(i).locator(".wa-stat-bar-fill")).toBeVisible();
      }
    });

    test("8. ตาราง head มี 7 คอลัมน์ครบ", async ({ page }) => {
      test.skip(page.viewportSize().width <= 760, "desktop only — mobile ใช้ card layout ไม่แสดง head");
      await goToAssetList(page);
      const head = page.locator(".asset-row.head");
      await expect(head).toBeVisible();
      for (const label of ["Asset ID", "Asset", "Brand", "Owner", "Created At", "Asset Status", "Action"]) {
        await expect(head.locator(`div:text-is("${label}")`)).toBeVisible();
      }
    });

    test("9. หน้า 1 แสดง 10 แถว + footer range ถูกต้อง", async ({ page }) => {
      await goToAssetList(page);
      await expect(page.locator(".asset-row:not(.head)")).toHaveCount(10);
      await expect(page.locator(".footer-range > span:first-child")).toHaveText("แสดง 1-10 จาก 20");
    });

    test("10. แถวแรก (sort latest default) คือ AST-8831 (createdAt ล่าสุด)", async ({ page }) => {
      await goToAssetList(page);
      await expect(page.locator(".asset-row:not(.head)").first()).toHaveAttribute("data-asset-card", "AST-8831");
    });
  });

  // ==================== C. SEARCH ====================

  test.describe("Asset List — search", () => {
    test("11. ค้นหาด้วย Asset ID 'AST-8802' เจอ 1 แถว", async ({ page }) => {
      await goToAssetList(page);
      await page.locator("#search").fill("AST-8802");
      await page.waitForTimeout(200);
      await expect(page.locator(".asset-row:not(.head)")).toHaveCount(1);
      await expect(page.locator(".asset-row[data-asset-card='AST-8802']")).toBeVisible();
    });

    test("12. ค้นหาด้วยชื่อ 'Rolex Submariner' เจอ 2 แถว", async ({ page }) => {
      await goToAssetList(page);
      await page.locator("#search").fill("Rolex Submariner");
      await page.waitForTimeout(200);
      await expect(page.locator(".asset-row:not(.head)")).toHaveCount(2);
      await expect(page.locator(".asset-row[data-asset-card='AST-8831']")).toBeVisible();
      await expect(page.locator(".asset-row[data-asset-card='AST-8581']")).toBeVisible();
    });

    test("13. ค้นหาด้วย owner 'Crown Time BKK' เจอ 3 แถว", async ({ page }) => {
      await goToAssetList(page);
      await page.locator("#search").fill("Crown Time BKK");
      await page.waitForTimeout(200);
      await expect(page.locator(".asset-row:not(.head)")).toHaveCount(3);
      await expect(page.locator(".asset-row[data-asset-card='AST-8831']")).toBeVisible();
      await expect(page.locator(".asset-row[data-asset-card='AST-8579']")).toBeVisible();
      await expect(page.locator(".asset-row[data-asset-card='AST-8566']")).toBeVisible();
    });

    test("14. ค้นหาด้วย brand 'Omega' เจอ 4 แถว", async ({ page }) => {
      await goToAssetList(page);
      await page.locator("#search").fill("Omega");
      await page.waitForTimeout(200);
      await expect(page.locator(".asset-row:not(.head)")).toHaveCount(4);
    });

    test("15. ค้นหาไม่เจอ → empty state 'ไม่พบข้อมูล' + footer 0 รายการ", async ({ page }) => {
      await goToAssetList(page);
      await page.locator("#search").fill("zzz-not-exist");
      await page.waitForTimeout(200);
      await expect(page.locator(".detail-empty.user-empty")).toHaveText("ไม่พบข้อมูล");
      await expect(page.locator(".footer-range > span:first-child")).toHaveText("แสดง 0 จาก 0");
    });

    test("16. พิมพ์ค้นหา reset หน้ากลับเป็น 1 (จาก page 2)", async ({ page }) => {
      await goToAssetList(page);
      await page.locator(".pager-next").click();
      await page.waitForTimeout(200);
      await expect(page.locator(".asset-row:not(.head)")).toHaveCount(10);
      await page.locator("#search").fill("Rolex");
      await page.waitForTimeout(200);
      await expect(page.locator(".footer-range > span:first-child")).toHaveText("แสดง 1-7 จาก 7");
      await expect(page.locator(".asset-row:not(.head)")).toHaveCount(7);
    });
  });

  // ==================== D. FILTERS ====================

  test.describe("Asset List — filters", () => {
    test("17. filter status Sale → 12 แถว (paginated 10/page) ทุกแถว pill green 'Sale'", async ({ page }) => {
      await goToAssetList(page);
      await pickCustomOption(page, "asset-type-filter", "Sale");
      await expect(page.locator(".asset-row:not(.head)")).toHaveCount(10);
      await expect(page.locator(".footer-range > span:first-child")).toHaveText("แสดง 1-10 จาก 12");
      for (let i = 0; i < 10; i++) {
        await expect(page.locator(".asset-row:not(.head)").nth(i).locator("div[data-label='Asset Status'] .pill").first()).toHaveClass(/green/);
        await expect(page.locator(".asset-row:not(.head)").nth(i).locator("div[data-label='Asset Status'] .pill").first()).toHaveText("Sale");
      }
    });

    test("18. filter status Show → 4 แถว pill blue", async ({ page }) => {
      await goToAssetList(page);
      await pickCustomOption(page, "asset-type-filter", "Show");
      const rows = page.locator(".asset-row:not(.head)");
      await expect(rows).toHaveCount(4);
      await expect(rows.first().locator("div[data-label='Asset Status'] .pill").first()).toHaveClass(/blue/);
    });

    test("19. filter status Hide → 2 แถว pill purple", async ({ page }) => {
      await goToAssetList(page);
      await pickCustomOption(page, "asset-type-filter", "Hide");
      const rows = page.locator(".asset-row:not(.head)");
      await expect(rows).toHaveCount(2);
      await expect(rows.first().locator("div[data-label='Asset Status'] .pill").first()).toHaveClass(/purple/);
    });

    test("20. filter status Sold → 2 แถว pill amber", async ({ page }) => {
      await goToAssetList(page);
      await pickCustomOption(page, "asset-type-filter", "Sold");
      const rows = page.locator(".asset-row:not(.head)");
      await expect(rows).toHaveCount(2);
      await expect(rows.first().locator("div[data-label='Asset Status'] .pill").first()).toHaveClass(/amber/);
    });

    test("21. filter Temporarily Hidden → 3 แถว (Admin Hidden + Auto Hidden) มี pill amber 'ซ่อนชั่วคราว'", async ({ page }) => {
      await goToAssetList(page);
      await pickCustomOption(page, "asset-type-filter", "Temporarily Hidden");
      const rows = page.locator(".asset-row:not(.head)");
      await expect(rows).toHaveCount(3);
      for (let i = 0; i < 3; i++) {
        await expect(rows.nth(i).locator("div[data-label='Asset Status'] .pill.amber")).toHaveText("ซ่อนชั่วคราว");
      }
    });

    test("22. filter Permanently Hidden → 1 แถว (AST-8581) มี pill red 'ซ่อนถาวร'", async ({ page }) => {
      await goToAssetList(page);
      await pickCustomOption(page, "asset-type-filter", "Permanently Hidden");
      const rows = page.locator(".asset-row:not(.head)");
      await expect(rows).toHaveCount(1);
      await expect(rows.first()).toHaveAttribute("data-asset-card", "AST-8581");
      await expect(rows.first().locator("div[data-label='Asset Status'] .pill.red")).toHaveText("ซ่อนถาวร");
    });

    test("23. filter 'ลบโดยเจ้าของ' → 1 แถว (AST-8576) มี pill gray", async ({ page }) => {
      await goToAssetList(page);
      await pickCustomOption(page, "asset-type-filter", "ลบโดยเจ้าของ");
      const rows = page.locator(".asset-row:not(.head)");
      await expect(rows).toHaveCount(1);
      await expect(rows.first()).toHaveAttribute("data-asset-card", "AST-8576");
      await expect(rows.first().locator("div[data-label='Asset Status'] .pill.gray")).toHaveText("ลบโดยเจ้าของ");
    });

    test("24. filter brand 'Rolex' → 6 แถว ทุกแถว brand = Rolex", async ({ page }) => {
      await goToAssetList(page);
      await pickCustomOption(page, "asset-brand-filter", "Rolex");
      const rows = page.locator(".asset-row:not(.head)");
      await expect(rows).toHaveCount(6);
      for (let i = 0; i < 6; i++) {
        await expect(rows.nth(i).locator("div[data-label='Brand']")).toContainText("Rolex");
      }
    });

    test("25. filter brand 'Omega' → 4 แถว", async ({ page }) => {
      await goToAssetList(page);
      await pickCustomOption(page, "asset-brand-filter", "Omega");
      await expect(page.locator(".asset-row:not(.head)")).toHaveCount(4);
    });

    test("26. filter รวม Sale + Rolex → 5 แถว", async ({ page }) => {
      await goToAssetList(page);
      await pickCustomOption(page, "asset-type-filter", "Sale");
      await pickCustomOption(page, "asset-brand-filter", "Rolex");
      const rows = page.locator(".asset-row:not(.head)");
      await expect(rows).toHaveCount(5);
      for (let i = 0; i < 5; i++) {
        await expect(rows.nth(i).locator("div[data-label='Asset Status'] .pill").first()).toHaveText("Sale");
        await expect(rows.nth(i).locator("div[data-label='Brand']")).toContainText("Rolex");
      }
    });
  });

  // ==================== E. SORT ====================

  test.describe("Asset List — sort", () => {
    test("27. sort 'oldest' → แถวแรกคือเก่าสุด (createdAt น้อยสุด)", async ({ page }) => {
      await goToAssetList(page);
      await pickCustomOption(page, "asset-sort", "oldest");
      const firstId = await page.locator(".asset-row:not(.head)").first().getAttribute("data-asset-card");
      // oldest ควรไม่ใช่ AST-8831 (ซึ่งเป็น latest)
      expect(firstId).not.toBe("AST-8831");
    });

    test("28. sort กลับเป็น 'latest' → แถวแรก AST-8831", async ({ page }) => {
      await goToAssetList(page);
      await pickCustomOption(page, "asset-sort", "oldest");
      await pickCustomOption(page, "asset-sort", "latest");
      await expect(page.locator(".asset-row:not(.head)").first()).toHaveAttribute("data-asset-card", "AST-8831");
    });
  });

  // ==================== F. RESET ====================

  test.describe("Asset List — reset", () => {
    test("29. รีเซ็ตเคลียร์ search + filter + sort กลับค่า default", async ({ page }) => {
      await goToAssetList(page);
      await page.locator("#search").fill("Rolex");
      await pickCustomOption(page, "asset-type-filter", "Sale");
      await pickCustomOption(page, "asset-brand-filter", "Rolex");
      await pickCustomOption(page, "asset-sort", "oldest");
      await expect(page.locator(".asset-row:not(.head)")).toHaveCount(5);
      await clickAssetReset(page);
      await page.waitForTimeout(300);
      await expect(page.locator("#search")).toHaveValue("");
      await expect(page.locator("#asset-type-filter")).toHaveValue("");
      await expect(page.locator("#asset-brand-filter")).toHaveValue("");
      await expect(page.locator("#asset-sort")).toHaveValue("latest");
      await expect(page.locator(".asset-row:not(.head)")).toHaveCount(10);
      await expect(page.locator(".footer-range > span:first-child")).toHaveText("แสดง 1-10 จาก 20");
    });
  });

  // ==================== G. PAGINATION ====================

  test.describe("Asset List — pagination", () => {
    test("30. ไปหน้า 2 ได้ แสดง 11-20 จาก 20 + ปุ่ม active ถูกต้อง", async ({ page }) => {
      test.skip(page.viewportSize().width <= 760, "desktop only — mobile ซ่อนเลขหน้า ใช้ prev/next");
      await goToAssetList(page);
      await page.locator("[data-asset-page='2']").click();
      await page.waitForTimeout(200);
      await expect(page.locator(".footer-range > span:first-child")).toHaveText("แสดง 11-20 จาก 20");
      await expect(page.locator(".asset-row:not(.head)")).toHaveCount(10);
      await expect(page.locator(".pager-num.active")).toHaveText("2");
      await expect(page.locator(".pager-num.active")).toHaveAttribute("aria-current", "page");
    });

    test("31. prev/next disabled ตามหน้าปัจจุบัน", async ({ page }) => {
      await goToAssetList(page);
      await expect(page.locator(".pager-prev")).toBeDisabled();
      await expect(page.locator(".pager-next")).toBeEnabled();
      await page.locator(".pager-next").click();
      await page.waitForTimeout(200);
      await expect(page.locator(".pager-prev")).toBeEnabled();
      await expect(page.locator(".pager-next")).toBeDisabled();
      await expect(page.locator(".footer-range > span:first-child")).toHaveText("แสดง 11-20 จาก 20");
      await page.locator(".pager-prev").click();
      await page.waitForTimeout(200);
      await expect(page.locator(".footer-range > span:first-child")).toHaveText("แสดง 1-10 จาก 20");
    });
  });

  // ==================== H. ROW CLICK + ROW MENU ====================

  test.describe("Asset List — row click & row menu", () => {
    test("32. คลิกแถว AST-8802 เปิด Asset Detail ของ AST-8802", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetailByRowClick(page, "AST-8802");
      await expect(page.locator("#page-title")).toHaveText("Asset Detail");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Asset Management / Asset List / AST-8802");
      await expect(page.locator("#panel-title")).toHaveText("Omega Speedmaster");
    });

    test("33. row menu มีปุ่ม 'ดูรายละเอียด' + actions ตามสถานะ (AST-8802: hide + delete-post)", async ({ page }) => {
      await goToAssetList(page);
      await openAssetRowMenu(page, "AST-8802");
      const menu = page.locator(".asset-row[data-asset-card='AST-8802'] .row-menu-list");
      await expect(menu.locator("button[data-asset-open='AST-8802']")).toHaveText("ดูรายละเอียด");
      await expect(menu.locator("button[data-asset-action='hide']")).toHaveText("ซ่อนชั่วคราว");
      await expect(menu.locator("button[data-asset-action='delete-post']")).toHaveText("ซ่อนถาวร");
    });

    test("34. row menu 'ดูรายละเอียด' เปิด entity ถูกต้อง", async ({ page }) => {
      await goToAssetList(page);
      await openAssetRowMenu(page, "AST-8802");
      await page.locator(".asset-row[data-asset-card='AST-8802'] button[data-asset-open='AST-8802']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Asset Management / Asset List / AST-8802");
    });

    test("35. row menu actions ต่างสถานะต่างชุด: AST-8831 (Auto Hidden) → restore-visibility + delete-post", async ({ page }) => {
      await goToAssetList(page);
      await openAssetRowMenu(page, "AST-8831");
      const menu = page.locator(".asset-row[data-asset-card='AST-8831'] .row-menu-list");
      await expect(menu.locator("button[data-asset-action='restore-visibility']")).toHaveText("ยกเลิกการซ่อนชั่วคราว");
      await expect(menu.locator("button[data-asset-action='delete-post']")).toBeVisible();
      // ไม่ควรมี hide (เพราะ Auto Hidden ไม่ใช่ Active/Reported/Reviewing)
      await expect(menu.locator("button[data-asset-action='hide']")).toHaveCount(0);
    });

    test("36. row menu ของ AST-8581 (Permanently Hidden) → ไม่มี action ใด ๆ (เฉพาะดูรายละเอียด)", async ({ page }) => {
      await goToAssetList(page);
      await openAssetRowMenu(page, "AST-8581");
      const menu = page.locator(".asset-row[data-asset-card='AST-8581'] .row-menu-list");
      await expect(menu.locator("button[data-asset-open='AST-8581']")).toBeVisible();
      await expect(menu.locator("button[data-asset-action]")).toHaveCount(0);
    });

    test("37. row menu ของ AST-8720 (Sold) → ไม่มี action ใด ๆ", async ({ page }) => {
      await goToAssetList(page);
      await openAssetRowMenu(page, "AST-8720");
      const menu = page.locator(".asset-row[data-asset-card='AST-8720'] .row-menu-list");
      await expect(menu.locator("button[data-asset-open='AST-8720']")).toBeVisible();
      await expect(menu.locator("button[data-asset-action]")).toHaveCount(0);
    });
  });

  // ==================== I. STATUS BADGE SEMANTICS ====================

  test.describe("Asset List — status badge semantics", () => {
    test("38. status pill ครบ 4 ประเภท ใช้ class สีถูกต้อง (green/blue/purple/amber)", async ({ page }) => {
      await goToAssetList(page);
      // Sale = green, Show = blue, Hide = purple, Sold = amber
      await pickCustomOption(page, "asset-type-filter", "Sale");
      await expect(page.locator(".asset-row:not(.head) div[data-label='Asset Status'] .pill").first()).toHaveClass(/green/);
      await pickCustomOption(page, "asset-type-filter", "Show");
      await expect(page.locator(".asset-row:not(.head) div[data-label='Asset Status'] .pill").first()).toHaveClass(/blue/);
      await pickCustomOption(page, "asset-type-filter", "Hide");
      await expect(page.locator(".asset-row:not(.head) div[data-label='Asset Status'] .pill").first()).toHaveClass(/purple/);
      await pickCustomOption(page, "asset-type-filter", "Sold");
      await expect(page.locator(".asset-row:not(.head) div[data-label='Asset Status'] .pill").first()).toHaveClass(/amber/);
    });

    test("39. moderation pill: ซ่อนชั่วคราว=amber, ซ่อนถาวร=red, ลบโดยเจ้าของ=gray", async ({ page }) => {
      await goToAssetList(page);
      // AST-8831 = Auto Hidden → ซ่อนชั่วคราว (amber)
      await page.locator("#search").fill("AST-8831");
      await page.waitForTimeout(200);
      await expect(page.locator(".asset-row[data-asset-card='AST-8831'] div[data-label='Asset Status'] .pill.amber")).toHaveText("ซ่อนชั่วคราว");
      // AST-8581 = Permanently Hidden → ซ่อนถาวร (red)
      await page.locator("#search").fill("AST-8581");
      await page.waitForTimeout(200);
      await expect(page.locator(".asset-row[data-asset-card='AST-8581'] div[data-label='Asset Status'] .pill.red")).toHaveText("ซ่อนถาวร");
      // AST-8576 = ลบโดยเจ้าของ → gray
      await page.locator("#search").fill("AST-8576");
      await page.waitForTimeout(200);
      await expect(page.locator(".asset-row[data-asset-card='AST-8576'] div[data-label='Asset Status'] .pill.gray")).toHaveText("ลบโดยเจ้าของ");
    });
  });

  // ==================== J. MOBILE CARD (≤760px) ====================

  test.describe("Asset List — mobile card (≤760px)", () => {
    test("40. mobile 390px: การ์ดแสดง Asset ID เป็น title + ซ่อนชื่อ desktop", async ({ page }) => {
      test.skip(page.viewportSize().width > 760, "mobile only");
      await goToAssetList(page);
      const row = page.locator(".asset-row[data-asset-card='AST-8802']");
      await expect(row.locator(".mobile-user-card-title")).toBeVisible();
      await expect(row.locator(".mobile-user-card-title")).toHaveText("AST-8802");
      await expect(row.locator(".desktop-user-name")).toBeHidden();
    });

    test("41. mobile 390px: card แสดง metadata ครบ (brand tag + status pill + asset/owner/created at)", async ({ page }) => {
      test.skip(page.viewportSize().width > 760, "mobile only");
      await goToAssetList(page);
      const row = page.locator(".asset-row[data-asset-card='AST-8802']");
      await expect(row.locator(".asset-card-tags")).toBeVisible();
      await expect(row.locator(".user-card-tag.asset-tag")).toContainText("Omega");
      await expect(row.locator(".asset-card-tags .pill").first()).toContainText("Sale");
      const meta = row.locator(".user-card-meta.asset-list-card-meta");
      await expect(meta).toBeVisible();
      await expect(meta.locator(".user-card-meta-item").nth(0)).toContainText("Omega Speedmaster");
      await expect(meta.locator(".user-card-meta-item").nth(1)).toContainText("Vintage Vault BKK");
    });

    test("42. desktop 1280px: ตารางปกติ ไม่แสดง mobile card title/meta", async ({ page }) => {
      test.skip(page.viewportSize().width <= 760, "desktop only");
      await goToAssetList(page);
      const row = page.locator(".asset-row[data-asset-card='AST-8802']");
      await expect(row.locator(".desktop-user-name")).toBeVisible();
      await expect(row.locator(".mobile-user-card-title")).toBeHidden();
      await expect(row.locator(".user-card-tags")).toBeHidden();
      await expect(row.locator("div[data-label='Asset Status']")).toBeVisible();
    });

    test("43. mobile 390px: filter toggle เปิด/ปิด filter bar ได้", async ({ page }) => {
      test.skip(page.viewportSize().width > 760, "mobile only");
      await goToAssetList(page);
      const bar = page.locator(".user-filter-bar.asset-mode");
      await expect(bar).toHaveAttribute("data-filter-open", "false");
      await page.locator("[data-asset-filter-toggle]").click();
      await page.waitForTimeout(200);
      await expect(bar).toHaveAttribute("data-filter-open", "true");
      await expect(page.locator("#asset-type-filter").locator("xpath=ancestor::div[@data-custom-select]")).toBeVisible();
      await page.locator("[data-asset-filter-toggle]").click();
      await page.waitForTimeout(200);
      await expect(bar).toHaveAttribute("data-filter-open", "false");
    });
  });

  // ==================== K. ASSET DETAIL ====================

  test.describe("Asset Detail — sections, history, actions, back", () => {
    test("44. เปิด detail AST-8802: head + chips + breadcrumb + back button ถูกต้อง", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetailByRowClick(page, "AST-8802");
      await expect(page.locator(".user-detail-page .asset-detail-heading")).toContainText("AST-8802");
      await expect(page.locator(".user-detail-page .user-display-name")).toHaveText("Omega Speedmaster");
      await expect(page.locator(".user-detail-page .chips .pill").first()).toHaveClass(/green/);
      await expect(page.locator(".user-detail-page .chips .pill.blue")).toHaveText("Omega");
      await expect(page.locator("[data-back-asset-list]")).toBeVisible();
      await expect(page.locator("#panel-title")).toHaveText("Omega Speedmaster");
      await expect(page.locator("#panel-subtitle")).toContainText("AST-8802");
      await expect(page.locator("#panel-subtitle")).toContainText("Omega");
      await expect(page.locator("#panel-subtitle")).toContainText("Vintage Vault BKK");
    });

    test("45. Asset Detail มีครบทุก section: Listing Summary / Owner / Description / Specifications / Comments / Asset Status History", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetailByRowClick(page, "AST-8802");
      const texts = await page.locator(".user-detail-page .detail-section h4").allTextContents();
      expect(texts).toContain("Listing Summary");
      expect(texts).toContain("Owner");
      expect(texts).toContain("Description");
      expect(texts).toContain("Specifications");
      expect(texts).toContain("Comments");
      expect(texts).toContain("Asset Status History");
    });

    test("46. Listing Summary แสดง Asset ID / Post Type / Comment Count / Favorite Count / Created At / Updated At", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetailByRowClick(page, "AST-8802");
      const section = page.locator(".user-detail-page .detail-section").filter({ hasText: "Listing Summary" }).first();
      await expect(section.locator(".detail-tile").filter({ hasText: "Asset ID" })).toContainText("AST-8802");
      await expect(section.locator(".detail-tile").filter({ hasText: "Post Type" })).toContainText("Sale");
      await expect(section.locator(".detail-tile").filter({ hasText: "Comment Count" })).toBeVisible();
      await expect(section.locator(".detail-tile").filter({ hasText: "Favorite Count" })).toBeVisible();
      await expect(section.locator(".detail-tile").filter({ hasText: "Created At" })).toBeVisible();
      await expect(section.locator(".detail-tile").filter({ hasText: "Updated At" })).toBeVisible();
    });

    test("47. Owner section แสดง Display Name / Owner ID / Account Status", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetailByRowClick(page, "AST-8802");
      const section = page.locator(".user-detail-page .detail-section").filter({ hasText: "Owner" }).first();
      await expect(section.locator(".detail-tile").filter({ hasText: "Display Name" })).toContainText("Vintage Vault BKK");
      await expect(section.locator(".detail-tile").filter({ hasText: "Owner ID" })).toContainText("U-1028");
      await expect(section.locator(".detail-tile").filter({ hasText: "Account Status" })).toContainText("Active");
    });

    test("48. Specifications section แสดง Brand / Model / Reference / Year / Case size / Movement", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetailByRowClick(page, "AST-8802");
      const section = page.locator(".user-detail-page .detail-section").filter({ hasText: "Specifications" }).first();
      await expect(section.locator(".detail-tile").filter({ hasText: "Brand" })).toContainText("Omega");
      await expect(section.locator(".detail-tile").filter({ hasText: "Model" })).toContainText("Speedmaster");
      await expect(section.locator(".detail-tile").filter({ hasText: "Reference No." })).toBeVisible();
      await expect(section.locator(".detail-tile").filter({ hasText: "Case size" })).toBeVisible();
      await expect(section.locator(".detail-tile").filter({ hasText: "Movement" })).toBeVisible();
    });

    test("49. FO Preview แสดงรูป + counter + thumbnails", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetailByRowClick(page, "AST-8802");
      const foPreview = page.locator(".user-detail-page .asset-fo-preview");
      await expect(foPreview).toBeVisible();
      await expect(foPreview.locator(".asset-fo-hero img")).toBeVisible();
      await expect(foPreview.locator(".asset-fo-counter")).toBeVisible();
      await expect(foPreview.locator(".asset-fo-thumb")).toHaveCount(3);
    });

    test("50. Comments section แสดง comment preview + View all comments button", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetailByRowClick(page, "AST-8802");
      const commentSection = page.locator(".user-detail-page .detail-section").filter({ hasText: "Comments" }).first();
      await expect(commentSection).toBeVisible();
      await expect(commentSection.locator(".asset-comment-thread")).toHaveCount(3);
      await expect(commentSection.locator("button[data-asset-comments-modal]")).toBeVisible();
    });

    test("51. Asset Status History table: 6 คอลัมน์ + มีข้อมูลแถว", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetailByRowClick(page, "AST-8802");
      const table = page.locator(".asset-status-history-table");
      await expect(table).toBeVisible();
      if (page.viewportSize().width > 760) {
        for (const th of ["Date / Time", "Actor", "Action", "Status", "Reference", "Reason / Note"]) {
          await expect(table.locator("thead th").filter({ hasText: th })).toBeVisible();
        }
      }
      const rowCount = await table.locator("tbody tr").count();
      expect(rowCount).toBeGreaterThan(0);
    });

    test("52. action area ของ AST-8802 (Active Sale) มี 2 ปุ่ม: hide (warning) + delete-post (danger)", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetailByRowClick(page, "AST-8802");
      const actions = page.locator(".user-detail-page .user-detail-actions");
      await expect(actions.locator("button[data-asset-action='hide']")).toHaveClass(/warning/);
      await expect(actions.locator("button[data-asset-action='delete-post']")).toHaveClass(/danger/);
      await expect(actions.locator("button")).toHaveCount(2);
    });

    test("53. action area ของ AST-8831 (Auto Hidden) มี 2 ปุ่ม: restore-visibility (primary) + delete-post (danger)", async ({ page }) => {
      await goToAssetList(page);
      await page.locator("#search").fill("AST-8831");
      await page.waitForTimeout(200);
      await openAssetDetailByRowClick(page, "AST-8831");
      const actions = page.locator(".user-detail-page .user-detail-actions");
      await expect(actions.locator("button[data-asset-action='restore-visibility']")).toHaveClass(/primary/);
      await expect(actions.locator("button[data-asset-action='delete-post']")).toHaveClass(/danger/);
      await expect(actions.locator("button")).toHaveCount(2);
    });

    test("54. action area ของ AST-8581 (Permanently Hidden) ไม่มีปุ่ม action", async ({ page }) => {
      await goToAssetList(page);
      await page.locator("#search").fill("AST-8581");
      await page.waitForTimeout(200);
      await openAssetDetailByRowClick(page, "AST-8581");
      await expect(page.locator(".user-detail-page .user-detail-actions")).toHaveCount(0);
    });

    test("55. back จาก Asset Detail กลับ Asset List และ context (search+filter) ยังอยู่", async ({ page }) => {
      await goToAssetList(page);
      await page.locator("#search").fill("Rolex");
      await pickCustomOption(page, "asset-type-filter", "Sale");
      const countBefore = await page.locator(".asset-row:not(.head)").count();
      await page.locator(".asset-row[data-asset-card='AST-8579'] .asset-cell-primary").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Asset Detail");
      await page.locator("[data-back-asset-list]").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Assets");
      await expect(page.locator("#search")).toHaveValue("Rolex");
      await expect(page.locator("#asset-type-filter")).toHaveValue("Sale");
      await expect(page.locator(".asset-row:not(.head)")).toHaveCount(countBefore);
    });
  });

  // ==================== L. ASSET ACTION MODAL + CONFIRM FLOW ====================

  test.describe("Asset action modal — confirm/reason/result", () => {
    test("56. เปิด modal ซ่อนชั่วคราว: title/target/reason options/note/impact/confirm ครบ", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetailByRowClick(page, "AST-8802");
      await page.locator(".user-detail-page button[data-asset-action='hide']").click();
      await page.waitForTimeout(300);
      const modal = page.locator("#user-action-modal");
      await expect(modal).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal-title")).toHaveText("ซ่อนสินทรัพย์ชั่วคราว");
      await expect(modal.locator(".user-action-target")).toContainText("Omega Speedmaster");
      await expect(modal.locator(".user-action-target")).toContainText("AST-8802");
      // reason select มี 4 options
      await expect(page.locator("div[data-custom-select]:has(> #asset-hide-reason) [data-custom-select-option]")).toHaveCount(4);
      await expect(page.locator("#asset-hide-note")).toBeVisible();
      await expect(modal.locator("[data-asset-action-confirm='hide']")).toBeVisible();
      await expect(modal.locator(".user-action-impact").first()).toContainText("ผลกระทบ");
    });

    test("57. ยกเลิก modal → ปิดโดยไม่เปลี่ยนสถานะ", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetailByRowClick(page, "AST-8802");
      await page.locator(".user-detail-page button[data-asset-action='hide']").click();
      await page.waitForTimeout(200);
      await page.locator("#user-action-modal button[data-user-action-modal-close]").last().click();
      await page.waitForTimeout(200);
      await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
      await expect(page.locator(".user-detail-page .chips .pill").first()).toHaveClass(/green/);
      await expect(page.locator(".user-detail-page .chips .pill").first()).toHaveText("Sale");
    });

    test("58. ยืนยัน hide → สถานะเปลี่ยนเป็น Admin Hidden + toast + history เพิ่มแถว", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetailByRowClick(page, "AST-8802");
      const historyBefore = await page.locator(".asset-status-history-table tbody tr").count();
      await page.locator(".user-detail-page button[data-asset-action='hide']").click();
      await page.waitForTimeout(200);
      await page.locator("#user-action-modal [data-asset-action-confirm='hide']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toHaveClass(/show/);
      await expect(page.locator("#success-toast")).toContainText("AST-8802");
      await expect(page.locator(".user-detail-page .chips .pill.amber")).toHaveText("ซ่อนชั่วคราว");
      const historyAfter = await page.locator(".asset-status-history-table tbody tr").count();
      expect(historyAfter).toBe(historyBefore + 1);
    });

    test("59. เปิด modal ซ่อนถาวร: title/target/reason options/note/impact/confirm ครบ", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetailByRowClick(page, "AST-8802");
      await page.locator(".user-detail-page button[data-asset-action='delete-post']").click();
      await page.waitForTimeout(300);
      const modal = page.locator("#user-action-modal");
      await expect(modal).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal-title")).toHaveText("ซ่อนสินทรัพย์ถาวร");
      await expect(modal.locator(".user-action-target")).toContainText("Omega Speedmaster");
      // reason select มี 3 options
      await expect(page.locator("div[data-custom-select]:has(> #asset-delete-reason) [data-custom-select-option]")).toHaveCount(3);
      await expect(page.locator("#asset-delete-note")).toBeVisible();
      await expect(modal.locator("[data-asset-action-confirm='delete-post']")).toBeVisible();
    });

    test("60. ยืนยัน delete-post → สถานะเปลี่ยนเป็น Permanently Hidden + toast + history เพิ่มแถว", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetailByRowClick(page, "AST-8802");
      const historyBefore = await page.locator(".asset-status-history-table tbody tr").count();
      await page.locator(".user-detail-page button[data-asset-action='delete-post']").click();
      await page.waitForTimeout(200);
      await page.locator("#user-action-modal [data-asset-action-confirm='delete-post']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toHaveClass(/show/);
      await expect(page.locator("#success-toast")).toContainText("AST-8802");
      await expect(page.locator(".user-detail-page .chips .pill.red")).toHaveText("ซ่อนถาวร");
      const historyAfter = await page.locator(".asset-status-history-table tbody tr").count();
      expect(historyAfter).toBe(historyBefore + 1);
    });

    test("61. restore-visibility ของ AST-8831 (Auto Hidden) → สถานะกลับเป็น Sale + toast", async ({ page }) => {
      await goToAssetList(page);
      await page.locator("#search").fill("AST-8831");
      await page.waitForTimeout(200);
      await openAssetDetailByRowClick(page, "AST-8831");
      await expect(page.locator(".user-detail-page .chips .pill.amber")).toHaveText("ซ่อนชั่วคราว");
      await page.locator(".user-detail-page button[data-asset-action='restore-visibility']").click();
      await page.waitForTimeout(200);
      await expect(page.locator("#user-action-modal-title")).toHaveText("ยกเลิกการซ่อนชั่วคราว");
      await page.locator("#user-action-modal [data-asset-action-confirm='restore-visibility']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toHaveClass(/show/);
      await expect(page.locator("#success-toast")).toContainText("AST-8831");
      // สถานะกลับเป็น Sale (green)
      await expect(page.locator(".user-detail-page .chips .pill").first()).toHaveClass(/green/);
      await expect(page.locator(".user-detail-page .chips .pill").first()).toHaveText("Sale");
    });

    test("62. scenario invalid_state → modal แสดง error และสถานะไม่เปลี่ยน", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetailByRowClick(page, "AST-8802");
      await page.locator(".user-detail-page button[data-asset-action='hide']").click();
      await page.waitForTimeout(200);
      await page.evaluate(() => {
        const input = document.querySelector("#asset-hide-scenario");
        if (input) input.value = "invalid_state";
      });
      await page.locator("#user-action-modal [data-asset-action-confirm='hide']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal .user-action-result")).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal .user-action-result")).toContainText("ไม่สามารถ");
      await expect(page.locator(".user-detail-page .chips .pill").first()).toHaveClass(/green/);
    });
  });

  // ==================== M. REPORTED ASSETS QUEUE ====================

  test.describe("Reported Assets — queue, filter, sort, search", () => {
    test("63. queue แสดง 6 รายงาน + panel title + ไม่มี KPI card", async ({ page }) => {
      await goToReportedAssets(page);
      await expect(page.locator("#page-title")).toHaveText("Reported Assets");
      await expect(page.locator("#panel-title")).toHaveText("Reported Assets List");
      await expect(page.locator("#summary-grid .stat")).toHaveCount(0);
      await expect(page.locator(".user-row.report-row.asset-report-row:not(.head)")).toHaveCount(6);
      await expect(page.locator(".footer-range > span:first-child")).toHaveText("แสดง 1-6 จาก 6");
    });

    test("64. queue pill: Pending = amber, Closed = green", async ({ page }) => {
      await goToReportedAssets(page);
      const pendingRow = page.locator(".user-row.report-row.asset-report-row[data-asset-report-card='AST-8831']");
      await expect(pendingRow.locator("div[data-label='Status'] .pill")).toHaveClass(/amber/);
      await expect(pendingRow.locator("div[data-label='Status'] .pill")).toHaveText("Pending");
      const closedRow = page.locator(".user-row.report-row.asset-report-row[data-asset-report-card='AST-8581']");
      await expect(closedRow.locator("div[data-label='Status'] .pill")).toHaveClass(/green/);
      await expect(closedRow.locator("div[data-label='Status'] .pill")).toHaveText("Closed");
    });

    test("65. filter สถานะรายงาน: Pending → 5, Closed → 1", async ({ page }) => {
      await goToReportedAssets(page);
      await pickReportedAssetCustomOption(page, "asset-report-status-filter", "Pending");
      await expect(page.locator(".user-row.report-row.asset-report-row:not(.head)")).toHaveCount(5);
      await pickReportedAssetCustomOption(page, "asset-report-status-filter", "Closed");
      await expect(page.locator(".user-row.report-row.asset-report-row:not(.head)")).toHaveCount(1);
    });

    test("66. filter priority: high → 4, medium → 1, low → 1", async ({ page }) => {
      await goToReportedAssets(page);
      await pickReportedAssetCustomOption(page, "asset-report-priority-filter", "high");
      await expect(page.locator(".user-row.report-row.asset-report-row:not(.head)")).toHaveCount(4);
      await pickReportedAssetCustomOption(page, "asset-report-priority-filter", "medium");
      await expect(page.locator(".user-row.report-row.asset-report-row:not(.head)")).toHaveCount(1);
      await pickReportedAssetCustomOption(page, "asset-report-priority-filter", "low");
      await expect(page.locator(".user-row.report-row.asset-report-row:not(.head)")).toHaveCount(1);
    });

    test("67. sort ตามจำนวน reporters → RPA-831 (10 reporters) อยู่แถวแรก", async ({ page }) => {
      await goToReportedAssets(page);
      await pickReportedAssetCustomOption(page, "asset-report-sort", "reporters");
      await expect(page.locator(".user-row.report-row.asset-report-row:not(.head)").first()).toHaveAttribute("data-asset-report-card", "AST-8831");
    });

    test("68. search Report ID 'RPA-694' เจอ 1 แถว (AST-8694)", async ({ page }) => {
      await goToReportedAssets(page);
      await page.locator("#asset-report-search").fill("RPA-694");
      await page.waitForTimeout(200);
      await expect(page.locator(".user-row.report-row.asset-report-row:not(.head)")).toHaveCount(1);
      await expect(page.locator(".user-row.report-row.asset-report-row[data-asset-report-card='AST-8694']")).toBeVisible();
    });

    test("69. search ไม่เจอ → empty state 'ไม่พบข้อมูล' + footer 0 รายการ", async ({ page }) => {
      await goToReportedAssets(page);
      await page.locator("#asset-report-search").fill("RPA-999");
      await page.waitForTimeout(200);
      await expect(page.locator(".detail-empty.user-empty")).toHaveText("ไม่พบข้อมูล");
      await expect(page.locator(".footer-range > span:first-child")).toHaveText("แสดง 0 จาก 0");
    });

    test("70. รีเซ็ตเคลียร์ search + filter + sort กลับค่า default", async ({ page }) => {
      await goToReportedAssets(page);
      await page.locator("#asset-report-search").fill("RPA-");
      await pickReportedAssetCustomOption(page, "asset-report-status-filter", "Pending");
      await pickReportedAssetCustomOption(page, "asset-report-priority-filter", "high");
      await pickReportedAssetCustomOption(page, "asset-report-sort", "reporters");
      await clickAssetReportReset(page);
      await page.waitForTimeout(300);
      await expect(page.locator("#asset-report-search")).toHaveValue("");
      await expect(page.locator("#asset-report-status-filter")).toHaveValue("");
      await expect(page.locator("#asset-report-priority-filter")).toHaveValue("");
      await expect(page.locator("#asset-report-sort")).toHaveValue("latest");
      await expect(page.locator(".user-row.report-row.asset-report-row:not(.head)")).toHaveCount(6);
    });

    test("71. คลิกแถวรายงานเปิด Asset Report Detail ถูกเคส + row menu ดูรายละเอียดได้", async ({ page }) => {
      await goToReportedAssets(page);
      await page.locator(".user-row.report-row.asset-report-row[data-asset-report-card='AST-8694'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Report Detail");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Asset Management / Report Detail / RPA-694");
      await page.locator("[data-back-reported-assets]").click();
      await page.waitForTimeout(300);
      await openAssetReportRowMenu(page, "AST-8559");
      await page.locator(".user-row.report-row.asset-report-row[data-asset-report-card='AST-8559'] button[data-asset-report-open='AST-8559']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Asset Management / Report Detail / RPA-559");
    });
  });

  // ==================== N. ASSET REPORT DETAIL ====================

  test.describe("Asset Report Detail — context, linked entities, audit", () => {
    test("72. Report Detail RPA-694: head + chips + breadcrumb + back button", async ({ page }) => {
      await goToReportedAssets(page);
      await page.locator(".user-row.report-row.asset-report-row[data-asset-report-card='AST-8694'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      await expect(page.locator(".asset-report-heading")).toContainText("RPA-694");
      await expect(page.locator(".asset-report-heading")).toContainText("Audemars Piguet Royal Oak");
      await expect(page.locator(".report-detail-page .chips .pill").first()).toHaveText("Pending");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Asset Management / Report Detail / RPA-694");
      await expect(page.locator("#panel-title")).toHaveText("Audemars Piguet Royal Oak");
      await expect(page.locator("#panel-subtitle")).toContainText("RPA-694");
      await expect(page.locator("#panel-subtitle")).toContainText("reporter identity masked");
      await expect(page.locator("[data-back-reported-assets]")).toBeVisible();
    });

    test("73. section Reported Asset แสดง Report ID / Asset ID / Asset Name / Owner ID / Owner / Asset Status + View Asset button", async ({ page }) => {
      await goToReportedAssets(page);
      await page.locator(".user-row.report-row.asset-report-row[data-asset-report-card='AST-8694'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      const grid = page.locator(".report-detail-page .report-reference-grid");
      await expect(grid.locator(".detail-tile").filter({ hasText: "Report ID" })).toContainText("RPA-694");
      await expect(grid.locator(".detail-tile").filter({ hasText: "Asset ID" })).toContainText("AST-8694");
      await expect(grid.locator(".detail-tile").filter({ hasText: "Asset Name" })).toContainText("Audemars Piguet Royal Oak");
      await expect(grid.locator(".detail-tile").filter({ hasText: "Owner ID" }).first()).toContainText("U-1094");
      // Owner tile (not Owner ID) — use exact span text match
      await expect(grid.locator(".detail-tile").filter({ has: page.locator("span:text-is('Owner')") })).toContainText("Rolex Rama9");
      await expect(grid.locator(".detail-tile").filter({ hasText: "Asset Status" })).toBeVisible();
      // View Asset button
      await expect(page.locator("button[data-asset-report-detail-modal='AST-8694']")).toBeVisible();
    });

    test("74. View Asset modal เปิดได้ แสดง asset preview + description + specifications", async ({ page }) => {
      await goToReportedAssets(page);
      await page.locator(".user-row.report-row.asset-report-row[data-asset-report-card='AST-8694'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      await page.locator("button[data-asset-report-detail-modal='AST-8694']").click();
      await page.waitForTimeout(300);
      const modal = page.locator("#user-action-modal");
      await expect(modal).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal-title")).toContainText("AST-8694");
      await expect(page.locator("#user-action-modal-title")).toContainText("Audemars Piguet Royal Oak");
      await expect(modal.locator(".asset-fo-preview")).toBeVisible();
      await expect(modal.locator("h4").filter({ hasText: "Description" })).toBeVisible();
      await expect(modal.locator("h4").filter({ hasText: "Specifications" })).toBeVisible();
    });

    test("75. Reporter History + Admin Action History tables แสดงครบ", async ({ page }) => {
      await goToReportedAssets(page);
      await page.locator(".user-row.report-row.asset-report-row[data-asset-report-card='AST-8694'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      await expect(page.locator(".report-detail-page h4").filter({ hasText: "Reporter History" })).toBeVisible();
      await expect(page.locator(".report-detail-page h4").filter({ hasText: "Admin Action History" })).toBeVisible();
      const reporterTable = page.locator(".report-detail-page .history-table").first();
      if (page.viewportSize().width > 760) {
        await expect(reporterTable.locator("thead th").first()).toHaveText("วันที่ / เวลา");
        await expect(reporterTable.locator("thead th").filter({ hasText: "Reporter" })).toBeVisible();
      }
      await expect(reporterTable.locator("tbody tr")).toHaveCount(3);
    });

    test("76. back จาก Report Detail กลับ Reported Assets ได้", async ({ page }) => {
      await goToReportedAssets(page);
      await page.locator(".user-row.report-row.asset-report-row[data-asset-report-card='AST-8694'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      await page.locator("[data-back-reported-assets]").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Reported Assets");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Asset Management / Reported Assets");
      await expect(page.locator(".user-row.report-row.asset-report-row:not(.head)")).toHaveCount(6);
    });
  });

  // ==================== O. REPORT STATUS ACTION + CONFIRM MODAL ====================

  test.describe("Asset Report Detail — status action, confirmation modal, result state", () => {
    test("77. RPA-694 (Pending) มีปุ่มปิดรายงาน (primary) + asset actions (hide + delete-post)", async ({ page }) => {
      await goToReportedAssets(page);
      await page.locator(".user-row.report-row.asset-report-row[data-asset-report-card='AST-8694'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      const actions = page.locator(".report-detail-page .user-detail-actions");
      await expect(actions.locator("button[data-asset-report-status-action='Closed']")).toHaveClass(/primary/);
      await expect(actions.locator("button[data-asset-report-status-action='Closed']")).toHaveText("ปิดรายงาน");
      await expect(actions.locator("button[data-asset-action='hide']")).toBeVisible();
      await expect(actions.locator("button[data-asset-action='delete-post']")).toBeVisible();
    });

    test("78. ปิดรายงาน: modal ยืนยัน + เหตุผล + note + ยืนยัน → สถานะ Closed + toast + audit เพิ่ม", async ({ page }) => {
      await goToReportedAssets(page);
      await page.locator(".user-row.report-row.asset-report-row[data-asset-report-card='AST-8694'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      const auditBefore = await page.locator(".report-detail-page .history-table").nth(1).locator("tbody tr").count();
      await page.locator(".report-detail-page button[data-asset-report-status-action='Closed']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#user-action-modal-title")).toHaveText("ยืนยันการปิดรายงาน");
      await expect(page.locator("#user-action-modal .user-action-target")).toContainText("Audemars Piguet Royal Oak");
      await expect(page.locator("#user-action-modal .user-action-target")).toContainText("RPA-694");
      await expect(page.locator("#asset-report-close-reason")).toHaveValue("ตรวจหลักฐานครบแล้ว ไม่พบประเด็นค้าง");
      await expect(page.locator("#asset-report-close-note")).toBeVisible();
      await page.locator("#user-action-modal [data-asset-report-status-confirm='Closed']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toContainText("RPA-694");
      await expect(page.locator(".report-detail-page .chips .pill").first()).toHaveClass(/green/);
      await expect(page.locator(".report-detail-page .chips .pill").first()).toHaveText("Closed");
      const auditAfter = await page.locator(".report-detail-page .history-table").nth(1).locator("tbody tr").count();
      expect(auditAfter).toBe(auditBefore + 1);
    });

    test("79. รายงาน Closed (RPA-581 / AST-8581) ไม่มีปุ่ม action ใด ๆ", async ({ page }) => {
      await goToReportedAssets(page);
      await page.locator("#asset-report-search").fill("RPA-581");
      await page.waitForTimeout(200);
      await page.locator(".user-row.report-row.asset-report-row[data-asset-report-card='AST-8581'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      await expect(page.locator(".report-detail-page .user-detail-actions")).toHaveCount(0);
    });

    test("80. ปิดรายงานจาก Report Detail → กลับคิว แถวเปลี่ยนเป็น Closed", async ({ page }) => {
      await goToReportedAssets(page);
      await page.locator(".user-row.report-row.asset-report-row[data-asset-report-card='AST-8694'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      await page.locator(".report-detail-page button[data-asset-report-status-action='Closed']").click();
      await page.waitForTimeout(300);
      await page.locator("#user-action-modal [data-asset-report-status-confirm='Closed']").click();
      await page.waitForTimeout(400);
      await page.locator("[data-back-reported-assets]").click();
      await page.waitForTimeout(300);
      const row = page.locator(".user-row.report-row.asset-report-row[data-asset-report-card='AST-8694']");
      await expect(row.locator("div[data-label='Status'] .pill")).toHaveClass(/green/);
      await expect(row.locator("div[data-label='Status'] .pill")).toHaveText("Closed");
    });
  });

  // ==================== P. ASSET ACTION จาก REPORT CONTEXT ====================

  test.describe("Asset Report Detail — asset action from report context", () => {
    test("81. hide จาก report context → สถานะ asset เปลี่ยน + audit เพิ่ม + toast", async ({ page }) => {
      await goToReportedAssets(page);
      await page.locator(".user-row.report-row.asset-report-row[data-asset-report-card='AST-8694'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      const auditBefore = await page.locator(".report-detail-page .history-table").nth(1).locator("tbody tr").count();
      await page.locator(".report-detail-page button[data-asset-action='hide']").click();
      await page.waitForTimeout(200);
      await expect(page.locator("#user-action-modal-title")).toHaveText("ซ่อนสินทรัพย์ชั่วคราว");
      await page.locator("#user-action-modal [data-asset-action-confirm='hide']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toContainText("AST-8694");
      const auditAfter = await page.locator(".report-detail-page .history-table").nth(1).locator("tbody tr").count();
      expect(auditAfter).toBe(auditBefore + 1);
    });

    test("82. delete-post จาก report context → รายงานถูกปิดด้วย (queue pill เปลี่ยนเป็น Closed)", async ({ page }) => {
      await goToReportedAssets(page);
      await page.locator(".user-row.report-row.asset-report-row[data-asset-report-card='AST-8559'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      await page.locator(".report-detail-page button[data-asset-action='delete-post']").click();
      await page.waitForTimeout(200);
      await expect(page.locator("#user-action-modal-title")).toHaveText("ซ่อนสินทรัพย์ถาวร");
      await page.locator("#user-action-modal [data-asset-action-confirm='delete-post']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toContainText("AST-8559");
      await expect(page.locator(".report-detail-page .chips .pill").first()).toHaveClass(/green/);
      await expect(page.locator(".report-detail-page .chips .pill").first()).toHaveText("Closed");
    });

    test("83. restore-visibility จาก report context → รายงานถูกปิดด้วย", async ({ page }) => {
      await goToReportedAssets(page);
      // AST-8831 = Auto Hidden, RPA-831 = Pending
      await page.locator(".user-row.report-row.asset-report-row[data-asset-report-card='AST-8831'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      await page.locator(".report-detail-page button[data-asset-action='restore-visibility']").click();
      await page.waitForTimeout(200);
      await expect(page.locator("#user-action-modal-title")).toHaveText("ยกเลิกการซ่อนชั่วคราว");
      await page.locator("#user-action-modal [data-asset-action-confirm='restore-visibility']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toContainText("AST-8831");
      await expect(page.locator(".report-detail-page .chips .pill").first()).toHaveClass(/green/);
      await expect(page.locator(".report-detail-page .chips .pill").first()).toHaveText("Closed");
    });

    test("84. report ของ asset ที่ถูก Auto Hidden (RPA-831 / AST-8831): มี restore-visibility + delete-post (ไม่มีปิดรายงานเพราะ temporarily hidden)", async ({ page }) => {
      await goToReportedAssets(page);
      await page.locator(".user-row.report-row.asset-report-row[data-asset-report-card='AST-8831'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      const actions = page.locator(".report-detail-page .user-detail-actions");
      // AST-8831 is Auto Hidden (temporarily hidden) → getAssetReportStatusActions returns [] (no ปิดรายงาน)
      await expect(actions.locator("button[data-asset-report-status-action='Closed']")).toHaveCount(0);
      await expect(actions.locator("button[data-asset-action='restore-visibility']")).toBeVisible();
      await expect(actions.locator("button[data-asset-action='delete-post']")).toBeVisible();
    });
  });

  // ==================== Q. RESPONSIVE — REPORTED ASSETS MOBILE CARD ====================

  test.describe("Reported Assets — mobile card (≤760px)", () => {
    test("85. mobile 390px: card รายงานแสดง metadata ครบ (asset/reporters/reason)", async ({ page }) => {
      test.skip(page.viewportSize().width > 760, "mobile only");
      await goToReportedAssets(page);
      const row = page.locator(".user-row.report-row.asset-report-row[data-asset-report-card='AST-8694']");
      await expect(row.locator(".user-card-tags")).toBeVisible();
      await expect(row.locator(".user-card-tags .pill").first()).toContainText("Pending");
      await expect(row.locator(".user-card-tag.asset-tag")).toContainText("reporters");
      const meta = row.locator(".user-card-meta");
      await expect(meta).toBeVisible();
      await expect(meta.locator(".user-card-meta-item").nth(0)).toContainText("Audemars Piguet Royal Oak");
      await expect(row.locator(".report-reason-meta")).toContainText("Report reason");
    });

    test("86. desktop 1440px: ตารางรายงานแสดงคอลัมน์ครบ 9 คอลัมน์", async ({ page }) => {
      test.skip(page.viewportSize().width <= 760, "desktop only");
      await goToReportedAssets(page);
      const head = page.locator(".user-row.report-row.asset-report-row.head");
      for (const label of ["Report ID", "Asset", "Asset Status", "Status", "Reported At", "Report Reason", "Reporters", "Priority", "Action"]) {
        await expect(head.locator(`div:text-is("${label}")`)).toBeVisible();
      }
    });

    test("87. mobile 390px: filter toggle เปิด/ปิด filter bar ได้", async ({ page }) => {
      test.skip(page.viewportSize().width > 760, "mobile only");
      await goToReportedAssets(page);
      const bar = page.locator(".user-filter-bar.report-mode");
      await expect(bar).toHaveAttribute("data-filter-open", "false");
      await page.locator("[data-asset-report-filter-toggle]").click();
      await page.waitForTimeout(200);
      await expect(bar).toHaveAttribute("data-filter-open", "true");
      await expect(page.locator("#asset-report-status-filter").locator("xpath=ancestor::div[@data-custom-select]")).toBeVisible();
      await page.locator("[data-asset-report-filter-toggle]").click();
      await page.waitForTimeout(200);
      await expect(bar).toHaveAttribute("data-filter-open", "false");
    });
  });
});
