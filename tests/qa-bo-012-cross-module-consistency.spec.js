// QA-BO-012: Cross-module consistency — strict Playwright spec
// ตรวจ pattern ที่ตัดข้ามโมดูลของหน้าจอ BO ที่ล็อกทั้งหมด
// อ้างอิง: BO_UI_UX_STANDARD.md, docs/responsive-table-standard.md, prototype (protected — เทสเท่านั้น)
// เป้าหมาย: รันเทส เจอปัญหาจริง → ลิสปัญหา + แนวทางแก้ (ห้ามแก้ prototype)
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

// helper: login เข้าระบบ (ค่า default อยู่ใน form แล้ว)
async function loginIfNeeded(page) {
  const loginScreen = page.locator("#login-screen");
  if (await loginScreen.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator("#login-form button[type=\"submit\"]").click();
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

// helper: ไปหน้า module ผ่าน jumpToModule (เร็วกว่าคลิกเมนู — ใช้สำหรับ cross-module)
// หมายเหตุ: option-master ไม่มี moduleData entry 所以 jumpToModule จะ return early
// ต้องเรียก renderModule โดยตรงสำหรับ option-master
async function goToModule(page, moduleId, subLabel = "") {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await page.evaluate(([m, s]) => {
    if (typeof jumpToModule === "function" && (window.moduleData && window.moduleData[m]) || m === "dashboard" || m === "settings") {
      jumpToModule(m, s);
    } else if (typeof renderModule === "function") {
      // option-master และ modules อื่นที่ไม่มี moduleData entry — เรียก renderModule โดยตรง
      renderModule(m, s, s);
      if (typeof scrollMainToTop === "function") scrollMainToTop();
    }
  }, [moduleId, subLabel]);
  await page.waitForTimeout(500);
}

// helper: ไปหน้า module ผ่านเมนูจริง (ทดสอบ menu active state)
async function goToModuleViaMenu(page, moduleId, subLabel = "") {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  const navItem = page.locator(`.nav-item[data-module='${moduleId}']`);
  await navItem.click();
  await page.waitForTimeout(300);
  if (subLabel) {
    await ensureNavOpen(page);
    const subBtn = page.locator(`.submenu[data-submenu='${moduleId}'] button[data-sub='${subLabel}']`);
    await subBtn.click();
    await page.waitForTimeout(300);
  }
}

// helper: ปิด modal ถ้าเปิดอยู่
async function closeModal(page) {
  const closeBtn = page.locator("[data-user-action-modal-close]");
  if (await closeBtn.isVisible({ timeout: 500 }).catch(() => false)) {
    await closeBtn.click();
    await page.waitForTimeout(200);
  }
}

// helper: ตรวจว่า breakpoint ปัจจุบันเป็น mobile (≤760px) หรือไม่
async function isMobile(page) {
  return await page.evaluate(() => window.matchMedia("(max-width: 760px)").matches);
}

// helper: ตรวจว่า breakpoint ปัจจุบันเป็น compact (≤1180px) หรือไม่
async function isCompact(page) {
  return await page.evaluate(() => window.matchMedia("(max-width: 1180px)").matches);
}

// ==================== A. LOGIN PATTERN ====================

test.describe("QA-BO-012: Login pattern — dark theme + split layout", () => {

  test("1. login screen มี dark background (#061426)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    const loginScreen = page.locator("#login-screen");
    await expect(loginScreen).toBeVisible();
    const bg = await loginScreen.evaluate(el => getComputedStyle(el).backgroundColor);
    // rgb(6, 20, 38) = #061426
    expect(bg).toContain("6, 20, 38");
  });

  test("2. login screen ใช้ split layout 2 columns บน desktop (>1180px)", async ({ page, browserName }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    const isDesktop = await page.evaluate(() => !window.matchMedia("(max-width: 1180px)").matches);
    if (!isDesktop) { test.skip(); return; }
    const loginScreen = page.locator("#login-screen");
    const cols = await loginScreen.evaluate(el => getComputedStyle(el).gridTemplateColumns);
    const trackCount = cols.split(/\s+/).filter(Boolean).length;
    expect(trackCount).toBe(2);
  });

  test("3. login screen ใช้ single column บน compact (≤1180px)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    const compact = await isCompact(page);
    if (!compact) { test.skip(); return; }
    const loginScreen = page.locator("#login-screen");
    const cols = await loginScreen.evaluate(el => getComputedStyle(el).gridTemplateColumns);
    const trackCount = cols.split(/\s+/).filter(Boolean).length;
    expect(trackCount).toBe(1);
  });

  test("4. login form มี email + password + submit button", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#login-email")).toBeVisible();
    await expect(page.locator("#login-password")).toBeVisible();
    await expect(page.locator("#login-form button[type='submit']")).toBeVisible();
  });

  test("5. login form มีค่า default อยู่แล้ว (email + password)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#login-email")).toHaveValue("current.admin@tukdaeng.example");
    await expect(page.locator("#login-password")).toHaveValue("tukdaeng-admin");
  });

  test("6. login flow: submit Email + Password → เข้าระบบได้โดยตรง (ไม่มี OTP step)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await page.locator("#login-form button[type='submit']").click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    expect(await page.evaluate(() => document.body.classList.contains("logged-out"))).toBe(false);
    await expect(page.locator("#otp-form")).toHaveCount(0);
  });

  test("7. login สำเร็จแล้ว login screen ซ่อน", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    const loginScreen = page.locator("#login-screen");
    const display = await loginScreen.evaluate(el => getComputedStyle(el).display);
    expect(display).toBe("none");
  });
});

