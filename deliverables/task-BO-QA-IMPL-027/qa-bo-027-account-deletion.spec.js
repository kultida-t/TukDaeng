// QA-BO-027: Account Deletion — full coverage (strict Playwright spec)
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล — renderDeletionRequests/renderDeletionRows/renderDeletionDetail
//   + renderDeletionActionModal/confirmDeletionAction + deletionRequestData seeds (12 requests)
// เป้าหมาย: รันเทสครอบ nav/list/search/filter/sort/pagination/row menu/detail sections/
//   history & actions/action modals/cross-module/responsive (ห้ามแก้ prototype)
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

// helper: ไปหน้า Deletion Requests ผ่านเมนู Account Deletion (module ไม่มี submenu)
async function goToDeletionList(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  await page.locator(".nav-item[data-module='deletions']").click();
  await page.waitForTimeout(300);
}

// helper: render list ตรงผ่าน renderModule (เร็วกว่า สำหรับเทสเนื้อหา)
async function openDeletionList(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await page.evaluate(() => renderModule("deletions", "Deletion Requests", "Deletion Requests"));
  await page.waitForSelector(".deletion-request-table", { timeout: 5000 });
  await page.waitForTimeout(200);
}

// helper: เปิด Request Detail ตรงผ่าน renderer (ใช้กับเทสเนื้อหา detail)
async function openDeletionDetail(page, id) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await page.evaluate((rid) => {
    renderModule("deletions", "Deletion Requests", "Deletion Requests");
    renderDeletionDetail(rid);
  }, id);
  await page.waitForSelector(".deletion-detail-page", { timeout: 5000 });
  await page.waitForTimeout(200);
}

