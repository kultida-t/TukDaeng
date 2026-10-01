// BOR-011 regression: Shared Filter dropdown clipping (BOR-004 coverage F1–F11 + Audit Log)
// + Shared Modal consistency (BOR-005 Contract A action order / Contract B close policy, A1–A12 + B1–B16)
// + Focus spot checks (BOR-006 Contract C) — desktop + mobile viewports
// Standalone script — not a playwright spec. Run: node tests/_bor011-verify.cjs
const { chromium } = require("@playwright/test");

const BASE = "http://localhost:8080/bo-prototype.html";

let pass = 0, fail = 0;
const findings = [];
function check(name, ok, extra = "") {
  if (ok) { pass++; console.log(`PASS  ${name}`); }
  else { fail++; findings.push(`${name} ${extra}`); console.log(`FAIL  ${name} ${extra}`); }
}
function note(msg) { console.log(`NOTE  ${msg}`); }

const modalOpen = (page) =>
  page.evaluate(() => document.querySelector("#user-action-modal")?.classList.contains("show"));
const hasDismissible = (page) =>
  page.evaluate(() => !!document.querySelector("#user-action-modal [data-modal-dismissible]"));
const activeTag = (page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    return el ? `${el.tagName.toLowerCase()}#${el.id || ""}.${el.className}` : "null";
  });

// Contract A: cancel/close control precedes the rightmost (confirm) button in a footer row
async function footerOrder(page) {
  return page.evaluate(() => {
    const rows = [...document.querySelectorAll(
      "#user-action-modal .user-action-footer, #user-action-modal .user-detail-actions")];
    for (const row of rows) {
      const btns = [...row.querySelectorAll("button")].filter(b => b.offsetParent !== null);
      if (btns.length < 2) continue;
      const ci = btns.findIndex(b => b.hasAttribute("data-user-action-modal-close"));
      if (ci < 0) continue;
      const last = btns.length - 1;
      if (btns[last].hasAttribute("data-user-action-modal-close")) continue;
      return { ci, last, texts: btns.map(b => (b.textContent || "").trim().slice(0, 20)) };
    }
    return null;
  });
}
const assertOrder = async (page, name) => {
  const o = await footerOrder(page);
  check(`${name} — cancel precedes confirm`, !!o && o.ci < o.last, JSON.stringify(o));
};

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
    await page.locator("#menu-toggle").click();
    await page.waitForTimeout(200);
  }
  const parent = page.locator(`.nav-item[data-module='${moduleId}']`);
  if (sub) {
    const expanded = await parent.evaluate((el) => el.classList.contains("expanded")).catch(() => false);
    if (!expanded) await parent.click();
    await page.waitForTimeout(250);
    await page.locator(`.submenu[data-submenu='${moduleId}'] button[data-sub='${sub}']`).click();
  } else {
    await parent.click();
  }
  await page.waitForTimeout(450);
  if (vw <= 1180) await page.evaluate(() => setNavOpen(false));
}

// open collapsed mobile filter bar if needed
async function ensureFiltersOpen(page) {
  const hasVisible = await page.evaluate(() =>
    [...document.querySelectorAll(".filters [data-custom-select]")]
      .some((el) => el.getClientRects().length > 0));
  if (!hasVisible) {
    const toggled = await page.evaluate(() => {
      const t = [...document.querySelectorAll(".user-filter-toggle")]
        .find((el) => el.getClientRects().length > 0);
      if (t) { t.click(); return true; }
      return false;
    });
    if (toggled) await page.waitForTimeout(350);
  }
}

const closeX = (page) =>
  page.locator("#user-action-modal .user-action-close[data-user-action-modal-close]").first().click();
const backdropClick = (page) =>
  page.locator("#user-action-modal").click({ position: { x: 10, y: 400 } });
const esc = (page) => page.keyboard.press("Escape");

