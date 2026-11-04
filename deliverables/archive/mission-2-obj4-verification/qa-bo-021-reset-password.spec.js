// QA-BO-021: Reset Password (AIL-025) — public token-consumption flow จากลิงก์ในอีเมล
// อ้างอิง AIL-019 Password Recovery Contract + spec 01_AUTHENTICATION_MODULE §13-15
// scope: route #reset-token=<opaque> (เทียบเท่า /bo/reset-password#token=), token lifecycle
//        (validating/valid/invalid/expired/used/superseded/stale/ineligible), password
//        policy 12 chars + 4 classes + mismatch, atomic commit (credential + token consume
//        + clear failed-login lock + revoke all sessions + audit) → กลับ Login,
//        recovery context ไม่สร้าง session, audit ADMIN_PASSWORD_RESET_* ไม่มี secret
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

const ACTIVE_EMAIL = "current.admin@tukdaeng.example";     // ADM-010 Active
const LOCKED_FAILED_LOGIN_EMAIL = "wichai@tukdaeng.example"; // ADM-007 Locked (failed_login)
const NEW_PASSWORD = "NewPassw0rd!Secure";

// helper: สร้าง reset request จริงผ่าน issuance path แล้วคืน raw token (fixture registry)
async function mintResetToken(page, email) {
  return page.evaluate(async (normalizedEmail) => {
    const result = processPasswordResetRequest(normalizedEmail, `qa-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    if (!result.ok || !result.requestId) return null;
    for (const [token, ref] of passwordResetTokenFixtures) {
      if (ref.requestId === result.requestId) return token;
    }
    return null;
  }, email);
}

// helper: seed request record ตรง (สำหรับเคสที่ issuance path ไม่สร้าง เช่น ineligible account)
async function seedResetToken(page, adminId, overrides = {}) {
  return page.evaluate(([id, ov]) => {
    const acc = adminAccountData.accounts.find(a => a.id === id);
    if (!acc) return null;
    const request = seedPasswordResetLinkFixture(acc, ov);
    return getPasswordResetLinkToken(request);
  }, [adminId, overrides]);
}

// helper: เปิด reset route แล้วรอ state ปลายทาง
async function goToResetWithToken(page, token) {
  await page.goto(`${PROTOTYPE_URL}#reset-token=${token}`);
  await page.waitForSelector("#reset-screen", { timeout: 10000 });
}

async function goToResetForm(page, token) {
  await goToResetWithToken(page, token);
  await page.waitForSelector("#reset-form", { timeout: 5000 });
}

function auditEvents(page) {
  return page.evaluate(() => auditLogData.events);
}

function resetRequests(page) {
  return page.evaluate(() => passwordResetData.requests);
}

function findAccount(page, adminId) {
  return page.evaluate(id => adminAccountData.accounts.find(a => a.id === id), adminId);
}

// ==================== A. ENTRY + ROUTE ====================

test.describe("QA-BO-021: Reset Password — entry & structure", () => {

  test("1. route #reset-token= → reset screen แทน login, token ถูก strip จาก address bar", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    const token = await mintResetToken(page, ACTIVE_EMAIL);
    expect(token).toBeTruthy();
    await goToResetWithToken(page, token);
    await expect(page.locator("#reset-screen")).toBeVisible();
    await expect(page.locator("#login-screen")).toBeHidden();
    expect(await page.evaluate(() => document.body.classList.contains("reset-mode"))).toBe(true);
    // recovery context ไม่สร้าง session — body ยัง logged-out
    expect(await page.evaluate(() => document.body.classList.contains("logged-out"))).toBe(true);
    // raw token ถูก strip ออกจาก location/history
    expect(await page.evaluate(() => window.location.hash)).toBe("");
  });

  test("2. validating state → form state: title, masked email, fields, policy checklist, ไม่มี current password", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    const token = await mintResetToken(page, ACTIVE_EMAIL);
    // validating state ก่อน resolve เสร็จ — assert ใน evaluate เดียวกัน (300ms timer ยังไม่ fire)
    const validating = await page.evaluate(t => {
      enterResetMode(t);
      return {
        state: document.querySelector("#reset-screen").dataset.resetState,
        banner: !!document.querySelector("[data-reset-validating]")
      };
    }, token);
    expect(validating.state).toBe("validating");
    expect(validating.banner).toBe(true);
    await page.waitForSelector("#reset-form", { timeout: 5000 });
    await expect(page.locator("#reset-screen .login-title")).toContainText("RESET");
    // masked email — ไม่เปิดเผย email เต็ม
    await expect(page.locator("[data-reset-field='email']")).toContainText("***@tukdaeng.example");
    await expect(page.locator("[data-reset-field='email']")).not.toContainText("current.admin");
    const pw = page.locator("#reset-password");
    const confirm = page.locator("#reset-password-confirm");
    await expect(pw).toHaveAttribute("type", "password");
    await expect(pw).toHaveAttribute("autocomplete", "new-password");
    await expect(confirm).toHaveAttribute("autocomplete", "new-password");
    // ไม่มี current password field (recovery = possession proof แล้ว)
    await expect(page.locator("#reset-screen input[type='password']")).toHaveCount(2);
    await expect(page.locator("#reset-policy li")).toHaveCount(5);
    await expect(page.locator("#reset-submit")).toBeVisible();
    await expect(page.locator("#reset-password-toggle")).toBeVisible();
    await expect(page.locator("#reset-password-confirm-toggle")).toBeVisible();
    await expect(page.locator("#reset-scenario")).toHaveCount(1);
    await expect(page.locator("#reset-screen .reset-brand .brand-name")).toHaveText("Tuk Daeng");
    // token ไม่ปรากฏใน DOM
    const html = await page.locator("#reset-screen").innerHTML();
    expect(html).not.toContain(token);
    expect(html).not.toContain("sim-rst-");
    expect(html).not.toContain("rst-hash-");
  });

  test("3. BACK TO LOGIN จาก recovery state → กลับ login screen ปกติ", async ({ page }) => {
    await page.goto(`${PROTOTYPE_URL}#reset-token=sim-rst-invalid`);
    await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
    await page.locator("[data-reset-exit]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#login-screen")).toBeVisible();
    await expect(page.locator("#reset-screen")).toBeHidden();
    expect(await page.evaluate(() => document.body.classList.contains("reset-mode"))).toBe(false);
  });
});

