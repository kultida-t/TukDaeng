// CTM-003a — Articles + Article Editor + Block Editor label normalization evidence capture
// ครอบคลุม surface ของจุดแก้ตาม CTM-002 plan §A.1/§B + canonical §9.1/9.3
//   D-C01a row menu View detail · D-C02a Edit article (row menu + detail btn)
//   D-C03 Preview article/Preview → ดูตัวอย่าง · D-C04 Preview as FO → wire + ดูตัวอย่าง
//   D-C05 status action labels (Delete draft/Cancel schedule/Archive article/Restore article)
//   D-C06 + Add block · D-C07 block control aria · D-C08 block type labels TH
//   D-C09 readonly empty/error states · D-C14a tiles (Likes/Created At/Updated At/Link text)
//   D-C22 actionHistory label map · D-C23/D-C24 alt/aria (invisible — verify ผ่าน scan)
//   D-C25 scenario alert titles TH · D-C21 board report default notes TH (leak → Change History)
//   S-C02a..d status confirm titles EN · S-C03a..d editor confirm titles EN
// usage: node scripts/capture-ctm-003a-article-labels.js before|after [url]
//   (ต้อง start server ที่ Prototypes ก่อน: node Prototypes/server.mjs)
// Mission 4 evidence viewport (standard): Desktop 1920x1080, Tablet 768x1024, Mobile 440x956
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
    await closeBtn.click();
    await page.waitForTimeout(300);
  }
}

async function openArticleDetailFromList(page, articleId) {
  const card = page.locator(`[data-article-card="${articleId}"]`);
  await card.locator(".row-menu summary").click();
  await page.waitForTimeout(300);
  await card.locator(`.row-menu [data-article-open="${articleId}"]`).click();
  await page.waitForTimeout(400);
}

async function backToArticleList(page) {
  await page.locator("[data-back-article-list]").click();
  await page.waitForTimeout(400);
}

async function captureArticleSurfaces(page, prefix) {
  // ============ Article List ============
  await goContentSub(page, "Articles");
  await shot(page, `${prefix}01-article-list`, { fullPage: true });

  // Row menu บน ART-043 (Published) — View detail / Preview as FO / Edit article / Archive article
  const card043 = page.locator('[data-article-card="ART-043"]');
  await card043.locator(".row-menu summary").click();
  await page.waitForTimeout(300);
  await shot(page, `${prefix}02-article-rowmenu`, { fullPage: true });

  // ============ Article Detail: Published (ART-043) ============
  await card043.locator('.row-menu [data-article-open="ART-043"]').click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}03-article-detail-published`, { fullPage: true });

  // Modal: Archive article (title ไทย → EN; label EN → ไทย)
  await page.locator('[data-article-status-action="archive-article"][data-article-id="ART-043"]').first().click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}04-modal-archive-article`);
  await closeModal(page);

  // Modal: Preview article (section labels EN → ไทย)
  await page.locator('[data-article-preview-id="ART-043"]').first().click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}05-modal-preview-article`, { fullPage: true });
  await closeModal(page);

  // ============ Article Detail: Scheduled (ART-044) — Cancel schedule ============
  await backToArticleList(page);
  await openArticleDetailFromList(page, "ART-044");
  await page.locator('[data-article-status-action="cancel-schedule"][data-article-id="ART-044"]').first().click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}06-modal-cancel-schedule`);
  await closeModal(page);

  // ============ Article Detail: Draft (ART-042) — Delete draft ============
  await backToArticleList(page);
  await openArticleDetailFromList(page, "ART-042");
  await page.locator('[data-article-status-action="delete-draft"][data-article-id="ART-042"]').first().click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}07-modal-delete-draft`);
  await closeModal(page);

  // ============ Article Detail: Archived (ART-039) — Restore article ============
  await backToArticleList(page);
  await openArticleDetailFromList(page, "ART-039");
  await page.locator('[data-article-status-action="restore-article"][data-article-id="ART-039"]').first().click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}08-modal-restore-article`);
  await closeModal(page);

  // ============ Article Editor (edit ART-043) ============
  await backToArticleList(page);
  await openArticleDetailFromList(page, "ART-043");
  await page.locator('[data-article-edit="ART-043"]').first().click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}09-article-editor`, { fullPage: true });

  // Block type picker opened — EN option labels
  await page.locator("#article-block-type-picker").evaluate(el => el.closest("[data-custom-select]").querySelector("[data-custom-select-trigger]").click());
  await page.waitForTimeout(300);
  await shot(page, `${prefix}09b-editor-block-picker`);
  await page.keyboard.press("Escape");
  await page.evaluate(() => document.querySelector("#article-block-type-picker")?.closest("[data-custom-select]")?.classList.remove("open"));

  // Modal: edit save confirm (title ไทย → EN)
  await page.locator('[data-article-editor] button[type="submit"]').click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}10-modal-edit-save-confirm`);

  // Compact alert: permission_denied scenario (title EN → ไทย)
  await page.evaluate(() => {
    const scenario = document.querySelector("#article-action-scenario");
    if (scenario) scenario.value = "permission_denied";
  });
  await page.locator("[data-article-edit-save-confirm]").click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}11-alert-permission-denied`);
  await closeModal(page);

  // Modal: edit cancel confirm (dirty form → ยกเลิก)
  await page.locator("#article-title-field").fill("Dirty title for cancel flow");
  await page.locator("[data-article-edit-cancel]").click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}12-modal-edit-cancel-confirm`);
  await page.locator("[data-article-edit-cancel-confirm]").click();
  await page.waitForTimeout(400);

  // Compact alert: preview_failed scenario (title EN → ไทย)
  await page.locator('[data-article-edit="ART-043"]').first().click();
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const scenario = document.querySelector("#article-preview-scenario");
    if (scenario) scenario.value = "preview_failed";
  });
  await page.locator("[data-article-preview-open]").click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}13-alert-preview-failed`);
  await closeModal(page);

  // ============ Add Article ============
  await goContentSub(page, "Articles");
  await page.locator("[data-article-add]").click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}14-article-add`, { fullPage: true });

  // Modal: add cancel confirm (dirty → ยกเลิก)
  await page.locator("#article-title-field").fill("Test Article");
  await page.locator("[data-article-add-cancel]").click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}15-modal-add-cancel-confirm`);
  await closeModal(page);

  // Modal: add create confirm — ต้องผ่าน validation (title/category/cover/content block)
  await page.evaluate(() => {
    const form = document.querySelector("[data-article-editor]");
    document.querySelector("#article-category-field").value = "Buying Guide";
    form.dataset.articleCoverSrc = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";
  });
  await page.locator("[data-article-block-add]").click();
  await page.waitForTimeout(300);
  await page.locator("[data-article-content-block]:last-child [data-article-block-value]").fill("Test paragraph content");
  await page.locator('[data-article-editor] button[type="submit"]').click();
  await page.waitForTimeout(400);
  await shot(page, `${prefix}16-modal-add-create-confirm`);
  await closeModal(page);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  // ============ Evidence viewports: d=1920x1080, t=768x1024, m=440x956 ============
  for (const [prefix, viewport] of [["d", { width: 1920, height: 1080 }], ["t", { width: 768, height: 1024 }], ["m", { width: 440, height: 956 }]]) {
    const page = await browser.newPage({ viewport });
    await captureArticleSurfaces(page, prefix);
    await page.close();
  }

  await browser.close();
  console.log("done →", OUT);
})();