// helper: เปิด filter selects ถ้าจอ mobile (≤760px เท่านั้น — desktop/tablet แสดงเสมอ)
async function openFilterBar(page) {
  const mobile = await isMobile(page);
  if (!mobile) return;
  const bar = page.locator(".user-filter-bar.deletion-filter-bar");
  if (!(await bar.count())) return;
  const isOpen = await bar.getAttribute("data-filter-open");
  if (isOpen === "false") {
    await page.locator("#user-panel-filter-actions [data-deletion-filter-toggle]").click();
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

// helper: อ่าน Request ID ของทุก row ในหน้าปัจจุบัน (เรียงตาม DOM)
async function rowIds(page) {
  return await page.locator(".deletion-request-table .user-row.deletion-row").evaluateAll(rows =>
    rows.map(r => r.getAttribute("data-deletion-card")));
}

// helper: นับจำนวน row ในหน้าปัจจุบัน
async function rowCount(page) {
  return await page.locator(".deletion-request-table .user-row.deletion-row").count();
}

// helper: locator ของ row ตาม Request ID
function requestRow(page, id) {
  return page.locator(`.deletion-request-table .user-row.deletion-row[data-deletion-card="${id}"]`);
}

// helper: ค้นหาแล้วคลิก row เปิด detail ผ่าน UI จริง (คลิก cell Request ID)
async function openDetailViaRowClick(page, id) {
  await openFilterBar(page);
  await page.locator("#deletion-search").fill(id);
  await page.waitForTimeout(300);
  await requestRow(page, id).locator('.user-cell-primary[data-label="Request ID"]').click();
  await page.waitForSelector(".deletion-detail-page", { timeout: 5000 });
}

// helper: เปิด detail ผ่าน row menu > ดูรายละเอียด
async function openDetailViaMenu(page, id) {
  await openFilterBar(page);
  await page.locator("#deletion-search").fill(id);
  await page.waitForTimeout(300);
  const row = requestRow(page, id);
  await row.locator(".row-menu > summary").click();
  await page.waitForTimeout(300);
  await row.locator(`[data-deletion-open="${id}"]`).click();
  await page.waitForSelector(".deletion-detail-page", { timeout: 5000 });
}

// helper: อ่าน History & Actions rows — map คอลัมน์จาก data-label ของ td
async function historyRows(page) {
  const rows = page.locator(".deletion-action-section .history-table tbody tr");
  const count = await rows.count();
  const logs = [];
  for (let i = 0; i < count; i++) {
    const cell = label => rows.nth(i).locator(`td[data-label="${label}"]`);
    logs.push({
      at: ((await cell("วันที่ / เวลา").textContent()) || "").trim(),
      actor: ((await cell("ผู้ดำเนินการ").textContent()) || "").trim(),
      action: ((await cell("Action").textContent()) || "").trim(),
      email: ((await cell("ส่งอีเมล").innerHTML()) || "").trim(),
      audit: ((await cell("Audit").innerHTML()) || "").trim(),
      note: ((await cell("รายละเอียด").innerHTML()) || "").trim()
    });
  }
  return logs;
}

// helper: เปิด action modal และเลือกเหตุผลตัวแรก + ใส่ note
async function fillActionModal(page, action, note) {
  await page.click(`[data-deletion-action="${action}"]`);
  await page.waitForSelector("#user-action-modal.show", { timeout: 3000 });
  const reasonContainer = page.locator("div[data-custom-select]").filter({ has: page.locator("#deletion-action-reason") });
  await reasonContainer.locator("[data-custom-select-trigger]").click();
  await page.waitForSelector("[data-custom-select-option]", { timeout: 3000 });
  await reasonContainer.locator("[data-custom-select-option]").first().click();
  if (note) await page.locator("#deletion-action-note").fill(note);
}

// helper: กดยืนยัน action และรอ toast
async function confirmActionAndWaitToast(page, action) {
  await page.click(`[data-deletion-action-confirm="${action}"]`);
  await page.waitForSelector("#success-toast.show", { timeout: 3000 });
  await page.waitForTimeout(500);
}

// helper: อ่าน timeline steps (class + label + date)
async function timelineSteps(page) {
  return await page.locator(".deletion-timeline .deletion-timeline-step").evaluateAll(steps =>
    steps.map(s => ({
      state: [...s.classList].find(c => ["done", "current", "pending", "skipped"].includes(c)) || "",
      label: (s.querySelector(".deletion-timeline-label")?.textContent || "").trim(),
      date: (s.querySelector(".deletion-timeline-date")?.textContent || "").trim(),
      sub: (s.querySelector(".deletion-timeline-sub")?.textContent || "").trim()
    })));
}

// ---------- specs ----------

test.describe("QA-BO-027: Navigation", () => {

  test("1. nav 'Account Deletion' อยู่ใน section งานตรวจสอบและบริการ", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await ensureNavOpen(page);
    const navItem = page.locator(".nav-item[data-module='deletions']");
    await expect(navItem).toBeVisible();
    await expect(navItem).toContainText("Account Deletion");
    // อยู่ในกลุ่ม งานตรวจสอบและบริการ (group เดียวกับ Market Demand)
    const section = navItem.locator("xpath=ancestor::*[contains(@class,'nav-section') or contains(@class,'nav-group')][1]");
    if (await section.count()) {
      await expect(section).toContainText("งานตรวจสอบและบริการ");
    }
  });

  test("2. ไม่มี submenu ใต้ Account Deletion (module เดี่ยว)", async ({ page }) => {
    await goToDeletionList(page);
    await expect(page.locator(".submenu[data-submenu='deletions']")).toHaveCount(0);
  });

  test("3. คลิก nav → เปิด Deletion Requests list (deletion-list-mode + crumb)", async ({ page }) => {
    await goToDeletionList(page);
    await expect(page.locator("body")).toHaveClass(/deletion-list-mode/);
    await expect(page.locator("#crumb")).toHaveText("งานตรวจสอบและบริการ / Account Deletion");
    await expect(page.locator(".nav-item[data-module='deletions']")).toHaveClass(/active/);
  });

  test("4. page header: title + panel title + ไม่มี primary action", async ({ page }) => {
    await goToDeletionList(page);
    await expect(page.locator("#page-title")).toHaveText("Account Deletion Requests");
    await expect(page.locator("#panel-title")).toHaveText("Deletion Requests List");
    await expect(page.locator("#primary-action")).toHaveText("");
  });

  test("5. ไม่มี KPI cards / summary grid / cards panel", async ({ page }) => {
    await goToDeletionList(page);
    await expect(page.locator("#summary-grid")).toBeEmpty();
    await expect(page.locator("#cards")).toBeEmpty();
  });

  test("6. filter actions มีปุ่ม toggle + reset ใน DOM (visibility ตาม viewport)", async ({ page }) => {
    const mobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    await goToDeletionList(page);
    // ปุ่มอยู่ใน DOM เสมอ — บน desktop zone filter-actions ถูกซ่อน (ใช้ปุ่ม reset ใน filter bar แทน)
    await expect(page.locator("[data-deletion-filter-toggle]")).toHaveCount(1);
    await expect(page.locator("#user-panel-filter-actions [data-deletion-reset]")).toHaveCount(1);
    if (mobile) {
      await expect(page.locator("[data-deletion-filter-toggle]")).toBeVisible();
    } else {
      // desktop/tablet: reset ที่ใช้งานจริงอยู่ใน filter bar (icon button)
      await expect(page.locator(".deletion-filter-bar [data-deletion-reset]")).toBeVisible();
    }
  });
});

test.describe("QA-BO-027: List rendering & pagination", () => {

  test("7. table header 8 คอลัมน์ตามลำดับ", async ({ page }) => {
    await openDeletionList(page);
    const heads = page.locator(".deletion-request-table .user-row.head > div");
    await expect(heads).toHaveCount(8);
    const expected = ["Request ID", "User", "Assets", "Request Status", "Account Status", "Grace Period", "Requested At", "Action"];
    for (let i = 0; i < expected.length; i++) {
      await expect(heads.nth(i)).toHaveText(expected[i]);
    }
  });

  test("8. page 1 แสดง 10 rows จาก 12 (pageSize=10)", async ({ page }) => {
    await openDeletionList(page);
    expect(await rowCount(page)).toBe(10);
  });

  test("9. footer range 'แสดง 1-10 จาก 12'", async ({ page }) => {
    await openDeletionList(page);
    await expect(page.locator("#table .footer-range span").first()).toContainText("แสดง 1-10 จาก 12");
  });

  test("10. default sort = ล่าสุดก่อน → row แรกคือ DEL-033", async ({ page }) => {
    await openDeletionList(page);
    expect((await rowIds(page))[0]).toBe("DEL-033");
    expect(await selectValue(page, "deletion-sort")).toBe("latest");
  });

  test("11. row DEL-033 แสดง field ครบ (id/user+uid/assets/status pills/grace/requested at)", async ({ page }) => {
    await openDeletionList(page);
    const row = requestRow(page, "DEL-033");
    await expect(row.locator('[data-label="Request ID"] .main-text')).toHaveText("DEL-033");
    await expect(row.locator('[data-label="User"] [data-user-open="U-1104"]')).toHaveText("Archive Collector");
    await expect(row.locator('[data-label="User"] .user-id-line')).toHaveText("U-1104");
    await expect(row.locator('[data-label="Assets"] .main-text')).toHaveText("6");
    await expect(row.locator('[data-label="Request Status"] .pill')).toHaveText("รอดำเนินการ");
    await expect(row.locator('[data-label="Account Status"] .pill')).toHaveText("Deactivated");
    await expect(row.locator('[data-label="Grace Period"] .pill')).toHaveText("เหลือ 23 วัน");
    await expect(row.locator('[data-label="Requested At"]')).toContainText("07 Sep 2026 09:15");
  });

  test("12. Grace Period cell ของ terminal state (restored/anonymized) แสดง '—'", async ({ page }) => {
    await openDeletionList(page);
    // DEL-031 = restored, DEL-025 = anonymized — ทั้งคู่อยู่หน้า 1 (latest sort)
    await expect(requestRow(page, "DEL-031").locator('[data-label="Grace Period"]')).toHaveText("—");
    await expect(requestRow(page, "DEL-025").locator('[data-label="Grace Period"]')).toHaveText("—");
  });

  test("13. row menu (...) มี action เดียว 'ดูรายละเอียด'", async ({ page }) => {
    const mobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    test.skip(mobile, "mobile card ไม่แสดง row menu ตาม design");
    await openDeletionList(page);
    const row = requestRow(page, "DEL-033");
    await row.locator(".row-menu > summary").click();
    await page.waitForTimeout(200);
    const items = row.locator(".row-menu-list button");
    await expect(items).toHaveCount(1);
    await expect(items.first()).toHaveText("ดูรายละเอียด");
  });

  test("14. กดถัดไป → page 2 มี 2 rows (DEL-021, DEL-020)", async ({ page }) => {
    await openDeletionList(page);
    await page.locator("[data-deletion-page='next']").click();
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["DEL-021", "DEL-020"]);
    await expect(page.locator("#table .footer-range span").first()).toContainText("แสดง 11-12 จาก 12");
  });

  test("15. pager disabled states: prev ปิดหน้า 1 / next ปิดหน้า 2", async ({ page }) => {
    await openDeletionList(page);
    await expect(page.locator("[data-deletion-page='prev']")).toBeDisabled();
    await expect(page.locator("[data-deletion-page='next']")).toBeEnabled();
    await page.locator("[data-deletion-page='next']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("[data-deletion-page='prev']")).toBeEnabled();
    await expect(page.locator("[data-deletion-page='next']")).toBeDisabled();
  });

  test("16. กดก่อนหน้าจาก page 2 → กลับ page 1 ครบ 10 rows", async ({ page }) => {
    await openDeletionList(page);
    await page.locator("[data-deletion-page='next']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-deletion-page='prev']").click();
    await page.waitForTimeout(300);
    expect(await rowCount(page)).toBe(10);
    expect((await rowIds(page))[0]).toBe("DEL-033");
  });
});

test.describe("QA-BO-027: Search", () => {

  test("17. ค้นหาด้วย Request ID 'DEL-033' → เจอ 1 row", async ({ page }) => {
    await openDeletionList(page);
    await page.locator("#deletion-search").fill("DEL-033");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["DEL-033"]);
  });

  test("18. ค้นหาด้วย User ID 'u-1104' (case-insensitive) → เจอ DEL-033", async ({ page }) => {
    await openDeletionList(page);
    await page.locator("#deletion-search").fill("u-1104");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["DEL-033"]);
  });

  test("19. ค้นหาด้วย display name 'archive collector' → เจอ DEL-033", async ({ page }) => {
    await openDeletionList(page);
    await page.locator("#deletion-search").fill("archive collector");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["DEL-033"]);
  });

  test("20. ค้นหาด้วยข้อความใน detail 'serious report' → เจอ DEL-033", async ({ page }) => {
    await openDeletionList(page);
    await page.locator("#deletion-search").fill("serious report");
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["DEL-033"]);
  });

  test("21. ค้นหาด้วย request status 'รอดำเนินการ' → เจอ 4 rows", async ({ page }) => {
    await openDeletionList(page);
    await page.locator("#deletion-search").fill("รอดำเนินการ");
    await page.waitForTimeout(300);
    expect(await rowCount(page)).toBe(4);
  });

  test("22. ค้นหาด้วย account status 'anonymized' → เจอ 4 rows", async ({ page }) => {
    await openDeletionList(page);
    await page.locator("#deletion-search").fill("anonymized");
    await page.waitForTimeout(300);
    expect(await rowCount(page)).toBe(4);
  });

  test("23. ค้นหาไม่เจอ → empty state 'ไม่มีคำขอลบบัญชี' + footer 0", async ({ page }) => {
    await openDeletionList(page);
    await page.locator("#deletion-search").fill("NONEXISTENTXYZ123");
    await page.waitForTimeout(300);
    expect(await rowCount(page)).toBe(0);
    await expect(page.locator(".deletion-request-table .detail-empty")).toHaveText("ไม่มีคำขอลบบัญชี");
    await expect(page.locator("#table .footer-range span").first()).toContainText("แสดง 0 จาก 0");
  });
});

