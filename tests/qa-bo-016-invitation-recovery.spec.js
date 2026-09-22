// QA-BO-016: Safe Recovery States สำหรับ Invitation ที่ใช้ไม่ได้ (AIL-009)
// contract: 01_AUTHENTICATION_MODULE.md §10.1 Safe Resolution States + §14 Error states
// + 16_ADMIN_SETTINGS_MODULE.md §20 (Invitation stale/race/replay)
// per-state safe recovery: invalid/expired/used/cancelled/superseded/unavailable/transient
// ห้ามเปิดเผย token/revision/account existence เกินจำเป็น; recovery path ไม่วนลูป
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";
// opaque prototype fixture token สำหรับ INV-00001 r1 — seed ใน adminInvitationLinkTokenFixtures
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
    auditCount: auditLogData.events.length
  }));
}

async function fillInvitePassword(page, password, confirm) {
  await page.locator("#invite-password").fill(password);
  await page.locator("#invite-password-confirm").fill(confirm ?? password);
}

// helper: ตั้ง scenario ผ่าน canonical tool แล้วเปิด link ด้วย fixture token เดิม
async function openInviteWithScenario(page, scenario) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await page.evaluate(({ scenario, token }) => {
    applyAdminInvitationScenario("ADM-008", scenario);
    enterInviteMode(token);
  }, { scenario, token: VALID_TOKEN });
}

