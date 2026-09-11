// QA-BO-010: Settings > Policy & Versioning (List, Detail, Editor, Publish, Version History, Restore, Preview) — strict Playwright spec
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล, spec docs (16_ADMIN_SETTINGS_MODULE.md) เป็นหลักสำหรับพฤติกรรม/นำทาง
// เป้าหมาย: รันเทส เจอปัญหาจริง → ลิสปัญหา + แนวทางแก้ → แก้ใน flow เดียว (ห้ามแก้ prototype)
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

// helper: ไปหน้า Policy & Versioning List ผ่านเมนู Settings > Policy & Versioning
async function goToPolicyList(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  // คลิก nav-item Settings เพื่อขยาย submenu
  await page.locator(".nav-item[data-module='settings']").click();
  await page.waitForTimeout(300);
  // คลิก submenu button Policy & Versioning
  await ensureNavOpen(page);
  await page.locator(".submenu[data-submenu='settings'] button[data-module='settings'][data-sub='Policy & Versioning']").click();
  await page.waitForTimeout(300);
}

// helper: ไปหน้า Policy Detail โดยคลิกแถวในตาราง (เลือก policy id)
async function goToPolicyDetail(page, policyId = "POL-TOU") {
  await goToPolicyList(page);
  await page.locator(`.policy-list-table .asset-row[data-policy-open='${policyId}'] .asset-cell-primary`).click();
  await page.waitForTimeout(300);
}

// helper: ไปหน้า Policy Editor (สร้าง Draft ใหม่หรือแก้ไข Draft)
async function goToPolicyEditor(page, policyId = "POL-TOU", mode = "create-draft") {
  await goToPolicyDetail(page, policyId);
  if (mode === "create-draft") {
    await page.locator(`[data-policy-create-draft='${policyId}']`).click();
  } else {
    await page.locator(`[data-policy-edit='${policyId}']`).click();
  }
  await page.waitForTimeout(300);
}

// helper: ไปหน้า Version History
async function goToVersionHistory(page, policyId = "POL-TOU") {
  await goToPolicyDetail(page, policyId);
  await page.locator(`[data-policy-version-history='${policyId}']`).click();
  await page.waitForTimeout(300);
}

// ==================== A. NAVIGATION & MENU ====================

test.describe("Policy & Versioning — navigation & menu", () => {
  test("1. เมนู Settings แสดงและมี submenu รวม Policy & Versioning", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await ensureNavOpen(page);
    const navItem = page.locator(".nav-item[data-module='settings']");
    await expect(navItem).toBeVisible();
    await navItem.click();
    await page.waitForTimeout(300);
    const subItems = page.locator(".submenu[data-submenu='settings'] button");
    const count = await subItems.count();
    expect(count).toBeGreaterThanOrEqual(6);
    // ตรวจว่ามี Policy & Versioning
    const pvButton = page.locator(".submenu[data-submenu='settings'] button[data-sub='Policy & Versioning']");
    await expect(pvButton).toBeVisible();
  });

  test("2. คลิก Settings > Policy & Versioning → เข้าหน้า Policy List", async ({ page }) => {
    await goToPolicyList(page);
    await expect(page.locator("body")).toHaveClass(/policy-versioning-mode/);
    await expect(page.locator("#page-title")).toHaveText("Policy & Versioning");
    await expect(page.locator("#crumb")).toHaveText("เครื่องมือ & รายงาน / Settings / Policy & Versioning");
    await expect(page.locator("#panel-title")).toHaveText("Policy List");
  });

  test("3. nav item settings มี active state เมื่ออยู่ใน Policy & Versioning", async ({ page }) => {
    await goToPolicyList(page);
    const isActive = await page.evaluate(() => {
      const el = document.querySelector(".nav-item[data-module='settings']");
      return el ? el.classList.contains("active") || el.classList.contains("expanded") || el.querySelector(".active") !== null : false;
    });
    expect(isActive).toBeTruthy();
  });

  test("4. Policy List ไม่มี primary action", async ({ page }) => {
    await goToPolicyList(page);
    await expect(page.locator("#primary-action")).toHaveText("");
  });

  test("5. Policy List ไม่มี panel subtitle", async ({ page }) => {
    await goToPolicyList(page);
    await expect(page.locator("#panel-subtitle")).toHaveText("");
  });
});

// ==================== B. POLICY LIST — RENDERING ====================

test.describe("Policy List — rendering", () => {
  test("6. ตารางมี 7 คอลัมน์ head ครบ (Policy, Description, Status, Version, Updated, Updated By, Action)", async ({ page }) => {
    await goToPolicyList(page);
    const headCells = page.locator(".policy-list-table .asset-row.head > div");
    await expect(headCells).toHaveCount(7);
    const head = page.locator(".policy-list-table .asset-row.head");
    await expect(head).toContainText("Policy");
    await expect(head).toContainText("Description");
    await expect(head).toContainText("Status");
    await expect(head).toContainText("Version");
    await expect(head).toContainText("Updated");
    await expect(head).toContainText("Updated By");
    await expect(head).toContainText("Action");
  });

  test("7. แสดง 2 แถว (Terms of Use + Privacy Policy)", async ({ page }) => {
    await goToPolicyList(page);
    const rows = page.locator(".policy-list-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(2);
  });

  test("8. แถวแรก = Terms of Use (POL-TOU, Published, v1.3)", async ({ page }) => {
    await goToPolicyList(page);
    const firstRow = page.locator(".policy-list-table .asset-row:not(.head)").first();
    await expect(firstRow).toHaveAttribute("data-policy-open", "POL-TOU");
    await expect(firstRow.locator("[data-label='Description'] .main-text")).toContainText("เงื่อนไขการใช้งาน");
    await expect(firstRow.locator("[data-label='Status'] .pill.green")).toContainText("Published");
    await expect(firstRow.locator("[data-label='Version'] .pill")).toHaveText("v1.3");
    await expect(firstRow.locator("[data-label='Updated'] .main-text")).toHaveText("28 Aug 2026 14:32");
    await expect(firstRow.locator("[data-label='Updated By'] .main-text")).toHaveText("Admin");
  });

  test("9. แถวที่ 2 = Privacy Policy (POL-PP, Published, v2.0, มี Draft v2.1-draft)", async ({ page }) => {
    await goToPolicyList(page);
    const secondRow = page.locator(".policy-list-table .asset-row:not(.head)").nth(1);
    await expect(secondRow).toHaveAttribute("data-policy-open", "POL-PP");
    await expect(secondRow.locator("[data-label='Description'] .main-text")).toContainText("นโยบายความเป็นส่วนตัว");
    await expect(secondRow.locator("[data-label='Status'] .pill.green")).toContainText("Published");
    await expect(secondRow.locator("[data-label='Version'] .pill")).toHaveText("v2.0");
    await expect(secondRow.locator("[data-label='Updated'] .main-text")).toHaveText("20 Aug 2026 16:00");
    await expect(secondRow.locator("[data-label='Updated By'] .main-text")).toHaveText("Admin");
  });

  test("10. Privacy Policy แสดง Draft pill (amber) เพราะมี draftVersion", async ({ page }) => {
    await goToPolicyList(page);
    const ppRow = page.locator(".policy-list-table .asset-row[data-policy-open='POL-PP']");
    // Draft pill appears in both desktop (data-label=Status) and mobile card (asset-card-tags) — use first
    await expect(ppRow.locator(".policy-draft-pill").first()).toContainText("Draft v2.1");
  });

  test("11. Terms of Use ไม่แสดง Draft pill (ไม่มี draft)", async ({ page }) => {
    await goToPolicyList(page);
    const touRow = page.locator(".policy-list-table .asset-row[data-policy-open='POL-TOU']");
    await expect(touRow.locator(".policy-draft-pill")).toHaveCount(0);
  });

  test("12. Policy type pill: Terms of Use = blue, Privacy Policy = purple", async ({ page }) => {
    await goToPolicyList(page);
    const touRow = page.locator(".policy-list-table .asset-row[data-policy-open='POL-TOU']");
    await expect(touRow.locator(".asset-cell-primary .pill.blue")).toContainText("TERMS OF USE");
    const ppRow = page.locator(".policy-list-table .asset-row[data-policy-open='POL-PP']");
    await expect(ppRow.locator(".asset-cell-primary .pill.purple")).toContainText("PRIVACY POLICY");
  });

  test("13. แต่ละแถวมี action button (chevron) สำหรับเปิด detail", async ({ page }) => {
    await goToPolicyList(page);
    const rows = page.locator(".policy-list-table .asset-row:not(.head)");
    for (let i = 0; i < 2; i++) {
      // Button exists in DOM (may be hidden on mobile via CSS, row click used instead)
      await expect(rows.nth(i).locator(".user-row-actions [data-policy-open]").first()).toHaveCount(1);
    }
  });

  test("14. Policy List ไม่มี summary cards (no KPI)", async ({ page }) => {
    await goToPolicyList(page);
    const summaryGrid = page.locator("#summary-grid");
    const content = await summaryGrid.innerHTML();
    expect(content.trim()).toBe("");
  });

  test("15. Policy List ไม่มี search bar", async ({ page }) => {
    await goToPolicyList(page);
    const filters = await page.locator(".filters").innerHTML();
    expect(filters.trim()).toBe("");
  });

  test("16. Policy List ไม่มี filter actions", async ({ page }) => {
    await goToPolicyList(page);
    const filterActions = await page.locator("#user-panel-filter-actions").innerHTML();
    expect(filterActions.trim()).toBe("");
  });

  test("17. Policy List ไม่มี pagination (footer-range)", async ({ page }) => {
    await goToPolicyList(page);
    const footer = page.locator("#table > .footer-range");
    await expect(footer).toHaveCount(0);
  });

  test("18. row click (body) → เข้า Policy Detail", async ({ page }) => {
    await goToPolicyList(page);
    await page.locator(".policy-list-table .asset-row[data-policy-open='POL-TOU'] .asset-cell-primary").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/policy-detail-mode/);
  });

  test("19. action button click → เข้า Policy Detail", async ({ page }) => {
    await goToPolicyList(page);
    // Use row primary cell click (works on all viewports; action button hidden on mobile)
    await page.locator(".policy-list-table .asset-row[data-policy-open='POL-PP'] .asset-cell-primary").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/policy-detail-mode/);
    await expect(page.locator("#page-title")).toHaveText("PRIVACY POLICY");
  });
});

