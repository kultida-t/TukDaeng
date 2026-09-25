// QA-BO-015: Accept Invitation & Initial Password Activation (AIL-008)
// contract: 01_AUTHENTICATION_MODULE.md §10.1 & 16_ADMIN_SETTINGS_MODULE.md §8.9
// recipient-side flow — one-time link, atomic Pending→Used + Invited→Active, no OTP during activation
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";
// opaque prototype fixture token สำหรับ INV-00001 r1 — seed ใน adminInvitationLinkTokenFixtures
// (ไม่ encode/derive จาก invitation id/revision — ตรงกับ opaque-token semantics ของ §10.1)
const VALID_TOKEN = "sim-token-kq8f2x7m4d9e1b6a";
const VALID_PASSWORD = "Tukdaeng#2026xy";
const inviteUrl = token => `${PROTOTYPE_URL}#token=${token}`;

async function inviteState(page) {
  return page.evaluate(() => ({
    inviteState: document.querySelector("#invite-screen")?.dataset.inviteState || null,
    inviteMode: document.body.classList.contains("invite-mode"),
    loggedOut: document.body.classList.contains("logged-out"),
    invitation: adminAccountData.invitations.find(i => i.id === "INV-00001") || null,
    account: adminAccountData.accounts.find(a => a.id === "ADM-008") || null,
    acceptAudits: auditLogData.events.filter(e => e.eventType === "ADMIN_INVITATION_ACCEPT"),
    activateAudits: auditLogData.events.filter(e => e.eventType === "ADMIN_INVITATION_ACTIVATE"),
    auditCount: auditLogData.events.length,
    activity: (adminAccountData.detail["ADM-008"]?.activity || []).map(a => a.action),
    auditRefs: adminAccountData.detail["ADM-008"]?.auditRefs || []
  }));
}

async function fillInvitePassword(page, password, confirm) {
  await page.locator("#invite-password").fill(password);
  await page.locator("#invite-password-confirm").fill(confirm ?? password);
}

