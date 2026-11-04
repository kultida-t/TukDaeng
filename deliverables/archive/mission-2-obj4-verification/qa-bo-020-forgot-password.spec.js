// QA-BO-020: Forgot Password (AIL-024) — public password recovery request จากหน้า Login
// อ้างอิง spec 01_AUTHENTICATION_MODULE §13-14 + AIL-019 Password Recovery Contract
// scope: activate #forgot-password-btn → forgot screen (auth-adjacent), generic response
//        เดียวกันทุก outcome (ห้ามเปิดเผย account existence / eligibility / throttle /
//        delivery), token issuance simulation (RST-xxxxx, 30min, supersede, cooldown 60s,
//        quota 5/24h), audit ADMIN_PASSWORD_RESET_* + delivery DLV-ACCT-*-PWD-*,
//        states ready/submitting/accepted/validation-error/system-error
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

const ELIGIBLE_EMAIL = "current.admin@tukdaeng.example";   // ADM-010 Active
const LOCKED_FAILED_LOGIN_EMAIL = "wichai@tukdaeng.example"; // ADM-007 Locked (failed_login)
const SUSPENDED_EMAIL = "pim@tukdaeng.example";            // ADM-006 Suspended
const INVITED_EMAIL = "nattapol@tukdaeng.example";         // ADM-008 Invited
const UNKNOWN_EMAIL = "nobody@tukdaeng.example";

const GENERIC_MESSAGE = "ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ไปยังอีเมลที่ลงทะเบียน";

// helper: เปิดหน้า forgot จากปุ่มบน Login
async function goToForgot(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForSelector("#forgot-password-btn", { timeout: 10000 });
  await page.locator("#forgot-password-btn").click();
  await page.waitForSelector("#forgot-form", { timeout: 5000 });
}

// helper: เลือก auth scenario ผ่าน evaluate (select อยู่ใน <details> ที่ปิดอยู่ — pattern qa-bo-001)
async function selectAuthScenario(page, scenario) {
  await page.evaluate(sc => {
    const select = document.querySelector("#auth-scenario");
    select.value = sc;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }, scenario);
  await page.waitForTimeout(200);
}

// helper: submit อีเมลแล้วรอ accepted state
async function submitForgot(page, email) {
  await page.locator("#forgot-email").fill(email);
  await page.locator("#forgot-submit").click();
  await page.waitForSelector("[data-forgot-accepted]", { timeout: 5000 });
}

// helper: เลือก prototype scenario (native select)
async function pickForgotScenario(page, value) {
  const tools = page.locator(".forgot-tools");
  const isOpen = await tools.evaluate(el => el.open);
  if (!isOpen) {
    await tools.locator("summary").click();
    await page.waitForTimeout(150);
  }
  await page.locator("#forgot-scenario").selectOption(value);
  await page.waitForTimeout(100);
}

function auditEvents(page) {
  return page.evaluate(() => auditLogData.events);
}

function resetRequests(page) {
  return page.evaluate(() => passwordResetData.requests);
}

// ==================== A. ENTRY + SCREEN STRUCTURE ====================

test.describe("QA-BO-020: Forgot Password — entry & structure", () => {

  test("1. ปุ่ม ลืมรหัสผ่าน? บนหน้า Login กดได้ → เปิด forgot screen และซ่อน login", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#forgot-password-btn", { timeout: 10000 });
    const btn = page.locator("#forgot-password-btn");
    await expect(btn).toBeVisible();
    await expect(btn).toHaveText("ลืมรหัสผ่าน?");
    await btn.click();
    await expect(page.locator("#forgot-screen")).toBeVisible();
    await expect(page.locator("#login-screen")).toBeHidden();
    expect(await page.evaluate(() => document.body.classList.contains("forgot-mode"))).toBe(true);
  });

  test("2. ready state: title + email field (type/autocomplete) + submit + back link + scenario tools", async ({ page }) => {
    await goToForgot(page);
    await expect(page.locator("#forgot-screen .login-title")).toContainText("FORGOT");
    const email = page.locator("#forgot-email");
    await expect(email).toHaveAttribute("type", "email");
    await expect(email).toHaveAttribute("autocomplete", "username");
    await expect(page.locator("#forgot-submit")).toBeVisible();
    await expect(page.locator("[data-forgot-exit]")).toBeVisible();
    await expect(page.locator("#forgot-scenario")).toHaveCount(1);
    // brand identity เหมือน auth screens อื่น
    await expect(page.locator("#forgot-screen .forgot-brand .brand-name")).toHaveText("Tuk Daeng");
  });

  test("3. ลิงก์ กลับไปหน้า Login → กลับ login screen และ login ได้ตามเดิม", async ({ page }) => {
    await goToForgot(page);
    await page.locator("[data-forgot-exit]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#login-screen")).toBeVisible();
    await expect(page.locator("#forgot-screen")).toBeHidden();
    expect(await page.evaluate(() => document.body.classList.contains("forgot-mode"))).toBe(false);
    // login flow เดิมไม่เปลี่ยน
    await page.locator("#login-form button[type=\"submit\"]").click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
  });
});

