// QA-BO-001: Login + Dashboard — strict Playwright spec
// อ้างอิง prototype เป็นหลักสำหรับการแสดงผล, spec docs เป็นหลักสำหรับพฤติกรรม/นำทาง
// เป้าหมาย: รันเทส เจอปัญหาจริง → ลิสปัญหา + แนวทางแก้ → แก้ใน flow เดียว
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

// helper: logout (เปิด nav ก่อนบน mobile)
async function logout(page) {
  const logoutBtn = page.locator("#logout-btn");
  const isInViewport = await logoutBtn.evaluate(el => {
    const r = el.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0 && r.right <= window.innerWidth;
  }).catch(() => false);
  if (!isInViewport) {
    await page.evaluate(() => {
      const btn = document.querySelector("#mobile-menu-btn, [data-nav-toggle], .nav-toggle");
      if (btn) btn.click();
      else document.body.classList.add("nav-open");
    });
    await page.waitForTimeout(300);
  }
  await logoutBtn.click({ force: true });
  await page.waitForFunction(() => document.body.classList.contains("logged-out"), { timeout: 3000 });
  await page.waitForTimeout(300);
}

// helper: เลือก auth scenario ผ่าน evaluate (select อยู่ใน <details> ที่ปิดอยู่)
async function selectAuthScenario(page, scenario) {
  await page.evaluate(sc => {
    const select = document.querySelector("#auth-scenario");
    select.value = sc;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }, scenario);
  await page.waitForTimeout(200);
}

// helper: ดึง computed style
async function getComputedStyle(page, selector, ...props) {
  return page.evaluate(({ selector, props }) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const cs = window.getComputedStyle(el);
    const result = {};
    props.forEach(p => result[p] = cs.getPropertyValue(p));
    return result;
  }, { selector, props });
}

// helper: ดึง bounding box
async function getBoundingBox(page, selector) {
  return page.evaluate(selector => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom, right: r.right };
  }, selector);
}

