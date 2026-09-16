// QA-BO-014b: Settings > Audit Log — List rendering & pagination (strict Playwright spec)
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล — renderAuditLogRows() + auditLogData.events (24 events)
// เป้าหมาย: รันเทสครอบ list rendering, pill สี, pagination, empty state, read-only, mobile card (ห้ามแก้ prototype)
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

// helper: ไปหน้า Audit Log ผ่านเมนู Settings > Audit Log
async function goToAuditLog(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  await page.locator(".nav-item[data-module='settings']").click();
  await page.waitForTimeout(300);
  await ensureNavOpen(page);
  await page.locator(".submenu[data-submenu='settings'] button[data-module='audit'][data-sub='Audit Log']").click();
  await page.waitForTimeout(300);
}

// helper: locator ของ row ตาม Event ID
function auditRow(page, id) {
  return page.locator(`.audit-row[data-audit-event="${id}"]`);
}

// helper: อ่าน Event ID ของทุก row ในหน้าปัจจุบัน (เรียงตาม DOM)
async function rowIds(page) {
  return await page.locator(".audit-row").evaluateAll(rows =>
    rows.map(r => r.getAttribute("data-audit-event")));
}

// ==================== B. LIST RENDERING & PAGINATION ====================

test.describe("QA-BO-014b: Settings > Audit Log — list rendering & pagination", () => {

  test("1. ตารางมี head 8 คอลัมน์: Event ID / Date / Time / Actor / Action / Module / Risk / Reference / Note", async ({ page }) => {
    await goToAuditLog(page);
    const headCells = page.locator(".audit-log-table .user-row.head > div");
    await expect(headCells).toHaveCount(8);
    await expect(headCells.nth(0)).toHaveText("Event ID");
    await expect(headCells.nth(1)).toHaveText("Date / Time");
    await expect(headCells.nth(2)).toHaveText("Actor");
    await expect(headCells.nth(3)).toHaveText("Action");
    await expect(headCells.nth(4)).toHaveText("Module");
    await expect(headCells.nth(5)).toHaveText("Risk");
    await expect(headCells.nth(6)).toHaveText("Reference");
    await expect(headCells.nth(7)).toHaveText("Note");
  });

  test("2. หน้า 1 แสดง 10 rows เรียงล่าสุดก่อน (default sort = latest)", async ({ page }) => {
    await goToAuditLog(page);
    const rows = page.locator(".audit-row");
    await expect(rows).toHaveCount(10);
    // mock 24 events — หน้าแรกต้องเป็น 10 event ล่าสุดตาม createdAt
    expect(await rowIds(page)).toEqual([
      "AUD-88203", "AUD-88202", "AUD-88201", "AUD-88198", "AUD-88195",
      "AUD-88172", "AUD-88168", "AUD-88120", "AUD-88115", "AUD-88098"
    ]);
  });

  test("3. Risk pill สีถูกต้อง: High=red, Medium=amber, Low=green (label อังกฤษ)", async ({ page }) => {
    await goToAuditLog(page);
    const check = async (id, colorClass, text) => {
      const pill = auditRow(page, id).locator('[data-label="Risk"] .pill');
      await expect(pill).toHaveClass(new RegExp(`\\b${colorClass}\\b`));
      await expect(pill).toHaveText(text);
    };
    await check("AUD-88201", "red", "High");
    await check("AUD-88203", "amber", "Medium");
    await check("AUD-88202", "green", "Low");
  });

  test("4. Module badge สีถูกต้อง: Asset=blue, Content=green, Users=purple, Account Deletion=purple, Reported Comments=amber, Settings=gray", async ({ page }) => {
    await goToAuditLog(page);
    const check = async (id, colorClass, text) => {
      const badge = auditRow(page, id).locator('[data-label="Module"] .pill');
      await expect(badge).toHaveClass(new RegExp(`\\b${colorClass}\\b`));
      await expect(badge).toHaveText(text);
    };
    await check("AUD-88201", "blue", "Asset");
    await check("AUD-88172", "green", "Content");
    await check("AUD-88120", "purple", "Users");
    await check("AUD-88198", "purple", "Account Deletion");
    await check("AUD-88098", "amber", "Reported Comments");
    await check("AUD-88203", "gray", "Settings");
  });

  test("5. pagination 10/page — 24 events = 3 หน้า, footer 'แสดง 1-10 จาก 24'", async ({ page }) => {
    await goToAuditLog(page);
    // footer range (scope ใน #table กันชนกับ footer ของ panel อื่น)
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 1-10 จาก 24");
    const pager = page.locator("#table .footer-range .pager");
    await expect(pager).toBeVisible();
    // หน้า 1: prev disabled, next enabled, page num 1-3
    await expect(pager.locator(".pager-prev")).toBeDisabled();
    await expect(pager.locator(".pager-next")).not.toBeDisabled();
    const pageNums = pager.locator(".pager-num");
    await expect(pageNums).toHaveCount(3);
    await expect(pageNums.first()).toHaveText("1");
    await expect(pageNums.first()).toHaveClass(/active/);
  });

  test("6. เปลี่ยนหน้า: page 2 = 'แสดง 11-20 จาก 24', page 3 = 4 rows 'แสดง 21-24 จาก 24'", async ({ page }) => {
    await goToAuditLog(page);
    const mobile = await isMobile(page);
    // mobile ซ่อนปุ่มเลขหน้า — ใช้ pager-next แทน, desktop ใช้เลขหน้าได้
    const goPage2 = mobile
      ? page.locator("#table .pager .pager-next")
      : page.locator("#table .pager [data-audit-page='2']");
    await goPage2.click();
    await page.waitForTimeout(300);
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 11-20 จาก 24");
    if (mobile) {
      await expect(page.locator("#table .pager .pager-mobile-info")).toHaveText("2 / 3");
    }
    expect(await rowIds(page)).toEqual([
      "AUD-88085", "AUD-88072", "AUD-88204", "AUD-88205", "AUD-88068",
      "AUD-88051", "AUD-88206", "AUD-88208", "AUD-88207", "AUD-88212"
    ]);
    // ไปหน้า 3
    const goPage3 = mobile
      ? page.locator("#table .pager .pager-next")
      : page.locator("#table .pager [data-audit-page='3']");
    await goPage3.click();
    await page.waitForTimeout(300);
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 21-24 จาก 24");
    expect(await rowIds(page)).toEqual(["AUD-88211", "AUD-88210", "AUD-88209", "AUD-88215"]);
    // หน้าสุดท้าย: next disabled, prev enabled
    const pager = page.locator("#table .footer-range .pager");
    await expect(pager.locator(".pager-next")).toBeDisabled();
    await expect(pager.locator(".pager-prev")).not.toBeDisabled();
    // กลับหน้า 1 ด้วย prev
    await pager.locator(".pager-prev").click();
    await page.waitForTimeout(300);
    await pager.locator(".pager-prev").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 1-10 จาก 24");
  });

  test("7. read-only list — rows ไม่มีปุ่ม/เมนู action ใด ๆ (immutable events)", async ({ page }) => {
    await goToAuditLog(page);
    // ไม่มี row-menu หรือปุ่มใน row เลย — แตกต่างจาก module อื่นที่มี row action menu
    await expect(page.locator(".audit-row .row-menu")).toHaveCount(0);
    await expect(page.locator(".audit-row button")).toHaveCount(0);
  });

  test("8. คลิก row → เปิด read-only detail drawer (audit-log-detail-modal) + ปิดกลับมา list เหมือนเดิม", async ({ page }) => {
    await goToAuditLog(page);
    // คลิก cell Event ID ของ row แรก
    await auditRow(page, "AUD-88203").locator('.user-cell-primary[data-label="Event ID"]').click();
    await page.waitForTimeout(300);
    // drawer เปิด — modal show + class audit-log-detail-modal + title = Event ID
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    await expect(page.locator("#user-action-modal .audit-log-detail-modal")).toHaveCount(1);
    await expect(page.locator("#user-action-modal .audit-detail-eyebrow")).toHaveText("Audit Log Detail");
    await expect(page.locator("#user-action-modal-title")).toHaveText("AUD-88203");
    // ยังอยู่ audit-log-mode (drawer ไม่เปลี่ยนหน้า)
    await expect(page.locator("body")).toHaveClass(/audit-log-mode/);
    // ปิด drawer → list ยังครบ 10 rows
    await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    await expect(page.locator(".audit-row")).toHaveCount(10);
  });

  test("9. search ไม่เจอ → empty state 'ไม่พบ audit event' + subtitle", async ({ page }) => {
    await goToAuditLog(page);
    await page.locator("#audit-search").fill("zzzzzz-no-match");
    await page.waitForTimeout(300);
    // ไม่มี data rows
    await expect(page.locator(".audit-row")).toHaveCount(0);
    // empty state แสดง
    const empty = page.locator(".audit-log-table .user-row.empty .audit-empty-state");
    await expect(empty).toBeVisible();
    await expect(empty.locator(".empty-title")).toHaveText("ไม่พบ audit event");
    await expect(empty.locator(".empty-subtitle")).toHaveText("ลองปรับคำค้นหรือตัวกรอง แล้วลองใหม่");
    // footer range = แสดง 0 จาก 0
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 0 จาก 0");
    // ล้าง search แล้ว rows กลับมาครบ 10 (หน้า 1)
    await page.locator("#audit-search").fill("");
    await page.waitForTimeout(300);
    await expect(page.locator(".audit-row")).toHaveCount(10);
  });

  test("10. mobile (≤760px): card แสดง tags (Risk + Module) + meta (Date/Time, Actor, Action, Reference, Note)", async ({ page }) => {
    await goToAuditLog(page);
    const mobile = await isMobile(page);
    if (!mobile) { test.skip(); return; }
    const row = auditRow(page, "AUD-88201");
    // card tags visible (Risk + Module pill)
    const tags = row.locator(".user-card-tags");
    await expect(tags).toBeVisible();
    await expect(tags.locator(".pill", { hasText: /^High$/ })).toBeVisible();
    await expect(tags.locator(".pill", { hasText: /^Asset$/ })).toBeVisible();
    // meta items: Date / Time / Actor / Action / Reference / Note
    const meta = row.locator(".user-card-meta");
    await expect(meta.locator(".user-card-meta-item span", { hasText: /^Date \/ Time$/ })).toBeVisible();
    await expect(meta.locator(".user-card-meta-item span", { hasText: /^Actor$/ })).toBeVisible();
    await expect(meta.locator(".user-card-meta-item span", { hasText: /^Action$/ })).toBeVisible();
    await expect(meta.locator(".user-card-meta-item span", { hasText: /^Reference$/ })).toBeVisible();
    await expect(meta.locator(".user-card-meta-item span", { hasText: /^Note$/ })).toBeVisible();
    // meta values ตรง mock (AUD-88201)
    await expect(meta.locator(".user-card-meta-item", { hasText: "Actor" }).locator("strong")).toHaveText("Somchai Admin");
    await expect(meta.locator(".user-card-meta-item", { hasText: "Reference" }).locator("strong")).toHaveText("AST-8831");
    // desktop data-label cells ถูกซ่อน (ยกเว้น primary)
    await expect(row.locator('[data-label="Actor"]')).toBeHidden();
    await expect(row.locator('[data-label="Module"]')).toBeHidden();
    await expect(row.locator('[data-label="Risk"]')).toBeHidden();
    // Event ID (primary) ยังแสดง
    await expect(row.locator('[data-label="Event ID"]')).toBeVisible();
  });
});
