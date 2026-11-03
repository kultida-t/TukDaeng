// QA-BO-028: Settings > Delivery Logs — full coverage (strict Playwright spec)
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล — renderDeliveryLogs/renderDeliveryLogRows
//   + openDeliveryLogDetailModal/jumpToDeliveryLog + moduleData.settings.rows seeds (12 Delivery)
// เป้าหมาย: รันเทสครอบ nav/list/search/filter/sort/pagination/read-only modal/
//   delivery ID patterns/jump links/responsive (ห้ามแก้ prototype)
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

// ---------- helpers ----------

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

// helper: ไปหน้า Delivery Logs ผ่านเมนู Settings > Delivery Logs
async function goToDeliveryLogs(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  const expanded = await page.evaluate(() =>
    document.querySelector(".submenu[data-submenu='settings']")?.classList.contains("open"));
  if (!expanded) {
    await page.locator(".nav-item[data-module='settings']").click();
    await page.waitForTimeout(300);
    await ensureNavOpen(page);
  }
  await page.locator(".submenu[data-submenu='settings'] button[data-module='settings'][data-sub='Delivery Logs']").click();
  await page.waitForTimeout(300);
}

// helper: render list ตรงผ่าน renderModule (เร็วกว่า สำหรับเทสเนื้อหา)
async function openDeliveryLogs(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await page.evaluate(() => renderModule("settings", "Delivery Logs", "Delivery Logs"));
  await page.waitForSelector(".delivery-log-table", { timeout: 5000 });
  await page.waitForTimeout(200);
}

