// QA-BO-019a: My Account (AIL-020) — self-service page + .admin-box entry + edit Name
// อ้างอิง accepted self-service contract (requirement bf08de1f) + prototype เป็นหลักสำหรับการแสดงผล
// scope: entry จาก sidebar profile footer เท่านั้น, Name editable, Email/Role/Status/Last Login read-only,
//        validation (required/trim/≤100), no-op, stale guard, self-only/Active gating, audit ADMIN_PROFILE_UPDATE
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

const SELF = {
  id: "ADM-010",
  name: "ผู้ดูแลระบบ",
  email: "current.admin@tukdaeng.example",
  role: "Super Admin",
  status: "Active",
  lastLogin: "08 Sep 2026 15:00"
};

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

// helper: ไปหน้า My Account ผ่าน sidebar profile footer (.admin-box)
async function goToMyAccount(page) {
  await page.goto(PROTOTYPE_URL);
  await page.waitForLoadState("networkidle");
  await loginIfNeeded(page);
  await ensureNavOpen(page);
  await page.locator("#my-account-entry").click();
  await page.waitForTimeout(300);
}

// helper: เลือก Prototype scenario ของหน้า My Account (เปิด details → trigger → option)
async function pickMyAccountState(page, value) {
  const tools = page.locator(".my-account-state-tools");
  const isOpen = await tools.evaluate(el => el.open);
  if (!isOpen) {
    await tools.locator("summary").click();
    await page.waitForTimeout(150);
  }
  await tools.locator("[data-custom-select-trigger]").click();
  await page.waitForTimeout(150);
  await tools.locator(`[data-custom-select-option][data-value="${value}"]`).click();
  await page.waitForTimeout(300);
}

// helper: จำนวน audit events ปัจจุบัน (top-level const เข้าถึงผ่าน evaluate ได้)
async function auditEventCount(page) {
  return page.evaluate(() => auditLogData.events.length);
}

async function selfAccount(page) {
  return page.evaluate(() => adminAccountData.accounts.find(a => a.id === "ADM-010"));
}

// ==================== A. ENTRY & NAVIGATION ====================

test.describe("QA-BO-019a: My Account — entry & navigation", () => {

  test("1. .admin-box เป็น button entry (#my-account-entry) แสดงชื่อ + role ใน sidebar footer", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await ensureNavOpen(page);
    const entry = page.locator("#my-account-entry");
    await expect(entry).toBeVisible();
    expect(await entry.evaluate(el => el.tagName)).toBe("BUTTON");
    await expect(entry.locator("#admin-username")).toHaveText(SELF.name);
    await expect(entry.locator("#admin-role")).toHaveText(SELF.role);
  });

  test("2. คลิก .admin-box → เข้าหน้า My Account (body.my-account-mode + header/breadcrumb)", async ({ page }) => {
    await goToMyAccount(page);
    await expect(page.locator("body")).toHaveClass(/my-account-mode/);
    await expect(page.locator("#page-title")).toHaveText("My Account");
    // breadcrumb ระดับเดียว — My Account ไม่มี parent ใน navGroups (entry จาก profile footer เท่านั้น)
    await expect(page.locator("#crumb")).toHaveText("My Account");
    // ไม่มี detail head ซ้ำ — identity fields (Admin ID/Name/Status/Role) อยู่ใน Account Summary tiles แล้ว
    expect(await page.locator("[data-my-account-page] .user-detail-head").count()).toBe(0);
    await expect(page.locator("#panel-title")).toHaveText(SELF.id);
    await expect(page.locator("#panel-subtitle")).toHaveText(`${SELF.name} · ${SELF.role}`);
  });

  test("3. My Account ไม่อยู่ใน navGroups / Settings submenu (ไม่มี nav-item หรือ submenu button)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await ensureNavOpen(page);
    expect(await page.locator(".nav-item[data-module='my-account']").count()).toBe(0);
    expect(await page.locator(".submenu button[data-module='my-account']").count()).toBe(0);
    expect(await page.locator(".submenu button[data-sub='My Account']").count()).toBe(0);
  });

  test("4. เมื่ออยู่หน้า My Account ไม่มี nav item ไหนถูก highlight (อยู่นอก nav)", async ({ page }) => {
    await goToMyAccount(page);
    expect(await page.locator(".nav-item.active").count()).toBe(0);
    expect(await page.locator(".submenu button.active").count()).toBe(0);
  });

  test("5. keyboard: focus .admin-box แล้วกด Enter → เข้าหน้า My Account ได้", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await ensureNavOpen(page);
    await page.locator("#my-account-entry").focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toHaveClass(/my-account-mode/);
  });

  test("6. Logout button ยังทำงานปกติ (ไม่ถูก .admin-box กลืน)", async ({ page }) => {
    await page.goto(PROTOTYPE_URL);
    await page.waitForLoadState("networkidle");
    await loginIfNeeded(page);
    await ensureNavOpen(page);
    await page.locator("#logout-btn").click();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => document.body.classList.contains("logged-out"))).toBe(true);
    await expect(page.locator("#login-screen")).toBeVisible();
  });
});

