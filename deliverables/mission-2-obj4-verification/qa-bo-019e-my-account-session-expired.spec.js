// QA-BO-019e: My Account — Session Expired (AIL-023b) — system-triggered invalid session gate
// อ้างอิง spec 01_AUTHENTICATION_MODULE §8 (idle 8h / max 24h / expired → login พร้อม message)
//        + 16_ADMIN_SETTINGS_MODULE §7/§10 + prototype เป็นหลักสำหรับการแสดงผล
// scope: current session validity gate (idle timeout / max lifetime / revoke จากอุปกรณ์อื่น /
//        sessionRevision stale — uniform epoch ไม่ยกเว้น current), lazy Expired sweep,
//        session watch ขณะอยู่หน้า, commit guards ใต้ session ที่หมดอายุ, re-login CTA →
//        teardown + generic session-expired message บน Login (แยกจาก user-initiated logout),
//        re-login → session issuance ใหม่
const { test, expect } = require("@playwright/test");

const PROTOTYPE_URL = "/bo-prototype.html";

const SELF = {
  id: "ADM-010",
  name: "ผู้ดูแลระบบ",
  role: "Super Admin"
};

const MOCK_PASSWORD = "tukdaeng-admin";
const NEW_PASSWORD = "TukDaeng!2026xyz";

const CURRENT_SESSION_ID = "SES-90001";

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

async function auditEventCount(page) {
  return page.evaluate(() => auditLogData.events.length);
}

