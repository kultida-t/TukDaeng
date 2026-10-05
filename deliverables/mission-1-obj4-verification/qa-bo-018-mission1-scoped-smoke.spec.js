// QA-BO-018: Mission 1 — Scoped UI/Responsive/Accessibility Smoke (AIL-011)
// contract: 01_AUTHENTICATION_MODULE.md §5 (responsive auth) + §10.1 (safe states)
//   + §14 (error states) + 16_ADMIN_SETTINGS_MODULE.md §8.9 (admin-side surfaces)
// scope: เฉพาะจุดที่ Mission 1 แก้ — Invite Admin modal, Admin Detail invitation
//   section + confirm modals (resend/cancel/reissue), Accept Invitation
//   (form/context/policy/error association), safe recovery states, Login entry
//   boundary (Email + Password → BO), Delivery/Audit jump จาก invitation context
// viewports: desktop 1440×900 / tablet 1024×768 / mobile 390×844
//   (tablet-768 project ถูก set เป็น 1024×768 ใน beforeEach ตาม task)
// ไม่ครอบ Mission 2 (My Account/credential/session) และไม่ใช่ full protected
// regression ของ Mission 3 — additive เท่านั้น ไม่ซ้ำ 013i/015/016/017
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";
const VALID_TOKEN = "sim-token-kq8f2x7m4d9e1b6a"; // fixture token ของ INV-00001 r1
const VALID_PASSWORD = "Tukdaeng#2026xy";
const inviteUrl = token => `${PROTOTYPE_URL}#token=${token}`;
const TARGET = "ADM-008";
const TARGET_ROLE_ID = "ROL-002";

// ---------- helpers (pattern เดียวกับ qa-bo-013i/015/016/017) ----------

