// CTM-003b smoke check — verify normalized labels (Categories + Reported Board)
// usage: node scripts/verify-ctm-003b.js  (server ต้องรันอยู่ที่ :4173)
const { chromium } = require("@playwright/test");

const BASE = "http://localhost:4173/bo-prototype.html";
const results = [];
const check = (name, ok, extra = "") => { results.push([name, ok, extra]); console.log(`${ok ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`); };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });

  await page.goto(BASE);
  await page.waitForLoadState("networkidle");
  if (await page.locator("#login-screen").isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator('#login-form button[type="submit"]').click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
  }

  const openContentSub = async (sub) => {
    const nav = page.locator('button.nav-item[data-module="content"]');
    if ((await nav.getAttribute("aria-expanded")) !== "true") {
      await nav.click();
      await page.waitForTimeout(250);
    }
    await page.locator(`button[data-module="content"][data-sub="${sub}"]`).click();
    await page.waitForTimeout(400);
  };

  // ============ Categories ============
  await openContentSub("Categories");

  // D-C10/D-C11 — toolbar labels + aria TH
  const orderBtn = page.locator("[data-category-order-open]");
  const addBtn = page.locator("[data-category-add]");
  check("toolbar: จัดเรียง Category label", (await orderBtn.innerText()).includes("จัดเรียง Category"));
  check("toolbar: จัดเรียง aria TH", (await orderBtn.getAttribute("aria-label")) === "จัดเรียง Category บน FO Board");
  check("toolbar: เพิ่ม Category label", (await addBtn.innerText()).includes("เพิ่ม Category"));
  check("toolbar: เพิ่ม aria TH", (await addBtn.getAttribute("aria-label")) === "เพิ่ม Category");
  check("hidden #primary-action TH", (await page.locator("#primary-action").innerText()) === "เพิ่ม Category");

  // D-C01/C02/C12/C13 — CAT-007 row menu labels (Inactive, 0 articles → เมนูครบ)
  const card007 = page.locator('[data-category-card="CAT-007"]');
  await card007.locator(".row-menu summary").click();
  await page.waitForTimeout(200);
  const menu007 = await card007.locator(".row-menu-list").innerText();
  check("cat row menu TH", menu007.includes("ดูรายละเอียด") && menu007.includes("แก้ไข Category") && menu007.includes("เปิดใช้งาน") && menu007.includes("ลบ Category"), menu007.replace(/\n/g, " | "));
  check("no EN residue cat menu", !/View detail|Edit Category|Set active|Set inactive|Delete category/.test(menu007));
  await card007.locator('[data-category-open="CAT-007"]').click();
  await page.waitForTimeout(400);

  // D-C02/C12/C14b — detail modal tiles + buttons
  const modalBody = () => page.locator("#user-action-modal-body");
  const detailText = await modalBody().innerText();
  check("cat detail tile อัปเดตล่าสุด", detailText.includes("อัปเดตล่าสุด") && !detailText.includes("Updated At"));
  check("cat detail buttons TH", detailText.includes("แก้ไข Category") && detailText.includes("เปิดใช้งาน"));

  // S-C01b — Reactivate confirm title EN (เปิดจากปุ่มใน detail modal)
  await modalBody().locator('[data-category-status-action="activate"][data-category-id="CAT-007"]').click();
  await page.waitForTimeout(300);
  check("reactivate title EN", (await page.locator("#user-action-modal-title").innerText()).trim() === "Confirm Reactivate Category");
  await page.locator("[data-user-action-modal-close]").first().click();
  await page.waitForTimeout(300);

  // S-C01c — Delete confirm title EN (เปิดผ่าน row menu CAT-007)
  const card007b = page.locator('[data-category-card="CAT-007"]');
  await card007b.locator(".row-menu summary").click();
  await page.waitForTimeout(200);
  await card007b.locator('[data-category-status-action="delete"]').click();
  await page.waitForTimeout(300);
  check("delete title EN", (await page.locator("#user-action-modal-title").innerText()).trim() === "Confirm Delete Category");
  await page.locator("[data-user-action-modal-close]").first().click();
  await page.waitForTimeout(300);

  // S-C05 — blocked modal title EN (CAT-001 มีบทความ → blocked; เปิดผ่าน render path)
  await page.evaluate(() => openCategoryActionConfirmModal(getCategoryById("CAT-001"), "deactivate"));
  await page.waitForTimeout(300);
  check("blocked title EN", (await page.locator("#user-action-modal-title").innerText()).trim() === "Cannot Deactivate Category");
  await page.locator("[data-user-action-modal-close]").first().click();
  await page.waitForTimeout(300);

  // S-C01a — deactivate confirm title EN (CAT-007 0 บทความ → non-blocked config)
  await page.evaluate(() => openCategoryActionConfirmModal(getCategoryById("CAT-007"), "deactivate"));
  await page.waitForTimeout(300);
  check("deactivate title EN", (await page.locator("#user-action-modal-title").innerText()).trim() === "Confirm Deactivate Category");
  await page.locator("[data-user-action-modal-close]").first().click();
  await page.waitForTimeout(300);

  // Structure titles คง EN — Reorder Categories modal + Add Category editor
  await orderBtn.click();
  await page.waitForTimeout(300);
  check("reorder modal title stays EN", (await page.locator("#user-action-modal-title").innerText()).trim() === "Reorder Categories");
  await page.locator("[data-user-action-modal-close]").first().click();
  await page.waitForTimeout(300);
  await addBtn.click();
  await page.waitForTimeout(300);
  check("add category modal title stays EN", (await page.locator("#user-action-modal-title").innerText()).trim() === "Add Category");
  await page.locator("[data-user-action-modal-close]").first().click();
  await page.waitForTimeout(300);

  // ============ Reported Board ============
  await openContentSub("Reported Articles");

  // D-C15/C16 — RPC-043 row menu labels
  const card043 = page.locator('[data-board-report-card="RPC-043"]');
  await card043.locator(".row-menu summary").click();
  await page.waitForTimeout(200);
  const menu043 = await card043.locator(".row-menu-list").innerText();
  check("board row menu TH", menu043.includes("ดูรายละเอียด") && menu043.includes("ดูบทความ") && menu043.includes("ปิดรายงาน") && menu043.includes("แก้ไขบทความ") && menu043.includes("เก็บบทความเข้าคลัง"), menu043.replace(/\n/g, " | "));
  check("no EN residue board menu", !/View Article|Archive article/.test(menu043));

  // Preview modal title stays EN
  await card043.locator('[data-board-report-preview="RPC-043"]').click();
  await page.waitForTimeout(400);
  const prevTitle = await page.locator("#user-action-modal-title").innerText();
  check("board preview title stays EN", prevTitle.startsWith("Preview article"), prevTitle.trim());
  await page.locator("[data-user-action-modal-close]").first().click().catch(() => page.evaluate(() => document.querySelector("[data-user-action-modal-close]")?.click()));
  await page.waitForTimeout(300);

  // Report detail RPC-043 — subtitle + View Article btn + actions
  await card043.locator(".row-menu summary").click();
  await page.waitForTimeout(200);
  await card043.locator('[data-board-report-open="RPC-043"]').click();
  await page.waitForTimeout(400);
  check("detail subtitle TH", (await page.locator("#panel-subtitle").innerText()).includes("ปิดบังตัวตนผู้รายงาน"));
  const detailBody = await page.locator("#table").innerText();
  check("detail action labels TH", detailBody.includes("ปิดรายงาน") && detailBody.includes("แก้ไขบทความ") && detailBody.includes("เก็บบทความเข้าคลัง") && !detailBody.includes("Archive article"));
  const viewBtn = page.locator('[data-board-report-preview="RPC-043"]').last();
  check("detail ดูบทความ btn + aria", (await viewBtn.innerText()).includes("ดูบทความ") && (await viewBtn.getAttribute("aria-label")) === "ดูบทความ RPC-043");

  // S-C04a + D-C17 — close-report confirm modal
  await page.locator('[data-board-report-action="close-report"][data-board-report-id="RPC-043"]').first().click();
  await page.waitForTimeout(400);
  check("close report title EN", (await page.locator("#user-action-modal-title").innerText()).trim() === "Confirm Close Report");
  const closeModalText = await page.locator("#user-action-modal-body").innerText();
  check("close confirm btn ยืนยัน", (await page.locator('[data-board-report-action-confirm="close-report"]').innerText()).trim() === "ยืนยัน");
  check("close reasonLabel TH", closeModalText.includes("เหตุผลการปิดรายงาน"));
  await page.locator("[data-user-action-modal-close]").first().click();
  await page.waitForTimeout(300);

  // S-C04b + D-C17/D-C18 — archive confirm modal
  await page.locator('[data-board-report-action="archive-article"][data-board-report-id="RPC-043"]').first().click();
  await page.waitForTimeout(400);
  check("archive title EN", (await page.locator("#user-action-modal-title").innerText()).trim() === "Confirm Archive Article");
  const archModalText = await page.locator("#user-action-modal-body").innerText();
  check("archive confirm btn ยืนยัน", (await page.locator('[data-board-report-action-confirm="archive-article"]').innerText()).trim() === "ยืนยัน");
  check("archive reasonLabel TH", archModalText.includes("เหตุผลการเก็บบทความเข้าคลัง") && !archModalText.includes("เหตุผลการ Archive"));
  await page.locator("[data-user-action-modal-close]").first().click();
  await page.waitForTimeout(300);

  // DECISION-1 align — RPC-039 Admin Action History label map
  await page.locator("[data-back-reported-board]").click();
  await page.waitForTimeout(400);
  const card039 = page.locator('[data-board-report-card="RPC-039"]');
  await card039.locator(".row-menu summary").click();
  await page.waitForTimeout(200);
  await card039.locator('[data-board-report-open="RPC-039"]').click();
  await page.waitForTimeout(400);
  const hist039 = await page.locator("#table").innerText();
  check("history label เก็บบทความเข้าคลัง", hist039.includes("เก็บบทความเข้าคลัง"), (hist039.match(/เก็บบทความ[^\s]*/g) || []).join(","));

  // Source-level checks — strings ที่ UI เข้าถึงไม่ได้ใน mock ปัจจุบัน
  const src = require("fs").readFileSync(require("path").join(__dirname, "..", "Prototypes", "bo-prototype.html"), "utf8");
  check("src: ปิดใช้งาน label (unreachable btn)", src.includes('data-category-status-action="deactivate" data-category-id="${category.id}">ปิดใช้งาน'));
  check("src: audit empty state TH", src.includes("ยังไม่มีการดำเนินการจาก Admin") && !src.includes('colspan="5" class="history-note">No admin action recorded yet</td></tr>`;\n      return `\n        <div class="history-table-wrap">'));
  check("src: confirm ยืนยัน ×2", (src.match(/confirm: "ยืนยัน",/g) || []).length >= 2);
  check("src: no scope EN residue", !/label: "Archive article"/.test(src) && !src.includes(">View Article") && !src.includes('aria-label="View article') && !src.includes("ยืนยันการ Archive article") && !src.includes("เหตุผลการ Archive article") && !src.includes("ยืนยัน Archive"));
  check("src: board subtitle TH", src.includes("${report.id} · ${report.articleId} · ปิดบังตัวตนผู้รายงาน"));

  // Mobile tooltip suppression — tap ทำให้ :hover ติดค้าง แต่ tooltip ต้องไม่ซ้อนทับ modal
  const mPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mPage.on("pageerror", e => errors.push(e.message));
  mPage.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await mPage.goto(BASE);
  await mPage.waitForLoadState("networkidle");
  if (await mPage.locator("#login-screen").isVisible({ timeout: 1000 }).catch(() => false)) {
    await mPage.locator('#login-form button[type="submit"]').click();
    await mPage.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
  }
  await mPage.evaluate(() => {
    if (window.matchMedia("(max-width: 1180px)").matches && !document.body.classList.contains("nav-open")) {
      document.querySelector("#menu-toggle")?.click();
    }
  });
  await mPage.waitForTimeout(300);
  const mContentNav = mPage.locator('button.nav-item[data-module="content"]');
  if ((await mContentNav.getAttribute("aria-expanded")) !== "true") { await mContentNav.click(); await mPage.waitForTimeout(250); }
  await mPage.locator('button[data-module="content"][data-sub="Categories"]').click();
  await mPage.waitForTimeout(400);
  await mPage.evaluate(() => {
    if (document.body.classList.contains("nav-open")) document.querySelector("#menu-toggle")?.click();
  });
  await mPage.waitForTimeout(300);
  const tipOf = () => mPage.locator("[data-category-add]").evaluate(el => {
    const s = getComputedStyle(el, "::after");
    return { content: s.content, opacity: s.opacity };
  });
  await mPage.locator("[data-category-add]").hover();
  await mPage.waitForTimeout(250);
  const tipList = await tipOf();
  check("mobile tooltip works on list page", tipList.content !== "none" && tipList.content !== '""' && tipList.opacity === "1", JSON.stringify(tipList));
  await mPage.locator("[data-category-add]").click();
  await mPage.waitForTimeout(400);
  const tipModal = await tipOf();
  check("mobile tooltip hidden under modal", tipModal.content === "none", JSON.stringify(tipModal));
  await mPage.locator("[data-user-action-modal-close]").first().click();
  await mPage.waitForTimeout(300);

  // Mobile preview modal — ปุ่มปิดต้องอยู่ใน viewport (regression: modal 528px + translateX ทำปุ่มหลุดจอ)
  await mPage.evaluate(() => {
    if (window.matchMedia("(max-width: 1180px)").matches && !document.body.classList.contains("nav-open")) {
      document.querySelector("#menu-toggle")?.click();
    }
  });
  await mPage.waitForTimeout(300);
  await mPage.locator('button[data-module="content"][data-sub="Reported Articles"]').click();
  await mPage.waitForTimeout(400);
  await mPage.evaluate(() => {
    if (document.body.classList.contains("nav-open")) document.querySelector("#menu-toggle")?.click();
  });
  await mPage.waitForTimeout(300);
  const mCard043 = mPage.locator('[data-board-report-card="RPC-043"]');
  await mCard043.locator(".row-menu summary").click();
  await mPage.waitForTimeout(200);
  await mCard043.locator('[data-board-report-preview="RPC-043"]').click();
  await mPage.waitForTimeout(400);
  const closeBox = await mPage.locator(".board-report-phone-preview-close").boundingBox();
  const inView = closeBox && closeBox.x >= 0 && closeBox.y >= 0 && closeBox.x + closeBox.width <= 390 && closeBox.y + closeBox.height <= 844;
  check("mobile preview close btn in viewport", !!inView, closeBox ? `x=${Math.round(closeBox.x)} y=${Math.round(closeBox.y)} w=${Math.round(closeBox.width)}` : "not found");
  await mPage.locator(".board-report-phone-preview-close").click();
  await mPage.waitForTimeout(300);
  check("mobile preview modal closable", !(await mPage.locator("#user-action-modal.show").isVisible().catch(() => false)));
  await mPage.close();

  check("no JS errors", errors.length === 0, errors.slice(0, 3).join(" ; "));
  await browser.close();
  const fails = results.filter(r => !r[1]);
  console.log(`\n${results.length - fails.length}/${results.length} passed`);
  process.exit(fails.length ? 1 : 0);
})();