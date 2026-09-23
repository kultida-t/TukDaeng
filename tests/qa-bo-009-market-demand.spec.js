// QA-BO-009: Market Demand (Demand Overview, Search Insights, Watch Alert List/Detail) — strict Playwright spec
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล, spec docs (11_WATCH_ALERT_MODULE.md) เป็นหลักสำหรับพฤติกรรม
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

// helper: ไปหน้า Market Demand ผ่านเมนู (sub = "Demand Overview" | "Search Insights" | "Watch Alert List")
// watch-alerts มี submenu → คลิก nav-item เพื่อขยาย แล้วคลิก submenu button
async function goToMarketDemand(page, sub = "Demand Overview") {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  // คลิก nav-item เพื่อขยาย submenu (watch-alerts มี data-toggle-menu)
  await page.locator(".nav-item[data-module='watch-alerts']").click();
  await page.waitForTimeout(300);
  // คลิก submenu button ที่ตรงกับ sub
  await ensureNavOpen(page);
  await page.locator(`.submenu[data-submenu='watch-alerts'] button[data-module='watch-alerts'][data-sub='${sub}']`).click();
  await page.waitForTimeout(300);
}

// helper: เปิด filter bar ถ้ายังปิด (mobile ≤760px)
async function openFilterBar(page) {
  const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
  if (!isMobile) return;
  const bar = page.locator(".user-filter-bar.wa-alert-filter-bar");
  const isOpen = await bar.getAttribute("data-filter-open");
  if (isOpen === "false") {
    await page.locator("[data-wa-alert-filter-toggle]").click();
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

// helper: กดปุ่มรีเซ็ตค่าทั้งหมด — เลือกปุ่มที่ visible
async function clickResetButton(page) {
  await page.locator("[data-wa-alert-reset]:visible").first().click();
  await page.waitForTimeout(300);
}

// helper: นับจำนวนแถวในตาราง Watch Alert List ที่ไม่ใช่ head
async function countAlertRows(page) {
  return await page.locator(".watch-alert-list-table .asset-row:not(.head)").count();
}

// helper: เข้า Watch Alert Detail โดยคลิกแถวแรก
async function goToAlertDetail(page, alertId = null) {
  await goToMarketDemand(page, "Watch Alert List");
  if (alertId) {
    // ตรวจว่า alert อยู่ในหน้า 1 หรือไม่ — ถ้าไม่ ไปหน้า 2
    const rowInPage1 = page.locator(`.asset-row[data-wa-alert-open="${alertId}"]`);
    if (!(await rowInPage1.count())) {
      // ไปหน้า 2 — บน mobile (≤760px) pager-num ถูกซ่อน ใช้ next button
      const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
      if (isMobile) {
        await page.locator("[data-wa-alert-page='next']").click();
      } else {
        const page2Btn = page.locator("[data-wa-alert-page='2']");
        if (await page2Btn.count()) {
          await page2Btn.click();
        }
      }
      await page.waitForTimeout(300);
    }
    await page.locator(`.asset-row[data-wa-alert-open="${alertId}"] .asset-cell-primary`).click();
  } else {
    await page.locator(".watch-alert-list-table .asset-row:not(.head)").first().click();
  }
  await page.waitForTimeout(300);
}

// ==================== A. NAVIGATION & MENU ====================

test.describe("Market Demand — navigation & menu", () => {
  test("1. เมนู Market Demand แสดงและมี submenu 3 รายการ", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await ensureNavOpen(page);
    const navItem = page.locator(".nav-item[data-module='watch-alerts']");
    await expect(navItem).toBeVisible();
    // คลิกเพื่อขยาย submenu
    await navItem.click();
    await page.waitForTimeout(300);
    // ตรวจว่ามี submenu 3 รายการ
    const subItems = page.locator(".submenu[data-submenu='watch-alerts'] button");
    await expect(subItems).toHaveCount(3);
  });

  test("2. คลิก Market Demand → เข้าหน้า Demand Overview (default)", async ({ page }) => {
    await goToMarketDemand(page, "Demand Overview");
    await expect(page.locator("body")).toHaveClass(/watch-alert-mode/);
    await expect(page.locator("body")).toHaveClass(/watch-alert-overview-mode/);
    await expect(page.locator("#page-title")).toHaveText("Demand Overview");
    await expect(page.locator("#crumb")).toHaveText("งานตรวจสอบและบริการ / Market Demand / Demand Overview");
    await expect(page.locator("#panel-title")).toHaveText("Demand Overview");
  });

  test("3. คลิก Search Insights → เข้าหน้า Search Insights", async ({ page }) => {
    await goToMarketDemand(page, "Search Insights");
    await expect(page.locator("body")).toHaveClass(/watch-alert-mode/);
    await expect(page.locator("body")).toHaveClass(/watch-alert-overview-mode/);
    await expect(page.locator("#page-title")).toHaveText("Search Insights");
    await expect(page.locator("#crumb")).toHaveText("งานตรวจสอบและบริการ / Market Demand / Search Insights");
    await expect(page.locator("#panel-title")).toHaveText("Search Insights");
  });

  test("4. คลิก Watch Alert List → เข้าหน้า Watch Alert List", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    await expect(page.locator("body")).toHaveClass(/watch-alert-mode/);
    await expect(page.locator("body")).toHaveClass(/watch-alert-list-mode/);
    await expect(page.locator("#page-title")).toHaveText("Watch Alert List");
    await expect(page.locator("#crumb")).toHaveText("งานตรวจสอบและบริการ / Market Demand / Watch Alert List");
    await expect(page.locator("#panel-title")).toHaveText("Watch Alert List");
  });

  test("5. nav item watch-alerts มี active state เมื่ออยู่ใน Market Demand", async ({ page }) => {
    await goToMarketDemand(page, "Demand Overview");
    const isActive = await page.evaluate(() => {
      const el = document.querySelector(".nav-item[data-module='watch-alerts']");
      return el ? el.classList.contains("active") || el.classList.contains("expanded") || el.querySelector(".active") !== null : false;
    });
    expect(isActive).toBeTruthy();
  });

  test("6. Demand Overview เป็น read-only — ไม่มี primary action", async ({ page }) => {
    await goToMarketDemand(page, "Demand Overview");
    await expect(page.locator("#primary-action")).toHaveText("");
  });

  test("7. Search Insights เป็น read-only — ไม่มี primary action", async ({ page }) => {
    await goToMarketDemand(page, "Search Insights");
    await expect(page.locator("#primary-action")).toHaveText("");
  });

  test("8. Watch Alert List เป็น read-only — ไม่มี primary action", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    await expect(page.locator("#primary-action")).toHaveText("");
  });
});

// ==================== B. DEMAND OVERVIEW — RENDERING ====================

