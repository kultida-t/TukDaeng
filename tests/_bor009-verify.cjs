// BOR-009 verify: Categories modal titles + same-named buttons/aria-labels → English
// Contract C.3: modal title = English, pattern <Entity> Detail / <Verb> <Entity>
// Named scope only — other Thai copies (subtitles, form labels, submit buttons) stay Thai
// Standalone script — not a playwright spec. Run: node tests/_bor009-verify.cjs
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

const modalTitle = (page) => page.evaluate(() =>
  document.querySelector("#user-action-modal-title")?.textContent || "");

async function closeModal(page) {
  const close = page.locator("#user-action-modal [data-user-action-modal-close]").first();
  if (await close.isVisible().catch(() => false)) await close.click();
  await page.waitForTimeout(200);
}

(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await login(page);

  // ---------- 1. Categories list: entry buttons English ----------
  await page.evaluate(() => jumpToModule("content", "Categories"));
  await page.waitForTimeout(400);
  check("N1 Categories list renders", await page.evaluate(() =>
    document.querySelector("#page-title")?.textContent === "Categories"));

  const orderBtn = page.locator("[data-category-order-open]");
  const addBtn = page.locator("[data-category-add]");
  check("N1 reorder btn text = 'Reorder Categories'", (await orderBtn.innerText()).includes("Reorder Categories"),
    await orderBtn.innerText());
  check("N1 reorder btn aria-label", await page.evaluate(() =>
    document.querySelector("[data-category-order-open]")?.getAttribute("aria-label") === "Reorder Categories on FO Board"),
    await page.evaluate(() => document.querySelector("[data-category-order-open]")?.getAttribute("aria-label")));
  check("N1 add btn text = 'Add Category'", (await addBtn.innerText()).includes("Add Category"),
    await addBtn.innerText());
  check("N1 add btn aria-label = 'Add Category'", await page.evaluate(() =>
    document.querySelector("[data-category-add]")?.getAttribute("aria-label") === "Add Category"));
  check("N1 #primary-action = 'Add Category'", await page.evaluate(() =>
    document.querySelector("#primary-action")?.textContent === "Add Category"),
    await page.evaluate(() => document.querySelector("#primary-action")?.textContent));

  // ---------- 2. Reorder Categories modal ----------
  await orderBtn.click();
  await page.waitForTimeout(300);
  check("N2 reorder modal opens", await page.evaluate(() =>
    document.querySelector("#user-action-modal")?.classList.contains("show")));
  check("N2 modal title = 'Reorder Categories'", (await modalTitle(page)) === "Reorder Categories",
    await modalTitle(page));
  check("N2 subtitle stays Thai (out of scope)", await page.evaluate(() =>
    document.querySelector("#user-action-modal-body .user-action-head p")?.textContent.includes("ลากเพื่อปรับลำดับการแสดงผล")));
  check("N2 save btn stays Thai 'บันทึกลำดับ'", await page.evaluate(() =>
    document.querySelector("[data-category-order-save]")?.textContent === "บันทึกลำดับ"));
  await closeModal(page);

  // ---------- 3. Add Category modal ----------
  await addBtn.click();
  await page.waitForTimeout(300);
  check("N3 add modal opens", await page.evaluate(() =>
    document.querySelector("#user-action-modal")?.classList.contains("show")));
  check("N3 modal title = 'Add Category'", (await modalTitle(page)) === "Add Category",
    await modalTitle(page));
  check("N3 submit btn stays Thai 'สร้างหมวดหมู่'", await page.evaluate(() =>
    document.querySelector("[data-category-form] button[type='submit']")?.textContent === "สร้างหมวดหมู่"));
  await closeModal(page);

  // ---------- 4. Row menu → Edit Category ----------
  await page.locator(".asset-row[data-category-card='CAT-001'] .row-menu > summary").click();
  await page.waitForTimeout(200);
  const menu = page.locator(".asset-row[data-category-card='CAT-001'] .row-menu-list");
  check("N4 row menu has 'Edit Category'", await page.evaluate(() =>
    [...document.querySelectorAll(".asset-row[data-category-card='CAT-001'] .row-menu-list button")]
      .some(b => b.textContent === "Edit Category")));
  check("N4 row menu has NO 'แก้ไขหมวดหมู่'", await page.evaluate(() =>
    ![...document.querySelectorAll(".asset-row[data-category-card='CAT-001'] .row-menu-list button")]
      .some(b => b.textContent.includes("แก้ไขหมวดหมู่"))));
  await menu.locator("[data-category-edit='CAT-001']").click();
  await page.waitForTimeout(300);
  check("N4 edit modal title = 'Edit Category'", (await modalTitle(page)) === "Edit Category",
    await modalTitle(page));
  check("N4 edit submit stays Thai 'บันทึกการแก้ไข'", await page.evaluate(() =>
    document.querySelector("[data-category-form] button[type='submit']")?.textContent === "บันทึกการแก้ไข"));
  await closeModal(page);

  // ---------- 5. Row menu → View detail → Category Detail ----------
  await page.locator(".asset-row[data-category-card='CAT-001'] .row-menu > summary").click();
  await page.waitForTimeout(200);
  await page.locator(".asset-row[data-category-card='CAT-001'] .row-menu-list [data-category-open='CAT-001']").click();
  await page.waitForTimeout(300);
  check("N5 detail modal title = 'Category Detail'", (await modalTitle(page)) === "Category Detail",
    await modalTitle(page));
  check("N5 detail footer btn = 'Edit Category'", await page.evaluate(() =>
    [...document.querySelectorAll("#user-action-modal-body [data-category-edit]")]
      .some(b => b.textContent === "Edit Category")));
  check("N5 detail subtitle stays Thai", await page.evaluate(() =>
    document.querySelector("#user-action-modal-body .user-action-head p")?.textContent.includes("ข้อมูลหมวดหมู่และการเลือกใช้ในบทความ")));
  check("N5 detail 'Edit Category' opens edit modal", await (async () => {
    await page.locator("#user-action-modal-body [data-category-edit='CAT-001']").click();
    await page.waitForTimeout(300);
    const title = await modalTitle(page);
    await closeModal(page);
    return title === "Edit Category";
  })());

  // ---------- 6. No leftover Thai titles on rendered Categories surfaces ----------
  check("N6 no renamed Thai strings in rendered DOM", await page.evaluate(() => {
    const banned = ["รายละเอียดหมวดหมู่", "เพิ่มหมวดหมู่", "แก้ไขหมวดหมู่", "จัดเรียง Category"];
    const nodes = [...document.querySelectorAll("h1,h2,h3,button,a,[role='button'],[aria-label]")];
    return !nodes.some(el =>
      banned.some(s => (el.innerText || "").includes(s) || (el.getAttribute("aria-label") || "").includes(s)));
  }));

  check("no page errors", errors.length === 0, errors.join(" | "));

  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
