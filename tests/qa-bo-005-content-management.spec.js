// QA-BO-005: Content Management (Articles, Categories) — strict Playwright spec
// e4 (FO-BO-001, 2026-11-03): Reported Articles + Board Report Detail ถูกถอดจาก V1 ทั้งระบบ — เคสที่เกี่ยวถูกถอดตาม
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

// helper: ไปหน้า Articles ผ่านเมนู (Content Management → Articles)
async function goToArticles(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  const parent = page.locator(".nav-item[data-module='content']");
  const expanded = await parent.evaluate(el => el.classList.contains("expanded")).catch(() => false);
  if (!expanded) await parent.click();
  await page.waitForTimeout(200);
  await page.locator(".submenu[data-submenu='content'] button[data-sub='Articles']").click();
  await page.waitForTimeout(300);
}

// helper: ไปหน้า Categories ผ่านเมนู
async function goToCategories(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  const parent = page.locator(".nav-item[data-module='content']");
  const expanded = await parent.evaluate(el => el.classList.contains("expanded")).catch(() => false);
  if (!expanded) await parent.click();
  await page.waitForTimeout(200);
  await page.locator(".submenu[data-submenu='content'] button[data-sub='Categories']").click();
  await page.waitForTimeout(300);
}

// helper: เปิด filter bar ถ้ายังปิด (advanced filter ถูกซ่อนเมื่อ data-filter-open="false")
async function openFilterBar(page, mode) {
  const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
  if (!isMobile) return;
  const toggleAttr = mode === "article" ? "[data-article-filter-toggle]"
    : "[data-category-filter-toggle]";
  const barClass = mode === "article" ? ".user-filter-bar.content-mode"
    : ".user-filter-bar.category-mode";
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

// helper: คลิกแถวบทความเพื่อเปิด detail (คลิก primary cell)
async function openArticleDetailByRowClick(page, articleId) {
  await page.locator(`.asset-row[data-article-card="${articleId}"] .asset-cell-primary`).click();
  await page.waitForTimeout(300);
}

// helper: เปิด row menu ของ article
async function openArticleRowMenu(page, articleId) {
  await page.locator(`.asset-row[data-article-card="${articleId}"] .row-menu > summary`).click();
  await page.waitForTimeout(200);
}

// helper: เปิด row menu ของ category
async function openCategoryRowMenu(page, categoryId) {
  await page.locator(`.asset-row[data-category-card="${categoryId}"] .row-menu > summary`).click();
  await page.waitForTimeout(200);
}

// helper: ปิด row menu ที่ค้าง
async function closeRowMenus(page) {
  await page.locator("body").click({ position: { x: 5, y: 5 } });
  await page.waitForTimeout(150);
}

// helper: กดปุ่มรีเซ็ตค่าทั้งหมด — เลือกปุ่มที่ visible
async function clickResetButton(page, attr) {
  await page.locator(`[${attr}]:visible`).first().click();
  await page.waitForTimeout(300);
}

// helper: เลือก scenario ใน action modal (ผ่าน evaluate เพราะ custom-select silent)
async function setActionScenario(page, selectId, scenario) {
  await page.evaluate(({ id, s }) => {
    const input = document.querySelector(`#${id}`);
    if (input) input.value = s;
  }, { id: selectId, s: scenario });
}

test.describe("QA-BO-005: Content Management (Articles, Categories) (strict)", () => {

  // ==================== A. NAVIGATION / MENU / ACTIVE STATE ====================

  test.describe("Navigation — menu entry, submenu, active state", () => {
    test("1. Content Management menu กาง submenu ได้ มี Articles, Categories", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await ensureNavOpen(page);
      await page.locator(".nav-item[data-module='content']").click();
      await page.waitForTimeout(200);
      const submenu = page.locator(".submenu[data-submenu='content']");
      await expect(submenu).toHaveClass(/open/);
      await expect(submenu.locator("button[data-sub='Articles']")).toBeVisible();
      await expect(submenu.locator("button[data-sub='Categories']")).toBeVisible();
      // e4: Reported Articles ถูกถอด — submenu ต้องไม่มี entry นี้
      await expect(submenu.locator("button[data-sub='Reported Articles']")).toHaveCount(0);
    });

    test("2. เข้า Articles: page title + breadcrumb + panel title ถูกต้อง", async ({ page }) => {
      await goToArticles(page);
      await expect(page.locator("#page-title")).toHaveText("Articles");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Content Management / Articles");
      await expect(page.locator("#panel-title")).toHaveText("ARTICLE LIST");
    });

    test("3. เข้า Categories: page title + breadcrumb + panel title ถูกต้อง", async ({ page }) => {
      await goToCategories(page);
      await expect(page.locator("#page-title")).toHaveText("Categories");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Content Management / Categories");
      await expect(page.locator("#panel-title")).toHaveText("CATEGORY LIST");
    });

    test("5. active state สลับถูกต้องเมื่อสลับหน้า", async ({ page }) => {
      await goToArticles(page);
      await ensureNavOpen(page);
      await page.locator(".submenu[data-submenu='content'] button[data-sub='Categories']").click();
      await page.waitForTimeout(300);
      await expect(page.locator(".submenu[data-submenu='content'] button[data-sub='Categories']")).toHaveClass(/active/);
      await ensureNavOpen(page);
      await page.locator(".submenu[data-submenu='content'] button[data-sub='Articles']").click();
      await page.waitForTimeout(300);
      await expect(page.locator(".submenu[data-submenu='content'] button[data-sub='Articles']")).toHaveClass(/active/);
    });
  });

  // ==================== B. ARTICLES LIST — RENDERING ====================

  test.describe("Articles List — rendering", () => {
    test("6. ไม่มี KPI summary card (articles list ไม่มี summary)", async ({ page }) => {
      await goToArticles(page);
      await expect(page.locator("#summary-grid")).toBeEmpty();
    });

    test("7. ตาราง head มี 6 คอลัมน์ครบ", async ({ page }) => {
      await goToArticles(page);
      const head = page.locator(".article-table .asset-row.head");
      await expect(head.locator("div").nth(0)).toHaveText("Article ID");
      await expect(head.locator("div").nth(1)).toHaveText("Article");
      await expect(head.locator("div").nth(2)).toHaveText("Category");
      await expect(head.locator("div").nth(3)).toHaveText("Publish Status");
      await expect(head.locator("div").nth(4)).toHaveText("Publish Date");
      await expect(head.locator("div").nth(5)).toHaveText("Action");
    });

    test("8. แสดงบทความ + footer range ถูกต้อง (6 articles, 10/page = 1 page)", async ({ page }) => {
      await goToArticles(page);
      const rows = page.locator(".article-table .asset-row:not(.head)");
      await expect(rows).toHaveCount(6);
      await expect(page.locator(".footer-range")).toContainText("1-6 จาก 6");
    });

    test("9. แถวแรก (sort latest default) คือ ART-044 (id สูงสุด)", async ({ page }) => {
      await goToArticles(page);
      const firstRow = page.locator(".article-table .asset-row:not(.head)").first();
      await expect(firstRow.locator("[data-label='Article ID'] .main-text")).toHaveText("ART-044");
    });

    test("10. status pill: Published = green, Scheduled = blue, Draft = amber, Archived = gray", async ({ page }) => {
      await goToArticles(page);
      const publishedRow = page.locator(".asset-row[data-article-card='ART-043']");
      await expect(publishedRow.locator(".pill.green").first()).toContainText("Published");
      const scheduledRow = page.locator(".asset-row[data-article-card='ART-044']");
      await expect(scheduledRow.locator(".pill.blue").first()).toContainText("Scheduled");
      const draftRow = page.locator(".asset-row[data-article-card='ART-042']");
      await expect(draftRow.locator(".pill.amber").first()).toContainText("Draft");
      const archivedRow = page.locator(".asset-row[data-article-card='ART-039']");
      await expect(archivedRow.locator(".pill.gray").first()).toContainText("Archived");
    });

    test("11. คอลัมน์ Category แสดงชื่อหมวดหมู่ถูกต้อง", async ({ page }) => {
      await goToArticles(page);
      const row = page.locator(".asset-row[data-article-card='ART-043']");
      await expect(row.locator("[data-label='Category'] .main-text")).toHaveText("Technical");
    });

    test("12. คอลัมน์ Publish Date แสดงวันที่เผยแพร่", async ({ page }) => {
      await goToArticles(page);
      const row = page.locator(".asset-row[data-article-card='ART-044']");
      await expect(row.locator("[data-label='Publish Date'] .main-text")).toHaveText("10 Jul 2026 19:00");
    });

    test("13. primary action มีปุ่ม 'สร้างบทความ'", async ({ page }) => {
      await goToArticles(page);
      await expect(page.locator("[data-article-add]")).toBeVisible();
    });
  });

  // ==================== C. ARTICLES LIST — SEARCH ====================

  test.describe("Articles List — search", () => {
    test("14. ค้นหาด้วย Article ID 'ART-044' เจอ 1 แถว", async ({ page }) => {
      await goToArticles(page);
      await page.locator("#article-search").fill("ART-044");
      await page.waitForTimeout(300);
      const rows = page.locator(".article-table .asset-row:not(.head)");
      await expect(rows).toHaveCount(1);
      await expect(rows.first().locator("[data-label='Article ID'] .main-text")).toHaveText("ART-044");
    });

    test("15. ค้นหาด้วย title 'Provenance' เจอ 1 แถว (ART-043)", async ({ page }) => {
      await goToArticles(page);
      await page.locator("#article-search").fill("Provenance");
      await page.waitForTimeout(300);
      const rows = page.locator(".article-table .asset-row:not(.head)");
      await expect(rows).toHaveCount(1);
      await expect(rows.first().locator("[data-label='Article ID'] .main-text")).toHaveText("ART-043");
    });

    test("16. ค้นหาด้วย category 'Technical' เจอ 1 แถว", async ({ page }) => {
      await goToArticles(page);
      await page.locator("#article-search").fill("Technical");
      await page.waitForTimeout(300);
      const rows = page.locator(".article-table .asset-row:not(.head)");
      await expect(rows).toHaveCount(1);
    });

    test("17. ค้นหาไม่พบ แสดง empty state 'ไม่พบข้อมูล'", async ({ page }) => {
      await goToArticles(page);
      await page.locator("#article-search").fill("ZZZNOTFOUND");
      await page.waitForTimeout(300);
      await expect(page.locator(".detail-empty.user-empty")).toHaveText("ไม่พบข้อมูล");
    });
  });

  // ==================== D. ARTICLES LIST — FILTER / SORT / RESET ====================

  test.describe("Articles List — filter / sort / reset", () => {
    test("18. filter status = Published เจอ 2 แถว (ART-043, ART-040)", async ({ page }) => {
      await goToArticles(page);
      await openFilterBar(page, "article");
      await pickCustomOption(page, "article-status-filter", "Published");
      await page.waitForTimeout(300);
      const rows = page.locator(".article-table .asset-row:not(.head)");
      await expect(rows).toHaveCount(2);
    });

    test("19. filter status = Draft เจอ 1 แถว (ART-042)", async ({ page }) => {
      await goToArticles(page);
      await openFilterBar(page, "article");
      await pickCustomOption(page, "article-status-filter", "Draft");
      await page.waitForTimeout(300);
      const rows = page.locator(".article-table .asset-row:not(.head)");
      await expect(rows).toHaveCount(1);
      await expect(rows.first().locator("[data-label='Article ID'] .main-text")).toHaveText("ART-042");
    });

    test("20. filter status = Scheduled เจอ 2 แถว", async ({ page }) => {
      await goToArticles(page);
      await openFilterBar(page, "article");
      await pickCustomOption(page, "article-status-filter", "Scheduled");
      await page.waitForTimeout(300);
      const rows = page.locator(".article-table .asset-row:not(.head)");
      await expect(rows).toHaveCount(2);
    });

    test("21. filter status = Archived เจอ 1 แถว (ART-039)", async ({ page }) => {
      await goToArticles(page);
      await openFilterBar(page, "article");
      await pickCustomOption(page, "article-status-filter", "Archived");
      await page.waitForTimeout(300);
      const rows = page.locator(".article-table .asset-row:not(.head)");
      await expect(rows).toHaveCount(1);
      await expect(rows.first().locator("[data-label='Article ID'] .main-text")).toHaveText("ART-039");
    });

    test("22. filter category = 'Technical' เจอ 1 แถว", async ({ page }) => {
      await goToArticles(page);
      await openFilterBar(page, "article");
      await pickCustomOption(page, "article-category-filter", "Technical");
      await page.waitForTimeout(300);
      const rows = page.locator(".article-table .asset-row:not(.head)");
      await expect(rows).toHaveCount(1);
    });

    test("23. sort = title A-Z → แถวแรกเรียงตามตัวอักษร", async ({ page }) => {
      await goToArticles(page);
      await openFilterBar(page, "article");
      await pickCustomOption(page, "article-sort", "title");
      await page.waitForTimeout(300);
      const firstRow = page.locator(".article-table .asset-row:not(.head)").first();
      await expect(firstRow.locator(".desktop-user-name")).toHaveText("Auction Week Highlights");
    });

    test("24. reset ล้าง search/filter/sort กลับค่า default", async ({ page }) => {
      await goToArticles(page);
      await page.locator("#article-search").fill("ART-044");
      await page.waitForTimeout(200);
      await openFilterBar(page, "article");
      await pickCustomOption(page, "article-status-filter", "Published");
      await page.waitForTimeout(200);
      await clickResetButton(page, "data-article-reset");
      const rows = page.locator(".article-table .asset-row:not(.head)");
      await expect(rows).toHaveCount(6);
      await expect(page.locator("#article-search")).toHaveValue("");
    });
  });

  // ==================== E. ARTICLES LIST — ROW MENU / ACTIONS ====================

  test.describe("Articles List — row menu / actions", () => {
    test("25. row menu ของ Draft (ART-042) มี ดูรายละเอียด, ดูตัวอย่าง, แก้ไขบทความ, ลบ Draft", async ({ page }) => {
      await goToArticles(page);
      await openArticleRowMenu(page, "ART-042");
      const menu = page.locator(".asset-row[data-article-card='ART-042'] .row-menu-list");
      await expect(menu.locator("button", { hasText: "ดูรายละเอียด" })).toBeVisible();
      await expect(menu.locator("button", { hasText: "ดูตัวอย่าง" })).toBeVisible();
      await expect(menu.locator("button", { hasText: "แก้ไขบทความ" })).toBeVisible();
      await expect(menu.locator("button", { hasText: "ลบ Draft" })).toBeVisible();
    });

    test("26. row menu ของ Scheduled (ART-044) มี ยกเลิกกำหนดเผยแพร่", async ({ page }) => {
      await goToArticles(page);
      await openArticleRowMenu(page, "ART-044");
      const menu = page.locator(".asset-row[data-article-card='ART-044'] .row-menu-list");
      await expect(menu.locator("button", { hasText: "ยกเลิกกำหนดเผยแพร่" })).toBeVisible();
    });

    test("27. row menu ของ Published (ART-043) มี เก็บบทความเข้าคลัง", async ({ page }) => {
      await goToArticles(page);
      await openArticleRowMenu(page, "ART-043");
      const menu = page.locator(".asset-row[data-article-card='ART-043'] .row-menu-list");
      await expect(menu.locator("button", { hasText: "เก็บบทความเข้าคลัง" })).toBeVisible();
    });

    test("28. row menu ของ Archived (ART-039) มี คืนบทความ", async ({ page }) => {
      await goToArticles(page);
      await openArticleRowMenu(page, "ART-039");
      const menu = page.locator(".asset-row[data-article-card='ART-039'] .row-menu-list");
      await expect(menu.locator("button", { hasText: "คืนบทความ" })).toBeVisible();
    });
  });

  // ==================== F. ARTICLE DETAIL ====================

  test.describe("Article Detail", () => {
    test("29. คลิกแถวเปิด Article Detail: breadcrumb + title + panel title ถูกต้อง", async ({ page }) => {
      await goToArticles(page);
      await openArticleDetailByRowClick(page, "ART-043");
      await expect(page.locator("#page-title")).toHaveText("Article Detail");
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Content Management / Articles / ART-043");
      await expect(page.locator("#panel-title")).toHaveText("How to Check Provenance");
      await expect(page.locator("#panel-subtitle")).toContainText("ART-043");
    });

    test("30. Article Detail มี section Article Header, Hero/Cover, Content Blocks, Publish Control, Change History", async ({ page }) => {
      await goToArticles(page);
      await openArticleDetailByRowClick(page, "ART-043");
      const sections = page.locator(".article-detail-page .article-editor-section h4");
      await expect(sections.filter({ hasText: "Article Header" })).toBeVisible();
      await expect(sections.filter({ hasText: "Hero / Cover" })).toBeVisible();
      await expect(sections.filter({ hasText: "Content Blocks" })).toBeVisible();
      await expect(sections.filter({ hasText: "Publish Control" })).toBeVisible();
      await expect(sections.filter({ hasText: "Change History" })).toBeVisible();
    });

    test("31. Article Detail มีปุ่ม Edit article, Preview article และ status action button", async ({ page }) => {
      await goToArticles(page);
      await openArticleDetailByRowClick(page, "ART-043");
      await expect(page.locator("[data-article-edit='ART-043']")).toBeVisible();
      await expect(page.locator("[data-article-preview-id='ART-043']")).toBeVisible();
      await expect(page.locator("[data-article-status-action='archive-article']")).toBeVisible();
    });

    test("32. Article Detail มีปุ่มย้อนกลับ 'กลับไป Articles' (aria-label)", async ({ page }) => {
      await goToArticles(page);
      await openArticleDetailByRowClick(page, "ART-043");
      await expect(page.locator("[data-back-article-list]")).toBeVisible();
      await expect(page.locator("[data-back-article-list]")).toHaveAttribute("aria-label", "กลับไป Articles");
    });

    test("33. กดย้อนกลับจาก Article Detail กลับไป Articles list", async ({ page }) => {
      await goToArticles(page);
      await openArticleDetailByRowClick(page, "ART-043");
      await page.locator("[data-back-article-list]").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Articles");
      await expect(page.locator("#panel-title")).toHaveText("ARTICLE LIST");
    });

    test("34. Article Detail แสดง Change History table", async ({ page }) => {
      await goToArticles(page);
      await openArticleDetailByRowClick(page, "ART-043");
      const historySection = page.locator(".article-detail-page").locator(".article-editor-section", { hasText: "Change History" });
      await expect(historySection).toBeVisible();
    });
  });

  // ==================== G. ARTICLE EDITOR (ADD / EDIT) ====================

  test.describe("Article Editor (Add / Edit)", () => {
    test("35. คลิก 'สร้างบทความ' เปิด Add Article editor", async ({ page }) => {
      await goToArticles(page);
      await page.locator("[data-article-add]").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Add Article");
      await expect(page.locator("#crumb")).toContainText("Add Article");
      await expect(page.locator("[data-article-editor]")).toBeVisible();
    });

    test("36. Add Article editor มี section Article Header, Hero/Cover, Content Blocks, Publish Control", async ({ page }) => {
      await goToArticles(page);
      await page.locator("[data-article-add]").click();
      await page.waitForTimeout(300);
      const sections = page.locator("[data-article-editor] .article-editor-section h4");
      await expect(sections.filter({ hasText: "Article Header" })).toBeVisible();
      await expect(sections.filter({ hasText: "Hero / Cover" })).toBeVisible();
      await expect(sections.filter({ hasText: "Content Blocks" })).toBeVisible();
      await expect(sections.filter({ hasText: "Publish Control" })).toBeVisible();
    });

    test("37. Add Article มี field title, slug, category, author (read-only)", async ({ page }) => {
      await goToArticles(page);
      await page.locator("[data-article-add]").click();
      await page.waitForTimeout(300);
      await expect(page.locator("[data-article-editor] [name='title']")).toBeVisible();
      await expect(page.locator("[data-article-editor] [name='slug']")).toBeVisible();
      await expect(page.locator("[data-article-editor] [name='author']")).toHaveAttribute("type", "hidden");
    });

    test("38. Add Article มี cover upload control + caption + deck", async ({ page }) => {
      await goToArticles(page);
      await page.locator("[data-article-add]").click();
      await page.waitForTimeout(300);
      await expect(page.locator("[data-article-cover-upload-control]")).toBeVisible();
      await expect(page.locator("[data-article-editor] [name='coverCaption']")).toBeVisible();
      await expect(page.locator("[data-article-editor] [name='deck']")).toBeVisible();
    });

    test("39. Add Article มี block builder: Add block button + block type picker", async ({ page }) => {
      await goToArticles(page);
      await page.locator("[data-article-add]").click();
      await page.waitForTimeout(300);
      await expect(page.locator("[data-article-block-add]")).toBeVisible();
      await expect(page.locator("div[data-custom-select]:has(> #article-block-type-picker) [data-custom-select-trigger]")).toBeVisible();
    });

    test("40. Add Article มี publish status selector + publish date + publish time", async ({ page }) => {
      await goToArticles(page);
      await page.locator("[data-article-add]").click();
      await page.waitForTimeout(300);
      await expect(page.locator("[data-article-editor] [name='publishDate']")).toBeVisible();
      await expect(page.locator("[data-article-editor] [name='publishTime']")).toBeVisible();
      await expect(page.locator("div[data-custom-select]:has(> #article-status-field) [data-custom-select-trigger]")).toBeVisible();
    });

    test("41. Add Article มีปุ่ม Preview, สร้างบทความ, ยกเลิก", async ({ page }) => {
      await goToArticles(page);
      await page.locator("[data-article-add]").click();
      await page.waitForTimeout(300);
      await expect(page.locator("[data-article-preview-open]")).toBeVisible();
      const submitBtn = page.locator("[data-article-editor] button[type='submit']");
      await expect(submitBtn).toHaveText("สร้างบทความ");
      await expect(page.locator("[data-article-add-cancel]")).toBeVisible();
    });

    test("42. กด 'ยกเลิก' ใน Add Article เปิด confirm modal แล้วยืนยันกลับไป list", async ({ page }) => {
      await goToArticles(page);
      await page.locator("[data-article-add]").click();
      await page.waitForTimeout(300);
      await page.locator("[data-article-editor] [name='title']").fill("Test draft");
      await page.waitForTimeout(100);
      await page.locator("[data-article-add-cancel]").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
      await page.locator("[data-article-add-cancel-confirm]").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Articles");
    });

    test("43. Edit Article เปิด editor พร้อมข้อมูลเดิม (title, slug, category)", async ({ page }) => {
      await goToArticles(page);
      await openArticleRowMenu(page, "ART-043");
      await page.locator(".asset-row[data-article-card='ART-043'] .row-menu-list [data-article-edit='ART-043']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#page-title")).toHaveText("Edit Article");
      await expect(page.locator("[data-article-editor] [name='title']")).toHaveValue("How to Check Provenance");
      await expect(page.locator("[data-article-editor] [name='slug']")).toHaveValue("how-to-check-provenance");
    });

    test("44. Edit Article มีปุ่ม 'บันทึกการแก้ไข' และ 'ยกเลิก'", async ({ page }) => {
      await goToArticles(page);
      await openArticleRowMenu(page, "ART-043");
      await page.locator(".asset-row[data-article-card='ART-043'] .row-menu-list [data-article-edit='ART-043']").click();
      await page.waitForTimeout(300);
      const submitBtn = page.locator("[data-article-editor] button[type='submit']");
      await expect(submitBtn).toHaveText("บันทึกการแก้ไข");
      await expect(page.locator("[data-article-edit-cancel='ART-043']")).toBeVisible();
    });
  });

  // ==================== H. ARTICLE PREVIEW ====================

  test.describe("Article Preview", () => {
    test("45. กด Preview ใน editor เปิด preview modal", async ({ page }) => {
      await goToArticles(page);
      await page.locator("[data-article-add]").click();
      await page.waitForTimeout(300);
      await page.locator("[data-article-preview-open]").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal-title")).toHaveText("Preview article");
    });

    test("46. preview modal มี Board hero preview + FO article preview", async ({ page }) => {
      await goToArticles(page);
      await page.locator("[data-article-add]").click();
      await page.waitForTimeout(300);
      await page.locator("[data-article-preview-open]").click();
      await page.waitForTimeout(300);
      await expect(page.locator(".article-preview-stack")).toBeVisible();
      await expect(page.locator(".article-preview-label", { hasText: "ตัวอย่างบทความ Hero" })).toBeVisible();
      await expect(page.locator(".article-preview-label", { hasText: "ตัวอย่างรายละเอียดบทความ" })).toBeVisible();
    });

    test("47. ปิด preview modal ได้", async ({ page }) => {
      await goToArticles(page);
      await page.locator("[data-article-add]").click();
      await page.waitForTimeout(300);
      await page.locator("[data-article-preview-open]").click();
      await page.waitForTimeout(300);
      await page.locator("[data-user-action-modal-close]").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    });

    test("48. Article Detail มีปุ่ม Preview article เปิด preview modal", async ({ page }) => {
      await goToArticles(page);
      await openArticleDetailByRowClick(page, "ART-043");
      await page.locator("[data-article-preview-id='ART-043']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal-title")).toHaveText("Preview article");
    });
  });

  // ==================== I. CATEGORIES LIST — RENDERING ====================

  test.describe("Categories List — rendering", () => {
    test("49. ไม่มี KPI summary card (categories list ไม่มี summary)", async ({ page }) => {
      await goToCategories(page);
      await expect(page.locator("#summary-grid")).toBeEmpty();
    });

    test("50. ตาราง head มี 7 คอลัมน์ครบ", async ({ page }) => {
      await goToCategories(page);
      const head = page.locator(".category-table .asset-row.head");
      await expect(head.locator("div").nth(0)).toHaveText("Category ID");
      await expect(head.locator("div").nth(1)).toHaveText("Category");
      await expect(head.locator("div").nth(2)).toHaveText("URL");
      await expect(head.locator("div").nth(3)).toHaveText("Articles");
      await expect(head.locator("div").nth(4)).toHaveText("Status");
      await expect(head.locator("div").nth(5)).toHaveText("Updated");
      await expect(head.locator("div").nth(6)).toHaveText("Action");
    });

    test("51. แสดง 7 categories + footer range ถูกต้อง (7 categories, 10/page = 1 page)", async ({ page }) => {
      await goToCategories(page);
      const rows = page.locator(".category-table .asset-row:not(.head)");
      await expect(rows).toHaveCount(7);
      await expect(page.locator(".footer-range")).toContainText("1-7 จาก 7");
    });

    test("52. แถวแรก (sort display order default) คือ CAT-001 (displayOrder 10)", async ({ page }) => {
      await goToCategories(page);
      const firstRow = page.locator(".category-table .asset-row:not(.head)").first();
      await expect(firstRow.locator("[data-label='Category ID'] .main-text")).toHaveText("CAT-001");
    });

    test("53. status pill: Active = green, Inactive = amber", async ({ page }) => {
      await goToCategories(page);
      const activeRow = page.locator(".asset-row[data-category-card='CAT-001']");
      await expect(activeRow.locator(".pill.green").first()).toContainText("Active");
      const inactiveRow = page.locator(".asset-row[data-category-card='CAT-007']");
      await expect(inactiveRow.locator(".pill.amber").first()).toContainText("Inactive");
    });

    test("54. คอลัมน์ Articles แสดงจำนวนบทความที่ link อยู่", async ({ page }) => {
      await goToCategories(page);
      const row = page.locator(".asset-row[data-category-card='CAT-002']");
      await expect(row.locator("[data-label='Articles'] .main-text")).toHaveText("1");
    });

    test("55. primary action มีปุ่ม 'Reorder Categories' และ 'Add Category'", async ({ page }) => {
      await goToCategories(page);
      await expect(page.locator("[data-category-order-open]")).toBeVisible();
      await expect(page.locator("[data-category-add]")).toBeVisible();
    });
  });

  // ==================== J. CATEGORIES LIST — SEARCH / FILTER / SORT / RESET ====================

  test.describe("Categories List — search / filter / sort / reset", () => {
    test("56. ค้นหาด้วย Category ID 'CAT-001' เจอ 1 แถว", async ({ page }) => {
      await goToCategories(page);
      await page.locator("#category-search").fill("CAT-001");
      await page.waitForTimeout(300);
      const rows = page.locator(".category-table .asset-row:not(.head)");
      await expect(rows).toHaveCount(1);
    });

    test("57. ค้นหาด้วย Name 'Guides' เจอ 1 แถว", async ({ page }) => {
      await goToCategories(page);
      await page.locator("#category-search").fill("Guides");
      await page.waitForTimeout(300);
      const rows = page.locator(".category-table .asset-row:not(.head)");
      await expect(rows).toHaveCount(1);
    });

    test("58. filter status = Active เจอ 6 แถว", async ({ page }) => {
      await goToCategories(page);
      await openFilterBar(page, "category");
      await pickCustomOption(page, "category-status-filter", "Active");
      await page.waitForTimeout(300);
      const rows = page.locator(".category-table .asset-row:not(.head)");
      await expect(rows).toHaveCount(6);
    });

    test("59. filter status = Inactive เจอ 1 แถว (CAT-007)", async ({ page }) => {
      await goToCategories(page);
      await openFilterBar(page, "category");
      await pickCustomOption(page, "category-status-filter", "Inactive");
      await page.waitForTimeout(300);
      const rows = page.locator(".category-table .asset-row:not(.head)");
      await expect(rows).toHaveCount(1);
      await expect(rows.first().locator("[data-label='Category ID'] .main-text")).toHaveText("CAT-007");
    });

    test("60. sort = name A-Z → แถวแรกเรียงตามตัวอักษร", async ({ page }) => {
      await goToCategories(page);
      await openFilterBar(page, "category");
      await pickCustomOption(page, "category-sort", "name");
      await page.waitForTimeout(300);
      const firstRow = page.locator(".category-table .asset-row:not(.head)").first();
      await expect(firstRow.locator(".desktop-user-name")).toHaveText("Collector");
    });

    test("61. reset ล้าง search/filter/sort กลับค่า default", async ({ page }) => {
      await goToCategories(page);
      await page.locator("#category-search").fill("CAT-001");
      await page.waitForTimeout(200);
      await openFilterBar(page, "category");
      await pickCustomOption(page, "category-status-filter", "Active");
      await page.waitForTimeout(200);
      await clickResetButton(page, "data-category-reset");
      const rows = page.locator(".category-table .asset-row:not(.head)");
      await expect(rows).toHaveCount(7);
      await expect(page.locator("#category-search")).toHaveValue("");
    });
  });

  // ==================== K. CATEGORIES — ROW MENU / DETAIL MODAL ====================

  test.describe("Categories — row menu / detail modal", () => {
    test("62. row menu ของ Active category ที่มี articles (CAT-001) มี ดูรายละเอียด, แก้ไข Category (ไม่มี ปิดใช้งาน/ลบ Category)", async ({ page }) => {
      await goToCategories(page);
      await openCategoryRowMenu(page, "CAT-001");
      const menu = page.locator(".asset-row[data-category-card='CAT-001'] .row-menu-list");
      await expect(menu.locator("button", { hasText: "ดูรายละเอียด" })).toBeVisible();
      await expect(menu.locator("button", { hasText: "แก้ไข Category" })).toBeVisible();
      await expect(menu.locator("button", { hasText: "ปิดใช้งาน" })).toHaveCount(0);
      await expect(menu.locator("button", { hasText: "ลบ Category" })).toHaveCount(0);
    });

    test("63. row menu ของ Inactive category ที่ไม่มี articles (CAT-007) มี เปิดใช้งาน และ ลบ Category", async ({ page }) => {
      await goToCategories(page);
      await openCategoryRowMenu(page, "CAT-007");
      const menu = page.locator(".asset-row[data-category-card='CAT-007'] .row-menu-list");
      await expect(menu.locator("button", { hasText: "เปิดใช้งาน" })).toBeVisible();
      await expect(menu.locator("button", { hasText: "ลบ Category" })).toBeVisible();
    });

    test("64. row menu ของ Inactive category (CAT-007) มี เปิดใช้งาน", async ({ page }) => {
      await goToCategories(page);
      await openCategoryRowMenu(page, "CAT-007");
      const menu = page.locator(".asset-row[data-category-card='CAT-007'] .row-menu-list");
      await expect(menu.locator("button", { hasText: "เปิดใช้งาน" })).toBeVisible();
    });

    test("65. คลิก View detail เปิด category detail modal", async ({ page }) => {
      await goToCategories(page);
      await openCategoryRowMenu(page, "CAT-001");
      await page.locator(".asset-row[data-category-card='CAT-001'] .row-menu-list [data-category-open='CAT-001']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal-title")).toHaveText("Category Detail");
    });

    test("66. category detail modal แสดง name, URL, status, description, article count", async ({ page }) => {
      await goToCategories(page);
      await openCategoryRowMenu(page, "CAT-001");
      await page.locator(".asset-row[data-category-card='CAT-001'] .row-menu-list [data-category-open='CAT-001']").click();
      await page.waitForTimeout(300);
      const modal = page.locator("#user-action-modal-body");
      await expect(modal.locator("input").nth(0)).toHaveValue("Guides");
      await expect(modal.locator("input").nth(1)).toHaveValue("guides");
      await expect(modal.locator("input").nth(2)).toHaveValue("Active");
    });

    test("67. category detail modal ของ Active category ที่มี articles ไม่มีปุ่ม Set inactive", async ({ page }) => {
      await goToCategories(page);
      await openCategoryRowMenu(page, "CAT-001");
      await page.locator(".asset-row[data-category-card='CAT-001'] .row-menu-list [data-category-open='CAT-001']").click();
      await page.waitForTimeout(300);
      const modal = page.locator("#user-action-modal-body");
      await expect(modal.locator("[data-category-edit='CAT-001']")).toBeVisible();
      await expect(modal.locator("[data-category-status-action='deactivate']")).toHaveCount(0);
    });
  });

  // ==================== L. CATEGORIES — ADD / EDIT MODAL ====================

  test.describe("Categories — add / edit modal", () => {
    test("68. กด 'Add Category' เปิด create modal", async ({ page }) => {
      await goToCategories(page);
      await page.locator("[data-category-add]").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal-title")).toHaveText("Add Category");
    });

    test("69. create modal มี field name, slug, status, description", async ({ page }) => {
      await goToCategories(page);
      await page.locator("[data-category-add]").click();
      await page.waitForTimeout(300);
      const form = page.locator("[data-category-form]");
      await expect(form.locator("[name='name']")).toBeVisible();
      await expect(form.locator("[name='slug']")).toBeVisible();
      await expect(form.locator("[name='description']")).toBeVisible();
    });

    test("70. create modal มีปุ่ม 'สร้างหมวดหมู่' และ 'ยกเลิก'", async ({ page }) => {
      await goToCategories(page);
      await page.locator("[data-category-add]").click();
      await page.waitForTimeout(300);
      const form = page.locator("[data-category-form]");
      await expect(form.locator("button[type='submit']")).toHaveText("สร้างหมวดหมู่");
      await expect(form.locator("[data-user-action-modal-close]")).toBeVisible();
    });

    test("71. กด 'Edit Category' เปิด edit modal พร้อมข้อมูลเดิม", async ({ page }) => {
      await goToCategories(page);
      await openCategoryRowMenu(page, "CAT-001");
      await page.locator(".asset-row[data-category-card='CAT-001'] .row-menu-list [data-category-edit='CAT-001']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#user-action-modal-title")).toHaveText("Edit Category");
      const form = page.locator("[data-category-form]");
      await expect(form.locator("[name='name']")).toHaveValue("Guides");
      await expect(form.locator("[name='slug']")).toHaveValue("guides");
    });
  });

  // ==================== R. MOBILE CARD LAYOUT ====================

  test.describe("Mobile card layout (≤760px)", () => {
    test("103. Articles list mobile: แสดง mobile card พร้อม Article ID, title, status, read time", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToArticles(page);
      const firstRow = page.locator(".article-table .asset-row:not(.head)").first();
      await expect(firstRow.locator(".mobile-user-card-title")).toBeVisible();
      await expect(firstRow.locator(".user-card-tag")).toHaveCount(2);
      await page.close();
    });

    test("104. Categories list mobile: แสดง mobile card พร้อม Category ID, status, article count", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToCategories(page);
      const firstRow = page.locator(".category-table .asset-row:not(.head)").first();
      await expect(firstRow.locator(".mobile-user-card-title")).toBeVisible();
      await expect(firstRow.locator(".user-card-tag")).toHaveCount(1);
      await page.close();
    });

    test("106. Articles list mobile: filter bar ซ่อนอยู่ เปิดได้ด้วย toggle", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToArticles(page);
      const bar = page.locator(".user-filter-bar.content-mode");
      const isOpen = await bar.getAttribute("data-filter-open");
      expect(isOpen).toBe("false");
      await page.locator("[data-article-filter-toggle]").click();
      await page.waitForTimeout(200);
      const isOpenAfter = await page.locator(".user-filter-bar.content-mode").getAttribute("data-filter-open");
      expect(isOpenAfter).toBe("true");
      await page.close();
    });

    test("107. Categories list mobile: filter bar ซ่อนอยู่ เปิดได้ด้วย toggle", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToCategories(page);
      const bar = page.locator(".user-filter-bar.category-mode");
      const isOpen = await bar.getAttribute("data-filter-open");
      expect(isOpen).toBe("false");
      await page.locator("[data-category-filter-toggle]").click();
      await page.waitForTimeout(200);
      const isOpenAfter = await page.locator(".user-filter-bar.category-mode").getAttribute("data-filter-open");
      expect(isOpenAfter).toBe("true");
      await page.close();
    });

    test("109. Article Detail mobile: แสดง detail page พร้อม sections", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await goToArticles(page);
      await openArticleDetailByRowClick(page, "ART-043");
      await expect(page.locator("#page-title")).toHaveText("Article Detail");
      await expect(page.locator(".article-detail-page")).toBeVisible();
      await page.close();
    });

  });

  // ==================== S. VIEWPORT-CONDITIONAL TESTS ====================

  test.describe("Viewport-conditional (desktop only)", () => {
    test("111. Desktop (≥1280px): Articles list แสดงตารางแบบ full grid", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await goToArticles(page);
      const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
      if (isMobile) {
        await page.close();
        return;
      }
      const table = page.locator(".article-table");
      await expect(table).toBeVisible();
      const head = page.locator(".article-table .asset-row.head");
      await expect(head).toBeVisible();
      await page.close();
    });

    test("112. Desktop (≥1280px): Categories list แสดงตารางแบบ full grid", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await goToCategories(page);
      const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
      if (isMobile) {
        await page.close();
        return;
      }
      const table = page.locator(".category-table");
      await expect(table).toBeVisible();
      const head = page.locator(".category-table .asset-row.head");
      await expect(head).toBeVisible();
      await page.close();
    });

    test("114. Desktop (≥1280px): Articles filter bar ปิดอยู่ default (ต้องเปิดเอง)", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await goToArticles(page);
      const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
      if (isMobile) {
        await page.close();
        return;
      }
      const bar = page.locator(".user-filter-bar.content-mode");
      const isOpen = await bar.getAttribute("data-filter-open");
      expect(isOpen).toBe("false");
      await page.close();
    });

    test("115. Desktop (≥1280px): Categories filter bar ปิดอยู่ default", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await goToCategories(page);
      const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
      if (isMobile) {
        await page.close();
        return;
      }
      const bar = page.locator(".user-filter-bar.category-mode");
      const isOpen = await bar.getAttribute("data-filter-open");
      expect(isOpen).toBe("false");
      await page.close();
    });

  });

  // ==================== T. CROSS-MODULE CONSISTENCY ====================

  test.describe("Cross-module consistency", () => {
    test("117. Articles list ใช้ footer-range pattern เดียวกับ module อื่น", async ({ page }) => {
      await goToArticles(page);
      await expect(page.locator(".footer-range")).toBeVisible();
      await expect(page.locator(".footer-range")).toContainText("แสดง");
      await expect(page.locator(".footer-range")).toContainText("จาก");
    });

    test("118. Categories list ใช้ footer-range pattern เดียวกับ module อื่น", async ({ page }) => {
      await goToCategories(page);
      await expect(page.locator(".footer-range")).toBeVisible();
      await expect(page.locator(".footer-range")).toContainText("แสดง");
      await expect(page.locator(".footer-range")).toContainText("จาก");
    });

    test("120. ทุก list ใช้ row-menu pattern เดียวกัน (details > summary + row-menu-list)", async ({ page }) => {
      await goToArticles(page);
      await expect(page.locator(".article-table .row-menu > summary")).toHaveCount(6);
      await goToCategories(page);
      await expect(page.locator(".category-table .row-menu > summary")).toHaveCount(7);
    });

    test("121. ทุก list ใช้ empty state 'ไม่พบข้อมูล' เหมือนกัน", async ({ page }) => {
      await goToArticles(page);
      await page.locator("#article-search").fill("ZZZNOTFOUND");
      await page.waitForTimeout(300);
      await expect(page.locator(".detail-empty.user-empty")).toHaveText("ไม่พบข้อมูล");
      await goToCategories(page);
      await page.locator("#category-search").fill("ZZZNOTFOUND");
      await page.waitForTimeout(300);
      await expect(page.locator(".detail-empty.user-empty")).toHaveText("ไม่พบข้อมูล");
    });
  });
});
