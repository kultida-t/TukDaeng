// QA-BO-017: Admin Invitation Lifecycle — Targeted Mission 1 Coverage (AIL-010)
// contract: 01_AUTHENTICATION_MODULE.md §10.1 + 16_ADMIN_SETTINGS_MODULE.md §8.9/§16.3/§19
// additive เท่านั้น — ไม่ซ้ำ qa-bo-013g/013j/013k/013l/013m/015/016:
//   A) cross-boundary lifecycle chains — admin-side commit → recipient activate ด้วย token จริง
//      ที่ mint จาก invitation ใหม่ (invite→activate, resend→activate, cancel→reissue→activate,
//      expired→reissue→activate)
//   B) boundary/negative — time-derived expiry (expiresAt <= now ขณะ record ยัง Pending),
//      email-change post-issuance, role-revision bump, idempotent reopen, invite replay,
//      permission-denied direct commits (cancel/reissue), post-activation closure,
//      accept/activate ไม่สร้าง delivery record
//   C) audit/trace invariants — per-issuance chain (1 event/mutation, shared correlationId),
//      single-Pending invariant, full-lifecycle secret sweep
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";
// opaque prototype fixture token สำหรับ INV-00001 r1 — seed ใน adminInvitationLinkTokenFixtures
const VALID_TOKEN = "sim-token-kq8f2x7m4d9e1b6a";
const VALID_PASSWORD = "Tukdaeng#2026xy";
const inviteUrl = token => `${PROTOTYPE_URL}#token=${token}`;
const TARGET = "ADM-008";

// ---------- helpers (pattern เดียวกับ qa-bo-013g/013j/015/016) ----------

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

async function ensureNavOpen(page) {
  const needsToggle = await page.evaluate(() =>
    window.matchMedia("(max-width: 1180px)").matches && !document.body.classList.contains("nav-open"));
  if (needsToggle) {
    await page.locator("#menu-toggle").click();
    await page.waitForTimeout(300);
  }
}

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

// navigate ใน page เดิม (ไม่ reload — เก็บ in-memory state ของ lifecycle chain ไว้)
async function navigateToAdminAccounts(page) {
  await ensureNavOpen(page);
  await page.locator(".nav-item[data-module='settings']").click();
  await page.waitForTimeout(300);
  await ensureNavOpen(page);
  await page.locator(".submenu[data-submenu='settings'] button[data-module='settings'][data-sub='Admin Accounts']").click();
  await page.waitForTimeout(300);
}

async function openInviteModal(page) {
  await goToAdminAccounts(page);
  await page.locator("[data-admin-account-invite-open]").click();
  await page.waitForTimeout(300);
}

async function pickRole(page, value) {
  await page
    .locator(`div[data-custom-select]:has(> #admin-account-invite-role) [data-custom-select-trigger]`)
    .click();
  await page.waitForTimeout(150);
  await page
    .locator(`div[data-custom-select]:has(> #admin-account-invite-role) [data-custom-select-option][data-value="${value}"]`)
    .click();
  await page.waitForTimeout(200);
}

async function pickDeliveryScenario(page, value) {
  await page.evaluate(selected => setCustomSelectValue("admin-account-invite-delivery-scenario", selected), value);
}

async function fillInvitePassword(page, password, confirm) {
  await page.locator("#invite-password").fill(password);
  await page.locator("#invite-password-confirm").fill(confirm ?? password);
}

// mint token จริงสำหรับ invitation ที่สร้าง runtime (resend/reissue/invite) — prototype fixture helper
async function mintLinkToken(page, invitationId) {
  return page.evaluate(invId => {
    const inv = adminAccountData.invitations.find(i => i.id === invId);
    return inv ? getAdminInvitationLinkToken(inv) : null;
  }, invitationId);
}