// ==================== B. TOKEN LIFECYCLE STATES ====================

test.describe("QA-BO-021: Reset Password — token states", () => {

  test("4. invalid token → LINK NOT VALID + recovery channel ขอลิงก์ใหม่", async ({ page }) => {
    await page.goto(`${PROTOTYPE_URL}#reset-token=sim-rst-invalid`);
    await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
    await expect(page.locator("[data-reset-failure]")).toHaveAttribute("data-reset-failure", "invalid_token");
    await expect(page.locator("[data-reset-failure]")).toHaveAttribute("data-reset-recovery", "invalid");
    await expect(page.locator("#reset-screen .login-title")).toContainText("LINK NOT VALID");
    // unresolvable token → ไม่สร้าง audit (ไม่มี target reference ที่ปลอดภัย)
    const audits = await auditEvents(page);
    expect(audits.filter(e => e.eventType === "ADMIN_PASSWORD_RESET_TOKEN_ACCEPT")).toHaveLength(0);
    // recovery channel → forgot screen
    await page.locator("[data-reset-forgot]").click();
    await page.waitForSelector("#forgot-form", { timeout: 5000 });
    expect(await page.evaluate(() => document.body.classList.contains("forgot-mode"))).toBe(true);
    expect(await page.evaluate(() => document.body.classList.contains("reset-mode"))).toBe(false);
  });

  test("5. expired token → LINK EXPIRED + audit accept Failed EXPIRED + request ไม่ถูกแตะ", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    const token = await seedResetToken(page, "ADM-010", { expiresAt: new Date(Date.now() - 60e3).toISOString() });
    await goToResetWithToken(page, token);
    await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
    await expect(page.locator("[data-reset-failure]")).toHaveAttribute("data-reset-failure", "expired");
    await expect(page.locator("#reset-screen .login-title")).toContainText("LINK EXPIRED");
    const requests = await resetRequests(page);
    expect(requests[0].status).toBe("Pending"); // blocked open ไม่ mutate request
    const audits = await auditEvents(page);
    const accept = audits.find(e => e.eventType === "ADMIN_PASSWORD_RESET_TOKEN_ACCEPT");
    expect(accept.result).toBe("Failed");
    expect(accept.failureCode).toBe("EXPIRED");
    expect(accept.reference).toBe(requests[0].id);
  });

  test("6. used token → LINK ALREADY USED + GO TO LOGIN", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    const token = await seedResetToken(page, "ADM-010", { status: "Used", usedAt: new Date().toISOString() });
    await goToResetWithToken(page, token);
    await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
    await expect(page.locator("[data-reset-failure]")).toHaveAttribute("data-reset-failure", "already_used");
    await expect(page.locator("#reset-screen .login-title")).toContainText("LINK ALREADY USED");
    await expect(page.locator("[data-reset-exit]")).toHaveText("กลับไปหน้า Login");
  });

  test("7. superseded token → LINK REPLACED (request ใหม่ supersede เดิมตาม issuance)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    // request แรก → ขอใหม่หลัง cooldown → request แรกถูก supersede
    const oldToken = await mintResetToken(page, ACTIVE_EMAIL);
    await page.evaluate(email => {
      passwordResetData.issuanceLog[email] = [Date.now() - 61e3];
      processPasswordResetRequest(email, "qa-supersede");
    }, ACTIVE_EMAIL);
    const requests = await resetRequests(page);
    expect(requests[0].status).toBe("Superseded");
    await goToResetWithToken(page, oldToken);
    await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
    await expect(page.locator("[data-reset-failure]")).toHaveAttribute("data-reset-failure", "superseded");
    await expect(page.locator("#reset-screen .login-title")).toContainText("LINK REPLACED");
  });

  test("8. Suspended account → RESET UNAVAILABLE (account_ineligible) + no mutation", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    const token = await seedResetToken(page, "ADM-006"); // Suspended
    await goToResetWithToken(page, token);
    await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
    await expect(page.locator("[data-reset-failure]")).toHaveAttribute("data-reset-failure", "account_ineligible");
    await expect(page.locator("[data-reset-failure]")).toHaveAttribute("data-reset-recovery", "unavailable");
    const acc = await findAccount(page, "ADM-006");
    expect(acc.status).toBe("Suspended");
    const requests = await resetRequests(page);
    expect(requests[0].status).toBe("Pending");
    const audits = await auditEvents(page);
    const accept = audits.find(e => e.eventType === "ADMIN_PASSWORD_RESET_TOKEN_ACCEPT");
    expect(accept.failureCode).toBe("ACCOUNT_INELIGIBLE");
  });

  test("9. security/admin Locked account → blocked (lock_reason_blocked), ไม่ปลดล็อก", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    // ADM-007 ปกติคือ failed_login — QA สลับเป็น security_admin lock เพื่อทดสอบ block
    const token = await page.evaluate(() => {
      const acc = adminAccountData.accounts.find(a => a.id === "ADM-007");
      const request = seedPasswordResetLinkFixture(acc);
      passwordRecoveryLockReason["ADM-007"] = "security_admin";
      return getPasswordResetLinkToken(request);
    });
    await goToResetWithToken(page, token);
    await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
    await expect(page.locator("[data-reset-failure]")).toHaveAttribute("data-reset-failure", "lock_reason_blocked");
    await expect(page.locator("[data-reset-failure]")).toHaveAttribute("data-reset-recovery", "unavailable");
    const acc = await findAccount(page, "ADM-007");
    expect(acc.status).toBe("Locked"); // reset ต้องไม่ปลด security/admin lock
    const audits = await auditEvents(page);
    const accept = audits.find(e => e.eventType === "ADMIN_PASSWORD_RESET_TOKEN_ACCEPT");
    expect(accept.failureCode).toBe("LOCK_REASON_BLOCKED");
  });

  test("10. Invited account → RESET UNAVAILABLE (account_ineligible)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    const token = await seedResetToken(page, "ADM-008"); // Invited
    await goToResetWithToken(page, token);
    await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
    await expect(page.locator("[data-reset-failure]")).toHaveAttribute("data-reset-failure", "account_ineligible");
    const acc = await findAccount(page, "ADM-008");
    expect(acc.status).toBe("Invited");
  });
});