test.describe("QA-BO-015: Accept Invitation & Initial Password Activation (AIL-008)", () => {

  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440" && testInfo.project.name !== "mobile-390", "desktop-1440 and mobile-390 only");
  });

  test("1. Valid link → form state + context read-only + hash stripped + no OTP field", async ({ page }) => {
    await page.goto(inviteUrl(VALID_TOKEN));
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#invite-screen")).toBeVisible();
    await expect(page.locator("#login-screen")).toBeHidden();
    await expect(page.locator("#invite-form")).toBeVisible();
    // context read-only — แสดง Name/Email/Role จาก invitation target
    await expect(page.locator('[data-invite-field="name"]')).toHaveText("นัฐพล พัฒนา");
    await expect(page.locator('[data-invite-field="email"]')).toHaveText("nattapol@tukdaeng.example");
    await expect(page.locator('[data-invite-field="role"]')).toHaveText("Admin Manager");
    // ไม่มี OTP field ใน activation flow
    await expect(page.locator("#invite-screen #otp-form")).toHaveCount(0);
    await expect(page.locator("#invite-screen #otp-code")).toHaveCount(0);
    // fragment ถูก strip ออกจาก address bar หลัง capture
    expect(page.url()).not.toContain("#token");
    // state: form + audit ACCEPT emitted
    const state = await inviteState(page);
    expect(state.inviteState).toBe("form");
    expect(state.inviteMode).toBe(true);
    expect(state.loggedOut).toBe(true);
    expect(state.acceptAudits.length).toBe(1);
    expect(state.acceptAudits[0].result).toBe("Success");
    expect(state.acceptAudits[0].invitationId).toBe("INV-00001");
    expect(state.activity[0]).toBe("Invitation link opened");
  });

  test("2. Password policy — แต่ละ rule ต้องผ่านก่อน submit และไม่มี mutation ถ้า invalid", async ({ page }) => {
    await page.goto(inviteUrl(VALID_TOKEN));
    await page.waitForLoadState("networkidle");
    // field-level error: required → "กรุณากรอก...", policy → "รหัสผ่านยังไม่ตรงตามเงื่อนไข" ใต้ field
    // checklist เป็นตัวแสดงรายละเอียดเงื่อนไขที่ผ่าน/ไม่ผ่าน; form-level #invite-error ต้องว่างเสมอ
    const POLICY_ERROR = "รหัสผ่านยังไม่ตรงตามเงื่อนไข";

    // both empty → required errors ใต้แต่ละ field (ไม่ใช่ form-level error)
    await page.locator("#invite-submit").click();
    await expect(page.locator("#invite-password-error")).toContainText("กรุณากรอกรหัสผ่านใหม่");
    await expect(page.locator("#invite-password-confirm-error")).toContainText("กรุณายืนยันรหัสผ่าน");
    await expect(page.locator("#invite-password")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#invite-error")).not.toHaveClass(/show/);
    let state = await inviteState(page);
    expect(state.invitation.status).toBe("Pending");
    expect(state.account.status).toBe("Invited");

    // checklist live update — length only (password มีค่าแต่ไม่ผ่าน policy → field error ใต้รหัสผ่านใหม่)
    await fillInvitePassword(page, "abcdefghijklm");
    await expect(page.locator('[data-invite-rule="length"]')).toHaveAttribute("data-pass", "true");
    await expect(page.locator('[data-invite-rule="upper"]')).toHaveAttribute("data-pass", "false");
    await page.locator("#invite-submit").click();
    await expect(page.locator("#invite-password-error")).toContainText(POLICY_ERROR);
    await expect(page.locator("#invite-error")).not.toHaveClass(/show/);

    // missing lowercase
    await fillInvitePassword(page, "ABCDEFGHIJKL1!");
    await expect(page.locator('[data-invite-rule="lower"]')).toHaveAttribute("data-pass", "false");
    await page.locator("#invite-submit").click();
    await expect(page.locator("#invite-password-error")).toContainText(POLICY_ERROR);

    // missing digit
    await fillInvitePassword(page, "Abcdefghijkl!");
    await expect(page.locator('[data-invite-rule="digit"]')).toHaveAttribute("data-pass", "false");
    await page.locator("#invite-submit").click();
    await expect(page.locator("#invite-password-error")).toContainText(POLICY_ERROR);

    // missing special
    await fillInvitePassword(page, "Abcdefghijk12");
    await expect(page.locator('[data-invite-rule="special"]')).toHaveAttribute("data-pass", "false");
    await page.locator("#invite-submit").click();
    await expect(page.locator("#invite-password-error")).toContainText(POLICY_ERROR);

    state = await inviteState(page);
    expect(state.invitation.status).toBe("Pending");
    expect(state.account.status).toBe("Invited");
    expect(state.activateAudits.length).toBe(0);
  });

  test("3. Confirm mismatch → error + ไม่มี mutation", async ({ page }) => {
    await page.goto(inviteUrl(VALID_TOKEN));
    await page.waitForLoadState("networkidle");
    await fillInvitePassword(page, VALID_PASSWORD, "Different#2026xy");
    await page.locator("#invite-submit").click();
    // mismatch เป็น field-level error ใต้ยืนยันรหัสผ่าน — ไม่ใช่ form-level box
    await expect(page.locator("#invite-password-confirm-error")).toContainText("รหัสผ่านไม่ตรงกัน");
    await expect(page.locator("#invite-password-confirm")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#invite-password-error")).not.toHaveClass(/show/);
    await expect(page.locator("#invite-error")).not.toHaveClass(/show/);
    const state = await inviteState(page);
    expect(state.invitation.status).toBe("Pending");
    expect(state.account.status).toBe("Invited");
    expect(state.activateAudits.length).toBe(0);
  });

  test("4. Valid submit → Pending→Used + Invited→Active atomic + audit + ไม่มี auto-session", async ({ page }) => {
    await page.goto(inviteUrl(VALID_TOKEN));
    await page.waitForLoadState("networkidle");
    await fillInvitePassword(page, VALID_PASSWORD);
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(300);

    await expect(page.locator("#invite-screen")).toHaveAttribute("data-invite-state", "success");
    await expect(page.locator("#invite-content")).toContainText("ACCOUNT ACTIVATED");

    const state = await inviteState(page);
    expect(state.invitation.status).toBe("Used");
    expect(state.invitation.usedAt).toBeTruthy();
    expect(state.account.status).toBe("Active");
    expect(state.account.revision).toBe(2);
    // ไม่มี auto-session — body ยัง logged-out
    expect(state.loggedOut).toBe(true);
    // audit: ACTIVATE Success + ACCEPT Success ก่อนหน้า
    expect(state.activateAudits.length).toBe(1);
    expect(state.activateAudits[0].result).toBe("Success");
    expect(state.activateAudits[0].invitationId).toBe("INV-00001");
    expect(state.activateAudits[0].correlationId).toBe("COR-INV-00001");
    // History & Actions: activation row + audit ref link
    expect(state.activity[0]).toBe("Activated (invitation)");
    expect(state.auditRefs[0]).toBe(state.activateAudits[0].id);
    // password ห้ามค้างใน DOM หรือ state
    await expect(page.locator("#invite-password")).toHaveCount(0);
    const dump = await page.evaluate(() =>
      JSON.stringify(adminAccountData) + JSON.stringify(auditLogData.events));
    expect(dump).not.toContain(VALID_PASSWORD);
  });

  test("5. Token reuse → invalid state already_used + audit Failed + ไม่มี mutation ซ้ำ", async ({ page }) => {
    await page.goto(inviteUrl(VALID_TOKEN));
    await page.waitForLoadState("networkidle");
    await fillInvitePassword(page, VALID_PASSWORD);
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(300);
    expect((await inviteState(page)).account.status).toBe("Active");

    // เปิดลิงก์เดิมอีกครั้ง (refresh/back simulation)
    await page.evaluate(token => enterInviteMode(token), VALID_TOKEN);
    await expect(page.locator("#invite-screen")).toHaveAttribute("data-invite-state", "invalid");
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "already_used");

    const state = await inviteState(page);
    expect(state.invitation.status).toBe("Used");
    expect(state.account.status).toBe("Active");
    expect(state.account.revision).toBe(2);
    // blocked attempt ที่ resolve ได้ → audit Failed (accept attempt)
    expect(state.acceptAudits.some(a => a.result === "Failed" && a.failureCode === "ALREADY_USED")).toBe(true);
    // ไม่มี ACTIVATE Success ซ้ำ
    expect(state.activateAudits.filter(a => a.result === "Success").length).toBe(1);
  });

  test("6. Double submit → activation ครั้งเดียวเท่านั้น", async ({ page }) => {
    await page.goto(inviteUrl(VALID_TOKEN));
    await page.waitForLoadState("networkidle");
    await fillInvitePassword(page, VALID_PASSWORD);
    // replay: form ถูก re-render หลัง commit — ยิง submit handler ซ้ำตรง ๆ เพื่อจำลอง race/replay
    await page.evaluate(() => {
      document.querySelector("#invite-submit").click();
      submitInviteActivation();
      submitInviteActivation();
    });
    await page.waitForTimeout(300);

    const state = await inviteState(page);
    expect(state.inviteState).toBe("success");
    expect(state.activateAudits.filter(a => a.result === "Success").length).toBe(1);
    expect(state.activity.filter(a => a === "Activated (invitation)").length).toBe(1);
  });

  test("7. Garbage/unknown token → invalid_token + ไม่ audit (unresolvable)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    const before = (await inviteState(page)).auditCount;

    await page.evaluate(() => enterInviteMode("totally-invalid-token"));
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "invalid_token");

    await page.evaluate(() => enterInviteMode("sim-token-unkn0wn0000000"));
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "invalid_token");

    const state = await inviteState(page);
    expect(state.auditCount).toBe(before);
    expect(state.invitation.status).toBe("Pending");
    expect(state.account.status).toBe("Invited");
  });

  test("8. Expired link → invalid state + audit Failed + ไม่ activate", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await page.evaluate(token => {
      applyAdminInvitationScenario("ADM-008", "expired");
      enterInviteMode(token);
    }, VALID_TOKEN);

    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "expired");
    const state = await inviteState(page);
    expect(state.invitation.status).toBe("Expired");
    expect(state.account.status).toBe("Invited");
    expect(state.acceptAudits.some(a => a.result === "Failed" && a.failureCode === "EXPIRED")).toBe(true);
  });

  test("9. Cancelled link → invalid state + ไม่ activate", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await page.evaluate(token => {
      applyAdminInvitationScenario("ADM-008", "cancelled");
      enterInviteMode(token);
    }, VALID_TOKEN);
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "cancelled");
    const state = await inviteState(page);
    expect(state.invitation.status).toBe("Cancelled");
    expect(state.account.status).toBe("Invited");
  });

  test("10. Superseded link → invalid state; link revision ใหม่ยังใช้งานได้", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    // supersede INV-00001 — invitation ใหม่เป็น INV-00002 r2
    await page.evaluate(() => applyAdminInvitationScenario("ADM-008", "superseded"));
    await page.evaluate(token => enterInviteMode(token), VALID_TOKEN);
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "superseded");
    let state = await inviteState(page);
    expect(state.invitation.status).toBe("Superseded");
    expect(state.account.status).toBe("Invited");

    // revision token ใหม่ของ current invitation ยัง valid → form state
    // (mint opaque fixture สำหรับ INV-00002 r2 ผ่าน helper — token ไม่ encode id/revision)
    await page.evaluate(() => {
      exitInviteMode();
      const inv = adminAccountData.invitations.find(i => i.id === "INV-00002");
      enterInviteMode(getAdminInvitationLinkToken(inv));
    });
    await expect(page.locator("#invite-form")).toBeVisible();
    await expect(page.locator('[data-invite-field="name"]')).toHaveText("นัฐพล พัฒนา");
  });

  test("11. Stale revision token → invalid state stale_revision", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    // fixture ที่ผูกกับ revision เก่า (mint ตอน r9 คาดหวัง แต่ current = r1) → stale
    await page.evaluate(() => {
      adminInvitationLinkTokenFixtures.set("sim-token-stale0ldrev000", { invitationId: "INV-00001", tokenRevision: 9 });
      enterInviteMode("sim-token-stale0ldrev000");
    });
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "stale_revision");
    const state = await inviteState(page);
    expect(state.invitation.status).toBe("Pending");
    expect(state.account.status).toBe("Invited");
  });

  test("12. Account ไม่ใช่ Invited → invalid state account_ineligible", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await page.evaluate(token => {
      adminAccountData.accounts.find(a => a.id === "ADM-008").status = "Suspended";
      enterInviteMode(token);
    }, VALID_TOKEN);
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "account_ineligible");
    const state = await inviteState(page);
    expect(state.invitation.status).toBe("Pending");
    expect(state.account.status).toBe("Suspended");
    expect(state.acceptAudits.some(a => a.result === "Failed" && a.failureCode === "ACCOUNT_INELIGIBLE")).toBe(true);
  });

  test("13. Role ไม่ eligible → invalid state role_ineligible", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await page.evaluate(token => {
      roleListData.roles.find(r => r.id === "ROL-002").status = "Inactive";
      enterInviteMode(token);
    }, VALID_TOKEN);
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "role_ineligible");
    const state = await inviteState(page);
    expect(state.invitation.status).toBe("Pending");
    expect(state.account.status).toBe("Invited");
  });

  test("14. Commit-time revalidation — ยกเลิกคำเชิญหลังเปิด form → activate ถูก block", async ({ page }) => {
    await page.goto(inviteUrl(VALID_TOKEN));
    await page.waitForLoadState("networkidle");
    await fillInvitePassword(page, VALID_PASSWORD);
    // admin ยกเลิกคำเชิญหลังผู้รับเปิด form แล้ว → commit ต้อง re-validate และ block
    await page.evaluate(() => {
      commitAdminInvitationCancel("ADM-008", { invitationId: "INV-00001", tokenRevision: 1, accountRevision: 1 });
    });
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(300);
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "cancelled");
    const state = await inviteState(page);
    expect(state.invitation.status).toBe("Cancelled");
    expect(state.account.status).toBe("Invited");
    expect(state.activateAudits.some(a => a.result === "Failed" && a.failureCode === "CANCELLED")).toBe(true);
  });

  test("15. Success → กลับ Login ได้ และ Login ด้วย Email + Password เข้าระบบได้ทันที (ไม่มี OTP)", async ({ page }) => {
    await page.goto(inviteUrl(VALID_TOKEN));
    await page.waitForLoadState("networkidle");
    await fillInvitePassword(page, VALID_PASSWORD);
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(300);

    await page.locator("[data-invite-exit]").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#invite-screen")).toBeHidden();
    await expect(page.locator("#login-screen")).toBeVisible();
    const state = await inviteState(page);
    expect(state.inviteMode).toBe(false);
    expect(state.loggedOut).toBe(true);

    // login ครั้งถัดไปใช้ Email + Password → เข้า BO ตรง ไม่มี OTP step
    await page.locator("#login-form button[type=\"submit\"]").click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await expect(page.locator("#otp-form")).toHaveCount(0);
    await expect(page.locator("#page-title")).toHaveText("Dashboard");
  });

  test("16. Refresh หลัง consume — hash ถูก strip แล้ว จึงกลับมาที่ Login (token ไม่ค้างใน URL)", async ({ page }) => {
    await page.goto(inviteUrl(VALID_TOKEN));
    await page.waitForLoadState("networkidle");
    await fillInvitePassword(page, VALID_PASSWORD);
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(300);
    expect((await inviteState(page)).inviteState).toBe("success");

    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#login-screen")).toBeVisible();
    await expect(page.locator("#invite-screen")).toBeHidden();
    expect(page.url()).not.toContain("#token");
  });

  test("17. Missing token → invalid state invalid_token", async ({ page }) => {
    await page.goto(`${PROTOTYPE_URL}#token=`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#invite-screen")).toBeVisible();
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "invalid_token");
  });

  test("18. Mobile 390px — invite screen render + activate ได้ครบ", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-390", "mobile-390 only");
    await page.goto(inviteUrl(VALID_TOKEN));
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#invite-screen")).toBeVisible();
    await expect(page.locator("#invite-form")).toBeVisible();
    await expect(page.locator('[data-invite-field="name"]')).toHaveText("นัฐพล พัฒนา");
    await fillInvitePassword(page, VALID_PASSWORD);
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#invite-screen")).toHaveAttribute("data-invite-state", "success");
    expect((await inviteState(page)).account.status).toBe("Active");
  });
});
