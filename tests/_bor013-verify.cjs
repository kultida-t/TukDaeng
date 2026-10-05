// BOR-013 verify: Keyboard (Contract C, BOR-006) + Responsive verification + Manual QA flow
// Contracts: docs/bo-modal-empty-state-contract.md (Contract B/C), docs/bo-shared-remediation-coverage.md
// + BOR-006a: no :focus-visible ring on mouse flow (keyboard-only cue)
// Covers:
//   Part 1 — Keyboard journey @1440: sidebar nav by keyboard, Enter-opens modal,
//            initial focus per type, Tab/Shift+Tab trap, ESC per close policy,
//            Enter-close, focus restore + ring, trap release after close
//   Part 2 — Mouse flow (BOR-006a): no focus ring on mouse open/close
//   Part 3 — Responsive sweep @1440/1280/768/390: no x-overflow, table→card
//            breakpoint, filter bar toggle, menu-toggle, modal containment
//   Part 4 — Keyboard + modal spot checks @390 (trap/restore on mobile viewport)
//
// Standalone script — run: node tests/_bor013-verify.cjs

const { chromium } = require("@playwright/test");

const BASE = "http://localhost:8080/bo-prototype.html";

let pass = 0, fail = 0;
const findings = [];
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log(`PASS  ${name}`); }
  else { fail++; findings.push(`${name} ${extra}`); console.log(`FAIL  ${name} ${extra}`); }
}
function note(msg) { console.log(`NOTE  ${msg}`); }
function suite(name) { console.log(`\n=== [SUITE] ${name} ===`); }

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

async function goTo(page, moduleId, sub) {
  const vw = (page.viewportSize() || { width: 1440 }).width;
  if (vw <= 1180) {
    const isNavOpen = await page.evaluate(() => document.body.classList.contains("nav-open"));
    if (!isNavOpen) { await page.locator("#menu-toggle").click(); await page.waitForTimeout(200); }
  }
  const parent = page.locator(`.nav-item[data-module='${moduleId}']`);
  if (sub) {
    const expanded = await parent.evaluate((el) => el.classList.contains("expanded")).catch(() => false);
    if (!expanded) { await parent.click(); await page.waitForTimeout(250); }
    await page.locator(`.submenu[data-submenu='${moduleId}'] button[data-sub='${sub}']`).click();
  } else {
    await parent.click();
  }
  await page.waitForTimeout(450);
  if (vw <= 1180) { await page.evaluate(() => setNavOpen(false)); await page.waitForTimeout(150); }
}

const modalOpen = (page) =>
  page.evaluate(() => document.querySelector("#user-action-modal")?.classList.contains("show"));
const activeInModal = (page) =>
  page.evaluate(() => !!document.querySelector("#user-action-modal")?.contains(document.activeElement));
const activeFocusVisible = (page) =>
  page.evaluate(() => document.activeElement?.matches(":focus-visible") || false);
const activeTag = (page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    return el ? `${el.tagName.toLowerCase()}#${el.id || ""}.${el.className}` : "null";
  });
const noXOverflow = (page) =>
  page.evaluate(() => document.scrollingElement.scrollWidth <= window.innerWidth + 1);
const modalCardRectOk = (page) =>
  page.evaluate(() => {
    const card = document.querySelector("#user-action-modal .user-action-modal");
    if (!card) return null;
    const r = card.getBoundingClientRect();
    return r.left >= -1 && r.right <= window.innerWidth + 1 && r.width > 0;
  });

// focus a real page element then press Enter (keyboard-opened surface)
async function keyboardOpen(page, selector) {
  await page.locator(selector).first().focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(350);
}