// ==================== C. FORM VALIDATION ====================

test.describe("QA-BO-021: Reset Password — form validation", () => {

  test("11. policy checklist อัปเดตแบบ live ตอนพิมพ์", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    const token = await mintResetToken(page, ACTIVE_EMAIL);
    await goToResetForm(page, token);
    // ทุก rule เริ่มต้น fail
    for (const li of await page.locator("#reset-policy li").all()) {
      await expect(li).toHaveAttribute("data-pass", "false");
    }
    await page.locator("#reset-password").fill("Short1!");
    await page.waitForTimeout(150);
    await expect(page.locator("#reset-policy li[data-reset-rule='length']")).toHaveAttribute("data-pass", "false");
    await expect(page.locator("#reset-policy li[data-reset-rule='upper']")).toHaveAttribute("data-pass", "true");
    await page.locator("#reset-password").fill(NEW_PASSWORD);
    await page.waitForTimeout(150);
    for (const li of await page.locator("#reset-policy li").all()) {
      await expect(li).toHaveAttribute("data-pass", "true");
    }
  });

  test("12. field ว่าง → error ผูก field + aria-invalid/aria-errormessage", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    const token = await mintResetToken(page, ACTIVE_EMAIL);
    await goToResetForm(page, token);
    const auditsBefore = (await auditEvents(page)).length;
    await page.locator("#reset-submit").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#reset-password-error")).toHaveText("กรุณากรอกรหัสผ่านใหม่");
    await expect(page.locator("#reset-password")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#reset-password")).toHaveAttribute("aria-errormessage", "reset-password-error");
    // validation error ไม่ touch request/audit
    const requests = await resetRequests(page);
    expect(requests[0].status).toBe("Pending");
    expect((await auditEvents(page)).filter(e => e.eventType === "ADMIN_PASSWORD_RESET_COMMIT")).toHaveLength(0);
    expect((await auditEvents(page)).length).toBe(auditsBefore);
  });

  test("13. password ไม่ผ่าน policy → error; mismatch → confirm error; พิมพ์แก้เคลียร์ error", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    const token = await mintResetToken(page, ACTIVE_EMAIL);
    await goToResetForm(page, token);
    await page.locator("#reset-password").fill("short");
    await page.locator("#reset-password-confirm").fill("short");
    await page.locator("#reset-submit").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#reset-password-error")).toHaveText("รหัสผ่านยังไม่ตรงตามเงื่อนไข");
    await page.locator("#reset-password").fill(NEW_PASSWORD);
    await page.locator("#reset-password-confirm").fill("DifferentPass1!");
    await page.locator("#reset-submit").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#reset-password-confirm-error")).toHaveText("รหัสผ่านไม่ตรงกัน");
    await expect(page.locator("#reset-password-confirm")).toHaveAttribute("aria-invalid", "true");
    await page.locator("#reset-password-confirm").fill(NEW_PASSWORD);
    await page.waitForTimeout(150);
    await expect(page.locator("#reset-password-confirm-error")).not.toHaveClass(/show/);
  });

  test("14. password toggle สลับ type + aria-label ทั้งสอง field", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    const token = await mintResetToken(page, ACTIVE_EMAIL);
    await goToResetForm(page, token);
    await page.locator("#reset-password-toggle").click();
    await expect(page.locator("#reset-password")).toHaveAttribute("type", "text");
    await expect(page.locator("#reset-password-toggle")).toHaveAttribute("aria-label", "Hide password");
    await page.locator("#reset-password-confirm-toggle").click();
    await expect(page.locator("#reset-password-confirm")).toHaveAttribute("type", "text");
    await page.locator("#reset-password-toggle").click();
    await expect(page.locator("#reset-password")).toHaveAttribute("type", "password");
  });
});