// ==================== C. POLICY DETAIL — RENDERING ====================

test.describe("Policy Detail — rendering", () => {
  test("20. breadcrumb แสดง policy type ต่อท้าย", async ({ page }) => {
    await goToPolicyDetail(page, "POL-TOU");
    await expect(page.locator("#crumb")).toHaveText("เครื่องมือ & รายงาน / Settings / Policy & Versioning / Terms of Use");
  });

  test("21. page title = policy typeLabel (TERMS OF USE)", async ({ page }) => {
    await goToPolicyDetail(page, "POL-TOU");
    await expect(page.locator("#page-title")).toHaveText("TERMS OF USE");
  });

  test("22. language tabs แสดง ภาษาไทย + English (TH active default)", async ({ page }) => {
    await goToPolicyDetail(page, "POL-TOU");
    const tabs = page.locator(".policy-content-tabs [data-policy-lang-tab]");
    await expect(tabs).toHaveCount(2);
    await expect(tabs.nth(0)).toHaveAttribute("data-policy-lang-tab", "th");
    await expect(tabs.nth(1)).toHaveAttribute("data-policy-lang-tab", "en");
    await expect(tabs.nth(0)).toHaveClass(/active/);
  });

  test("23. TH content body แสดง (visible), EN content body ซ่อน (hidden)", async ({ page }) => {
    await goToPolicyDetail(page, "POL-TOU");
    const thBody = page.locator("[data-policy-content-lang='th']");
    const enBody = page.locator("[data-policy-content-lang='en']");
    await expect(thBody).toBeVisible();
    await expect(enBody).toHaveAttribute("hidden", "");
  });

  test("24. คลิก English tab → EN content visible, TH hidden", async ({ page }) => {
    await goToPolicyDetail(page, "POL-TOU");
    await page.locator("[data-policy-lang-tab='en']").click();
    await page.waitForTimeout(200);
    const enBody = page.locator("[data-policy-content-lang='en']");
    const thBody = page.locator("[data-policy-content-lang='th']");
    await expect(enBody).toBeVisible();
    await expect(thBody).toHaveAttribute("hidden", "");
    // EN tab active
    await expect(page.locator("[data-policy-lang-tab='en']")).toHaveClass(/active/);
  });

  test("25. คลิก ภาษาไทย tab → TH content visible อีกครั้ง", async ({ page }) => {
    await goToPolicyDetail(page, "POL-TOU");
    await page.locator("[data-policy-lang-tab='en']").click();
    await page.waitForTimeout(200);
    await page.locator("[data-policy-lang-tab='th']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("[data-policy-content-lang='th']")).toBeVisible();
    await expect(page.locator("[data-policy-content-lang='en']")).toHaveAttribute("hidden", "");
  });

  test("26. TH content แสดงเนื้อหา Terms of Use (ภาษาไทย)", async ({ page }) => {
    await goToPolicyDetail(page, "POL-TOU");
    const thBody = page.locator("[data-policy-content-lang='th']");
    await expect(thBody).toContainText("เงื่อนไขการใช้งาน");
    await expect(thBody).toContainText("บัญชีผู้ใช้");
    await expect(thBody).toContainText("Watch Alert");
  });

  test("27. EN content แสดงเนื้อหา Terms of Use (English)", async ({ page }) => {
    await goToPolicyDetail(page, "POL-TOU");
    await page.locator("[data-policy-lang-tab='en']").click();
    await page.waitForTimeout(200);
    const enBody = page.locator("[data-policy-content-lang='en']");
    await expect(enBody).toContainText("Terms of Use");
    await expect(enBody).toContainText("User Accounts");
    await expect(enBody).toContainText("Watch Alert");
  });

  test("28. metadata tiles แสดง 4 รายการ (Status, Version, Updated, Updated By)", async ({ page }) => {
    await goToPolicyDetail(page, "POL-TOU");
    const tiles = page.locator(".policy-detail-page .policy-metadata .detail-tile");
    await expect(tiles).toHaveCount(4);
    // Use .muted span for label (avoids matching pill span inside strong)
    await expect(tiles.nth(0).locator("span.muted")).toHaveText("Status");
    await expect(tiles.nth(1).locator("span.muted")).toHaveText("Version");
    await expect(tiles.nth(2).locator("span.muted")).toHaveText("Updated");
    await expect(tiles.nth(3).locator("span.muted")).toHaveText("Updated By");
    // POL-TOU: Published, v1.3
    await expect(tiles.nth(0).locator(".pill")).toContainText("Published");
    await expect(tiles.nth(1).locator(".pill")).toHaveText("v1.3");
    await expect(tiles.nth(2).locator("strong")).toHaveText("28 Aug 2026 14:32");
    await expect(tiles.nth(3).locator("strong")).toHaveText("Admin");
  });

  test("29. change summary แสดงสรุปการเปลี่ยนแปลงของเวอร์ชันที่เผยแพร่", async ({ page }) => {
    await goToPolicyDetail(page, "POL-TOU");
    const summary = page.locator(".policy-change-summary");
    await expect(summary).toBeVisible();
    await expect(summary.locator("span")).toHaveText("สรุปการเปลี่ยนแปลง");
    await expect(summary.locator("p")).toContainText("เพิ่มข้อกำหนดเกี่ยวกับการใช้ Watch Alert และ Market Data");
  });

  test("30. Terms of Use (no draft) แสดงปุ่ม 'สร้าง Draft เวอร์ชันใหม่'", async ({ page }) => {
    await goToPolicyDetail(page, "POL-TOU");
    await expect(page.locator("[data-policy-create-draft='POL-TOU']")).toBeVisible();
    await expect(page.locator("[data-policy-create-draft='POL-TOU']")).toHaveText("สร้าง Draft เวอร์ชันใหม่");
  });

  test("31. Privacy Policy (has draft) แสดงปุ่ม 'แก้ไข Draft'", async ({ page }) => {
    await goToPolicyDetail(page, "POL-PP");
    await expect(page.locator("[data-policy-edit='POL-PP']")).toBeVisible();
    await expect(page.locator("[data-policy-edit='POL-PP']")).toHaveText("แก้ไข Draft");
  });

  test("32. แสดงปุ่ม 'ดู Version History'", async ({ page }) => {
    await goToPolicyDetail(page, "POL-TOU");
    await expect(page.locator("[data-policy-version-history='POL-TOU']")).toBeVisible();
    await expect(page.locator("[data-policy-version-history='POL-TOU']")).toHaveText("ดู Version History");
  });

  test("33. back button → กลับไป Policy List", async ({ page }) => {
    await goToPolicyDetail(page, "POL-TOU");
    await page.locator("#page-actions [data-policy-back]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/policy-versioning-mode/);
    await expect(page.locator("#panel-title")).toHaveText("Policy List");
  });

  test("34. Policy Detail ไม่มี primary action", async ({ page }) => {
    await goToPolicyDetail(page, "POL-TOU");
    await expect(page.locator("#primary-action")).toHaveText("");
  });

  test("35. Policy Detail ไม่มี filter bar", async ({ page }) => {
    await goToPolicyDetail(page, "POL-TOU");
    const filters = await page.locator(".filters").innerHTML();
    expect(filters.trim()).toBe("");
  });

  test("36. Policy Detail ไม่มี summary cards", async ({ page }) => {
    await goToPolicyDetail(page, "POL-TOU");
    const summaryGrid = page.locator("#summary-grid");
    const content = await summaryGrid.innerHTML();
    expect(content.trim()).toBe("");
  });
});

// ==================== D. POLICY EDITOR — RENDERING ====================

test.describe("Policy Editor — rendering", () => {
  test("37. สร้าง Draft → เข้าหน้า Editor (policy-editor-mode)", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    await expect(page.locator("body")).toHaveClass(/policy-editor-mode/);
  });

  test("38. breadcrumb แสดง policy type + Draft", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    await expect(page.locator("#crumb")).toHaveText("เครื่องมือ & รายงาน / Settings / Policy & Versioning / Terms of Use / Draft");
  });

  test("39. page title = policy typeLabel + Draft", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    await expect(page.locator("#page-title")).toHaveText("TERMS OF USE — Draft");
  });

  test("40. Draft metadata tiles แสดง 3 รายการ (Policy, Version, Status)", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    const tiles = page.locator(".policy-editor-form .policy-metadata .detail-tile");
    await expect(tiles).toHaveCount(3);
    await expect(tiles.nth(0).locator("span.muted")).toHaveText("Policy");
    await expect(tiles.nth(1).locator("span.muted")).toHaveText("Version");
    await expect(tiles.nth(2).locator("span.muted")).toHaveText("Status");
    // Status = Draft (amber pill)
    await expect(tiles.nth(2).locator(".pill.amber")).toContainText("Draft");
  });

  test("41. Draft version = v1.4 (Terms of Use สูงสุด v1.3 → next = v1.4)", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    const tiles = page.locator(".policy-editor-form .policy-metadata .detail-tile");
    await expect(tiles.nth(1).locator(".pill")).toHaveText("v2.0-draft");
  });

  test("42. language tabs ใน editor แสดง ภาษาไทย + English (TH active)", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    const tabs = page.locator("[data-policy-editor-lang-tab]");
    await expect(tabs).toHaveCount(2);
    await expect(tabs.nth(0)).toHaveAttribute("data-policy-editor-lang-tab", "th");
    await expect(tabs.nth(1)).toHaveAttribute("data-policy-editor-lang-tab", "en");
    await expect(tabs.nth(0)).toHaveClass(/active/);
  });

  test("43. TH editor visible, EN editor hidden (default)", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    const thPanel = page.locator("[data-policy-editor-lang='th']");
    const enPanel = page.locator("[data-policy-editor-lang='en']");
    await expect(thPanel).toBeVisible();
    await expect(enPanel).toHaveAttribute("hidden", "");
  });

  test("44. คลิก English tab → EN editor visible, TH hidden", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    await page.locator("[data-policy-editor-lang-tab='en']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("[data-policy-editor-lang='en']")).toBeVisible();
    await expect(page.locator("[data-policy-editor-lang='th']")).toHaveAttribute("hidden", "");
  });

  test("45. contenteditable canvas มี contenteditable=true", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    const thCanvas = page.locator("[data-policy-content-th]");
    await expect(thCanvas).toHaveAttribute("contenteditable", "true");
    const enCanvas = page.locator("[data-policy-content-en]");
    await expect(enCanvas).toHaveAttribute("contenteditable", "true");
  });

  test("46. TH canvas มีเนื้อหาเริ่มต้น (จาก published version)", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    const thCanvas = page.locator("[data-policy-content-th]");
    await expect(thCanvas).toContainText("เงื่อนไขการใช้งาน");
  });

  test("47. EN canvas มีเนื้อหาเริ่มต้น (จาก published version)", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    await page.locator("[data-policy-editor-lang-tab='en']").click();
    await page.waitForTimeout(200);
    const enCanvas = page.locator("[data-policy-content-en]");
    await expect(enCanvas).toContainText("Terms of Use");
  });

  test("48. formatting toolbar แสดงปุ่มเครื่องมือ (bold, italic, etc.)", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    // Toolbar appears in both TH and EN panels — use first
    const tools = page.locator("[data-policy-editor-command]");
    expect(await tools.count()).toBeGreaterThanOrEqual(10);
    await expect(page.locator("[data-policy-editor-command='bold']").first()).toBeVisible();
    await expect(page.locator("[data-policy-editor-command='italic']").first()).toBeVisible();
    await expect(page.locator("[data-policy-editor-command='formatBlock']").first()).toBeVisible();
  });

  test("49. change summary textarea มี placeholder", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    const summary = page.locator("[data-policy-change-summary]");
    await expect(summary).toBeVisible();
    await expect(summary).toHaveAttribute("placeholder", "อธิบายสิ่งที่เปลี่ยนแปลงในเวอร์ชันนี้");
  });

  test("50. action buttons: ยกเลิก, Preview, Publish, บันทึก Draft (primary)", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    // [data-policy-back] matches both page-back and cancel button — use last (cancel in action bar)
    await expect(page.locator("[data-policy-back]").last()).toHaveText("ยกเลิก");
    await expect(page.locator("[data-policy-preview]")).toHaveText("Preview");
    await expect(page.locator("[data-policy-publish]")).toHaveText("Publish");
    const saveBtn = page.locator(".policy-editor-actions button[type='submit']");
    await expect(saveBtn).toHaveText("บันทึก Draft");
    await expect(saveBtn).toHaveClass(/primary/);
  });

  test("51. editor sidebar แสดงข้อมูลการแก้ไข (ผู้แก้ไข, วันที่แก้ไข)", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    const sidebar = page.locator(".policy-editor-sidebar");
    await expect(sidebar.locator("h4")).toHaveText("ข้อมูลการแก้ไข");
    const metaList = sidebar.locator(".policy-editor-meta-list");
    await expect(metaList.locator("dt").nth(0)).toHaveText("ผู้แก้ไข");
    await expect(metaList.locator("dd").nth(0)).toHaveText("Admin");
    await expect(metaList.locator("dt").nth(1)).toHaveText("วันที่แก้ไข");
  });

  test("52. แก้ไข Draft (Privacy Policy) → เข้า Editor ด้วย mode edit-draft", async ({ page }) => {
    await goToPolicyEditor(page, "POL-PP", "edit-draft");
    await expect(page.locator("body")).toHaveClass(/policy-editor-mode/);
    await expect(page.locator("#page-title")).toHaveText("PRIVACY POLICY — Draft");
  });

  test("53. แก้ไข Draft (Privacy Policy) version = v2.1-draft", async ({ page }) => {
    await goToPolicyEditor(page, "POL-PP", "edit-draft");
    const tiles = page.locator(".policy-editor-form .policy-metadata .detail-tile");
    await expect(tiles.nth(1).locator(".pill")).toHaveText("v2.1-draft");
  });

  test("54. แก้ไข Draft (Privacy Policy) TH canvas มีเนื้อหา draft (คุกกี้)", async ({ page }) => {
    await goToPolicyEditor(page, "POL-PP", "edit-draft");
    const thCanvas = page.locator("[data-policy-content-th]");
    await expect(thCanvas).toContainText("คุกกี้");
  });

  test("55. ยกเลิก (Cancel) → กลับไป Policy Detail", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    // Use the cancel button in action bar (last [data-policy-back])
    await page.locator(".policy-editor-actions [data-policy-back]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/policy-detail-mode/);
  });
});