test.describe("Demand Overview — rendering", () => {
  test("9. KPI tiles แสดง 4 การ์ด (Active Alerts, Alerts with Matches, Unmet Demand, Notification Success Rate)", async ({ page }) => {
    await goToMarketDemand(page, "Demand Overview");
    const kpiCards = page.locator("#summary-grid .wa-kpi-card");
    await expect(kpiCards).toHaveCount(4);
    // .stat-label contains label + tooltip text, use toContainText
    await expect(page.locator("#summary-grid .stat-label").nth(0)).toContainText("Active Alerts");
    await expect(page.locator("#summary-grid .stat-label").nth(1)).toContainText("Alerts with Matches");
    await expect(page.locator("#summary-grid .stat-label").nth(2)).toContainText("Unmet Demand");
    await expect(page.locator("#summary-grid .stat-label").nth(3)).toContainText("Notification Success Rate");
  });

  test("10. KPI values ถูกต้อง (298, 262, 36, 94.2%)", async ({ page }) => {
    await goToMarketDemand(page, "Demand Overview");
    await expect(page.locator("#summary-grid .wa-kpi-card").nth(0).locator(".stat-value")).toHaveText("298");
    await expect(page.locator("#summary-grid .wa-kpi-card").nth(1).locator(".stat-value")).toHaveText("262");
    await expect(page.locator("#summary-grid .wa-kpi-card").nth(2).locator(".stat-value")).toHaveText("36");
    await expect(page.locator("#summary-grid .wa-kpi-card").nth(3).locator(".stat-value")).toHaveText("94.2%");
  });

  test("11. KPI trend แสดง arrow + value + label", async ({ page }) => {
    await goToMarketDemand(page, "Demand Overview");
    const trends = page.locator("#summary-grid .wa-kpi-trend");
    await expect(trends).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(trends.nth(i).locator(".wa-trend-value")).not.toHaveText("");
      await expect(trends.nth(i).locator(".wa-trend-label")).not.toHaveText("");
    }
  });

  test("12. Top Brands panel แสดง 5 แบรนด์ พร้อม bar", async ({ page }) => {
    await goToMarketDemand(page, "Demand Overview");
    const panel = page.locator(".wa-overview-panel.wa-panel-criteria");
    await expect(panel).toBeVisible();
    await expect(panel.locator("h3")).toContainText("Top Brands");
    const barRows = panel.locator(".wa-stat-bar-row");
    await expect(barRows).toHaveCount(5);
    // ตรวจว่ามี Rolex (top 1)
    await expect(panel.locator(".wa-stat-bar-label").first()).toContainText("Rolex");
  });

  test("13. Top Brands แต่ละแถวมี dot + label + count + percent + bar", async ({ page }) => {
    await goToMarketDemand(page, "Demand Overview");
    const firstRow = page.locator(".wa-panel-criteria .wa-stat-bar-row").first();
    await expect(firstRow.locator(".wa-stat-bar-dot")).toBeVisible();
    await expect(firstRow.locator(".wa-stat-bar-label")).toBeVisible();
    await expect(firstRow.locator(".wa-stat-bar-count")).toBeVisible();
    await expect(firstRow.locator(".wa-stat-bar-percent")).toBeVisible();
    await expect(firstRow.locator(".wa-stat-bar-fill")).toBeVisible();
  });

  test("14. Top Brands คลิกแถว → เปิด modal drill-down (Brand → Models)", async ({ page }) => {
    await goToMarketDemand(page, "Demand Overview");
    await page.locator(".wa-panel-criteria .wa-stat-bar-row").first().click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).toBeVisible();
    // ตรวจว่า modal แสดง models ของ Rolex
    const modalBody = page.locator("#user-action-modal-body");
    await expect(modalBody).toContainText("Submariner");
    // ปิด modal
    await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
    await page.waitForTimeout(200);
  });

  test("15. Top Brands View All → เปิด modal แสดงทุก brands (10)", async ({ page }) => {
    await goToMarketDemand(page, "Demand Overview");
    await page.locator(".wa-panel-criteria [data-wa-criteria-viewall]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).toBeVisible();
    const barRows = page.locator("#user-action-modal-body .wa-stat-bar-row");
    await expect(barRows).toHaveCount(10);
    await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
    await page.waitForTimeout(200);
  });

  test("16. Price Range panel แสดง 6 ช่วงราคา พร้อม histogram", async ({ page }) => {
    await goToMarketDemand(page, "Demand Overview");
    const panel = page.locator(".wa-overview-panel.wa-panel-price");
    await expect(panel).toBeVisible();
    await expect(panel.locator("h3")).toContainText("Price Range");
    const cols = panel.locator(".wa-price-hist-col");
    await expect(cols).toHaveCount(6);
  });

  test("17. Trigger Trend panel แสดง 12 เดือน พร้อม bar groups (2 series)", async ({ page }) => {
    await goToMarketDemand(page, "Demand Overview");
    const panel = page.locator(".wa-overview-panel.wa-panel-trend");
    await expect(panel).toBeVisible();
    await expect(panel.locator("h3")).toContainText("Trigger Trend");
    // 12 bar groups
    const barGroups = panel.locator(".wa-trend-bar-group");
    await expect(barGroups).toHaveCount(12);
    // แต่ละ group มี 2 bars (success + skip)
    const firstGroup = barGroups.first();
    await expect(firstGroup.locator(".wa-trend-bar")).toHaveCount(2);
    // legend 2 รายการ
    await expect(panel.locator(".wa-trend-legend-item")).toHaveCount(2);
  });

  test("18. Frequently Triggered Alerts panel แสดง top 10 พร้อมตาราง", async ({ page }) => {
    await goToMarketDemand(page, "Demand Overview");
    const panel = page.locator(".wa-overview-panel.wa-panel-frequent");
    await expect(panel).toBeVisible();
    await expect(panel.locator("h3")).toContainText("Frequently Triggered Alerts");
    // head row มี 6 คอลัมน์ (# + 5 columns)
    const headCells = panel.locator(".wa-alert-mini-table .asset-row.head > div");
    await expect(headCells).toHaveCount(6);
    // 10 data rows
    const dataRows = panel.locator(".wa-alert-mini-table .asset-row:not(.head)");
    await expect(dataRows).toHaveCount(10);
  });

  test("19. Frequently Triggered Alerts head: #, Alert ID, Name, Owner, Triggers, Last Triggered", async ({ page }) => {
    await goToMarketDemand(page, "Demand Overview");
    const head = page.locator(".wa-panel-frequent .wa-alert-mini-table .asset-row.head");
    await expect(head).toContainText("#");
    await expect(head).toContainText("Alert ID");
    await expect(head).toContainText("Name");
    await expect(head).toContainText("Owner");
    await expect(head).toContainText("Triggers");
    await expect(head).toContainText("Last Triggered");
  });

  test("20. Frequently Triggered Alerts แถวแรก = WAL-1228 (Omega Speedmaster Bangkok, 3 triggers)", async ({ page }) => {
    await goToMarketDemand(page, "Demand Overview");
    const firstRow = page.locator(".wa-panel-frequent .wa-alert-mini-table .asset-row:not(.head)").first();
    await expect(firstRow.locator("[data-label='Alert ID']")).toHaveText("WAL-1228");
    await expect(firstRow.locator("[data-label='Name']")).toHaveText("Omega Speedmaster Bangkok");
    await expect(firstRow.locator("[data-label='Triggers']")).toHaveText("3");
  });

  test("21. Frequently Triggered Alerts View All → ไป Watch Alert List", async ({ page }) => {
    await goToMarketDemand(page, "Demand Overview");
    await page.locator(".wa-panel-frequent .wa-view-all").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/watch-alert-list-mode/);
    await expect(page.locator("#panel-title")).toHaveText("Watch Alert List");
  });

  test("22. Demand Overview ไม่มี filter bar หรือ page actions", async ({ page }) => {
    await goToMarketDemand(page, "Demand Overview");
    const filterActions = await page.locator("#user-panel-filter-actions").innerHTML();
    expect(filterActions.trim()).toBe("");
  });

  test("23. Demand Overview panel subtitle ถูกต้อง", async ({ page }) => {
    await goToMarketDemand(page, "Demand Overview");
    await expect(page.locator("#panel-subtitle")).toContainText("read-only");
  });
});

// ==================== C. SEARCH INSIGHTS — RENDERING ====================