function currentSession(page) {
  return page.evaluate(() => {
    const registry = adminSessionData["ADM-010"];
    return registry.sessions.find(s => s.id === registry.currentSessionId);
  });
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

// ==================== A. SYSTEM TRIGGERS → SESSION-EXPIRED GATE ====================

test.describe("QA-BO-019e: Session Expired — system triggers", () => {

  test("1. idle timeout: lastActiveTs เกิน 8h → gate expired + sweep flip status=Expired", async ({ page }) => {
    await goToMyAccount(page);
    await expect(page.locator("[data-my-account-page]")).toBeVisible();
    await page.evaluate(() => {
      const registry = adminSessionData["ADM-010"];
      const s = registry.sessions.find(x => x.id === registry.currentSessionId);
      s.lastActiveTs = Date.now() - 9 * 3600e3; // idle 9h > policy 8h
      renderMyAccountPage();
    });
    await page.waitForTimeout(300);
    await expect(page.locator("[data-my-account-state='session-expired']")).toBeVisible();
    expect(await page.locator("[data-my-account-page]").count()).toBe(0);
    const session = await currentSession(page);
    expect(session.status).toBe("Expired");
    expect(session.expiredReason).toBe("Idle timeout");
    expect(session.expiredAt).toBeTruthy();
  });

  test("2. max session lifetime: signedInTs เกิน 24h → gate expired + reason Max session lifetime", async ({ page }) => {
    await goToMyAccount(page);
    await page.evaluate(() => {
      const registry = adminSessionData["ADM-010"];
      const s = registry.sessions.find(x => x.id === registry.currentSessionId);
      s.signedInTs = Date.now() - 25 * 3600e3; // age 25h > policy 24h (lastActive ยังไม่เกิน idle)
      s.lastActiveTs = Date.now() - 60e3;
      renderMyAccountPage();
    });
    await page.waitForTimeout(300);
    await expect(page.locator("[data-my-account-state='session-expired']")).toBeVisible();
    const session = await currentSession(page);
    expect(session.status).toBe("Expired");
    expect(session.expiredReason).toBe("Max session lifetime");
  });

  test("3. session ถูก revoke จากอุปกรณ์อื่น (status=Revoked) → render ถัดไป gate expired", async ({ page }) => {
    await goToMyAccount(page);
    await page.evaluate(() => {
      const registry = adminSessionData["ADM-010"];
      registry.sessions.find(x => x.id === registry.currentSessionId).status = "Revoked";
      renderMyAccountPage();
    });
    await page.waitForTimeout(300);
    await expect(page.locator("[data-my-account-state='session-expired']")).toBeVisible();
    expect(await page.locator("[data-my-account-page]").count()).toBe(0);
  });

  test("4. sessionRevision stale: epoch bump จาก context อื่น → current session invalid → gate expired", async ({ page }) => {
    await goToMyAccount(page);
    await page.evaluate(() => {
      const acc = adminAccountData.accounts.find(a => a.id === "ADM-010");
      acc.sessionRevision = (acc.sessionRevision || 0) + 1; // เหมือน password เปลี่ยนบน device อื่น
      renderMyAccountPage();
    });
    await page.waitForTimeout(300);
    await expect(page.locator("[data-my-account-state='session-expired']")).toBeVisible();
    // epoch-stale ไม่ถูก sweep — status คง Active แต่ invalid (ไม่เปลี่ยนสถานะจริง)
    const session = await currentSession(page);
    expect(session.status).toBe("Active");
  });

  test("5. session watch: revoke จาก context อื่นโดยไม่ render → หน้า flip เป็น expired เอง", async ({ page }) => {
    await goToMyAccount(page);
    await expect(page.locator("[data-my-account-page]")).toBeVisible();
    // จำลอง invalidation ฝั่ง server — ไม่เรียก render ใด ๆ
    await page.evaluate(() => {
      const registry = adminSessionData["ADM-010"];
      registry.sessions.find(x => x.id === registry.currentSessionId).status = "Revoked";
    });
    // interval watch (~1.2s) ตรวจเจอ → transition เอง
    await page.waitForSelector("[data-my-account-state='session-expired']", { timeout: 6000 });
    expect(await page.locator("[data-my-account-page]").count()).toBe(0);
  });

  test("6. session อื่น idle เกิน 8h → หลุดจาก list + sweep เป็น Expired — แต่หน้าไม่ gate", async ({ page }) => {
    await goToMyAccount(page);
    await page.evaluate(() => {
      adminSessionData["ADM-010"].sessions.find(x => x.id === "SES-90002").lastActiveTs = Date.now() - 9 * 3600e3;
      renderMyAccountPage();
    });
    await page.waitForTimeout(300);
    // current session ยัง valid → หน้าใช้ได้ปกติ
    await expect(page.locator("[data-my-account-page]")).toBeVisible();
    expect(await page.locator("[data-my-account-session]").count()).toBe(2);
    expect(await page.locator("[data-my-account-session='SES-90002']").count()).toBe(0);
    const session = await page.evaluate(() => adminSessionData["ADM-010"].sessions.find(x => x.id === "SES-90002"));
    expect(session.status).toBe("Expired");
  });

  test("7. currentSessionId ชี้ session ที่ไม่มีใน registry → gate expired", async ({ page }) => {
    await goToMyAccount(page);
    await page.evaluate(() => {
      adminSessionData["ADM-010"].currentSessionId = "SES-99999";
      renderMyAccountPage();
    });
    await page.waitForTimeout(300);
    await expect(page.locator("[data-my-account-state='session-expired']")).toBeVisible();
  });
});

// ==================== B. STATE BLOCK + RE-LOGIN CTA + LOGIN MESSAGE ====================

test.describe("QA-BO-019e: Session Expired — state block & CTA", () => {

  test("8. expired block: title + subtitle + CTA กลับไปหน้า Login (generic message ไม่บอกสาเหตุ)", async ({ page }) => {
    await goToMyAccount(page);
    await page.evaluate(() => {
      adminSessionData["ADM-010"].sessions.find(x => x.id === "SES-90001").status = "Revoked";
      renderMyAccountPage();
    });
    await page.waitForTimeout(300);
    const block = page.locator("[data-my-account-state='session-expired']");
    await expect(block).toBeVisible();
    await expect(block).toContainText("Session หมดอายุ");
    await expect(block).toContainText("เข้าสู่ระบบอีกครั้ง");
    // generic copy — ไม่เปิดเผยสาเหตุ (revoked/idle/stale ใช้ข้อความเดียวกัน)
    await expect(block).not.toContainText("revoke");
    const cta = block.locator("[data-my-account-action='return-login']");
    await expect(cta).toBeVisible();
    await expect(cta).toHaveText("กลับไปหน้า Login");
  });

  test("9. CTA กลับไปหน้า Login → teardown + login screen เปล่า (copy บน expired block อธิบายแล้ว)", async ({ page }) => {
    await goToMyAccount(page);
    await page.evaluate(() => {
      adminSessionData["ADM-010"].sessions.find(x => x.id === "SES-90001").status = "Revoked";
      renderMyAccountPage();
    });
    await page.waitForTimeout(300);
    await page.locator("[data-my-account-action='return-login']").click();
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => document.body.classList.contains("logged-out"))).toBe(true);
    await expect(page.locator("#login-screen")).toBeVisible();
    // ไม่ฝาก message บน login — เหมือน user-initiated logout
    await expect(page.locator("#auth-state")).toBeEmpty();
    // ไม่ใช่ error state — auth-error ต้องว่าง
    await expect(page.locator("#auth-error")).not.toHaveClass(/show/);
  });

  test("10. re-login หลัง expired → session ใหม่ถูกออก → My Account ใช้ได้ + session เดิมคง Expired/Revoked", async ({ page }) => {
    await goToMyAccount(page);
    await page.evaluate(() => {
      adminSessionData["ADM-010"].sessions.find(x => x.id === "SES-90001").status = "Revoked";
      renderMyAccountPage();
    });
    await page.waitForTimeout(300);
    await page.locator("[data-my-account-action='return-login']").click();
    await page.waitForTimeout(400);
    await loginIfNeeded(page);
    await ensureNavOpen(page);
    await page.locator("#my-account-entry").click();
    await page.waitForTimeout(300);
    await expect(page.locator("[data-my-account-page]")).toBeVisible();
    const registry = await page.evaluate(() => adminSessionData["ADM-010"].currentSessionId);
    expect(registry).not.toBe(CURRENT_SESSION_ID);
    const row = page.locator(`[data-my-account-session='${registry}']`);
    await expect(row.locator(".pill")).toHaveText("อุปกรณ์นี้");
    // session เดิมยัง Revoked — ไม่ถูก resurrect
    const old = await page.evaluate(() => adminSessionData["ADM-010"].sessions.find(s => s.id === "SES-90001"));
    expect(old.status).toBe("Revoked");
    // auth-state message ถูกเคลียร์หลัง login สำเร็จ
    await expect(page.locator("#auth-state")).toBeEmpty();
  });

  test("11. user-initiated logout → login screen โดยไม่มี session-expired message (แยกจาก system expiry)", async ({ page }) => {
    await goToMyAccount(page);
    await ensureNavOpen(page);
    await page.locator("#logout-btn").click();
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => document.body.classList.contains("logged-out"))).toBe(true);
    await expect(page.locator("#login-screen")).toBeVisible();
    await expect(page.locator("#auth-state")).toBeEmpty();
  });

  test("12. scenario tool เลือก Ready ขณะ session invalid จริง → guard override กลับเป็น expired (demo tool ไม่ข้าม contract)", async ({ page }) => {
    await goToMyAccount(page);
    await page.evaluate(() => {
      adminSessionData["ADM-010"].sessions.find(x => x.id === "SES-90001").status = "Revoked";
      renderMyAccountPage();
    });
    await page.waitForTimeout(300);
    await expect(page.locator("[data-my-account-state='session-expired']")).toBeVisible();
    // scenario tool เลือก ready — แต่ session invalid จริง → guard บังคับ expired กลับ
    await pickMyAccountState(page, "ready");
    await expect(page.locator("[data-my-account-state='session-expired']")).toBeVisible();
  });
});