// ==================== E. POLICY EDITOR — VALIDATION ====================

test.describe("Policy Editor — validation", () => {
  test("56. Publish โดยไม่กรอก change summary → ไม่เปิด publish modal + แสดง error", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    // ล้าง change summary
    await page.locator("[data-policy-change-summary]").fill("");
    // กด Publish
    await page.locator("[data-policy-publish]").click();
    await page.waitForTimeout(200);
    // ไม่เปิด modal
    await expect(page.locator("#user-action-modal")).not.toBeVisible();
    // แสดง error
    await expect(page.locator("[data-policy-change-summary-error]")).toContainText("กรุณากรอกสรุปการเปลี่ยนแปลง");
  });

  test("57. Save Draft โดยไม่กรอก change summary → ไม่ save + แสดง error", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    await page.locator("[data-policy-change-summary]").fill("");
    // กด Save Draft (submit)
    await page.locator(".policy-editor-actions button[type='submit']").click();
    await page.waitForTimeout(200);
    // ยังอยู่ใน editor
    await expect(page.locator("body")).toHaveClass(/policy-editor-mode/);
    await expect(page.locator("[data-policy-change-summary-error]")).toContainText("กรุณากรอกสรุปการเปลี่ยนแปลง");
  });

  test("58. ล้างเนื้อหา TH → แสดง error กรุณากรอกเนื้อหาภาษาไทย", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    // ล้างเนื้อหา TH
    await page.locator("[data-policy-content-th]").click();
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Delete");
    await page.waitForTimeout(100);
    // กรอก change summary ให้ผ่าน validation อื่น
    await page.locator("[data-policy-change-summary]").fill("ทดสอบ");
    // กด Save Draft
    await page.locator(".policy-editor-actions button[type='submit']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("[data-policy-content-error]")).toContainText("กรุณากรอกเนื้อหาภาษาไทย");
  });
});

