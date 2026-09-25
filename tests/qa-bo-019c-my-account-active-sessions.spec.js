// QA-BO-019c: My Account — Active Sessions (AIL-022) — self-only session list + per-session revoke
// อ้างอิง spec 16_ADMIN_SETTINGS_MODULE §7/§10 + prototype เป็นหลักสำหรับการแสดงผล
// scope: Active Sessions section, current-session marker, masked metadata (device/browser/location/IP/last active),
//        per-session revoke (ยกเว้น current — Logout All Devices = AIL-023a), audit ADMIN_SESSION_REVOKE
//        (ห้ามลง token/credential/full IP), sessionRevision linkage กับ Change Password (AIL-021)
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

const SELF = {
  id: "ADM-010",
  name: "ผู้ดูแลระบบ",
  role: "Super Admin"
};

const MOCK_PASSWORD = "tukdaeng-admin";
const NEW_PASSWORD = "TukDaeng!2026xyz"; // ผ่าน policy — ใช้ทดสอบ sessionRevision linkage

const CURRENT_SESSION_ID = "SES-90001";
const OTHER_SESSION_IDS = ["SES-90002", "SES-90003"];

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

// helper: ไปหน้า My Account ผ่าน sidebar profile footer (.admin-box)
async function goToMyAccount(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  await page.locator("#my-account-entry").click();
  await page.waitForTimeout(300);
}

async function auditEventCount(page) {
  return page.evaluate(() => auditLogData.events.length);
}

async function selfAccount(page) {
  return page.evaluate(() => adminAccountData.accounts.find(a => a.id === "ADM-010"));
}

function sessionRows(page) {
  return page.locator("[data-my-account-session]");
}

function sessionRow(page, id) {
  return page.locator(`[data-my-account-session='${id}']`);
}

// ==================== A. SECTION & SESSION LIST RENDERING ====================

test.describe("QA-BO-019c: Active Sessions — section & list rendering", () => {

  test("1. Active Sessions section แสดงบนหน้า My Account (heading + note + session list)", async ({ page }) => {
    await goToMyAccount(page);
    const section = page.locator("[data-my-account-section='sessions']");
    await expect(section).toBeVisible();
    await expect(section.locator("h4")).toHaveText("Active Sessions");
    await expect(section.locator("p.muted")).toContainText("อุปกรณ์ที่เข้าสู่ระบบบัญชีของคุณ");
    await expect(section.locator("[data-my-account-session-list]")).toBeVisible();
  });

  test("2. current session แสดงแถวแรก + pill 'อุปกรณ์นี้' + 'กำลังใช้งาน' + ไม่มีปุ่มออกจากระบบ", async ({ page }) => {
    await goToMyAccount(page);
    const rows = sessionRows(page);
    expect(await rows.count()).toBe(3);
    // current session ขึ้นแถวแรกเสมอ
    await expect(rows.first()).toHaveAttribute("data-my-account-session", CURRENT_SESSION_ID);
    const current = sessionRow(page, CURRENT_SESSION_ID);
    await expect(current.locator(".pill")).toHaveText("อุปกรณ์นี้");
    await expect(current).toContainText("กำลังใช้งาน");
    expect(await current.locator("[data-my-account-action='revoke-session']").count()).toBe(0);
  });

  test("3. session อื่นแสดง metadata ครบ (device·browser / location / masked IP / last active) + ปุ่มออกจากระบบ", async ({ page }) => {
    await goToMyAccount(page);
    const row = sessionRow(page, "SES-90002");
    await expect(row.locator(".my-account-session-title strong")).toContainText("iPhone 15 Pro · Safari");
    await expect(row).toContainText("กรุงเทพมหานคร, ประเทศไทย");
    await expect(row).toContainText("IP 171.96.34.xx");
    await expect(row).toContainText("ใช้งานล่าสุด 09 Sep 2026 08:47");
    await expect(row.locator("[data-my-account-action='revoke-session']")).toBeVisible();
    await expect(row.locator("[data-my-account-action='revoke-session']")).toHaveText("ออกจากระบบ");
  });

  test("4. IP ทุก session ถูก mask (มี .xx) — ไม่ render full IPv4 บนหน้า", async ({ page }) => {
    await goToMyAccount(page);
    const content = await page.locator("[data-my-account-section='sessions']").innerText();
    // ทุก IP ใน section ต้องมี mask marker
    expect(content).toContain("203.150.98.xx");
    // ไม่มี IPv4 เต็ม 4 octet ตัวเลขหลุดมา (เช่น 203.150.98.10)
    expect(content).not.toMatch(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?!\.)/);
  });

  test("5. ไม่มี session secret/token หลุดบน DOM (render เฉพาะ metadata ที่ mask แล้ว)", async ({ page }) => {
    await goToMyAccount(page);
    const html = await page.locator("[data-my-account-section='sessions']").innerHTML();
    expect(html).not.toMatch(/token|secret|credential|password/i);
  });
});