// ==================== B. VALIDATION ====================

test.describe("QA-BO-020: Forgot Password — validation", () => {

  test("4. email ว่าง → field error + ไม่สร้าง request/audit", async ({ page }) => {
    await goToForgot(page);
    const auditBefore = (await auditEvents(page)).length;
    await page.locator("#forgot-submit").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#forgot-email-error")).toHaveText("กรุณากรอกอีเมล");
    await expect(page.locator("#forgot-email")).toHaveAttribute("aria-invalid", "true");
    expect(await resetRequests(page)).toHaveLength(0);
    expect((await auditEvents(page)).length).toBe(auditBefore);
  });

  test("5. email ผิดรูปแบบ → field error + ไม่สร้าง request/audit", async ({ page }) => {
    await goToForgot(page);
    const auditBefore = (await auditEvents(page)).length;
    await page.locator("#forgot-email").fill("not-an-email");
    await page.locator("#forgot-submit").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#forgot-email-error")).toHaveText("รูปแบบอีเมลไม่ถูกต้อง");
    expect(await resetRequests(page)).toHaveLength(0);
    expect((await auditEvents(page)).length).toBe(auditBefore);
  });

  test("6. พิมพ์แก้ email → field error ถูกเคลียร์", async ({ page }) => {
    await goToForgot(page);
    await page.locator("#forgot-submit").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#forgot-email-error")).toHaveClass(/show/);
    await page.locator("#forgot-email").fill("a@b.co");
    await page.waitForTimeout(150);
    await expect(page.locator("#forgot-email-error")).not.toHaveClass(/show/);
  });
});

// ==================== C. GENERIC RESPONSE — เหมือนกันทุก outcome ====================