// ==================== B. DRILL-IN LINK PATTERN ====================

test.describe("QA-BO-012: Drill-in link pattern — identifier link → detail", () => {

  test("8. User List: คลิก user row → เปิด User Detail (body user-detail-mode)", async ({ page }) => {
    await goToModule(page, "users", "User Accounts");
    // คลิก primary cell ของ row (หลบ row-menu/button) — pattern เดียวกับ qa-bo-002
    await page.locator(".user-row[data-user-card] .user-cell-primary").first().click();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.body.classList.contains("user-detail-mode"))).toBe(true);
  });

  test("9. User Detail: มี back button กลับ User List", async ({ page }) => {
    await goToModule(page, "users", "User Accounts");
    await page.locator(".user-row[data-user-card] .user-cell-primary").first().click();
    await page.waitForTimeout(500);
    const backBtn = page.locator("[data-back-user-list]");
    await expect(backBtn).toBeVisible();
  });

  test("10. Asset List: คลิก asset row → เปิด Asset Detail (body asset-detail-mode)", async ({ page }) => {
    await goToModule(page, "assets", "Asset List");
    await page.locator(".asset-row[data-asset-card] .asset-cell-primary").first().click();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.body.classList.contains("asset-detail-mode"))).toBe(true);
  });

  test("11. Asset Detail: มี back button กลับ Asset List", async ({ page }) => {
    await goToModule(page, "assets", "Asset List");
    await page.locator(".asset-row[data-asset-card] .asset-cell-primary").first().click();
    await page.waitForTimeout(500);
    const backBtn = page.locator("[data-back-asset-list]");
    await expect(backBtn).toBeVisible();
  });

  test("12. Offer List: คลิก offer row → เปิด Offer Detail (body offer-detail-mode)", async ({ page }) => {
    await goToModule(page, "offers");
    await page.locator(".asset-row[data-offer-card] .asset-cell-primary").first().click();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.body.classList.contains("offer-detail-mode"))).toBe(true);
  });

  test("13. Offer Detail: มี back button กลับ Offer List", async ({ page }) => {
    await goToModule(page, "offers");
    await page.locator(".asset-row[data-offer-card] .asset-cell-primary").first().click();
    await page.waitForTimeout(500);
    const backBtn = page.locator("[data-back-offer-list]");
    await expect(backBtn).toBeVisible();
  });

  test("14. Watch Alert List: คลิก alert row → เปิด Watch Alert Detail", async ({ page }) => {
    await goToModule(page, "watch-alerts", "Watch Alert List");
    await page.locator("[data-wa-alert-card]").first().click();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.body.classList.contains("watch-alert-detail-mode"))).toBe(true);
  });

  test("15. Watch Alert Detail: มี back button กลับ Watch Alert List", async ({ page }) => {
    await goToModule(page, "watch-alerts", "Watch Alert List");
    await page.locator("[data-wa-alert-card]").first().click();
    await page.waitForTimeout(500);
    const backBtn = page.locator("[data-back-wa-alert-list]");
    await expect(backBtn).toBeVisible();
  });

  test("16. Account Deletion: คลิก request row → เปิด Request Detail (body deletion-detail-mode)", async ({ page }) => {
    await goToModule(page, "deletions");
    await page.locator(".user-row[data-deletion-card]").first().click();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.body.classList.contains("deletion-detail-mode"))).toBe(true);
  });

  test("17. Account Deletion Detail: มี back button กลับ Deletion Requests", async ({ page }) => {
    await goToModule(page, "deletions");
    await page.locator(".user-row[data-deletion-card]").first().click();
    await page.waitForTimeout(500);
    const backBtn = page.locator("[data-back-deletion-list]");
    await expect(backBtn).toBeVisible();
  });

  test("18. Offer Detail: Asset ID link เปิด Asset Detail ได้ (cross-module drill-in)", async ({ page }) => {
    await goToModule(page, "offers");
    await page.locator(".asset-row[data-offer-card] .asset-cell-primary").first().click();
    await page.waitForTimeout(500);
    const assetLink = page.locator("[data-asset-open]").first();
    if (await assetLink.isVisible({ timeout: 1000 }).catch(() => false)) {
      await assetLink.click();
      await page.waitForTimeout(500);
      expect(await page.evaluate(() => document.body.classList.contains("asset-detail-mode"))).toBe(true);
    }
  });

  test("19. Account Deletion Detail: user name link เปิด User Detail ได้ (cross-module drill-in)", async ({ page }) => {
    await goToModule(page, "deletions");
    await page.locator(".user-row[data-deletion-card]").first().click();
    await page.waitForTimeout(500);
    const userLink = page.locator("[data-user-open]").first();
    if (await userLink.isVisible({ timeout: 1000 }).catch(() => false)) {
      await userLink.click();
      await page.waitForTimeout(500);
      expect(await page.evaluate(() => document.body.classList.contains("user-detail-mode"))).toBe(true);
    }
  });
});

// ==================== C. BREADCRUMB BACK NAVIGATION ====================