test.describe("QA-BO-016: Invitation Safe Recovery States (AIL-009)", () => {

  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440" && testInfo.project.name !== "mobile-390", "desktop-1440 and mobile-390 only");
  });

  test("1. Expired → recovery 'expired': LINK EXPIRED + exit-only + ไม่มี form/mutation", async ({ page }) => {
    await openInviteWithScenario(page, "expired");

    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "expired");
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-recovery", "expired");
    await expect(page.locator("#invite-content")).toContainText("LINK EXPIRED");
    await expect(page.locator("#invite-content")).toContainText("ติดต่อผู้ดูแลระบบ");
    // terminal state = exit-only, ไม่มี retry loop
    await expect(page.locator("[data-invite-exit]")).toHaveText("BACK TO LOGIN");
    await expect(page.locator("[data-invite-retry]")).toHaveCount(0);
    // ไม่มี password form — expired token ตั้ง initial password ไม่ได้
    await expect(page.locator("#invite-form")).toHaveCount(0);

    const state = await inviteState(page);
    expect(state.invitation.status).toBe("Expired");
    expect(state.account.status).toBe("Invited");
    expect(state.acceptAudits.some(a => a.result === "Failed" && a.failureCode === "EXPIRED")).toBe(true);
  });

  test("2. Cancelled → recovery 'cancelled' + contact-admin channel + direct commit ถูก block", async ({ page }) => {
    await openInviteWithScenario(page, "cancelled");

    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-recovery", "cancelled");
    await expect(page.locator("#invite-content")).toContainText("INVITATION CANCELLED");
    await expect(page.locator("#invite-form")).toHaveCount(0);
    await expect(page.locator("[data-invite-retry]")).toHaveCount(0);

    // direct activation call ต้อง block — ไม่มี state ใด bypass eligibility
    const direct = await page.evaluate(() => commitAdminInvitationActivation());
    expect(direct.ok).toBe(false);
    expect(direct.code).toBe("cancelled");
    const state = await inviteState(page);
    expect(state.invitation.status).toBe("Cancelled");
    expect(state.account.status).toBe("Invited");
  });

  test("3. Superseded → recovery 'superseded': LINK REPLACED + hint เปิดลิงก์ฉบับล่าสุด", async ({ page }) => {
    await openInviteWithScenario(page, "superseded");

    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-recovery", "superseded");
    await expect(page.locator("#invite-content")).toContainText("LINK REPLACED");
    await expect(page.locator("#invite-content")).toContainText("อีเมลคำเชิญฉบับล่าสุด");
    await expect(page.locator("#invite-form")).toHaveCount(0);

    const direct = await page.evaluate(() => commitAdminInvitationActivation());
    expect(direct.ok).toBe(false);
    const state = await inviteState(page);
    expect(state.invitation.status).toBe("Superseded");
    expect(state.account.status).toBe("Invited");
  });

  test("4. Used → recovery 'used': LINK ALREADY USED + GO TO LOGIN (บัญชี active แล้ว)", async ({ page }) => {
    // activate จริงก่อน แล้วเปิดลิงก์เดิมซ้ำ
    await page.goto(inviteUrl(VALID_TOKEN));
    await page.waitForLoadState("networkidle");
    await fillInvitePassword(page, VALID_PASSWORD);
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(300);
    expect((await inviteState(page)).account.status).toBe("Active");

    await page.evaluate(token => enterInviteMode(token), VALID_TOKEN);
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-recovery", "used");
    await expect(page.locator("#invite-content")).toContainText("LINK ALREADY USED");
    // recovery channel ของ used = กลับ Login (บัญชีเปิดใช้งานแล้ว ไม่ใช่ขอคำเชิญใหม่)
    await expect(page.locator("[data-invite-exit]")).toHaveText("GO TO LOGIN");
    await expect(page.locator("#invite-content")).toContainText("Email OTP");
    await expect(page.locator("#invite-form")).toHaveCount(0);
  });

  test("5. Unknown/malformed/missing token → recovery 'invalid' generic — ไม่เปิดเผย account existence", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    const before = (await inviteState(page)).auditCount;

    for (const bad of ["totally-invalid-token", "sim-token-unkn0wn0000000", null]) {
      await page.evaluate(t => enterInviteMode(t), bad);
      await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "invalid_token");
      await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-recovery", "invalid");
      await expect(page.locator("#invite-content")).toContainText("INVALID LINK");
      // generic copy — ห้ามบอกว่ามี account/invitation อยู่หรือไม่
      await expect(page.locator("#invite-content")).not.toContainText("นัฐพล");
      await expect(page.locator("#invite-content")).not.toContainText("ADM-008");
      await expect(page.locator("#invite-content")).not.toContainText("INV-00001");
    }

    const state = await inviteState(page);
    // unresolvable token ไม่สร้าง audit target reference
    expect(state.auditCount).toBe(before);
    expect(state.invitation.status).toBe("Pending");
    expect(state.account.status).toBe("Invited");
  });

  test("6. Account ineligible → recovery 'unavailable' generic + audit Failed + ไม่เปลี่ยน state", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await page.evaluate(token => {
      adminAccountData.accounts.find(a => a.id === "ADM-008").status = "Suspended";
      enterInviteMode(token);
    }, VALID_TOKEN);

    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "account_ineligible");
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-recovery", "unavailable");
    await expect(page.locator("#invite-content")).toContainText("ACTIVATION UNAVAILABLE");
    // ข้อความกลาง — ไม่เปิดเผยสถานะจริงของบัญชี (Suspended) หรือ role detail
    await expect(page.locator("#invite-content")).not.toContainText("Suspended");
    await expect(page.locator("#invite-content")).not.toContainText("Admin Manager");
    await expect(page.locator("#invite-form")).toHaveCount(0);

    const direct = await page.evaluate(() => commitAdminInvitationActivation());
    expect(direct.ok).toBe(false);
    expect(direct.code).toBe("account_ineligible");
    const state = await inviteState(page);
    expect(state.invitation.status).toBe("Pending");
    expect(state.account.status).toBe("Suspended");
    expect(state.acceptAudits.some(a => a.result === "Failed" && a.failureCode === "ACCOUNT_INELIGIBLE")).toBe(true);
  });

  test("7. Role ineligible → recovery 'unavailable' + ไม่เปลี่ยน state", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await page.evaluate(token => {
      roleListData.roles.find(r => r.id === "ROL-002").status = "Inactive";
      enterInviteMode(token);
    }, VALID_TOKEN);

    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "role_ineligible");
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-recovery", "unavailable");
    await expect(page.locator("#invite-form")).toHaveCount(0);

    const state = await inviteState(page);
    expect(state.invitation.status).toBe("Pending");
    expect(state.account.status).toBe("Invited");
    expect(state.acceptAudits.some(a => a.result === "Failed" && a.failureCode === "ROLE_INELIGIBLE")).toBe(true);
  });

  test("8. Stale revision token → recovery 'superseded' (มีลิงก์ใหม่กว่า)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      adminInvitationLinkTokenFixtures.set("sim-token-stale0ldrev000", { invitationId: "INV-00001", tokenRevision: 9 });
      enterInviteMode("sim-token-stale0ldrev000");
    });
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "stale_revision");
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-recovery", "superseded");
    await expect(page.locator("#invite-content")).toContainText("LINK REPLACED");
    const state = await inviteState(page);
    expect(state.invitation.status).toBe("Pending");
    expect(state.account.status).toBe("Invited");
  });

  test("9. Transient stale_invitation ณ submit → retry re-resolve → form → activate สำเร็จ (ไม่วนลูป)", async ({ page }) => {
    await page.goto(inviteUrl(VALID_TOKEN));
    await page.waitForLoadState("networkidle");
    await fillInvitePassword(page, VALID_PASSWORD);
    // state เปลี่ยนระหว่างเปิด form กับ submit — snapshot mismatch → stale_invitation
    await page.evaluate(() => {
      adminAccountData.accounts.find(a => a.id === "ADM-008").revision = 99;
    });
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(200);

    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "stale_invitation");
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-recovery", "transient");
    await expect(page.locator("#invite-content")).toContainText("ACTIVATION NOT COMPLETED");
    // transient มี retry = re-resolve server context + exit fallback
    await expect(page.locator("[data-invite-retry]")).toBeVisible();
    await expect(page.locator("[data-invite-exit]")).toBeVisible();

    // retry → re-resolve จาก state ล่าสุด → invitation ยัง Pending → กลับ form (progress จริง ไม่ใช่ลูป)
    await page.locator("[data-invite-retry]").click();
    await expect(page.locator("#invite-form")).toBeVisible();
    await expect(page.locator('[data-invite-field="name"]')).toHaveText("นัฐพล พัฒนา");

    // snapshot ใหม่ตรง state → activate สำเร็จ
    await fillInvitePassword(page, VALID_PASSWORD);
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(300);
    const state = await inviteState(page);
    expect(state.inviteState).toBe("success");
    expect(state.invitation.status).toBe("Used");
    expect(state.account.status).toBe("Active");
    expect(state.activateAudits.filter(a => a.result === "Success").length).toBe(1);
  });

  test("10. Commit failure → rollback ครบ + transient recovery + retry สำเร็จหลังแก้สาเหตุ", async ({ page }) => {
    await page.goto(inviteUrl(VALID_TOKEN));
    await page.waitForLoadState("networkidle");
    await fillInvitePassword(page, VALID_PASSWORD);
    // บังคับ commit failure — audit writer คืน null → mutation ต้อง rollback ทั้งชุด
    await page.evaluate(() => {
      window.__origAudit = ensureAdminInvitationActivationAudit;
      ensureAdminInvitationActivationAudit = () => null;
    });
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(200);

    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "commit_failed");
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-recovery", "transient");
    let state = await inviteState(page);
    // rollback: ไม่มี partial mutation
    expect(state.invitation.status).toBe("Pending");
    expect(state.invitation.usedAt || null).toBeNull();
    expect(state.account.status).toBe("Invited");
    expect(state.account.revision).toBe(1);

    // แก้สาเหตุแล้ว retry → re-resolve → form → commit สำเร็จ
    await page.evaluate(() => {
      ensureAdminInvitationActivationAudit = window.__origAudit;
      delete window.__origAudit;
    });
    await page.locator("[data-invite-retry]").click();
    await expect(page.locator("#invite-form")).toBeVisible();
    await fillInvitePassword(page, VALID_PASSWORD);
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(300);
    state = await inviteState(page);
    expect(state.inviteState).toBe("success");
    expect(state.invitation.status).toBe("Used");
    expect(state.account.status).toBe("Active");
  });

  test("11. Recovery exit → กลับ Login ครบทุกช่องทาง และ Login flow เดิม (Email OTP)", async ({ page }) => {
    // exit จาก terminal state (expired)
    await openInviteWithScenario(page, "expired");
    await page.locator("[data-invite-exit]").click();
    await expect(page.locator("#invite-screen")).toBeHidden();
    await expect(page.locator("#login-screen")).toBeVisible();
    let state = await inviteState(page);
    expect(state.inviteMode).toBe(false);
    expect(state.loggedOut).toBe(true);

    // Login ยังบังคับ Email OTP เหมือนเดิม — behavior ไม่เปลี่ยน
    await page.locator("#login-form button[type=\"submit\"]").click();
    await page.waitForSelector("#otp-form:not(.hidden)", { timeout: 5000 });
    await expect(page.locator("#otp-code")).toBeVisible();
  });

  test("12. Sensitive data — recovery screen ไม่เปิดเผย token/revision/internal reason", async ({ page }) => {
    await openInviteWithScenario(page, "expired");
    const html = await page.locator("#invite-screen").evaluate(el => el.innerHTML + "|" + el.textContent);
    expect(html).not.toContain(VALID_TOKEN);
    expect(html).not.toContain("tokenRevision");
    expect(html).not.toContain("INV-00001");
    expect(html).not.toContain("ADM-008");
    expect(html).not.toContain("COR-INV");
    // context read-only (Name/Email/Role) แสดงเฉพาะ valid link — recovery state ไม่ render context
    await expect(page.locator("[data-invite-context]")).toHaveCount(0);
    await expect(page.locator('[data-invite-field="name"]')).toHaveCount(0);
  });

  test("13. Focus — primary recovery action ได้ focus (keyboard flow) ทั้ง invalid + success", async ({ page }) => {
    // invalid state → focus recovery action
    await openInviteWithScenario(page, "expired");
    let focused = await page.evaluate(() =>
      document.activeElement?.hasAttribute("data-invite-exit") ? "exit" : "other");
    expect(focused).toBe("exit");

    // success state → focus GO TO LOGIN
    await page.evaluate(() => applyAdminInvitationScenario("ADM-008", "pending"));
    await page.evaluate(token => enterInviteMode(token), VALID_TOKEN);
    await fillInvitePassword(page, VALID_PASSWORD);
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(300);
    focused = await page.evaluate(() =>
      document.activeElement?.hasAttribute("data-invite-exit") ? "exit" : "other");
    expect(focused).toBe("exit");
    // Enter บน focused button ต้อง trigger exit ได้ (keyboard activation)
    await page.keyboard.press("Enter");
    await expect(page.locator("#login-screen")).toBeVisible();
  });

  test("14. Transient ไม่วนลูป — state เปลี่ยนเป็น terminal แล้ว retry แสดง terminal recovery", async ({ page }) => {
    await page.goto(inviteUrl(VALID_TOKEN));
    await page.waitForLoadState("networkidle");
    await fillInvitePassword(page, VALID_PASSWORD);
    await page.evaluate(() => {
      adminAccountData.accounts.find(a => a.id === "ADM-008").revision = 99;
    });
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(200);
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-recovery", "transient");

    // admin ยกเลิกคำเชิญหลัง transient — retry ต้อง re-resolve แล้วแสดง cancelled (terminal)
    // ไม่กลับไป transient เดิม → recovery path จบที่ terminal state
    await page.evaluate(() => {
      const inv = adminAccountData.invitations.find(i => i.id === "INV-00001");
      inv.status = "Cancelled";
    });
    await page.locator("[data-invite-retry]").click();
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "cancelled");
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-recovery", "cancelled");
    await expect(page.locator("[data-invite-retry]")).toHaveCount(0);
    const state = await inviteState(page);
    expect(state.invitation.status).toBe("Cancelled");
    expect(state.account.status).toBe("Invited");
  });

  test("15. Scenario dropdown 'transient' — UI-only path: form → submit → ACTIVATION NOT COMPLETED → TRY AGAIN → activate สำเร็จ", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");

    // เลือก scenario ผ่าน dropdown จริง — เปิด details panel ก่อนเหมือนผู้ใช้ แล้วค่อย select
    // tool จำลอง stale revision หลัง form render
    await page.locator("#login-screen .prototype-tools summary").click();
    await page.locator("#invite-scenario").selectOption("transient");
    await expect(page.locator("#invite-form")).toBeVisible();
    await expect(page.locator('[data-invite-field="name"]')).toHaveText("นัฐพล พัฒนา");

    // submit → commit-time stale_invitation → transient recovery
    await fillInvitePassword(page, VALID_PASSWORD);
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(300);
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "stale_invitation");
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-recovery", "transient");
    await expect(page.locator("#invite-content")).toContainText("ACTIVATION NOT COMPLETED");
    await expect(page.locator("[data-invite-retry]")).toHaveText("TRY AGAIN");
    // ไม่มี partial mutation
    let state = await inviteState(page);
    expect(state.invitation.status).toBe("Pending");
    expect(state.account.status).toBe("Invited");

    // TRY AGAIN → re-resolve ผ่าน flow จริง → state ยัง eligible → form กลับมาด้วย snapshot ใหม่
    await page.locator("[data-invite-retry]").click();
    await expect(page.locator("#invite-form")).toBeVisible();

    // activate สำเร็จตาม flow จริง
    await fillInvitePassword(page, VALID_PASSWORD);
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(300);
    state = await inviteState(page);
    expect(state.inviteState).toBe("success");
    expect(state.invitation.status).toBe("Used");
    expect(state.account.status).toBe("Active");
    expect(state.activateAudits.filter(a => a.result === "Success").length).toBe(1);
  });

  test("16. Mobile 390px — recovery state render + action usable", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-390", "mobile-390 only");
    await openInviteWithScenario(page, "expired");
    await expect(page.locator("#invite-screen")).toBeVisible();
    await expect(page.locator("#invite-content")).toContainText("LINK EXPIRED");
    await expect(page.locator("[data-invite-exit]")).toBeVisible();
    await page.locator("[data-invite-exit]").click();
    await expect(page.locator("#login-screen")).toBeVisible();
  });
});
