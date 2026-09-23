// QA-BO-011: Settings > Support Center (edit form + preview modal) — strict Playwright spec
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล, spec docs (12_HELP_SUPPORT_MODULE.md) เป็นหลักสำหรับพฤติกรรม/นำทาง
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

// helper: ไปหน้า Support Center ผ่านเมนู Settings > Support Center
async function goToSupportCenter(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  // คลิก nav-item Settings เพื่อขยาย submenu
  await page.locator(".nav-item[data-module='settings']").click();
  await page.waitForTimeout(300);
  // คลิก submenu button Support Center
  await ensureNavOpen(page);
  await page.locator(".submenu[data-submenu='settings'] button[data-module='settings'][data-sub='Support Center']").click();
  await page.waitForTimeout(300);
}

// helper: นับจำนวน channel rows
async function countChannelRows(page) {
  return await page.locator(".support-channel-row").count();
}

// helper: ปิด modal ถ้าเปิดอยู่
async function closeModal(page) {
  const closeBtn = page.locator("[data-user-action-modal-close]");
  if (await closeBtn.isVisible({ timeout: 500 }).catch(() => false)) {
    await closeBtn.click();
    await page.waitForTimeout(200);
  }
}

// ข้อมูล mock channels จาก prototype (5 channels, all active by default)
const CHANNELS = [
  { id: "ch-line",     type: "LINE",     value: "@mrfoxthailand",          descTh: "ทักไลน์เพื่อสอบถามข้อมูลหรือรายงานปัญหา",          descEn: "Message us on LINE for inquiries or issue reports" },
  { id: "ch-phone",    type: "Phone",    value: "(+66) 80-008-8088",        descTh: "โทรสอบถามได้ในเวลาทำการ",                       descEn: "Call us during business hours" },
  { id: "ch-email",    type: "Email",    value: "service@mrfox.com",        descTh: "ส่งอีเมลสำหรับปัญหาที่ต้องการเอกสารประกอบ",       descEn: "Email us for issues requiring documentation" },
  { id: "ch-facebook", type: "Facebook", value: "MrFox Thailand",           descTh: "ติดตามข่าวสารและอัปเดตจากเพจ Facebook",          descEn: "Follow our Facebook page for news and updates" },
  { id: "ch-website",  type: "Website",  value: "www.mrfox.com",            descTh: "เว็บไซต์หลักของ TukDaeng",                      descEn: "TukDaeng official website" }
];

const BUSINESS_HOURS = "09:00 - 22:00 (GMT+7)";
const AVAILABILITY_TH = "ให้บริการทุกวัน";
const AVAILABILITY_EN = "Available daily";

// ==================== A. NAVIGATION & MENU ====================

test.describe("QA-BO-011: Settings > Support Center — navigation & menu", () => {

  test("1. เมนู Settings แสดงและมี submenu รวม Support Center", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await ensureNavOpen(page);
    const navItem = page.locator(".nav-item[data-module='settings']");
    await expect(navItem).toBeVisible();
    await navItem.click();
    await page.waitForTimeout(300);
    const scButton = page.locator(".submenu[data-submenu='settings'] button[data-sub='Support Center']");
    await expect(scButton).toBeVisible();
  });

  test("2. คลิก Settings > Support Center → เข้าหน้า Support Center", async ({ page }) => {
    await goToSupportCenter(page);
    await expect(page.locator("body")).toHaveClass(/support-center-mode/);
    await expect(page.locator("#page-title")).toHaveText("Support Center");
    await expect(page.locator("#crumb")).toHaveText("เครื่องมือ & รายงาน / Settings / Support Center");
  });

  test("3. panel-title ว่างเปล่าเพราะ Support Center เป็น form เดียวไม่มี panel title", async ({ page }) => {
    await goToSupportCenter(page);
    await expect(page.locator("#panel-title")).toHaveText("");
    await expect(page.locator("#panel-subtitle")).toHaveText("");
  });

  test("4. nav item Settings มี active state เมื่ออยู่ใน Support Center", async ({ page }) => {
    await goToSupportCenter(page);
    const isActive = await page.evaluate(() => {
      const navItem = document.querySelector(".nav-item[data-module='settings']");
      return navItem?.classList.contains("active") || navItem?.getAttribute("aria-expanded") === "true";
    });
    expect(isActive).toBe(true);
  });

  test("5. submenu Support Center มี active state เมื่ออยู่ในหน้า Support Center", async ({ page }) => {
    await goToSupportCenter(page);
    await ensureNavOpen(page);
    const subButton = page.locator(".submenu[data-submenu='settings'] button[data-sub='Support Center']");
    await expect(subButton).toHaveClass(/active/);
  });

  test("6. body class support-center-mode ถูกเพิ่มเมื่อเข้าหน้า Support Center", async ({ page }) => {
    await goToSupportCenter(page);
    expect(await page.evaluate(() => document.body.classList.contains("support-center-mode"))).toBe(true);
  });

  test("7. detail/summary-grid/cards ถูกซ่อนใน support-center-mode", async ({ page }) => {
    await goToSupportCenter(page);
    const detailDisplay = await page.locator("#detail").evaluate(el => getComputedStyle(el).display);
    expect(detailDisplay).toBe("none");
  });
});

// ==================== B. CHANNEL LIST RENDERING ====================