test.describe("Search Insights — rendering", () => {
  test("24. KPI tiles แสดง 4 การ์ด (Search Volume, Popular Selections, No-result Searches, Search-to-result)", async ({ page }) => {
    await goToMarketDemand(page, "Search Insights");
    const kpiCards = page.locator("#summary-grid .wa-kpi-card");
    await expect(kpiCards).toHaveCount(4);
    await expect(page.locator("#summary-grid .stat-label").nth(0)).toContainText("Search Volume");
    await expect(page.locator("#summary-grid .stat-label").nth(1)).toContainText("Popular Selections");
    await expect(page.locator("#summary-grid .stat-label").nth(2)).toContainText("No-result Searches");
    await expect(page.locator("#summary-grid .stat-label").nth(3)).toContainText("Search-to-result");
  });

  test("25. KPI values ถูกต้อง (9,860, 3,420, 1,126, 88.6%)", async ({ page }) => {
    await goToMarketDemand(page, "Search Insights");
    await expect(page.locator("#summary-grid .wa-kpi-card").nth(0).locator(".stat-value")).toHaveText("9,860");
    await expect(page.locator("#summary-grid .wa-kpi-card").nth(1).locator(".stat-value")).toHaveText("3,420");
    await expect(page.locator("#summary-grid .wa-kpi-card").nth(2).locator(".stat-value")).toHaveText("1,126");
    await expect(page.locator("#summary-grid .wa-kpi-card").nth(3).locator(".stat-value")).toHaveText("88.6%");
  });

  test("26. Search Trend panel แสดง SVG chart พร้อม 7 จุด + legend 2 series", async ({ page }) => {
    await goToMarketDemand(page, "Search Insights");
    const panel = page.locator(".si-panel-trend");
    await expect(panel).toBeVisible();
    await expect(panel.locator("h3")).toContainText("Search Trend");
    // SVG chart
    await expect(panel.locator(".si-trend-svg")).toBeVisible();
    // 7 dots (volume series)
    const volumeDots = panel.locator(".si-trend-dot[data-si-day]");
    await expect(volumeDots).toHaveCount(14); // 7 volume + 7 no-result
    // legend 2 รายการ
    await expect(panel.locator(".si-trend-legend-item")).toHaveCount(2);
  });

  test("27. Search Trend axis แสดง 7 วัน (จ ถึง อา)", async ({ page }) => {
    await goToMarketDemand(page, "Search Insights");
    const axis = page.locator(".si-trend-axis");
    const labels = axis.locator("span");
    await expect(labels).toHaveCount(7);
    await expect(labels.first()).toHaveText("จ");
    await expect(labels.last()).toHaveText("อา");
  });

  test("28. Search Funnel panel แสดง 4 steps", async ({ page }) => {
    await goToMarketDemand(page, "Search Insights");
    const panel = page.locator(".si-panel-funnel");
    await expect(panel).toBeVisible();
    await expect(panel.locator("h3")).toContainText("Search Funnel");
    const funnelRows = panel.locator(".si-funnel-row");
    await expect(funnelRows).toHaveCount(4);
    await expect(funnelRows.nth(0).locator(".si-funnel-name")).toHaveText("Search Submit");
    await expect(funnelRows.nth(1).locator(".si-funnel-name")).toHaveText("Result Click");
    await expect(funnelRows.nth(2).locator(".si-funnel-name")).toHaveText("Asset Detail Open");
    await expect(funnelRows.nth(3).locator(".si-funnel-name")).toHaveText("Watch Alert / Offer");
  });

  test("29. Search Funnel values ถูกต้อง (9860, 5916, 3648, 78)", async ({ page }) => {
    await goToMarketDemand(page, "Search Insights");
    const rows = page.locator(".si-funnel-row");
    await expect(rows.nth(0).locator(".si-funnel-value")).toHaveText("9,860");
    await expect(rows.nth(1).locator(".si-funnel-value")).toHaveText("5,916");
    await expect(rows.nth(2).locator(".si-funnel-value")).toHaveText("3,648");
    await expect(rows.nth(3).locator(".si-funnel-value")).toHaveText("78");
  });

  test("30. Popular Keywords panel แสดง 5 รายการ + View All", async ({ page }) => {
    await goToMarketDemand(page, "Search Insights");
    const panel = page.locator(".wa-panel-keywords");
    await expect(panel).toBeVisible();
    await expect(panel.locator("h3")).toContainText("Popular Keywords");
    const barRows = panel.locator(".wa-stat-bar-row");
    await expect(barRows).toHaveCount(5);
    await expect(panel.locator("[data-si-viewall='keywords']")).toBeVisible();
  });

  test("31. Popular Brands panel แสดง 5 รายการ + View All", async ({ page }) => {
    await goToMarketDemand(page, "Search Insights");
    const panel = page.locator(".wa-panel-brands");
    await expect(panel).toBeVisible();
    await expect(panel.locator("h3")).toContainText("Popular Brands");
    const barRows = panel.locator(".wa-stat-bar-row");
    await expect(barRows).toHaveCount(5);
    await expect(panel.locator("[data-si-viewall='brands']")).toBeVisible();
  });

  test("32. Popular Filters panel แสดง 5 รายการ + View All", async ({ page }) => {
    await goToMarketDemand(page, "Search Insights");
    const panel = page.locator(".wa-panel-filters");
    await expect(panel).toBeVisible();
    await expect(panel.locator("h3")).toContainText("Popular Filters");
    const barRows = panel.locator(".wa-stat-bar-row");
    await expect(barRows).toHaveCount(5);
    await expect(panel.locator("[data-si-viewall='filters']")).toBeVisible();
  });

  test("33. No-result Searches panel แสดง 5 รายการ + View All", async ({ page }) => {
    await goToMarketDemand(page, "Search Insights");
    const panel = page.locator(".wa-panel-noresult");
    await expect(panel).toBeVisible();
    await expect(panel.locator("h3")).toContainText("No-result Searches");
    const barRows = panel.locator(".wa-stat-bar-row");
    await expect(barRows).toHaveCount(5);
    await expect(panel.locator("[data-si-viewall='noResult']")).toBeVisible();
  });

  test("34. Popular Keywords View All → เปิด modal แสดง 10 รายการ", async ({ page }) => {
    await goToMarketDemand(page, "Search Insights");
    await page.locator("[data-si-viewall='keywords']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).toBeVisible();
    const barRows = page.locator("#user-action-modal-body .wa-stat-bar-row");
    await expect(barRows).toHaveCount(10);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Popular Keywords");
    await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
    await page.waitForTimeout(200);
  });

  test("35. Popular Brands View All → เปิด modal แสดง 10 รายการ", async ({ page }) => {
    await goToMarketDemand(page, "Search Insights");
    await page.locator("[data-si-viewall='brands']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).toBeVisible();
    const barRows = page.locator("#user-action-modal-body .wa-stat-bar-row");
    await expect(barRows).toHaveCount(10);
    await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
    await page.waitForTimeout(200);
  });

  test("36. Popular Filters View All → เปิด modal แสดง 10 รายการ", async ({ page }) => {
    await goToMarketDemand(page, "Search Insights");
    await page.locator("[data-si-viewall='filters']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).toBeVisible();
    const barRows = page.locator("#user-action-modal-body .wa-stat-bar-row");
    await expect(barRows).toHaveCount(10);
    await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
    await page.waitForTimeout(200);
  });

  test("37. No-result Searches View All → เปิด modal แสดง 10 รายการ", async ({ page }) => {
    await goToMarketDemand(page, "Search Insights");
    await page.locator("[data-si-viewall='noResult']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).toBeVisible();
    const barRows = page.locator("#user-action-modal-body .wa-stat-bar-row");
    await expect(barRows).toHaveCount(10);
    await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
    await page.waitForTimeout(200);
  });

  test("38. Search Insights panel subtitle ถูกต้อง (read-only)", async ({ page }) => {
    await goToMarketDemand(page, "Search Insights");
    await expect(page.locator("#panel-subtitle")).toContainText("read-only");
  });

  test("39. Search Insights ไม่มี filter bar หรือ page actions", async ({ page }) => {
    await goToMarketDemand(page, "Search Insights");
    const filterActions = await page.locator("#user-panel-filter-actions").innerHTML();
    expect(filterActions.trim()).toBe("");
  });

  test("40. Search Insights ข้อมูลเป็น aggregate only — ไม่มี user-identifying data ใน panels", async ({ page }) => {
    await goToMarketDemand(page, "Search Insights");
    // ตรวจว่าไม่มี user ID หรือ display name ใน panels
    const panelText = await page.locator(".wa-overview-stack").textContent();
    expect(panelText).not.toContain("U-");
    expect(panelText).not.toMatch(/Nattapol|Crown Time|Seiko Corner|Minimal Dial|Daily Watch|The Collector|Archive Collector/);
  });
});

// ==================== D. WATCH ALERT LIST — RENDERING ====================

test.describe("Watch Alert List — rendering", () => {
  test("41. ตารางมี 10 คอลัมน์ head ครบ", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    const headCells = page.locator(".watch-alert-list-table .asset-row.head > div");
    await expect(headCells).toHaveCount(10);
    const head = page.locator(".watch-alert-list-table .asset-row.head");
    await expect(head).toContainText("Alert ID");
    await expect(head).toContainText("Alert Name");
    await expect(head).toContainText("Owner");
    await expect(head).toContainText("Criteria");
    await expect(head).toContainText("Status");
    await expect(head).toContainText("Notification");
    await expect(head).toContainText("Matches");
    await expect(head).toContainText("Triggers");
    await expect(head).toContainText("Last Triggered");
    await expect(head).toContainText("Updated");
  });

  test("42. แสดง 10 แถวในหน้า 1 (12 alerts, 10/page)", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    const rows = page.locator(".watch-alert-list-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(10);
  });

  test("43. footer-range แสดง 'แสดง 1-10 จาก 12'", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    await expect(page.locator("#table > .footer-range span").first()).toContainText("แสดง 1-10 จาก 12");
  });

  test("44. pagination แสดง 2 หน้า", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    const pager = page.locator("#table > .footer-range");
    // บน desktop: มีปุ่มหน้า 2; บน mobile (≤760px): pager-num ถูกซ่อน ใช้ next button
    const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    if (isMobile) {
      await expect(pager.locator("[data-wa-alert-page='next']")).toBeVisible();
      await expect(pager.locator(".pager-mobile-info")).toBeVisible();
    } else {
      await expect(pager.locator("[data-wa-alert-page='2']")).toBeVisible();
    }
  });

  test("45. คลิกหน้า 2 → แสดง 2 แถว", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    if (isMobile) {
      await page.locator("[data-wa-alert-page='next']").click();
    } else {
      await page.locator("[data-wa-alert-page='2']").click();
    }
    await page.waitForTimeout(300);
    const rows = page.locator(".watch-alert-list-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(2);
    await expect(page.locator("#table > .footer-range span").first()).toContainText("แสดง 11-12 จาก 12");
  });

  test("46. แถวแรก (default sort updated-desc) = WAL-1228 (Omega Speedmaster Bangkok)", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    const firstRow = page.locator(".watch-alert-list-table .asset-row:not(.head)").first();
    await expect(firstRow.locator("[data-label='Alert ID'] .main-text")).toHaveText("WAL-1228");
    await expect(firstRow.locator("[data-label='Alert Name'] .desktop-user-name")).toHaveText("Omega Speedmaster Bangkok");
  });

  test("47. status pill: Active = green, User Disabled = gray, Deleted = charcoal", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    // WAL-1228 = Active (green)
    await expect(page.locator(".asset-row[data-wa-alert-open='WAL-1228'] [data-label='Status'] .pill.green")).toContainText("Active");
    // WAL-1199 = User Disabled (gray) — อยู่ในหน้า 1
    await expect(page.locator(".asset-row[data-wa-alert-open='WAL-1199'] [data-label='Status'] .pill.gray")).toContainText("User Disabled");
    // WAL-1020 = Deleted (charcoal) — อยู่ในหน้า 1
    await expect(page.locator(".asset-row[data-wa-alert-open='WAL-1020'] [data-label='Status'] .pill.charcoal")).toContainText("Deleted");
  });

  test("48. notification pill: On = green, Off = gray", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    // WAL-1228 = On (green)
    await expect(page.locator(".asset-row[data-wa-alert-open='WAL-1228'] [data-label='Notification'] .pill.green")).toContainText("On");
    // WAL-1199 = Off (gray)
    await expect(page.locator(".asset-row[data-wa-alert-open='WAL-1199'] [data-label='Notification'] .pill.gray")).toContainText("Off");
  });

  test("49. criteria summary แสดงบรรทัดเดียว (brand · model · ref · price · conditions · case · dial)", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    const criteria = page.locator(".asset-row[data-wa-alert-open='WAL-1440'] [data-label='Criteria'] .wa-criteria-summary");
    await expect(criteria).toContainText("Rolex");
    await expect(criteria).toContainText("Submariner");
    await expect(criteria).toContainText("16610");
    await expect(criteria).toContainText("320k");
  });

  test("50. Watch Alert List เป็น read-only — ไม่มี row menu (action menu)", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    const rowMenus = page.locator(".watch-alert-list-table .asset-row .row-menu");
    await expect(rowMenus).toHaveCount(0);
  });

  test("51. Watch Alert List ไม่มี summary cards", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    const summaryGrid = page.locator("#summary-grid");
    const content = await summaryGrid.innerHTML();
    expect(content.trim()).toBe("");
  });

  test("52. row click → เข้า Alert Detail (body class watch-alert-detail-mode)", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    await page.locator(".asset-row[data-wa-alert-open='WAL-1440'] .asset-cell-primary").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/watch-alert-detail-mode/);
    await expect(page.locator("#page-title")).toHaveText("Alert Detail");
  });
});

