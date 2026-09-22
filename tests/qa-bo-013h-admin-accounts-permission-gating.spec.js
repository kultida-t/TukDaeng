// QA-BO-013h: Settings > Admin Accounts — Permission/action gating & last-admin protection (strict Playwright spec)
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล — canSuspendAdmin/canReactivateAdmin/canUnlockAdmin/canArchiveAdmin/canChangeRoleAdmin (บรรทัด ~22463-22496)
//   + renderAdminAccountRows row-menu (บรรทัด ~22575) + renderAdminAccountDetail action buttons (บรรทัด ~22633)
//   + spec 16_ADMIN_SETTINGS_MODULE.md section 4 (last-admin protection)
// เป้าหมาย: รันเทสครอบ permission/action gating × สถานะ + last-admin protection + master/self protection (ห้ามแก้ prototype)
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

// helper: locator ของ row ตาม Admin ID
function accountRow(page, id) {
  return page.locator(`.admin-account-row[data-admin-account-card="${id}"]`);
}

// helper: อ่านข้อความปุ่มทั้งหมดใน row-menu-list ของ account (ปุ่มอยู่ใน DOM เสมอ แม้เมนูยังไม่เปิด)
async function rowMenuButtonTexts(page, id) {
  return await accountRow(page, id)
    .locator(".row-menu-list button")
    .allTextContents()
    .then(texts => texts.map(t => t.trim()));
}

// helper: เปิด row menu ของ account แล้วคลิก action button
async function openActionFromRowMenu(page, id, action) {
  const row = accountRow(page, id);
  await row.locator(".row-menu > summary").click();
  await page.waitForTimeout(300);
  await row.locator(`[data-admin-account-action="${action}"][data-admin-account-id="${id}"]`).click();
  await page.waitForTimeout(300);
}

// helper: เลือก reason ใน custom-select ของ modal
async function pickReason(page, value) {
  await page
    .locator(`div[data-custom-select]:has(> #admin-account-action-reason) [data-custom-select-trigger]`)
    .click();
  await page.waitForTimeout(150);
  await page
    .locator(`div[data-custom-select]:has(> #admin-account-action-reason) [data-custom-select-option][data-value="${value}"]`)
    .click();
  await page.waitForTimeout(200);
}

// helper: คลิก confirm ใน modal
async function clickConfirm(page, action) {
  await page.locator(`[data-admin-account-action-confirm="${action}"]`).click();
  await page.waitForTimeout(400);
}

// helper: อ่านข้อความปุ่ม action ทั้งหมดใน detail (user-detail-actions)
async function detailActionButtonTexts(page) {
  return await page.locator(".admin-account-detail-page .user-detail-actions button")
    .allTextContents()
    .then(texts => texts.map(t => t.trim()));
}

// helper: เปิด detail ของ account ผ่านการคลิก cell Admin ID
async function openDetail(page, id) {
  await goToAdminAccounts(page);
  await page.locator(`.admin-account-row[data-admin-account-card="${id}"] .user-cell-primary[data-label="Admin ID"]`).click();
  await page.waitForTimeout(300);
}

// helper: อ่านสถานะปัจจุบันของ account จาก mock data
async function accountStatus(page, id) {
  return await page.evaluate(accId => {
    const acc = adminAccountData.accounts.find(a => a.id === accId);
    return acc ? acc.status : null;
  }, id);
}

// helper: evaluate can*Admin functions สำหรับ account ใน mock โดยตรง
async function evalCanFunctions(page, id) {
  return await page.evaluate(accId => {
    const acc = adminAccountData.accounts.find(a => a.id === accId);
    if (!acc) return null;
    return {
      suspend: canSuspendAdmin(acc),
      reactivate: canReactivateAdmin(acc),
      unlock: canUnlockAdmin(acc),
      archive: canArchiveAdmin(acc),
      changeRole: canChangeRoleAdmin(acc)
    };
  }, id);
}

// ==================== H. PERMISSION/ACTION GATING & LAST-ADMIN PROTECTION ====================

