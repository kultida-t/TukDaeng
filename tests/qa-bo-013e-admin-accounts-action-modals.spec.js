// QA-BO-013e: Settings > Admin Accounts — Action modals (suspend/reactivate/unlock/archive) (strict Playwright spec)
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล — adminAccountActionConfig (บรรทัด ~22748)
//   + renderAdminAccountActionModal (บรรทัด ~22846) + confirmAdminAccountAction (บรรทัด ~23213)
//   + ensureAdminAccountAuditEvent (บรรทัด ~23062) + can*Admin gating (บรรทัด ~22462)
// เป้าหมาย: รันเทสครอบ action modals — open, content, reason/note, impact/email note, confirm/cancel,
//   status change, toast, re-render, activity history, audit event, lifecycle (ห้ามแก้ prototype)
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

// helper: เปิด row menu ของ account แล้วคลิก action button (suspend/reactivate/unlock/archive)
async function openActionFromRowMenu(page, id, action) {
  const row = accountRow(page, id);
  await row.locator(".row-menu > summary").click();
  await page.waitForTimeout(300);
  await row.locator(`[data-admin-account-action="${action}"][data-admin-account-id="${id}"]`).click();
  await page.waitForTimeout(300);
}

// helper: เปิด detail ของ account แล้วคลิก action button ใน detail actions
async function openActionFromDetail(page, id, action) {
  await goToAdminAccounts(page);
  await page.locator(`.admin-account-row[data-admin-account-card="${id}"] .user-cell-primary[data-label="Admin ID"]`).click();
  await page.waitForTimeout(300);
  await page.locator(`.user-detail-actions [data-admin-account-action="${action}"][data-admin-account-id="${id}"]`).click();
  await page.waitForTimeout(300);
}

// helper: เปิด action modal จาก row menu (รวม goToAdminAccounts)
async function openActionModalFromList(page, id, action) {
  await goToAdminAccounts(page);
  await openActionFromRowMenu(page, id, action);
}

// helper: เลือก reason ใน custom-select ของ modal (ไม่ต้องเปิด filter bar เพราะอยู่ใน modal)
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

// helper: อ่านค่า hidden input ของ custom-select reason
async function reasonValue(page) {
  return await page.locator("#admin-account-action-reason").inputValue();
}

// helper: คลิก confirm ใน modal
async function clickConfirm(page, action) {
  await page.locator(`[data-admin-account-action-confirm="${action}"]`).click();
  await page.waitForTimeout(400);
}

// helper: คลิก cancel ใน modal (ปุ่ม footer ที่ไม่ใช่ confirm)
async function clickCancel(page) {
  await page.locator("#user-action-modal .user-action-footer [data-user-action-modal-close]").click();
  await page.waitForTimeout(300);
}

// helper: อ่านสถานะปัจจุบันของ account จาก mock data
async function accountStatus(page, id) {
  return await page.evaluate(accId => {
    const acc = adminAccountData.accounts.find(a => a.id === accId);
    return acc ? acc.status : null;
  }, id);
}

// ==================== E. ACTION MODALS ====================