// ==================== E. WATCH ALERT LIST — FILTER / SORT / RESET ====================

test.describe("Watch Alert List — filter / sort / reset", () => {
  test("53. filter bar มี 5 custom-select + 2 date range + reset button", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    await openFilterBar(page);
    // 5 custom selects (hidden inputs exist, check via wrapper trigger)
    await expect(page.locator("div[data-custom-select]:has(> #wa-alert-status-filter) [data-custom-select-trigger]")).toBeVisible();
    await expect(page.locator("div[data-custom-select]:has(> #wa-alert-notif-filter) [data-custom-select-trigger]")).toBeVisible();
    await expect(page.locator("div[data-custom-select]:has(> #wa-alert-trigger-filter) [data-custom-select-trigger]")).toBeVisible();
    await expect(page.locator("div[data-custom-select]:has(> #wa-alert-zero-match-filter) [data-custom-select-trigger]")).toBeVisible();
    await expect(page.locator("div[data-custom-select]:has(> #wa-alert-sort) [data-custom-select-trigger]")).toBeVisible();
    // 2 date inputs
    await expect(page.locator("#wa-alert-last-triggered-from")).toBeVisible();
    await expect(page.locator("#wa-alert-last-triggered-to")).toBeVisible();
  });

  test("54. filter status = Active → แสดงเฉพาะ Active alerts", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    await pickCustomOption(page, "wa-alert-status-filter", "Active");
    await page.waitForTimeout(300);
    const rows = page.locator(".watch-alert-list-table .asset-row:not(.head)");
    const count = await rows.count();
    // Active alerts: WAL-1440, WAL-1228, WAL-1180, WAL-1150, WAL-1100, WAL-1050, WAL-0990, WAL-0950, WAL-0900 = 9
    expect(count).toBe(9);
    // ทุกแถวต้องเป็น Active
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).locator("[data-label='Status'] .pill")).toContainText("Active");
    }
  });

  test("55. filter status = User Disabled → แสดง 2 แถว", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    await pickCustomOption(page, "wa-alert-status-filter", "User Disabled");
    await page.waitForTimeout(300);
    const rows = page.locator(".watch-alert-list-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0).locator("[data-label='Status'] .pill")).toContainText("User Disabled");
  });

  test("56. filter status = Deleted → แสดง 1 แถว", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    await pickCustomOption(page, "wa-alert-status-filter", "Deleted");
    await page.waitForTimeout(300);
    const rows = page.locator(".watch-alert-list-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toHaveAttribute("data-wa-alert-open", "WAL-1020");
  });

  test("57. filter notification = on → แสดงเฉพาะ notification On", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    await pickCustomOption(page, "wa-alert-notif-filter", "on");
    await page.waitForTimeout(300);
    const rows = page.locator(".watch-alert-list-table .asset-row:not(.head)");
    const count = await rows.count();
    // notification on: WAL-1440, WAL-1228, WAL-1180, WAL-1150, WAL-1100, WAL-1050, WAL-0990, WAL-0900 = 8
    expect(count).toBe(8);
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).locator("[data-label='Notification'] .pill")).toContainText("On");
    }
  });

  test("58. filter notification = off → แสดงเฉพาะ notification Off", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    await pickCustomOption(page, "wa-alert-notif-filter", "off");
    await page.waitForTimeout(300);
    const rows = page.locator(".watch-alert-list-table .asset-row:not(.head)");
    const count = await rows.count();
    // notification off: WAL-1199, WAL-1080, WAL-1020, WAL-0950 = 4
    expect(count).toBe(4);
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).locator("[data-label='Notification'] .pill")).toContainText("Off");
    }
  });

  test("59. filter trigger history = has → แสดงเฉพาะที่เคย trigger (triggerCount > 0)", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    await pickCustomOption(page, "wa-alert-trigger-filter", "has");
    await page.waitForTimeout(300);
    const rows = page.locator(".watch-alert-list-table .asset-row:not(.head)");
    const count = await rows.count();
    // triggerCount > 0: WAL-1440(3), WAL-1228(3), WAL-1150(1), WAL-1100(3), WAL-1050(1), WAL-1020(1), WAL-0990(2), WAL-0950(2) = 8
    expect(count).toBe(8);
  });

  test("60. filter trigger history = none → แสดงเฉพาะที่ไม่เคย trigger", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    await pickCustomOption(page, "wa-alert-trigger-filter", "none");
    await page.waitForTimeout(300);
    const rows = page.locator(".watch-alert-list-table .asset-row:not(.head)");
    const count = await rows.count();
    // triggerCount = 0: WAL-1199, WAL-1180, WAL-1080, WAL-0900 = 4
    expect(count).toBe(4);
  });

  test("61. filter match status = zero → แสดงเฉพาะที่ไม่มี match (unmet)", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    await pickCustomOption(page, "wa-alert-zero-match-filter", "zero");
    await page.waitForTimeout(300);
    const rows = page.locator(".watch-alert-list-table .asset-row:not(.head)");
    const count = await rows.count();
    // matchCount = 0: WAL-1199, WAL-1180, WAL-1080, WAL-0900 = 4
    expect(count).toBe(4);
  });

  test("62. filter match status = has → แสดงเฉพาะที่มี match", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    await pickCustomOption(page, "wa-alert-zero-match-filter", "has");
    await page.waitForTimeout(300);
    const rows = page.locator(".watch-alert-list-table .asset-row:not(.head)");
    const count = await rows.count();
    // matchCount > 0: WAL-1440(3), WAL-1228(3), WAL-1150(1), WAL-1100(1), WAL-1050(1), WAL-1020(1), WAL-0990(1), WAL-0950(1) = 8
    expect(count).toBe(8);
  });

  test("63. sort trigger-desc → เรียงตาม triggerCount มากสุดก่อน", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    await pickCustomOption(page, "wa-alert-sort", "trigger-desc");
    await page.waitForTimeout(300);
    const firstRow = page.locator(".watch-alert-list-table .asset-row:not(.head)").first();
    const firstTriggers = await firstRow.locator("[data-label='Triggers'] .main-text").textContent();
    expect(Number(firstTriggers)).toBe(3); // WAL-1440, WAL-1228, WAL-1100 มี 3 triggers
  });

  test("64. sort name-asc → เรียงตามชื่อ A-Z", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    await pickCustomOption(page, "wa-alert-sort", "name-asc");
    await page.waitForTimeout(300);
    const firstRow = page.locator(".watch-alert-list-table .asset-row:not(.head)").first();
    const firstName = await firstRow.locator("[data-label='Alert Name'] .desktop-user-name").textContent();
    // AP Royal Oak 15500 (WAL-0900) จะอยู่อันดับแรก
    expect(firstName).toContain("AP Royal Oak");
  });

  test("65. reset ค่าทั้งหมด → กลับเป็น default (12 alerts, sort updated-desc)", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    // กรองก่อน
    await pickCustomOption(page, "wa-alert-status-filter", "Active");
    await page.waitForTimeout(300);
    // reset
    await clickResetButton(page);
    const rows = page.locator(".watch-alert-list-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(10); // หน้า 1 = 10
    // แถวแรกต้องเป็น WAL-1228 (updated-desc default)
    await expect(rows.first().locator("[data-label='Alert ID'] .main-text")).toHaveText("WAL-1228");
  });

  test("66. reset จากปุ่มใน filter bar ก็ได้", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    await openFilterBar(page);
    await pickCustomOption(page, "wa-alert-notif-filter", "off");
    await page.waitForTimeout(300);
    // กด reset ใน filter bar (ปุ่มที่ 2 ที่ visible)
    await clickResetButton(page);
    const rows = page.locator(".watch-alert-list-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(10);
  });

  test("67. filter ผลลัพธ์ 0 แถว → แสดง empty state", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    // กรองให้ไม่มีผลลัพธ์: status=Deleted + notification=on (Deleted alert มี notification off)
    await pickCustomOption(page, "wa-alert-status-filter", "Deleted");
    await page.waitForTimeout(300);
    await pickCustomOption(page, "wa-alert-notif-filter", "on");
    await page.waitForTimeout(300);
    const empty = page.locator(".detail-empty.user-empty");
    await expect(empty).toBeVisible();
    await expect(empty).toContainText("ไม่พบข้อมูลที่ตรงกับเงื่อนไข");
  });

  test("68. date range filter: กรอง triggered ตั้งแต่ 2026-08-22", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    await openFilterBar(page);
    await page.locator("#wa-alert-last-triggered-from").fill("2026-08-22");
    await page.waitForTimeout(300);
    const rows = page.locator(".watch-alert-list-table .asset-row:not(.head)");
    const count = await rows.count();
    // lastTriggered >= 2026-08-22: WAL-1440(08-25), WAL-1228(08-26), WAL-1100(08-22) = 3
    expect(count).toBe(3);
  });
});