// helper: เปิด filter selects ถ้าจอ mobile (≤760px เท่านั้น — desktop/tablet แสดงเสมอ)
async function openFilterBar(page) {
  const mobile = await isMobile(page);
  if (!mobile) return;
  const bar = page.locator(".user-filter-bar.delivery-filter-bar");
  if (!(await bar.count())) return;
  const isOpen = await bar.getAttribute("data-filter-open");
  if (isOpen === "false") {
    await page.locator("#user-panel-filter-actions [data-delivery-filter-toggle]").click();
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

// helper: อ่าน Delivery ID ของทุก row ในหน้าปัจจุบัน (เรียงตาม DOM)
async function rowIds(page) {
  return await page.locator(".delivery-log-table .user-row.delivery-row").evaluateAll(rows =>
    rows.map(r => r.getAttribute("data-delivery-card")));
}

// helper: นับจำนวน row ในหน้าปัจจุบัน
async function rowCount(page) {
  return await page.locator(".delivery-log-table .user-row.delivery-row").count();
}

// helper: locator ของ row ตาม Delivery ID
function deliveryRow(page, id) {
  return page.locator(`.delivery-log-table .user-row.delivery-row[data-delivery-card="${id}"]`);
}

// helper: อ่าน confirm rows ใน detail modal (label → value text)
async function modalRows(page) {
  const rows = page.locator(".delivery-detail-summary .option-confirm-row");
  const count = await rows.count();
  const out = {};
  for (let i = 0; i < count; i++) {
    const label = (await rows.nth(i).locator(".option-confirm-label").textContent() || "").trim();
    const value = (await rows.nth(i).locator(".option-confirm-value").innerHTML() || "").trim();
    out[label] = value;
  }
  return out;
}

// ---------- specs ----------

test.describe("QA-BO-028: Navigation", () => {

  test("1. Settings submenu มี 'Delivery Logs'", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await ensureNavOpen(page);
    await page.locator(".nav-item[data-module='settings']").click();
    await page.waitForTimeout(300);
    const sub = page.locator(".submenu[data-submenu='settings'] button[data-sub='Delivery Logs']");
    await expect(sub).toBeVisible();
    await expect(sub).toHaveText("Delivery Logs");
  });

  test("2. คลิก submenu → เปิด list (delivery-log-list-mode + crumb)", async ({ page }) => {
    await goToDeliveryLogs(page);
    await expect(page.locator("body")).toHaveClass(/delivery-log-list-mode/);
    await expect(page.locator("#crumb")).toHaveText("เครื่องมือ & รายงาน / Settings / Delivery Logs");
  });

  test("3. page header: title 'Delivery Logs' + panel 'Delivery Log List' + ไม่มี primary action", async ({ page }) => {
    await goToDeliveryLogs(page);
    await expect(page.locator("#page-title")).toHaveText("Delivery Logs");
    await expect(page.locator("#panel-title")).toHaveText("Delivery Log List");
    await expect(page.locator("#primary-action")).toHaveText("");
  });

  test("4. ไม่มี KPI cards / summary grid", async ({ page }) => {
    await goToDeliveryLogs(page);
    await expect(page.locator("#summary-grid")).toBeEmpty();
    await expect(page.locator("#cards")).toBeEmpty();
  });

  test("5. submenu 'Delivery Logs' active หลัง navigate", async ({ page }) => {
    await goToDeliveryLogs(page);
    await expect(page.locator(".submenu[data-submenu='settings'] button[data-sub='Delivery Logs']")).toHaveClass(/active/);
  });

  test("6. filter actions มีปุ่ม toggle + reset ใน DOM (visibility ตาม viewport)", async ({ page }) => {
    const mobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    await goToDeliveryLogs(page);
    await expect(page.locator("[data-delivery-filter-toggle]")).toHaveCount(1);
    await expect(page.locator("#user-panel-filter-actions [data-delivery-reset]")).toHaveCount(1);
    if (mobile) {
      await expect(page.locator("[data-delivery-filter-toggle]")).toBeVisible();
    } else {
      await expect(page.locator(".delivery-filter-bar [data-delivery-reset]")).toBeVisible();
    }
  });
});

test.describe("QA-BO-028: List rendering & pagination", () => {

  test("7. table header 7 คอลัมน์ตามลำดับ", async ({ page }) => {
    await openDeliveryLogs(page);
    const heads = page.locator(".delivery-log-table .user-row.head > div");
    await expect(heads).toHaveCount(7);
    const expected = ["Delivery ID", "Event", "Source", "Recipient", "Channel", "Status", "Detail"];
    for (let i = 0; i < expected.length; i++) {
      await expect(heads.nth(i)).toHaveText(expected[i]);
    }
  });

  test("8. page 1 แสดง 10 rows จาก 12 (pageSize=10)", async ({ page }) => {
    await openDeliveryLogs(page);
    expect(await rowCount(page)).toBe(10);
  });

  test("9. footer range 'แสดง 1-10 จาก 12'", async ({ page }) => {
    await openDeliveryLogs(page);
    await expect(page.locator("#table .footer-range span").first()).toContainText("แสดง 1-10 จาก 12");
  });

  test("10. default sort = ล่าสุดก่อน → row แรกคือ DLV-WA-1050", async ({ page }) => {
    await openDeliveryLogs(page);
    expect((await rowIds(page))[0]).toBe("DLV-WA-1050");
    expect(await selectValue(page, "delivery-sort")).toBe("latest");
  });

  test("11. row DLV-DEL-033-REQ แสดง field ครบ (event/source/recipient/channel/status/detail)", async ({ page }) => {
    await openDeliveryLogs(page);
    const row = deliveryRow(page, "DLV-DEL-033-REQ");
    await expect(row.locator('[data-label="Delivery ID"] .main-text')).toHaveText("DLV-DEL-033-REQ");
    await expect(row.locator('[data-label="Event"] .main-text')).toHaveText("Account deletion confirmation email");
    await expect(row.locator('[data-label="Source"] .main-text')).toHaveText("DEL-033");
    await expect(row.locator('[data-label="Recipient"] .main-text')).toHaveText("U-1104");
    await expect(row.locator('[data-label="Channel"] .pill')).toHaveText("Email");
    await expect(row.locator('[data-label="Status"] .pill')).toHaveText("Sent");
    await expect(row.locator('[data-label="Detail"]')).toContainText("ผู้ใช้ยืนยันผ่านแอป (FO)");
  });

  test("12. pill สีตามค่า: Sent=green / Retry=amber / Email=blue / Push=purple", async ({ page }) => {
    await openDeliveryLogs(page);
    const sent = deliveryRow(page, "DLV-DEL-033-REQ");
    await expect(sent.locator('[data-label="Status"] .pill')).toHaveClass(/green/);
    await expect(sent.locator('[data-label="Channel"] .pill')).toHaveClass(/blue/);
    const retry = deliveryRow(page, "DLV-WA-1050");
    await expect(retry.locator('[data-label="Status"] .pill')).toHaveClass(/amber/);
    await expect(retry.locator('[data-label="Channel"] .pill')).toHaveClass(/purple/);
  });

  test("13. ไม่มี row action menu (...) — read-only list", async ({ page }) => {
    await openDeliveryLogs(page);
    expect(await page.locator(".delivery-log-table .user-row-actions").count()).toBe(0);
    expect(await page.locator(".delivery-log-table .row-menu").count()).toBe(0);
  });

  test("14. กดถัดไป → page 2 มี 2 rows (DLV-ACCT-009, DLV-ACCT-008-INV-001)", async ({ page }) => {
    await openDeliveryLogs(page);
    await page.locator("[data-delivery-page='next']").click();
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["DLV-ACCT-009", "DLV-ACCT-008-INV-001"]);
    await expect(page.locator("#table .footer-range span").first()).toContainText("แสดง 11-12 จาก 12");
  });

  test("15. pager disabled states: prev ปิดหน้า 1 / next ปิดหน้า 2", async ({ page }) => {
    await openDeliveryLogs(page);
    await expect(page.locator("[data-delivery-page='prev']")).toBeDisabled();
    await page.locator("[data-delivery-page='next']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("[data-delivery-page='prev']")).toBeEnabled();
    await expect(page.locator("[data-delivery-page='next']")).toBeDisabled();
  });
});

test.describe("QA-BO-028: Search", () => {

  test("16. ค้นหาด้วย Delivery ID 'DLV-DEL-033-REQ' → เจอ 1 row", async ({ page }) => {
    await openDeliveryLogs(page);
    await page.locator("#delivery-search").fill("DLV-DEL-033-REQ");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["DLV-DEL-033-REQ"]);
  });

  test("17. ค้นหาด้วย Event 'suspension' → เจอ 4 rows (ACCT-010/011/013 + 010?)", async ({ page }) => {
    await openDeliveryLogs(page);
    await page.locator("#delivery-search").fill("suspension");
    await page.waitForTimeout(300);
    // "Account suspension email" = ACCT-010, ACCT-011, ACCT-013 (auto-suspension ก็ match "suspension")
    const ids = await rowIds(page);
    expect(ids).toContain("DLV-ACCT-009");
    expect(ids).toContain("DLV-ACCT-010");
    expect(ids).toContain("DLV-ACCT-011");
    expect(ids).toContain("DLV-ACCT-013");
    expect(ids.length).toBe(4);
  });

  test("18. ค้นหาด้วย Source 'RPU-560' → เจอ DLV-ACCT-009 + DLV-ACCT-012", async ({ page }) => {
    await openDeliveryLogs(page);
    await page.locator("#delivery-search").fill("RPU-560");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["DLV-ACCT-012", "DLV-ACCT-009"]);
  });

  test("19. ค้นหาด้วย Recipient 'U-1104' → เจอ DLV-DEL-033-REQ", async ({ page }) => {
    await openDeliveryLogs(page);
    await page.locator("#delivery-search").fill("U-1104");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["DLV-DEL-033-REQ"]);
  });

  test("20. ค้นหาด้วย tag/detail 'grace period' → เจอ DLV-DEL-035-GR3", async ({ page }) => {
    await openDeliveryLogs(page);
    await page.locator("#delivery-search").fill("grace period");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["DLV-DEL-035-GR3"]);
  });

  test("21. ค้นหาด้วย 'retry' → เจอ 2 rows (DLV-ACCT-013 + DLV-WA-1050)", async ({ page }) => {
    await openDeliveryLogs(page);
    await page.locator("#delivery-search").fill("retry");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["DLV-WA-1050", "DLV-ACCT-013"]);
  });

  test("22. ค้นหาไม่เจอ → empty state 'ไม่พบ delivery log' + footer 0", async ({ page }) => {
    await openDeliveryLogs(page);
    await page.locator("#delivery-search").fill("NONEXISTENTXYZ123");
    await page.waitForTimeout(300);
    expect(await rowCount(page)).toBe(0);
    await expect(page.locator(".delivery-log-table .empty-title")).toHaveText("ไม่พบ delivery log");
    await expect(page.locator("#table .footer-range span").first()).toContainText("แสดง 0 จาก 0");
  });
});