(async () => {
  const browser = await chromium.launch();

  // =========================================================================
  // PART 1: Desktop 1440 — Keyboard journey (Contract C full sequence)
  // =========================================================================
  {
    suite("Part 1: [1440] Keyboard journey — nav / initial focus / trap / ESC / restore");
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push(e.message));
    await login(page);

    // --- J1: sidebar keyboard navigation (nav items are real buttons) ---
    await page.locator(".nav-item[data-module='settings']").focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(250);
    check("J1 Enter on Settings nav item expands submenu",
      await page.evaluate(() => document.querySelector(".nav-item[data-module='settings']")?.classList.contains("expanded")));
    const subBtn = page.locator(".submenu[data-submenu='settings'] button[data-sub='Admin Accounts']");
    await subBtn.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(450);
    check("J1 Enter on submenu button lands on Admin Accounts", await page.evaluate(() =>
      document.body.classList.contains("admin-account-list-mode") ||
      document.querySelector("#page-title")?.textContent === "Admin Accounts"));

    // --- J2: keyboard-opened FORM modal → initial focus = first editable field ---
    await keyboardOpen(page, "[data-admin-account-invite-open]");
    check("J2 Enter on Invite Admin opens modal", await modalOpen(page));
    check("J2 form modal initial focus = first field", await page.evaluate(() =>
      document.activeElement?.id === "admin-account-invite-name"), await activeTag(page));
    check("J2 initial focus shows :focus-visible (keyboard-opened)", await activeFocusVisible(page));

    // --- J3: focus trap — full Tab cycle never escapes ---
    {
      const n = await page.evaluate(() => getUserActionModalFocusableElements().length);
      let escaped = false;
      for (let i = 0; i < n + 3; i++) {
        await page.keyboard.press("Tab");
        if (!(await activeInModal(page))) { escaped = true; break; }
      }
      check(`J3 Tab x${n + 3} never escapes modal (trap holds)`, !escaped);
      // Shift+Tab from first wraps to last
      await page.evaluate(() => getUserActionModalFocusableElements()[0]?.focus());
      await page.keyboard.press("Shift+Tab");
      await page.waitForTimeout(100);
      check("J3 Shift+Tab on first wraps to last focusable", await page.evaluate(() => {
        const list = getUserActionModalFocusableElements();
        return document.activeElement === list[list.length - 1];
      }));
      // Tab on last wraps to first
      await page.keyboard.press("Tab");
      await page.waitForTimeout(100);
      check("J3 Tab on last wraps to first focusable", await page.evaluate(() =>
        document.activeElement === getUserActionModalFocusableElements()[0]));
    }

    // --- J3b: ESC on form modal does NOT close (Contract B); ยกเลิก via Enter closes ---
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    check("J3b ESC does NOT close form modal (Contract B)", await modalOpen(page));
    {
      const cancelBtn = page.locator("#user-action-modal [data-user-action-modal-close]:visible").last();
      await cancelBtn.focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(300);
    }
    check("J3b Enter on ยกเลิก closes modal", !(await modalOpen(page)));
    check("J3b focus restored to Invite Admin opener", await page.evaluate(() =>
      document.activeElement?.hasAttribute("data-admin-account-invite-open")), await activeTag(page));
    check("J3b restored focus shows :focus-visible (keyboard close)", await activeFocusVisible(page));

    // --- J4: keyboard-opened CONFIRM modal → initial focus = least destructive ---
    await goTo(page, "users", "User Accounts");
    await page.locator(".user-row[data-user-card='U-1017'] .user-cell-primary").click();
    await page.waitForTimeout(400);
    await keyboardOpen(page, "button[data-user-action='Suspend']");
    check("J4 Enter on Suspend opens confirm modal", await modalOpen(page));
    check("J4 confirm initial focus = ยกเลิก (least destructive)", await page.evaluate(() =>
      document.activeElement?.hasAttribute("data-user-action-modal-close") &&
      (document.activeElement?.textContent || "").includes("ยกเลิก")), await activeTag(page));
    check("J4 initial focus shows :focus-visible (keyboard-opened)", await activeFocusVisible(page));
    {
      let escaped = false;
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press("Tab");
        if (!(await activeInModal(page))) { escaped = true; break; }
      }
      check("J4 Tab x12 never escapes confirm modal", !escaped);
    }
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    check("J4 ESC does NOT close confirm modal (Contract B)", await modalOpen(page));
    {
      // Enter while focused on ยกเลิก must cancel, not confirm
      const cancelBtn = page.locator("#user-action-modal [data-user-action-modal-close]:visible").last();
      await cancelBtn.focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(300);
    }
    check("J4 Enter on ยกเลิก closes + stays on User Detail", await page.evaluate(() =>
      !document.querySelector("#user-action-modal")?.classList.contains("show") &&
      document.body.classList.contains("user-detail-mode")));
    check("J4 focus restored to Suspend opener", await page.evaluate(() =>
      document.activeElement?.dataset?.userAction === "Suspend"), await activeTag(page));

    // --- J5: read-only modal → focus X, ESC closes, restore + ring ---
    await goTo(page, "settings", "Delivery Logs");
    const row = page.locator(".user-row[data-delivery-card]").first();
    await row.click();
    await page.waitForTimeout(400);
    check("J5 read-only detail modal opens", await modalOpen(page));
    check("J5 read-only initial focus = close control", await page.evaluate(() =>
      document.activeElement?.hasAttribute("data-user-action-modal-close")), await activeTag(page));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    check("J5 ESC closes dismissible modal (Contract B)", !(await modalOpen(page)));
    check("J5 focus restored to opener row (last-trigger)", await page.evaluate(() =>
      document.activeElement?.classList?.contains("user-row")), await activeTag(page));
    check("J5 restored focus shows :focus-visible (ESC close)", await activeFocusVisible(page));

    // --- J6: trap released after close — Tab moves on the page ---
    {
      const before = await activeTag(page);
      await page.keyboard.press("Tab");
      await page.waitForTimeout(100);
      const after = await activeTag(page);
      check("J6 Tab after close moves focus on page (trap released)", before !== after && after !== "null",
        `${before} -> ${after}`);
    }

    // --- J7: type-to-confirm modal → initial focus = gate input ---
    await page.evaluate(() => {
      const g = optionMasterGroups.find((gr) => gr.options.some((o) => !o.used_in_assets));
      const opt = g?.options.find((o) => !o.used_in_assets);
      if (opt) openOptionDeleteConfirmModal(opt.id);
    });
    await page.waitForTimeout(300);
    check("J7 type-to-confirm modal opens", await modalOpen(page));
    check("J7 initial focus = confirm input (gate)", await page.evaluate(() =>
      document.activeElement?.hasAttribute("data-option-delete-confirm-input")), await activeTag(page));
    await page.locator("#user-action-modal [data-user-action-modal-close]").last().click();
    await page.waitForTimeout(250);

    check("Part 1: no page errors", pageErrors.length === 0, pageErrors.slice(0, 3).join(" | "));
    await ctx.close();
  }

  // =========================================================================
  // PART 2: Mouse flow (BOR-006a) — no focus ring on mouse open/close
  // =========================================================================
  {
    suite("Part 2: [1440] Mouse flow — no :focus-visible ring (BOR-006a)");
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await login(page);

    // M1: mouse-opened confirm → focus on ยกเลิก but NO ring
    await goTo(page, "users", "User Accounts");
    await page.locator(".user-row[data-user-card='U-1017'] .user-cell-primary").click();
    await page.waitForTimeout(400);
    await page.locator("button[data-user-action='Suspend']").click();
    await page.waitForTimeout(300);
    check("M1 mouse-open confirm → focus = ยกเลิก", await page.evaluate(() =>
      document.activeElement?.hasAttribute("data-user-action-modal-close") &&
      (document.activeElement?.textContent || "").includes("ยกเลิก")));
    check("M1 mouse-open confirm → NO :focus-visible ring", !(await activeFocusVisible(page)));
    // mouse close → restore, no ring
    await page.locator("#user-action-modal [data-user-action-modal-close]").last().click();
    await page.waitForTimeout(300);
    check("M1 mouse close → restore to Suspend opener", await page.evaluate(() =>
      document.activeElement?.dataset?.userAction === "Suspend"), await activeTag(page));
    check("M1 mouse close → NO :focus-visible ring on restore", !(await activeFocusVisible(page)));

    // M2: mouse-opened read-only → focus X, no ring
    await goTo(page, "settings", "Delivery Logs");
    await page.locator(".user-row[data-delivery-card]").first().click();
    await page.waitForTimeout(400);
    check("M2 mouse-open read-only → focus close control", await page.evaluate(() =>
      document.activeElement?.hasAttribute("data-user-action-modal-close")));
    check("M2 mouse-open read-only → NO :focus-visible ring", !(await activeFocusVisible(page)));
    await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
    await page.waitForTimeout(250);

    // M3: mouse-opened form → focus first field (text input caret cue is intended)
    await goTo(page, "content", "Categories");
    await page.locator("[data-category-add]").click();
    await page.waitForTimeout(300);
    check("M3 mouse-open form → focus first field", await page.evaluate(() =>
      document.activeElement?.hasAttribute("data-category-name")), await activeTag(page));
    await page.locator("#user-action-modal [data-user-action-modal-close]").first().click();
    await page.waitForTimeout(250);

    await ctx.close();
  }

  // =========================================================================
  // PART 3: Responsive sweep — layout / table→card / filter bar / modal
  // =========================================================================
  const LIST_SURFACES = [
    // [label, module, sub, hasTable]
    ["Dashboard", "dashboard", null, false],
    ["User Accounts", "users", "User Accounts", true],
    ["Reported Users", "users", "Reported Users", true],
    ["Asset List", "assets", "Asset List", true],
    ["Reported Assets", "assets", "Reported Assets", true],
    ["Reported Comments", "assets", "Reported Comments", true],
    ["Offer List", "offers", null, true],
    ["Articles", "content", "Articles", true],
    ["Categories", "content", "Categories", false],
    ["Reported Articles", "content", "Reported Articles", true],
    ["Market Overview", "market", "Market Overview", false],
    ["Sync History", "market", "Sync History", true],
    ["Option Master", "option-master", null, true],
    ["Demand Overview", "watch-alerts", "Demand Overview", false],
    ["Search Insights", "watch-alerts", "Search Insights", false],
    ["Watch Alert List", "watch-alerts", "Watch Alert List", true],
    ["Account Deletion", "deletions", null, true],
    ["Admin Accounts", "settings", "Admin Accounts", true],
    ["Roles & Permissions", "settings", "Roles & Permissions", true],
    ["Policy & Versioning", "settings", "Policy & Versioning", true],
    ["Support Center", "settings", "Support Center", false],
    ["Delivery Logs", "settings", "Delivery Logs", true],
    ["Audit Log", "settings", "Audit Log", true],
  ];
  const headVisibleCount = (page) => page.evaluate(() =>
    [...document.querySelectorAll(".user-row.head, .asset-row.head")]
      .filter((el) => el.getClientRects().length > 0).length);
  const headTotalCount = (page) => page.evaluate(() =>
    document.querySelectorAll(".user-row.head, .asset-row.head").length);
  const cardMetaVisibleCount = (page) => page.evaluate(() =>
    [...document.querySelectorAll(".user-card-meta, .user-card-tags, .asset-card-tags")]
      .filter((el) => el.getClientRects().length > 0).length);
  const filterToggle = (page) => page.evaluate(() => {
    const t = [...document.querySelectorAll(".user-filter-toggle")]
      .find((el) => el.getClientRects().length > 0);
    if (!t) return "none";
    t.click();
    return "clicked";
  });
  const visibleSelects = (page) => page.evaluate(() =>
    [...document.querySelectorAll("[data-custom-select]")]
      .filter((el) => el.getClientRects().length > 0).length);

  for (const vw of [1440, 1280, 768, 390]) {
    suite(`Part 3: [${vw}] Responsive layout sweep — ${LIST_SURFACES.length} surfaces`);
    const ctx = await browser.newContext({ viewport: { width: vw, height: vw <= 500 ? 844 : 900 } });
    const page = await ctx.newPage();
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push(e.message));
    await login(page);

    // menu-toggle visibility rule (drawer nav ≤1180)
    const toggleVisible = await page.locator("#menu-toggle").isVisible();
    if (vw <= 1180) check(`R.${vw} menu-toggle visible (drawer nav)`, toggleVisible);
    else check(`R.${vw} menu-toggle hidden (persistent sidebar)`, !toggleVisible);

    for (const [label, mod, sub, hasTable] of LIST_SURFACES) {
      await goTo(page, mod, sub);
      check(`R.${vw} ${label} — no horizontal overflow`, await noXOverflow(page),
        `scrollWidth=${await page.evaluate(() => document.scrollingElement.scrollWidth)}`);
      const heads = await headTotalCount(page);
      if (hasTable && heads > 0) {
        const vis = await headVisibleCount(page);
        if (vw <= 760) {
          check(`R.${vw} ${label} — table head hidden (card mode)`, vis === 0, `visibleHeads=${vis}`);
          const cards = await cardMetaVisibleCount(page);
          check(`R.${vw} ${label} — mobile card meta/tags rendered`, cards > 0, `cards=${cards}`);
        } else {
          check(`R.${vw} ${label} — table head visible (table mode)`, vis > 0, `visibleHeads=${vis}`);
        }
      }
    }

    // filter bar collapse toggle on mobile (only surfaces with the toggle)
    if (vw <= 760) {
      for (const [label, mod, sub] of [
        ["User Accounts", "users", "User Accounts"],
        ["Watch Alert List", "watch-alerts", "Watch Alert List"],
        ["Delivery Logs", "settings", "Delivery Logs"],
        ["Audit Log", "settings", "Audit Log"],
        ["Admin Accounts", "settings", "Admin Accounts"],
      ]) {
        await goTo(page, mod, sub);
        const before = await visibleSelects(page);
        const r = await filterToggle(page);
        if (r === "none") { note(`R.${vw} ${label} — no filter toggle, skipped`); continue; }
        await page.waitForTimeout(350);
        const after = await visibleSelects(page);
        check(`R.${vw} ${label} — filter toggle reveals controls`, after > before || after > 0,
          `before=${before} after=${after}`);
        check(`R.${vw} ${label} — toggle sets aria-expanded`, await page.evaluate(() =>
          [...document.querySelectorAll(".user-filter-toggle")]
            .some((el) => el.getAttribute("aria-expanded") === "true")));
        await page.evaluate(() => {
          const t = [...document.querySelectorAll(".user-filter-toggle")]
            .find((el) => el.getClientRects().length > 0);
          t?.click();
        });
        await page.waitForTimeout(300);
        check(`R.${vw} ${label} — filter toggle collapses back`, (await visibleSelects(page)) === 0);
      }
    }

    // modal containment at this viewport (confirm modal — widest content type in scope)
    {
      const r = await page.evaluate(() => {
        renderUserActionPage(userManagementData.users.find((u) => u.id === "U-1017"), "Suspend");
        return true;
      }).then(() => true).catch((e) => String(e));
      check(`R.${vw} suspend confirm modal opens`, await modalOpen(page), r === true ? "" : `eval:${r}`);
      if (await modalOpen(page)) {
        const rectOk = await modalCardRectOk(page);
        check(`R.${vw} modal card within viewport width`, rectOk === true, JSON.stringify(rectOk));
        // footer action buttons reachable (not pushed off-screen)
        check(`R.${vw} footer buttons within viewport`, await page.evaluate(() => {
          const btns = [...document.querySelectorAll(
            "#user-action-modal .user-action-footer button, #user-action-modal .user-detail-actions button")]
            .filter((b) => b.offsetParent !== null);
          if (!btns.length) return null;
          return btns.every((b) => {
            const r = b.getBoundingClientRect();
            return r.left >= -1 && r.right <= window.innerWidth + 1;
          });
        }));
        check(`R.${vw} initial focus inside modal`, await activeInModal(page), await activeTag(page));
        await page.keyboard.press("Escape");
        await page.waitForTimeout(200);
        check(`R.${vw} ESC does NOT close confirm modal`, await modalOpen(page));
        await page.locator("#user-action-modal [data-user-action-modal-close]").last().click();
        await page.waitForTimeout(250);
        check(`R.${vw} modal closed via ยกเลิก`, !(await modalOpen(page)));
      }
    }

    check(`Part 3 [${vw}]: no page errors`, pageErrors.length === 0, pageErrors.slice(0, 3).join(" | "));
    await ctx.close();
  }

  // =========================================================================
  // PART 4: Mobile 390 — keyboard spot checks (trap/restore/menu keyboard)
  // =========================================================================
  {
    suite("Part 4: [390] Keyboard spot checks on mobile viewport");
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push(e.message));
    await login(page);

    // K-390a: menu-toggle keyboard operable (Enter opens drawer, aria-expanded syncs)
    await page.locator("#menu-toggle").focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
    check("K390 Enter on menu-toggle opens nav drawer", await page.evaluate(() =>
      document.body.classList.contains("nav-open")));
    check("K390 menu-toggle aria-expanded = true", await page.evaluate(() =>
      document.querySelector("#menu-toggle")?.getAttribute("aria-expanded") === "true"));
    // keyboard navigate drawer: focus nav item → Enter
    await page.locator(".nav-item[data-module='settings']").focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(250);
    await page.locator(".submenu[data-submenu='settings'] button[data-sub='Delivery Logs']").focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(450);
    await page.evaluate(() => setNavOpen(false));
    await page.waitForTimeout(200);
    check("K390 keyboard nav drawer lands on Delivery Logs", await page.evaluate(() =>
      document.querySelector("#page-title")?.textContent === "Delivery Logs"));

    // K-390b: focus trap + restore on mobile viewport (delivery log detail)
    const row = page.locator(".user-row[data-delivery-card]").first();
    await row.click();
    await page.waitForTimeout(400);
    check("K390 read-only modal opens @390", await modalOpen(page));
    check("K390 initial focus inside modal @390", await activeInModal(page), await activeTag(page));
    let escaped = false;
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      if (!(await activeInModal(page))) { escaped = true; break; }
    }
    check("K390 Tab x12 never escapes modal @390", !escaped);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    check("K390 ESC closes dismissible modal @390", !(await modalOpen(page)));
    check("K390 focus restored to opener row @390", await page.evaluate(() =>
      document.activeElement?.classList?.contains("user-row")), await activeTag(page));

    check("Part 4: no page errors", pageErrors.length === 0, pageErrors.slice(0, 3).join(" | "));
    await ctx.close();
  }

  await browser.close();

  console.log("\n=======================================================");
  console.log(`BOR-013 Verification Complete: ${pass} passed, ${fail} failed`);
  if (findings.length > 0) {
    console.log(`\nFINDINGS (${findings.length}):`);
    findings.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  } else {
    console.log("Verdict: Keyboard & Responsive contracts PASSED on all viewports.");
  }
  console.log("=======================================================");
  process.exit(fail > 0 ? 1 : 0);
})();