test.describe("QA-BO-027: Filter request status + grace state", () => {

  test("24. filter status 'รอดำเนินการ' → 4 rows", async ({ page }) => {
    await openDeletionList(page);
    await pickCustomOption(page, "deletion-status-filter", "รอดำเนินการ");
    expect(await rowCount(page)).toBe(4);
  });

  test("25. filter status 'คืนบัญชีแล้ว' → 2 rows (DEL-031, DEL-032)", async ({ page }) => {
    await openDeletionList(page);
    await pickCustomOption(page, "deletion-status-filter", "คืนบัญชีแล้ว");
    expect(await rowIds(page)).toEqual(["DEL-031", "DEL-032"]);
  });

  test("26. filter status 'ปฏิเสธคืนบัญชี' → 2 rows (DEL-028, DEL-029)", async ({ page }) => {
    await openDeletionList(page);
    await pickCustomOption(page, "deletion-status-filter", "ปฏิเสธคืนบัญชี");
    expect(await rowIds(page)).toEqual(["DEL-028", "DEL-029"]);
  });

  test("27. filter status 'ลบตัวตนแล้ว' → 4 rows", async ({ page }) => {
    await openDeletionList(page);
    await pickCustomOption(page, "deletion-status-filter", "ลบตัวตนแล้ว");
    expect(await rowCount(page)).toBe(4);
  });

  test("28. filter grace 'ยังนับอยู่' (active) → 2 rows (DEL-033, DEL-034)", async ({ page }) => {
    await openDeletionList(page);
    await pickCustomOption(page, "deletion-grace-filter", "active");
    expect(await rowIds(page)).toEqual(["DEL-033", "DEL-034"]);
  });

  test("29. filter grace 'ใกล้ครบกำหนด' (ending) → 3 rows (DEL-035, DEL-036, DEL-028)", async ({ page }) => {
    await openDeletionList(page);
    await pickCustomOption(page, "deletion-grace-filter", "ending");
    expect(await rowIds(page)).toEqual(["DEL-035", "DEL-036", "DEL-028"]);
  });

  test("30. filter grace 'ครบแล้ว' (expired) → 1 row (DEL-029)", async ({ page }) => {
    await openDeletionList(page);
    await pickCustomOption(page, "deletion-grace-filter", "expired");
    expect(await rowIds(page)).toEqual(["DEL-029"]);
  });

  test("31. filter grace 'คืนบัญชีแล้ว' (restored) → 2 rows", async ({ page }) => {
    await openDeletionList(page);
    await pickCustomOption(page, "deletion-grace-filter", "restored");
    expect(await rowCount(page)).toBe(2);
  });

  test("32. filter grace 'ลบตัวตนแล้ว' (anonymized) → 4 rows", async ({ page }) => {
    await openDeletionList(page);
    await pickCustomOption(page, "deletion-grace-filter", "anonymized");
    expect(await rowCount(page)).toBe(4);
  });

  test("33. combine status + grace: รอดำเนินการ + ใกล้ครบกำหนด → DEL-035, DEL-036", async ({ page }) => {
    await openDeletionList(page);
    await pickCustomOption(page, "deletion-status-filter", "รอดำเนินการ");
    await pickCustomOption(page, "deletion-grace-filter", "ending");
    expect(await rowIds(page)).toEqual(["DEL-035", "DEL-036"]);
  });
});

test.describe("QA-BO-027: Sort", () => {

  test("34. sort 'เก่าสุดก่อน' → row แรกคือ DEL-020", async ({ page }) => {
    await openDeletionList(page);
    await pickCustomOption(page, "deletion-sort", "oldest");
    expect((await rowIds(page))[0]).toBe("DEL-020");
  });

  test("35. sort 'วันครบกำหนด' → row แรกคือ DEL-020 (graceEndsRank ต่ำสุด)", async ({ page }) => {
    await openDeletionList(page);
    await pickCustomOption(page, "deletion-sort", "graceEnds");
    expect((await rowIds(page))[0]).toBe("DEL-020");
  });

  test("36. sort 'สถานะคำขอ' (th locale) → กลุ่ม 'คืนบัญชีแล้ว' มาก่อน (DEL-031)", async ({ page }) => {
    await openDeletionList(page);
    await pickCustomOption(page, "deletion-sort", "status");
    expect((await rowIds(page))[0]).toBe("DEL-031");
  });

  test("37. กลับ sort 'ล่าสุดก่อน' → row แรกกลับเป็น DEL-033", async ({ page }) => {
    await openDeletionList(page);
    await pickCustomOption(page, "deletion-sort", "oldest");
    await pickCustomOption(page, "deletion-sort", "latest");
    expect((await rowIds(page))[0]).toBe("DEL-033");
  });
});

