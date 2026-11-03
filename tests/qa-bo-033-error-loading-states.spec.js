// QA-BO-033: Error/loading/empty states (GAP-BO-TEST-08)
// เคส state ที่ spec เดิมยังไม่ครอบ โดยใช้ scenario hooks ที่ prototype มีอยู่:
//   Roles & Permissions — #role-list-state (loading/error/empty/unauthorized),
//   #role-detail-state (loading/partial/error/unauthorized/notfound/stale),
//   Audit Log — result pill Partial/Failed ใน detail drawer,
//   Delivery Logs — status Retry pill + retry detail
// อ้างอิง render/labels จริงใน Prototypes/bo-prototype.html — ห้ามแก้ prototype
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

async function loginIfNeeded(page) {
  const loginScreen = page.locator("#login-screen");
  if (await loginScreen.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator("#login-form button[type=\"submit\"]").click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await page.waitForTimeout(500);
  }
}

async function boot(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
}

async function openModule(page, moduleId, sub) {
  await boot(page);
  await page.evaluate(([m, s]) => renderModule(m, s, s), [moduleId, sub]);
  await page.waitForTimeout(400);
}

// ตั้งค่า role scenario state + re-render (hook เดียวกับ custom-select change handler)
async function setRoleState(page, scope, state) {
  await page.evaluate(([sc, st]) => {
    if (sc === "list") {
      roleListViewState = st;
      renderRoleListRows();
      syncRoleStateTools("list");
    }
  }, [scope, state]);
  await page.waitForTimeout(300);
}

async function setRoleDetailState(page, roleId, state) {
  await page.evaluate(([id, st]) => {
    roleDetailViewState = st;
    renderRoleDetailPage(id);
    syncRoleStateTools("detail");
  }, [roleId, state]);
  await page.waitForTimeout(300);
}

async function openFirstRoleDetail(page) {
  const row = page.locator(".user-row.role-row:not(.head)").first();
  const rid = await row.getAttribute("data-role-card");
  await row.locator(".row-menu > summary").click();
  await page.waitForTimeout(200);
  await row.locator(`[data-role-open='${rid}']`).click();
  await page.waitForTimeout(400);
  return rid;
}