async function loginIfNeeded(page) {
  const loginScreen = page.locator("#login-screen");
  if (await loginScreen.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator("#login-form button[type=\"submit\"]").click();
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
  if (!(await page.evaluate(() =>
    document.querySelector(".submenu[data-submenu='settings']")?.classList.contains("open")))) {
    await page.locator(".nav-item[data-module='settings']").click();
    await page.waitForTimeout(300);
    await ensureNavOpen(page);
  }
  await page.locator(".submenu[data-submenu='settings'] button[data-module='settings'][data-sub='Admin Accounts']").click();
  await page.waitForTimeout(300);
}

// เปิด Admin Detail ใน page เดิม (ไม่ reload — เก็บ in-memory state หลัง apply scenario)
async function openDetail(page, id = TARGET) {
  await page.locator(`.admin-account-row[data-admin-account-card="${id}"] .user-cell-primary[data-label="Admin ID"]`).click();
  await page.waitForTimeout(300);
  await expect(page.locator("body")).toHaveClass(/admin-account-detail-mode/);
}

async function fillInvitePassword(page, password, confirm) {
  await page.locator("#invite-password").fill(password);
  await page.locator("#invite-password-confirm").fill(confirm ?? password);
}

// viewport smoke primitives — overflow / อยู่ในจอ / action ใช้ได้
async function expectNoHorizontalScroll(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

async function expectWithinViewport(page, locator, label) {
  const box = await locator.boundingBox();
  const vw = await page.evaluate(() => window.innerWidth);
  expect(box, `${label}: no bounding box`).toBeTruthy();
  expect(box.x, `${label}: ล้นซ้าย`).toBeGreaterThanOrEqual(-1);
  expect(box.x + box.width, `${label}: ล้นขวา (viewport ${vw})`).toBeLessThanOrEqual(vw + 1);
}

// ==================== Scoped smoke — Mission 1 surfaces ====================

test.describe("QA-BO-018: Mission 1 scoped UI/responsive/accessibility smoke (AIL-011)", () => {

  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "desktop-1280", "scoped: desktop-1440 / tablet / mobile-390 only");
    // task กำหนด tablet = 1024×768 (landscape) — project tablet-768 เป็น 768×1024 จึง override
    if (testInfo.project.name === "tablet-768") {
      await page.setViewportSize({ width: 1024, height: 768 });
    }
  });

  // ---------- 1. Login entry boundary (Email + Password → BO) ----------

  test("1. Login boundary: form render ครบทุก viewport ไม่ overflow + Email + Password → BO ตรง ไม่มี OTP step", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#login-screen")).toBeVisible();
    await expect(page.locator("#login-form")).toBeVisible();
    await expect(page.locator("#login-email")).toBeVisible();
    await expect(page.locator("#login-password")).toBeVisible();
    await expect(page.locator("#password-toggle")).toHaveAttribute("aria-label", "Show password");
    await expect(page.locator("#forgot-password-btn")).toBeVisible();
    await expect(page.locator("#login-form button[type=\"submit\"]")).toBeVisible();
    await expectNoHorizontalScroll(page);

    // Email + Password → BO ตรง — baseline ใหม่ไม่มี intermediate OTP step
    await page.locator("#login-form button[type=\"submit\"]").click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await expect(page.locator("#otp-form")).toHaveCount(0);
    await expect(page.locator("#login-screen")).toBeHidden();
    await expect(page.locator("#page-title")).toHaveText("Dashboard");
    await expectNoHorizontalScroll(page);
  });

  // ---------- 2. Invite Admin modal ----------

  test("2. Invite Admin modal: ครบทุกฟิลด์ ไม่ overflow + error association + ปิดได้ไม่ focus trap", async ({ page }) => {
    await goToAdminAccounts(page);
    await page.locator("[data-admin-account-invite-open]").click();
    await page.waitForTimeout(300);

    const modal = page.locator("#user-action-modal");
    await expect(modal).toHaveClass(/show/);
    await expectWithinViewport(page, modal.locator(".user-action-modal"), "invite modal");
    await expectNoHorizontalScroll(page);

    // fields ครบและใช้งานได้ทุก viewport
    await expect(modal.locator("#admin-account-invite-name")).toBeVisible();
    await expect(modal.locator("#admin-account-invite-email")).toBeVisible();
    await expect(modal.locator("div[data-custom-select]:has(> #admin-account-invite-role) [data-custom-select-trigger]")).toBeVisible();
    await expect(modal.locator("#admin-account-invite-note")).toBeVisible();
    await expect(modal.locator("[data-admin-account-invite-confirm]")).toBeVisible();

    // error association — submit ว่าง → error ผูก field (role=alert + aria-invalid + aria-errormessage)
    await modal.locator("[data-admin-account-invite-confirm]").click();
    await page.waitForTimeout(200);
    for (const field of ["name", "email", "role"]) {
      const error = modal.locator(`[data-admin-invite-${field}-error]`);
      await expect(error).toHaveClass(/show/);
      await expect(error).toHaveAttribute("role", "alert");
      await expect(error).not.toBeEmpty();
    }
    await expect(modal.locator("#admin-account-invite-name")).toHaveAttribute("aria-invalid", "true");
    await expect(modal.locator("#admin-account-invite-name"))
      .toHaveAttribute("aria-errormessage", "admin-account-invite-name-error");
    await expect(modal.locator("#admin-account-invite-email")).toHaveAttribute("aria-invalid", "true");
    await expect(modal.locator("#admin-account-invite-role")).toHaveAttribute("aria-invalid", "true");

    // typing เคลียร์ error ของ field นั้น (aria-invalid กลับ false)
    await modal.locator("#admin-account-invite-name").fill("สโมค ทดสอบ");
    await page.waitForTimeout(150);
    await expect(modal.locator("[data-admin-invite-name-error]")).not.toHaveClass(/show/);
    await expect(modal.locator("#admin-account-invite-name")).toHaveAttribute("aria-invalid", "false");

    // ปิดได้ด้วยปุ่ม ยกเลิก — ไม่มี focus trap (modal ออกจาก DOM state ปกติ)
    await modal.locator("[data-user-action-modal-close]").last().click();
    await page.waitForTimeout(200);
    await expect(modal).not.toHaveClass(/show/);
    // page ยัง interactive — list render อยู่และเปิด modal ใหม่ได้
    await expect(page.locator(".admin-account-row").first()).toBeVisible();
    await page.locator("[data-admin-account-invite-open]").click();
    await page.waitForTimeout(200);
    await expect(modal).toHaveClass(/show/);
    await modal.locator("[data-user-action-modal-close]").first().click();
  });

  // ---------- 3. Admin Detail — invitation context section ----------

  test("3. Admin Detail invitation section: tiles + status + actions ครบทุก viewport ไม่ overflow/action หาย", async ({ page }) => {
    await goToAdminAccounts(page);
    await openDetail(page);

    const section = page.locator("[data-admin-invitation-section]");
    await expect(section).toBeVisible();
    // 6 tiles: Invitation ID / Status / Issued / Expires / Latest Delivery / Resend Quota
    await expect(section.locator(".detail-tile")).toHaveCount(6);
    await expect(section).toContainText("INV-00001");
    await expect(section).toContainText("Pending");
    await expect(section.locator(".admin-invitation-message")).toBeVisible();
    await expect(section.locator(".admin-invitation-scenario-tools")).toBeVisible();

    // Pending + Invited → resend + cancel แสดงและกดได้ (server-calculated capabilities)
    const resend = section.locator('[data-admin-invitation-action="resend"]');
    const cancel = section.locator('[data-admin-invitation-action="cancel"]');
    await expect(resend).toBeVisible();
    await expect(resend).toBeEnabled();
    await expect(cancel).toBeVisible();
    await expect(cancel).toBeEnabled();
    await expect(section.locator('[data-admin-invitation-action="reissue"]')).toHaveCount(0);
    await expectWithinViewport(page, resend, "resend action");
    await expectWithinViewport(page, cancel, "cancel action");
    await expectNoHorizontalScroll(page);
  });

  // ---------- 4. Resend / Cancel confirm modals ----------

  test("4. Resend + Cancel confirm modals: context ครบ ไม่ overflow ปิดได้", async ({ page }) => {
    await goToAdminAccounts(page);
    await openDetail(page);

    const modal = page.locator("#user-action-modal");
    const modalCard = modal.locator(".user-action-modal");

    // Resend confirm — context (invitation/destination/quota) + impact note + actions
    await page.locator('[data-admin-invitation-action="resend"]').click();
    await page.waitForTimeout(300);
    await expect(modal).toHaveClass(/show/);
    await expectWithinViewport(page, modalCard, "resend confirm modal");
    await expect(modal).toContainText("คำเชิญปัจจุบัน");
    await expect(modal).toContainText("INV-00001");
    await expect(modal).toContainText("ส่งไปที่");
    await expect(modal).toContainText("Resend Quota");
    await expect(modal).toContainText("ผลกระทบ");
    await expect(modal.locator("[data-admin-invitation-resend-confirm]")).toBeVisible();
    await expect(modal.locator("[data-user-action-modal-close]").last()).toBeVisible();
    await expectNoHorizontalScroll(page);
    // ปิดด้วย ยกเลิก — ไม่ mutate (ยัง Pending)
    await modal.locator("[data-user-action-modal-close]").last().click();
    await page.waitForTimeout(200);
    await expect(modal).not.toHaveClass(/show/);
    expect(await page.evaluate(() =>
      adminAccountData.invitations.find(i => i.id === "INV-00001").status)).toBe("Pending");

    // Cancel confirm — context + danger action + ปิดได้
    await page.locator('[data-admin-invitation-action="cancel"]').click();
    await page.waitForTimeout(300);
    await expect(modal).toHaveClass(/show/);
    await expectWithinViewport(page, modalCard, "cancel confirm modal");
    await expect(modal.locator("[data-admin-invitation-cancel-confirm]")).toBeVisible();
    await expectNoHorizontalScroll(page);
    await modal.locator("[data-user-action-modal-close]").last().click();
    await page.waitForTimeout(200);
    await expect(modal).not.toHaveClass(/show/);
    expect(await page.evaluate(() =>
      adminAccountData.invitations.find(i => i.id === "INV-00001").status)).toBe("Pending");
  });

  // ---------- 5. Reissue confirm modal (terminal state) ----------

  test("5. Reissue confirm modal: terminal Cancelled → reissue action แสดง + modal ไม่ overflow", async ({ page }) => {
    await goToAdminAccounts(page);
    // terminal state ผ่าน canonical scenario tool (in-page, ไม่ reload)
    await page.evaluate(() => applyAdminInvitationScenario("ADM-008", "cancelled"));
    await openDetail(page);

    const section = page.locator("[data-admin-invitation-section]");
    await expect(section).toBeVisible();
    await expect(section).toContainText("Cancelled");
    // gating ตาม §8.9 — Cancelled แสดงเฉพาะ Reissue
    await expect(section.locator('[data-admin-invitation-action="resend"]')).toHaveCount(0);
    await expect(section.locator('[data-admin-invitation-action="cancel"]')).toHaveCount(0);
    const reissue = section.locator('[data-admin-invitation-action="reissue"]');
    await expect(reissue).toBeVisible();
    await expect(reissue).toBeEnabled();

    await reissue.click();
    await page.waitForTimeout(300);
    const modal = page.locator("#user-action-modal");
    await expect(modal).toHaveClass(/show/);
    await expectWithinViewport(page, modal.locator(".user-action-modal"), "reissue confirm modal");
    await expect(modal.locator("[data-admin-invitation-reissue-confirm]")).toBeVisible();
    await expectNoHorizontalScroll(page);
    await modal.locator("[data-user-action-modal-close]").last().click();
    await page.waitForTimeout(200);
    await expect(modal).not.toHaveClass(/show/);
  });

  // ---------- 6. Accept Invitation — form/context/policy ----------

  test("6. Accept Invitation form: context + policy + fields ครบทุก viewport + initial focus ถูก", async ({ page }) => {
    await page.goto(inviteUrl(VALID_TOKEN));
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#invite-screen")).toBeVisible();
    await expect(page.locator("#invite-screen")).toHaveAttribute("data-invite-state", "form");
    await expect(page.locator("#invite-content")).toContainText("ACCEPT INVITATION");
    await expectNoHorizontalScroll(page);

    // read-only context (เฉพาะ valid link แสดง Name/Email/Role)
    await expect(page.locator('[data-invite-field="name"]')).toHaveText("นัฐพล พัฒนา");
    await expect(page.locator('[data-invite-field="email"]')).toHaveText("nattapol@tukdaeng.example");
    await expect(page.locator('[data-invite-field="role"]')).not.toBeEmpty();

    // fields + labels (input อยู่ใน label) + password toggles + policy list + submit
    const password = page.locator("#invite-password");
    const confirm = page.locator("#invite-password-confirm");
    await expect(password).toBeVisible();
    await expect(confirm).toBeVisible();
    expect(await password.evaluate(el => el.closest("label")?.textContent || "")).toContain("รหัสผ่านใหม่");
    expect(await confirm.evaluate(el => el.closest("label")?.textContent || "")).toContain("ยืนยันรหัสผ่าน");
    await expect(page.locator("#invite-password-toggle")).toHaveAttribute("aria-label", "Show password");
    await expect(page.locator("#invite-password-confirm-toggle")).toHaveAttribute("aria-label", "Show password");
    await expect(page.locator("#invite-policy li")).toHaveCount(5);
    const submit = page.locator("#invite-submit");
    await expect(submit).toBeVisible();
    await expect(submit).toBeEnabled();
    await expectWithinViewport(page, submit, "activate submit");

    // initial focus อยู่ที่ password field แรก (keyboard entry ทันที)
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("invite-password");
  });

  // ---------- 7. Accept Invitation — error association + keyboard submit ----------

  test("7. Accept Invitation validation: field errors ผูก aria + focus ไป field แรกที่ผิด + keyboard submit", async ({ page }) => {
    await page.goto(inviteUrl(VALID_TOKEN));
    await page.waitForLoadState("networkidle");

    // submit ว่าง → error ผูก field (role=alert + aria-invalid + aria-errormessage)
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(200);
    const passwordError = page.locator("#invite-password-error");
    await expect(passwordError).toHaveClass(/show/);
    await expect(passwordError).toHaveAttribute("role", "alert");
    await expect(passwordError).toContainText("กรุณากรอกรหัสผ่านใหม่");
    await expect(page.locator("#invite-password")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#invite-password"))
      .toHaveAttribute("aria-errormessage", "invite-password-error");
    // focus ย้ายไป field แรกที่ผิด — keyboard user แก้ได้ทันที
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("invite-password");

    // password ผ่าน policy แต่ confirm ไม่ตรง → error ผูก confirm field
    await fillInvitePassword(page, VALID_PASSWORD, "Mismatch#12345");
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(200);
    const confirmError = page.locator("#invite-password-confirm-error");
    await expect(confirmError).toHaveClass(/show/);
    await expect(confirmError).toContainText("รหัสผ่านไม่ตรงกัน");
    await expect(page.locator("#invite-password-confirm")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#invite-password-confirm"))
      .toHaveAttribute("aria-errormessage", "invite-password-confirm-error");
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("invite-password-confirm");

    // policy list live-update ตอนพิมพ์ — rule ที่ผ่าน mark data-pass="true"
    await page.locator("#invite-password").fill(VALID_PASSWORD);
    await page.waitForTimeout(150);
    const passedRules = await page.locator("#invite-policy li").evaluateAll(
      items => items.filter(li => li.getAttribute("data-pass") === "true").length);
    expect(passedRules).toBe(5);

    // keyboard submit (Enter ใน form) → activation สำเร็จ — form submit ทำงานโดยไม่ต้องคลิก
    await fillInvitePassword(page, VALID_PASSWORD);
    await page.locator("#invite-password-confirm").press("Enter");
    await page.waitForTimeout(300);
    await expect(page.locator("#invite-screen")).toHaveAttribute("data-invite-state", "success");
    await expect(page.locator("#invite-content")).toContainText("ACCOUNT ACTIVATED");
  });

  // ---------- 8. Safe recovery states — ทุก terminal state render + action ใช้ได้ ----------

  test("8. Safe recovery sweep: ทุก terminal state render title + action ครบ ไม่ overflow + focus ถูก", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");

    // ทุก terminal state — setup รันใน page context และ restore account/role เสมอ
    // (applyAdminInvitationScenario ต้องการ acc.status = Invited ก่อนเสมอ)
    const cases = ["expired", "cancelled", "superseded", "used", "invalid", "account", "role"];
    const titles = {
      expired: "LINK EXPIRED",
      cancelled: "INVITATION CANCELLED",
      superseded: "LINK REPLACED",
      used: "LINK ALREADY USED",
      invalid: "INVALID LINK",
      account: "ACTIVATION UNAVAILABLE",
      role: "ACTIVATION UNAVAILABLE"
    };

    for (const name of cases) {
      await page.evaluate(({ name, token }) => {
        const acc = adminAccountData.accounts.find(a => a.id === "ADM-008");
        acc.status = "Invited"; // restore จาก scenario ก่อนหน้า (account case ตั้ง Suspended)
        roleListData.roles.find(r => r.id === "ROL-002").status = "Active";
        switch (name) {
          case "invalid":
            applyAdminInvitationScenario("ADM-008", "pending");
            enterInviteMode("not-a-real-token");
            break;
          case "account":
            applyAdminInvitationScenario("ADM-008", "pending");
            acc.status = "Suspended";
            enterInviteMode(token);
            break;
          case "role":
            applyAdminInvitationScenario("ADM-008", "pending");
            roleListData.roles.find(r => r.id === "ROL-002").status = "Inactive";
            enterInviteMode(token);
            break;
          default:
            applyAdminInvitationScenario("ADM-008", name);
            enterInviteMode(token);
        }
      }, { name, token: VALID_TOKEN });
      await page.waitForTimeout(200);

      await expect(page.locator("#invite-screen"), name).toHaveAttribute("data-invite-state", "invalid");
      await expect(page.locator("[data-invite-failure]"), name).toBeVisible();
      await expect(page.locator("[data-invite-failure]"), name).toHaveAttribute("role", "alert");
      await expect(page.locator("#invite-content"), name).toContainText(titles[name]);
      // ไม่มี password form ใน recovery + action หลักแสดง/กดได้/อยู่ในจอ + focus ถูก
      await expect(page.locator("#invite-form")).toHaveCount(0);
      const exit = page.locator("[data-invite-exit]");
      await expect(exit, name).toBeVisible();
      await expect(exit, name).toBeEnabled();
      await expectWithinViewport(page, exit, `${name} exit action`);
      expect(await page.evaluate(() =>
        document.activeElement?.hasAttribute("data-invite-exit")
        || document.activeElement?.hasAttribute("data-invite-retry")), name).toBe(true);
      await expectNoHorizontalScroll(page);
    }

    // exit จาก recovery กลับ Login ได้ (action ไม่หาย/ใช้ได้จริง)
    await page.locator("[data-invite-exit]").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#invite-screen")).toBeHidden();
    await expect(page.locator("#login-screen")).toBeVisible();
  });

  // ---------- 9. Transient recovery — TRY AGAIN + exit ใช้ได้ทุก viewport ----------

  test("9. Transient recovery: ACTIVATION NOT COMPLETED + TRY AGAIN/exit แสดงและ focus ที่ retry", async ({ page }) => {
    await page.goto(inviteUrl(VALID_TOKEN));
    await page.waitForLoadState("networkidle");
    await fillInvitePassword(page, VALID_PASSWORD);
    // commit-time stale — snapshot mismatch → transient recovery
    await page.evaluate(() => {
      adminAccountData.accounts.find(a => a.id === "ADM-008").revision = 99;
    });
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(200);

    await expect(page.locator("[data-invite-failure]")).toHaveAttribute("data-invite-recovery", "transient");
    await expect(page.locator("#invite-content")).toContainText("ACTIVATION NOT COMPLETED");
    const retry = page.locator("[data-invite-retry]");
    const exit = page.locator("[data-invite-exit]");
    await expect(retry).toBeVisible();
    await expect(retry).toBeEnabled();
    await expect(retry).toHaveText("TRY AGAIN");
    await expect(exit).toBeVisible();
    await expect(exit).toBeEnabled();
    await expectWithinViewport(page, retry, "TRY AGAIN");
    await expectWithinViewport(page, exit, "BACK TO LOGIN");
    // transient = retry เป็น primary → focus อยู่ที่ retry
    expect(await page.evaluate(() => document.activeElement?.hasAttribute("data-invite-retry"))).toBe(true);
    await expectNoHorizontalScroll(page);
  });

  // ---------- 10. Success state — activation สำเร็จ + GO TO LOGIN ----------

  test("10. Activation success state: ACCOUNT ACTIVATED + GO TO LOGIN focus/keyboard ใช้ได้", async ({ page }) => {
    await page.goto(inviteUrl(VALID_TOKEN));
    await page.waitForLoadState("networkidle");
    await fillInvitePassword(page, VALID_PASSWORD);
    await page.locator("#invite-submit").click();
    await page.waitForTimeout(300);

    await expect(page.locator("#invite-screen")).toHaveAttribute("data-invite-state", "success");
    await expect(page.locator("#invite-content")).toContainText("ACCOUNT ACTIVATED");
    const exit = page.locator("[data-invite-exit]");
    await expect(exit).toBeVisible();
    await expect(exit).toHaveText("GO TO LOGIN");
    await expectWithinViewport(page, exit, "GO TO LOGIN");
    expect(await page.evaluate(() => document.activeElement?.hasAttribute("data-invite-exit"))).toBe(true);
    await expectNoHorizontalScroll(page);

    // keyboard Enter บน focused action → กลับ Login
    await page.keyboard.press("Enter");
    await page.waitForTimeout(200);
    await expect(page.locator("#invite-screen")).toBeHidden();
    await expect(page.locator("#login-screen")).toBeVisible();
    await expect(page.locator("#login-form")).toBeVisible();
  });

  // ---------- 11. Delivery/Audit jump จาก invitation context ----------

  test("11. Cross-module jump: History Delivery/Audit link → Delivery Logs / Audit Log กรองถูกทุก viewport", async ({ page }) => {
    await goToAdminAccounts(page);
    await openDetail(page);

    const history = page.locator(".admin-account-detail-page .admin-account-action-section");

    // Delivery jump — invitation event มี delivery ref (DLV-ACCT-*-INV-*)
    const deliveryLink = history.locator("[data-delivery-log-jump]").first();
    await expect(deliveryLink).toBeVisible();
    const deliveryId = await deliveryLink.getAttribute("data-delivery-log-jump");
    expect(deliveryId).toMatch(/^DLV-ACCT-/);
    await deliveryLink.click();
    await page.waitForTimeout(400);
    await expect(page.locator("body")).toHaveClass(/delivery-log-list-mode/);
    await expect(page.locator("#delivery-search")).toHaveValue(deliveryId);
    await expectNoHorizontalScroll(page);
    // row ที่ jump ถึงเปิด read-only detail modal — ปิดก่อนทดสอบ leg ถัดไป
    const deliveryModal = page.locator("#user-action-modal");
    if (await deliveryModal.evaluate(el => el.classList.contains("show"))) {
      await expectWithinViewport(page, deliveryModal.locator(".user-action-modal"), "delivery detail modal");
      await deliveryModal.locator("[data-user-action-modal-close]").first().click();
      await page.waitForTimeout(300);
    }

    // กลับ Admin Detail (in-page — state เดิม) แล้ว audit jump
    await ensureNavOpen(page);
    if (!(await page.evaluate(() =>
      document.querySelector(".submenu[data-submenu='settings']")?.classList.contains("open")))) {
      await page.locator(".nav-item[data-module='settings']").click();
      await page.waitForTimeout(300);
      await ensureNavOpen(page);
    }
    await page.locator(".submenu[data-submenu='settings'] button[data-module='settings'][data-sub='Admin Accounts']").click();
    await page.waitForTimeout(300);
    await openDetail(page);

    const auditLink = history.locator("[data-admin-account-audit-ref]").first();
    await expect(auditLink).toBeVisible();
    const auditRef = await auditLink.getAttribute("data-admin-account-audit-ref");
    expect(auditRef).toMatch(/^AUD-/);
    await auditLink.click();
    await page.waitForTimeout(400);
    await expect(page.locator("body")).toHaveClass(/audit-log-mode/);
    await expect(page.locator("#audit-search")).toHaveValue(auditRef);
    await expect(page.locator("#success-toast")).toContainText(auditRef);
    await expectNoHorizontalScroll(page);
  });

  // ---------- 12. Out-of-scope guard — invite mode exit ไม่ทิ้ง state/navigation เปลี่ยน ----------

  test("12. Out-of-scope guard: exit invite mode แล้ว body/nav/login กลับสภาพเดิม ไม่มี class ค้าง", async ({ page }) => {
    await page.goto(inviteUrl(VALID_TOKEN));
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#invite-screen")).toBeVisible();

    // nav items ของ app (ซ่อนอยู่หลัง invite mode) ต้องคงเดิม — navigation นอก scope ห้ามเปลี่ยน
    const navModules = await page.locator(".nav .nav-item").evaluateAll(
      items => items.map(i => i.getAttribute("data-module")));
    expect(navModules).toContain("settings");
    expect(navModules.length).toBeGreaterThanOrEqual(9);

    await page.evaluate(() => exitInviteMode());
    await page.waitForTimeout(200);
    const bodyClass = await page.evaluate(() => document.body.className);
    expect(bodyClass).not.toContain("invite-mode");
    expect(bodyClass).toContain("logged-out");
    await expect(page.locator("#invite-screen")).toBeHidden();
    await expect(page.locator("#login-screen")).toBeVisible();
    // sidebar nav ยัง render ครบหลัง exit (ไม่มี module หาย)
    expect(await page.locator(".nav .nav-item").count()).toBe(navModules.length);
  });
});
