// QA-BO-014e: Settings > Audit Log — Cross-module jump & responsive (strict Playwright spec)
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล — jumpToAuditReference() + [data-audit-ref] / [data-admin-account-audit-ref] handlers
// เป้าหมาย: รันเทสครอบ cross-module jump 2 ทิศทาง
//   ขาเข้า: audit ref link จาก Admin Account Detail + Deletion Request Detail → Audit Log กรองด้วย event id + toast
//   ขาออก: Reference pill ใน detail drawer → entity detail ตาม prefix (ADM/DEL/AST/ART/RCO/U-) หรือ fallback กรอง
//   + filter state เมื่อ jump เข้ามา + back navigation + responsive ทุก viewport (ห้ามแก้ prototype)
// หมายเหตุ: Dashboard → Audit Log jump ถูกตัดออกจาก scope (decision 16/09) — spec นี้ไม่ cover
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

// helper: ตรวจว่า page มี horizontal scroll หรือไม่ (scrollWidth > innerWidth)
async function hasHorizontalScroll(page) {
  return await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
}

// helper: ไปหน้า Audit Log ผ่านเมนู Settings > Audit Log
async function goToAuditLog(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  if (!(await isSettingsSubmenuExpanded(page))) {
    await page.locator(".nav-item[data-module='settings']").click();
    await page.waitForTimeout(300);
    await ensureNavOpen(page);
  }
  await page.locator(".submenu[data-submenu='settings'] button[data-module='audit'][data-sub='Audit Log']").click();
  await page.waitForTimeout(300);
}

// helper: ไปหน้า Admin Accounts List ผ่านเมนู Settings > Admin Accounts
async function goToAdminAccounts(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  if (!(await isSettingsSubmenuExpanded(page))) {
    await page.locator(".nav-item[data-module='settings']").click();
    await page.waitForTimeout(300);
    await ensureNavOpen(page);
  }
  await page.locator(".submenu[data-submenu='settings'] button[data-module='settings'][data-sub='Admin Accounts']").click();
  await page.waitForTimeout(300);
}

// helper: เปิด Admin Account Detail ผ่านการคลิก cell Admin ID (ผ่าน UI จริง)
async function openAdminDetail(page, id) {
  await goToAdminAccounts(page);
  await page.locator(`.admin-account-row[data-admin-account-card="${id}"] .user-cell-primary[data-label="Admin ID"]`).click();
  await page.waitForTimeout(300);
  await page.waitForSelector(".admin-account-detail-mode", { timeout: 5000 });
}

// helper: ไปหน้า Deletion Request Detail ผ่าน UI จริง (nav Account Deletion → คลิก row)
async function openDeletionDetail(page, reqId) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  await page.locator(".nav-item[data-module='deletions']").click();
  await page.waitForSelector(".deletion-list-mode", { timeout: 5000 });
  await page.locator(`.deletion-row[data-deletion-card="${reqId}"] .user-cell-primary[data-label="Request ID"]`).click();
  await page.waitForSelector(".deletion-detail-mode", { timeout: 5000 });
}

// helper: เปิด detail drawer ด้วยการคลิก primary cell ของ row (ผ่าน UI จริง)
async function openDrawer(page, eventId) {
  await page.locator(`.audit-row[data-audit-event="${eventId}"] .user-cell-primary`).click();
  await page.waitForSelector("#user-action-modal.show .audit-log-detail-modal", { timeout: 5000 });
}