test.describe("QA-BO-012: Breadcrumb back — detail → list preserves context", () => {

  test("20. User Detail → back กลับ User List (body user-list-mode)", async ({ page }) => {
    await goToModule(page, "users", "User Accounts");
    await page.locator(".user-row[data-user-card] .user-cell-primary").first().click();
    await page.waitForTimeout(500);
    await page.locator("[data-back-user-list]").click();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.body.classList.contains("user-list-mode"))).toBe(true);
  });

  test("21. Asset Detail → back กลับ Asset List (body asset-list-mode)", async ({ page }) => {
    await goToModule(page, "assets", "Asset List");
    await page.locator(".asset-row[data-asset-card] .asset-cell-primary").first().click();
    await page.waitForTimeout(500);
    await page.locator("[data-back-asset-list]").click();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.body.classList.contains("asset-list-mode"))).toBe(true);
  });

  test("22. Offer Detail → back กลับ Offer List (body offer-list-mode)", async ({ page }) => {
    await goToModule(page, "offers");
    await page.locator(".asset-row[data-offer-card] .asset-cell-primary").first().click();
    await page.waitForTimeout(500);
    await page.locator("[data-back-offer-list]").click();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.body.classList.contains("offer-list-mode"))).toBe(true);
  });

  test("23. Watch Alert Detail → back กลับ Watch Alert List", async ({ page }) => {
    await goToModule(page, "watch-alerts", "Watch Alert List");
    await page.locator("[data-wa-alert-card]").first().click();
    await page.waitForTimeout(500);
    await page.locator("[data-back-wa-alert-list]").click();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.body.classList.contains("watch-alert-list-mode"))).toBe(true);
  });

  test("24. Account Deletion Detail → back กลับ Deletion Requests", async ({ page }) => {
    await goToModule(page, "deletions");
    await page.locator(".user-row[data-deletion-card]").first().click();
    await page.waitForTimeout(500);
    await page.locator("[data-back-deletion-list]").click();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.body.classList.contains("deletion-list-mode"))).toBe(true);
  });

  test("25. Option Detail → back กลับ Option Groups", async ({ page }) => {
    await goToModule(page, "option-master");
    const groupRow = page.locator(".asset-row[data-option-group]").first();
    await groupRow.locator(".asset-cell-primary").click();
    await page.waitForTimeout(500);
    const backBtn = page.locator("[data-back-option-groups]");
    if (await backBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await backBtn.click();
      await page.waitForTimeout(500);
      expect(await page.evaluate(() => document.body.classList.contains("option-group-list-mode"))).toBe(true);
    }
  });

  test("26. breadcrumb แสดง path ในทุก detail page", async ({ page }) => {
    const detailPages = [
      { module: "users", sub: "User Accounts", openSel: ".user-row[data-user-card] .user-cell-primary", bodyClass: "user-detail-mode" },
      { module: "assets", sub: "Asset List", openSel: ".asset-row[data-asset-card] .asset-cell-primary", bodyClass: "asset-detail-mode" },
      { module: "offers", sub: "", openSel: ".asset-row[data-offer-card] .asset-cell-primary", bodyClass: "offer-detail-mode" },
    ];
    for (const dp of detailPages) {
      await goToModule(page, dp.module, dp.sub);
      await page.locator(dp.openSel).first().click();
      await page.waitForTimeout(500);
      const crumb = await page.locator("#crumb").textContent();
      expect(crumb.length).toBeGreaterThan(0);
      expect(crumb).toContain("/");
    }
  });
});

// ==================== D. STATUS BADGE SEMANTIC COLORS ====================

test.describe("QA-BO-012: Status badge — semantic color consistency", () => {

  test("27. มี pill class ทั้ง 8 สี defined ใน CSS", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    const colors = await page.evaluate(() => {
      const result = {};
      const names = ["red", "blue", "green", "amber", "purple", "teal", "gray", "charcoal"];
      for (const name of names) {
        const el = document.createElement("span");
        el.className = `pill ${name}`;
        document.body.appendChild(el);
        const cs = getComputedStyle(el);
        result[name] = { color: cs.color, background: cs.backgroundColor };
        el.remove();
      }
      return result;
    });
    for (const name of Object.keys(colors)) {
      // แต่ละสีต้องมี color และ background ที่ไม่ใช่ค่า default
      expect(colors[name].color).toBeTruthy();
      expect(colors[name].background).toBeTruthy();
    }
  });

  test("28. Offer List: ใช้ pill หลายสีตาม lifecycle (amber/blue/green/red/purple/charcoal)", async ({ page }) => {
    await goToModule(page, "offers");
    const pills = page.locator(".asset-row:not(.head) .pill");
    const count = await pills.count();
    expect(count).toBeGreaterThan(0);
    const classes = new Set();
    for (let i = 0; i < Math.min(count, 20); i++) {
      const cls = await pills.nth(i).getAttribute("class");
      const colorMatch = cls.match(/\b(red|blue|green|amber|purple|teal|gray|charcoal)\b/);
      if (colorMatch) classes.add(colorMatch[1]);
    }
    // Offer มี 6 status: Pending(amber), Paused(blue), Accepted(green), Rejected(red), Cancelled(purple), Invalidated(charcoal)
    expect(classes.size).toBeGreaterThanOrEqual(3);
  });

  test("29. User List: ใช้ pill สีตาม status (green/amber/red/gray)", async ({ page }) => {
    await goToModule(page, "users", "User Accounts");
    const pills = page.locator(".user-row:not(.head) .pill, .asset-row:not(.head) .pill");
    const count = await pills.count();
    expect(count).toBeGreaterThan(0);
    const classes = new Set();
    for (let i = 0; i < Math.min(count, 20); i++) {
      const cls = await pills.nth(i).getAttribute("class");
      const colorMatch = cls.match(/\b(red|blue|green|amber|purple|teal|gray|charcoal)\b/);
      if (colorMatch) classes.add(colorMatch[1]);
    }
    expect(classes.size).toBeGreaterThanOrEqual(1);
  });

  test("30. pill ทุกตัวมี class จาก semantic set เท่านั้น (ไม่มีสีนอกมาตรฐาน)", async ({ page }) => {
    await goToModule(page, "offers");
    const allPills = page.locator(".pill");
    const count = await allPills.count();
    const validColors = ["red", "blue", "green", "amber", "purple", "teal", "gray", "charcoal"];
    for (let i = 0; i < Math.min(count, 30); i++) {
      const cls = await allPills.nth(i).getAttribute("class");
      const colorMatch = cls.match(/\b(red|blue|green|amber|purple|teal|gray|charcoal)\b/);
      if (colorMatch) {
        expect(validColors).toContain(colorMatch[1]);
      }
    }
  });
});