test.describe("QA-BO-020: Forgot Password — generic response", () => {

  test("7. eligible Active account → accepted state พร้อม generic message", async ({ page }) => {
    await goToForgot(page);
    await submitForgot(page, ELIGIBLE_EMAIL);
    await expect(page.locator("[data-forgot-accepted]")).toHaveText(GENERIC_MESSAGE);
    await expect(page.locator("[data-forgot-exit]")).toHaveText("กลับไปหน้า Login");
  });

  test("8. unknown email → accepted message เหมือน eligible ทุกตัวอักษร และไม่สร้าง request/audit/delivery", async ({ page }) => {
    await goToForgot(page);
    await submitForgot(page, UNKNOWN_EMAIL);
    await expect(page.locator("[data-forgot-accepted]")).toHaveText(GENERIC_MESSAGE);
    expect(await resetRequests(page)).toHaveLength(0);
    const audits = await auditEvents(page);
    expect(audits.filter(e => e.eventType && e.eventType.startsWith("ADMIN_PASSWORD_RESET"))).toHaveLength(0);
    const deliveryRows = await page.evaluate(() =>
      moduleData.settings.rows.filter(r => r.id && r.id.includes("-PWD-")));
    expect(deliveryRows).toHaveLength(0);
  });

  test("9. Suspended account → accepted เหมือนเดิม + audit Failed ACCOUNT_INELIGIBLE (ไม่ออก token)", async ({ page }) => {
    await goToForgot(page);
    await submitForgot(page, SUSPENDED_EMAIL);
    await expect(page.locator("[data-forgot-accepted]")).toHaveText(GENERIC_MESSAGE);
    expect(await resetRequests(page)).toHaveLength(0);
    const audits = await auditEvents(page);
    const req = audits.find(e => e.eventType === "ADMIN_PASSWORD_RESET_REQUEST");
    expect(req).toBeTruthy();
    expect(req.result).toBe("Failed");
    expect(req.failureCode).toBe("ACCOUNT_INELIGIBLE");
    expect(req.reference).toBe("ADM-006");
    const deliveryRows = await page.evaluate(() =>
      moduleData.settings.rows.filter(r => r.id && r.id.includes("-PWD-")));
    expect(deliveryRows).toHaveLength(0);
  });

  test("10. Invited account → accepted เหมือนเดิม + audit Failed ACCOUNT_INELIGIBLE", async ({ page }) => {
    await goToForgot(page);
    await submitForgot(page, INVITED_EMAIL);
    await expect(page.locator("[data-forgot-accepted]")).toHaveText(GENERIC_MESSAGE);
    const audits = await auditEvents(page);
    const req = audits.find(e => e.eventType === "ADMIN_PASSWORD_RESET_REQUEST");
    expect(req.result).toBe("Failed");
    expect(req.failureCode).toBe("ACCOUNT_INELIGIBLE");
    expect(req.reference).toBe("ADM-008");
  });

  test("11. Locked (failed login) → eligible: ออก token จริง แต่ UI ยัง generic เหมือนเดิม", async ({ page }) => {
    await goToForgot(page);
    await submitForgot(page, LOCKED_FAILED_LOGIN_EMAIL);
    await expect(page.locator("[data-forgot-accepted]")).toHaveText(GENERIC_MESSAGE);
    const requests = await resetRequests(page);
    expect(requests).toHaveLength(1);
    expect(requests[0].targetAdminId).toBe("ADM-007");
    expect(requests[0].status).toBe("Pending");
  });

  test("12. cooldown scenario → accepted เหมือนเดิม + audit COOLDOWN_ACTIVE + ไม่ออก RST ใหม่", async ({ page }) => {
    await goToForgot(page);
    await pickForgotScenario(page, "cooldown");
    await submitForgot(page, ELIGIBLE_EMAIL);
    await expect(page.locator("[data-forgot-accepted]")).toHaveText(GENERIC_MESSAGE);
    // seed สร้าง Expired records — ไม่มี Pending request ใหม่
    const requests = await resetRequests(page);
    expect(requests.filter(r => r.status === "Pending")).toHaveLength(0);
    const audits = await auditEvents(page);
    const req = audits.find(e => e.eventType === "ADMIN_PASSWORD_RESET_REQUEST");
    expect(req.result).toBe("Failed");
    expect(req.failureCode).toBe("COOLDOWN_ACTIVE");
  });

  test("13. quota scenario → accepted เหมือนเดิม + audit QUOTA_EXCEEDED", async ({ page }) => {
    await goToForgot(page);
    await pickForgotScenario(page, "quota");
    await submitForgot(page, ELIGIBLE_EMAIL);
    await expect(page.locator("[data-forgot-accepted]")).toHaveText(GENERIC_MESSAGE);
    const audits = await auditEvents(page);
    const req = audits.find(e => e.eventType === "ADMIN_PASSWORD_RESET_REQUEST");
    expect(req.result).toBe("Failed");
    expect(req.failureCode).toBe("QUOTA_EXCEEDED");
  });

  test("14. delivery-failed → accepted generic เหมือนเดิม แต่ delivery row + audit เป็น Failed", async ({ page }) => {
    await goToForgot(page);
    await pickForgotScenario(page, "delivery-failed");
    await submitForgot(page, ELIGIBLE_EMAIL);
    await expect(page.locator("[data-forgot-accepted]")).toHaveText(GENERIC_MESSAGE);
    // issuance ยัง commit (token ใช้ได้) — เฉพาะการส่งที่ล้มเหลว
    const requests = await resetRequests(page);
    expect(requests).toHaveLength(1);
    expect(requests[0].status).toBe("Pending");
    const deliveryRows = await page.evaluate(() =>
      moduleData.settings.rows.filter(r => r.id && r.id.includes("-PWD-")));
    expect(deliveryRows).toHaveLength(1);
    expect(deliveryRows[0].status).toBe("Failed");
    const audits = await auditEvents(page);
    const dlvAudit = audits.find(e => e.eventType === "ADMIN_PASSWORD_RESET_DELIVERY_ATTEMPT");
    expect(dlvAudit.result).toBe("Failed");
  });
});