test.describe("QA-BO-011: Channel list — rendering, 5 channels", () => {

  test("8. แสดง 5 channel rows (fixed channel types)", async ({ page }) => {
    await goToSupportCenter(page);
    const count = await countChannelRows(page);
    expect(count).toBe(5);
  });

  test("9. channel types แสดงตามลำดับ: LINE, Phone, Email, Facebook, Website", async ({ page }) => {
    await goToSupportCenter(page);
    const rows = page.locator(".support-channel-row");
    for (let i = 0; i < CHANNELS.length; i++) {
      const typeText = await rows.nth(i).locator(".support-channel-type").textContent();
      expect(typeText).toContain(CHANNELS[i].type);
    }
  });

  test("10. แต่ละ channel row มี data-channel-id attribute", async ({ page }) => {
    await goToSupportCenter(page);
    const rows = page.locator(".support-channel-row");
    for (let i = 0; i < CHANNELS.length; i++) {
      const id = await rows.nth(i).getAttribute("data-channel-id");
      expect(id).toBe(CHANNELS[i].id);
    }
  });

  test("11. แต่ละ channel row มี toggle switch", async ({ page }) => {
    await goToSupportCenter(page);
    const toggles = page.locator(".support-channel-row [data-channel-toggle]");
    await expect(toggles).toHaveCount(5);
  });

  test("12. แต่ละ channel row มี value input (data-channel-value)", async ({ page }) => {
    await goToSupportCenter(page);
    const inputs = page.locator(".support-channel-row [data-channel-value]");
    await expect(inputs).toHaveCount(5);
  });

  test("13. แต่ละ channel row มี description TH input (data-channel-desc-th)", async ({ page }) => {
    await goToSupportCenter(page);
    const inputs = page.locator(".support-channel-row [data-channel-desc-th]");
    await expect(inputs).toHaveCount(5);
  });

  test("14. แต่ละ channel row มี description EN input (data-channel-desc-en)", async ({ page }) => {
    await goToSupportCenter(page);
    const inputs = page.locator(".support-channel-row [data-channel-desc-en]");
    await expect(inputs).toHaveCount(5);
  });

  test("15. แต่ละ channel row มี status badge (pill)", async ({ page }) => {
    await goToSupportCenter(page);
    const pills = page.locator(".support-channel-row .support-channel-status .pill");
    await expect(pills).toHaveCount(5);
  });

  test("16. ทุก channel เป็น Active โดย default (green pill)", async ({ page }) => {
    await goToSupportCenter(page);
    const pills = page.locator(".support-channel-row .support-channel-status .pill");
    for (let i = 0; i < 5; i++) {
      await expect(pills.nth(i)).toHaveClass(/green/);
      await expect(pills.nth(i)).toHaveText("Active");
    }
  });

  test("17. ทุก toggle switch เป็น on โดย default", async ({ page }) => {
    await goToSupportCenter(page);
    const toggles = page.locator(".support-channel-row .toggle-switch");
    for (let i = 0; i < 5; i++) {
      await expect(toggles.nth(i)).toHaveClass(/on/);
    }
  });

  test("18. channel value แสดงค่าเริ่มต้นถูกต้อง", async ({ page }) => {
    await goToSupportCenter(page);
    const inputs = page.locator(".support-channel-row [data-channel-value]");
    for (let i = 0; i < CHANNELS.length; i++) {
      await expect(inputs.nth(i)).toHaveValue(CHANNELS[i].value);
    }
  });

  test("19. channel description TH แสดงค่าเริ่มต้นถูกต้อง", async ({ page }) => {
    await goToSupportCenter(page);
    const inputs = page.locator(".support-channel-row [data-channel-desc-th]");
    for (let i = 0; i < CHANNELS.length; i++) {
      await expect(inputs.nth(i)).toHaveValue(CHANNELS[i].descTh);
    }
  });

  test("20. channel description EN แสดงค่าเริ่มต้นถูกต้อง", async ({ page }) => {
    await goToSupportCenter(page);
    const inputs = page.locator(".support-channel-row [data-channel-desc-en]");
    for (let i = 0; i < CHANNELS.length; i++) {
      await expect(inputs.nth(i)).toHaveValue(CHANNELS[i].descEn);
    }
  });

  test("21. Active channel มี required mark (* ) ที่ channel type", async ({ page }) => {
    await goToSupportCenter(page);
    const firstType = page.locator(".support-channel-row").first().locator(".support-channel-type");
    await expect(firstType).toContainText("*");
  });

  test("22. section heading 'ช่องทางติดต่อ' แสดง", async ({ page }) => {
    await goToSupportCenter(page);
    const heading = page.locator(".support-center-section h4").first();
    await expect(heading).toHaveText("ช่องทางติดต่อ");
  });

  test("23. section description แสดงคำอธิบาย toggle", async ({ page }) => {
    await goToSupportCenter(page);
    const desc = page.locator(".support-center-section > .muted").first();
    await expect(desc).toContainText("toggle");
  });
});

// ==================== C. TOGGLE ACTIVE/INACTIVE ====================

