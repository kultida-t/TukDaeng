// QA-BO-004: Asset Management 2 (Reported Comments, Comment Report Detail) — strict Playwright spec
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

// helper: ไปหน้า Reported Comments ผ่านเมนู (Asset Management → Reported Comments)
async function goToReportedComments(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  const parent = page.locator(".nav-item[data-module='assets']");
  const expanded = await parent.evaluate(el => el.classList.contains("expanded")).catch(() => false);
  if (!expanded) await parent.click();
  await page.locator(".submenu[data-submenu='assets'] button[data-sub='Reported Comments']").click();
  await page.waitForTimeout(300);
}

// helper: เปิด filter bar ถ้ายังปิด (advanced filter ถูกซ่อนเมื่อ data-filter-open="false")
async function openReportedCommentFilterBar(page) {
  const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
  if (!isMobile) return;
  const bar = page.locator(".user-filter-bar.report-mode");
  const isOpen = await bar.getAttribute("data-filter-open");
  if (isOpen === "false") {
    await page.locator("[data-reported-comment-filter-toggle]").click();
    await page.waitForTimeout(200);
  }
}

// helper: เลือก option ใน custom-select ของ Reported Comments (ผ่าน UI จริง: เปิด trigger → กด option)
async function pickReportedCommentCustomOption(page, inputId, value) {
  await openReportedCommentFilterBar(page);
  await page
    .locator(`div[data-custom-select]:has(> #${inputId}) [data-custom-select-trigger]`)
    .click();
  await page.waitForTimeout(150);
  await page
    .locator(`div[data-custom-select]:has(> #${inputId}) [data-custom-select-option][data-value="${value}"]`)
    .click();
  await page.waitForTimeout(200);
}

// helper: คลิกแถวรายงานเพื่อเปิด detail (คลิก primary cell)
async function openCommentReportDetailByRowClick(page, reportId) {
  await page.locator(`.user-row.reported-comment-row[data-reported-comment-card="${reportId}"] .user-cell-primary`).click();
  await page.waitForTimeout(300);
}

// helper: เปิด row menu ของ reported comment
async function openReportedCommentRowMenu(page, reportId) {
  await page.locator(`.user-row.reported-comment-row[data-reported-comment-card="${reportId}"] .row-menu > summary`).click();
  await page.waitForTimeout(200);
}

// helper: ปิด row menu ที่ค้าง
async function closeRowMenus(page) {
  await page.locator("body").click({ position: { x: 5, y: 5 } });
  await page.waitForTimeout(150);
}

// helper: กดปุ่มรีเซ็ตค่าทั้งหมด — เลือกปุ่มที่ visible
async function clickReportedCommentReset(page) {
  await page.locator("[data-reported-comment-reset]:visible").first().click();
  await page.waitForTimeout(300);
}

// helper: เลือก scenario ใน action modal (ผ่าน evaluate เพราะ custom-select silent)
async function setActionScenario(page, scenario) {
  await page.evaluate((s) => {
    const input = document.querySelector("#reported-comment-action-scenario");
    if (input) input.value = s;
  }, scenario);
}