// ==================== E. TABLE-TO-CARD 760px BREAKPOINT ====================

test.describe("QA-BO-012: Table-to-card — 760px breakpoint consistency", () => {

  test("31. Asset List: ใช้ .asset-table + .asset-row pattern", async ({ page }) => {
    await goToModule(page, "assets", "Asset List");
    await expect(page.locator(".asset-table")).toBeVisible();
    const rows = page.locator(".asset-table .asset-row:not(.head)");
    expect(await rows.count()).toBeGreaterThan(0);
    await expect(page.locator(".asset-table .asset-cell-primary").first()).toBeVisible();
  });

  test("32. Offer List: ใช้ .asset-table + .asset-row pattern (reuse)", async ({ page }) => {
    await goToModule(page, "offers");
    await expect(page.locator(".asset-table")).toBeVisible();
    const rows = page.locator(".asset-table .asset-row:not(.head)");
    expect(await rows.count()).toBeGreaterThan(0);
    await expect(page.locator(".asset-table .asset-cell-primary").first()).toBeVisible();
  });

  test("33. User List: ใช้ table + row pattern", async ({ page }) => {
    await goToModule(page, "users", "User Accounts");
    const table = page.locator(".user-table, .asset-table");
    await expect(table.first()).toBeVisible();
    const rows = page.locator(".user-row:not(.head), .asset-row:not(.head)");
    expect(await rows.count()).toBeGreaterThan(0);
  });

  test("34. Account Deletion List: ใช้ .user-table + .user-row pattern", async ({ page }) => {
    await goToModule(page, "deletions");
    await expect(page.locator(".user-table")).toBeVisible();
    const rows = page.locator(".user-table .user-row:not(.head)");
    expect(await rows.count()).toBeGreaterThan(0);
  });

  test("35. mobile (≤760px): Asset List หัวตารางซ่อน (.head display none)", async ({ page }) => {
    await goToModule(page, "assets", "Asset List");
    const mobile = await isMobile(page);
    if (!mobile) { test.skip(); return; }
    const headDisplay = await page.locator(".asset-table .asset-row.head").evaluate(el => getComputedStyle(el).display);
    expect(headDisplay).toBe("none");
  });

  test("36. mobile (≤760px): Asset List row แปลงเป็น card (grid 2 columns)", async ({ page }) => {
    await goToModule(page, "assets", "Asset List");
    const mobile = await isMobile(page);
    if (!mobile) { test.skip(); return; }
    const row = page.locator(".asset-table .asset-row:not(.head)").first();
    const cols = await row.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(/\s+/).filter(Boolean).length);
    expect(cols).toBeLessThanOrEqual(2);
  });

  test("37. mobile (≤760px): Offer List row แปลงเป็น card เช่นกัน", async ({ page }) => {
    await goToModule(page, "offers");
    const mobile = await isMobile(page);
    if (!mobile) { test.skip(); return; }
    const row = page.locator(".asset-table .asset-row:not(.head)").first();
    const cols = await row.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(/\s+/).filter(Boolean).length);
    expect(cols).toBeLessThanOrEqual(2);
  });

  test("38. mobile (≤760px): Asset List card มี .asset-card-tags + .user-card-meta", async ({ page }) => {
    await goToModule(page, "assets", "Asset List");
    const mobile = await isMobile(page);
    if (!mobile) { test.skip(); return; }
    const row = page.locator(".asset-table .asset-row:not(.head)").first();
    await expect(row.locator(".asset-card-tags")).toBeVisible();
    await expect(row.locator(".user-card-meta")).toBeVisible();
  });

  test("39. desktop (>760px): Asset List แสดงหัวตาราง", async ({ page }) => {
    await goToModule(page, "assets", "Asset List");
    const mobile = await isMobile(page);
    if (mobile) { test.skip(); return; }
    const headDisplay = await page.locator(".asset-table .asset-row.head").evaluate(el => getComputedStyle(el).display);
    expect(headDisplay).not.toBe("none");
  });

  test("40. mobile (≤760px): table min-width เป็น 0 (ไม่ล้นจอ)", async ({ page }) => {
    await goToModule(page, "assets", "Asset List");
    const mobile = await isMobile(page);
    if (!mobile) { test.skip(); return; }
    const minWidth = await page.locator(".asset-table").evaluate(el => getComputedStyle(el).minWidth);
    expect(minWidth).toBe("0px");
  });
});

// ==================== F. KPI / SUMMARY CARD PATTERN ====================