// ==================== F. WATCH ALERT LIST — FILTER PERSISTENCE (BO-UX-001) ====================

test.describe("Watch Alert List — filter persistence (BO-UX-001)", () => {
  test("69. filter state ถูกบันทึกเมื่อ drill-in ไป Alert Detail และกลับมา", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    // กรอง status = Active
    await pickCustomOption(page, "wa-alert-status-filter", "Active");
    await page.waitForTimeout(300);
    // drill-in ไป Alert Detail
    await page.locator(".watch-alert-list-table .asset-row:not(.head)").first().click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/watch-alert-detail-mode/);
    // กลับไป Watch Alert List
    await page.locator("[data-back-wa-alert-list]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/watch-alert-list-mode/);
    // ตรวจว่า filter ยังคงอยู่ — แสดงเฉพาะ Active
    const rows = page.locator(".watch-alert-list-table .asset-row:not(.head)");
    const count = await rows.count();
    expect(count).toBe(9); // Active alerts = 9
    // ตรวจค่า filter ใน custom-select
    const statusValue = await page.locator("#wa-alert-status-filter").inputValue();
    expect(statusValue).toBe("Active");
  });

  test("70. sort state ถูกบันทึกเมื่อ drill-in และกลับมา", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    await pickCustomOption(page, "wa-alert-sort", "name-asc");
    await page.waitForTimeout(300);
    // drill-in
    await page.locator(".watch-alert-list-table .asset-row:not(.head)").first().click();
    await page.waitForTimeout(300);
    // กลับ
    await page.locator("[data-back-wa-alert-list]").click();
    await page.waitForTimeout(300);
    // ตรวค่า sort
    const sortValue = await page.locator("#wa-alert-sort").inputValue();
    expect(sortValue).toBe("name-asc");
  });

  test("71. reset ล้าง filter state ที่บันทึกไว้", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    await pickCustomOption(page, "wa-alert-status-filter", "Active");
    await page.waitForTimeout(300);
    // drill-in
    await page.locator(".watch-alert-list-table .asset-row:not(.head)").first().click();
    await page.waitForTimeout(300);
    // กลับ
    await page.locator("[data-back-wa-alert-list]").click();
    await page.waitForTimeout(300);
    // reset
    await clickResetButton(page);
    // drill-in และกลับอีกครั้ง
    await page.locator(".watch-alert-list-table .asset-row:not(.head)").first().click();
    await page.waitForTimeout(300);
    await page.locator("[data-back-wa-alert-list]").click();
    await page.waitForTimeout(300);
    // ตรวจว่า filter ถูก reset แล้ว — แสดง 12 alerts (10 ในหน้า 1)
    const rows = page.locator(".watch-alert-list-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(10);
    const statusValue = await page.locator("#wa-alert-status-filter").inputValue();
    expect(statusValue).toBe("");
  });
});

// ==================== G. WATCH ALERT DETAIL — RENDERING ====================