test.describe("QA-BO-028: Filter + Sort", () => {

  test("23. filter status 'Sent' → 10 rows", async ({ page }) => {
    await openDeliveryLogs(page);
    await pickCustomOption(page, "delivery-status-filter", "Sent");
    expect(await rowCount(page)).toBe(10);
  });

  test("24. filter status 'Retry' → 2 rows (DLV-WA-1050 + DLV-ACCT-013)", async ({ page }) => {
    await openDeliveryLogs(page);
    await pickCustomOption(page, "delivery-status-filter", "Retry");
    expect(await rowIds(page)).toEqual(["DLV-WA-1050", "DLV-ACCT-013"]);
  });

  test("25. filter channel 'Email' → 11 rows (page 1 โชว์ 10 + footer จาก 11)", async ({ page }) => {
    await openDeliveryLogs(page);
    await pickCustomOption(page, "delivery-channel-filter", "Email");
    expect(await rowCount(page)).toBe(10); // page 1 of 11
    await expect(page.locator("#table .footer-range span").first()).toContainText("จาก 11");
  });

  test("26. filter channel 'Push' → 1 row (DLV-WA-1050)", async ({ page }) => {
    await openDeliveryLogs(page);
    await pickCustomOption(page, "delivery-channel-filter", "Push");
    expect(await rowIds(page)).toEqual(["DLV-WA-1050"]);
  });

  test("27. combine status + channel: Sent + Email → 10 rows", async ({ page }) => {
    await openDeliveryLogs(page);
    await pickCustomOption(page, "delivery-status-filter", "Sent");
    await pickCustomOption(page, "delivery-channel-filter", "Email");
    expect(await rowCount(page)).toBe(10);
  });

  test("28. sort 'เก่าสุดก่อน' → row แรกคือ DLV-ACCT-008-INV-001", async ({ page }) => {
    await openDeliveryLogs(page);
    await pickCustomOption(page, "delivery-sort", "oldest");
    expect((await rowIds(page))[0]).toBe("DLV-ACCT-008-INV-001");
  });

  test("29. กลับ sort 'ล่าสุดก่อน' → row แรกกลับเป็น DLV-WA-1050", async ({ page }) => {
    await openDeliveryLogs(page);
    await pickCustomOption(page, "delivery-sort", "oldest");
    await pickCustomOption(page, "delivery-sort", "latest");
    expect((await rowIds(page))[0]).toBe("DLV-WA-1050");
  });
});