test.describe("QA-BO-011: Toggle Active/Inactive — channel toggle behavior", () => {

  test("24. toggle LINE channel → เป็น Inactive (pill gray, toggle off)", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-channel-toggle='ch-line']").click();
    await page.waitForTimeout(300);
    const row = page.locator(".support-channel-row[data-channel-id='ch-line']");
    await expect(row).toHaveClass(/inactive/);
    const pill = row.locator(".support-channel-status .pill");
    await expect(pill).toHaveClass(/gray/);
    await expect(pill).toHaveText("Inactive");
    const toggle = row.locator(".toggle-switch");
    await expect(toggle).not.toHaveClass(/on/);
  });

  test("25. Inactive channel: value input disabled", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-channel-toggle='ch-line']").click();
    await page.waitForTimeout(300);
    const valueInput = page.locator("[data-channel-value='ch-line']");
    await expect(valueInput).toBeDisabled();
  });

  test("26. Inactive channel: description TH input disabled", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-channel-toggle='ch-line']").click();
    await page.waitForTimeout(300);
    const descInput = page.locator("[data-channel-desc-th='ch-line']");
    await expect(descInput).toBeDisabled();
  });

  test("27. Inactive channel: description EN input disabled", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-channel-toggle='ch-line']").click();
    await page.waitForTimeout(300);
    const descInput = page.locator("[data-channel-desc-en='ch-line']");
    await expect(descInput).toBeDisabled();
  });

  test("28. Inactive channel: ไม่มี required mark (* )", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-channel-toggle='ch-line']").click();
    await page.waitForTimeout(300);
    const typeText = await page.locator(".support-channel-row[data-channel-id='ch-line'] .support-channel-type").textContent();
    expect(typeText).not.toContain("*");
  });

  test("29. toggle กลับ → เป็น Active อีกครั้ง (pill green, toggle on, fields enabled)", async ({ page }) => {
    await goToSupportCenter(page);
    // toggle off
    await page.locator("[data-channel-toggle='ch-line']").click();
    await page.waitForTimeout(300);
    // toggle on
    await page.locator("[data-channel-toggle='ch-line']").click();
    await page.waitForTimeout(300);
    const row = page.locator(".support-channel-row[data-channel-id='ch-line']");
    await expect(row).not.toHaveClass(/inactive/);
    const pill = row.locator(".support-channel-status .pill");
    await expect(pill).toHaveClass(/green/);
    await expect(pill).toHaveText("Active");
    const valueInput = row.locator("[data-channel-value='ch-line']");
    await expect(valueInput).toBeEnabled();
  });

  test("30. toggle แล้วค่าที่แก้ไขใน channel อื่นยังคงอยู่ (preserve unsaved edits)", async ({ page }) => {
    await goToSupportCenter(page);
    // edit Phone value
    await page.locator("[data-channel-value='ch-phone']").fill("(+66) 81-234-5678");
    // toggle LINE (triggers re-render)
    await page.locator("[data-channel-toggle='ch-line']").click();
    await page.waitForTimeout(300);
    // Phone value should be preserved
    await expect(page.locator("[data-channel-value='ch-phone']")).toHaveValue("(+66) 81-234-5678");
  });

  test("31. toggle หลาย channel พร้อมกันได้", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-channel-toggle='ch-line']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-channel-toggle='ch-email']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-channel-toggle='ch-website']").click();
    await page.waitForTimeout(300);
    const inactiveCount = await page.locator(".support-channel-row.inactive").count();
    expect(inactiveCount).toBe(3);
    const activeCount = await page.locator(".support-channel-row:not(.inactive)").count();
    expect(activeCount).toBe(2);
  });
});

// ==================== D. BUSINESS HOURS SECTION ====================

test.describe("QA-BO-011: Business hours section — rendering", () => {

  test("32. section heading 'เวลาทำการ' แสดง", async ({ page }) => {
    await goToSupportCenter(page);
    const headings = page.locator(".support-center-section h4");
    await expect(headings.nth(1)).toHaveText("เวลาทำการ");
  });

  test("33. business hours field แสดงค่าเริ่มต้น", async ({ page }) => {
    await goToSupportCenter(page);
    const input = page.locator("[data-support-business-hours]");
    await expect(input).toHaveValue(BUSINESS_HOURS);
  });

  test("34. availability TH field แสดงค่าเริ่มต้น", async ({ page }) => {
    await goToSupportCenter(page);
    const input = page.locator("[data-support-availability-th]");
    await expect(input).toHaveValue(AVAILABILITY_TH);
  });

  test("35. availability EN field แสดงค่าเริ่มต้น", async ({ page }) => {
    await goToSupportCenter(page);
    const input = page.locator("[data-support-availability-en]");
    await expect(input).toHaveValue(AVAILABILITY_EN);
  });

  test("36. business hours field มี required mark (* )", async ({ page }) => {
    await goToSupportCenter(page);
    const label = page.locator("label:has([data-support-business-hours])");
    await expect(label).toContainText("*");
  });

  test("37. availability TH field มี required mark (* )", async ({ page }) => {
    await goToSupportCenter(page);
    const label = page.locator("label:has([data-support-availability-th])");
    await expect(label).toContainText("*");
  });

  test("38. availability EN field มี required mark (* )", async ({ page }) => {
    await goToSupportCenter(page);
    const label = page.locator("label:has([data-support-availability-en])");
    await expect(label).toContainText("*");
  });

  test("39. business hours field มี error placeholder (data-support-business-hours-error)", async ({ page }) => {
    await goToSupportCenter(page);
    const error = page.locator("[data-support-business-hours-error]");
    // .article-field-error มี display:none default — ตรวจว่า element มีอยู่ (attached) และว่างเปล่า
    await expect(error).toHaveCount(1);
    await expect(error).toHaveText("");
  });
});

// ==================== E. ACTIONS (Preview/Save) ====================