// ==================== C. COMMIT GUARDS ใต้ SESSION ที่หมดอายุ ====================

test.describe("QA-BO-019e: Session Expired — commit guards", () => {

  test("13. edit-name mid-modal: current session revoked → save reject + ไม่ commit + gate expired", async ({ page }) => {
    await goToMyAccount(page);
    const before = await auditEventCount(page);
    await page.locator("[data-my-account-action='edit-name']").click();
    await page.waitForTimeout(200);
    await page.locator("#my-account-name").fill("ชื่อที่ต้องไม่ commit");
    await page.evaluate(() => {
      adminSessionData["ADM-010"].sessions.find(x => x.id === "SES-90001").status = "Revoked";
    });
    await page.locator("[data-my-account-action='save-name']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#success-toast")).toHaveClass(/error/);
    await expect(page.locator("#success-toast")).toContainText("หมดอายุ");
    const acc = await page.evaluate(() => adminAccountData.accounts.find(a => a.id === "ADM-010"));
    expect(acc.fullName).toBe(SELF.name);
    expect(await auditEventCount(page)).toBe(before);
    await expect(page.locator("[data-my-account-state='session-expired']")).toBeVisible();
  });

  test("14. change-password mid-modal: current session expired → save reject + password ไม่เปลี่ยน + ไม่สร้าง audit", async ({ page }) => {
    await goToMyAccount(page);
    const before = await auditEventCount(page);
    await page.locator("[data-my-account-action='change-password']").click();
    await page.waitForTimeout(200);
    await page.locator("#my-account-pw-current").fill(MOCK_PASSWORD);
    await page.locator("#my-account-pw-new").fill(NEW_PASSWORD);
    await page.locator("#my-account-pw-confirm").fill(NEW_PASSWORD);
    await page.evaluate(() => {
      const s = adminSessionData["ADM-010"].sessions.find(x => x.id === "SES-90001");
      s.lastActiveTs = Date.now() - 9 * 3600e3; // idle timeout ระหว่างเปิด modal
    });
    await page.locator("[data-my-account-action='save-password']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#success-toast")).toHaveClass(/error/);
    const cred = await page.evaluate(() => adminCredentialStore["ADM-010"].password);
    expect(cred).toBe(MOCK_PASSWORD);
    expect(await auditEventCount(page)).toBe(before);
    await expect(page.locator("[data-my-account-state='session-expired']")).toBeVisible();
  });

  test("15. revoke-session mid-modal: current session revoked จากที่อื่น → confirm reject + target คงอยู่", async ({ page }) => {
    await goToMyAccount(page);
    const before = await auditEventCount(page);
    await page.locator("[data-my-account-session='SES-90002'] [data-my-account-action='revoke-session']").click();
    await page.waitForTimeout(200);
    await expect(page.locator(".my-account-session-modal")).toBeVisible();
    await page.evaluate(() => {
      adminSessionData["ADM-010"].sessions.find(x => x.id === "SES-90001").status = "Revoked";
    });
    await page.locator("[data-my-account-action='confirm-revoke-session']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#success-toast")).toHaveClass(/error/);
    const target = await page.evaluate(() => adminSessionData["ADM-010"].sessions.find(s => s.id === "SES-90002"));
    expect(target.status).toBe("Active");
    expect(await auditEventCount(page)).toBe(before);
    await expect(page.locator("[data-my-account-state='session-expired']")).toBeVisible();
  });

  test("16. logout-all mid-modal: current session revoked → confirm reject + sessions อื่นคงอยู่ + gate expired", async ({ page }) => {
    await goToMyAccount(page);
    const before = await auditEventCount(page);
    await page.locator("[data-my-account-action='logout-all']").click();
    await page.waitForTimeout(200);
    await page.evaluate(() => {
      adminSessionData["ADM-010"].sessions.find(x => x.id === "SES-90001").status = "Revoked";
    });
    await page.locator("[data-my-account-action='confirm-logout-all']").click();
    await page.waitForTimeout(300);
    await expect(page.locator("#success-toast")).toHaveClass(/error/);
    // session อื่นยัง Active — commit ไม่เกิด
    for (const id of ["SES-90002", "SES-90003"]) {
      const s = await page.evaluate(sid => adminSessionData["ADM-010"].sessions.find(x => x.id === sid), id);
      expect(s.status).toBe("Active");
    }
    expect(await auditEventCount(page)).toBe(before);
    await expect(page.locator("[data-my-account-state='session-expired']")).toBeVisible();
  });
});