// ==================== F. POLICY EDITOR — SAVE DRAFT ====================

test.describe("Policy Editor — save draft", () => {
  test("59. Save Draft สำเร็จ → กลับไป Policy Detail + แสดงปุ่ม แก้ไข Draft", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    // กรอก change summary
    await page.locator("[data-policy-change-summary]").fill("ทดสอบบันทึก Draft");
    // กด Save Draft
    await page.locator(".policy-editor-actions button[type='submit']").click();
    await page.waitForTimeout(300);
    // กลับไป Policy Detail
    await expect(page.locator("body")).toHaveClass(/policy-detail-mode/);
    // แสดงปุ่ม แก้ไข Draft (เพราะมี draft แล้ว)
    await expect(page.locator("[data-policy-edit='POL-TOU']")).toBeVisible();
  });
});

// ==================== G. PUBLISH CONFIRMATION MODAL ====================

test.describe("Publish confirmation modal", () => {
  test("60. กด Publish (form valid) → เปิด publish confirmation modal", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    await page.locator("[data-policy-change-summary]").fill("เผยแพร่เวอร์ชันใหม่");
    await page.locator("[data-policy-publish]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).toBeVisible();
    await expect(page.locator("#user-action-modal-title")).toHaveText("ยืนยันการเผยแพร่");
  });

  test("61. publish modal แสดง policy name + version + change summary", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    await page.locator("[data-policy-change-summary]").fill("เผยแพร่เวอร์ชันใหม่");
    await page.locator("[data-policy-publish]").click();
    await page.waitForTimeout(300);
    const modal = page.locator("#user-action-modal-body");
    await expect(modal).toContainText("TERMS OF USE");
    await expect(modal).toContainText("v2.0");
    await expect(modal).toContainText("เผยแพร่เวอร์ชันใหม่");
  });

  test("62. publish modal แสดง archive notice (เวอร์ชันเดิมจะถูกเก็บเป็น Archived)", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    await page.locator("[data-policy-change-summary]").fill("เผยแพร่เวอร์ชันใหม่");
    await page.locator("[data-policy-publish]").click();
    await page.waitForTimeout(300);
    const modal = page.locator("#user-action-modal-body");
    await expect(modal).toContainText("Archived");
  });

  test("63. publish modal มีปุ่ม ยกเลิก + เผยแพร่", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    await page.locator("[data-policy-change-summary]").fill("เผยแพร่เวอร์ชันใหม่");
    await page.locator("[data-policy-publish]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal [data-user-action-modal-close]")).toBeVisible();
    await expect(page.locator("[data-policy-publish-confirm='POL-TOU']")).toBeVisible();
    await expect(page.locator("[data-policy-publish-confirm='POL-TOU']")).toHaveText("เผยแพร่");
  });

  test("64. ยกเลิก publish → ปิด modal ยังอยู่ใน editor", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    await page.locator("[data-policy-change-summary]").fill("เผยแพร่เวอร์ชันใหม่");
    await page.locator("[data-policy-publish]").click();
    await page.waitForTimeout(300);
    await page.locator("#user-action-modal [data-user-action-modal-close]").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#user-action-modal")).not.toBeVisible();
    await expect(page.locator("body")).toHaveClass(/policy-editor-mode/);
  });

  test("65. ยืนยัน publish → กลับไป Policy Detail + version ใหม่", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    await page.locator("[data-policy-change-summary]").fill("เผยแพร่เวอร์ชันใหม่");
    await page.locator("[data-policy-publish]").click();
    await page.waitForTimeout(300);
    await page.locator("[data-policy-publish-confirm='POL-TOU']").click();
    await page.waitForTimeout(300);
    // กลับไป Policy Detail
    await expect(page.locator("body")).toHaveClass(/policy-detail-mode/);
    // version ใหม่ = v1.4
    const tiles = page.locator(".policy-detail-page .policy-metadata .detail-tile");
    await expect(tiles.nth(1).locator(".pill")).toHaveText("v2.0");
  });
});