// ==================== D. ISSUANCE SIDE-EFFECTS ====================

test.describe("QA-BO-020: Forgot Password — issuance & audit/delivery", () => {

  test("15. eligible → RST-xxxxx Pending 30 นาที + token hash-only + audit + delivery Sent", async ({ page }) => {
    await goToForgot(page);
    await submitForgot(page, ELIGIBLE_EMAIL);
    const requests = await resetRequests(page);
    expect(requests).toHaveLength(1);
    const req = requests[0];
    expect(req.id).toMatch(/^RST-\d{5}$/);
    expect(req.targetAdminId).toBe("ADM-010");
    expect(req.status).toBe("Pending");
    const ttl = new Date(req.expiresAt).getTime() - new Date(req.issuedAt).getTime();
    expect(ttl).toBe(30 * 60 * 1000);
    // เก็บเฉพาะ hash — raw token ไม่อยู่ใน record
    expect(req.tokenHash).toMatch(/^rst-hash-/);
    expect(req.token).toBeUndefined();
    // raw token fixture ถูก mint สำหรับ reset flow (AIL-025 ใช้ต่อ)
    const fixtureCount = await page.evaluate(() => passwordResetTokenFixtures.size);
    expect(fixtureCount).toBe(1);
    // audit: request Success ref RST-xxxxx
    const audits = await auditEvents(page);
    const reqAudit = audits.find(e => e.eventType === "ADMIN_PASSWORD_RESET_REQUEST");
    expect(reqAudit.result).toBe("Success");
    expect(reqAudit.reference).toBe(req.id);
    expect(reqAudit.id).toBe(req.auditRef);
    // delivery: DLV-ACCT-010-PWD-001 + audit attempt
    const deliveryRows = await page.evaluate(() =>
      moduleData.settings.rows.filter(r => r.id && r.id.includes("-PWD-")));
    expect(deliveryRows).toHaveLength(1);
    expect(deliveryRows[0].id).toBe("DLV-ACCT-010-PWD-001");
    expect(deliveryRows[0].status).toBe("Sent");
    expect(deliveryRows[0].name).toBe("Password reset email");
    const dlvAudit = audits.find(e => e.eventType === "ADMIN_PASSWORD_RESET_DELIVERY_ATTEMPT");
    expect(dlvAudit).toBeTruthy();
    expect(dlvAudit.reference).toBe("DLV-ACCT-010-PWD-001");
    // audit/delivery ต้องไม่มี raw token หรือ password
    const blob = JSON.stringify(audits) + JSON.stringify(deliveryRows);
    expect(blob).not.toContain("sim-rst-");
    expect(blob).not.toContain("tukdaeng-admin");
  });

  test("16. request ใหม่หลัง cooldown ผ่าน → supersede Pending เดิม + tokenRevision เพิ่ม", async ({ page }) => {
    await goToForgot(page);
    await submitForgot(page, ELIGIBLE_EMAIL);
    // ย้อนเวลา issuance ให้ผ่าน cooldown แล้วกลับมาขอใหม่ผ่าน UI จริง
    await page.evaluate(email => {
      passwordResetData.issuanceLog[email] = [Date.now() - 61e3];
    }, ELIGIBLE_EMAIL);
    await page.locator("[data-forgot-exit]").click();
    await page.waitForTimeout(300);
    await page.locator("#forgot-password-btn").click();
    await page.waitForSelector("#forgot-form");
    await submitForgot(page, ELIGIBLE_EMAIL);
    const requests = await resetRequests(page);
    expect(requests).toHaveLength(2);
    const [first, second] = requests;
    expect(first.status).toBe("Superseded");
    expect(second.status).toBe("Pending");
    expect(second.tokenRevision).toBe(first.tokenRevision + 1);
    expect(second.supersedesRequestId).toBe(first.id);
  });

  test("17. double-submit: กดส่งซ้ำเร็ว → idempotent สร้าง request เดียว", async ({ page }) => {
    await goToForgot(page);
    await page.locator("#forgot-email").fill(ELIGIBLE_EMAIL);
    await page.locator("#forgot-submit").click();
    // submit ซ้ำระหว่าง processing — guard ต้องกันไม่ให้สร้าง request ที่สอง
    await page.evaluate(() => submitForgotPassword());
    await page.waitForSelector("[data-forgot-accepted]", { timeout: 5000 });
    expect(await resetRequests(page)).toHaveLength(1);
    const audits = await auditEvents(page);
    expect(audits.filter(e => e.eventType === "ADMIN_PASSWORD_RESET_REQUEST")).toHaveLength(1);
  });
});