// ==================== D. PASSIVE DETECTION / SECURITY / RESPONSIVE ====================

test.describe("QA-BO-019e: Session Expired — passive detection & security", () => {

  test("17. expiry detection ไม่สร้าง audit event (passive check — revoke ถูก audit ตอนกระทำแล้ว)", async ({ page }) => {
    await goToMyAccount(page);
    const before = await auditEventCount(page);
    await page.evaluate(() => {
      const s = adminSessionData["ADM-010"].sessions.find(x => x.id === "SES-90001");
      s.lastActiveTs = Date.now() - 9 * 3600e3;
      renderMyAccountPage();
    });
    await page.waitForTimeout(300);
    await expect(page.locator("[data-my-account-state='session-expired']")).toBeVisible();
    expect(await auditEventCount(page)).toBe(before);
  });

  test("18. expired state ไม่ render ข้อมูลบัญชี/session ต่อ — DOM มีแค่ state block", async ({ page }) => {
    await goToMyAccount(page);
    await page.evaluate(() => {
      adminSessionData["ADM-010"].sessions.find(x => x.id === "SES-90001").status = "Revoked";
      renderMyAccountPage();
    });
    await page.waitForTimeout(300);
    expect(await page.locator("[data-my-account-page]").count()).toBe(0);
    expect(await page.locator("[data-my-account-section]").count()).toBe(0);
    // ไม่มี session metadata เหลือบนหน้า
    expect(await page.locator("[data-my-account-session]").count()).toBe(0);
    const html = await page.locator("#table").innerHTML();
    expect(html).not.toContain("203.150.98.xx");
  });

  test("19. expired state ทำงานครบทุก viewport — block + CTA visible และ CTA กลับ login ได้", async ({ page }) => {
    await goToMyAccount(page);
    await page.evaluate(() => {
      adminSessionData["ADM-010"].sessions.find(x => x.id === "SES-90001").status = "Revoked";
      renderMyAccountPage();
    });
    await page.waitForTimeout(300);
    const block = page.locator("[data-my-account-state='session-expired']");
    await expect(block).toBeVisible();
    await expect(block.locator("[data-my-account-action='return-login']")).toBeVisible();
    await page.locator("[data-my-account-action='return-login']").click();
    await page.waitForTimeout(400);
    await expect(page.locator("#login-screen")).toBeVisible();
    await expect(page.locator("#auth-state")).toBeEmpty();
  });

  test("20. regression: session ปกติ + scenario tools (ready/loading/error) ยังทำงานหลังเพิ่ม gate", async ({ page }) => {
    await goToMyAccount(page);
    await expect(page.locator("[data-my-account-page]")).toBeVisible();
    // จำนวน session ปกติ 3 แถว — gate ไม่ผูกมัด false-positive
    expect(await page.locator("[data-my-account-session]").count()).toBe(3);
    await pickMyAccountState(page, "error");
    await expect(page.locator("[data-my-account-state='error']")).toBeVisible();
    await page.locator("[data-my-account-action='retry']").click();
    await page.waitForTimeout(1100);
    await expect(page.locator("[data-my-account-page]")).toBeVisible();
  });
});