test.describe("QA-BO-027: Reset + filter persistence", () => {

  test("38. reset ล้าง search + filters กลับ 10 rows และค่า default", async ({ page }) => {
    await openDeletionList(page);
    await page.locator("#deletion-search").fill("DEL-03");
    await pickCustomOption(page, "deletion-status-filter", "รอดำเนินการ");
    await pickCustomOption(page, "deletion-grace-filter", "ending");
    await page.waitForTimeout(200);
    // reset ที่ใช้งาน: ใน filter bar (desktop/tablet) หรือ zone filter-actions (mobile)
    const inBarReset = page.locator(".deletion-filter-bar [data-deletion-reset]");
    if (await inBarReset.isVisible().catch(() => false)) {
      await inBarReset.click();
    } else {
      await page.locator("#user-panel-filter-actions [data-deletion-reset]").click();
    }
    await page.waitForTimeout(300);
    expect(await rowCount(page)).toBe(10);
    await expect(page.locator("#deletion-search")).toHaveValue("");
    expect(await selectValue(page, "deletion-status-filter")).toBe("");
    expect(await selectValue(page, "deletion-grace-filter")).toBe("");
    expect(await selectValue(page, "deletion-sort")).toBe("latest");
  });

  test("39. persistence: search ค้างหลัง detail → back", async ({ page }) => {
    await openDeletionList(page);
    await page.locator("#deletion-search").fill("DEL-03");
    await page.waitForTimeout(300);
    // คลิก row ตรง (ไม่ fill search ซ้ำ — state ต้องคง "DEL-03")
    await requestRow(page, "DEL-033").locator('.user-cell-primary[data-label="Request ID"]').click();
    await page.waitForSelector(".deletion-detail-page", { timeout: 5000 });
    await page.locator(".page-back-btn").click();
    await page.waitForSelector(".deletion-request-table", { timeout: 5000 });
    await expect(page.locator("#deletion-search")).toHaveValue("DEL-03");
    const ids = await rowIds(page);
    expect(ids.length).toBe(6); // DEL-031/032/033/034/035/036 ตรง "DEL-03"
    expect(ids).toContain("DEL-033");
  });

  test("40. persistence: status+grace filter ค้างหลัง detail → back", async ({ page }) => {
    await openDeletionList(page);
    await pickCustomOption(page, "deletion-status-filter", "รอดำเนินการ");
    await pickCustomOption(page, "deletion-grace-filter", "ending");
    await requestRow(page, "DEL-035").locator('.user-cell-primary[data-label="Request ID"]').click();
    await page.waitForSelector(".deletion-detail-page", { timeout: 5000 });
    await page.locator(".page-back-btn").click();
    await page.waitForSelector(".deletion-request-table", { timeout: 5000 });
    expect(await selectValue(page, "deletion-status-filter")).toBe("รอดำเนินการ");
    expect(await selectValue(page, "deletion-grace-filter")).toBe("ending");
    expect(await rowIds(page)).toEqual(["DEL-035", "DEL-036"]);
  });

  test("41. persistence: page ค้างหลัง detail → back (ยังอยู่ page 2)", async ({ page }) => {
    await openDeletionList(page);
    await page.locator("[data-deletion-page='next']").click();
    await page.waitForTimeout(300);
    await requestRow(page, "DEL-021").locator('.user-cell-primary[data-label="Request ID"]').click();
    await page.waitForSelector(".deletion-detail-page", { timeout: 5000 });
    await page.locator(".page-back-btn").click();
    await page.waitForSelector(".deletion-request-table", { timeout: 5000 });
    expect(await rowIds(page)).toEqual(["DEL-021", "DEL-020"]);
  });
});

test.describe("QA-BO-027: Request Detail — head & navigation", () => {

  test("42. crumb + page title + back button ตาม contract", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await expect(page.locator("#crumb")).toHaveText("งานตรวจสอบและบริการ / Account Deletion / Requests / DEL-033");
    await expect(page.locator("#page-title")).toHaveText("Request Detail");
    await expect(page.locator("[data-back-deletion-list]")).toBeVisible();
  });

  test("43. panel title = Request ID + subtitle mask note", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await expect(page.locator("#panel-title")).toHaveText("DEL-033");
    await expect(page.locator("#panel-subtitle")).toHaveText("U-1104 · Archive Collector · sensitive fields masked");
  });

  test("44. detail head 'DEL-033 : Archive Collector' + chips status/account/serious", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await expect(page.locator(".asset-report-id")).toHaveText("DEL-033");
    await expect(page.locator(".asset-report-name")).toHaveText("Archive Collector");
    const chips = page.locator(".user-detail-head .chips");
    await expect(chips.locator(".pill", { hasText: "รอดำเนินการ" })).toHaveCount(1);
    await expect(chips.locator(".pill", { hasText: "Deactivated" })).toHaveCount(1);
    await expect(chips.locator(".deletion-serious-pill")).toHaveCount(1);
  });

  test("45. Serious flag แสดงเฉพาะช่วง grace period (DEL-029 expired ยังแสดง)", async ({ page }) => {
    await openDeletionDetail(page, "DEL-029");
    await expect(page.locator(".deletion-serious-pill")).toHaveCount(1);
  });

  test("46. Serious flag ซ่อนเมื่อไม่มี flag (DEL-034) หรือคำขอจบแล้ว (DEL-025)", async ({ page }) => {
    await openDeletionDetail(page, "DEL-034");
    await expect(page.locator(".deletion-serious-pill")).toHaveCount(0);
    await openDeletionDetail(page, "DEL-025");
    await expect(page.locator(".deletion-serious-pill")).toHaveCount(0);
  });

  test("47. body class deletion-detail-mode + ปุ่มกลับพาไป list", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await expect(page.locator("body")).toHaveClass(/deletion-detail-mode/);
    await page.locator("[data-back-deletion-list]").click();
    await page.waitForSelector(".deletion-request-table", { timeout: 5000 });
    await expect(page.locator("body")).toHaveClass(/deletion-list-mode/);
    await expect(page.locator("#crumb")).toHaveText("งานตรวจสอบและบริการ / Account Deletion");
  });

  test("48. row click จาก list เปิด detail (UI flow) + back กลับ list", async ({ page }) => {
    await openDeletionList(page);
    await openDetailViaRowClick(page, "DEL-033");
    await expect(page.locator("#panel-title")).toHaveText("DEL-033");
    await page.locator(".page-back-btn").click();
    await page.waitForSelector(".deletion-request-table", { timeout: 5000 });
  });
});