// helper: เปิด filter bar ถ้ายังปิด (เฉพาะเมื่อปุ่ม toggle มองเห็น — mobile ≤760px)
async function openFilterBar(page) {
  const toggle = page.locator("#user-panel-filter-actions [data-audit-filter-toggle]");
  if (!(await toggle.isVisible().catch(() => false))) return;
  const bar = page.locator(".user-filter-bar.audit-filter-bar");
  const isOpen = await bar.getAttribute("data-filter-open");
  if (isOpen === "false") {
    await toggle.click();
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

// helper: อ่าน Event ID ของทุก row ในหน้าปัจจุบัน (เรียงตาม DOM)
async function rowIds(page) {
  return await page.locator(".audit-row").evaluateAll(rows =>
    rows.map(r => r.getAttribute("data-audit-event")));
}

// helper: assertion มาตรฐานหลัง jump เข้า Audit Log ด้วย event id
async function expectJumpedToAuditLog(page, eventId) {
  await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
  // กรองด้วย event id → เหลือ row เดียว
  await expect(page.locator("#audit-search")).toHaveValue(eventId);
  expect(await rowIds(page)).toEqual([eventId]);
  await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 1-1 จาก 1");
  // toast ยืนยันการกระโดด
  const toast = page.locator("#success-toast");
  await expect(toast).toBeVisible();
  await expect(toast).toContainText(eventId);
  await expect(toast).toContainText("Audit Log");
  // header context เปลี่ยนเป็น Audit Log
  await expect(page.locator("#crumb")).toHaveText("เครื่องมือ & รายงาน / Settings / Audit Log");
  await expect(page.locator("#panel-title")).toHaveText("Audit Log List");
}

// ==================== E. CROSS-MODULE JUMP & RESPONSIVE ====================

test.describe("QA-BO-014e: Settings > Audit Log — cross-module jump & responsive", () => {

  // ---- ขาเข้า: Admin Accounts Detail → Audit Log (regression — มีอยู่แล้ว) ----

  test("1. Admin Detail → Audit Log: คลิก audit link AUD-88205 (ADM-006 Suspended) → กรองด้วย event id + toast", async ({ page }) => {
    await openAdminDetail(page, "ADM-006");
    // History & Actions — row แรก (Suspended) มี audit ref AUD-88205
    const auditLink = page.locator(".admin-account-detail-page .admin-account-action-section .history-table [data-admin-account-audit-ref='AUD-88205']");
    await expect(auditLink).toHaveText("AUD-88205");
    await auditLink.click();
    await expectJumpedToAuditLog(page, "AUD-88205");
    // ออกจาก detail mode แล้ว
    await expect(page.locator("body")).not.toHaveClass(/admin-account-detail-mode/);
  });

  test("2. Admin Detail history: row ที่ไม่มี audit ref แสดง '—' (ADM-006 มี null กลาง list)", async ({ page }) => {
    await openAdminDetail(page, "ADM-006");
    // ADM-006 auditRefs = ["AUD-88205", null, "AUD-88207"] — row ที่ 2 ต้องเป็น —
    const auditCells = await page.locator(".admin-account-detail-page .admin-account-action-section .history-table td[data-label='Audit']").allTextContents();
    expect(auditCells).toContain("—");
  });

  // ---- ขาเข้า: Account Deletion Detail → Audit Log (AL-005) ----

  test("3. Deletion Detail → Audit Log: คลิก audit link AUD-88195 (DEL-033 ขอลบบัญชี) → กรองด้วย event id + toast", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    const auditLink = page.locator(".deletion-detail-page .history-table [data-audit-ref='AUD-88195']");
    await expect(auditLink).toHaveText("AUD-88195");
    await auditLink.click();
    await expectJumpedToAuditLog(page, "AUD-88195");
    await expect(page.locator("body")).not.toHaveClass(/deletion-detail-mode/);
  });

  test("4. Deletion Detail → Audit Log: audit link AUD-88198 (DEL-028 ปฏิเสธคืนบัญชี)", async ({ page }) => {
    await openDeletionDetail(page, "DEL-028");
    const auditLink = page.locator(".deletion-detail-page .history-table [data-audit-ref='AUD-88198']");
    await expect(auditLink).toHaveText("AUD-88198");
    await auditLink.click();
    await expectJumpedToAuditLog(page, "AUD-88198");
    // event อ้างอิงกลับ request เดิม
    await expect(page.locator(".audit-log-table")).toContainText("DEL-028");
  });

  test("5. Deletion Detail history: row ที่ไม่มี audit event แสดง '—' (DEL-033)", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    // "ยกเลิก session" / "ระงับบัญชี" ไม่มี event ใน auditLogData → —
    const auditCells = await page.locator(".deletion-detail-page .history-table td[data-label='Audit']").allTextContents();
    expect(auditCells).toContain("—");
  });

  // ---- ขาออก: Reference pill ใน drawer → entity detail ตาม prefix ----

  test("6. ref pill AST-8831 (AUD-88201) → Asset Detail", async ({ page }) => {
    await goToAuditLog(page);
    await openDrawer(page, "AUD-88201");
    const pill = page.locator(".audit-detail-ref-pill");
    await expect(pill).toHaveText("AST-8831");
    await pill.click();
    // drawer ปิด + ไปหน้า Asset Detail
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    await page.waitForSelector(".asset-detail-mode", { timeout: 5000 });
    await expect(page.locator("body")).not.toHaveClass(/audit-log-mode/);
    await expect(page.locator("#page-title")).toHaveText("Asset Detail");
    await expect(page.locator("#panel-subtitle")).toContainText("AST-8831");
    await expect(page.locator("#crumb")).toContainText("AST-8831");
  });

  test("7. ref pill ADM-008 (AUD-88203) → Admin Account Detail", async ({ page }) => {
    await goToAuditLog(page);
    await openDrawer(page, "AUD-88203");
    await page.locator(".audit-detail-ref-pill").click();
    await page.waitForSelector(".admin-account-detail-mode", { timeout: 5000 });
    await expect(page.locator("#panel-title")).toHaveText("ADM-008");
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
  });

  test("8. ref pill DEL-028 (AUD-88198) → Deletion Request Detail", async ({ page }) => {
    await goToAuditLog(page);
    await openDrawer(page, "AUD-88198");
    await page.locator(".audit-detail-ref-pill").click();
    await page.waitForSelector(".deletion-detail-mode", { timeout: 5000 });
    await expect(page.locator("#panel-title")).toHaveText("DEL-028");
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
  });

  test("9. ref pill U-1002 (AUD-88072) → User Detail", async ({ page }) => {
    await goToAuditLog(page);
    // AUD-88072 อยู่หน้า 2 — ค้นหาก่อนให้ row อยู่หน้า 1
    await page.locator("#audit-search").fill("AUD-88072");
    await page.waitForTimeout(300);
    await openDrawer(page, "AUD-88072");
    const pill = page.locator(".audit-detail-ref-pill");
    await expect(pill).toHaveText("U-1002");
    await pill.click();
    await page.waitForSelector(".user-detail-mode", { timeout: 5000 });
    await expect(page.locator("#page-title")).toHaveText("User Detail");
    await expect(page.locator("#panel-subtitle")).toContainText("U-1002");
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
  });

  test("10. ref pill ART-044 (AUD-88172) → Article Detail", async ({ page }) => {
    await goToAuditLog(page);
    await openDrawer(page, "AUD-88172");
    const pill = page.locator(".audit-detail-ref-pill");
    await expect(pill).toHaveText("ART-044");
    await pill.click();
    await expect(page.locator("#page-title")).toHaveText("Article Detail", { timeout: 5000 });
    await expect(page.locator("#panel-subtitle")).toContainText("ART-044");
    await expect(page.locator("body")).not.toHaveClass(/audit-log-mode/);
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
  });

  test("11. ref pill RCO-690 (AUD-88098) → Reported Comment Detail", async ({ page }) => {
    await goToAuditLog(page);
    await openDrawer(page, "AUD-88098");
    const pill = page.locator(".audit-detail-ref-pill");
    await expect(pill).toHaveText("RCO-690");
    await pill.click();
    await expect(page.locator("#page-title")).toHaveText("Report Detail", { timeout: 5000 });
    await expect(page.locator("#panel-subtitle")).toContainText("RCO-690");
    await expect(page.locator("body")).not.toHaveClass(/audit-log-mode/);
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
  });

  test("12. ref pill ที่ map ไม่ได้ (RPT-USER, AUD-88120) → fallback กรอง Audit Log ด้วย ref + toast", async ({ page }) => {
    await goToAuditLog(page);
    await openDrawer(page, "AUD-88120");
    const pill = page.locator(".audit-detail-ref-pill");
    await expect(pill).toHaveText("RPT-USER");
    await pill.click();
    // อยู่ Audit Log เดิม + กรองด้วย RPT-USER
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    await expect(page.locator("#audit-search")).toHaveValue("RPT-USER");
    expect(await rowIds(page)).toEqual(["AUD-88120"]);
    const toast = page.locator("#success-toast");
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("RPT-USER");
  });

  // ---- round trip + back navigation ----

  test("13. round trip: Deletion Detail → audit link → drawer → ref pill กลับ Deletion Detail เดิม", async ({ page }) => {
    await openDeletionDetail(page, "DEL-028");
    // ขาไป: history audit link → Audit Log
    await page.locator(".deletion-detail-page .history-table [data-audit-ref='AUD-88198']").click();
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    // เปิด drawer ของ event ที่เพิ่ง jump มา → ref pill กลับ DEL-028
    await openDrawer(page, "AUD-88198");
    await page.locator(".audit-detail-ref-pill").click();
    await page.waitForSelector(".deletion-detail-mode", { timeout: 5000 });
    await expect(page.locator("#panel-title")).toHaveText("DEL-028");
  });

  test("14. back nav: ref pill → entity detail → ปุ่ม back กลับ Audit Log พร้อม filter state เดิม", async ({ page }) => {
    await goToAuditLog(page);
    // set module filter = Account Deletion → 7 rows (บันทึกลง listFilterState เมื่อ jump ออก)
    await pickCustomOption(page, "audit-module-filter", "Account Deletion");
    await page.waitForTimeout(300);
    const idsBefore = await rowIds(page);
    expect(idsBefore).toHaveLength(7);
    // jump ออกผ่าน ref pill → Deletion Detail → กด back ของหน้า
    await openDrawer(page, "AUD-88198");
    await page.locator(".audit-detail-ref-pill").click();
    await page.waitForSelector(".deletion-detail-mode", { timeout: 5000 });
    await page.locator(".page-back-btn").first().click();
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    // filter state restore — module filter + rows เหมือนก่อน jump ออก
    expect(await selectValue(page, "audit-module-filter")).toBe("Account Deletion");
    expect(await rowIds(page)).toEqual(idsBefore);
  });

  // ---- filter state เมื่อ jump เข้ามา ----

  test("15. jump-in เริ่มจาก filter สะอาด: search=ref, module/risk/sort/date เป็น default", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await page.locator(".deletion-detail-page .history-table [data-audit-ref='AUD-88195']").click();
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    await expect(page.locator("#audit-search")).toHaveValue("AUD-88195");
    expect(await selectValue(page, "audit-module-filter")).toBe("");
    expect(await selectValue(page, "audit-risk-filter")).toBe("");
    expect(await selectValue(page, "audit-sort")).toBe("latest");
    expect(await page.locator("#audit-date-from").inputValue()).toBe("");
    expect(await page.locator("#audit-date-to").inputValue()).toBe("");
    expect(await rowIds(page)).toEqual(["AUD-88195"]);
  });

  test("16. filter ค้างจาก session ก่อนหน้าต้องไม่บัง event ที่ jump เข้ามา", async ({ page }) => {
    // สร้างสถานการณ์: audit log filter module=Asset (AUD-88198 ไม่อยู่ใน filter) → jump ออกผ่าน ref pill
    // (pushBackNavigationContext บันทึก filter state ของ audit-log ไว้)
    await goToAuditLog(page);
    await pickCustomOption(page, "audit-module-filter", "Asset");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["AUD-88201"]);
    await openDrawer(page, "AUD-88201");
    await page.locator(".audit-detail-ref-pill").click();
    await page.waitForSelector(".asset-detail-mode", { timeout: 5000 });
    // ไป Deletion list → DEL-028 → คลิก audit link AUD-88198 (event module = Account Deletion)
    await ensureNavOpen(page);
    await page.locator(".nav-item[data-module='deletions']").click();
    await page.waitForSelector(".deletion-list-mode", { timeout: 5000 });
    await page.locator(".deletion-row[data-deletion-card='DEL-028'] .user-cell-primary[data-label='Request ID']").click();
    await page.waitForSelector(".deletion-detail-mode", { timeout: 5000 });
    await page.locator(".deletion-detail-page .history-table [data-audit-ref='AUD-88198']").click();
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    // คาดหวัง: event ที่ jump มาต้องแสดง — filter module=Asset เดิมต้องไม่มาบัง
    await expect(page.locator("#audit-search")).toHaveValue("AUD-88198");
    expect(await rowIds(page)).toEqual(["AUD-88198"]);
  });

  test("17. หลัง jump-in: nav ออกไป module อื่นแล้วกลับมา → filter ถูกล้างตาม standard", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await page.locator(".deletion-detail-page .history-table [data-audit-ref='AUD-88195']").click();
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    await expect(page.locator("#audit-search")).toHaveValue("AUD-88195");
    // nav ไป Dashboard แล้วกลับ Audit Log — search ต้องถูกล้าง (listFilterState reset on module switch)
    await ensureNavOpen(page);
    await page.locator(".nav-item[data-module='dashboard']").click();
    await page.waitForSelector(".dashboard-mode", { timeout: 5000 });
    await ensureNavOpen(page);
    if (!(await isSettingsSubmenuExpanded(page))) {
      await page.locator(".nav-item[data-module='settings']").click();
      await page.waitForTimeout(300);
      await ensureNavOpen(page);
    }
    await page.locator(".submenu[data-submenu='settings'] button[data-module='audit'][data-sub='Audit Log']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#audit-search")).toHaveValue("");
    expect(await rowIds(page)).toHaveLength(10);
  });

  // ---- nav state หลัง jump-in ----

  test("18. jump-in: nav Settings active + submenu ขยาย + Audit Log sub active", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await page.locator(".deletion-detail-page .history-table [data-audit-ref='AUD-88195']").click();
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    await ensureNavOpen(page);
    // parent Settings active + submenu ขยาย
    await expect(page.locator(".nav-item[data-module='settings']")).toHaveClass(/active/);
    await expect(page.locator(".submenu[data-submenu='settings']")).toHaveClass(/open/);
    // sub Audit Log active เหมือนเข้าผ่านเมนู
    await expect(page.locator(".submenu[data-submenu='settings'] button[data-module='audit'][data-sub='Audit Log']")).toHaveClass(/active/);
  });

  // ---- responsive ----

  test("19. filter bar: desktop/tablet บรรทัดเดียว (6 คอลัมน์); mobile 1 คอลัมน์ + toggle ปิดอยู่", async ({ page }) => {
    await goToAuditLog(page);
    const mobile = await isMobile(page);
    const bar = page.locator(".audit-filter-bar");
    const cols = await bar.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    if (mobile) {
      // mobile: filter bar stack 1 คอลัมน์ + ปิดอยู่ตอนเริ่ม
      expect(cols).toBe(1);
      await expect(bar).toHaveAttribute("data-filter-open", "false");
      // search ยังมองเห็น (ใช้รับค่า ref จาก jump ได้)
      await expect(page.locator("#audit-search")).toBeVisible();
    } else {
      // desktop/tablet: search + 3 filters + date range + reset = 6 คอลัมน์บรรทัดเดียว
      expect(cols).toBe(6);
      await expect(page.locator("#audit-search")).toBeVisible();
      await expect(page.locator(".audit-date-range")).toBeVisible();
    }
  });

  test("20. jump-in บน mobile: deletion history card → audit link กดได้ → audit card แสดง event + search มีค่า ref", async ({ page }) => {
    const mobile = await isMobile(page);
    if (!mobile) { test.skip(); return; }
    await openDeletionDetail(page, "DEL-033");
    // mobile: history table เป็น card stack — audit link ยังกดได้
    const auditLink = page.locator(".deletion-detail-page .history-table [data-audit-ref='AUD-88195']");
    await expect(auditLink).toBeVisible();
    await auditLink.click();
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    await expect(page.locator("#audit-search")).toHaveValue("AUD-88195");
    // card layout — head ซ่อน + card แสดง event id
    await expect(page.locator(".audit-log-table .user-row.head")).toBeHidden();
    const card = page.locator(".audit-row[data-audit-event='AUD-88195']");
    await expect(card).toHaveCount(1);
    await expect(card.locator(".user-card-meta")).toBeVisible();
    await expect(card.locator(".user-card-meta-item", { hasText: "Reference" }).locator("strong")).toHaveText("DEL-033");
  });

  test("21. ไม่มี horizontal scroll ของหน้าบน tablet/mobile หลัง jump-in (list เลื่อนใน #table)", async ({ page }) => {
    const narrow = await isNarrow(page);
    if (!narrow) { test.skip(); return; }
    await openDeletionDetail(page, "DEL-033");
    await page.locator(".deletion-detail-page .history-table [data-audit-ref='AUD-88195']").click();
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    expect(await hasHorizontalScroll(page)).toBe(false);
    // เคลียร์ search ให้เห็นตารางเต็ม → หน้ายังไม่เลื่อนแนวนอน
    await page.locator("#audit-search").fill("");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toHaveLength(10);
    expect(await hasHorizontalScroll(page)).toBe(false);
  });
});
