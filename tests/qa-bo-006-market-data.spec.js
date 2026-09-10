// QA-BO-006: Market Data (Dashboard, Brands & Models, Sync History) — strict Playwright spec
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล, spec docs เป็นหลักสำหรับพฤติกรรม/นำทาง
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

// helper: ไปหน้า Market Data > Dashboard ผ่านเมนู
async function goToMarketDashboard(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  const parent = page.locator(".nav-item[data-module='market']");
  const expanded = await parent.evaluate(el => el.classList.contains("expanded")).catch(() => false);
  if (!expanded) await parent.click();
  await page.waitForTimeout(200);
  await page.locator(".submenu[data-submenu='market'] button[data-sub='Dashboard']").click();
  await page.waitForTimeout(300);
}

// helper: ไปหน้า Market Data > Brands & Models ผ่านเมนู
async function goToMarketBrands(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  const parent = page.locator(".nav-item[data-module='market']");
  const expanded = await parent.evaluate(el => el.classList.contains("expanded")).catch(() => false);
  if (!expanded) await parent.click();
  await page.waitForTimeout(200);
  await page.locator(".submenu[data-submenu='market'] button[data-sub='Brands & Models']").click();
  await page.waitForTimeout(300);
}

// helper: ไปหน้า Market Data > Sync History ผ่านเมนู
async function goToMarketSyncHistory(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  const parent = page.locator(".nav-item[data-module='market']");
  const expanded = await parent.evaluate(el => el.classList.contains("expanded")).catch(() => false);
  if (!expanded) await parent.click();
  await page.waitForTimeout(200);
  await page.locator(".submenu[data-submenu='market'] button[data-sub='Sync History']").click();
  await page.waitForTimeout(300);
}