test.describe("QA-BO-027: Detail sections 1-2 (User Context + Timeline)", () => {

  test("49. Section 1 User Context มี 6 tiles ครบ label", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    const tiles = page.locator(".deletion-user-context-section .detail-tile");
    await expect(tiles).toHaveCount(6);
    const labels = await tiles.locator("span").allTextContents();
    expect(labels).toEqual(["User ID", "Display Name", "Username", "Auth Method", "Joined Date", "Last Active"]);
  });

  test("50. User Context แสดงค่าจริงของ DEL-033 (mask field ไม่แสดง)", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    const section = page.locator(".deletion-user-context-section");
    const text = await section.textContent();
    expect(text).toContain("U-1104");
    expect(text).toContain("Archive Collector");
    expect(text).toContain("@archivecollector");
    expect(text).toContain("Email");
    expect(text).toContain("15 May 2026");
    expect(text).toContain("08 Jul 2026 09:15");
    // sensitive fields (email/phone/LINE masked) ไม่แสดงใน section นี้
    expect(text).not.toContain("ar***@mail.com");
    expect(text).not.toContain("08x-xxx-x104");
  });

  test("51. Timeline รอดำเนินการ (DEL-033): 3 steps — done/done/current", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    const steps = await timelineSteps(page);
    expect(steps.length).toBe(3);
    expect(steps[0].label).toBe("คำขอลบบัญชี");
    expect(steps[0].state).toBe("done");
    expect(steps[1].label).toBe("ระงับบัญชี + เริ่มช่วงรอลบบัญชี");
    expect(steps[1].state).toBe("done");
    expect(steps[2].label).toBe("ช่วงรอลบบัญชี (30 วัน)");
    expect(steps[2].state).toBe("current");
    // grace range ถูก render ในช่อง date ของ step (prototype ส่ง graceSub เข้า arg date)
    expect(steps[2].date).toBe("07 Sep 2026 → 07 Oct 2026");
  });

  test("52. countdown active: 'เหลือ 23 วัน ถึงลบบัญชีอัตโนมัติ' ไม่มี ending/expired class", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    const countdown = page.locator(".deletion-countdown");
    await expect(countdown).toContainText("เหลือ 23 วัน ถึงลบบัญชีอัตโนมัติ");
    await expect(countdown).not.toHaveClass(/deletion-countdown-ending|deletion-countdown-expired/);
  });

  test("53. countdown ending (DEL-035): 'เหลือ 3 วัน' + class ending", async ({ page }) => {
    await openDeletionDetail(page, "DEL-035");
    const countdown = page.locator(".deletion-countdown");
    await expect(countdown).toContainText("เหลือ 3 วัน ถึงลบบัญชีอัตโนมัติ");
    await expect(countdown).toHaveClass(/deletion-countdown-ending/);
  });

  test("54. countdown expired (DEL-029): ข้อความครบกำหนด + step รอลบบัญชีเป็น current", async ({ page }) => {
    await openDeletionDetail(page, "DEL-029");
    const countdown = page.locator(".deletion-countdown");
    await expect(countdown).toContainText("ครบกำหนดลบบัญชีอัตโนมัติแล้ว — ระบบจะลบบัญชีในรอบถัดไป");
    await expect(countdown).toHaveClass(/deletion-countdown-expired/);
    const steps = await timelineSteps(page);
    const graceStep = steps.find(s => s.label === "ช่วงรอลบบัญชี (30 วัน)");
    const pendingStep = steps.find(s => s.label === "รอลบบัญชีอัตโนมัติ");
    expect(graceStep.state).toBe("done");
    expect(pendingStep.state).toBe("current");
  });

  test("55. Timeline คืนบัญชีแล้ว (DEL-031): 4 steps done จบที่ 'คืนบัญชี' ไม่มี countdown", async ({ page }) => {
    await openDeletionDetail(page, "DEL-031");
    const steps = await timelineSteps(page);
    expect(steps.length).toBe(4);
    expect(steps.every(s => s.state === "done")).toBe(true);
    expect(steps[3].label).toBe("คืนบัญชี");
    expect(steps[3].date).toBe("25 Aug 2026 16:45");
    await expect(page.locator(".deletion-countdown")).toHaveCount(0);
  });

  test("56. Timeline ลบตัวตนแล้ว (DEL-025): 5 steps จบที่ 'ลบบัญชีอัตโนมัติ'", async ({ page }) => {
    await openDeletionDetail(page, "DEL-025");
    const steps = await timelineSteps(page);
    expect(steps.length).toBe(5);
    expect(steps.every(s => s.state === "done")).toBe(true);
    expect(steps[4].label).toBe("ลบบัญชีอัตโนมัติ");
    expect(steps[4].date).toBe("14 Aug 2026 00:00");
    // ไม่มี step 'คืนบัญชี' (skipped)
    expect(steps.find(s => s.label === "คืนบัญชี")).toBeUndefined();
  });

  test("57. reject note (DEL-028): แสดงเวลา/ผู้ปฏิเสธ/เหตุผล ใน timeline section", async ({ page }) => {
    await openDeletionDetail(page, "DEL-028");
    const note = page.locator(".deletion-restore-reject-note");
    await expect(note).toBeVisible();
    await expect(note).toContainText("ปฏิเสธคืนบัญชีเมื่อ 28 Aug 2026 14:20 โดย อรนุช แก้วใส");
    await expect(note).toContainText("เหตุผล: พฤติกรรมละเมิดซ้ำ ไม่สมควรคืนบัญชี");
  });
});

test.describe("QA-BO-027: Detail sections 3-4 (Dependency + Deletion Plan)", () => {

  test("58. Dependency Summary 3 tiles + DEL-033 ค่า 6/3/1 เป็น link ทั้งหมด", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    const tiles = page.locator(".detail-section:has(h4:text('Dependency Summary')) .detail-tile");
    await expect(tiles).toHaveCount(3);
    const links = page.locator(".deletion-dep-link");
    await expect(links).toHaveCount(3);
    await expect(page.locator('[data-deletion-dep="assets"]')).toHaveText("6");
    await expect(page.locator('[data-deletion-dep="chats"]')).toHaveText("3");
    await expect(page.locator('[data-deletion-dep="reports"]')).toHaveText("1");
    for (const l of await links.all()) {
      expect(await l.getAttribute("data-deletion-req-id")).toBe("DEL-033");
    }
  });

  test("59. Dependency ค่า 0 → ไม่เป็น link (DEL-034 reports=0)", async ({ page }) => {
    await openDeletionDetail(page, "DEL-034");
    await expect(page.locator('[data-deletion-dep="reports"]')).toHaveCount(0);
    const tile = page.locator(".detail-tile", { hasText: "Reports / Safety Cases" });
    await expect(tile.locator("strong")).toHaveText("0");
    // ค่าที่มากกว่า 0 ยังเป็น link
    await expect(page.locator('[data-deletion-dep="assets"]')).toHaveText("2");
    await expect(page.locator('[data-deletion-dep="chats"]')).toHaveText("1");
  });

  test("60. คลิก Chat Rooms link → toast retention (ไม่ navigate)", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await page.locator('[data-deletion-dep="chats"]').click();
    await page.waitForSelector("#success-toast.show", { timeout: 3000 });
    await expect(page.locator("#success-toast")).toContainText("Chat Rooms");
    // ยังอยู่หน้า detail เดิม
    await expect(page.locator("body")).toHaveClass(/deletion-detail-mode/);
    const mod = await page.evaluate(() => activeModule);
    expect(mod).toBe("deletions");
  });

  test("61. Deletion Plan table: header Data/Action + 8 rows", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    const head = page.locator(".deletion-archive-plan-head > div");
    await expect(head).toHaveCount(2);
    await expect(head.nth(0)).toHaveText("Data");
    await expect(head.nth(1)).toHaveText("Action");
    const rows = page.locator(".deletion-archive-plan-row:not(.deletion-archive-plan-head)");
    await expect(rows).toHaveCount(8);
  });

  test("62. Deletion Plan rows สำคัญ: Audit logs + Email/phone/LINE + Assets", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    const rows = page.locator(".deletion-archive-plan-row:not(.deletion-archive-plan-head)");
    const auditRow = rows.filter({ hasText: "Audit logs" });
    await expect(auditRow.locator(".deletion-archive-plan-action")).toHaveText("ลบบัญชีแล้วไม่สามารถแก้ไขได้");
    const emailRow = rows.filter({ hasText: "Email / phone / LINE" });
    await expect(emailRow.locator(".deletion-archive-plan-action")).toContainText("แทนที่ด้วย anonymous value");
    const assetRow = rows.filter({ hasText: "Assets" });
    await expect(assetRow.locator(".deletion-archive-plan-action")).toContainText("ซ่อนจาก Feed");
  });
});

