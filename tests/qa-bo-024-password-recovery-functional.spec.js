// QA-BO-024: Password Recovery Functional Tests (AIL-028) — cross-flow functional coverage
// อ้างอิง spec 01_AUTHENTICATION_MODULE §9/§13/§14 + AIL-019 Password Recovery Contract
// scope: ADDITIVE เท่านั้น — ไม่ซ้ำ per-task coverage ของ qa-bo-020 (Forgot Password) /
//        qa-bo-021 (Reset Password) / qa-bo-022 (Failed Login Lockout) แต่พิสูจน์ว่า
//        flows ทำงานต่อกันถูกต้อง:
//        A. golden-path journey ผ่าน UI จริงต่อเนื่อง (forgot → reset → login → Dashboard)
//        B. audit/trace invariants ข้าม flows (REQUEST→DELIVERY→ACCEPT→COMMIT ใต้
//           correlationId เดียว, TOKEN_ACCEPT ไม่ซ้ำตอน reopen, ไม่มี secret ทั้ง chain,
//           events/delivery แสดงจริงใน Audit Log + Delivery Logs)
//        C. lockout-recovery chains (lock ผ่าน UI → forgot → reset → unlock → login,
//           lock เกิดหลัง issuance → ลิงก์เดิมยังผ่าน, counter รีเซ็ตจริงหลัง recovery)
//        D. token lifecycle chains (supersede ผ่าน UI จริง, used→replay→renew,
//           expired→forgot recovery channel กดจริง)
//        E. boundary (session อุปกรณ์อื่นถูก revoke ด้วย reset → gate → re-login,
//           cooldown ยังมีผลหลัง token ถูก consume แล้ว)
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

const ELIGIBLE_EMAIL = "current.admin@tukdaeng.example";     // ADM-010 Active
const LOCKED_FAILED_LOGIN_EMAIL = "wichai@tukdaeng.example"; // ADM-007 Locked (failed_login)

const NEW_PASSWORD = "TukDaeng!2026xyz"; // ผ่าน policy: ≥12 + upper + lower + digit + special
const GENERIC_MESSAGE = "ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ไปยังอีเมลที่ลงทะเบียน";

// helper: เปิดหน้า forgot จากปุ่มบน Login (ต้องอยู่หน้า login อยู่แล้ว)
async function openForgotFromLogin(page) {
  await page.locator("#forgot-password-btn").click();
  await page.waitForSelector("#forgot-form", { timeout: 5000 });
}

// helper: submit อีเมลใน forgot form แล้วรอ accepted state (generic เสมอ)
async function submitForgotEmail(page, email) {
  await page.locator("#forgot-email").fill(email);
  await page.locator("#forgot-submit").click();
  await page.waitForSelector("[data-forgot-accepted]", { timeout: 5000 });
}

// helper: submit login form ด้วย email + scenario ที่กำหนด (pattern เดียวกับ qa-bo-022/023 —
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

async function isLoggedIn(page) {
  return page.evaluate(() => !document.body.classList.contains("logged-out"));
}

async function findAccount(page, id) {
  return page.evaluate(aid => adminAccountData.accounts.find(a => a.id === aid), id);
}

async function attemptEntry(page, id) {
  return page.evaluate(aid => loginAttemptData[aid] || null, id);
}

// helper: ออก reset token ผ่าน issuance path จริง (ข้าม UI — ใช้เมื่อ focus ไม่อยู่ที่ forgot)
async function mintResetToken(page, email) {
  return page.evaluate(async (normalizedEmail) => {
    const result = processPasswordResetRequest(
      normalizedEmail,
      `qa-${Date.now()}-${Math.random().toString(16).slice(2)}`
    );
    if (!result.ok || !result.requestId) return null;
    for (const [t, ref] of passwordResetTokenFixtures) {
      if (ref.requestId === result.requestId) return t;
    }
    return null;
  }, email);
}

