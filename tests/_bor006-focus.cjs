// BOR-006 smoke check: shared modal focus management (Contract C — initial focus / trap / restore)
// Standalone script — not a playwright spec. Run: node tests/_bor006-focus.cjs
const { chromium } = require("@playwright/test");

const BASE = "http://localhost:8080/bo-prototype.html";

let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log(`PASS  ${name}`); }
  else { fail++; console.log(`FAIL  ${name} ${extra}`); }
}

const modalOpen = (page) =>
  page.evaluate(() => document.querySelector("#user-action-modal")?.classList.contains("show"));

const activeTag = (page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    return el ? `${el.tagName.toLowerCase()}#${el.id || ""}.${el.className}` : "null";
  });

const activeInModal = (page) =>
  page.evaluate(() => document.querySelector("#user-action-modal")?.contains(document.activeElement));

async function login(page) {
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");
  const loginScreen = page.locator("#login-screen");
  if (await loginScreen.isVisible({ timeout: 1500 }).catch(() => false)) {
    await page.locator("#login-form button[type='submit']").click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await page.waitForTimeout(500);
  }
}

async function navTo(page, moduleId, sub) {
  const parent = page.locator(`.nav-item[data-module='${moduleId}']`);
  const expanded = await parent.evaluate((el) => el.classList.contains("expanded")).catch(() => false);
  if (!expanded) await parent.click();
  await page.waitForTimeout(250);
  await page.locator(`.submenu[data-submenu='${moduleId}'] button[data-sub='${sub}']`).click();
  await page.waitForTimeout(400);
}