// snapshot lifecycle state ของ account เป้าหมาย — invitations/deliveries/audits/activity
async function lifecycleState(page, accountId = TARGET) {
  return page.evaluate(accId => {
    const acc = adminAccountData.accounts.find(a => a.id === accId) || null;
    const invitations = acc ? adminAccountData.invitations.filter(i => i.targetAdminId === accId) : [];
    const invIds = new Set(invitations.map(i => i.id));
    return {
      account: acc ? {
        id: acc.id, status: acc.status, revision: acc.revision, email: acc.email,
        invitationId: acc.invitationId, lastAction: acc.lastAction
      } : null,
      invitations: invitations.map(i => ({
        id: i.id, status: i.status, tokenRevision: i.tokenRevision,
        correlationId: i.correlationId, outboxRef: i.outboxRef, auditRef: i.auditRef || null,
        acceptedAt: i.acceptedAt || null, usedAt: i.usedAt || null,
        supersededAt: i.supersededAt || null, supersededByInvitationId: i.supersededByInvitationId || null
      })),
      pendingCount: invitations.filter(i => i.status === "Pending").length,
      deliveries: adminAccountData.deliveryAttempts
        .filter(d => d.targetAdminId === accId)
        .map(d => ({
          id: d.id, invitationId: d.invitationId, status: d.status,
          correlationId: d.correlationId, attemptSequence: d.attemptSequence,
          recipientMasked: d.recipientMasked
        })),
      audits: auditLogData.events
        .filter(e => e.targetAdminId === accId || invIds.has(e.invitationId))
        .map(e => ({
          id: e.id, eventType: e.eventType, action: e.action, result: e.result,
          failureCode: e.failureCode || null, invitationId: e.invitationId || null,
          supersededInvitationId: e.supersededInvitationId || null, targetAdminId: e.targetAdminId || null,
          correlationId: e.correlationId || null, deliveryId: e.deliveryId || null,
          reference: e.reference, actor: e.actor, before: e.before, after: e.after, reason: e.reason
        })),
      activity: (adminAccountData.detail[accId]?.activity || []).map(a => a.action),
      inviteState: document.querySelector("#invite-screen")?.dataset.inviteState || null,
      deliveryAttemptsTotal: adminAccountData.deliveryAttempts.length,
      settingsRowsTotal: moduleData.settings?.rows?.length ?? null
    };
  }, accountId);
}