// helper: raw token ของ request ล่าสุดที่ระบบออก (reverse lookup เดียวกับ manual QA tool)
async function latestIssuedToken(page) {
  return page.evaluate(() => {
    const req = passwordResetData.requests[passwordResetData.requests.length - 1];
    if (!req) return { requestId: null, token: null, tokenRevision: null };
    let token = null;
    for (const [t, ref] of passwordResetTokenFixtures) {
      if (ref.requestId === req.id) token = t;
    }
    return { requestId: req.id, token, tokenRevision: req.tokenRevision || 1 };
  });
}

// helper: เปิดลิงก์ reset จาก "อีเมล" — hashchange route เดียวกับลิงก์จริง
async function openResetLink(page, token) {
  await page.evaluate((t) => { window.location.hash = `reset-token=${t}`; }, token);
}

// helper: กรอก + submit รหัสผ่านใหม่ใน reset form แล้วรอ success state
async function commitResetViaUi(page, password = NEW_PASSWORD) {
  await page.locator("#reset-password").fill(password);
  await page.locator("#reset-password-confirm").fill(password);
  await page.locator("#reset-submit").click();
  await page.waitForSelector("[data-reset-success]", { timeout: 5000 });
}

// helper: ย้อน issuance timestamp ให้ cooldown 60s ผ่าน (จำลองเวลาจริงที่ผ่านไประหว่าง
// รอลิงก์/อ่านอีเมล — เหมือน lockout-expired scenario ของ qa-bo-022)
async function backdateIssuanceCooldown(page, email) {
  await page.evaluate((normalized) => {
    const log = passwordResetData.issuanceLog[normalized];
    if (log && log.length) log[log.length - 1] = Date.now() - 61e3;
  }, email);
}

// helper: journey เต็มผ่าน UI — forgot → accepted → เปิดลิงก์ → form → commit → success
// คืน { requestId, token } ให้ caller assert ต่อ
async function runRecoveryJourney(page, email) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForSelector("#login-form", { timeout: 10000 });
  await openForgotFromLogin(page);
  await submitForgotEmail(page, email);
  const issued = await latestIssuedToken(page);
  expect(issued.requestId).toMatch(/^RST-\d{5}$/);
  expect(issued.token).toBeTruthy();
  await openResetLink(page, issued.token);
  await page.waitForSelector("#reset-form", { timeout: 5000 });
  await commitResetViaUi(page);
  return issued;
}

// helper: audit events ของ request เดียว (เรียง chronological — events store เป็น newest-first)
async function recoveryJourneyEvents(page, requestId) {
  return page.evaluate((rid) =>
    auditLogData.events.filter(e => e.correlationId === `COR-${rid}`).reverse(), requestId);
}

// helper: เปิด nav ถ้าจอแคบ (≤1180px sidebar ถูกซ่อนด้วย transform) — pattern qa-bo-023
async function ensureNavOpen(page) {
  const needsToggle = await page.evaluate(() =>
    window.matchMedia("(max-width: 1180px)").matches && !document.body.classList.contains("nav-open"));
  if (needsToggle) {
    await page.locator("#menu-toggle").click();
    await page.waitForTimeout(300);
  }
}

// helper: เปิด Settings > Audit Log / Delivery Logs ใน page เดิม (pattern qa-bo-023 B4)
async function openSettingsSub(page, selector) {
  await ensureNavOpen(page);
  const settingsOpen = await page.evaluate(() =>
    document.querySelector(".submenu[data-submenu='settings']")?.classList.contains("open"));
  if (!settingsOpen) {
    await page.locator(".nav-item[data-module='settings']").click();
    await page.waitForTimeout(200);
  }
  await ensureNavOpen(page);
  await page.locator(selector).click();
  await page.waitForTimeout(500);
}

// ==================== A. GOLDEN-PATH JOURNEY ====================