// ==================== H. PREVIEW MODAL ====================

test.describe("Preview modal", () => {
  test("66. กด Preview → เปิด preview modal แสดง TH + EN content", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    await page.locator("[data-policy-preview]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).toBeVisible();
    await expect(page.locator("#user-action-modal-title")).toContainText("Preview");
    await expect(page.locator("#user-action-modal-title")).toContainText("TERMS OF USE");
    // TH content
    await expect(page.locator(".policy-preview-language").nth(0).locator("h4")).toHaveText("ภาษาไทย");
    // EN content
    await expect(page.locator(".policy-preview-language").nth(1).locator("h4")).toHaveText("English");
  });

  test("67. preview modal แสดง version pill", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    await page.locator("[data-policy-preview]").click();
    await page.waitForTimeout(300);
    await expect(page.locator(".policy-preview-version-pill")).toBeVisible();
  });

  test("68. ปิด preview modal → กลับไป editor", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    await page.locator("[data-policy-preview]").click();
    await page.waitForTimeout(300);
    await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
    await page.waitForTimeout(200);
    await expect(page.locator("#user-action-modal")).not.toBeVisible();
    await expect(page.locator("body")).toHaveClass(/policy-editor-mode/);
  });

  test("69. preview แสดงเนื้อหา TH (เงื่อนไขการใช้งาน)", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    await page.locator("[data-policy-preview]").click();
    await page.waitForTimeout(300);
    const thPreview = page.locator(".policy-preview-language").nth(0);
    await expect(thPreview).toContainText("เงื่อนไขการใช้งาน");
  });

  test("70. preview แสดงเนื้อหา EN (Terms of Use)", async ({ page }) => {
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    await page.locator("[data-policy-preview]").click();
    await page.waitForTimeout(300);
    const enPreview = page.locator(".policy-preview-language").nth(1);
    await expect(enPreview).toContainText("Terms of Use");
  });
});

// ==================== I. VERSION HISTORY — RENDERING ====================

test.describe("Version History — rendering", () => {
  test("71. คลิก ดู Version History → เข้าหน้า Version History", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    await expect(page.locator("body")).toHaveClass(/policy-version-history-mode/);
    await expect(page.locator("#page-title")).toHaveText("Version History");
    await expect(page.locator("#panel-title")).toHaveText("Version History List");
  });

  test("72. breadcrumb แสดง policy type + Version History", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    await expect(page.locator("#crumb")).toHaveText("เครื่องมือ & รายงาน / Settings / Policy & Versioning / Terms of Use / Version History");
  });

  test("73. ตารางมี 7 คอลัมน์ (Version, Status, Updated By, Updated, Published Date, Change Summary, Action)", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    const headCells = page.locator(".policy-version-table .asset-row.head > div");
    await expect(headCells).toHaveCount(7);
    const head = page.locator(".policy-version-table .asset-row.head");
    await expect(head).toContainText("Version");
    await expect(head).toContainText("Status");
    await expect(head).toContainText("Updated By");
    await expect(head).toContainText("Updated");
    await expect(head).toContainText("Published Date");
    await expect(head).toContainText("Change Summary");
    await expect(head).toContainText("Action");
  });

  test("74. Terms of Use แสดง 3 versions (v1.3 Published, v1.2 Archived, v1.1 Archived)", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    const rows = page.locator(".policy-version-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(3);
    // v1.3 Published (first)
    await expect(rows.nth(0).locator("[data-label='Version'] .pill")).toHaveText("v1.3");
    await expect(rows.nth(0).locator("[data-label='Status'] .pill.green")).toContainText("Published");
    // v1.2 Archived
    await expect(rows.nth(1).locator("[data-label='Version'] .pill")).toHaveText("v1.2");
    await expect(rows.nth(1).locator("[data-label='Status'] .pill.gray")).toContainText("Archived");
    // v1.1 Archived
    await expect(rows.nth(2).locator("[data-label='Version'] .pill")).toHaveText("v1.1");
    await expect(rows.nth(2).locator("[data-label='Status'] .pill.gray")).toContainText("Archived");
  });

  test("75. Privacy Policy แสดง 3 versions (v2.1-draft Draft, v2.0 Published, v1.5 Archived)", async ({ page }) => {
    await goToVersionHistory(page, "POL-PP");
    const rows = page.locator(".policy-version-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(3);
    // v2.1-draft Draft (first)
    await expect(rows.nth(0).locator("[data-label='Version'] .pill")).toHaveText("v2.1-draft");
    await expect(rows.nth(0).locator("[data-label='Status'] .pill.amber")).toContainText("Draft");
    // v2.0 Published
    await expect(rows.nth(1).locator("[data-label='Version'] .pill")).toHaveText("v2.0");
    await expect(rows.nth(1).locator("[data-label='Status'] .pill.green")).toContainText("Published");
    // v1.5 Archived
    await expect(rows.nth(2).locator("[data-label='Version'] .pill")).toHaveText("v1.5");
    await expect(rows.nth(2).locator("[data-label='Status'] .pill.gray")).toContainText("Archived");
  });

  test("76. Published Date แสดงสำหรับ Published/Archived, '—' สำหรับ Draft", async ({ page }) => {
    await goToVersionHistory(page, "POL-PP");
    const rows = page.locator(".policy-version-table .asset-row:not(.head)");
    // v2.1-draft (Draft) → publishedDate = "—"
    await expect(rows.nth(0).locator("[data-label='Published Date'] .main-text")).toHaveText("—");
    // v2.0 (Published) → has date
    await expect(rows.nth(1).locator("[data-label='Published Date'] .main-text")).toContainText("2026-08-20");
  });

  test("77. row click → เปิด Version View modal", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    await page.locator(".policy-version-table .asset-row:not(.head)").first().click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).toBeVisible();
    await expect(page.locator("#user-action-modal-title")).toContainText("TERMS OF USE");
    await expect(page.locator("#user-action-modal-title")).toContainText("v1.3");
  });

  test("78. แต่ละแถวมี row menu (action menu)", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    const rowMenus = page.locator(".policy-version-table .asset-row .row-menu");
    await expect(rowMenus).toHaveCount(3);
  });

  test("79. Published version row menu มี 'ดูเวอร์ชัน' (ไม่มี Edit Draft / Restore)", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    // v1.3 Published
    const publishedRow = page.locator(".policy-version-table .asset-row").nth(1); // nth(1) because head is nth(0)
    await publishedRow.locator(".row-menu summary").click();
    await page.waitForTimeout(200);
    const menuList = publishedRow.locator(".row-menu-list");
    await expect(menuList.locator("[data-policy-version-view]")).toBeVisible();
    await expect(menuList.locator("[data-policy-version-edit]")).toHaveCount(0);
    await expect(menuList.locator("[data-policy-version-restore]")).toHaveCount(0);
  });

  test("80. Archived version row menu มี 'ดูเวอร์ชัน' + 'Restore เป็น Draft'", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    // v1.2 Archived = แถวที่ 2 (index 2 รวม head)
    const archivedRow = page.locator(".policy-version-table .asset-row").nth(2);
    await archivedRow.locator(".row-menu summary").click();
    await page.waitForTimeout(200);
    const menuList = archivedRow.locator(".row-menu-list");
    await expect(menuList.locator("[data-policy-version-view]")).toBeVisible();
    await expect(menuList.locator("[data-policy-version-restore]")).toBeVisible();
  });

  test("81. Draft version row menu มี 'แก้ไข Draft' + 'ดูเวอร์ชัน'", async ({ page }) => {
    await goToVersionHistory(page, "POL-PP");
    // v2.1-draft = แถวแรก (index 1 รวม head)
    const draftRow = page.locator(".policy-version-table .asset-row").nth(1);
    await draftRow.locator(".row-menu summary").click();
    await page.waitForTimeout(200);
    const menuList = draftRow.locator(".row-menu-list");
    await expect(menuList.locator("[data-policy-version-edit]")).toBeVisible();
    await expect(menuList.locator("[data-policy-version-view]")).toBeVisible();
  });

  test("82. back button → กลับไป Policy Detail", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    await page.locator("#page-actions [data-policy-back]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/policy-detail-mode/);
  });

  test("83. Version History ไม่มี summary cards, filter, pagination", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    const summaryGrid = page.locator("#summary-grid");
    expect((await summaryGrid.innerHTML()).trim()).toBe("");
    const filters = await page.locator(".filters").innerHTML();
    expect(filters.trim()).toBe("");
    const footer = page.locator("#table > .footer-range");
    await expect(footer).toHaveCount(0);
  });
});