test.describe("Watch Alert Detail — rendering", () => {
  test("72. Detail Head: Alert ID : Alert Name + Status badge + Notification badge", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1440");
    const head = page.locator(".watch-alert-detail-page .user-detail-head");
    await expect(head).toBeVisible();
    await expect(head.locator(".asset-report-id")).toHaveText("WAL-1440");
    await expect(head.locator(".asset-report-name")).toHaveText("Rolex Submariner <= 320k");
    // Status badge
    await expect(head.locator(".pill.green").first()).toContainText("Active");
    // Notification badge
    await expect(head.locator(".pill.green").nth(1)).toContainText("On");
  });

  test("73. breadcrumb แสดง Alert ID ต่อท้าย", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1440");
    await expect(page.locator("#crumb")).toHaveText("งานตรวจสอบและบริการ / Market Demand / Watch Alert List / WAL-1440");
  });

  test("74. panel title = alert name, panel subtitle = Alert ID — read-only", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1440");
    await expect(page.locator("#panel-title")).toHaveText("Rolex Submariner <= 320k");
    await expect(page.locator("#panel-subtitle")).toContainText("WAL-1440");
    await expect(page.locator("#panel-subtitle")).toContainText("read-only");
  });

  test("75. Section 1: Alert Summary — 4 tiles (Created, Updated, Matches, Triggers)", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1440");
    const section = page.locator(".watch-alert-detail-page .detail-section").first();
    await expect(section.locator("h4")).toHaveText("Alert Summary");
    const tiles = section.locator(".detail-tile");
    await expect(tiles).toHaveCount(4);
    await expect(tiles.nth(0).locator("span")).toHaveText("Created");
    await expect(tiles.nth(1).locator("span")).toHaveText("Updated");
    await expect(tiles.nth(2).locator("span")).toHaveText("Matches");
    await expect(tiles.nth(3).locator("span")).toHaveText("Triggers");
    // WAL-1440: matches=3, triggers=3
    await expect(tiles.nth(2).locator("strong")).toHaveText("3");
    await expect(tiles.nth(3).locator("strong")).toHaveText("3");
  });

  test("76. Section 2: Owner Summary — 3 tiles (User ID, Display Name, Account Status)", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1440");
    const sections = page.locator(".watch-alert-detail-page .detail-section");
    const section = sections.nth(1);
    await expect(section.locator("h4")).toHaveText("Owner Summary");
    const tiles = section.locator(".detail-tile");
    await expect(tiles).toHaveCount(3);
    await expect(tiles.nth(0).locator("span")).toHaveText("User ID");
    await expect(tiles.nth(1).locator("span")).toHaveText("Display Name");
    await expect(tiles.nth(2).locator("span").first()).toHaveText("Account Status");
    // WAL-1440 owner: U-1042, Nattapol P., Active
    await expect(tiles.nth(0).locator("strong")).toHaveText("U-1042");
    await expect(tiles.nth(1).locator("strong")).toHaveText("Nattapol P.");
    await expect(tiles.nth(2).locator(".pill.green")).toContainText("Active");
  });

  test("77. Section 3: Criteria — structured chips/rows (ไม่ใช่ JSON ดิบ)", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1440");
    const sections = page.locator(".watch-alert-detail-page .detail-section");
    const section = sections.nth(2);
    await expect(section.locator("h4")).toHaveText("Criteria");
    // ตรวจว่ามี criteria chips
    const chips = section.locator(".wa-criteria-chip");
    expect(await chips.count()).toBeGreaterThan(0);
    // WAL-1440: brand=Rolex, model=Submariner, reference=16610, price 0-320k, condition Very Good/Good, case 40-42mm, dial Black
    await expect(section).toContainText("Rolex");
    await expect(section).toContainText("Submariner");
    await expect(section).toContainText("16610");
    await expect(section).toContainText("Very Good");
    await expect(section).toContainText("Good");
    await expect(section).toContainText("40-42mm");
    await expect(section).toContainText("Black");
  });

  test("78. Section 3: Criteria ไม่แสดง field ที่ไม่มีค่า", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1228");
    const sections = page.locator(".watch-alert-detail-page .detail-section");
    const section = sections.nth(2);
    // WAL-1228: reference = "" → ไม่ควรมี Reference tile
    await expect(section).not.toContainText("Reference");
  });

  test("79. Section 4: Matched Assets — ตาราง 8 คอลัมน์ + Asset ID link", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1440");
    const sections = page.locator(".watch-alert-detail-page .detail-section");
    const section = sections.nth(3);
    await expect(section.locator("h4")).toHaveText("Matched Assets");
    const table = section.locator(".wa-matched-assets-table");
    await expect(table).toBeVisible();
    // head 8 columns
    const headCells = table.locator("thead th");
    await expect(headCells).toHaveCount(8);
    await expect(headCells.nth(0)).toHaveText("Asset ID");
    await expect(headCells.nth(1)).toHaveText("Asset Name");
    await expect(headCells.nth(2)).toHaveText("Price");
    await expect(headCells.nth(3)).toHaveText("Condition");
    await expect(headCells.nth(4)).toHaveText("Case Size");
    await expect(headCells.nth(5)).toHaveText("Dial Color");
    await expect(headCells.nth(6)).toHaveText("Listed At");
    await expect(headCells.nth(7)).toHaveText("Asset Status");
    // WAL-1440 มี 3 matched assets
    const rows = table.locator("tbody tr");
    await expect(rows).toHaveCount(3);
    // Asset ID เป็น link (button)
    await expect(rows.first().locator("button[data-asset-open]")).toBeVisible();
  });

  test("80. Section 4: Asset ID link → drill-in ไป Asset Detail", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1440");
    const assetLink = page.locator(".wa-matched-assets-table tbody tr").first().locator("[data-asset-open]");
    await assetLink.click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/asset-detail-mode/);
  });

  test("81. Section 5: Trigger & Notification History — ตาราง 4 คอลัมน์ + delivery status", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1440");
    const sections = page.locator(".watch-alert-detail-page .detail-section");
    const section = sections.nth(4);
    await expect(section.locator("h4")).toHaveText("Trigger & Notification History");
    const table = section.locator(".wa-trigger-history-table");
    await expect(table).toBeVisible();
    const headCells = table.locator("thead th");
    await expect(headCells).toHaveCount(4);
    await expect(headCells.nth(0)).toHaveText("Trigger ID");
    await expect(headCells.nth(1)).toHaveText("Triggered At");
    await expect(headCells.nth(2)).toHaveText("Matches");
    await expect(headCells.nth(3)).toHaveText("Delivery Status");
    // WAL-1440: 3 triggers ที่มี newMatches > 0 (WAT-1440-12, WAT-1440-11, WAT-1440-09)
    const rows = table.locator("tbody tr:not(.history-empty-row)");
    await expect(rows).toHaveCount(3);
    // delivery status pill
    await expect(rows.first().locator(".pill")).toContainText("Delivered");
  });

  test("82. Section 5: trigger ที่ newMatches=0 ถูกกรองออก", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1440");
    const table = page.locator(".wa-trigger-history-table");
    const rows = table.locator("tbody tr:not(.history-empty-row)");
    // WAL-1440 มี 4 triggers แต่ WAT-1440-10 มี newMatches=0 → กรองออก เหลือ 3
    await expect(rows).toHaveCount(3);
    // ตรวจว่าไม่มี "Skipped" ใน rows ที่แสดง
    for (let i = 0; i < 3; i++) {
      const status = await rows.nth(i).locator(".pill").textContent();
      expect(status).toContain("Delivered");
    }
  });

  test("83. Section 6: User Action History — ตาราง 5 คอลัมน์", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1440");
    const sections = page.locator(".watch-alert-detail-page .detail-section");
    const section = sections.nth(5);
    await expect(section.locator("h4")).toHaveText("User Action History");
    const table = section.locator(".wa-user-action-history-table");
    await expect(table).toBeVisible();
    const headCells = table.locator("thead th");
    await expect(headCells).toHaveCount(5);
    await expect(headCells.nth(0)).toHaveText("Timestamp");
    await expect(headCells.nth(1)).toHaveText("Actor");
    await expect(headCells.nth(2)).toHaveText("Action");
    await expect(headCells.nth(3)).toHaveText("Changes");
    await expect(headCells.nth(4)).toHaveText("Note");
    // WAL-1440: 5 user actions
    const rows = table.locator("tbody tr:not(.history-empty-row)");
    await expect(rows).toHaveCount(5);
  });

  test("84. Section 6: action type แสดงเป็นภาษาไทย (สร้าง alert, แก้ไขเงื่อนไข, etc.)", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1440");
    const table = page.locator(".wa-user-action-history-table");
    const rows = table.locator("tbody tr:not(.history-empty-row)");
    // แถวสุดท้าย = create = "สร้าง alert"
    await expect(rows.last().locator("[data-label='Action']")).toHaveText("สร้าง alert");
    // แถวแรก = edit_criteria = "แก้ไขเงื่อนไข"
    await expect(rows.first().locator("[data-label='Action']")).toHaveText("แก้ไขเงื่อนไข");
  });

  test("85. back button → กลับไป Watch Alert List", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1440");
    await page.locator("[data-back-wa-alert-list]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/watch-alert-list-mode/);
    await expect(page.locator("#panel-title")).toHaveText("Watch Alert List");
  });

  test("86. Alert Detail เป็น read-only — ไม่มี primary action หรือ page actions", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1440");
    await expect(page.locator("#primary-action")).toHaveText("");
    const filterActions = await page.locator("#user-panel-filter-actions").innerHTML();
    expect(filterActions.trim()).toBe("");
  });

  test("87. Alert Detail ไม่มี filter bar", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1440");
    const filters = await page.locator(".filters").innerHTML();
    expect(filters.trim()).toBe("");
  });
});

// ==================== H. WATCH ALERT DETAIL — SOFT DELETE (WAL-1020) ====================