test.describe("QA-BO-028: Reset + filter persistence", () => {

  test("30. reset ล้าง search + filters กลับ 10 rows และค่า default", async ({ page }) => {
    await openDeliveryLogs(page);
    await page.locator("#delivery-search").fill("DLV-DEL");
    await pickCustomOption(page, "delivery-status-filter", "Sent");
    await page.waitForTimeout(200);
    const inBarReset = page.locator(".delivery-filter-bar [data-delivery-reset]");
    if (await inBarReset.isVisible().catch(() => false)) {
      await inBarReset.click();
    } else {
      await page.locator("#user-panel-filter-actions [data-delivery-reset]").click();
    }
    await page.waitForTimeout(300);
    expect(await rowCount(page)).toBe(10);
    await expect(page.locator("#delivery-search")).toHaveValue("");
    expect(await selectValue(page, "delivery-status-filter")).toBe("");
    expect(await selectValue(page, "delivery-channel-filter")).toBe("");
    expect(await selectValue(page, "delivery-sort")).toBe("latest");
  });

  test("31. persistence: search ค้างหลังเปิด/ปิด detail modal", async ({ page }) => {
    await openDeliveryLogs(page);
    await page.locator("#delivery-search").fill("DLV-DEL");
    await page.waitForTimeout(300);
    await deliveryRow(page, "DLV-DEL-033-REQ").locator('.user-cell-primary[data-label="Delivery ID"]').click();
    await page.waitForSelector("#user-action-modal.show", { timeout: 5000 });
    await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
    await page.waitForTimeout(300);
    await expect(page.locator("#delivery-search")).toHaveValue("DLV-DEL");
    expect(await rowCount(page)).toBe(5); // DLV-DEL-035-GR3/033-REQ/031-RES/028-REJ/025-DEL
  });

  test("32. persistence: status filter ค้างหลังเปิด/ปิด detail modal", async ({ page }) => {
    await openDeliveryLogs(page);
    await pickCustomOption(page, "delivery-status-filter", "Retry");
    await deliveryRow(page, "DLV-WA-1050").locator('.user-cell-primary[data-label="Delivery ID"]').click();
    await page.waitForSelector("#user-action-modal.show", { timeout: 5000 });
    await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
    await page.waitForTimeout(300);
    expect(await selectValue(page, "delivery-status-filter")).toBe("Retry");
    expect(await rowCount(page)).toBe(2);
  });
});

