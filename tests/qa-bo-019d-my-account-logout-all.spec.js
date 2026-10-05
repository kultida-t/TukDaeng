// QA-BO-019d: My Account — Logout All Devices (AIL-023a) — revoke ทุก session รวม current → กลับ Login
// อ้างอิง spec 16_ADMIN_SETTINGS_MODULE §7/§10 + 01_AUTHENTICATION_MODULE §8/§13 + prototype เป็นหลักสำหรับการแสดงผล
// scope: ปุ่ม ออกจากระบบทุกอุปกรณ์ ท้าย Active Sessions section, confirmation modal (warning tone + impact note
//        รวม current session), revoke ทุก session → session teardown → กลับหน้า Login, lazy re-login session,
//        audit ADMIN_SESSION_REVOKE_ALL (aggregate, ไม่ลงข้อมูลลับ), boundary checks (self-only/Active/revision)
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

const SELF = {
  id: "ADM-010",
  name: "ผู้ดูแลระบบ",
  role: "Super Admin"
};

const MOCK_PASSWORD = "tukdaeng-admin";

const CURRENT_SESSION_ID = "SES-90001";
const ALL_SESSION_IDS = ["SES-90001", "SES-90002", "SES-90003"];

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

// helper: เปิด confirm modal ของ Logout All
async function openLogoutAllModal(page) {
  await page.locator("[data-my-account-action='logout-all']").click();
  await page.waitForTimeout(200);
}

async function auditEventCount(page) {
  return page.evaluate(() => auditLogData.events.length);
}

function sessionRows(page) {
  return page.locator("[data-my-account-session]");
}

function logoutAllButton(page) {
  return page.locator("[data-my-account-action='logout-all']");
}

// ==================== A. ENTRY — ปุ่มท้าย ACTIVE SESSIONS SECTION ====================

test.describe("QA-BO-019d: Logout All Devices — entry button", () => {

  test("1. ปุ่ม ออกจากระบบทุกอุปกรณ์ แสดงท้าย Active Sessions section หลัง session list (warning style)", async ({ page }) => {
    await goToMyAccount(page);
    const section = page.locator("[data-my-account-section='sessions']");
    const btn = logoutAllButton(page);
    await expect(btn).toBeVisible();
    await expect(btn).toHaveText("ออกจากระบบทุกอุปกรณ์");
    await expect(btn).toHaveClass(/warning/);
    // อยู่ใน sessions section และหลัง session list
    await expect(section.locator(".my-account-sessions-footer [data-my-account-action='logout-all']")).toHaveCount(1);
    const footerAfterList = await section.evaluate(el => {
      const list = el.querySelector("[data-my-account-session-list]");
      const footer = el.querySelector(".my-account-sessions-footer");
      return !!(list && footer && (list.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING));
    });
    expect(footerAfterList).toBe(true);
  });
});

// ==================== B. CONFIRM MODAL — OPEN / CANCEL ====================

test.describe("QA-BO-019d: Logout All Devices — confirm modal", () => {

  test("2. กดปุ่ม → confirm modal เปิดพร้อม session count + current device highlight + impact warning + footer", async ({ page }) => {
    await goToMyAccount(page);
    await openLogoutAllModal(page);
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    await expect(page.locator(".my-account-logout-all-modal-page")).toBeVisible();
    const modal = page.locator("#user-action-modal-body");
    await expect(modal.locator("#user-action-modal-title")).toHaveText("Logout All Devices");
    await expect(modal.locator(".user-action-target")).toContainText("3 sessions ที่ใช้งานอยู่");
    // current device ถูกไฮไลต์ชัดเจนใน target
    await expect(modal.locator(".user-action-target")).toContainText("อุปกรณ์นี้ · Windows PC · Chrome");
    await expect(modal.locator(".user-action-target")).toContainText("IP 203.150.98.xx");
    // impact note บอกชัดว่าเครื่องนี้หลุดด้วย + กลับหน้า Login
    const impact = modal.locator(".user-action-impact-warning");
    await expect(impact).toContainText("รวมเครื่องนี้");
    await expect(impact).toContainText("กลับไปหน้า Login");
    await expect(modal.locator("[data-my-account-action='cancel-logout-all']")).toBeVisible();
    await expect(modal.locator("[data-my-account-action='confirm-logout-all']")).toBeVisible();
  });

  test("3. กด ยกเลิก → modal ปิด + ทุก session ยัง Active + ไม่สร้าง audit + ไม่กลับหน้า Login", async ({ page }) => {
    await goToMyAccount(page);
    const before = await auditEventCount(page);
    await openLogoutAllModal(page);
    await page.locator("[data-my-account-action='cancel-logout-all']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    for (const id of ALL_SESSION_IDS) {
      const status = await page.evaluate(sid =>
        adminSessionData["ADM-010"].sessions.find(s => s.id === sid)?.status, id);
      expect(status).toBe("Active");
    }
    expect(await sessionRows(page).count()).toBe(3);
    expect(await auditEventCount(page)).toBe(before);
    await expect(page.locator("#login-screen")).not.toBeVisible();
  });
});