test.describe("QA-BO-011: Actions — Preview & Save buttons", () => {

  test("40. ปุ่ม Preview แสดง", async ({ page }) => {
    await goToSupportCenter(page);
    const btn = page.locator("[data-support-preview]");
    await expect(btn).toBeVisible();
    await expect(btn).toHaveText("Preview");
  });

  test("41. ปุ่มบันทึกการเปลี่ยนแปลง แสดง", async ({ page }) => {
    await goToSupportCenter(page);
    const btn = page.locator("[data-support-save]");
    await expect(btn).toBeVisible();
    await expect(btn).toHaveText("บันทึกการเปลี่ยนแปลง");
  });

  test("42. ปุ่มบันทึกการเปลี่ยนแปลง มี class primary", async ({ page }) => {
    await goToSupportCenter(page);
    const btn = page.locator("[data-support-save]");
    await expect(btn).toHaveClass(/primary/);
  });
});

// ==================== F. VALIDATION — CHANNEL VALUE ====================

test.describe("QA-BO-011: Validation — channel value (required + format)", () => {

  test("43. ลบค่า Active channel → save แสดง error required", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-channel-value='ch-line']").fill("");
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(200);
    const error = page.locator("[data-channel-value-error='ch-line']");
    await expect(error).toHaveClass(/show/);
    await expect(error).not.toHaveText("");
  });

  test("44. Inactive channel ไม่ต้องกรอกค่า (no error when empty)", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-channel-toggle='ch-line']").click();
    await page.waitForTimeout(300);
    // LINE is now inactive with empty value (was already filled, but inactive doesn't require)
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(200);
    const error = page.locator("[data-channel-value-error='ch-line']");
    await expect(error).not.toHaveClass(/show/);
  });

  test("45. Phone format: ตัวเลขน้อยกว่า 7 หลัก → error", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-channel-value='ch-phone']").fill("12345");
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(200);
    const error = page.locator("[data-channel-value-error='ch-phone']");
    await expect(error).toHaveClass(/show/);
    await expect(error).toContainText("7");
  });

  test("46. Phone format: ตัวอักษรที่ไม่ใช่ตัวเลขและ + - ( ) → error", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-channel-value='ch-phone']").fill("abc1234567");
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(200);
    const error = page.locator("[data-channel-value-error='ch-phone']");
    await expect(error).toHaveClass(/show/);
  });

  test("47. Email format: รูปแบบไม่ถูกต้อง → error", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-channel-value='ch-email']").fill("not-an-email");
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(200);
    const error = page.locator("[data-channel-value-error='ch-email']");
    await expect(error).toHaveClass(/show/);
    await expect(error).toContainText("อีเมล");
  });

  test("48. LINE format: ค่าที่ไม่ใช่ @handle หรือ URL → error", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-channel-value='ch-line']").fill("!!!invalid!!!");
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(200);
    const error = page.locator("[data-channel-value-error='ch-line']");
    await expect(error).toHaveClass(/show/);
  });

  test("49. Facebook format: ค่าที่ไม่ใช่ชื่อเพจหรือ URL → error", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-channel-value='ch-facebook']").fill("!!!invalid!!!");
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(200);
    const error = page.locator("[data-channel-value-error='ch-facebook']");
    await expect(error).toHaveClass(/show/);
  });

  test("50. Website format: ค่าที่ไม่ใช่ URL หรือโดเมน → error", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-channel-value='ch-website']").fill("!!!invalid!!!");
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(200);
    const error = page.locator("[data-channel-value-error='ch-website']");
    await expect(error).toHaveClass(/show/);
  });

  test("51. error แสดงที่ channel value input (article-field-invalid class)", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-channel-value='ch-line']").fill("");
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(200);
    const input = page.locator("[data-channel-value='ch-line']");
    await expect(input).toHaveClass(/article-field-invalid/);
  });
});

// ==================== G. VALIDATION — BUSINESS HOURS ====================

test.describe("QA-BO-011: Validation — business hours", () => {

  test("52. ลบค่า business hours → save แสดง error required", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-business-hours]").fill("");
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(200);
    const error = page.locator("[data-support-business-hours-error]");
    await expect(error).toHaveClass(/show/);
    await expect(error).toContainText("ช่วงเวลา");
  });

  test("53. business hours format ไม่ถูกต้อง (ไม่มี HH:MM - HH:MM) → error", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-business-hours]").fill("ทุกวัน");
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(200);
    const error = page.locator("[data-support-business-hours-error]");
    await expect(error).toHaveClass(/show/);
    await expect(error).toContainText("รูปแบบเวลา");
  });

  test("54. business hours format ที่ถูกต้อง (09:00 - 22:00) → ไม่มี error", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-business-hours]").fill("09:00 - 22:00");
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(200);
    const error = page.locator("[data-support-business-hours-error]");
    await expect(error).not.toHaveClass(/show/);
  });

  test("55. business hours มี time range format ที่ถูกต้อง → ไม่มี error", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-business-hours]").fill("ทุกวัน 09:00-22:00 (GMT+7)");
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(200);
    const error = page.locator("[data-support-business-hours-error]");
    await expect(error).not.toHaveClass(/show/);
  });
});

// ==================== H. VALIDATION — AVAILABILITY ====================

