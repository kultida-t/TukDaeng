// BOR-006a verify: (A) phone-preview close button back to absolute top-right
// (B) focus ring/tooltip keyboard-only — no :focus-visible on mouse open/close
// Scope Change อนุมัติระหว่างตรวจรับ BOR-009 — shared modal focus placement/trap/restore คงเดิม
// Standalone script — not a playwright spec. Run: node tests/_bor006a-verify.cjs
const { chromium } = require("@playwright/test");

const BASE = "http://localhost:8080/bo-prototype.html";

let pass = 0, fail = 0;
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log(`PASS  ${name}`); }
  else { fail++; console.log(`FAIL  ${name} ${extra}`); }
}

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

const modalOpen = (page) =>
  page.evaluate(() => document.querySelector("#user-action-modal")?.classList.contains("show"));
const activeIsFocusVisible = (page) =>
  page.evaluate(() => document.activeElement?.matches(":focus-visible") || false);

(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await login(page);

  // ---------- A. Phone preview close button position ----------
  await page.evaluate(() => jumpToModule("content", "Reported Articles"));
  await page.waitForTimeout(400);
  await page.locator(".asset-row[data-board-report-card='RPC-039']").first().click();
  await page.waitForTimeout(400);
  await page.locator("button:has-text('View Article')").first().click();
  await page.waitForTimeout(400);
  check("A1 phone preview modal opens", await modalOpen(page));
  const pos = await page.evaluate(() => {
    const btn = document.querySelector(".board-report-phone-preview-close");
    const wrap = document.querySelector(".board-report-phone-preview");
    const b = btn.getBoundingClientRect(), w = wrap.getBoundingClientRect();
    return { position: getComputedStyle(btn).position, bTop: b.top, bRight: b.right, wTop: w.top, wRight: w.right };
  });
  check("A1 close btn position = absolute", pos.position === "absolute", pos.position);
  check("A1 close btn at top-right (top≈wrap+6, right≈wrap-6)",
    Math.abs(pos.bTop - (pos.wTop + 6)) <= 2 && Math.abs(pos.bRight - (pos.wRight - 6)) <= 2,
    JSON.stringify(pos));

  // ---------- B. Focus ring on mouse-opened read-only modal ----------
  check("B1 initial focus = close X (read-only surface)", await page.evaluate(() =>
    document.activeElement?.classList.contains("board-report-phone-preview-close")));
  check("B1 NO :focus-visible ring on mouse-open", !(await activeIsFocusVisible(page)));
  check("B1 'ปิด' tooltip NOT shown on mouse-open", await page.evaluate(() => {
    const btn = document.activeElement;
    return getComputedStyle(btn, "::after").visibility === "hidden";
  }));

  // ---------- B. Mouse close → restore focus to opener, no ring ----------
  await page.locator(".board-report-phone-preview-close").click();
  await page.waitForTimeout(300);
  check("B2 modal closed via X click", !(await modalOpen(page)));
  check("B2 focus restored to View Article opener", await page.evaluate(() =>
    (document.activeElement?.textContent || "").includes("View Article")),
    await page.evaluate(() => document.activeElement?.textContent));
  check("B2 NO :focus-visible ring on mouse-close restore", !(await activeIsFocusVisible(page)));

  // ---------- B. Keyboard close (ESC) → restored focus DOES show ring ----------
  await page.locator("button:has-text('View Article')").first().click();
  await page.waitForTimeout(400);
  check("B3 modal reopened", await modalOpen(page));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  check("B3 ESC closes modal", !(await modalOpen(page)));
  check("B3 restored focus shows :focus-visible (keyboard close)", await activeIsFocusVisible(page));

  // ---------- B. Form modal (mouse) → focus first field, text input shows caret ----------
  await page.evaluate(() => jumpToModule("content", "Categories"));
  await page.waitForTimeout(400);
  await page.locator("[data-category-add]").click();
  await page.waitForTimeout(300);
  check("B4 Add Category initial focus = name field", await page.evaluate(() =>
    document.activeElement?.hasAttribute("data-category-name")),
    await page.evaluate(() => document.activeElement?.className));
  check("B4 text input shows :focus-visible (field caret cue — intended)", await activeIsFocusVisible(page));
  await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
  await page.waitForTimeout(300);

  // ---------- B. Confirm modal (mouse) → focus ยกเลิก, no ring ----------
  await page.evaluate(() => jumpToModule("users", "User Accounts"));
  await page.waitForTimeout(400);
  await page.locator(".user-row[data-user-card='U-1017'] .user-cell-primary").click();
  await page.waitForTimeout(400);
  await page.locator("button[data-user-action='Suspend']").click();
  await page.waitForTimeout(300);
  check("B5 confirm modal initial focus = ยกเลิก", await page.evaluate(() =>
    document.activeElement?.hasAttribute("data-user-action-modal-close") &&
    (document.activeElement?.textContent || "").includes("ยกเลิก")));
  check("B5 NO :focus-visible ring on mouse-opened confirm", !(await activeIsFocusVisible(page)));
  await page.locator("#user-action-modal [data-user-action-modal-close]").last().click();
  await page.waitForTimeout(300);

  // ---------- B. Keyboard-opened modal → ring shows (a11y cue preserved) ----------
  // (อยู่ User Detail U-1017 ต่อจาก B5 — focus Suspend button แล้วกด Enter)
  await page.evaluate(() => document.querySelector("button[data-user-action='Suspend']")?.focus());
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  check("B6 keyboard-opened (Enter) confirm modal", await modalOpen(page));
  check("B6 initial focus = ยกเลิก", await page.evaluate(() =>
    document.activeElement?.hasAttribute("data-user-action-modal-close") &&
    (document.activeElement?.textContent || "").includes("ยกเลิก")));
  check("B6 :focus-visible ring shown on keyboard-open", await activeIsFocusVisible(page));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  check("no page errors", errors.length === 0, errors.join(" | "));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