test.describe("QA-BO-027: History & Actions", () => {

  test("63. History table 6 columns ตามลำดับ", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    const heads = page.locator(".deletion-action-section .history-table thead th");
    await expect(heads).toHaveCount(6);
    const expected = ["วันที่ / เวลา", "ผู้ดำเนินการ", "Action", "ส่งอีเมล", "Audit", "รายละเอียด"];
    for (let i = 0; i < expected.length; i++) {
      await expect(heads.nth(i)).toHaveText(expected[i]);
    }
  });

  test("64. DEL-033 history: 3 rows (ขอลบบัญชี/ยกเลิก session/ระงับบัญชี)", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    const logs = await historyRows(page);
    expect(logs.length).toBe(3);
    expect(logs[0].action).toBe("ขอลบบัญชี");
    expect(logs[0].actor).toBe("Archive Collector");
    expect(logs[0].at).toBe("07 Sep 2026 09:15");
    expect(logs[1].action).toBe("ยกเลิก session");
    expect(logs[1].actor).toBe("System");
    expect(logs[2].action).toBe("ระงับบัญชี + ปิดรายงานอัตโนมัติ");
  });

  test("65. DEL-033 ขอลบบัญชี: email jump DLV-DEL-033-REQ + audit AUD-88195", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    const logs = await historyRows(page);
    expect(logs[0].email).toContain("Email ส่งแล้ว");
    expect(logs[0].email).toContain("DLV-DEL-033-REQ");
    expect(logs[0].audit).toContain("AUD-88195");
    // rows อื่นไม่มี email/audit link
    expect(logs[1].email).toBe("—");
    expect(logs[1].audit).toBe("—");
  });

  test("66. DEL-035: ไม่มี delivery log ที่ map → email เป็น pill 'Email ส่งแล้ว' ไม่ใช่ link", async ({ page }) => {
    await openDeletionDetail(page, "DEL-035");
    const logs = await historyRows(page);
    expect(logs[0].email).toContain("Email ส่งแล้ว");
    expect(logs[0].email).not.toContain("data-delivery-log-jump");
    // ไม่มี audit event ที่ action ตรง → Audit '—' ทุก row
    for (const log of logs) expect(log.audit).toBe("—");
  });

  test("67. DEL-028 history: 5 rows มี รับคำขอคืนบัญชี + ปฏิเสธคืนบัญชี พร้อม email/audit", async ({ page }) => {
    await openDeletionDetail(page, "DEL-028");
    const logs = await historyRows(page);
    expect(logs.length).toBe(5);
    const inbound = logs.find(l => l.action === "รับคำขอคืนบัญชี (ผ่าน support)");
    expect(inbound).toBeTruthy();
    expect(inbound.at).toBe("—");
    const reject = logs.find(l => l.action === "ปฏิเสธคืนบัญชี");
    expect(reject.actor).toBe("อรนุช แก้วใส");
    expect(reject.note).toContain("พฤติกรรมละเมิดซ้ำ ไม่สมควรคืนบัญชี");
    expect(reject.note).toContain("หมายเหตุ:");
    expect(reject.email).toContain("DLV-DEL-028-REJ");
    expect(reject.audit).toContain("AUD-88198");
  });

  test("68. DEL-031 history: มี row 'คืนบัญชี' พร้อม DLV-DEL-031-RES + AUD-88168", async ({ page }) => {
    await openDeletionDetail(page, "DEL-031");
    const logs = await historyRows(page);
    const restore = logs.find(l => l.action === "คืนบัญชี");
    expect(restore).toBeTruthy();
    expect(restore.actor).toBe("มะลิ จันทร์ดี");
    expect(restore.at).toBe("25 Aug 2026 16:45");
    expect(restore.note).toContain("ผู้ใช้ติดต่อ support และยืนยันตัวตนแล้ว");
    expect(restore.email).toContain("DLV-DEL-031-RES");
    expect(restore.audit).toContain("AUD-88168");
  });

  test("69. DEL-025 history: มี row 'ลบบัญชีอัตโนมัติ' พร้อม DLV-DEL-025-DEL + AUD-88068", async ({ page }) => {
    await openDeletionDetail(page, "DEL-025");
    const logs = await historyRows(page);
    const del = logs.find(l => l.action === "ลบบัญชีอัตโนมัติ");
    expect(del).toBeTruthy();
    expect(del.actor).toBe("System");
    expect(del.email).toContain("DLV-DEL-025-DEL");
    expect(del.audit).toContain("AUD-88068");
  });

  test("70. grace expired (DEL-029) ยังแสดงปุ่ม action 2 ปุ่ม", async ({ page }) => {
    await openDeletionDetail(page, "DEL-029");
    await expect(page.locator('[data-deletion-action="restore"]')).toBeVisible();
    await expect(page.locator('[data-deletion-action="reject-restore"]')).toBeVisible();
  });

  test("71. terminal states (restored/anonymized) ไม่แสดงปุ่ม action", async ({ page }) => {
    await openDeletionDetail(page, "DEL-031");
    await expect(page.locator('[data-deletion-action]')).toHaveCount(0);
    await openDeletionDetail(page, "DEL-025");
    await expect(page.locator('[data-deletion-action]')).toHaveCount(0);
  });
});