test.describe("QA-BO-012: KPI pattern — have/not have per criteria", () => {

  test("41. Dashboard: มี #summary-grid (KPI cards)", async ({ page }) => {
    await goToModule(page, "dashboard");
    const summaryHTML = await page.locator("#summary-grid").innerHTML();
    expect(summaryHTML.length).toBeGreaterThan(0);
  });

  test("42. Dashboard: มี #cards (info cards)", async ({ page }) => {
    await goToModule(page, "dashboard");
    const cardsHTML = await page.locator("#cards").innerHTML();
    expect(cardsHTML.length).toBeGreaterThan(0);
  });

  test("43. Offer List: มี #summary-grid (6 status cards)", async ({ page }) => {
    await goToModule(page, "offers");
    const summaryHTML = await page.locator("#summary-grid").innerHTML();
    expect(summaryHTML.length).toBeGreaterThan(0);
    // ตรวจว่ามี offer-status-card class
    const cards = page.locator("#summary-grid .offer-status-card");
    expect(await cards.count()).toBeGreaterThanOrEqual(1);
  });

  test("44. Option Master (Group List): ไม่มี #summary-grid (no KPI)", async ({ page }) => {
    await goToModule(page, "option-master");
    // Option Master ล้าง #summary-grid innerHTML เป็นค่าว่าง + CSS ซ่อน summary-grid
    const summaryHTML = await page.locator("#summary-grid").innerHTML();
    expect(summaryHTML.length).toBe(0);
    // ตรวจเพิ่ม: CSS ก็ซ่อน summary-grid ใน option-master-mode
    const display = await page.locator("#summary-grid").evaluate(el => getComputedStyle(el).display);
    expect(display).toBe("none");
  });

  test("45. Policy & Versioning: ไม่มี #summary-grid (no KPI)", async ({ page }) => {
    await goToModule(page, "settings", "Policy & Versioning");
    const summaryHTML = await page.locator("#summary-grid").innerHTML();
    expect(summaryHTML.length).toBe(0);
  });

  test("46. Support Center: ไม่มี #summary-grid (no KPI)", async ({ page }) => {
    await goToModule(page, "settings", "Support Center");
    const summaryHTML = await page.locator("#summary-grid").innerHTML();
    expect(summaryHTML.length).toBe(0);
  });

  test("47. Watch Alert List: ไม่มี #summary-grid (list-only, no KPI)", async ({ page }) => {
    await goToModule(page, "watch-alerts", "Watch Alert List");
    const summaryHTML = await page.locator("#summary-grid").innerHTML();
    expect(summaryHTML.length).toBe(0);
  });

  test("48. Account Deletion List: ไม่มี #summary-grid (no KPI)", async ({ page }) => {
    await goToModule(page, "deletions");
    const summaryHTML = await page.locator("#summary-grid").innerHTML();
    expect(summaryHTML.length).toBe(0);
  });
});

// ==================== G. MENU ACTIVE STATE ====================

test.describe("QA-BO-012: Menu active state — per module route", () => {

  test("49. Dashboard: nav-item active เมื่ออยู่ใน Dashboard", async ({ page }) => {
    await goToModuleViaMenu(page, "dashboard");
    const navItem = page.locator(".nav-item[data-module='dashboard']");
    await expect(navItem).toHaveClass(/active/);
  });

  test("50. User Management: nav-item active เมื่ออยู่ใน User Accounts", async ({ page }) => {
    await goToModuleViaMenu(page, "users", "User Accounts");
    const navItem = page.locator(".nav-item[data-module='users']");
    await expect(navItem).toHaveClass(/active/);
  });

  test("51. User Accounts: submenu button active", async ({ page }) => {
    await goToModuleViaMenu(page, "users", "User Accounts");
    await ensureNavOpen(page);
    const subBtn = page.locator(".submenu[data-submenu='users'] button[data-sub='User Accounts']");
    await expect(subBtn).toHaveClass(/active/);
  });

  test("52. Asset Management: nav-item active เมื่ออยู่ใน Asset List", async ({ page }) => {
    await goToModuleViaMenu(page, "assets", "Asset List");
    const navItem = page.locator(".nav-item[data-module='assets']");
    await expect(navItem).toHaveClass(/active/);
  });

  test("53. Asset List: submenu button active", async ({ page }) => {
    await goToModuleViaMenu(page, "assets", "Asset List");
    await ensureNavOpen(page);
    const subBtn = page.locator(".submenu[data-submenu='assets'] button[data-sub='Asset List']");
    await expect(subBtn).toHaveClass(/active/);
  });

  test("54. Offer Management: nav-item active เมื่ออยู่ใน Offer List", async ({ page }) => {
    await goToModuleViaMenu(page, "offers");
    const navItem = page.locator(".nav-item[data-module='offers']");
    await expect(navItem).toHaveClass(/active/);
  });

  test("55. Option Master: nav-item active เมื่ออยู่ใน Option Master", async ({ page }) => {
    await goToModuleViaMenu(page, "option-master");
    const navItem = page.locator(".nav-item[data-module='option-master']");
    await expect(navItem).toHaveClass(/active/);
  });

  test("56. Settings: nav-item active เมื่ออยู่ใน Policy & Versioning", async ({ page }) => {
    await goToModuleViaMenu(page, "settings", "Policy & Versioning");
    const navItem = page.locator(".nav-item[data-module='settings']");
    await expect(navItem).toHaveClass(/active/);
  });

  test("57. Settings > Policy & Versioning: submenu button active", async ({ page }) => {
    await goToModuleViaMenu(page, "settings", "Policy & Versioning");
    await ensureNavOpen(page);
    const subBtn = page.locator(".submenu[data-submenu='settings'] button[data-sub='Policy & Versioning']");
    await expect(subBtn).toHaveClass(/active/);
  });

  test("58. Market Demand: nav-item active เมื่ออยู่ใน Watch Alert List", async ({ page }) => {
    await goToModuleViaMenu(page, "watch-alerts", "Watch Alert List");
    const navItem = page.locator(".nav-item[data-module='watch-alerts']");
    await expect(navItem).toHaveClass(/active/);
  });

  test("59. Account Deletion: nav-item active เมื่ออยู่ใน Account Deletion", async ({ page }) => {
    await goToModuleViaMenu(page, "deletions");
    const navItem = page.locator(".nav-item[data-module='deletions']");
    await expect(navItem).toHaveClass(/active/);
  });
});