test.describe("Watch Alert Detail — soft delete handling", () => {
  test("88. WAL-1020 (Deleted) แสดงสถานะ Deleted ใน Detail Head", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1020");
    const head = page.locator(".watch-alert-detail-page .user-detail-head");
    await expect(head.locator(".pill.charcoal")).toContainText("Deleted");
  });

  test("89. WAL-1020 แสดง deleted notice ใน Section 5 (Trigger & Notification History)", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1020");
    const sections = page.locator(".watch-alert-detail-page .detail-section");
    const section = sections.nth(4);
    const notice = section.locator(".wa-deleted-notice");
    await expect(notice).toBeVisible();
    await expect(notice).toContainText("ลบ");
  });

  test("90. WAL-1020 ยังแสดง matched assets + trigger history + user action history", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1020");
    // Section 4: 1 matched asset
    const matchedRows = page.locator(".wa-matched-assets-table tbody tr:not(.history-empty-row)");
    await expect(matchedRows).toHaveCount(1);
    // Section 5: 1 trigger
    const triggerRows = page.locator(".wa-trigger-history-table tbody tr:not(.history-empty-row)");
    await expect(triggerRows).toHaveCount(1);
    // Section 6: 4 user actions
    const actionRows = page.locator(".wa-user-action-history-table tbody tr:not(.history-empty-row)");
    await expect(actionRows).toHaveCount(4);
  });

  test("91. WAL-1020 Section 6 แสดง action type 'ลบ alert'", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1020");
    const rows = page.locator(".wa-user-action-history-table tbody tr:not(.history-empty-row)");
    // แถวแรก = delete = "ลบ alert"
    await expect(rows.first().locator("[data-label='Action']")).toHaveText("ลบ alert");
  });
});

// ==================== I. INACTIVE MARKET DATA WARNING ====================

test.describe("Inactive market data warning", () => {
  test("92. WAL-1199 (inactive model) แสดง inactive warning ใน Section 3", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1199");
    const sections = page.locator(".watch-alert-detail-page .detail-section");
    const section = sections.nth(2); // Criteria section
    const warning = section.locator(".wa-inactive-warning");
    await expect(warning).toBeVisible();
    await expect(warning).toContainText("inactive");
    await expect(warning).toContainText("model");
  });

  test("93. WAL-1199 inactive warning ระบุ field ที่ inactive (model)", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1199");
    const warning = page.locator(".wa-inactive-warning");
    await expect(warning).toContainText("model");
  });

  test("94. WAL-0900 (inactive reference) แสดง inactive warning ใน Section 3", async ({ page }) => {
    await goToAlertDetail(page, "WAL-0900");
    const sections = page.locator(".watch-alert-detail-page .detail-section");
    const section = sections.nth(2);
    const warning = section.locator(".wa-inactive-warning");
    await expect(warning).toBeVisible();
    await expect(warning).toContainText("inactive");
    await expect(warning).toContainText("reference");
  });

  test("95. WAL-0900 inactive warning ระบุ field ที่ inactive (reference)", async ({ page }) => {
    await goToAlertDetail(page, "WAL-0900");
    const warning = page.locator(".wa-inactive-warning");
    await expect(warning).toContainText("reference");
  });

  test("96. WAL-1440 (active, no inactive) ไม่แสดง inactive warning", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1440");
    const warning = page.locator(".wa-inactive-warning");
    await expect(warning).toHaveCount(0);
  });

  test("97. WAL-1199 (inactive) Section 4 empty state ระบุ inactive market data", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1199");
    const matchedTable = page.locator(".wa-matched-assets-table");
    const emptyRow = matchedTable.locator(".history-empty-row");
    await expect(emptyRow).toBeVisible();
    await expect(emptyRow).toContainText("inactive");
  });

  test("98. WAL-1199 (inactive) Section 5 empty state ระบุ inactive market data", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1199");
    const triggerTable = page.locator(".wa-trigger-history-table");
    const emptyRow = triggerTable.locator(".history-empty-row");
    await expect(emptyRow).toBeVisible();
    await expect(emptyRow).toContainText("inactive");
  });

  test("99. WAL-1180 (active, 0 matches, no inactive) Section 4 empty state ไม่ระบุ inactive", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1180");
    const matchedTable = page.locator(".wa-matched-assets-table");
    const emptyRow = matchedTable.locator(".history-empty-row");
    await expect(emptyRow).toBeVisible();
    // WAL-1180 ไม่มี inactive → empty state ควรไม่ระบุ inactive
    const text = await emptyRow.textContent();
    expect(text).not.toContain("inactive");
  });

  test("100. WAL-1180 (active, 0 triggers, no inactive) Section 5 empty state ไม่ระบุ inactive", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1180");
    const triggerTable = page.locator(".wa-trigger-history-table");
    const emptyRow = triggerTable.locator(".history-empty-row");
    await expect(emptyRow).toBeVisible();
    const text = await emptyRow.textContent();
    expect(text).not.toContain("inactive");
  });
});

// ==================== J. WATCH ALERT DETAIL — DELIVERY STATUS BADGES ====================

test.describe("Watch Alert Detail — delivery status badges", () => {
  test("101. WAL-1440 Section 5: Delivered = green pill", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1440");
    const rows = page.locator(".wa-trigger-history-table tbody tr:not(.history-empty-row)");
    await expect(rows.first().locator(".pill.green")).toContainText("Delivered");
  });

  test("102. WAL-0950 Section 5: Skipped (notification off) = gray pill", async ({ page }) => {
    await goToAlertDetail(page, "WAL-0950");
    const rows = page.locator(".wa-trigger-history-table tbody tr:not(.history-empty-row)");
    // WAL-0950 มี 2 triggers ที่ newMatches > 0, delivery = Skipped (notification off)
    await expect(rows.first().locator(".pill.gray")).toContainText("Skipped");
  });
});

// ==================== K. WATCH ALERT DETAIL — PAGINATION (Section 4-6) ====================

test.describe("Watch Alert Detail — pagination (Section 4-6)", () => {
  test("103. WAL-1228 Section 5 มี pagination (28 triggers, 10/page → 3 pages, 3 ที่ newMatches > 0)", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1228");
    const triggerTable = page.locator(".wa-trigger-history-table");
    const rows = triggerTable.locator("tbody tr:not(.history-empty-row)");
    // WAL-1228 มี 28 triggers แต่เหลือ 3 ที่ newMatches > 0 (WAT-1228-28, WAT-1228-27, WAT-1228-26)
    await expect(rows).toHaveCount(3);
    // 3 rows < 10 → ไม่มี pagination
    const pagination = page.locator(".wa-trigger-history-table").locator("..").locator(".footer-range");
    await expect(pagination).toHaveCount(0);
  });

  test("104. WAL-1440 Section 4: 3 matched assets (no pagination needed)", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1440");
    const matchedRows = page.locator(".wa-matched-assets-table tbody tr:not(.history-empty-row)");
    await expect(matchedRows).toHaveCount(3);
    // 3 rows < 10 → ไม่มี pagination
    const section = page.locator(".watch-alert-detail-page .detail-section").nth(3);
    const pagination = section.locator(".footer-range");
    await expect(pagination).toHaveCount(0);
  });

  test("105. WAL-1440 Section 6: 5 user actions (no pagination needed)", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1440");
    const actionRows = page.locator(".wa-user-action-history-table tbody tr:not(.history-empty-row)");
    await expect(actionRows).toHaveCount(5);
    // 5 rows < 10 → ไม่มี pagination
    const section = page.locator(".watch-alert-detail-page .detail-section").nth(5);
    const pagination = section.locator(".footer-range");
    await expect(pagination).toHaveCount(0);
  });
});

// ==================== L. WATCH ALERT DETAIL — EMPTY STATES ====================

test.describe("Watch Alert Detail — empty states", () => {
  test("106. WAL-1180 (0 matches) Section 4 แสดง empty row 'ยังไม่มี asset ที่ตรงตามเงื่อนไข'", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1180");
    const emptyRow = page.locator(".wa-matched-assets-table .history-empty-row");
    await expect(emptyRow).toBeVisible();
    await expect(emptyRow).toContainText("ยังไม่มี asset ที่ตรงตามเงื่อนไข");
  });

  test("107. WAL-1180 (0 triggers) Section 5 แสดง empty row 'ยังไม่มีประวัติการตรวจจับ'", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1180");
    const emptyRow = page.locator(".wa-trigger-history-table .history-empty-row");
    await expect(emptyRow).toBeVisible();
    await expect(emptyRow).toContainText("ยังไม่มีประวัติการตรวจจับ");
  });

  test("108. WAL-1199 (inactive, 0 matches) Section 4 empty row ระบุ inactive", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1199");
    const emptyRow = page.locator(".wa-matched-assets-table .history-empty-row");
    await expect(emptyRow).toBeVisible();
    await expect(emptyRow).toContainText("inactive");
  });

  test("109. WAL-1199 (inactive, 0 triggers) Section 5 empty row ระบุ inactive", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1199");
    const emptyRow = page.locator(".wa-trigger-history-table .history-empty-row");
    await expect(emptyRow).toBeVisible();
    await expect(emptyRow).toContainText("inactive");
  });
});