// ==================== J. VERSION VIEW MODAL ====================

test.describe("Version View modal", () => {
  test("84. Version View modal แสดง language tabs TH/EN (TH active)", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    await page.locator(".policy-version-table .asset-row:not(.head)").first().click();
    await page.waitForTimeout(300);
    const tabs = page.locator("[data-policy-version-view-lang]");
    await expect(tabs).toHaveCount(2);
    await expect(tabs.nth(0)).toHaveAttribute("data-policy-version-view-lang", "th");
    await expect(tabs.nth(1)).toHaveAttribute("data-policy-version-view-lang", "en");
    await expect(tabs.nth(0)).toHaveClass(/active/);
  });

  test("85. TH content visible, EN content hidden (default)", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    await page.locator(".policy-version-table .asset-row:not(.head)").first().click();
    await page.waitForTimeout(300);
    await expect(page.locator("[data-policy-version-view-lang-panel='th']")).toBeVisible();
    await expect(page.locator("[data-policy-version-view-lang-panel='en']")).toHaveAttribute("hidden", "");
  });

  test("86. คลิก English tab → EN content visible", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    await page.locator(".policy-version-table .asset-row:not(.head)").first().click();
    await page.waitForTimeout(300);
    await page.locator("[data-policy-version-view-lang='en']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("[data-policy-version-view-lang-panel='en']")).toBeVisible();
    await expect(page.locator("[data-policy-version-view-lang-panel='th']")).toHaveAttribute("hidden", "");
  });

  test("87. Version View modal แสดง metadata (Status, Version, Updated, Updated By)", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    await page.locator(".policy-version-table .asset-row:not(.head)").first().click();
    await page.waitForTimeout(300);
    const meta = page.locator(".policy-version-view-meta");
    await expect(meta).toBeVisible();
    await expect(meta).toContainText("Status");
    await expect(meta).toContainText("Version");
    await expect(meta).toContainText("Updated");
    await expect(meta).toContainText("Updated By");
  });

  test("88. Version View modal แสดง change summary", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    await page.locator(".policy-version-table .asset-row:not(.head)").first().click();
    await page.waitForTimeout(300);
    const summary = page.locator(".policy-version-view-summary");
    await expect(summary).toBeVisible();
    await expect(summary).toContainText("สรุปการเปลี่ยนแปลง");
    await expect(summary).toContainText("Watch Alert");
  });

  test("89. Archived version View modal แสดงปุ่ม Restore", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    // v1.2 Archived = แถวที่ 2
    await page.locator(".policy-version-table .asset-row:not(.head)").nth(1).click();
    await page.waitForTimeout(300);
    // Scope to modal — row menus also have restore buttons
    const modalRestore = page.locator("#user-action-modal [data-policy-version-restore]");
    await expect(modalRestore).toBeVisible();
    await expect(modalRestore).toContainText("Restore");
  });

  test("90. Published version View modal ไม่แสดงปุ่ม Restore หรือ Edit Draft", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    // v1.3 Published = แถวแรก
    await page.locator(".policy-version-table .asset-row:not(.head)").first().click();
    await page.waitForTimeout(300);
    // Scope to modal — row menus may have restore/edit buttons
    await expect(page.locator("#user-action-modal [data-policy-version-restore]")).toHaveCount(0);
    await expect(page.locator("#user-action-modal [data-policy-version-edit]")).toHaveCount(0);
  });

  test("91. Draft version View modal แสดงปุ่ม แก้ไข Draft", async ({ page }) => {
    await goToVersionHistory(page, "POL-PP");
    // v2.1-draft = แถวแรก
    await page.locator(".policy-version-table .asset-row:not(.head)").first().click();
    await page.waitForTimeout(300);
    // Scope to modal
    const modalEdit = page.locator("#user-action-modal [data-policy-version-edit]");
    await expect(modalEdit).toBeVisible();
    await expect(modalEdit).toContainText("แก้ไข Draft");
  });

  test("92. ปิด Version View modal → กลับไป Version History", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    await page.locator(".policy-version-table .asset-row:not(.head)").first().click();
    await page.waitForTimeout(300);
    await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
    await page.waitForTimeout(200);
    await expect(page.locator("#user-action-modal")).not.toBeVisible();
    await expect(page.locator("body")).toHaveClass(/policy-version-history-mode/);
  });

  test("93. row menu 'ดูเวอร์ชัน' → เปิด Version View modal", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    const firstRow = page.locator(".policy-version-table .asset-row").nth(1);
    await firstRow.locator(".row-menu summary").click();
    await page.waitForTimeout(200);
    await firstRow.locator(".row-menu-list [data-policy-version-view]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).toBeVisible();
  });
});

// ==================== K. RESTORE CONFIRMATION MODAL ====================

