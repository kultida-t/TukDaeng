// QA-BO-013f: Settings > Admin Accounts — Change Role modal (strict Playwright spec)
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล — openAdminAccountChangeRoleModal (บรรทัด ~22908)
//   + confirmAdminAccountChangeRole (บรรทัด ~23170) + updateAdminChangeRoleDiff (บรรทัด ~23161)
//   + setAdminChangeRoleFieldError (บรรทัด ~23152) + ensureAdminAccountRoleChangeAuditEvent (บรรทัด ~23119)
//   + canChangeRoleAdmin gating (บรรทัด ~22492)
// เป้าหมาย: รันเทสครอบ Change Role modal — open (row menu/detail), content, role/reason select,
//   diff ก่อน→หลัง, validation, confirm/cancel, role pill + matrix อัปเดต, activity history,
//   audit event, gating (master/archived ไม่มีปุ่ม) (ห้ามแก้ prototype)
// หมายเหตุ: role/reason select มีตัวเลือก placeholder "" ตาม pattern action modal
//   → validation เทสผ่าน UI จริงได้ ยกเว้นเคส 'เลือก role เดิม' ที่ตัวเลือกถูกกรองออก
//   จึง force ค่า hidden input ผ่าน evaluate เพื่อครอบ error branch ตาม spec
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

// helper: เปิด row menu ของ account แล้วคลิกปุ่ม 'เปลี่ยน Role'
async function openChangeRoleFromRowMenu(page, id) {
  const row = accountRow(page, id);
  await row.locator(".row-menu > summary").click();
  await page.waitForTimeout(300);
  await row.locator(`[data-admin-account-change-role="${id}"]`).click();
  await page.waitForTimeout(300);
}

// helper: เปิด detail ของ account แล้วคลิกปุ่ม 'เปลี่ยน Role' ใน detail actions
async function openChangeRoleFromDetail(page, id) {
  await goToAdminAccounts(page);
  await page.locator(`.admin-account-row[data-admin-account-card="${id}"] .user-cell-primary[data-label="Admin ID"]`).click();
  await page.waitForTimeout(300);
  await page.locator(`.user-detail-actions [data-admin-account-change-role="${id}"]`).click();
  await page.waitForTimeout(300);
}

// helper: เปิด change role modal จาก row menu (รวม goToAdminAccounts)
async function openChangeRoleModalFromList(page, id) {
  await goToAdminAccounts(page);
  await openChangeRoleFromRowMenu(page, id);
}

// helper: เลือก role ใหม่ใน custom-select ของ modal
async function pickRole(page, value) {
  await page
    .locator(`div[data-custom-select]:has(> #admin-account-change-role) [data-custom-select-trigger]`)
    .click();
  await page.waitForTimeout(150);
  await page
    .locator(`div[data-custom-select]:has(> #admin-account-change-role) [data-custom-select-option][data-value="${value}"]`)
    .click();
  await page.waitForTimeout(200);
}

// helper: เลือกเหตุผลใน custom-select ของ modal
async function pickReason(page, value) {
  await page
    .locator(`div[data-custom-select]:has(> #admin-account-change-role-reason) [data-custom-select-trigger]`)
    .click();
  await page.waitForTimeout(150);
  await page
    .locator(`div[data-custom-select]:has(> #admin-account-change-role-reason) [data-custom-select-option][data-value="${value}"]`)
    .click();
  await page.waitForTimeout(200);
}

// helper: คลิก confirm 'ยืนยันเปลี่ยน Role' ใน modal
async function clickConfirm(page) {
  await page.locator("[data-admin-account-change-role-confirm]").click();
  await page.waitForTimeout(400);
}

// helper: คลิก cancel 'ยกเลิก' ใน modal (ปุ่ม footer ที่ไม่ใช่ confirm)
async function clickCancel(page) {
  await page.locator("#user-action-modal .user-action-footer [data-user-action-modal-close]").click();
  await page.waitForTimeout(300);
}

