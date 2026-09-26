// QA-BO-023: Self-Service Functional Tests (AIL-027) — cross-flow functional coverage
// อ้างอิง accepted self-service contract (requirement bf08de1f §1-§7) + prototype เป็นหลักสำหรับการแสดงผล
// scope: ADDITIVE เท่านั้น — ไม่ซ้ำ per-task coverage ของ qa-bo-019a-e (My Account / Change Password /
//        Active Sessions / Logout All / Session Expired) แต่พิสูจน์ว่า flows ทำงานร่วมกันถูกต้อง:
//        A. golden-path journey ต่อเนื่องใน session เดียว (edit name → revoke → change pw → logout all → re-login)
//        B. audit/trace invariants (1 action = 1 event, id เรียง, cancel/validation-fail ไม่สร้าง event,
//           ไม่มี secret ทั้ง journey, events แสดงจริงใน Settings > Audit Log)
//        C. cross-device chains (change pw → session อื่น stale → gate; revoke จากอีกเครื่อง → gate → re-login)
//        D. boundary (counter isolation ระหว่าง login lockout กับ pw rate-limit, pw cooldown ไม่ block login,
//           re-login หลัง expiry → Dashboard, suspend กลาง session → gate, logged-out ไม่ leak content)
//        E. cross-module sanity หลัง journey (Dashboard / Admin Accounts / Audit Log render ปกติ)
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

const SELF = {
  id: "ADM-010",
  name: "ผู้ดูแลระบบ",
  email: "current.admin@tukdaeng.example",
  role: "Super Admin"
};

const MOCK_PASSWORD = "tukdaeng-admin";
const NEW_PASSWORD = "TukDaeng!2026xyz"; // ผ่าน policy: ≥12 + upper + lower + digit + special
const UPDATED_NAME = "ผู้ดูแลระบบ QA";

const CURRENT_SESSION_ID = "SES-90001";
const OTHER_SESSION_IDS = ["SES-90002", "SES-90003"];

const SELF_SERVICE_TYPES = [
  "ADMIN_PROFILE_UPDATE",
  "ADMIN_PASSWORD_CHANGE",
  "ADMIN_SESSION_REVOKE",
  "ADMIN_SESSION_REVOKE_ALL"
];

// helper: login เข้าระบบ (ค่า default อยู่ใน form แล้ว)
async function loginIfNeeded(page) {
  const loginScreen = page.locator("#login-screen");
  if (await loginScreen.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator("#login-form button[type=\"submit\"]").click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await page.waitForTimeout(500);
  }
}