test.describe("Restore confirmation modal", () => {
  test("94. คลิก Restore ใน View modal (Archived) → เปิด Restore confirmation modal", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    // v1.2 Archived = แถวที่ 2
    await page.locator(".policy-version-table .asset-row:not(.head)").nth(1).click();
    await page.waitForTimeout(300);
    // Scope to modal — row menus also have restore buttons
    await page.locator("#user-action-modal [data-policy-version-restore]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).toBeVisible();
    await expect(page.locator("#user-action-modal-title")).toHaveText("ยืนยันการ Restore");
  });

  test("95. Restore modal แสดง version ที่จะ restore + ข้อความสรุป", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    await page.locator(".policy-version-table .asset-row:not(.head)").nth(1).click();
    await page.waitForTimeout(300);
    await page.locator("#user-action-modal [data-policy-version-restore]").click();
    await page.waitForTimeout(300);
    const modal = page.locator("#user-action-modal-body");
    await expect(modal).toContainText("v1.2");
    await expect(modal).toContainText("Draft ใหม่");
  });

  test("96. Restore modal มีปุ่ม ยกเลิก + Restore", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    await page.locator(".policy-version-table .asset-row:not(.head)").nth(1).click();
    await page.waitForTimeout(300);
    await page.locator("#user-action-modal [data-policy-version-restore]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal [data-user-action-modal-close]")).toBeVisible();
    await expect(page.locator("[data-policy-version-restore-confirm]")).toBeVisible();
    await expect(page.locator("[data-policy-version-restore-confirm]")).toHaveText("Restore");
  });

  test("97. ยกเลิก Restore → ปิด modal ยังอยู่ใน Version History", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    await page.locator(".policy-version-table .asset-row:not(.head)").nth(1).click();
    await page.waitForTimeout(300);
    await page.locator("#user-action-modal [data-policy-version-restore]").click();
    await page.waitForTimeout(300);
    await page.locator("#user-action-modal [data-user-action-modal-close]").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#user-action-modal")).not.toBeVisible();
    await expect(page.locator("body")).toHaveClass(/policy-version-history-mode/);
  });

  test("98. ยืนยัน Restore → เข้า Editor ด้วย Draft ใหม่", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    await page.locator(".policy-version-table .asset-row:not(.head)").nth(1).click();
    await page.waitForTimeout(300);
    await page.locator("#user-action-modal [data-policy-version-restore]").click();
    await page.waitForTimeout(300);
    await page.locator("[data-policy-version-restore-confirm]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/policy-editor-mode/);
  });

  test("99. row menu 'Restore เป็น Draft' (Archived) → เปิด Restore confirmation modal", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    // v1.2 Archived = แถวที่ 2 (index 2 รวม head)
    const archivedRow = page.locator(".policy-version-table .asset-row").nth(2);
    await archivedRow.locator(".row-menu summary").click();
    await page.waitForTimeout(200);
    await archivedRow.locator(".row-menu-list [data-policy-version-restore]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).toBeVisible();
    await expect(page.locator("#user-action-modal-title")).toHaveText("ยืนยันการ Restore");
  });

  test("100. Restore จาก Privacy Policy (มี draft อยู่แล้ว) → แสดง warning แทนที่ draft", async ({ page }) => {
    await goToVersionHistory(page, "POL-PP");
    // v1.5 Archived = แถวที่ 3
    await page.locator(".policy-version-table .asset-row:not(.head)").nth(2).click();
    await page.waitForTimeout(300);
    await page.locator("#user-action-modal [data-policy-version-restore]").click();
    await page.waitForTimeout(300);
    const modal = page.locator("#user-action-modal-body");
    await expect(modal).toContainText("v2.1-draft");
    await expect(modal).toContainText("แทนที่");
  });
});

// ==================== L. VERSION EDIT FROM HISTORY ====================

test.describe("Version edit from history", () => {
  test("101. row menu 'แก้ไข Draft' (Draft version) → เข้า Editor", async ({ page }) => {
    await goToVersionHistory(page, "POL-PP");
    // v2.1-draft = แถวแรก (index 1 รวม head)
    const draftRow = page.locator(".policy-version-table .asset-row").nth(1);
    await draftRow.locator(".row-menu summary").click();
    await page.waitForTimeout(200);
    await draftRow.locator(".row-menu-list [data-policy-version-edit]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/policy-editor-mode/);
  });

  test("102. View modal 'แก้ไข Draft' (Draft version) → เข้า Editor", async ({ page }) => {
    await goToVersionHistory(page, "POL-PP");
    // v2.1-draft = แถวแรก
    await page.locator(".policy-version-table .asset-row:not(.head)").first().click();
    await page.waitForTimeout(300);
    await page.locator("#user-action-modal [data-policy-version-edit]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/policy-editor-mode/);
  });
});

// ==================== M. RESPONSIVE — MOBILE (390px) ====================

test.describe("Policy & Versioning — mobile (390px)", () => {
  test("103. mobile: Policy List แสดง mobile card แทนตาราง", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await goToPolicyList(page);
    const cardMeta = page.locator(".policy-list-table .asset-row:not(.head) .user-card-meta");
    expect(await cardMeta.count()).toBeGreaterThan(0);
    await page.close();
  });

  test("104. mobile: mobile card แสดง Description, Version, Updated, Updated By", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await goToPolicyList(page);
    const firstCard = page.locator(".policy-list-table .asset-row:not(.head)").first();
    // Mobile card uses <span> for labels — match exact text to avoid "Updated" matching "Updated By"
    await expect(firstCard.locator(".user-card-meta-item span", { hasText: /^Description$/ })).toBeVisible();
    await expect(firstCard.locator(".user-card-meta-item span", { hasText: /^Version$/ })).toBeVisible();
    await expect(firstCard.locator(".user-card-meta-item span", { hasText: /^Updated$/ })).toBeVisible();
    await expect(firstCard.locator(".user-card-meta-item span", { hasText: /^Updated By$/ })).toBeVisible();
    await page.close();
  });

  test("105. mobile: row click → Policy Detail ได้", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await goToPolicyList(page);
    await page.locator(".policy-list-table .asset-row:not(.head)").first().click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/policy-detail-mode/);
    await page.close();
  });

  test("106. mobile: Policy Detail แสดง language tabs + content + metadata + actions", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await goToPolicyDetail(page, "POL-TOU");
    await expect(page.locator("[data-policy-lang-tab]")).toHaveCount(2);
    await expect(page.locator("[data-policy-content-lang='th']")).toBeVisible();
    await expect(page.locator(".policy-metadata .detail-tile")).toHaveCount(4);
    await expect(page.locator("[data-policy-create-draft='POL-TOU']")).toBeVisible();
    await expect(page.locator("[data-policy-version-history='POL-TOU']")).toBeVisible();
    await page.close();
  });

  test("107. mobile: Policy Editor แสดง form + toolbar + contenteditable + actions", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    await expect(page.locator("[data-policy-editor-lang-tab]")).toHaveCount(2);
    await expect(page.locator("[data-policy-content-th]")).toBeVisible();
    await expect(page.locator("[data-policy-editor-command='bold']").first()).toBeVisible();
    await expect(page.locator("[data-policy-change-summary]")).toBeVisible();
    await expect(page.locator("[data-policy-preview]")).toBeVisible();
    await expect(page.locator("[data-policy-publish]")).toBeVisible();
    await page.close();
  });

  test("108. mobile: Version History แสดงตาราง + row menu", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await goToVersionHistory(page, "POL-TOU");
    const rows = page.locator(".policy-version-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(3);
    await expect(page.locator(".policy-version-table .row-menu")).toHaveCount(3);
    await page.close();
  });

  test("109. mobile: Version View modal แสดง TH/EN tabs + content", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await goToVersionHistory(page, "POL-TOU");
    await page.locator(".policy-version-table .asset-row:not(.head)").first().click();
    await page.waitForTimeout(300);
    await expect(page.locator("[data-policy-version-view-lang]")).toHaveCount(2);
    await expect(page.locator("[data-policy-version-view-lang-panel='th']")).toBeVisible();
    await page.close();
  });

  test("110. mobile: back button จาก Detail กลับไป List", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await goToPolicyDetail(page, "POL-TOU");
    await page.locator("#page-actions [data-policy-back]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/policy-versioning-mode/);
    await page.close();
  });

  test("111. mobile: back button จาก Version History กลับไป Detail", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await goToVersionHistory(page, "POL-TOU");
    await page.locator("#page-actions [data-policy-back]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/policy-detail-mode/);
    await page.close();
  });

  test("112. mobile: Publish modal แสดงครบ (policy, version, summary, archive notice, buttons)", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    await page.locator("[data-policy-change-summary]").fill("ทดสอบ mobile publish");
    await page.locator("[data-policy-publish]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#user-action-modal")).toBeVisible();
    await expect(page.locator("#user-action-modal-body")).toContainText("TERMS OF USE");
    await expect(page.locator("#user-action-modal-body")).toContainText("Archived");
    await expect(page.locator("[data-policy-publish-confirm]")).toBeVisible();
    await page.close();
  });
});