// ---------- Part 1: filter dropdown clipping ----------
const FILTER_SURFACES = [
  ["F1 User Accounts", "users", "User Accounts"],
  ["F2 Reported Users", "users", "Reported Users"],
  ["F3 Reported Assets", "assets", "Reported Assets"],
  ["F4 Reported Comments", "assets", "Reported Comments"],
  ["F5 Asset List", "assets", "Asset List"],
  ["F6 Articles", "content", "Articles"],
  ["F7 Categories", "content", "Categories"],
  ["F8 Reported Articles", "content", "Reported Articles"],
  ["F9 Offer List", "offers", ""],
  ["F10 Sync History", "market", "Sync History"],
  ["F11 Watch Alert List", "watch-alerts", "Watch Alert List"],
  ["AX Audit Log", "settings", "Audit Log"],
];
const VIEWPORTS = [1440, 1280, 1024, 768, 390];

async function checkFilterSurface(page, label, moduleId, sub, vw) {
  await goTo(page, moduleId, sub);
  await ensureFiltersOpen(page);
  const tag = `${label} @${vw}`;

  const selectCount = await page.evaluate(() =>
    [...document.querySelectorAll(".filters [data-custom-select]")]
      .filter((el) => el.getClientRects().length > 0).length);
  if (selectCount === 0) { note(`${tag}: no visible custom-select in .filters — skipped`); return; }

  // no page-level horizontal overflow (wrap-bar regression guard)
  const noXScroll = await page.evaluate(() =>
    document.scrollingElement.scrollWidth <= window.innerWidth + 1);
  check(`${tag} — no horizontal page overflow`, noXScroll,
    `scrollWidth=${await page.evaluate(() => document.scrollingElement.scrollWidth)}`);

  for (let i = 0; i < selectCount; i++) {
    const selects = page.locator(".filters [data-custom-select]:visible");
    const sel = selects.nth(i);
    const sid = await sel.getAttribute("id").catch(() => null);
    const sname = sid || `select#${i}`;
    await sel.locator("[data-custom-select-trigger]").click();
    await page.waitForTimeout(200);
    const opened = await sel.evaluate((el) => el.classList.contains("open"));
    check(`${tag} ${sname} — dropdown opens`, opened);
    if (!opened) continue;
    const m = await page.evaluate((idx) => {
      const s = [...document.querySelectorAll(".filters [data-custom-select]")]
        .filter((el) => el.getClientRects().length > 0)[idx];
      const menu = s?.querySelector(".custom-select-menu");
      if (!menu) return null;
      const r = menu.getBoundingClientRect();
      const cs = getComputedStyle(menu);
      const hit = (x, y) => {
        const el = document.elementFromPoint(x, y);
        return { inside: !!(el && menu.contains(el)), tag: el ? `${el.tagName}.${el.className}`.slice(0, 60) : "null" };
      };
      // hit-test on the visible part of the menu (clamped to viewport) — catches ancestor clipping
      const visY = Math.min(r.bottom - 3, window.innerHeight - 4);
      const centerHit = r.top < visY ? hit(r.left + r.width / 2, visY) : { inside: false, tag: "below-fold" };
      const rightHit = hit(r.right - 4, Math.min(r.top + 12, window.innerHeight - 4));
      let belowFoldReachable = null;
      if (r.bottom > window.innerHeight + 1) {
        menu.scrollIntoView({ block: "end" });
        const r2 = menu.getBoundingClientRect();
        const h2 = hit(r2.left + r2.width / 2, r2.bottom - 3);
        belowFoldReachable = r2.bottom <= window.innerHeight + 1 && h2.inside;
      }
      return {
        left: r.left, right: r.right, top: r.top, bottom: r.bottom,
        vw: window.innerWidth, vh: window.innerHeight,
        maxH: parseFloat(cs.maxHeight), display: cs.display,
        centerHit, rightHit, belowFoldReachable,
      };
    }, i);
    check(`${tag} ${sname} — menu displayed`, !!m && m.display !== "none");
    if (m) {
      check(`${tag} ${sname} — no horizontal clip/overflow`, m.left >= -1 && m.right <= m.vw + 1 && m.rightHit.inside,
        JSON.stringify({ l: m.left | 0, r: m.right | 0, vw: m.vw, hit: m.rightHit.tag }));
      check(`${tag} ${sname} — visible part not clipped (hit test)`, m.centerHit.inside, `hit=${m.centerHit.tag}`);
      const reachable = m.bottom <= m.vh + 1 || m.belowFoldReachable === true;
      check(`${tag} ${sname} — menu fully reachable (in view or scrollable)`, reachable,
        JSON.stringify({ b: m.bottom | 0, vh: m.vh, scrollable: m.belowFoldReachable }));
      check(`${tag} ${sname} — max-height ≤ 221px (filter cap)`, m.maxH <= 221, `maxH=${m.maxH}`);
    }
    // close via trigger toggle
    await sel.locator("[data-custom-select-trigger]").click();
    await page.waitForTimeout(150);
  }
}