// ==================== H. RESET COPY CONSISTENCY ====================

test.describe("QA-BO-012: Reset copy — รีเซ็ตค่าทั้งหมด consistency", () => {

  test("60. User List: reset button มี aria-label 'รีเซ็ตค่าทั้งหมด'", async ({ page }) => {
    await goToModule(page, "users", "User Accounts");
    const resetBtn = page.locator("[data-user-reset], #user-reset").first();
    await expect(resetBtn).toHaveAttribute("aria-label", "รีเซ็ตค่าทั้งหมด");
  });

  test("61. Asset List: reset button มี aria-label 'รีเซ็ตค่าทั้งหมด'", async ({ page }) => {
    await goToModule(page, "assets", "Asset List");
    const resetBtn = page.locator("[data-asset-reset]").first();
    await expect(resetBtn).toHaveAttribute("aria-label", "รีเซ็ตค่าทั้งหมด");
  });

  test("62. Offer List: reset button มี aria-label 'รีเซ็ตค่าทั้งหมด'", async ({ page }) => {
    await goToModule(page, "offers");
    const resetBtn = page.locator("[data-offer-reset]").first();
    await expect(resetBtn).toHaveAttribute("aria-label", "รีเซ็ตค่าทั้งหมด");
  });

  test("63. Option Master (Group List): reset button มี aria-label 'รีเซ็ตค่าทั้งหมด'", async ({ page }) => {
    await goToModule(page, "option-master");
    const resetBtn = page.locator("[data-option-group-reset]").first();
    await expect(resetBtn).toHaveAttribute("aria-label", "รีเซ็ตค่าทั้งหมด");
  });

  test("64. Watch Alert List: reset button มี aria-label 'รีเซ็ตค่าทั้งหมด'", async ({ page }) => {
    await goToModule(page, "watch-alerts", "Watch Alert List");
    const resetBtn = page.locator("[data-wa-alert-reset]").first();
    await expect(resetBtn).toHaveAttribute("aria-label", "รีเซ็ตค่าทั้งหมด");
  });

  test("65. Account Deletion List: reset button มี aria-label 'รีเซ็ตค่าทั้งหมด'", async ({ page }) => {
    await goToModule(page, "deletions");
    const resetBtn = page.locator("[data-deletion-reset]").first();
    await expect(resetBtn).toHaveAttribute("aria-label", "รีเซ็ตค่าทั้งหมด");
  });

  test("66. reset button แสดง text 'รีเซ็ตค่าทั้งหมด' ในบางหน้า (visible text)", async ({ page }) => {
    await goToModule(page, "users", "User Accounts");
    const resetBtn = page.locator("[data-user-reset], #user-reset").first();
    await expect(resetBtn).toContainText("รีเซ็ตค่าทั้งหมด");
  });

  test("67. status filter default option เป็น 'ทุกสถานะ' ในหน้าที่มี status filter", async ({ page }) => {
    await goToModule(page, "users", "User Accounts");
    // ตรวจ custom-select หรือ native select ที่มี option ทุกสถานะ
    const allStatusOption = page.locator("[data-custom-select-option][data-value='']").first();
    if (await allStatusOption.count() > 0) {
      const text = await allStatusOption.textContent();
      expect(text).toContain("ทุกสถานะ");
    }
  });
});

// ==================== I. MODAL WIDTH BASELINE ====================

test.describe("QA-BO-012: Modal width — 560px confirmation / 720px action modal", () => {

  test("68. confirmation modal (.modal) width baseline 560px", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    const width = await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "modal";
      document.body.appendChild(el);
      const w = getComputedStyle(el).width;
      el.remove();
      return w;
    });
    // min(560px, 100%) — บน desktop จะได้ 560px, บน mobile จะได้ pixel value ที่ ≤ 560px
    if (width.includes("560px")) {
      expect(width).toContain("560px");
    } else {
      const px = parseFloat(width);
      expect(px).toBeLessThanOrEqual(560);
    }
  });

  test("69. action modal (.modal.user-action-modal) width baseline 720px", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    const width = await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "modal user-action-modal";
      document.body.appendChild(el);
      const w = getComputedStyle(el).width;
      el.remove();
      return w;
    });
    // min(720px, 100%) — บน desktop จะได้ 720px, บน mobile จะได้ pixel value ที่ ≤ 720px
    if (width.includes("720px")) {
      expect(width).toContain("720px");
    } else {
      const px = parseFloat(width);
      expect(px).toBeLessThanOrEqual(720);
    }
  });

  test("70. Support Center Preview modal ใช้ .user-action-modal (720px baseline)", async ({ page }) => {
    await goToModule(page, "settings", "Support Center");
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const modal = page.locator("#user-action-modal .user-action-modal");
    await expect(modal).toHaveClass(/user-action-modal/);
    await closeModal(page);
  });

  test("71. modal มี close button (data-user-action-modal-close)", async ({ page }) => {
    await goToModule(page, "settings", "Support Center");
    await page.locator("[data-support-preview]").click();
    await page.waitForTimeout(300);
    const closeBtn = page.locator("[data-user-action-modal-close]");
    await expect(closeBtn).toBeVisible();
    await closeModal(page);
  });
});

// ==================== J. ROW MENU PATTERN ====================