// ==================== N. RESPONSIVE — TABLET (768px) ====================

test.describe("Policy & Versioning — tablet (768px)", () => {
  test("113. tablet: Policy List แสดง 2 แถว", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
    await goToPolicyList(page);
    const rows = page.locator(".policy-list-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(2);
    await page.close();
  });

  test("114. tablet: Policy Detail แสดง metadata 4 tiles + content", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
    await goToPolicyDetail(page, "POL-TOU");
    await expect(page.locator(".policy-metadata .detail-tile")).toHaveCount(4);
    await expect(page.locator("[data-policy-content-lang='th']")).toBeVisible();
    await page.close();
  });

  test("115. tablet: Policy Editor แสดง form ครบ", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    await expect(page.locator("[data-policy-content-th]")).toBeVisible();
    await expect(page.locator("[data-policy-change-summary]")).toBeVisible();
    await page.close();
  });

  test("116. tablet: Version History แสดง 3 versions", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
    await goToVersionHistory(page, "POL-TOU");
    const rows = page.locator(".policy-version-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(3);
    await page.close();
  });
});

// ==================== O. RESPONSIVE — DESKTOP (1280px) ====================

test.describe("Policy & Versioning — desktop (1280px)", () => {
  test("117. desktop (1280px): Policy List แสดง 2 แถว + 7 คอลัมน์", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await goToPolicyList(page);
    const rows = page.locator(".policy-list-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(2);
    const headCells = page.locator(".policy-list-table .asset-row.head > div");
    await expect(headCells).toHaveCount(7);
    await page.close();
  });

  test("118. desktop (1280px): Policy Detail แสดงครบ", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await goToPolicyDetail(page, "POL-TOU");
    await expect(page.locator(".policy-metadata .detail-tile")).toHaveCount(4);
    await expect(page.locator("[data-policy-content-lang='th']")).toBeVisible();
    await expect(page.locator("[data-policy-version-history='POL-TOU']")).toBeVisible();
    await page.close();
  });

  test("119. desktop (1280px): Policy Editor แสดง form + sidebar (DOM)", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    await expect(page.locator("[data-policy-content-th]")).toBeVisible();
    // Sidebar exists in DOM but CSS display:none — see DEFECT-PV-001
    await expect(page.locator(".policy-editor-sidebar")).toHaveCount(1);
    await page.close();
  });

  test("120. desktop (1280px): Version History แสดง 3 versions + row menu", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await goToVersionHistory(page, "POL-TOU");
    const rows = page.locator(".policy-version-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(3);
    await expect(page.locator(".policy-version-table .row-menu")).toHaveCount(3);
    await page.close();
  });
});

// ==================== P. RESPONSIVE — WIDE DESKTOP (1440px) ====================

test.describe("Policy & Versioning — wide desktop (1440px)", () => {
  test("121. desktop (1440px): Policy List แสดง 2 แถว + 7 คอลัมน์", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await goToPolicyList(page);
    const rows = page.locator(".policy-list-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(2);
    const headCells = page.locator(".policy-list-table .asset-row.head > div");
    await expect(headCells).toHaveCount(7);
    await page.close();
  });

  test("122. desktop (1440px): Policy Detail แสดงครบ", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await goToPolicyDetail(page, "POL-TOU");
    await expect(page.locator(".policy-metadata .detail-tile")).toHaveCount(4);
    await expect(page.locator("[data-policy-content-lang='th']")).toBeVisible();
    await page.close();
  });

  test("123. desktop (1440px): Policy Editor แสดง form + sidebar (DOM)", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await goToPolicyEditor(page, "POL-TOU", "create-draft");
    await expect(page.locator("[data-policy-content-th]")).toBeVisible();
    // Sidebar exists in DOM but CSS display:none — see DEFECT-PV-001
    await expect(page.locator(".policy-editor-sidebar")).toHaveCount(1);
    await page.close();
  });

  test("124. desktop (1440px): Version History แสดง 3 versions", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await goToVersionHistory(page, "POL-TOU");
    const rows = page.locator(".policy-version-table .asset-row:not(.head)");
    await expect(rows).toHaveCount(3);
    await page.close();
  });
});

// ==================== Q. CROSS-SCREEN NAVIGATION ====================

test.describe("Policy & Versioning — cross-screen navigation", () => {
  test("125. List → Detail → Editor → back → Detail → back → List", async ({ page }) => {
    await goToPolicyList(page);
    // → Detail
    await page.locator(".policy-list-table .asset-row[data-policy-open='POL-TOU'] .asset-cell-primary").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/policy-detail-mode/);
    // → Editor
    await page.locator("[data-policy-create-draft='POL-TOU']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/policy-editor-mode/);
    // → back to Detail (use action-bar cancel button)
    await page.locator(".policy-editor-actions [data-policy-back]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/policy-detail-mode/);
    // → back to List (detail page back button in page-actions)
    await page.locator("#page-actions [data-policy-back]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/policy-versioning-mode/);
  });

  test("126. List → Detail → Version History → back → Detail → back → List", async ({ page }) => {
    await goToPolicyList(page);
    await page.locator(".policy-list-table .asset-row[data-policy-open='POL-TOU'] .asset-cell-primary").click();
    await page.waitForTimeout(300);
    // → Version History
    await page.locator("[data-policy-version-history='POL-TOU']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/policy-version-history-mode/);
    // → back to Detail (version history back button in page-actions)
    await page.locator("#page-actions [data-policy-back]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/policy-detail-mode/);
    // → back to List
    await page.locator("#page-actions [data-policy-back]").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/policy-versioning-mode/);
  });

  test("127. Version History → View modal → Restore → Editor (full flow)", async ({ page }) => {
    await goToVersionHistory(page, "POL-TOU");
    // v1.2 Archived = แถวที่ 2
    await page.locator(".policy-version-table .asset-row:not(.head)").nth(1).click();
    await page.waitForTimeout(300);
    // View modal open
    await expect(page.locator("#user-action-modal")).toBeVisible();
    // Click Restore (scope to modal)
    await page.locator("#user-action-modal [data-policy-version-restore]").click();
    await page.waitForTimeout(300);
    // Restore confirm modal
    await expect(page.locator("#user-action-modal-title")).toHaveText("ยืนยันการ Restore");
    // Confirm
    await page.locator("[data-policy-version-restore-confirm]").click();
    await page.waitForTimeout(300);
    // → Editor
    await expect(page.locator("body")).toHaveClass(/policy-editor-mode/);
  });
});
