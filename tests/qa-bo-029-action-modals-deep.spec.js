// QA-BO-029: Action modal deep dive (GAP-BO-TEST-04) — เคสที่ spec เดิมยังไม่ครอบ
// อ้างอิง prototype เป็นหลักแสดงผล: renderUserActionPage/confirmUserAction (user),
//   renderAssetHideModal/renderAssetDeletePostModal/renderAssetRestoreVisibilityModal/confirmAssetAction (asset),
//   renderReportedCommentActionModal (reported comment), email note/preview, scenario error paths,
//   completed/disabled state, delivery log entry หลัง confirm (ห้ามแก้ prototype)
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

// ---------- helpers (pattern เดียวกับ qa-bo-026/027/028) ----------

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

async function isMobile(page) {
  return await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
}

async function boot(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
}

// helper: ไป User Accounts ผ่านเมนูจริง
async function goToUserAccounts(page) {
  await boot(page);
  await ensureNavOpen(page);
  const parent = page.locator(".nav-item[data-module='users']");
  const expanded = await parent.evaluate(el => el.classList.contains("expanded")).catch(() => false);
  if (!expanded) await parent.click();
  await page.locator(".submenu[data-submenu='users'] button[data-sub='User Accounts']").click();
  await page.waitForTimeout(300);
}

// helper: ไป Asset List ผ่านเมนูจริง
async function goToAssetList(page) {
  await boot(page);
  await ensureNavOpen(page);
  const parent = page.locator(".nav-item[data-module='assets']");
  const expanded = await parent.evaluate(el => el.classList.contains("expanded")).catch(() => false);
  if (!expanded) await parent.click();
  await page.locator(".submenu[data-submenu='assets'] button[data-sub='Asset List']").click();
  await page.waitForTimeout(300);
}

// helper: ไป Reported Comments ผ่านเมนูจริง
async function goToReportedComments(page) {
  await boot(page);
  await ensureNavOpen(page);
  const parent = page.locator(".nav-item[data-module='assets']");
  const expanded = await parent.evaluate(el => el.classList.contains("expanded")).catch(() => false);
  if (!expanded) await parent.click();
  await page.locator(".submenu[data-submenu='assets'] button[data-sub='Reported Comments']").click();
  await page.waitForTimeout(300);
}

// helper: render module ตรง (เร็ว สำหรับเทสเนื้อหา/modal)
async function openModule(page, moduleId, sub) {
  await boot(page);
  await page.evaluate(([m, s]) => renderModule(m, s, s), [moduleId, sub]);
  await page.waitForTimeout(300);
}

// helper: เปิด User Detail ผ่าน search + row click (row อาจอยู่หน้า 2)
async function openUserDetail(page, userId) {
  await page.locator("#user-search").fill(userId);
  await page.waitForTimeout(250);
  await page.locator(`.user-row[data-user-card="${userId}"] .user-cell-primary`).click();
  await page.waitForTimeout(300);
}

// helper: เปิด Asset Detail ผ่าน search + row click
async function openAssetDetail(page, assetId) {
  await page.locator("#search").fill(assetId);
  await page.waitForTimeout(250);
  await page.locator(`.asset-row[data-asset-card="${assetId}"] .asset-cell-primary`).click();
  await page.waitForTimeout(300);
}

// helper: เลือก option ใน custom-select ภายใน modal (ผ่าน UI จริง)
async function pickModalOption(page, inputId, value) {
  await page
    .locator(`#user-action-modal div[data-custom-select]:has(> #${inputId}) [data-custom-select-trigger]`)
    .click();
  await page.waitForTimeout(150);
  await page
    .locator(`#user-action-modal div[data-custom-select]:has(> #${inputId}) [data-custom-select-option][data-value="${value}"]`)
    .click();
  await page.waitForTimeout(200);
}

// helper: set ค่า hidden input ของ scenario select (test hook ของ prototype)
async function setScenario(page, inputId, value) {
  await page.evaluate(([id, v]) => {
    const input = document.querySelector(`#${id}`);
    if (input) input.value = v;
  }, [inputId, value]);
}

async function toastText(page) {
  return (await page.locator("#success-toast").innerText()).trim();
}

// ==================== SPEC ====================