// ==================== B. REVOKE MODAL — OPEN / CANCEL / CONFIRM ====================

test.describe("QA-BO-019c: Active Sessions — revoke modal flow", () => {

  test("6. กด ออกจากระบบ → confirm modal เปิดพร้อม session summary + impact warning + ปุ่ม footer", async ({ page }) => {
    await goToMyAccount(page);
    await sessionRow(page, "SES-90002").locator("[data-my-account-action='revoke-session']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    await expect(page.locator(".my-account-session-modal")).toBeVisible();
    const modal = page.locator("#user-action-modal-body");
    await expect(modal.locator("#user-action-modal-title")).toHaveText("Revoke Session");
    await expect(modal.locator(".user-action-target")).toContainText("iPhone 15 Pro · Safari");
    await expect(modal.locator(".user-action-target")).toContainText("IP 171.96.34.xx");
    await expect(modal.locator(".user-action-impact-warning")).toContainText("ถูกออกจากระบบทันที");
    await expect(modal.locator("[data-my-account-action='cancel-revoke-session']")).toBeVisible();
    await expect(modal.locator("[data-my-account-action='confirm-revoke-session']")).toBeVisible();
  });

  test("7. กด ยกเลิก → modal ปิด + session ยัง Active + ไม่สร้าง audit", async ({ page }) => {
    await goToMyAccount(page);
    const before = await auditEventCount(page);
    await sessionRow(page, "SES-90002").locator("[data-my-account-action='revoke-session']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-my-account-action='cancel-revoke-session']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    const session = await page.evaluate(() => adminSessionData["ADM-010"].sessions.find(s => s.id === "SES-90002"));
    expect(session.status).toBe("Active");
    expect(await sessionRow(page, "SES-90002").count()).toBe(1);
    expect(await auditEventCount(page)).toBe(before);
  });

  test("8. ยืนยัน revoke → session หลุดจาก list + status=Revoked + success toast", async ({ page }) => {
    await goToMyAccount(page);
    await sessionRow(page, "SES-90002").locator("[data-my-account-action='revoke-session']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-my-account-action='confirm-revoke-session']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    await expect(page.locator("#success-toast")).toHaveClass(/show/);
    await expect(page.locator("#success-toast")).toContainText("ออกจากระบบ iPhone 15 Pro");
    // list re-render: เหลือ 2 แถว (current + iPad)
    expect(await sessionRows(page).count()).toBe(2);
    expect(await sessionRow(page, "SES-90002").count()).toBe(0);
    const session = await page.evaluate(() => adminSessionData["ADM-010"].sessions.find(s => s.id === "SES-90002"));
    expect(session.status).toBe("Revoked");
    expect(session.revokedReason).toContain("ผู้ใช้");
  });

  test("9. revoke ครบทุก session อื่น → เหลือเฉพาะ current session", async ({ page }) => {
    await goToMyAccount(page);
    for (const id of OTHER_SESSION_IDS) {
      await sessionRow(page, id).locator("[data-my-account-action='revoke-session']").click();
      await page.waitForTimeout(200);
      await page.locator("[data-my-account-action='confirm-revoke-session']").click();
      await page.waitForTimeout(300);
    }
    expect(await sessionRows(page).count()).toBe(1);
    await expect(sessionRow(page, CURRENT_SESSION_ID).locator(".pill")).toHaveText("อุปกรณ์นี้");
  });
});

// ==================== C. AUDIT — ADMIN_SESSION_REVOKE ====================

test.describe("QA-BO-019c: Active Sessions — audit", () => {

  test("10. revoke สำเร็จ → audit ADMIN_SESSION_REVOKE พอดี 1 event (module My Account, risk Medium)", async ({ page }) => {
    await goToMyAccount(page);
    const before = await auditEventCount(page);
    await sessionRow(page, "SES-90002").locator("[data-my-account-action='revoke-session']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-my-account-action='confirm-revoke-session']").click();
    await page.waitForTimeout(300);
    expect(await auditEventCount(page)).toBe(before + 1);
    const evt = await page.evaluate(() => auditLogData.events[0]);
    expect(evt.eventType).toBe("ADMIN_SESSION_REVOKE");
    expect(evt.action).toBe("Revoke Session");
    expect(evt.module).toBe("My Account");
    expect(evt.risk).toBe("Medium");
    expect(evt.reference).toBe(SELF.id);
    expect(evt.targetAdminId).toBe(SELF.id);
    expect(evt.result).toBe("Success");
    expect(evt.id).toMatch(/^AUD-\d{5}$/);
    expect(evt.before).toContain("SES-90002");
    expect(evt.after).toBe("Session revoked");
  });

  test("11. audit ไม่ลงข้อมูลลับ — ไม่มี password/token/full IP (masked IP เท่านั้น)", async ({ page }) => {
    await goToMyAccount(page);
    await sessionRow(page, "SES-90003").locator("[data-my-account-action='revoke-session']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-my-account-action='confirm-revoke-session']").click();
    await page.waitForTimeout(300);
    const evt = await page.evaluate(() => auditLogData.events[0]);
    const serialized = JSON.stringify(evt);
    expect(serialized).not.toContain(MOCK_PASSWORD);
    expect(serialized).not.toMatch(/token|secret|credential/i);
    // note มี IP masked แต่ห้ามมี octet ที่ 4 เป็นตัวเลข (full IP)
    expect(evt.note).toContain("49.228.71.xx");
    expect(serialized).not.toMatch(/49\.228\.71\.\d/);
  });
});

// ==================== D. BOUNDARY — SELF-ONLY / ACTIVE / STALE / CURRENT ====================

test.describe("QA-BO-019c: Active Sessions — boundary checks", () => {

  test("12. stale commit: account revision เปลี่ยนระหว่างเปิด modal → reject + error toast + session คงอยู่", async ({ page }) => {
    await goToMyAccount(page);
    const before = await auditEventCount(page);
    await sessionRow(page, "SES-90002").locator("[data-my-account-action='revoke-session']").click();
    await page.waitForTimeout(200);
    // จำลอง concurrent write — revision bump หลังเปิด modal
    await page.evaluate(() => {
      const acc = adminAccountData.accounts.find(a => a.id === "ADM-010");
      acc.revision = (acc.revision || 0) + 1;
    });
    await page.locator("[data-my-account-action='confirm-revoke-session']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    await expect(page.locator("#success-toast")).toHaveClass(/error/);
    await expect(page.locator("#success-toast")).toContainText("ไม่ตรงกัน");
    const session = await page.evaluate(() => adminSessionData["ADM-010"].sessions.find(s => s.id === "SES-90002"));
    expect(session.status).toBe("Active");
    expect(await auditEventCount(page)).toBe(before);
  });

  test("13. session ถูก revoke ไปแล้วระหว่างเปิด modal → warning toast + ไม่ commit ซ้ำ + ไม่สร้าง audit", async ({ page }) => {
    await goToMyAccount(page);
    const before = await auditEventCount(page);
    await sessionRow(page, "SES-90002").locator("[data-my-account-action='revoke-session']").click();
    await page.waitForTimeout(200);
    // จำลอง session หมดอายุ/revoked จาก channel อื่นก่อนกดยืนยัน
    await page.evaluate(() => {
      adminSessionData["ADM-010"].sessions.find(s => s.id === "SES-90002").status = "Revoked";
    });
    await page.locator("[data-my-account-action='confirm-revoke-session']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    await expect(page.locator("#success-toast")).toHaveClass(/warning/);
    await expect(page.locator("#success-toast")).toContainText("ถูกออกจากระบบแล้ว");
    // list refresh: แถวหลุดออก
    expect(await sessionRow(page, "SES-90002").count()).toBe(0);
    expect(await auditEventCount(page)).toBe(before);
  });

  test("14. current session revoke ผ่าน function ตรง ๆ → reject (ไม่เปิด modal) + warning toast", async ({ page }) => {
    await goToMyAccount(page);
    const before = await auditEventCount(page);
    await page.evaluate(() => openMyAccountSessionRevokeModal("SES-90001"));
    await page.waitForTimeout(200);
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    await expect(page.locator("#success-toast")).toHaveClass(/warning/);
    const session = await page.evaluate(() => adminSessionData["ADM-010"].sessions.find(s => s.id === "SES-90001"));
    expect(session.status).toBe("Active");
    expect(await auditEventCount(page)).toBe(before);
  });

  test("15. self account ไม่ใช่ Active ระหว่างเปิด modal → confirm reject + session คงอยู่", async ({ page }) => {
    await goToMyAccount(page);
    const before = await auditEventCount(page);
    await sessionRow(page, "SES-90002").locator("[data-my-account-action='revoke-session']").click();
    await page.waitForTimeout(200);
    // จำลอง self ถูก Suspend ระหว่างเปิด modal (contract §8.1: suspend → sessions cancelled)
    await page.evaluate(() => {
      adminAccountData.accounts.find(a => a.id === "ADM-010").status = "Suspended";
    });
    await page.locator("[data-my-account-action='confirm-revoke-session']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    await expect(page.locator("#success-toast")).toHaveClass(/error/);
    // session ไม่ถูก commit ผ่าน flow นี้ (ยัง Active ใน registry — หน้า re-render เป็น session-expired gate)
    const session = await page.evaluate(() => adminSessionData["ADM-010"].sessions.find(s => s.id === "SES-90002"));
    expect(session.status).toBe("Active");
    expect(await auditEventCount(page)).toBe(before);
    // restore — กันกระทบ evaluate-based test อื่นใน page เดียวกัน (ปกติแต่ละ test reload ใหม่)
    await page.evaluate(() => {
      adminAccountData.accounts.find(a => a.id === "ADM-010").status = "Active";
    });
  });

  test("16. self-only: auth.admin.accountId ชี้ account อื่น → confirm ไม่ commit (identity resolve จาก auth เท่านั้น)", async ({ page }) => {
    await goToMyAccount(page);
    const before = await auditEventCount(page);
    await sessionRow(page, "SES-90002").locator("[data-my-account-action='revoke-session']").click();
    await page.waitForTimeout(200);
    await page.evaluate(() => { auth.admin.accountId = "ADM-001"; });
    await page.locator("[data-my-account-action='confirm-revoke-session']").click();
    await page.waitForTimeout(300);
    const session = await page.evaluate(() => adminSessionData["ADM-010"].sessions.find(s => s.id === "SES-90002"));
    expect(session.status).toBe("Active");
    expect(await auditEventCount(page)).toBe(before);
    await page.evaluate(() => { auth.admin.accountId = "ADM-010"; });
  });
});

// ==================== E. SESSION REVISION LINKAGE — CHANGE PASSWORD ====================

test.describe("QA-BO-019c: Active Sessions — sessionRevision linkage", () => {

  test("17. เปลี่ยนรหัสผ่านสำเร็จ → sessionRevision bump → session อื่นหลุดจาก list เหลือแค่ current", async ({ page }) => {
    await goToMyAccount(page);
    // ก่อนเปลี่ยน: 3 sessions
    expect(await sessionRows(page).count()).toBe(3);
    await page.locator("[data-my-account-action='change-password']").click();
    await page.waitForTimeout(200);
    await page.locator("#my-account-pw-current").fill(MOCK_PASSWORD);
    await page.locator("#my-account-pw-new").fill(NEW_PASSWORD);
    await page.locator("#my-account-pw-confirm").fill(NEW_PASSWORD);
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#success-toast")).toHaveClass(/show/);
    // page re-render: เหลือเฉพาะ current session (sessionRevision epoch เปลี่ยน → อื่นหมดอายุ)
    expect(await sessionRows(page).count()).toBe(1);
    await expect(sessionRow(page, CURRENT_SESSION_ID).locator(".pill")).toHaveText("อุปกรณ์นี้");
    // status ใน registry ยัง Active แต่ถูก invalid ด้วย epoch — ไม่ render ใน list
    const session = await page.evaluate(() => adminSessionData["ADM-010"].sessions.find(s => s.id === "SES-90002"));
    expect(session.status).toBe("Active");
  });

  test("18. sessionRevision bump จากอุปกรณ์อื่น → current session stale → session-expired gate (AIL-023b uniform epoch)", async ({ page }) => {
    await goToMyAccount(page);
    // จำลอง epoch เปลี่ยนจาก context อื่น (เช่น password ถูกเปลี่ยนบน device อื่น)
    // + session ใหม่ที่สร้างภายใต้ epoch 99 — current session ของเครื่องนี้ (epoch 0) stale ทันที
    await page.evaluate(() => {
      const acc = adminAccountData.accounts.find(a => a.id === "ADM-010");
      acc.sessionRevision = 99;
      adminSessionData["ADM-010"].sessions.push({
        id: "SES-90099", deviceType: "desktop", device: "MacBook Air", browser: "Firefox",
        location: "ขอนแก่น, ประเทศไทย", ipMasked: "184.22.10.xx",
        signedInAt: "09 Sep 2026 10:00", lastActiveAt: "09 Sep 2026 10:30",
        sessionRevision: 99, status: "Active"
      });
      renderMyAccountPage();
    });
    await page.waitForTimeout(200);
    // current session stale → gate เต็มหน้า ใช้งานต่อไม่ได้ (session list ไม่ render)
    await expect(page.locator("[data-my-account-state='session-expired']")).toBeVisible();
    expect(await sessionRows(page).count()).toBe(0);
    // re-login → ระบบออก session ใหม่ภายใต้ epoch 99 → ใช้งานได้ + session epoch ปัจจุบันไม่หลุด
    await page.locator("[data-my-account-action='return-login']").click();
    await page.waitForTimeout(400);
    await loginIfNeeded(page);
    await ensureNavOpen(page);
    await page.locator("#my-account-entry").click();
    await page.waitForTimeout(300);
    expect(await sessionRows(page).count()).toBe(2);
    await expect(sessionRow(page, "SES-90099")).toBeVisible();
    await expect(sessionRow(page, "SES-90099").locator("[data-my-account-action='revoke-session']")).toBeVisible();
  });
});

// ==================== F. RESPONSIVE & REGRESSION ====================

test.describe("QA-BO-019c: Active Sessions — responsive & regression", () => {

  test("19. responsive: session rows + revoke action render/ใช้งานได้ทุก viewport", async ({ page }) => {
    await goToMyAccount(page);
    const section = page.locator("[data-my-account-section='sessions']");
    await expect(section).toBeVisible();
    // ทุกแถว visible และ revoke button ของ session อื่นใช้งานได้
    for (const id of OTHER_SESSION_IDS) {
      await expect(sessionRow(page, id)).toBeVisible();
      await expect(sessionRow(page, id).locator("[data-my-account-action='revoke-session']")).toBeVisible();
    }
    // flow ครบบน viewport ปัจจุบัน — open → confirm → row หลุด
    await sessionRow(page, "SES-90002").locator("[data-my-account-action='revoke-session']").click();
    await page.waitForTimeout(200);
    await expect(page.locator(".my-account-session-modal")).toBeVisible();
    await page.locator("[data-my-account-action='confirm-revoke-session']").click();
    await page.waitForTimeout(300);
    expect(await sessionRow(page, "SES-90002").count()).toBe(0);
  });

  test("20. regression: Edit Name + Change Password + scenario tools ยังทำงานหลังเพิ่ม section", async ({ page }) => {
    await goToMyAccount(page);
    // Edit Name flow ไม่แตก
    await page.locator("[data-my-account-action='edit-name']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#my-account-name")).toBeVisible();
    await page.locator("[data-my-account-action='cancel-name']").click();
    await page.waitForTimeout(200);
    // Change Password modal เปิดได้ปกติ
    await page.locator("[data-my-account-action='change-password']").click();
    await page.waitForTimeout(200);
    await expect(page.locator(".my-account-password-modal")).toBeVisible();
    await page.locator("[data-my-account-action='cancel-password']").click();
    await page.waitForTimeout(200);
    // scenario tools ยังอยู่ (loading/error/session-expired)
    await expect(page.locator("[data-my-account-state-tools]")).toBeVisible();
  });
});