// helper: submit login form ด้วย email + scenario ที่กำหนด (pattern เดียวกับ qa-bo-022 —
// select อยู่ใน <details> ที่ปิดอยู่ → set value ผ่าน evaluate + dispatch change)
async function submitLogin(page, email, scenario = "success") {
  await page.locator("#login-email").fill(email);
  await page.locator("#auth-scenario").evaluate((el, v) => {
    el.value = v;
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, scenario);
  await page.locator("#login-form .btn.primary").click();
  await page.waitForTimeout(150);
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

// helper: ไปหน้า My Account ผ่าน sidebar profile footer (.admin-box) — reload หน้า (state สะอาด)
async function goToMyAccount(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await openMyAccountInPage(page);
}

// helper: เปิด My Account ใน page เดิม (ไม่ reload — เก็บ state เช่น audit/login attempts ไว้)
async function openMyAccountInPage(page) {
  await ensureNavOpen(page);
  await page.locator("#my-account-entry").click();
  await page.waitForTimeout(300);
}

// helper: เปิด Change Password modal (เริ่มจากหน้า My Account ที่เปิดอยู่แล้ว)
async function openPasswordModal(page) {
  await page.locator("[data-my-account-action='change-password']").click();
  await page.waitForTimeout(200);
}

// helper: กรอกทั้ง 3 field (input event → live checklist ทำงานเหมือน user พิมพ์)
async function fillPasswordForm(page, { current = "", next = "", confirm = "" } = {}) {
  await page.locator("#my-account-pw-current").fill(current);
  await page.locator("#my-account-pw-new").fill(next);
  await page.locator("#my-account-pw-confirm").fill(confirm);
}

// helper: เปลี่ยนรหัสผ่านสำเร็จผ่าน UI (อยู่หน้า My Account แล้ว)
async function changePasswordViaUi(page) {
  await openPasswordModal(page);
  await fillPasswordForm(page, { current: MOCK_PASSWORD, next: NEW_PASSWORD, confirm: NEW_PASSWORD });
  await page.locator("[data-my-account-action='save-password']").click();
  await page.waitForTimeout(300);
}

async function auditEventCount(page) {
  return page.evaluate(() => auditLogData.events.length);
}

// helper: events ของ self-service ทั้งหมด (newest-first ตาม auditLogData.events)
async function selfServiceEvents(page) {
  return page.evaluate(types =>
    auditLogData.events.filter(e => types.includes(e.eventType)), SELF_SERVICE_TYPES);
}

async function selfAccount(page) {
  return page.evaluate(() => adminAccountData.accounts.find(a => a.id === "ADM-010"));
}

function sessionRow(page, id) {
  return page.locator(`[data-my-account-session='${id}']`);
}

// ==================== A. GOLDEN-PATH JOURNEY ====================

test.describe("QA-BO-023: Self-Service — golden-path journey", () => {

  test("A1. journey ต่อเนื่องใน session เดียว: Edit Name → revoke session อื่น → Change Password → Logout All → re-login → My Account ใช้ได้ + audit 4 events เรียงลำดับ", async ({ page }) => {
    await goToMyAccount(page);
    await expect(page.locator("[data-my-account-page]")).toBeVisible();

    // step 1: แก้ชื่อ → บันทึก → display + footer sync
    await page.locator("[data-my-account-action='edit-name']").click();
    await page.locator("#my-account-name").fill(UPDATED_NAME);
    await page.locator("[data-my-account-action='save-name']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("[data-my-account-name-display]")).toHaveText(UPDATED_NAME);

    // step 2: revoke session อื่นจาก Active Sessions (current ยังอยู่)
    await sessionRow(page, "SES-90002").locator("[data-my-account-action='revoke-session']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-my-account-action='confirm-revoke-session']").click();
    await page.waitForTimeout(300);
    await expect(sessionRow(page, "SES-90002")).toHaveCount(0);
    await expect(sessionRow(page, CURRENT_SESSION_ID)).toBeVisible();

    // step 3: เปลี่ยนรหัสผ่าน → current session คงอยู่ หน้าใช้งานต่อได้
    await changePasswordViaUi(page);
    await expect(page.locator("[data-my-account-page]")).toBeVisible();

    // step 4: Logout All Devices → confirm → กลับหน้า Login
    await page.locator("[data-my-account-action='logout-all']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-my-account-action='confirm-logout-all']").click();
    await page.waitForFunction(() => document.body.classList.contains("logged-out"), { timeout: 5000 });
    await expect(page.locator("#login-screen")).toBeVisible();

    // step 5: re-login → session ใหม่ถูกออก → My Account ใช้ได้ปกติ + ชื่อที่แก้ยังอยู่ (persist ใน registry)
    await loginIfNeeded(page);
    const reg = await page.evaluate(() => {
      const r = adminSessionData["ADM-010"];
      return { currentId: r.currentSessionId, current: r.sessions.find(s => s.id === r.currentSessionId) };
    });
    expect(reg.currentId).not.toBe(CURRENT_SESSION_ID);
    expect(reg.current.status).toBe("Active");
    await openMyAccountInPage(page);
    await expect(page.locator("[data-my-account-page]")).toBeVisible();
    await expect(page.locator("[data-my-account-name-display]")).toHaveText(UPDATED_NAME);

    // audit: journey ผลิต self-service events เรียงลำดับตาม action จริง (events ถูก unshift → reverse เป็น chronological)
    const chronological = (await selfServiceEvents(page)).reverse();
    expect(chronological.map(e => e.eventType)).toEqual([
      "ADMIN_PROFILE_UPDATE",
      "ADMIN_SESSION_REVOKE",
      "ADMIN_PASSWORD_CHANGE",
      "ADMIN_SESSION_REVOKE_ALL"
    ]);
  });
});

// ==================== B. AUDIT / TRACE INVARIANTS ====================

test.describe("QA-BO-023: Self-Service — audit/trace invariants", () => {

  test("B1. แต่ละ mutation ผลิต event พอดี 1 รายการ + field ครบ (AUD id เพิ่มตามลำดับ, module=My Account, actor/result/target)", async ({ page }) => {
    await goToMyAccount(page);
    const baseline = await auditEventCount(page);

    await page.locator("[data-my-account-action='edit-name']").click();
    await page.locator("#my-account-name").fill(UPDATED_NAME);
    await page.locator("[data-my-account-action='save-name']").click();
    await page.waitForTimeout(200);

    await sessionRow(page, "SES-90002").locator("[data-my-account-action='revoke-session']").click();
    await page.locator("[data-my-account-action='confirm-revoke-session']").click();
    await page.waitForTimeout(300);

    await changePasswordViaUi(page);

    expect(await auditEventCount(page)).toBe(baseline + 3);
    const chronological = (await selfServiceEvents(page)).reverse();
    expect(chronological).toHaveLength(3);
    expect(chronological.map(e => e.eventType)).toEqual([
      "ADMIN_PROFILE_UPDATE",
      "ADMIN_SESSION_REVOKE",
      "ADMIN_PASSWORD_CHANGE"
    ]);
    const ids = chronological.map(e => {
      expect(e.id).toMatch(/^AUD-\d{5}$/);
      return Number(e.id.slice(4));
    });
    expect([...ids].sort((a, b) => a - b)).toEqual(ids); // AUD id เพิ่มตามลำดับการเกิด
    for (const evt of chronological) {
      expect(evt.module).toBe("My Account");
      expect(evt.actorType).toBe("Admin");
      expect(evt.result).toBe("Success");
      expect(evt.targetAdminId).toBe(SELF.id);
      expect(evt.reference).toBeTruthy();
    }
  });

  test("B2. cancel / validation-fail / no-op save → ไม่สร้าง audit event (state ไม่ mutate)", async ({ page }) => {
    await goToMyAccount(page);
    const baseline = await auditEventCount(page);
    const accBefore = await selfAccount(page);

    // cancel Edit Name modal
    await page.locator("[data-my-account-action='edit-name']").click();
    await page.locator("#my-account-name").fill("ชื่อที่ไม่บันทึก");
    await page.locator("[data-my-account-action='cancel-name']").click();
    await page.waitForTimeout(200);

    // validation-fail: name ว่าง → save ไม่ผ่าน
    await page.locator("[data-my-account-action='edit-name']").click();
    await page.locator("#my-account-name").fill("");
    await page.locator("[data-my-account-action='save-name']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-my-account-action='cancel-name']").click();

    // validation-fail: confirm mismatch → save password ไม่ผ่าน
    await openPasswordModal(page);
    await fillPasswordForm(page, { current: MOCK_PASSWORD, next: NEW_PASSWORD, confirm: "Different!2026xyz" });
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-my-account-action='cancel-password']").click();
    await page.waitForTimeout(200);

    // cancel revoke-session confirm modal
    await sessionRow(page, "SES-90002").locator("[data-my-account-action='revoke-session']").click();
    await page.locator("[data-my-account-action='cancel-revoke-session']").click();
    await page.waitForTimeout(200);

    // cancel Logout All confirm modal
    await page.locator("[data-my-account-action='logout-all']").click();
    await page.locator("[data-my-account-action='cancel-logout-all']").click();
    await page.waitForTimeout(200);

    expect(await auditEventCount(page)).toBe(baseline);
    const accAfter = await selfAccount(page);
    expect(accAfter.name).toBe(accBefore.name);
    expect(accAfter.revision).toBe(accBefore.revision);
    // session ยังอยู่ครบ — cancel ไม่ควร revoke อะไร
    expect((await page.evaluate(() => adminSessionData["ADM-010"].sessions.length)) === 3).toBe(true);
    await expect(page.locator("[data-my-account-page]")).toBeVisible();
  });

  test("B3. ทุก event ที่ journey สร้างไม่มี secret (password/reset token/credential/full IPv4)", async ({ page }) => {
    await goToMyAccount(page);
    await page.locator("[data-my-account-action='edit-name']").click();
    await page.locator("#my-account-name").fill(UPDATED_NAME);
    await page.locator("[data-my-account-action='save-name']").click();
    await page.waitForTimeout(200);
    await sessionRow(page, "SES-90002").locator("[data-my-account-action='revoke-session']").click();
    await page.locator("[data-my-account-action='confirm-revoke-session']").click();
    await page.waitForTimeout(300);
    await changePasswordViaUi(page);

    const events = await selfServiceEvents(page);
    expect(events).toHaveLength(3);
    const serialized = JSON.stringify(events);
    expect(serialized).not.toContain(MOCK_PASSWORD);
    expect(serialized).not.toContain(NEW_PASSWORD);
    expect(serialized).not.toMatch(/sim-token|Bearer/i);
    expect(serialized).not.toMatch(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/); // IP ต้อง mask เสมอ
  });

  test("B4. self-service events แสดงจริงใน Settings > Audit Log (module badge My Account + risk ตรง event)", async ({ page }) => {
    await goToMyAccount(page);
    await page.locator("[data-my-account-action='edit-name']").click();
    await page.locator("#my-account-name").fill(UPDATED_NAME);
    await page.locator("[data-my-account-action='save-name']").click();
    await page.waitForTimeout(200);
    await changePasswordViaUi(page);

    const events = (await selfServiceEvents(page)).reverse(); // chronological
    expect(events).toHaveLength(2);

    // navigate ใน page เดิม — events ต้องยังอยู่และ render ใน list
    await ensureNavOpen(page);
    const settingsOpen = await page.evaluate(() =>
      document.querySelector(".submenu[data-submenu='settings']")?.classList.contains("open"));
    if (!settingsOpen) await page.locator(".nav-item[data-module='settings']").click();
    await ensureNavOpen(page);
    await page.locator(".submenu[data-submenu='settings'] button[data-module='audit'][data-sub='Audit Log']").click();
    await page.waitForTimeout(500);

    await expect(page.locator("#page-title")).toHaveText("Audit Log");
    for (const evt of events) {
      const row = page.locator(`.audit-row[data-audit-event="${evt.id}"]`);
      await expect(row).toBeVisible();
      await expect(row.locator("[data-label='Module']")).toContainText("My Account");
      await expect(row.locator("[data-label='Risk']")).toContainText(evt.risk);
    }
  });
});

// ==================== C. CROSS-DEVICE SESSION CHAINS ====================

test.describe("QA-BO-023: Self-Service — cross-device session chains", () => {

  test("C1. Change Password บนเครื่องนี้ → session ของอุปกรณ์อื่น stale → อุปกรณ์นั้นเจอ expired gate → re-login ออก session ใหม่", async ({ page }) => {
    await goToMyAccount(page);
    await changePasswordViaUi(page);

    // จำลองมุมมองอุปกรณ์อื่น: currentSessionId = SES-90002 (ยังถือ sessionRevision เก่า → stale)
    await page.evaluate(() => {
      adminSessionData["ADM-010"].currentSessionId = "SES-90002";
      renderMyAccountPage();
    });
    await expect(page.locator("[data-my-account-state='session-expired']")).toBeVisible();
    await expect(page.locator("[data-my-account-page]")).toHaveCount(0);

    await page.locator("[data-my-account-action='return-login']").click();
    await page.waitForTimeout(300);
    await loginIfNeeded(page);

    // re-login ออก session ใหม่ให้อุปกรณ์นี้ (ไม่ใช่ SES-90002 ที่ stale แล้ว)
    const reg = await page.evaluate(() => {
      const r = adminSessionData["ADM-010"];
      return { currentId: r.currentSessionId, current: r.sessions.find(s => s.id === r.currentSessionId) };
    });
    expect(reg.currentId).not.toBe("SES-90002");
    expect(reg.current.status).toBe("Active");

    await openMyAccountInPage(page);
    await expect(page.locator("[data-my-account-page]")).toBeVisible();
  });

  test("C2. session ถูก revoke จากอีกเครื่อง → เครื่องนี้เจอ expired gate ที่ request ถัดไป → re-login ออก session ใหม่", async ({ page }) => {
    await goToMyAccount(page);

    // จำลองว่าเครื่องนี้ใช้ SES-90003 และถูก revoke จากอุปกรณ์อื่น (เช่น per-session revoke / logout-all)
    await page.evaluate(() => {
      const reg = adminSessionData["ADM-010"];
      const ses = reg.sessions.find(s => s.id === "SES-90003");
      reg.currentSessionId = "SES-90003";
      if (ses) ses.status = "Revoked";
      renderMyAccountPage();
    });
    await expect(page.locator("[data-my-account-state='session-expired']")).toBeVisible();

    await page.locator("[data-my-account-action='return-login']").click();
    await page.waitForTimeout(300);
    await loginIfNeeded(page);

    const reg = await page.evaluate(() => {
      const r = adminSessionData["ADM-010"];
      return { currentId: r.currentSessionId, current: r.sessions.find(s => s.id === r.currentSessionId) };
    });
    expect(reg.currentId).not.toBe("SES-90003");
    expect(reg.current.status).toBe("Active");

    await openMyAccountInPage(page);
    await expect(page.locator("[data-my-account-page]")).toBeVisible();
  });
});

// ==================== D. BOUNDARY / ISOLATION ====================

test.describe("QA-BO-023: Self-Service — boundary & isolation", () => {

  test("D1. counter isolation: failed-login attempts กับ myAccountPwFailCount เป็น mechanism คนละตัว ไม่กระทบกัน", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");

    // login พลาด 3 ครั้งด้วย self account (< limit 5 — ยังไม่ lock)
    for (let i = 0; i < 3; i += 1) {
      await submitLogin(page, SELF.email, "bad-password");
    }
    expect(await page.evaluate(() => loginAttemptData["ADM-010"]?.failedAttempts ?? 0)).toBe(3);

    // login สำเร็จ → clearLoginAttempts
    await submitLogin(page, SELF.email, "success");
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    expect(await page.evaluate(() => loginAttemptData["ADM-010"]?.failedAttempts ?? 0)).toBe(0);

    // wrong current password ใน My Account → นับเฉพาะ myAccountPwFailCount (ไม่ต่อจาก 3 และไม่แตะ login tracking)
    await openMyAccountInPage(page);
    await openPasswordModal(page);
    await fillPasswordForm(page, { current: "wrong-password", next: NEW_PASSWORD, confirm: NEW_PASSWORD });
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => myAccountPwFailCount)).toBe(1);
    expect(await page.evaluate(() => loginAttemptData["ADM-010"]?.failedAttempts ?? 0)).toBe(0);
  });

  test("D2. pw rate-limit cooldown ค้างอยู่ → login/logout ปกติ ไม่ block การเข้าสู่ระบบ", async ({ page }) => {
    await goToMyAccount(page);
    await openPasswordModal(page);
    // เร่ง simulation: failCount = 4 → submit ผิดอีก 1 ครั้ง = ครบ limit → cooldown
    await page.evaluate(() => { myAccountPwFailCount = 4; });
    await fillPasswordForm(page, { current: "wrong-password", next: NEW_PASSWORD, confirm: NEW_PASSWORD });
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("[data-my-account-action='save-password']")).toBeDisabled();
    expect(await page.evaluate(() => myAccountPwCooldownUntil > Date.now())).toBe(true);

    // ปิด modal แล้ว logout — cooldown ยังค้างใน state ระดับ account แต่ไม่ควรกระทบ login
    await page.locator("[data-my-account-action='cancel-password']").click();
    await page.waitForTimeout(200);
    await ensureNavOpen(page);
    await page.locator("#logout-btn").click();
    await page.waitForFunction(() => document.body.classList.contains("logged-out"), { timeout: 5000 });
    await expect(page.locator("#login-screen")).toBeVisible();

    await submitLogin(page, SELF.email, "success");
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await expect(page.locator("#page-title")).toHaveText("Dashboard");
  });

  test("D3. re-login หลัง expired → ลง Dashboard + เข้า My Account ได้ปกติ (session ใหม่ Active)", async ({ page }) => {
    await goToMyAccount(page);

    // บังคับ current session หมดอายุ → render ถัดไปเจอ gate
    await page.evaluate(() => {
      const reg = adminSessionData["ADM-010"];
      const cur = reg.sessions.find(s => s.id === reg.currentSessionId);
      if (cur) cur.lastActiveTs = Date.now() - 9 * 3600e3; // idle 9h > policy 8h
      renderMyAccountPage();
    });
    await page.waitForTimeout(300);
    await expect(page.locator("[data-my-account-state='session-expired']")).toBeVisible();
    await page.locator("[data-my-account-action='return-login']").click();
    await page.waitForTimeout(300);

    await loginIfNeeded(page);
    expect(await page.evaluate(() => document.body.classList.contains("dashboard-mode"))).toBe(true);
    await expect(page.locator("#page-title")).toHaveText("Dashboard");

    await openMyAccountInPage(page);
    await expect(page.locator("[data-my-account-page]")).toBeVisible();
    await expect(page.locator("[data-my-account-name-display]")).toHaveText(SELF.name);
  });

  test("D4. self ถูก Suspend กลาง session → request ถัดไปเจอ expired gate (status guard ทำงาน)", async ({ page }) => {
    await goToMyAccount(page);
    await expect(page.locator("[data-my-account-page]")).toBeVisible();

    await page.evaluate(() => {
      adminAccountData.accounts.find(a => a.id === "ADM-010").status = "Suspended";
      renderMyAccountPage();
    });
    await expect(page.locator("[data-my-account-state='session-expired']")).toBeVisible();
    await expect(page.locator("[data-my-account-page]")).toHaveCount(0);

    // restore — test นี้ต้องไม่ทิ้ง state ผิดเพี้ยน (แม้ reload จะ reset อยู่แล้ว)
    await page.evaluate(() => {
      adminAccountData.accounts.find(a => a.id === "ADM-010").status = "Active";
    });
  });

  test("D5. logged-out → renderModule('my-account') ไม่ leak protected content (app ซ่อน + login คงอยู่)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#login-screen")).toBeVisible();

    // พยายาม render My Account โดยตรงขณะ logged-out
    await page.evaluate(() => renderModule("my-account"));
    await page.waitForTimeout(300);

    expect(await page.evaluate(() => document.body.classList.contains("logged-out"))).toBe(true);
    await expect(page.locator("#login-screen")).toBeVisible();
    // .app ถูก CSS ซ่อนทั้งก้อนเมื่อ logged-out — content ไม่ถึงผู้ใช้แม้ render ถูกเรียก
    expect(await page.evaluate(() => getComputedStyle(document.querySelector(".app")).display)).toBe("none");
  });
});