test.describe("QA-BO-024: Password Recovery — golden-path journey", () => {

  test("A1. journey ต่อเนื่องผ่าน UI: ลืมรหัสผ่าน → ขอลิงก์ → reset → กลับ Login → login → Dashboard (ไม่มี session ก่อน login จริง)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });

    await openForgotFromLogin(page);
    await submitForgotEmail(page, ELIGIBLE_EMAIL);
    await expect(page.locator("[data-forgot-accepted]")).toContainText(GENERIC_MESSAGE);
    // recovery context ไม่สร้าง authenticated session — logged-out ค้างตลอด chain
    expect(await page.evaluate(() => document.body.classList.contains("logged-out"))).toBe(true);

    // ลิงก์ที่ "ส่งทางอีเมล" — token ของ request ที่ UI เพิ่งออก
    const issued = await latestIssuedToken(page);
    expect(issued.requestId).toMatch(/^RST-\d{5}$/);
    expect(issued.token).toBeTruthy();

    await openResetLink(page, issued.token);
    await page.waitForSelector("#reset-form", { timeout: 5000 });
    // token ถูก strip ออกจาก address bar ตาม contract
    expect(page.url()).not.toContain("reset-token");
    await expect(page.locator("[data-reset-field='email']")).toContainText("***");
    await expect(page.locator("[data-reset-field='email']")).not.toContainText("current.admin");
    expect(await page.evaluate(() => document.body.classList.contains("logged-out"))).toBe(true);

    await commitResetViaUi(page);
    expect(await page.evaluate(() => document.body.classList.contains("logged-out"))).toBe(true);

    // atomic boundary: request Used + sessions ของบัญชีถูก revoke ทั้งหมด
    const post = await page.evaluate((rid) => {
      const req = passwordResetData.requests.find(r => r.id === rid);
      const reg = adminSessionData["ADM-010"];
      return {
        status: req.status,
        sessions: reg ? reg.sessions.map(s => s.status) : []
      };
    }, issued.requestId);
    expect(post.status).toBe("Used");
    expect(post.sessions.length).toBeGreaterThan(0);
    expect(post.sessions.every(s => s === "Revoked")).toBe(true);

    // กลับไปหน้า Login → login สำเร็จด้วยบัญชีเดิม → Dashboard
    await page.locator("[data-reset-exit]").click();
    await page.waitForSelector("#login-form", { timeout: 5000 });
    await submitLogin(page, ELIGIBLE_EMAIL, "success");
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await expect(page.locator("#page-title")).toHaveText("Dashboard");

    // login ออก session ใหม่หลัง revoke-all — current session ต้อง Active
    const reg = await page.evaluate(() => {
      const r = adminSessionData["ADM-010"];
      return { currentId: r.currentSessionId, current: r.sessions.find(s => s.id === r.currentSessionId) };
    });
    expect(reg.current).toBeTruthy();
    expect(reg.current.status).toBe("Active");
  });
});

// ==================== B. AUDIT / TRACE INVARIANTS ====================