// ---------- Part 2: modal sweep helpers ----------
async function openViaEval(page, fn) {
  const res = await page.evaluate(fn).then(() => true).catch((e) => String(e));
  await page.waitForTimeout(300);
  return res === true ? true : res;
}

async function checkConfirmModal(page, name, opener) {
  const r = await openViaEval(page, opener);
  check(`${name} — opens`, await modalOpen(page), r === true ? "" : `eval: ${r}`);
  if (!(await modalOpen(page))) return;
  await assertOrder(page, name);
  check(`${name} — not dismissible (form/confirm policy)`, !(await hasDismissible(page)));
  await backdropClick(page); await page.waitForTimeout(250);
  check(`${name} — backdrop click does NOT close`, await modalOpen(page));
  await esc(page); await page.waitForTimeout(250);
  check(`${name} — ESC does NOT close`, await modalOpen(page));
  await closeX(page); await page.waitForTimeout(250);
  check(`${name} — X closes`, !(await modalOpen(page)));
}

async function checkDismissibleModal(page, name, opener, { backdrop = true } = {}) {
  const r = await openViaEval(page, opener);
  check(`${name} — opens`, await modalOpen(page), r === true ? "" : `eval: ${r}`);
  if (!(await modalOpen(page))) return;
  check(`${name} — marked dismissible`, await hasDismissible(page));
  await esc(page); await page.waitForTimeout(250);
  check(`${name} — ESC closes`, !(await modalOpen(page)));
  if (backdrop) {
    const r2 = await openViaEval(page, opener);
    if (!(await modalOpen(page))) { check(`${name} — reopens`, false, `eval: ${r2}`); return; }
    await backdropClick(page); await page.waitForTimeout(250);
    check(`${name} — backdrop click closes`, !(await modalOpen(page)));
  }
  if (await modalOpen(page)) { await closeX(page); await page.waitForTimeout(200); }
}

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await login(page);

  // ============ PART 1: filter dropdown clipping sweep ============
  for (const vw of VIEWPORTS) {
    await page.setViewportSize({ width: vw, height: vw <= 500 ? 844 : 900 });
    await page.waitForTimeout(300);
    for (const [label, mod, sub] of FILTER_SURFACES) {
      await checkFilterSurface(page, label, mod, sub, vw);
    }
  }

  // ============ PART 2: modal consistency sweep (desktop 1440) ============
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => setNavOpen(false));

  // --- Contract A confirm modals (A1–A12) ---
  await checkConfirmModal(page, "A1 asset report status", () => {
    const asset = moduleData.assets.rows.find((a) => getAssetReportStatusActions(a).length);
    if (asset) renderAssetReportStatusConfirmModal(asset, "Closed");
  });
  await checkConfirmModal(page, "A2 asset hide", () => {
    const asset = moduleData.assets.rows[0];
    renderAssetHideModal(asset, "hide", getAssetActionConfig("hide", asset));
  });
  await checkConfirmModal(page, "A3 asset delete-post", () => {
    const asset = moduleData.assets.rows[0];
    renderAssetDeletePostModal(asset, "delete-post", getAssetActionConfig("delete-post", asset));
  });
  await checkConfirmModal(page, "A4 asset restore-visibility", () => {
    const asset = moduleData.assets.rows[0];
    renderAssetRestoreVisibilityModal(asset, "restore-visibility", getAssetActionConfig("restore-visibility", asset));
  });
  await checkConfirmModal(page, "A5 admin action (suspend)", () => {
    renderAdminAccountActionModal(adminAccountData.accounts.find((a) => a.id === "ADM-001"), "suspend");
  });
  await checkConfirmModal(page, "A6 admin change role", () => {
    openAdminAccountChangeRoleModal(adminAccountData.accounts.find((a) => a.id === "ADM-002"));
  });
  await checkConfirmModal(page, "A7 user action (Suspend)", () => {
    renderUserActionPage(userManagementData.users.find((u) => u.id === "U-1017"), "Suspend");
  });
  await checkConfirmModal(page, "A8 deletion restore", () => {
    renderDeletionActionModal(deletionRequestData.requests.find((r) => r.id === "DEL-033"), "restore");
  });
  await checkConfirmModal(page, "A8b deletion reject-restore", () => {
    renderDeletionActionModal(deletionRequestData.requests.find((r) => r.id === "DEL-033"), "reject-restore");
  });
  await checkConfirmModal(page, "A9 user report status", () => {
    const report = userManagementData.reports.find((r) => getReportStatusActions(r).length);
    if (report) renderReportStatusConfirmModal(report, getReportStatusActions(report)[0].status);
  });
  await checkConfirmModal(page, "A10 market sync confirm", () => renderMarketSyncModal("confirm"));
  await checkConfirmModal(page, "A10b market sync error (Close→Retry)", () => renderMarketSyncModal("error", "save_failed"));
  await checkConfirmModal(page, "A11 board report action", () => {
    const report = getBoardReportRows().find((r) => getBoardReportQueueStatus(r) === "Pending");
    if (report) renderBoardReportActionConfirmModal(report, "close-report");
  });
  await checkConfirmModal(page, "A12 reported comment action", () => {
    renderReportedCommentActionModal(reportedCommentCases.find((c) => c.id === "RCO-711"), "Hide comment");
  });

  // --- Contract B read-only / preview modals (B1–B16) ---
  await checkDismissibleModal(page, "B1 asset comments (view all)", () => {
    const asset = moduleData.assets.rows.find((a) =>
      reportedCommentCases.some((c) => c.assetId === a.id)) || moduleData.assets.rows[0];
    renderAssetCommentsModal(asset);
  });
  await checkDismissibleModal(page, "B2 asset report detail", () => {
    renderAssetReportDetailModal(moduleData.assets.rows[0]);
  });
  await checkDismissibleModal(page, "B3 asset purchase history", () => {
    renderAssetPurchaseHistoryModal(moduleData.assets.rows[0]);
  });
  await checkDismissibleModal(page, "B4 asset sale record", () => {
    renderAssetSaleRecordModal(moduleData.assets.rows[0]);
  });
  // B5 delivery log detail — via real UI row click
  {
    await goTo(page, "settings", "Delivery Logs");
    await page.locator(".delivery-log-table .user-row.delivery-row, .user-row[data-delivery-card]").first().click();
    await page.waitForTimeout(400);
    check("B5 delivery log detail — opens", await modalOpen(page));
    check("B5 — marked dismissible", await hasDismissible(page));
    await backdropClick(page); await page.waitForTimeout(250);
    check("B5 — backdrop closes", !(await modalOpen(page)));
    await page.locator(".delivery-log-table .user-row.delivery-row, .user-row[data-delivery-card]").first().click();
    await page.waitForTimeout(400);
    await esc(page); await page.waitForTimeout(250);
    check("B5 — ESC closes", !(await modalOpen(page)));
  }
  await checkDismissibleModal(page, "B6 policy preview", () => {
    const form = document.createElement("form");
    form.dataset.policyId = policyVersioningData.policies[0].id;
    document.body.appendChild(form);
    openPolicyPreviewModal(form);
    form.remove();
  });
  await checkDismissibleModal(page, "B7 policy version view", () => {
    const policy = policyVersioningData.policies.find((p) => (p.versions || []).length);
    if (policy) openPolicyVersionViewModal(policy, policy.versions[0]);
  });
  await checkDismissibleModal(page, "B8 support center preview", () => openSupportCenterPreviewModal());
  // B9 WA criteria view-all — via real button
  {
    await goTo(page, "watch-alerts", "Demand Overview");
    await page.locator(".wa-panel-criteria [data-wa-criteria-viewall]").click();
    await page.waitForTimeout(300);
    check("B9 WA criteria view-all — opens", await modalOpen(page));
    check("B9 — marked dismissible", await hasDismissible(page));
    await esc(page); await page.waitForTimeout(250);
    check("B9 — ESC closes", !(await modalOpen(page)));
    await page.locator(".wa-panel-criteria [data-wa-criteria-viewall]").click();
    await page.waitForTimeout(300);
    await backdropClick(page); await page.waitForTimeout(250);
    check("B9 — backdrop closes", !(await modalOpen(page)));
  }
  // B10 SI view-all — via real button
  {
    await goTo(page, "watch-alerts", "Search Insights");
    await page.locator("[data-si-viewall='keywords']").click();
    await page.waitForTimeout(300);
    check("B10 SI view-all — opens", await modalOpen(page));
    check("B10 — marked dismissible", await hasDismissible(page));
    await esc(page); await page.waitForTimeout(250);
    check("B10 — ESC closes", !(await modalOpen(page)));
  }
  await checkDismissibleModal(page, "B11 option view", () => openOptionViewModal("OPT-001"));
  await checkDismissibleModal(page, "B12 option audit log", () => openOptionAuditLogModal("OPT-001"));
  await checkDismissibleModal(page, "B13 option group audit log", () => openOptionGroupAuditLogModal("OG-001"));
  await checkDismissibleModal(page, "B14 category detail", () => {
    renderCategoryDetailModal(categoryRows.find((c) => c.id === "CAT-001"));
  });
  await checkDismissibleModal(page, "B15 article preview", () => openArticlePreviewModal(articleRows[0]));
  await checkDismissibleModal(page, "B16 board report content", () => {
    renderBoardReportContentModal(getBoardReportRows()[0]);
  });
  // acknowledge modals
  await checkDismissibleModal(page, "ACK category action blocked", () => {
    openCategoryActionConfirmModal(categoryRows.find((c) => c.id === "CAT-001"), "deactivate");
  });

  // ============ PART 3: mobile modal + focus spot checks (390px) ============
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  {
    // A7 on mobile: order + X close + ESC/backdrop policy
    const r = await openViaEval(page, () =>
      renderUserActionPage(userManagementData.users.find((u) => u.id === "U-1017"), "Suspend"));
    check("M-A7 suspend modal opens @390", await modalOpen(page), r === true ? "" : `eval: ${r}`);
    await assertOrder(page, "M-A7 @390");
    check("M-A7 initial focus = ยกเลิก (least destructive)", await page.evaluate(() => {
      const el = document.activeElement;
      return el?.hasAttribute("data-user-action-modal-close") && (el.textContent || "").includes("ยกเลิก");
    }), await activeTag(page));
    await esc(page); await page.waitForTimeout(200);
    check("M-A7 ESC does NOT close confirm @390", await modalOpen(page));
    await closeX(page); await page.waitForTimeout(250);
    check("M-A7 X closes @390", !(await modalOpen(page)));

    // dismissible on mobile: ESC + X close (backdrop N/A ≤460px by definition)
    const r2 = await openViaEval(page, () => openSupportCenterPreviewModal());
    check("M-B8 preview opens @390", await modalOpen(page), r2 === true ? "" : `eval: ${r2}`);
    check("M-B8 initial focus inside modal", await page.evaluate(() =>
      document.querySelector("#user-action-modal")?.contains(document.activeElement)), await activeTag(page));
    await esc(page); await page.waitForTimeout(250);
    check("M-B8 ESC closes @390", !(await modalOpen(page)));
    note("M-390: backdrop close N/A — drawer/modal fills viewport ≤460px (Contract B.1)");

    // focus restore: opener gets focus back after close (delivery row via UI)
    await goTo(page, "settings", "Delivery Logs");
    const row = page.locator(".delivery-log-table .user-row.delivery-row, .user-row[data-delivery-card]").first();
    await row.focus();
    await row.click();
    await page.waitForTimeout(400);
    check("M-B5 detail opens @390", await modalOpen(page));
    check("M-B5 initial focus inside modal", await page.evaluate(() =>
      document.querySelector("#user-action-modal")?.contains(document.activeElement)), await activeTag(page));
    await esc(page); await page.waitForTimeout(300);
    check("M-B5 ESC closes @390", !(await modalOpen(page)));
    check("M-B5 focus restored to opener row", await page.evaluate(() =>
      document.activeElement?.classList?.contains("user-row") ||
      !!document.activeElement?.closest?.(".delivery-log-table")), await activeTag(page));
  }

  check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  console.log(`\n${pass} passed, ${fail} failed`);
  if (findings.length) {
    console.log("\nFINDINGS:");
    findings.forEach((f) => console.log(` - ${f}`));
  }
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
