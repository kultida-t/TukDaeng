// AL-004: quick automated check — Audit Log date range filter
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

async function loginIfNeeded(page) {
  const loginScreen = page.locator('#login-screen');
  if (await loginScreen.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator('#login-form button[type="submit"]').click();
    await page.waitForSelector('#otp-form:not(.hidden)', { timeout: 5000 });
    await page.locator('#verify-otp-btn').click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await page.waitForTimeout(500);
  }
}

async function openAuditLog(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await page.evaluate(() => renderModule("audit"));
  await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
  // mobile: advanced filters (รวม date range) ซ่อนอยู่ในตัวกรอง — เปิดก่อนถ้าปุ่มมองเห็น
  const toggle = page.locator("[data-audit-filter-toggle]");
  if (await toggle.isVisible().catch(() => false)) await toggle.click();
}

const rowCount = page => page.locator(".audit-log-table .user-row:not(.head):not(.empty)").count();

test.describe("AL-004: Audit Log date range filter", () => {

  test("1. date range inputs exist in filter bar", async ({ page }) => {
    await openAuditLog(page);
    await expect(page.locator("#audit-date-from")).toBeVisible();
    await expect(page.locator("#audit-date-to")).toBeVisible();
    await expect(page.locator(".audit-date-range .audit-date-label")).toHaveText("Date:");
  });

  test("1b. date range ซ่อนอยู่ในตัวกรองเมื่อปิด (mobile)", async ({ page }) => {
    await openAuditLog(page);
    const toggle = page.locator("[data-audit-filter-toggle]");
    if (await toggle.isVisible().catch(() => false)) {
      // mobile: ปิดตัวกรอง → date range ต้องซ่อนเหมือน select อื่น ๆ
      await toggle.click();
      await page.waitForTimeout(200);
      await expect(page.locator(".audit-date-range")).toBeHidden();
      await expect(page.locator("#audit-module-filter")).toBeHidden();
      await toggle.click();
    }
  });

  test("2. from date filters out older events", async ({ page }) => {
    await openAuditLog(page);
    const before = await rowCount(page);
    await page.locator("#audit-date-from").fill("2026-09-08");
    await page.waitForTimeout(300);
    const after = await rowCount(page);
    // mock data: 5 events ตั้งแต่ 08 Sep 2026 (AUD-88203, 88202, 88201, 88198, 88195)
    expect(after).toBe(5);
    expect(after).toBeLessThan(before);
  });

  test("3. to date filters out newer events", async ({ page }) => {
    await openAuditLog(page);
    await page.locator("#audit-date-to").fill("2026-04-30");
    await page.waitForTimeout(300);
    // events เก่ากว่า/เท่ากับ 30 Apr 2026: 88208, 88207, 88212, 88211, 88210, 88209, 88215 = 7
    expect(await rowCount(page)).toBe(7);
  });

  test("4. from+to range filters correctly", async ({ page }) => {
    await openAuditLog(page);
    await page.locator("#audit-date-from").fill("2026-09-05");
    await page.locator("#audit-date-to").fill("2026-09-07");
    await page.waitForTimeout(300);
    // 05-07 Sep 2026: 88172, 88168, 88120, 88115, 88098, 88085 = 6
    expect(await rowCount(page)).toBe(6);
  });

  test("5. reset clears date range", async ({ page }) => {
    await openAuditLog(page);
    await page.locator("#audit-date-from").fill("2026-09-08");
    await page.waitForTimeout(300);
    // desktop/tablet: icon reset ใน filter bar; mobile: ปุ่ม "รีเซ็ตค่าทั้งหมด" ใน panel head
    await page.locator("[data-audit-reset]:visible").first().click();
    await page.waitForTimeout(300);
    expect(await page.locator("#audit-date-from").inputValue()).toBe("");
    expect(await page.locator("#audit-date-to").inputValue()).toBe("");
    expect(await rowCount(page)).toBeGreaterThan(5);
  });

  test("7. date inputs กรอกเองไม่ได้ (picker only)", async ({ page }) => {
    await openAuditLog(page);
    await page.locator("#audit-date-from").focus();
    await page.keyboard.type("08092026");
    await page.waitForTimeout(200);
    expect(await page.locator("#audit-date-from").inputValue()).toBe("");
  });

  test("8. validate ช่วงวันที่ — เลือก to ก่อน from แล้ว from ขยับตาม", async ({ page }) => {
    await openAuditLog(page);
    await page.locator("#audit-date-from").fill("2026-09-08");
    await page.locator("#audit-date-to").fill("2026-09-01");
    await page.waitForTimeout(300);
    // to < from → from ถูก clamp กลับมาเท่า to (ช่วง valid เสมอ)
    expect(await page.locator("#audit-date-from").inputValue()).toBe("2026-09-01");
    expect(await page.locator("#audit-date-to").inputValue()).toBe("2026-09-01");
  });

  test("9. validate ช่วงวันที่ — เลือก from หลัง to แล้ว to ขยับตาม + min/max sync", async ({ page }) => {
    await openAuditLog(page);
    await page.locator("#audit-date-to").fill("2026-09-06");
    await page.locator("#audit-date-from").fill("2026-09-08");
    await page.waitForTimeout(300);
    expect(await page.locator("#audit-date-from").inputValue()).toBe("2026-09-08");
    expect(await page.locator("#audit-date-to").inputValue()).toBe("2026-09-08");
    // min/max ผูกข้ามกัน — picker ปิดวันที่ผิดเงื่อนไข
    expect(await page.locator("#audit-date-from").getAttribute("max")).toBe("2026-09-08");
    expect(await page.locator("#audit-date-to").getAttribute("min")).toBe("2026-09-08");
  });

  test("11. empty state ไม่ล้นจอ (mobile)", async ({ page }) => {
    await openAuditLog(page);
    await page.locator("#audit-search").fill("NONEXISTENTXYZ123");
    await page.waitForTimeout(300);
    const empty = page.locator(".audit-log-table .user-row.empty");
    await expect(page.locator(".empty-title")).toHaveText("ไม่พบ audit event");
    const box = await empty.boundingBox();
    const viewportW = page.viewportSize().width;
    if (viewportW <= 760) {
      // mobile card mode: ไม่มี scroll แนวนอน — empty row ต้องไม่ล้นจอ
      expect(box.width).toBeLessThanOrEqual(viewportW);
      const titleBox = await page.locator(".empty-title").boundingBox();
      expect(titleBox.x + titleBox.width).toBeLessThanOrEqual(box.x + box.width + 1);
    } else {
      // tablet/desktop: ตารางเลื่อนแนวนอน — empty row กว้างเท่าตารางตามปกติ
      const tableScroll = await page.evaluate(() => document.querySelector("#table").scrollWidth);
      expect(box.width).toBeLessThanOrEqual(tableScroll + 1);
    }
  });

  test("10. date range persists when re-rendering list (detail→back pattern)", async ({ page }) => {
    await openAuditLog(page);
    await page.locator("#audit-date-from").fill("2026-09-08");
    await page.waitForTimeout(300);
    // re-render หน้า list (เหมือนกลับจาก detail) — ค่าต้อง restore จาก listFilterState
    await page.evaluate(() => renderModule("audit"));
    await page.waitForTimeout(300);
    expect(await page.locator("#audit-date-from").inputValue()).toBe("2026-09-08");
    expect(await rowCount(page)).toBe(5);
  });
});