test.describe("QA-BO-011: Validation — availability TH/EN", () => {

  test("56. ลบค่า availability TH → save แสดง error required", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-availability-th]").fill("");
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(200);
    const error = page.locator("[data-support-availability-th-error]");
    await expect(error).toHaveClass(/show/);
    await expect(error).toContainText("ไทย");
  });

  test("57. ลบค่า availability EN → save แสดง error required", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-availability-en]").fill("");
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(200);
    const error = page.locator("[data-support-availability-en-error]");
    await expect(error).toHaveClass(/show/);
    await expect(error).toContainText("English");
  });

  test("58. availability TH field มี article-field-invalid class เมื่อ error", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-availability-th]").fill("");
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(200);
    const input = page.locator("[data-support-availability-th]");
    await expect(input).toHaveClass(/article-field-invalid/);
  });

  test("59. availability EN field มี article-field-invalid class เมื่อ error", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-availability-en]").fill("");
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(200);
    const input = page.locator("[data-support-availability-en]");
    await expect(input).toHaveClass(/article-field-invalid/);
  });
});

// ==================== I. SAVE SUCCESS ====================

test.describe("QA-BO-011: Save — success behavior", () => {

  test("60. save ข้อมูลถูกต้อง → แสดง success toast", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(300);
    const toast = page.locator("#success-toast");
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("บันทึกการเปลี่ยนแปลงเรียบร้อย");
  });

  test("61. save สำเร็จแล้วยังอยู่ในหน้า Support Center (re-render)", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => document.body.classList.contains("support-center-mode"))).toBe(true);
  });

  test("62. save สำเร็จแล้ว form ยังแสดงค้างอยู่", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(300);
    const form = page.locator("[data-support-form]");
    await expect(form).toBeVisible();
  });

  test("63. save หลังแก้ค่า → ค่าใหม่ยังคงอยู่หลัง re-render", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-channel-value='ch-line']").fill("@newline");
    await page.locator("[data-support-business-hours]").fill("08:00 - 20:00 (GMT+7)");
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("[data-channel-value='ch-line']")).toHaveValue("@newline");
    await expect(page.locator("[data-support-business-hours]")).toHaveValue("08:00 - 20:00 (GMT+7)");
  });
});

// ==================== J. PREVIEW MODAL — BASIC ====================

test.describe("QA-BO-011: Preview modal — basic rendering", () => {

  test("64. คลิก Preview → เปิด modal (#user-action-modal.show)", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const modal = page.locator("#user-action-modal");
    await expect(modal).toHaveClass(/show/);
  });

  test("65. modal title เป็น 'Preview'", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const title = page.locator("#user-action-modal-title");
    await expect(title).toHaveText("Preview");
  });

  test("66. modal มี class support-center-preview-modal", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const modalCard = page.locator("#user-action-modal .user-action-modal");
    await expect(modalCard).toHaveClass(/support-center-preview-modal/);
  });

  test("67. phone frame แสดง (.support-preview-phone)", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const phone = page.locator(".support-preview-phone");
    await expect(phone).toBeVisible();
  });

  test("68. FO header แสดง 'Help'", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const foTitle = page.locator(".support-preview-fo-title");
    await expect(foTitle).toHaveText("Help");
  });

  test("69. FO heading แสดง 'ติดต่อเรา' (TH default)", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const heading = page.locator(".support-preview-fo-heading");
    await expect(heading).toHaveText("ติดต่อเรา");
  });

  test("70. language toggle แสดง ภาษาไทย / English", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const thBtn = page.locator("[data-support-preview-lang='th']");
    const enBtn = page.locator("[data-support-preview-lang='en']");
    await expect(thBtn).toBeVisible();
    await expect(enBtn).toBeVisible();
    await expect(thBtn).toHaveText("ภาษาไทย");
    await expect(enBtn).toHaveText("English");
  });

  test("71. TH language button active โดย default", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const thBtn = page.locator("[data-support-preview-lang='th']");
    await expect(thBtn).toHaveClass(/active/);
  });

  test("72. ปุ่มปิด modal แสดง (data-user-action-modal-close)", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const closeBtn = page.locator("[data-user-action-modal-close]");
    await expect(closeBtn).toBeVisible();
  });

  test("73. ปิด modal → modal ซ่อน", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    await page.locator("[data-user-action-modal-close]").click();
    await page.waitForTimeout(300);
    const modal = page.locator("#user-action-modal");
    await expect(modal).not.toHaveClass(/show/);
  });
});

// ==================== K. PREVIEW MODAL — LANGUAGE TOGGLE ====================