// helper: อ่าน role ปัจจุบันของ account จาก mock data
async function accountRole(page, id) {
  return await page.evaluate(accId => {
    const acc = adminAccountData.accounts.find(a => a.id === accId);
    return acc ? acc.role : null;
  }, id);
}

// ==================== F. CHANGE ROLE MODAL ====================

test.describe("QA-BO-013f: Settings > Admin Accounts — Change Role modal", () => {

  test("1. เปิด Change Role modal จาก row menu และจาก detail ได้ (เฉพาะ account ที่อนุญาต)", async ({ page }) => {
    // (a) จาก row menu — ADM-001 (Active)
    await openChangeRoleModalFromList(page, "ADM-001");
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Change Role");
    await clickCancel(page);

    // (b) จาก detail — ADM-003 (Active, Moderator)
    await openChangeRoleFromDetail(page, "ADM-003");
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Change Role");
    await clickCancel(page);

    // (c) จาก row menu — ADM-008 (Invited — canChangeRoleAdmin อนุญาต)
    await openChangeRoleModalFromList(page, "ADM-008");
    await expect(page.locator("#user-action-modal-title")).toHaveText("Change Role");
    await clickCancel(page);
  });

  test("2. modal แสดง title + summary + target (name, id, email, status pill) ถูกต้อง", async ({ page }) => {
    // ADM-003 — Active, Moderator
    await openChangeRoleModalFromList(page, "ADM-003");
    const modal = page.locator("#user-action-modal");
    await expect(modal.locator("#user-action-modal-title")).toHaveText("Change Role");
    await expect(modal.locator(".user-action-head p")).toHaveText("เปลี่ยน role ของ admin — สิทธิใหม่มีผลทันที ต้องระบุเหตุผลและบันทึก audit");
    const target = modal.locator(".user-action-target");
    await expect(target.locator("strong")).toHaveText("มะลิ จันทร์ดี");
    await expect(target.locator("div span")).toHaveText("ADM-003 · mali@tukdaeng.example");
    await expect(target.locator(".pill.green")).toHaveText("Active");
    await clickCancel(page);

    // ADM-008 — Invited (pill blue)
    await openChangeRoleModalFromList(page, "ADM-008");
    const target2 = page.locator("#user-action-modal .user-action-target");
    await expect(target2.locator("strong")).toHaveText("นัฐพล พัฒนา");
    await expect(target2.locator("div span")).toHaveText("ADM-008 · nattapol@tukdaeng.example");
    await expect(target2.locator(".pill.blue")).toHaveText("Invited");
    await clickCancel(page);
  });

  test("3. Role ปัจจุบัน = disabled input แสดง role เดิม", async ({ page }) => {
    // ADM-001 — Super Admin
    await openChangeRoleModalFromList(page, "ADM-001");
    const currentInput = page.locator("#user-action-modal .user-action-form label:has-text(\"Role ปัจจุบัน\") input");
    await expect(currentInput).toBeDisabled();
    await expect(currentInput).toHaveValue("Super Admin");
    await clickCancel(page);

    // ADM-005 — Content Editor
    await openChangeRoleModalFromList(page, "ADM-005");
    const currentInput2 = page.locator("#user-action-modal .user-action-form label:has-text(\"Role ปัจจุบัน\") input");
    await expect(currentInput2).toBeDisabled();
    await expect(currentInput2).toHaveValue("Content Editor");
    await clickCancel(page);
  });

  test("4. Role ใหม่ = custom select มี placeholder 'เลือก role ใหม่' + ตัวเลือกทุก role ยกเว้น role ปัจจุบัน", async ({ page }) => {
    // ADM-001 (Super Admin) → options = placeholder + Content Editor, Content Publisher, Moderator, Support Agent
    await openChangeRoleModalFromList(page, "ADM-001");
    await page.locator(`div[data-custom-select]:has(> #admin-account-change-role) [data-custom-select-trigger]`).click();
    await page.waitForTimeout(150);
    const options = page.locator(`div[data-custom-select]:has(> #admin-account-change-role) [data-custom-select-option]`);
    await expect(options).toHaveCount(5);
    const texts = await options.allTextContents();
    expect(texts.map(t => t.trim())).toEqual(["เลือก role ใหม่", "Content Editor", "Content Publisher", "Moderator", "Support Agent"]);
    expect(texts.map(t => t.trim())).not.toContain("Super Admin");
    // placeholder "" เป็นค่า default → trigger แสดง 'เลือก role ใหม่' + hidden input ว่าง (ตาม pattern action modal)
    expect(await page.locator("#admin-account-change-role").inputValue()).toBe("");
    await expect(
      page.locator('div[data-custom-select]:has(> #admin-account-change-role) [data-custom-select-label]')
    ).toHaveText("เลือก role ใหม่");
    await page.locator(`div[data-custom-select]:has(> #admin-account-change-role) [data-custom-select-trigger]`).click();
    await page.waitForTimeout(150);
    await clickCancel(page);

    // ADM-003 (Moderator) → options = placeholder + Super Admin, Content Editor, Content Publisher, Support Agent
    await openChangeRoleModalFromList(page, "ADM-003");
    await page.locator(`div[data-custom-select]:has(> #admin-account-change-role) [data-custom-select-trigger]`).click();
    await page.waitForTimeout(150);
    const options2 = page.locator(`div[data-custom-select]:has(> #admin-account-change-role) [data-custom-select-option]`);
    await expect(options2).toHaveCount(5);
    const texts2 = await options2.allTextContents();
    expect(texts2.map(t => t.trim())).toEqual(["เลือก role ใหม่", "Super Admin", "Content Editor", "Content Publisher", "Support Agent"]);
    expect(texts2.map(t => t.trim())).not.toContain("Moderator");
    await page.locator(`div[data-custom-select]:has(> #admin-account-change-role) [data-custom-select-trigger]`).click();
    await page.waitForTimeout(150);
    await clickCancel(page);
  });

  test("5. เหตุผลการเปลี่ยน Role = custom select มี placeholder 'เลือกเหตุผล' + 4 ตัวเลือก", async ({ page }) => {
    await openChangeRoleModalFromList(page, "ADM-001");
    await page.locator(`div[data-custom-select]:has(> #admin-account-change-role-reason) [data-custom-select-trigger]`).click();
    await page.waitForTimeout(150);
    const options = page.locator(`div[data-custom-select]:has(> #admin-account-change-role-reason) [data-custom-select-option]`);
    await expect(options).toHaveCount(5);
    const texts = await options.allTextContents();
    expect(texts.map(t => t.trim())).toEqual([
      "เลือกเหตุผล",
      "ย้ายทีม / เปลี่ยนหน้าที่งาน",
      "ได้รับอนุมัติจากผู้บริหาร",
      "ปรับ scope ความรับผิดชอบตามโครงสร้างใหม่",
      "คำขอจากผู้บริหาร/HR"
    ]);
    // placeholder "" เป็นค่า default → trigger แสดง 'เลือกเหตุผล' + hidden input ว่าง (ตาม pattern action modal)
    expect(await page.locator("#admin-account-change-role-reason").inputValue()).toBe("");
    await expect(
      page.locator('div[data-custom-select]:has(> #admin-account-change-role-reason) [data-custom-select-label]')
    ).toHaveText("เลือกเหตุผล");
    await page.locator(`div[data-custom-select]:has(> #admin-account-change-role-reason) [data-custom-select-trigger]`).click();
    await page.waitForTimeout(150);
    await clickCancel(page);
  });

  test("6. Note = textarea ไม่บังคับ — มี placeholder และ confirm ได้โดยไม่กรอก", async ({ page }) => {
    await openChangeRoleModalFromList(page, "ADM-002");
    const note = page.locator("#admin-account-change-role-note");
    await expect(note).toBeVisible();
    await expect(note).toHaveAttribute("placeholder", "สรุปเหตุผลและข้อมูลอ้างอิงที่เกี่ยวข้องกับการเปลี่ยน Role");
    // ไม่กรอก note — เลือก role + reason อย่างเดียว → confirm ผ่าน
    await pickRole(page, "Moderator");
    await pickReason(page, "ย้ายทีม / เปลี่ยนหน้าที่งาน");
    await clickConfirm(page);
    expect(await accountRole(page, "ADM-002")).toBe("Moderator");
    await expect(page.locator("#success-toast")).toBeVisible();
  });

  test("7. diff 'เปลี่ยนสิทธิ: <เดิม> → <ใหม่>' อัปเดตตาม role ที่เลือก", async ({ page }) => {
    // ADM-001 (Super Admin) — role select default = placeholder "" → diff เริ่มต้นแสดง '—'
    await openChangeRoleModalFromList(page, "ADM-001");
    const diff = page.locator("[data-admin-role-diff]");
    await expect(diff).toHaveAttribute("data-admin-role-from", "Super Admin");
    await expect(diff).toHaveText("Super Admin → —");
    // เลือก Moderator → diff อัปเดต
    await pickRole(page, "Moderator");
    await expect(diff).toHaveText("Super Admin → Moderator");
    // เลือก Support Agent → diff อัปเดตอีกครั้ง
    await pickRole(page, "Support Agent");
    await expect(diff).toHaveText("Super Admin → Support Agent");
    await clickCancel(page);
  });

  test("8. validation: ไม่เลือก role → error 'กรุณาเลือก role ใหม่ที่ต่างจากปัจจุบัน' + role ไม่เปลี่ยน", async ({ page }) => {
    // เลือก reason อย่างเดียว (role ค้างเป็น placeholder "") → confirm → role error เดียว
    await openChangeRoleModalFromList(page, "ADM-001");
    await pickReason(page, "ย้ายทีม / เปลี่ยนหน้าที่งาน");
    await clickConfirm(page);
    const roleError = page.locator("[data-admin-change-role-role-error]");
    await expect(roleError).toHaveText("กรุณาเลือก role ใหม่ที่ต่างจากปัจจุบัน");
    await expect(roleError).toHaveClass(/show/);
    // reason error ไม่แสดง (เลือกแล้ว) + modal ยังเปิด + role ไม่เปลี่ยน
    await expect(page.locator("[data-admin-change-role-reason-error]")).not.toHaveClass(/show/);
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    expect(await accountRole(page, "ADM-001")).toBe("Super Admin");
    // เลือก role แล้ว confirm → ผ่าน role เปลี่ยน audit ใช้ค่าที่เลือก
    await pickRole(page, "Moderator");
    await clickConfirm(page);
    expect(await accountRole(page, "ADM-001")).toBe("Moderator");
    await expect(page.locator("#success-toast")).toBeVisible();
  });

  test("9. validation: เลือก role เดิม → error 'กรุณาเลือก role ใหม่ที่ต่างจากปัจจุบัน'", async ({ page }) => {
    // ตัวเลือก role เดิมถูกกรองออกจาก dropdown แล้ว → force hidden input = role เดิมเพื่อครอบ error branch
    await openChangeRoleModalFromList(page, "ADM-001");
    await pickReason(page, "คำขอจากผู้บริหาร/HR");
    await page.evaluate(() => { document.querySelector("#admin-account-change-role").value = "Super Admin"; });
    await clickConfirm(page);
    const roleError = page.locator("[data-admin-change-role-role-error]");
    await expect(roleError).toHaveText("กรุณาเลือก role ใหม่ที่ต่างจากปัจจุบัน");
    await expect(roleError).toHaveClass(/show/);
    expect(await accountRole(page, "ADM-001")).toBe("Super Admin");
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
  });

  test("10. validation: ไม่เลือกเหตุผล → error 'กรุณาระบุเหตุผลการเปลี่ยน Role' + role ไม่เปลี่ยน", async ({ page }) => {
    // เลือก role อย่างเดียว (reason ค้างเป็น placeholder "") → confirm → reason error เดียว
    await openChangeRoleModalFromList(page, "ADM-001");
    await pickRole(page, "Moderator");
    await clickConfirm(page);
    const reasonError = page.locator("[data-admin-change-role-reason-error]");
    await expect(reasonError).toHaveText("กรุณาระบุเหตุผลการเปลี่ยน Role");
    await expect(reasonError).toHaveClass(/show/);
    // role error ไม่แสดง (เลือก role แล้ว) + role ไม่เปลี่ยน + modal ยังเปิด
    await expect(page.locator("[data-admin-change-role-role-error]")).not.toHaveClass(/show/);
    expect(await accountRole(page, "ADM-001")).toBe("Super Admin");
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    // เลือก reason แล้ว confirm → ผ่าน role เปลี่ยน
    await pickReason(page, "ได้รับอนุมัติจากผู้บริหาร");
    await clickConfirm(page);
    expect(await accountRole(page, "ADM-001")).toBe("Moderator");
    await expect(page.locator("#success-toast")).toBeVisible();
  });

  test("11. validation: ไม่เลือกทั้ง role + เหตุผล → error แสดงครบทั้ง 2 ฟิลด์", async ({ page }) => {
    // ไม่เลือกอะไรเลย (ทั้งคู่ค้างเป็น placeholder "") → confirm → error ทั้ง 2 ฟิลด์
    await openChangeRoleModalFromList(page, "ADM-001");
    await clickConfirm(page);
    await expect(page.locator("[data-admin-change-role-role-error]")).toHaveText("กรุณาเลือก role ใหม่ที่ต่างจากปัจจุบัน");
    await expect(page.locator("[data-admin-change-role-role-error]")).toHaveClass(/show/);
    await expect(page.locator("[data-admin-change-role-reason-error]")).toHaveText("กรุณาระบุเหตุผลการเปลี่ยน Role");
    await expect(page.locator("[data-admin-change-role-reason-error]")).toHaveClass(/show/);
    expect(await accountRole(page, "ADM-001")).toBe("Super Admin");
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
  });

  test("12. confirm → role เปลี่ยน + lastAction + activity history + audit (Change Admin Role) + toast + re-render", async ({ page }) => {
    // ADM-003 (Moderator) → Support Agent พร้อม reason + note — จาก list
    await openChangeRoleModalFromList(page, "ADM-003");
    await pickRole(page, "Support Agent");
    await pickReason(page, "ได้รับอนุมัติจากผู้บริหาร");
    await page.locator("#admin-account-change-role-note").fill("อนุมัติจากผู้บริหารเมตตา");
    await clickConfirm(page);

    // role เปลี่ยน + lastAction อัปเดต
    expect(await accountRole(page, "ADM-003")).toBe("Support Agent");
    const lastAction = await page.evaluate(() => adminAccountData.accounts.find(a => a.id === "ADM-003").lastAction);
    expect(lastAction).toBe("Change Role โดย ผู้ดูแลระบบ — Moderator → Support Agent");

    // modal ปิด + toast + อยู่ใน list mode (re-render)
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    await expect(page.locator("#success-toast")).toBeVisible();
    await expect(page.locator("#success-toast")).toContainText("มะลิ จันทร์ดี เปลี่ยน role เป็น Support Agent แล้ว — สิทธิใหม่มีผลใน request ถัดไป");
    await expect(page.locator("body")).toHaveClass(/admin-account-list-mode/);

    // audit event ล่าสุด = Change Admin Role + before/after = role เดิม→ใหม่
    const auditInfo = await page.evaluate(() => {
      const ev = auditLogData.events[0];
      return ev ? { id: ev.id, action: ev.action, module: ev.module, risk: ev.risk, reference: ev.reference, before: ev.before, after: ev.after, reason: ev.reason } : null;
    });
    expect(auditInfo).not.toBeNull();
    expect(auditInfo.action).toBe("Change Admin Role");
    expect(auditInfo.module).toBe("Settings");
    expect(auditInfo.risk).toBe("สูง");
    expect(auditInfo.reference).toBe("ADM-003");
    expect(auditInfo.before).toBe("Moderator");
    expect(auditInfo.after).toBe("Support Agent");
    expect(auditInfo.reason).toBe("ได้รับอนุมัติจากผู้บริหาร");

    // activity history เพิ่ม row ล่าสุด + auditRef เชื่อม audit event
    const history = await page.evaluate(() => {
      const d = adminAccountData.detail["ADM-003"] || {};
      return {
        action: d.activity && d.activity[0] ? d.activity[0].action : null,
        note: d.activity && d.activity[0] ? d.activity[0].note : null,
        auditRef: d.auditRefs && d.auditRefs[0] ? d.auditRefs[0] : null
      };
    });
    expect(history.action).toBe("Change Role");
    expect(history.note).toContain("Moderator → Support Agent");
    expect(history.note).toContain("ได้รับอนุมัติจากผู้บริหาร");
    expect(history.note).toContain("หมายเหตุ: อนุมัติจากผู้บริหารเมตตา");
    expect(history.auditRef).toBe(auditInfo.id);
  });

  test("13. confirm จาก detail → role pill ใน detail head + Role & Permissions matrix เปลี่ยนตาม role ใหม่", async ({ page }) => {
    // ADM-003 (Moderator — matrix 7 rows) → Support Agent (matrix 5 rows) จาก detail
    await openChangeRoleFromDetail(page, "ADM-003");
    await pickRole(page, "Support Agent");
    await pickReason(page, "ย้ายทีม / เปลี่ยนหน้าที่งาน");
    await clickConfirm(page);

    // ยังอยู่ใน detail mode (re-render detail)
    await expect(page.locator("body")).toHaveClass(/admin-account-detail-mode/);
    // detail head role pill อัปเดตเป็น Support Agent (gray)
    const head = page.locator(".admin-account-detail-page .user-detail-head");
    await expect(head.locator(".chips .pill.gray")).toHaveText("Support Agent");
    // matrix เปลี่ยนตาม role ใหม่ — Support Agent เห็น 5 เมนู (ไม่มีเมนูที่เป็น none)
    const matrix = page.locator(".admin-menu-matrix tbody tr");
    await expect(matrix).toHaveCount(5);
    const menuCells = await matrix.locator('td[data-label="เมนู"]').allTextContents();
    expect(menuCells.map(t => t.trim())).toEqual([
      "Dashboard", "Market Data", "Market Demand", "Account Deletion", "Settings & Audit Log"
    ]);

    // กลับไป list → role pill ของ row อัปเดตเป็น Support Agent (gray)
    await page.locator("[data-admin-account-back]").click();
    await page.waitForTimeout(300);
    const rolePill = accountRow(page, "ADM-003").locator('[data-label="Role"] .pill');
    await expect(rolePill).toHaveClass(/\bgray\b/);
    await expect(rolePill).toHaveText("Support Agent");
  });

  test("14. cancel ปิด modal ไม่เปลี่ยน role", async ({ page }) => {
    await openChangeRoleModalFromList(page, "ADM-001");
    // เลือก role อื่นไว้ก่อน แล้ว cancel — ต้องไม่มีผล
    await pickRole(page, "Moderator");
    await clickCancel(page);
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    expect(await accountRole(page, "ADM-001")).toBe("Super Admin");
    // role pill ใน list ยังเป็น Super Admin (purple)
    const rolePill = accountRow(page, "ADM-001").locator('[data-label="Role"] .pill');
    await expect(rolePill).toHaveClass(/\bpurple\b/);
    await expect(rolePill).toHaveText("Super Admin");
  });

  test("15. master admin (ADM-010) → ไม่มีปุ่มเปลี่ยน Role ทั้ง row menu และ detail", async ({ page }) => {
    await goToAdminAccounts(page);
    // row menu ของ master มีแค่ 'ดูรายละเอียด'
    const row = accountRow(page, "ADM-010");
    await row.locator(".row-menu > summary").click();
    await page.waitForTimeout(300);
    const texts = await row.locator(".row-menu-list button").allTextContents().then(ts => ts.map(t => t.trim()));
    expect(texts).toEqual(["ดูรายละเอียด"]);
    await expect(row.locator('[data-admin-account-change-role="ADM-010"]')).toHaveCount(0);
    // detail ของ master ไม่มีปุ่มเปลี่ยน Role (ไม่มี action ใด ๆ เพราะ self + master)
    await page.locator(`.admin-account-row[data-admin-account-card="ADM-010"] .user-cell-primary[data-label="Admin ID"]`).click();
    await page.waitForTimeout(300);
    await expect(page.locator('.user-detail-actions [data-admin-account-change-role="ADM-010"]')).toHaveCount(0);
    await expect(page.locator(".user-detail-actions button")).toHaveCount(0);
  });

  test("16. archived account (ADM-009) → ไม่มีปุ่มเปลี่ยน Role ทั้ง row menu และ detail", async ({ page }) => {
    await goToAdminAccounts(page);
    const row = accountRow(page, "ADM-009");
    await row.locator(".row-menu > summary").click();
    await page.waitForTimeout(300);
    const texts = await row.locator(".row-menu-list button").allTextContents().then(ts => ts.map(t => t.trim()));
    expect(texts).toEqual(["ดูรายละเอียด"]);
    await expect(row.locator('[data-admin-account-change-role="ADM-009"]')).toHaveCount(0);
    // detail ของ archived ไม่มีปุ่มเปลี่ยน Role (ไม่มี action ใด ๆ)
    await page.locator(`.admin-account-row[data-admin-account-card="ADM-009"] .user-cell-primary[data-label="Admin ID"]`).click();
    await page.waitForTimeout(300);
    await expect(page.locator('.user-detail-actions [data-admin-account-change-role="ADM-009"]')).toHaveCount(0);
    await expect(page.locator(".user-detail-actions button")).toHaveCount(0);
  });

  test("16b. suspended/locked (ADM-006, ADM-007) → ไม่มีปุ่มเปลี่ยน Role ใน row menu", async ({ page }) => {
    // canChangeRoleAdmin อนุญาตเฉพาะ Active/Invited — Suspended/Locked ไม่มีปุ่ม
    await goToAdminAccounts(page);
    for (const id of ["ADM-006", "ADM-007"]) {
      const row = accountRow(page, id);
      await row.locator(".row-menu > summary").click();
      await page.waitForTimeout(300);
      await expect(row.locator(`[data-admin-account-change-role="${id}"]`)).toHaveCount(0);
      // ปิด menu ก่อนไป row ถัดไป
      await row.locator(".row-menu > summary").click();
      await page.waitForTimeout(200);
    }
  });

  test("17. mobile (≤760px): change role modal เปิดได้จาก row menu + confirm ได้", async ({ page }) => {
    const mobile = await isMobile(page);
    if (!mobile) { test.skip(); return; }
    await openChangeRoleModalFromList(page, "ADM-004");
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    await expect(page.locator("#user-action-modal-title")).toHaveText("Change Role");
    await pickRole(page, "Moderator");
    await pickReason(page, "ปรับ scope ความรับผิดชอบตามโครงสร้างใหม่");
    await clickConfirm(page);
    expect(await accountRole(page, "ADM-004")).toBe("Moderator");
    await expect(page.locator("#success-toast")).toBeVisible();
  });
});