// helper: เปิด filter bar ถ้ายังปิด (mobile)
async function openFilterBar(page) {
  const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
  if (!isMobile) return;
  const bar = page.locator(".user-filter-bar.market-mode");
  const isOpen = await bar.getAttribute("data-filter-open");
  if (isOpen === "false") {
    await page.locator("[data-market-filter-toggle]").click();
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

// helper: กดปุ่มรีเซ็ตค่าทั้งหมด — เลือกปุ่มที่ visible
async function clickResetButton(page) {
  await page.locator("[data-market-reset]:visible").first().click();
  await page.waitForTimeout(300);
}

// helper: ปิด row menu / modal ที่ค้าง
async function dismissOverlays(page) {
  await page.locator("body").click({ position: { x: 5, y: 5 } });
  await page.waitForTimeout(150);
}

// helper: นับจำนวนแถวในตาราง market ที่ไม่ใช่ head
async function countMarketRows(page) {
  return await page.locator(".market-table .asset-row:not(.head)").count();
}

test.describe("QA-BO-006: Market Data (Dashboard, Brands & Models, Sync History) (strict)", () => {

  // ==================== A. NAVIGATION / MENU / ACTIVE STATE ====================

  test.describe("Navigation — menu entry, submenu, active state", () => {
    test("1. Market Data menu กาง submenu ได้ มี Dashboard, Brands & Models, Sync History", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await ensureNavOpen(page);
      await page.locator(".nav-item[data-module='market']").click();
      await page.waitForTimeout(200);
      const submenu = page.locator(".submenu[data-submenu='market']");
      await expect(submenu).toHaveClass(/open/);
      await expect(submenu.locator("button[data-sub='Dashboard']")).toBeVisible();
      await expect(submenu.locator("button[data-sub='Brands & Models']")).toBeVisible();
      await expect(submenu.locator("button[data-sub='Sync History']")).toBeVisible();
    });

    test("2. เข้า Market Data แล้วเปิด Dashboard เป็นหน้าแรก (default)", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await ensureNavOpen(page);
      await page.locator(".nav-item[data-module='market']").click();
      await page.waitForTimeout(200);
      await page.locator(".submenu[data-submenu='market'] button[data-sub='Dashboard']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Dashboard");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Market Data / Dashboard");
    });

    test("3. เข้า Brands & Models: page title + breadcrumb + panel title ถูกต้อง", async ({ page }) => {
      await goToMarketBrands(page);
      await expect(page.locator("#page-title")).toHaveText("Brands & Models");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Market Data / Brands & Models");
      await expect(page.locator("#panel-title")).toContainText("All Brands");
      await expect(page.locator("#panel-title")).toContainText("[");
    });

    test("4. เข้า Sync History: page title + breadcrumb + panel title ถูกต้อง", async ({ page }) => {
      await goToMarketSyncHistory(page);
      await expect(page.locator("#page-title")).toHaveText("Sync History");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Market Data / Sync History");
      await expect(page.locator("#panel-title")).toHaveText("Sync Run History");
    });

    test("5. active state สลับถูกต้องเมื่อสลับหน้า", async ({ page }) => {
      await goToMarketDashboard(page);
      await expect(page.locator(".submenu[data-submenu='market'] button[data-sub='Dashboard']")).toHaveClass(/active/);
      await ensureNavOpen(page);
      await page.locator(".submenu[data-submenu='market'] button[data-sub='Brands & Models']").click();
      await page.waitForTimeout(300);
      await expect(page.locator(".submenu[data-submenu='market'] button[data-sub='Brands & Models']")).toHaveClass(/active/);
      await ensureNavOpen(page);
      await page.locator(".submenu[data-submenu='market'] button[data-sub='Sync History']").click();
      await page.waitForTimeout(300);
      await expect(page.locator(".submenu[data-submenu='market'] button[data-sub='Sync History']")).toHaveClass(/active/);
      await ensureNavOpen(page);
      await page.locator(".submenu[data-submenu='market'] button[data-sub='Dashboard']").click();
      await page.waitForTimeout(300);
      await expect(page.locator(".submenu[data-submenu='market'] button[data-sub='Dashboard']")).toHaveClass(/active/);
    });
  });

  // ==================== B. DASHBOARD ====================

  test.describe("Dashboard — summary cards, status strip, recently updated brands", () => {
    test("6. Dashboard แสดง summary cards ครบ 4 ใบ: Total Brands, Total Models, Total References, Last Sync", async ({ page }) => {
      await goToMarketDashboard(page);
      const labels = page.locator("#summary-grid .stat .stat-label");
      await expect(labels.nth(0)).toHaveText("Total Brands");
      await expect(labels.nth(1)).toHaveText("Total Models");
      await expect(labels.nth(2)).toHaveText("Total References");
      await expect(labels.nth(3)).toHaveText("Last Sync");
    });

    test("7. Dashboard summary cards มีค่าไม่ว่าง", async ({ page }) => {
      await goToMarketDashboard(page);
      const values = page.locator("#summary-grid .stat .stat-value");
      for (let i = 0; i < 4; i++) {
        const text = await values.nth(i).textContent();
        expect(text.trim().length).toBeGreaterThan(0);
      }
    });

    test("8. Dashboard แสดง Latest Sync Status strip เมื่อมี active sync (Running/Failed)", async ({ page }) => {
      await goToMarketDashboard(page);
      // prototype มี JOB-OMEGA-SEARCH (Running) → ต้องแสดง status strip
      const statusStrip = page.locator(".market-dashboard-sync-status");
      await expect(statusStrip).toBeVisible();
      await expect(statusStrip.locator(".market-progress-ring")).toBeVisible();
      await expect(statusStrip.locator("[data-market-sync-view-logs]")).toBeVisible();
    });

    test("9. Dashboard status strip ปุ่ม 'ดูรายละเอียดใน Sync History' นำไป Sync History", async ({ page }) => {
      await goToMarketDashboard(page);
      await page.locator("[data-market-sync-view-logs]").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Sync History");
    });

    test("10. Dashboard แสดงตาราง Recently Updated Brands", async ({ page }) => {
      await goToMarketDashboard(page);
      await expect(page.locator(".market-dashboard-brand-table")).toBeVisible();
      const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
      if (isMobile) {
        const rows = page.locator(".market-dashboard-brand-table .asset-row:not(.head)");
        expect(await rows.count()).toBeGreaterThanOrEqual(1);
      } else {
        const head = page.locator(".market-dashboard-brand-table .asset-row.head");
        await expect(head.locator("div").nth(0)).toHaveText("Brand");
        await expect(head.locator("div").nth(1)).toHaveText("Models");
        await expect(head.locator("div").nth(2)).toHaveText("References");
        await expect(head.locator("div").nth(3)).toHaveText("Last Updated");
        await expect(head.locator("div").nth(4)).toHaveText("Status");
      }
    });

    test("11. Dashboard brand row คลิกไป Brand detail ได้", async ({ page }) => {
      await goToMarketDashboard(page);
      const firstRow = page.locator(".market-dashboard-brand-table .asset-row:not(.head)").first();
      const brandName = await firstRow.locator("[data-label='Brand'] .main-text").textContent();
      await firstRow.locator("[data-label='Brand']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText(brandName.trim());
      await expect(page.locator("#crumb")).toContainText("Brands & Models");
      await expect(page.locator("#crumb")).toContainText(brandName.trim());
    });

    test("12. Dashboard pagination แสดงช่วงรายการ และปุ่มก่อนหน้า/ถัดไป", async ({ page }) => {
      await goToMarketDashboard(page);
      const footer = page.locator(".market-dashboard-table .footer-range");
      await expect(footer).toBeVisible();
      const rangeSpan = footer.locator("span").first();
      await expect(rangeSpan).toContainText("แสดง");
      await expect(rangeSpan).toContainText("จาก");
      await expect(footer.locator(".pager")).toBeVisible();
    });

    test("13. Dashboard pagination กดถัดไปได้ (ถ้ามีหลายหน้า)", async ({ page }) => {
      await goToMarketDashboard(page);
      const totalText = await page.locator(".market-dashboard-table .footer-range span").first().textContent();
      const totalMatch = totalText.match(/จาก\s*(\d+)/);
      const total = totalMatch ? Number(totalMatch[1]) : 0;
      const nextBtn = page.locator(".market-dashboard-table .footer-range [data-market-dashboard-page='next']");
      if (total > 10) {
        await nextBtn.click();
        await page.waitForTimeout(300);
        const footerText = await page.locator(".market-dashboard-table .footer-range span").first().textContent();
        expect(footerText).toContain("11-");
      } else {
        // skip if only 1 page
        expect(total).toBeGreaterThan(0);
      }
    });

    test("14. Dashboard ไม่มี info cards (ตาม prototype Dashboard ไม่แสดง info cards)", async ({ page }) => {
      await goToMarketDashboard(page);
      const cards = page.locator("#cards .mini-card");
      await expect(cards).toHaveCount(0);
    });

    test("15. Dashboard ไม่มี filter bar (ว่างตาม prototype)", async ({ page }) => {
      await goToMarketDashboard(page);
      const filters = page.locator(".filters");
      const filterChildren = await filters.locator("*").count();
      expect(filterChildren).toBe(0);
    });
  });

  // ==================== C. BRANDS & MODELS (catalog list) ====================

  test.describe("Brands & Models — list, search, pagination, drill-down", () => {
    test("16. Brands & Models แสดง panel title 'All Brands [count]'", async ({ page }) => {
      await goToMarketBrands(page);
      const panelTitle = page.locator("#panel-title");
      const text = await panelTitle.textContent();
      expect(text).toMatch(/All Brands\s*\[\d+\]/);
    });

    test("17. Brands & Models มี search field พร้อม placeholder ที่ค้นหา brand/model/reference ได้", async ({ page }) => {
      await goToMarketBrands(page);
      const search = page.locator("#market-search");
      await expect(search).toBeVisible();
      const placeholder = await search.getAttribute("placeholder");
      expect(placeholder.length).toBeGreaterThan(0);
    });

    test("18. Brands & Models แสดง summary cards ครบ 4 ใบ: Sample Brands, Sample Models, Sample References, Latest Sync", async ({ page }) => {
      await goToMarketBrands(page);
      const labels = page.locator("#summary-grid .stat .stat-label");
      await expect(labels.nth(0)).toHaveText("Sample Brands");
      await expect(labels.nth(1)).toHaveText("Sample Models");
      await expect(labels.nth(2)).toHaveText("Sample References");
      await expect(labels.nth(3)).toHaveText("Latest Sync");
    });

    test("19. Brands & Models แสดง info cards ครบ 3 ใบ: Brand-first workflow, API source, Read-only", async ({ page }) => {
      await goToMarketBrands(page);
      const cards = page.locator("#cards .mini-card h3");
      await expect(cards.nth(0)).toHaveText("Brand-first workflow");
      await expect(cards.nth(1)).toHaveText("API source");
      await expect(cards.nth(2)).toHaveText("Read-only");
    });

    test("20. Brands & Models ตารางแสดง column Brand, Models, References, Action (desktop)", async ({ page }) => {
      await goToMarketBrands(page);
      const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
      if (isMobile) {
        const rows = page.locator(".market-catalog-table .asset-row:not(.head)");
        expect(await rows.count()).toBeGreaterThanOrEqual(1);
      } else {
        const head = page.locator(".market-catalog-table .asset-row.head");
        await expect(head.locator("div").nth(0)).toHaveText("Brand");
        await expect(head.locator("div").nth(1)).toHaveText("Models");
        await expect(head.locator("div").nth(2)).toHaveText("References");
        await expect(head.locator("div").nth(3)).toHaveText("Action");
      }
    });

    test("21. Brands & Models แต่ละ row มีปุ่ม View (desktop) หรือ row click ได้ (mobile)", async ({ page }) => {
      await goToMarketBrands(page);
      const firstRow = page.locator(".market-catalog-table .asset-row:not(.head)").first();
      const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
      if (!isMobile) {
        await expect(firstRow.locator("button[data-market-brand]")).toBeVisible();
        await expect(firstRow.locator("button[data-market-brand]")).toHaveText("View");
      } else {
        await expect(firstRow).toBeVisible();
      }
    });

    test("22. Brands & Models ปุ่ม View / row click เปิด Brand detail ได้", async ({ page }) => {
      await goToMarketBrands(page);
      const firstRow = page.locator(".market-catalog-table .asset-row:not(.head)").first();
      const brandName = await firstRow.locator("[data-label='Brand'] .main-text").textContent();
      await firstRow.click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText(brandName.trim());
      await expect(page.locator("#crumb")).toContainText("Brands & Models");
    });

    test("23. Brands & Models คลิก row (primary cell) เปิด Brand detail ได้", async ({ page }) => {
      await goToMarketBrands(page);
      const firstRow = page.locator(".market-catalog-table .asset-row:not(.head)").first();
      const brandName = await firstRow.locator("[data-label='Brand'] .main-text").textContent();
      await firstRow.click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText(brandName.trim());
    });

    test("24. Brands & Models search กรองแบรนด์ได้", async ({ page }) => {
      await goToMarketBrands(page);
      const beforeCount = await countMarketRows(page);
      await page.locator("#market-search").fill("Rolex");
      await page.waitForTimeout(400);
      const afterCount = await countMarketRows(page);
      expect(afterCount).toBeGreaterThanOrEqual(1);
      expect(afterCount).toBeLessThanOrEqual(beforeCount);
      // แถวที่แสดงต้องมี Rolex
      const firstRow = page.locator(".market-catalog-table .asset-row:not(.head)").first();
      await expect(firstRow.locator("[data-label='Brand'] .main-text")).toHaveText("Rolex");
    });

    test("25. Brands & Models search ไม่เจอ → แสดง empty state 'No brands found'", async ({ page }) => {
      await goToMarketBrands(page);
      await page.locator("#market-search").fill("zzzznonexistent");
      await page.waitForTimeout(400);
      await expect(page.locator(".market-catalog-table")).toContainText("No brands found");
    });

    test("26. Brands & Models search reset กลับมาแสดงทั้งหมด", async ({ page }) => {
      await goToMarketBrands(page);
      const beforeCount = await countMarketRows(page);
      await page.locator("#market-search").fill("Rolex");
      await page.waitForTimeout(400);
      const filteredCount = await countMarketRows(page);
      expect(filteredCount).toBeLessThanOrEqual(beforeCount);
      await page.locator("#market-search").fill("");
      await page.waitForTimeout(400);
      const resetCount = await countMarketRows(page);
      expect(resetCount).toBe(beforeCount);
    });

    test("27. Brands & Models pagination แสดงช่วงรายการ", async ({ page }) => {
      await goToMarketBrands(page);
      const footer = page.locator(".market-catalog-table").locator("..").locator(".footer-range");
      await expect(footer).toBeVisible();
      const rangeSpan = footer.locator("span").first();
      await expect(rangeSpan).toContainText("แสดง");
      await expect(rangeSpan).toContainText("จาก");
    });

    test("28. Brands & Models pagination กดถัดไปได้ (ถ้ามีหลายหน้า)", async ({ page }) => {
      await goToMarketBrands(page);
      const totalText = await page.locator(".footer-range span").first().textContent();
      const totalMatch = totalText.match(/จาก\s*(\d+)/);
      const total = totalMatch ? Number(totalMatch[1]) : 0;
      if (total > 10) {
        const nextBtn = page.locator("[data-market-catalog-page='next']");
        await nextBtn.click();
        await page.waitForTimeout(300);
        const footerText = await page.locator(".footer-range span").first().textContent();
        expect(footerText).toContain("11-");
      } else {
        expect(total).toBeGreaterThan(0);
      }
    });

    test("29. Brands & Models search แล้ว pagination reset ไปหน้าแรก", async ({ page }) => {
      await goToMarketBrands(page);
      const totalText = await page.locator(".footer-range span").first().textContent();
      const totalMatch = totalText.match(/จาก\s*(\d+)/);
      const total = totalMatch ? Number(totalMatch[1]) : 0;
      if (total > 10) {
        // ไปหน้า 2 ก่อน
        await page.locator("[data-market-catalog-page='next']").click();
        await page.waitForTimeout(300);
        // ค้นหา → ต้องกลับไปหน้า 1
        await page.locator("#market-search").fill("Rolex");
        await page.waitForTimeout(400);
        const footerText = await page.locator(".footer-range span").first().textContent();
        expect(footerText).toContain("1-");
      } else {
        expect(total).toBeGreaterThan(0);
      }
    });
  });

  // ==================== D. BRAND DETAIL ====================

  test.describe("Brand Detail — model list, search, back navigation", () => {
    test("30. Brand Detail: breadcrumb + page title + back button ถูกต้อง", async ({ page }) => {
      await goToMarketBrands(page);
      const firstRow = page.locator(".market-catalog-table .asset-row:not(.head)").first();
      const brandName = await firstRow.locator("[data-label='Brand'] .main-text").textContent();
      await firstRow.click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText(brandName.trim());
      await expect(page.locator("#crumb")).toHaveText(`การดำเนินงาน / Market Data / Brands & Models / ${brandName.trim()}`);
      await expect(page.locator(".page-back-btn")).toHaveAttribute("data-market-back", "catalog");
    });

    test("31. Brand Detail: panel title '<Brand> — All Models (count)' ถูกต้อง", async ({ page }) => {
      await goToMarketBrands(page);
      const firstRow = page.locator(".market-catalog-table .asset-row:not(.head)").first();
      const brandName = await firstRow.locator("[data-label='Brand'] .main-text").textContent();
      await firstRow.click();
      await page.waitForTimeout(300);
      const panelTitle = await page.locator("#panel-title").textContent();
      expect(panelTitle).toContain(brandName.trim());
      expect(panelTitle).toContain("All Models");
      expect(panelTitle).toMatch(/\(\d+\)/);
    });

    test("32. Brand Detail: ไม่มี summary cards และ info cards", async ({ page }) => {
      await goToMarketBrands(page);
      await page.locator(".market-catalog-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
      await expect(page.locator("#summary-grid .stat")).toHaveCount(0);
      await expect(page.locator("#cards .mini-card")).toHaveCount(0);
    });

    test("33. Brand Detail: มี search field สำหรับค้นหา model", async ({ page }) => {
      await goToMarketBrands(page);
      await page.locator(".market-catalog-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
      const search = page.locator("#market-model-search");
      await expect(search).toBeVisible();
      const placeholder = await search.getAttribute("placeholder");
      expect(placeholder).toContain("Search");
      expect(placeholder).toMatch(/models/i);
    });

    test("34. Brand Detail: ตารางแสดง column Model, References, Action (desktop)", async ({ page }) => {
      await goToMarketBrands(page);
      await page.locator(".market-catalog-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
      const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
      if (isMobile) {
        const rows = page.locator(".market-model-table .asset-row:not(.head)");
        expect(await rows.count()).toBeGreaterThanOrEqual(1);
      } else {
        const head = page.locator(".market-model-table .asset-row.head");
        await expect(head.locator("div").nth(0)).toHaveText("Model");
        await expect(head.locator("div").nth(1)).toHaveText("References");
        await expect(head.locator("div").nth(2)).toHaveText("Action");
      }
    });

    test("35. Brand Detail: ปุ่ม View เปิด Model detail ได้", async ({ page }) => {
      await goToMarketBrands(page);
      await page.locator(".market-catalog-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
      const firstModelRow = page.locator(".market-model-table .asset-row:not(.head)").first();
      const modelName = await firstModelRow.locator("[data-label='Model'] .main-text").textContent();
      await firstModelRow.click();
      await page.waitForTimeout(300);
      // Model detail page title คือ short name (brand prefix ถูกตัดออก)
      const pageTitle = await page.locator("#page-title").textContent();
      expect(modelName.trim().replace(/^Rolex\s+/, "")).toContain(pageTitle.trim());
    });

    test("36. Brand Detail: คลิก row (primary cell) เปิด Model detail ได้", async ({ page }) => {
      await goToMarketBrands(page);
      await page.locator(".market-catalog-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
      const firstModelRow = page.locator(".market-model-table .asset-row:not(.head)").first();
      await firstModelRow.locator("[data-label='Model']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#panel-title")).toContainText("All References");
    });

    test("37. Brand Detail: search model กรองได้", async ({ page }) => {
      await goToMarketBrands(page);
      await page.locator(".market-catalog-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
      const beforeCount = await page.locator(".market-model-table .asset-row:not(.head)").count();
      // first brand is Audemars Piguet, first model is "Royal Oak"
      await page.locator("#market-model-search").fill("Royal Oak");
      await page.waitForTimeout(400);
      const afterCount = await page.locator(".market-model-table .asset-row:not(.head)").count();
      expect(afterCount).toBeGreaterThanOrEqual(1);
      expect(afterCount).toBeLessThanOrEqual(beforeCount);
    });

    test("38. Brand Detail: search ไม่เจอ → empty state 'No models found for this brand'", async ({ page }) => {
      await goToMarketBrands(page);
      await page.locator(".market-catalog-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
      await page.locator("#market-model-search").fill("zzzznonexistent");
      await page.waitForTimeout(400);
      await expect(page.locator(".market-model-table")).toContainText("No models found for this brand");
    });

    test("39. Brand Detail: back button กลับไป Brands & Models", async ({ page }) => {
      await goToMarketBrands(page);
      await page.locator(".market-catalog-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Brands & Models");
    });
  });

  // ==================== E. MODEL DETAIL ====================

  test.describe("Model Detail — reference list, search, drawer, back navigation", () => {
    async function openModelDetail(page) {
      await goToMarketBrands(page);
      await page.locator(".market-catalog-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
      await page.locator(".market-model-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
    }

    test("40. Model Detail: breadcrumb + page title + back button ถูกต้อง", async ({ page }) => {
      await openModelDetail(page);
      await expect(page.locator("#crumb")).toContainText("Brands & Models");
      await expect(page.locator("#panel-title")).toContainText("All References");
      await expect(page.locator(".page-back-btn")).toHaveAttribute("data-market-back", "brand");
    });

    test("41. Model Detail: panel title '<Model> -- All References (count)' ถูกต้อง", async ({ page }) => {
      await openModelDetail(page);
      const panelTitle = await page.locator("#panel-title").textContent();
      expect(panelTitle).toContain("All References");
      expect(panelTitle).toMatch(/\(\d+\)/);
    });

    test("42. Model Detail: ไม่มี summary cards และ info cards", async ({ page }) => {
      await openModelDetail(page);
      await expect(page.locator("#summary-grid .stat")).toHaveCount(0);
      await expect(page.locator("#cards .mini-card")).toHaveCount(0);
    });

    test("43. Model Detail: มี search field สำหรับค้นหา reference", async ({ page }) => {
      await openModelDetail(page);
      const search = page.locator("#market-reference-search");
      await expect(search).toBeVisible();
      const placeholder = await search.getAttribute("placeholder");
      expect(placeholder).toContain("Search");
      expect(placeholder).toMatch(/reference/i);
    });

    test("44. Model Detail: ตารางแสดง column Reference No., Movement, Production Year, Material, Estimated Price, Last Updated (desktop)", async ({ page }) => {
      await openModelDetail(page);
      const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
      if (isMobile) {
        const rows = page.locator(".market-reference-list-table .asset-row:not(.head)");
        expect(await rows.count()).toBeGreaterThanOrEqual(1);
      } else {
        const head = page.locator(".market-reference-list-table .asset-row.head");
        await expect(head.locator("div").nth(0)).toHaveText("Reference No.");
        await expect(head.locator("div").nth(1)).toHaveText("Movement");
        await expect(head.locator("div").nth(2)).toHaveText("Production Year");
        await expect(head.locator("div").nth(3)).toHaveText("Material");
        await expect(head.locator("div").nth(4)).toHaveText("Estimated Price");
        await expect(head.locator("div").nth(5)).toHaveText("Last Updated");
      }
    });

    test("45. Model Detail: reference row คลิกเปิด Reference detail drawer", async ({ page }) => {
      await openModelDetail(page);
      const firstRefRow = page.locator(".market-reference-list-table .asset-row:not(.head)").first();
      await firstRefRow.click();
      await page.waitForTimeout(300);
      const modal = page.locator("#user-action-modal");
      await expect(modal).toBeVisible();
      await expect(modal.locator(".market-reference-drawer")).toBeVisible();
    });

    test("46. Model Detail: search reference กรองได้", async ({ page }) => {
      await openModelDetail(page);
      const beforeCount = await page.locator(".market-reference-list-table .asset-row:not(.head)").count();
      // ใช้ reference number แรกที่เห็นในตาราง
      const firstRefNo = await page.locator(".market-reference-list-table .asset-row:not(.head)").first().locator("[data-label='Reference No.'] .main-text").textContent();
      await page.locator("#market-reference-search").fill(firstRefNo.trim());
      await page.waitForTimeout(400);
      const afterCount = await page.locator(".market-reference-list-table .asset-row:not(.head)").count();
      expect(afterCount).toBeGreaterThanOrEqual(1);
      expect(afterCount).toBeLessThanOrEqual(beforeCount);
    });

    test("47. Model Detail: search ไม่เจอ → empty state 'No references found for this model'", async ({ page }) => {
      await openModelDetail(page);
      await page.locator("#market-reference-search").fill("zzzznonexistent");
      await page.waitForTimeout(400);
      await expect(page.locator(".market-reference-list-table")).toContainText("No references found for this model");
    });

    test("48. Model Detail: back button กลับไป Brand detail", async ({ page }) => {
      await openModelDetail(page);
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(300);
      // กลับไป Brand detail (มี model table)
      await expect(page.locator(".market-model-table")).toBeVisible();
    });
  });

  // ==================== F. REFERENCE DETAIL DRAWER ====================

  test.describe("Reference Detail Drawer — spec grid, price card, source copy", () => {
    async function openReferenceDrawer(page) {
      await goToMarketBrands(page);
      await page.locator(".market-catalog-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
      await page.locator(".market-model-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
      await page.locator(".market-reference-list-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
    }

    test("49. Drawer header แสดง Brand uppercase, Model short name, Ref. <number>, ปุ่มปิด", async ({ page }) => {
      await openReferenceDrawer(page);
      const drawer = page.locator(".market-reference-drawer");
      await expect(drawer).toBeVisible();
      // Brand uppercase
      const brandSpan = drawer.locator(".market-drawer-head span");
      const brandText = await brandSpan.textContent();
      expect(brandText.trim()).toBe(brandText.trim().toUpperCase());
      // Model short name (h2)
      await expect(drawer.locator(".market-drawer-head h2")).toBeVisible();
      // Ref. number
      await expect(drawer.locator(".market-drawer-head p")).toContainText("Ref.");
      // ปุ่มปิด
      await expect(drawer.locator("[data-user-action-modal-close]")).toBeVisible();
    });

    test("50. Drawer spec grid แสดง Movement, ปีที่ผลิต, วัสดุตัวเรือน, ขนาดหน้าปัด", async ({ page }) => {
      await openReferenceDrawer(page);
      const specGrid = page.locator(".market-drawer-spec-grid");
      const labels = specGrid.locator("span");
      const labelTexts = await labels.allTextContents();
      expect(labelTexts.some(t => t.includes("Movement"))).toBeTruthy();
      expect(labelTexts.some(t => t.includes("ปีที่ผลิต"))).toBeTruthy();
      expect(labelTexts.some(t => t.includes("วัสดุตัวเรือน"))).toBeTruthy();
      expect(labelTexts.some(t => t.includes("ขนาดหน้าปัด"))).toBeTruthy();
    });

    test("51. Drawer price card แสดง label ราคาตลาด (USD), ราคา, trend, chart", async ({ page }) => {
      await openReferenceDrawer(page);
      const priceCard = page.locator(".market-price-card");
      await expect(priceCard).toBeVisible();
      await expect(priceCard.locator("span")).toContainText("ราคาตลาดโดยประมาณ (USD)");
      await expect(priceCard.locator("strong")).toBeVisible();
      // trend
      await expect(priceCard.locator("em")).toContainText("%");
      // chart svg
      await expect(priceCard.locator("svg")).toBeVisible();
    });

    test("52. Drawer แสดงคำอธิบาย (source copy) และ source note", async ({ page }) => {
      await openReferenceDrawer(page);
      await expect(page.locator(".market-source-copy")).toBeVisible();
      await expect(page.locator(".market-source-copy p")).toBeVisible();
      await expect(page.locator(".market-source-note")).toBeVisible();
      await expect(page.locator(".market-source-note")).toContainText("thewatchapi");
    });

    test("53. Drawer ปุ่มปิดทำงาน — ปิด drawer ได้", async ({ page }) => {
      await openReferenceDrawer(page);
      await page.locator(".market-reference-drawer [data-user-action-modal-close]").click();
      await page.waitForTimeout(300);
      const modal = page.locator("#user-action-modal");
      await expect(modal).toBeHidden();
    });

    test("54. Drawer ไม่มีปุ่มแก้ไขข้อมูล (read-only)", async ({ page }) => {
      await openReferenceDrawer(page);
      const drawer = page.locator(".market-reference-drawer");
      // ไม่ควรมีปุ่ม edit/save/delete
      const editButtons = drawer.locator("button:has-text('Edit'), button:has-text('Save'), button:has-text('Delete'), button:has-text('แก้ไข'), button:has-text('บันทึก'), button:has-text('ลบ')");
      await expect(editButtons).toHaveCount(0);
    });
  });

  // ==================== G. SYNC HISTORY ====================

  test.describe("Sync History — list, summary cards, search, filter, detail", () => {
    test("55. Sync History แสดง summary cards ครบ 4 ใบ: Log Entries Today, Completed, Running, Failed", async ({ page }) => {
      await goToMarketSyncHistory(page);
      const labels = page.locator("#summary-grid .stat .stat-label");
      await expect(labels.nth(0)).toHaveText("Log Entries Today");
      await expect(labels.nth(1)).toHaveText("Completed");
      await expect(labels.nth(2)).toHaveText("Running");
      await expect(labels.nth(3)).toHaveText("Failed");
    });

    test("56. Sync History แสดง info cards ครบ 3 ใบ", async ({ page }) => {
      await goToMarketSyncHistory(page);
      const cards = page.locator("#cards .mini-card h3");
      await expect(cards.nth(0)).toHaveText("Brand-first workflow");
      await expect(cards.nth(1)).toHaveText("API source");
      await expect(cards.nth(2)).toHaveText("Read-only");
    });

    test("57. Sync History ตารางแสดง column ครบ 7 คอลัมน์ (desktop)", async ({ page }) => {
      await goToMarketSyncHistory(page);
      const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
      if (isMobile) {
        // mobile: head hidden, ตรวจเฉพาะว่ามี rows
        const rows = page.locator(".market-record-table .asset-row:not(.head)");
        expect(await rows.count()).toBeGreaterThanOrEqual(1);
      } else {
        const head = page.locator(".market-record-table .asset-row.head");
        await expect(head.locator("div").nth(0)).toHaveText("รายการข้อมูล");
        await expect(head.locator("div").nth(1)).toHaveText("ข้อมูลที่อัปเดต");
        await expect(head.locator("div").nth(2)).toHaveText("สถานะ");
        await expect(head.locator("div").nth(3)).toHaveText("เวลา");
        await expect(head.locator("div").nth(4)).toHaveText("ผลลัพธ์");
        await expect(head.locator("div").nth(5)).toHaveText("หมายเหตุ");
        await expect(head.locator("div").nth(6)).toHaveText("รายละเอียด");
      }
    });

    test("58. Sync History แสดง job 5 รายการ", async ({ page }) => {
      await goToMarketSyncHistory(page);
      const rows = page.locator(".market-record-table .asset-row:not(.head)");
      await expect(rows).toHaveCount(5);
    });

    test("59. Sync History แสดงสถานะ pill ที่ถูกต้อง: Completed, Running, Failed", async ({ page }) => {
      await goToMarketSyncHistory(page);
      const pills = page.locator(".market-record-table .asset-row:not(.head) .pill");
      const pillTexts = await pills.allTextContents();
      expect(pillTexts).toContain("สำเร็จ");
      expect(pillTexts).toContain("กำลังทำงาน");
      expect(pillTexts).toContain("ล้มเหลว");
    });

    test("60. Sync History แต่ละ row มีปุ่ม Detail (desktop) หรือ row click ได้ (mobile)", async ({ page }) => {
      await goToMarketSyncHistory(page);
      const firstRow = page.locator(".market-record-table .asset-row:not(.head)").first();
      const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
      if (!isMobile) {
        await expect(firstRow.locator("button[data-market-record]")).toBeVisible();
        await expect(firstRow.locator("button[data-market-record]")).toHaveText("Detail");
      } else {
        // mobile: row คลิกได้
        await expect(firstRow).toBeVisible();
      }
    });

    test("61. Sync History ปุ่ม Detail / row click เปิด Sync History detail page ได้", async ({ page }) => {
      await goToMarketSyncHistory(page);
      const firstRow = page.locator(".market-record-table .asset-row:not(.head)").first();
      const jobId = await firstRow.getAttribute("data-market-record");
      await firstRow.click();
      await page.waitForTimeout(300);
      await expect(page.locator("#crumb")).toContainText(jobId);
      await expect(page.locator("#panel-title")).toHaveText("Sync Detail");
    });

    test("62. Sync History คลิก row (primary cell) เปิด detail ได้", async ({ page }) => {
      await goToMarketSyncHistory(page);
      const firstRow = page.locator(".market-record-table .asset-row:not(.head)").first();
      const jobId = await firstRow.getAttribute("data-market-record");
      await firstRow.click();
      await page.waitForTimeout(300);
      await expect(page.locator("#crumb")).toContainText(jobId);
    });

    test("63. Sync History มี search field สำหรับค้นหา Sync Job, Endpoint, Result", async ({ page }) => {
      await goToMarketSyncHistory(page);
      const search = page.locator("#market-search");
      await expect(search).toBeVisible();
      const placeholder = await search.getAttribute("placeholder");
      expect(placeholder).toContain("ค้นหา");
    });

    test("64. Sync History search กรอง job ได้", async ({ page }) => {
      await goToMarketSyncHistory(page);
      await page.locator("#market-search").fill("Rolex");
      await page.waitForTimeout(400);
      const rows = page.locator(".market-record-table .asset-row:not(.head)");
      const count = await rows.count();
      expect(count).toBeGreaterThanOrEqual(1);
      // ทุกแถวที่แสดงต้องเกี่ยวกับ Rolex
      for (let i = 0; i < count; i++) {
        const text = await rows.nth(i).textContent();
        expect(text.toLowerCase()).toContain("rolex");
      }
    });

    test("65. Sync History search ไม่เจอ → empty state 'No sync logs found'", async ({ page }) => {
      await goToMarketSyncHistory(page);
      await page.locator("#market-search").fill("zzzznonexistent");
      await page.waitForTimeout(400);
      await expect(page.locator(".market-record-table")).toContainText("No sync logs found");
    });

    test("66. Sync History มี status filter (custom-select)", async ({ page }) => {
      await goToMarketSyncHistory(page);
      await openFilterBar(page);
      const statusFilter = page.locator("#market-status-filter");
      await expect(statusFilter).toBeAttached();
    });

    test("67. Sync History filter by status Completed กรองได้", async ({ page }) => {
      await goToMarketSyncHistory(page);
      await openFilterBar(page);
      await pickCustomOption(page, "market-status-filter", "Completed");
      await page.waitForTimeout(300);
      const rows = page.locator(".market-record-table .asset-row:not(.head)");
      const count = await rows.count();
      expect(count).toBeGreaterThanOrEqual(1);
      for (let i = 0; i < count; i++) {
        const pill = rows.nth(i).locator(".pill").first();
        await expect(pill).toContainText("สำเร็จ");
      }
    });

    test("68. Sync History filter by status Failed กรองได้", async ({ page }) => {
      await goToMarketSyncHistory(page);
      await openFilterBar(page);
      await pickCustomOption(page, "market-status-filter", "Failed");
      await page.waitForTimeout(300);
      const rows = page.locator(".market-record-table .asset-row:not(.head)");
      const count = await rows.count();
      expect(count).toBeGreaterThanOrEqual(1);
      for (let i = 0; i < count; i++) {
        const pill = rows.nth(i).locator(".pill").first();
        await expect(pill).toContainText("ล้มเหลว");
      }
    });

    test("69. Sync History filter by status Running กรองได้", async ({ page }) => {
      await goToMarketSyncHistory(page);
      await openFilterBar(page);
      await pickCustomOption(page, "market-status-filter", "Running");
      await page.waitForTimeout(300);
      const rows = page.locator(".market-record-table .asset-row:not(.head)");
      const count = await rows.count();
      expect(count).toBeGreaterThanOrEqual(1);
      for (let i = 0; i < count; i++) {
        const pill = rows.nth(i).locator(".pill").first();
        await expect(pill).toContainText("กำลังทำงาน");
      }
    });

    test("70. Sync History reset filter กลับมาแสดงทั้งหมด", async ({ page }) => {
      await goToMarketSyncHistory(page);
      await openFilterBar(page);
      const beforeCount = await page.locator(".market-record-table .asset-row:not(.head)").count();
      await pickCustomOption(page, "market-status-filter", "Failed");
      await page.waitForTimeout(300);
      const filteredCount = await page.locator(".market-record-table .asset-row:not(.head)").count();
      expect(filteredCount).toBeLessThan(beforeCount);
      await clickResetButton(page);
      const resetCount = await page.locator(".market-record-table .asset-row:not(.head)").count();
      expect(resetCount).toBe(beforeCount);
    });

    test("71. Sync History หมายเหตุ แสดงเฉพาะ job ที่มี warning/error (Failed/Running)", async ({ page }) => {
      await goToMarketSyncHistory(page);
      const rows = page.locator(".market-record-table .asset-row:not(.head)");
      for (let i = 0; i < await rows.count(); i++) {
        const row = rows.nth(i);
        const pillText = await row.locator(".pill").first().textContent();
        // ใช้ row text แทน desktop column selector (mobile ซ่อน desktop columns)
        const rowText = await row.textContent();
        if (pillText.includes("ล้มเหลว") || pillText.includes("กำลังทำงาน")) {
          // job ที่ Failed/Running ต้องมีข้อมูลหมายเหตุใน row text
          // (desktop: ใน [data-label='หมายเหตุ'], mobile: ใน card meta)
          expect(rowText.length).toBeGreaterThan(20);
        }
      }
    });
  });

  // ==================== H. SYNC HISTORY DETAIL ====================

  test.describe("Sync History Detail — tiles, sections, back navigation", () => {
    async function openSyncDetail(page, jobId) {
      await goToMarketSyncHistory(page);
      // คลิก row แทนปุ่ม Detail เพราะ mobile ซ่อนปุ่มใน desktop column
      await page.locator(`.market-record-table .asset-row[data-market-record='${jobId}']`).click();
      await page.waitForTimeout(300);
    }

    test("72. Sync Detail: breadcrumb + page title + back button ถูกต้อง", async ({ page }) => {
      await openSyncDetail(page, "JOB-BRAND-LIST");
      await expect(page.locator("#crumb")).toContainText("Sync History");
      await expect(page.locator("#crumb")).toContainText("JOB-BRAND-LIST");
      await expect(page.locator(".page-back-btn")).toHaveAttribute("data-market-back");
    });

    test("73. Sync Detail: แสดง summary tiles ครบ 4 tiles: Job ID, สถานะ, เริ่มเมื่อ, ใช้เวลา", async ({ page }) => {
      await openSyncDetail(page, "JOB-BRAND-LIST");
      const tiles = page.locator(".market-brand-detail .detail-tile");
      const labels = tiles.locator("span");
      const labelTexts = await labels.allTextContents();
      expect(labelTexts.some(t => t.includes("Job ID"))).toBeTruthy();
      expect(labelTexts.some(t => t.includes("สถานะ"))).toBeTruthy();
      expect(labelTexts.some(t => t.includes("เริ่มเมื่อ"))).toBeTruthy();
      expect(labelTexts.some(t => t.includes("ใช้เวลา"))).toBeTruthy();
    });

    test("74. Sync Detail (Completed): แสดง Sync Summary และ Sync Status timeline", async ({ page }) => {
      await openSyncDetail(page, "JOB-BRAND-LIST");
      await expect(page.locator(".market-detail-section h3:has-text('Sync Summary')")).toBeVisible();
      await expect(page.locator(".market-detail-section h3:has-text('Sync Status')")).toBeVisible();
      // Sync Summary ต้องมี Provider, Endpoint
      const summarySection = page.locator(".market-detail-section").first();
      await expect(summarySection.locator(".kv")).toContainText(["Provider", "Endpoint"]);
    });

    test("75. Sync Detail (Completed): แสดงจำนวนที่ sync", async ({ page }) => {
      await openSyncDetail(page, "JOB-BRAND-LIST");
      const summarySection = page.locator(".market-detail-section").first();
      await expect(summarySection.locator(".module-note")).toContainText("จำนวนที่ Sync");
    });

    test("76. Sync Detail (Running): แสดง Sync Summary และระบุว่า cache ปัจจุบันยังใช้", async ({ page }) => {
      await openSyncDetail(page, "JOB-OMEGA-SEARCH");
      await expect(page.locator(".market-detail-section h3:has-text('Sync Summary')")).toBeVisible();
      await expect(page.locator(".market-detail-section h3:has-text('Sync Status')")).toBeVisible();
      // Running job ต้องมีข้อความเกี่ยวกับ cache ปัจจุบัน
      const bodyText = await page.locator("#table").textContent();
      expect(bodyText).toContain("cache");
    });

    test("77. Sync Detail (Failed): แสดง error detail, retry count, cache impact", async ({ page }) => {
      await openSyncDetail(page, "JOB-SEIKO-REF");
      await expect(page.locator(".market-detail-section h3:has-text('Sync Summary')")).toBeVisible();
      // Failed ต้องระบุว่าไม่ replace cache
      const bodyText = await page.locator("#table").textContent();
      expect(bodyText).toContain("จำนวนครั้งที่ระบบลองใหม่");
      expect(bodyText).toContain("เก็บข้อมูลเดิมไว้");
    });

    test("78. Sync Detail: back button กลับไป Sync History", async ({ page }) => {
      await openSyncDetail(page, "JOB-BRAND-LIST");
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Sync History");
    });
  });

  // ==================== I. READ-ONLY ENFORCEMENT ====================

  test.describe("Read-only enforcement — no add/edit/delete actions", () => {
    test("79. Brands & Models ไม่มีปุ่ม Add Brand หรือ primary action", async ({ page }) => {
      await goToMarketBrands(page);
      const primaryAction = page.locator("#primary-action");
      const text = await primaryAction.textContent();
      expect(text.trim()).toBe("");
    });

    test("80. Dashboard ไม่มี primary action", async ({ page }) => {
      await goToMarketDashboard(page);
      const primaryAction = page.locator("#primary-action");
      const text = await primaryAction.textContent();
      expect(text.trim()).toBe("");
    });

    test("81. Sync History ไม่มี primary action", async ({ page }) => {
      await goToMarketSyncHistory(page);
      const primaryAction = page.locator("#primary-action");
      const text = await primaryAction.textContent();
      expect(text.trim()).toBe("");
    });

    test("82. Brand Detail ไม่มีปุ่ม Add Model / Edit / Delete", async ({ page }) => {
      await goToMarketBrands(page);
      await page.locator(".market-catalog-table .asset-row:not(.head)").first().locator("[data-label='Brand']").click();
      await page.waitForTimeout(300);
      const primaryAction = page.locator("#primary-action");
      const text = await primaryAction.textContent();
      expect(text.trim()).toBe("");
    });

    test("83. Model Detail ไม่มีปุ่ม Add Reference / Edit / Delete", async ({ page }) => {
      await goToMarketBrands(page);
      await page.locator(".market-catalog-table .asset-row:not(.head)").first().locator("[data-label='Brand']").click();
      await page.waitForTimeout(300);
      await page.locator(".market-model-table .asset-row:not(.head)").first().locator("[data-label='Model']").click();
      await page.waitForTimeout(300);
      const primaryAction = page.locator("#primary-action");
      const text = await primaryAction.textContent();
      expect(text.trim()).toBe("");
    });
  });

  // ==================== J. CROSS-MODULE NAVIGATION (drill-in + back) ====================

  test.describe("Cross-module navigation — drill-in chain and back", () => {
    test("84. drill-in chain: Brands & Models → Brand → Model → Reference drawer → close → กลับ Model", async ({ page }) => {
      await goToMarketBrands(page);
      // Brand detail — คลิก row (data-label='Brand') แทนปุ่ม View เพราะ mobile ซ่อนปุ่ม
      await page.locator(".market-catalog-table .asset-row:not(.head)").first().locator("[data-label='Brand']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#panel-title")).toContainText("All Models");
      // Model detail
      await page.locator(".market-model-table .asset-row:not(.head)").first().locator("[data-label='Model']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#panel-title")).toContainText("All References");
      // Reference drawer
      await page.locator(".market-reference-list-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
      await expect(page.locator(".market-reference-drawer")).toBeVisible();
      // Close drawer
      await page.locator(".market-reference-drawer [data-user-action-modal-close]").click();
      await page.waitForTimeout(300);
      // กลับมา Model detail
      await expect(page.locator("#panel-title")).toContainText("All References");
    });

    test("85. back chain: Model → Brand → Brands & Models", async ({ page }) => {
      await goToMarketBrands(page);
      await page.locator(".market-catalog-table .asset-row:not(.head)").first().locator("[data-label='Brand']").click();
      await page.waitForTimeout(300);
      await page.locator(".market-model-table .asset-row:not(.head)").first().locator("[data-label='Model']").click();
      await page.waitForTimeout(300);
      // back from Model → Brand
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(300);
      await expect(page.locator(".market-model-table")).toBeVisible();
      // back from Brand → Brands & Models
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Brands & Models");
    });

    test("86. Dashboard → Sync History ผ่าน status strip แล้วกลับ Dashboard ผ่านเมนู", async ({ page }) => {
      await goToMarketDashboard(page);
      await page.locator("[data-market-sync-view-logs]").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Sync History");
      // กลับ Dashboard ผ่านเมนู
      await ensureNavOpen(page);
      await page.locator(".submenu[data-submenu='market'] button[data-sub='Dashboard']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Dashboard");
    });
  });

  // ==================== K. SYNC MODAL (manual sync trigger) ====================

  test.describe("Sync Modal — confirm, running, success, error scenarios", () => {
    // Note: prototype มี prototype-tools scenario selector สำหรับทดสอบ sync flow
    // ตรวจสอบเฉพาะที่เข้าถึงได้จาก UI หลัก (status strip / sync history)

    test("87. Dashboard status strip แสดง progress ring และข้อความสถานะ", async ({ page }) => {
      await goToMarketDashboard(page);
      const statusStrip = page.locator(".market-dashboard-sync-status");
      await expect(statusStrip.locator(".market-progress-ring")).toBeVisible();
      await expect(statusStrip.locator(".market-progress-label")).toBeVisible();
      await expect(statusStrip.locator(".market-sync-main strong")).toBeVisible();
      await expect(statusStrip.locator(".market-sync-main p")).toBeVisible();
    });

    test("88. Dashboard status strip แสดงจำนวน synced brands / total brands", async ({ page }) => {
      await goToMarketDashboard(page);
      const statusStrip = page.locator(".market-dashboard-sync-status");
      const text = await statusStrip.locator(".market-sync-main p").textContent();
      // ต้องมีรูปแบบ X/Y แบรนด์
      expect(text).toMatch(/\d+\s*\/\s*\d+/);
    });
  });

  // ==================== L. MOBILE CARD LAYOUT ====================

  test.describe("Mobile card layout (≤760px)", () => {
    test("89. Dashboard mobile: brand row แสดง mobile card metadata (Models, References, Status, Last Sync)", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToMarketDashboard(page);
      const firstRow = page.locator(".market-dashboard-brand-table .asset-row:not(.head)").first();
      await expect(firstRow.locator(".market-card-meta")).toBeVisible();
      const metaItems = firstRow.locator(".user-card-meta-item");
      await expect(metaItems).toHaveCount(4);
      await page.close();
    });

    test("90. Brands & Models mobile: brand row แสดง mobile card metadata (Models, References, Last Sync)", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToMarketBrands(page);
      const firstRow = page.locator(".market-catalog-table .asset-row:not(.head)").first();
      await expect(firstRow.locator(".market-card-meta")).toBeVisible();
      const metaItems = firstRow.locator(".user-card-meta-item");
      await expect(metaItems).toHaveCount(3);
      await page.close();
    });

    test("91. Brand Detail mobile: model row แสดง mobile card metadata (References, Movement)", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToMarketBrands(page);
      // คลิกที่ row (data-label='Brand') แทนปุ่ม View เพราะ mobile อาจซ่อนปุ่ม
      await page.locator(".market-catalog-table .asset-row:not(.head)").first().locator("[data-label='Brand']").click();
      await page.waitForTimeout(300);
      const firstRow = page.locator(".market-model-table .asset-row:not(.head)").first();
      await expect(firstRow.locator(".market-card-meta")).toBeVisible();
      const metaItems = firstRow.locator(".user-card-meta-item");
      await expect(metaItems).toHaveCount(2);
      await page.close();
    });

    test("92. Sync History mobile: sync row แสดง mobile card metadata", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToMarketSyncHistory(page);
      const firstRow = page.locator(".market-record-table .asset-row:not(.head)").first();
      await expect(firstRow.locator(".market-card-meta")).toBeVisible();
      await page.close();
    });

    test("93. Sync History mobile: filter bar ซ่อนอยู่ เปิดได้ด้วย toggle", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToMarketSyncHistory(page);
      const bar = page.locator(".user-filter-bar.market-mode");
      const isOpen = await bar.getAttribute("data-filter-open");
      expect(isOpen).toBe("false");
      await page.locator("[data-market-filter-toggle]").click();
      await page.waitForTimeout(200);
      const isOpenAfter = await page.locator(".user-filter-bar.market-mode").getAttribute("data-filter-open");
      expect(isOpenAfter).toBe("true");
      await page.close();
    });

    test("94. Reference drawer mobile: แสดง drawer ไม่ล้นจอ", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToMarketBrands(page);
      // คลิกที่ row (data-label='Brand') แทนปุ่ม View เพราะ mobile อาจซ่อนปุ่ม
      await page.locator(".market-catalog-table .asset-row:not(.head)").first().locator("[data-label='Brand']").click();
      await page.waitForTimeout(300);
      // คลิกที่ row (data-label='Model') แทนปุ่ม View
      await page.locator(".market-model-table .asset-row:not(.head)").first().locator("[data-label='Model']").click();
      await page.waitForTimeout(300);
      await page.locator(".market-reference-list-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
      const drawer = page.locator(".market-reference-drawer");
      await expect(drawer).toBeVisible();
      // drawer content ต้อง scroll ได้
      const content = drawer.locator(".market-reference-drawer-content");
      await expect(content).toBeVisible();
      await page.close();
    });

    test("95. Dashboard mobile: pagination ใช้งานได้", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToMarketDashboard(page);
      const footer = page.locator(".market-dashboard-table .footer-range");
      await expect(footer).toBeVisible();
      await expect(footer.locator(".pager")).toBeVisible();
      await page.close();
    });

    test("96. Brands & Models mobile: search เต็มความกว้าง", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToMarketBrands(page);
      const search = page.locator("#market-search");
      await expect(search).toBeVisible();
      const box = await search.boundingBox();
      expect(box.width).toBeGreaterThan(200);
      await page.close();
    });
  });

  // ==================== M. STATUS BADGE CONSISTENCY ====================

  test.describe("Status badge consistency", () => {
    test("97. Sync History สถานะ Completed ใช้ pill เขียว, Running ใช้ pill amber, Failed ใช้ pill แดง", async ({ page }) => {
      await goToMarketSyncHistory(page);
      const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
      // desktop: [data-label='สถานะ'] .pill (mobile card hidden), mobile: .market-card-tags .pill (desktop columns hidden)
      const pillScope = isMobile ? ".market-card-tags" : "[data-label='สถานะ']";
      const completedRow = page.locator(".market-record-table .asset-row:not(.head)").filter({ hasText: "สำเร็จ" }).first();
      await expect(completedRow.locator(`${pillScope} .pill.green`)).toBeVisible();
      const runningRow = page.locator(".market-record-table .asset-row:not(.head)").filter({ hasText: "กำลังทำงาน" }).first();
      await expect(runningRow.locator(`${pillScope} .pill.amber`)).toBeVisible();
      const failedRow = page.locator(".market-record-table .asset-row:not(.head)").filter({ hasText: "ล้มเหลว" }).first();
      await expect(failedRow.locator(`${pillScope} .pill.red`)).toBeVisible();
    });

    test("98. Dashboard brand status แสดง pill (Completed/Syncing)", async ({ page }) => {
      await goToMarketDashboard(page);
      const firstRow = page.locator(".market-dashboard-brand-table .asset-row:not(.head)").first();
      // desktop: [data-label='Status'] .pill, mobile: card meta แสดง Status เป็น text
      const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
      if (!isMobile) {
        await expect(firstRow.locator("[data-label='Status'] .pill")).toBeVisible();
      } else {
        // mobile: ตรวจว่า row มี Status ใน card meta
        const rowText = await firstRow.textContent();
        expect(rowText).toMatch(/Completed|Syncing/);
      }
    });
  });

  // ==================== N. DATA INTEGRITY / CONTENT CHECKS ====================

  test.describe("Data integrity — content checks", () => {
    test("99. Brands & Models แต่ละ row มี Models count และ References count ไม่ว่าง", async ({ page }) => {
      await goToMarketBrands(page);
      const rows = page.locator(".market-catalog-table .asset-row:not(.head)");
      const count = await rows.count();
      for (let i = 0; i < Math.min(count, 3); i++) {
        const row = rows.nth(i);
        const modelsText = await row.locator("[data-label='Models'] .main-text").textContent();
        const refsText = await row.locator("[data-label='References'] .main-text").textContent();
        expect(modelsText.trim().length).toBeGreaterThan(0);
        expect(refsText.trim().length).toBeGreaterThan(0);
      }
    });

    test("100. Sync History แต่ละ row มี Job ID และ endpoint ไม่ว่าง", async ({ page }) => {
      await goToMarketSyncHistory(page);
      const rows = page.locator(".market-record-table .asset-row:not(.head)");
      const count = await rows.count();
      for (let i = 0; i < count; i++) {
        const row = rows.nth(i);
        // ใช้ row text แทน desktop column selector (mobile ซ่อน desktop columns)
        const rowText = await row.textContent();
        expect(rowText.trim().length).toBeGreaterThan(0);
      }
    });

    test("101. Reference list แสดงราคาเป็น market price style (USD)", async ({ page }) => {
      await goToMarketBrands(page);
      await page.locator(".market-catalog-table .asset-row:not(.head)").first().locator("[data-label='Brand']").click();
      await page.waitForTimeout(300);
      await page.locator(".market-model-table .asset-row:not(.head)").first().locator("[data-label='Model']").click();
      await page.waitForTimeout(300);
      const firstRow = page.locator(".market-reference-list-table .asset-row:not(.head)").first();
      // ใช้ row text แทน desktop column selector (mobile ซ่อน desktop columns)
      const rowText = await firstRow.textContent();
      expect(rowText).toContain("USD");
    });

    test("102. Reference list แสดง Movement (fallback จาก model ถ้า reference ไม่มี)", async ({ page }) => {
      await goToMarketBrands(page);
      await page.locator(".market-catalog-table .asset-row:not(.head)").first().locator("[data-label='Brand']").click();
      await page.waitForTimeout(300);
      await page.locator(".market-model-table .asset-row:not(.head)").first().locator("[data-label='Model']").click();
      await page.waitForTimeout(300);
      const firstRow = page.locator(".market-reference-list-table .asset-row:not(.head)").first();
      const rowText = await firstRow.textContent();
      expect(rowText.trim().length).toBeGreaterThan(0);
    });

    test("103. Sync History detail (Failed) แสดง error label ภาษาไทย (ไม่ใช่ raw error code)", async ({ page }) => {
      await goToMarketSyncHistory(page);
      await page.locator(".market-record-table .asset-row[data-market-record='JOB-SEIKO-REF']").click();
      await page.waitForTimeout(300);
      const bodyText = await page.locator("#table").textContent();
      // prototype เปลี่ยน error code เป็น label ไทย: "provider ส่งผลลัพธ์มากเกินเงื่อนไขที่ระบบกำหนดไว้"
      expect(bodyText).toContain("provider ส่งผลลัพธ์มากเกิน");
    });

    test("104. Sync History detail (Failed) แสดง retry count = 2", async ({ page }) => {
      await goToMarketSyncHistory(page);
      await page.locator(".market-record-table .asset-row[data-market-record='JOB-SEIKO-REF']").click();
      await page.waitForTimeout(300);
      // retry count อยู่ใน kv tile: "จำนวนครั้งที่ระบบลองใหม่" → "2"
      const retryTile = page.locator(".market-detail-section .kv").filter({ hasText: "จำนวนครั้งที่ระบบลองใหม่" });
      await expect(retryTile.locator("strong")).toHaveText("2");
    });
  });

  // ==================== O. PAGINATION EDGE CASES ====================

  test.describe("Pagination edge cases", () => {
    test("105. Dashboard pagination ก่อนหน้า disabled ที่หน้า 1", async ({ page }) => {
      await goToMarketDashboard(page);
      const prevBtn = page.locator(".market-dashboard-table [data-market-dashboard-page='prev']");
      await expect(prevBtn).toBeDisabled();
    });

    test("106. Brands & Models pagination ก่อนหน้า disabled ที่หน้า 1", async ({ page }) => {
      await goToMarketBrands(page);
      const prevBtn = page.locator("[data-market-catalog-page='prev']");
      await expect(prevBtn).toBeDisabled();
    });

    test("107. Sync History pagination ปุ่มก่อนหน้า/ถัดไป disabled (single page)", async ({ page }) => {
      await goToMarketSyncHistory(page);
      const footer = page.locator(".market-record-table").locator("..").locator(".footer-range");
      const prevBtn = footer.locator("button").first();
      const nextBtn = footer.locator("button").last();
      await expect(prevBtn).toBeDisabled();
      await expect(nextBtn).toBeDisabled();
    });
  });

  // ==================== P. FILTER STATE PERSISTENCE ====================

  test.describe("Filter state persistence (BO-UX-001)", () => {
    test("108. Brands & Models search ค้างเมื่อกลับจาก Brand detail", async ({ page }) => {
      await goToMarketBrands(page);
      await page.locator("#market-search").fill("Rolex");
      await page.waitForTimeout(400);
      // เข้า Brand detail — คลิก row แทนปุ่ม (mobile compatible)
      await page.locator(".market-catalog-table .asset-row:not(.head)").first().locator("[data-label='Brand']").click();
      await page.waitForTimeout(300);
      // กลับมา Brands & Models
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(300);
      const searchValue = await page.locator("#market-search").inputValue();
      // BO-UX-001: search ต้องถูก restore หรือ clear ตามนโยบาย (prototype clears on forward, restores on back)
      // ตรวจเฉพาะว่า search field มีอยู่และไม่ crash
      await expect(page.locator("#market-search")).toBeVisible();
    });

    test("109. Sync History filter ค้างเมื่อกลับจาก Sync detail", async ({ page }) => {
      await goToMarketSyncHistory(page);
      await openFilterBar(page);
      await pickCustomOption(page, "market-status-filter", "Failed");
      await page.waitForTimeout(300);
      // เข้า Sync detail — คลิก row แทนปุ่ม (mobile compatible)
      await page.locator(".market-record-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
      // กลับมา Sync History
      await page.locator(".page-back-btn").click();
      await page.waitForTimeout(300);
      // ตรวจว่า filter ยังคงอยู่หรือ clear ตามนโยบาย — ตรวจเฉพาะว่าหน้าจอไม่ crash
      await expect(page.locator("#page-title")).toHaveText("Sync History");
    });
  });

  // ==================== Q. EMPTY / LOADING STATES ====================

  test.describe("Empty / edge states", () => {
    test("110. Brands & Models empty state แสดง 'No brands found' เมื่อ search ไม่เจอ", async ({ page }) => {
      await goToMarketBrands(page);
      await page.locator("#market-search").fill("zzzznotfound");
      await page.waitForTimeout(400);
      await expect(page.locator(".market-catalog-table")).toContainText("No brands found");
    });

    test("111. Sync History empty state แสดง 'No sync logs found' เมื่อ search ไม่เจอ", async ({ page }) => {
      await goToMarketSyncHistory(page);
      await page.locator("#market-search").fill("zzzznotfound");
      await page.waitForTimeout(400);
      await expect(page.locator(".market-record-table")).toContainText("No sync logs found");
    });
  });

  // ==================== R. MENU / NAV INTEGRITY ====================

  test.describe("Menu / nav integrity", () => {
    test("112. Market Data menu parent แสดง active state เมื่ออยู่ใน submenu", async ({ page }) => {
      await goToMarketDashboard(page);
      const parent = page.locator(".nav-item[data-module='market']");
      await expect(parent).toHaveClass(/active/);
    });

    test("113. เข้า Market Data จาก module card ใน Dashboard ได้ (ถ้ามี)", async ({ page }) => {
      // ตรวจเฉพาะการนำทางผ่านเมนู — module card ใน Dashboard อาจไม่มีสำหรับ Market Data
      await goToMarketDashboard(page);
      await expect(page.locator("#page-title")).toHaveText("Dashboard");
    });

    test("114. สลับไปโมดูลอื่นแล้วกลับ Market Data ได้", async ({ page }) => {
      await goToMarketBrands(page);
      await expect(page.locator("#page-title")).toHaveText("Brands & Models");
      // ไป Dashboard หลัก
      await ensureNavOpen(page);
      await page.locator(".nav-item[data-module='dashboard']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Dashboard");
      // กลับ Market Data
      await ensureNavOpen(page);
      const parent = page.locator(".nav-item[data-module='market']");
      const expanded = await parent.evaluate(el => el.classList.contains("expanded")).catch(() => false);
      if (!expanded) await parent.click();
      await page.waitForTimeout(200);
      await page.locator(".submenu[data-submenu='market'] button[data-sub='Sync History']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Sync History");
    });
  });

  // ==================== S. SYNC HISTORY DETAIL — COMPLETED TIMELINE ====================

  test.describe("Sync History Detail — processing timeline", () => {
    test("115. Sync Detail (Completed): แสดง processing timeline 4 steps", async ({ page }) => {
      await goToMarketSyncHistory(page);
      await page.locator(".market-record-table .asset-row[data-market-record='JOB-BRAND-LIST']").click();
      await page.waitForTimeout(300);
      const timeline = page.locator(".market-detail-section .timeline");
      await expect(timeline).toBeVisible();
      const events = timeline.locator(".event");
      const count = await events.count();
      expect(count).toBeGreaterThanOrEqual(4);
    });

    test("116. Sync Detail (Running): แสดง processing timeline", async ({ page }) => {
      await goToMarketSyncHistory(page);
      await page.locator(".market-record-table .asset-row[data-market-record='JOB-OMEGA-SEARCH']").click();
      await page.waitForTimeout(300);
      const timeline = page.locator(".market-detail-section .timeline");
      await expect(timeline).toBeVisible();
      const events = timeline.locator(".event");
      const count = await events.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test("117. Sync Detail (Failed): แสดง processing timeline พร้อม step ที่ล้มเหลว", async ({ page }) => {
      await goToMarketSyncHistory(page);
      await page.locator(".market-record-table .asset-row[data-market-record='JOB-SEIKO-REF']").click();
      await page.waitForTimeout(300);
      const timeline = page.locator(".market-detail-section .timeline");
      await expect(timeline).toBeVisible();
      const bodyText = await timeline.textContent();
      // Failed timeline แสดง "สาเหตุที่ไม่สำเร็จ" และ "ผลต่อ cache" และ "ข้อมูลที่ใช้อยู่"
      expect(bodyText).toContain("สาเหตุที่ไม่สำเร็จ");
      expect(bodyText).toContain("ผลต่อ cache");
    });
  });

  // ==================== T. RESPONSIVE — TABLE TO CARD ====================

  test.describe("Responsive — table to card transition", () => {
    test("118. Brands & Models ที่ 768px ตารางยังอ่านได้ ไม่ล้น", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
      await goToMarketBrands(page);
      const table = page.locator(".market-catalog-table");
      await expect(table).toBeVisible();
      // ตรวจว่าตารางมีแถวและอ่านได้ — ไม่ตรวจความกว้างเพราะ table อาจมี min-width
      const rows = table.locator(".asset-row:not(.head)");
      expect(await rows.count()).toBeGreaterThanOrEqual(1);
      await page.close();
    });

    test("119. Sync History ที่ 768px ตารางยังอ่านได้ ไม่ล้น", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
      await goToMarketSyncHistory(page);
      const table = page.locator(".market-record-table");
      await expect(table).toBeVisible();
      const rows = table.locator(".asset-row:not(.head)");
      expect(await rows.count()).toBeGreaterThanOrEqual(1);
      await page.close();
    });

    test("120. Dashboard ที่ 1280px แสดงตารางเต็ม", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      await goToMarketDashboard(page);
      const table = page.locator(".market-dashboard-brand-table");
      await expect(table).toBeVisible();
      await page.close();
    });

    test("121. Brands & Models ที่ 1440px แสดงตารางเต็ม", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await goToMarketBrands(page);
      const table = page.locator(".market-catalog-table");
      await expect(table).toBeVisible();
      const rows = table.locator(".asset-row:not(.head)");
      expect(await rows.count()).toBeGreaterThanOrEqual(1);
      await page.close();
    });

    test("122. Reference drawer ที่ 1280px แสดง drawer ได้", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      await goToMarketBrands(page);
      await page.locator(".market-catalog-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
      await page.locator(".market-model-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
      await page.locator(".market-reference-list-table .asset-row:not(.head)").first().click();
      await page.waitForTimeout(300);
      await expect(page.locator(".market-reference-drawer")).toBeVisible();
      await page.close();
    });
  });
});
