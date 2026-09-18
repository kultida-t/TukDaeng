// Temp verification for Role List/Detail states + responsive (RP-010)
const { chromium } = require("@playwright/test");

const BASE = "http://127.0.0.1:8080";
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

async function goRoleList(page, mobile = false) {
  if (mobile) {
    await page.locator("#menu-toggle").click();
    await page.waitForTimeout(300);
  }
  await page.locator(".nav-item[data-module='settings']").click();
  await page.waitForTimeout(250);
  await page.locator(".submenu button[data-sub='Roles & Permissions']").click();
  await page.waitForSelector("body.role-list-mode", { timeout: 5000 });
}

async function pickScenario(page, selectId, value) {
  const sel = page.locator(`#${selectId}`).locator("..");
  const tools = sel.locator("xpath=ancestor::details[1]");
  if (!(await tools.evaluate(el => el.open))) {
    await tools.locator("summary").click();
    await page.waitForTimeout(120);
  }
  await sel.locator("[data-custom-select-trigger]").click();
  await page.waitForTimeout(120);
  await sel.locator(`[data-custom-select-option][data-value="${value}"]`).click();
  await page.waitForTimeout(200);
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

const noHScroll = async page =>
  !(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth));

(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));

  // ---------- Role List states (1440) ----------
  await login(page);
  await goRoleList(page);

  check("list: scenario tools present", await page.locator(".role-state-tools").isVisible());
  check("list: tools outside filters", (await page.locator(".filters .role-state-tools").count()) === 0);
  check("list: tools outside table scroll area", (await page.locator("#table .role-state-tools").count()) === 0);
  check("list: tools as panel footer after table", await page.evaluate(() => {
    const tools = document.querySelector(".panel > .role-state-tools");
    return !!tools && tools.previousElementSibling?.id === "table";
  }));
  check("list: normal rows render", (await page.locator(".user-row[data-role-card]").count()) > 0);

  // loading skeleton — ไม่มี role data หลุด
  await pickScenario(page, "role-list-state", "loading");
  check("list loading: skeleton rows", (await page.locator(".role-skel-row").count()) === 6);
  check("list loading: no role data", (await page.locator(".user-row[data-role-card]").count()) === 0);
  check("list loading: aria-busy", await page.locator(".role-list-table[aria-busy='true']").isVisible());
  check("list loading: tools still outside table", (await page.locator(".panel > .role-state-tools").count()) === 1
    && (await page.locator("#table .role-state-tools").count()) === 0);

  // error + retry คง filter — ตั้ง search ไว้ก่อน แล้วสลับ state โดยไม่แตะ filter bar
  await pickScenario(page, "role-list-state", "ready");
  await page.fill("#role-search", "ROL-10");
  await page.waitForTimeout(200);
  await pickScenario(page, "role-list-state", "error");
  check("list error: block shown", (await page.locator(".role-state-block .empty-title").textContent()).includes("ไม่สำเร็จ"));
  check("list error: retry btn", await page.locator("[data-role-retry]").isVisible());
  check("list error: filter bar kept", await page.locator("#role-search").isVisible());
  await page.locator("[data-role-retry]").click();
  await page.waitForSelector(".role-skel-row", { timeout: 3000 });
  await page.waitForSelector(".user-row[data-role-card]", { timeout: 5000 });
  check("list retry: rows restored", (await page.locator(".user-row[data-role-card]").count()) > 0);
  check("list retry: search preserved", (await page.locator("#role-search").inputValue()) === "ROL-10");

  // empty — ยังไม่มี Custom Role + create action
  await pickScenario(page, "role-list-state", "empty");
  check("list empty: title", (await page.locator(".role-state-block .empty-title").textContent()).includes("ยังไม่มี Custom Role"));
  check("list empty: create btn", await page.locator(".role-state-block [data-role-create-open]").isVisible());

  // unauthorized — no table head, way back to dashboard
  await pickScenario(page, "role-list-state", "unauthorized");
  check("list unauthorized: title", (await page.locator(".role-state-block .empty-title").textContent()).includes("ไม่มีสิทธิ์"));
  check("list unauthorized: no data rows", (await page.locator(".user-row[data-role-card]").count()) === 0);
  await page.locator("[data-role-go-dashboard]").click();
  await page.waitForSelector("body.dashboard-mode", { timeout: 5000 });
  check("list unauthorized: back to dashboard", true);
  check("dashboard: no role tools leak", (await page.locator(".role-state-tools").count()) === 0);

  // no-result — search ไม่เจอ + ล้างตัวกรอง
  await goRoleList(page);
  await page.fill("#role-search", "zzzz-no-match");
  await page.waitForTimeout(250);
  check("no-result: title", (await page.locator(".role-state-block .empty-title").textContent()).includes("ไม่พบ Role"));
  const clearBtn = page.locator(".role-state-block [data-role-reset]");
  check("no-result: clear btn", await clearBtn.isVisible());
  await clearBtn.click();
  await page.waitForSelector(".user-row[data-role-card]", { timeout: 5000 });
  check("no-result: reset restores rows + clears search", (await page.locator("#role-search").inputValue()) === "");

  // ---------- Role Detail states (1440) ----------
  await openRole(page, "ROL-101");
  check("detail: scenario tools present", await page.locator(".role-state-tools").isVisible());
  check("detail: actions visible in ready", (await page.locator(".role-detail-actions .user-detail-action-btn").count()) === 3);

  // loading — skeleton ไม่มีข้อมูลหลุด
  await pickScenario(page, "role-detail-state", "loading");
  check("detail loading: skeleton page", await page.locator(".role-skel-page").isVisible());
  check("detail loading: no perm items", (await page.locator(".perm-item").count()) === 0);
  check("detail loading: no actions", (await page.locator(".role-detail-actions").count()) === 0);

  // partial — head/summary คงไว้ error เฉพาะส่วน permission
  await pickScenario(page, "role-detail-state", "partial");
  check("partial: head kept", await page.locator(".role-detail-page .asset-report-heading").isVisible());
  check("partial: summary kept", (await page.locator(".detail-tile").count()) >= 4);
  check("partial: perm error shown", await page.locator(".role-perm-error").isVisible());
  check("partial: perm data hidden", (await page.locator(".perm-item").count()) === 0);
  check("partial: actions kept", (await page.locator(".role-detail-actions .user-detail-action-btn").count()) === 3);
  await page.locator("[data-role-perm-retry]").click();
  await page.waitForSelector(".perm-item", { timeout: 5000 });
  check("partial retry: perms restored", (await page.locator(".perm-item").count()) > 0);

  // error — full page + retry
  await pickScenario(page, "role-detail-state", "error");
  check("detail error: block", (await page.locator(".role-state-block .empty-title").textContent()).includes("ไม่สำเร็จ"));
  check("detail error: no actions", (await page.locator(".role-detail-actions").count()) === 0);
  check("detail error: no perm data", (await page.locator(".perm-item").count()) === 0);
  await page.locator("[data-role-detail-retry]").click();
  await page.waitForSelector(".perm-item", { timeout: 5000 });
  check("detail retry: content restored", (await page.locator(".perm-item").count()) > 0);

  // unauthorized — no actions, no perm data
  await pickScenario(page, "role-detail-state", "unauthorized");
  check("detail unauthorized: title", (await page.locator(".role-state-block .empty-title").textContent()).includes("ไม่มีสิทธิ์"));
  check("detail unauthorized: no actions", (await page.locator(".role-detail-actions").count()) === 0);
  check("detail unauthorized: no perm data", (await page.locator(".perm-item").count()) === 0);
  check("detail unauthorized: back btn", await page.locator(".role-state-block [data-role-back]").isVisible());

  // notfound — scenario + real missing id
  await pickScenario(page, "role-detail-state", "notfound");
  check("detail notfound: title", (await page.locator(".role-state-block .empty-title").textContent()).includes("ไม่พบ Role"));
  check("detail notfound: no actions", (await page.locator(".role-detail-actions").count()) === 0);

  // stale — refresh reloads
  await pickScenario(page, "role-detail-state", "stale");
  check("detail stale: title", (await page.locator(".role-state-block .empty-title").textContent()).includes("เปลี่ยนแปลง"));
  check("detail stale: refresh btn", await page.locator("[data-role-detail-refresh]").isVisible());
  await page.locator("[data-role-detail-refresh]").click();
  await page.waitForSelector(".perm-item", { timeout: 5000 });
  check("stale refresh: content restored", (await page.locator(".perm-item").count()) > 0);

  // back → list + เปิด role id ที่ไม่มีจริง (notfound state จริง)
  await page.locator("[data-role-back]").first().click();
  await page.waitForSelector("body.role-list-mode", { timeout: 5000 });
  await page.evaluate(() => renderRoleDetailPage("ROL-999"));
  await page.waitForSelector(".role-state-block", { timeout: 3000 });
  check("real missing role: notfound state", (await page.locator(".role-state-block .empty-title").textContent()).includes("ไม่พบ Role"));
  await page.locator(".role-state-block [data-role-back]").click();
  await page.waitForSelector("body.role-list-mode", { timeout: 5000 });
  check("missing role back: returns to list", true);

  // back navigation — filter restore หลังเปิด detail → back
  await page.fill("#role-search", "content");
  await page.waitForTimeout(200);
  await openRole(page, "ROL-007");
  await page.locator("[data-role-back]").first().click();
  await page.waitForSelector("body.role-list-mode", { timeout: 5000 });
  check("back: search restored", (await page.locator("#role-search").inputValue()) === "content");
  await page.fill("#role-search", "");
  await page.waitForTimeout(150);

  // ---------- viewports ----------
  // sidebar ซ่อนหลัง menu-toggle ที่ ≤1180px — 768/390 ต้องเปิด nav ผ่าน hamburger
  for (const [w, h, mobile] of [[1280, 800, false], [768, 1024, true], [390, 844, true]]) {
    const p = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
    p.on("pageerror", e => errors.push(`${w}px: ${e}`));
    await login(p);
    await goRoleList(p, mobile);
    check(`${w}px list: no h-scroll`, await noHScroll(p));
    check(`${w}px list: rows/cards render`, (await p.locator(".user-row[data-role-card]").count()) > 0);
    // skeleton ที่ viewport นี้
    await pickScenario(p, "role-list-state", "loading");
    check(`${w}px list: skeleton`, (await p.locator(".role-skel-row").count()) === 6);
    check(`${w}px list loading: no h-scroll`, await noHScroll(p));
    await pickScenario(p, "role-list-state", "error");
    check(`${w}px list: error block`, await p.locator(".role-state-block").isVisible());
    check(`${w}px list error: no h-scroll`, await noHScroll(p));
    check(`${w}px list error: state row fits card width`, await p.evaluate(() => {
      const row = document.querySelector(".role-list-table .user-row.empty");
      const table = document.querySelector(".role-list-table");
      if (!row || !table) return false;
      return row.getBoundingClientRect().width <= table.getBoundingClientRect().width + 1;
    }));
    await pickScenario(p, "role-list-state", "ready");
    await p.waitForTimeout(100);
    // detail — mobile card ซ่อน desktop cell คลิกที่ row โดยตรง
    const row = p.locator(".user-row[data-role-card]").first();
    await row.click();
    await p.waitForSelector("body.role-detail-mode", { timeout: 5000 });
    check(`${w}px detail: no h-scroll`, await noHScroll(p));
    await pickScenario(p, "role-detail-state", "error");
    check(`${w}px detail: error block`, await p.locator(".role-state-block").isVisible());
    check(`${w}px detail error: no h-scroll`, await noHScroll(p));
    // keyboard — retry focusable + activatable
    await p.locator("[data-role-detail-retry]").focus();
    await p.keyboard.press("Enter");
    await p.waitForSelector(".perm-item", { timeout: 5000 });
    check(`${w}px detail: keyboard retry works`, true);
    await p.close();
  }

  check("no page errors", errors.length === 0, errors.join(" | ").slice(0, 400));

  await browser.close();
  const fails = results.filter(r => !r.ok).length;
  console.log(`\n${results.length - fails}/${results.length} checks passed`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error("SCRIPT ERROR:", e); process.exit(2); });