test.describe("QA-BO-028: Read-only detail modal", () => {

  test("33. คลิก row → เปิด modal title = Delivery ID + subtitle = event name", async ({ page }) => {
    await openDeliveryLogs(page);
    await deliveryRow(page, "DLV-DEL-033-REQ").locator('.user-cell-primary[data-label="Delivery ID"]').click();
    await page.waitForSelector("#user-action-modal.show", { timeout: 5000 });
    await expect(page.locator("#user-action-modal-title")).toHaveText("DLV-DEL-033-REQ");
    await expect(page.locator("#user-action-modal-body")).toContainText("Account deletion confirmation email");
  });

  test("34. modal มี 8 rows: Source/Recipient/Channel/Status/Priority/Detail/Tags/Admin note", async ({ page }) => {
    await openDeliveryLogs(page);
    await deliveryRow(page, "DLV-DEL-033-REQ").locator('.user-cell-primary[data-label="Delivery ID"]').click();
    await page.waitForSelector("#user-action-modal.show", { timeout: 5000 });
    const labels = await page.locator(".delivery-detail-summary .option-confirm-label").allTextContents();
    expect(labels).toEqual(["Source", "Recipient", "Channel", "Status", "Priority", "Detail", "Tags", "Admin note"]);
  });

  test("35. modal values ของ DLV-DEL-033-REQ ถูกต้อง", async ({ page }) => {
    await openDeliveryLogs(page);
    await deliveryRow(page, "DLV-DEL-033-REQ").locator('.user-cell-primary[data-label="Delivery ID"]').click();
    await page.waitForSelector("#user-action-modal.show", { timeout: 5000 });
    const rows = await modalRows(page);
    expect(rows["Source"]).toBe("DEL-033");
    expect(rows["Recipient"]).toBe("U-1104");
    expect(rows["Channel"]).toContain("Email");
    expect(rows["Status"]).toContain("Sent");
    expect(rows["Priority"]).toBe("สูง");
    expect(rows["Detail"]).toContain("ผู้ใช้ยืนยันผ่านแอป (FO)");
    // innerHTML escape & เป็น &amp; — เช็ก substring ที่ไม่มี &
    expect(rows["Admin note"]).toContain("reference ต้องตรงกับ History");
  });

  test("36. Tags chips ไม่รวม Email/Push/FCM (แสดงเฉพาะ tag เหลือ)", async ({ page }) => {
    await openDeliveryLogs(page);
    await deliveryRow(page, "DLV-DEL-033-REQ").locator('.user-cell-primary[data-label="Delivery ID"]').click();
    await page.waitForSelector("#user-action-modal.show", { timeout: 5000 });
    const chips = page.locator(".delivery-detail-summary .chip");
    const texts = await chips.allTextContents();
    expect(texts).toEqual(["Lifecycle", "Audit linked"]);
  });

  test("37. Retry row (DLV-ACCT-013): status pill amber + tag 'Retry queued' + admin note retry", async ({ page }) => {
    await openDeliveryLogs(page);
    await deliveryRow(page, "DLV-ACCT-013").locator('.user-cell-primary[data-label="Delivery ID"]').click();
    await page.waitForSelector("#user-action-modal.show", { timeout: 5000 });
    const rows = await modalRows(page);
    expect(rows["Status"]).toContain("Retry");
    expect(rows["Admin note"]).toContain("ลองส่งอีกครั้งใน 15 นาที");
    const chips = await page.locator(".delivery-detail-summary .chip").allTextContents();
    expect(chips).toContain("Retry queued");
  });

  test("38. Push row (DLV-WA-1050): Channel Push + priority กลาง", async ({ page }) => {
    await openDeliveryLogs(page);
    await deliveryRow(page, "DLV-WA-1050").locator('.user-cell-primary[data-label="Delivery ID"]').click();
    await page.waitForSelector("#user-action-modal.show", { timeout: 5000 });
    const rows = await modalRows(page);
    expect(rows["Channel"]).toContain("Push");
    expect(rows["Priority"]).toBe("กลาง");
    expect(rows["Source"]).toBe("WAL-1050");
  });

  test("39. modal เป็น read-only — ไม่มี footer/action button นอกจากปิด", async ({ page }) => {
    await openDeliveryLogs(page);
    await deliveryRow(page, "DLV-DEL-033-REQ").locator('.user-cell-primary[data-label="Delivery ID"]').click();
    await page.waitForSelector("#user-action-modal.show", { timeout: 5000 });
    expect(await page.locator("#user-action-modal .user-action-footer").count()).toBe(0);
    expect(await page.locator("#user-action-modal [data-delivery-action-confirm]").count()).toBe(0);
  });

  test("40. ปิด modal ด้วยปุ่ม X", async ({ page }) => {
    await openDeliveryLogs(page);
    await deliveryRow(page, "DLV-DEL-033-REQ").locator('.user-cell-primary[data-label="Delivery ID"]').click();
    await page.waitForSelector("#user-action-modal.show", { timeout: 5000 });
    await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
  });

  test("41. owner ที่ไม่มี ' / ' → Source '-' + Recipient = owner (edge case)", async ({ page }) => {
    await openDeliveryLogs(page);
    // ทุก seed มี " / " — ยัด row ชั่วคราวเพื่อครอบ branch splitDeliverySourceRecipient
    await page.evaluate(() => {
      moduleData.settings.rows.push(item(
        "DLV-EDGE-001", "Edge case email", "Standalone Recipient",
        "Delivery", "กลาง", "Sent", "no separator owner", ["Email"], "test"));
      renderModule("settings", "Delivery Logs", "Delivery Logs");
    });
    await page.waitForTimeout(300);
    const row = deliveryRow(page, "DLV-EDGE-001");
    await expect(row.locator('[data-label="Source"] .main-text')).toHaveText("-");
    await expect(row.locator('[data-label="Recipient"] .main-text')).toHaveText("Standalone Recipient");
  });
});