test.describe("QA-BO-024: Password Recovery — audit/trace invariants", () => {

  test("B1. audit chain ข้าม flow: REQUEST→DELIVERY→ACCEPT→COMMIT ใต้ correlationId เดียว + refs ผูกกันครบ", async ({ page }) => {
    const issued = await runRecoveryJourney(page, ELIGIBLE_EMAIL);

    const events = await recoveryJourneyEvents(page, issued.requestId);
    expect(events.map(e => e.eventType)).toEqual([
      "ADMIN_PASSWORD_RESET_REQUEST",
      "ADMIN_PASSWORD_RESET_DELIVERY_ATTEMPT",
      "ADMIN_PASSWORD_RESET_TOKEN_ACCEPT",
      "ADMIN_PASSWORD_RESET_COMMIT"
    ]);
    // AUD id เพิ่มตามลำดับเวลาจริงของ chain
    const auditNums = events.map(e => Number(e.id.replace("AUD-", "")));
    for (let i = 1; i < auditNums.length; i += 1) {
      expect(auditNums[i]).toBeGreaterThan(auditNums[i - 1]);
    }

    const requestEvent = events.find(e => e.eventType === "ADMIN_PASSWORD_RESET_REQUEST");
    const deliveryEvent = events.find(e => e.eventType === "ADMIN_PASSWORD_RESET_DELIVERY_ATTEMPT");
    const acceptEvent = events.find(e => e.eventType === "ADMIN_PASSWORD_RESET_TOKEN_ACCEPT");
    const commitEvent = events.find(e => e.eventType === "ADMIN_PASSWORD_RESET_COMMIT");
    expect(requestEvent.reference).toBe(issued.requestId);
    expect(acceptEvent.reference).toBe(issued.requestId);
    expect(commitEvent.reference).toBe(issued.requestId);
    expect(commitEvent.risk).toBe("High");

    // refs บน request record ชี้กลับ audit/delivery ที่สร้างจาก chain เดียวกัน
    const req = await page.evaluate((rid) =>
      passwordResetData.requests.find(r => r.id === rid), issued.requestId);
    expect(req.auditRef).toBe(requestEvent.id);
    expect(req.acceptAuditRef).toBe(acceptEvent.id);
    expect(req.deliveryRef).toMatch(/^DLV-ACCT-\d+-PWD-\d{3}$/);
    expect(deliveryEvent.reference).toBe(req.deliveryRef);

    // delivery attempt record ผูก request + correlation เดียวกัน
    const dlv = await page.evaluate((rid) =>
      passwordResetData.deliveryAttempts.find(a => a.requestId === rid), issued.requestId);
    expect(dlv).toBeTruthy();
    expect(dlv.id).toBe(req.deliveryRef);
    expect(dlv.correlationId).toBe(req.correlationId);
    expect(dlv.status).toBe("Sent");
  });

  test("B2. เปิดลิงก์ซ้ำ (reopen) ก่อน commit → TOKEN_ACCEPT Success แค่ event เดียวต่อ request", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    await openForgotFromLogin(page);
    await submitForgotEmail(page, ELIGIBLE_EMAIL);
    const issued = await latestIssuedToken(page);

    await openResetLink(page, issued.token);
    await page.waitForSelector("#reset-form", { timeout: 5000 });

    // เปิดลิงก์เดิมอีกครั้งจากอีเมล — hashchange → re-resolve (validating → form)
    // แต่ request.acceptedAt set แล้ว → ไม่ควรสร้าง TOKEN_ACCEPT ซ้ำ
    await openResetLink(page, issued.token);
    await page.waitForSelector("#reset-screen[data-reset-state='validating']", { timeout: 5000 });
    await page.waitForSelector("#reset-form", { timeout: 5000 });

    const accepts = await page.evaluate((rid) =>
      auditLogData.events.filter(e =>
        e.eventType === "ADMIN_PASSWORD_RESET_TOKEN_ACCEPT"
        && e.correlationId === `COR-${rid}`
        && e.result === "Success"), issued.requestId);
    expect(accepts).toHaveLength(1);
    const req = await page.evaluate((rid) =>
      passwordResetData.requests.find(r => r.id === rid), issued.requestId);
    expect(req.acceptAuditRef).toBe(accepts[0].id);
  });

  test("B3. artifacts ทั้ง journey (audit/delivery/record/DOM) ไม่มี raw token, token hash หรือ password", async ({ page }) => {
    const issued = await runRecoveryJourney(page, ELIGIBLE_EMAIL);

    const artifacts = await page.evaluate((rid) => {
      const req = passwordResetData.requests.find(r => r.id === rid);
      const events = auditLogData.events.filter(e => e.correlationId === `COR-${rid}`);
      const deliveries = passwordResetData.deliveryAttempts.filter(a => a.requestId === rid);
      const settingsRows = (moduleData.settings?.rows || []).filter(r => JSON.stringify(r).includes(rid));
      return { request: req, events, deliveries, settingsRows };
    }, issued.requestId);

    // surface ที่ผู้ใช้/admin เห็น — ห้ามมี raw token, token hash หรือ password
    const visible = JSON.stringify({
      events: artifacts.events,
      deliveries: artifacts.deliveries,
      settingsRows: artifacts.settingsRows
    });
    expect(visible).not.toContain(issued.token);
    expect(visible).not.toContain("sim-rst-");
    expect(visible).not.toContain("rst-hash-");
    expect(visible).not.toContain(NEW_PASSWORD);
    // request record เองเก็บเฉพาะ hash stand-in — raw token ห้ามอยู่ใน record
    expect(JSON.stringify(artifacts.request)).not.toContain(issued.token);
    expect(artifacts.request.tokenHash).toMatch(/^rst-hash-/);

    // rendered text เท่านั้น (innerText ไม่รวม <script> source ที่มี literal 'sim-rst-')
    const rendered = await page.evaluate(() => document.body.innerText);
    expect(rendered).not.toContain(issued.token);
    expect(rendered).not.toContain("rst-hash-");
    expect(rendered).not.toContain(NEW_PASSWORD);
  });

  test("B4. events + delivery ของ journey แสดงจริงใน Settings > Audit Log / Delivery Logs หลัง re-login", async ({ page }) => {
    const issued = await runRecoveryJourney(page, ELIGIBLE_EMAIL);
    const events = await recoveryJourneyEvents(page, issued.requestId);
    expect(events).toHaveLength(4);

    await page.locator("[data-reset-exit]").click();
    await page.waitForSelector("#login-form", { timeout: 5000 });
    await submitLogin(page, ELIGIBLE_EMAIL, "success");
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });

    await openSettingsSub(page, ".submenu[data-submenu='settings'] button[data-module='audit'][data-sub='Audit Log']");
    await expect(page.locator("#page-title")).toHaveText("Audit Log");
    for (const evt of events) {
      const row = page.locator(`.audit-row[data-audit-event="${evt.id}"]`);
      await expect(row).toBeVisible();
      await expect(row.locator("[data-label='Module']")).toContainText("Settings");
    }

    const deliveryId = await page.evaluate((rid) =>
      passwordResetData.requests.find(r => r.id === rid).deliveryRef, issued.requestId);
    await openSettingsSub(page, ".submenu[data-submenu='settings'] button[data-module='settings'][data-sub='Delivery Logs']");
    const drow = page.locator(`.delivery-row[data-delivery-card="${deliveryId}"]`);
    await expect(drow).toBeVisible();
    await expect(drow).toContainText(deliveryId);
    await expect(drow).toContainText("Password reset email");
    await expect(drow).toContainText("Sent");
  });
});