// ==================== B. PAGE RENDERING ====================

test.describe("QA-BO-019a: My Account — page rendering", () => {

  test("7. แสดง section Account Summary พร้อม detail-grid ครบ 6 tiles (Admin ID + Name editable + Email/Role/Status/Last Login)", async ({ page }) => {
    await goToMyAccount(page);
    await expect(page.locator("[data-my-account-section='profile'] h4")).toHaveText("Account Summary");
    // นับเฉพาะใน Account Summary — Security section มี Password tile แยก (AIL-021)
    expect(await page.locator("[data-my-account-section='profile'] .detail-grid.three .detail-tile").count()).toBe(6);
    // responsive columns ตาม convention deletion-detail (desktop 3 / tablet ≤1180 → 2 / mobile ≤760 → 1)
    const colCount = await page.locator("[data-my-account-section='profile'] .detail-grid.three").evaluate(
      el => getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length);
    const width = page.viewportSize().width;
    const expected = width <= 760 ? 1 : width <= 1180 ? 2 : 3;
    expect(colCount).toBe(expected);
  });

  test("8. แสดง Name ปัจจุบันของ self account", async ({ page }) => {
    await goToMyAccount(page);
    await expect(page.locator("[data-my-account-name-display]")).toHaveText(SELF.name);
  });

  test("9. read-only tiles: Admin ID / Email / Role / Status / Last Login ตรง mock self account", async ({ page }) => {
    await goToMyAccount(page);
    await expect(page.locator("[data-my-account-id] strong")).toHaveText(SELF.id);
    await expect(page.locator("[data-my-account-email] strong")).toHaveText(SELF.email);
    await expect(page.locator("[data-my-account-role] strong")).toHaveText(SELF.role);
    await expect(page.locator("[data-my-account-status] strong")).toHaveText(SELF.status);
    await expect(page.locator("[data-my-account-last-login] strong")).toHaveText(SELF.lastLogin);
  });

  test("10. มีปุ่ม Change Password (security actions) + Active Sessions section (AIL-022) และไม่ expose internal roadmap copy", async ({ page }) => {
    await goToMyAccount(page);
    // security actions มี Change Password (AIL-021) + Active Sessions list (AIL-022)
    await expect(page.locator("[data-my-account-section='security']")).toBeVisible();
    await expect(page.locator("[data-my-account-section='sessions']")).toBeVisible();
    // ห้ามมี internal task id / roadmap copy เช่น AIL-xxx หรือ "เฟสถัดไป"
    const content = await page.locator("[data-my-account-page]").innerText();
    expect(content).not.toMatch(/AIL-\d+/);
    expect(content).not.toContain("เฟสถัดไป");
  });

  test("11. ไม่มีฟิลด์ password/OTP บนหน้า My Account (current scope: ไม่มี OTP/MFA/2FA)", async ({ page }) => {
    await goToMyAccount(page);
    expect(await page.locator("[data-my-account-page] input[type='password']").count()).toBe(0);
    // name input render อยู่ใน DOM แต่ซ่อนจนกว่าจะกด แก้ไขชื่อ — ตรวจว่าไม่ visible ใน view mode
    await expect(page.locator("#my-account-name")).not.toBeVisible();
  });
});

