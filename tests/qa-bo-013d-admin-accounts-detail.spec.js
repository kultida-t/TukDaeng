// QA-BO-013d: Settings > Admin Accounts — Detail page (strict Playwright spec)
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล — renderAdminAccountDetail() (บรรทัด ~22603)
//   + roleMenuAccess matrix (บรรทัด ~22401) + mock detail activity/auditRefs (บรรทัด ~17004)
// เป้าหมาย: รันเทสครอบ Admin Account Detail page — head, sections, history, audit link, action buttons, empty state (ห้ามแก้ prototype)
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

// helper: เปิด detail ของ account ผ่านการคลิก cell Admin ID (ไม่ใช้ row menu)
async function openDetail(page, id) {
  await goToAdminAccounts(page);
  await page.locator(`.admin-account-row[data-admin-account-card="${id}"] .user-cell-primary[data-label="Admin ID"]`).click();
  await page.waitForTimeout(300);
}

// helper: locator ของ detail page container
function detailPage(page) {
  return page.locator(".user-detail-page.admin-account-detail-page");
}

// helper: อ่านข้อความปุ่ม action ทั้งหมดใน detail (user-detail-actions)
async function detailActionButtonTexts(page) {
  return await page.locator(".admin-account-detail-page .user-detail-actions button")
    .allTextContents()
    .then(texts => texts.map(t => t.trim()));
}

// ==================== D. DETAIL PAGE ====================

