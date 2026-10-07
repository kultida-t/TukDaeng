// CTM-003a smoke check — verify normalized labels + wired preview button
// usage: node scripts/verify-ctm-003a.js  (server ต้องรันอยู่ที่ :4173)
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

  // Articles list
  await page.locator('button.nav-item[data-module="content"]').click();
  await page.locator('button[data-module="content"][data-sub="Articles"]').click();
  await page.waitForTimeout(400);

  // D-C01/C02a/C04/C05 — row menu labels + wired preview
  const card = page.locator('[data-article-card="ART-043"]');
  await card.locator(".row-menu summary").click();
  await page.waitForTimeout(200);
  const menuText = await card.locator(".row-menu-list").innerText();
  check("row menu labels TH", menuText.includes("ดูรายละเอียด") && menuText.includes("ดูตัวอย่าง") && menuText.includes("แก้ไขบทความ") && menuText.includes("เก็บบทความเข้าคลัง"), menuText.replace(/\n/g, " | "));
  check("no EN residue in row menu", !/View detail|Preview as FO|Edit article|Archive article/.test(menuText));

  // D-C04 — wired ดูตัวอย่าง opens preview modal
  await card.locator(".row-menu [data-article-preview-open]").click();
  await page.waitForTimeout(400);
  const modalTitle = await page.locator("#user-action-modal-title").innerText().catch(() => "");
  check("row-menu ดูตัวอย่าง opens preview modal", modalTitle.trim() === "Preview article", modalTitle.trim());
  const previewLabels = await page.locator("#user-action-modal-body").innerText().catch(() => "");
  check("preview section labels TH", previewLabels.includes("ตัวอย่างบทความ Hero") && previewLabels.includes("ตัวอย่างรายละเอียดบทความ"));
  await page.locator("[data-user-action-modal-close]").first().click();
  await page.waitForTimeout(300);

  // Detail page — tiles/buttons/history
  await openDetail("ART-043");
  const detailText = await page.locator("#table").innerText();
  check("detail tiles TH", detailText.includes("จำนวน Likes") && detailText.includes("สร้างเมื่อ") && detailText.includes("อัปเดตล่าสุด"));
  check("detail buttons TH", detailText.includes("แก้ไขบทความ") && detailText.includes("ดูตัวอย่าง") && detailText.includes("เก็บบทความเข้าคลัง"));
  check("change history action map TH", /สร้างบทความ|แก้ไขล่าสุด/.test(detailText), (detailText.match(/สร้างบทความ|แก้ไขล่าสุด|เก็บบทความเข้าคลัง|ยกเลิกกำหนดเผยแพร่|นำกลับมาเผยแพร่/g) || []).join(","));

  // S-C02c archive modal title EN
  await page.locator('[data-article-status-action="archive-article"][data-article-id="ART-043"]').first().click();
  await page.waitForTimeout(300);
  check("archive modal title EN", (await page.locator("#user-action-modal-title").innerText()).trim() === "Confirm Archive Article");
  await page.locator("[data-user-action-modal-close]").first().click();
  await page.waitForTimeout(300);

  // Scheduled — cancel schedule
  await backToList(); await openDetail("ART-044");
  const schedText = await page.locator("#table").innerText();
  check("scheduled action label TH", schedText.includes("ยกเลิกกำหนดเผยแพร่"));
  await page.locator('[data-article-status-action="cancel-schedule"][data-article-id="ART-044"]').first().click();
  await page.waitForTimeout(300);
  check("cancel-schedule title EN", (await page.locator("#user-action-modal-title").innerText()).trim() === "Confirm Cancel Schedule");
  await page.locator("[data-user-action-modal-close]").first().click();
  await page.waitForTimeout(300);

  // Draft — delete draft
  await backToList(); await openDetail("ART-042");
  const draftText = await page.locator("#table").innerText();
  check("draft action label TH", draftText.includes("ลบ Draft"));
  await page.locator('[data-article-status-action="delete-draft"][data-article-id="ART-042"]').first().click();
  await page.waitForTimeout(300);
  check("delete-draft title EN", (await page.locator("#user-action-modal-title").innerText()).trim() === "Confirm Delete Draft");
  await page.locator("[data-user-action-modal-close]").first().click();
  await page.waitForTimeout(300);

  // Archived — restore
  await backToList(); await openDetail("ART-039");
  const archText = await page.locator("#table").innerText();
  check("archived action label TH", archText.includes("คืนบทความ"));
  await page.locator('[data-article-status-action="restore-article"][data-article-id="ART-039"]').first().click();
  await page.waitForTimeout(300);
  check("restore title EN", (await page.locator("#user-action-modal-title").innerText()).trim() === "Confirm Restore Article");
  await page.locator("[data-user-action-modal-close]").first().click();
  await page.waitForTimeout(300);

  // Editor — block editor labels
  await backToList(); await openDetail("ART-043");
  await page.locator('[data-article-edit="ART-043"]').first().click();
  await page.waitForTimeout(400);
  const editorText = await page.locator("#table").innerText();
  check("editor: + เพิ่ม block", editorText.includes("+ เพิ่ม block"));
  check("editor: block titles TH", /ย่อหน้า|หัวข้อ H2|รายการแบบจุด|ข้อความอ้างอิง|ตารางเปรียบเทียบ/.test(editorText));
  check("editor: Preview → ดูตัวอย่าง", await page.locator("[data-article-preview-open]").innerText() === "ดูตัวอย่าง");
  const pickerText = await page.evaluate(() =>
    Array.from(document.querySelector("[data-article-block-type-picker]")?.closest("[data-custom-select]")?.querySelectorAll("[data-custom-select-option]") || []).map(el => el.textContent).join("|"));
  check("block picker options TH", pickerText.includes("ย่อหน้า") && pickerText.includes("ตารางเปรียบเทียบ") && pickerText.includes("รูปภาพ + คำบรรยาย"), pickerText);
  const ariaUp = await page.locator('[data-article-block-move="up"]').first().getAttribute("aria-label");
  const ariaDel = await page.locator("[data-article-block-delete]").first().getAttribute("aria-label");
  check("block control aria TH", ariaUp === "เลื่อน block ขึ้น" && ariaDel === "ลบ block", `${ariaUp} / ${ariaDel}`);

  // S-C03b save confirm title EN
  await page.locator('[data-article-editor] button[type="submit"]').click();
  await page.waitForTimeout(300);
  check("save confirm title EN", (await page.locator("#user-action-modal-title").innerText()).trim() === "Confirm Save Article");

  // D-C25 permission_denied → TH title
  await page.evaluate(() => { const s = document.querySelector("#article-action-scenario"); if (s) s.value = "permission_denied"; });
  await page.locator("[data-article-edit-save-confirm]").click();
  await page.waitForTimeout(300);
  check("permission denied title TH", (await page.locator("#user-action-modal-title").innerText()).trim() === "ไม่มีสิทธิ์ดำเนินการ");
  await page.locator("[data-user-action-modal-close]").first().click();
  await page.waitForTimeout(300);

  // S-C03a edit cancel confirm title EN
  await page.locator("#article-title-field").fill("dirty");
  await page.locator("[data-article-edit-cancel]").click();
  await page.waitForTimeout(300);
  check("edit cancel title EN", (await page.locator("#user-action-modal-title").innerText()).trim() === "Confirm Cancel Edit");
  await page.locator("[data-article-edit-cancel-confirm]").click();
  await page.waitForTimeout(400);

  // Add Article — S-C03c/d
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");
  if (await page.locator("#login-screen").isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator('#login-form button[type="submit"]').click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
    await page.waitForTimeout(400);
  }
  await page.locator('button.nav-item[data-module="content"]').click();
  await page.locator('button[data-module="content"][data-sub="Articles"]').click();
  await page.waitForTimeout(400);
  await page.locator("[data-article-add]").click();
  await page.waitForTimeout(400);
  await page.locator("#article-title-field").fill("Test Article");
  await page.locator("[data-article-add-cancel]").click();
  await page.waitForTimeout(300);
  check("add cancel title EN", (await page.locator("#user-action-modal-title").innerText()).trim() === "Confirm Cancel Create Article");
  await page.locator("[data-user-action-modal-close]").first().click();
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const form = document.querySelector("[data-article-editor]");
    document.querySelector("#article-category-field").value = "Buying Guide";
    form.dataset.articleCoverSrc = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";
  });
  await page.locator("[data-article-block-add]").click();
  await page.waitForTimeout(300);
  await page.locator("[data-article-content-block]:last-child [data-article-block-value]").fill("Test paragraph");
  await page.locator('[data-article-editor] button[type="submit"]').click();
  await page.waitForTimeout(400);
  check("add create title EN", (await page.locator("#user-action-modal-title").innerText()).trim() === "Confirm Create Article");
  await page.locator("[data-user-action-modal-close]").first().click();

  // §E follow-up patch — stray EN type-name refs normalized to canonical TH labels
  const src = require("fs").readFileSync(require("path").join(__dirname, "..", "Prototypes", "bo-prototype.html"), "utf8");
  check("divider note TH (§E.1)", src.includes("เส้นคั่นจะแสดงเป็นเส้นแบ่งในบทความ") && !src.includes("Divider จะแสดง"));
  check("image-block alert TH (§E.2)", src.includes("เพิ่มรูปภาพ + คำบรรยายได้ 1 บล็อกต่อบทความ") && !src.includes("Image + Caption ได้"));
  check("link validation msg TH (§E.3)", src.includes("กรุณากรอกข้อความลิงก์ และ URL") && !src.includes("Link text และ URL"));

  check("no JS errors", errors.length === 0, errors.slice(0, 3).join(" ; "));
  await browser.close();
  const fails = results.filter(r => !r[1]);
  console.log(`\n${results.length - fails.length}/${results.length} passed`);
  process.exit(fails.length ? 1 : 0);

  async function openDetail(id) {
    const c = page.locator(`[data-article-card="${id}"]`);
    await c.locator(".row-menu summary").click();
    await page.waitForTimeout(200);
    await c.locator(`.row-menu [data-article-open="${id}"]`).click();
    await page.waitForTimeout(400);
  }
  async function backToList() {
    await page.locator("[data-back-article-list]").click();
    await page.waitForTimeout(400);
  }
})();