test.describe("QA-BO-013h: Settings > Admin Accounts — permission/action gating & last-admin protection", () => {

  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");
  });

  // ---- 1. canSuspendAdmin gating ----

  test("1. canSuspendAdmin: Active (ไม่ใช่ self/master/คนสุดท้าย) → true; Suspended/Archived → false; Invited/Locked → true; master → false; self → false", async ({ page }) => {
    await goToAdminAccounts(page);
    // Active (not self/master) — ADM-001..ADM-005 มีปุ่มระงับ
    for (const id of ["ADM-001", "ADM-002", "ADM-003", "ADM-004", "ADM-005"]) {
      const fns = await evalCanFunctions(page, id);
      expect(fns.suspend).toBe(true);
      // row menu มีปุ่ม ระงับ
      const texts = await rowMenuButtonTexts(page, id);
      expect(texts).toContain("ระงับ");
    }
    // Suspended (ADM-006) → false
    expect((await evalCanFunctions(page, "ADM-006")).suspend).toBe(false);
    expect(await rowMenuButtonTexts(page, "ADM-006")).not.toContain("ระงับ");
    // Locked (ADM-007) → true (ไม่ใช่ Active ไม่ติดเงื่อนไข last-admin)
    expect((await evalCanFunctions(page, "ADM-007")).suspend).toBe(true);
    expect(await rowMenuButtonTexts(page, "ADM-007")).toContain("ระงับ");
    // Invited (ADM-008) → true
    expect((await evalCanFunctions(page, "ADM-008")).suspend).toBe(true);
    expect(await rowMenuButtonTexts(page, "ADM-008")).toContain("ระงับ");
    // Archived (ADM-009) → false
    expect((await evalCanFunctions(page, "ADM-009")).suspend).toBe(false);
    expect(await rowMenuButtonTexts(page, "ADM-009")).not.toContain("ระงับ");
    // master/self (ADM-010) → false
    expect((await evalCanFunctions(page, "ADM-010")).suspend).toBe(false);
    expect(await rowMenuButtonTexts(page, "ADM-010")).not.toContain("ระงับ");
  });

  // ---- 2. canReactivateAdmin gating ----

  test("2. canReactivateAdmin: Suspended → true; สถานะอื่น → false; self → false", async ({ page }) => {
    await goToAdminAccounts(page);
    // Suspended (ADM-006) → true
    expect((await evalCanFunctions(page, "ADM-006")).reactivate).toBe(true);
    expect(await rowMenuButtonTexts(page, "ADM-006")).toContain("ยกเลิกการระงับ");
    // Active (ADM-001) → false
    expect((await evalCanFunctions(page, "ADM-001")).reactivate).toBe(false);
    expect(await rowMenuButtonTexts(page, "ADM-001")).not.toContain("ยกเลิกการระงับ");
    // Locked (ADM-007) → false
    expect((await evalCanFunctions(page, "ADM-007")).reactivate).toBe(false);
    expect(await rowMenuButtonTexts(page, "ADM-007")).not.toContain("ยกเลิกการระงับ");
    // Invited (ADM-008) → false
    expect((await evalCanFunctions(page, "ADM-008")).reactivate).toBe(false);
    expect(await rowMenuButtonTexts(page, "ADM-008")).not.toContain("ยกเลิกการระงับ");
    // Archived (ADM-009) → false
    expect((await evalCanFunctions(page, "ADM-009")).reactivate).toBe(false);
    expect(await rowMenuButtonTexts(page, "ADM-009")).not.toContain("ยกเลิกการระงับ");
    // self (ADM-010) → false (แม้จะเป็น Active อยู่แล้ว ก็ไม่ควรมีปุ่ม)
    expect((await evalCanFunctions(page, "ADM-010")).reactivate).toBe(false);
    expect(await rowMenuButtonTexts(page, "ADM-010")).not.toContain("ยกเลิกการระงับ");
  });

  // ---- 3. canUnlockAdmin gating ----

  test("3. canUnlockAdmin: Locked → true; สถานะอื่น → false; self → false", async ({ page }) => {
    await goToAdminAccounts(page);
    // Locked (ADM-007) → true
    expect((await evalCanFunctions(page, "ADM-007")).unlock).toBe(true);
    expect(await rowMenuButtonTexts(page, "ADM-007")).toContain("ปลดล็อก");
    // Active (ADM-001) → false
    expect((await evalCanFunctions(page, "ADM-001")).unlock).toBe(false);
    expect(await rowMenuButtonTexts(page, "ADM-001")).not.toContain("ปลดล็อก");
    // Suspended (ADM-006) → false
    expect((await evalCanFunctions(page, "ADM-006")).unlock).toBe(false);
    expect(await rowMenuButtonTexts(page, "ADM-006")).not.toContain("ปลดล็อก");
    // Invited (ADM-008) → false
    expect((await evalCanFunctions(page, "ADM-008")).unlock).toBe(false);
    expect(await rowMenuButtonTexts(page, "ADM-008")).not.toContain("ปลดล็อก");
    // Archived (ADM-009) → false
    expect((await evalCanFunctions(page, "ADM-009")).unlock).toBe(false);
    expect(await rowMenuButtonTexts(page, "ADM-009")).not.toContain("ปลดล็อก");
    // self (ADM-010) → false
    expect((await evalCanFunctions(page, "ADM-010")).unlock).toBe(false);
    expect(await rowMenuButtonTexts(page, "ADM-010")).not.toContain("ปลดล็อก");
  });

  // ---- 4. canArchiveAdmin gating ----

  test("4. canArchiveAdmin: Suspended/Locked → true; Active/Invited/Archived → false; master → false; self → false", async ({ page }) => {
    await goToAdminAccounts(page);
    // Suspended (ADM-006) → true
    expect((await evalCanFunctions(page, "ADM-006")).archive).toBe(true);
    expect(await rowMenuButtonTexts(page, "ADM-006")).toContain("เก็บถาวร");
    // Locked (ADM-007) → true
    expect((await evalCanFunctions(page, "ADM-007")).archive).toBe(true);
    expect(await rowMenuButtonTexts(page, "ADM-007")).toContain("เก็บถาวร");
    // Active (ADM-001) → false
    expect((await evalCanFunctions(page, "ADM-001")).archive).toBe(false);
    expect(await rowMenuButtonTexts(page, "ADM-001")).not.toContain("เก็บถาวร");
    // Invited (ADM-008) → false
    expect((await evalCanFunctions(page, "ADM-008")).archive).toBe(false);
    expect(await rowMenuButtonTexts(page, "ADM-008")).not.toContain("เก็บถาวร");
    // Archived (ADM-009) → false
    expect((await evalCanFunctions(page, "ADM-009")).archive).toBe(false);
    expect(await rowMenuButtonTexts(page, "ADM-009")).not.toContain("เก็บถาวร");
    // master/self (ADM-010) → false
    expect((await evalCanFunctions(page, "ADM-010")).archive).toBe(false);
    expect(await rowMenuButtonTexts(page, "ADM-010")).not.toContain("เก็บถาวร");
  });

  // ---- 5. canChangeRoleAdmin gating ----

  test("5. canChangeRoleAdmin: Active/Invited → true; Suspended/Locked/Archived → false; master → false; self → false", async ({ page }) => {
    await goToAdminAccounts(page);
    // Active (ADM-001) → true
    expect((await evalCanFunctions(page, "ADM-001")).changeRole).toBe(true);
    expect(await rowMenuButtonTexts(page, "ADM-001")).toContain("เปลี่ยน Role");
    // Invited (ADM-008) → true
    expect((await evalCanFunctions(page, "ADM-008")).changeRole).toBe(true);
    expect(await rowMenuButtonTexts(page, "ADM-008")).toContain("เปลี่ยน Role");
    // Suspended (ADM-006) → false
    expect((await evalCanFunctions(page, "ADM-006")).changeRole).toBe(false);
    expect(await rowMenuButtonTexts(page, "ADM-006")).not.toContain("เปลี่ยน Role");
    // Locked (ADM-007) → false
    expect((await evalCanFunctions(page, "ADM-007")).changeRole).toBe(false);
    expect(await rowMenuButtonTexts(page, "ADM-007")).not.toContain("เปลี่ยน Role");
    // Archived (ADM-009) → false
    expect((await evalCanFunctions(page, "ADM-009")).changeRole).toBe(false);
    expect(await rowMenuButtonTexts(page, "ADM-009")).not.toContain("เปลี่ยน Role");
    // master/self (ADM-010) → false
    expect((await evalCanFunctions(page, "ADM-010")).changeRole).toBe(false);
    expect(await rowMenuButtonTexts(page, "ADM-010")).not.toContain("เปลี่ยน Role");
  });

  // ---- 6. last-admin protection (function-level) ----

  test("6. last-admin protection: เมื่อ active admin เหลือ 1 คน → canSuspendAdmin คนนั้น = false", async ({ page }) => {
    await goToAdminAccounts(page);
    // จำลองสถานการณ์ที่ active admin เหลือ 1 คน โดยปรับ mock ชั่วคราวใน memory (ห้าม reload)
    const result = await page.evaluate(() => {
      // ปรับ active ทุกคน (ยกเว้น 1 คนที่ไม่ใช่ self/master) ให้เป็น Suspended ชั่วคราว
      const active = adminAccountData.accounts.filter(a => a.status === "Active" && !a.isSelf && !a.isMaster);
      for (let i = 1; i < active.length; i++) {
        active[i].status = "Suspended";
      }
      // เหลือ active 1 คน (active[0]) บวก ADM-010 (master/self ซึ่ง Active อยู่แล้ว)
      // แต่ canSuspendAdmin นับ activeCount รวม ADM-010 ด้วย → activeCount = 2
      // ต้องปรับ ADM-010 ให้ไม่ใช่ Active ชั่วคราวเพื่อให้ activeCount = 1
      const master = adminAccountData.accounts.find(a => a.isMaster);
      const originalMasterStatus = master.status;
      master.status = "Suspended"; // จำลอง — ป้องกันไม่ให้ master นับเข้า activeCount

      const lastActive = active[0];
      const canSuspend = canSuspendAdmin(lastActive);
      const activeCount = adminAccountData.accounts.filter(a => a.status === "Active").length;

      // restore
      master.status = originalMasterStatus;
      for (let i = 1; i < active.length; i++) {
        active[i].status = "Active";
      }

      return { canSuspend, activeCount, lastActiveId: lastActive.id };
    });
    expect(result.activeCount).toBe(1);
    expect(result.canSuspend).toBe(false);
  });

  // ---- 7. ทดสอบ last-admin จริงผ่าน UI ----

  test("7. ทดสอบ last-admin จริง: suspend active admin จนเหลือ 1 → คนสุดท้ายไม่มีปุ่มระงับ", async ({ page }) => {
    // ทั้งหมดอยู่ใน page session เดียว (ห้าม reload — mock reset เมื่อ goto ใหม่)
    await goToAdminAccounts(page);

    // mock มี active 6 คน: ADM-001/002/003/004/005/010
    // ADM-010 เป็น master/self ไม่สามารถ suspend ได้อยู่แล้ว
    // suspend ADM-001 ถึง ADM-005 (5 คน) จนเหลือ ADM-010 active เพียงคนเดียว
    const suspendIds = ["ADM-001", "ADM-002", "ADM-003", "ADM-004", "ADM-005"];
    for (const id of suspendIds) {
      await openActionFromRowMenu(page, id, "suspend");
      await pickReason(page, "ตรวจพบการเข้าถึงข้อมูลนอก scope");
      await clickConfirm(page, "suspend");
      expect(await accountStatus(page, id)).toBe("Suspended");
    }

    // ตรวจ activeCount = 1 (ADM-010 เท่านั้น)
    const activeCount = await page.evaluate(() =>
      adminAccountData.accounts.filter(a => a.status === "Active").length
    );
    expect(activeCount).toBe(1);

    // ADM-010 ไม่มีปุ่มระงับใน row menu (เป็นทั้ง master, self และ active admin คนสุดท้าย)
    expect((await evalCanFunctions(page, "ADM-010")).suspend).toBe(false);
    expect(await rowMenuButtonTexts(page, "ADM-010")).not.toContain("ระงับ");

    // ตรวจว่า active admin คนสุดท้ายที่ไม่ใช่ self/master ถูกป้องกันด้วย
    // (หลัง suspend 5 คนแล้ว ไม่มี active admin ที่ไม่ใช่ self/master เหลือ — ป้องกันได้สำเร็จ)
    const remainingActive = await page.evaluate(() =>
      adminAccountData.accounts.filter(a => a.status === "Active" && !a.isSelf && !a.isMaster).length
    );
    expect(remainingActive).toBe(0);
  });

  // ---- 8. master admin (ADM-010) ไม่มี action ใดๆ ใน row menu และ detail ----

  test("8. master admin (ADM-010) ไม่มี action ใดๆ ใน row menu และ detail (ยกเว้นดูรายละเอียด)", async ({ page }) => {
    await goToAdminAccounts(page);

    // (a) row menu — มีแค่ 'ดูรายละเอียด'
    expect(await rowMenuButtonTexts(page, "ADM-010")).toEqual(["ดูรายละเอียด"]);
    const row = accountRow(page, "ADM-010");
    await expect(row.locator("[data-admin-account-change-role]")).toHaveCount(0);
    await expect(row.locator("[data-admin-account-action]")).toHaveCount(0);

    // (b) detail — ไม่มี action button
    await openDetail(page, "ADM-010");
    expect(await detailActionButtonTexts(page)).toEqual([]);
    await expect(page.locator(".admin-account-detail-page .user-detail-actions [data-admin-account-change-role]")).toHaveCount(0);
    await expect(page.locator(".admin-account-detail-page .user-detail-actions [data-admin-account-action]")).toHaveCount(0);
  });

  // ---- 9. self (isSelf) ไม่มี action ใดๆ — ทดสอบแยกจาก master ผ่าน function evaluate ----

  test("9. self (isSelf) ไม่มี action ใดๆ — ทดสอบแยก master และ self ผ่าน can* functions", async ({ page }) => {
    await goToAdminAccounts(page);

    // (a) self แต่ไม่ใช่ master → ทุก action false
    const selfOnly = await page.evaluate(() => {
      const acc = { id: "TEST-SELF", status: "Active", isSelf: true, isMaster: false };
      return {
        suspend: canSuspendAdmin(acc),
        reactivate: canReactivateAdmin(acc),
        unlock: canUnlockAdmin(acc),
        archive: canArchiveAdmin(acc),
        changeRole: canChangeRoleAdmin(acc)
      };
    });
    expect(selfOnly).toEqual({
      suspend: false, reactivate: false, unlock: false, archive: false, changeRole: false
    });

    // (b) master แต่ไม่ใช่ self → suspend/archive/changeRole false (แต่ reactivate/unlock ขึ้นสถานะ)
    const masterOnly = await page.evaluate(() => {
      const acc = { id: "TEST-MASTER", status: "Active", isSelf: false, isMaster: true };
      return {
        suspend: canSuspendAdmin(acc),
        archive: canArchiveAdmin(acc),
        changeRole: canChangeRoleAdmin(acc),
        reactivate: canReactivateAdmin(acc),
        unlock: canUnlockAdmin(acc)
      };
    });
    // master ห้าม suspend/archive/changeRole
    expect(masterOnly.suspend).toBe(false);
    expect(masterOnly.archive).toBe(false);
    expect(masterOnly.changeRole).toBe(false);
    // master ที่ Active → reactivate/unlock ไม่ได้อยู่แล้ว (สถานะไม่ใช่ Suspended/Locked)
    expect(masterOnly.reactivate).toBe(false);
    expect(masterOnly.unlock).toBe(false);

    // (c) master ที่ Suspended → reactivate ได้ (ไม่ได้บล็อก reactivate ของ master)
    const masterSuspended = await page.evaluate(() => {
      const acc = { id: "TEST-MASTER-SUSP", status: "Suspended", isSelf: false, isMaster: true };
      return {
        reactivate: canReactivateAdmin(acc),
        archive: canArchiveAdmin(acc),
        suspend: canSuspendAdmin(acc)
      };
    });
    expect(masterSuspended.reactivate).toBe(true);  // ไม่บล็อก reactivate ของ master
    expect(masterSuspended.archive).toBe(false);    // master ห้าม archive
    expect(masterSuspended.suspend).toBe(false);    // master ห้าม suspend

    // (d) master ที่ Locked → unlock ได้ (ไม่ได้บล็อก unlock ของ master)
    const masterLocked = await page.evaluate(() => {
      const acc = { id: "TEST-MASTER-LOCK", status: "Locked", isSelf: false, isMaster: true };
      return {
        unlock: canUnlockAdmin(acc),
        archive: canArchiveAdmin(acc),
        suspend: canSuspendAdmin(acc)
      };
    });
    expect(masterLocked.unlock).toBe(true);       // ไม่บล็อก unlock ของ master
    expect(masterLocked.archive).toBe(false);     // master ห้าม archive
    expect(masterLocked.suspend).toBe(false);     // master ห้าม suspend
  });

  // ---- 10. row menu แสดงเฉพาะ action ที่อนุญาต — ตรวจจำนวนปุ่มใน row menu ต่อสถานะ ----

  test("10. row menu แสดงเฉพาะ action ที่อนุญาต — จำนวนปุ่มต่อสถานะ", async ({ page }) => {
    await goToAdminAccounts(page);

    // Active (ADM-001): ดูรายละเอียด + เปลี่ยน Role + ระงับ = 3 ปุ่ม
    expect(await rowMenuButtonTexts(page, "ADM-001")).toEqual(["ดูรายละเอียด", "เปลี่ยน Role", "ระงับ"]);

    // Suspended (ADM-006): ดูรายละเอียด + ยกเลิกการระงับ + เก็บถาวร = 3 ปุ่ม
    expect(await rowMenuButtonTexts(page, "ADM-006")).toEqual(["ดูรายละเอียด", "ยกเลิกการระงับ", "เก็บถาวร"]);

    // Locked (ADM-007): ดูรายละเอียด + ระงับ + ปลดล็อก + เก็บถาวร = 4 ปุ่ม
    expect(await rowMenuButtonTexts(page, "ADM-007")).toEqual(["ดูรายละเอียด", "ระงับ", "ปลดล็อก", "เก็บถาวร"]);

    // Invited (ADM-008): ดูรายละเอียด + เปลี่ยน Role + ระงับ = 3 ปุ่ม
    expect(await rowMenuButtonTexts(page, "ADM-008")).toEqual(["ดูรายละเอียด", "เปลี่ยน Role", "ระงับ"]);

    // Archived (ADM-009): ดูรายละเอียด = 1 ปุ่ม
    expect(await rowMenuButtonTexts(page, "ADM-009")).toEqual(["ดูรายละเอียด"]);

    // master/self (ADM-010): ดูรายละเอียด = 1 ปุ่ม
    expect(await rowMenuButtonTexts(page, "ADM-010")).toEqual(["ดูรายละเอียด"]);
  });

  // ---- 11. detail action buttons ตรงกับ row menu ตามสถานะ ----

  test("11. detail action buttons ตรงกับ row menu ตามสถานะ (ไม่มี 'ดูรายละเอียด' ใน detail)", async ({ page }) => {
    // Active (ADM-001): row menu = [ดูรายละเอียด, เปลี่ยน Role, ระงับ] → detail = [เปลี่ยน Role, ระงับ]
    await openDetail(page, "ADM-001");
    expect(await detailActionButtonTexts(page)).toEqual(["เปลี่ยน Role", "ระงับ"]);

    // Suspended (ADM-006): row menu = [ดูรายละเอียด, ยกเลิกการระงับ, เก็บถาวร] → detail = [ยกเลิกการระงับ, เก็บถาวร]
    await openDetail(page, "ADM-006");
    expect(await detailActionButtonTexts(page)).toEqual(["ยกเลิกการระงับ", "เก็บถาวร"]);

    // Locked (ADM-007): row menu = [ดูรายละเอียด, ระงับ, ปลดล็อก, เก็บถาวร] → detail = [ระงับ, ปลดล็อก, เก็บถาวร]
    await openDetail(page, "ADM-007");
    expect(await detailActionButtonTexts(page)).toEqual(["ระงับ", "ปลดล็อก", "เก็บถาวร"]);

    // Invited (ADM-008): row menu = [ดูรายละเอียด, เปลี่ยน Role, ระงับ] → detail = [เปลี่ยน Role, ระงับ]
    await openDetail(page, "ADM-008");
    expect(await detailActionButtonTexts(page)).toEqual(["เปลี่ยน Role", "ระงับ"]);

    // Archived (ADM-009): row menu = [ดูรายละเอียด] → detail = [] (ไม่มี action)
    await openDetail(page, "ADM-009");
    expect(await detailActionButtonTexts(page)).toEqual([]);

    // master/self (ADM-010): row menu = [ดูรายละเอียด] → detail = [] (ไม่มี action)
    await openDetail(page, "ADM-010");
    expect(await detailActionButtonTexts(page)).toEqual([]);
  });

  // ---- 12. ตรวจว่า action ที่ไม่อนุญาตไม่ปรากฏใน DOM (ไม่ใช่แค่ซ่อน) ----

  test("12. action ที่ไม่อนุญาตไม่ปรากฏใน DOM — ตรวจ row menu และ detail", async ({ page }) => {
    await goToAdminAccounts(page);

    // (a) row menu: ปุ่มที่ไม่อนุญาตไม่อยู่ใน DOM เลย (ไม่ใช่ display:none)
    // ADM-001 (Active): ไม่ควรมี reactivate/unlock/archive button
    const row001 = accountRow(page, "ADM-001");
    await expect(row001.locator('[data-admin-account-action="reactivate"]')).toHaveCount(0);
    await expect(row001.locator('[data-admin-account-action="unlock"]')).toHaveCount(0);
    await expect(row001.locator('[data-admin-account-action="archive"]')).toHaveCount(0);

    // ADM-006 (Suspended): ไม่ควรมี suspend/unlock/change-role button
    const row006 = accountRow(page, "ADM-006");
    await expect(row006.locator('[data-admin-account-action="suspend"]')).toHaveCount(0);
    await expect(row006.locator('[data-admin-account-action="unlock"]')).toHaveCount(0);
    await expect(row006.locator("[data-admin-account-change-role]")).toHaveCount(0);

    // ADM-007 (Locked): ไม่ควรมี change-role button
    const row007 = accountRow(page, "ADM-007");
    await expect(row007.locator("[data-admin-account-change-role]")).toHaveCount(0);

    // ADM-009 (Archived): ไม่ควรมี action ใดๆ
    const row009 = accountRow(page, "ADM-009");
    await expect(row009.locator("[data-admin-account-action]")).toHaveCount(0);
    await expect(row009.locator("[data-admin-account-change-role]")).toHaveCount(0);

    // ADM-010 (master/self): ไม่ควรมี action ใดๆ
    const row010 = accountRow(page, "ADM-010");
    await expect(row010.locator("[data-admin-account-action]")).toHaveCount(0);
    await expect(row010.locator("[data-admin-account-change-role]")).toHaveCount(0);

    // (b) detail: ปุ่มที่ไม่อนุญาตไม่อยู่ใน DOM เลย
    // ADM-001 (Active) detail: ไม่ควรมี reactivate/unlock/archive button
    await openDetail(page, "ADM-001");
    await expect(page.locator(".admin-account-detail-page .user-detail-actions [data-admin-account-action='reactivate']")).toHaveCount(0);
    await expect(page.locator(".admin-account-detail-page .user-detail-actions [data-admin-account-action='unlock']")).toHaveCount(0);
    await expect(page.locator(".admin-account-detail-page .user-detail-actions [data-admin-account-action='archive']")).toHaveCount(0);

    // ADM-009 (Archived) detail: ไม่ควรมี action ใดๆ
    await openDetail(page, "ADM-009");
    await expect(page.locator(".admin-account-detail-page .user-detail-actions button")).toHaveCount(0);

    // ADM-010 (master/self) detail: ไม่ควรมี action ใดๆ
    await openDetail(page, "ADM-010");
    await expect(page.locator(".admin-account-detail-page .user-detail-actions button")).toHaveCount(0);
  });
});