test.describe("QA-BO-028: Delivery ID patterns + jump links", () => {

  test("42. delivery ID patterns ครบ 3 รูปแบบ (DLV-DEL-*, DLV-ACCT-*, DLV-WA-*)", async ({ page }) => {
    await openDeliveryLogs(page);
    const ids = await page.evaluate(() =>
      getDeliveryLogRows().map(r => r.id));
    expect(ids.some(id => id.startsWith("DLV-DEL-"))).toBe(true);
    expect(ids.some(id => id.startsWith("DLV-ACCT-"))).toBe(true);
    expect(ids.some(id => id.startsWith("DLV-WA-"))).toBe(true);
    expect(ids.length).toBe(12);
  });

  test("43. jump link จาก Deletion History → Delivery Logs กรอง id + เปิด modal", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    // เปิด DEL-028 detail → history row มี [data-delivery-log-jump="DLV-DEL-028-REJ"]
    await page.evaluate(() => {
      renderModule("deletions", "Deletion Requests", "Deletion Requests");
      renderDeletionDetail("DEL-028");
    });
    await page.waitForSelector(".deletion-detail-page", { timeout: 5000 });
    await page.locator('[data-delivery-log-jump="DLV-DEL-028-REJ"]').click();
    await page.waitForSelector("#user-action-modal.show", { timeout: 5000 });
    await expect(page.locator("#user-action-modal-title")).toHaveText("DLV-DEL-028-REJ");
    await expect(page.locator("#delivery-search")).toHaveValue("DLV-DEL-028-REJ");
    const mod = await page.evaluate(() => activeModule + "|" + activeSub);
    expect(mod).toBe("settings|Delivery Logs");
  });

  test("44. jump link จาก Admin Detail history → Delivery Logs + modal", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    // ADM-001 detail มี deliveryRef DLV-ACCT-008-INV-001? — ใช้ admin account ที่มี delivery history
    const target = await page.evaluate(() => {
      const acc = adminAccountData.accounts.find(a =>
        (adminAccountData.detail[a.id]?.activity || []).some(act => act.deliveryRef));
      if (!acc) return null;
      renderModule("settings", "Admin Accounts", "Admin Accounts");
      renderAdminAccountDetail(acc.id);
      const act = (adminAccountData.detail[acc.id].activity || []).find(x => x.deliveryRef);
      return { id: acc.id, ref: act.deliveryRef };
    });
    test.skip(!target, "ไม่มี admin account ที่มี deliveryRef");
    await page.waitForSelector(`[data-delivery-log-jump="${target.ref}"]`, { timeout: 5000 });
    await page.locator(`[data-delivery-log-jump="${target.ref}"]`).first().click();
    await page.waitForSelector("#user-action-modal.show", { timeout: 5000 });
    await expect(page.locator("#user-action-modal-title")).toHaveText(target.ref);
    const mod = await page.evaluate(() => activeModule + "|" + activeSub);
    expect(mod).toBe("settings|Delivery Logs");
  });

  test("45. jump ด้วย id ที่ไม่มีใน rows → list กรองแต่ไม่เปิด modal", async ({ page }) => {
    await openDeliveryLogs(page);
    await page.evaluate(() => jumpToDeliveryLog("DLV-NOT-EXIST-999"));
    await page.waitForTimeout(400);
    await expect(page.locator("#delivery-search")).toHaveValue("DLV-NOT-EXIST-999");
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
  });
});