test.describe("QA-BO-013e: Settings > Admin Accounts — action modals (suspend/reactivate/unlock/archive)", () => {

  test("1. เปิด modal แต่ละ action จาก row menu และจาก detail ได้", async ({ page }) => {
    // (a) จาก row menu — suspend ADM-001 (Active)
    await openActionModalFromList(page, "ADM-001", "suspend");
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Suspend Admin");
    // ปิด modal ก่อนเทสถัดไป
    await clickCancel(page);

    // (b) จาก detail — suspend ADM-001
    await openActionFromDetail(page, "ADM-001", "suspend");
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Suspend Admin");
    await clickCancel(page);

    // (c) จาก row menu — reactivate ADM-006 (Suspended)
    await openActionModalFromList(page, "ADM-006", "reactivate");
    await expect(page.locator("#user-action-modal-title")).toHaveText("Reactivate Admin");
    await clickCancel(page);

    // (d) จาก row menu — unlock ADM-007 (Locked)
    await openActionModalFromList(page, "ADM-007", "unlock");
    await expect(page.locator("#user-action-modal-title")).toHaveText("Unlock Admin");
    await clickCancel(page);

    // (e) จาก row menu — archive ADM-006 (Suspended → can archive)
    await openActionModalFromList(page, "ADM-006", "archive");
    await expect(page.locator("#user-action-modal-title")).toHaveText("Archive Admin");
    await clickCancel(page);

    // (f) จาก detail — archive ADM-007 (Locked → can archive)
    await openActionFromDetail(page, "ADM-007", "archive");
    await expect(page.locator("#user-action-modal-title")).toHaveText("Archive Admin");
    await clickCancel(page);
  });

  test("2. modal แสดง title + summary + target (name, id, email, status pill) ถูกต้อง", async ({ page }) => {
    // suspend ADM-001 — Active, Super Admin
    await openActionModalFromList(page, "ADM-001", "suspend");
    const modal = page.locator("#user-action-modal");
    // title
    await expect(modal.locator("#user-action-modal-title")).toHaveText("Suspend Admin");
    // summary
    await expect(modal.locator(".user-action-head p")).toHaveText("ระงับ admin account ผู้รับจะเข้าสู่ระบบไม่ได้ทันที และต้องมี reason + audit");
    // target: name + id · email + status pill
    // (.user-action-target มี span 2 ตัว: id·email span + pill — ต้อง scope ด้วย div)
    const target = modal.locator(".user-action-target");
    await expect(target.locator("strong")).toHaveText("สมชาย บริหาร");
    await expect(target.locator("div span")).toHaveText("ADM-001 · somchai@tukdaeng.example");
    await expect(target.locator(".pill.green")).toHaveText("Active");
    await clickCancel(page);

    // archive ADM-006 — Suspended
    await openActionModalFromList(page, "ADM-006", "archive");
    const target2 = page.locator("#user-action-modal .user-action-target");
    await expect(target2.locator("strong")).toHaveText("พิมพ์ใจ สายด่วน");
    await expect(target2.locator("div span")).toHaveText("ADM-006 · pim@tukdaeng.example");
    await expect(target2.locator(".pill.red")).toHaveText("Suspended");
    await clickCancel(page);
  });

  test("3. reason selector มี placeholder 'เลือกเหตุผล' + ตัวเลือกตาม config (4 ตัว)", async ({ page }) => {
    const checks = [
      { id: "ADM-001", action: "suspend", reasons: [
        "ตรวจพบการเข้าถึงข้อมูลนอก scope",
        "พฤติกรรมละเมิดนโยบาย BO",
        "รอตรวจสอบ security incident",
        "คำขอจากผู้บริหาร/HR"
      ]},
      { id: "ADM-006", action: "reactivate", reasons: [
        "ตรวจสอบเสร็จแล้ว ไม่พบความผิด",
        "ได้รับอนุมัติให้กลับมาใช้งาน",
        "สิ้นสุดช่วงรอตรวจสอบ",
        "คำขอจากผู้บริหาร/HR"
      ]},
      { id: "ADM-007", action: "unlock", reasons: [
        "ยืนยันตัวตนกับ admin แล้ว",
        "ตรวจสอบแล้วไม่พบความเสี่ยง",
        "รอครบช่วง lockout 15 นาทีแล้ว",
        "คำขอจากผู้บริหาร/HR"
      ]},
      { id: "ADM-006", action: "archive", reasons: [
        "ออกจากทีมแล้ว",
        "ย้ายไปทีมอื่น",
        "สิ้นสุดการจ้างงาน",
        "คำขอจากผู้บริหาร/HR"
      ]}
    ];
    for (const { id, action, reasons } of checks) {
      await openActionModalFromList(page, id, action);
      // เปิด dropdown ของ reason
      await page.locator(`div[data-custom-select]:has(> #admin-account-action-reason) [data-custom-select-trigger]`).click();
      await page.waitForTimeout(150);
      const options = page.locator(`div[data-custom-select]:has(> #admin-account-action-reason) [data-custom-select-option]`);
      // placeholder 'เลือกเหตุผล' + 4 reasons จาก config
      await expect(options).toHaveCount(5);
      const texts = await options.allTextContents();
      expect(texts.map(t => t.trim())).toEqual(["เลือกเหตุผล", ...reasons]);
      // ปิด dropdown แล้วปิด modal
      await page.locator(`div[data-custom-select]:has(> #admin-account-action-reason) [data-custom-select-trigger]`).click();
      await page.waitForTimeout(150);
      await clickCancel(page);
    }
  });

  test("4. impact note แสดงผลกระทบตาม action", async ({ page }) => {
    const checks = [
      { id: "ADM-001", action: "suspend", expected: "เข้าสู่ระบบไม่ได้ทันที และ session ถูกยกเลิก" },
      { id: "ADM-006", action: "reactivate", expected: "กลับเข้าสู่ระบบได้ตามปกติ" },
      { id: "ADM-007", action: "unlock", expected: "กลับเข้าสู่ระบบได้ทันที ไม่ต้องรอ lockout หมดอายุ" },
      { id: "ADM-006", action: "archive", expected: "บัญชีปิดใช้งาน แต่ยังเก็บประวัติไว้ตามกำหนดเก็บรักษา" }
    ];
    for (const { id, action, expected } of checks) {
      await openActionModalFromList(page, id, action);
      const impact = page.locator("#user-action-modal .user-action-impact-warning");
      await expect(impact).toBeVisible();
      await expect(impact).toContainText(`ผลกระทบ: ${expected}`);
      await clickCancel(page);
    }
  });

  test("5. email note ไม่แสดงใน action modal (พฤติกรรมตั้งใจ — spec จะอัปเดตตาม prototype)", async ({ page }) => {
    // ผู้ใช้ยืนยัน: action modal ไม่มี email note เป็น design ที่ถูกต้อง
    // (renderAdminAccountActionEmailNote ถูก define แต่ไม่ถูกเรียก — spec ข้อ 5 จะถูกอัปเดตให้ตรง prototype)
    const checks = [
      { id: "ADM-001", action: "suspend" },
      { id: "ADM-006", action: "archive" },
      { id: "ADM-007", action: "unlock" }
    ];
    for (const { id, action } of checks) {
      await openActionModalFromList(page, id, action);
      const emailNote = page.locator("#user-action-modal .user-action-impact-notice");
      await expect(emailNote).toHaveCount(0);
      // impact note (warning) ยังแสดงปกติ — ขาดเฉพาะ email note
      await expect(page.locator("#user-action-modal .user-action-impact-warning")).toBeVisible();
      await clickCancel(page);
    }
  });

  test("6. confirm button มี class ตาม tone (suspend=danger, reactivate/unlock=primary, archive=warning)", async ({ page }) => {
    const checks = [
      { id: "ADM-001", action: "suspend", toneClass: "danger" },
      { id: "ADM-006", action: "reactivate", toneClass: "primary" },
      { id: "ADM-007", action: "unlock", toneClass: "primary" },
      { id: "ADM-006", action: "archive", toneClass: "warning" }
    ];
    for (const { id, action, toneClass } of checks) {
      await openActionModalFromList(page, id, action);
      const confirmBtn = page.locator(`#user-action-modal [data-admin-account-action-confirm="${action}"]`);
      await expect(confirmBtn).toHaveClass(new RegExp(`\\b${toneClass}\\b`));
      await expect(confirmBtn).toHaveText("ยืนยัน");
      await clickCancel(page);
    }
  });

  test("7. cancel button ปิด modal ไม่เปลี่ยนสถานะ", async ({ page }) => {
    await openActionModalFromList(page, "ADM-001", "suspend");
    // สถานะก่อน cancel = Active
    expect(await accountStatus(page, "ADM-001")).toBe("Active");
    await clickCancel(page);
    // modal ปิด
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    // สถานะยัง Active ไม่เปลี่ยน
    expect(await accountStatus(page, "ADM-001")).toBe("Active");
    // row ยังแสดง pill green Active
    await expect(accountRow(page, "ADM-001").locator('[data-label="Status"] .pill')).toHaveClass(/\bgreen\b/);
    await expect(accountRow(page, "ADM-001").locator('[data-label="Status"] .pill')).toHaveText("Active");
  });

  test("8. confirm → สถานะเปลี่ยน: suspend→Suspended, reactivate→Active, unlock→Active, archive→Archived", async ({ page }) => {
    // ทุก step อยู่ใน page session เดียว (ห้าม reload — mock reset เมื่อ goto ใหม่)
    await goToAdminAccounts(page);

    // suspend ADM-001 (Active → Suspended)
    await openActionFromRowMenu(page, "ADM-001", "suspend");
    await pickReason(page, "ตรวจพบการเข้าถึงข้อมูลนอก scope");
    await clickConfirm(page, "suspend");
    expect(await accountStatus(page, "ADM-001")).toBe("Suspended");

    // reactivate ADM-006 (Suspended → Active)
    await openActionFromRowMenu(page, "ADM-006", "reactivate");
    await pickReason(page, "ตรวจสอบเสร็จแล้ว ไม่พบความผิด");
    await clickConfirm(page, "reactivate");
    expect(await accountStatus(page, "ADM-006")).toBe("Active");

    // unlock ADM-007 (Locked → Active)
    await openActionFromRowMenu(page, "ADM-007", "unlock");
    await pickReason(page, "ยืนยันตัวตนกับ admin แล้ว");
    await clickConfirm(page, "unlock");
    expect(await accountStatus(page, "ADM-007")).toBe("Active");

    // archive ADM-001 (Suspended จาก step แรก → Archived)
    await openActionFromRowMenu(page, "ADM-001", "archive");
    await pickReason(page, "ออกจากทีมแล้ว");
    await clickConfirm(page, "archive");
    expect(await accountStatus(page, "ADM-001")).toBe("Archived");
  });

  test("9. confirm → success toast แสดงข้อความตาม config.success", async ({ page }) => {
    // suspend ADM-001
    await openActionModalFromList(page, "ADM-001", "suspend");
    await pickReason(page, "พฤติกรรมละเมิดนโยบาย BO");
    await clickConfirm(page, "suspend");
    const toast = page.locator("#success-toast");
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("สมชาย บริหาร ถูกระงับแล้ว — เข้าสู่ระบบไม่ได้ทันที");

    // reactivate ADM-006
    await openActionModalFromList(page, "ADM-006", "reactivate");
    await pickReason(page, "ได้รับอนุมัติให้กลับมาใช้งาน");
    await clickConfirm(page, "reactivate");
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("พิมพ์ใจ สายด่วน ยกเลิกการระงับแล้ว — กลับเข้าสู่ระบบได้");

    // unlock ADM-007
    await openActionModalFromList(page, "ADM-007", "unlock");
    await pickReason(page, "ตรวจสอบแล้วไม่พบความเสี่ยง");
    await clickConfirm(page, "unlock");
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("วิชัย รองผู้จัดการ ปลดล็อกแล้ว — กลับเข้าสู่ระบบได้");

    // archive ADM-006 (Suspended → archive)
    await openActionModalFromList(page, "ADM-006", "archive");
    await pickReason(page, "ย้ายไปทีมอื่น");
    await clickConfirm(page, "archive");
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("พิมพ์ใจ สายด่วน เก็บถาวรแล้ว — ออกจาก active use");
  });

  test("10. confirm → modal ปิด + re-render (list) + status pill อัปเดต", async ({ page }) => {
    // suspend ADM-001 จาก list
    await openActionModalFromList(page, "ADM-001", "suspend");
    await pickReason(page, "รอตรวจสอบ security incident");
    await clickConfirm(page, "suspend");
    // modal ปิด
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    // ยังอยู่ใน list mode
    await expect(page.locator("body")).toHaveClass(/admin-account-list-mode/);
    // status pill อัปเดตเป็น Suspended (red)
    const pill = accountRow(page, "ADM-001").locator('[data-label="Status"] .pill');
    await expect(pill).toHaveClass(/\bred\b/);
    await expect(pill).toHaveText("Suspended");
  });

  test("10b. confirm จาก detail → modal ปิด + re-render (detail) + status pill อัปเดต", async ({ page }) => {
    // suspend ADM-001 จาก detail
    await openActionFromDetail(page, "ADM-001", "suspend");
    await pickReason(page, "คำขอจากผู้บริหาร/HR");
    await clickConfirm(page, "suspend");
    // modal ปิด
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    // ยังอยู่ใน detail mode
    await expect(page.locator("body")).toHaveClass(/admin-account-detail-mode/);
    // detail head status pill อัปเดตเป็น Suspended (red)
    const head = page.locator(".admin-account-detail-page .user-detail-head");
    await expect(head.locator(".chips .pill.red")).toHaveText("Suspended");
  });

  test("11. confirm → activity history เพิ่ม row ล่าสุด (action + reason + note)", async ({ page }) => {
    // ADM-006 (Suspended) — reactivate แล้วตรวจ activity history ใน detail
    await openActionModalFromList(page, "ADM-006", "reactivate");
    await pickReason(page, "สิ้นสุดช่วงรอตรวจสอบ");
    await page.locator("#admin-account-action-note").fill("ยืนยันจาก HR แล้ว");
    await clickConfirm(page, "reactivate");
    // เปิด detail ADM-006
    await page.locator(`.admin-account-row[data-admin-account-card="ADM-006"] .user-cell-primary[data-label="Admin ID"]`).click();
    await page.waitForTimeout(300);
    const section = page.locator(".admin-account-action-section");
    const rows = section.locator("tbody tr");
    // row ล่าสุด (แถวแรก) = Reactivate Admin
    await expect(rows.nth(0).locator("td").nth(1)).toHaveText("Reactivate Admin");
    await expect(rows.nth(0).locator("td").nth(4)).toContainText("สิ้นสุดช่วงรอตรวจสอบ");
    await expect(rows.nth(0).locator("td").nth(4)).toContainText("หมายเหตุ: ยืนยันจาก HR แล้ว");
  });

  test("12. confirm → audit event ถูกสร้าง (ADMIN_ACCOUNT_*) + auditRef เพิ่มใน detail", async ({ page }) => {
    // suspend ADM-001 แล้วตรวจ audit event + auditRef
    await openActionModalFromList(page, "ADM-001", "suspend");
    await pickReason(page, "ตรวจพบการเข้าถึงข้อมูลนอก scope");
    await clickConfirm(page, "suspend");
    // ตรวจ audit event ใน auditLogData
    const auditInfo = await page.evaluate(() => {
      const ev = auditLogData.events[0]; // latest first
      return ev ? { id: ev.id, action: ev.action, reference: ev.reference, before: ev.before, after: ev.after } : null;
    });
    expect(auditInfo).not.toBeNull();
    expect(auditInfo.action).toBe("Suspend Admin");
    expect(auditInfo.reference).toBe("ADM-001");
    // before/after ถูกต้องหลัง fix — ensureAdminAccountAuditEvent รับ beforeStatus จาก caller
    expect(auditInfo.before).toBe("Active");
    expect(auditInfo.after).toBe("Suspended");
    // auditRef เพิ่มใน detail
    const auditRef = await page.evaluate(() => {
      const d = adminAccountData.detail["ADM-001"];
      return d && d.auditRefs ? d.auditRefs[0] : null;
    });
    expect(auditRef).not.toBeNull();
    expect(auditRef).toBe(auditInfo.id);

    // เปิด detail ADM-001 แล้วตรวจ audit link pill แสดง auditRef ใหม่
    await page.locator(`.admin-account-row[data-admin-account-card="ADM-001"] .user-cell-primary[data-label="Admin ID"]`).click();
    await page.waitForTimeout(300);
    const section = page.locator(".admin-account-action-section");
    const firstAuditCell = section.locator("tbody tr").nth(0).locator('[data-label="Audit"]');
    await expect(firstAuditCell.locator("button.history-audit-link")).toHaveText(auditInfo.id);
  });

  test("12b. audit event type + before/after ถูกต้องสำหรับทุก action (SUSPEND/REACTIVATE/UNLOCK/ARCHIVE)", async ({ page }) => {
    // ทุก step อยู่ใน page session เดียว (ห้าม reload)
    await goToAdminAccounts(page);

    // suspend ADM-001
    await openActionFromRowMenu(page, "ADM-001", "suspend");
    await pickReason(page, "พฤติกรรมละเมิดนโยบาย BO");
    await clickConfirm(page, "suspend");
    let ev = await page.evaluate(() => auditLogData.events[0]);
    expect(ev.action).toBe("Suspend Admin");
    expect(ev.before).toBe("Active");
    expect(ev.after).toBe("Suspended");

    // reactivate ADM-006
    await openActionFromRowMenu(page, "ADM-006", "reactivate");
    await pickReason(page, "ตรวจสอบเสร็จแล้ว ไม่พบความผิด");
    await clickConfirm(page, "reactivate");
    ev = await page.evaluate(() => auditLogData.events[0]);
    expect(ev.action).toBe("Reactivate Admin");
    expect(ev.before).toBe("Suspended");
    expect(ev.after).toBe("Active");

    // unlock ADM-007
    await openActionFromRowMenu(page, "ADM-007", "unlock");
    await pickReason(page, "รอครบช่วง lockout 15 นาทีแล้ว");
    await clickConfirm(page, "unlock");
    ev = await page.evaluate(() => auditLogData.events[0]);
    expect(ev.action).toBe("Unlock Admin");
    expect(ev.before).toBe("Locked");
    expect(ev.after).toBe("Active");

    // archive ADM-001 (Suspended จาก step แรก → Archived)
    await openActionFromRowMenu(page, "ADM-001", "archive");
    await pickReason(page, "สิ้นสุดการจ้างงาน");
    await clickConfirm(page, "archive");
    ev = await page.evaluate(() => auditLogData.events[0]);
    expect(ev.action).toBe("Archive Admin");
    expect(ev.before).toBe("Suspended");
    expect(ev.after).toBe("Archived");
  });

  test("13. note ไม่บังคับ — กรอกหรือไม่ก็ confirm ได้", async ({ page }) => {
    // (a) ไม่กรอก note — confirm ได้ สถานะเปลี่ยน
    await openActionModalFromList(page, "ADM-001", "suspend");
    await pickReason(page, "ตรวจพบการเข้าถึงข้อมูลนอก scope");
    // ไม่กรอก note
    await clickConfirm(page, "suspend");
    expect(await accountStatus(page, "ADM-001")).toBe("Suspended");
    await expect(page.locator("#success-toast")).toBeVisible();

    // (b) กรอก note — confirm ได้ สถานะเปลี่ยน
    await openActionModalFromList(page, "ADM-006", "reactivate");
    await pickReason(page, "ได้รับอนุมัติให้กลับมาใช้งาน");
    await page.locator("#admin-account-action-note").fill("ตรวจสอบเรียบร้อย อนุมัติโดยผู้บริหาร");
    await clickConfirm(page, "reactivate");
    expect(await accountStatus(page, "ADM-006")).toBe("Active");
    await expect(page.locator("#success-toast")).toBeVisible();
  });

  test("14. เงื่อนไข reason: required — confirm โดยไม่เลือก → error 'กรุณาระบุเหตุผล' + สถานะไม่เปลี่ยน", async ({ page }) => {
    // reason required ตาม spec — modal มี placeholder 'เลือกเหตุผล' (value="") + validation
    await openActionModalFromList(page, "ADM-001", "suspend");
    // default = placeholder (value "") + trigger label แสดง 'เลือกเหตุผล'
    expect(await reasonValue(page)).toBe("");
    await expect(
      page.locator('div[data-custom-select]:has(> #admin-account-action-reason) [data-custom-select-label]')
    ).toHaveText("เลือกเหตุผล");
    // confirm โดยไม่เลือก reason → error แสดง สถานะไม่เปลี่ยน modal ยังเปิด
    await clickConfirm(page, "suspend");
    const reasonError = page.locator("[data-admin-action-reason-error]");
    await expect(reasonError).toHaveText("กรุณาระบุเหตุผล");
    await expect(reasonError).toHaveClass(/show/);
    expect(await accountStatus(page, "ADM-001")).toBe("Active");
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    // เลือก reason แล้ว confirm → ผ่าน สถานะเปลี่ยน audit ใช้ reason ที่เลือก
    await pickReason(page, "ตรวจพบการเข้าถึงข้อมูลนอก scope");
    await clickConfirm(page, "suspend");
    expect(await accountStatus(page, "ADM-001")).toBe("Suspended");
    await expect(page.locator("#success-toast")).toBeVisible();
    const auditReason = await page.evaluate(() => auditLogData.events[0].reason);
    expect(auditReason).toBe("ตรวจพบการเข้าถึงข้อมูลนอก scope");
  });

  test("15. ลำดับ lifecycle: suspend → reactivate → suspend → archive ทำตามลำดับได้ (account เดียว)", async ({ page }) => {
    // ADM-001 (Active) → suspend → Suspended → reactivate → Active → suspend → Suspended → archive → Archived
    await goToAdminAccounts(page);

    // step 1: suspend ADM-001
    await openActionFromRowMenu(page, "ADM-001", "suspend");
    await pickReason(page, "ตรวจพบการเข้าถึงข้อมูลนอก scope");
    await clickConfirm(page, "suspend");
    expect(await accountStatus(page, "ADM-001")).toBe("Suspended");

    // step 2: reactivate ADM-001 (Suspended → Active)
    await openActionFromRowMenu(page, "ADM-001", "reactivate");
    await pickReason(page, "ตรวจสอบเสร็จแล้ว ไม่พบความผิด");
    await clickConfirm(page, "reactivate");
    expect(await accountStatus(page, "ADM-001")).toBe("Active");

    // step 3: suspend ADM-001 อีกครั้ง (Active → Suspended) เพื่อให้ archive ได้
    await openActionFromRowMenu(page, "ADM-001", "suspend");
    await pickReason(page, "พฤติกรรมละเมิดนโยบาย BO");
    await clickConfirm(page, "suspend");
    expect(await accountStatus(page, "ADM-001")).toBe("Suspended");

    // step 4: archive ADM-001 (Suspended → Archived)
    await openActionFromRowMenu(page, "ADM-001", "archive");
    await pickReason(page, "สิ้นสุดการจ้างงาน");
    await clickConfirm(page, "archive");
    expect(await accountStatus(page, "ADM-001")).toBe("Archived");

    // หลัง archive แล้ว row menu มีแค่ 'ดูรายละเอียด' (ไม่มี action อื่น)
    const texts = await accountRow(page, "ADM-001")
      .locator(".row-menu-list button")
      .allTextContents()
      .then(ts => ts.map(t => t.trim()));
    expect(texts).toEqual(["ดูรายละเอียด"]);
  });

  test("15b. ลำดับ lifecycle: locked → unlock → active (ADM-007)", async ({ page }) => {
    // ADM-007 (Locked) → unlock → Active
    await openActionModalFromList(page, "ADM-007", "unlock");
    await pickReason(page, "ยืนยันตัวตนกับ admin แล้ว");
    await clickConfirm(page, "unlock");
    expect(await accountStatus(page, "ADM-007")).toBe("Active");
    // หลัง unlock แล้ว row menu มี 'ดูรายละเอียด' + 'เปลี่ยน Role' + 'ระงับ' (Active ไม่ใช่คนสุดท้าย)
    const texts = await accountRow(page, "ADM-007")
      .locator(".row-menu-list button")
      .allTextContents()
      .then(ts => ts.map(t => t.trim()));
    expect(texts).toEqual(["ดูรายละเอียด", "เปลี่ยน Role", "ระงับ"]);
  });

  test("16. confirm จาก detail → activity history เพิ่ม row ใน detail ทันที (re-render detail)", async ({ page }) => {
    // ADM-006 (Suspended) — reactivate จาก detail
    await openActionFromDetail(page, "ADM-006", "reactivate");
    await pickReason(page, "ได้รับอนุมัติให้กลับมาใช้งาน");
    await page.locator("#admin-account-action-note").fill("อนุมัติจากผู้บริหาร");
    await clickConfirm(page, "reactivate");
    // ยังอยู่ใน detail mode — ตรวจ activity history แถวแรก
    const section = page.locator(".admin-account-action-section");
    const rows = section.locator("tbody tr");
    await expect(rows.nth(0).locator("td").nth(1)).toHaveText("Reactivate Admin");
    await expect(rows.nth(0).locator("td").nth(4)).toContainText("ได้รับอนุมัติให้กลับมาใช้งาน");
    await expect(rows.nth(0).locator("td").nth(4)).toContainText("หมายเหตุ: อนุมัติจากผู้บริหาร");
    // detail head status pill อัปเดตเป็น Active (green)
    const head = page.locator(".admin-account-detail-page .user-detail-head");
    await expect(head.locator(".chips .pill.green")).toHaveText("Active");
  });

  test("17. mobile (≤760px): action modal เปิดได้จาก row menu + confirm ได้", async ({ page }) => {
    const mobile = await isMobile(page);
    if (!mobile) { test.skip(); return; }
    await openActionModalFromList(page, "ADM-001", "suspend");
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Suspend Admin");
    await pickReason(page, "ตรวจพบการเข้าถึงข้อมูลนอก scope");
    await clickConfirm(page, "suspend");
    expect(await accountStatus(page, "ADM-001")).toBe("Suspended");
    await expect(page.locator("#success-toast")).toBeVisible();
  });
});