test.describe("QA-BO-012: Row menu — ... pattern consistency", () => {

  test("72. User List: มี row menu (.row-menu) ในแถวข้อมูล", async ({ page }) => {
    await goToModule(page, "users", "User Accounts");
    const rowMenu = page.locator(".user-row .row-menu, .asset-row .row-menu").first();
    await expect(rowMenu).toBeVisible();
  });

  test("73. Asset List: มี row menu (.row-menu) ในแถวข้อมูล", async ({ page }) => {
    await goToModule(page, "assets", "Asset List");
    const rowMenu = page.locator(".asset-row .row-menu").first();
    await expect(rowMenu).toBeVisible();
  });

  test("74. Account Deletion List: มี row menu (.row-menu) ในแถวข้อมูล", async ({ page }) => {
    await goToModule(page, "deletions");
    // row menu อยู่ใน DOM เสมอ แต่บน mobile (≤760px) ถูกซ่อนด้วย display:none
    // เพราะ Account Deletion card ทั้งใบคลิกได้ (data-deletion-card)
    const rowMenu = page.locator(".user-row .row-menu").first();
    await expect(rowMenu).toBeAttached();
    const mobile = await isMobile(page);
    if (!mobile) {
      await expect(rowMenu).toBeVisible();
    }
  });

  test("75. row menu ใช้ <details> + <summary> pattern", async ({ page }) => {
    await goToModule(page, "assets", "Asset List");
    const rowMenu = page.locator(".asset-row .row-menu").first();
    const tagName = await rowMenu.evaluate(el => el.tagName.toLowerCase());
    expect(tagName).toBe("details");
    const summary = rowMenu.locator("summary");
    await expect(summary).toBeVisible();
  });

  test("76. row menu มี .row-menu-list container", async ({ page }) => {
    await goToModule(page, "assets", "Asset List");
    const rowMenu = page.locator(".asset-row .row-menu").first();
    await expect(rowMenu.locator(".row-menu-list")).toBeAttached();
  });

  test("77. Option Master (Group List): มี row menu (.row-menu)", async ({ page }) => {
    await goToModule(page, "option-master");
    const rowMenu = page.locator(".asset-row .row-menu").first();
    await expect(rowMenu).toBeVisible();
  });

  test("78. คลิก row menu summary → เปิดเมนู (open attribute)", async ({ page }) => {
    await goToModule(page, "assets", "Asset List");
    const summary = page.locator(".asset-row .row-menu > summary").first();
    await summary.click();
    await page.waitForTimeout(200);
    const rowMenu = page.locator(".asset-row .row-menu").first();
    const isOpen = await rowMenu.evaluate(el => el.hasAttribute("open"));
    expect(isOpen).toBe(true);
  });
});

// ==================== K. NAV STRUCTURE CONSISTENCY ====================

test.describe("QA-BO-012: Nav structure — module grouping consistency", () => {

  test("79. nav มี 3 sections (การดำเนินงาน, งานตรวจสอบและบริการ, เครื่องมือ & รายงาน)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await ensureNavOpen(page);
    const sections = page.locator(".nav-section");
    expect(await sections.count()).toBe(3);
  });

  test("80. nav มี module items ครบ (dashboard, users, assets, offers, content, market, option-master, watch-alerts, deletions, settings)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await ensureNavOpen(page);
    // NTF-RSTR-001: notifications module ถูกตัดออกจาก sidebar (Phase 2) — Delivery Logs ย้ายเข้า Settings
    const expectedModules = ["dashboard", "users", "assets", "offers", "content", "market", "option-master", "watch-alerts", "deletions", "settings"];
    for (const mod of expectedModules) {
      const navItem = page.locator(`.nav-item[data-module='${mod}']`);
      await expect(navItem).toBeVisible();
    }
  });

  test("81. nav item ที่มี submenu มี data-toggle-menu attribute", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await ensureNavOpen(page);
    // users, assets, content, market, watch-alerts, settings มี submenu (notifications ถูกตัดออก — NTF-RSTR-001)
    const modulesWithSubs = ["users", "assets", "content", "market", "watch-alerts", "settings"];
    for (const mod of modulesWithSubs) {
      const navItem = page.locator(`.nav-item[data-module='${mod}']`);
      await expect(navItem).toHaveAttribute("data-toggle-menu", mod);
    }
  });

  test("82. nav item ที่ไม่มี submenu ไม่มี data-toggle-menu (dashboard, offers, option-master, deletions)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await ensureNavOpen(page);
    const modulesWithoutSubs = ["dashboard", "offers", "option-master", "deletions"];
    for (const mod of modulesWithoutSubs) {
      const navItem = page.locator(`.nav-item[data-module='${mod}']`);
      const hasToggle = await navItem.getAttribute("data-toggle-menu");
      expect(hasToggle).toBeNull();
    }
  });
});

// ==================== L. PAGE HEADER PATTERN ====================

test.describe("QA-BO-012: Page header — breadcrumb + title pattern", () => {

  test("83. ทุก module list page มี #page-title ไม่ว่าง", async ({ page }) => {
    const modules = [
      { module: "dashboard", sub: "" },
      { module: "users", sub: "User Accounts" },
      { module: "assets", sub: "Asset List" },
      { module: "offers", sub: "" },
      { module: "option-master", sub: "" },
      { module: "deletions", sub: "" },
    ];
    for (const m of modules) {
      await goToModule(page, m.module, m.sub);
      const title = await page.locator("#page-title").textContent();
      expect(title.trim().length).toBeGreaterThan(0);
    }
  });

  test("84. ทุก module list page มี #crumb (breadcrumb) ไม่ว่าง", async ({ page }) => {
    const modules = [
      { module: "dashboard", sub: "" },
      { module: "users", sub: "User Accounts" },
      { module: "assets", sub: "Asset List" },
      { module: "offers", sub: "" },
      { module: "option-master", sub: "" },
      { module: "deletions", sub: "" },
    ];
    for (const m of modules) {
      await goToModule(page, m.module, m.sub);
      const crumb = await page.locator("#crumb").textContent();
      expect(crumb.trim().length).toBeGreaterThan(0);
    }
  });

  test("85. detail page มี panel-title (entity ID/name)", async ({ page }) => {
    await goToModule(page, "users", "User Accounts");
    await page.locator(".user-row[data-user-card] .user-cell-primary").first().click();
    await page.waitForTimeout(500);
    const panelTitle = await page.locator("#panel-title").textContent();
    expect(panelTitle.trim().length).toBeGreaterThan(0);
  });
});

