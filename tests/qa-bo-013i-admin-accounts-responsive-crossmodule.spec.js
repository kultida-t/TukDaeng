// QA-BO-013i: Settings > Admin Accounts — Responsive & cross-module (strict Playwright spec)
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล — admin-account-list-mode CSS (บรรทัด ~7411-7543, ~12500-12549)
//   + admin-account-detail-mode CSS (บรรทัด ~7981-8156) + audit ref handler (บรรทัด ~39887) + nav (บรรทัด ~38385)
// เป้าหมาย: รันเทสครอบ responsive (list/detail/modal) + cross-module (audit link) + navigation back + no horizontal scroll (ห้ามแก้ prototype)
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

// helper: ตรวจว่า breakpoint ปัจจุบันเป็น narrow/tablet (≤1180px) หรือไม่
async function isNarrow(page) {
  return await page.evaluate(() => window.matchMedia("(max-width: 1180px)").matches);
}

// helper: ตรวจว่า Settings submenu ขยายอยู่หรือไม่
async function isSettingsSubmenuExpanded(page) {
  return await page.evaluate(() =>
    document.querySelector(".submenu[data-submenu='settings']")?.classList.contains("open"));
}

// helper: ไปหน้า Admin Accounts List ผ่านเมนู Settings > Admin Accounts
async function goToAdminAccounts(page) {
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

// helper: locator ของ row ตาม Admin ID
function accountRow(page, id) {
  return page.locator(`.admin-account-row[data-admin-account-card="${id}"]`);
}

// helper: เปิด detail ของ account ผ่านการคลิก cell Admin ID (ไม่ใช้ row menu)
async function openDetail(page, id) {
  await goToAdminAccounts(page);
  await page.locator(`.admin-account-row[data-admin-account-card="${id}"] .user-cell-primary[data-label="Admin ID"]`).click();
  await page.waitForTimeout(300);
}

// helper: เปิด row menu ของ account แล้วคลิก action button (suspend/reactivate/unlock/archive)
async function openActionFromRowMenu(page, id, action) {
  const row = accountRow(page, id);
  await row.locator(".row-menu > summary").click();
  await page.waitForTimeout(300);
  await row.locator(`[data-admin-account-action="${action}"][data-admin-account-id="${id}"]`).click();
  await page.waitForTimeout(300);
}

// helper: เปิด row menu ของ account แล้วคลิก change-role button
async function openChangeRoleFromRowMenu(page, id) {
  const row = accountRow(page, id);
  await row.locator(".row-menu > summary").click();
  await page.waitForTimeout(300);
  await row.locator(`[data-admin-account-change-role="${id}"]`).click();
  await page.waitForTimeout(300);
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

// helper: อ่าน Admin ID ของทุก row ในหน้าปัจจุบัน (เรียงตาม DOM)
async function rowIds(page) {
  return await page.locator(".admin-account-row").evaluateAll(rows =>
    rows.map(r => r.getAttribute("data-admin-account-card")));
}

// helper: ตรวจว่า page มี horizontal scroll หรือไม่ (scrollWidth > innerWidth)
async function hasHorizontalScroll(page) {
  return await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
}

// ==================== I. RESPONSIVE & CROSS-MODULE ====================

test.describe("QA-BO-013i: Settings > Admin Accounts — responsive & cross-module", () => {

  // ---- 1. list responsive: desktop table vs mobile card ----

  test("1. list responsive: desktop ตาราง 7 คอลัมน์ + row menu มีกรอบ; mobile card layout + row menu ไม่มีกรอบ", async ({ page }) => {
    await goToAdminAccounts(page);
    const mobile = await isMobile(page);
    const narrow = await isNarrow(page);

    if (!narrow) {
      // desktop: table head visible, 7 columns
      const headCells = page.locator(".admin-account-table .user-row.head > div");
      await expect(headCells).toHaveCount(7);
      await expect(headCells.nth(0)).toHaveText("Admin ID");
      await expect(headCells.nth(6)).toHaveText("Action");
      // row menu summary visible with border on desktop
      const summary = accountRow(page, "ADM-001").locator(".row-menu > summary");
      await expect(summary).toBeVisible();
      const borderWidth = await summary.evaluate(el => parseFloat(getComputedStyle(el).borderWidth));
      expect(borderWidth).toBeGreaterThan(0);
    }

    if (mobile) {
      // mobile: card layout — head hidden, non-primary cells hidden
      await expect(page.locator(".admin-account-table .user-row.head")).toBeHidden();
      const row = accountRow(page, "ADM-001");
      await expect(row.locator('[data-label="Email"]')).toBeHidden();
      await expect(row.locator('[data-label="Role"]')).toBeHidden();
      await expect(row.locator('[data-label="Status"]')).toBeHidden();
      await expect(row.locator('[data-label="Last Login"]')).toBeHidden();
      // card tags + meta visible
      await expect(row.locator(".user-card-tags")).toBeVisible();
      await expect(row.locator(".user-card-meta")).toBeVisible();
      // "..." button visible but borderless (no frame)
      const summary = row.locator(".row-menu > summary");
      await expect(summary).toBeVisible();
      const borderWidth = await summary.evaluate(el => parseFloat(getComputedStyle(el).borderWidth));
      expect(borderWidth).toBe(0);
      const bg = await summary.evaluate(el => getComputedStyle(el).backgroundColor);
      expect(bg).toBe("rgba(0, 0, 0, 0)");
    }

    if (narrow && !mobile) {
      // tablet: still table layout (head visible)
      await expect(page.locator(".admin-account-table .user-row.head")).toBeVisible();
      // but filter bar is single row
      const bar = page.locator(".admin-account-filter-bar");
      const cols = await bar.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length);
      expect(cols).toBe(5); // search + 3 filters + reset
    }
  });

  // ---- 2. detail responsive: grid columns by viewport ----

  test("2. detail responsive: desktop 3 คอลัมน์; tablet 2 คอลัมน์; mobile 1 คอลัมน์ + history card stack + action full width", async ({ page }) => {
    await openDetail(page, "ADM-006");
    const narrow = await isNarrow(page);
    const mobile = await isMobile(page);

    const grid = page.locator(".admin-account-detail-page .detail-grid.three");
    const colCount = await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length);

    // scope ไปยัง History & Actions section เท่านั้น (detail มี 2 history tables — section1 role matrix + section2 activity)
    const activityThead = page.locator(".admin-account-detail-page .admin-account-action-section .history-table thead");

    if (mobile) {
      // mobile: 1 column
      expect(colCount).toBe(1);
      // history table → card stack: thead hidden
      await expect(activityThead).toBeHidden();
      // action buttons fill available width (flex: 1 1 0 — each button grows equally)
      const actionBtns = page.locator(".admin-account-detail-page .user-detail-actions .user-detail-action-btn");
      const btnCount = await actionBtns.count();
      expect(btnCount).toBeGreaterThan(0);
      // ปุ่มแรกขยายเต็มพื้นที่ที่เหลือ (flex-grow)
      const firstBtnBox = await actionBtns.first().boundingBox();
      const containerBox = await page.locator(".admin-account-detail-page .user-detail-actions").boundingBox();
      // ปุ่มกว้างพอสมควร (≥ ~45% ของ container สำหรับ 2 ปุ่ม, ≥ ~90% สำหรับ 1 ปุ่ม)
      const minRatio = btnCount === 1 ? 0.85 : 0.4;
      expect(firstBtnBox.width).toBeGreaterThan(containerBox.width * minRatio);
    } else if (narrow) {
      // tablet (≤1180px): 2 columns
      expect(colCount).toBe(2);
      // history table still table layout (thead visible)
      await expect(activityThead).toBeVisible();
    } else {
      // desktop: 3 columns
      expect(colCount).toBe(3);
      // history table still table layout (thead visible)
      await expect(activityThead).toBeVisible();
    }
  });

  // ---- 3. mobile card content: tags + meta ----

  test("3. mobile card: แสดง tags (status/role/master) + meta (Name/Email/Last Login) + ไม่มีกรอบ row menu", async ({ page }) => {
    await goToAdminAccounts(page);
    const mobile = await isMobile(page);
    if (!mobile) { test.skip(); return; }

    // ADM-001 (Active, Super Admin)
    const row = accountRow(page, "ADM-001");
    // tags: status pill + role pill
    const tags = row.locator(".user-card-tags");
    await expect(tags).toBeVisible();
    await expect(tags.locator(".pill.green")).toHaveText("Active");
    await expect(tags.locator(".pill.purple")).toHaveText("Super Admin");
    // no master pill on non-master
    expect(await tags.locator(".pill-master").count()).toBe(0);
    // meta: Name / Email / Last Login
    const meta = row.locator(".user-card-meta");
    await expect(meta).toBeVisible();
    await expect(meta.locator(".user-card-meta-item span", { hasText: /^Name$/ })).toBeVisible();
    await expect(meta.locator(".user-card-meta-item span", { hasText: /^Email$/ })).toBeVisible();
    await expect(meta.locator(".user-card-meta-item span", { hasText: /^Last Login$/ })).toBeVisible();
    // meta values match mock
    await expect(meta.locator(".user-card-meta-item", { hasText: "Name" }).locator("strong")).toHaveText("สมชาย บริหาร");
    await expect(meta.locator(".user-card-meta-item", { hasText: "Email" }).locator("strong")).toHaveText("somchai@tukdaeng.example");
    // master row has pill-master in tags
    await expect(accountRow(page, "ADM-010").locator(".user-card-tags .pill-master")).toHaveText("Master");
    // "..." button borderless on mobile
    const summary = row.locator(".row-menu > summary");
    const borderWidth = await summary.evaluate(el => parseFloat(getComputedStyle(el).borderWidth));
    expect(borderWidth).toBe(0);
  });

  // ---- 4. filter bar responsive: single row + reset icon ----

  test("4. filter bar responsive: tablet/mobile บรรทัดเดียว + reset ปุ่ม icon", async ({ page }) => {
    await goToAdminAccounts(page);
    const narrow = await isNarrow(page);
    const mobile = await isMobile(page);

    // helper: ตรวจว่า element ถูกซ่อนด้วย clip (visually hidden แต่ไม่ใช่ display:none)
    async function isVisuallyHidden(locator) {
      return await locator.evaluate(el => {
        const style = getComputedStyle(el);
        return style.clip === "rect(0px, 0px, 0px, 0px)" ||
               style.clip === "rect(0, 0, 0, 0)" ||
               (parseFloat(style.width) <= 1 && parseFloat(style.height) <= 1 && style.overflow === "hidden");
      });
    }

    if (mobile) {
      // mobile: filter bar เป็น column เดียว (data-filter-open ควบคุม)
      const bar = page.locator(".admin-account-filter-bar");
      await expect(bar).toHaveAttribute("data-filter-open", "false");
      // toggle opens
      await page.locator("#user-panel-filter-actions [data-admin-account-filter-toggle]").click();
      await page.waitForTimeout(200);
      await expect(bar).toHaveAttribute("data-filter-open", "true");
      // reset button in panel actions (mobile) — icon button with aria-label
      const resetBtn = page.locator("#user-panel-filter-actions [data-admin-account-reset]");
      await expect(resetBtn).toBeVisible();
      await expect(resetBtn).toHaveAttribute("aria-label", "รีเซ็ตค่าทั้งหมด");
    } else if (narrow) {
      // tablet: filter bar single row (search + 3 filters + reset = 5 columns)
      const bar = page.locator(".admin-account-filter-bar");
      const cols = await bar.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length);
      expect(cols).toBe(5);
      // reset button in filter bar is icon (span visually hidden via clip)
      const resetBtn = bar.locator(".filter-reset");
      await expect(resetBtn).toBeVisible();
      const hidden = await isVisuallyHidden(resetBtn.locator("span"));
      expect(hidden).toBe(true);
    } else {
      // desktop: filter bar single row (search + 3 filters + reset = 5 columns)
      const bar = page.locator(".admin-account-filter-bar");
      const cols = await bar.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length);
      expect(cols).toBe(5);
      // reset button is icon (span visually hidden via clip)
      const resetBtn = bar.locator(".filter-reset");
      await expect(resetBtn).toBeVisible();
      const hidden = await isVisuallyHidden(resetBtn.locator("span"));
      expect(hidden).toBe(true);
    }
  });

  // ---- 5. cross-module: audit link → Audit Log ----

  test("5. cross-module: คลิก audit link → Audit Log กรองด้วย reference + toast", async ({ page }) => {
    await openDetail(page, "ADM-006");
    const section = page.locator(".admin-account-detail-page .admin-account-action-section");
    const auditLink = section.locator("tbody tr").nth(0).locator("button.history-audit-link");
    await expect(auditLink).toHaveText("AUD-88205");
    await auditLink.click();
    await page.waitForTimeout(500);
    // out of detail mode → audit-log-mode
    await expect(page.locator("body")).not.toHaveClass(/admin-account-detail-mode/);
    await expect(page.locator("body")).toHaveClass(/audit-log-mode/);
    // audit search filtered by reference
    await expect(page.locator("#audit-search")).toHaveValue("AUD-88205");
    // toast shows
    const toast = page.locator("#success-toast");
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("AUD-88205");
    await expect(toast).toContainText("Audit Log");
  });

  // ---- 6. cross-module: from Audit Log back to Admin Accounts ----

  test("6. cross-module: จาก Audit Log กลับ Settings > Admin Accounts ได้", async ({ page }) => {
    await openDetail(page, "ADM-006");
    // click audit link → audit log
    await page.locator(".admin-account-detail-page .admin-account-action-section tbody tr").nth(0).locator("button.history-audit-link").click();
    await page.waitForTimeout(500);
    await expect(page.locator("body")).toHaveClass(/audit-log-mode/);
    // back to Admin Accounts via nav — Settings submenu ขยายอยู่แล้ว (audit เป็น sub ของ settings)
    await ensureNavOpen(page);
    if (!(await isSettingsSubmenuExpanded(page))) {
      await page.locator(".nav-item[data-module='settings']").click();
      await page.waitForTimeout(300);
      await ensureNavOpen(page);
    }
    await page.locator(".submenu[data-submenu='settings'] button[data-module='settings'][data-sub='Admin Accounts']").click();
    await page.waitForTimeout(300);
    // back to admin-account-list-mode
    await expect(page.locator("body")).toHaveClass(/admin-account-list-mode/);
    await expect(page.locator("body")).not.toHaveClass(/audit-log-mode/);
    // list renders correctly
    await expect(page.locator(".admin-account-row")).toHaveCount(10);
    await expect(page.locator("#page-title")).toHaveText("Admin Accounts");
  });

  // ---- 7. navigation back + filter state persistence ----

  test("7. navigation back: detail → back กลับ list (filter คงอยู่); สลับ module แล้วกลับมา filter state ถูกล้าง", async ({ page }) => {
    await goToAdminAccounts(page);
    // set filter: search + status
    await page.locator("#admin-account-search").fill("orn admin");
    await page.waitForTimeout(300);
    await pickCustomOption(page, "admin-account-status-filter", "Active");
    await page.waitForTimeout(300);
    // verify filtered state
    expect(await rowIds(page)).toEqual(["ADM-005"]);

    // (a) detail → back → list: filter state persists
    await page.locator('.admin-account-row[data-admin-account-card="ADM-005"] .user-cell-primary[data-label="Admin ID"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/admin-account-detail-mode/);
    await page.locator("[data-admin-account-back]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/admin-account-list-mode/);
    // filter state restored
    await expect(page.locator("#admin-account-search")).toHaveValue("orn admin");
    expect(await selectValue(page, "admin-account-status-filter")).toBe("Active");
    expect(await rowIds(page)).toEqual(["ADM-005"]);

    // (b) list → switch module → come back: filter state cleared
    // (resetListFilterPanelsForNavigation clears saved filter on module switch)
    await ensureNavOpen(page);
    await page.locator(".nav-item[data-module='dashboard']").click();
    await page.waitForTimeout(300);
    // go back to Admin Accounts
    await ensureNavOpen(page);
    await page.locator(".nav-item[data-module='settings']").click();
    await page.waitForTimeout(300);
    await ensureNavOpen(page);
    await page.locator(".submenu[data-submenu='settings'] button[data-module='settings'][data-sub='Admin Accounts']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/admin-account-list-mode/);
    // filter state cleared — search empty, status reset to all
    await expect(page.locator("#admin-account-search")).toHaveValue("");
    expect(await selectValue(page, "admin-account-status-filter")).toBe("");
    // all 10 rows back
    expect(await rowIds(page)).toHaveLength(10);
  });

  // ---- 8. modal responsive: action + invite + change-role readable on mobile ----

  test("8. modal responsive: action/invite/change-role modal อ่านได้บน mobile ไม่ overflow", async ({ page }) => {
    const mobile = await isMobile(page);
    if (!mobile) { test.skip(); return; }
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    // (a) action modal (suspend) — via row menu
    await goToAdminAccounts(page);
    await openActionFromRowMenu(page, "ADM-001", "suspend");
    const modal = page.locator("#user-action-modal");
    await expect(modal).toHaveClass(/show/);
    const modalCard = modal.locator(".user-action-modal");
    const modalBox = await modalCard.boundingBox();
    expect(modalBox.width).toBeLessThanOrEqual(viewportWidth);
    // modal content readable (title + fields visible)
    await expect(modal.locator("#user-action-modal-title")).toBeVisible();
    await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
    await page.waitForTimeout(200);

    // (b) invite modal — via page actions
    await page.locator("#page-actions [data-admin-account-invite-open]").click();
    await page.waitForTimeout(300);
    await expect(modal).toHaveClass(/show/);
    const inviteBox = await modalCard.boundingBox();
    expect(inviteBox.width).toBeLessThanOrEqual(viewportWidth);
    // invite form visible
    await expect(modal.locator("#admin-account-invite-name")).toBeVisible();
    await expect(modal.locator("#admin-account-invite-email")).toBeVisible();
    await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
    await page.waitForTimeout(200);

    // (c) change role modal — via row menu
    await openChangeRoleFromRowMenu(page, "ADM-001");
    await expect(modal).toHaveClass(/show/);
    const changeRoleBox = await modalCard.boundingBox();
    expect(changeRoleBox.width).toBeLessThanOrEqual(viewportWidth);
    // change role form visible
    await expect(modal.locator("#admin-account-change-role")).toHaveCount(1);
    await expect(modal.locator("#admin-account-change-role-reason")).toHaveCount(1);
    await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
    await page.waitForTimeout(200);
  });

  // ---- 9. nav sidebar mobile: toggle #menu-toggle before clicking submenu ----

  test("9. nav sidebar mobile (≤1180px): sidebar ซ่อนโดย default → toggle #menu-toggle เปิด → คลิก submenu ได้", async ({ page }) => {
    const narrow = await isNarrow(page);
    if (!narrow) { test.skip(); return; }
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    // sidebar hidden by default on ≤1180px
    const navOpenBefore = await page.evaluate(() => document.body.classList.contains("nav-open"));
    expect(navOpenBefore).toBe(false);
    // toggle opens sidebar
    await page.locator("#menu-toggle").click();
    await page.waitForTimeout(300);
    const navOpenAfter = await page.evaluate(() => document.body.classList.contains("nav-open"));
    expect(navOpenAfter).toBe(true);
    // can click Settings > Admin Accounts
    await page.locator(".nav-item[data-module='settings']").click();
    await page.waitForTimeout(300);
    await ensureNavOpen(page);
    await page.locator(".submenu[data-submenu='settings'] button[data-module='settings'][data-sub='Admin Accounts']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/admin-account-list-mode/);
  });

  // ---- 10. no horizontal scroll on mobile/tablet ----

  test("10. ไม่มี horizontal scroll บน mobile/tablet ของ list + detail", async ({ page }) => {
    const narrow = await isNarrow(page);
    if (!narrow) { test.skip(); return; }

    // list page — no horizontal scroll
    await goToAdminAccounts(page);
    const listHasScroll = await hasHorizontalScroll(page);
    expect(listHasScroll).toBe(false);

    // detail page — no horizontal scroll
    await openDetail(page, "ADM-006");
    const detailHasScroll = await hasHorizontalScroll(page);
    expect(detailHasScroll).toBe(false);
  });
});
