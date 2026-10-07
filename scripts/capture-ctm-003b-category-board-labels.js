// CTM-003b — Categories + Reported Board label normalization evidence capture
// ครอบคลุม surface ของจุดแก้ตาม CTM-002 plan §A.2/§B + canonical §9.2/9.3
//   D-C01 row menu View detail · D-C02 Edit Category (row menu + detail btn)
//   D-C10 Add Category (+ hidden #primary-action) · D-C11 Reorder Categories (+aria → mobile tooltip)
//   D-C12 Set inactive/Set active · D-C13 Delete category · D-C14b tile Updated At
//   D-C15 View Article (+aria) · D-C16 Archive article label · D-C17 confirm labels → ยืนยัน
//   D-C18 reasonLabel archive · D-C19 reporter identity masked · D-C20 audit empty state
//   getBoardReportActionLabel "เก็บบทความ" → "เก็บบทความเข้าคลัง" (DECISION-1 align)
//   S-C01a..c category confirm titles EN · S-C04a..b board report titles EN · S-C05 blocked title EN
// usage: node scripts/capture-ctm-003b-category-board-labels.js before|after [url]
//   (ต้อง start server ที่ Prototypes ก่อน: node Prototypes/server.mjs — port 4173)
// Mission 4 evidence viewport (standard): Desktop 1920x1080, Tablet 768x1024, Mobile 440x956
// หมายเหตุ: c05/c06 blocked+deactivate confirm เปิดผ่าน console โดยตรงเพราะปุ่ม deactivate
//   ถูกซ่อนเมื่อ category มีบทความผูกอยู่ (mock ทุก Active category มีบทความ) — render path เดียวกัน
const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const PHASE = process.argv[2] === "after" ? "after" : "before";
const BASE = process.argv[3] || "http://localhost:4173/bo-prototype.html";
const OUT = path.join(__dirname, "..", "screenshots", "mission-4-objective-1", PHASE);

async function login(page) {
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");
  const loginScreen = page.locator("#login-screen");
  if (await loginScreen.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator('#login-form button[type="submit"]').click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await page.waitForTimeout(400);
  }
}

async function ensureNavOpen(page) {
  const needsToggle = await page.evaluate(() =>
    window.matchMedia("(max-width: 1180px)").matches && !document.body.classList.contains("nav-open"));
  if (needsToggle) {
    await page.locator("#menu-toggle").click();
    await page.waitForTimeout(300);
  }
}

async function closeNavIfOpen(page) {
  const isOpen = await page.evaluate(() => document.body.classList.contains("nav-open"));
  if (isOpen) {
    await page.locator("#menu-toggle").click();
    await page.waitForTimeout(300);
  }
}

async function goContentSub(page, sub) {
  await login(page);
  await ensureNavOpen(page);
  const contentNav = page.locator('button.nav-item[data-module="content"]');
  if ((await contentNav.getAttribute("aria-expanded")) !== "true") {
    await contentNav.click();
    await page.waitForTimeout(250);
  }
  await page.locator(`button[data-module="content"][data-sub="${sub}"]`).click();
  await page.waitForTimeout(400);
  await closeNavIfOpen(page);
}

async function shot(page, name, opts = {}) {
  await page.evaluate(() => document.activeElement?.blur());
  await page.screenshot({ path: path.join(OUT, `${name}.png`), ...opts });
  console.log("saved", name);
}

async function closeModal(page) {
  const closeBtn = page.locator("[data-user-action-modal-close]").first();
  if (await closeBtn.isVisible({ timeout: 500 }).catch(() => false)) {
    await closeBtn.click({ timeout: 3000 }).catch(async () => {
      await page.evaluate(() => document.querySelector("[data-user-action-modal-close]")?.click());
    });
    await page.waitForTimeout(300);
  }
}

async function openCategoryRowMenu(page, categoryId) {
  const card = page.locator(`[data-category-card="${categoryId}"]`);
  await card.locator(".row-menu summary").click();
  await page.waitForTimeout(300);
  return card;
}