test.describe("QA-BO-027: Action modals deep", () => {

  test("72. Restore modal: title/summary/target block ครบ", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await page.click('[data-deletion-action="restore"]');
    await page.waitForSelector("#user-action-modal.show", { timeout: 3000 });
    await expect(page.locator("#user-action-modal-title")).toHaveText("Restore Account");
    await expect(page.locator("#user-action-modal-body")).toContainText("คืนบัญชีให้ผู้ใช้กลับมาใช้งานได้ทันที");
    const target = page.locator(".user-action-target");
    await expect(target.locator("strong")).toHaveText("Archive Collector");
    await expect(target.locator("div span")).toHaveText("DEL-033 · U-1104");
    await expect(target.locator(".pill")).toHaveText("รอดำเนินการ");
  });

  test("73. Restore modal: reason select มี 4 ตัวเลือกตาม config", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await page.click('[data-deletion-action="restore"]');
    await page.waitForSelector("#user-action-modal.show", { timeout: 3000 });
    const container = page.locator("div[data-custom-select]").filter({ has: page.locator("#deletion-action-reason") });
    await container.locator("[data-custom-select-trigger]").click();
    const options = container.locator("[data-custom-select-option]");
    await expect(options).toHaveCount(4);
    await expect(options.nth(0)).toHaveText("ผู้ใช้ติดต่อ support และยืนยันตัวตนแล้ว");
    await expect(options.nth(3)).toHaveText("คำขอลบบัญชีเกิดจากความผิดพลาด");
  });

  test("74. Restore modal: impact note + email note (owner email จาก seed)", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await page.click('[data-deletion-action="restore"]');
    await page.waitForSelector("#user-action-modal.show", { timeout: 3000 });
    const body = page.locator("#user-action-modal-body");
    await expect(body).toContainText("บัญชีกลับเป็น Active ผู้ใช้เข้าสู่ระบบได้ทันที และคำขอลบบัญชีถูกยกเลิก");
    await expect(body).toContainText("แจ้งผู้ใช้: ระบบจะส่งอีเมลแจ้งผลไปที่ archivecollector@mail.com");
  });

  test("75. Restore modal: email preview subject + default reason", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await page.click('[data-deletion-action="restore"]');
    await page.waitForSelector("#user-action-modal.show", { timeout: 3000 });
    const preview = page.locator("[data-deletion-email-preview]");
    await expect(preview).toBeVisible();
    await expect(preview.locator("[data-email-preview-subject]")).toContainText("บัญชีของคุณกลับมาใช้งานได้แล้ว");
    await expect(preview.locator("[data-email-preview-message]")).toContainText("เหตุผลการดำเนินการ: ผู้ใช้ติดต่อ support และยืนยันตัวตนแล้ว");
    await expect(preview.locator("[data-email-preview-message]")).toContainText("Reference: DEL-033");
  });

  test("76. email preview live update: เปลี่ยน reason → เนื้อหาอีเมลเปลี่ยนตาม", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await page.click('[data-deletion-action="restore"]');
    await page.waitForSelector("#user-action-modal.show", { timeout: 3000 });
    const container = page.locator("div[data-custom-select]").filter({ has: page.locator("#deletion-action-reason") });
    await container.locator("[data-custom-select-trigger]").click();
    await container.locator("[data-custom-select-option]").nth(1).click();
    await page.waitForTimeout(200);
    await expect(page.locator("[data-email-preview-message]")).toContainText("เหตุผลการดำเนินการ: ตรวจสอบแล้วไม่พบความเสี่ยงเพิ่มเติม");
  });

  test("77. Reject modal: title/tone/subject/reason options ถูกต้อง", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await page.click('[data-deletion-action="reject-restore"]');
    await page.waitForSelector("#user-action-modal.show", { timeout: 3000 });
    await expect(page.locator("#user-action-modal-title")).toHaveText("Reject Restore");
    const confirmBtn = page.locator('[data-deletion-action-confirm="reject-restore"]');
    await expect(confirmBtn).toHaveClass(/danger/);
    const container = page.locator("div[data-custom-select]").filter({ has: page.locator("#deletion-action-reason") });
    await container.locator("[data-custom-select-trigger]").click();
    const options = container.locator("[data-custom-select-option]");
    await expect(options).toHaveCount(4);
    await expect(options.nth(0)).toHaveText("รายงานร้ายแรงยังไม่ได้รับการแก้ไข");
    await expect(page.locator("[data-email-preview-subject]")).toContainText("ถูกปฏิเสธ");
  });

  test("78. Reject modal: impact note บอก 'ไม่เริ่มนับใหม่'", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await page.click('[data-deletion-action="reject-restore"]');
    await page.waitForSelector("#user-action-modal.show", { timeout: 3000 });
    await expect(page.locator("#user-action-modal-body")).toContainText("รอลบอัตโนมัติเมื่อครบช่วงรอลบบัญชีเดิม (ไม่เริ่มนับใหม่)");
  });

  test("79. Reject modal context note (DEL-028): แสดงประวัติปฏิเสธครั้งก่อน", async ({ page }) => {
    await openDeletionDetail(page, "DEL-028");
    await page.click('[data-deletion-action="reject-restore"]');
    await page.waitForSelector("#user-action-modal.show", { timeout: 3000 });
    await expect(page.locator("#user-action-modal-body")).toContainText("ปฏิเสธคืนบัญชีครั้งก่อน:");
    await expect(page.locator("#user-action-modal-body")).toContainText("พฤติกรรมละเมิดซ้ำ ไม่สมควรคืนบัญชี");
  });

  test("80. Restore modal context note (DEL-028): แสดง restore request ของผู้ใช้ + channel", async ({ page }) => {
    await openDeletionDetail(page, "DEL-028");
    await page.click('[data-deletion-action="restore"]');
    await page.waitForSelector("#user-action-modal.show", { timeout: 3000 });
    await expect(page.locator("#user-action-modal-body")).toContainText("ผู้ใช้ขอคืนบัญชี:");
    await expect(page.locator("#user-action-modal-body")).toContainText("ช่องทาง: Support email");
  });

  test("81. confirm restore DEL-033: status เปลี่ยน + countdown/serious/buttons หาย", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await fillActionModal(page, "restore", "QA-027 restore");
    await confirmActionAndWaitToast(page, "restore");
    await expect(page.locator(".pill", { hasText: "คืนบัญชีแล้ว" })).toBeVisible();
    await expect(page.locator(".deletion-countdown")).toHaveCount(0);
    await expect(page.locator(".deletion-serious-pill")).toHaveCount(0);
    await expect(page.locator('[data-deletion-action]')).toHaveCount(0);
  });

  test("82. confirm reject DEL-034: status เปลี่ยน + reject note โผล่ + ปุ่มยังอยู่ + history เพิ่ม", async ({ page }) => {
    await openDeletionDetail(page, "DEL-034");
    await fillActionModal(page, "reject-restore", "QA-027 reject");
    await confirmActionAndWaitToast(page, "reject-restore");
    await expect(page.locator(".pill", { hasText: "ปฏิเสธคืนบัญชี" })).toBeVisible();
    await expect(page.locator('[data-deletion-action="restore"]')).toBeVisible();
    await expect(page.locator('[data-deletion-action="reject-restore"]')).toBeVisible();
    // reject note โผล่ใน timeline section
    await expect(page.locator(".deletion-restore-reject-note")).toBeVisible();
    // history เพิ่ม รับคำขอคืนบัญชี + ปฏิเสธคืนบัญชี และสร้าง delivery log
    const logs = await historyRows(page);
    expect(logs.find(l => l.action === "รับคำขอคืนบัญชี (ผ่าน support)")).toBeTruthy();
    const reject = logs.find(l => l.action === "ปฏิเสธคืนบัญชี");
    expect(reject.email).toContain("DLV-DEL-034-REJ");
    const hasDelivery = await page.evaluate(() =>
      moduleData.settings.rows.some(r => r.id === "DLV-DEL-034-REJ"));
    expect(hasDelivery).toBe(true);
  });
});

