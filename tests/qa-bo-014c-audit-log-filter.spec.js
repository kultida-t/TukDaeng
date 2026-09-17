// QA-BO-014c: Settings > Audit Log — Filter bar, search, sort & date range (strict Playwright spec)
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล — renderAuditLogRows() filter/sort logic + filterOptions
// เป้าหมาย: รันเทสครอบ filter bar, search, module/risk filter, sort, date range, reset, persistence (ห้ามแก้ prototype)
// หมายเหตุ: ไม่มี actor filter (ถูก revert — search field cover actor อยู่แล้ว)
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

// helper: อ่าน label ที่แสดงใน custom-select trigger
function selectLabel(page, inputId) {
  return page.locator(`div[data-custom-select]:has(> #${inputId}) [data-custom-select-label]`);
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

// helper: คลิกปุ่ม reset ที่มองเห็นได้ (desktop = ใน filter bar, mobile = ใน panel actions)
async function clickReset(page) {
  await page.locator("[data-audit-reset]:visible").first().click();
  await page.waitForTimeout(300);
}

// ==================== C. FILTER BAR, SEARCH, SORT & DATE RANGE ====================

test.describe("QA-BO-014c: Settings > Audit Log — filter bar, search, sort & date range", () => {

  test("1. filter bar มี search + module filter + risk filter + sort + date range + reset", async ({ page }) => {
    await goToAuditLog(page);
    // search input
    await expect(page.locator("#audit-search")).toBeVisible();
    await expect(page.locator("#audit-search")).toHaveAttribute("placeholder", "ค้นหา Event ID, Actor, Action, Reference");
    // advanced filters อยู่ใน DOM (mobile ซ่อนจนกว่าจะเปิดตัวกรอง — เช็ก existence ไม่ใช่ visibility)
    await expect(page.locator("#audit-module-filter")).toHaveCount(1);
    await expect(page.locator("#audit-risk-filter")).toHaveCount(1);
    await expect(page.locator("#audit-sort")).toHaveCount(1);
    // date range from/to
    await expect(page.locator("#audit-date-from")).toHaveCount(1);
    await expect(page.locator("#audit-date-to")).toHaveCount(1);
    await expect(page.locator(".audit-date-range .audit-date-label")).toHaveCount(1);
    // reset button — มี 2 ตัว: ใน panel actions (mobile) + ใน filter bar (desktop)
    await expect(page.locator("[data-audit-reset]").first()).toHaveCount(1);
    const mobile = await isMobile(page);
    if (mobile) {
      await expect(page.locator("#user-panel-filter-actions [data-audit-reset]")).toBeVisible();
      await expect(page.locator("#user-panel-filter-actions [data-audit-filter-toggle]")).toBeVisible();
    } else {
      await expect(page.locator(".audit-filter-bar [data-audit-reset]")).toBeVisible();
    }
  });

  test("2. search ค้นได้ทุก field: Event ID, Actor, Action, Reference (cover actor — ไม่มี actor filter)", async ({ page }) => {
    await goToAuditLog(page);
    // Event ID
    await page.locator("#audit-search").fill("AUD-88201");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["AUD-88201"]);
    // Actor (ไทย)
    await page.locator("#audit-search").fill("อรนุช");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["AUD-88198"]);
    // Actor (System) — 6 events จาก System (auto)
    await page.locator("#audit-search").fill("system");
    await page.waitForTimeout(300);
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 1-6 จาก 6");
    // Action — "Invite Admin" 8 events
    await page.locator("#audit-search").fill("Invite Admin");
    await page.waitForTimeout(300);
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 1-8 จาก 8");
    // Reference — ADM-007 ตรง 2 events (88204, 88208; latest sort)
    await page.locator("#audit-search").fill("ADM-007");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["AUD-88204", "AUD-88208"]);
    // ล้าง search แล้วกลับครบ 24 (หน้า 1 แสดง 10)
    await page.locator("#audit-search").fill("");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toHaveLength(10);
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 1-10 จาก 24");
  });

  test("3. module filter: เลือก Asset/Content/Users/Account Deletion/Reported Comments/Settings → row กรองถูก", async ({ page }) => {
    await goToAuditLog(page);
    // Settings → 12 events
    await pickCustomOption(page, "audit-module-filter", "Settings");
    await page.waitForTimeout(300);
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 1-10 จาก 12");
    // Account Deletion → 7 events
    await pickCustomOption(page, "audit-module-filter", "Account Deletion");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toHaveLength(7);
    // Users → 2 events (latest: 88120 ก่อน 88072)
    await pickCustomOption(page, "audit-module-filter", "Users");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["AUD-88120", "AUD-88072"]);
    // Content → 1 event
    await pickCustomOption(page, "audit-module-filter", "Content");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["AUD-88172"]);
    // Asset → 1 event
    await pickCustomOption(page, "audit-module-filter", "Asset");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["AUD-88201"]);
    // Reported Comments → 1 event
    await pickCustomOption(page, "audit-module-filter", "Reported Comments");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["AUD-88098"]);
    // กลับเป็น Module ทั้งหมด → 24 events
    await pickCustomOption(page, "audit-module-filter", "");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toHaveLength(10);
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 1-10 จาก 24");
  });

  test("4. module filter: Offers ไม่มี event → empty state", async ({ page }) => {
    await goToAuditLog(page);
    await pickCustomOption(page, "audit-module-filter", "Offers");
    await page.waitForTimeout(300);
    await expect(page.locator(".audit-row")).toHaveCount(0);
    const empty = page.locator(".audit-log-table .user-row.empty .audit-empty-state");
    await expect(empty).toBeVisible();
    await expect(empty.locator(".empty-title")).toHaveText("ไม่พบ audit event");
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 0 จาก 0");
  });

  test("5. risk filter: High=8, Medium=14, Low=2 → row กรองถูก", async ({ page }) => {
    await goToAuditLog(page);
    // High → 8 events
    await pickCustomOption(page, "audit-risk-filter", "High");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toHaveLength(8);
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 1-8 จาก 8");
    // Medium → 14 events (หน้า 1 แสดง 10)
    await pickCustomOption(page, "audit-risk-filter", "Medium");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toHaveLength(10);
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 1-10 จาก 14");
    // Low → 2 events (latest: 88202 ก่อน 88098)
    await pickCustomOption(page, "audit-risk-filter", "Low");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["AUD-88202", "AUD-88098"]);
    // กลับเป็น Risk ทั้งหมด → 24
    await pickCustomOption(page, "audit-risk-filter", "");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toHaveLength(10);
  });

  test("6. sort: latest (desc) / oldest (asc) ตาม createdAt", async ({ page }) => {
    await goToAuditLog(page);
    // latest (default) — row แรกคือ event ล่าสุด
    await pickCustomOption(page, "audit-sort", "latest");
    await page.waitForTimeout(300);
    const latest = await rowIds(page);
    expect(latest[0]).toBe("AUD-88203"); // 08 Sep 2026 16:00
    // oldest — เรียงเก่าสุดก่อน
    await pickCustomOption(page, "audit-sort", "oldest");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual([
      "AUD-88215", "AUD-88209", "AUD-88210", "AUD-88211", "AUD-88212",
      "AUD-88207", "AUD-88208", "AUD-88206", "AUD-88051", "AUD-88068"
    ]);
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 1-10 จาก 24");
  });

  test("7. date range filter: from / to / ช่วง กรองถูกต้อง (cover AL-004)", async ({ page }) => {
    await goToAuditLog(page);
    await openFilterBar(page);
    // from = 08 Sep 2026 → 5 events
    await page.locator("#audit-date-from").fill("2026-09-08");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual([
      "AUD-88203", "AUD-88202", "AUD-88201", "AUD-88198", "AUD-88195"
    ]);
    // ล้าง from, ใส่ to = 30 Apr 2026 → 7 events เก่ากว่า/เท่ากับ
    await page.locator("#audit-date-from").fill("");
    await page.locator("#audit-date-to").fill("2026-04-30");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toHaveLength(7);
    // from+to range 05-07 Sep 2026 → 6 events
    await page.locator("#audit-date-from").fill("2026-09-05");
    await page.locator("#audit-date-to").fill("2026-09-07");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toHaveLength(6);
  });

  test("8. date range validate: ช่วงกลับหัวถูก clamp ให้ valid เสมอ + picker only", async ({ page }) => {
    await goToAuditLog(page);
    await openFilterBar(page);
    // to < from → from ถูก clamp กลับมาเท่า to
    await page.locator("#audit-date-from").fill("2026-09-08");
    await page.locator("#audit-date-to").fill("2026-09-01");
    await page.waitForTimeout(300);
    expect(await page.locator("#audit-date-from").inputValue()).toBe("2026-09-01");
    expect(await page.locator("#audit-date-to").inputValue()).toBe("2026-09-01");
    // min/max ผูกข้ามกัน
    expect(await page.locator("#audit-date-from").getAttribute("max")).toBe("2026-09-01");
    expect(await page.locator("#audit-date-to").getAttribute("min")).toBe("2026-09-01");
    // picker only — พิมพ์เองไม่ได้
    await page.locator("#audit-date-from").focus();
    await page.keyboard.type("08092026");
    await page.waitForTimeout(200);
    expect(await page.locator("#audit-date-from").inputValue()).toBe("2026-09-01");
  });

  test("9. ใช้ filter ร่วมกัน (search + module + risk) ได้", async ({ page }) => {
    await goToAuditLog(page);
    // search 'invite' + module 'Settings' + risk 'Medium' → 8 invite events (ทั้งหมด Settings/Medium)
    await page.locator("#audit-search").fill("invite");
    await page.waitForTimeout(300);
    await pickCustomOption(page, "audit-module-filter", "Settings");
    await page.waitForTimeout(300);
    await pickCustomOption(page, "audit-risk-filter", "Medium");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toHaveLength(8);
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 1-8 จาก 8");
  });

  test("10. combined module + risk ที่ไม่ตรงกันมาก → เหลือ 1 row (Settings + High = AUD-88205)", async ({ page }) => {
    await goToAuditLog(page);
    await pickCustomOption(page, "audit-module-filter", "Settings");
    await page.waitForTimeout(300);
    await pickCustomOption(page, "audit-risk-filter", "High");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["AUD-88205"]);
  });

  test("11. เปิด/ปิดตัวกรอง toggle สลับ data-filter-open + aria-expanded + label (mobile เท่านั้น)", async ({ page }) => {
    await goToAuditLog(page);
    const mobile = await isMobile(page);
    if (!mobile) { test.skip(); return; }
    const toggle = page.locator("#user-panel-filter-actions [data-audit-filter-toggle]");
    const bar = page.locator(".user-filter-bar.audit-filter-bar");
    // initial state: closed
    await expect(bar).toHaveAttribute("data-filter-open", "false");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle.locator("span")).toHaveText("เปิดตัวกรอง");
    // click → open
    await toggle.click();
    await page.waitForTimeout(200);
    await expect(bar).toHaveAttribute("data-filter-open", "true");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(toggle.locator("span")).toHaveText("ปิดตัวกรอง");
    // click again → closed
    await toggle.click();
    await page.waitForTimeout(200);
    await expect(bar).toHaveAttribute("data-filter-open", "false");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle.locator("span")).toHaveText("เปิดตัวกรอง");
  });

  test("12. mobile (≤760px): toggle ซ่อน/แสดง advanced filters + date range จริง", async ({ page }) => {
    await goToAuditLog(page);
    const mobile = await isMobile(page);
    if (!mobile) { test.skip(); return; }
    const bar = page.locator(".user-filter-bar.audit-filter-bar");
    const moduleFilter = bar.locator(".user-advanced-filter").first();
    // closed → advanced filters + date range hidden
    await expect(bar).toHaveAttribute("data-filter-open", "false");
    await expect(moduleFilter).toBeHidden();
    await expect(page.locator(".audit-date-range")).toBeHidden();
    // open → visible
    await page.locator("#user-panel-filter-actions [data-audit-filter-toggle]").click();
    await page.waitForTimeout(200);
    await expect(bar).toHaveAttribute("data-filter-open", "true");
    await expect(moduleFilter).toBeVisible();
    await expect(page.locator(".audit-date-range")).toBeVisible();
  });

  test("13. รีเซ็ตค่าทั้งหมด → ล้าง search/filter/sort/date + กลับหน้า 1", async ({ page }) => {
    await goToAuditLog(page);
    await openFilterBar(page);
    // set search + module + risk + sort + date (non-default)
    await page.locator("#audit-search").fill("invite");
    await page.waitForTimeout(300);
    await pickCustomOption(page, "audit-module-filter", "Settings");
    await page.waitForTimeout(300);
    await pickCustomOption(page, "audit-risk-filter", "Medium");
    await page.waitForTimeout(300);
    await pickCustomOption(page, "audit-sort", "oldest");
    await page.waitForTimeout(300);
    await page.locator("#audit-date-from").fill("2026-01-01");
    await page.waitForTimeout(300);
    // verify filtered state
    expect((await rowIds(page)).length).toBeLessThan(10);
    // reset
    await clickReset(page);
    // search cleared
    await expect(page.locator("#audit-search")).toHaveValue("");
    // module filter = "" (Module ทั้งหมด)
    expect(await selectValue(page, "audit-module-filter")).toBe("");
    await expect(selectLabel(page, "audit-module-filter")).toHaveText("Module ทั้งหมด");
    // risk filter = "" (Risk ทั้งหมด)
    expect(await selectValue(page, "audit-risk-filter")).toBe("");
    await expect(selectLabel(page, "audit-risk-filter")).toHaveText("Risk ทั้งหมด");
    // sort = "latest" (default)
    expect(await selectValue(page, "audit-sort")).toBe("latest");
    await expect(selectLabel(page, "audit-sort")).toHaveText("ล่าสุดก่อน");
    // date range cleared
    expect(await page.locator("#audit-date-from").inputValue()).toBe("");
    expect(await page.locator("#audit-date-to").inputValue()).toBe("");
    // page 1 — 10 rows กลับมา + footer จาก 24
    expect(await rowIds(page)).toHaveLength(10);
    await expect(page.locator("#table .footer-range > span")).toHaveText("แสดง 1-10 จาก 24");
  });

  test("14. filter state persistence: re-render list แล้วค่า filter ยังอยู่ (drawer open/close + re-render)", async ({ page }) => {
    await goToAuditLog(page);
    await openFilterBar(page);
    // set search + module + sort (non-default)
    await page.locator("#audit-search").fill("invite");
    await page.waitForTimeout(300);
    await pickCustomOption(page, "audit-module-filter", "Settings");
    await page.waitForTimeout(300);
    await pickCustomOption(page, "audit-sort", "oldest");
    await page.waitForTimeout(300);
    // verify filtered state (oldest: 88215 ก่อน)
    const idsBefore = await rowIds(page);
    expect(idsBefore).toHaveLength(8);
    expect(idsBefore[0]).toBe("AUD-88215");
    // เปิด detail drawer แล้วปิด — filter ต้องคงอยู่
    await page.locator('.audit-row[data-audit-event="AUD-88215"] .user-cell-primary').click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(idsBefore);
    // re-render หน้า list (เหมือนกลับจาก detail) — ค่าต้อง restore จาก listFilterState
    await page.evaluate(() => renderModule("audit"));
    await page.waitForTimeout(300);
    await expect(page.locator("#audit-search")).toHaveValue("invite");
    expect(await selectValue(page, "audit-module-filter")).toBe("Settings");
    expect(await selectValue(page, "audit-sort")).toBe("oldest");
    expect(await rowIds(page)).toEqual(idsBefore);
  });
});