test.describe("QA-BO-011: Preview modal — language toggle TH/EN", () => {

  test("74. สลับเป็น EN → FO heading เป็น 'Contact support'", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    await page.locator("[data-support-preview-lang='en']").click();
    await page.waitForTimeout(200);
    const heading = page.locator(".support-preview-fo-heading");
    await expect(heading).toHaveText("Contact support");
  });

  test("75. สลับเป็น EN → EN button active, TH button ไม่ active", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    await page.locator("[data-support-preview-lang='en']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("[data-support-preview-lang='en']")).toHaveClass(/active/);
    await expect(page.locator("[data-support-preview-lang='th']")).not.toHaveClass(/active/);
  });

  test("76. สลับเป็น EN → availability แสดงค่า EN", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    await page.locator("[data-support-preview-lang='en']").click();
    await page.waitForTimeout(200);
    const availability = page.locator(".support-preview-fo-availability");
    await expect(availability).toHaveText(AVAILABILITY_EN);
  });

  test("77. สลับเป็น EN → business hours label เป็น 'Business hours'", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    await page.locator("[data-support-preview-lang='en']").click();
    await page.waitForTimeout(200);
    const label = page.locator(".support-preview-fo-hours-label");
    await expect(label).toHaveText("Business hours");
  });

  test("78. สลับเป็น TH → business hours label เป็น 'เวลาทำการ'", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    await page.locator("[data-support-preview-lang='en']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-support-preview-lang='th']").click();
    await page.waitForTimeout(200);
    const label = page.locator(".support-preview-fo-hours-label");
    await expect(label).toHaveText("เวลาทำการ");
  });

  test("79. สลับเป็น TH → availability แสดงค่า TH", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    await page.locator("[data-support-preview-lang='en']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-support-preview-lang='th']").click();
    await page.waitForTimeout(200);
    const availability = page.locator(".support-preview-fo-availability");
    await expect(availability).toHaveText(AVAILABILITY_TH);
  });

  test("80. สลับเป็น EN → channel description แสดงค่า EN", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    await page.locator("[data-support-preview-lang='en']").click();
    await page.waitForTimeout(200);
    const firstDesc = page.locator(".support-preview-fo-channel-desc").first();
    await expect(firstDesc).toHaveText(CHANNELS[0].descEn);
  });

  test("81. สลับเป็น TH → channel description แสดงค่า TH", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const firstDesc = page.locator(".support-preview-fo-channel-desc").first();
    await expect(firstDesc).toHaveText(CHANNELS[0].descTh);
  });
});

// ==================== L. PREVIEW MODAL — CHANNEL DISPLAY ====================

test.describe("QA-BO-011: Preview modal — channel display", () => {

  test("82. preview แสดงเฉพาะ Active channels (5 channels default)", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const channels = page.locator(".support-preview-fo-channel");
    await expect(channels).toHaveCount(5);
  });

  test("83. preview แสดง channel type และ value ของ Active channels", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const firstChannel = page.locator(".support-preview-fo-channel").first();
    await expect(firstChannel.locator(".support-preview-fo-channel-type")).toHaveText("LINE");
    await expect(firstChannel.locator(".support-preview-fo-channel-value")).toHaveText(CHANNELS[0].value);
  });

  test("84. preview แสดง channel icon (svg)", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const icon = page.locator(".support-preview-fo-channel-icon").first();
    const svg = icon.locator("svg");
    await expect(svg).toBeVisible();
  });

  test("85. toggle channel เป็น Inactive → preview ไม่แสดง channel นั้น", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-channel-toggle='ch-line']").click();
    await page.waitForTimeout(300);
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const channels = page.locator(".support-preview-fo-channel");
    await expect(channels).toHaveCount(4);
    // LINE should not be in the preview
    const types = await page.locator(".support-preview-fo-channel-type").allTextContents();
    expect(types).not.toContain("LINE");
  });

  test("86. business hours แสดงใน preview", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const hoursValue = page.locator(".support-preview-fo-hours-value");
    await expect(hoursValue).toHaveText(BUSINESS_HOURS);
  });
});

// ==================== M. PREVIEW MODAL — EMPTY STATE ====================

test.describe("QA-BO-011: Preview modal — empty state (no active channels)", () => {

  test("87. toggle ทุก channel เป็น Inactive → preview แสดง empty state", async ({ page }) => {
    await goToSupportCenter(page);
    // toggle all 5 channels off
    for (const ch of CHANNELS) {
      await page.locator(`[data-channel-toggle='${ch.id}']`).click();
      await page.waitForTimeout(200);
    }
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const empty = page.locator(".support-preview-empty");
    await expect(empty).toBeVisible();
    await expect(empty).toHaveText("ไม่มีช่องทางที่เปิดใช้งาน");
  });

  test("88. empty state: ไม่มี channel rows แสดง", async ({ page }) => {
    await goToSupportCenter(page);
    for (const ch of CHANNELS) {
      await page.locator(`[data-channel-toggle='${ch.id}']`).click();
      await page.waitForTimeout(200);
    }
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const channels = page.locator(".support-preview-fo-channel");
    await expect(channels).toHaveCount(0);
  });

  test("89. empty state: business hours ยังคงแสดง", async ({ page }) => {
    await goToSupportCenter(page);
    for (const ch of CHANNELS) {
      await page.locator(`[data-channel-toggle='${ch.id}']`).click();
      await page.waitForTimeout(200);
    }
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const hoursValue = page.locator(".support-preview-fo-hours-value");
    await expect(hoursValue).toBeVisible();
  });
});

// ==================== N. PREVIEW MODAL — LIVE DATA ====================