// ==================== M. RESPONSIVE — MOBILE CARD (≤760px) ====================

test.describe("Watch Alert List — mobile card (≤760px)", () => {
  test("110. mobile (390px): Watch Alert List แสดง mobile card แทนตาราง", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await goToMarketDemand(page, "Watch Alert List");
    // ตรวจว่ามี mobile card elements (asset-card-tags, user-card-meta)
    const cardMeta = page.locator(".watch-alert-list-table .asset-row:not(.head) .user-card-meta");
    expect(await cardMeta.count()).toBeGreaterThan(0);
    await page.close();
  });

  test("111. mobile (390px): mobile card แสดง Alert Name, Owner, Matches, Triggers, Last Triggered, Updated", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await goToMarketDemand(page, "Watch Alert List");
    const firstCard = page.locator(".watch-alert-list-table .asset-row:not(.head)").first();
    await expect(firstCard.locator(".user-card-meta-item").filter({ hasText: "Alert Name" })).toBeVisible();
    await expect(firstCard.locator(".user-card-meta-item").filter({ hasText: "Owner" })).toBeVisible();
    await expect(firstCard.locator(".user-card-meta-item").filter({ hasText: "Matches" })).toBeVisible();
    await expect(firstCard.locator(".user-card-meta-item").filter({ hasText: "Triggers" })).toBeVisible();
    await expect(firstCard.locator(".user-card-meta-item").filter({ hasText: "Last Triggered" })).toBeVisible();
    await expect(firstCard.locator(".user-card-meta-item").filter({ hasText: "Updated" })).toBeVisible();
    await page.close();
  });

  test("112. mobile (390px): filter bar ซ่อน ต้องกดเปิดก่อน", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await goToMarketDemand(page, "Watch Alert List");
    const filterBar = page.locator(".user-filter-bar.wa-alert-filter-bar");
    const isOpen = await filterBar.getAttribute("data-filter-open");
    expect(isOpen).toBe("false");
    // กดเปิด
    await page.locator("[data-wa-alert-filter-toggle]").click();
    await page.waitForTimeout(200);
    const isOpenNow = await filterBar.getAttribute("data-filter-open");
    expect(isOpenNow).toBe("true");
    await page.close();
  });

  test("113. mobile (390px): row click → Alert Detail ได้", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await goToMarketDemand(page, "Watch Alert List");
    await page.locator(".watch-alert-list-table .asset-row:not(.head)").first().click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/watch-alert-detail-mode/);
    await page.close();
  });

  test("114. mobile (390px): Alert Detail แสดงครบทุก section", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await goToAlertDetail(page, "WAL-1440");
    const sections = page.locator(".watch-alert-detail-page .detail-section");
    await expect(sections).toHaveCount(6);
    await page.close();
  });

  test("115. mobile (390px): Demand Overview แสดง KPI + panels ครบ", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await goToMarketDemand(page, "Demand Overview");
    const kpiCards = page.locator("#summary-grid .wa-kpi-card");
    await expect(kpiCards).toHaveCount(4);
    const panels = page.locator(".wa-overview-panel");
    await expect(panels).toHaveCount(4);
    await page.close();
  });

  test("116. mobile (390px): Search Insights แสดง KPI + panels ครบ", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await goToMarketDemand(page, "Search Insights");
    const kpiCards = page.locator("#summary-grid .wa-kpi-card");
    await expect(kpiCards).toHaveCount(4);
    const panels = page.locator(".wa-overview-panel");
    await expect(panels).toHaveCount(6);
    await page.close();
  });

  test("117. mobile (390px): back button จาก Alert Detail กลับไป Watch Alert List", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await goToAlertDetail(page, "WAL-1440");
    await page.locator("[data-back-wa-alert-list]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/watch-alert-list-mode/);
    await page.close();
  });
});

// ==================== N. RESPONSIVE — TABLET (768px) ====================

test.describe("Market Demand — tablet (768px)", () => {
  test("118. tablet (768px): Demand Overview แสดง KPI + panels ครบ", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
    await goToMarketDemand(page, "Demand Overview");
    const kpiCards = page.locator("#summary-grid .wa-kpi-card");
    await expect(kpiCards).toHaveCount(4);
    const panels = page.locator(".wa-overview-panel");
    await expect(panels).toHaveCount(4);
    await page.close();
  });

  test("119. tablet (768px): Watch Alert List แสดงตาราง 10 แถว", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
    await goToMarketDemand(page, "Watch Alert List");
    const rows = page.locator(".watch-alert-list-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(10);
    await page.close();
  });

  test("120. tablet (768px): Alert Detail แสดง 6 sections", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
    await goToAlertDetail(page, "WAL-1440");
    const sections = page.locator(".watch-alert-detail-page .detail-section");
    await expect(sections).toHaveCount(6);
    await page.close();
  });
});

// ==================== O. RESPONSIVE — DESKTOP (1280px, 1440px) ====================

test.describe("Market Demand — desktop (1280px)", () => {
  test("121. desktop (1280px): Demand Overview แสดง KPI + panels ครบ", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await goToMarketDemand(page, "Demand Overview");
    const kpiCards = page.locator("#summary-grid .wa-kpi-card");
    await expect(kpiCards).toHaveCount(4);
    const panels = page.locator(".wa-overview-panel");
    await expect(panels).toHaveCount(4);
    await page.close();
  });

  test("122. desktop (1280px): Watch Alert List แสดงตาราง 10 แถว", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await goToMarketDemand(page, "Watch Alert List");
    const rows = page.locator(".watch-alert-list-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(10);
    await page.close();
  });

  test("123. desktop (1280px): Alert Detail แสดง 6 sections", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await goToAlertDetail(page, "WAL-1440");
    const sections = page.locator(".watch-alert-detail-page .detail-section");
    await expect(sections).toHaveCount(6);
    await page.close();
  });
});

test.describe("Market Demand — desktop (1440px)", () => {
  test("124. desktop (1440px): Demand Overview แสดง KPI + panels ครบ", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await goToMarketDemand(page, "Demand Overview");
    const kpiCards = page.locator("#summary-grid .wa-kpi-card");
    await expect(kpiCards).toHaveCount(4);
    const panels = page.locator(".wa-overview-panel");
    await expect(panels).toHaveCount(4);
    await page.close();
  });

  test("125. desktop (1440px): Watch Alert List แสดงตาราง 10 แถว", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await goToMarketDemand(page, "Watch Alert List");
    const rows = page.locator(".watch-alert-list-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(10);
    await page.close();
  });

  test("126. desktop (1440px): Alert Detail แสดง 6 sections", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await goToAlertDetail(page, "WAL-1440");
    const sections = page.locator(".watch-alert-detail-page .detail-section");
    await expect(sections).toHaveCount(6);
    await page.close();
  });
});

// ==================== P. CROSS-MODULE DRILL-IN ====================

test.describe("Market Demand — cross-module drill-in", () => {
  test("127. Alert Detail → Asset ID link → Asset Detail (asset-detail-mode)", async ({ page }) => {
    await goToAlertDetail(page, "WAL-1440");
    await page.locator(".wa-matched-assets-table tbody tr").first().locator("[data-asset-open]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/asset-detail-mode/);
  });

  test("128. Demand Overview → Frequently Triggered View All → Watch Alert List", async ({ page }) => {
    await goToMarketDemand(page, "Demand Overview");
    await page.locator(".wa-panel-frequent .wa-view-all").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/watch-alert-list-mode/);
  });

  test("129. Watch Alert List → Alert Detail → back → Watch Alert List (filter preserved)", async ({ page }) => {
    await goToMarketDemand(page, "Watch Alert List");
    await pickCustomOption(page, "wa-alert-zero-match-filter", "zero");
    await page.waitForTimeout(300);
    // drill-in
    await page.locator(".watch-alert-list-table .asset-row:not(.head)").first().click();
    await page.waitForTimeout(300);
    // back
    await page.locator("[data-back-wa-alert-list]").click();
    await page.waitForTimeout(300);
    // filter ยังคงอยู่
    const matchValue = await page.locator("#wa-alert-zero-match-filter").inputValue();
    expect(matchValue).toBe("zero");
    const rows = page.locator(".watch-alert-list-table .asset-row:not(.head)");
    expect(await rows.count()).toBe(4); // unmet = 4
  });
});