test.describe("QA-BO-013d: Settings > Admin Accounts — detail page", () => {

  test("1. คลิก row → เข้า detail (body class admin-account-detail-mode)", async ({ page }) => {
    await openDetail(page, "ADM-001");
    await expect(page.locator("body")).toHaveClass(/admin-account-detail-mode/);
    await expect(page.locator("body")).not.toHaveClass(/admin-account-list-mode/);
  });

  test("2. breadcrumb = 'เครื่องมือ & รายงาน / Settings / Admin Accounts / ADM-xxx'", async ({ page }) => {
    await openDetail(page, "ADM-006");
    await expect(page.locator("#crumb")).toHaveText("เครื่องมือ & รายงาน / Settings / Admin Accounts / ADM-006");
  });

  test("3. #page-title = 'Admin Account Detail', #panel-title = ADM-xxx, #panel-subtitle = 'fullName · role'", async ({ page }) => {
    await openDetail(page, "ADM-003");
    await expect(page.locator("#page-title")).toHaveText("Admin Account Detail");
    await expect(page.locator("#panel-title")).toHaveText("ADM-003");
    await expect(page.locator("#panel-subtitle")).toHaveText("มะลิ จันทร์ดี · Trust & Safety Moderator");
  });

  test("4. back button (data-admin-account-back) → กลับ list", async ({ page }) => {
    await openDetail(page, "ADM-001");
    const backBtn = page.locator("[data-admin-account-back]");
    await expect(backBtn).toBeVisible();
    // ปุ่ม back เป็น icon button (aria-label="Back") — ไม่มี visible text
    await expect(backBtn).toHaveAttribute("aria-label", "Back");
    await backBtn.click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/admin-account-list-mode/);
    await expect(page.locator("body")).not.toHaveClass(/admin-account-detail-mode/);
  });

  test("5. detail head: 'ADM-xxx : fullName' + status pill + role pill + Master badge (เฉพาะ ADM-010)", async ({ page }) => {
    // (a) account ธรรมดา — มี status pill + role pill แต่ไม่มี Master badge
    await openDetail(page, "ADM-001");
    const head = detailPage(page).locator(".user-detail-head");
    await expect(head.locator(".asset-report-id")).toHaveText("ADM-001");
    await expect(head.locator(".user-display-name")).toHaveText("สมชาย บริหาร");
    await expect(head.locator(".chips .pill.green")).toHaveText("Active");
    await expect(head.locator(".chips .pill.purple")).toHaveText("Super Admin");
    expect(await head.locator(".chips .pill-master").count()).toBe(0);

    // (b) master admin (ADM-010) — มี Master badge ด้วย
    await openDetail(page, "ADM-010");
    const masterHead = detailPage(page).locator(".user-detail-head");
    await expect(masterHead.locator(".asset-report-id")).toHaveText("ADM-010");
    await expect(masterHead.locator(".user-display-name")).toHaveText("ผู้ดูแลระบบ");
    await expect(masterHead.locator(".chips .pill.pill-master")).toHaveText("Master");
    await expect(masterHead.locator(".chips .pill.green")).toHaveText("Active");
    await expect(masterHead.locator(".chips .pill.purple")).toHaveText("Super Admin");
  });

  test("6. Section Account Summary: tiles Email / Created At / Last Login", async ({ page }) => {
    await openDetail(page, "ADM-002");
    const section = detailPage(page).locator(".detail-section", { hasText: "Account Summary" });
    await expect(section).toBeVisible();
    const tiles = section.locator(".detail-tile");
    await expect(tiles).toHaveCount(3);
    // Email
    await expect(tiles.nth(0).locator("span")).toHaveText("Email");
    await expect(tiles.nth(0).locator("strong")).toHaveText("ornnuch@tukdaeng.example");
    // Created At
    await expect(tiles.nth(1).locator("span")).toHaveText("Created At");
    await expect(tiles.nth(1).locator("strong")).toHaveText("15 Jan 2026 10:30");
    // Last Login
    await expect(tiles.nth(2).locator("span")).toHaveText("Last Login");
    await expect(tiles.nth(2).locator("strong")).toHaveText("08 Sep 2026 11:05");
  });

  test("7. Section Role & Permissions: ตาราง เมนู/สิทธิ์/หมายเหตุ — แสดงเฉพาะเมนูที่ level ≠ none", async ({ page }) => {
    // (a) Super Admin (ADM-001) — ทุกเมนู manage/view = 9 rows (ไม่มี none)
    await openDetail(page, "ADM-001");
    let section = detailPage(page).locator(".detail-section", { hasText: "Role & Permissions" });
    await expect(section).toBeVisible();
    let rows = section.locator("tbody tr");
    await expect(rows).toHaveCount(9);
    // หัวตาราง 3 คอลัมน์
    await expect(section.locator("thead th")).toHaveText(["เมนู / Module", "สิทธิ์", "หมายเหตุ"]);
    // Super Admin: Dashboard=manage(green/จัดการ), Market Data=view(blue/ดูอย่างเดียว)
    await expect(rows.first().locator("td").nth(0)).toHaveText("Dashboard");
    await expect(rows.first().locator(".pill.green")).toHaveText("จัดการ");
    const marketDataRow = section.locator("tbody tr", { hasText: "Market Data" });
    await expect(marketDataRow.locator(".pill.blue")).toHaveText("ดูอย่างเดียว");
    await expect(marketDataRow.locator(".history-note")).toHaveText("ซิงก์จาก provider — ไม่แก้จาก BO");

    // (b) Content Editor (ADM-005) — เฉพาะ 3 เมนูที่ไม่ใช่ none
    await openDetail(page, "ADM-005");
    section = detailPage(page).locator(".detail-section", { hasText: "Role & Permissions" });
    rows = section.locator("tbody tr");
    await expect(rows).toHaveCount(3);
    const menuNames = await rows.evaluateAll(rs => rs.map(r => r.querySelector("td")?.textContent?.trim()));
    expect(menuNames).toEqual(["Dashboard", "Content Management", "Market Demand"]);
    // Content Management = limited (amber/จัดการบางส่วน)
    const contentRow = section.locator("tbody tr", { hasText: "Content Management" });
    await expect(contentRow.locator(".pill.amber")).toHaveText("จัดการบางส่วน");

    // (c) Support Agent (ADM-006) — 5 เมนูที่ไม่ใช่ none
    await openDetail(page, "ADM-006");
    section = detailPage(page).locator(".detail-section", { hasText: "Role & Permissions" });
    rows = section.locator("tbody tr");
    await expect(rows).toHaveCount(5);
    // Settings & Audit Log = limited (เฉพาะ Support Center)
    const settingsRow = section.locator("tbody tr", { hasText: "Settings & Audit Log" });
    await expect(settingsRow.locator(".pill.amber")).toHaveText("จัดการบางส่วน");
    await expect(settingsRow.locator(".history-note")).toHaveText("เฉพาะ Support Center และ Delivery Logs ที่เกี่ยวข้อง");
  });

  test("8. Section History & Actions: ตาราง วันที่/Action/Reference/Delivery/Audit/รายละเอียด + ปุ่ม action", async ({ page }) => {
    await openDetail(page, "ADM-006");
    const section = detailPage(page).locator(".admin-account-action-section");
    await expect(section).toBeVisible();
    await expect(section.locator("h4")).toHaveText("History & Actions");
    // หัวตาราง 6 คอลัมน์ (AIL-007: แยก Delivery ออกจาก Reference)
    await expect(section.locator("thead th")).toHaveText(["วันที่ / เวลา", "Action", "Reference", "Delivery", "Audit", "รายละเอียด"]);
    // ADM-006 มี 3 activity rows
    const rows = section.locator("tbody tr");
    await expect(rows).toHaveCount(3);
    // row แรก = Suspended (ล่าสุดก่อน)
    await expect(rows.nth(0).locator("td").nth(0)).toHaveText("21 Aug 2026 09:00");
    await expect(rows.nth(0).locator("td").nth(1)).toHaveText("Suspended");
    await expect(rows.nth(0).locator("td").nth(2)).toHaveText("ADM-001");
    // Suspended ไม่มี delivery attempt → Delivery = —
    await expect(rows.nth(0).locator("td").nth(3)).toHaveText("—");
    await expect(rows.nth(0).locator("td").nth(5)).toHaveText("ตรวจสอบการเข้าถึงข้อมูลผู้ใช้นอก scope");
    // มี action buttons area
    await expect(section.locator(".user-detail-actions")).toBeVisible();
  });

  test("9. audit link pill (history-audit-link) แสดงเมื่อมี auditRef, แสดง '—' เมื่อ null", async ({ page }) => {
    await openDetail(page, "ADM-006");
    const section = detailPage(page).locator(".admin-account-action-section");
    const rows = section.locator("tbody tr");
    // ADM-006 auditRefs = ["AUD-88205", null, "AUD-88207"]
    // row 0: AUD-88205 → แสดงปุ่ม link
    const auditCell0 = rows.nth(0).locator('[data-label="Audit"]');
    await expect(auditCell0.locator("button.history-audit-link")).toHaveText("AUD-88205");
    await expect(auditCell0.locator("button.history-audit-link")).toHaveAttribute("data-admin-account-audit-ref", "AUD-88205");
    // row 1: null → แสดง "—"
    const auditCell1 = rows.nth(1).locator('[data-label="Audit"]');
    await expect(auditCell1).toHaveText("—");
    expect(await auditCell1.locator("button.history-audit-link").count()).toBe(0);
    // row 2: AUD-88207 → แสดงปุ่ม link
    const auditCell2 = rows.nth(2).locator('[data-label="Audit"]');
    await expect(auditCell2.locator("button.history-audit-link")).toHaveText("AUD-88207");

    // ADM-001 auditRefs = [null] → แสดง "—" เท่านั้น
    await openDetail(page, "ADM-001");
    const section1 = detailPage(page).locator(".admin-account-action-section");
    const rows1 = section1.locator("tbody tr");
    await expect(rows1.nth(0).locator('[data-label="Audit"]')).toHaveText("—");
    expect(await rows1.nth(0).locator("button.history-audit-link").count()).toBe(0);
  });

  test("10. action buttons ใน detail ตรงกับ row menu ตามสถานะ (เปลี่ยน Role/ระงับ/ยกเลิก/ปลดล็อก/เก็บถาวร)", async ({ page }) => {
    // Active (ADM-001): เปลี่ยน Role + ระงับ
    await openDetail(page, "ADM-001");
    expect(await detailActionButtonTexts(page)).toEqual(["เปลี่ยน Role", "ระงับ"]);

    // Suspended (ADM-006): ยกเลิกการระงับ + เก็บถาวร
    await openDetail(page, "ADM-006");
    expect(await detailActionButtonTexts(page)).toEqual(["ยกเลิกการระงับ", "เก็บถาวร"]);

    // Locked (ADM-007): ระงับ + ปลดล็อก + เก็บถาวร
    await openDetail(page, "ADM-007");
    expect(await detailActionButtonTexts(page)).toEqual(["ระงับ", "ปลดล็อก", "เก็บถาวร"]);

    // Invited (ADM-008): เปลี่ยน Role + ระงับ
    await openDetail(page, "ADM-008");
    expect(await detailActionButtonTexts(page)).toEqual(["เปลี่ยน Role", "ระงับ"]);

    // Archived (ADM-009): ไม่มี action button
    await openDetail(page, "ADM-009");
    expect(await detailActionButtonTexts(page)).toEqual([]);

    // Master/self (ADM-010): ไม่มี action button
    await openDetail(page, "ADM-010");
    expect(await detailActionButtonTexts(page)).toEqual([]);
  });

  test("11. account ที่ไม่มี activity → แสดง 'ไม่มีประวัติการใช้งาน' (empty detail)", async ({ page }) => {
    await goToAdminAccounts(page);
    // ล้าง activity ของ ADM-004 ชั่วคราวเพื่อจำลอง account ที่ไม่มี activity
    // adminAccountData เป็น const ใน global lexical scope (ไม่ใช่ window property) — เข้าถึงได้โดยตรง
    await page.evaluate(() => {
      if (typeof adminAccountData !== "undefined" && adminAccountData.detail && adminAccountData.detail["ADM-004"]) {
        adminAccountData.detail["ADM-004"].activity = [];
        adminAccountData.detail["ADM-004"].auditRefs = [];
      }
    });
    // เปิด detail ADM-004
    await page.locator(`.admin-account-row[data-admin-account-card="ADM-004"] .user-cell-primary[data-label="Admin ID"]`).click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/admin-account-detail-mode/);
    // empty state แสดง
    const section = detailPage(page).locator(".admin-account-action-section");
    await expect(section.locator(".detail-empty")).toBeVisible();
    await expect(section.locator(".detail-empty")).toHaveText("ไม่มีประวัติการใช้งาน");
    // ไม่มีตาราง history
    expect(await section.locator("table.history-table").count()).toBe(0);
    // แต่ยังมี action buttons area (ตามสถานะ)
    await expect(section.locator(".user-detail-actions")).toBeVisible();
  });

  test("12. คลิก row ของ account ที่ไม่มี detail data → ไม่พัง (fallback {})", async ({ page }) => {
    await goToAdminAccounts(page);
    // ลบ detail entry ของ ADM-005 ทั้งหมดเพื่อจำลอง account ที่ไม่มี detail data
    await page.evaluate(() => {
      if (typeof adminAccountData !== "undefined" && adminAccountData.detail) {
        delete adminAccountData.detail["ADM-005"];
      }
    });
    // คลิกเข้า detail ADM-005 — ไม่พัง (fallback {} → activity = [])
    await page.locator(`.admin-account-row[data-admin-account-card="ADM-005"] .user-cell-primary[data-label="Admin ID"]`).click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/admin-account-detail-mode/);
    // detail page ยังแสดง — head + summary + role section ปกติ
    await expect(detailPage(page)).toBeVisible();
    await expect(page.locator("#panel-title")).toHaveText("ADM-005");
    // history section แสดง empty state (activity = [] จาก fallback)
    const section = detailPage(page).locator(".admin-account-action-section");
    await expect(section.locator(".detail-empty")).toBeVisible();
    await expect(section.locator(".detail-empty")).toHaveText("ไม่มีประวัติการใช้งาน");
    // Account Summary tiles ยังแสดงข้อมูลจาก account record (ไม่ใช่ detail)
    const summarySection = detailPage(page).locator(".detail-section", { hasText: "Account Summary" });
    await expect(summarySection.locator(".detail-tile").first().locator("strong")).toHaveText("orn@tukdaeng.example");
  });

  test("13. คลิก audit link → ไป Audit Log กรองด้วย reference (cross-module)", async ({ page }) => {
    await openDetail(page, "ADM-006");
    const section = detailPage(page).locator(".admin-account-action-section");
    // คลิก audit link แรก (AUD-88205)
    const auditLink = section.locator("tbody tr").nth(0).locator("button.history-audit-link");
    await expect(auditLink).toHaveText("AUD-88205");
    await auditLink.click();
    await page.waitForTimeout(500);
    // ออกจาก detail mode → เข้า audit-log-mode
    await expect(page.locator("body")).not.toHaveClass(/admin-account-detail-mode/);
    await expect(page.locator("body")).toHaveClass(/audit-log-mode/);
    // audit search กรองด้วย reference
    const auditSearch = page.locator("#audit-search");
    await expect(auditSearch).toHaveValue("AUD-88205");
    // toast แสดง
    const toast = page.locator("#success-toast");
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("AUD-88205");
  });
});
