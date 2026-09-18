// Temp verification for Role Detail + Permission accordion (RP-008)
const { chromium } = require("@playwright/test");

const BASE = "http://127.0.0.1:8787";
const results = [];
function check(name, ok, extra = "") {
  results.push({ name, ok, extra });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? " — " + extra : ""}`);
}

async function login(page) {
  await page.goto(`${BASE}/bo-prototype.html`);
  if (await page.locator("#login-screen").isVisible().catch(() => false)) {
    await page.locator("#login-form button[type=\"submit\"]").click();
    await page.waitForSelector("#otp-form:not(.hidden)", { timeout: 5000 });
    await page.locator("#verify-otp-btn").click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
  }
}

async function goRoleList(page) {
  await page.locator(".nav-item[data-module='settings']").click();
  await page.waitForTimeout(250);
  await page.locator(".submenu button[data-sub='Roles & Permissions']").click();
  await page.waitForSelector("body.role-list-mode", { timeout: 5000 });
}

async function openRole(page, roleId) {
  const row = page.locator(`.user-row[data-role-card="${roleId}"]`);
  for (let i = 0; i < 5 && !(await row.isVisible().catch(() => false)); i++) {
    const next = page.locator("[data-role-page]").last();
    if (!(await next.isVisible().catch(() => false))) break;
    await next.click();
    await page.waitForTimeout(200);
  }
  await row.locator("> div").first().click();
  await page.waitForSelector("body.role-detail-mode", { timeout: 5000 });
}

(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));

  // ---------- Desktop 1440 ----------
  await login(page);
  await goRoleList(page);

  await openRole(page, "ROL-001");

  check("breadcrumb", (await page.locator("#crumb").textContent()).includes("Super Admin"));
  check("back button", await page.locator("[data-role-back]").isVisible());
  // System Role → read-only ไม่มี action ใน header
  const sysActions = await page.locator(".role-detail-actions .user-detail-action-btn").allTextContents();
  check("system role: no header actions", sysActions.length === 0, JSON.stringify(sysActions));
  check("no audit jump in detail", (await page.locator(".role-detail-page [data-audit-ref]").count()) === 0);
  check("no system note", !(await page.locator(".detail-section .module-note").first().isVisible().catch(() => false)));
  // role summary (4-col grid)
  check("role summary tiles", (await page.locator(".role-detail-page .detail-grid .detail-tile").count()) >= 4);
  // permission accordion: แสดงเฉพาะ module ที่ได้รับสิทธิ์
  const groupCount = await page.locator(".perm-group").count();
  check("perm groups > 0", groupCount > 0, `${groupCount} groups`);
  const itemCount = await page.locator(".perm-item").count();
  check("perm items rendered", itemCount === 40, `${itemCount} items`);
  const subTitles = await page.locator(".perm-sub-title").allTextContents();
  check("submenu titles present", ["User Accounts", "Reported Users", "Audit Log"].every(t => subTitles.includes(t)), subTitles.slice(0, 6).join(","));
  // ทุก item มี check icon
  const checkIcons = await page.locator(".perm-item .perm-check").count();
  check("every item has check", checkIcons === itemCount, `${checkIcons}/${itemCount}`);
  // ไม่มี pill แท็กท้ายแถว
  check("no pills in perm items", (await page.locator(".perm-item .pill").count()) === 0);
  // ไม่มี filter bar / search / head row
  check("no perm filter bar", (await page.locator(".role-perm-filter-bar").count()) === 0);
  check("no perm search", (await page.locator("#role-perm-search").count()) === 0);
  check("no table head", (await page.locator(".perm-row.head").count()) === 0);

  // collapse toggle
  const firstHead = page.locator(".perm-group-head").first();
  const wasExpanded = await firstHead.getAttribute("aria-expanded");
  await firstHead.click();
  const nowExpanded = await firstHead.getAttribute("aria-expanded");
  check("group collapse toggles", wasExpanded !== nowExpanded, `${wasExpanded}→${nowExpanded}`);
  const collapsedSubs = page.locator(".perm-group.is-collapsed .perm-sub");
  check("collapsed group hides items", (await collapsedSubs.count()) > 0 && !(await collapsedSubs.first().isVisible()), `${await collapsedSubs.count()} hidden`);
  await firstHead.click();

  // back → list; ตั้ง search แล้วเปิด detail อีกครั้ง → back ต้อง restore search
  await page.locator("[data-role-back]").click();
  await page.waitForSelector("body.role-list-mode", { timeout: 5000 });
  await page.fill("#role-search", "content");
  await page.waitForTimeout(200);
  await openRole(page, "ROL-007");
  // Content Editor — module ที่ไม่มีสิทธิ์เลยถูกซ่อน
  const ceGroups = await page.locator(".perm-group").count();
  check("content editor: only granted modules shown", ceGroups < 10 && ceGroups > 0, `${ceGroups} groups`);
  const ceItems = await page.locator(".perm-item").count();
  const ceNames = await page.locator(".perm-item .perm-item-name").allTextContents();
  check("content editor: granted items only", ceItems > 0 && ceNames.every(t => t.trim().length > 0), `${ceItems} items`);
  await page.locator("[data-role-back]").click();
  await page.waitForSelector("body.role-list-mode", { timeout: 5000 });
  const searchVal = await page.locator("#role-search").inputValue();
  check("back restores list search", searchVal === "content", `"${searchVal}"`);
  await page.fill("#role-search", "");
  await page.waitForTimeout(150);

  // Custom Role active → edit/copy/deactivate + audit
  await openRole(page, "ROL-101");
  const custActions = await page.locator(".role-detail-actions .user-detail-action-btn").allTextContents();
  check("custom active actions", custActions.length === 3 && custActions[0].includes("แก้ไข") && custActions[2].includes("ปิดใช้งาน"), JSON.stringify(custActions));
  const tileTexts = await page.locator(".detail-tile").allTextContents();
  check("no trivia tiles", !tileTexts.some(t => t.includes("Source Template") || t.includes("Revision")), JSON.stringify(tileTexts.map(t => t.split("\n")[0].trim())));

  // Custom Role inactive → reactivate + warning note
  await page.locator("[data-role-back]").click();
  await page.waitForSelector("body.role-list-mode");
  await openRole(page, "ROL-103");
  const inactActions = await page.locator(".role-detail-actions .user-detail-action-btn").allTextContents();
  check("inactive custom actions", inactActions.length === 3 && inactActions.some(t => t.includes("เปิดใช้งาน")), JSON.stringify(inactActions));
  check("inactive warning", await page.locator(".role-inactive-note").isVisible());

  // ไม่มีปุ่มลิงก์ไป Audit Log ทั้งใน list row menu และ detail (trace จะอยู่ใน history section ของหน้านี้)
  await page.locator("[data-role-back]").click();
  await page.waitForSelector("body.role-list-mode", { timeout: 5000 });
  check("no audit jump in list rows", (await page.locator(".role-list-table [data-audit-ref]").count()) === 0);

  // ---------- Mobile 390 ----------
  const mob = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  mob.on("pageerror", e => errors.push("mobile: " + String(e)));
  await mob.goto(`${BASE}/bo-prototype.html`);
  if (await mob.locator("#login-screen").isVisible().catch(() => false)) {
    await mob.locator("#login-form button[type=\"submit\"]").click();
    await mob.waitForSelector("#otp-form:not(.hidden)", { timeout: 5000 });
    await mob.locator("#verify-otp-btn").click();
    await mob.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
  }
  await mob.locator("#menu-toggle").click();
  await mob.waitForTimeout(300);
  await mob.locator(".nav-item[data-module='settings']").click();
  await mob.waitForTimeout(250);
  await mob.locator(".submenu button[data-sub='Roles & Permissions']").click();
  await mob.waitForSelector("body.role-list-mode", { timeout: 5000 });
  await mob.locator(".user-row[data-role-card='ROL-003']").first().click();
  await mob.waitForSelector("body.role-detail-mode", { timeout: 5000 });

  check("mobile: accordion rendered", await mob.locator(".perm-item").first().isVisible());
  check("mobile: group collapse works", await (async () => {
    const h = mob.locator(".perm-group-head").first();
    const before = await h.getAttribute("aria-expanded");
    await h.click();
    return before !== (await h.getAttribute("aria-expanded"));
  })());
  // no horizontal scroll
  const hScroll = await mob.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  check("mobile: no horizontal scroll", !hScroll);

  check("no page errors", errors.length === 0, errors.join(" | ").slice(0, 300));

  await browser.close();
  const fails = results.filter(r => !r.ok).length;
  console.log(`\n${results.length - fails}/${results.length} checks passed`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error("SCRIPT ERROR:", e); process.exit(2); });