// ==================== C. LOCKOUT-RECOVERY CHAINS ====================

test.describe("QA-BO-024: Password Recovery — lockout-recovery chains", () => {

  test("C1. failed login 5 ครั้งผ่าน UI → lockout + hint ชี้ forgot → forgot → reset → ปลดล็อก → login สำเร็จ", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });

    // สร้าง failed-login lock ผ่าน UI จริง (ADM-010 Active → Locked)
    for (let i = 0; i < 5; i += 1) {
      await submitLogin(page, ELIGIBLE_EMAIL, "bad-password");
    }
    await expect(page.locator("#auth-error")).toHaveAttribute("data-lockout", "failed_login");
    await expect(page.locator("[data-lockout-countdown]")).toBeVisible();
    await expect(page.locator(".auth-lockout-hint")).toContainText("ลืมรหัสผ่าน");

    // self-service path ตาม hint — forgot ยังใช้ได้กับ failed-login locked account
    await openForgotFromLogin(page);
    await submitForgotEmail(page, ELIGIBLE_EMAIL);
    const issued = await latestIssuedToken(page);
    expect(issued.token).toBeTruthy();

    await openResetLink(page, issued.token);
    await page.waitForSelector("#reset-form", { timeout: 5000 });
    await commitResetViaUi(page);

    // commit ปลด failed-login lock + เคลียร์ attempt counter ใน boundary เดียวกัน
    const acc = await findAccount(page, "ADM-010");
    expect(acc.status).toBe("Active");
    expect(await page.evaluate(() => passwordRecoveryLockReason["ADM-010"])).toBeUndefined();
    expect(await attemptEntry(page, "ADM-010")).toBeNull();

    await page.locator("[data-reset-exit]").click();
    await page.waitForSelector("#login-form", { timeout: 5000 });
    await submitLogin(page, ELIGIBLE_EMAIL, "success");
    expect(await isLoggedIn(page)).toBe(true);
    await expect(page.locator("#auth-error")).not.toHaveAttribute("data-lockout");
  });

  test("C2. token ออกตอน Active → account ถูก lock ระหว่างลิงก์ค้าง → ลิงก์เดิมยังผ่าน → commit ปลดล็อก", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });

    const token = await mintResetToken(page, ELIGIBLE_EMAIL);
    expect(token).toBeTruthy();

    // lock เกิด "หลัง" issuance — 5 failed logins ระหว่างที่ลิงก์อยู่ในอีเมล
    for (let i = 0; i < 5; i += 1) {
      await submitLogin(page, ELIGIBLE_EMAIL, "bad-password");
    }
    const acc = await findAccount(page, "ADM-010");
    expect(acc.status).toBe("Locked");

    // consume-time re-check: failed-login lock = eligible → ลิงก์เดิมเปิดได้ปกติ
    await openResetLink(page, token);
    await page.waitForSelector("#reset-form", { timeout: 5000 });
    await commitResetViaUi(page);

    const acc2 = await findAccount(page, "ADM-010");
    expect(acc2.status).toBe("Active");
    expect(await attemptEntry(page, "ADM-010")).toBeNull();

    await page.locator("[data-reset-exit]").click();
    await page.waitForSelector("#login-form", { timeout: 5000 });
    await submitLogin(page, ELIGIBLE_EMAIL, "success");
    expect(await isLoggedIn(page)).toBe(true);
  });

  test("C3. หลัง reset ปลดล็อก → failed-login counter เริ่มนับใหม่จาก 1 (ไม่ต่อจาก lock เดิม)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });

    // ADM-007 seed = Locked (failed_login, attempts 5) → reset ปลดล็อก
    const token = await mintResetToken(page, LOCKED_FAILED_LOGIN_EMAIL);
    await openResetLink(page, token);
    await page.waitForSelector("#reset-form", { timeout: 5000 });
    await commitResetViaUi(page);
    expect(await attemptEntry(page, "ADM-007")).toBeNull();

    await page.locator("[data-reset-exit]").click();
    await page.waitForSelector("#login-form", { timeout: 5000 });
    await submitLogin(page, LOCKED_FAILED_LOGIN_EMAIL, "bad-password");

    // recovery รีเซ็ต mechanism จริง — failed attempt ใหม่นับจาก 1 ไม่ใช่ 6 (ไม่ lock ซ้ำ)
    const entry = await attemptEntry(page, "ADM-007");
    expect(entry.failedAttempts).toBe(1);
    const acc = await findAccount(page, "ADM-007");
    expect(acc.status).toBe("Active");
    expect(await page.evaluate(() => document.querySelector("#auth-error").dataset.lockout)).toBeUndefined();
  });
});