test.describe("QA-BO-004: Reported Comments + Comment Report Detail (strict)", () => {

  // ==================== A. NAVIGATION / MENU / ACTIVE STATE ====================

  test.describe("Navigation — menu entry, submenu, active state", () => {
    test("1. Asset Management menu กาง submenu ได้ มี Reported Comments", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await ensureNavOpen(page);
      await page.locator(".nav-item[data-module='assets']").click();
      await page.waitForTimeout(200);
      const submenu = page.locator(".submenu[data-submenu='assets']");
      await expect(submenu).toHaveClass(/open/);
      await expect(submenu.locator("button[data-sub='Reported Comments']")).toBeVisible();
    });

    test("2. เข้า Reported Comments: page title + breadcrumb + panel title ถูกต้อง", async ({ page }) => {
      await goToReportedComments(page);
      await expect(page.locator("#page-title")).toHaveText("Reported Comments");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Asset Management / Reported Comments");
      await expect(page.locator("#panel-title")).toHaveText("Reported Comments List");
    });

    test("3. active state ของ Reported Comments submenu สลับถูกต้องเมื่อสลับหน้า", async ({ page }) => {
      await goToReportedComments(page);
      const reportedCommentBtn = page.locator(".submenu[data-submenu='assets'] button[data-sub='Reported Comments']");
      const assetListBtn = page.locator(".submenu[data-submenu='assets'] button[data-sub='Asset List']");
      await expect(reportedCommentBtn).toHaveClass(/active/);
      await expect(page.locator(".nav-item[data-module='assets']")).toHaveClass(/active/);
      await ensureNavOpen(page);
      await assetListBtn.click();
      await page.waitForTimeout(300);
      await expect(assetListBtn).toHaveClass(/active/);
      await expect(reportedCommentBtn).not.toHaveClass(/active/);
    });
  });

  // ==================== B. REPORTED COMMENTS LIST — RENDERING ====================

  test.describe("Reported Comments List — rendering", () => {
    test("4. ไม่มี KPI summary card (reported comments ไม่มี summary)", async ({ page }) => {
      await goToReportedComments(page);
      await expect(page.locator("#summary-grid .stat")).toHaveCount(0);
      await expect(page.locator("#summary-grid")).toBeEmpty();
    });

    test("5. ตาราง head มี 7 คอลัมน์ครบ", async ({ page }) => {
      test.skip(page.viewportSize().width <= 760, "desktop only — mobile ใช้ card layout ไม่แสดง head");
      await goToReportedComments(page);
      const head = page.locator(".user-row.reported-comment-row.head");
      await expect(head).toBeVisible();
      for (const label of ["Report ID", "Comment", "Asset", "Status", "Reason", "Priority", "Action"]) {
        await expect(head.locator(`div:text-is("${label}")`)).toBeVisible();
      }
    });

    test("6. แสดง 3 รายงาน + footer range ถูกต้อง", async ({ page }) => {
      await goToReportedComments(page);
      await expect(page.locator(".user-row.reported-comment-row:not(.head)")).toHaveCount(3);
      await expect(page.locator(".footer-range > span:first-child")).toHaveText("แสดง 1-3 จาก 3");
    });

    test("7. แถวแรก (sort latest default) คือ RCO-711 (createdAt ล่าสุด)", async ({ page }) => {
      await goToReportedComments(page);
      await expect(page.locator(".user-row.reported-comment-row:not(.head)").first()).toHaveAttribute("data-reported-comment-card", "RCO-711");
    });

    test("8. status pill: Pending = amber, Closed = green", async ({ page }) => {
      await goToReportedComments(page);
      const pendingRow = page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-711']");
      await expect(pendingRow.locator("div[data-label='Status'] .pill")).toHaveClass(/amber/);
      await expect(pendingRow.locator("div[data-label='Status'] .pill")).toHaveText("Pending");
      const closedRow = page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-690']");
      await expect(closedRow.locator("div[data-label='Status'] .pill")).toHaveClass(/green/);
      await expect(closedRow.locator("div[data-label='Status'] .pill")).toHaveText("Closed");
    });

    test("9. comment status pill: User Deleted = gray 'ลบโดยเจ้าของ' (RCO-690)", async ({ page }) => {
      await goToReportedComments(page);
      const row = page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-690']");
      await expect(row.locator(".user-card-tags .pill.gray")).toHaveText("ลบโดยเจ้าของ");
    });

    test("10. priority pill: High = red, Medium = amber, Low = blue", async ({ page }) => {
      await goToReportedComments(page);
      await expect(page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-711'] div[data-label='Priority'] .pill")).toHaveClass(/red/);
      await expect(page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-706'] div[data-label='Priority'] .pill")).toHaveClass(/amber/);
      await expect(page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-690'] div[data-label='Priority'] .pill")).toHaveClass(/blue/);
    });

    test("11. reporters tag แสดงจำนวน reporters ถูกต้อง", async ({ page }) => {
      await goToReportedComments(page);
      await expect(page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-711'] .user-card-tag.asset-tag")).toHaveText("3 reporters");
      await expect(page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-706'] .user-card-tag.asset-tag")).toHaveText("1 reporters");
      await expect(page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-690'] .user-card-tag.asset-tag")).toHaveText("2 reporters");
    });

    test("12. คอลัมน์ Comment แสดง comment excerpt ถูกต้อง", async ({ page }) => {
      test.skip(page.viewportSize().width <= 760, "desktop only — mobile ใช้ card layout");
      await goToReportedComments(page);
      const row = page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-711']");
      await expect(row.locator("div[data-label='Comment'] .main-text")).toContainText("bit.ly/superdeal");
    });

    test("13. คอลัมน์ Asset แสดง Asset ID + Asset Name", async ({ page }) => {
      test.skip(page.viewportSize().width <= 760, "desktop only — mobile ใช้ card layout");
      await goToReportedComments(page);
      const row = page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-711']");
      await expect(row.locator("div[data-label='Asset'] .main-text")).toHaveText("AST-8802");
      await expect(row.locator("div[data-label='Asset'] .muted")).toContainText("Omega Speedmaster");
    });

    test("14. คอลัมน์ Reason แสดง report reason ถูกต้อง", async ({ page }) => {
      test.skip(page.viewportSize().width <= 760, "desktop only — mobile ใช้ card layout");
      await goToReportedComments(page);
      await expect(page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-711'] div[data-label='Reason'] .main-text")).toHaveText("Spam or scam");
      await expect(page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-706'] div[data-label='Reason'] .main-text")).toHaveText("Inappropriate content");
    });
  });

  // ==================== C. SEARCH ====================

  test.describe("Reported Comments List — search", () => {
    test("15. ค้นหาด้วย Report ID 'RCO-711' เจอ 1 แถว", async ({ page }) => {
      await goToReportedComments(page);
      await page.locator("#reported-comment-search").fill("RCO-711");
      await page.waitForTimeout(200);
      await expect(page.locator(".user-row.reported-comment-row:not(.head)")).toHaveCount(1);
      await expect(page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-711']")).toBeVisible();
    });

    test("16. ค้นหาด้วย Comment ID 'COM-704' เจอ 1 แถว (RCO-706)", async ({ page }) => {
      await goToReportedComments(page);
      await page.locator("#reported-comment-search").fill("COM-704");
      await page.waitForTimeout(200);
      await expect(page.locator(".user-row.reported-comment-row:not(.head)")).toHaveCount(1);
      await expect(page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-706']")).toBeVisible();
    });

    test("17. ค้นหาด้วย Asset ID 'AST-8612' เจอ 1 แถว (RCO-690)", async ({ page }) => {
      await goToReportedComments(page);
      await page.locator("#reported-comment-search").fill("AST-8612");
      await page.waitForTimeout(200);
      await expect(page.locator(".user-row.reported-comment-row:not(.head)")).toHaveCount(1);
      await expect(page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-690']")).toBeVisible();
    });

    test("18. ค้นหาด้วย author 'Omega Club TH' เจอ 1 แถว (RCO-711)", async ({ page }) => {
      await goToReportedComments(page);
      await page.locator("#reported-comment-search").fill("Omega Club TH");
      await page.waitForTimeout(200);
      await expect(page.locator(".user-row.reported-comment-row:not(.head)")).toHaveCount(1);
      await expect(page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-711']")).toBeVisible();
    });

    test("19. ค้นหาไม่เจอ → empty state 'ไม่พบข้อมูล' + footer 0 รายการ", async ({ page }) => {
      await goToReportedComments(page);
      await page.locator("#reported-comment-search").fill("zzz-not-exist");
      await page.waitForTimeout(200);
      await expect(page.locator(".detail-empty.user-empty")).toHaveText("ไม่พบข้อมูล");
      await expect(page.locator(".footer-range > span:first-child")).toHaveText("แสดง 0 จาก 0");
    });
  });

  // ==================== D. FILTER ====================

  test.describe("Reported Comments List — filter + sort", () => {
    test("20. filter สถานะรายงาน: Pending → 2, Closed → 1", async ({ page }) => {
      await goToReportedComments(page);
      await pickReportedCommentCustomOption(page, "reported-comment-status-filter", "Pending");
      await expect(page.locator(".user-row.reported-comment-row:not(.head)")).toHaveCount(2);
      await pickReportedCommentCustomOption(page, "reported-comment-status-filter", "Closed");
      await expect(page.locator(".user-row.reported-comment-row:not(.head)")).toHaveCount(1);
    });

    test("21. filter priority: high → 1, medium → 1, low → 1", async ({ page }) => {
      await goToReportedComments(page);
      await pickReportedCommentCustomOption(page, "reported-comment-priority-filter", "high");
      await expect(page.locator(".user-row.reported-comment-row:not(.head)")).toHaveCount(1);
      await pickReportedCommentCustomOption(page, "reported-comment-priority-filter", "medium");
      await expect(page.locator(".user-row.reported-comment-row:not(.head)")).toHaveCount(1);
      await pickReportedCommentCustomOption(page, "reported-comment-priority-filter", "low");
      await expect(page.locator(".user-row.reported-comment-row:not(.head)")).toHaveCount(1);
    });

    test("22. sort oldest → RCO-690 อยู่แถวแรก (createdAt เก่าสุด)", async ({ page }) => {
      await goToReportedComments(page);
      await pickReportedCommentCustomOption(page, "reported-comment-sort", "oldest");
      await expect(page.locator(".user-row.reported-comment-row:not(.head)").first()).toHaveAttribute("data-reported-comment-card", "RCO-690");
    });

    test("23. sort reporters → RCO-711 (3 reporters) อยู่แถวแรก", async ({ page }) => {
      await goToReportedComments(page);
      await pickReportedCommentCustomOption(page, "reported-comment-sort", "reporters");
      await expect(page.locator(".user-row.reported-comment-row:not(.head)").first()).toHaveAttribute("data-reported-comment-card", "RCO-711");
    });

    test("24. combined filter + search: Pending + 'RCO' → 2 แถว", async ({ page }) => {
      await goToReportedComments(page);
      await page.locator("#reported-comment-search").fill("RCO");
      await pickReportedCommentCustomOption(page, "reported-comment-status-filter", "Pending");
      await expect(page.locator(".user-row.reported-comment-row:not(.head)")).toHaveCount(2);
    });
  });

  // ==================== E. RESET ====================

  test.describe("Reported Comments List — reset", () => {
    test("25. รีเซ็ตเคลียร์ search + filter + sort กลับค่า default", async ({ page }) => {
      await goToReportedComments(page);
      await page.locator("#reported-comment-search").fill("RCO-");
      await pickReportedCommentCustomOption(page, "reported-comment-status-filter", "Pending");
      await pickReportedCommentCustomOption(page, "reported-comment-priority-filter", "high");
      await pickReportedCommentCustomOption(page, "reported-comment-sort", "reporters");
      await clickReportedCommentReset(page);
      await expect(page.locator("#reported-comment-search")).toHaveValue("");
      await expect(page.locator("#reported-comment-status-filter")).toHaveValue("");
      await expect(page.locator("#reported-comment-priority-filter")).toHaveValue("");
      await expect(page.locator("#reported-comment-sort")).toHaveValue("latest");
      await expect(page.locator(".user-row.reported-comment-row:not(.head)")).toHaveCount(3);
    });
  });

  // ==================== F. ROW CLICK + ROW MENU ====================

  test.describe("Reported Comments List — row click + row menu", () => {
    test("26. คลิกแถวเปิด Comment Report Detail ถูกเคส (RCO-711)", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      await expect(page.locator("#page-title")).toHaveText("Report Detail");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Asset Management / Report Detail / RCO-711");
    });

    test("27. row menu ดูรายละเอียดได้ → เปิด detail ถูกเคส", async ({ page }) => {
      await goToReportedComments(page);
      await openReportedCommentRowMenu(page, "RCO-706");
      await page.locator(`.user-row.reported-comment-row[data-reported-comment-card='RCO-706'] button[data-reported-comment-open='RCO-706']`).click();
      await page.waitForTimeout(300);
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Asset Management / Report Detail / RCO-706");
    });

    test("28. row menu ของ RCO-711 (Pending, Visible) มี: ดูรายละเอียด + ปิดรายงาน + ซ่อนชั่วคราว + ซ่อนถาวร", async ({ page }) => {
      await goToReportedComments(page);
      await openReportedCommentRowMenu(page, "RCO-711");
      const menu = page.locator(`.user-row.reported-comment-row[data-reported-comment-card='RCO-711'] .row-menu-list`);
      await expect(menu.locator("button[data-reported-comment-open='RCO-711']")).toHaveText("ดูรายละเอียด");
      await expect(menu.locator("button[data-reported-comment-action='Close no violation']")).toHaveText("ปิดรายงาน");
      await expect(menu.locator("button[data-reported-comment-action='Hide comment']")).toHaveText("ซ่อนชั่วคราว");
      await expect(menu.locator("button[data-reported-comment-action='Remove comment']")).toHaveText("ซ่อนถาวร");
    });

    test("29. row menu ของ RCO-690 (Closed) มีแค่ ดูรายละเอียด (ไม่มี action)", async ({ page }) => {
      await goToReportedComments(page);
      await openReportedCommentRowMenu(page, "RCO-690");
      const menu = page.locator(`.user-row.reported-comment-row[data-reported-comment-card='RCO-690'] .row-menu-list`);
      await expect(menu.locator("button[data-reported-comment-open='RCO-690']")).toBeVisible();
      await expect(menu.locator("button[data-reported-comment-action]")).toHaveCount(0);
    });

    test("30. row menu action เปิด modal ได้ (Hide comment จาก list)", async ({ page }) => {
      await goToReportedComments(page);
      await openReportedCommentRowMenu(page, "RCO-711");
      await page.locator(`.user-row.reported-comment-row[data-reported-comment-card='RCO-711'] button[data-reported-comment-action='Hide comment']`).click();
      await page.waitForTimeout(300);
      await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal-title")).toHaveText("ซ่อนความคิดเห็นชั่วคราว");
    });
  });

  // ==================== G. COMMENT REPORT DETAIL — SECTIONS ====================

  test.describe("Comment Report Detail — sections, context, linked entities", () => {
    test("31. head + chips + breadcrumb + back button ถูกต้อง (RCO-711)", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      await expect(page.locator(".asset-report-heading")).toContainText("RCO-711");
      await expect(page.locator(".report-detail-page .chips .pill").first()).toHaveText("Pending");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Asset Management / Report Detail / RCO-711");
      await expect(page.locator("#panel-title")).toContainText("bit.ly/superdeal");
      await expect(page.locator("#panel-subtitle")).toContainText("RCO-711");
      await expect(page.locator("#panel-subtitle")).toContainText("COM-711");
      await expect(page.locator("#panel-subtitle")).toContainText("AST-8802");
      await expect(page.locator("#panel-subtitle")).toContainText("reporter identity masked");
      await expect(page.locator("[data-back-to-reported-comments-list]")).toBeVisible();
    });

    test("32. section Reported Comment แสดง Report ID / Comment ID / Asset ID / Asset Name / Asset Status / Created At + View Asset button", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      const section = page.locator(".reported-comment-detail-page .detail-section").filter({ has: page.locator("h4:text-is('Reported Comment')") });
      await expect(section).toBeVisible();
      const grid = section.locator(".report-reference-grid");
      await expect(grid.locator(".detail-tile").filter({ hasText: "Report ID" })).toContainText("RCO-711");
      await expect(grid.locator(".detail-tile").filter({ hasText: "Comment ID" })).toContainText("COM-711");
      await expect(grid.locator(".detail-tile").filter({ hasText: "Asset ID" })).toContainText("AST-8802");
      await expect(grid.locator(".detail-tile").filter({ hasText: "Asset Name" })).toContainText("Omega Speedmaster");
      await expect(grid.locator(".detail-tile").filter({ hasText: "Asset Status" })).toBeVisible();
      await expect(grid.locator(".detail-tile").filter({ hasText: "Created At" })).toBeVisible();
      await expect(section.locator("button[data-asset-report-detail-modal='AST-8802']")).toBeVisible();
    });

    test("33. section Comment Detail แสดง Comment Type / Author / Comment Text + View all comments button", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      const section = page.locator(".reported-comment-detail-page .detail-section").filter({ has: page.locator("h4:text-is('Comment Detail')") });
      await expect(section).toBeVisible();
      await expect(section.locator(".detail-tile").filter({ hasText: "Comment Type" })).toContainText("Root comment");
      await expect(section.locator(".detail-tile").filter({ hasText: "Author" })).toContainText("Omega Club TH");
      await expect(section.locator(".comment-full-text")).toContainText("bit.ly/superdeal");
      await expect(section.locator("button[data-asset-comments-modal='AST-8802']")).toBeVisible();
    });

    test("34. Reporter History table แสดงครบ (RCO-711: 3 reporters)", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      const section = page.locator(".reported-comment-detail-page .detail-section").filter({ has: page.locator("h4:text-is('Reporter History')") });
      await expect(section).toBeVisible();
      const table = section.locator(".history-table");
      if (page.viewportSize().width > 760) {
        for (const th of ["วันที่ / เวลา", "Reporter", "Status", "Report Reason", "Additional Details"]) {
          await expect(table.locator("thead th").filter({ hasText: th })).toBeVisible();
        }
      }
      await expect(table.locator("tbody tr")).toHaveCount(3);
    });

    test("35. Admin Action History table แสดงครบ (RCO-711: 1 entry — Report Received)", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      const section = page.locator(".reported-comment-detail-page .detail-section").filter({ has: page.locator("h4:text-is('Admin Action History')") });
      await expect(section).toBeVisible();
      const table = section.locator(".history-table");
      if (page.viewportSize().width > 760) {
        for (const th of ["วันที่ / เวลา", "ผู้ดำเนินการ", "Action", "ส่งอีเมล", "รายละเอียด"]) {
          await expect(table.locator("thead th").filter({ hasText: th })).toBeVisible();
        }
      }
      await expect(table.locator("tbody tr")).toHaveCount(1);
      await expect(table.locator("tbody tr").first()).toContainText("รับรายงานความคิดเห็น");
    });

    test("36. RCO-690 (Closed) มี 2 audit entries (Report Received + Close no violation)", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-690");
      const table = page.locator(".reported-comment-detail-page .history-table").last();
      await expect(table.locator("tbody tr")).toHaveCount(2);
    });

    test("37. RCO-711 (Pending, Visible) มี 3 action buttons: ปิดรายงาน + ซ่อนชั่วคราว + ซ่อนถาวร", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      const actions = page.locator(".reported-comment-detail-page .user-detail-actions");
      await expect(actions.locator("button[data-reported-comment-action='Close no violation']")).toHaveText("ปิดรายงาน");
      await expect(actions.locator("button[data-reported-comment-action='Hide comment']")).toHaveText("ซ่อนชั่วคราว");
      await expect(actions.locator("button[data-reported-comment-action='Remove comment']")).toHaveText("ซ่อนถาวร");
      await expect(actions.locator("button")).toHaveCount(3);
    });

    test("38. RCO-690 (Closed) ไม่มี action buttons", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-690");
      await expect(page.locator(".reported-comment-detail-page .user-detail-actions")).toHaveCount(0);
    });
  });

  // ==================== H. VIEW ASSET MODAL + VIEW ALL COMMENTS MODAL ====================

  test.describe("Comment Report Detail — View Asset modal + View all comments modal", () => {
    test("39. View Asset modal เปิดได้ แสดง asset preview + description + specifications", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      await page.locator("button[data-asset-report-detail-modal='AST-8802']").click();
      await page.waitForTimeout(300);
      const modal = page.locator("#user-action-modal");
      await expect(modal).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal-title")).toContainText("AST-8802");
      await expect(page.locator("#user-action-modal-title")).toContainText("Omega Speedmaster");
      await expect(modal.locator(".asset-fo-preview")).toBeVisible();
      await expect(modal.locator("h4").filter({ hasText: "Description" })).toBeVisible();
      await expect(modal.locator("h4").filter({ hasText: "Specifications" })).toBeVisible();
    });

    test("40. View Asset modal ปิดได้ด้วยปุ่มปิด", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      await page.locator("button[data-asset-report-detail-modal='AST-8802']").click();
      await page.waitForTimeout(300);
      await page.locator("#user-action-modal button[data-user-action-modal-close]").first().click();
      await page.waitForTimeout(200);
      await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    });

    test("41. View all comments modal เปิดได้ แสดง comment list", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      await page.locator("button[data-asset-comments-modal='AST-8802']").click();
      await page.waitForTimeout(300);
      const modal = page.locator("#user-action-modal");
      await expect(modal).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal-title")).toHaveText("Comments");
      await expect(modal.locator(".asset-comment-dense-list")).toBeVisible();
    });

    test("42. View all comments modal ปิดได้ด้วยปุ่มปิด", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      await page.locator("button[data-asset-comments-modal='AST-8802']").click();
      await page.waitForTimeout(300);
      await page.locator("#user-action-modal button[data-user-action-modal-close]").first().click();
      await page.waitForTimeout(200);
      await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    });
  });

  // ==================== I. MODERATION ACTIONS — MODAL STRUCTURE ====================

  test.describe("Moderation actions — modal structure", () => {
    test("43. เปิด modal Hide comment: title/target/reason/note/impact/email/confirm ครบ", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Hide comment']").click();
      await page.waitForTimeout(300);
      const modal = page.locator("#user-action-modal");
      await expect(modal).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal-title")).toHaveText("ซ่อนความคิดเห็นชั่วคราว");
      await expect(modal.locator(".reported-comment-action-target")).toContainText("RCO-711");
      await expect(modal.locator(".reported-comment-action-comment-text")).toContainText("bit.ly/superdeal");
      // reason select มี 4 options
      await expect(page.locator("div[data-custom-select]:has(> #reported-comment-action-reason) [data-custom-select-option]")).toHaveCount(4);
      await expect(page.locator("#reported-comment-action-note")).toBeVisible();
      await expect(modal.locator("[data-reported-comment-action-confirm='Hide comment']")).toBeVisible();
      await expect(modal.locator(".user-action-impact").first()).toContainText("ผลกระทบ");
      await expect(modal.locator("[data-reported-comment-action-email-preview]")).toBeVisible();
    });

    test("44. เปิด modal Remove comment: title/target/reason/note/impact/email/confirm ครบ", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Remove comment']").click();
      await page.waitForTimeout(300);
      const modal = page.locator("#user-action-modal");
      await expect(modal).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal-title")).toHaveText("ซ่อนความคิดเห็นถาวร");
      await expect(modal.locator(".reported-comment-action-target")).toContainText("RCO-711");
      // reason select มี 3 options
      await expect(page.locator("div[data-custom-select]:has(> #reported-comment-action-reason) [data-custom-select-option]")).toHaveCount(3);
      await expect(page.locator("#reported-comment-action-note")).toBeVisible();
      await expect(modal.locator("[data-reported-comment-action-confirm='Remove comment']")).toBeVisible();
      await expect(modal.locator(".user-action-impact").first()).toContainText("ผลกระทบ");
      await expect(modal.locator("[data-reported-comment-action-email-preview]")).toBeVisible();
    });

    test("45. เปิด modal Close no violation: title/target/reason/note/impact/confirm ครบ (ไม่มี email)", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Close no violation']").click();
      await page.waitForTimeout(300);
      const modal = page.locator("#user-action-modal");
      await expect(modal).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal-title")).toHaveText("ยืนยันการปิดรายงาน");
      await expect(modal.locator(".reported-comment-action-target")).toContainText("RCO-711");
      // reason select มี 4 options
      await expect(page.locator("div[data-custom-select]:has(> #reported-comment-action-reason) [data-custom-select-option]")).toHaveCount(4);
      await expect(page.locator("#reported-comment-action-note")).toBeVisible();
      await expect(modal.locator("[data-reported-comment-action-confirm='Close no violation']")).toBeVisible();
      await expect(modal.locator(".user-action-impact").first()).toContainText("ผลกระทบ");
      // Close no violation ไม่มี email preview และไม่มี email note
      await expect(modal.locator("[data-reported-comment-action-email-preview]")).toHaveCount(0);
    });

    test("46. ยกเลิก modal → ปิดโดยไม่เปลี่ยนสถานะ", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Hide comment']").click();
      await page.waitForTimeout(200);
      await page.locator("#user-action-modal button[data-user-action-modal-close]").last().click();
      await page.waitForTimeout(200);
      await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
      await expect(page.locator(".report-detail-page .chips .pill").first()).toHaveText("Pending");
    });

    test("47. confirm button class: Hide = warning, Remove = danger, Close = primary", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      // Hide comment
      await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Hide comment']").click();
      await page.waitForTimeout(200);
      await expect(page.locator("[data-reported-comment-action-confirm='Hide comment']")).toHaveClass(/warning/);
      await page.locator("#user-action-modal button[data-user-action-modal-close]").last().click();
      await page.waitForTimeout(200);
      // Remove comment
      await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Remove comment']").click();
      await page.waitForTimeout(200);
      await expect(page.locator("[data-reported-comment-action-confirm='Remove comment']")).toHaveClass(/danger/);
      await page.locator("#user-action-modal button[data-user-action-modal-close]").last().click();
      await page.waitForTimeout(200);
      // Close no violation
      await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Close no violation']").click();
      await page.waitForTimeout(200);
      await expect(page.locator("[data-reported-comment-action-confirm='Close no violation']")).toHaveClass(/primary/);
    });
  });

  // ==================== J. MODERATION ACTIONS — CONFIRM FLOW ====================

  test.describe("Moderation actions — confirm flow", () => {
    test("48. ยืนยัน Hide comment → commentStatus Hidden + toast + audit เพิ่ม + report ยัง Pending", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      const auditBefore = await page.locator(".reported-comment-detail-page .history-table").last().locator("tbody tr").count();
      await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Hide comment']").click();
      await page.waitForTimeout(200);
      await page.locator("#user-action-modal [data-reported-comment-action-confirm='Hide comment']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toHaveClass(/show/);
      await expect(page.locator("#success-toast")).toContainText("RCO-711");
      // comment status เปลี่ยนเป็น Hidden (amber "ซ่อนชั่วคราว") — second pill in chips
      await expect(page.locator(".report-detail-page .chips .pill").nth(1)).toHaveClass(/amber/);
      await expect(page.locator(".report-detail-page .chips .pill").nth(1)).toHaveText("ซ่อนชั่วคราว");
      // report status ยัง Pending (first pill)
      await expect(page.locator(".report-detail-page .chips .pill").first()).toHaveText("Pending");
      // audit เพิ่ม 1 แถว
      const auditAfter = await page.locator(".reported-comment-detail-page .history-table").last().locator("tbody tr").count();
      expect(auditAfter).toBe(auditBefore + 1);
    });

    test("49. หลัง Hide comment → action buttons เปลี่ยนเป็น Restore + Remove (ไม่มี Close/Hide)", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Hide comment']").click();
      await page.waitForTimeout(200);
      await page.locator("#user-action-modal [data-reported-comment-action-confirm='Hide comment']").click();
      await page.waitForTimeout(400);
      const actions = page.locator(".reported-comment-detail-page .user-detail-actions");
      await expect(actions.locator("button[data-reported-comment-action='Restore comment']")).toHaveText("ยกเลิกการซ่อนชั่วคราว");
      await expect(actions.locator("button[data-reported-comment-action='Remove comment']")).toHaveText("ซ่อนถาวร");
      await expect(actions.locator("button[data-reported-comment-action='Close no violation']")).toHaveCount(0);
      await expect(actions.locator("button[data-reported-comment-action='Hide comment']")).toHaveCount(0);
    });

    test("50. ยืนยัน Remove comment → commentStatus Removed + status Closed + toast + audit เพิ่ม", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-706");
      const auditBefore = await page.locator(".reported-comment-detail-page .history-table").last().locator("tbody tr").count();
      await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Remove comment']").click();
      await page.waitForTimeout(200);
      await page.locator("#user-action-modal [data-reported-comment-action-confirm='Remove comment']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toHaveClass(/show/);
      await expect(page.locator("#success-toast")).toContainText("RCO-706");
      // comment status เปลี่ยนเป็น Removed (red "ซ่อนถาวร")
      await expect(page.locator(".report-detail-page .chips .pill.red")).toHaveText("ซ่อนถาวร");
      // report status เปลี่ยนเป็น Closed (green)
      await expect(page.locator(".report-detail-page .chips .pill").first()).toHaveClass(/green/);
      await expect(page.locator(".report-detail-page .chips .pill").first()).toHaveText("Closed");
      // audit เพิ่ม 1 แถว
      const auditAfter = await page.locator(".reported-comment-detail-page .history-table").last().locator("tbody tr").count();
      expect(auditAfter).toBe(auditBefore + 1);
    });

    test("51. ยืนยัน Close no violation → status Closed + toast + audit เพิ่ม (ไม่เปลี่ยน comment status)", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-706");
      const auditBefore = await page.locator(".reported-comment-detail-page .history-table").last().locator("tbody tr").count();
      await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Close no violation']").click();
      await page.waitForTimeout(200);
      await page.locator("#user-action-modal [data-reported-comment-action-confirm='Close no violation']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toHaveClass(/show/);
      await expect(page.locator("#success-toast")).toContainText("RCO-706");
      // report status เปลี่ยนเป็น Closed (green)
      await expect(page.locator(".report-detail-page .chips .pill").first()).toHaveClass(/green/);
      await expect(page.locator(".report-detail-page .chips .pill").first()).toHaveText("Closed");
      // ไม่มี comment status pill (Visible = ไม่แสดง pill)
      await expect(page.locator(".report-detail-page .chips .pill.amber")).toHaveCount(0);
      await expect(page.locator(".report-detail-page .chips .pill.red")).toHaveCount(0);
      // audit เพิ่ม 1 แถว
      const auditAfter = await page.locator(".reported-comment-detail-page .history-table").last().locator("tbody tr").count();
      expect(auditAfter).toBe(auditBefore + 1);
    });

    test("52. ยืนยัน Restore comment (หลัง Hide) → commentStatus Visible + status Closed + toast + audit เพิ่ม", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      // Hide ก่อน
      await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Hide comment']").click();
      await page.waitForTimeout(200);
      await page.locator("#user-action-modal [data-reported-comment-action-confirm='Hide comment']").click();
      await page.waitForTimeout(400);
      // ตอนนี้ commentStatus = Hidden, status = Pending — 2 pills: amber "Pending" + amber "ซ่อนชั่วคราว"
      await expect(page.locator(".report-detail-page .chips .pill").nth(1)).toHaveClass(/amber/);
      await expect(page.locator(".report-detail-page .chips .pill").nth(1)).toHaveText("ซ่อนชั่วคราว");
      // Restore
      const auditBefore = await page.locator(".reported-comment-detail-page .history-table").last().locator("tbody tr").count();
      await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Restore comment']").click();
      await page.waitForTimeout(200);
      await expect(page.locator("#user-action-modal-title")).toHaveText("ยกเลิกการซ่อนชั่วคราว");
      await page.locator("#user-action-modal [data-reported-comment-action-confirm='Restore comment']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toHaveClass(/show/);
      await expect(page.locator("#success-toast")).toContainText("RCO-711");
      // report status เปลี่ยนเป็น Closed (green)
      await expect(page.locator(".report-detail-page .chips .pill").first()).toHaveClass(/green/);
      await expect(page.locator(".report-detail-page .chips .pill").first()).toHaveText("Closed");
      // ไม่มี comment status pill (Visible = ไม่แสดง pill)
      await expect(page.locator(".report-detail-page .chips .pill.amber")).toHaveCount(0);
      // audit เพิ่ม 1 แถว
      const auditAfter = await page.locator(".reported-comment-detail-page .history-table").last().locator("tbody tr").count();
      expect(auditAfter).toBe(auditBefore + 1);
    });

    test("53. หลัง Remove comment → ไม่มี action buttons (Closed)", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-706");
      await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Remove comment']").click();
      await page.waitForTimeout(200);
      await page.locator("#user-action-modal [data-reported-comment-action-confirm='Remove comment']").click();
      await page.waitForTimeout(400);
      await expect(page.locator(".reported-comment-detail-page .user-detail-actions")).toHaveCount(0);
    });

    test("54. หลัง Close no violation → ไม่มี action buttons (Closed)", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-706");
      await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Close no violation']").click();
      await page.waitForTimeout(200);
      await page.locator("#user-action-modal [data-reported-comment-action-confirm='Close no violation']").click();
      await page.waitForTimeout(400);
      await expect(page.locator(".reported-comment-detail-page .user-detail-actions")).toHaveCount(0);
    });
  });

  // ==================== K. ACTION FROM LIST CONTEXT ====================

  test.describe("Moderation actions — from list context", () => {
    test("55. ยืนยัน Hide comment จาก list row menu → list re-render + row status pill เปลี่ยน", async ({ page }) => {
      await goToReportedComments(page);
      await openReportedCommentRowMenu(page, "RCO-711");
      await page.locator(`.user-row.reported-comment-row[data-reported-comment-card='RCO-711'] button[data-reported-comment-action='Hide comment']`).click();
      await page.waitForTimeout(300);
      await page.locator("#user-action-modal [data-reported-comment-action-confirm='Hide comment']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toHaveClass(/show/);
      // กลับที่ list — row ยังแสดง และมี comment status pill "ซ่อนชั่วคราว" ใน user-card-tags
      const row = page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-711']");
      await expect(row).toBeVisible();
      await expect(row.locator(".user-card-tags .pill.amber").last()).toHaveText("ซ่อนชั่วคราว");
    });

    test("56. ยืนยัน Close no violation จาก list row menu → row status pill เปลี่ยนเป็น Closed", async ({ page }) => {
      await goToReportedComments(page);
      await openReportedCommentRowMenu(page, "RCO-706");
      await page.locator(`.user-row.reported-comment-row[data-reported-comment-card='RCO-706'] button[data-reported-comment-action='Close no violation']`).click();
      await page.waitForTimeout(300);
      await page.locator("#user-action-modal [data-reported-comment-action-confirm='Close no violation']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toHaveClass(/show/);
      const row = page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-706']");
      await expect(row.locator("div[data-label='Status'] .pill.green")).toHaveText("Closed");
    });
  });

  // ==================== L. ERROR SCENARIOS ====================

  test.describe("Moderation actions — error scenarios", () => {
    test("57. scenario invalid_state → modal แสดง error และสถานะไม่เปลี่ยน", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Hide comment']").click();
      await page.waitForTimeout(200);
      await setActionScenario(page, "invalid_state");
      await page.locator("#user-action-modal [data-reported-comment-action-confirm='Hide comment']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal .user-action-result")).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal .user-action-result")).toContainText("ไม่สามารถ");
      await expect(page.locator(".report-detail-page .chips .pill").first()).toHaveText("Pending");
    });

    test("58. scenario stale_data → modal แสดง error", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Remove comment']").click();
      await page.waitForTimeout(200);
      await setActionScenario(page, "stale_data");
      await page.locator("#user-action-modal [data-reported-comment-action-confirm='Remove comment']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#user-action-modal .user-action-result")).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal .user-action-result")).toContainText("เปลี่ยนแปลง");
    });

    test("59. scenario policy_blocked → modal แสดง error", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Close no violation']").click();
      await page.waitForTimeout(200);
      await setActionScenario(page, "policy_blocked");
      await page.locator("#user-action-modal [data-reported-comment-action-confirm='Close no violation']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#user-action-modal .user-action-result")).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal .user-action-result")).toContainText("ยังไม่สามารถ");
    });
  });

  // ==================== M. EMAIL PREVIEW ====================

  test.describe("Moderation actions — email preview", () => {
    test("60. email preview ของ Hide comment แสดง subject + message + อัปเดตตาม reason", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Hide comment']").click();
      await page.waitForTimeout(300);
      const preview = page.locator("[data-reported-comment-action-email-preview]");
      await expect(preview).toBeVisible();
      // ขยาย details
      await preview.locator("summary").click();
      await page.waitForTimeout(200);
      await expect(preview.locator("[data-email-preview-subject]")).toContainText("ซ่อนชั่วคราว");
      await expect(preview.locator("[data-email-preview-message]")).toBeVisible();
      // เปลี่ยน reason → email preview อัปเดต
      const reasonSelect = page.locator("div[data-custom-select]:has(> #reported-comment-action-reason)");
      await reasonSelect.locator("[data-custom-select-trigger]").click();
      await page.waitForTimeout(150);
      await page.locator("div[data-custom-select]:has(> #reported-comment-action-reason) [data-custom-select-option]:nth-child(2)").click();
      await page.waitForTimeout(300);
      await expect(preview.locator("[data-email-preview-message]")).toContainText("เหตุผลการดำเนินการ");
    });

    test("61. email note แสดง author email (Hide comment)", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Hide comment']").click();
      await page.waitForTimeout(300);
      const modal = page.locator("#user-action-modal");
      await expect(modal.locator(".user-action-impact-notice")).toContainText("แจ้งผู้ใช้");
      await expect(modal.locator(".user-action-impact-notice")).toContainText("registered author email");
    });

    test("62. Close no violation ไม่มี email note และไม่มี email preview", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Close no violation']").click();
      await page.waitForTimeout(300);
      const modal = page.locator("#user-action-modal");
      await expect(modal.locator(".user-action-impact-notice")).toHaveCount(0);
      await expect(modal.locator("[data-reported-comment-action-email-preview]")).toHaveCount(0);
    });

    test("63. Restore comment มี email preview และ email note", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      // Hide ก่อน
      await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Hide comment']").click();
      await page.waitForTimeout(200);
      await page.locator("#user-action-modal [data-reported-comment-action-confirm='Hide comment']").click();
      await page.waitForTimeout(400);
      // Restore
      await page.locator(".reported-comment-detail-page button[data-reported-comment-action='Restore comment']").click();
      await page.waitForTimeout(300);
      const modal = page.locator("#user-action-modal");
      await expect(modal.locator(".user-action-impact-notice")).toContainText("แจ้งผู้ใช้");
      await expect(modal.locator("[data-reported-comment-action-email-preview]")).toBeVisible();
    });
  });

  // ==================== N. BACK NAVIGATION + CONTEXT ====================

  test.describe("Comment Report Detail — back navigation + context", () => {
    test("64. back จาก Report Detail กลับ Reported Comments ได้", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      await page.locator("[data-back-to-reported-comments-list]").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Reported Comments");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Asset Management / Reported Comments");
      await expect(page.locator(".user-row.reported-comment-row:not(.head)")).toHaveCount(3);
    });

    test("65. back จาก Report Detail กลับ Reported Comments และ context (search+filter) ยังอยู่", async ({ page }) => {
      await goToReportedComments(page);
      await page.locator("#reported-comment-search").fill("RCO");
      await pickReportedCommentCustomOption(page, "reported-comment-status-filter", "Pending");
      const countBefore = await page.locator(".user-row.reported-comment-row:not(.head)").count();
      await openCommentReportDetailByRowClick(page, "RCO-711");
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Report Detail");
      await page.locator("[data-back-to-reported-comments-list]").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Reported Comments");
      await expect(page.locator("#reported-comment-search")).toHaveValue("RCO");
      await expect(page.locator("#reported-comment-status-filter")).toHaveValue("Pending");
      await expect(page.locator(".user-row.reported-comment-row:not(.head)")).toHaveCount(countBefore);
    });

    test("66. ปิด View Asset modal แล้วยังอยู่ที่ Report Detail ได้", async ({ page }) => {
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      await page.locator("button[data-asset-report-detail-modal='AST-8802']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
      await page.locator("#user-action-modal button[data-user-action-modal-close]").first().click();
      await page.waitForTimeout(200);
      await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
      // ยังอยู่ที่ Report Detail
      await expect(page.locator("#page-title")).toHaveText("Report Detail");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Asset Management / Report Detail / RCO-711");
    });
  });

  // ==================== O. MOBILE CARD (≤760px) ====================

  test.describe("Reported Comments — mobile card (≤760px)", () => {
    test("67. mobile 390px: card แสดง metadata ครบ (comment/asset/reason/reported at)", async ({ page }) => {
      test.skip(page.viewportSize().width > 760, "mobile only");
      await goToReportedComments(page);
      const row = page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-711']");
      await expect(row.locator(".user-card-tags")).toBeVisible();
      const meta = row.locator(".user-card-meta");
      await expect(meta).toBeVisible();
      await expect(meta.locator(".user-card-meta-item").nth(0)).toContainText("bit.ly/superdeal");
      await expect(meta.locator(".user-card-meta-item").nth(1)).toContainText("AST-8802");
      await expect(row.locator(".report-reason-meta")).toContainText("Report reason");
    });

    test("68. mobile 390px: status pill + reporters tag + priority pill แสดงถูกต้อง", async ({ page }) => {
      test.skip(page.viewportSize().width > 760, "mobile only");
      await goToReportedComments(page);
      const row = page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-711']");
      await expect(row.locator(".user-card-tags .pill").first()).toHaveText("Pending");
      await expect(row.locator(".user-card-tag.asset-tag")).toHaveText("3 reporters");
      await expect(row.locator(".user-card-tags .pill.red")).toHaveText("High");
    });

    test("69. mobile 390px: comment status pill แสดง (RCO-690 'ลบโดยเจ้าของ')", async ({ page }) => {
      test.skip(page.viewportSize().width > 760, "mobile only");
      await goToReportedComments(page);
      const row = page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-690']");
      await expect(row.locator(".user-card-tags .pill.gray")).toHaveText("ลบโดยเจ้าของ");
    });

    test("70. desktop 1440px: ตารางแสดงคอลัมน์ครบ 7 คอลัมน์ ไม่แสดง mobile card", async ({ page }) => {
      test.skip(page.viewportSize().width <= 760, "desktop only");
      await goToReportedComments(page);
      const head = page.locator(".user-row.reported-comment-row.head");
      for (const label of ["Report ID", "Comment", "Asset", "Status", "Reason", "Priority", "Action"]) {
        await expect(head.locator(`div:text-is("${label}")`)).toBeVisible();
      }
      const row = page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-711']");
      await expect(row.locator(".user-card-tags")).toBeHidden();
      await expect(row.locator("div[data-label='Comment']")).toBeVisible();
    });

    test("71. mobile 390px: filter toggle เปิด/ปิด filter bar ได้", async ({ page }) => {
      test.skip(page.viewportSize().width > 760, "mobile only");
      await goToReportedComments(page);
      const bar = page.locator(".user-filter-bar.report-mode");
      await expect(bar).toHaveAttribute("data-filter-open", "false");
      await page.locator("[data-reported-comment-filter-toggle]").click();
      await page.waitForTimeout(200);
      await expect(bar).toHaveAttribute("data-filter-open", "true");
      await expect(page.locator("#reported-comment-status-filter").locator("xpath=ancestor::div[@data-custom-select]")).toBeVisible();
      await page.locator("[data-reported-comment-filter-toggle]").click();
      await page.waitForTimeout(200);
      await expect(bar).toHaveAttribute("data-filter-open", "false");
    });

    test("72. mobile 390px: row click เปิด detail ได้", async ({ page }) => {
      test.skip(page.viewportSize().width > 760, "mobile only");
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      await expect(page.locator("#page-title")).toHaveText("Report Detail");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Asset Management / Report Detail / RCO-711");
    });

    test("73. mobile 390px: detail page แสดงทุก section (responsive)", async ({ page }) => {
      test.skip(page.viewportSize().width > 760, "mobile only");
      await goToReportedComments(page);
      await openCommentReportDetailByRowClick(page, "RCO-711");
      const texts = await page.locator(".reported-comment-detail-page .detail-section h4").allTextContents();
      expect(texts).toContain("Reported Comment");
      expect(texts).toContain("Comment Detail");
      expect(texts).toContain("Reporter History");
      expect(texts).toContain("Admin Action History");
    });
  });

  // ==================== P. COMMENT HOVER TOOLTIP (desktop) ====================

  test.describe("Reported Comments — comment hover tooltip (desktop)", () => {
    test("74. desktop: hover comment cell แสดง tooltip ด้วย full text", async ({ page }) => {
      test.skip(page.viewportSize().width <= 760, "desktop only — tooltip ใช้ในตาราง desktop");
      await goToReportedComments(page);
      const cell = page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-711'] div[data-label='Comment']");
      await cell.hover();
      await page.waitForTimeout(300);
      const tooltip = page.locator(".comment-hover-tooltip.is-visible");
      await expect(tooltip).toBeVisible();
      const fullText = await cell.getAttribute("data-comment-full");
      await expect(tooltip).toHaveText(fullText);
    });
  });
});