test.describe("QA-BO-027: Cross-module", () => {

  test("83. user link ใน list → User Detail → back กลับ deletion list", async ({ page }) => {
    const mobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    test.skip(mobile, "mobile card ซ่อน data-label cells — user link ไม่แสดงตาม design");
    await openDeletionList(page);
    await requestRow(page, "DEL-033").locator('[data-user-open="U-1104"]').click();
    await page.waitForTimeout(500);
    const mod = await page.evaluate(() => activeModule);
    expect(mod).toBe("users");
    await page.locator(".page-back-btn").click();
    await page.waitForSelector(".deletion-request-table", { timeout: 5000 });
    await expect(page.locator("body")).toHaveClass(/deletion-list-mode/);
  });

  test("84. Display Name link ใน detail → User Detail → back กลับ Request Detail เดิม", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await page.locator('.deletion-user-context-section [data-user-open="U-1104"]').click();
    await page.waitForTimeout(500);
    const mod = await page.evaluate(() => activeModule);
    expect(mod).toBe("users");
    await page.locator(".page-back-btn").click();
    await page.waitForSelector(".deletion-detail-page", { timeout: 5000 });
    await expect(page.locator("#panel-title")).toHaveText("DEL-033");
  });

  test("85. คลิก audit ref AUD-88195 → เปิด Audit Log กรองด้วย ref + toast", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await page.locator('[data-audit-ref="AUD-88195"]').click();
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    await expect(page.locator("#audit-search")).toHaveValue("AUD-88195");
    await expect(page.locator("#success-toast")).toContainText("AUD-88195");
    const rows = await page.locator(".audit-log-table .user-row:not(.head):not(.empty)").count();
    expect(rows).toBe(1);
  });

  test("86. คลิก delivery jump DLV-DEL-033-REQ → Settings > Delivery Logs + เปิด detail modal", async ({ page }) => {
    await openDeletionDetail(page, "DEL-033");
    await page.locator('[data-delivery-log-jump="DLV-DEL-033-REQ"]').click();
    await page.waitForSelector("#user-action-modal.show", { timeout: 5000 });
    await expect(page.locator("#user-action-modal-title")).toHaveText("DLV-DEL-033-REQ");
    await expect(page.locator("#delivery-search")).toHaveValue("DLV-DEL-033-REQ");
    const mod = await page.evaluate(() => activeModule + "|" + activeSub);
    expect(mod).toBe("settings|Delivery Logs");
  });

  test("87. dep link Reports (DEL-028) → Reported Users กรองด้วย U-1121", async ({ page }) => {
    await openDeletionDetail(page, "DEL-028");
    await page.locator('[data-deletion-dep="reports"]').click();
    await page.waitForTimeout(500);
    const mod = await page.evaluate(() => activeModule + "|" + activeSub);
    expect(mod).toBe("users|Reported Users");
    await expect(page.locator("#user-search")).toHaveValue("U-1121");
  });
});

test.describe("QA-BO-027: Responsive", () => {

  test("88. mobile: filter selects ซ่อนเมื่อปิดตัวกรอง → toggle เปิดได้", async ({ page }) => {
    const mobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    test.skip(!mobile, "เทสเฉพาะ mobile viewport");
    await openDeletionList(page);
    const bar = page.locator(".user-filter-bar.deletion-filter-bar");
    expect(await bar.getAttribute("data-filter-open")).toBe("false");
    await expect(page.locator(".deletion-filter-bar .user-advanced-filter").first()).not.toBeVisible();
    await page.locator("#user-panel-filter-actions [data-deletion-filter-toggle]").click();
    await page.waitForTimeout(200);
    expect(await bar.getAttribute("data-filter-open")).toBe("true");
    await expect(page.locator(".deletion-filter-bar .user-advanced-filter").first()).toBeVisible();
    await expect(page.locator("[data-deletion-filter-toggle] span")).toHaveText("ปิดตัวกรอง");
  });

  test("89. mobile card: เห็น Request ID + card tags แต่ซ่อน data-label cells", async ({ page }) => {
    const mobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    test.skip(!mobile, "เทสเฉพาะ mobile viewport");
    await openDeletionList(page);
    const row = requestRow(page, "DEL-033");
    await expect(row.locator('[data-label="Request ID"]')).toBeVisible();
    await expect(row.locator('[data-label="User"]')).not.toBeVisible();
    await expect(row.locator('[data-label="Grace Period"]')).not.toBeVisible();
    // card tags: status pill + assets tag + meta
    await expect(row.locator(".user-card-tags")).toBeVisible();
    await expect(row.locator(".user-card-tags .pill", { hasText: "รอดำเนินการ" })).toBeVisible();
    await expect(row.locator(".user-card-tags .asset-tag")).toHaveText("6 assets");
    await expect(row.locator(".user-card-meta")).toContainText("U-1104");
    await expect(row.locator(".user-card-meta")).toContainText("Archive Collector");
  });

  test("90. mobile card: ไม่แสดงปุ่ม ... (row-menu ซ่อน)", async ({ page }) => {
    const mobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    test.skip(!mobile, "เทสเฉพาะ mobile viewport");
    await openDeletionList(page);
    await expect(requestRow(page, "DEL-033").locator(".user-row-actions")).not.toBeVisible();
  });

  test("91. mobile card: คลิกการ์ดเปิด detail ได้", async ({ page }) => {
    const mobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    test.skip(!mobile, "เทสเฉพาะ mobile viewport");
    await openDeletionList(page);
    await requestRow(page, "DEL-033").locator('.user-cell-primary[data-label="Request ID"]').click();
    await page.waitForSelector(".deletion-detail-page", { timeout: 5000 });
    await expect(page.locator("#panel-title")).toHaveText("DEL-033");
  });

  test("92. mobile pager: prev/next ใช้งานได้ (ปุ่มเลขหน้าซ่อนบน mobile)", async ({ page }) => {
    const mobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    test.skip(!mobile, "เทสเฉพาะ mobile viewport");
    await openDeletionList(page);
    await page.locator("[data-deletion-page='next']").click();
    await page.waitForTimeout(300);
    expect(await rowIds(page)).toEqual(["DEL-021", "DEL-020"]);
    await page.locator("[data-deletion-page='prev']").click();
    await page.waitForTimeout(300);
    expect(await rowCount(page)).toBe(10);
  });

  test("93. desktop/tablet: filter selects แสดงเสมอโดยไม่ต้อง toggle", async ({ page }) => {
    const mobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
    test.skip(mobile, "เทสเฉพาะ desktop/tablet viewport");
    await openDeletionList(page);
    await expect(page.locator(".deletion-filter-bar .user-advanced-filter").first()).toBeVisible();
  });
});