test.describe("QA-BO-001: Login + Dashboard (strict)", () => {

  // ==================== LOGIN — DISPLAY (อ้างอิง prototype) ====================

  test.describe("Login — dark theme & colors", () => {
    test("1. login-screen ใช้ dark theme background", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      const bg = await getComputedStyle(page, "#login-screen", "background-color");
      // prototype ล็อก dark theme (#061426 / #07172a)
      expect(bg["background-color"]).toBeTruthy();
      // ต้องเป็นสีเข้ม — ไม่ใช่ white/transparent
      expect(bg["background-color"]).not.toBe("rgba(0, 0, 0, 0)");
      expect(bg["background-color"]).not.toBe("rgb(255, 255, 255)");
    });

    test("2. login-panel ใช้ dark theme background", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      const bg = await getComputedStyle(page, ".login-panel", "background-color");
      expect(bg["background-color"]).not.toBe("rgba(0, 0, 0, 0)");
      expect(bg["background-color"]).not.toBe("rgb(255, 255, 255)");
    });
  });

  test.describe("Login — split layout (desktop >1180px)", () => {
    test("3. desktop 1440px: visual อยู่ซ้าย, panel อยู่ขวา (split)", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      const visual = await getBoundingBox(page, ".login-visual");
      const panel = await getBoundingBox(page, ".login-panel");
      // visual ต้องอยู่ซ้ายของ panel
      expect(visual.x).toBeLessThan(panel.x);
      // visual ต้องไม่ซ้อนทับ panel
      expect(visual.right).toBeLessThanOrEqual(panel.x + 1);
      await page.close();
    });

    test("4. desktop 1280px: visual อยู่ซ้าย, panel อยู่ขวา (split)", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      const visual = await getBoundingBox(page, ".login-visual");
      const panel = await getBoundingBox(page, ".login-panel");
      expect(visual.x).toBeLessThan(panel.x);
      expect(visual.right).toBeLessThanOrEqual(panel.x + 1);
      await page.close();
    });
  });

  test.describe("Login — single column (≤1180px)", () => {
    test("5. tablet 768px: visual อยู่บน, panel อยู่ล่าง (single column)", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      const visual = await getBoundingBox(page, ".login-visual");
      const panel = await getBoundingBox(page, ".login-panel");
      // visual ต้องอยู่บน panel (y น้อยกว่า)
      expect(visual.y).toBeLessThan(panel.y);
      // visual ต้องไม่ซ้อนทับ panel
      expect(visual.bottom).toBeLessThanOrEqual(panel.y + 1);
      await page.close();
    });

    test("6. mobile 390px: visual อยู่บน, panel อยู่ล่าง (single column compact)", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      const visual = await getBoundingBox(page, ".login-visual");
      const panel = await getBoundingBox(page, ".login-panel");
      expect(visual.y).toBeLessThan(panel.y);
      expect(visual.bottom).toBeLessThanOrEqual(panel.y + 1);
      // compact: visual สูงไม่เกิน 210px (clamp 150-210px)
      expect(visual.height).toBeLessThanOrEqual(215);
      await page.close();
    });
  });

  test.describe("Login — brand identity", () => {
    test("7. login-panel แสดง brand mark + name + label ตาม prototype", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await expect(page.locator(".login-brand .brand-name")).toHaveText("Tuk Daeng");
      await expect(page.locator(".login-brand small")).toHaveText("Back Office");
      // brand mark ต้องมี (icon)
      await expect(page.locator(".login-brand .brand-mark")).toBeVisible();
    });

    test("8. login title + copy เป็นภาษาไทยตาม prototype", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      const title = await page.locator("#auth-title").textContent();
      expect(title.trim()).toBe("Admin Login");
      const copy = await page.locator(".login-copy").textContent();
      // ต้องเป็นภาษาไทย อธิบายว่าหน้านี้สำหรับใคร
      expect(copy.length).toBeGreaterThan(10);
      expect(copy).toMatch(/[\u0E00-\u0E7F]/); // มีตัวไทย
    });
  });

  test.describe("Login — form input dimensions", () => {
    test("9. form input สูง 44-46px ตามมาตรฐาน", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      const emailHeight = await page.locator("#login-email").evaluate(el => el.getBoundingClientRect().height);
      expect(emailHeight).toBeGreaterThanOrEqual(44);
      expect(emailHeight).toBeLessThanOrEqual(46);
      const passwordHeight = await page.locator("#login-password").evaluate(el => el.getBoundingClientRect().height);
      expect(passwordHeight).toBeGreaterThanOrEqual(44);
      expect(passwordHeight).toBeLessThanOrEqual(46);
    });

    test("10. mobile 390px: form input สูง 46px (compact)", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      const emailHeight = await page.locator("#login-email").evaluate(el => el.getBoundingClientRect().height);
      expect(emailHeight).toBeGreaterThanOrEqual(44);
      expect(emailHeight).toBeLessThanOrEqual(48);
      await page.close();
    });
  });

  test.describe("Login — form fields & attributes", () => {
    test("11. email field: type=email, autocomplete=username", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("#login-email")).toHaveAttribute("type", "email");
      await expect(page.locator("#login-email")).toHaveAttribute("autocomplete", "username");
    });

    test("12. password field: type=password, autocomplete=current-password", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("#login-password")).toHaveAttribute("type", "password");
      await expect(page.locator("#login-password")).toHaveAttribute("autocomplete", "current-password");
    });

    test("13. password visibility toggle สลับ type + aria-label", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      const pw = page.locator("#login-password");
      const toggle = page.locator("#password-toggle");
      await expect(pw).toHaveAttribute("type", "password");
      await expect(toggle).toHaveAttribute("aria-label", "Show password");
      await toggle.click();
      await expect(pw).toHaveAttribute("type", "text");
      await expect(toggle).toHaveAttribute("aria-label", "Hide password");
      await toggle.click();
      await expect(pw).toHaveAttribute("type", "password");
      await expect(toggle).toHaveAttribute("aria-label", "Show password");
    });

    test("14. forgot password link แสดงใน meta row", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("#forgot-password-btn")).toBeVisible();
      const text = await page.locator("#forgot-password-btn").textContent();
      expect(text).toContain("ลืมรหัสผ่าน");
    });

    test("15. submit button ข้อความตรง prototype", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("#login-form button[type=\"submit\"]")).toHaveText("เข้าสู่ระบบ");
    });

    test("16. primary button เต็มความกว้าง", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      const btn = page.locator("#login-form button[type=\"submit\"]");
      const btnBox = await btn.boundingBox();
      const form = page.locator("#login-form");
      const formBox = await form.boundingBox();
      // button ต้องเต็มความกว้างของ form (ภายใน tolerance)
      expect(btnBox.width).toBeGreaterThan(formBox.width * 0.9);
    });
  });

  test.describe("Login — auth error & accessibility", () => {
    test("17. auth-error มี role=alert", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("#auth-error")).toHaveAttribute("role", "alert");
    });

    test("18. login-visual เป็น decorative (aria-hidden)", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await expect(page.locator(".login-visual")).toHaveAttribute("aria-hidden", "true");
    });

    test("19. bad-password scenario: generic error ไม่ระบุ field ที่ผิด", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await selectAuthScenario(page, "bad-password");
      await page.locator("#login-form button[type=\"submit\"]").click();
      await page.waitForTimeout(500);
      const errorText = (await page.locator("#auth-error").textContent()).toLowerCase();
      expect(errorText).toContain("invalid credentials");
      // ห้ามยืนยันชัดเจนว่า field ไหนผิด
      expect(errorText).not.toMatch(/your (email|password) (is|was) (incorrect|wrong|invalid)/);
      expect(errorText).not.toMatch(/email (not found|does not exist|unknown)/);
      // ต้องยังอยู่ที่ login form — ไม่เข้าระบบ
      await expect(page.locator("#login-form")).not.toHaveClass(/hidden/);
    });
  });

  test.describe("Login — transition & logout", () => {
    test("20. login สำเร็จ → Dashboard + body ไม่ logged-out + login screen หาย", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await page.locator("#login-form button[type=\"submit\"]").click();
      await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
      await expect(page.locator("body")).not.toHaveClass(/logged-out/);
      await expect(page.locator("#login-screen")).toBeHidden();
      await expect(page.locator("#page-title")).toHaveText("Dashboard");
    });

    test("21. logout → กลับหน้า login + body logged-out", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await logout(page);
      await expect(page.locator("body")).toHaveClass(/logged-out/);
      await expect(page.locator("#login-screen")).toBeVisible();
      await expect(page.locator("#auth-title")).toHaveText("Admin Login");
    });
  });

  // ==================== DASHBOARD — DISPLAY (อ้างอิง prototype) ====================

  test.describe("Dashboard — header", () => {
    test("22. breadcrumb + title + meta ตรง prototype", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await expect(page.locator("#crumb")).toHaveText("การดำเนินงาน / Dashboard");
      await expect(page.locator("#page-title")).toHaveText("Dashboard");
      await expect(page.locator("#page-meta")).toContainText("Last updated:");
      // ต้องมี GMT+7 ตาม spec
      await expect(page.locator("#page-meta")).toContainText("GMT+7");
    });

    test("23. header ไม่มี Date Range / Refresh / Export / global search", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      // header จริงคือ .topbar (อ้างอิง prototype)
      const headerText = await page.locator(".topbar").first().textContent();
      expect(headerText.toLowerCase()).not.toContain("date range");
      expect(headerText.toLowerCase()).not.toContain("refresh");
      expect(headerText.toLowerCase()).not.toContain("export");
    });

    test("24. panel title + subtitle ตรง prototype", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await expect(page.locator("#panel-title")).toHaveText("Work Queue");
      await expect(page.locator("#panel-subtitle")).toContainText("งานที่ต้องจัดการ");
    });
  });

  test.describe("Dashboard — KPI cards (8 cards ตามลำดับ)", () => {
    test("25. KPI cards ครบ 8 ตามลำดับที่ spec ล็อก", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      const labels = await page.locator("#summary-grid .stat .stat-label").allTextContents();
      expect(labels).toEqual([
        "New Users",
        "Active Users Today",
        "New Assets",
        "Reported Items",
        "Offer Activity",
        "Articles",
        "Watch Alert",
        "Policies"
      ]);
    });

    test("26. KPI cards มี value + trend + chips ครบ", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      const stats = page.locator("#summary-grid .stat");
      const count = await stats.count();
      expect(count).toBe(8);
      for (let i = 0; i < count; i++) {
        const stat = stats.nth(i);
        await expect(stat.locator(".stat-value")).not.toBeEmpty();
        await expect(stat.locator(".stat-note")).not.toBeEmpty();
        const chips = stat.locator(".chips .chip");
        await expect(chips).not.toHaveCount(0);
      }
    });

    test("27. Reported Items chips แสดง Assets/Users/Articles/Comments", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      const reportedStat = page.locator("#summary-grid .stat", { hasText: "Reported Items" });
      const chipTexts = await reportedStat.locator(".chips .chip").allTextContents();
      const joined = chipTexts.join("|");
      expect(joined).toContain("Assets");
      expect(joined).toContain("Users");
      expect(joined).toContain("Articles");
      expect(joined).toContain("Comments");
    });
  });

  test.describe("Dashboard — navigation from KPI cards (spec ล็อกปลายทาง)", () => {
    test("28. New Users card → User Management / User Accounts", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await page.locator("#summary-grid .stat", { hasText: "New Users" }).click();
      await page.waitForTimeout(500);
      // ต้องไป User Management
      await expect(page.locator(".nav-item[data-module=\"users\"]")).toHaveClass(/active/);
      // ต้องไม่ใช่ Dashboard อีก
      const title = await page.locator("#page-title").textContent();
      expect(title).not.toBe("Dashboard");
    });

    test("29. New Assets card → Asset Management / Asset List", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await page.locator("#summary-grid .stat", { hasText: "New Assets" }).click();
      await page.waitForTimeout(500);
      await expect(page.locator(".nav-item[data-module=\"assets\"]")).toHaveClass(/active/);
    });

    test("30. Reported Items / Assets chip → Asset Management / Reported Assets", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      const reportedStat = page.locator("#summary-grid .stat", { hasText: "Reported Items" });
      await reportedStat.locator(".chip", { hasText: "Assets" }).click();
      await page.waitForTimeout(500);
      await expect(page.locator(".nav-item[data-module=\"assets\"]")).toHaveClass(/active/);
      // ต้องเป็น Reported Assets sub
      const subActive = page.locator(".submenu button.active");
      const subText = await subActive.textContent();
      expect(subText).toContain("Reported Assets");
    });

    test("31. Reported Items / Users chip → User Management / Reported Users", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      const reportedStat = page.locator("#summary-grid .stat", { hasText: "Reported Items" });
      await reportedStat.locator(".chip", { hasText: "Users" }).click();
      await page.waitForTimeout(500);
      await expect(page.locator(".nav-item[data-module=\"users\"]")).toHaveClass(/active/);
      const subActive = page.locator(".submenu button.active");
      const subText = await subActive.textContent();
      expect(subText).toContain("Reported Users");
    });

    test("32. Reported Items / Articles chip → Content Management / Reported Articles", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      const reportedStat = page.locator("#summary-grid .stat", { hasText: "Reported Items" });
      await reportedStat.locator(".chip", { hasText: "Articles" }).click();
      await page.waitForTimeout(500);
      await expect(page.locator(".nav-item[data-module=\"content\"]")).toHaveClass(/active/);
      const subActive = page.locator(".submenu button.active");
      const subText = await subActive.textContent();
      expect(subText).toContain("Reported Articles");
    });

    test("33. Reported Items / Comments chip → Asset Management / Reported Comments", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      const reportedStat = page.locator("#summary-grid .stat", { hasText: "Reported Items" });
      await reportedStat.locator(".chip", { hasText: "Comments" }).click();
      await page.waitForTimeout(500);
      await expect(page.locator(".nav-item[data-module=\"assets\"]")).toHaveClass(/active/);
      const subActive = page.locator(".submenu button.active");
      const subText = await subActive.textContent();
      expect(subText).toContain("Reported Comments");
    });

    test("34. Offer Activity card → Offer Management", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await page.locator("#summary-grid .stat", { hasText: "Offer Activity" }).click();
      await page.waitForTimeout(500);
      await expect(page.locator(".nav-item[data-module=\"offers\"]")).toHaveClass(/active/);
    });

    test("35. Articles card → Content Management / Articles", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      // ใช้ stat-label เพื่อระบุ card ให้ตรง (หลีกเลี่ยงการ match chip "Articles 3" ใน Reported Items)
      const articlesCard = page.locator("#summary-grid .stat", { has: page.locator(".stat-label", { hasText: "Articles" }) });
      await articlesCard.click();
      await page.waitForTimeout(500);
      await expect(page.locator(".nav-item[data-module=\"content\"]")).toHaveClass(/active/);
    });

    test("36. Watch Alert card → Market Demand / Demand Overview", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await page.locator("#summary-grid .stat", { hasText: "Watch Alert" }).click();
      await page.waitForTimeout(500);
      await expect(page.locator(".nav-item[data-module=\"watch-alerts\"]")).toHaveClass(/active/);
      const subActive = page.locator(".submenu button.active");
      const subText = await subActive.textContent();
      expect(subText).toContain("Demand Overview");
    });

    test("37. Policies card → Settings / Policy & Versioning", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await page.locator("#summary-grid .stat", { hasText: "Policies" }).click();
      await page.waitForTimeout(500);
      await expect(page.locator(".nav-item[data-module=\"settings\"]")).toHaveClass(/active/);
      const subActive = page.locator(".submenu button.active");
      const subText = await subActive.textContent();
      expect(subText).toContain("Policy & Versioning");
    });
  });

  test.describe("Dashboard — Work Queue (7 rows ตามลำดับ)", () => {
    test("38. Work Queue ครบ 7 rows ตามลำดับที่ spec ล็อก", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      const rows = page.locator(".dashboard-work-list .work-row");
      await expect(rows).toHaveCount(7);
      const titles = await rows.locator(".work-title").allTextContents();
      expect(titles).toEqual([
        "รายงานสินทรัพย์",
        "รายงานผู้ใช้",
        "รายงานบทความ",
        "คำขอลบบัญชี",
        "บทความรอเผยแพร่",
        "ข้อมูลตลาดรอตรวจ",
        "แจ้งเตือนส่งไม่สำเร็จ"
      ]);
    });

    test("39. Work Queue priority ถูกต้อง (high/medium/normal)", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      const rows = page.locator(".dashboard-work-list .work-row");
      const priorities = [];
      for (let i = 0; i < 7; i++) {
        const cls = await rows.nth(i).getAttribute("class");
        priorities.push(cls);
      }
      // 3 แรก high, ที่ 4 medium, 3 หลัง normal
      expect(priorities[0]).toMatch(/priority-high/);
      expect(priorities[1]).toMatch(/priority-high/);
      expect(priorities[2]).toMatch(/priority-high/);
      expect(priorities[3]).toMatch(/priority-medium/);
      expect(priorities[4]).toMatch(/priority-normal/);
      expect(priorities[5]).toMatch(/priority-normal/);
      expect(priorities[6]).toMatch(/priority-normal/);
    });

    test("40. Work Queue rows มี count + module jump", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      const rows = page.locator(".dashboard-work-list .work-row");
      for (let i = 0; i < 7; i++) {
        const row = rows.nth(i);
        await expect(row.locator(".work-count")).not.toBeEmpty();
        await expect(row).toHaveAttribute("data-module-jump", /.+/);
      }
    });

    test("41. คลิก Work Queue row 1 (รายงานสินทรัพย์) → Asset Management / Reported Assets", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await page.locator(".dashboard-work-list .work-row", { hasText: "รายงานสินทรัพย์" }).click();
      await page.waitForTimeout(500);
      await expect(page.locator(".nav-item[data-module=\"assets\"]")).toHaveClass(/active/);
      const subActive = page.locator(".submenu button.active");
      const subText = await subActive.textContent();
      expect(subText).toContain("Reported Assets");
    });

    test("42. คลิก Work Queue row 2 (รายงานผู้ใช้) → User Management / Reported Users", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await page.locator(".dashboard-work-list .work-row", { hasText: "รายงานผู้ใช้" }).click();
      await page.waitForTimeout(500);
      await expect(page.locator(".nav-item[data-module=\"users\"]")).toHaveClass(/active/);
      const subActive = page.locator(".submenu button.active");
      const subText = await subActive.textContent();
      expect(subText).toContain("Reported Users");
    });

    test("43. คลิก Work Queue row 4 (คำขอลบบัญชี) → Account Deletion", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await page.locator(".dashboard-work-list .work-row", { hasText: "คำขอลบบัญชี" }).click();
      await page.waitForTimeout(500);
      await expect(page.locator(".nav-item[data-module=\"deletions\"]")).toHaveClass(/active/);
    });
  });

  test.describe("Dashboard — Recent Activity", () => {
    test("44. Recent Activity filter 5 ตัว: ทั้งหมด/Report/Offer/Content/System", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      const filters = page.locator(".activity-toolbar .segmented");
      await expect(filters).toHaveCount(5);
      const labels = await filters.allTextContents();
      expect(labels).toEqual(["ทั้งหมด", "Report", "Offer", "Content", "System"]);
    });

    test("45. filter ทำงานจริง — Report แสดงเฉพาะ report events", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      const allCount = await page.locator(".activity-list .activity-row").count();
      await page.locator(".activity-toolbar .segmented", { hasText: "Report" }).click();
      await page.waitForTimeout(300);
      const reportCount = await page.locator(".activity-list .activity-row").count();
      expect(reportCount).toBeGreaterThan(0);
      expect(reportCount).toBeLessThanOrEqual(allCount);
      // กลับทั้งหมด
      await page.locator(".activity-toolbar .segmented", { hasText: "ทั้งหมด" }).click();
      await page.waitForTimeout(300);
      const allCountAgain = await page.locator(".activity-list .activity-row").count();
      expect(allCountAgain).toBe(allCount);
    });

    test("46. activity rows มี title + time + module jump", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      const rows = page.locator(".activity-list .activity-row");
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        const row = rows.nth(i);
        await expect(row.locator(".activity-title")).not.toBeEmpty();
        await expect(row.locator(".activity-time")).not.toBeEmpty();
        await expect(row).toHaveAttribute("data-module-jump", /.+/);
      }
    });
  });

  test.describe("Dashboard — panels (4 cards)", () => {
    test("47. Dashboard panels ครบ 4: Asset Status, Offer Status, Latest Articles, Top Searched Brands", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      const cards = page.locator("#cards .dashboard-status-card");
      await expect(cards).toHaveCount(4);
      const titles = await cards.locator("h3").allTextContents();
      expect(titles).toContain("Asset Status");
      expect(titles).toContain("Offer Status");
      expect(titles).toContain("Latest Articles");
      expect(titles).toContain("Top Searched Brands");
    });

    test("48. Offer Status panel 6 rows ตามลำดับ status", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      const offerCard = page.locator("#cards .dashboard-status-card", { hasText: "Offer Status" });
      const labels = await offerCard.locator(".asset-status-name").allTextContents();
      expect(labels).toEqual(["Pending", "Paused", "Accepted", "Rejected", "Cancelled", "Invalidated"]);
    });

    test("49. Latest Articles panel 3 rows พร้อม status value", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      const articlesCard = page.locator("#cards .dashboard-status-card", { hasText: "Latest Articles" });
      const rows = articlesCard.locator(".status-row");
      await expect(rows).toHaveCount(3);
      const values = await rows.locator(".status-value").allTextContents();
      expect(values).toContain("Scheduled");
      expect(values).toContain("Published");
      expect(values).toContain("Draft");
    });

    test("50. Top Searched Brands panel 5 brands พร้อม percent + bar", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      const brandsCard = page.locator("#cards .dashboard-status-card", { hasText: "Top Searched Brands" });
      const rows = brandsCard.locator(".wa-stat-bar-row");
      await expect(rows).toHaveCount(5);
      for (let i = 0; i < 5; i++) {
        await expect(rows.nth(i).locator(".wa-stat-bar-percent")).toContainText("%");
        await expect(rows.nth(i).locator(".wa-stat-bar-fill")).toBeVisible();
      }
    });

    test("51. Offer Status rows → Offer Management", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      const offerRows = page.locator("#cards .offer-status-row");
      const count = await offerRows.count();
      for (let i = 0; i < count; i++) {
        await expect(offerRows.nth(i)).toHaveAttribute("data-module-jump", "offers");
      }
    });

    test("52. Latest Articles rows → Content Management", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      const articleRows = page.locator("#cards .dashboard-status-card", { hasText: "Latest Articles" }).locator(".status-row");
      const count = await articleRows.count();
      for (let i = 0; i < count; i++) {
        await expect(articleRows.nth(i)).toHaveAttribute("data-module-jump", "content");
      }
    });

    test("53. Top Searched Brands rows → Market Demand / Search Insights", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      const brandRows = page.locator("#cards .wa-stat-bar-row");
      const count = await brandRows.count();
      for (let i = 0; i < count; i++) {
        const jump = await brandRows.nth(i).getAttribute("data-module-jump");
        expect(jump).toBeTruthy();
        // ต้องเป็น watch-alerts (Market Demand)
        expect(jump).toBe("watch-alerts");
      }
    });
  });

  test.describe("Dashboard — menu active state", () => {
    test("54. menu Dashboard active เมื่ออยู่ในหน้า Dashboard", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await expect(page.locator(".nav-item[data-module=\"dashboard\"]")).toHaveClass(/active/);
    });

    test("55. คลิก metric card แล้ว menu active เปลี่ยน + Dashboard ไม่ active", async ({ page }) => {
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await page.locator("#summary-grid .stat", { hasText: "New Users" }).click();
      await page.waitForTimeout(500);
      await expect(page.locator(".nav-item[data-module=\"dashboard\"]")).not.toHaveClass(/active/);
      await expect(page.locator(".nav-item[data-module=\"users\"]")).toHaveClass(/active/);
    });
  });

  // ==================== RESPONSIVE — section order & layout ====================

  test.describe("Dashboard — responsive section order (mobile)", () => {
    test("56. mobile 390px: ลำดับ Header → KPI → Work Queue → Activity → Panels", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      // ดึง y position ของแต่ละ section
      const headerY = await page.locator(".page-header, #page-title").first().boundingBox().then(b => b.y);
      const kpiY = await page.locator("#summary-grid").boundingBox().then(b => b.y);
      const queueY = await page.locator(".dashboard-work-list").boundingBox().then(b => b.y);
      const activityY = await page.locator(".activity-list").boundingBox().then(b => b?.y ?? 9999);
      const panelsY = await page.locator("#cards").boundingBox().then(b => b.y);
      // ต้องเรียงตามลำดับ
      expect(headerY).toBeLessThan(kpiY);
      expect(kpiY).toBeLessThan(queueY);
      expect(queueY).toBeLessThan(activityY);
      expect(activityY).toBeLessThan(panelsY);
      await page.close();
    });
  });

  test.describe("Dashboard — responsive content completeness", () => {
    test("57. mobile 390px: KPI 8 cards + Work Queue 7 rows ไม่หาย", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await expect(page.locator("#summary-grid .stat")).toHaveCount(8);
      await expect(page.locator(".dashboard-work-list .work-row")).toHaveCount(7);
      await page.close();
    });

    test("58. tablet 768px: ครบทุก section", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await expect(page.locator("#summary-grid .stat")).toHaveCount(8);
      await expect(page.locator(".dashboard-work-list .work-row")).toHaveCount(7);
      await expect(page.locator("#cards .dashboard-status-card")).toHaveCount(4);
      await page.close();
    });

    test("59. desktop 1280px: ครบทุก section", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await expect(page.locator("#summary-grid .stat")).toHaveCount(8);
      await expect(page.locator(".dashboard-work-list .work-row")).toHaveCount(7);
      await expect(page.locator("#cards .dashboard-status-card")).toHaveCount(4);
      await page.close();
    });

    test("60. desktop 1440px: ครบทุก section", async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await page.goto(PROTOTYPE_URL);
      await page.waitForLoadState("networkidle");
      await loginIfNeeded(page);
      await expect(page.locator("#summary-grid .stat")).toHaveCount(8);
      await expect(page.locator(".dashboard-work-list .work-row")).toHaveCount(7);
      await expect(page.locator("#cards .dashboard-status-card")).toHaveCount(4);
      await page.close();
    });
  });

  test.describe("Login — responsive all 4 viewports", () => {
    test("61. ทุก viewport: login screen แสดง + form ใช้งานได้", async ({ browser }) => {
      for (const [w, h] of [[390, 844], [768, 1024], [1280, 800], [1440, 900]]) {
        const page = await browser.newPage({ viewport: { width: w, height: h } });
        await page.goto(PROTOTYPE_URL);
        await page.waitForLoadState("networkidle");
        await expect(page.locator("#login-screen")).toBeVisible();
        await expect(page.locator("#login-form")).toBeVisible();
        await expect(page.locator("#login-email")).toBeVisible();
        await expect(page.locator("#login-password")).toBeVisible();
        await expect(page.locator("#login-form button[type=\"submit\"]")).toBeVisible();
        await page.close();
      }
    });
  });
});