// ==================== C. CONFIRM → REVOKE ALL + SESSION TEARDOWN → LOGIN ====================

test.describe("QA-BO-019d: Logout All Devices — confirm & teardown", () => {

  test("4. ยืนยัน → ทุก session (รวม current) ถูก Revoked + กลับหน้า Login (ไม่มี toast ลอยทับ)", async ({ page }) => {
    await goToMyAccount(page);
    await openLogoutAllModal(page);
    await page.locator("[data-my-account-action='confirm-logout-all']").click();
    await page.waitForTimeout(400);
    // modal ปิด + teardown → login screen (logged-out)
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    await expect(page.locator("#login-screen")).toBeVisible();
    expect(await page.evaluate(() => document.body.classList.contains("logged-out"))).toBe(true);
    // ไม่แสดง success toast ทับหน้า Login — transition คือ feedback ของ flow อยู่แล้ว
    await expect(page.locator("#success-toast")).not.toHaveClass(/show/);
    // ทุก session ใน registry ถูก revoke พร้อม reason
    for (const id of ALL_SESSION_IDS) {
      const session = await page.evaluate(sid =>
        adminSessionData["ADM-010"].sessions.find(s => s.id === sid), id);
      expect(session.status).toBe("Revoked");
      expect(session.revokedReason).toContain("ทุกอุปกรณ์");
      expect(session.revokedAt).toBeTruthy();
    }
  });

  test("5. login ใหม่หลัง teardown → My Account แสดง current session ใหม่ (lazy issuance)", async ({ page }) => {
    await goToMyAccount(page);
    await openLogoutAllModal(page);
    await page.locator("[data-my-account-action='confirm-logout-all']").click();
    await page.waitForTimeout(400);
    // login อีกครั้ง → กลับเข้า My Account
    await loginIfNeeded(page);
    await ensureNavOpen(page);
    await page.locator("#my-account-entry").click();
    await page.waitForTimeout(300);
    // session ใหม่ถูกออกสำหรับ login ล่าสุด — แสดงเป็น current session
    const rows = sessionRows(page);
    expect(await rows.count()).toBe(1);
    const newSessionId = await page.evaluate(() => adminSessionData["ADM-010"].currentSessionId);
    expect(newSessionId).not.toBe(CURRENT_SESSION_ID);
    const row = page.locator(`[data-my-account-session='${newSessionId}']`);
    await expect(row.locator(".pill")).toHaveText("อุปกรณ์นี้");
    await expect(row).toContainText("กำลังใช้งาน");
    // session เก่าทั้งหมดยัง Revoked และไม่ render
    for (const id of ALL_SESSION_IDS) {
      expect(await page.locator(`[data-my-account-session='${id}']`).count()).toBe(0);
    }
  });
});

// ==================== D. AUDIT — ADMIN_SESSION_REVOKE_ALL ====================