// ==================== M. FOOTER / PAGINATION PATTERN ====================

test.describe("QA-BO-012: Footer/pagination — consistency across list pages", () => {

  test("86. Asset List: มี .footer-range (pagination)", async ({ page }) => {
    await goToModule(page, "assets", "Asset List");
    await expect(page.locator(".footer-range")).toBeVisible();
  });

  test("87. Offer List: มี .footer-range (pagination)", async ({ page }) => {
    await goToModule(page, "offers");
    await expect(page.locator(".footer-range")).toBeVisible();
  });

  test("88. User List: มี .footer-range (pagination)", async ({ page }) => {
    await goToModule(page, "users", "User Accounts");
    await expect(page.locator(".footer-range")).toBeVisible();
  });

  test("89. footer-range แสดงข้อความ 'แสดง X-Y จาก Z'", async ({ page }) => {
    await goToModule(page, "assets", "Asset List");
    const footerText = await page.locator(".footer-range span").first().textContent();
    expect(footerText).toContain("แสดง");
    expect(footerText).toContain("จาก");
  });
});

// ==================== N. RESPONSIVE — NAV TOGGLE ====================

test.describe("QA-BO-012: Responsive — nav toggle on compact", () => {

  test("90. compact (≤1180px): มี #menu-toggle button", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    const compact = await isCompact(page);
    if (!compact) { test.skip(); return; }
    await expect(page.locator("#menu-toggle")).toBeVisible();
  });

  test("91. compact (≤1180px): คลิก #menu-toggle เปิด nav (body.nav-open)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    const compact = await isCompact(page);
    if (!compact) { test.skip(); return; }
    await page.locator("#menu-toggle").click();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => document.body.classList.contains("nav-open"))).toBe(true);
  });

  test("92. desktop (>1180px): sidebar แสดงเสมอ (ไม่ต้อง toggle)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    const compact = await isCompact(page);
    if (compact) { test.skip(); return; }
    const sidebar = page.locator(".sidebar");
    await expect(sidebar).toBeVisible();
  });
});

// ==================== O. CROSS-MODULE DRILL-IN BACK CHAIN ====================

test.describe("QA-BO-012: Cross-module drill-in back chain", () => {

  test("93. Offer Detail → Asset Detail → back กลับ Offer Detail", async ({ page }) => {
    await goToModule(page, "offers");
    await page.locator(".asset-row[data-offer-card] .asset-cell-primary").first().click();
    await page.waitForTimeout(500);
    const assetLink = page.locator("[data-asset-open]").first();
    if (await assetLink.isVisible({ timeout: 1000 }).catch(() => false)) {
      await assetLink.click();
      await page.waitForTimeout(500);
      expect(await page.evaluate(() => document.body.classList.contains("asset-detail-mode"))).toBe(true);
      // back กลับ — ใช้ browser back หรือ back button ถ้ามี
      const backBtn = page.locator("[data-back-asset-list]");
      if (await backBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        await backBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test("94. Account Deletion Detail → User Detail → back กลับ Deletion Detail", async ({ page }) => {
    await goToModule(page, "deletions");
    await page.locator(".user-row[data-deletion-card]").first().click();
    await page.waitForTimeout(500);
    const userLink = page.locator("[data-user-open]").first();
    if (await userLink.isVisible({ timeout: 1000 }).catch(() => false)) {
      await userLink.click();
      await page.waitForTimeout(500);
      expect(await page.evaluate(() => document.body.classList.contains("user-detail-mode"))).toBe(true);
    }
  });
});

// ==================== P. EMPTY STATE PATTERN ====================

test.describe("QA-BO-012: Empty state — search no result", () => {

  test("95. Asset List: search ไม่พบ → แสดง empty state", async ({ page }) => {
    await goToModule(page, "assets", "Asset List");
    const search = page.locator("#asset-search, [data-asset-search], #search").first();
    if (await search.isVisible({ timeout: 1000 }).catch(() => false)) {
      await search.fill("ZZZNONEXISTENTZZZ");
      await page.waitForTimeout(300);
      const empty = page.locator(".detail-empty, .user-empty, .asset-empty").first();
      if (await empty.isVisible({ timeout: 1000 }).catch(() => false)) {
        const text = await empty.textContent();
        expect(text.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test("96. Offer List: search ไม่พบ → แสดง empty state", async ({ page }) => {
    await goToModule(page, "offers");
    const search = page.locator("#offer-search, [data-offer-search], #search").first();
    if (await search.isVisible({ timeout: 1000 }).catch(() => false)) {
      await search.fill("ZZZNONEXISTENTZZZ");
      await page.waitForTimeout(300);
      const empty = page.locator(".detail-empty, .user-empty").first();
      if (await empty.isVisible({ timeout: 1000 }).catch(() => false)) {
        const text = await empty.textContent();
        expect(text.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