test.describe("QA-BO-033: Error/loading/empty states (GAP-BO-TEST-08)", () => {

  test.describe("Role List — scenario states", () => {
    test("1. state loading → skeleton rows แทนเนื้อหาตาราง", async ({ page }) => {
      await openModule(page, "settings", "Roles & Permissions");
      await setRoleState(page, "list", "loading");
      await expect(page.locator(".role-skel-row").first()).toBeVisible();
      // ไม่มี row จริง
      await expect(page.locator(".user-row.role-row:not(.head):not(.role-skel-row)")).toHaveCount(0);
    });

    test("2. state error → state block + ปุ่ม 'ลองอีกครั้ง' → กด retry กลับมาแสดง rows", async ({ page }) => {
      await openModule(page, "settings", "Roles & Permissions");
      await setRoleState(page, "list", "error");
      const block = page.locator(".role-state-block");
      await expect(block).toBeVisible();
      await expect(block.locator(".empty-title")).toBeVisible();
      const retry = block.locator("[data-role-retry]");
      await expect(retry).toContainText("ลองอีกครั้ง");
      await retry.click();
      await page.waitForTimeout(600);
      // retry → simulate reload → กลับมาแสดง rows จริง
      await expect(page.locator(".user-row.role-row:not(.head)").first()).toBeVisible();
    });

    test("3. state empty → empty block (ไม่มี row จริง)", async ({ page }) => {
      await openModule(page, "settings", "Roles & Permissions");
      await setRoleState(page, "list", "empty");
      const block = page.locator(".role-state-block");
      await expect(block).toBeVisible();
      await expect(block.locator(".empty-title")).toBeVisible();
      await expect(page.locator(".user-row.role-row:not(.head):not(.role-skel-row)")).toHaveCount(0);
    });

    test("4. state unauthorized → unauthorized block แทนตาราง", async ({ page }) => {
      await openModule(page, "settings", "Roles & Permissions");
      await setRoleState(page, "list", "unauthorized");
      const block = page.locator(".role-state-block");
      await expect(block).toBeVisible();
      await expect(page.locator(".user-row.role-row:not(.head)")).toHaveCount(0);
    });
  });

  test.describe("Role Detail — scenario states", () => {
    test("5. state partial → permission section error block แต่ส่วนอื่นยัง render", async ({ page }) => {
      await openModule(page, "settings", "Roles & Permissions");
      const rid = await openFirstRoleDetail(page);
      await setRoleDetailState(page, rid, "partial");
      // partial = ส่วน Permissions โหลดไม่สำเร็จ → error block ในส่วนนั้น ส่วนอื่นยัง render
      const permErr = page.locator(".role-perm-error");
      await expect(permErr).toBeVisible();
      await expect(permErr.locator(".empty-title")).toHaveText("โหลดข้อมูลสิทธิ์ไม่สำเร็จ");
      await expect(permErr.locator("[data-role-perm-retry]")).toContainText("ลองอีกครั้ง");
      // section อื่นยังอยู่ (history/metadata)
      await expect(page.locator(".detail-section").first()).toBeVisible();
    });

    test("6. state notfound → block 'ไม่พบ' แทน detail", async ({ page }) => {
      await openModule(page, "settings", "Roles & Permissions");
      const rid = await openFirstRoleDetail(page);
      await setRoleDetailState(page, rid, "notfound");
      const block = page.locator(".role-state-block");
      await expect(block).toBeVisible();
      await expect(block.locator(".empty-title")).toBeVisible();
    });

    test("7. state stale → stale block แจ้งข้อมูลเปลี่ยนระหว่างดู", async ({ page }) => {
      await openModule(page, "settings", "Roles & Permissions");
      const rid = await openFirstRoleDetail(page);
      await setRoleDetailState(page, rid, "stale");
      const block = page.locator(".role-state-block");
      await expect(block).toBeVisible();
    });
  });

  test.describe("Audit Log — result pill variants", () => {
    test("8. AUD-88115 (Partial) → detail drawer แสดง result pill 'Partial' (class partial)", async ({ page }) => {
      await openModule(page, "audit", "Audit Log");
      await page.locator("#audit-search").fill("AUD-88115");
      await page.waitForTimeout(300);
      const row = page.locator(".user-row.audit-row").filter({ hasText: "AUD-88115" }).first();
      await row.click();
      await page.waitForTimeout(400);
      const pill = page.locator(".audit-detail-result-pill.partial");
      await expect(pill).toBeVisible();
      await expect(pill).toContainText("Partial");
    });

    test("9. event result Success → detail drawer pill 'Success' (class success)", async ({ page }) => {
      await openModule(page, "audit", "Audit Log");
      await page.locator("#audit-search").fill("AUD-88204");
      await page.waitForTimeout(300);
      const row = page.locator(".user-row.audit-row").filter({ hasText: "AUD-88204" }).first();
      await row.click();
      await page.waitForTimeout(400);
      const pill = page.locator(".audit-detail-result-pill.success");
      await expect(pill).toBeVisible();
      await expect(pill).toContainText("Success");
    });
  });

  test.describe("Delivery Logs — Retry status", () => {
    test("10. filter status Retry → DLV-ACCT-013 + DLV-WA-1050 pill Retry แสดง", async ({ page }) => {
      await openModule(page, "settings", "Delivery Logs");
      const isMobile = await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
      if (isMobile) {
        const bar = page.locator(".user-filter-bar").first();
        if ((await bar.getAttribute("data-filter-open")) === "false") {
          await page.locator("[data-delivery-filter-toggle]").click();
          await page.waitForTimeout(200);
        }
      }
      await page.locator("div[data-custom-select]:has(> #delivery-status-filter) [data-custom-select-trigger]").click();
      await page.locator("div[data-custom-select]:has(> #delivery-status-filter) [data-custom-select-option][data-value='Retry']").click();
      await page.waitForTimeout(300);
      await expect(page.locator(".user-row.delivery-row[data-delivery-card='DLV-ACCT-013']")).toHaveCount(1);
      await expect(page.locator(".user-row.delivery-row[data-delivery-card='DLV-WA-1050']")).toHaveCount(1);
      // Retry pill ในคอลัมน์ Status
      await expect(page.locator(".user-row.delivery-row[data-delivery-card='DLV-ACCT-013'] [data-label='Status'] .pill")).toContainText("Retry");
    });

    test("11. DLV-ACCT-013 row click → detail modal แสดง Retry + เหตุผล 'เข้าคิว retry'", async ({ page }) => {
      await openModule(page, "settings", "Delivery Logs");
      await page.locator(".user-row.delivery-row[data-delivery-card='DLV-ACCT-013']").click();
      await page.waitForTimeout(400);
      const modal = page.locator("#user-action-modal.show, .modal.show").first();
      await expect(modal).toContainText("DLV-ACCT-013");
      await expect(modal).toContainText("Retry");
      await expect(modal).toContainText("mailbox full");
      await expect(modal).toContainText("retry attempt 2/3");
    });
  });
});