test.describe("QA-BO-019d: Logout All Devices — audit", () => {

  test("6. ยืนยันสำเร็จ → audit ADMIN_SESSION_REVOKE_ALL พอดี 1 event (aggregate, module My Account, risk Medium)", async ({ page }) => {
    await goToMyAccount(page);
    const before = await auditEventCount(page);
    await openLogoutAllModal(page);
    await page.locator("[data-my-account-action='confirm-logout-all']").click();
    await page.waitForTimeout(400);
    expect(await auditEventCount(page)).toBe(before + 1);
    const evt = await page.evaluate(() => auditLogData.events[0]);
    expect(evt.eventType).toBe("ADMIN_SESSION_REVOKE_ALL");
    expect(evt.action).toBe("Logout All Devices");
    expect(evt.module).toBe("My Account");
    expect(evt.risk).toBe("Medium");
    expect(evt.reference).toBe(SELF.id);
    expect(evt.targetAdminId).toBe(SELF.id);
    expect(evt.result).toBe("Success");
    expect(evt.id).toMatch(/^AUD-\d{5}$/);
    expect(evt.before).toBe("3 active sessions (incl. current)");
    expect(evt.after).toBe("All sessions revoked");
    expect(evt.note).toContain("revoke 3 sessions รวม current session");
  });

  test("7. audit ไม่ลงข้อมูลลับ — ไม่มี password/token/secret/full IP", async ({ page }) => {
    await goToMyAccount(page);
    await openLogoutAllModal(page);
    await page.locator("[data-my-account-action='confirm-logout-all']").click();
    await page.waitForTimeout(400);
    const evt = await page.evaluate(() => auditLogData.events[0]);
    const serialized = JSON.stringify(evt);
    expect(serialized).not.toContain(MOCK_PASSWORD);
    expect(serialized).not.toMatch(/token|secret|credential/i);
    // ไม่มี IP เลยใน aggregate audit (ไม่ว่าจะ mask หรือเต็ม)
    expect(serialized).not.toMatch(/\d{1,3}\.\d{1,3}\.\d{1,3}/);
  });
});

// ==================== E. BOUNDARY — SELF-ONLY / ACTIVE / STALE ====================