test.describe("QA-BO-028: Responsive", () => {

  test("46. mobile: filter selects ซ่อนเมื่อปิดตัวกรอง → toggle เปิดได้", async ({ page }) => {
    const mobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    test.skip(!mobile, "เทสเฉพาะ mobile viewport");
    await openDeliveryLogs(page);
    const bar = page.locator(".user-filter-bar.delivery-filter-bar");
    expect(await bar.getAttribute("data-filter-open")).toBe("false");
    await expect(page.locator(".delivery-filter-bar .user-advanced-filter").first()).not.toBeVisible();
    await page.locator("#user-panel-filter-actions [data-delivery-filter-toggle]").click();
    await page.waitForTimeout(200);
    expect(await bar.getAttribute("data-filter-open")).toBe("true");
    await expect(page.locator(".delivery-filter-bar .user-advanced-filter").first()).toBeVisible();
    await expect(page.locator("[data-delivery-filter-toggle] span")).toHaveText("ปิดตัวกรอง");
  });

  test("47. mobile card: เห็น Delivery ID + card tags แต่ซ่อน data-label cells", async ({ page }) => {
    const mobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    test.skip(!mobile, "เทสเฉพาะ mobile viewport");
    await openDeliveryLogs(page);
    const row = deliveryRow(page, "DLV-DEL-033-REQ");
    await expect(row.locator('[data-label="Delivery ID"]')).toBeVisible();
    await expect(row.locator('[data-label="Event"]')).not.toBeVisible();
    await expect(row.locator('[data-label="Status"]')).not.toBeVisible();
    await expect(row.locator(".user-card-tags")).toBeVisible();
    await expect(row.locator(".user-card-tags .pill", { hasText: "Sent" })).toBeVisible();
    await expect(row.locator(".user-card-tags .pill", { hasText: "Email" })).toBeVisible();
    await expect(row.locator(".user-card-meta")).toContainText("DEL-033");
    await expect(row.locator(".user-card-meta")).toContainText("U-1104");
  });

  test("48. mobile card: meta แสดง Event/Source/Recipient/Detail", async ({ page }) => {
    const mobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    test.skip(!mobile, "เทสเฉพาะ mobile viewport");
    await openDeliveryLogs(page);
    const meta = deliveryRow(page, "DLV-DEL-033-REQ").locator(".user-card-meta");
    await expect(meta).toContainText("Event");
    await expect(meta).toContainText("Source");
    await expect(meta).toContainText("Recipient");
    await expect(meta).toContainText("Detail");
  });

  test("49. mobile card: คลิกการ์ดเปิด detail modal ได้", async ({ page }) => {
    const mobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    test.skip(!mobile, "เทสเฉพาะ mobile viewport");
    await openDeliveryLogs(page);
    await deliveryRow(page, "DLV-DEL-033-REQ").locator('.user-cell-primary[data-label="Delivery ID"]').click();
    await page.waitForSelector("#user-action-modal.show", { timeout: 5000 });
    await expect(page.locator("#user-action-modal-title")).toHaveText("DLV-DEL-033-REQ");
  });

  test("50. mobile pager: prev/next ใช้งานได้ (ปุ่มเลขหน้าซ่อนบน mobile)", async ({ page }) => {
    const mobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    test.skip(!mobile, "เทสเฉพาะ mobile viewport");
    await openDeliveryLogs(page);
    await page.locator("[data-delivery-page='next']").click();
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["DLV-ACCT-009", "DLV-ACCT-008-INV-001"]);
    await page.locator("[data-delivery-page='prev']").click();
    await page.waitForTimeout(300);
    expect(await rowCount(page)).toBe(10);
  });

  test("51. desktop/tablet: filter selects แสดงเสมอโดยไม่ต้อง toggle", async ({ page }) => {
    const mobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    test.skip(mobile, "เทสเฉพาะ desktop/tablet viewport");
    await openDeliveryLogs(page);
    await expect(page.locator(".delivery-filter-bar .user-advanced-filter").first()).toBeVisible();
  });
});
