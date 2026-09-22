// QA-BO-014d: Settings > Audit Log — Detail drawer/modal (strict Playwright spec)
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล — openAuditLogDetailModal() + auditLogData.events
// เป้าหมาย: รันเทสครอบ detail drawer — sections, conditional fields, result pill, ref pill,
//          read-only, ปิดด้วย X/backdrop/ESC, mobile responsive (ห้ามแก้ prototype)
// หมายเหตุ: cross-module jump จาก ref pill อยู่ใน qa-bo-014e (AL-010) — spec นี้เช็กแค่ render ของ pill
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

// helper: login เข้าระบบ (ค่า default อยู่ใน form แล้ว)
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

// helper: เปิด nav ถ้าจอแคบ (≤1180px sidebar ถูกซ่อนด้วย transform)
async function ensureNavOpen(page) {
  const needsToggle = await page.evaluate(() =>
    window.matchMedia("(max-width: 1180px)").matches && !document.body.classList.contains("nav-open"));
  if (needsToggle) {
    await page.locator("#menu-toggle").click();
    await page.waitForTimeout(300);
  }
}

// helper: ตรวจว่า breakpoint ปัจจุบันเป็น mobile (≤760px) หรือไม่
async function isMobile(page) {
  return await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
}

// helper: ไปหน้า Audit Log ผ่านเมนู Settings > Audit Log
async function goToAuditLog(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  await page.locator(".nav-item[data-module='settings']").click();
  await page.waitForTimeout(300);
  await ensureNavOpen(page);
  await page.locator(".submenu[data-submenu='settings'] button[data-module='audit'][data-sub='Audit Log']").click();
  await page.waitForTimeout(300);
}

// helper: เปิด detail drawer ด้วยการคลิก primary cell ของ row (ผ่าน UI จริง)
async function openDrawer(page, eventId) {
  await page.locator(`.audit-row[data-audit-event="${eventId}"] .user-cell-primary`).click();
  await page.waitForSelector("#user-action-modal.show .audit-log-detail-modal", { timeout: 5000 });
}

// helper: locator ของ row ใน drawer (label → row) — match label ตรงตัว
// (hasText ธรรมดาชนกัน: "Actor" ⊂ "Actor Type" และค่า Note มีคำว่า "reason")
function drawerRow(page, label) {
  return page.locator(".audit-log-detail-modal .option-confirm-row", {
    has: page.locator(`.option-confirm-label:text-is("${label}")`)
  });
}

// helper: อ่านชื่อ section ทั้งหมดใน drawer (เรียงตาม DOM)
async function drawerSections(page) {
  return await page.locator(".audit-log-detail-modal .audit-detail-section-title").allTextContents();
}

// ==================== D. DETAIL DRAWER / MODAL ====================