// ==================== D. TOKEN LIFECYCLE CHAINS ====================

test.describe("QA-BO-024: Password Recovery — token lifecycle chains", () => {

  test("D1. ขอลิงก์ใหม่ผ่าน UI → ลิงก์เก่า LINK REPLACED → ลิงก์ใหม่ใช้ได้ → login สำเร็จ", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });

    // request A ผ่าน forgot UI
    await openForgotFromLogin(page);
    await submitForgotEmail(page, ELIGIBLE_EMAIL);
    const first = await latestIssuedToken(page);

    // ผู้ใช้ขอลิงก์อีกครั้ง (จำลอง cooldown ผ่านไปแล้ว) → request B supersede A
    await page.locator("[data-forgot-exit]").click();
    await page.waitForSelector("#login-form", { timeout: 5000 });
    await backdateIssuanceCooldown(page, ELIGIBLE_EMAIL);
    await openForgotFromLogin(page);
    await submitForgotEmail(page, ELIGIBLE_EMAIL);
    const second = await latestIssuedToken(page);
    expect(second.requestId).not.toBe(first.requestId);
    expect(second.tokenRevision).toBe(first.tokenRevision + 1);

    const statuses = await page.evaluate(([a, b]) => {
      const ra = passwordResetData.requests.find(r => r.id === a);
      const rb = passwordResetData.requests.find(r => r.id === b);
      return [ra.status, rb.status];
    }, [first.requestId, second.requestId]);
    expect(statuses).toEqual(["Superseded", "Pending"]);

    // ลิงก์เก่าจากอีเมลฉบับแรกตาย — LINK REPLACED
    await openResetLink(page, first.token);
    await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
    await expect(page.locator("[data-reset-failure]")).toHaveAttribute("data-reset-failure", "superseded");
    await expect(page.locator("#reset-content")).toContainText("ลิงก์นี้ถูกแทนที่ด้วยลิงก์ฉบับใหม่แล้ว");

    // ลิงก์ใหม่ใช้ได้ → commit → login
    await openResetLink(page, second.token);
    await page.waitForSelector("#reset-form", { timeout: 5000 });
    await commitResetViaUi(page);
    await page.locator("[data-reset-exit]").click();
    await page.waitForSelector("#login-form", { timeout: 5000 });
    await submitLogin(page, ELIGIBLE_EMAIL, "success");
    expect(await isLoggedIn(page)).toBe(true);
  });

  test("D2. token ที่ commit แล้ว → replay = LINK ALREADY USED (ไม่มี forgot CTA) → ขอลิงก์ใหม่ใช้ได้", async ({ page }) => {
    const issued = await runRecoveryJourney(page, ELIGIBLE_EMAIL);

    await page.locator("[data-reset-exit]").click();
    await page.waitForSelector("#login-form", { timeout: 5000 });

    // replay ลิงก์เดิม — terminal state, recovery เดียวคือกลับ Login
    await openResetLink(page, issued.token);
    await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
    await expect(page.locator("[data-reset-failure]")).toHaveAttribute("data-reset-failure", "already_used");
    await expect(page.locator("[data-reset-forgot]")).toHaveCount(0);

    // ขอลิงก์ใหม่ (cooldown ผ่านแล้ว) → token ใหม่ใช้งานได้ปกติ
    await page.locator("[data-reset-exit]").click();
    await page.waitForSelector("#login-form", { timeout: 5000 });
    await backdateIssuanceCooldown(page, ELIGIBLE_EMAIL);
    await openForgotFromLogin(page);
    await submitForgotEmail(page, ELIGIBLE_EMAIL);
    const renewed = await latestIssuedToken(page);
    expect(renewed.requestId).not.toBe(issued.requestId);

    await openResetLink(page, renewed.token);
    await page.waitForSelector("#reset-form", { timeout: 5000 });
    await commitResetViaUi(page);
    const req = await page.evaluate((rid) =>
      passwordResetData.requests.find(r => r.id === rid), renewed.requestId);
    expect(req.status).toBe("Used");
  });

  test("D3. expired link → LINK EXPIRED → กด ขอลิงก์ตั้งรหัสผ่านใหม่ → ลง forgot → token ใหม่ commit ได้", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });

    const token = await mintResetToken(page, ELIGIBLE_EMAIL);
    expect(token).toBeTruthy();
    // จำลองเวลาผ่านไป 30+ นาที — ลิงก์หมดอายุ
    await page.evaluate(() => {
      const req = passwordResetData.requests[passwordResetData.requests.length - 1];
      req.expiresAt = new Date(Date.now() - 1000).toISOString();
    });

    await openResetLink(page, token);
    await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
    await expect(page.locator("[data-reset-failure]")).toHaveAttribute("data-reset-failure", "expired");

    // recovery channel บน terminal state — ขอลิงก์ใหม่ผ่าน forgot flow เดิม
    await page.locator("[data-reset-forgot]").click();
    await page.waitForSelector("#forgot-form", { timeout: 5000 });
    await backdateIssuanceCooldown(page, ELIGIBLE_EMAIL); // ลิงก์หมดอายุ = เวลาผ่าน ≥30 นาทีแล้ว
    await submitForgotEmail(page, ELIGIBLE_EMAIL);

    const renewed = await latestIssuedToken(page);
    expect(renewed.token).toBeTruthy();
    const prevStatus = await page.evaluate(() =>
      passwordResetData.requests[passwordResetData.requests.length - 2]?.status);
    expect(prevStatus).toBe("Superseded"); // request ใหม่ supersede ฉบับหมดอายุเดิม

    await openResetLink(page, renewed.token);
    await page.waitForSelector("#reset-form", { timeout: 5000 });
    await commitResetViaUi(page);
  });
});