async function captureCategorySurfaces(page, prefix) {
  // ============ Category List ============
  await goContentSub(page, "Categories");
  await shot(page, `${prefix}01-category-list`, { fullPage: true });

  // Row menu บน CAT-007 (Inactive, 0 บทความ — เมนูครบ: View detail/Edit/Set active/Delete)
  const card007 = await openCategoryRowMenu(page, "CAT-007");
  await shot(page, `${prefix}02-category-rowmenu`, { fullPage: true });

  // ============ Category Detail modal (CAT-007 — tile Updated At + ปุ่ม Edit/Set active) ============
  await card007.locator('[data-category-open="CAT-007"]').click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}03-category-detail`, { fullPage: true });

  // Modal: Reactivate (Set active → title TH→EN) — ปุ่มใน detail modal (row-menu copy ถูกซ่อน)
  await page.locator('#user-action-modal-body [data-category-status-action="activate"][data-category-id="CAT-007"]').first().click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}04-modal-reactivate-category`);
  await closeModal(page);

  // ============ Category Detail modal (CAT-001 — Active มีบทความ, ปุ่ม Edit เท่านั้น) ============
  const card001 = await openCategoryRowMenu(page, "CAT-001");
  await card001.locator('[data-category-open="CAT-001"]').click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}05-category-detail-linked`, { fullPage: true });
  await closeModal(page);

  // Modal: Delete (CAT-007 → title TH→EN) — เปิดผ่าน row menu
  const card007b = await openCategoryRowMenu(page, "CAT-007");
  await card007b.locator('[data-category-status-action="delete"][data-category-id="CAT-007"]').click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}06-modal-delete-category`);
  await closeModal(page);

  // Modal: Blocked deactivate (CAT-001 มีบทความ — ปุ่มซ่อนใน UI, เปิดผ่าน render path จริง)
  await page.evaluate(() => {
    openCategoryActionConfirmModal(getCategoryById("CAT-001"), "deactivate");
  });
  await page.waitForTimeout(400);
  await shot(page, `${prefix}07-modal-blocked-deactivate`);
  await closeModal(page);

  // Modal: Deactivate confirm (CAT-007 0 บทความ → ได้ non-blocked config; ปุ่ม deactivate
  // ไม่มีใน UI เพราะ CAT-007 เป็น Inactive อยู่แล้ว — เปิดผ่าน render path จริง)
  await page.evaluate(() => {
    openCategoryActionConfirmModal(getCategoryById("CAT-007"), "deactivate");
  });
  await page.waitForTimeout(400);
  await shot(page, `${prefix}08-modal-deactivate-confirm`);
  await closeModal(page);

  // Modal: Reorder Categories (title คง EN ตาม §3.2 — evidence ไม่เปลี่ยน)
  await page.locator("[data-category-order-open]").click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}09-modal-reorder-categories`, { fullPage: true });
  await closeModal(page);

  // Modal: Add Category editor (title คง EN — evidence ไม่เปลี่ยน)
  await page.locator("[data-category-add]").click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}10-modal-add-category`, { fullPage: true });
  await closeModal(page);
}

async function openBoardReportDetailFromList(page, reportId) {
  const card = page.locator(`[data-board-report-card="${reportId}"]`);
  await card.locator(".row-menu summary").click();
  await page.waitForTimeout(300);
  await card.locator(`.row-menu [data-board-report-open="${reportId}"]`).click();
  await page.waitForTimeout(400);
}

async function backToBoardReportList(page) {
  await page.locator("[data-back-reported-board]").click();
  await page.waitForTimeout(400);
}

async function captureBoardReportSurfaces(page, prefix) {
  // ============ Reported Articles List ============
  await goContentSub(page, "Reported Articles");
  await shot(page, `${prefix}11-board-report-list`, { fullPage: true });

  // Row menu บน RPC-043 (Pending) — View Article / Archive article
  const card043 = page.locator('[data-board-report-card="RPC-043"]');
  await card043.locator(".row-menu summary").click();
  await page.waitForTimeout(300);
  await shot(page, `${prefix}12-board-report-rowmenu`, { fullPage: true });

  // Preview modal จาก row menu (View Article — title คง EN "Preview article …")
  await card043.locator('[data-board-report-preview="RPC-043"]').click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}13-modal-preview-article`, { fullPage: true });
  await closeModal(page);

  // ============ Report Detail (RPC-043) ============
  await openBoardReportDetailFromList(page, "RPC-043");
  await shot(page, `${prefix}14-board-report-detail`, { fullPage: true });

  // Modal: Close report (title TH→EN + confirm→ยืนยัน)
  await page.locator('[data-board-report-action="close-report"][data-board-report-id="RPC-043"]').first().click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}15-modal-close-report`, { fullPage: true });
  await closeModal(page);

  // Modal: Archive article (title TH+EN ผสม→EN + confirm→ยืนยัน + reasonLabel ไทยใหม่)
  await page.locator('[data-board-report-action="archive-article"][data-board-report-id="RPC-043"]').first().click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}16-modal-archive-article`, { fullPage: true });
  await closeModal(page);

  // ============ Report Detail (RPC-039 — Closed; Admin Action History แสดง label map) ============
  await backToBoardReportList(page);
  await openBoardReportDetailFromList(page, "RPC-039");
  await shot(page, `${prefix}17-board-report-detail-closed`, { fullPage: true });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  // ============ Evidence viewports: d=1920x1080, t=768x1024, m=440x956 ============
  for (const [prefix, viewport] of [["d", { width: 1920, height: 1080 }], ["t", { width: 768, height: 1024 }], ["m", { width: 440, height: 956 }]]) {
    const page = await browser.newPage({ viewport });
    await captureCategorySurfaces(page, prefix);
    await captureBoardReportSurfaces(page, prefix);
    await page.close();
  }

  await browser.close();
  console.log("done →", OUT);
})();