test.describe("QA-BO-029: Action modal deep dive (GAP-BO-TEST-04)", () => {

  // ---------- A. USER: Suspend email note/preview/suspend-until ----------

  test.describe("User action modal — Suspend deep", () => {
    test("1. Suspend modal: email note แจ้ง provider 'อีเมลที่ลงทะเบียน' + preview subject TH/EN", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetail(page, "U-1017");
      await page.locator(".user-detail-page button[data-user-action='Suspend']").click();
      await page.waitForTimeout(250);
      const modal = page.locator("#user-action-modal");
      await expect(modal).toHaveClass(/show/);
      await expect(page.locator("#user-action-modal-title")).toHaveText("Suspend Account");
      // email note (notice card) — Email auth → provider 'อีเมลที่ลงทะเบียน' + full email
      const emailNote = modal.locator(".user-action-impact-notice");
      await expect(emailNote).toContainText("แจ้งผู้ใช้");
      await expect(emailNote).toContainText("crowntimebkk@tukdaeng.example");
      await expect(emailNote).toContainText("อีเมลที่ลงทะเบียน");
      // email preview collapsed by default + subject bilingual
      const preview = modal.locator("[data-account-status-email-preview]");
      await expect(preview).toHaveCount(1);
      await expect(preview.locator("[data-email-preview-subject]")).toContainText("บัญชีของคุณถูกระงับชั่วคราว");
      await expect(preview.locator("[data-email-preview-subject]")).toContainText("temporarily suspended");
      // body มีทั้ง TH/EN + บรรทัดวันสิ้นสุดระงับ
      const msg = preview.locator("[data-email-preview-message]");
      await expect(msg).toContainText("บัญชีของคุณถูกระงับชั่วคราวระหว่างการตรวจสอบ");
      await expect(msg).toContainText("Your account has been temporarily suspended");
      await expect(msg).toContainText("บัญชีจะถูกระงับถึงวันที่:");
    });

    test("2. Suspend email preview live update: เปลี่ยน reason + suspend-until แล้วเนื้อหาเปลี่ยนตาม", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetail(page, "U-1017");
      await page.locator(".user-detail-page button[data-user-action='Suspend']").click();
      await page.waitForTimeout(250);
      const msg = page.locator("[data-account-status-email-preview] [data-email-preview-message]");
      // default reason (options[0]) อยู่ใน body แล้ว
      await expect(msg).toContainText("เหตุผลการดำเนินการ: มีรายงานความเสี่ยงสูง รอตรวจสอบ");
      // เปลี่ยน reason ผ่าน UI จริง → preview อัปเดต
      await pickModalOption(page, "user-action-reason", "สงสัยว่าเป็นบัญชีหรือโปรไฟล์ซ้ำ");
      await expect(msg).toContainText("เหตุผลการดำเนินการ: สงสัยว่าเป็นบัญชีหรือโปรไฟล์ซ้ำ");
      await expect(msg).toContainText("Action reason: Suspected duplicate account or profile");
      // เปลี่ยนวันสิ้นสุด → บรรทัดวันที่อัปเดต (format DD/MM/YYYY)
      const untilInput = page.locator("#user-action-suspend-until");
      const today = new Date();
      const target = new Date(today.getTime() + 14 * 86400000);
      const iso = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-${String(target.getDate()).padStart(2, "0")}`;
      await untilInput.fill(iso);
      await untilInput.dispatchEvent("change");
      await page.waitForTimeout(150);
      const ddmmyyyy = `${String(target.getDate()).padStart(2, "0")}/${String(target.getMonth() + 1).padStart(2, "0")}/${target.getFullYear()}`;
      await expect(msg).toContainText(`บัญชีจะถูกระงับถึงวันที่: ${ddmmyyyy}`);
      await expect(msg).toContainText(`Suspended until: ${ddmmyyyy}`);
    });

    test("3. Suspend-until: default = today+7, min = today", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetail(page, "U-1017");
      await page.locator(".user-detail-page button[data-user-action='Suspend']").click();
      await page.waitForTimeout(250);
      const until = page.locator("#user-action-suspend-until");
      const fmt = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const today = new Date();
      const plus7 = new Date(today.getTime() + 7 * 86400000);
      await expect(until).toHaveValue(fmt(plus7));
      await expect(until).toHaveAttribute("min", fmt(today));
      // helper text อธิบาย auto-restore
      await expect(page.locator("#user-action-modal .suspension-end-field .field-helper")).toContainText("ค่าเริ่มต้นคือ 7 วัน");
    });

    test("4. Suspend สำเร็จ: history row ใหม่มี note + อีเมล reference + action area เหลือ Restore/Ban", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetail(page, "U-1144");
      await page.locator(".user-detail-page button[data-user-action='Suspend']").click();
      await page.waitForTimeout(250);
      await page.locator("#user-action-note").fill("ตรวจจากเคส SUP-177");
      await page.locator("#user-action-modal [data-user-action-confirm='Suspend']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toContainText("Seiko Corner ถูกระงับบัญชีชั่วคราวแล้ว · ส่งอีเมลแจ้งผู้ใช้");
      // action area เปลี่ยนเป็น Restore + Ban เท่านั้น (updateUserActionsForStatus)
      const actions = page.locator(".user-detail-page .user-detail-action-section button[data-user-action]");
      await expect(actions).toHaveCount(2);
      await expect(page.locator(".user-detail-page button[data-user-action='Restore']")).toBeVisible();
      await expect(page.locator(".user-detail-page button[data-user-action='Ban']")).toBeVisible();
      // history row แรก: action label TH + note มี text ที่พิมพ์ + อีเมล + วันสิ้นสุด
      const firstRow = page.locator(".user-account-history-table tbody tr").first();
      await expect(firstRow).toContainText("ระงับบัญชีชั่วคราว");
      await expect(firstRow).toContainText("ตรวจจากเคส SUP-177");
      await expect(firstRow).toContainText("ส่งอีเมลแจ้งไปที่ seikocorner@watchmail.com");
      await expect(firstRow).toContainText("สิ้นสุดระงับ");
    });

    test("5. Suspend → สร้าง delivery log DLV-ACCT-MANUAL-SUS ใน Settings > Delivery Logs", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetail(page, "U-1144");
      await page.locator(".user-detail-page button[data-user-action='Suspend']").click();
      await page.waitForTimeout(250);
      await page.locator("#user-action-modal [data-user-action-confirm='Suspend']").click();
      await page.waitForTimeout(400);
      // delivery row ถูก splice เข้า settings.rows — ตรวจผ่าน Delivery Logs UI จริง
      await page.evaluate(() => renderModule("settings", "Delivery Logs", "Delivery Logs"));
      await page.waitForSelector(".delivery-log-table", { timeout: 5000 });
      await page.locator("#delivery-search").fill("DLV-ACCT-MANUAL-SUS");
      await page.waitForTimeout(250);
      const row = page.locator(".delivery-log-table .user-row.delivery-row[data-delivery-card='DLV-ACCT-MANUAL-SUS']");
      await expect(row).toHaveCount(1);
      await expect(row.locator("div[data-label='Status'] .pill")).toHaveText("Sent");
    });
  });

  // ---------- B. USER: Ban / Restore / Unban / Reset deep ----------

  test.describe("User action modal — Ban/Restore/Reset deep", () => {
    test("6. Ban modal: title/reasons 4/impact ถาวร/email preview subject ถาวร + ไม่มี suspend-until", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetail(page, "U-1017");
      await page.locator(".user-detail-page button[data-user-action='Ban']").click();
      await page.waitForTimeout(250);
      const modal = page.locator("#user-action-modal");
      await expect(page.locator("#user-action-modal-title")).toHaveText("Ban User");
      await expect(modal.locator("div[data-custom-select]:has(> #user-action-reason) [data-custom-select-option]")).toHaveCount(4);
      await expect(modal.locator(".user-action-impact-warning p")).toContainText("ไม่สามารถเข้าสู่ระบบเพื่อใช้งานแอปพลิเคชันได้จนกว่า Admin จะยกเลิกการระงับบัญชีถาวร");
      await expect(modal.locator(".user-action-impact-notice")).toContainText("การระงับบัญชีถาวร");
      await expect(modal.locator("[data-email-preview-subject]")).toContainText("ถูกระงับถาวร");
      await expect(modal.locator("[data-email-preview-subject]")).toContainText("permanently suspended");
      await expect(page.locator("#user-action-suspend-until")).toHaveCount(0);
      await expect(modal.locator("[data-user-action-confirm='Ban']")).toHaveClass(/danger/);
    });

    test("7. Ban สำเร็จ: status Banned + pill red + action เหลือ Unban user + delivery DLV-ACCT-MANUAL-BAN", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetail(page, "U-1144");
      await page.locator(".user-detail-page button[data-user-action='Ban']").click();
      await page.waitForTimeout(250);
      await page.locator("#user-action-modal [data-user-action-confirm='Ban']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toContainText("Seiko Corner ถูกระงับบัญชีถาวรแล้ว · ส่งอีเมลแจ้งผู้ใช้");
      await expect(page.locator(".user-detail-page .chips .pill").first()).toHaveClass(/red/);
      await expect(page.locator(".user-detail-page .chips .pill").first()).toHaveText("Banned");
      const actions = page.locator(".user-detail-page .user-detail-action-section button[data-user-action]");
      await expect(actions).toHaveCount(1);
      await expect(actions.first()).toHaveAttribute("data-user-action", "Unban user");
      const firstRow = page.locator(".user-account-history-table tbody tr").first();
      await expect(firstRow).toContainText("ระงับบัญชีถาวร");
      // delivery log entry ใน settings.rows
      const hasDelivery = await page.evaluate(() =>
        moduleData.settings.rows.some(r => r.id === "DLV-ACCT-MANUAL-BAN"));
      expect(hasDelivery).toBe(true);
    });

    test("8. Ban บัญชี Apple (U-1042): email note ระบุ 'อีเมล Apple Private Relay'", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetail(page, "U-1042");
      await page.locator(".user-detail-page button[data-user-action='Ban']").click();
      await page.waitForTimeout(250);
      const emailNote = page.locator("#user-action-modal .user-action-impact-notice");
      await expect(emailNote).toContainText("nattapol@privaterelay.appleid.com");
      await expect(emailNote).toContainText("อีเมล Apple Private Relay");
    });

    test("9. Restore บัญชี Suspended (U-1002 Google): modal ไม่มี email note → Active + allowed เหลือ Suspend/Ban", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetail(page, "U-1002");
      await page.locator(".user-detail-page button[data-user-action='Restore']").click();
      await page.waitForTimeout(250);
      const modal = page.locator("#user-action-modal");
      await expect(page.locator("#user-action-modal-title")).toHaveText("Unsuspend Account");
      await expect(modal.locator("div[data-custom-select]:has(> #user-action-reason) [data-custom-select-option]")).toHaveCount(3);
      // Restore ไม่ render email note/preview (getAccountStatusEmailNote เฉพาะ Suspend/Ban)
      await expect(modal.locator(".user-action-impact-notice")).toHaveCount(0);
      await expect(modal.locator("[data-account-status-email-preview]")).toHaveCount(0);
      await expect(modal.locator("[data-user-action-confirm='Restore']")).toHaveClass(/primary/);
      await modal.locator("[data-user-action-confirm='Restore']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toContainText("horology.king กลับมาใช้งานได้แล้ว");
      await expect(page.locator(".user-detail-page .chips .pill").first()).toHaveClass(/green/);
      // Google auth → allowed = Suspend + Ban (ไม่มี Reset password)
      await expect(page.locator(".user-detail-page button[data-user-action='Suspend']")).toBeVisible();
      await expect(page.locator(".user-detail-page button[data-user-action='Ban']")).toBeVisible();
      await expect(page.locator(".user-detail-page button[data-user-action='Reset password']")).toHaveCount(0);
      // delivery log RES สร้าง (Restore เป็น email action)
      const hasDelivery = await page.evaluate(() =>
        moduleData.settings.rows.some(r => r.id === "DLV-ACCT-MANUAL-RES"));
      expect(hasDelivery).toBe(true);
    });

    test("10. Reset password modal: ไม่มี suspend-until/impact-warning/email preview + confirm primary", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetail(page, "U-1017");
      await page.locator(".user-detail-page button[data-user-action='Reset password']").click();
      await page.waitForTimeout(250);
      const modal = page.locator("#user-action-modal");
      await expect(page.locator("#user-action-modal-title")).toHaveText("Reset Password Link");
      await expect(page.locator("#user-action-suspend-until")).toHaveCount(0);
      await expect(modal.locator("[data-account-status-email-preview]")).toHaveCount(0);
      // impact card มี (FO impact text) แต่ไม่ใช่ email notice
      await expect(modal.locator(".user-action-impact-warning p")).toContainText("ไม่มีผลกับสถานะบัญชี");
      await expect(modal.locator("[data-user-action-confirm='Reset password']")).toHaveClass(/primary/);
    });
  });

  // ---------- C. USER: error scenario variants + retry ----------

  test.describe("User action modal — error scenario variants", () => {
    const userErrorCases = [
      ["stale_data", "ข้อมูลมีการเปลี่ยนแปลงแล้ว", "มีการอัปเดตบัญชีนี้ระหว่างที่เปิดหน้าต่างยืนยัน"],
      ["policy_blocked", "ยังไม่ผ่านเงื่อนไขที่ระบบกำหนด", "ยังมีเงื่อนไขที่ต้องตรวจสอบก่อนดำเนินการ"],
      ["delivery_failed", "ส่งข้อมูลไม่สำเร็จ", "ระบบส่งข้อมูลให้ผู้ใช้ไม่สำเร็จ"],
      ["session_expired", "เซสชันหมดอายุ", "กรุณาเข้าสู่ระบบใหม่ก่อนดำเนินการ"]
    ];
    for (const [scenario, title, detailPart] of userErrorCases) {
      test(`11. scenario ${scenario} → error banner + modal ค้าง + สถานะไม่เปลี่ยน`, async ({ page }) => {
        await goToUserAccounts(page);
        await openUserDetail(page, "U-1017");
        await page.locator(".user-detail-page button[data-user-action='Suspend']").click();
        await page.waitForTimeout(250);
        await setScenario(page, "user-action-scenario", scenario);
        await page.locator("#user-action-modal [data-user-action-confirm='Suspend']").click();
        await page.waitForTimeout(300);
        const result = page.locator("#user-action-modal .user-action-result");
        await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
        await expect(result).toHaveClass(/show/);
        await expect(result).toHaveClass(/error/);
        await expect(result).toContainText(title);
        await expect(result).toContainText(detailPart);
        // สถานะยัง Active + ไม่มี delivery log ถูกสร้าง
        await expect(page.locator(".user-detail-page .chips .pill").first()).toHaveText("Active");
        const hasDelivery = await page.evaluate(() =>
          moduleData.settings.rows.some(r => r.id === "DLV-ACCT-MANUAL-SUS"));
        expect(hasDelivery).toBe(false);
      });
    }

    test("12. retry หลัง error: กลับ scenario เป็น success แล้ว confirm สำเร็จ", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetail(page, "U-1017");
      await page.locator(".user-detail-page button[data-user-action='Suspend']").click();
      await page.waitForTimeout(250);
      await setScenario(page, "user-action-scenario", "stale_data");
      await page.locator("#user-action-modal [data-user-action-confirm='Suspend']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#user-action-modal .user-action-result")).toContainText("ข้อมูลมีการเปลี่ยนแปลงแล้ว");
      // confirm button ยังไม่ disabled (error ≠ completed) → retry ได้
      await expect(page.locator("#user-action-modal [data-user-action-confirm='Suspend']")).toBeEnabled();
      await setScenario(page, "user-action-scenario", "success");
      await page.locator("#user-action-modal [data-user-action-confirm='Suspend']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toContainText("Crown Time BKK ถูกระงับบัญชีชั่วคราวแล้ว");
      await expect(page.locator(".user-detail-page .chips .pill").first()).toHaveText("Suspended");
    });

    test("13. Resend verification + delivery_failed → error เฉพาะทาง 'ส่งอีเมลยืนยันไม่สำเร็จ'", async ({ page }) => {
      await goToUserAccounts(page);
      await openUserDetail(page, "U-1055");
      await page.locator(".user-detail-page button[data-user-action='Resend verification context']").click();
      await page.waitForTimeout(250);
      await setScenario(page, "user-action-scenario", "delivery_failed");
      await page.locator("#user-action-modal [data-user-action-confirm='Resend verification context']").click();
      await page.waitForTimeout(300);
      const result = page.locator("#user-action-modal .user-action-result");
      await expect(result).toHaveClass(/show/);
      await expect(result).toContainText("ส่งอีเมลยืนยันไม่สำเร็จ");
      await expect(page.locator(".user-detail-page .chips .pill").first()).toHaveText("Pending Verification");
    });
  });

  // ---------- D. ASSET: hide/delete/restore deep ----------

  test.describe("Asset action modal — hide/delete/restore deep", () => {
    test("14. Hide modal (AST-8802 Sale): email note owner + preview subject + impact surface Sale", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetail(page, "AST-8802");
      await page.locator(".user-detail-page button[data-asset-action='hide']").click();
      await page.waitForTimeout(250);
      const modal = page.locator("#user-action-modal");
      await expect(page.locator("#user-action-modal-title")).toHaveText("ซ่อนสินทรัพย์ชั่วคราว");
      await expect(modal.locator(".user-action-target")).toContainText("Omega Speedmaster");
      await expect(modal.locator(".user-action-target")).toContainText("AST-8802 · Vintage Vault BKK");
      // reason label อ้าง type Sale + options 4
      await expect(modal.locator("label:has(#asset-hide-reason)")).toContainText("เหตุผลการซ่อนชั่วคราวของ Sale");
      await expect(modal.locator("div[data-custom-select]:has(> #asset-hide-reason) [data-custom-select-option]")).toHaveCount(4);
      // impact note (Sale → public surfaces เต็ม)
      await expect(modal.locator(".user-action-impact-warning p")).toContainText("Feed, Search, Profile, Watch Alert และ Chat reference");
      // email note อ้าง owner email จริงจาก assetOwnerProfiles
      const emailNote = modal.locator(".user-action-impact-notice");
      await expect(emailNote).toContainText("sales@vintagevault.example");
      await expect(emailNote).toContainText("registered owner email");
      // preview subject + body อ้าง asset
      const preview = modal.locator("[data-asset-hide-email-preview]");
      await expect(preview.locator("[data-email-preview-subject]")).toContainText("สินทรัพย์ของคุณถูกซ่อนชั่วคราว");
      await expect(preview.locator("[data-email-preview-subject]")).toContainText("temporarily hidden");
      await expect(preview.locator("[data-email-preview-message]")).toContainText("Omega Speedmaster (AST-8802)");
      await expect(modal.locator("[data-asset-action-confirm='hide']")).toHaveClass(/warning/);
    });

    test("15. Hide email preview live update ตาม reason ที่เลือก", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetail(page, "AST-8802");
      await page.locator(".user-detail-page button[data-asset-action='hide']").click();
      await page.waitForTimeout(250);
      const msg = page.locator("[data-asset-hide-email-preview] [data-email-preview-message]");
      await expect(msg).toContainText("เหตุผลการดำเนินการ: มีรายงานความเสี่ยงสูง รอตรวจสอบ");
      await pickModalOption(page, "asset-hide-reason", "สงสัยว่ารูปหรือ serial ไม่ตรงกับหลักฐานเจ้าของ");
      await expect(msg).toContainText("เหตุผลการดำเนินการ: สงสัยว่ารูปหรือ serial ไม่ตรงกับหลักฐานเจ้าของ");
      await expect(msg).toContainText("Action reason: สงสัยว่ารูปหรือ serial ไม่ตรงกับหลักฐานเจ้าของ");
    });

    test("16. Hide modal ของ Show asset (AST-8755): reasonLabel/impact ใช้ surface ของ Show", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetail(page, "AST-8755");
      await page.locator(".user-detail-page button[data-asset-action='hide']").click();
      await page.waitForTimeout(250);
      const modal = page.locator("#user-action-modal");
      await expect(modal.locator("label:has(#asset-hide-reason)")).toContainText("เหตุผลการซ่อนชั่วคราวของ Show");
      await expect(modal.locator(".user-action-impact-warning p")).toContainText("Profile / Collection และ public reference ที่เกี่ยวข้อง");
    });

    test("17. Hide สำเร็จ: toast 'AST-8802: Sale / Active → Sale / Admin Hidden' + history AUD- ใหม่ + pill ซ่อนชั่วคราว", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetail(page, "AST-8802");
      await page.locator(".user-detail-page button[data-asset-action='hide']").click();
      await page.waitForTimeout(250);
      await page.locator("#asset-hide-note").fill("serial ไม่ตรงกับรูปที่แนบมา");
      await page.locator("#user-action-modal [data-asset-action-confirm='hide']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toContainText("AST-8802: Sale / Active → Sale / Admin Hidden");
      // moderation pill ซ่อนชั่วคราว amber ใน detail head
      await expect(page.locator(".user-detail-page .chips .pill.amber")).toHaveText("ซ่อนชั่วคราว");
      // history row ใหม่ action Force Hide Asset + note ที่พิมพ์
      const hist = await page.evaluate(() => {
        const a = moduleData.assets.rows.find(r => r.id === "AST-8802");
        return a.assetHistory[0];
      });
      expect(hist.action).toBe("Force Hide Asset");
      expect(hist.note).toContain("serial ไม่ตรงกับรูปที่แนบมา");
      expect(hist.id).toMatch(/^AUD-AST-8802-\d{3}$/);
    });

    test("18. Delete-post modal: title ถาวร + confirm danger + impact read-only + preview subject ถาวร", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetail(page, "AST-8802");
      await page.locator(".user-detail-page button[data-asset-action='delete-post']").click();
      await page.waitForTimeout(250);
      const modal = page.locator("#user-action-modal");
      await expect(page.locator("#user-action-modal-title")).toHaveText("ซ่อนสินทรัพย์ถาวร");
      await expect(modal.locator("[data-asset-action-confirm='delete-post']")).toHaveClass(/danger/);
      await expect(modal.locator(".user-action-impact-warning p")).toContainText("เจ้าของยังเห็นแบบ read-only แต่แก้ไข ยกเลิกซ่อน หรือลบเองไม่ได้");
      await expect(modal.locator(".user-action-impact-notice")).toContainText("แจ้งการซ่อนสินทรัพย์ถาวร");
      await expect(modal.locator("[data-asset-delete-email-preview] [data-email-preview-subject]")).toContainText("สินทรัพย์ของคุณถูกซ่อนถาวร");
      await expect(modal.locator("[data-asset-delete-email-preview] [data-email-preview-subject]")).toContainText("permanently hidden");
      // scenario select มี archive_failed option (เฉพาะ delete-post)
      await expect(page.locator("#asset-delete-scenario")).toHaveValue("success");
      const options = await page.evaluate(() =>
        assetDeletePostFlowScenarios.map(o => o.value));
      expect(options).toContain("archive_failed");
    });

    test("19. Delete-post สำเร็จ: toast Permanently Hidden + action area หาย + pill ซ่อนถาวร red", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetail(page, "AST-8802");
      await page.locator(".user-detail-page button[data-asset-action='delete-post']").click();
      await page.waitForTimeout(250);
      await page.locator("#user-action-modal [data-asset-action-confirm='delete-post']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toContainText("AST-8802: Sale / Active → Sale / Permanently Hidden");
      await expect(page.locator(".user-detail-page .chips .pill.red")).toHaveText("ซ่อนถาวร");
      // permanently hidden → ไม่มี action button แล้ว
      await expect(page.locator(".user-detail-page button[data-asset-action]")).toHaveCount(0);
      const hist = await page.evaluate(() =>
        moduleData.assets.rows.find(r => r.id === "AST-8802").assetHistory[0].action);
      expect(hist).toBe("Permanent Hide Asset");
    });

    test("20. Restore-visibility modal (AST-8831 Auto Hidden): preview subject + confirm primary → toast Sale / Active", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetail(page, "AST-8831");
      await page.locator(".user-detail-page button[data-asset-action='restore-visibility']").click();
      await page.waitForTimeout(250);
      const modal = page.locator("#user-action-modal");
      await expect(page.locator("#user-action-modal-title")).toHaveText("ยกเลิกการซ่อนชั่วคราว");
      await expect(modal.locator("[data-asset-action-confirm='restore-visibility']")).toHaveClass(/primary/);
      await expect(modal.locator("[data-asset-restore-email-preview] [data-email-preview-subject]")).toContainText("สินทรัพย์ของคุณกลับมาแสดงผลแล้ว");
      await expect(modal.locator("[data-asset-restore-email-preview] [data-email-preview-subject]")).toContainText("visibility has been restored");
      await modal.locator("[data-asset-action-confirm='restore-visibility']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toContainText("AST-8831: Sale / Auto Hidden → Sale / Active");
      await expect(page.locator(".user-detail-page .chips .pill.amber")).toHaveCount(0);
      const hist = await page.evaluate(() =>
        moduleData.assets.rows.find(r => r.id === "AST-8831").assetHistory[0].action);
      expect(hist).toBe("Restore Visibility");
    });
  });

  // ---------- E. ASSET: error scenario + stale-state guard ----------

  test.describe("Asset action modal — error scenario + guard", () => {
    const assetHideErrors = [
      ["invalid_state", "ไม่สามารถซ่อนชั่วคราวได้"],
      ["stale_data", "ข้อมูล Asset มีการเปลี่ยนแปลงแล้ว"],
      ["policy_blocked", "ยังไม่สามารถซ่อน Asset นี้ได้"],
      ["sync_failed", "ซ่อนจากพื้นที่สาธารณะไม่สำเร็จ"],
      ["audit_failed", "บันทึก Audit Log ไม่สำเร็จ"],
      ["session_expired", "เซสชันหมดอายุ"]
    ];
    for (const [scenario, title] of assetHideErrors) {
      test(`21. hide scenario ${scenario} → error banner + สถานะไม่เปลี่ยน`, async ({ page }) => {
        await goToAssetList(page);
        await openAssetDetail(page, "AST-8802");
        await page.locator(".user-detail-page button[data-asset-action='hide']").click();
        await page.waitForTimeout(250);
        await setScenario(page, "asset-hide-scenario", scenario);
        await page.locator("#user-action-modal [data-asset-action-confirm='hide']").click();
        await page.waitForTimeout(300);
        const result = page.locator("#user-action-modal .user-action-result");
        await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
        await expect(result).toHaveClass(/show/);
        await expect(result).toHaveClass(/error/);
        await expect(result).toContainText(title);
        const status = await page.evaluate(() =>
          moduleData.assets.rows.find(r => r.id === "AST-8802").status);
        expect(status).toBe("Active");
      });
    }

    test("22. delete-post scenario archive_failed → error banner 'ซ่อนถาวรไม่สำเร็จ' + สถานะไม่เปลี่ยน", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetail(page, "AST-8802");
      await page.locator(".user-detail-page button[data-asset-action='delete-post']").click();
      await page.waitForTimeout(250);
      await setScenario(page, "asset-delete-scenario", "archive_failed");
      await page.locator("#user-action-modal [data-asset-action-confirm='delete-post']").click();
      await page.waitForTimeout(300);
      const result = page.locator("#user-action-modal .user-action-result");
      await expect(result).toHaveClass(/show/);
      await expect(result).toHaveClass(/error/);
      await expect(result).toContainText("ซ่อนถาวรไม่สำเร็จ");
      const status = await page.evaluate(() =>
        moduleData.assets.rows.find(r => r.id === "AST-8802").status);
      expect(status).toBe("Active");
    });

    test("23. stale-state guard: asset ถูกซ่อนไปแล้วก่อน confirm → modal ปิด + guard toast", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetail(page, "AST-8802");
      await page.locator(".user-detail-page button[data-asset-action='hide']").click();
      await page.waitForTimeout(250);
      // จำลอง concurrent update: status เปลี่ยนเป็น Admin Hidden ก่อนกดยืนยัน
      await page.evaluate(() => {
        moduleData.assets.rows.find(r => r.id === "AST-8802").status = "Admin Hidden";
      });
      await page.locator("#user-action-modal [data-asset-action-confirm='hide']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
      await expect(page.locator("#success-toast")).toContainText("AST-8802: สถานะล่าสุดไม่เข้าเงื่อนไขซ่อนชั่วคราว");
      const hist0 = await page.evaluate(() =>
        (moduleData.assets.rows.find(r => r.id === "AST-8802").assetHistory || [])[0]?.action);
      expect(hist0).not.toBe("Force Hide Asset");
    });

    test("24. stale-state guard: delete-post บน asset ที่ซ่อนถาวรแล้ว → guard toast ซ่อนถาวร", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetail(page, "AST-8802");
      await page.locator(".user-detail-page button[data-asset-action='delete-post']").click();
      await page.waitForTimeout(250);
      await page.evaluate(() => {
        moduleData.assets.rows.find(r => r.id === "AST-8802").status = "Permanently Hidden";
      });
      await page.locator("#user-action-modal [data-asset-action-confirm='delete-post']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
      await expect(page.locator("#success-toast")).toContainText("AST-8802: สถานะล่าสุดไม่เข้าเงื่อนไขซ่อนถาวร");
    });

    test("25. hide retry หลัง error: scenario กลับ success → confirm ผ่าน", async ({ page }) => {
      await goToAssetList(page);
      await openAssetDetail(page, "AST-8802");
      await page.locator(".user-detail-page button[data-asset-action='hide']").click();
      await page.waitForTimeout(250);
      await setScenario(page, "asset-hide-scenario", "audit_failed");
      await page.locator("#user-action-modal [data-asset-action-confirm='hide']").click();
      await page.waitForTimeout(300);
      await expect(page.locator("#user-action-modal .user-action-result")).toContainText("บันทึก Audit Log ไม่สำเร็จ");
      await setScenario(page, "asset-hide-scenario", "success");
      await page.locator("#user-action-modal [data-asset-action-confirm='hide']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toContainText("AST-8802: Sale / Active → Sale / Admin Hidden");
    });
  });

  // ---------- F. Reported comment action modal deep ----------

  test.describe("Reported comment action modal — deep", () => {
    test("26. Hide comment modal (RCO-711): title/reasons 4/target excerpt/email preview/confirm warning", async ({ page }) => {
      await goToReportedComments(page);
      await page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-711'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      await page.locator(".report-detail-page button[data-reported-comment-action='Hide comment']").click();
      await page.waitForTimeout(250);
      const modal = page.locator("#user-action-modal");
      await expect(page.locator("#user-action-modal-title")).toHaveText("ซ่อนความคิดเห็นชั่วคราว");
      await expect(modal.locator(".reported-comment-action-target")).toContainText("bit.ly/superdeal");
      await expect(modal.locator("div[data-custom-select]:has(> #reported-comment-action-reason) [data-custom-select-option]")).toHaveCount(4);
      await expect(page.locator("#reported-comment-action-note")).toBeVisible();
      const preview = modal.locator("[data-reported-comment-action-email-preview]");
      await expect(preview).toHaveCount(1);
      await expect(modal.locator("[data-reported-comment-action-confirm='Hide comment']")).toHaveClass(/warning/);
    });

    test("27. Hide comment สำเร็จ: commentStatus Hidden + toast + action set เหลือ Restore/Remove", async ({ page }) => {
      await goToReportedComments(page);
      await page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-711'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      await page.locator(".report-detail-page button[data-reported-comment-action='Hide comment']").click();
      await page.waitForTimeout(250);
      await page.locator("#user-action-modal [data-reported-comment-action-confirm='Hide comment']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toHaveClass(/show/);
      const st = await page.evaluate(() => {
        const r = reportedCommentCases.find(c => c.id === "RCO-711");
        return { commentStatus: r.commentStatus, status: r.status };
      });
      expect(st.commentStatus).toBe("Hidden");
      // hidden → action set = Restore comment + Remove comment
      await expect(page.locator(".report-detail-page button[data-reported-comment-action='Restore comment']")).toBeVisible();
      await expect(page.locator(".report-detail-page button[data-reported-comment-action='Remove comment']")).toBeVisible();
      await expect(page.locator(".report-detail-page button[data-reported-comment-action='Hide comment']")).toHaveCount(0);
    });

    test("28. comment action scenario save_failed/audit_failed → error banner + สถานะไม่เปลี่ยน", async ({ page }) => {
      for (const [scenario, title] of [["save_failed", "บันทึกผลการดำเนินการไม่สำเร็จ"], ["audit_failed", "บันทึก Audit Log ไม่สำเร็จ"]]) {
        await goToReportedComments(page);
        await page.locator(".user-row.reported-comment-row[data-reported-comment-card='RCO-711'] .user-cell-primary").click();
        await page.waitForTimeout(300);
        await page.locator(".report-detail-page button[data-reported-comment-action='Hide comment']").click();
        await page.waitForTimeout(250);
        await setScenario(page, "reported-comment-action-scenario", scenario);
        await page.locator("#user-action-modal [data-reported-comment-action-confirm='Hide comment']").click();
        await page.waitForTimeout(300);
        const result = page.locator("#user-action-modal .user-action-result");
        await expect(result).toHaveClass(/show/);
        await expect(result).toHaveClass(/error/);
        await expect(result).toContainText(title);
        const st = await page.evaluate(() => reportedCommentCases.find(c => c.id === "RCO-711").commentStatus);
        expect(st).not.toBe("Hidden");
        await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
        await page.waitForTimeout(200);
      }
    });
  });

  // ---------- G. Cross-module: report context audit + delivery ----------

  test.describe("Report-context action — audit + delivery chain", () => {
    test("29. Suspend จาก Reported Users context: audit log ใหม่ ACCOUNT_STATUS_UPDATED + emailDelivery sent + DLV-ACCT-<report>-SUS", async ({ page }) => {
      await boot(page);
      await ensureNavOpen(page);
      const parent = page.locator(".nav-item[data-module='users']");
      const expanded = await parent.evaluate(el => el.classList.contains("expanded")).catch(() => false);
      if (!expanded) await parent.click();
      await page.locator(".submenu[data-submenu='users'] button[data-sub='Reported Users']").click();
      await page.waitForTimeout(300);
      await page.locator(".user-row.report-row[data-report-id='RPU-512'] .user-cell-primary").click();
      await page.waitForTimeout(300);
      const auditBefore = await page.evaluate(() =>
        (userManagementData.reports.find(r => r.id === "RPU-512").auditLogs || []).length);
      await page.locator(".report-detail-page button[data-user-action='Suspend']").click();
      await page.waitForTimeout(250);
      await page.locator("#user-action-modal [data-user-action-confirm='Suspend']").click();
      await page.waitForTimeout(400);
      await expect(page.locator("#success-toast")).toContainText("ถูกระงับบัญชีชั่วคราวแล้ว");
      const after = await page.evaluate(() => {
        const report = userManagementData.reports.find(r => r.id === "RPU-512");
        return { logs: report.auditLogs, accountStatus: report.accountStatus };
      });
      expect(after.logs.length).toBe(auditBefore + 1);
      const latest = after.logs[0];
      expect(latest.action).toBe("ACCOUNT_STATUS_UPDATED");
      expect(latest.emailDelivery.status).toBe("sent");
      expect(latest.emailDelivery.deliveryId).toBe("DLV-ACCT-512-SUS");
      expect(after.accountStatus).toBe("Suspended");
      const hasDelivery = await page.evaluate(() =>
        moduleData.settings.rows.some(r => r.id === "DLV-ACCT-512-SUS"));
      expect(hasDelivery).toBe(true);
    });
  });
});