// ==================== E. BOUNDARY / CROSS-DEVICE ====================

test.describe("QA-BO-024: Password Recovery — boundary & cross-device", () => {

  test("E1. reset จาก public context → session เครื่องที่ login ค้างถูก revoke → expired gate → re-login ออก session ใหม่", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    await submitLogin(page, ELIGIBLE_EMAIL, "success");
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await ensureNavOpen(page);
    await page.locator("#my-account-entry").click();
    await page.waitForSelector("[data-my-account-page]", { timeout: 5000 });

    // จำลอง reset ที่สำเร็จจาก context สาธารณะ (อีกอุปกรณ์/อีเมล) — ใช้ issuance+commit path จริง
    const result = await page.evaluate(() => {
      const res = processPasswordResetRequest(
        "current.admin@tukdaeng.example",
        `qa-${Date.now()}-${Math.random().toString(16).slice(2)}`
      );
      let token = null;
      for (const [t, ref] of passwordResetTokenFixtures) {
        if (ref.requestId === res.requestId) token = t;
      }
      resetPassword.token = token;
      return commitAdminPasswordReset("TukDaeng!2026xyz");
    });
    expect(result.ok).toBe(true);

    // sessions ทั้งหมดถูก revoke โดย reset commit — เครื่องนี้เจอ gate ที่ request ถัดไป
    const allRevoked = await page.evaluate(() =>
      adminSessionData["ADM-010"].sessions.every(s => s.status === "Revoked"));
    expect(allRevoked).toBe(true);
    await page.evaluate(() => renderMyAccountPage());
    await expect(page.locator("[data-my-account-state='session-expired']")).toBeVisible();

    await page.locator("[data-my-account-action='return-login']").click();
    await page.waitForTimeout(300);
    await page.locator("#login-form .btn.primary").click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });

    const reg = await page.evaluate(() => {
      const r = adminSessionData["ADM-010"];
      return { currentId: r.currentSessionId, current: r.sessions.find(s => s.id === r.currentSessionId) };
    });
    expect(reg.current).toBeTruthy();
    expect(reg.current.status).toBe("Active");
  });

  test("E2. cooldown ยังมีผลหลัง token ถูก consume — ขอใหม่ทันทีหลัง reset → generic accepted แต่ไม่ออก RST + audit COOLDOWN_ACTIVE", async ({ page }) => {
    await runRecoveryJourney(page, ELIGIBLE_EMAIL);
    const requestCount = await page.evaluate(() => passwordResetData.requests.length);

    // ขอลิงก์อีกครั้งทันทีหลัง commit สำเร็จ (< 60s จาก issuance) — throttle ไม่ผูกกับ consumption
    await page.locator("[data-reset-exit]").click();
    await page.waitForSelector("#login-form", { timeout: 5000 });
    await openForgotFromLogin(page);
    await submitForgotEmail(page, ELIGIBLE_EMAIL);
    await expect(page.locator("[data-forgot-accepted]")).toContainText(GENERIC_MESSAGE);

    // UI generic เหมือนเดิม แต่ฝั่ง state: ไม่มี request ใหม่ + audit Failed COOLDOWN_ACTIVE
    expect(await page.evaluate(() => passwordResetData.requests.length)).toBe(requestCount);
    const blocked = await page.evaluate(() =>
      auditLogData.events.find(e =>
        e.targetAdminId === "ADM-010" && e.eventType === "ADMIN_PASSWORD_RESET_REQUEST"));
    expect(blocked.result).toBe("Failed");
    expect(blocked.failureCode).toBe("COOLDOWN_ACTIVE");
  });
});