// ==================== C. EDIT NAME — TOGGLE & VALIDATION ====================

test.describe("QA-BO-019a: My Account — edit Name toggle & validation", () => {

  test("12. กด Edit → modal แก้ไขชื่อเปิด พร้อม input ค่าปัจจุบัน + ปุ่ม ยกเลิก/บันทึก", async ({ page }) => {
    await goToMyAccount(page);
    await page.locator("[data-my-account-action='edit-name']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#user-action-modal")).toHaveClass(/show/);
    await expect(page.locator(".my-account-name-modal")).toBeVisible();
    const input = page.locator("#my-account-name");
    await expect(input).toBeVisible();
    await expect(input).toHaveValue(SELF.name);
    await expect(page.locator("[data-my-account-action='cancel-name']")).toBeVisible();
    await expect(page.locator("[data-my-account-action='save-name']")).toBeVisible();
  });

  test("13. กด ยกเลิก → กลับ view mode ชื่อไม่เปลี่ยน", async ({ page }) => {
    await goToMyAccount(page);
    await page.locator("[data-my-account-action='edit-name']").click();
    await page.locator("#my-account-name").fill("ชื่อที่ไม่บันทึก");
    await page.locator("[data-my-account-action='cancel-name']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("#my-account-name")).not.toBeVisible();
    await expect(page.locator("[data-my-account-name-display]")).toHaveText(SELF.name);
    expect((await selfAccount(page)).fullName).toBe(SELF.name);
  });

  test("14. validation: ชื่อว่าง → error ใต้ field + input invalid", async ({ page }) => {
    await goToMyAccount(page);
    await page.locator("[data-my-account-action='edit-name']").click();
    await page.locator("#my-account-name").fill("");
    await page.locator("[data-my-account-action='save-name']").click();
    await page.waitForTimeout(200);
    const error = page.locator("[data-my-account-name-error]");
    await expect(error).toHaveClass(/show/);
    await expect(error).toHaveText("กรุณากรอกชื่อ");
    await expect(page.locator("#my-account-name")).toHaveClass(/article-field-invalid/);
  });

  test("15. validation: ชื่อเป็น whitespace ล้วน → trim แล้ว error เหมือนค่าว่าง", async ({ page }) => {
    await goToMyAccount(page);
    await page.locator("[data-my-account-action='edit-name']").click();
    await page.locator("#my-account-name").fill("   ");
    await page.locator("[data-my-account-action='save-name']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("[data-my-account-name-error]")).toHaveClass(/show/);
  });

  test("16. validation: ชื่อเกิน 100 ตัวอักษร → error (bypass maxlength ผ่าน JS)", async ({ page }) => {
    await goToMyAccount(page);
    await page.locator("[data-my-account-action='edit-name']").click();
    await page.evaluate(() => {
      const input = document.querySelector("#my-account-name");
      input.value = "ก".repeat(101);
    });
    await page.locator("[data-my-account-action='save-name']").click();
    await page.waitForTimeout(200);
    const error = page.locator("[data-my-account-name-error]");
    await expect(error).toHaveClass(/show/);
    await expect(error).toContainText("100");
  });

  test("17. input มี maxlength=100 ตาม contract", async ({ page }) => {
    await goToMyAccount(page);
    await page.locator("[data-my-account-action='edit-name']").click();
    expect(await page.locator("#my-account-name").getAttribute("maxlength")).toBe("100");
  });

  test("18. พิมพ์ใหม่หลัง error → error ถูกเคลียร์", async ({ page }) => {
    await goToMyAccount(page);
    await page.locator("[data-my-account-action='edit-name']").click();
    await page.locator("#my-account-name").fill("");
    await page.locator("[data-my-account-action='save-name']").click();
    await page.waitForTimeout(200);
    await expect(page.locator("[data-my-account-name-error]")).toHaveClass(/show/);
    await page.locator("#my-account-name").fill("ชื่อใหม่");
    await page.waitForTimeout(200);
    await expect(page.locator("[data-my-account-name-error]")).not.toHaveClass(/show/);
    await expect(page.locator("#my-account-name")).not.toHaveClass(/article-field-invalid/);
  });
});

// ==================== D. SAVE — SUCCESS / NO-OP / AUDIT ====================

test.describe("QA-BO-019a: My Account — save flow, no-op, audit", () => {

  test("19. บันทึกชื่อใหม่ → success toast + ชื่อบนหน้าและ sidebar footer อัปเดต", async ({ page }) => {
    await goToMyAccount(page);
    const newName = "ผู้ดูแลระบบ ทดสอบ";
    await page.locator("[data-my-account-action='edit-name']").click();
    await page.locator("#my-account-name").fill(newName);
    await page.locator("[data-my-account-action='save-name']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#success-toast")).toHaveClass(/show/);
    await expect(page.locator("[data-my-account-name-display]")).toHaveText(newName);
    await expect(page.locator("#admin-username")).toHaveText(newName);
    // sync panel header ของหน้า My Account ด้วย
    await expect(page.locator("#panel-subtitle")).toHaveText(`${newName} · ${SELF.role}`);
    // commit ลง self record + auth session
    expect((await selfAccount(page)).fullName).toBe(newName);
    expect(await page.evaluate(() => auth.admin.username)).toBe(newName);
  });

  test("20. trim: ชื่อใหม่ที่มี space หน้า/หลัง → บันทึกค่าที่ trim แล้ว", async ({ page }) => {
    await goToMyAccount(page);
    await page.locator("[data-my-account-action='edit-name']").click();
    await page.locator("#my-account-name").fill("  ผู้ดูแลระบบ B  ");
    await page.locator("[data-my-account-action='save-name']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("[data-my-account-name-display]")).toHaveText("ผู้ดูแลระบบ B");
  });

  test("21. save สำเร็จ → สร้าง audit ADMIN_PROFILE_UPDATE (module My Account, ไม่มี secret)", async ({ page }) => {
    await goToMyAccount(page);
    const before = await auditEventCount(page);
    const newName = "ผู้ดูแลระบบ Audit";
    await page.locator("[data-my-account-action='edit-name']").click();
    await page.locator("#my-account-name").fill(newName);
    await page.locator("[data-my-account-action='save-name']").click();
    await page.waitForTimeout(300);
    expect(await auditEventCount(page)).toBe(before + 1);
    const evt = await page.evaluate(() => auditLogData.events[0]);
    // schema convention: action = display label, eventType = canonical code (ตาม AIL-005/006 helpers)
    expect(evt.eventType).toBe("ADMIN_PROFILE_UPDATE");
    expect(evt.action).toBe("Update Profile");
    expect(evt.module).toBe("My Account");
    expect(evt.reference).toBe(SELF.id);
    expect(evt.actor).toBe(newName); // actor = auth.admin.username (อัปเดตแล้วหลัง commit)
    expect(evt.result).toBe("Success");
    expect(evt.risk).toBe("Low");
    expect(evt.before).toContain(SELF.name);
    expect(evt.after).toContain(newName);
    expect(evt.id).toMatch(/^AUD-\d{5}$/);
    // ไม่มี password/token/secret ใน audit payload
    const serialized = JSON.stringify(evt).toLowerCase();
    expect(serialized).not.toContain("password");
    expect(serialized).not.toContain("token");
  });

  test("22. no-op: บันทึกชื่อเดิม → toast ไม่มีการเปลี่ยนแปลง + ไม่สร้าง audit + revision คงเดิม", async ({ page }) => {
    await goToMyAccount(page);
    const before = await auditEventCount(page);
    const revBefore = (await selfAccount(page)).revision;
    await page.locator("[data-my-account-action='edit-name']").click();
    await page.locator("#my-account-name").fill(`  ${SELF.name}  `); // trim แล้วเท่าเดิม
    await page.locator("[data-my-account-action='save-name']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#success-toast")).toHaveClass(/show|warning/);
    await expect(page.locator("#success-toast")).toContainText("ไม่มีการเปลี่ยนแปลง");
    expect(await auditEventCount(page)).toBe(before);
    expect((await selfAccount(page)).revision).toBe(revBefore);
    await expect(page.locator("[data-my-account-name-display]")).toHaveText(SELF.name);
  });

  test("23. Enter ใน input → save เหมือนกดปุ่มบันทึก", async ({ page }) => {
    await goToMyAccount(page);
    const newName = "ผู้ดูแลระบบ Enter";
    await page.locator("[data-my-account-action='edit-name']").click();
    await page.locator("#my-account-name").fill(newName);
    await page.locator("#my-account-name").press("Enter");
    await page.waitForTimeout(300);
    await expect(page.locator("[data-my-account-name-display]")).toHaveText(newName);
  });

  test("24. stale revision → reject ไม่ commit + error toast (ข้อมูลเปลี่ยนระหว่างแก้ไข)", async ({ page }) => {
    await goToMyAccount(page);
    const before = await auditEventCount(page);
    const nameBefore = (await selfAccount(page)).fullName;
    await page.locator("[data-my-account-action='edit-name']").click();
    await page.locator("#my-account-name").fill("ชื่อ Stale");
    // จำลอง revision เปลี่ยนจากที่อื่นระหว่างเปิด edit อยู่
    await page.evaluate(() => {
      adminAccountData.accounts.find(a => a.id === "ADM-010").revision += 5;
    });
    await page.locator("[data-my-account-action='save-name']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#success-toast")).toHaveClass(/show/);
    await expect(page.locator("#success-toast")).toContainText("หมดอายุ");
    // ไม่ commit + ไม่สร้าง audit
    expect((await selfAccount(page)).fullName).toBe(nameBefore);
    expect(await auditEventCount(page)).toBe(before);
  });
});

