// AL-003: quick automated QA — Audit Log detail sidebar drawer verification
// เช็ค: conditional sections, mobile scroll, list/filter ไม่เสียหลังเปิด-ปิด drawer
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

async function loginIfNeeded(page) {
  const loginScreen = page.locator('#login-screen');
  if (await loginScreen.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator('#login-form button[type="submit"]').click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await page.waitForTimeout(500);
  }
}

async function openAuditDrawer(page, eventId) {
  await page.evaluate(() => renderModule("audit"));
  await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
  await page.locator(`.user-row[data-audit-event="${eventId}"]`).click();
  await page.waitForSelector(".audit-log-detail-modal", { timeout: 5000 });
}

test.describe("AL-003: Audit Log detail drawer", () => {

  test("1. full sections render for event with before!=after + reason + note", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    // AUD-88201: before=Sale after=Hide, มี reason + note + reference ครบ
    await openAuditDrawer(page, "AUD-88201");
    const body = await page.locator("#user-action-modal-body").textContent();
    expect(body).toContain("Event Summary");
    expect(body).toContain("Before / After");
    expect(body).toContain("Reason / Note");
    expect(body).toContain("Sale");
    expect(body).toContain("Hide");
    expect(body).toContain("AST-8831");
    expect(body).toContain("Success");
  });

  test("2. Before/After section hidden when before === after (AUD-88198)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    // AUD-88198: before=after=Deletion Requested → section ต้องซ่อน
    await openAuditDrawer(page, "AUD-88198");
    const sections = await page.locator(".audit-detail-section-title").allTextContents();
    expect(sections).toContain("Event Summary");
    expect(sections).not.toContain("Before / After");
    expect(sections).toContain("Reason / Note");
  });

  test("3. Before/After hidden for no-change system event (AUD-88115 Partial)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    // AUD-88115: before=after + result=Partial → pill ต้องเป็น Partial
    await openAuditDrawer(page, "AUD-88115");
    const sections = await page.locator(".audit-detail-section-title").allTextContents();
    expect(sections).not.toContain("Before / After");
    const pill = await page.locator(".audit-detail-result-pill").textContent();
    expect(pill).toContain("Partial");
    expect(await page.locator(".audit-detail-result-pill.partial").count()).toBe(1);
  });

  test("4. Reason/Note section hidden when both empty", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    // inject event ที่ไม่มี reason/note/reference เพื่อเช็ค conditional
    await page.evaluate(() => {
      auditLogData.events.unshift({
        id: "AUD-TEST-MIN", createdAt: "09 Sep 2026 10:00 GMT+7",
        actor: "Test Admin", actorType: "Admin", action: "Test Action",
        module: "Settings", risk: "Low", before: "-", after: "Active",
        reason: "", reference: "", note: "", result: "Success"
      });
      renderModule("audit");
    });
    await page.waitForSelector(".audit-log-mode", { timeout: 5000 });
    await page.locator('.user-row[data-audit-event="AUD-TEST-MIN"]').click();
    await page.waitForSelector(".audit-log-detail-modal", { timeout: 5000 });
    const sections = await page.locator(".audit-detail-section-title").allTextContents();
    expect(sections).toContain("Event Summary");
    expect(sections).not.toContain("Reason / Note");
    // before="-" after="Active" → Before/After ต้องแสดง (ไม่ใช่ no-change)
    expect(sections).toContain("Before / After");
    // ไม่มี reference → ไม่แสดง ref pill
    expect(await page.locator(".audit-detail-ref-pill").count()).toBe(0);
  });

  test("5. drawer closes via X / backdrop / ESC", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    // X button
    await openAuditDrawer(page, "AUD-88201");
    await page.locator(".audit-log-detail-modal [data-user-action-modal-close]").click();
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    // backdrop click
    await openAuditDrawer(page, "AUD-88201");
    await page.locator("#user-action-modal").click({ position: { x: 10, y: 400 } });
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    // ESC
    await openAuditDrawer(page, "AUD-88201");
    await page.keyboard.press("Escape");
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
  });

  test("6. filter/search still works after open+close drawer", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await openAuditDrawer(page, "AUD-88201");
    await page.keyboard.press("Escape");
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
    // filter หลังปิด drawer
    await page.locator("#audit-search").fill("DEL-028");
    await page.waitForTimeout(300);
    const rows = await page.locator(".audit-log-table .user-row:not(.head):not(.empty)").count();
    expect(rows).toBe(1);
    const rowText = await page.locator(".audit-log-table").textContent();
    expect(rowText).toContain("AUD-88198");
  });
});

test.describe("AL-003 mobile (390px)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("7. drawer full-width + body scrollable + sticky header", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await openAuditDrawer(page, "AUD-88201");
    // drawer กว้างไม่เกิน viewport
    const drawerWidth = await page.locator(".audit-log-detail-modal").evaluate(el => el.getBoundingClientRect().width);
    expect(drawerWidth).toBeLessThanOrEqual(390);
    // modal-body scroll ได้ (scrollHeight > clientHeight หรือ overflow auto)
    const bodyMetrics = await page.locator(".audit-log-detail-modal .modal-body").evaluate(el => ({
      scrollH: el.scrollHeight, clientH: el.clientHeight,
      overflow: getComputedStyle(el).overflowY,
      headSticky: getComputedStyle(el.querySelector(".user-action-head")).position,
    }));
    expect(["auto", "scroll"]).toContain(bodyMetrics.overflow);
    expect(bodyMetrics.headSticky).toBe("sticky");
    // ถ้า content ยาว → scroll แล้ว header ยังอยู่ตำแหน่งเดิม
    if (bodyMetrics.scrollH > bodyMetrics.clientH) {
      await page.locator(".audit-log-detail-modal .modal-body").evaluate(el => { el.scrollTop = 200; });
      const headTop = await page.locator(".audit-log-detail-modal .user-action-head").evaluate(el => el.getBoundingClientRect().top);
      expect(headTop).toBeLessThanOrEqual(1);
    }
  });

  test("8. X button clickable on mobile", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await openAuditDrawer(page, "AUD-88201");
    const btn = page.locator(".audit-log-detail-modal [data-user-action-modal-close]");
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator("#user-action-modal")).not.toHaveClass(/show/);
  });
});