// ==================== E. SYSTEM ERROR ====================

test.describe("QA-BO-020: Forgot Password — system error", () => {

  test("18. system-error scenario → generic error + retry; retry กลับ form แล้วส่งสำเร็จ", async ({ page }) => {
    await goToForgot(page);
    await pickForgotScenario(page, "system-error");
    await page.locator("#forgot-email").fill(ELIGIBLE_EMAIL);
    await page.locator("#forgot-submit").click();
    await page.waitForSelector("[data-forgot-error]", { timeout: 5000 });
    await expect(page.locator("[data-forgot-error]")).toHaveText("ระบบขัดข้อง กรุณาลองใหม่");
    // generic — ไม่เปิดเผยสาเหตุ และไม่มีคำขอถูกสร้าง
    expect(await resetRequests(page)).toHaveLength(0);
    await page.locator("[data-forgot-retry]").click();
    await page.waitForSelector("#forgot-form");
    // retry → ส่งใหม่สำเร็จ (scenario ค้างเป็น system-error → เปลี่ยนกลับ sent ก่อน)
    await pickForgotScenario(page, "sent");
    await submitForgot(page, ELIGIBLE_EMAIL);
    await expect(page.locator("[data-forgot-accepted]")).toHaveText(GENERIC_MESSAGE);
  });
});

// ==================== F. SECURITY / NO-LEAK + RESPONSIVE ====================

test.describe("QA-BO-020: Forgot Password — security & responsive", () => {

  test("19. DOM/state ที่ผู้ใช้เห็นไม่มี raw token, account id, หรือ failure code", async ({ page }) => {
    await goToForgot(page);
    await submitForgot(page, ELIGIBLE_EMAIL);
    const screenText = await page.locator("#forgot-screen").innerText();
    expect(screenText).not.toContain("RST-");
    expect(screenText).not.toContain("ADM-010");
    expect(screenText).not.toContain("sim-rst-");
    const html = await page.locator("#forgot-content").innerHTML();
    expect(html).not.toContain("sim-rst-");
    expect(html).not.toContain("rst-hash-");
  });

  test("20. forgot screen ไม่มี horizontal overflow และ CTA ใช้งานได้ทุก viewport", async ({ page }) => {
    await goToForgot(page);
    let overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
    await submitForgot(page, ELIGIBLE_EMAIL);
    overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
    await page.locator("[data-forgot-exit]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#login-screen")).toBeVisible();
  });
});

// ==================== G. REGRESSION — Login baseline ====================

test.describe("QA-BO-020: Forgot Password — login regression", () => {

  test("21. login ปกติ + invalid credentials + auth-scenario ยังทำงานเหมือนเดิม", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    // bad-password scenario → generic login error (เดิม)
    await selectAuthScenario(page, "bad-password");
    await page.locator("#login-form button[type=\"submit\"]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#auth-error")).toHaveClass(/show/);
    // success → เข้า app
    await selectAuthScenario(page, "success");
    await page.locator("#login-form button[type=\"submit\"]").click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await expect(page.locator("#page-title")).toHaveText("Dashboard");
  });
});