test.describe("QA-BO-019d: Logout All Devices — boundary checks", () => {

  test("8. stale commit: revision เปลี่ยนระหว่างเปิด modal → reject + error toast + sessions คงอยู่ + ไม่กลับ Login", async ({ page }) => {
    await goToMyAccount(page);
    const before = await auditEventCount(page);
    await openLogoutAllModal(page);
    // จำลอง concurrent write — revision bump หลังเปิด modal
    await page.evaluate(() => {
      const acc = adminAccountData.accounts.find(a => a.id === "ADM-010");
      acc.revision = (acc.revision || 0) + 1;
    });
    await page.locator("[data-my-account-action='confirm-logout-all']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    await expect(page.locator("#success-toast")).toHaveClass(/error/);
    await expect(page.locator("#success-toast")).toContainText("ไม่ตรงกัน");
    for (const id of ALL_SESSION_IDS) {
      const status = await page.evaluate(sid =>
        adminSessionData["ADM-010"].sessions.find(s => s.id === sid)?.status, id);
      expect(status).toBe("Active");
    }
    expect(await auditEventCount(page)).toBe(before);
    await expect(page.locator("#login-screen")).not.toBeVisible();
  });

  test("9. ไม่มี active session ระหว่างเปิด modal → confirm reject + warning toast + ไม่กลับ Login", async ({ page }) => {
    await goToMyAccount(page);
    const before = await auditEventCount(page);
    await openLogoutAllModal(page);
    // จำลองทุก session ถูก revoke จาก channel อื่นก่อนกดยืนยัน
    await page.evaluate(() => {
      adminSessionData["ADM-010"].sessions.forEach(s => { s.status = "Revoked"; });
    });
    await page.locator("[data-my-account-action='confirm-logout-all']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    await expect(page.locator("#success-toast")).toHaveClass(/warning/);
    expect(await auditEventCount(page)).toBe(before);
    await expect(page.locator("#login-screen")).not.toBeVisible();
  });

  test("10. self account ไม่ใช่ Active ระหว่างเปิด modal → confirm reject + sessions คงอยู่", async ({ page }) => {
    await goToMyAccount(page);
    const before = await auditEventCount(page);
    await openLogoutAllModal(page);
    // จำลอง self ถูก Suspend ระหว่างเปิด modal
    await page.evaluate(() => {
      adminAccountData.accounts.find(a => a.id === "ADM-010").status = "Suspended";
    });
    await page.locator("[data-my-account-action='confirm-logout-all']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    await expect(page.locator("#success-toast")).toHaveClass(/error/);
    for (const id of ALL_SESSION_IDS) {
      const status = await page.evaluate(sid =>
        adminSessionData["ADM-010"].sessions.find(s => s.id === sid)?.status, id);
      expect(status).toBe("Active");
    }
    expect(await auditEventCount(page)).toBe(before);
    await page.evaluate(() => {
      adminAccountData.accounts.find(a => a.id === "ADM-010").status = "Active";
    });
  });

  test("11. self-only: auth.admin.accountId ชี้ account อื่น → confirm ไม่ commit (identity resolve จาก auth เท่านั้น)", async ({ page }) => {
    await goToMyAccount(page);
    const before = await auditEventCount(page);
    await openLogoutAllModal(page);
    await page.evaluate(() => { auth.admin.accountId = "ADM-001"; });
    await page.locator("[data-my-account-action='confirm-logout-all']").click();
    await page.waitForTimeout(300);
    for (const id of ALL_SESSION_IDS) {
      const status = await page.evaluate(sid =>
        adminSessionData["ADM-010"].sessions.find(s => s.id === sid)?.status, id);
      expect(status).toBe("Active");
    }
    expect(await auditEventCount(page)).toBe(before);
    await page.evaluate(() => { auth.admin.accountId = "ADM-010"; });
  });

  test("12. ไม่มี active session → เปิด modal ผ่าน function ตรง ๆ → reject (ไม่เปิด modal) + warning toast", async ({ page }) => {
    await goToMyAccount(page);
    const before = await auditEventCount(page);
    await page.evaluate(() => {
      adminSessionData["ADM-010"].sessions.forEach(s => { s.status = "Revoked"; });
      openMyAccountLogoutAllModal();
    });
    await page.waitForTimeout(200);
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    await expect(page.locator("#success-toast")).toHaveClass(/warning/);
    expect(await auditEventCount(page)).toBe(before);
  });
});

// ==================== F. RESPONSIVE & REGRESSION ====================

test.describe("QA-BO-019d: Logout All Devices — responsive & regression", () => {

  test("13. responsive: ปุ่ม + modal + teardown flow ทำงานครบทุก viewport", async ({ page }) => {
    await goToMyAccount(page);
    await expect(logoutAllButton(page)).toBeVisible();
    await openLogoutAllModal(page);
    await expect(page.locator(".my-account-logout-all-modal-page")).toBeVisible();
    await page.locator("[data-my-account-action='confirm-logout-all']").click();
    await page.waitForTimeout(400);
    await expect(page.locator("#login-screen")).toBeVisible();
    // ปุ่มยังอยู่หลัง login ใหม่ (session ใหม่ active)
    await loginIfNeeded(page);
    await ensureNavOpen(page);
    await page.locator("#my-account-entry").click();
    await page.waitForTimeout(300);
    await expect(logoutAllButton(page)).toBeVisible();
  });

  test("14. regression: per-session revoke + Edit Name + Change Password ยังทำงาน", async ({ page }) => {
    await goToMyAccount(page);
    // per-session revoke (AIL-022) ไม่แตก
    await page.locator("[data-my-account-session='SES-90002'] [data-my-account-action='revoke-session']").click();
    await page.waitForTimeout(200);
    await expect(page.locator(".my-account-session-modal")).toBeVisible();
    await page.locator("[data-my-account-action='confirm-revoke-session']").click();
    await page.waitForTimeout(300);
    expect(await page.locator("[data-my-account-session='SES-90002']").count()).toBe(0);
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
  });
});