(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await login(page);

  // ---------- 1. Form modal: Invite Admin → initial focus = first fillable field ----------
  await navTo(page, "settings", "Admin Accounts");
  await page.locator("[data-admin-account-invite-open]").click();
  await page.waitForTimeout(300);
  check("F1 invite modal opens", await modalOpen(page));
  check("F1 initial focus = first field #admin-account-invite-name",
    await page.evaluate(() => document.activeElement?.id === "admin-account-invite-name"),
    await activeTag(page));
  check("F1 initial focus shows :focus-visible ring (text input heuristic)",
    await page.evaluate(() => document.activeElement?.matches(":focus-visible")));

  // Tab trap: move to first focusable (X) then Shift+Tab → wraps to last
  await page.evaluate(() => getUserActionModalFocusableElements()[0]?.focus());
  await page.keyboard.press("Shift+Tab");
  await page.waitForTimeout(100);
  check("F1 Shift+Tab on first → wraps to last focusable",
    await page.evaluate(() => {
      const list = getUserActionModalFocusableElements();
      return document.activeElement === list[list.length - 1];
    }));

  // Tab from last wraps back to first focusable (X)
  await page.keyboard.press("Tab");
  await page.waitForTimeout(100);
  check("F1 Tab on last → wraps to first focusable (X)",
    await page.evaluate(() => document.activeElement === getUserActionModalFocusableElements()[0]));

  // close via ยกเลิก → restore focus to opener button
  await page.locator("#user-action-modal [data-user-action-modal-close]").last().click();
  await page.waitForTimeout(300);
  check("F1 modal closed via ยกเลิก", !(await modalOpen(page)));
  check("F1 focus restored to opener [data-admin-account-invite-open]",
    await page.evaluate(() => document.activeElement?.hasAttribute("data-admin-account-invite-open")),
    await activeTag(page));

  // ---------- 2. Destructive confirm: Suspend → initial focus = ยกเลิก ----------
  await navTo(page, "users", "User Accounts");
  await page.locator(".user-row[data-user-card='U-1017'] .user-cell-primary").click();
  await page.waitForTimeout(400);
  const suspendBtn = page.locator("button[data-user-action='Suspend']");
  await suspendBtn.click();
  await page.waitForTimeout(300);
  check("D1 suspend modal opens", await modalOpen(page));
  check("D1 initial focus = ยกเลิก (last close control, least destructive)",
    await page.evaluate(() => {
      const el = document.activeElement;
      return el?.hasAttribute("data-user-action-modal-close") && (el.textContent || "").includes("ยกเลิก");
    }), await activeTag(page));
  check("D1 ยกเลิก no :focus-visible ring on mouse-open (BOR-006a: ring เฉพาะ keyboard flow)",
    await page.evaluate(() => !document.activeElement?.matches(":focus-visible")));
  // ESC on non-dismissible confirm → stays open (Contract B)
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  check("D1 ESC does not close confirm modal", await modalOpen(page));
  await page.locator("#user-action-modal [data-user-action-modal-close]").last().click();
  await page.waitForTimeout(300);
  check("D1 focus restored to Suspend opener button",
    await page.evaluate(() => document.activeElement?.dataset?.userAction === "Suspend"),
    await activeTag(page));

  // ---------- 3. Read-only dismissible: Delivery Log detail → focus X, ESC/backdrop close ----------
  await navTo(page, "settings", "Delivery Logs");
  await page.waitForTimeout(400);
  const firstRow = page.locator(".user-row[data-delivery-card]").first();
  await firstRow.click();
  await page.waitForTimeout(400);
  const roOpen = await modalOpen(page);
  check("R1 read-only modal opens", roOpen);
  if (roOpen) {
    check("R1 initial focus = X close (first close control)",
      await page.evaluate(() => document.activeElement?.hasAttribute("data-user-action-modal-close")),
      await activeTag(page));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    check("R1 ESC closes dismissible modal", !(await modalOpen(page)));
    check("R1 focus restored to clicked delivery row (last-trigger fallback)",
      await page.evaluate(() => document.activeElement?.classList?.contains("user-row") && document.activeElement?.hasAttribute("data-delivery-card")),
      await activeTag(page));
    check("R1 restored row shows :focus-visible ring (closed via ESC = keyboard)",
      await page.evaluate(() => document.activeElement?.matches(":focus-visible")));
  }

  // ---------- 4. Keyboard-opened modal: Enter on button → focus into modal ----------
  await navTo(page, "settings", "Admin Accounts");
  await page.locator("[data-admin-account-invite-open]").focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(300);
  check("K1 Enter on invite button opens modal", await modalOpen(page));
  check("K1 focus lands inside modal", await activeInModal(page), await activeTag(page));
  check("K1 focus shows :focus-visible ring (keyboard-opened)",
    await page.evaluate(() => document.activeElement?.matches(":focus-visible")));
  // Tab stays inside modal across full cycle
  let escaped = false;
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    if (!(await activeInModal(page))) { escaped = true; break; }
  }
  check("K1 Tab x12 never leaves modal (trap holds)", !escaped);

  // ---------- 5. Opener removed → fallback to #page-title ----------
  await page.evaluate(() => document.querySelector("[data-admin-account-invite-open]")?.remove());
  await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
  await page.waitForTimeout(350);
  check("R2 focus falls back to #page-title when opener is gone",
    await page.evaluate(() => document.activeElement?.id === "page-title"),
    await activeTag(page));

  // ---------- 6. Type-to-confirm modals → initial focus = confirm input (gate rule) ----------
  // option delete (ไม่มี per-modal focus() ของตัวเอง — ต้องได้จาก shared rule)
  await page.evaluate(() => {
    const g = optionMasterGroups.find(gr => gr.options.some(o => !o.used_in_assets));
    const opt = g?.options.find(o => !o.used_in_assets);
    if (opt) openOptionDeleteConfirmModal(opt.id);
  });
  await page.waitForTimeout(300);
  const t1Open = await modalOpen(page);
  check("T1 option delete modal opens", t1Open);
  if (t1Open) {
    check("T1 initial focus = type-to-confirm input",
      await page.evaluate(() => document.activeElement?.hasAttribute("data-option-delete-confirm-input")),
      await activeTag(page));
    await page.locator("#user-action-modal [data-user-action-modal-close]").last().click();
    await page.waitForTimeout(200);
  }
  // group delete (มี per-modal focus() อยู่แล้ว — ต้องไม่ขัดกัน)
  await page.evaluate(() => {
    const g = optionMasterGroups.find(gr => !gr.is_active && !isGroupUsedInAssets(gr.group_id));
    if (g) openOptionGroupDeleteConfirmModal(g.group_id);
  });
  await page.waitForTimeout(300);
  const t2Open = await modalOpen(page);
  check("T2 group delete modal opens", t2Open);
  if (t2Open) {
    check("T2 initial focus = type-to-confirm input",
      await page.evaluate(() => document.activeElement?.hasAttribute("data-option-group-delete-confirm-input")),
      await activeTag(page));
    await page.locator("#user-action-modal [data-user-action-modal-close]").last().click();
    await page.waitForTimeout(200);
  }

  check("no page errors", errors.length === 0, errors.join(" | "));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