// ==================== D. COMMIT — SUCCESS PATH ====================

test.describe("QA-BO-021: Reset Password — commit", () => {

  test("15. Active account → success: token Used + credential updated + sessions revoked + revision+1 + audit", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    const token = await mintResetToken(page, ACTIVE_EMAIL);
    const accBefore = await findAccount(page, "ADM-010");
    await goToResetForm(page, token);
    await page.locator("#reset-password").fill(NEW_PASSWORD);
    await page.locator("#reset-password-confirm").fill(NEW_PASSWORD);
    await page.locator("#reset-submit").click();
    await page.waitForSelector("[data-reset-success]", { timeout: 5000 });
    // token consumed
    const requests = await resetRequests(page);
    expect(requests[0].status).toBe("Used");
    expect(requests[0].usedAt).toBeTruthy();
    // credential updated (mock store)
    expect(await page.evaluate(() => adminCredentialStore["ADM-010"].password)).toBe(NEW_PASSWORD);
    // revision + session epoch bump
    const accAfter = await findAccount(page, "ADM-010");
    expect(accAfter.revision).toBe((accBefore.revision || 0) + 1);
    expect(accAfter.sessionRevision).toBe((accBefore.sessionRevision || 0) + 1);
    expect(accAfter.status).toBe("Active");
    // ทุก session ถูก revoke
    const sessions = await page.evaluate(() => adminSessionData["ADM-010"].sessions);
    expect(sessions.length).toBeGreaterThan(0);
    expect(sessions.every(s => s.status === "Revoked")).toBe(true);
    // audit: accept + commit
    const audits = await auditEvents(page);
    const accept = audits.find(e => e.eventType === "ADMIN_PASSWORD_RESET_TOKEN_ACCEPT");
    expect(accept.result).toBe("Success");
    const commit = audits.find(e => e.eventType === "ADMIN_PASSWORD_RESET_COMMIT");
    expect(commit.result).toBe("Success");
    expect(commit.reference).toBe(requests[0].id);
    expect(commit.after).toContain("Used");
    // GO TO LOGIN → login screen, ไม่มี session ถูกสร้างจาก recovery
    await page.locator("[data-reset-exit]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#login-screen")).toBeVisible();
    expect(await page.evaluate(() => document.body.classList.contains("logged-out"))).toBe(true);
    await expect(page.locator("#login-form")).toBeVisible();
  });

  test("16. failed-login Locked account → reset ปลดล็อกเป็น Active + clear lock marker", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    const token = await mintResetToken(page, LOCKED_FAILED_LOGIN_EMAIL);
    await goToResetForm(page, token);
    await page.locator("#reset-password").fill(NEW_PASSWORD);
    await page.locator("#reset-password-confirm").fill(NEW_PASSWORD);
    await page.locator("#reset-submit").click();
    await page.waitForSelector("[data-reset-success]", { timeout: 5000 });
    const acc = await findAccount(page, "ADM-007");
    expect(acc.status).toBe("Active");
    expect(acc.lastAction).toContain("ปลดล็อก failed login");
    expect(await page.evaluate(() => passwordRecoveryLockReason["ADM-007"])).toBeUndefined();
    const commit = (await auditEvents(page)).find(e => e.eventType === "ADMIN_PASSWORD_RESET_COMMIT");
    expect(commit.result).toBe("Success");
    expect(commit.note).toContain("ปลดล็อก");
  });

  test("17. replay: เปิด token เดิมซ้ำหลังใช้แล้ว → LINK ALREADY USED (double-use ไม่ได้)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    const token = await mintResetToken(page, ACTIVE_EMAIL);
    await goToResetForm(page, token);
    await page.locator("#reset-password").fill(NEW_PASSWORD);
    await page.locator("#reset-password-confirm").fill(NEW_PASSWORD);
    await page.locator("#reset-submit").click();
    await page.waitForSelector("[data-reset-success]", { timeout: 5000 });
    // navigate ด้วย token เดิมอีกครั้ง
    await page.evaluate(t => { window.location.hash = `reset-token=${t}`; }, token);
    await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
    await expect(page.locator("[data-reset-failure]")).toHaveAttribute("data-reset-failure", "already_used");
    // commit ครั้งเดียวเท่านั้น
    const audits = await auditEvents(page);
    expect(audits.filter(e => e.eventType === "ADMIN_PASSWORD_RESET_COMMIT" && e.result === "Success")).toHaveLength(1);
  });

  test("18. commit-failed scenario → transient state + rollback ครบ + TRY AGAIN re-resolve แล้วสำเร็จ", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    const token = await mintResetToken(page, ACTIVE_EMAIL);
    const accBefore = await findAccount(page, "ADM-010");
    const credBefore = await page.evaluate(() => adminCredentialStore["ADM-010"].password);
    await goToResetForm(page, token);
    // นับหลังเปิด form — TOKEN_ACCEPT audit ของการเปิดลิงก์เป็น trace ที่ถูกต้อง ไม่ใช่ส่วนของ commit
    const auditsBefore = (await auditEvents(page)).length;
    // เลือก scenario commit-failed ผ่าน evaluate (select อยู่ใน details)
    await page.evaluate(() => {
      const s = document.querySelector("#reset-scenario");
      s.value = "commit-failed";
      s.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.locator("#reset-password").fill(NEW_PASSWORD);
    await page.locator("#reset-password-confirm").fill(NEW_PASSWORD);
    await page.locator("#reset-submit").click();
    await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
    await expect(page.locator("[data-reset-failure]")).toHaveAttribute("data-reset-failure", "commit_failed");
    await expect(page.locator("[data-reset-failure]")).toHaveAttribute("data-reset-recovery", "transient");
    // rollback ครบ — request ยัง Pending, account/credential/sessions/audit เหมือนเดิม
    const requests = await resetRequests(page);
    expect(requests[0].status).toBe("Pending");
    expect(requests[0].usedAt).toBeUndefined();
    const accAfter = await findAccount(page, "ADM-010");
    expect(accAfter.revision).toBe(accBefore.revision);
    expect(accAfter.sessionRevision).toBe(accBefore.sessionRevision);
    expect(await page.evaluate(() => adminCredentialStore["ADM-010"].password)).toBe(credBefore);
    const sessions = await page.evaluate(() => adminSessionData["ADM-010"].sessions);
    expect(sessions.every(s => s.status === "Active")).toBe(true);
    expect((await auditEvents(page)).length).toBe(auditsBefore);
    // TRY AGAIN → re-resolve → form กลับมา → เปลี่ยน scenario เป็น commit-ok → สำเร็จ
    await page.locator("[data-reset-retry]").click();
    await page.waitForSelector("#reset-form", { timeout: 5000 });
    await page.evaluate(() => {
      const s = document.querySelector("#reset-scenario");
      s.value = "commit-ok";
      s.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.locator("#reset-password").fill(NEW_PASSWORD);
    await page.locator("#reset-password-confirm").fill(NEW_PASSWORD);
    await page.locator("#reset-submit").click();
    await page.waitForSelector("[data-reset-success]", { timeout: 5000 });
    expect((await resetRequests(page))[0].status).toBe("Used");
  });

  test("19. stale: account revision เปลี่ยนระหว่างเปิด form → submit ถูกบล็อก STALE_REQUEST + retry re-resolve", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    const token = await mintResetToken(page, ACTIVE_EMAIL);
    await goToResetForm(page, token);
    // จำลอง admin แตะบัญชีหลังเปิด form (เช่น role change) → snapshot stale
    await page.evaluate(() => {
      const acc = adminAccountData.accounts.find(a => a.id === "ADM-010");
      acc.revision = (acc.revision || 0) + 1;
    });
    await page.locator("#reset-password").fill(NEW_PASSWORD);
    await page.locator("#reset-password-confirm").fill(NEW_PASSWORD);
    await page.locator("#reset-submit").click();
    await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
    await expect(page.locator("[data-reset-failure]")).toHaveAttribute("data-reset-failure", "stale_request");
    await expect(page.locator("[data-reset-failure]")).toHaveAttribute("data-reset-recovery", "transient");
    // ไม่มี mutation — request ยัง Pending
    const requests = await resetRequests(page);
    expect(requests[0].status).toBe("Pending");
    const audits = await auditEvents(page);
    const commit = audits.find(e => e.eventType === "ADMIN_PASSWORD_RESET_COMMIT");
    expect(commit.result).toBe("Failed");
    expect(commit.failureCode).toBe("STALE_REQUEST");
    // TRY AGAIN → re-resolve ด้วย snapshot ใหม่ → form → submit สำเร็จ
    await page.locator("[data-reset-retry]").click();
    await page.waitForSelector("#reset-form", { timeout: 5000 });
    await page.locator("#reset-password").fill(NEW_PASSWORD);
    await page.locator("#reset-password-confirm").fill(NEW_PASSWORD);
    await page.locator("#reset-submit").click();
    await page.waitForSelector("[data-reset-success]", { timeout: 5000 });
  });
});