// ==================== E. PAGE STATES & ACCESS GATING ====================

test.describe("QA-BO-019a: My Account — states & access gating", () => {

  test("25. scenario Loading → skeleton/state block loading แสดง", async ({ page }) => {
    await goToMyAccount(page);
    await pickMyAccountState(page, "loading");
    await expect(page.locator("[data-my-account-state='loading']")).toBeVisible();
    await expect(page.locator(".my-account-skel").first()).toBeVisible();
  });

  test("26. scenario Load Error → error block + ปุ่มลองอีกครั้ง → retry กลับมา ready", async ({ page }) => {
    await goToMyAccount(page);
    await pickMyAccountState(page, "error");
    await expect(page.locator("[data-my-account-state='error']")).toBeVisible();
    await page.locator("[data-my-account-action='retry']").click();
    // retry → loading สั้น ๆ แล้วกลับ ready
    await page.waitForTimeout(1100);
    await expect(page.locator("[data-my-account-page]")).toBeVisible();
    await expect(page.locator("[data-my-account-name-display]")).toHaveText(SELF.name);
  });

  test("27. scenario Session Expired → state block + ปุ่มกลับไปหน้า Login", async ({ page }) => {
    await goToMyAccount(page);
    await pickMyAccountState(page, "session-expired");
    await expect(page.locator("[data-my-account-state='session-expired']")).toBeVisible();
    await expect(page.locator("[data-my-account-state='session-expired']")).toContainText("Session หมดอายุ");
    await page.locator("[data-my-account-action='return-login']").click();
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => document.body.classList.contains("logged-out"))).toBe(true);
    await expect(page.locator("#login-screen")).toBeVisible();
  });

  test("28. self account ไม่ใช่ Active → page gate แสดง session-expired (permission beyond UI)", async ({ page }) => {
    await goToMyAccount(page);
    // จำลอง self ถูก Suspend ระหว่าง session แล้ว re-render
    await page.evaluate(() => {
      adminAccountData.accounts.find(a => a.id === "ADM-010").status = "Suspended";
      renderMyAccountPage();
    });
    await page.waitForTimeout(200);
    await expect(page.locator("[data-my-account-state='session-expired']")).toBeVisible();
    // restore เพื่อไม่กระทบ test ถัดไปใน page เดียวกัน (แต่ละ test reload ใหม่อยู่แล้ว — restore เพื่อความชัวร์)
    await page.evaluate(() => {
      adminAccountData.accounts.find(a => a.id === "ADM-010").status = "Active";
    });
  });

  test("29. save ถูก reject เมื่อ self account ไม่ใช่ Active ระหว่างแก้ไข (boundary check ระดับ commit)", async ({ page }) => {
    await goToMyAccount(page);
    const before = await auditEventCount(page);
    const nameBefore = (await selfAccount(page)).fullName;
    await page.locator("[data-my-account-action='edit-name']").click();
    await page.locator("#my-account-name").fill("ชื่อที่ต้องไม่ commit");
    await page.evaluate(() => {
      adminAccountData.accounts.find(a => a.id === "ADM-010").status = "Locked";
    });
    await page.locator("[data-my-account-action='save-name']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#success-toast")).toContainText("หมดอายุ");
    expect((await selfAccount(page)).fullName).toBe(nameBefore);
    expect(await auditEventCount(page)).toBe(before);
    await page.evaluate(() => {
      adminAccountData.accounts.find(a => a.id === "ADM-010").status = "Active";
    });
  });

  test("30. self-only: ไม่มี target admin id param — resolve จาก auth.admin.accountId เท่านั้น", async ({ page }) => {
    await goToMyAccount(page);
    // เปลี่ยน auth.admin.accountId เป็น account อื่นที่ไม่ใช่ self → page ต้อง gate (ไม่ render ข้อมูล account นั้น)
    await page.evaluate(() => {
      auth.admin.accountId = "ADM-001";
      renderMyAccountPage();
    });
    await page.waitForTimeout(200);
    await expect(page.locator("[data-my-account-state='session-expired']")).toBeVisible();
    await page.evaluate(() => {
      auth.admin.accountId = "ADM-010";
    });
  });
});