// ==================== E. CROSS-MODULE SANITY ====================

test.describe("QA-BO-023: Self-Service — cross-module sanity", () => {

  test("E1. หลัง self-service actions → Dashboard / Admin Accounts / Audit Log render ปกติ (ไม่มี state ค้าง)", async ({ page }) => {
    await goToMyAccount(page);
    // mutation จริง 1 ครั้งเพื่อให้ journey มีผลกระทบต่อ shared state
    await page.locator("[data-my-account-action='edit-name']").click();
    await page.locator("#my-account-name").fill(UPDATED_NAME);
    await page.locator("[data-my-account-action='save-name']").click();
    await page.waitForTimeout(200);

    // Dashboard
    await ensureNavOpen(page);
    await page.locator(".nav-item[data-module='dashboard']").click();
    await page.waitForTimeout(400);
    await expect(page.locator("#page-title")).toHaveText("Dashboard");
    expect(await page.evaluate(() => document.body.classList.contains("my-account-mode"))).toBe(false);

    // Settings > Admin Accounts
    await ensureNavOpen(page);
    const settingsOpen = await page.evaluate(() =>
      document.querySelector(".submenu[data-submenu='settings']")?.classList.contains("open"));
    if (!settingsOpen) await page.locator(".nav-item[data-module='settings']").click();
    await ensureNavOpen(page);
    await page.locator(".submenu[data-submenu='settings'] button[data-module='settings'][data-sub='Admin Accounts']").click();
    await page.waitForTimeout(500);
    await expect(page.locator("#page-title")).toHaveText("Admin Accounts");
    await expect(page.locator(".admin-account-row").first()).toBeVisible();

    // Settings > Audit Log — event ที่เพิ่งสร้างแสดงใน list
    await ensureNavOpen(page);
    const settingsOpen2 = await page.evaluate(() =>
      document.querySelector(".submenu[data-submenu='settings']")?.classList.contains("open"));
    if (!settingsOpen2) await page.locator(".nav-item[data-module='settings']").click();
    await ensureNavOpen(page);
    await page.locator(".submenu[data-submenu='settings'] button[data-module='audit'][data-sub='Audit Log']").click();
    await page.waitForTimeout(500);
    await expect(page.locator("#page-title")).toHaveText("Audit Log");
    await expect(page.locator(".audit-row").first()).toBeVisible();
  });
});