// ==================== E. SECURITY / NO-LEAK + RESPONSIVE ====================

test.describe("QA-BO-021: Reset Password — security & responsive", () => {

  test("20. DOM/audit/delivery ไม่มี raw token, token hash, password หรือ secret", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    const token = await mintResetToken(page, ACTIVE_EMAIL);
    await goToResetForm(page, token);
    await page.locator("#reset-password").fill(NEW_PASSWORD);
    await page.locator("#reset-password-confirm").fill(NEW_PASSWORD);
    await page.locator("#reset-submit").click();
    await page.waitForSelector("[data-reset-success]", { timeout: 5000 });
    const screenText = await page.locator("#reset-screen").innerText();
    expect(screenText).not.toContain("RST-");
    expect(screenText).not.toContain("ADM-010");
    expect(screenText).not.toContain("sim-rst-");
    expect(screenText).not.toContain(NEW_PASSWORD);
    const audits = await auditEvents(page);
    const deliveryRows = await page.evaluate(() =>
      moduleData.settings.rows.filter(r => r.id && r.id.includes("-PWD-")));
    const blob = JSON.stringify(audits) + JSON.stringify(deliveryRows);
    expect(blob).not.toContain("sim-rst-");
    expect(blob).not.toContain("rst-hash-");
    expect(blob).not.toContain(NEW_PASSWORD);
    expect(blob).not.toContain(token);
  });

  test("21. reset screen ไม่มี horizontal overflow ทุก state (form/error/success)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForSelector("#login-form", { timeout: 10000 });
    const token = await mintResetToken(page, ACTIVE_EMAIL);
    await goToResetForm(page, token);
    let overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
    await page.locator("#reset-password").fill(NEW_PASSWORD);
    await page.locator("#reset-password-confirm").fill(NEW_PASSWORD);
    await page.locator("#reset-submit").click();
    await page.waitForSelector("[data-reset-success]", { timeout: 5000 });
    overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
    await page.locator("[data-reset-exit]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#login-screen")).toBeVisible();
  });
});

// ==================== F. REGRESSION — Login + Forgot baseline ====================

test.describe("QA-BO-021: Reset Password — login/forgot regression", () => {

  test("22. login + forgot flow เดิมไม่เปลี่ยน หลัง reset flow เข้ามา", async ({ page }) => {
    await page.goto(`${PROTOTYPE_URL}#reset-token=sim-rst-invalid`);
    await page.waitForSelector("[data-reset-failure]", { timeout: 5000 });
    await page.locator("[data-reset-exit]").click();
    await page.waitForTimeout(300);
    // forgot flow เดิมยังทำงาน
    await page.locator("#forgot-password-btn").click();
    await page.waitForSelector("#forgot-form", { timeout: 5000 });
    await page.locator("#forgot-email").fill(ACTIVE_EMAIL);
    await page.locator("#forgot-submit").click();
    await page.waitForSelector("[data-forgot-accepted]", { timeout: 5000 });
    await page.locator("[data-forgot-exit]").click();
    await page.waitForTimeout(300);
    // login ปกติยังเข้าได้
    await page.locator("#login-form button[type=\"submit\"]").click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await expect(page.locator("#page-title")).toHaveText("Dashboard");
  });
});