// ==================== F. REGRESSION — NAVIGATE AWAY / BACK ====================

test.describe("QA-BO-019a: My Account — regression การนำทาง", () => {

  test("31. ออกจาก My Account ไป Dashboard → my-account-mode ถูกถอด + state กลับ ready", async ({ page }) => {
    await goToMyAccount(page);
    await pickMyAccountState(page, "error");
    await ensureNavOpen(page);
    await page.locator(".nav-item[data-module='dashboard']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).not.toHaveClass(/my-account-mode/);
    // demo state tools ต้องไม่ค้างใน .panel ของ module อื่น
    expect(await page.locator(".panel > .my-account-state-tools").count()).toBe(0);
    // กลับเข้ามาใหม่ต้องเป็น ready (ไม่ค้าง error)
    await ensureNavOpen(page);
    await page.locator("#my-account-entry").click();
    await page.waitForTimeout(300);
    await expect(page.locator("[data-my-account-page]")).toBeVisible();
  });

  test("32. my-account-mode ไม่ leak ไปหน้า Settings > Support Center", async ({ page }) => {
    await goToMyAccount(page);
    await ensureNavOpen(page);
    await page.locator(".nav-item[data-module='settings']").click();
    await page.waitForTimeout(300);
    await ensureNavOpen(page);
    await page.locator(".submenu[data-submenu='settings'] button[data-sub='Support Center']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).not.toHaveClass(/my-account-mode/);
    await expect(page.locator("body")).toHaveClass(/support-center-mode/);
  });
});