test.describe("QA-BO-011: Preview modal — live form data (unsaved edits)", () => {

  test("90. แก้ค่า channel value ใน form → preview แสดงค่าใหม่ (ยังไม่ save)", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-channel-value='ch-line']").fill("@newhandle");
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const firstValue = page.locator(".support-preview-fo-channel-value").first();
    await expect(firstValue).toHaveText("@newhandle");
  });

  test("91. แก้ business hours ใน form → preview แสดงค่าใหม่", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-business-hours]").fill("08:00 - 20:00 (GMT+7)");
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const hoursValue = page.locator(".support-preview-fo-hours-value");
    await expect(hoursValue).toHaveText("08:00 - 20:00 (GMT+7)");
  });

  test("92. แก้ availability TH ใน form → preview แสดงค่าใหม่ (TH)", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-availability-th]").fill("เปิดบริการทุกวันจันทร์-อาทิตย์");
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const availability = page.locator(".support-preview-fo-availability");
    await expect(availability).toHaveText("เปิดบริการทุกวันจันทร์-อาทิตย์");
  });

  test("93. แก้ availability EN ใน form → preview แสดงค่าใหม่ (EN)", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-availability-en]").fill("Open Monday to Sunday");
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    await page.locator("[data-support-preview-lang='en']").click();
    await page.waitForTimeout(200);
    const availability = page.locator(".support-preview-fo-availability");
    await expect(availability).toHaveText("Open Monday to Sunday");
  });

  test("94. แก้ description TH ใน form → preview แสดงค่าใหม่ (TH)", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-channel-desc-th='ch-line']").fill("คำอธิบายใหม่ภาษาไทย");
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const firstDesc = page.locator(".support-preview-fo-channel-desc").first();
    await expect(firstDesc).toHaveText("คำอธิบายใหม่ภาษาไทย");
  });

  test("95. แก้ description EN ใน form → preview แสดงค่าใหม่ (EN)", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-channel-desc-en='ch-line']").fill("New English description");
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    await page.locator("[data-support-preview-lang='en']").click();
    await page.waitForTimeout(200);
    const firstDesc = page.locator(".support-preview-fo-channel-desc").first();
    await expect(firstDesc).toHaveText("New English description");
  });
});

// ==================== O. RESPONSIVE LAYOUT ====================

test.describe("QA-BO-011: Responsive — mobile layout (≤900px)", () => {

  test("96. mobile: channel row ใช้ grid-area layout (stacked)", async ({ page, browserName }) => {
    await goToSupportCenter(page);
    const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 900px)").matches);
    if (!isMobile) {
      test.skip();
      return;
    }
    const row = page.locator(".support-channel-row").first();
    const gridAreas = await row.evaluate(el => getComputedStyle(el).gridTemplateAreas);
    expect(gridAreas).toContain("toggle");
    expect(gridAreas).toContain("status");
    expect(gridAreas).toContain("info");
    expect(gridAreas).toContain("desc");
  });

  test("97. mobile: support-channel-desc เป็น single column", async ({ page }) => {
    await goToSupportCenter(page);
    const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 900px)").matches);
    if (!isMobile) {
      test.skip();
      return;
    }
    const desc = page.locator(".support-channel-desc").first();
    const cols = await desc.evaluate(el => getComputedStyle(el).gridTemplateColumns);
    expect(cols).not.toContain("1fr 1fr");
  });

  test("98. mobile: support-center-field-row เป็น single column", async ({ page }) => {
    await goToSupportCenter(page);
    const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 900px)").matches);
    if (!isMobile) {
      test.skip();
      return;
    }
    const fieldRow = page.locator(".support-center-field-row").first();
    const cols = await fieldRow.evaluate(el => getComputedStyle(el).gridTemplateColumns);
    expect(cols).not.toContain("240px");
  });

  test("99. mobile: form ไม่ล้นจอ (no horizontal scroll)", async ({ page }) => {
    await goToSupportCenter(page);
    const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 900px)").matches);
    if (!isMobile) {
      test.skip();
      return;
    }
    const hasOverflow = await page.evaluate(() => {
      const table = document.querySelector("#table");
      return table ? table.scrollWidth > table.clientWidth : false;
    });
    expect(hasOverflow).toBe(false);
  });

  test("100. mobile: preview modal ไม่ล้นจอ (width 100%)", async ({ page }) => {
    await goToSupportCenter(page);
    const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 520px)").matches);
    if (!isMobile) {
      test.skip();
      return;
    }
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const modal = page.locator("#user-action-modal .user-action-modal");
    const width = await modal.evaluate(el => el.getBoundingClientRect().width);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(width).toBeLessThanOrEqual(viewportWidth);
  });
});

// ==================== P. DESKTOP LAYOUT ====================

test.describe("QA-BO-011: Desktop layout (>900px)", () => {

  test("101. desktop: channel row ใช้ 4-column grid (toggle, info, desc, status)", async ({ page }) => {
    await goToSupportCenter(page);
    const isDesktop = await page.evaluate(() => !window.matchMedia("(max-width: 900px)").matches);
    if (!isDesktop) {
      test.skip();
      return;
    }
    const row = page.locator(".support-channel-row").first();
    const cols = await row.evaluate(el => getComputedStyle(el).gridTemplateColumns);
    expect(cols).toContain("42px");
  });

  test("102. desktop: support-channel-desc เป็น 2-column", async ({ page }) => {
    await goToSupportCenter(page);
    const isDesktop = await page.evaluate(() => !window.matchMedia("(max-width: 900px)").matches);
    if (!isDesktop) {
      test.skip();
      return;
    }
    const desc = page.locator(".support-channel-desc").first();
    // computed gridTemplateColumns returns resolved track list — count tracks by splitting on whitespace
    const colCount = await desc.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(/\s+/).filter(Boolean).length);
    expect(colCount).toBe(2);
  });

  test("103. desktop: support-center-field-row ใช้ auto-fit minmax(240px, 1fr)", async ({ page }) => {
    await goToSupportCenter(page);
    const isDesktop = await page.evaluate(() => !window.matchMedia("(max-width: 900px)").matches);
    if (!isDesktop) {
      test.skip();
      return;
    }
    const fieldRow = page.locator(".support-center-field-row").first();
    // auto-fit minmax(240px, 1fr) — auto-fit collapses empty tracks to 0px
    // ตรวจเฉพาะ track ที่ไม่ใช่ 0 (track จริงที่บรรจุ field) ว่าแต่ละ track >= 240px
    const tracks = await fieldRow.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(/\s+/).filter(Boolean).map(parseFloat));
    const nonZeroTracks = tracks.filter(px => px > 0);
    expect(nonZeroTracks.length).toBeGreaterThanOrEqual(1);
    for (const px of nonZeroTracks) {
      expect(px).toBeGreaterThanOrEqual(240);
    }
  });
});