test.describe("QA-BO-014d: Settings > Audit Log — detail drawer", () => {

  test("1. คลิก row → drawer เปิด: modal show + audit-log-detail-modal + eyebrow/title/subtitle ตรง event", async ({ page }) => {
    await goToAuditLog(page);
    await openDrawer(page, "AUD-88201");
    // modal show + card class
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    await expect(page.locator("#user-action-modal .audit-log-detail-modal")).toHaveCount(1);
    // head: eyebrow + Event ID + action subtitle
    await expect(page.locator(".audit-detail-eyebrow")).toHaveText("Audit Log Detail");
    await expect(page.locator("#user-action-modal-title")).toHaveText("AUD-88201");
    await expect(page.locator(".audit-log-detail-modal .user-action-head p")).toHaveText("Force Hide Asset");
    // ปุ่มปิด X พร้อม aria-label
    await expect(page.locator(".audit-log-detail-modal [data-user-action-modal-close]")).toHaveAttribute("aria-label", "ปิด");
    // drawer ไม่เปลี่ยนหน้า — body ยัง audit-log-mode
    await expect(page.locator("body")).toHaveClass(/audit-log-mode/);
  });

  test("2. Event Summary: Date/Time (ตัด GMT+7), Action, Actor, Actor Type, Tags (module+risk+result), Reference", async ({ page }) => {
    await goToAuditLog(page);
    await openDrawer(page, "AUD-88201");
    // AUD-88201: 08 Sep 2026 14:22 GMT+7 / Force Hide Asset / Somchai Admin / Admin / AST-8831
    await expect(drawerRow(page, "Date / Time").locator(".option-confirm-value")).toHaveText("08 Sep 2026 14:22");
    await expect(drawerRow(page, "Action").locator(".option-confirm-value")).toHaveText("Force Hide Asset");
    await expect(drawerRow(page, "Actor").locator(".option-confirm-value")).toHaveText("Somchai Admin");
    await expect(drawerRow(page, "Actor Type").locator(".option-confirm-value")).toHaveText("Admin");
    // Tags = module badge + risk pill + result pill
    const tags = page.locator(".audit-detail-tags");
    await expect(tags.locator(".pill")).toHaveCount(2);
    await expect(tags.locator(".pill", { hasText: /^Asset$/ })).toHaveClass(/blue/);
    await expect(tags.locator(".pill", { hasText: /^High$/ })).toHaveClass(/red/);
    await expect(tags.locator(".audit-detail-result-pill.success")).toHaveText("Success");
    // Reference pill = button พร้อม data-audit-ref + title
    const refPill = page.locator(".audit-detail-ref-pill");
    await expect(refPill).toHaveText("AST-8831");
    await expect(refPill).toHaveAttribute("data-audit-ref", "AST-8831");
    await expect(refPill).toHaveAttribute("title", "เปิดรายละเอียดของ AST-8831");
  });

  test("3. Result pill สีถูกต้อง: Success=success(green dot), Partial=partial — Failed ผ่าน injected event", async ({ page }) => {
    await goToAuditLog(page);
    // Success — AUD-88202
    await openDrawer(page, "AUD-88202");
    await expect(page.locator(".audit-detail-result-pill.success")).toHaveText("Success");
    await expect(page.locator(".audit-detail-result-pill.success .audit-detail-dot")).toHaveCount(1);
    await page.keyboard.press("Escape");
    // Partial — AUD-88115 (ตรวจเงื่อนไขก่อนลบบัญชี)
    await openDrawer(page, "AUD-88115");
    await expect(page.locator(".audit-detail-result-pill.partial")).toHaveText("Partial");
    await page.keyboard.press("Escape");
    // Failed — ไม่มีใน mock → inject event แล้วเปิดผ่าน list
    await page.evaluate(() => {
      auditLogData.events.unshift({
        id: "AUD-TEST-FAIL", createdAt: "09 Sep 2026 10:00 GMT+7",
        actor: "System (auto)", actorType: "System", action: "Test Failed Sync",
        module: "Asset", risk: "High", before: "Sale", after: "Sale",
        reason: "sync ไม่สำเร็จ", reference: "AST-8831", note: "retry แล้วยัง fail", result: "Failed"
      });
      renderModule("audit");
    });
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    await openDrawer(page, "AUD-TEST-FAIL");
    await expect(page.locator(".audit-detail-result-pill.failed")).toHaveText("Failed");
  });

  test("4. Before / After: แสดง diff box เมื่อ before≠after (Before ขีดฆ่า + arrow + After)", async ({ page }) => {
    await goToAuditLog(page);
    // AUD-88201: before=Sale → after=Hide
    await openDrawer(page, "AUD-88201");
    const diff = page.locator(".audit-detail-diff");
    await expect(diff).toHaveCount(1);
    await expect(diff.locator(".audit-detail-diff-label").nth(0)).toHaveText("Before");
    await expect(diff.locator(".audit-detail-diff-value.before")).toHaveText("Sale");
    // before value ขีดฆ่า (line-through)
    const deco = await diff.locator(".audit-detail-diff-value.before")
      .evaluate(el => getComputedStyle(el).textDecorationLine);
    expect(deco).toContain("line-through");
    await expect(diff.locator(".audit-detail-diff-arrow")).toHaveText("→");
    await expect(diff.locator(".audit-detail-diff-label").nth(1)).toHaveText("After");
    await expect(diff.locator(".audit-detail-diff-value.after")).toHaveText("Hide");
  });

  test("5. Before / After ซ่อนเมื่อ before===after หรือทั้งคู่เป็น '-'", async ({ page }) => {
    await goToAuditLog(page);
    // AUD-88198: before=after=Deletion Requested → ซ่อน
    await openDrawer(page, "AUD-88198");
    expect(await drawerSections(page)).not.toContain("Before / After");
    await expect(page.locator(".audit-detail-diff")).toHaveCount(0);
    await page.keyboard.press("Escape");
    // AUD-88203: before='-' after='Invited' → แสดง (ไม่ใช่ no-change)
    await openDrawer(page, "AUD-88203");
    expect(await drawerSections(page)).toContain("Before / After");
    await expect(page.locator(".audit-detail-diff-value.before")).toHaveText("-");
    await expect(page.locator(".audit-detail-diff-value.after")).toHaveText("Invited");
    await page.keyboard.press("Escape");
    // inject event before='-' after='-' → ซ่อน
    await page.evaluate(() => {
      auditLogData.events.unshift({
        id: "AUD-TEST-NOCHG", createdAt: "09 Sep 2026 11:00 GMT+7",
        actor: "System (auto)", actorType: "System", action: "Test No Change",
        module: "Settings", risk: "Low", before: "-", after: "-",
        reason: "", reference: "", note: "", result: "Success"
      });
      renderModule("audit");
    });
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    await openDrawer(page, "AUD-TEST-NOCHG");
    expect(await drawerSections(page)).not.toContain("Before / After");
  });

  test("6. Reason / Note: แสดงเมื่อมีค่า + ซ่อนทั้ง section เมื่อว่างทั้งคู่", async ({ page }) => {
    await goToAuditLog(page);
    // AUD-88201: reason + note ครบ
    await openDrawer(page, "AUD-88201");
    expect(await drawerSections(page)).toContain("Reason / Note");
    await expect(drawerRow(page, "Reason").locator(".option-confirm-value"))
      .toHaveText("รายงานเนื้อหาไม่เหมาะสม 3 รายงาน");
    await expect(drawerRow(page, "Note").locator(".option-confirm-value"))
      .toHaveText("ตรวจ reason และ FO sync event");
    await page.keyboard.press("Escape");
    // inject event ไม่มี reason/note → section ซ่อน
    await page.evaluate(() => {
      auditLogData.events.unshift({
        id: "AUD-TEST-NONOTE", createdAt: "09 Sep 2026 12:00 GMT+7",
        actor: "System (auto)", actorType: "System", action: "Test Silent Event",
        module: "Settings", risk: "Low", before: "A", after: "B",
        reason: "", reference: "", note: "", result: "Success"
      });
      renderModule("audit");
    });
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    await openDrawer(page, "AUD-TEST-NONOTE");
    const sections = await drawerSections(page);
    expect(sections).toContain("Event Summary");
    expect(sections).not.toContain("Reason / Note");
    expect(sections).toContain("Before / After");
  });

  test("7. field ว่างถูกซ่อน: ไม่มี reference → ไม่มี ref pill, ไม่มี actorType → ไม่มี row", async ({ page }) => {
    await goToAuditLog(page);
    await page.evaluate(() => {
      auditLogData.events.unshift({
        id: "AUD-TEST-MIN", createdAt: "09 Sep 2026 13:00 GMT+7",
        actor: "Test Admin", action: "Test Minimal",
        module: "Settings", risk: "Low", before: "-", after: "Active",
        reason: "", reference: "", note: "", result: "Success"
      });
      renderModule("audit");
    });
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    await openDrawer(page, "AUD-TEST-MIN");
    // ไม่มี reference → ไม่มี Reference row + ไม่มี ref pill
    await expect(page.locator(".audit-detail-ref-pill")).toHaveCount(0);
    expect(await page.locator(".audit-log-detail-modal .option-confirm-label").allTextContents())
      .not.toContain("Reference");
    // ไม่มี actorType → ไม่มี Actor Type row
    expect(await page.locator(".audit-log-detail-modal .option-confirm-label").allTextContents())
      .not.toContain("Actor Type");
    // Actor row ยังแสดง
    await expect(drawerRow(page, "Actor").locator(".option-confirm-value")).toHaveText("Test Admin");
  });

  test("8. read-only drawer — ไม่มี action footer / ปุ่ม action อื่นนอกจาก X + ref pill", async ({ page }) => {
    await goToAuditLog(page);
    await openDrawer(page, "AUD-88201");
    const drawer = page.locator(".audit-log-detail-modal");
    // ไม่มี footer / ปุ่ม confirm-submit
    await expect(drawer.locator(".modal-footer")).toHaveCount(0);
    await expect(drawer.locator("button:not([data-user-action-modal-close]):not([data-audit-ref])")).toHaveCount(0);
    // ไม่มี input/select/textarea ใน drawer
    await expect(drawer.locator("input, select, textarea")).toHaveCount(0);
  });

  test("9. ปิด drawer ได้ 3 วิธี: X / backdrop click (desktop) / ESC", async ({ page }) => {
    await goToAuditLog(page);
    const mobile = await isMobile(page);
    // X button
    await openDrawer(page, "AUD-88201");
    await page.locator(".audit-log-detail-modal [data-user-action-modal-close]").click();
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    // backdrop click (คลิกนอก card — มุมซ้ายของ overlay)
    // mobile ≤460px drawer กว้าง 100vw เต็มจอ — ไม่มีพื้นที่ backdrop ให้คลิก
    if (!mobile) {
      await openDrawer(page, "AUD-88201");
      await page.locator("#user-action-modal").click({ position: { x: 10, y: 400 } });
      await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    }
    // ESC
    await openDrawer(page, "AUD-88201");
    await page.keyboard.press("Escape");
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    // list ยังครบ 10 rows หลังปิด
    await expect(page.locator(".audit-row")).toHaveCount(10);
  });

  test("10. เปิด drawer ของ event อื่นซ้ำ → content สลับเป็น event ใหม่ถูกต้อง", async ({ page }) => {
    await goToAuditLog(page);
    await openDrawer(page, "AUD-88201");
    await expect(page.locator("#user-action-modal-title")).toHaveText("AUD-88201");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    await openDrawer(page, "AUD-88198");
    await expect(page.locator("#user-action-modal-title")).toHaveText("AUD-88198");
    await expect(page.locator(".audit-log-detail-modal .user-action-head p")).toHaveText("ปฏิเสธคืนบัญชี");
    await expect(drawerRow(page, "Actor").locator(".option-confirm-value")).toHaveText("อรนุช แก้วใส");
  });

  test("11. mobile (≤760px): drawer ไม่ล้นจอ + body scroll ได้ + header sticky + X กดได้", async ({ page }) => {
    await goToAuditLog(page);
    const mobile = await isMobile(page);
    if (!mobile) { test.skip(); return; }
    await openDrawer(page, "AUD-88201");
    // drawer กว้างไม่เกิน viewport
    const vw = await page.evaluate(() => window.innerWidth);
    const drawerWidth = await page.locator(".audit-log-detail-modal")
      .evaluate(el => el.getBoundingClientRect().width);
    expect(drawerWidth).toBeLessThanOrEqual(vw);
    // modal-body scroll ได้ + head sticky
    const bodyMetrics = await page.locator(".audit-log-detail-modal .modal-body").evaluate(el => ({
      scrollH: el.scrollHeight, clientH: el.clientHeight,
      overflow: getComputedStyle(el).overflowY,
      headSticky: getComputedStyle(el.querySelector(".user-action-head")).position,
    }));
    expect(["auto", "scroll"]).toContain(bodyMetrics.overflow);
    expect(bodyMetrics.headSticky).toBe("sticky");
    // X กดได้บน mobile
    await page.locator(".audit-log-detail-modal [data-user-action-modal-close]").click();
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
  });
});