test.describe("QA-BO-017: Admin Invitation Lifecycle — targeted Mission 1 coverage (AIL-010)", () => {

  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440" && testInfo.project.name !== "mobile-390",
      "desktop-1440 and mobile-390 only");
  });

  // ==================== A. Cross-boundary lifecycle chains ====================

  test("1. invite → accept → activate: account ใหม่ครบ lifecycle ด้วยลิงก์จริงของ invitation ใหม่", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");

    // admin-side: สร้างคำเชิญผ่าน UI จริง (modal → confirm → commit)
    await openInviteModal(page);
    const email = "lifecycle.chain@tukdaeng.example";
    await page.locator("#admin-account-invite-name").fill("เชน ไลฟ์ไซเคิล");
    await page.locator("#admin-account-invite-email").fill(email);
    await pickRole(page, "Trust & Safety Moderator");
    await pickDeliveryScenario(page, "sent");
    await page.locator("[data-admin-account-invite-confirm]").click();
    await page.waitForTimeout(400);
    await expect(page.locator("#success-toast")).toBeVisible();

    // commit สร้าง account Invited + invitation Pending r1 + delivery Sent + audit CREATE ครบวง
    const created = await page.evaluate(addr => {
      const acc = adminAccountData.accounts.find(a => a.email === addr);
      const inv = acc && adminAccountData.invitations.find(i => i.targetAdminId === acc.id);
      const delivery = inv && adminAccountData.deliveryAttempts.find(d => d.invitationId === inv.id);
      const createAudits = auditLogData.events.filter(
        e => e.eventType === "ADMIN_INVITATION_CREATE" && e.invitationId === inv?.id);
      return {
        acc: acc ? { id: acc.id, status: acc.status, revision: acc.revision, invitationId: acc.invitationId } : null,
        inv: inv ? { id: inv.id, status: inv.status, tokenRevision: inv.tokenRevision, correlationId: inv.correlationId } : null,
        delivery: delivery ? { id: delivery.id, status: delivery.status, correlationId: delivery.correlationId } : null,
        createAudits: createAudits.map(e => ({ result: e.result, correlationId: e.correlationId, deliveryId: e.deliveryId }))
      };
    }, email);
    expect(created.acc.status).toBe("Invited");
    expect(created.acc.invitationId).toBe(created.inv.id);
    expect(created.inv.status).toBe("Pending");
    expect(created.inv.tokenRevision).toBe(1);
    expect(created.createAudits).toHaveLength(1);
    expect(created.createAudits[0].result).toBe("Success");
    expect(created.createAudits[0].deliveryId).toBe(created.delivery.id);
    expect(created.delivery.status).toBe("Sent");
    // correlation เดียวกันทั้ง issuance — audit/delivery/invitation trace กันได้
    expect(created.delivery.correlationId).toBe(created.inv.correlationId);
    expect(created.createAudits[0].correlationId).toBe(created.inv.correlationId);

    // recipient-side: เปิดลิงก์จริงของ invitation ใหม่ → context ถูกต้อง → ตั้งรหัสผ่าน → success
    const token = await mintLinkToken(page, created.inv.id);
    await page.evaluate(t => enterInviteMode(t), token);
    await expect(page.locator("#invite-form")).toBeVisible();
    await expect(page.locator('[data-invite-field="name"]')).toHaveText("เชน ไลฟ์ไซเคิล");
    await expect(page.locator('[data-invite-field="email"]')).toHaveText(email);
    await fillInvitePassword(page, VALID_PASSWORD);
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#invite-screen")).toHaveAttribute("data-invite-state", "success");

    // atomic consume: account Active + invitation Used + ไม่มี Pending ค้าง
    const after = await lifecycleState(page, created.acc.id);
    expect(after.account.status).toBe("Active");
    expect(after.pendingCount).toBe(0);
    const inv = after.invitations.find(i => i.id === created.inv.id);
    expect(inv.status).toBe("Used");
    expect(inv.usedAt).toBeTruthy();
    // audit chain ครบ CREATE → ACCEPT → ACTIVATE — event ละครั้ง, correlation เดียวกันทั้ง issuance
    const chain = after.audits.filter(a => a.invitationId === created.inv.id);
    expect(chain.filter(a => a.eventType === "ADMIN_INVITATION_ACCEPT" && a.result === "Success")).toHaveLength(1);
    expect(chain.filter(a => a.eventType === "ADMIN_INVITATION_ACTIVATE" && a.result === "Success")).toHaveLength(1);
    expect(new Set(chain.map(a => a.correlationId))).toEqual(new Set([created.inv.correlationId]));
    // history ครบ: Invited → Invitation link opened → Activated (invitation)
    expect(after.activity.some(a => a.startsWith("Invited"))).toBe(true);
    expect(after.activity).toEqual(expect.arrayContaining(["Activated (invitation)", "Invitation link opened"]));
  });

  test("2. resend → token เดิมเข้า recovery superseded → token ใหม่ activate สำเร็จ", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");

    const resend = await page.evaluate(() => commitAdminInvitationResend("ADM-008", {}, "sent"));
    expect(resend).toMatchObject({ ok: true, code: "committed" });
    expect(resend.invitationId).not.toBe("INV-00001");

    // old-token invalidation — token r1 ของ INV-00001 เข้า safe recovery superseded (ไม่มี form)
    await page.evaluate(t => enterInviteMode(t), VALID_TOKEN);
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "superseded");
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-recovery", "superseded");
    await expect(page.locator("#invite-form")).toHaveCount(0);

    // token ใหม่ของ invitation revision ล่าสุด → activate สำเร็จ
    const token = await mintLinkToken(page, resend.invitationId);
    await page.evaluate(t => enterInviteMode(t), token);
    await expect(page.locator("#invite-form")).toBeVisible();
    await fillInvitePassword(page, VALID_PASSWORD);
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#invite-screen")).toHaveAttribute("data-invite-state", "success");

    const state = await lifecycleState(page);
    expect(state.account.status).toBe("Active");
    expect(state.pendingCount).toBe(0);
    expect(state.invitations.find(i => i.id === "INV-00001").status).toBe("Superseded");
    expect(state.invitations.find(i => i.id === resend.invitationId).status).toBe("Used");
    // blocked attempt ของ token เก่าถูก audit (Failed ACCEPT / SUPERSEDED) — trace ได้ไม่หลุด
    const blocked = state.audits.find(a =>
      a.invitationId === "INV-00001" && a.eventType === "ADMIN_INVITATION_ACCEPT" && a.result === "Failed");
    expect(blocked?.failureCode).toBe("SUPERSEDED");
  });

  test("3. cancel → token เดิมเข้า recovery cancelled → reissue → token ใหม่ activate สำเร็จ", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");

    const cancel = await page.evaluate(() => commitAdminInvitationCancel("ADM-008"));
    expect(cancel).toMatchObject({ ok: true, code: "committed" });

    await page.evaluate(t => enterInviteMode(t), VALID_TOKEN);
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "cancelled");
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-recovery", "cancelled");
    await expect(page.locator("#invite-form")).toHaveCount(0);

    const reissue = await page.evaluate(() => commitAdminInvitationReissue("ADM-008", {}, "sent"));
    expect(reissue).toMatchObject({ ok: true, code: "committed" });
    expect(reissue.invitationId).not.toBe("INV-00001");

    const token = await mintLinkToken(page, reissue.invitationId);
    await page.evaluate(t => enterInviteMode(t), token);
    await expect(page.locator("#invite-form")).toBeVisible();
    await fillInvitePassword(page, VALID_PASSWORD);
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#invite-screen")).toHaveAttribute("data-invite-state", "success");

    const state = await lifecycleState(page);
    expect(state.account.status).toBe("Active");
    expect(state.pendingCount).toBe(0);
    // terminal history ไม่ถูกลบ/เขียนทับ — INV-00001 ยัง Cancelled
    expect(state.invitations.find(i => i.id === "INV-00001").status).toBe("Cancelled");
    expect(state.invitations.find(i => i.id === reissue.invitationId).status).toBe("Used");
    // audit chain: CANCEL + REISSUE (admin) + ACCEPT/ACTIVATE (recipient) ครบ
    const types = state.audits.map(a => a.eventType);
    expect(types).toEqual(expect.arrayContaining([
      "ADMIN_INVITATION_CANCEL", "ADMIN_INVITATION_REISSUE",
      "ADMIN_INVITATION_ACCEPT", "ADMIN_INVITATION_ACTIVATE"]));
  });

  test("4. expired → reissue → terminal history เก็บครบ + token ใหม่ activate สำเร็จ", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");

    await page.evaluate(() => applyAdminInvitationScenario("ADM-008", "expired"));

    const reissue = await page.evaluate(() => commitAdminInvitationReissue("ADM-008", {}, "sent"));
    expect(reissue).toMatchObject({ ok: true, code: "committed" });

    // token เดิมของ INV-00001 → expired recovery เสมอ (terminal ไม่กลับมาใช้ได้)
    await page.evaluate(t => enterInviteMode(t), VALID_TOKEN);
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-recovery", "expired");
    await expect(page.locator("#invite-form")).toHaveCount(0);

    const token = await mintLinkToken(page, reissue.invitationId);
    await page.evaluate(t => enterInviteMode(t), token);
    await expect(page.locator("#invite-form")).toBeVisible();
    await fillInvitePassword(page, VALID_PASSWORD);
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#invite-screen")).toHaveAttribute("data-invite-state", "success");

    const state = await lifecycleState(page);
    expect(state.account.status).toBe("Active");
    expect(state.pendingCount).toBe(0);
    // ทุก revision เก็บเป็น terminal history: Expired → Used (ไม่มี record ถูกลบ)
    const statuses = state.invitations.map(i => i.status).sort();
    expect(statuses).toEqual(["Expired", "Used"]);
    expect(state.invitations.find(i => i.id === reissue.invitationId).tokenRevision).toBe(2);
  });

  // ==================== B. Boundary / negative ====================

  test("5. time-derived expiry: expiresAt <= now ขณะ record ยัง Pending → resolve/commit เป็น expired", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");

    // boundary: read ต้อง derive Expired เมื่อ expiresAt <= now แม้ record status ยัง Pending (§10.1)
    const past = await page.evaluate(token => {
      const inv = adminAccountData.invitations.find(i => i.id === "INV-00001");
      inv.expiresAt = new Date(Date.now() - 1000).toISOString();
      const res = resolveAdminInvitationActivation(token);
      return { ok: res.ok, code: res.code, recordStatus: inv.status };
    }, VALID_TOKEN);
    expect(past).toMatchObject({ ok: false, code: "expired", recordStatus: "Pending" });

    // commit path ผ่าน boundary เดียวกัน — UI recovery + direct commit ต้อง block เหมือนกัน
    await page.evaluate(t => enterInviteMode(t), VALID_TOKEN);
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "expired");
    const direct = await page.evaluate(() => commitAdminInvitationActivation());
    expect(direct).toMatchObject({ ok: false, code: "expired" });
    const blocked = await lifecycleState(page);
    expect(blocked.account.status).toBe("Invited");
    expect(blocked.audits.some(a =>
      a.eventType === "ADMIN_INVITATION_ACTIVATE" && a.result === "Failed" && a.failureCode === "EXPIRED")).toBe(true);

    // boundary อีกฝั่ง: expiresAt ยังอยู่ในอนาคต → resolve ผ่าน + re-resolve เปลี่ยน recovery → form
    const future = await page.evaluate(token => {
      const inv = adminAccountData.invitations.find(i => i.id === "INV-00001");
      inv.expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      const res = resolveAdminInvitationActivation(token);
      return { ok: res.ok, code: res.code || null };
    }, VALID_TOKEN);
    expect(future.ok).toBe(true);
    await page.evaluate(t => enterInviteMode(t), VALID_TOKEN);
    await expect(page.locator("#invite-form")).toBeVisible();
  });

  test("6. email เปลี่ยนหลัง issuance → target_email_normalized mismatch → account_ineligible", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");

    const res = await page.evaluate(token => {
      const acc = adminAccountData.accounts.find(a => a.id === "ADM-008");
      acc.email = "renamed.after-issue@tukdaeng.example";
      const r = resolveAdminInvitationActivation(token);
      return { ok: r.ok, code: r.code };
    }, VALID_TOKEN);
    expect(res).toEqual({ ok: false, code: "account_ineligible" });

    await page.evaluate(t => enterInviteMode(t), VALID_TOKEN);
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-failure", "account_ineligible");
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-recovery", "unavailable");
    const direct = await page.evaluate(() => commitAdminInvitationActivation());
    expect(direct).toMatchObject({ ok: false, code: "account_ineligible" });

    const state = await lifecycleState(page);
    expect(state.account.status).toBe("Invited");
    expect(state.invitations.find(i => i.id === "INV-00001").status).toBe("Pending");
    expect(state.audits.some(a =>
      a.eventType === "ADMIN_INVITATION_ACTIVATE" && a.result === "Failed" && a.failureCode === "ACCOUNT_INELIGIBLE")).toBe(true);
  });

  test("7. role revision bump (status ยัง Active) → role_ineligible ทั้ง resolve และ commit", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");

    // role ยัง Active แต่ revision เปลี่ยนหลัง issuance → activation ต้อง block (ไม่ใช่แค่ status check)
    const res = await page.evaluate(token => {
      const inv = adminAccountData.invitations.find(i => i.id === "INV-00001");
      const role = roleListData.roles.find(r => r.id === inv.roleId);
      role.updatedRank = (role.updatedRank || 1) + 1;
      const r = resolveAdminInvitationActivation(token);
      return { ok: r.ok, code: r.code, roleStatus: role.status };
    }, VALID_TOKEN);
    expect(res).toEqual({ ok: false, code: "role_ineligible", roleStatus: "Active" });

    await page.evaluate(t => enterInviteMode(t), VALID_TOKEN);
    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-recovery", "unavailable");
    const direct = await page.evaluate(() => commitAdminInvitationActivation());
    expect(direct).toMatchObject({ ok: false, code: "role_ineligible" });

    const state = await lifecycleState(page);
    expect(state.account.status).toBe("Invited");
    expect(state.audits.some(a =>
      a.eventType === "ADMIN_INVITATION_ACTIVATE" && a.result === "Failed" && a.failureCode === "ROLE_INELIGIBLE")).toBe(true);
  });

  test("8. เปิดลิงก์ valid ซ้ำ (idempotent reopen) → ไม่เขียน ACCEPT audit/activity ซ้ำ", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");

    await page.evaluate(t => enterInviteMode(t), VALID_TOKEN);
    await expect(page.locator("#invite-form")).toBeVisible();
    const first = await lifecycleState(page);
    const firstAcceptedAt = first.invitations.find(i => i.id === "INV-00001").acceptedAt;
    expect(firstAcceptedAt).toBeTruthy();

    // reopen ลิงก์เดิมอีกครั้ง — context resolve ใหม่ แต่ไม่ double-write
    await page.evaluate(t => enterInviteMode(t), VALID_TOKEN);
    await expect(page.locator("#invite-form")).toBeVisible();
    const second = await lifecycleState(page);
    expect(second.invitations.find(i => i.id === "INV-00001").acceptedAt).toBe(firstAcceptedAt);
    expect(second.audits.filter(a => a.eventType === "ADMIN_INVITATION_ACCEPT")).toHaveLength(1);
    expect(second.activity.filter(a => a === "Invitation link opened")).toHaveLength(1);
  });

  test("9. invite replay: submit email เดิมซ้ำ → unique check block + ไม่มี duplicate account/invitation/delivery/audit", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");
    await openInviteModal(page);
    const email = "replay.check@tukdaeng.example";
    await page.locator("#admin-account-invite-name").fill("รีเพลย์ เช็ค");
    await page.locator("#admin-account-invite-email").fill(email);
    await pickRole(page, "Content Editor");
    await page.locator("[data-admin-account-invite-confirm]").click();
    await page.waitForTimeout(400);
    await expect(page.locator("#success-toast")).toBeVisible();

    // submit ซ้ำด้วย email เดิม → validation block ก่อนสร้าง record (replay guard ฝั่ง admin)
    await page.locator("[data-admin-account-invite-open]").click();
    await page.waitForTimeout(300);
    await page.locator("#admin-account-invite-name").fill("รีเพลย์ ซ้ำ");
    await page.locator("#admin-account-invite-email").fill(email);
    await pickRole(page, "Content Editor");
    await page.locator("[data-admin-account-invite-confirm]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("[data-admin-invite-email-error]")).toHaveClass(/show/);
    await expect(page.locator("[data-admin-invite-email-error]"))
      .toContainText("อีเมลนี้มีอยู่ในระบบแล้ว");

    const dup = await page.evaluate(addr => {
      const accs = adminAccountData.accounts.filter(a => a.email === addr);
      const accIds = new Set(accs.map(a => a.id));
      const invs = adminAccountData.invitations.filter(i => accIds.has(i.targetAdminId));
      const invIds = new Set(invs.map(i => i.id));
      return {
        accounts: accs.length,
        invitations: invs.length,
        deliveries: adminAccountData.deliveryAttempts.filter(d => invIds.has(d.invitationId)).length,
        createAudits: auditLogData.events.filter(
          e => e.eventType === "ADMIN_INVITATION_CREATE" && invIds.has(e.invitationId)).length
      };
    }, email);
    expect(dup).toEqual({ accounts: 1, invitations: 1, deliveries: 1, createAudits: 1 });
  });

  test("10. permission denied: direct commit cancel/reissue → not_allowed + audit Failed + ไม่มี mutation", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");

    const res = await page.evaluate(() => {
      const snapshot = () => JSON.stringify({
        invitations: adminAccountData.invitations,
        accountStatus: adminAccountData.accounts.find(a => a.id === "ADM-008")?.status,
        deliveries: adminAccountData.deliveryAttempts.length,
        settingsRows: moduleData.settings?.rows?.length
      });
      const before = snapshot();
      const beforeAudits = auditLogData.events.length;
      window.__origCanManage = canManageAdminAccounts;
      window.canManageAdminAccounts = () => false;
      const cancel = commitAdminInvitationCancel("ADM-008");
      const reissue = commitAdminInvitationReissue("ADM-008", {}, "sent");
      window.canManageAdminAccounts = window.__origCanManage;
      const failed = auditLogData.events
        .slice(0, auditLogData.events.length - beforeAudits)
        .map(e => ({ eventType: e.eventType, result: e.result, failureCode: e.failureCode }));
      return { cancel, reissue, failed, unchanged: snapshot() === before };
    });
    expect(res.cancel).toMatchObject({ ok: false, code: "not_allowed" });
    expect(res.reissue).toMatchObject({ ok: false, code: "not_allowed" });
    // blocked attempt ทั้งสองต้องถูก audit เป็น Failed — ไม่เงียบ
    expect(res.failed).toEqual(expect.arrayContaining([
      { eventType: "ADMIN_INVITATION_CANCEL", result: "Failed", failureCode: "NOT_ALLOWED" },
      { eventType: "ADMIN_INVITATION_REISSUE", result: "Failed", failureCode: "NOT_ALLOWED" }
    ]));
    expect(res.unchanged).toBe(true);
  });

  test("11. post-activation closure: account Active แล้ว admin-side actions ทั้งหมด not_allowed + ไม่มี invitation section", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");

    // activate จริงผ่านลิงก์
    await page.goto(inviteUrl(VALID_TOKEN));
    await page.waitForLoadState("networkidle");
    await fillInvitePassword(page, VALID_PASSWORD);
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#invite-screen")).toHaveAttribute("data-invite-state", "success");

    // dispatch boundary — account ไม่ใช่ Invited แล้ว ทุก action ต้อง reject
    const denied = await page.evaluate(() => ({
      resend: requestAdminInvitationAction("resend", "ADM-008"),
      cancel: requestAdminInvitationAction("cancel", "ADM-008"),
      reissue: requestAdminInvitationAction("reissue", "ADM-008")
    }));
    expect(denied.resend).toMatchObject({ ok: false, code: "not_allowed" });
    expect(denied.cancel).toMatchObject({ ok: false, code: "not_allowed" });
    expect(denied.reissue).toMatchObject({ ok: false, code: "not_allowed" });

    // UI ฝั่ง admin: detail ของ account ที่ Active แล้วต้องไม่มี invitation section
    // (navigate ใน page เดิม — ห้าม reload เพราะ state เป็น in-memory)
    await page.evaluate(() => exitInviteMode());
    await loginIfNeeded(page);
    await navigateToAdminAccounts(page);
    await page.locator('.admin-account-row[data-admin-account-card="ADM-008"] .user-cell-primary[data-label="Admin ID"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator("[data-admin-invitation-section]")).toHaveCount(0);
    await expect(page.locator("[data-admin-invitation-action]")).toHaveCount(0);
  });

  test("12. accept + activate ไม่สร้าง delivery attempt/row ใหม่ (recipient flow ไม่มี email บังคับ)", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");

    const before = await lifecycleState(page);
    await page.evaluate(t => enterInviteMode(t), VALID_TOKEN);
    await expect(page.locator("#invite-form")).toBeVisible();
    await fillInvitePassword(page, VALID_PASSWORD);
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#invite-screen")).toHaveAttribute("data-invite-state", "success");

    const after = await lifecycleState(page);
    expect(after.deliveryAttemptsTotal).toBe(before.deliveryAttemptsTotal);
    expect(after.settingsRowsTotal).toBe(before.settingsRowsTotal);
    expect(after.deliveries).toHaveLength(before.deliveries.length);
  });

  // ==================== C. Audit / trace invariants ====================

  test("13. per-issuance audit chain: RESEND→ACCEPT→ACTIVATE อย่างละ 1 event + correlation/delivery trace ต่อกัน", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");

    const resend = await page.evaluate(() => commitAdminInvitationResend("ADM-008", {}, "sent"));
    const token = await mintLinkToken(page, resend.invitationId);
    await page.evaluate(t => enterInviteMode(t), token);
    await fillInvitePassword(page, VALID_PASSWORD);
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#invite-screen")).toHaveAttribute("data-invite-state", "success");

    const state = await lifecycleState(page);
    const chain = state.audits.filter(a => a.invitationId === resend.invitationId);
    // ห้ามเขียนสอง event ซ้ำสำหรับ mutation เดียว — canonical eventType ละครั้งพอดี
    expect(chain.filter(a => a.eventType === "ADMIN_INVITATION_RESEND")).toHaveLength(1);
    expect(chain.filter(a => a.eventType === "ADMIN_INVITATION_ACCEPT")).toHaveLength(1);
    expect(chain.filter(a => a.eventType === "ADMIN_INVITATION_ACTIVATE")).toHaveLength(1);
    expect(chain).toHaveLength(3);
    expect(chain.every(a => a.result === "Success")).toBe(true);
    // correlation เดียวกันทั้ง issuance + delivery attempt อ้าง correlation เดียวกัน
    const inv = state.invitations.find(i => i.id === resend.invitationId);
    expect(new Set(chain.map(a => a.correlationId))).toEqual(new Set([inv.correlationId]));
    const resendAudit = chain.find(a => a.eventType === "ADMIN_INVITATION_RESEND");
    expect(resendAudit.deliveryId).toBe(resend.deliveryId);
    expect(resendAudit.supersededInvitationId).toBe("INV-00001");
    const delivery = state.deliveries.find(d => d.id === resend.deliveryId);
    expect(delivery.correlationId).toBe(inv.correlationId);
    // ACTIVATE audit — actor คือผู้รับคำเชิญ, reference เป็น invitation, before/after ชัด
    const activate = chain.find(a => a.eventType === "ADMIN_INVITATION_ACTIVATE");
    expect(activate.actor).toBe("นัฐพล พัฒนา");
    expect(activate.reference).toBe(resend.invitationId);
    expect(activate.before).toContain("Pending");
    expect(activate.after).toContain("Used");
    // invitation record ชี้ auditRef กลับหา ACTIVATE/issuance audit ได้
    expect(inv.auditRef).toBeTruthy();
  });

  test("14. single-Pending invariant: ทุก stage มี Pending ≤1 ต่อ account และ terminal history ไม่หาย", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");

    const pendingCount = async () =>
      (await lifecycleState(page)).pendingCount;
    const statuses = async () =>
      (await lifecycleState(page)).invitations.map(i => i.status).sort();

    expect(await pendingCount()).toBe(1);

    await page.evaluate(() => commitAdminInvitationResend("ADM-008", {}, "sent"));
    expect(await pendingCount()).toBe(1); // supersede + issue ใหม่ใน transaction เดียว

    await page.evaluate(() => commitAdminInvitationCancel("ADM-008"));
    expect(await pendingCount()).toBe(0); // Invited ไม่มี Pending ได้ (รอ reissue)

    const reissue = await page.evaluate(() => commitAdminInvitationReissue("ADM-008", {}, "sent"));
    expect(await pendingCount()).toBe(1);

    const token = await mintLinkToken(page, reissue.invitationId);
    await page.evaluate(t => enterInviteMode(t), token);
    await fillInvitePassword(page, VALID_PASSWORD);
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(300);

    expect(await pendingCount()).toBe(0);
    // history ครบ 3 record: Superseded + Cancelled + Used — ไม่มี record หาย/กลับมาเป็น Pending
    expect(await statuses()).toEqual(["Cancelled", "Superseded", "Used"]);
  });

  test("15. full-lifecycle secret sweep: audit/delivery/log ไม่มี raw token, password หรือ unmasked email", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop-1440 only");
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");

    // รัน chain จริง: resend → accept → activate บน ADM-008
    const resend = await page.evaluate(() => commitAdminInvitationResend("ADM-008", {}, "sent"));
    const minted = await mintLinkToken(page, resend.invitationId);
    await page.evaluate(t => enterInviteMode(t), minted);
    await fillInvitePassword(page, VALID_PASSWORD);
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#invite-screen")).toHaveAttribute("data-invite-state", "success");

    // sweep ทุก surface ที่ audit/log/UI เปิดเผย — ห้าม raw token (seed + minted) และ password
    // (adminInvitationLinkTokenFixtures เป็น token store ของ prototype โดยตรง — ไม่นับเป็น leak surface)
    const leak = await page.evaluate(({ seedToken }) => {
      const surfaces = {
        audits: auditLogData.events,
        deliveries: adminAccountData.deliveryAttempts,
        settingsRows: moduleData.settings?.rows || [],
        invitations: adminAccountData.invitations,
        detail: adminAccountData.detail["ADM-008"],
        resendIssuanceLog: adminAccountData.resendIssuanceLog,
        inviteHtml: document.querySelector("#invite-content")?.innerHTML || "",
        // innerText = rendered text เท่านั้น — innerHTML รวม inline script source ซึ่งมี fixture registry อยู่แล้ว (ไม่ใช่ leak surface)
        bodyText: document.body.innerText
      };
      const rawEmail = "nattapol@tukdaeng.example";
      return Object.fromEntries(Object.entries(surfaces).map(([name, obj]) => {
        const json = typeof obj === "string" ? obj : JSON.stringify(obj);
        return [name, {
          hasSeedToken: json.includes(seedToken),
          hasSimToken: /sim-token-[0-9a-z]+/i.test(json),
          hasPassword: json.includes("Tukdaeng#2026xy"),
          // raw email rule ใช้กับ audit/delivery/detail/settings — invite context แสดง email ผู้รับเองโดย design
          hasRawEmail: ["audits", "deliveries", "settingsRows", "detail"].includes(name)
            ? json.includes(rawEmail) : null
        }];
      }));
    }, { seedToken: VALID_TOKEN });

    for (const [surface, flags] of Object.entries(leak)) {
      expect(flags.hasSeedToken, `${surface} exposes seed token`).toBe(false);
      expect(flags.hasSimToken, `${surface} exposes link token`).toBe(false);
      expect(flags.hasPassword, `${surface} exposes password`).toBe(false);
      if (flags.hasRawEmail !== null) {
        expect(flags.hasRawEmail, `${surface} exposes unmasked email`).toBe(false);
      }
    }
  });

  // ==================== Mobile viewport ====================

  test("16. mobile-390: resend → token ใหม่ activate chain ทำงานและ render ถูกบนจอเล็ก", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-390", "mobile-390 only");
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");

    const resend = await page.evaluate(() => commitAdminInvitationResend("ADM-008", {}, "sent"));
    expect(resend.ok).toBe(true);
    const token = await mintLinkToken(page, resend.invitationId);

    await page.evaluate(t => enterInviteMode(t), token);
    await expect(page.locator("#invite-screen")).toBeVisible();
    await expect(page.locator("#invite-form")).toBeVisible();
    await expect(page.locator('[data-invite-field="email"]')).toHaveText("nattapol@tukdaeng.example");
    await expect(page.locator("#invite-password")).toBeVisible();
    await expect(page.locator("#invite-submit")).toBeVisible();

    await fillInvitePassword(page, VALID_PASSWORD);
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#invite-screen")).toHaveAttribute("data-invite-state", "success");
    await expect(page.locator("#invite-content")).toContainText("ACCOUNT ACTIVATED");

    const state = await lifecycleState(page);
    expect(state.account.status).toBe("Active");
    expect(state.invitations.find(i => i.id === resend.invitationId).status).toBe("Used");
  });
});