// ==================== Q. FORM STRUCTURE ====================

test.describe("QA-BO-011: Form structure — data-support-form", () => {

  test("104. form มี data-support-form attribute และ novalidate", async ({ page }) => {
    await goToSupportCenter(page);
    const form = page.locator("[data-support-form]");
    await expect(form).toBeVisible();
    await expect(form).toHaveAttribute("novalidate");
  });

  test("105. form มี 2 sections (ช่องทางติดต่อ + เวลาทำการ)", async ({ page }) => {
    await goToSupportCenter(page);
    const sections = page.locator(".support-center-section");
    await expect(sections).toHaveCount(2);
  });

  test("106. form มี actions area พร้อม Preview/Save buttons", async ({ page }) => {
    await goToSupportCenter(page);
    const actions = page.locator(".support-center-form .user-detail-actions");
    await expect(actions).toBeVisible();
    await expect(actions.locator("[data-support-preview]")).toBeVisible();
    await expect(actions.locator("[data-support-save]")).toBeVisible();
  });

  test("107. channel list container มี class support-channel-list", async ({ page }) => {
    await goToSupportCenter(page);
    const list = page.locator(".support-channel-list");
    await expect(list).toBeVisible();
  });
});

// ==================== R. VALIDATION — MULTIPLE ERRORS ====================

test.describe("QA-BO-011: Validation — multiple errors & focus", () => {

  test("108. ลบค่าหลาย field → แสดง error หลายจุดพร้อมกัน", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-channel-value='ch-line']").fill("");
    await page.locator("[data-support-business-hours]").fill("");
    await page.locator("[data-support-availability-th]").fill("");
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(200);
    await expect(page.locator("[data-channel-value-error='ch-line']")).toHaveClass(/show/);
    await expect(page.locator("[data-support-business-hours-error]")).toHaveClass(/show/);
    await expect(page.locator("[data-support-availability-th-error]")).toHaveClass(/show/);
  });

  test("109. validation ไม่ผ่าน → ไม่แสดง success toast", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-channel-value='ch-line']").fill("");
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(300);
    const toast = page.locator("#success-toast");
    const isVisible = await toast.isVisible({ timeout: 500 }).catch(() => false);
    expect(isVisible).toBe(false);
  });

  test("110. validation ผ่านทั้งหมด → ไม่มี error แสดง", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-support-save]").click();
    await page.waitForTimeout(300);
    const errors = page.locator(".article-field-error.show");
    await expect(errors).toHaveCount(0);
  });
});

// ==================== S. CHANNEL VALUE LABEL (ARIA) ====================

test.describe("QA-BO-011: Channel value field — aria-label", () => {

  test("111. LINE value input มี aria-label 'LINE URL'", async ({ page }) => {
    await goToSupportCenter(page);
    const input = page.locator("[data-channel-value='ch-line']");
    await expect(input).toHaveAttribute("aria-label", "LINE URL");
  });

  test("112. Phone value input มี aria-label 'เบอร์โทรศัพท์'", async ({ page }) => {
    await goToSupportCenter(page);
    const input = page.locator("[data-channel-value='ch-phone']");
    await expect(input).toHaveAttribute("aria-label", "เบอร์โทรศัพท์");
  });

  test("113. Email value input มี aria-label 'อีเมล'", async ({ page }) => {
    await goToSupportCenter(page);
    const input = page.locator("[data-channel-value='ch-email']");
    await expect(input).toHaveAttribute("aria-label", "อีเมล");
  });

  test("114. Facebook value input มี aria-label 'Facebook URL'", async ({ page }) => {
    await goToSupportCenter(page);
    const input = page.locator("[data-channel-value='ch-facebook']");
    await expect(input).toHaveAttribute("aria-label", "Facebook URL");
  });

  test("115. Website value input มี aria-label 'Website URL'", async ({ page }) => {
    await goToSupportCenter(page);
    const input = page.locator("[data-channel-value='ch-website']");
    await expect(input).toHaveAttribute("aria-label", "Website URL");
  });
});

// ==================== T. TOGGLE ARIA-LABEL ====================

test.describe("QA-BO-011: Toggle — aria-label", () => {

  test("116. Active channel toggle มี aria-label 'ปิดการแสดงผล'", async ({ page }) => {
    await goToSupportCenter(page);
    const toggle = page.locator("[data-channel-toggle='ch-line']");
    await expect(toggle).toHaveAttribute("aria-label", "ปิดการแสดงผล");
  });

  test("117. Inactive channel toggle มี aria-label 'เปิดการแสดงผล'", async ({ page }) => {
    await goToSupportCenter(page);
    await page.locator("[data-channel-toggle='ch-line']").click();
    await page.waitForTimeout(300);
    const toggle = page.locator("[data-channel-toggle='ch-line']");
    await expect(toggle).toHaveAttribute("aria-label", "เปิดการแสดงผล");
  });
});
